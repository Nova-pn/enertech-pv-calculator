import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ProjectState } from '../types';
import type { Results } from '../engine/useResults';
import { energieQuotidienneAppareil } from '../engine/calculations';
import { translate, type Language } from '../i18n';
import type { ReportBranding } from '../lib/branding';
import type { ReportEdits } from '../lib/reportEdits';

const FOREST = '#1F4D2E';
const PALE = '#E8F0EA';
const TEXT = '#4A5058';
const BORDER = '#CDD2D0';
const PLACEHOLDER = '#8A9490';
const INK = TEXT;

export function generateReport(state: ProjectState, results: Results, language: Language = 'fr', branding?: ReportBranding, edits?: ReportEdits) {
  const t = (key: string, vars?: Record<string, string | number>) => translate(language, key, vars);
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const marginX = 40;
  let y = 108;

  if (edits?.introduction) {
    doc.setTextColor(INK);
    const lines = doc.splitTextToSize(edits.introduction, 500);
    doc.text(lines, marginX, y);
    y += lines.length * 11 + 10;
  }

  drawSummary(doc, results, marginX, y);
  y += 82;

  doc.setDrawColor(FOREST);
  doc.line(marginX, y, 555, y);
  y += 20;

  // --- Informations du projet ---
  section(doc, t('projectInfo'), marginX, y);
  y += 16;
  autoTable(doc, {
    startY: y,
    margin: { left: marginX },
    theme: 'plain',

    styles: { fontSize: 9, cellPadding: 2 },
    body: [
      [t('projectName'), state.info.nomProjet || '[—]'],
      [t('clientName'), state.info.nomClient || '[—]'],
      [t('location'), state.info.localisation || '[—]'],
      [t('installationType'), state.info.typeInstallation],
      [t('systemVoltage'), `${state.info.tensionSysteme} V`],
      [t('objective'), state.info.objectif],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 20;

  // --- Bilan de consommation ---
  section(doc, t('consumptionBalance'), marginX, y);
  y += 16;
  autoTable(doc, {
    startY: y,
    margin: { left: marginX },
    head: [[t('device'), t('nominalPower'), t('startupPower'), t('quantity'), t('hoursDay'), t('coefficient'), t('dailyEnergy')]],
    body: state.appareils.map((a) => [
      a.nom,
      a.puissanceW.toString(),
      a.puissanceDemarrageW !== null && Number.isFinite(a.puissanceDemarrageW) ? a.puissanceDemarrageW.toString() : t('startupUnknown'),
      a.quantite.toString(),
      a.heuresParJour.toString(),
      a.coefficient.toString(),
      energieQuotidienneAppareil(a).toFixed(0),
    ]),
    styles: { fontSize: 8.5, cellPadding: 3 },
    headStyles: { fillColor: [15, 61, 46] },
  });
  y = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(9);
  doc.text(
    `Nominale : ${results.bilan.puissanceTotaleW.toFixed(0)} W  |  Démarrage : ${results.onduleur.puissanceDemarrageConnue ? results.onduleur.puissanceDemarrageTotaleW.toFixed(0) + ' W' : 'non renseignée'}  |  ${(results.bilan.energieJourWh / 1000).toFixed(2)} kWh/jour  |  ${(results.bilan.energieMoisWh / 1000).toFixed(1)} kWh/mois  |  ${(results.bilan.energieAnneeWh / 1000).toFixed(0)} kWh/an`,
    marginX,
    y
  );
  y += 24;

  y = ensureSpace(doc, y, 140);
  section(doc, t('solarParams'), marginX, y);
  y += 16;
  autoTable(doc, {
    startY: y,
    margin: { left: marginX },
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    body: [
      [t('solarPeakHours'), `${state.solaire.hsp} h/jour`],
      [t('globalEfficiency'), state.solaire.rendementGlobal.toString()],
      [t('theoreticalPv'), `${results.puissancePvW.toFixed(0)} W`],
      [
        t('solar'),
        state.panneauChoisi
          ? `${state.panneauChoisi.manufacturer} ${state.panneauChoisi.model} — ${state.panneau.puissanceW} W`
          : `${state.panneau.puissanceW} W — Voc ${state.panneau.voc} V, Vmp ${state.panneau.vmp} V, Isc ${state.panneau.isc} A, Imp ${state.panneau.imp} A`,
      ],
      [t('panelCount'), results.dimensionnementPanneaux.nombrePanneaux.toString()],
      [t('installedPower'), `${(results.dimensionnementPanneaux.puissanceInstalleeW / 1000).toFixed(2)} kWc`],
      [
        t('compatibleConfig'),
        results.configPV.totalPanneaux > 0
          ? `${results.configPV.enSerie}S × ${results.configPV.enParallele}P — Vmp ${results.configPV.vmpChamp.toFixed(1)} V, Voc ${results.configPV.vocChamp.toFixed(1)} V, ${results.configPV.courantChamp.toFixed(1)} A`
          : '—',
      ],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 20;

  y = ensureSpace(doc, y, 140);
  section(doc, t('batterySizing'), marginX, y);
  y += 16;
  autoTable(doc, {
    startY: y,
    margin: { left: marginX },
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    body: [
      [t('autonomy'), `${state.batterieParams.autonomieJours} jour(s)`],
      [t('depthDischarge'), state.batterieParams.dod.toString()],
      [t('batteryEfficiency'), state.batterieParams.rendementBatterie.toString()],
      [t('requiredEnergy'), `${results.besoinBatterie.energieBatterieKWh.toFixed(2)} kWh`],
      [t('requiredCapacity'), `${results.besoinBatterie.capaciteAh.toFixed(0)} Ah`],
      [t('battery'), `${state.batterie.technologie} — ${state.batterie.tensionNominale} V / ${state.batterie.capaciteAh} Ah${state.batterieChoisie ? ` (${state.batterieChoisie.manufacturer} ${state.batterieChoisie.model})` : ''}`],
      [
        'Configuration',
        results.configBatterie.totalBatteries > 0
          ? `${results.configBatterie.enSerie}S × ${results.configBatterie.enParallele}P = ${results.configBatterie.totalBatteries} batterie(s), ${results.configBatterie.tensionTotale} V, ${results.configBatterie.capaciteTotaleAh.toFixed(0)} Ah`
          : '—',
      ],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 20;

  y = ensureSpace(doc, y, 120);
  section(doc, state.info.architectureSysteme === 'Hybride' ? t('hybridSizing') : t('inverterSizing'), marginX, y);
  y += 16;
  autoTable(doc, {
    startY: y,
    margin: { left: marginX },
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    body: [
      [t('totalNominalPower'), `${(results.onduleur.puissanceContinueW / 1000).toFixed(2)} kW`],
      [t('totalStartupPower'), results.onduleur.puissanceDemarrageConnue ? `${(results.onduleur.puissanceDemarrageTotaleW / 1000).toFixed(2)} kW` : t('startupUnknown')],
      [t('sizingMargin'), `${state.onduleurParams.margePourcent} %`],
      [t('recommendedMinimum'), `${(results.onduleur.puissanceMinRecommandeeW / 1000).toFixed(2)} kW`],
      [state.info.architectureSysteme === 'Hybride' ? 'Convertisseur choisi' : 'Onduleur choisi', state.onduleurChoisi ? `${state.onduleurChoisi.manufacturer} ${state.onduleurChoisi.model}` : '[À compléter]'],
      ['Charges à démarrage important signalées', results.onduleur.aChargesDemarrage ? 'Oui' : 'Non signalées'],
      ...(state.info.architectureSysteme === 'Simple'
        ? [
            [t('controllerType'), state.regulateurParams.type],
            [t('sizingMargin'), `${state.regulateurParams.margePourcent} %`],
            [t('currentRecommended'), `${results.regulateur.courantAvecMargeA.toFixed(1)} A`],
            ['Contrôleur choisi', state.regulateurChoisi ? `${state.regulateurChoisi.manufacturer} ${state.regulateurChoisi.model}` : '[À compléter]'],
            ['Calibre choisi', `${state.regulateurParams.calibreChoisi} A`],
          ]
        : [
            ['Régulation', 'Intégrée au convertisseur hybride'],
            ['Entrées MPPT', state.onduleurChoisi?.mpptCount?.toString() || 'Non documenté'],
            ['Puissance PV maximale', state.onduleurChoisi?.maxPvPowerW ? `${(state.onduleurChoisi.maxPvPowerW / 1000).toFixed(2)} kWc` : 'Non documentée'],
          ]),
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 24;

  y = ensureSpace(doc, y, 100);
  section(doc, t('cablingProtection'), marginX, y);
  y += 16;
  autoTable(doc, {
    startY: y,
    margin: { left: marginX },
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    body: [
      [t('cableLength'), `${state.cablage.longueurAllerM} m`],
      [t('cable'), state.cableChoisi ? `${state.cableChoisi.manufacturer} ${state.cableChoisi.model} (${state.cableChoisi.crossSectionMm2} mm²)` : '[—]'],
      [t('voltageDrop'), results.chuteDeTension ? `${results.chuteDeTension.chutePourcent.toFixed(2)} % (${results.chuteDeTension.chuteVoltsV.toFixed(2)} V)` : '—'],
      [t('recommendedProtection'), `${results.calibreProtectionRecommandeeA.toFixed(1)} A (1,25 × Isc)`],
      [t('protection'), state.protectionChoisie ? `${state.protectionChoisie.manufacturer} ${state.protectionChoisie.model}` : '[—]'],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 24;

  if (edits?.technicalNotes) {
    y = ensureSpace(doc, y, 70);
    section(doc, t('reportTechnicalNotes'), marginX, y);
    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(INK);
    const lines = doc.splitTextToSize(edits.technicalNotes, 500);
    doc.text(lines, marginX, y);
    y += lines.length * 11 + 12;
  }

  y = ensureSpace(doc, y, 60);
  y += 10;
  doc.setDrawColor(BORDER);
  doc.line(marginX, y, 555, y);
  y += 16;
  if (edits?.conclusion) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(INK);
    const lines = doc.splitTextToSize(edits.conclusion, 500);
    doc.text(lines, marginX, y);
    y += lines.length * 11 + 10;
  }
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor('#666666');
  const mention = doc.splitTextToSize(
    t('disclaimer'),
    500
  );
  doc.text(mention, marginX, y);

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    if (page === 1) drawPageHeader(doc, state, language, branding, edits);
    drawPageFooter(doc, page, pageCount, branding);
  }

  const filename = `rapport-dimensionnement-${(state.info.nomProjet || 'projet').replace(/\s+/g, '-').toLowerCase()}.pdf`;
  doc.save(filename);
}

function drawPageHeader(doc: jsPDF, state: ProjectState, language: Language, branding?: ReportBranding, edits?: ReportEdits) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  const headerHeight = 82;
  const clientLogoX = marginX;
  const clientLogoY = 18;
  const clientLogoW = 48;
  const clientLogoH = 42;
  const logo2W = 51;
  const logo2H = 51;
  const clientInfoX = branding?.logoDataUrl ? clientLogoX + clientLogoW + 14 : clientLogoX;
  const contactLine = [branding?.address, branding?.phone, branding?.email, branding?.website].filter(Boolean).join(' · ');
  const rightTextX = pageWidth - marginX - logo2W - 10;
  const reportTitle = edits?.title || translate(language, 'reportPdf');
  const generatedLine = `${translate(language, 'generatedOn')} ${new Date().toLocaleDateString(language)}  |  ${translate(language, 'systemArchitecture')} : ${state.info.architectureSysteme}`;

  doc.setFillColor(FOREST);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');

  if (branding?.logoDataUrl) {
    const clientLogoFormat = branding.logoDataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';
    doc.setFillColor('#ffffff');
    doc.roundedRect(clientLogoX, clientLogoY, clientLogoW, clientLogoH, 4, 4, 'F');
    doc.addImage(branding.logoDataUrl, clientLogoFormat, clientLogoX + 5, clientLogoY + 4, clientLogoW - 10, clientLogoH - 8);
  }

  doc.setTextColor('#ffffff');
  if (branding?.companyName) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(branding.companyName, clientInfoX, 35);
  }
  if (contactLine) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(doc.splitTextToSize(contactLine, 260), clientInfoX, branding?.companyName ? 49 : 35);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(reportTitle, rightTextX, 28, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(translate(language, 'installationType') + '  |  ' + state.info.typeInstallation, rightTextX, 42, { align: 'right' });
  doc.text(generatedLine, rightTextX, 54, { align: 'right' });

  // Second logo configurable, avec un emplacement visible même sans image.
  doc.setFillColor('#ffffff');
  doc.roundedRect(pageWidth - marginX - logo2W, 18, logo2W, logo2H, 4, 4, 'F');
  if (branding?.logo2DataUrl) {
    const logo2Format = branding.logo2DataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';
    doc.addImage(branding.logo2DataUrl, logo2Format, pageWidth - marginX - logo2W + 5, 23, logo2W - 10, logo2H - 10);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(PLACEHOLDER);
    doc.text('LOGO 2', pageWidth - marginX - logo2W / 2, 45, { align: 'center' });
  }

  doc.setFillColor('#d9dedb');
  doc.rect(0, headerHeight, pageWidth, 4, 'F');
}

function drawPageFooter(doc: jsPDF, page: number, pageCount: number, branding?: ReportBranding) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerY = pageHeight - 28;
  doc.setDrawColor('#c7cfca');
  doc.setLineWidth(0.5);
  doc.line(40, footerY - 8, pageWidth - 40, footerY - 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor('#666666');
  if (branding?.companyName) doc.text(branding.companyName + '  ·  Rapport de dimensionnement', 40, footerY);
  doc.text(`Page ${page} / ${pageCount}`, pageWidth - 40, footerY, { align: 'right' });
}

function drawSummary(doc: jsPDF, results: Results, x: number, y: number) {
  const width = doc.internal.pageSize.getWidth() - x * 2;
  const gap = 6;
  const cardW = (width - gap * 3) / 4;
  const cards = [
    [`${(results.bilan.energieJourWh / 1000).toFixed(2)} kWh`, 'Consommation journalière'],
    [`${(results.dimensionnementPanneaux.puissanceInstalleeW / 1000).toFixed(2)} kWc`, 'Puissance PV installée'],
    [`${results.configBatterie.tensionTotale || '—'} V / ${results.configBatterie.capaciteTotaleAh ? results.configBatterie.capaciteTotaleAh.toFixed(0) : '—'} Ah`, results.configBatterie.totalBatteries ? `${results.configBatterie.enSerie}S × ${results.configBatterie.enParallele}P` : 'Configuration batterie'],
    [`${results.regulateur.courantAvecMargeA.toFixed(1)} A`, 'Calibre du contrôleur'],
  ];
  cards.forEach(([value, label], index) => {
    const left = x + index * (cardW + gap);
    doc.setFillColor(PALE);
    doc.rect(left, y, cardW, 58, 'F');
    doc.setDrawColor(FOREST);
    doc.setLineWidth(1.5);
    doc.line(left, y, left + cardW, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(FOREST);
    doc.text(value, left + cardW / 2, y + 24, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(TEXT);
    doc.text(doc.splitTextToSize(label, cardW - 8), left + cardW / 2, y + 39, { align: 'center' });
  });
}

function section(doc: jsPDF, title: string, x: number, y: number) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(FOREST);
  doc.text(title, x, y);
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed > pageHeight - 40) {
    doc.addPage();
    return 50;
  }
  return y;
}

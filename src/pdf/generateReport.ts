import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ProjectState } from '../types';
import type { Results } from '../engine/useResults';
import { energieQuotidienneAppareil } from '../engine/calculations';
import { ENERTECH_EMBLEM_BASE64, ENERTECH_EMBLEM_ASPECT } from '../assets/logo/logoBase64';
import { translate, type Language } from '../i18n';

const FOREST = '#0f3d2e';
const INK = '#14181b';

export function generateReport(state: ProjectState, results: Results, language: Language = 'fr') {
  const t = (key: string, vars?: Record<string, string | number>) => translate(language, key, vars);
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const marginX = 40;
  let y = 50;

  // Logo officiel EnerTech (fourni par l'utilisateur, rogné uniquement — aucune couleur/forme modifiée).
  const logoW = 40;
  const logoH = logoW * ENERTECH_EMBLEM_ASPECT;
  doc.addImage(ENERTECH_EMBLEM_BASE64, 'JPEG', marginX, y - 30, logoW, logoH);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(FOREST);
  doc.text('EnerTech PV Calculator', marginX + logoW + 12, y);
  y += 22;
  doc.setFontSize(13);
  doc.setTextColor(INK);
  doc.text(t('reportPdf'), marginX, y);
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor('#666666');
  doc.text(`${t('generatedOn')} ${new Date().toLocaleDateString(language)} — ${t('systemArchitecture')} : ${state.info.architectureSysteme}`, marginX, y);
  y += 20;

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
      [t('validationIndicators'), results.configPV.compatible ? t('compatible') : results.configPV.raisons.join(' ')],
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
      [t('validationIndicators'), results.configBatterie.compatible ? t('compatible') : results.configBatterie.raisons.join(' ')],
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
            ['Calibre suffisant', results.regulateur.calibreSuffisant ? 'Oui' : 'Non — augmenter le calibre'],
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

  // --- Avertissements ---
  y = ensureSpace(doc, y, 100);
  section(doc, t('warning'), marginX, y);
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  results.avertissements.forEach((av) => {
    y = ensureSpace(doc, y, 40);
    const color = av.niveau === 'vert' ? [27, 107, 69] : av.niveau === 'orange' ? [198, 130, 31] : [201, 79, 63];
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(`• ${av.titre}`, marginX, y);
    y += 12;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(INK);
    const lines = doc.splitTextToSize(av.explication, 500);
    doc.text(lines, marginX + 10, y);
    y += lines.length * 11 + 8;
  });

  y = ensureSpace(doc, y, 60);
  y += 10;
  doc.setDrawColor('#cccccc');
  doc.line(marginX, y, 555, y);
  y += 16;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor('#666666');
  const mention = doc.splitTextToSize(
    t('disclaimer'),
    500
  );
  doc.text(mention, marginX, y);

  const filename = `rapport-dimensionnement-${(state.info.nomProjet || 'projet').replace(/\s+/g, '-').toLowerCase()}.pdf`;
  doc.save(filename);
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

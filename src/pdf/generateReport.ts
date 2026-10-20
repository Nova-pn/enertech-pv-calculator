import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ProjectState } from '../types';
import type { Results } from '../engine/useResults';
import { energieQuotidienneAppareil } from '../engine/calculations';
import type { Language } from '../i18n';
import type { ReportBranding } from '../lib/branding';
import type { ReportEdits } from '../lib/reportEdits';

const FOREST = '#1F4D2E';
const PALE = '#F2F4F3';
const SUMMARY_PALE = '#E8F0EA';
const TEXT = '#4A5058';
const INK = '#1E2226';
const BORDER = '#CDD2D0';
const PLACEHOLDER = '#8A9490';
const PAGE_W = 595.276;
const PAGE_H = 841.89;
const LEFT = 40;
const RIGHT = PAGE_W - LEFT;
const CONTENT_W = RIGHT - LEFT;

type Cell = string | number;

export function generateReport(state: ProjectState, results: Results, _language: Language = 'fr', branding?: ReportBranding, edits?: ReportEdits) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const date = new Date().toLocaleDateString('fr-FR');
  const brand = {
    companyName: branding?.companyName || 'PV Systèmes',
    address: branding?.address || 'Cotonou',
    phone: branding?.phone || '300375639',
    email: branding?.email || 'Gryrjbdv@gmail.com',
  };

  drawHeader(doc, state, branding, edits, brand, date);
  let y = 108;
  y = drawSummary(doc, state, results, y);
  y = drawSection(doc, '1. Informations du projet', y + 18);
  y = drawKeyValueTable(doc, y, [
    ['Nom du projet', state.info.nomProjet || 'À compléter'],
    ['Nom du client', state.info.nomClient || 'À compléter'],
    ['Localisation', state.info.localisation || 'À compléter'],
    ["Type d'installation", state.info.typeInstallation],
    ['Tension du système', `${state.info.tensionSysteme} V`],
    ['Objectif', state.info.objectif],
  ]);

  y = drawSection(doc, '2. Bilan de consommation', y + 13);
  autoTable(doc, {
    startY: y, margin: { left: LEFT, right: PAGE_W - RIGHT }, tableWidth: CONTENT_W, theme: 'plain',
    head: [['Appareil', 'P. nominale\n(W)', 'P. démarrage (W)', 'Qté', 'h/jour', 'Coef.', 'Énergie (Wh/j)']],
    body: state.appareils.map((a) => [a.nom, `${a.puissanceW}`, a.puissanceDemarrageW !== null && Number.isFinite(a.puissanceDemarrageW) ? `${a.puissanceDemarrageW}` : 'Non renseignée', `${a.quantite}`, `${a.heuresParJour}`, `${a.coefficient}`, energieQuotidienneAppareil(a).toFixed(0)]),
    styles: { font: 'helvetica', fontSize: 8.5, textColor: TEXT, cellPadding: { top: 4, right: 5, bottom: 4, left: 6 }, lineColor: BORDER, lineWidth: 0.35, valign: 'middle' },
    headStyles: { fillColor: FOREST, textColor: '#FFFFFF', fontStyle: 'bold', halign: 'center', cellPadding: { top: 5, right: 4, bottom: 5, left: 4 } },
    columnStyles: { 0: { cellWidth: 104, halign: 'left' }, 1: { cellWidth: 65, halign: 'center' }, 2: { cellWidth: 108, halign: 'center' }, 3: { cellWidth: 38, halign: 'center' }, 4: { cellWidth: 48, halign: 'center' }, 5: { cellWidth: 45, halign: 'center' }, 6: { cellWidth: 107, halign: 'right', fontStyle: 'bold', textColor: FOREST } },
    alternateRowStyles: { fillColor: PALE },
  });
  y = (doc as any).lastAutoTable.finalY;
  doc.setFillColor(SUMMARY_PALE); doc.rect(LEFT, y, CONTENT_W, 24, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(FOREST); doc.text('Total', LEFT + 6, y + 15);
  doc.setFont('helvetica', 'normal'); doc.setTextColor(TEXT); doc.text(` - Puissance nominale : ${results.bilan.puissanceTotaleW.toFixed(0)} W | Démarrage : `, LEFT + 38, y + 15);
  doc.setFont('helvetica', 'bold'); doc.text(`${results.onduleur.puissanceDemarrageConnue ? `${results.onduleur.puissanceDemarrageTotaleW.toFixed(0)} W` : 'non renseigné'} | ${(results.bilan.energieJourWh / 1000).toFixed(2)} kWh/jour | ${(results.bilan.energieMoisWh / 1000).toFixed(1)} kWh/mois | ${(results.bilan.energieAnneeWh / 1000).toFixed(0)} kWh/an`, LEFT + 133, y + 15);
  y += 34;

  y = drawSection(doc, '3. Paramètres solaires et champ photovoltaïque', y);
  drawKeyValueTable(doc, y, [
    ['Heures solaires de pointe (HSP)', `${state.solaire.hsp} h/jour`],
    ['Rendement global du système', formatNumber(state.solaire.rendementGlobal)],
    ['Puissance PV théorique nécessaire', `${results.puissancePvW.toFixed(0)} W`],
    ['Champ PV', `${state.panneau.puissanceW} W - Voc ${formatNumber(state.panneau.voc)} V, Vmp ${formatNumber(state.panneau.vmp)} V, Isc ${formatNumber(state.panneau.isc)} A, Imp ${formatNumber(state.panneau.imp)} A`],
    ['Nombre de panneaux', `${results.dimensionnementPanneaux.nombrePanneaux}`],
    ['Puissance installée', `${(results.dimensionnementPanneaux.puissanceInstalleeW / 1000).toFixed(2)} kWc`],
    ['Configuration compatible', results.configPV.totalPanneaux > 0 ? `${results.configPV.enSerie}S × ${results.configPV.enParallele}P - Vmp ${results.configPV.vmpChamp.toFixed(1)} V, Voc ${results.configPV.vocChamp.toFixed(1)} V, ${results.configPV.courantChamp.toFixed(1)} A` : '—'],
  ]);

  doc.addPage();
  y = drawSection(doc, '4. Dimensionnement de la batterie', 54);
  y = drawKeyValueTable(doc, y, [
    ['Autonomie souhaitée (jours)', `${state.batterieParams.autonomieJours} jour${state.batterieParams.autonomieJours > 1 ? 's' : ''}`],
    ['Profondeur de décharge (DcD)', formatNumber(state.batterieParams.dod)],
    ['Rendement batterie', formatNumber(state.batterieParams.rendementBatterie)],
    ['Énergie nécessaire', `${results.besoinBatterie.energieBatterieKWh.toFixed(2)} kWh`],
    ['Capacité nécessaire', `${results.besoinBatterie.capaciteAh.toFixed(0)} Ah`],
    ['Batterie', `${state.batterie.technologie} - ${state.batterie.tensionNominale} V / ${state.batterie.capaciteAh} Ah`],
    ['Configuration', results.configBatterie.totalBatteries > 0 ? `${results.configBatterie.enSerie}S × ${results.configBatterie.enParallele}P = ${results.configBatterie.totalBatteries} batterie(s), ${results.configBatterie.tensionTotale} V, ${results.configBatterie.capaciteTotaleAh.toFixed(0)} Ah` : '—'],
  ]);

  y = drawSection(doc, "5. Dimensionnement de l'onduleur et du contrôleur", y + 13);
  y = drawKeyValueTable(doc, y, [
    ['Puissance totale nominale', `${(results.onduleur.puissanceContinueW / 1000).toFixed(2)} kW`],
    ['Puissance totale de démarrage', results.onduleur.puissanceDemarrageConnue ? `${(results.onduleur.puissanceDemarrageTotaleW / 1000).toFixed(2)} kW` : 'Non renseignée'],
    ['Marge de dimensionnement (%)', `${state.onduleurParams.margePourcent} %`],
    ['Puissance minimale recommandée', `${(results.onduleur.puissanceMinRecommandeeW / 1000).toFixed(2)} kW`],
    ['Onduleur choisi', state.onduleurChoisi ? `${state.onduleurChoisi.manufacturer} ${state.onduleurChoisi.model}` : 'À compléter'],
    ['Charges à démarrage important signalées', results.onduleur.aChargesDemarrage ? 'Oui' : 'Non'],
    ['Type de contrôleur', state.regulateurParams.type],
    ['Marge de dimensionnement (%)', `${state.regulateurParams.margePourcent} %`],
    ['Courant recommandé', `${results.regulateur.courantAvecMargeA.toFixed(1)} A`],
    ['Contrôleur choisi', state.regulateurChoisi ? `${state.regulateurChoisi.manufacturer} ${state.regulateurChoisi.model}` : 'À compléter'],
    ['Calibre choisi', `${state.regulateurParams.calibreChoisi} A`],
  ]);

  y = drawSection(doc, '6. Câblage et protection DC', y + 13);
  y = drawKeyValueTable(doc, y, [
    ['Longueur aller (m)', `${state.cablage.longueurAllerM} m`],
    ['Câble PV', state.cableChoisi ? `${state.cableChoisi.manufacturer} ${state.cableChoisi.model} (${state.cableChoisi.crossSectionMm2} mm²)` : 'À compléter'],
    ['Chute de tension', results.chuteDeTension ? `${results.chuteDeTension.chutePourcent.toFixed(2)} % (${results.chuteDeTension.chuteVoltsV.toFixed(2)} V)` : '—'],
    ['Calibre protection recommandé', `${results.calibreProtectionRecommandeeA.toFixed(1)} A (1,25 × Isc)`],
    ['Protection DC', state.protectionChoisie ? `${state.protectionChoisie.manufacturer} ${state.protectionChoisie.model}` : 'À compléter'],
  ]);
  y += 12;
  doc.setFillColor(PALE); doc.rect(LEFT, y, CONTENT_W, 34, 'F'); doc.setFillColor(FOREST); doc.rect(LEFT, y, 3, 34, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(FOREST); doc.text('Avertissement.', LEFT + 9, y + 14);
  doc.setFont('helvetica', 'normal'); doc.setTextColor(TEXT); doc.text(doc.splitTextToSize('Ce rapport présente le dimensionnement de l’installation selon les données saisies. Une vérification par un professionnel qualifié reste recommandée avant toute installation.', CONTENT_W - 82), LEFT + 72, y + 14);

  if (edits?.technicalNotes || edits?.conclusion) doc.setProperties({ subject: [edits.technicalNotes, edits.conclusion].filter(Boolean).join(' ') });
  drawFooter(doc, 1, brand.companyName); drawFooter(doc, 2, brand.companyName);
  const filename = `rapport-dimensionnement-${(state.info.nomProjet || 'projet').replace(/\s+/g, '-').toLowerCase()}.pdf`;
  doc.save(filename);
}

function drawHeader(doc: jsPDF, state: ProjectState, branding: ReportBranding | undefined, edits: ReportEdits | undefined, brand: { companyName: string; address: string; phone: string; email: string }, date: string) {
  doc.setFillColor(FOREST); doc.rect(0, 0, PAGE_W, 86, 'F');
  drawLogoSlot(doc, LEFT, 18, 51, 51, branding?.logoDataUrl, 'LOGO'); drawLogoSlot(doc, RIGHT - 51, 18, 51, 51, branding?.logo2DataUrl, 'LOGO 2');
  doc.setTextColor('#FFFFFF'); doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.text(brand.companyName, LEFT + 65, 35);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.text(`${brand.address} | ${brand.phone} | ${brand.email}`, LEFT + 65, 50);
  const rightX = RIGHT - 65; doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.text(edits?.title || 'RAPPORT DE DIMENSIONNEMENT', rightX, 27, { align: 'right' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.text('Installation photovoltaïque autonome', rightX, 42, { align: 'right' }); doc.text(`Généré le ${date} | Architecture : ${state.info.architectureSysteme}`, rightX, 57, { align: 'right' });
  doc.setFillColor('#D9DEDB'); doc.rect(0, 86, PAGE_W, 4, 'F');
}

function drawLogoSlot(doc: jsPDF, x: number, y: number, w: number, h: number, dataUrl: string | undefined, label: string) {
  doc.setFillColor('#FFFFFF'); doc.roundedRect(x, y, w, h, 5, 5, 'F');
  if (dataUrl) { doc.addImage(dataUrl, dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG', x + 5, y + 5, w - 10, h - 10); }
  else { doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(FOREST); doc.text(label, x + w / 2, y + h / 2 + 3, { align: 'center' }); }
}

function drawSummary(doc: jsPDF, state: ProjectState, results: Results, y: number) {
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(FOREST); doc.text('Synthèse du dimensionnement', LEFT, y);
  const top = y + 9; const cardW = CONTENT_W / 4; const h = 50;
  const cards = [[`${(results.bilan.energieJourWh / 1000).toFixed(2)} kWh`, 'Consommation', 'journalière'], [`${(results.dimensionnementPanneaux.puissanceInstalleeW / 1000).toFixed(2)} kWc`, 'Puissance PV', 'installée'], [`${results.configBatterie.tensionTotale || '—'} V / ${results.configBatterie.capaciteTotaleAh ? results.configBatterie.capaciteTotaleAh.toFixed(0) : '—'} Ah`, `Batterie ${state.batterie.technologie}`, results.configBatterie.totalBatteries ? `(${results.configBatterie.enSerie} × ${state.batterie.tensionNominale} V en série)` : ''], [`${results.regulateur.courantAvecMargeA.toFixed(0)} A`, 'Calibre du', 'contrôleur MPPT']];
  cards.forEach(([value, line1, line2], i) => { const x = LEFT + i * cardW; doc.setFillColor(SUMMARY_PALE); doc.rect(x, top, cardW, h, 'F'); doc.setDrawColor('#FFFFFF'); doc.setLineWidth(0.7); if (i > 0) doc.line(x, top, x, top + h); doc.setFont('helvetica', 'bold'); doc.setFontSize(i === 2 ? 13 : 15); doc.setTextColor(FOREST); doc.text(value, x + cardW / 2, top + 21, { align: 'center' }); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(TEXT); doc.text(line1, x + cardW / 2, top + 35, { align: 'center' }); if (line2) doc.text(line2, x + cardW / 2, top + 44, { align: 'center' }); });
  return top + h;
}

function drawSection(doc: jsPDF, title: string, y: number) { doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(FOREST); doc.text(title, LEFT, y); doc.setDrawColor(FOREST); doc.setLineWidth(1); doc.line(LEFT, y + 7, RIGHT, y + 7); return y + 14; }

function drawKeyValueTable(doc: jsPDF, startY: number, rows: Cell[][]) {
  autoTable(doc, { startY, margin: { left: LEFT, right: PAGE_W - RIGHT }, tableWidth: CONTENT_W, theme: 'plain', body: rows, styles: { font: 'helvetica', fontSize: 9, textColor: TEXT, cellPadding: { top: 4, right: 6, bottom: 4, left: 6 }, lineColor: BORDER, lineWidth: 0.35, valign: 'middle' }, columnStyles: { 0: { cellWidth: 230, halign: 'left' }, 1: { cellWidth: CONTENT_W - 230, halign: 'right', fontStyle: 'bold', textColor: INK } }, alternateRowStyles: { fillColor: PALE }, didParseCell: (data) => { if (data.section === 'body' && data.column.index === 1 && String(data.cell.raw).toLowerCase().includes('compléter')) { data.cell.styles.fontStyle = 'italic'; data.cell.styles.textColor = PLACEHOLDER; } } });
  return (doc as any).lastAutoTable.finalY;
}

function drawFooter(doc: jsPDF, page: number, companyName: string) { const y = PAGE_H - 28; doc.setDrawColor(BORDER); doc.setLineWidth(0.5); doc.line(LEFT, y - 8, RIGHT, y - 8); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor('#666666'); doc.text(`${companyName} - Rapport de dimensionnement`, LEFT, y); doc.text(`Page ${page}`, RIGHT, y, { align: 'right' }); }
function formatNumber(value: number) { return Number.isInteger(value) ? `${value}` : value.toFixed(2).replace('.', ','); }

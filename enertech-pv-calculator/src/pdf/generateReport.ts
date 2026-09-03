import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ProjectState } from '../types';
import type { Results } from '../engine/useResults';
import { energieQuotidienneAppareil } from '../engine/calculations';

const FOREST = '#0f3d2e';
const INK = '#14181b';

export function generateReport(state: ProjectState, results: Results) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const marginX = 40;
  let y = 50;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(FOREST);
  doc.text('EnerTech PV Calculator', marginX, y);
  y += 22;
  doc.setFontSize(13);
  doc.setTextColor(INK);
  doc.text('Rapport de dimensionnement photovoltaïque', marginX, y);
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor('#666666');
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, marginX, y);
  y += 20;

  doc.setDrawColor(FOREST);
  doc.line(marginX, y, 555, y);
  y += 20;

  // --- Informations du projet ---
  section(doc, 'Informations du projet', marginX, y);
  y += 16;
  autoTable(doc, {
    startY: y,
    margin: { left: marginX },
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    body: [
      ['Nom du projet', state.info.nomProjet || '[À compléter]'],
      ['Nom du client', state.info.nomClient || '[À compléter]'],
      ['Localisation', state.info.localisation || '[À compléter]'],
      ["Type d'installation", state.info.typeInstallation],
      ['Tension du système', `${state.info.tensionSysteme} V`],
      ['Objectif', state.info.objectif],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 20;

  // --- Bilan de consommation ---
  section(doc, 'Bilan de consommation', marginX, y);
  y += 16;
  autoTable(doc, {
    startY: y,
    margin: { left: marginX },
    head: [['Appareil', 'P (W)', 'Qté', 'h/j', 'Coeff.', 'Démarrage', 'Énergie/j (Wh)']],
    body: state.appareils.map((a) => [
      a.nom,
      a.puissanceW.toString(),
      a.quantite.toString(),
      a.heuresParJour.toString(),
      a.coefficient.toString(),
      a.demarrageImportant ? 'Oui' : 'Non',
      energieQuotidienneAppareil(a).toFixed(0),
    ]),
    styles: { fontSize: 8.5, cellPadding: 3 },
    headStyles: { fillColor: [15, 61, 46] },
  });
  y = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(9);
  doc.text(
    `Total : ${results.bilan.puissanceTotaleW.toFixed(0)} W  |  ${(results.bilan.energieJourWh / 1000).toFixed(2)} kWh/jour  |  ${(results.bilan.energieMoisWh / 1000).toFixed(1)} kWh/mois  |  ${(results.bilan.energieAnneeWh / 1000).toFixed(0)} kWh/an`,
    marginX,
    y
  );
  y += 24;

  y = ensureSpace(doc, y, 140);
  section(doc, 'Paramètres solaires et champ photovoltaïque', marginX, y);
  y += 16;
  autoTable(doc, {
    startY: y,
    margin: { left: marginX },
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    body: [
      ['Heures solaires de pointe (HSP)', `${state.solaire.hsp} h/jour`],
      ['Rendement global', state.solaire.rendementGlobal.toString()],
      ['Puissance PV théorique nécessaire', `${results.puissancePvW.toFixed(0)} W`],
      ['Panneau', `${state.panneau.puissanceW} W — Voc ${state.panneau.voc} V, Vmp ${state.panneau.vmp} V, Isc ${state.panneau.isc} A, Imp ${state.panneau.imp} A`],
      ['Nombre de panneaux', results.dimensionnementPanneaux.nombrePanneaux.toString()],
      ['Puissance installée', `${(results.dimensionnementPanneaux.puissanceInstalleeW / 1000).toFixed(2)} kWc`],
      [
        'Configuration série/parallèle',
        results.configPV.totalPanneaux > 0
          ? `${results.configPV.enSerie}S × ${results.configPV.enParallele}P — Vmp ${results.configPV.vmpChamp.toFixed(1)} V, Voc ${results.configPV.vocChamp.toFixed(1)} V, ${results.configPV.courantChamp.toFixed(1)} A`
          : '—',
      ],
      ['Statut de la configuration', results.configPV.compatible ? 'Compatible' : results.configPV.raisons.join(' ')],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 20;

  y = ensureSpace(doc, y, 140);
  section(doc, 'Dimensionnement de la batterie', marginX, y);
  y += 16;
  autoTable(doc, {
    startY: y,
    margin: { left: marginX },
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    body: [
      ["Autonomie souhaitée", `${state.batterieParams.autonomieJours} jour(s)`],
      ['Profondeur de décharge (DoD)', state.batterieParams.dod.toString()],
      ['Rendement batterie', state.batterieParams.rendementBatterie.toString()],
      ['Énergie batterie nécessaire', `${results.besoinBatterie.energieBatterieKWh.toFixed(2)} kWh`],
      ['Capacité nécessaire', `${results.besoinBatterie.capaciteAh.toFixed(0)} Ah`],
      ['Batterie', `${state.batterie.technologie} — ${state.batterie.tensionNominale} V / ${state.batterie.capaciteAh} Ah`],
      [
        'Configuration',
        results.configBatterie.totalBatteries > 0
          ? `${results.configBatterie.enSerie}S × ${results.configBatterie.enParallele}P = ${results.configBatterie.totalBatteries} batterie(s), ${results.configBatterie.tensionTotale} V, ${results.configBatterie.capaciteTotaleAh.toFixed(0)} Ah`
          : '—',
      ],
      ['Statut de la configuration', results.configBatterie.compatible ? 'Compatible' : results.configBatterie.raisons.join(' ')],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 20;

  y = ensureSpace(doc, y, 120);
  section(doc, "Dimensionnement de l'onduleur et du régulateur MPPT", marginX, y);
  y += 16;
  autoTable(doc, {
    startY: y,
    margin: { left: marginX },
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    body: [
      ['Puissance continue estimée', `${(results.onduleur.puissanceContinueW / 1000).toFixed(2)} kW`],
      ['Marge onduleur', `${state.onduleurParams.margePourcent} %`],
      ['Puissance minimale recommandée', `${(results.onduleur.puissanceMinRecommandeeW / 1000).toFixed(2)} kW`],
      ['Charges à démarrage important', results.onduleur.aChargesDemarrage ? 'Oui — vérifier la puissance de démarrage réelle' : 'Non signalée'],
      ['Marge régulateur', `${state.regulateurParams.margePourcent} %`],
      ['Courant recommandé (régulateur)', `${results.regulateur.courantAvecMargeA.toFixed(1)} A`],
      ['Calibre choisi', `${state.regulateurParams.calibreChoisi} A`],
      ['Calibre suffisant', results.regulateur.calibreSuffisant ? 'Oui' : 'Non — augmenter le calibre'],
    ],
  });
  y = (doc as any).lastAutoTable.finalY + 24;

  // --- Avertissements ---
  y = ensureSpace(doc, y, 100);
  section(doc, 'Avertissements et recommandations', marginX, y);
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
    'Ce rapport constitue une estimation de dimensionnement. Une validation par un professionnel qualifié est recommandée avant toute installation.',
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

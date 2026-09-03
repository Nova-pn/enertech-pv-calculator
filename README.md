# EnerTech PV Calculator

Calculateur de dimensionnement photovoltaïque, pour étudiants, techniciens et installateurs en énergies
renouvelables. Application web fonctionnelle : tous les calculs (bilan énergétique, champ PV, batterie, onduleur,
régulateur MPPT) se recalculent en direct à partir des valeurs saisies, et un rapport PDF complet peut être généré.

## 1. Arborescence du projet

```
enertech-pv-calculator/
├── index.html
├── package.json
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── vite.config.ts
├── postcss.config.js
├── public/
│   └── favicon.svg
├── README.md
└── src/
    ├── main.tsx                  # point d'entrée
    ├── App.tsx                   # routes de l'application
    ├── index.css                 # thème Tailwind (couleurs, typographies)
    ├── types.ts                  # types partagés (projet, appareils, résultats)
    ├── context/
    │   └── ProjectContext.tsx    # état global du projet (React Context)
    ├── engine/
    │   ├── calculations.ts       # TOUTES les formules de dimensionnement (pur, sans UI)
    │   ├── calculations.test.ts  # tests unitaires du moteur de calcul
    │   └── useResults.ts         # hook qui dérive tous les résultats depuis l'état
    ├── pdf/
    │   └── generateReport.ts     # génération du rapport PDF (jsPDF + autotable)
    └── components/
        ├── Layout.tsx            # en-tête, navigation, structure des pages
        ├── Home.tsx               # page d'accueil
        ├── StepProject.tsx        # étape 1 — infos projet
        ├── StepConsumption.tsx    # étape 2 — bilan de consommation
        ├── StepSolar.tsx          # étape 3 — paramètres solaires + champ PV
        ├── StepBattery.tsx        # étape 4 — batterie
        ├── StepInverter.tsx       # étape 5 — onduleur
        ├── StepRegulator.tsx      # étape 6 — régulateur MPPT
        ├── Results.tsx            # page résultats + export PDF
        ├── About.tsx              # page à propos
        ├── StepHeader.tsx         # en-tête réutilisable d'étape
        └── Fields.tsx             # composants de champs de formulaire
```

Le moteur de calcul (`src/engine/calculations.ts`) est totalement indépendant de l'interface : chaque formule
(énergie quotidienne, puissance PV, configuration série/parallèle, batterie, onduleur, régulateur) est une fonction
pure, testée séparément. C'est ce fichier qu'il faut modifier si une formule doit évoluer.

## 2. Installation

Prérequis : Node.js 18 ou plus récent, et npm.

```bash
cd enertech-pv-calculator
npm install
```

## 3. Lancer l'application en local (développement)

```bash
npm run dev
```

L'application est alors disponible sur `http://localhost:5173`. Les calculs fonctionnent entièrement côté
navigateur, sans backend ni base de données : l'outil peut être utilisé hors ligne une fois la page chargée.

## 4. Construire la version de production

```bash
npm run build
```

Les fichiers statiques optimisés sont générés dans `dist/`. Pour prévisualiser cette version en local :

```bash
npm run preview
```

## 5. Lancer les tests

```bash
npx vitest run
```

Les tests couvrent le bilan énergétique, la puissance PV, le nombre de panneaux, la configuration série/parallèle,
la batterie, l'onduleur, le régulateur MPPT et les cas limites (valeurs nulles, négatives, incompatibles).

## 6. Déployer l'application sur Internet

Le dossier `dist/` généré par `npm run build` est un site statique : il peut être déployé sur n'importe quel
hébergeur de fichiers statiques.

**Netlify / Vercel**
1. Poussez le projet sur un dépôt Git (GitHub, GitLab…).
2. Connectez le dépôt à Netlify ou Vercel.
3. Commande de build : `npm run build` — dossier de sortie : `dist`.

**Hébergement manuel (OVH, cPanel, etc.)**
1. Exécutez `npm run build`.
2. Copiez le contenu du dossier `dist/` à la racine de votre hébergement web.

Aucune variable d'environnement n'est nécessaire : l'application ne dépend d'aucune API externe pour fonctionner.

## 7. Variables d'environnement

Aucune. Tous les calculs et la génération du PDF s'exécutent dans le navigateur.

## 8. Modifier le nom et le logo « EnerTech »

- Nom affiché dans l'en-tête : `src/components/Layout.tsx`, texte `EnerTech`.
- Nom affiché sur la page d'accueil : `src/components/Home.tsx`.
- Titre de l'onglet du navigateur : `index.html`, balise `<title>`.
- Logo : remplacez `public/favicon.svg` par votre propre fichier (gardez le même nom, ou mettez à jour la référence
  dans `index.html`).
- Logo dans le rapport PDF : le rapport actuel utilise un titre texte dans `src/pdf/generateReport.ts`. Pour ajouter
  une image, utilisez `doc.addImage(base64Logo, 'PNG', x, y, largeur, hauteur)` en haut de la fonction
  `generateReport`.
- Couleurs de la marque : `src/index.css`, bloc `@theme` (variables `--color-forest-*` et `--color-sun*`).

## 9. Ajouter des panneaux, batteries, onduleurs et régulateurs à une base de données

La première version permet la saisie manuelle des caractéristiques (aucune donnée de fabricant n'est inventée,
conformément au cahier des charges). Pour ajouter une base de données d'équipements dans une version future :

1. Créez un backend léger (par exemple une API Node.js/Express) avec une base SQLite pour démarrer, migrable vers
   PostgreSQL. Prévoyez des tables : `panneaux`, `batteries`, `onduleurs`, `regulateurs`, avec les colonnes déjà
   listées dans le cahier des charges (marque, modèle, puissance, Voc, Vmp, Isc, Imp pour les panneaux, etc.).
2. Exposez des routes de lecture (`GET /panneaux`, `GET /batteries`, …).
3. Dans `StepSolar.tsx`, `StepBattery.tsx`, etc., ajoutez un composant de sélection (liste déroulante) qui charge
   ces équipements via `fetch()` et pré-remplit les champs existants (`updatePanneau`, `updateBatterie`…) — les
   champs restent modifiables manuellement, comme demandé.
4. Ne jamais préremplir une fiche technique inventée : si un modèle n'est pas dans la base, laissez les champs à
   compléter par l'utilisateur.

## Note sur les calculs

Le moteur applique strictement les formules du cahier des charges (voir `src/engine/calculations.ts`) : aucune
valeur n'est arrondie ou validée artificiellement, aucune configuration série/parallèle n'est présentée comme
compatible si elle ne l'est pas, et aucune caractéristique d'équipement réel n'est générée automatiquement. Les
courants de démarrage ne sont pas calculés : l'application se contente de signaler les appareils marqués comme
ayant un démarrage important, et invite à vérifier leur fiche technique.

Les résultats produits sont des estimations de dimensionnement et doivent être vérifiés par un professionnel
qualifié avant toute installation.

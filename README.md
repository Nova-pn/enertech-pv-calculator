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
│   └── favicon.png
├── README.md
└── src/
    ├── main.tsx                  # point d'entrée
    ├── App.tsx                   # routes de l'application
    ├── index.css                 # thème Tailwind (couleurs, typographies)
    ├── types.ts                  # types partagés (projet, appareils, équipements, résultats)
    ├── data/
    │   ├── catalog.ts             # types + accès typé aux catalogues d'équipements
    │   ├── panels.json            # catalogue panneaux (réel, fourni par l'utilisateur)
    │   ├── batteries.json         # catalogue batteries (réel)
    │   ├── inverters.json         # catalogue onduleurs (réel)
    │   ├── regulators.json        # catalogue régulateurs MPPT + PWM fusionné (réel)
    │   ├── cables.json            # catalogue câbles PV (réel)
    │   └── protections.json       # catalogue protections DC (réel)
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
        ├── StepRegulator.tsx      # étape 6 — régulateur MPPT ou PWM (l'utilisateur choisit le type puis le modèle)
        ├── StepCabling.tsx        # étape 7 — câblage et protection DC
        ├── Results.tsx            # page résultats + export PDF
        ├── About.tsx              # page à propos
        ├── StepHeader.tsx         # en-tête réutilisable d'étape
        ├── EquipmentPicker.tsx    # sélecteur générique catalogue → fiche du modèle choisi
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

## 8. Le logo EnerTech

Le logo officiel (fourni par vous) est intégré à trois endroits, tous dérivés d'un seul jeu de fichiers dans
`src/assets/logo/` :

- `enertech-logo-full.jpg` — logo complet (emblème + texte), utilisé en grand sur la page d'accueil.
- `enertech-emblem.jpg` — emblème seul (sans le texte « EnerTech »), utilisé en petit dans l'en-tête via le
  composant `src/components/LogoMark.tsx`, et dans le rapport PDF via `src/assets/logo/logoBase64.ts`.
- `public/favicon.png` — favicon, généré à partir de l'emblème.

Ces trois fichiers sont de simples recadrages du logo original fourni — aucune couleur ni forme n'a été modifiée.
Pour changer de logo plus tard, il suffit de remplacer ces fichiers (en conservant les mêmes noms), et de
régénérer `logoBase64.ts` pour le PDF (un script Python de quelques lignes avec `base64.b64encode` suffit, voir
le contenu actuel du fichier pour le format attendu).

- Nom affiché dans l'en-tête : `src/components/Layout.tsx`, texte `EnerTech`.
- Nom affiché sur la page d'accueil : `src/components/Home.tsx`.
- Titre de l'onglet du navigateur : `index.html`, balise `<title>`.
- Couleurs de la marque : `src/index.css`, bloc `@theme` (variables `--color-forest-*` et `--color-sun*`).

## 9. Ajouter des équipements aux catalogues (panneaux, batteries, onduleurs, régulateurs, câbles, protections)

Les catalogues sont maintenant en place, sous forme de fichiers JSON dans `src/data/` :
`panels.json`, `batteries.json`, `inverters.json`, `regulators.json` (MPPT et PWM fusionnés, champ `type`),
`cables.json`, `protections.json`. Chaque entrée a un `id` unique et les caractéristiques électriques nécessaires
au calcul (voir les interfaces dans `src/data/catalog.ts`).

**Pour ajouter un nouvel équipement (méthode recommandée pour l'instant) :**
1. Ouvrez le fichier JSON de la catégorie concernée.
2. Ajoutez une entrée avec un `id` unique, en reprenant exactement les champs déjà présents pour les autres
   équipements de cette catégorie (mêmes noms de clés).
3. Ne renseignez que des valeurs issues d'une fiche technique réelle — laissez le champ absent ou à `null` plutôt
   que d'inventer une valeur.
4. Relancez `npm run dev` : le nouveau modèle apparaît automatiquement dans le sélecteur de l'étape correspondante.

**Si le catalogue grossit beaucoup (centaines de références) ou doit être mis à jour sans redéployer l'application :**
migrez vers un backend léger (Node.js/Express + SQLite, puis PostgreSQL si besoin), avec une route de lecture par
catégorie (`GET /panneaux`, `GET /batteries`, …), et remplacez les imports JSON de `src/data/catalog.ts` par des
appels `fetch()`. La structure des données ne change pas, seule la source change.

## Note sur les calculs

Le moteur applique strictement les formules du cahier des charges (voir `src/engine/calculations.ts`) : aucune
valeur n'est arrondie ou validée artificiellement, aucune configuration série/parallèle n'est présentée comme
compatible si elle ne l'est pas, et aucune caractéristique d'équipement réel n'est générée automatiquement. Les
courants de démarrage ne sont pas calculés : l'application se contente de signaler les appareils marqués comme
ayant un démarrage important, et invite à vérifier leur fiche technique.

Le régulateur se dimensionne différemment selon le type choisi par l'utilisateur : pour un MPPT, le courant
recommandé dérive de la puissance PV installée et de la tension système ; pour un PWM, il dérive directement du
courant de court-circuit (Isc) total du champ, puisque le PWM connecte le champ quasiment en direct sur la
batterie. Le câblage et la protection DC utilisent ce même courant Isc du champ pour la chute de tension
(ΔV = 2 × L × I × R/1000) et le calibre de protection recommandé (1,25 × Isc), en le comparant aux caractéristiques
du câble et de la protection choisis dans le catalogue.

Les résultats produits sont des estimations de dimensionnement et doivent être vérifiés par un professionnel
qualifié avant toute installation.

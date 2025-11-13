# MoneyTrack - Gestion de Finances Personnelles

Application web légère pour la gestion de finances personnelles et partagées (couple, amis, salariés).

## 🚀 Fonctionnalités

### 1. Gestion des Comptes
- Ajouter, modifier ou supprimer des comptes (banque, PayPal, Revolut, espèces)
- Suivi du solde de chaque compte
- Affichage du solde total (tous comptes confondus)

### 2. Gestion des Transactions
- Ajouter des transactions (revenu, dépense, transfert, remboursement)
- Éditer ou supprimer des transactions
- Filtrage par catégorie, type et mois
- Association d'une transaction à une personne pour le suivi des dettes

### 3. Gestion des Dettes
- Calcul automatique du solde dû entre vous et chaque personne
- Solde positif = la personne vous doit
- Solde négatif = vous devez à la personne

### 4. Tableaux de Bord
- Solde total et par compte
- Total des revenus et dépenses
- Bilan mensuel (revenus - dépenses)
- Graphique des dépenses par catégorie

### 5. Import/Export JSON
- Export de toutes vos données en fichier JSON
- Import de données depuis un fichier JSON
- Sauvegarde automatique dans le fichier moneyTrackData.json

## 📦 Installation

### Prérequis

- **Node.js** (version 14 ou supérieure) - [Télécharger Node.js](https://nodejs.org/)

### 🚀 Démarrage rapide

**Windows :** Double-cliquez sur `start-server.bat`

**Mac/Linux :** Exécutez `./start-server.sh` dans un terminal

Le serveur Node.js démarre automatiquement et ouvre votre navigateur sur `http://localhost:8000`. Le fichier `moneyTrackData.json` sera chargé automatiquement et toutes les modifications seront sauvegardées directement dans le fichier.

### Structure des fichiers
```
appComptes/
├── index.html          # Interface principale
├── styles.css          # Styles CSS
├── app.js              # Logique Vue.js
├── server.js           # Serveur Node.js (API de sauvegarde)
├── start-server.bat    # Script de démarrage Windows
├── start-server.sh     # Script de démarrage Mac/Linux
├── moneyTrackData.json # Fichier de données (créé automatiquement)
└── README.md           # Documentation
```

## 💻 Utilisation

1. Démarrez le serveur avec `start-server.bat` (Windows) ou `./start-server.sh` (Mac/Linux)
2. Le navigateur s'ouvre automatiquement sur `http://localhost:8000`
3. Ajoutez vos comptes (nom, type, solde initial)
4. Enregistrez vos transactions au fur et à mesure (elles sont sauvegardées automatiquement)
5. Consultez les tableaux de bord pour suivre vos finances
6. Utilisez la section "Dettes" pour suivre qui doit quoi à qui

### Types de transactions

- **Revenu** : Ajoute de l'argent au compte source
- **Dépense** : Retire de l'argent du compte source
- **Transfert** : Déplace de l'argent d'un compte à un autre
- **Remboursement** : Ajoute de l'argent au compte (remboursement reçu)

### Calcul des dettes

Le système calcule automatiquement les dettes :
- Si vous payez une dépense associée à une personne, elle vous doit ce montant (solde positif)
- Si vous recevez un remboursement, cela réduit la dette (solde négatif)

## 📁 Format de données

Les données sont stockées au format JSON avec la structure suivante :

```json
{
  "comptes": [
    {"id": 1, "nom": "PayPal", "type": "paypal", "solde": 120.50, "soldeInitial": 100.00}
  ],
  "personnes": [
    {"id": 1, "nom": "Moi"},
    {"id": 2, "nom": "Copine"}
  ],
  "transactions": [
    {
      "id": 1,
      "date": "2025-11-05",
      "montant": 80,
      "type": "dépense",
      "source": 1,
      "destination": 0,
      "categorie": "Courses",
      "personne": 2,
      "description": "Courses Carrefour"
    }
  ]
}
```

## 🔧 Technologies utilisées

- **HTML5** : Structure de l'application
- **CSS3** : Styles et design responsive
- **JavaScript (Vue.js 3)** : Logique et réactivité côté client
- **Node.js** : Serveur backend pour la sauvegarde des données
- **Fichier JSON** : Stockage des données dans moneyTrackData.json

## 📝 Notes

- Les données sont stockées dans le fichier `moneyTrackData.json`
- À chaque modification, le fichier est automatiquement sauvegardé via l'API serveur Node.js
- **Important :** L'application doit être utilisée via le serveur Node.js (`start-server.bat` ou `start-server.sh`)
- Les soldes des comptes sont recalculés automatiquement à partir des transactions
- Le solde initial d'un compte peut être modifié (toutes les transactions seront réappliquées)

## 🎨 Design

Interface sobre et moderne avec :
- Navigation par onglets (Comptes, Transactions, Dettes)
- Cartes colorées pour les comptes
- Tableaux clairs pour les transactions
- Graphiques visuels pour les statistiques

## 📱 Responsive

L'application est responsive et s'adapte aux écrans mobiles et tablettes.


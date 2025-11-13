# 🚀 Guide de déploiement sur Firebase (SANS CLI)

Ce guide vous permettra de déployer votre application MoneyTrack sur Firebase **sans utiliser la ligne de commande**, uniquement via la console web Firebase.

## 📋 Prérequis

1. Un compte Google (pour Firebase)
2. Un navigateur web

## 🌐 Étape 1 : Créer un projet Firebase

1. Allez sur https://console.firebase.google.com
2. Cliquez sur **"Ajouter un projet"** ou **"Add project"**
3. Donnez un nom à votre projet (ex: `moneytrack-app`)
4. Cliquez sur **"Continuer"**
5. Désactivez Google Analytics (ou activez-le si vous voulez)
6. Cliquez sur **"Créer le projet"**
7. Attendez quelques secondes puis cliquez sur **"Continuer"**

## 🔥 Étape 2 : Activer Firestore Database

1. Dans votre projet Firebase, cliquez sur **"Firestore Database"** dans le menu de gauche
2. Cliquez sur **"Créer une base de données"** ou **"Create database"**
3. Choisissez **"Démarrer en mode test"** (Start in test mode)
4. Sélectionnez une région (ex: `europe-west` pour l'Europe)
5. Cliquez sur **"Activer"** ou **"Enable"**

## 📝 Étape 3 : Configurer les règles Firestore

1. Toujours dans Firestore Database, allez dans l'onglet **"Règles"** ou **"Rules"**
2. Remplacez le contenu par :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /data/{document} {
      allow read, write: if true;
    }
  }
}
```

3. Cliquez sur **"Publier"** ou **"Publish"**

⚠️ **Note de sécurité** : Cette règle permet à tout le monde de lire/écrire. Pour plus de sécurité, utilisez Firebase Authentication.

## 🌐 Étape 4 : Activer Firebase Hosting

1. Dans le menu de gauche, cliquez sur **"Hosting"**
2. Cliquez sur **"Commencer"** ou **"Get started"**
3. Suivez les étapes d'initialisation

## 🔑 Étape 5 : Obtenir les clés de configuration

1. Cliquez sur l'icône ⚙️ (Settings) en haut à gauche
2. Cliquez sur **"Project settings"** ou **"Paramètres du projet"**
3. Descendez jusqu'à **"Your apps"** ou **"Vos applications"**
4. Si vous n'avez pas d'app web, cliquez sur l'icône **</>** (Add app) et créez une app web
5. Donnez un nom à votre app (ex: `MoneyTrack Web`)
6. **Ne cochez pas** "Also set up Firebase Hosting" (on le fera manuellement)
7. Cliquez sur **"Register app"**
8. **Copiez toutes les valeurs** de la configuration qui s'affiche

## ⚙️ Étape 6 : Configurer firebase-config.js

1. Ouvrez le fichier `firebase-config.js` dans votre projet
2. Remplacez les valeurs `VOTRE_...` par celles que vous avez copiées :

```javascript
const firebaseConfig = {
    apiKey: "AIzaSy...", // Votre API Key
    authDomain: "votre-projet.firebaseapp.com",
    projectId: "votre-projet-id",
    storageBucket: "votre-projet.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);

// Initialiser Firestore
const db = firebase.firestore();
```

## 📤 Étape 7 : Préparer les fichiers pour le déploiement

Créez un dossier `public` (ou `dist`) avec tous vos fichiers :

**Fichiers à inclure :**
- ✅ `index.html`
- ✅ `app.js`
- ✅ `styles.css`
- ✅ `firebase-config.js`

**Fichiers à NE PAS inclure :**
- ❌ `server.js`
- ❌ `moneyTrackData.json`
- ❌ `start-server.bat` / `start-server.sh`
- ❌ `FIREBASE_DEPLOY.md`
- ❌ Tous les fichiers `.example`

## 🚀 Étape 8 : Déployer via la console Firebase

### Option A : Déploiement manuel (Drag & Drop)

1. Allez dans **Firebase Hosting** dans votre projet
2. Cliquez sur **"Ajouter un site"** ou **"Add another site"** si vous n'en avez pas
3. Donnez un nom à votre site (ex: `moneytrack`)
4. Une fois le site créé, vous verrez une URL du type `votre-projet.web.app`

**Note** : Firebase Hosting nécessite normalement Firebase CLI pour déployer. Pour déployer sans CLI, vous avez deux options :

### Option B : Utiliser Firebase Hosting avec GitHub (Recommandé)

1. Dans Firebase Hosting, cliquez sur **"Connect GitHub"**
2. Autorisez Firebase à accéder à votre GitHub
3. Sélectionnez votre repository
4. Configurez le build :
   - **Branch** : `main` ou `master`
   - **Root directory** : `/` (ou le dossier où sont vos fichiers)
   - **Build command** : (laissez vide, pas de build nécessaire)
   - **Output directory** : `/` (ou le dossier où sont vos fichiers)
5. Cliquez sur **"Deploy"**

### Option C : Utiliser un service d'hébergement gratuit alternatif

Si vous ne pouvez pas utiliser Firebase Hosting sans CLI, voici des alternatives :

#### Netlify (Recommandé - très simple)

1. Allez sur https://www.netlify.com
2. Créez un compte (gratuit)
3. Glissez-déposez votre dossier `public` directement sur Netlify
4. Votre site est en ligne en quelques secondes !
5. Partagez l'URL avec votre copine

#### Vercel

1. Allez sur https://vercel.com
2. Créez un compte
3. Importez votre projet depuis GitHub ou glissez-déposez vos fichiers
4. Déployez !

## 🔄 Étape 9 : Tester la synchronisation

1. Ouvrez votre application déployée dans deux onglets différents (ou deux navigateurs)
2. Ajoutez une transaction dans un onglet
3. L'autre onglet devrait se mettre à jour automatiquement grâce à Firestore en temps réel !

## 📱 Partage avec votre copine

Une fois déployé, partagez simplement l'URL avec votre copine :
- Firebase Hosting : `https://votre-projet.web.app`
- Netlify : `https://votre-site.netlify.app`
- Vercel : `https://votre-site.vercel.app`

## 🔄 Mises à jour futures

### Si vous utilisez Netlify/Vercel :
- Glissez-déposez simplement les nouveaux fichiers
- Ou connectez votre GitHub pour un déploiement automatique

### Si vous utilisez Firebase Hosting avec GitHub :
- Les mises à jour se font automatiquement quand vous poussez sur GitHub

## 🗄️ Migration des données existantes

Si vous avez déjà des données dans `moneyTrackData.json` :

1. Ouvrez `moneyTrackData.json`
2. Copiez tout son contenu
3. Allez dans Firebase Console > Firestore Database
4. Cliquez sur **"Démarrer la collection"** ou **"Start collection"**
5. Collection ID : `data`
6. Document ID : `moneytrack`
7. Cliquez sur **"Ajouter un champ"** ou **"Add field"**
8. Ajoutez un champ de type **map** avec toutes vos données
9. Ou utilisez l'import JSON (menu en haut à droite de Firestore)

## 🔒 Sécurité (optionnel - pour plus tard)

Pour ajouter une authentification et limiter l'accès :

1. Dans Firebase Console, allez dans **Authentication**
2. Activez **Email/Password** ou **Google**
3. Modifiez les règles Firestore pour exiger l'authentification
4. Ajoutez l'authentification dans votre code

## ❓ Aide

Si vous rencontrez des problèmes :
- Vérifiez la console Firebase : https://console.firebase.google.com
- Vérifiez la console du navigateur (F12) pour les erreurs
- Consultez la documentation : https://firebase.google.com/docs

## 🎉 C'est fait !

Votre application est maintenant en ligne et partagée ! Les données sont synchronisées en temps réel entre vous et votre copine.

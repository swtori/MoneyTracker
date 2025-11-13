# 🔥 Configuration Firebase Realtime Database

Ce guide vous explique comment configurer votre application pour utiliser Firebase Realtime Database avec synchronisation en temps réel.

## 📋 Prérequis

1. Un projet Firebase avec Realtime Database activé
2. L'URL de votre Realtime Database : `https://moneytracker-40c59-default-rtdb.europe-west1.firebasedatabase.app/`

## 🔑 Étape 1 : Obtenir les clés de configuration Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com)
2. Sélectionnez votre projet `moneytracker-40c59`
3. Cliquez sur l'icône ⚙️ (Settings) en haut à gauche
4. Cliquez sur **"Project settings"** ou **"Paramètres du projet"**
5. Descendez jusqu'à **"Your apps"** ou **"Vos applications"**
6. Si vous n'avez pas d'app web, cliquez sur l'icône **</>** (Add app) et créez une app web
7. Donnez un nom à votre app (ex: `MoneyTrack Web`)
8. **Copiez toutes les valeurs** de la configuration qui s'affiche

## ⚙️ Étape 2 : Configurer firebase-config.js

1. Ouvrez le fichier `firebase-config.js` dans votre projet
2. Remplacez les valeurs `VOTRE_...` par celles que vous avez copiées :

```javascript
const firebaseConfig = {
    apiKey: "AIzaSy...", // Votre API Key
    authDomain: "moneytracker-40c59.firebaseapp.com",
    databaseURL: "https://moneytracker-40c59-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "moneytracker-40c59",
    storageBucket: "moneytracker-40c59.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};
```

⚠️ **Important** : L'URL `databaseURL` est déjà configurée avec votre URL de base de données.

## 🔒 Étape 3 : Configurer les règles de sécurité Realtime Database

1. Dans Firebase Console, allez dans **Realtime Database** dans le menu de gauche
2. Cliquez sur l'onglet **"Règles"** ou **"Rules"**
3. Remplacez le contenu par :

```json
{
  "rules": {
    "moneytrack": {
      ".read": true,
      ".write": true
    }
  }
}
```

4. Cliquez sur **"Publier"** ou **"Publish"**

⚠️ **Note de sécurité** : Ces règles permettent à tout le monde de lire/écrire. Pour plus de sécurité, utilisez Firebase Authentication.

### Règles sécurisées (optionnel - avec authentification)

Si vous voulez ajouter l'authentification plus tard :

```json
{
  "rules": {
    "moneytrack": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

## 📤 Étape 4 : Déployer votre code sur GitHub

1. Assurez-vous que `firebase-config.js` est configuré avec vos vraies clés
2. Commitez et poussez vos changements sur GitHub :

```bash
git add .
git commit -m "Configuration Firebase Realtime Database"
git push origin main
```

## ✅ Étape 5 : Vérifier que tout fonctionne

1. Ouvrez votre application (depuis GitHub Pages ou votre hébergement)
2. Ouvrez la console du navigateur (F12)
3. Vous devriez voir :
   - `✅ Données chargées depuis Firebase Realtime Database`
   - Les données de votre base de données s'affichent

## 🔄 Synchronisation en temps réel

L'application est maintenant configurée pour :
- ✅ Charger les données depuis Firebase Realtime Database au démarrage
- ✅ Sauvegarder automatiquement toutes les modifications dans Firebase
- ✅ **Synchroniser en temps réel** : si vous ouvrez l'application sur plusieurs appareils/navigateurs, les changements apparaissent instantanément partout

## 🧪 Tester la synchronisation en temps réel

1. Ouvrez votre application dans deux onglets/navigateurs différents
2. Ajoutez une transaction dans le premier onglet
3. Regardez le deuxième onglet : la transaction apparaît automatiquement sans rechargement !

## ❓ Dépannage

### Erreur : "Permission denied"
- Vérifiez que les règles de sécurité sont bien publiées dans Firebase Console
- Vérifiez que vous avez bien configuré les règles pour permettre la lecture/écriture

### Erreur : "Firebase: Error (auth/unauthorized)"
- Vérifiez que votre `apiKey` est correcte dans `firebase-config.js`
- Vérifiez que votre projet Firebase est actif

### Les données ne se synchronisent pas
- Vérifiez la console du navigateur pour les erreurs
- Vérifiez que `databaseURL` est correct dans `firebase-config.js`
- Vérifiez que les scripts Firebase sont bien chargés dans `index.html`

## 🎉 C'est fait !

Votre application est maintenant connectée à Firebase Realtime Database avec synchronisation en temps réel !


# Déploiement des règles Firebase Realtime Database

## Problème
Si vous voyez l'erreur `permission_denied`, c'est que les règles de sécurité Firebase ne sont pas déployées.

## Solution

### Option 1 : Via Firebase Console (Recommandé)

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet `moneytracker-40c59`
3. Allez dans **Realtime Database** dans le menu de gauche
4. Cliquez sur l'onglet **Règles** en haut
5. Collez les règles suivantes :

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

6. Cliquez sur **Publier**

### Option 2 : Via Firebase CLI

Si vous avez Firebase CLI installé :

```bash
firebase deploy --only database
```

## Vérification

Après avoir publié les règles, actualisez votre application. L'erreur `permission_denied` devrait disparaître.

## ⚠️ Sécurité

Ces règles permettent à **tout le monde** de lire et écrire dans votre base de données. Pour un usage en production, vous devriez implémenter une authentification Firebase et restreindre les accès.


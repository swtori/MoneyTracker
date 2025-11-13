# 🚀 Guide de configuration GitHub Pages

Ce guide vous explique comment configurer GitHub Pages pour votre application MoneyTrack.

## 📋 Vérifications préalables

1. ✅ Votre fichier `index.html` est à la racine du dépôt
2. ✅ Tous vos fichiers sont commités et poussés sur GitHub
3. ✅ Vous avez les fichiers suivants à la racine :
   - `index.html`
   - `app.js`
   - `styles.css`
   - `firebase-config.js`

## 🔧 Étape 1 : Activer GitHub Pages

1. Allez sur votre dépôt GitHub
2. Cliquez sur **Settings** (Paramètres) en haut du dépôt
3. Dans le menu de gauche, cliquez sur **Pages** (Pages)
4. Dans la section **Source**, sélectionnez :
   - **Branch** : `main` (ou `master` selon votre branche principale)
   - **Folder** : `/ (root)` (racine)
5. Cliquez sur **Save** (Enregistrer)

## ⏱️ Étape 2 : Attendre le déploiement

- GitHub Pages peut prendre **1 à 5 minutes** pour déployer votre site
- Vous verrez un message vert indiquant que votre site est publié
- L'URL sera : `https://VOTRE_USERNAME.github.io/VOTRE_REPO_NAME/`

## 🔍 Étape 3 : Vérifier l'URL

Si votre dépôt s'appelle `appComptes` et votre username est `antoi`, l'URL sera :
```
https://antoi.github.io/appComptes/
```

⚠️ **Important** : Notez le `/` à la fin de l'URL !

## ❌ Si vous avez toujours une erreur 404

### Solution 1 : Vérifier la casse du nom de fichier

GitHub Pages est sensible à la casse. Assurez-vous que votre fichier s'appelle exactement :
- `index.html` (en minuscules)

### Solution 2 : Vérifier que les fichiers sont bien commités

```bash
git status
```

Tous les fichiers doivent être commités et poussés :
```bash
git add .
git commit -m "Déploiement GitHub Pages"
git push origin main
```

### Solution 3 : Vérifier la branche

1. Allez dans **Settings > Pages**
2. Assurez-vous que la branche sélectionnée est `main` (ou `master`)
3. Le dossier doit être `/ (root)`

### Solution 4 : Forcer un nouveau déploiement

1. Allez dans **Settings > Pages**
2. Changez la branche pour une autre (ex: `gh-pages`)
3. Sauvegardez
4. Remettez la branche sur `main`
5. Sauvegardez à nouveau

### Solution 5 : Vérifier les Actions GitHub

1. Allez dans l'onglet **Actions** de votre dépôt
2. Vérifiez s'il y a des erreurs de déploiement
3. Si oui, cliquez sur l'action pour voir les détails

## 🔄 Mise à jour après modification

Après chaque modification :
1. Commitez vos changements
2. Poussez sur GitHub
3. Attendez 1-5 minutes pour que GitHub Pages se mette à jour

## 🌐 Alternative : Utiliser un sous-dossier

Si vous voulez organiser vos fichiers dans un sous-dossier :

1. Créez un dossier `docs` à la racine
2. Déplacez tous vos fichiers dans `docs/`
3. Dans **Settings > Pages**, sélectionnez :
   - **Branch** : `main`
   - **Folder** : `/docs`

## 📝 Structure recommandée pour GitHub Pages

```
appComptes/
├── index.html          ← Doit être à la racine ou dans le dossier sélectionné
├── app.js
├── styles.css
├── firebase-config.js
├── README.md
└── ...
```

## ✅ Vérification finale

Une fois configuré, votre site devrait être accessible à :
```
https://VOTRE_USERNAME.github.io/appComptes/
```

Ouvrez cette URL dans votre navigateur et vous devriez voir votre application MoneyTrack !

## 🆘 Besoin d'aide ?

Si le problème persiste :
1. Vérifiez les logs dans **Settings > Pages** (section "Recent GitHub Pages builds")
2. Vérifiez la console du navigateur (F12) pour les erreurs JavaScript
3. Assurez-vous que tous les chemins dans `index.html` sont relatifs (commencent par `./` ou sans `/`)


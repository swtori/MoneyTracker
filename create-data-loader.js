// Script pour créer data-loader.js à partir de moneyTrackData.json
// Usage: node create-data-loader.js

const fs = require('fs');
const path = require('path');

const jsonFile = path.join(__dirname, 'moneyTrackData.json');
const outputFile = path.join(__dirname, 'data-loader.js');

if (!fs.existsSync(jsonFile)) {
    console.error('❌ Fichier moneyTrackData.json non trouvé');
    process.exit(1);
}

const jsonData = fs.readFileSync(jsonFile, 'utf8');
const data = JSON.parse(jsonData);

const jsContent = `// Données initiales chargées automatiquement depuis moneyTrackData.json
// Ce fichier est généré automatiquement - ne pas modifier manuellement
window.initialData = ${JSON.stringify(data, null, 2)};
`;

fs.writeFileSync(outputFile, jsContent, 'utf8');
console.log('✅ Fichier data-loader.js créé avec succès');
console.log(`   ${data.comptes?.length || 0} comptes`);
console.log(`   ${data.personnes?.length || 0} personnes`);
console.log(`   ${data.transactions?.length || 0} transactions`);


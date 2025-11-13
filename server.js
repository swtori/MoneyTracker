const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8000;
const DATA_FILE = path.join(__dirname, 'moneyTrackData.json');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Servir les fichiers statiques
    if (req.method === 'GET' && parsedUrl.pathname !== '/api/save') {
        let filePath = '.' + parsedUrl.pathname;
        if (filePath === './') {
            filePath = './index.html';
        }
        
        const extname = String(path.extname(filePath)).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.wav': 'audio/wav',
            '.mp4': 'video/mp4',
            '.woff': 'application/font-woff',
            '.ttf': 'application/font-ttf',
            '.eot': 'application/vnd.ms-fontobject',
            '.otf': 'application/font-otf',
            '.wasm': 'application/wasm'
        };
        
        const contentType = mimeTypes[extname] || 'application/octet-stream';
        
        fs.readFile(filePath, (error, content) => {
            if (error) {
                if (error.code === 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('<h1>404 - File Not Found</h1>', 'utf-8');
                } else {
                    res.writeHead(500);
                    res.end(`Server Error: ${error.code}`, 'utf-8');
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
        return;
    }
    
    // API pour sauvegarder les données
    if (req.method === 'POST' && parsedUrl.pathname === '/api/save') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const jsonString = JSON.stringify(data, null, 2);
                
                // Écrire dans le fichier
                fs.writeFileSync(DATA_FILE, jsonString, 'utf8');
                
                // Vérifier que le fichier a bien été écrit
                const fileStats = fs.statSync(DATA_FILE);
                console.log(`✅ Fichier sauvegardé: ${DATA_FILE} (${fileStats.size} bytes)`);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Données sauvegardées avec succès' }));
            } catch (error) {
                console.error('❌ Erreur lors de la sauvegarde:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: error.message }));
            }
        });
        return;
    }
    
    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log('========================================');
    console.log('  MoneyTrack - Serveur Node.js');
    console.log('========================================');
    console.log('');
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
    console.log(`Fichier de données: ${DATA_FILE}`);
    console.log('');
    
    // Vérifier si le fichier existe
    if (fs.existsSync(DATA_FILE)) {
        const stats = fs.statSync(DATA_FILE);
        console.log(`✅ Fichier moneyTrackData.json trouvé (${stats.size} bytes)`);
    } else {
        console.log('⚠️  Fichier moneyTrackData.json non trouvé (sera créé à la première sauvegarde)');
    }
    console.log('');
    console.log('Ouverture automatique du navigateur dans 2 secondes...');
    setTimeout(() => {
        const { exec } = require('child_process');
        const platform = process.platform;
        let command;
        
        if (platform === 'win32') {
            command = `start http://localhost:${PORT}`;
        } else if (platform === 'darwin') {
            command = `open http://localhost:${PORT}`;
        } else {
            command = `xdg-open http://localhost:${PORT}`;
        }
        
        exec(command);
    }, 2000);
    console.log('');
    console.log('Appuyez sur Ctrl+C pour arrêter le serveur');
    console.log('========================================');
    console.log('');
});


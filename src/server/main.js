const path = require('path');
const fs = require('fs');
const https = require('https');
const express = require('express');
const rollup = require('rollup');
const rollupConfig = require('./rollup.config.js');
const WebSocket = require('ws');
const PouchDB = require('pouchdb');
const expressPouchDB = require('express-pouchdb');

const rootPath = path.resolve(__dirname, '..', '..');
const port = 8443;
const credentials = {
    key: fs.readFileSync(
        path.resolve(rootPath, 'dev-cert', 'jl-l-01.local+4-key.pem'), 
        'utf8',
    ),
    cert: fs.readFileSync(
        path.resolve(rootPath, 'dev-cert', 'jl-l-01.local+4.pem'), 
        'utf8',
    ),
};

const app = express();
const httpsServer = https.createServer(credentials, app);
const wss = new WebSocket.Server({ server: httpsServer });

wss.on('connection', (connection) => {
    connection.on('message', (message) => {
        const data = JSON.parse(message);
        console.log('received: ', data);
    });

    connection.on('close', () => {
        console.log('client disconnected...');
    });
   
    console.log('client connected...');
});

const dataPath = path.resolve(rootPath, 'data');
if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath);
}
const LevelPouchDB = PouchDB.defaults({
    prefix: dataPath + path.sep,
    adapter: 'leveldb',
});
const pouchApp = expressPouchDB({
    mode: 'minimumForPouchDB',
});
pouchApp.setPouchDB(LevelPouchDB);

app.use('/db', pouchApp);
app.use('/', express.static(path.resolve(rootPath, 'public')));
app.use('*', function(req, res) {
    res.sendFile(path.resolve(rootPath, 'public', 'index.html'));
});

httpsServer.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

const watcher = rollup.watch(rollupConfig);

watcher.on('event', (event) => {
    if (event.error) {
        console.error(`'${event.input}' | Error: '${event.error}'`);
        return;
    }

    if (event.code === 'BUNDLE_START') {
        console.info(`'${event.input}' | Bundling started...`);
    }

    if (event.code === 'BUNDLE_END') {
        console.info(`'${event.input}' | Bundling finished in ${event.duration} ms`);
        if (event.result.watchFiles) {
            console.info(`'${event.input}' | Watching ${event.result.watchFiles.length} files`);
            // console.log(event.result.watchFiles);
        }
        
        const data = {
            type: event.code,
            file: event.input,
        };

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }
});

const path = require('path');
const fs = require('fs');
const https = require('https');
const express = require('express');
const rollup = require('rollup');
const rollupConfig = require('./rollup.config.js');
const middleware = require('./middleware.js');
const WebSocket = require('ws');

const rootPath = path.resolve(__dirname, '../../');
const port = 8443;
const credentials = {
    key: fs.readFileSync(
        path.resolve(rootPath, './dev-cert/jl-l-01.local+4-key.pem'), 
        'utf8',
    ),
    cert: fs.readFileSync(
        path.resolve(rootPath, './dev-cert/jl-l-01.local+4.pem'), 
        'utf8',
    ),
};

const app = express();
const httpsServer = https.createServer(credentials, app);
const wss = new WebSocket.Server({ server: httpsServer });

wss.on('connection', (connection) => {
    connection.on('message', (message) => {
        console.log('received: %s', message);
    });

    connection.on('close', () => {
        console.log('client disconnected...');
    });
   
    console.log('client connected...');
});

app.use('/', express.static(path.resolve(rootPath, './public')));
middleware(app, httpsServer, path.resolve(rootPath, './public/upload'));
app.use('*', function(req, res) {
    res.sendFile(path.resolve(rootPath, './public/index.html'));
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

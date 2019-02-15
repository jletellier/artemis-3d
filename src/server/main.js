const path = require('path');
const fs = require('fs');
const https = require('https');
const express = require('express');
const rollup = require('rollup');
const rollupConfig = require('./rollup.config.js');
const middleware = require('./middleware.js');

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
        console.error(event.error);
        return;
    }

    if (event.code === 'BUNDLE_END') {
        console.log('sucessfull');
    }
});

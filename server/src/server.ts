import path from 'path';
import fs from 'fs';
import https from 'https';
import express from 'express';
import ws from 'ws';
import nodeWatch from 'node-watch';

const rootPath = path.resolve(__dirname, '../../');
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
const wss = new ws.Server({ server: httpsServer });

nodeWatch(path.resolve(rootPath, 'examples'), { recursive: true }, reloadClient);
nodeWatch(path.resolve(rootPath, 'viewer/dist/index.js'), {}, reloadClient);

function reloadClient() {
    console.log('File changed...');
}

app.use('/', express.static(path.resolve(rootPath, 'examples')));
app.use('/', express.static(path.resolve(rootPath, 'viewer/dist')));
app.use('*', (req, res) => {
    res.sendFile(path.resolve(rootPath, 'examples', 'index.html'));
});

httpsServer.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

import path from 'path';
import fs from 'fs';
import https from 'https';
import express from 'express';
import ws from 'ws';
import nodeWatch from 'node-watch';
import validFilename from 'valid-filename';

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
app.use(express.json());

const httpsServer = https.createServer(credentials, app);
const wss = new ws.Server({ server: httpsServer });

nodeWatch(path.resolve(rootPath, 'examples'), { recursive: true }, reloadClient);
nodeWatch(path.resolve(rootPath, 'viewer/dist/index.js'), {}, reloadClient);

function reloadClient() {
    console.log('File changed...');
}

app.use('/api/', (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization'];

    if (Array.isArray(token) && token.length > 0) {
        token = token[0];
    }

    if (typeof token === 'string' && token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    if (token === '1234') {
        return next();
    }

    console.log('Client is not authorized');
    res.sendStatus(403);
});

app.post('/api/scene/upload', (req, res) => {
    console.log(req.body);
    res.sendStatus(200);
});

app.post('/api/logic/upload', (req, res) => {
    const canvas = req.body;
    console.log(canvas);

    if (!validFilename(canvas.name)) {
        return res.sendStatus(500);
    }

    const uploadPath = path.resolve(rootPath, 'uploads');
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath);
    }

    const filePath = path.resolve(uploadPath, `${canvas.name}.json`);
    const fileContent = JSON.stringify(req.body, null, 4);

    fs.writeFile(filePath, fileContent, (e) => {
        if (e) {
            console.log(e);
            return res.sendStatus(500);
        }
        
        res.sendStatus(200);
    });
});

app.use('/', express.static(path.resolve(rootPath, 'examples')));
app.use('/', express.static(path.resolve(rootPath, 'viewer/dist')));
app.use('*', (req, res) => {
    res.sendFile(path.resolve(rootPath, 'examples', 'index.html'));
});

httpsServer.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

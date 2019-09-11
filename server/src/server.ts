import path from 'path';
import fs from 'fs';
import http from 'http';
import https from 'https';
import express, { Response } from 'express';
import bodyParser from 'body-parser';
import ws from 'ws';
import nodeWatch from 'node-watch';
import validFilename from 'valid-filename';
import { uniqueNamesGenerator } from 'unique-names-generator';
import jsonwebtoken from 'jsonwebtoken';

const JWT_SECRET = ')-s_d4[Fk$d7GaHD7N.]U**D';
const IS_DEV = (process.env.NODE_ENV || '').trim() === 'dev';
const ROOT_PATH = path.resolve(__dirname, '../../');
const PORT = IS_DEV ? 8443 : 80;

let credentials = {};
if (IS_DEV) {
    credentials = {
        key: fs.readFileSync(
            path.resolve(ROOT_PATH, 'dev-cert', 'jl-l-01.local+4-key.pem'),
            'utf8',
        ),
        cert: fs.readFileSync(
            path.resolve(ROOT_PATH, 'dev-cert', 'jl-l-01.local+4.pem'),
            'utf8',
        ),
    };
}

const app = express();
app.use(express.json());
app.use(bodyParser.raw({ limit: '200mb' }));

const httpServer = (IS_DEV) ?
    https.createServer(credentials, app) :
    http.createServer(app);

if (IS_DEV) {
    const wss = new ws.Server({ server: httpServer });

    nodeWatch(path.resolve(ROOT_PATH, 'examples'), { recursive: true }, reloadClient);
    nodeWatch(path.resolve(ROOT_PATH, 'viewer/dist/index.js'), {}, reloadClient);

    function reloadClient() {
        console.log('File changed...');
    }
}

app.use('/api/project/generate', (req, res) => {
    const randomName = uniqueNamesGenerator({ separator: '-' });
    const payload = { name: randomName };
    const token = jsonwebtoken.sign(payload, JWT_SECRET);
    res.json({
        token,
        ...payload,
    });
});

app.use('/api/', async (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization'];

    if (Array.isArray(token) && token.length > 0) {
        token = token[0];
    }

    if (typeof token !== 'string') {
        console.log('Client did not provide a JWT');
        return res.sendStatus(403);
    }

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }
    
    jsonwebtoken.verify(token, JWT_SECRET, (e, decoded) => {
        if (e) {
            console.log('Client did not provide a valid JWT');
            return res.sendStatus(403);
        }

        res.locals.payload = decoded;
        return next();
    });
});

function saveProjectFile(res: Response, fileName: string, fileContent: string|Buffer) {
    if (!validFilename(fileName)) {
        return res.sendStatus(500);
    }

    const uploadPath = path.resolve(ROOT_PATH, 'uploads');
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath);
    }

    const projectPath = path.resolve(uploadPath, res.locals.payload.name);
    if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath);
    }

    const filePath = path.resolve(projectPath, fileName);

    fs.writeFile(filePath, fileContent, (e) => {
        if (e) {
            console.log(e);
            return res.sendStatus(500);
        }
        
        res.sendStatus(200);
    });
}

app.use('/api/project/verify', (req, res) => {
    res.send(res.locals.payload);
});

app.post('/api/gltf/upload', (req, res) => {
    const gltf = req.body;
    
    const fileName = 'project.gltf';
    const fileContent = JSON.stringify(gltf, null, 4);

    saveProjectFile(res, fileName, fileContent);
});

app.post('/api/buffer/upload/:filename', (req, res) => {
    const buffer = req.body;
    const fileName = req.params.filename;

    saveProjectFile(res, fileName, buffer);
});

app.post('/api/logic/upload', (req, res) => {
    const canvas = req.body;

    const fileName = `${canvas.name}.json`;
    const fileContent = JSON.stringify(canvas, null, 4);

    saveProjectFile(res, fileName, fileContent);
});

app.use('/', express.static(path.resolve(ROOT_PATH, 'uploads')));
app.use('/', express.static(path.resolve(ROOT_PATH, 'viewer', 'build')));
app.use('/', express.static(path.resolve(ROOT_PATH, 'viewer', 'dist')));
app.use('/:project/', (req, res) => {
    res.sendFile(path.resolve(ROOT_PATH, 'viewer', 'index.html'));
});

httpServer.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

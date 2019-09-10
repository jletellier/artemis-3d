import path from 'path';
import fs from 'fs';
import https from 'https';
import express, { Response } from 'express';
import bodyParser from 'body-parser';
import ws from 'ws';
import nodeWatch from 'node-watch';
import validFilename from 'valid-filename';
import { uniqueNamesGenerator } from 'unique-names-generator';
import jsonwebtoken from 'jsonwebtoken';

const JWT_SECRET = ')-s_d4[Fk$d7GaHD7N.]U**D';
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
app.use(bodyParser.raw({ limit: '200mb' }));

const httpsServer = https.createServer(credentials, app);
const wss = new ws.Server({ server: httpsServer });

nodeWatch(path.resolve(rootPath, 'examples'), { recursive: true }, reloadClient);
nodeWatch(path.resolve(rootPath, 'viewer/dist/index.js'), {}, reloadClient);

function reloadClient() {
    console.log('File changed...');
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

    const uploadPath = path.resolve(rootPath, 'uploads');
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

app.post('/api/buffer/upload', (req, res) => {
    const buffer = req.body;

    const fileName = 'buffer0.bin';

    saveProjectFile(res, fileName, buffer);
});

app.post('/api/logic/upload', (req, res) => {
    const canvas = req.body;

    const fileName = `${canvas.name}.json`;
    const fileContent = JSON.stringify(canvas, null, 4);

    saveProjectFile(res, fileName, fileContent);
});

app.use('/', express.static(path.resolve(rootPath, 'examples')));
app.use('/', express.static(path.resolve(rootPath, 'viewer/dist')));
app.use('*', (req, res) => {
    res.sendFile(path.resolve(rootPath, 'examples', 'index.html'));
});

httpsServer.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

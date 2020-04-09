import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';
import * as express from 'express';
import * as ws from 'ws';
import * as Automerge from 'automerge';

import { projectFixture } from '../common/fixtures/projectFixture';

const PORT = 5000;
const UPLOAD_PATH = path.resolve(__dirname, '..', '..', 'dist', 'uploads');

const app = express();
const httpServer = http.createServer(app);
const wss = new ws.Server({ server: httpServer });

if (projectFixture.gltfPath) {
  const gltfPath = path.resolve(UPLOAD_PATH, projectFixture.gltfPath);
  const gltfRaw = fs.readFileSync(gltfPath);
  projectFixture.gltf = JSON.parse(gltfRaw.toString());
}

const initialState = Automerge.from(projectFixture);

const docSet = new Automerge.DocSet();
docSet.setDoc('scene', initialState);

wss.on('connection', (socket) => {
  const automerge = new Automerge.Connection(docSet, (msg) => {
    socket.send(JSON.stringify(msg));
  });

  socket.on('message', (data) => {
    automerge.receiveMsg(JSON.parse(data.toString()));
  });

  automerge.open();
});

function handler(docId: string, doc: Automerge.FreezeObject<unknown>) {
  if (docId === 'scene') {
    /* eslint-disable-next-line no-console */
    console.log('NEW DOC!!!', JSON.stringify(doc));
  }
}

docSet.registerHandler(handler);

app.use('/api/test', (req, res) => {
  res.send('hello world');
});

httpServer.listen(PORT, () => {
  /* eslint-disable-next-line no-console */
  console.log(`Server listening on port ${PORT}`);
});

import * as http from 'http';
import * as express from 'express';
import * as ws from 'ws';
import * as Automerge from 'automerge';

import projectFixture from '../common/fixtures/projectFixture';

const PORT = 5000;

const app = express();
const httpServer = http.createServer(app);
const wss = new ws.Server({ server: httpServer });

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

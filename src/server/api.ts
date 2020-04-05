import * as http from 'http';
import * as express from 'express';
import * as ws from 'ws';
import * as Automerge from 'automerge';

const PORT = 5000;

const app = express();
const httpServer = http.createServer(app);
const wss = new ws.Server({ server: httpServer });

const initialState = Automerge.from({
  nodes: [
    {
      name: 'sphere1',
      mesh: 0,
      position: { x: 2.8, y: 0.4, z: -0.2 },
    },
  ],
});

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

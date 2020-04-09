import * as React from 'react';
import {
  createContext,
  useState,
  useEffect,
  useContext,
  FunctionComponent,
  ReactNode,
} from 'react';
import * as Automerge from 'automerge';

import { ProjectState } from '../../common/types/projectState';
import { fixture } from '../../common/fixtures/projectFixture';

const { location } = window;
const wsUri = `${((location.protocol === 'https:') ? 'wss://' : 'ws://')}${location.host}/api`;
const ws = new WebSocket(wsUri);

const docSet = new Automerge.DocSet();

if (fixture.gltfPath) {
  fetch(`./uploads/${fixture.gltfPath}`)
    .then((response) => (response.json()))
    .then((data) => {
      fixture.gltf = data;
      docSet.setDoc('project', Automerge.from(fixture));
    });
}

const automerge = new Automerge.Connection(docSet, (msg) => {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(msg));
  }
});

ws.addEventListener('message', (e) => {
  automerge.receiveMsg(JSON.parse(e.data));
});

automerge.open();

function changeProjectState(callback: Automerge.ChangeFn<ProjectState>) {
  const currentState = docSet.getDoc('project');
  const newState = Automerge.change(currentState, callback);
  docSet.setDoc('project', newState);
}

const ProjectStateContext = createContext<ProjectState | undefined>(undefined);

interface IProjectStoreProviderProps {
  children: ReactNode,
}

const ProjectStoreProvider: FunctionComponent = (props: IProjectStoreProviderProps) => {
  const { children } = props;
  const [state, setState] = useState({});

  useEffect(() => {
    function handler(docId: string, doc: Automerge.FreezeObject<unknown>) {
      if (docId === 'project') {
        // console.log('NEW DOC!!!', JSON.stringify(doc));
        const newState = doc as ProjectState;
        setState(newState);
      }
    }

    docSet.registerHandler(handler);

    return () => {
      docSet.unregisterHandler(handler);
    };
  }, []);

  return (
    <ProjectStateContext.Provider value={state}>
      {children}
    </ProjectStateContext.Provider>
  );
};

function useProjectState() {
  const context = useContext(ProjectStateContext);

  if (context === undefined) {
    throw new Error('useProjectState must be used within a ProjectStoreProvider');
  }

  return context;
}

export {
  ProjectStoreProvider,
  useProjectState,
  changeProjectState,
  docSet,
};

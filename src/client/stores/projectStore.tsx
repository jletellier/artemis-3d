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
import projectFixture from '../../common/fixtures/projectFixture';

const { location } = window;
const wsUri = `${((location.protocol === 'https:') ? 'wss://' : 'ws://')}${location.host}/api`;
const ws = new WebSocket(wsUri);

const initialDoc: ProjectState = Automerge.from(projectFixture);

const docSet = new Automerge.DocSet();
docSet.setDoc('project', initialDoc);

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

function registerProjectDiffHandler(handler: ((changes: Automerge.Diff[]) => void)) {
  let lastDoc = docSet.getDoc('project');

  const internalHandler: Automerge.DocSetHandler<unknown> = (docId, doc) => {
    if (docId === 'project') {
      const diff = Automerge.diff(lastDoc, doc);
      lastDoc = doc;
      handler(diff);
    }
  };

  docSet.registerHandler(internalHandler);
  return internalHandler;
}

function unregisterProjectDiffHandler(handler: Automerge.DocSetHandler<unknown>) {
  docSet.unregisterHandler(handler);
}

const ProjectStateContext = createContext<ProjectState | undefined>(undefined);

interface IProjectStoreProviderProps {
  children: ReactNode,
}

const ProjectStoreProvider: FunctionComponent = (props: IProjectStoreProviderProps) => {
  const { children } = props;
  const initialState = docSet.getDoc('project') as ProjectState;
  const [state, setState] = useState(initialState);

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
  registerProjectDiffHandler,
  unregisterProjectDiffHandler,
};

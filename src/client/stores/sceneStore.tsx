import * as React from 'react';
import { createContext, useState, useEffect, useContext, FunctionComponent, ReactNode } from 'react';
import * as Automerge from 'automerge';

export type StateVector3IndexType = 'x' | 'y' | 'z';
export type StateVector3Type = { [k in StateVector3IndexType]: number };

export type StateNodeType = {
    name: string;
    mesh: number;
    position: StateVector3Type;
}

export type StateType = {
    nodes: Array<StateNodeType>,
}

const location = window.location;
const wsUri = ((location.protocol === "https:") ? "wss://" : "ws://") + location.host + "/api";
const ws = new WebSocket(wsUri);

const initialState: StateType = Automerge.from({
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

const automerge = new Automerge.Connection(docSet, (msg) => {
    if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(msg));
    }
});

ws.addEventListener('message', (e) => {
    automerge.receiveMsg(JSON.parse(e.data));
});

automerge.open();

function changeSceneState(callback: Automerge.ChangeFn<StateType>) {
    const currentState = docSet.getDoc('scene');
    const newState = Automerge.change(currentState, callback);
    docSet.setDoc('scene', newState);
}

function registerSceneDiffHandler(handler: ((changes: Automerge.Diff[]) => void)) {
    let lastDoc = docSet.getDoc('scene');

    const internalHandler: Automerge.DocSetHandler<unknown> = (docId, doc) => {
        if (docId === 'scene') {
            // const changes = Automerge.getChanges(lastDoc, doc);
            const diff = Automerge.diff(lastDoc, doc);
            lastDoc = doc;
            handler(diff);
        }
    }

    docSet.registerHandler(internalHandler);
    return internalHandler;
}

function unregisterSceneDiffHandler(handler: Automerge.DocSetHandler<unknown>) {
    docSet.unregisterHandler(handler);
}

const SceneStateContext = createContext<StateType | undefined>(undefined);

interface ISceneStoreProviderProps {
    children: ReactNode,
}

const SceneStoreProvider: FunctionComponent<ISceneStoreProviderProps> = ({ children }) => {
    const initialState = docSet.getDoc('scene') as StateType;
    const [state, setState] = useState(initialState);

    console.log('SceneStoreProvider called');

    useEffect(() => {
        function handler(docId: string, doc: Automerge.FreezeObject<unknown>) {
            if (docId === 'scene') {
                console.log('NEW DOC!!!', JSON.stringify(doc));
                const newState = doc as StateType;
                setState(newState);
            }
        }
        
        console.log('SceneStoreProvider AutomergeHandler registered');
        docSet.registerHandler(handler);

        return () => {
            console.log('SceneStoreProvider AutomergeHandler unregistered');
            docSet.unregisterHandler(handler);
        };
    }, [true]);

    return (
        <SceneStateContext.Provider value={state}>
            {children}
        </SceneStateContext.Provider>
    );
};

function useSceneState() {
    const context = useContext(SceneStateContext);

    if (context === undefined) {
        throw new Error('useSceneState must be used within a SceneStoreProvider');
    }

    return context;
}

export { 
    SceneStoreProvider,
    useSceneState,
    changeSceneState,
    registerSceneDiffHandler,
    unregisterSceneDiffHandler,
};

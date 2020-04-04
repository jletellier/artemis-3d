import * as React from 'react';
import { useState } from 'react';
import * as ReactDOM from 'react-dom';
import '@blueprintjs/core/lib/css/blueprint.css'

import { SceneStoreProvider } from './stores/sceneStore';
import BabylonRenderer from './components/BabylonRenderer';
import PropertiesPanel from './components/PropertiesPanel';

const App = () => {
    console.log('App FunctionComponent called');

    return (<>
        <SceneStoreProvider>
            <BabylonRenderer />
            <PropertiesPanel />
        </SceneStoreProvider>
    </>);
};

ReactDOM.render(<App />, document.getElementById('root'));

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@blueprintjs/core/lib/css/blueprint.css';

import { ProjectStoreProvider } from './stores/projectStore';
import { BabylonRenderer } from './components/babylonRenderer';
import { PropertiesPanel } from './components/propertiesPanel';
import { ProjectGraphPanel } from './components/projectGraphPanel';
import { UserStoreProvider } from './stores/userStore';

const App = () => (
  <>
    <ProjectStoreProvider>
      <UserStoreProvider>
        <BabylonRenderer />
        <ProjectGraphPanel />
        <PropertiesPanel />
      </UserStoreProvider>
    </ProjectStoreProvider>
  </>
);

ReactDOM.render(<App />, document.getElementById('root'));

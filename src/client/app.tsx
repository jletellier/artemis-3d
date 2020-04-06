import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '@blueprintjs/core/lib/css/blueprint.css';

import { ProjectStoreProvider } from './stores/projectStore';
import BabylonRenderer from './components/BabylonRenderer';
import PropertiesPanel from './components/PropertiesPanel';
import ProjectGraphPanel from './components/ProjectGraphPanel';

const App = () => (
  <>
    <ProjectStoreProvider>
      <BabylonRenderer />
      <ProjectGraphPanel />
      <PropertiesPanel />
    </ProjectStoreProvider>
  </>
);

ReactDOM.render(<App />, document.getElementById('root'));

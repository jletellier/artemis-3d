import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '@blueprintjs/core/lib/css/blueprint.css';

import { ProjectStoreProvider } from './stores/projectStore';
import BabylonRenderer from './components/BabylonRenderer';
import PropertiesPanel from './components/PropertiesPanel';

const App = () => (
  <>
    <ProjectStoreProvider>
      <BabylonRenderer />
      <PropertiesPanel />
    </ProjectStoreProvider>
  </>
);

ReactDOM.render(<App />, document.getElementById('root'));

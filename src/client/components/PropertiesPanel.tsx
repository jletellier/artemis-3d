import * as React from 'react';
import { FunctionComponent } from 'react';

import { useProjectState } from '../stores/projectStore';
import TransformPropertyGroup from './TransformPropertyGroup';
import { useUserState } from '../stores/userStore';

const PropertiesPanel: FunctionComponent = () => {
  // console.log('PropertiesPanel FunctionComponent called');

  const projectState = useProjectState();
  const userState = useUserState();

  if (userState.selectedNodes.length === 1) {
    const id = userState.selectedNodes[0];
    if (id.startsWith('node_')) {
      const nodeId = +id.substr(5);
      return (<TransformPropertyGroup selectedNode={projectState.nodes[nodeId]} />);
    }
  }

  return <div />;
};

export default PropertiesPanel;

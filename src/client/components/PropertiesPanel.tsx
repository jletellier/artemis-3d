import * as React from 'react';
import { FunctionComponent } from 'react';

import { useProjectState } from '../stores/projectStore';
import { TransformPropertyGroup } from './transformPropertyGroup';
import { useUserState } from '../stores/userStore';

const PropertiesPanel: FunctionComponent = () => {
  // console.log('PropertiesPanel FunctionComponent called');

  const projectState = useProjectState();
  const userState = useUserState();

  if (userState.selectedNodes.length === 1) {
    const id = userState.selectedNodes[0];

    if (id.startsWith('/nodes/')) {
      const nodeId = +id.substr(7);

      return (
        <TransformPropertyGroup
          selectedNodeId={nodeId}
          selectedNode={projectState.gltf.nodes[nodeId]}
        />
      );
    }
  }

  return <div />;
};

export { PropertiesPanel };

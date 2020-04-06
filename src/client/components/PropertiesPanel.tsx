import * as React from 'react';
import { FunctionComponent } from 'react';

import { useProjectState } from '../stores/projectStore';
import TransformPropertyGroup from './TransformPropertyGroup';

const PropertiesPanel: FunctionComponent = () => {
  // console.log('PropertiesPanel FunctionComponent called');

  const projectState = useProjectState();
  const selectedNode = projectState.nodes[0];

  return (<TransformPropertyGroup selectedNode={selectedNode} />);
};

export default PropertiesPanel;

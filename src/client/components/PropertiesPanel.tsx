import * as React from 'react';
import { FunctionComponent } from 'react';

import { useSceneState } from '../stores/sceneStore';
import TransformPropertyGroup from './TransformPropertyGroup';

const PropertiesPanel: FunctionComponent = () => {
  // console.log('PropertiesPanel FunctionComponent called');

  const sceneState = useSceneState();
  const selectedNode = sceneState.nodes[0];

  return (<TransformPropertyGroup selectedNode={selectedNode} />);
};

export default PropertiesPanel;

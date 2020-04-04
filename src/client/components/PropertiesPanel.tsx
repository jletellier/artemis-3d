import * as React from 'react';
import { FunctionComponent, useEffect, useRef } from 'react';

import { useSceneState } from '../stores/sceneStore';
import TransformPropertyGroup from './TransformPropertyGroup';

interface IPropertiesPanelProps {
    // scene: Scene,
}

const PropertiesPanel: FunctionComponent<IPropertiesPanelProps> = () => {
    console.log('PropertiesPanel FunctionComponent called');

    const sceneState = useSceneState();
    const selectedNode = sceneState.nodes[0];

    return (<TransformPropertyGroup selectedNode={selectedNode} />);
}

export default PropertiesPanel;

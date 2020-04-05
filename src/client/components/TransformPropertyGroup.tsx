import * as React from 'react';
import { FunctionComponent } from 'react';

import { changeSceneState, StateNodeType, StateVector3IndexType } from '../stores/sceneStore';
import Vector3Input from './Vector3Input';

interface ITransformPropertyGroupProps {
  selectedNode: StateNodeType,
}

const TransformPropertyGroup: FunctionComponent<ITransformPropertyGroupProps> = (
  props: ITransformPropertyGroupProps,
) => {
  const { selectedNode } = props;
  const { position } = selectedNode;

  function handleChangePosition(field: StateVector3IndexType, newValue: number) {
    changeSceneState((doc) => { /* eslint-disable no-param-reassign */
      doc.nodes[0].position[field] = newValue;
    });
  }

  return (
    <div>
      <Vector3Input value={position} onChange={handleChangePosition} />
    </div>
  );
};

export default TransformPropertyGroup;

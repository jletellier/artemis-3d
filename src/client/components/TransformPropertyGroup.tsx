import * as React from 'react';
import { FunctionComponent } from 'react';

import { changeProjectState } from '../stores/projectStore';
import { NodeState } from '../../common/types/nodeState';
import Vector3Input from './Vector3Input';

interface ITransformPropertyGroupProps {
  selectedNode: NodeState,
}

const TransformPropertyGroup: FunctionComponent<ITransformPropertyGroupProps> = (
  props: ITransformPropertyGroupProps,
) => {
  const { selectedNode } = props;
  const { position } = selectedNode;

  function handleChangePosition(field: number, newValue: number) {
    changeProjectState((doc) => { /* eslint-disable no-param-reassign */
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

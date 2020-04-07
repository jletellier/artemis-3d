import * as React from 'react';
import { FunctionComponent } from 'react';

/* eslint-disable-next-line import/no-unresolved */
import { INode } from 'babylonjs-gltf2interface';

import { changeProjectState } from '../stores/projectStore';
import Vector3Input from './Vector3Input';

interface ITransformPropertyGroupProps {
  selectedNodeId: number,
  selectedNode: INode,
}

const TransformPropertyGroup: FunctionComponent<ITransformPropertyGroupProps> = (
  props: ITransformPropertyGroupProps,
) => {
  const { selectedNodeId, selectedNode } = props;
  const translation = selectedNode.translation ? selectedNode.translation : [0, 0, 0];

  function handleChangePosition(field: number, newValue: number) {
    changeProjectState((state) => { /* eslint-disable no-param-reassign */
      const node = state.gltf.nodes[selectedNodeId];
      if (!node.translation) {
        node.translation = translation;
      }
      node.translation[field] = newValue;
    });
  }

  return (
    <div>
      <Vector3Input value={translation} onChange={handleChangePosition} />
    </div>
  );
};

export default TransformPropertyGroup;

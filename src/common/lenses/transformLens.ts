/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */

import type { INode } from 'babylonjs-gltf2interface';
import type { ILens } from './lenses';

// transform view focuses on the usual transform-related properties
export interface ITransformFocus {
  translation: number[];
  rotation: number[];
}

// The lens retrieves / sets the focussed properties from / of a node
export const transformLens: ILens<INode, ITransformFocus> = {
  // should data be immutable / a deep clone?
  get: (node: INode) => ({
    translation: node.translation,
    rotation: node.rotation,
  }),

  set: (node: INode, focus: ITransformFocus) => {
    node.translation[0] = focus.translation[0];
    node.translation[1] = focus.translation[1];
    node.translation[2] = focus.translation[2];
    node.rotation[0] = focus.rotation[0];
    node.rotation[1] = focus.rotation[1];
    node.rotation[2] = focus.rotation[2];
    node.rotation[3] = focus.rotation[3];
  },
};

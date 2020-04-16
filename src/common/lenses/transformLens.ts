/* eslint-disable no-param-reassign */

import type { INode } from 'babylonjs-gltf2interface';
import type { ILens } from './lenses';

const DEFAULT_TRANSLATION = [0, 0, 0];
const DEFAULT_ROTATION = [0, 0, 0, 1];

// transform view focuses on the usual transform-related properties
export interface ITransformFocus {
  translation: number[];
  rotation: number[];
}

// The lens retrieves / sets the focussed properties from / of a node
export const transformLens: ILens<INode, ITransformFocus> = {
  // should data be immutable / a deep clone?
  get: (node: INode) => ({
    translation: node.translation || DEFAULT_TRANSLATION,
    rotation: node.rotation || DEFAULT_ROTATION,
  }),

  set: (node: INode, focus: ITransformFocus) => {
    if (!node.translation) {
      node.translation = DEFAULT_TRANSLATION;
    }
    for (let i = 0; i < 3; i += 1) {
      node.translation[i] = focus.translation[i];
    }

    if (!node.rotation) {
      node.rotation = DEFAULT_ROTATION;
    }
    for (let i = 0; i < 4; i += 1) {
      node.rotation[i] = focus.rotation[i];
    }
  },
};

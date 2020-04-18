/* eslint-disable no-param-reassign */

import type { INode } from 'babylonjs-gltf2interface';
import type { ILens } from './lenses';

export const DEFAULT_TRANSLATION = [0, 0, 0];
export const DEFAULT_ROTATION = [0, 0, 0, 1];
export const DEFAULT_SCALE = [1, 1, 1];

// transform view focuses on the usual transform-related properties
export interface ITransformFocus {
  translation?: number[];
  rotation?: number[];
  scale?: number[];
}

// The lens retrieves / sets the focussed properties from / of a node
export const transformLens: ILens<INode, ITransformFocus> = {
  // should data be immutable / a deep clone?
  get: (node: INode) => {
    const focus: ITransformFocus = {};
    if (node.translation) focus.translation = node.translation;
    if (node.rotation) focus.rotation = node.rotation;
    if (node.scale) focus.scale = node.scale;
    return focus;
  },

  set: (node: INode, focus: ITransformFocus) => {
    // translation
    if (focus.translation) {
      if (!node.translation) {
        node.translation = [];
      }

      for (let i = 0; i < 3; i += 1) {
        node.translation[i] = focus.translation[i];
      }
    }

    // rotation
    if (focus.rotation) {
      if (!node.rotation) { node.rotation = []; }

      for (let i = 0; i < 4; i += 1) {
        node.rotation[i] = focus.rotation[i];
      }
    }

    // scale
    if (focus.scale) {
      if (!node.scale) { node.scale = [1, 2, 3]; }

      for (let i = 0; i < 3; i += 1) {
        node.scale[i] = focus.scale[i];
      }
    }
  },
};

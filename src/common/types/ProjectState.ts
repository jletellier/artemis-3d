// TODO: Fix this in .eslintrc.json
/* eslint-disable-next-line import/no-unresolved */
import { IGLTF } from 'babylonjs-gltf2interface';

export type ProjectState = {
  gltf?: IGLTF;
  gltfPath?: string;
};

import { SceneState } from './sceneState';
import { NodeState } from './nodeState';

export type ProjectState = {
  scene: number,
  scenes: Array<SceneState>,
  nodes: Array<NodeState>,
};

export type ProjectState = {
  scene: number,
  scenes: Array<SceneState>,
  nodes: Array<NodeState>,
};

export type SceneState = {
  name: string;
  nodes: Array<number>;
};

export type NodeState = {
  name: string;
  mesh: number;
  position?: Vector3State;
  children?: Array<number>;
};

export type Vector3IndexState = 'x' | 'y' | 'z';
export type Vector3State = { [k in Vector3IndexState]: number };

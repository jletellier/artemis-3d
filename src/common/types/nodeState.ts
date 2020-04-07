import { Vector3State } from './vector3State';

export type NodeState = {
  name: string;
  mesh?: number;
  position?: Vector3State;
  children?: Array<number>;
};

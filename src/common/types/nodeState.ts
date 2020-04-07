import { Vector3State } from './vector3State';

export type NodeState = {
  name: string;
  mesh?: number;
  translation?: Vector3State;
  children?: Array<number>;
};

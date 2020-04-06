import { ProjectState } from '../stores/stateTypes';

const fixture: ProjectState = {
  scene: 0,
  scenes: [
    {
      name: 'Scene',
      nodes: [0],
    },
  ],
  nodes: [
    {
      name: 'sphere1',
      mesh: 0,
      position: { x: 2.8, y: 0.4, z: -0.2 },
    },
  ],
};

export default fixture;

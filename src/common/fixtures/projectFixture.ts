import { ProjectState } from '../types/projectState';

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
      position: [2.8, 0.4, -0.2],
    },
  ],
};

export default fixture;

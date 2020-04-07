import { ProjectState } from '../types/projectState';

const fixture: ProjectState = {
  scene: 0,
  scenes: [
    {
      name: 'Scene',
      nodes: [1, 3, 8],
    },
  ],
  nodes: [
    {
      name: 'Light_Orientation',
      // rotation: [
      //   -0.7071067690849304,
      //   0,
      //   0,
      //   0.7071067690849304,
      // ],
    },
    {
      children: [0],
      name: 'Light',
      // rotation: [
      //   0.16907575726509094,
      //   0.7558803558349609,
      //   -0.27217137813568115,
      //   0.570947527885437
      // ],
      // translation: [
      //   4.076245307922363,
      //   5.903861999511719,
      //   -1.0054539442062378,
      // ],
    },
    {
      // camera: 0,
      name: 'Camera_Orientation',
      // rotation: [
      //   -0.7071067690849304,
      //   0,
      //   0,
      //   0.7071067690849304,
      // ],
    },
    {
      children: [2],
      name: 'Camera',
      // rotation: [
      //   0.483536034822464,
      //   0.33687159419059753,
      //   -0.20870360732078552,
      //   0.7804827094078064,
      // ],
      // translation: [
      //   10.24889087677002,
      //   6.438309192657471,
      //   8.8757905960083,
      // ],
    },
    {
      mesh: 0,
      name: 'Cube',
      // rotation: [
      //   0,
      //   0.3583679497241974,
      //   0,
      //   0.9335803985595703,
      // ],
      // translation: [
      //   0,
      //   1,
      //   0,
      // ],
    },
    {
      mesh: 1,
      name: 'Icosphere',
      // translation: [
      //   0.07999992370605469,
      //   0.7999999523162842,
      //   0,
      // ],
    },
    {
      children: [5],
      mesh: 2,
      name: 'IntermediatePlane',
      // translation: [
      //   3.0299999713897705,
      //   1.5,
      //   0,
      // ],
    },
    {
      mesh: 3,
      name: 'Plane',
      // scale: [
      //   5,
      //   1,
      //   3,
      // ],
    },
    {
      children: [4, 6, 7],
      name: 'SceneItems',
    },
  ],
};

export default fixture;

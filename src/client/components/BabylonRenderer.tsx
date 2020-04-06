import * as React from 'react';
import { FunctionComponent, useEffect, useRef } from 'react';
import * as Automerge from 'automerge';

import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import '@babylonjs/core/Meshes/meshBuilder';
import '@babylonjs/core/Materials/standardMaterial';
// import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";

import { registerProjectDiffHandler, unregisterProjectDiffHandler } from '../stores/projectStore';

function createEmptyScene(canvas: HTMLCanvasElement, engine: Engine) {
  const scene = new Scene(engine);
  const camera = new FreeCamera('camera1', new Vector3(0, 5, -10), scene);
  camera.setTarget(Vector3.Zero());
  camera.attachControl(canvas, false);
  // TODO: Delete this line in the next version (it won't be needed)
  // eslint-disable-next-line no-new
  new HemisphericLight('light1', new Vector3(0, 1, 0), scene);
  const sphere = Mesh.CreateSphere('sphere1', 16, 2, scene, false, Mesh.FRONTSIDE);
  sphere.id = '0';
  sphere.position.y = 1;
  Mesh.CreateGround('ground1', 6, 6, 2, scene, false);

  // scene.debugLayer.show();
  return scene;
}

const BabylonRenderer: FunctionComponent = () => {
  const elCanvas = useRef(null);

  // console.log('BabylonRenderer FunctionComponent called');

  useEffect(() => {
    const engine = new Engine(elCanvas.current, true);
    const currentScene = createEmptyScene(elCanvas.current, engine);

    function handleWindowResize() {
      engine.resize();
    }

    function renderLoop() {
      currentScene.render();
    }

    function handleDocChange(changes: Automerge.Diff[]) {
      // console.log('DOC CHANGES!!!', changes);
      changes.forEach((value) => {
        if (value.path && value.path.length === 3 && value.path[0] === 'nodes') {
          const babylonNode = currentScene.getNodeByID((value.path[1]).toString());
          if (value.path[2] === 'position') {
            const babylonTransformNode = babylonNode as TransformNode;
            const fieldValue = +value.value;
            babylonTransformNode.position.set(
              value.key === 'x' ? fieldValue : babylonTransformNode.position.x,
              value.key === 'y' ? fieldValue : babylonTransformNode.position.y,
              value.key === 'z' ? fieldValue : babylonTransformNode.position.z,
            );
          }
        }
      });
    }

    // console.log('BabylonRenderer renderLoop registered');

    window.addEventListener('resize', handleWindowResize);
    engine.runRenderLoop(renderLoop);
    const projectDiffHandler = registerProjectDiffHandler(handleDocChange);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      engine.stopRenderLoop(renderLoop);
      unregisterProjectDiffHandler(projectDiffHandler);

      // console.log('BabylonRenderer renderLoop unregistered');
    };
  });

  return <canvas ref={elCanvas} />;
};

export default BabylonRenderer;

import * as React from 'react';
import { FunctionComponent, useEffect, useRef } from 'react';
import * as Automerge from 'automerge';

import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/core/Loading/Plugins/babylonFileLoader';
import '@babylonjs/core/Loading/loadingScreen';
import '@babylonjs/core/Meshes/meshBuilder';
import '@babylonjs/core/Materials/standardMaterial';
import '@babylonjs/loaders/glTF/2.0/glTFLoader';
import '@babylonjs/loaders/glTF/2.0/Extensions/KHR_lights_punctual';
// import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";

import { docSet } from '../stores/projectStore';
import { ProjectState } from '../../common/types/ProjectState';

function createEmptyScene(canvas: HTMLCanvasElement, engine: Engine) {
  const scene = new Scene(engine);
  scene.useRightHandedSystem = true;
  const camera = new FreeCamera('EditorCamera', new Vector3(0, 5, 10), scene);
  camera.setTarget(Vector3.Zero());
  camera.attachControl(canvas, false);

  // scene.debugLayer.show();
  return scene;
}

const BabylonRenderer: FunctionComponent = () => {
  const elCanvas = useRef(null);

  useEffect(() => {
    const engine = new Engine(elCanvas.current, true);
    const currentScene = createEmptyScene(elCanvas.current, engine);

    let lastDoc = docSet.getDoc('project') as ProjectState;

    function handleWindowResize() {
      engine.resize();
    }

    function renderLoop() {
      currentScene.render();
    }

    function handleDocInit(doc: ProjectState) {
      SceneLoader.Append('./uploads/', `data:${JSON.stringify(doc.gltf)}`, currentScene, () => {
        currentScene.getNodes().forEach((node) => { /* eslint-disable no-param-reassign */
          if (node.metadata && node.metadata.gltf && node.metadata.gltf.pointers) {
            const pointers = node.metadata.gltf.pointers as Array<string>;
            const nodeId = pointers.find((value) => value.startsWith('/nodes/'));
            node.id = nodeId;
          }
        });
      });
    }

    function handleDocChange(changes: Automerge.Diff[]) {
      changes.forEach((value) => {
        if (value.path
          && value.path.length === 4
          && value.path[0] === 'gltf'
          && value.path[1] === 'nodes') {
          const nodeId = `/nodes/${value.path[2]}`;
          const babylonNode = currentScene.getNodeByID(nodeId);
          if (value.path[3] === 'translation') {
            const babylonTransformNode = babylonNode as TransformNode;
            const fieldValue = +value.value;
            babylonTransformNode.position.set(
              value.index === 0 ? fieldValue : babylonTransformNode.position.x,
              value.index === 1 ? fieldValue : babylonTransformNode.position.y,
              value.index === 2 ? fieldValue : babylonTransformNode.position.z,
            );
          }
        }
      });
    }

    const docSetHandler: Automerge.DocSetHandler<unknown> = (docId, doc) => {
      if (docId === 'project') {
        if (!lastDoc) {
          handleDocInit(doc);
          lastDoc = doc;
        } else {
          const diff = Automerge.diff(lastDoc, doc);
          handleDocChange(diff);
          lastDoc = doc;
        }
      }
    };

    window.addEventListener('resize', handleWindowResize);
    engine.runRenderLoop(renderLoop);
    docSet.registerHandler(docSetHandler);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      engine.stopRenderLoop(renderLoop);
      docSet.unregisterHandler(docSetHandler);
    };
  });

  return <canvas ref={elCanvas} />;
};

export { BabylonRenderer };

import * as React from 'react';
import { FunctionComponent, useEffect, useRef } from 'react';
import * as Automerge from 'automerge';

import { registerSceneDiffHandler, unregisterSceneDiffHandler } from '../stores/sceneStore';

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

interface IBabylonRendererProps {
    
}

function createEmptyScene(canvas: HTMLCanvasElement, engine: Engine) {
    // Create a basic BJS Scene object
    let scene = new Scene(engine);
    // Create a FreeCamera, and set its position to {x: 0, y: 5, z: -10}
    let camera = new FreeCamera('camera1', new Vector3(0, 5, -10), scene);
    // Target the camera to scene origin
    camera.setTarget(Vector3.Zero());
    // Attach the camera to the canvas
    camera.attachControl(canvas, false);
    // Create a basic light, aiming 0, 1, 0 - meaning, to the sky
    let light = new HemisphericLight('light1', new Vector3(0, 1, 0), scene);
    // Create a built-in "sphere" shape; its constructor takes 6 params: name, segment, diameter, scene, updatable, sideOrientation
    let sphere = Mesh.CreateSphere('sphere1', 16, 2, scene, false, Mesh.FRONTSIDE);
    sphere.id = '0';
    // Move the sphere upward 1/2 of its height
    sphere.position.y = 1;
    // Create a built-in "ground" shape; its constructor takes 6 params : name, width, height, subdivision, scene, updatable
    let ground = Mesh.CreateGround('ground1', 6, 6, 2, scene, false);

    // scene.debugLayer.show();
    return scene;
}

const BabylonRenderer: FunctionComponent<IBabylonRendererProps> = (props) => {
    const elCanvas = useRef(null);

    console.log('BabylonRenderer FunctionComponent called');

    useEffect(() => {
        const engine = new Engine(elCanvas.current, true);
        let currentScene = createEmptyScene(elCanvas.current, engine);
        
        function handleWindowResize() {
            engine.resize();
        }

        function renderLoop() {
            currentScene.render();
        }

        function handleDocChange(changes: Automerge.Diff[]) {
            console.log('DOC CHANGES!!!', changes);
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

        console.log('BabylonRenderer renderLoop registered');

        window.addEventListener('resize', handleWindowResize);
        engine.runRenderLoop(renderLoop);
        const sceneDiffHandler = registerSceneDiffHandler(handleDocChange);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
            engine.stopRenderLoop(renderLoop);
            unregisterSceneDiffHandler(sceneDiffHandler);

            console.log('BabylonRenderer renderLoop unregistered');
        };
    });

    return <canvas ref={elCanvas}></canvas>;
}

export default BabylonRenderer;

import { Mesh, StandardMaterial, Texture, Scene, Vector3, Quaternion, Matrix,
    TransformNode, AbstractMesh } from '@babylonjs/core';
import ScriptBehavior from './ScriptBehavior';
import project from './data/project';

export default class ImageMarkerScript extends ScriptBehavior {

    private scene: Scene;
    private xrSession: XRSession;
    private rootTransform: TransformNode;
    private contentChildren: AbstractMesh[];
    private markerMesh: Mesh;
    private anchorOffset: XRAnchorOffset;

    private boundRegisterImageDetection: () => void;
    private boundActivateImageDetection: () => void;
    private boundHandleImageDetection: () => void;

    onAwake(): void {
        this.scene = this.target.getScene();
        this.rootTransform = <TransformNode>this.target;

        this.contentChildren = this.target.getChildMeshes(true);
        this.setContentEnabled(false);

        this.markerMesh = <Mesh>this.target;
        this.markerMesh.visibility = 0;

        this.boundRegisterImageDetection = this.registerImageDetection.bind(this);
        this.boundActivateImageDetection = this.activateImageDetection.bind(this);
        this.boundHandleImageDetection = this.handleImageDetection.bind(this);
        this.scene.registerBeforeRender(this.boundRegisterImageDetection);
    }

    private registerImageDetection(): void {
        this.scene.unregisterBeforeRender(this.boundRegisterImageDetection);

        this.xrSession = this.scene.xrSession;
        if (this.xrSession) {
            // this.xrSession.addEventListener(
            //     'remove-world-anchor',
            //     this.handleRemoveWorldAnchor.bind(this),
            // );

            this.rootTransform = new TransformNode(`${this.target.name}Root`, this.scene);
            this.markerMesh.parent = this.rootTransform;

            const material = <StandardMaterial>this.markerMesh.material;
            const texture = <Texture>material.diffuseTexture;
            
            // Temporary-fix for WebGL 1.0
            project._loadFileAsync(texture.name).then((file: Blob) => {
                const img = document.createElement('img');
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    const imgData = ctx.getImageData(0, 0, img.width, img.height);

                    // TODO: Find better solution to figure out real-world size of marker plane
                    const realWorldWidth = this.markerMesh.scaling.x;

                    this.xrSession.createImageAnchor(
                        this.target.name, imgData.data,
                        imgData.width, imgData.height, realWorldWidth,
                    ).then(this.boundActivateImageDetection);
                };
                img.src = window.URL.createObjectURL(file);
            });

            // const size = texture.getSize();
            // const buffer = texture.readPixels().buffer;
            // const imgData = new Uint8ClampedArray(buffer);

            // TODO: Find better solution to figure out real-world size of marker plane
            // const realWorldWidth = this.markerMesh.scaling.x;

            // this.xrSession.createImageAnchor(
            //     this.target.name, imgData, size.width, size.height, realWorldWidth,
            // ).then(this.activateImageDetection.bind(this));
        } else {
            this.setContentEnabled(true);
            this.markerMesh.visibility = 1;
        }
    }

    private setContentEnabled(value: boolean, updateBehaviors: boolean = false): void {
        this.contentChildren.forEach((child) => {
            child.setEnabled(value);
            if (updateBehaviors) {
                // TODO: This should be done automatically
                // const behavior = <ScriptBehavior>child.getBehaviorByName('SingleMarkerContent');
                // behavior.enabled = value;
            }
        });
    }
    
    private activateImageDetection(): void {
        this.xrSession.activateDetectionImage(this.target.name)
            .then(this.boundHandleImageDetection);
    }

    // private handleRemoveWorldAnchor(event: CustomEvent): void {
    //     let anchor = event.detail;

    //     this.debugLog(`Removed anchor ${anchor.uid}`);

    //     if (anchor instanceof XRImageAnchor) {
    //         this.anchorOffset = null;
    //     }
    // }

    private handleImageDetection(imageAnchorTransform: Float32Array): void {
        project.remoteLog(`handle image: ${this.target.name}`);

        const transformMatrix = new Matrix();
        Matrix.FromFloat32ArrayToRefScaled(imageAnchorTransform, 0, 1, transformMatrix);

        if (!this.scene.useRightHandedSystem) {
            transformMatrix.toggleModelMatrixHandInPlace();
        }

        this.updateRootTransform(transformMatrix);
        this.setContentEnabled(true);

        // Activate this to have experimental marker tracking
        // this.boundActivateImageDetection();
    }

    private updateRootTransform(transformMatrix: Matrix): void {
        const tempPos = new Vector3();
        const tempQuat = new Quaternion();
        const tempScale = new Vector3();
        transformMatrix.decompose(tempScale, tempQuat, tempPos);

        this.rootTransform.position = tempPos;
        this.rootTransform.rotationQuaternion = tempQuat;
        this.rootTransform.scaling = tempScale;

        const frame = this.scene.xrCurrentFrame;
        const headCoordinateSystem = frame.getCoordinateSystem('tracker');
        const anchorUID = frame.addAnchor(
            headCoordinateSystem,
            [tempPos.x, tempPos.y, tempPos.z],
            [tempQuat.x, tempQuat.y, tempQuat.z, tempQuat.w],
        );

        this.anchorOffset = new XRAnchorOffset(anchorUID);
    }

    public onUpdate(): void {
        if (this.anchorOffset) {
            const frame = this.scene.xrCurrentFrame;

            const anchor = frame.getAnchor(this.anchorOffset.anchorUID);
            const offsetTransform = this.anchorOffset.getOffsetTransform(anchor.coordinateSystem);

            const transformMatrix = new Matrix();
            Matrix.FromFloat32ArrayToRefScaled(offsetTransform, 0, 1, transformMatrix);
            const tempPos = new Vector3();
            const tempQuat = new Quaternion();
            const tempScale = new Vector3();
            transformMatrix.decompose(tempScale, tempQuat, tempPos);

            this.rootTransform.position = tempPos;
            this.rootTransform.rotationQuaternion = tempQuat;
            this.rootTransform.scaling = tempScale;
        }
    }

}

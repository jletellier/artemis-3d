import { Mesh, StandardMaterial, Texture, Scene, Vector3, Quaternion, Matrix,
    TransformNode, AbstractMesh } from 'babylonjs';
import ScriptBehavior from './ScriptBehavior';

export default class ImageMarkerScript extends ScriptBehavior {

    private scene: Scene;
    private xrSession: XRSession;
    private rootTransform: TransformNode;
    private contentChildren: AbstractMesh[];
    private markerMesh: Mesh;
    private anchorOffset: XRAnchorOffset;

    private boundRegisterImageDetection: () => void;

    onAwake(): void {
        this.scene = this.target.getScene();
        this.rootTransform = <TransformNode>this.target;

        this.contentChildren = this.target.getChildMeshes(true);
        this.setContentEnabled(false);

        this.markerMesh = <Mesh>this.target;
        this.markerMesh.visibility = 0;

        console.log(`Real world size ${ this.markerMesh.getBoundingInfo().maximum.x * 2 }`);

        this.boundRegisterImageDetection = this.registerImageDetection.bind(this);
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

            const material = <StandardMaterial>this.markerMesh.material;
            const texture = <Texture>material.diffuseTexture;
            const size = texture.getSize();
            const buffer = texture.readPixels().buffer;
            const imgData = new Uint8ClampedArray(buffer);

            // TODO: Find better solution to figure out real-world size of marker plane
            const realWorldWidth = this.markerMesh.getBoundingInfo().maximum.x * 2;

            this.xrSession.createImageAnchor(
                this.target.name, imgData, size.width, size.height, realWorldWidth,
            ).then(this.activateImageDetection.bind(this));
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
                const behavior = <ScriptBehavior>child.getBehaviorByName('SingleMarkerContent');
                behavior.enabled = value;
            }
        });
    }
    
    private activateImageDetection(): void {
        this.xrSession.activateDetectionImage(this.target.name)
            .then(this.handleImageDetection.bind(this));
    }

    // private handleRemoveWorldAnchor(event: CustomEvent): void {
    //     let anchor = event.detail;

    //     this.debugLog(`Removed anchor ${anchor.uid}`);

    //     if (anchor instanceof XRImageAnchor) {
    //         this.anchorOffset = null;
    //     }
    // }

    private handleImageDetection(imageAnchorTransform: Float32Array): void {
        const transformMatrix = new Matrix();
        Matrix.FromFloat32ArrayToRefScaled(imageAnchorTransform, 0, 1, transformMatrix);

        if (!this.scene.useRightHandedSystem) {
            transformMatrix.toggleModelMatrixHandInPlace();
        }

        this.updateRootTransform(transformMatrix);
        this.setContentEnabled(true, true);

        this.activateImageDetection();
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

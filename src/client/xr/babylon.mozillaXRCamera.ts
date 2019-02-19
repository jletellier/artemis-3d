import { Camera, FreeCamera, Matrix, Quaternion, Scene, TargetCamera,
    Vector3 } from '@babylonjs/core';

export class MozillaXRCamera extends FreeCamera {

    private static _TmpMatrix = new Matrix();

    constructor(name: string, scene: Scene) {
        super(name, Vector3.Zero(), scene);

        // Initial camera configuration
        this.minZ = 0;
        this.rotationQuaternion = new Quaternion();
        this.cameraRigMode = Camera.RIG_MODE_CUSTOM;
        this.updateUpVectorFromRotation = true;
        
        // Update camera rig
        const newCamera = new TargetCamera('targetCameraView', Vector3.Zero(), this.getScene());
        newCamera.minZ = 0;
        newCamera.parent = this;
        newCamera.rotationQuaternion = new Quaternion();
        newCamera.updateUpVectorFromRotation = true;
        this.rigCameras.push(newCamera);
    }

    public updateFromXRFrame(frame: XRFrame) {
        const headPose = frame.getDisplayPose(frame.getCoordinateSystem('headModel'));

        // Update the parent cameras matrix
        Matrix.FromFloat32ArrayToRefScaled(
            headPose.poseModelMatrix, 0, 1, MozillaXRCamera._TmpMatrix,
        );
        if (!this._scene.useRightHandedSystem) {
            MozillaXRCamera._TmpMatrix.toggleModelMatrixHandInPlace();
        }
        MozillaXRCamera._TmpMatrix.getTranslationToRef(this.position);
        MozillaXRCamera._TmpMatrix.getRotationMatrixToRef(MozillaXRCamera._TmpMatrix);
        Quaternion.FromRotationMatrixToRef(MozillaXRCamera._TmpMatrix, this.rotationQuaternion);
        this.computeWorldMatrix();

        // Update camera rig
        if (frame.views.length) {
            const view = frame.views[0];

            Matrix.FromFloat32ArrayToRefScaled(
                    view.viewMatrix, 0, 1, this.rigCameras[0]._computedViewMatrix);
            Matrix.FromFloat32ArrayToRefScaled(
                    view.projectionMatrix, 0, 1, this.rigCameras[0]._projectionMatrix);

            if (!this._scene.useRightHandedSystem) {
                this.rigCameras[0]._computedViewMatrix.toggleModelMatrixHandInPlace();
                this.rigCameras[0]._projectionMatrix.toggleProjectionMatrixHandInPlace();
            }
        }
    }

}

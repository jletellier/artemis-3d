interface Window {
    XRSession: XRSession;
    XRDisplay: XRDisplay;
    webkit: any;
}

interface Navigator {
    XR: XRPolyfill;
}

interface XRPolyfill {
    getDisplays(): Promise<XRDisplay[]>;
}

interface XRDisplay {
    supportsSession(arg0: XRSessionCreateParametersInit): boolean;
    requestSession(arg0: XRSessionCreateParametersInit): Promise<XRSession>;
}

interface XRSessionCreateParametersInit {

}

interface XRSession {
    depthNear: number;
    depthFar: number;
    requestFrame(handleFrame: Function): void;
    createImageAnchor(uid: string, buffer: ArrayBuffer, width: number, height: number, 
            physicalWidthInMeters: number): Promise<void>;
    activateDetectionImage(uid: string): Promise<Float32Array>;
}

interface XRFrame {
    getDisplayPose(coordinateSystem: XRCoordinateSystem): XRViewPose;
    getCoordinateSystem: Function;
    addAnchor: Function;
    getAnchor: Function;
}

interface XRCoordinateSystem {

}

declare class XRAnchorOffset {
    constructor(anchorUid: any);
    anchorUID: any;
    getOffsetTransform: Function;
}

declare class XRImageAnchor {

}

interface XRViewPose {
    poseModelMatrix: Float32Array;
    getViewMatrix: Function;
}

interface XRView {
    viewMatrix: Float32Array;
    getViewport: Function;
}

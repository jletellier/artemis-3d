import { Scene } from '@babylonjs/core';

declare module '@babylonjs/core/scene' {
    interface Scene {
        xrSession: XRSession;
        xrCurrentFrame: XRFrame;
    }
}

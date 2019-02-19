import {
    ArcRotateCamera, Color3, Color4, Engine, HemisphericLight, Matrix, Scene, Vector3,
} from '@babylonjs/core';
import { MozillaXRCamera } from './babylon.mozillaXRCamera';

export default class MozillaXRBase {

    public canvas: HTMLCanvasElement;
    public engine: Engine;
    public scene: Scene;

    private _xrCamera: MozillaXRCamera;
    private _boundHandleFrame: Function;
    private _xrDisplays: XRDisplay[];
    private _xrDisplay: XRDisplay;
    private _xrSession: XRSession;
    private _xrSupported: boolean;
    private _xrCurrentFrame: XRFrame;

    get xrSupported() {
        return this._xrSupported;
    }

    constructor(canvasElement: HTMLCanvasElement) {
        this._xrSupported = true;

        // Create canvas and engine.
        this.canvas = canvasElement;
        this.engine = new Engine(this.canvas, true);

        this._boundHandleFrame = this._handleFrame.bind(this);

        this.scene = new Scene(this.engine);
        const camera = new ArcRotateCamera(
            'Camera', 3 * Math.PI / 2, Math.PI / 4, 0.5, Vector3.Zero(), this.scene,
        );
        camera.maxZ = 10;
        camera.minZ = 0.01;
        camera.attachControl(this.canvas, true);

        const light = new HemisphericLight('hemiLight', new Vector3(-1, 1, 0), this.scene);
        light.diffuse = new Color3(1, 1, 1);

        // The canvas/window resize event handler.
        window.addEventListener('resize', () => {
            this.engine.resize();
        });

        if (typeof navigator.XR === 'undefined') {
            this._debugLog('No WebXR API found, usually because the WebXR polyfill has not loaded');
            this._xrSupported = false;
        }

        if (this._xrSupported && typeof window.webkit === 'undefined') {
            this._debugLog('No experimental ARKit support!');
            this._xrSupported = false;
        }
    }

    public startRendering() {
        if (!this._xrSupported) {
            this.engine.runRenderLoop(() => {
                this.scene.render();
            });

            return;
        }

        this.initXR();
    }

    initXR(): void {
        this._initXRScene();

        // Get displays and then request a session
        navigator.XR.getDisplays().then((displays) => {
            if (!displays.length) {
                this._debugLog('No displays are available');
                return;
            }

            this._xrDisplays = displays;
            this._startSession();
        }).catch((err) => {
            this._debugLog('Could not get XR displays');
        });
    }

    _initXRScene(): void {
        this.scene.autoClear = false;
        this.scene.clearColor = new Color4(0, 0, 0, 0);

        this._xrCamera = new MozillaXRCamera('xrCamera1', this.scene);
        this.scene.activeCamera = this._xrCamera;
    }

    _debugLog(msg: string): void {
        // document.getElementById('debug').textContent = msg;
    }

    _startSession() {
        const sessionInitParameters: XRSessionCreateParametersInit = {
            exclusive: false,
            type: 'augmentation',
            videoFrames: false,
            alignEUS: false,
            worldSensing: true,
        };

        for (const display of this._xrDisplays) {
            if (display.supportsSession(sessionInitParameters)) {
                this._xrDisplay = display;
                break;
            }
        }

        if (!this._xrDisplay) {
            this._debugLog('Could not find a display for this type of session');
            return;
        }

        this._xrDisplay.requestSession(sessionInitParameters).then((session) => {
            this._xrSession = session;
            this.scene.xrSession = session;
            this._startPresenting();
        }).catch((err) => {
            this._debugLog('Could not initiate the session');
        });
    }

    _startPresenting(): void {
        if (!this._xrSession) {
            this._debugLog('Can not start presenting without a session');
            return;
        }

        // Set the session's base layer into which the app will render
        this._xrSession.baseLayer = new XRWebGLLayer(this._xrSession, this.engine._gl);

        this._xrSession.requestFrame(this._boundHandleFrame);
        this.initXRSession();
    }

    initXRSession(): void { }

    _handleFrame(frame: XRFrame): void {
        this._xrCurrentFrame = frame;
        this.scene.xrCurrentFrame = frame;
        this._xrSession.requestFrame(this._boundHandleFrame);

        if (frame.views.length !== 1) {
            this._debugLog('More or less than one view available');
        }

        this._xrCamera.updateFromXRFrame(frame);
        this.scene.render();
    }

    async createImageAnchor(
        uid: string, buffer: ArrayBuffer, width: number, height: number,
        physicalWidthInMeters: number): Promise<void> {
        // let request = new Request(`/${ name }.png`);
        // let response = await fetch(request);
        // let buffer = await response.arrayBuffer();

        // let canvas = document.createElement('canvas');
        // let context = canvas.getContext('2d');
        // let img = document.createElement('img');
        // img.src = `/${ name }.png`;

        // await new Promise((resolve) => {
        // 	img.addEventListener('load', resolve, { once: true });
        // });

        // canvas.width = img.width;
        // canvas.height = img.height;
        // context.drawImage(img, 0, 0);
        // let imgData = context.getImageData(0, 0, img.width, img.height);

        // return this._xrSession.createImageAnchor(name, imgData.data, imgData.width,
        // 		imgData.height, 0.135);

        return this._xrSession.createImageAnchor(uid, buffer, width, height, physicalWidthInMeters);
    }

    activateDetectionImage(name: string): Promise<Matrix> {
        return this._xrSession.activateDetectionImage(name).then((imageAnchorTransform) => {
            const headCoordinateSystem = this._xrCurrentFrame.getCoordinateSystem('tracker');

            const transformMatrix = new Matrix();
            Matrix.FromFloat32ArrayToRefScaled(imageAnchorTransform, 0, 1, transformMatrix);
            if (!this.scene.useRightHandedSystem) {
                transformMatrix.toggleModelMatrixHandInPlace();
            }

            return Promise.resolve(transformMatrix);
        });
    }

}

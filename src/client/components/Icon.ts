import { LitElement, customElement, html, css, property } from 'lit-element';

@customElement('smaat-icon')
class Icon extends LitElement {

    static readonly _svgRefWidth = 602;
    static readonly _svgRefHeight = 640;
    static readonly _svgRefMinX = 3;
    static readonly _svgRefMaxX = 53;
    static readonly _svgRefMinY = 3;
    static readonly _svgRefMaxY = 8;
    static readonly _svgRefIconMinX = 2;
    static readonly _svgRefIconMaxX = 2;
    static readonly _svgRefIconMinY = 2;
    static readonly _svgRefIconMaxY = 2;
    static readonly _svgRefIconSpaceX = 1;
    static readonly _svgRefIconSpaceY = 1;
    static readonly _svgRefPartSize = 16;
    static readonly _svgPartsX = 26;
    static readonly _svgPartsY = 30;
    static _codedPosMap: Map<Icon.Type, string>;
    static _currentPixelRatio: number;

    static _svgCanvas: HTMLCanvasElement = null;
    static _svgImage: HTMLImageElement = null;
    static _svgImageLoaded: boolean = false;

    _devicePixelRatio: number;
    _boundHandleResize = this._handleResize.bind(this);

    @property({ type: Number })
    type: Icon.Type;

    static styles = css`
        canvas {
            display: block;
            width: 16px;
            height: 16px;
        }
    `;

    constructor() {
        super();

        if (!Icon._codedPosMap) {
            Icon._codedPosMap = new Map<Icon.Type, string>([
                [Icon.Type.NewFile, '0,29'], // DA,1
                [Icon.Type.NewFile, '20,2'], // C,21
                [Icon.Type.Share, '3,2'], // C,4
                [Icon.Type.Plus, '20,10'], // K,21
            ]);
        }
    }

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('resize', this._boundHandleResize);
    }

    disconnectedCallback() {
        window.removeEventListener('resize', this._boundHandleResize);
        super.disconnectedCallback();
    }

    _updateDevicePixelRatio() {
        this._devicePixelRatio = Math.ceil(window.devicePixelRatio);
    }

    _handleResize() {
        if (window.devicePixelRatio !== this._devicePixelRatio) {
            this._updateDevicePixelRatio();
            this._draw();
        }
    }

    render() {
        return html`<canvas></canvas>`;
    }

    firstUpdated() {
        this._updateDevicePixelRatio();
    }

    updated() {
        this._draw();
    }

    _draw() {
        if (this.type) {
            const canvas = this.shadowRoot.querySelector('canvas');
            const partSize = Icon._svgRefPartSize * this._devicePixelRatio;
            canvas.width = partSize;
            canvas.height = partSize;
            const ctx = canvas.getContext('2d');

            Icon._getIconImage(this._devicePixelRatio).then((image) => {
                const [partPosX, partPosY] = Icon._getIconPartPos(this.type);
                ctx.drawImage(
                    image,
                    partPosX * this._devicePixelRatio, partPosY * this._devicePixelRatio,
                    partSize, partSize,
                    0, 0, partSize, partSize,
                );
            });
        }
    }

    static _getIconPartPos(type: Icon.Type) {
        const codeStr = this._codedPosMap.get(type) || this._codedPosMap.get(this.Type.None);
        const [codeStrX, codeStrY] = codeStr.split(',');
        const codeX = Number(codeStrX);
        const codeY = Number(codeStrY);
        const stepX = this._svgRefPartSize + this._svgRefIconMinX
            + this._svgRefIconMaxX + this._svgRefIconSpaceX;
        const stepY = this._svgRefPartSize + this._svgRefIconMinY
            + this._svgRefIconMaxY + this._svgRefIconSpaceY;
        const posX = this._svgRefMinX + this._svgRefIconMinX + (codeX * stepX);
        const posY = this._svgRefMaxY + this._svgRefIconMaxY + (codeY * stepY);

        return [posX, posY];
    }

    static async _getIconImage(pixelRatio: number): Promise<CanvasImageSource> {
        return new Promise((resolve) => {
            if (this._svgImage && this._currentPixelRatio === pixelRatio) {
                if (this._svgImageLoaded) {
                    return resolve(this._svgCanvas);
                }

                return this._svgImage.addEventListener('load', () => {
                    resolve(this._svgCanvas);
                });
            }

            this._svgImage = document.createElement('img');
            this._svgImageLoaded = false;
            this._currentPixelRatio = pixelRatio;

            this._svgCanvas = document.createElement('canvas');
            this._svgCanvas.width = this._svgRefWidth * this._currentPixelRatio;
            this._svgCanvas.height = this._svgRefHeight * this._currentPixelRatio;
            
            this._svgImage.addEventListener('load', () => {
                const ctx = this._svgCanvas.getContext('2d');
                ctx.drawImage(this._svgImage, 0, 0, this._svgCanvas.width, this._svgCanvas.height);
                this._svgImageLoaded = true;
                resolve(this._svgCanvas);
            });
            this._svgImage.src = '/blender_icons.svg';
        });
    }

}

module Icon {
    export enum Type {
        None,
        NewFile,
        Share,
        Plus,
    }
}

export default Icon;

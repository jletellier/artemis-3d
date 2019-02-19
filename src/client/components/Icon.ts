import { LitElement, customElement, html, css, property } from 'lit-element';

@customElement('smaat-icon')
export default class Icon extends LitElement {

    static _svgRefWidth = 602;
    static _svgRefHeight = 640;
    static _svgRefMinX = 3;
    static _svgRefMaxX = 53;
    static _svgRefMinY = 3;
    static _svgRefMaxY = 8;
    static _svgRefPartSize = 16;
    static _svgPartsX = 26;
    static _svgPartsY = 30;
    static _svgCanvas: HTMLCanvasElement = null;
    static _svgImage: HTMLImageElement = null;

    @property()
    type: string = '';

    static styles = css`
        canvas {
            display: block;
            width: 100%;
            height: 100%;
        }
    `;

    render() {
        return html`<canvas></canvas>`;
    }

    firstUpdated() {
        const canvas = this.shadowRoot.querySelector('canvas');
        canvas.width = Icon._svgRefPartSize;
        canvas.height = Icon._svgRefPartSize;
        const ctx = canvas.getContext('2d');

        Icon._getIconImage().then((image) => {
            ctx.drawImage(
                image,
                425, 220, Icon._svgRefPartSize, Icon._svgRefPartSize,
                0, 0, Icon._svgRefPartSize, Icon._svgRefPartSize,
            );
        });
    }

    static async _getIconImage(): Promise<CanvasImageSource> {
        return new Promise((resolve) => {
            if (this._svgImage) {
                return this._svgImage.addEventListener('load', () => {
                    resolve(this._svgCanvas);
                });
            }

            this._svgImage = document.createElement('img');

            this._svgCanvas = document.createElement('canvas');
            this._svgCanvas.width = this._svgRefWidth;
            this._svgCanvas.height = this._svgRefHeight;
            
            this._svgImage.addEventListener('load', () => {
                const ctx = this._svgCanvas.getContext('2d');
                ctx.drawImage(this._svgImage, 0, 0, this._svgCanvas.width, this._svgCanvas.height);
                resolve(this._svgCanvas);
            });
            this._svgImage.src = '/blender_icons.svg';
        });
    }

}

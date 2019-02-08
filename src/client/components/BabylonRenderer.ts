import { LitElement, html, css, customElement, property } from 'lit-element';
import MozillaXRBase from '../xr/MozillaXRBase';

@customElement('smaat-babylon-renderer')
export default class BabylonRenderer extends LitElement {

    static styles = css`
        canvas {
            width: 100%;
            height: 100%;
        }
    `;

    render() {
        return html`
            <canvas></canvas>
        `;
    }

    firstUpdated() {
        const canvas = this.shadowRoot.querySelector('canvas');
        const mozillaXR = new MozillaXRBase(canvas);

        //mozillaXR.startRendering();
    }

}
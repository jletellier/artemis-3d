import { LitElement, html, customElement, property } from 'lit-element';
import MozillaXRBase from '../xr/MozillaXRBase';

@customElement('smaat-babylon-renderer')
export default class BabylonRenderer extends LitElement {

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

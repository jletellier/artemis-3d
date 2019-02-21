import { LitElement, html, css, customElement, property } from 'lit-element';
import MozillaXRBase from '../xr/MozillaXRBase';
import project from '../data/project';

@customElement('smaat-babylon-renderer')
export default class BabylonRenderer extends LitElement {

    static styles = css`
        canvas {
            display: block;
            width: 100%;
            height: 100%;
            outline: none;
        }
    `;

    render() {
        return html`<canvas></canvas>`;
    }

    firstUpdated() {
        const canvas = this.shadowRoot.querySelector('canvas');
        const mozillaXR = new MozillaXRBase(canvas);
        
        if (mozillaXR.xrSupported) {
            project.hasXR = true;
        }
        project.scene = mozillaXR.scene;
        
        mozillaXR.startRendering();
    }

}

import { css, customElement, html, LitElement, property } from 'lit-element';
import Engine from './Engine';

@customElement('artemis-viewer')
export default class Viewer extends LitElement {

    @property({ type : String })
    file = '';

    static styles = css`
        canvas {
            display: block;
            width: 100%;
            height: 100%;
            outline: none;
            background-color: none;
            touch-action: none;
            overflow: hidden;
        }
    `;

    render() {
        return html`<canvas touch-action="none"></canvas>`;
    }

    firstUpdated() {
        const canvas = this.shadowRoot.querySelector('canvas');

        const engine = new Engine();
        engine.init(canvas);

        if (this.file.length > 0) {
            engine.loadFile(this.file);
        }
    }

}

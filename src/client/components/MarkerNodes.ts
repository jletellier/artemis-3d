import { LitElement, html, css, customElement, property } from 'lit-element';
import '@material/mwc-icon';
import '@material/mwc-button';
import project from '../data/project';

@customElement('smaat-marker-nodes')
export default class MarkerNodes extends LitElement {

    @property()
    markerID: string;

    _nodeFileInput: HTMLInputElement;

    static styles = css`
        input {
            display: none;
        }
    `;

    render() {
        return html`
            <div>
                <input type="file" id="node-file" accept="*"
                    @change="${this.handleNodeFile}">
                <mwc-button icon="add" label="Add node" raised dense
                    @click="${this.handleAddNode}">
            </div>
        `;
    }

    updated() {
        this._nodeFileInput = this.shadowRoot.querySelector('input#node-file');
    }

    handleAddNode() {
        this._nodeFileInput.click();
    }

    handleNodeFile() {
        const files = this._nodeFileInput.files;
        if (files.length > 0) {
            const file = files[0];
            project.addGlTFNode(file, this.markerID);
        }
    }

}

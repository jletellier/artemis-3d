import { LitElement, html, css, customElement, property } from 'lit-element';
import './Button';
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
                <smaat-button icon="plus" value="Add node"
                    @click="${this.handleAddNode}">
                </smaat-button>
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

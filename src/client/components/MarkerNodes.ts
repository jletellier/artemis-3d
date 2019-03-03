import { LitElement, html, css, customElement, property } from 'lit-element';
import './Button';
import Icon from './Icon';
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
        ul {
            list-style-type: circle;
            list-style-position: inside;
            padding: 0;
            margin: 0;
        }
        li {
            margin: 2px 0;
            padding: 0 8px 0 13px;
        }
        li.item {
            padding-top: 5px;
            padding-bottom: 5px;
        }
        li.item:hover {
            background-color: #494949;
        }
    `;

    render() {
        return html`
            <ul>
                ${project.getNodeNames(this.markerID).map(value =>
                    html`<li class="item">${value}</li>`,
                )}
                <li>
                    <input type="file" id="node-file" accept="*"
                        @change="${this.handleNodeFile}">
                    <smaat-button icon="${Icon.Type.Plus}" label="Add node"
                        @click="${this.handleAddNode}">
                    </smaat-button>
                </li>
            </ul>
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

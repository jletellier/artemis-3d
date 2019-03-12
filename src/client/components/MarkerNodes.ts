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
            list-style-type: none;
            list-style-position: inside;
            padding-inline-start: 42px;
            padding: 0;
            margin: 0;
        }
        li {
            margin: 2px 0;
            padding: 0 8px 0 29px;
        }
        li.item {
            list-style-type: circle;
            padding: 5px 8px 5px 13px;
        }
        li.item:hover {
            background-color: #494949;
        }
        li.item.selected {
            background-color: #314E78;
        }
    `;

    render() {
        const selectedNode = project.getSelectedNode();

        return html`
            <ul>
                ${project.getNodeNames(this.markerID).map(value =>
                    html`<li class="item ${(selectedNode === value) ? 'selected' : ''}"
                        @click="${this.handleSelectNode}">${value}</li>`,
                )}
                <li>
                    <input type="file" id="node-file" accept="*"
                        @change="${this.handleNodeFile}">
                    <smaat-button icon="${Icon.Type.Plus}" label="Add 3D Object"
                        @click="${this.handleAddNode}">
                    </smaat-button>
                </li>
            </ul>
        `;
    }

    firstUpdated() {
        project.onSceneChangedObservable.add(() => {
            this.requestUpdate();
        });
    }

    handleSelectNode(event: Event) {
        const target = <HTMLLIElement>event.currentTarget;
        project.setSelectedNode(target.textContent);
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

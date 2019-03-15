import { LitElement, html, css, customElement, property } from 'lit-element';
import './Button';
import './Frame';
import './FrameTopBar';
import './FrameContent';
import './MarkerNodes';
import Icon from './Icon';
import project from '../data/project';

@customElement('smaat-scene-graph')
export default class SceneGraph extends LitElement {

    _markerFileInput: HTMLInputElement;

    static styles = css`
        input {
            display: none;
        }

        ul {
            list-style-type: none;
            padding: 0;
            margin: 0;
        }
        li {
            padding: 0;
            color: #C3C3C3;
            cursor: default;
        }

        div {
            margin: 1px 0;
            padding: 5px 8px;
        }
        div:hover {
            background-color: #494949;
        }
        div.selected {
            background-color: #314E78;
        }
    `;

    render() {
        const selectedMarker = project.getSelectedMarker();
        const selectedNode = project.getSelectedNode();

        return html`
            <smaat-frame>
                <smaat-frame-top-bar>
                    <input type="file" id="marker-file" multiple accept="image/*"
                        @change="${this.handleMarkerFiles}">
                    <smaat-button icon="${Icon.Type.Plus}" label="Add Image Marker"
                        @click="${this.handleAddMarker}">
                    </smaat-button>
                </smaat-frame-top-bar>
                <smaat-frame-content>
                    <ul>
                        ${project.getMarkerNames().map(value =>
                            html`<li>
                                <div markerid="${value}"
                                    class="${(!selectedNode && selectedMarker === value) ?
                                        'selected' : ''}"
                                    @click="${this.handleSelectMarker}">${value}</div>
                                ${(selectedMarker === value)
                                    ? html`<smaat-marker-nodes
                                        markerid="${value}"></smaat-marker-nodes>`
                                    : html``
                                }
                            </li>`,
                        )}
                    </ul>
                </smaat-frame-content>
            </smaat-frame>
        `;
    }

    firstUpdated() {
        project.onSceneChangedObservable.add(() => {
            this.requestUpdate();
        });
    }

    updated() {
        this._markerFileInput = this.shadowRoot.querySelector('input#marker-file');
    }

    handleAddMarker() {
        this._markerFileInput.click();
    }

    handleMarkerFiles() {
        const files = this._markerFileInput.files;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            if (!file.type.startsWith('image/')) {
                continue;
            }

            project.addMarker(file);
        }
    }

    handleSelectMarker(event: Event) {
        const target = <HTMLDivElement>event.currentTarget;
        project.setSelectedMarker(target.getAttribute('markerid'));
    }

}

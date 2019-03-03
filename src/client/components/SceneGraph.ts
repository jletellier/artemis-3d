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
    `;

    render() {
        return html`
            <smaat-frame>
                <smaat-frame-top-bar>
                    <input type="file" id="marker-file" multiple accept="image/*"
                        @change="${this.handleMarkerFiles}">
                    <smaat-button icon="${Icon.Type.Plus}" label="Add marker"
                        @click="${this.handleAddMarker}">
                    </smaat-button>
                </smaat-frame-top-bar>
                <smaat-frame-content>
                    <ul>
                        ${project.getMarkerNames().map(value =>
                            html`<li>
                                <div>${value}</div>
                                <smaat-marker-nodes markerid="${value}"></smaat-marker-nodes>
                            </li>`,
                        )}
                    </ul>
                </smaat-frame-content>
            </smaat-frame>
        `;
    }

    firstUpdated() {
        project.onMarkerChangedObservable.add(() => {
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

}

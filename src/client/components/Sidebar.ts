import { LitElement, html, css, customElement, property } from 'lit-element';
import '@material/mwc-icon';
import '@material/mwc-button';
import './MarkerNodes';
import project from '../data/project';

@customElement('smaat-sidebar')
export default class Sidebar extends LitElement {

    _markerFileInput: HTMLInputElement;

    static styles = css`
        input {
            display: none;
        }
    `;

    render() {
        return html`
            <input type="file" id="marker-file" multiple accept="image/*"
                @change="${this.handleMarkerFiles}">
            <mwc-button icon="add" label="Add marker" raised dense
                @click="${this.handleAddMarker}">
            </mwc-button>
            <ul>
                ${project.getMarkerNames().map(value =>
                    html`<li>
                        <div>${value}</div>
                        <smaat-marker-nodes markerid="${value}"></smaat-marker-nodes>
                    </li>`,
                )}
            </ul>
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

import { LitElement, html, css, customElement, property } from 'lit-element';
import '@material/mwc-icon';
import '@material/mwc-button';
import projectData from '../data/project';

@customElement('smaat-sidebar')
export default class Sidebar extends LitElement {

    _markerFileInput: HTMLInputElement;

    static styles = css`
        input#marker-file {
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
                ${projectData.getMarkerNames().map((value) => 
                    html`<li>${value}</li>`
                )}
            </ul>
        `;
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

            projectData.addMarker(file);
        }

        this.requestUpdate();
    }

}

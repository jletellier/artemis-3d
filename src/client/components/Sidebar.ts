import { LitElement, html, css, customElement, property } from 'lit-element';
import { Mesh, StandardMaterial, Texture } from 'babylonjs';
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
            
            let plane = Mesh.CreatePlane('plane', 20.0, projectData.scene);
            let material = new StandardMaterial('marker', projectData.scene);
            let texture = new Texture(window.URL.createObjectURL(file), projectData.scene);
            material.diffuseTexture = texture;
            material.diffuseTexture.hasAlpha = true;
            material.backFaceCulling = false;
            plane.material = material;

            console.log(file.name);
        }
    }

}

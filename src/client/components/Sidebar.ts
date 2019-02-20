import { LitElement, html, css, customElement, property } from 'lit-element';
import './Button';
import './MarkerNodes';
import Icon from './Icon';
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
            <smaat-button icon="${Icon.Type.Plus}" label="Add marker"
                @click="${this.handleAddMarker}">
            </smaat-button>
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

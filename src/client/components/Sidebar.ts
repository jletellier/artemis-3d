import { LitElement, html, css, customElement, property } from 'lit-element';
import '@material/mwc-icon';
import '@material/mwc-button';

@customElement('smaat-sidebar')
export default class Sidebar extends LitElement {

    static styles = css`
        
    `;

    render() {
        return html`
            <mwc-button icon="add" label="Add marker" raised dense
                @click="${this.handleAddMarker}">
            </mwc-button>
        `;
    }

    handleAddMarker() {
        
    }

}

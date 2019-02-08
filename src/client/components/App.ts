import { LitElement, html, css, customElement } from 'lit-element';
import '@material/mwc-icon';
import '@material/mwc-button';
import './BabylonRenderer';

@customElement('smaat-app')
export default class App extends LitElement {

    static styles = css`
        div {
            padding: 5px;
        }
        .navbar {
            background-color: lightgray;
        }
    `;

    render() {
        return html`
            <div class="navbar">
                <mwc-button icon="create_new_folder" label="New project" raised
                    @click="${this.handleNewProject}">
                </mwc-button>
                <mwc-button icon="add" label="Add marker" raised
                    @click="${this.handleAddMarker}">
                </mwc-button>
                <mwc-button icon="share" label="Share project" raised
                    @click="${this.handleShareProject}">
                </mwc-button>
            </div>
            
            <smaat-babylon-renderer></smaat-babylon-renderer>
        `;
    }

    handleNewProject() {
        console.log('new project');
    }

    handleAddMarker() {
        console.log('add marker');
    }

    handleShareProject() {
        console.log('share project');
    }

}

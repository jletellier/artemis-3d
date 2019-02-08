import { LitElement, html, css, customElement } from 'lit-element';
import '@material/mwc-icon';
import '@material/mwc-button';
import './BabylonRenderer';

@customElement('smaat-app')
export default class App extends LitElement {

    static styles = css`
        :host {
            display: grid;
            grid-template-areas: 
                "navbar navbar"
                "view sidebar";
            grid-template-rows: min-content 1fr;
            grid-template-columns: 1fr min-content;
            height: 100%;
        }
        .navbar {
            grid-area: navbar;
            padding: 5px;
            background-color: lightgray;
        }
        .view {
            grid-area: view;
            background-color: black;
        }
        .sidebar {
            grid-area: sidebar;
            padding: 5px;
            background-color: gray;
            min-width: min-content;
            max-width: 50vw;
            overflow: auto;
        }
    `;

    render() {
        return html`
            <div class="navbar">
                <mwc-button icon="create_new_folder" label="New project" raised dense
                    @click="${this.handleNewProject}">
                </mwc-button>
                
                <mwc-button icon="share" label="Share project" raised dense
                    @click="${this.handleShareProject}">
                </mwc-button>
            </div>
            <div class="view">
                <smaat-babylon-renderer></smaat-babylon-renderer>
            </div>
            <div class="sidebar">
                <mwc-button icon="add" label="Add marker" raised dense
                    @click="${this.handleAddMarker}">
                </mwc-button>
            </div>
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

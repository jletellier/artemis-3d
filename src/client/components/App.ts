import { LitElement, html, css, customElement, property } from 'lit-element';
import '@material/mwc-icon';
import '@material/mwc-button';
import './BabylonRenderer';
import { v4 as uuid } from 'uuid';
import page from 'page';

@customElement('smaat-app')
export default class App extends LitElement {

    @property()
    projectId: string = null;

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

    constructor() {
        super();
        page('/', () => {
            console.log('page loaded');
            this.projectId = null;
        });
        page('/p/:id', (ctx) => {
            console.log('page loaded with id: ', ctx.params.id);
            this.projectId = ctx.params.id;
        });
        page();
    }

    render() {
        const showProject = (this.projectId != null);

        return html`
            <div class="navbar">
                <mwc-button icon="create_new_folder" label="New project" raised dense
                    @click="${this.handleNewProject}">
                </mwc-button>
                ${showProject ? html`
                    <mwc-button icon="share" label="Share project" raised dense
                            @click="${this.handleShareProject}">
                    </mwc-button>
                ` : html``}
            </div>
            <div class="view">
                <smaat-babylon-renderer></smaat-babylon-renderer>
            </div>
            ${showProject ? html`
                <div class="sidebar">
                    <mwc-button icon="add" label="Add marker" raised dense
                        @click="${this.handleAddMarker}">
                    </mwc-button>
                </div>
            ` : html``}
        `;
    }

    handleNewProject() {
        const pageId = uuid();

        page(`/p/${pageId}`);
    }

    handleAddMarker() {
        console.log('add marker');
    }

    handleShareProject() {
        console.log('share project');
    }

}

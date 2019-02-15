import { LitElement, html, css, customElement, property } from 'lit-element';
import page from 'page';
import project from '../data/project';
import '@material/mwc-icon';
import '@material/mwc-button';
import './BabylonRenderer';
import './Sidebar';

@customElement('smaat-app')
export default class App extends LitElement {

    @property()
    hasProject: boolean = false;

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
            background-color: none;
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
            this.hasProject = false;
            project.id = null;
        });
        page('/p/:id', (ctx) => {
            this.hasProject = true;
            project.id = ctx.params.id;
        });
        page();

        project.onHasXRChangedObservable.add(() => {
            this.requestUpdate();
        });
    }

    render() {
        return html`
            ${!project.hasXR ? html`
                <div class="navbar">
                    <mwc-button icon="create_new_folder" label="New project" raised dense
                        @click="${this.handleNewProject}">
                    </mwc-button>
                    ${this.hasProject ? html`
                        <mwc-button icon="share" label="Share project" raised dense
                                @click="${this.handleShareProject}">
                        </mwc-button>
                    ` : html``}
                </div>
            ` : html``}
            <div class="view">
                <smaat-babylon-renderer></smaat-babylon-renderer>
            </div>
            ${!project.hasXR ? html`
                <div class="sidebar">
                    ${this.hasProject ? html`<smaat-sidebar></smaat-sidebar>` : html``}
                </div>
            ` : html``}
        `;
    }

    handleNewProject() {
        const pageId = project.generateID();
        page(`/p/${pageId}`);
    }

    handleShareProject() {
        console.log('share project');
    }

}

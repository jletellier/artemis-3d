import { LitElement, html, css, customElement, property } from 'lit-element';
import page from 'page';
import project from '../data/project';
import './Frame';
import './FrameBar';
import './Button';
import './BabylonRenderer';
import './Sidebar';

@customElement('smaat-app')
export default class App extends LitElement {

    @property()
    hasProject: boolean = false;

    static styles = css`
        :host {
            display: grid;
            grid-template:
                "renderer scenegraph" 1fr
                "renderer properties" 1fr
                / 1fr min-content;
            column-gap: 5px;
            row-gap: 5px;
            height: 100%;
            background-color: #1F1F1F;
        }
        .renderer {
            grid-area: renderer;
            background-color: none;
        }
        .scenegraph {
            grid-area: scenegraph;
            min-width: 200px;
        }
        .properties {
            grid-area: properties;
            min-width: 200px;
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
            <smaat-frame class="renderer">
                ${!project.hasXR ? html`
                    <smaat-frame-bar>
                        <smaat-button icon="plus" value="New"
                            @click="${this.handleNewProject}">
                        </smaat-button>
                        ${this.hasProject ? html`
                            <smaat-button icon="share" value="Share"
                                @click="${this.handleShareProject}">
                            </smaat-button>
                        ` : html``}
                    </smaat-frame-bar>
                ` : html``}
                <smaat-babylon-renderer></smaat-babylon-renderer>
            </smaat-frame>

            ${!project.hasXR ? html`
                <smaat-frame class="scenegraph">
                    <smaat-frame-bar></smaat-frame-bar>
                    ${this.hasProject ? html`<smaat-sidebar></smaat-sidebar>` : html``}
                </smaat-frame>
                <smaat-frame class="properties">
                    <smaat-frame-bar></smaat-frame-bar>
                </smaat-frame>
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

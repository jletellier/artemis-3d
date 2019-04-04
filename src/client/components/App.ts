import { LitElement, html, css, customElement, property } from 'lit-element';
import page from 'page';
import project from '../data/project';
import './Frame';
import './FrameTopBar';
import './FrameContent';
import './Button';
import BabylonRenderer from './BabylonRenderer';
import './SceneGraph';
import './NodeProperties';
import Icon from './Icon';

@customElement('smaat-app')
export default class App extends LitElement {

    @property()
    hasProject: boolean = false;

    _rendererElement: BabylonRenderer;

    static styles = css`
        :host {
            position: absolute;
            width: 100%;
            height: 100%;
        }

        .container {
            display: grid;
            grid-template:
                "renderer scenegraph" 1fr
                "renderer properties" 1fr
                / 1fr min-content;
            column-gap: 5px;
            row-gap: 5px;
            height: 100%;
            background-color: #1F1F1F;
            font-family: 'Noto Sans', sans-serif;
            font-size: 13px;
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
        if (!this._rendererElement) {
            this._rendererElement = new BabylonRenderer();
        }

        return html`
            ${project.hasXR ? html`
                ${this._rendererElement}
            ` : html`
                <div class="container">
                    <smaat-frame class="renderer">
                        <smaat-frame-top-bar>
                            <smaat-button icon="${Icon.Type.NewFile}" label="New"
                                @click="${this.handleNewProject}">
                            </smaat-button>
                            ${this.hasProject ? html`
                                <smaat-button icon="${Icon.Type.Share}" label="Share"
                                    @click="${this.handleShareProject}">
                                </smaat-button>
                            ` : html``}
                        </smaat-frame-top-bar>
                        <smaat-frame-content>
                            ${this._rendererElement}
                        </smaat-frame-content>
                    </smaat-frame>

                    ${this.hasProject ? html`
                        <smaat-scene-graph class="scenegraph"></smaat-scene-graph>
                        <smaat-node-properties class="properties"></smaat-node-properties>
                    ` : html``}
                </div>
            `}
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

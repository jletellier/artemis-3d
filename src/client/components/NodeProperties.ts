import { LitElement, html, css, customElement } from 'lit-element';
import './Frame';
import './FrameTopBar';
import './FrameContent';
import project from '../data/project';

@customElement('smaat-node-properties')
export default class NodeProperties extends LitElement {

    static styles = css`
        @import url('https://fonts.googleapis.com/css?family=Noto+Sans');

        :host {
            color: #DADADA;
        }
        .title {
            margin: 5px 0;
            padding: 5px 8px;
            background-color: #424242;
            white-space: nowrap;
        }
        .title:first-of-type {
            margin-top: 0;
        }
        .title:last-of-type {
            margin-bottom: 0;
        }
        .item {
            padding: 2px 8px 2px 29px;
            display: grid;
            grid-template-columns: 1fr 80px;
            grid-column-gap: 10px;
        }
        .item:last-of-type {
            padding-bottom: 5px;
        }
        .item input {
            place-self: center stretch;
            font-family: 'Noto Sans', sans-serif;
            font-size: 11px;
            background-color: #585858;
            color: #DADADA;
            border: 1px solid #3B3B3B;
            outline: none;
            border-radius: 4px;
            padding: 2px 8px;
        }
        .item input:hover {
            background-color: #676767;
        }
    `;

    render() {
        const attributes = project.getSelectedMeshAttributes();

        // NOTE: The following terribly ugly and will soon be replaced with a generic system

        return html`
            <smaat-frame>
                <smaat-frame-top-bar>Properties</smaat-frame-top-bar>
                <smaat-frame-content>
                    ${(attributes && attributes.type === 'marker') ? html`
                        <div class="title">Image Marker</div>
                        <div class="item">
                            <div class="label">
                                Real Width
                            </div>
                            <input type="number" min="0" step="0.001" data-type="realWidth"
                                value="${attributes.realWidth}" @change="${this.handleChange}">
                        </div>
                    ` : html``}
                    ${(attributes && attributes.type === 'node') ? html`
                        <div class="title">Location</div>
                        <div class="item">
                            <div class="label">
                                X
                            </div>
                            <input type="number" min="0" step="0.001" data-type="posX"
                                value="${attributes.posX}" @change="${this.handleChange}">
                        </div>
                        <div class="item">
                            <div class="label">
                                Y
                            </div>
                            <input type="number" min="0" step="0.001" data-type="posY"
                                value="${attributes.posY}" @change="${this.handleChange}">
                        </div>
                        <div class="item">
                            <div class="label">
                                Z
                            </div>
                            <input type="number" min="0" step="0.001" data-type="posZ"
                                value="${attributes.posZ}" @change="${this.handleChange}">
                        </div>
                        <div class="title">Scale</div>
                        <div class="item">
                            <div class="label">
                                X
                            </div>
                            <input type="number" min="0" step="0.001" data-type="scaleX"
                                value="${attributes.scaleX}" @change="${this.handleChange}">
                        </div>
                        <div class="item">
                            <div class="label">
                                Y
                            </div>
                            <input type="number" min="0" step="0.001" data-type="scaleY"
                                value="${attributes.scaleY}" @change="${this.handleChange}">
                        </div>
                        <div class="item">
                            <div class="label">
                                Z
                            </div>
                            <input type="number" min="0" step="0.001" data-type="scaleZ"
                                value="${attributes.scaleZ}" @change="${this.handleChange}">
                        </div>
                        <div class="title">Rotation</div>
                        <div class="item">
                            <div class="label">
                                X
                            </div>
                            <input type="number" min="0" step="0.001" data-type="rotationX"
                                value="${attributes.rotationX}" @change="${this.handleChange}">
                        </div>
                        <div class="item">
                            <div class="label">
                                Y
                            </div>
                            <input type="number" min="0" step="0.001" data-type="rotationY"
                                value="${attributes.rotationY}" @change="${this.handleChange}">
                        </div>
                        <div class="item">
                            <div class="label">
                                Z
                            </div>
                            <input type="number" min="0" step="0.001" data-type="rotationZ"
                                value="${attributes.rotationZ}" @change="${this.handleChange}">
                        </div>
                    ` : html``}
                </smaat-frame-content>
            </smaat-frame>
        `;
    }

    firstUpdated() {
        project.onSceneChangedObservable.add(() => {
            this.requestUpdate();
        });
    }

    handleChange(event: Event) {
        const target = <HTMLInputElement>event.currentTarget;
        const type = target.getAttribute('data-type');
        const value = target.valueAsNumber;

        project.setSelectedMeshAttribute(type, value);
    }

}

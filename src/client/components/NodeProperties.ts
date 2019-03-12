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
                            <input type="number" min="0" step="0.001"
                                value="${attributes.realWidth}">
                        </div>
                    ` : html``}
                    ${(attributes && attributes.type === 'node') ? html`
                        <div class="title">Location</div>
                        <div class="item">
                            <div class="label">
                                X
                            </div>
                            <input type="number" min="0" step="0.001"
                                value="${attributes.posX}">
                        </div>
                        <div class="item">
                            <div class="label">
                                Y
                            </div>
                            <input type="number" min="0" step="0.001"
                                value="${attributes.posY}">
                        </div>
                        <div class="item">
                            <div class="label">
                                Z
                            </div>
                            <input type="number" min="0" step="0.001"
                                value="${attributes.posZ}">
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

}

import { LitElement, customElement, html, css } from 'lit-element';

@customElement('smaat-frame-bar')
export default class FrameBar extends LitElement {

    static styles = css`
        :host {
            display: flex;
            padding: 3px 5px;
            width: 100%;
            height: 22px;
            background-color: #383838;
        }
    `;

    render() {
        return html`<slot></slot>`;
    }

}

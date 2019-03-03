import { LitElement, customElement, html, css } from 'lit-element';

@customElement('smaat-frame-top-bar')
export default class FrameTopBar extends LitElement {

    static styles = css`
        :host {
            display: block;
            padding: 3px 5px;
            min-height: 24px;
            line-height: 24px;
            height: 24px;
            background-color: #383838;
            border-radius: 4px 4px 0 0;
            white-space: nowrap;
            overflow-x: scroll;
            overflow-y: hidden;
            scrollbar-width: none;
        }
        :host::-webkit-scrollbar {
            display: none;
        }
    `;

    render() {
        return html`<slot></slot>`;
    }

}

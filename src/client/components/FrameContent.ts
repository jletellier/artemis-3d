import { LitElement, customElement, html, css } from 'lit-element';

@customElement('smaat-frame-content')
export default class FrameContent extends LitElement {

    static styles = css`
        :host {
            flex: 1;
            border-radius: 0 0 4px 4px;
        }
    `;

    render() {
        return html`<slot></slot>`;
    }

}

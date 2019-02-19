import { LitElement, customElement, html, css } from 'lit-element';

@customElement('smaat-frame')
export default class Frame extends LitElement {

    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            background-color: #303030;
            border-radius: 4px;
        }
    `;

    render() {
        return html`<slot></slot>`;
    }

}

import { LitElement, customElement, html, css, property } from 'lit-element';
import Icon from './Icon';

@customElement('smaat-button')
export default class Button extends LitElement {

    @property()
    label: string = '';

    @property({ type: Number })
    icon: Icon.Type;

    static styles = css`
        button {
            display: inline-flex;
            grid-template-areas: "icon text";
            grid-template-rows: 16px 1fr;
            border: 1px solid #3B3B3B;
            border-right-width: 0;
            border-radius: 0;
            outline: none;
            margin: 0;
            padding: 3px 5px;
            height: 24px;
            background-color: #585858;
            color: #DADADA;
        }
        :host(:first-of-type) button {
            border-radius: 4px 0 0 4px;
        }
        :host(:last-of-type) button {
            border-radius: 0 4px 4px 0;
            border-right-width: 1px;
        }
        :host(:only-of-type) button {
            border-radius: 4px;
        }
        button:hover {
            background-color: #676767;
        }
        button:active {
            background-color: #547AB5;
        }
        smaat-icon {
            grid-area: icon;
            margin-right: 5px;
        }
        span {
            grid-area: text;
            margin: auto;
            font-family: 'Noto Sans', sans-serif;
            font-size: 13px;
        }
    `;

    render() {
        const iconPart = (this.icon) ? html`<smaat-icon type="${this.icon}"></smaat-icon>` : html``;

        return html`
            <button type="button">${iconPart}<span>${this.label}</span></button>
        `;
    }

}

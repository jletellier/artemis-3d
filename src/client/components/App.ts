import { LitElement, html, customElement } from 'lit-element';
import './BabylonRenderer';

@customElement('smaat-app')
export default class App extends LitElement {

    render() {
        return html`
            <h1>Hi</h1>
            <smaat-babylon-renderer></smaat-babylon-renderer>
        `;
    }

}

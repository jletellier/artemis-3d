import { LitElement, html, customElement, property } from 'lit-element';

@customElement('my-element')
export default class MyElement extends LitElement {

    @property()
    private fps: number = 0;

    render() {
        return html`
            <h1>Hello World</h1>
            <p>Current fps is: 
                <span>${this.fps}</span>
            </p>
        `;
    }

}

import { LitElement, html, css, customElement } from 'lit-element';
import './Frame';
import './FrameTopBar';
import './FrameContent';

@customElement('smaat-node-properties')
export default class NodeProperties extends LitElement {

    static styles = css`
        
    `;

    render() {
        return html`
            <smaat-frame>
                <smaat-frame-top-bar></smaat-frame-top-bar>
                <smaat-frame-content>

                </smaat-frame-content>
            </smaat-frame>
        `;
    }

}

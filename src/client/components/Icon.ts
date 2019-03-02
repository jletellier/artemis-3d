import { LitElement, customElement, html, css, property } from 'lit-element';

@customElement('smaat-icon')
class Icon extends LitElement {

    static _filenameMap: Map<Icon.Type, string>;

    @property({ type: Number })
    type: Icon.Type;

    static styles = css`
        .feather {
            width: 16px;
            height: 16px;
            filter: invert(1);
        }
    `;

    constructor() {
        super();

        if (!Icon._filenameMap) {
            Icon._filenameMap = new Map<Icon.Type, string>([
                [Icon.Type.None, 'frown'],
                [Icon.Type.NewFile, 'file-plus'],
                [Icon.Type.Share, 'share'],
                [Icon.Type.Plus, 'plus'],
            ]);
        }
    }

    render() {
        const filename = Icon._filenameMap.get(this.type) || Icon._filenameMap.get(Icon.Type.None);
        return html`<img src="/dist/icons/${filename}.svg" class="feather">`;
    }

}

module Icon {
    export enum Type {
        None,
        NewFile,
        Share,
        Plus,
    }
}

export default Icon;

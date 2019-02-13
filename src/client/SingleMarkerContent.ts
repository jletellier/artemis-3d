import { Node } from 'babylonjs';
import ScriptBehavior from './ScriptBehavior';

export default class SingleMarkerContent extends ScriptBehavior {

    private otherContents: Node[];

    onAwake(): void {
        this.otherContents = this.target.parent.parent.getChildren(
            (node) => {
                return (node.name.endsWith('Content') && node !== this.target);
            },
            false,
        );
    }

    onEnabled(): void {
        console.info(`${this.name} Behavior on ${this.target.name} enabled...`);
        this.otherContents.forEach((node) => {
            node.setEnabled(false);

            // TODO: This should be done automatically
            const behavior = <ScriptBehavior>node.getBehaviorByName('SingleMarkerContent');
            behavior.enabled = false;
        });
    }

    onDisabled(): void {
        console.info(`${this.name} Behavior on ${this.target.name} disabled...`);
    }

}

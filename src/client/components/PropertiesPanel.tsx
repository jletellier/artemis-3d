import * as React from 'react';
import { FunctionComponent } from 'react';

import { useProjectState, changeProjectState } from '../stores/projectStore';
import { TransformPropertyGroup } from './TransformPropertyGroup';
import { useUserState } from '../stores/userStore';
import { transformView } from './objectViews/TransformView';

const PropertiesPanel: FunctionComponent = () => {
  // console.log('PropertiesPanel FunctionComponent called');

  const projectState = useProjectState();
  const userState = useUserState();

  if (userState.selectedNodes.length === 1) {
    const id = userState.selectedNodes[0];

    if (id.startsWith('/nodes/')) {
      // TODO: fill list of views
      const views = [transformView];

      const nodeId = +id.substr(7);
      const node = projectState.gltf.nodes[nodeId];

      const subpanels = views
        .filter((view) => view.isRelevant(node)) // TODO: filter by visibility / collapsed state
        .map((view) => (
          <view.component
            key={view.name}
            focus={view.lens.get(node)}
            onUpdate={(focus) => {
              changeProjectState((state) => {
                const currNode = state.gltf.nodes[nodeId]; // @Julien: is this different than the node above?
                view.lens.set(currNode, focus);
              });
            }}
          />
        ));

      return <div>{subpanels}</div>;

      // return (
      //   <TransformPropertyGroup
      //     selectedNodeId={nodeId}
      //     selectedNode={node}
      //   />
      // );
    }
  }

  return <div />;
};

export { PropertiesPanel };

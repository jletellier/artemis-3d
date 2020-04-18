import * as React from 'react';
import { FunctionComponent } from 'react';

import { useProjectState, changeProjectState } from '../stores/projectStore';
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
        .map((view) => {
          const onUpdate = (focus: any) => {
            changeProjectState((state) => {
              const currNode = state.gltf.nodes[nodeId];
              view.lens.set(currNode, focus);
            });
          };
          return (
            <view.component
              // TODO: possible performance issue
              // if nodeId is not part of key, onUpdate may have old data (wrong nodeId) due to
              // a bug in react-jsonschema-form
              // https://github.com/rjsf-team/react-jsonschema-form/issues/1708
              key={`${nodeId}-${view.name}`}
              focus={view.lens.get(node)}
              onUpdate={onUpdate}
            />
          );
        });

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

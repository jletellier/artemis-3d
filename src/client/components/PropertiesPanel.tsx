import React, { FunctionComponent, useState } from 'react';

import { INode } from 'babylonjs-gltf2interface';
import { useProjectState, changeProjectState } from '../stores/projectStore';
import { useUserState } from '../stores/userStore';
import { transformView } from './objectViews/TransformView';
import { ILensView } from './objectViews/LensView';

const PropertiesPanel: FunctionComponent = () => {
  // console.log('PropertiesPanel FunctionComponent called');

  const projectState = useProjectState();
  const userState = useUserState();

  const [propFilter, setPropFilter] = useState('');

  if (userState.selectedNodes.length === 1) {
    const id = userState.selectedNodes[0];

    if (id.startsWith('/nodes/')) {
      // TODO: fill list of views
      const views: ILensView<INode, any>[] = [transformView];

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
          // TODO: possible performance issue
          // if nodeId is not part of key, onUpdate may have old data (wrong nodeId) due to
          // a bug in react-jsonschema-form
          // https://github.com/rjsf-team/react-jsonschema-form/issues/1708
            <div key={`${nodeId}-${view.name}`}>
              <h2>{view.name}</h2>
              <view.component
                key={`${nodeId}-${view.name}`}
                focus={view.lens.get(node)}
                onUpdate={onUpdate}
                propFilter={propFilter}
              />
            </div>
          );
        });

      return (
        <div>
          <div>
            Search Properties:
            {' '}
            <input type="text" value={propFilter} onChange={(e) => setPropFilter(e.target.value.toLowerCase())} />
          </div>
          {subpanels}
        </div>
      );

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

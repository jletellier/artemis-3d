import React, { FunctionComponent, useState } from 'react';

import { INode } from 'babylonjs-gltf2interface';
import { useProjectState, changeProjectState } from '../stores/projectStore';
import { useUserState } from '../stores/userStore';
import { transformView } from './objectViews/TransformView';
import { ILensView } from './objectViews/LensView';

interface ISearchFilter {
  searchTerm: string;
  searchViewMeta: boolean;
  searchFields: boolean;
}

const PropertiesPanel: FunctionComponent = () => {
  // console.log('PropertiesPanel FunctionComponent called');

  const projectState = useProjectState();
  const userState = useUserState();

  const [searchFilter, setSearchFilter] = useState<ISearchFilter>({ searchTerm: '', searchViewMeta: true, searchFields: true });

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

          // TODO: how do we know that any field in the view is visible, so that this view needs
          // to be visible as well?
          const viewIsHidden = false; // view.name.toLowerCase().includes(searchFilter.searchTerm);

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
                fieldFilter={!viewIsHidden && searchFilter.searchFields ? searchFilter.searchTerm : ''}
              />
            </div>
          );
        });

      return (
        <div>
          <div>
            Search:
            {' '}
            <input
              type="text"
              value={searchFilter.searchTerm}
              onChange={(e) => setSearchFilter({
                searchViewMeta: searchFilter.searchViewMeta,
                searchFields: searchFilter.searchFields,
                searchTerm: e.target.value.toLowerCase(),
              })}
            />
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

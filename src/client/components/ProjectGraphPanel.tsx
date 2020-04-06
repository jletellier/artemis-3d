import * as React from 'react';
import { FunctionComponent, useState } from 'react';
import {
  Tree,
  ITreeNode,
  Tooltip,
  Icon,
  Classes,
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

import { useProjectState } from '../stores/projectStore';
import { ProjectState } from '../../common/types/projectState';
import { NodeState } from '../../common/types/nodeState';

type InternalState = Map<string, Partial<ITreeNode>>;

let convertChildren: (
  projectState: ProjectState, internalState: InternalState, children: number[]
) => ITreeNode[];

function convertProjectNode(
  projectState: ProjectState, internalState: InternalState, node: NodeState, nodeId: number,
) {
  const id = `node_${nodeId}`;
  return {
    id,
    label: node.name,
    secondaryLabel: (
      <Tooltip content="Toggle visibility">
        <Icon icon={IconNames.EYE_OPEN} />
      </Tooltip>
    ),
    childNodes: node.children
      ? convertChildren(projectState, internalState, node.children)
      : undefined,
    ...internalState.get(id),
  };
}

/* eslint-disable-next-line prefer-const */
convertChildren = (
  projectState: ProjectState, internalState: InternalState, children: number[],
) => (
  children.map((childNodeId) => {
    const childNode = projectState.nodes[childNodeId];
    return convertProjectNode(projectState, internalState, childNode, childNodeId);
  })
);

function convertProjectState(projectState: ProjectState, internalState: InternalState) {
  return projectState.scenes.map((scene, sceneId) => {
    const id = `scene_${sceneId}`;
    return {
      id,
      label: 'Main Scene',
      secondaryLabel: (
        <Tooltip content="Toggle visibility">
          <Icon icon={IconNames.EYE_OPEN} />
        </Tooltip>
      ),
      childNodes: scene.nodes
        ? convertChildren(projectState, internalState, scene.nodes)
        : undefined,
      ...internalState.get(id),
    };
  });
}

const ProjectGraphPanel: FunctionComponent = () => {
  // TODO: Move internal state to user-specific project state
  const [internalState, setInternalState] = useState<InternalState>(new Map());
  const projectState = useProjectState();
  const contents = convertProjectState(projectState, internalState);

  function handleNodeCollapse(nodeData: ITreeNode) {
    setInternalState(
      new Map(internalState.set(nodeData.id.toString(), { isExpanded: false })),
    );
  }

  function handleNodeExpand(nodeData: ITreeNode) {
    setInternalState(
      new Map(internalState.set(nodeData.id.toString(), { isExpanded: true })),
    );
  }

  return (
    <Tree
      contents={contents}
      className={Classes.ELEVATION_1}
      onNodeCollapse={handleNodeCollapse}
      onNodeExpand={handleNodeExpand}
    />
  );
};

export default ProjectGraphPanel;

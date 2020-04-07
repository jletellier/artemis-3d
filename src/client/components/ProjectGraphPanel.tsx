import * as React from 'react';
import { FunctionComponent } from 'react';
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
import { useSetUserState, useUserState } from '../stores/userStore';
import { UserState } from '../../common/types/userState';

let convertChildren: (
  projectState: ProjectState, userState: UserState, children: number[]
) => ITreeNode[];

function convertNode(
  projectState: ProjectState, userState: UserState, node: NodeState, nodeId: number,
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
      ? convertChildren(projectState, userState, node.children)
      : undefined,
    isSelected: userState.selectedNodes.includes(id),
    isExpanded: userState.expandedNodes.includes(id),
  };
}

/* eslint-disable-next-line prefer-const */
convertChildren = (projectState, userState, children) => (
  children.map((childNodeId) => {
    const childNode = projectState.nodes[childNodeId];
    return convertNode(projectState, userState, childNode, childNodeId);
  })
);

function convertStates(projectState: ProjectState, userState: UserState) {
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
        ? convertChildren(projectState, userState, scene.nodes)
        : undefined,
      isSelected: userState.selectedNodes.includes(id),
      isExpanded: userState.expandedNodes.includes(id),
    };
  });
}

const ProjectGraphPanel: FunctionComponent = () => {
  const projectState = useProjectState();
  const userState = useUserState();
  const setUserState = useSetUserState();
  const contents = convertStates(projectState, userState);

  function handleNodeCollapse(nodeData: ITreeNode) {
    const id = nodeData.id.toString();
    // TODO: Check if this is allowed or if expandedNodes needs to be copied first
    userState.expandedNodes.splice(userState.expandedNodes.indexOf(id), 1);
    setUserState({ ...userState, expandedNodes: userState.expandedNodes });
  }

  function handleNodeExpand(nodeData: ITreeNode) {
    const id = nodeData.id.toString();
    setUserState({ ...userState, expandedNodes: [...userState.expandedNodes, id] });
  }

  function handleNodeClick(nodeData: ITreeNode) {
    setUserState({ ...userState, selectedNodes: [nodeData.id.toString()] });
  }

  return (
    <Tree
      contents={contents}
      className={Classes.ELEVATION_1}
      onNodeCollapse={handleNodeCollapse}
      onNodeExpand={handleNodeExpand}
      onNodeClick={handleNodeClick}
    />
  );
};

export default ProjectGraphPanel;

/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import Relay from 'react-relay';

export default class RemoveCompletedTodosMutation extends Relay.Mutation {
  static fragments = {
    // TODO: Make completedCount, edges, and totalCount optional
    todos: () => Relay.QL`
      fragment on TodoConnection {
        edges {
          node {
            complete,
            id,
          },
        },
      }
    `,
    viewer: () => Relay.QL`
      fragment on User {
        completedCount,
        id,
        totalCount,
      }
    `,
  };
  getMutation() {
    return Relay.QL`mutation{removeCompletedTodos}`;
  }
  getFatQuery() {
    return Relay.QL`
      fragment on RemoveCompletedTodosPayload {
        deletedTodoIds,
        viewer {
          completedCount,
          totalCount,
        },
      }
    `;
  }
  getConfigs() {
    return [{
      type: 'NODE_DELETE',
      parentName: 'viewer',
      parentID: this.props.viewer.id,
      connectionName: 'todos',
      deletedIDFieldName: 'deletedTodoIds',
    }];
  }
  getVariables() {
    return {};
  }
  getOptimisticResponse() {
    var deletedTodoIds;
    var newTotalCount;
    if (this.props.todos && this.props.todos.edges) {
      deletedTodoIds = this.props.todos.edges
        .filter(edge => edge.node.complete)
        .map(edge => edge.node.id);
    }
    var {completedCount, totalCount} = this.props.viewer;
    if (completedCount != null && totalCount != null) {
      newTotalCount = totalCount - completedCount;
    }
    return {
      deletedTodoIds,
      viewer: {
        completedCount: 0,
        id: this.props.viewer.id,
        totalCount: newTotalCount,
      },
    };
  }
}

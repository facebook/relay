/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

export default class MarkAllTodosMutation extends Relay.Mutation {
  static fragments = {
    // TODO: Mark edges and totalCount optional
    todos: () => Relay.QL`
      fragment on TodoConnection {
        edges {
          node {
            complete,
            id,
          },
        },
        totalCount,
      }
    `,
    viewer: () => Relay.QL`
      fragment on User {
        id,
      }
    `,
  };
  getMutation() {
    return Relay.QL`mutation{markAllTodos}`;
  }
  getFatQuery() {
    return Relay.QL`
      fragment on MarkAllTodosPayload {
        viewer {
          todos {
            completedCount,
            edges {
              node {
                complete,
              },
            },
          },
        },
      }
    `;
  }
  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        viewer: this.props.viewer.id,
      },
    }];
  }
  getVariables() {
    return {
      complete: this.props.complete,
    };
  }
  getOptimisticResponse() {
    var viewerPayload;
    if (this.props.todos) {
      viewerPayload = {id: this.props.viewer.id, todos: {}};
      if (this.props.todos.edges) {
        viewerPayload.todos.edges = this.props.todos.edges
          .filter(edge => edge.node.complete !== this.props.complete)
          .map(edge => ({
            node: {
              complete: this.props.complete,
              id: edge.node.id,
            },
          }));
      }
      if (this.props.todos.totalCount != null) {
        viewerPayload.todos.completedCount = this.props.complete
          ? this.props.todos.totalCount
          : 0;
      }
    }
    return {
      viewer: viewerPayload,
    };
  }
}

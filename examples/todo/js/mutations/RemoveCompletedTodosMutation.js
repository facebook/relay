export default class RemoveCompletedTodosMutation extends Relay.Mutation {
  static fragments = {
    // TODO: Make completedCount, edges, and totalCount optional
    todos: () => Relay.QL`
      fragment on TodoConnection {
        completedCount,
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
    return Relay.QL`mutation{removeCompletedTodos}`;
  }
  getFatQuery() {
    return Relay.QL`
      fragment on RemoveCompletedTodosPayload {
        deletedTodoIds,
        viewer {
          todos {
            completedCount,
            totalCount,
          },
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
    if (this.props.todos) {
      var {completedCount, totalCount} = this.props.todos;
      if (completedCount != null && totalCount != null) {
        newTotalCount = totalCount - completedCount;
      }
      if (this.props.todos.edges) {
        deletedTodoIds = this.props.todos.edges
          .filter(edge => edge.node.complete)
          .map(edge => edge.node.id);
      }
    }
    return {
      deletedTodoIds,
      viewer: {
        id: this.props.viewer.id,
        todos: {
          completedCount: 0,
          totalCount: newTotalCount,
        },
      },
    };
  }
}

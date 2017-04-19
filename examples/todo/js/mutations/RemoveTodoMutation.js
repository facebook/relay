export default class RemoveTodoMutation extends Relay.Mutation {
  static fragments = {
    // TODO: Mark complete as optional
    todo: () => Relay.QL`
      fragment on Todo {
        complete,
        id,
      }
    `,
    // TODO: Mark completedCount and totalCount as optional
    viewer: () => Relay.QL`
      fragment on User {
        id,
        todos {
          completedCount,
          totalCount,
        },
      }
    `,
  };
  getMutation() {
    return Relay.QL`mutation{removeTodo}`;
  }
  getFatQuery() {
    return Relay.QL`
      fragment on RemoveTodoPayload {
        deletedTodoId,
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
      deletedIDFieldName: 'deletedTodoId',
    }];
  }
  getVariables() {
    return {
      id: this.props.todo.id,
    };
  }
  getOptimisticResponse() {
    var viewerPayload;
    if (this.props.viewer.todos) {
      viewerPayload = {id: this.props.viewer.id, todos: {}};
      if (this.props.viewer.todos.completedCount != null) {
        viewerPayload.todos.completedCount = this.props.todo.complete === true
          ? this.props.viewer.todos.completedCount - 1
          : this.props.viewer.todos.completedCount;
      }
      if (this.props.viewer.todos.totalCount != null) {
        viewerPayload.todos.totalCount = this.props.viewer.todos.totalCount - 1;
      }
    }
    return {
      deletedTodoId: this.props.todo.id,
      viewer: viewerPayload,
    };
  }
}

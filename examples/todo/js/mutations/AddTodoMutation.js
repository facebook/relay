export default class AddTodoMutation extends Relay.Mutation {
  static fragments = {
    viewer: () => Relay.QL`
      fragment on User {
        id,
        todos {
          totalCount,
        },
      }
    `,
  };
  getMutation() {
    return Relay.QL`mutation{addTodo}`;
  }
  getFatQuery() {
    return Relay.QL`
      fragment on AddTodoPayload {
        todoEdge,
        viewer {
          todos {
            totalCount,
          },
        },
      }
    `;
  }
  getConfigs() {
    return [{
      type: 'RANGE_ADD',
      parentName: 'viewer',
      parentID: this.props.viewer.id,
      connectionName: 'todos',
      edgeName: 'todoEdge',
      rangeBehaviors: {
        '': 'append',
      },
    }];
  }
  getVariables() {
    return {
      text: this.props.text,
    };
  }
  getOptimisticResponse() {
    return {
      // FIXME: totalCount gets updated optimistically, but this edge does not
      // get added until the server responds
      todoEdge: {
        node: {
          complete: false,
          text: this.props.text,
        },
      },
      viewer: {
        id: this.props.viewer.id,
        todos: {
          totalCount: this.props.viewer.todos.totalCount + 1,
        },
      },
    };
  }
}

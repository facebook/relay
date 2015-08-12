export default class RenameTodoMutation extends Relay.Mutation {
  static fragments = {
    todo: () => Relay.QL`
      fragment on Todo {
        id,
      }
    `,
  };
  getMutation() {
    return Relay.QL`mutation{renameTodo}`;
  }
  getFatQuery() {
    return Relay.QL`
      fragment on RenameTodoPayload {
        todo {
          text,
        }
      }
    `;
  }
  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        todo: this.props.todo.id,
      },
    }];
  }
  getVariables() {
    return {
      id: this.props.todo.id,
      text: this.props.text,
    };
  }
  getOptimisticResponse() {
    return {
      todo: {
        id: this.props.todo.id,
        text: this.props.text,
      },
    };
  }
}

import MarkAllTodosMutation from '../mutations/MarkAllTodosMutation';
import Todo from './Todo';

class TodoList extends React.Component {
  _handleMarkAllChange = (e) => {
    var complete = e.target.checked;
    Relay.Store.update(
      new MarkAllTodosMutation({
        complete,
        todos: this.props.todos,
        viewer: this.props.viewer,
      })
    );
  }
  renderTodos() {
    return this.props.todos.edges.map(edge =>
      <Todo
        key={edge.node.id}
        todo={edge.node}
        viewer={this.props.viewer}
      />
    );
  }
  render() {
    var numTodos = this.props.todos.totalCount;
    var numCompletedTodos = this.props.todos.completedCount;
    return (
      <section className="main">
        <input
          checked={numTodos === numCompletedTodos}
          className="toggle-all"
          onChange={this._handleMarkAllChange}
          type="checkbox"
        />
        <label htmlFor="toggle-all">
          Mark all as complete
        </label>
        <ul className="todo-list">
          {this.renderTodos()}
        </ul>
      </section>
    );
  }
}

export default Relay.createContainer(TodoList, {
  fragments: {
    todos: () => Relay.QL`
      fragment on TodoConnection {
        completedCount,
        edges {
          node {
            complete,
            id,
            ${Todo.getFragment('todo')},
          },
        },
        totalCount,
        ${MarkAllTodosMutation.getFragment('todos')},
      }
    `,
    viewer: () => Relay.QL`
      fragment on User {
        ${MarkAllTodosMutation.getFragment('viewer')},
        ${Todo.getFragment('viewer')},
      }
    `,
  },
});

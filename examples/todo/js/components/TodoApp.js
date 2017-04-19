import AddTodoMutation from '../mutations/AddTodoMutation';
import TodoList from './TodoList';
import TodoListFooter from './TodoListFooter';
import TodoTextInput from './TodoTextInput';

class TodoApp extends React.Component {
  _handleTextInputSave = (text) => {
    Relay.Store.update(
      new AddTodoMutation({text, viewer: this.props.viewer})
    );
  }
  render() {
    var hasTodos = this.props.viewer.todos.totalCount > 0;
    return (
      <div>
        <section className="todoapp">
          <header className="header">
            <h1>
              todos
            </h1>
            <TodoTextInput
              autoFocus={true}
              className="new-todo"
              onSave={this._handleTextInputSave}
              placeholder="What needs to be done?"
            />
          </header>
          {hasTodos &&
            <TodoList
              todos={this.props.viewer.todos}
              viewer={this.props.viewer}
            />
          }
          {hasTodos &&
            <TodoListFooter
              todos={this.props.viewer.todos}
              viewer={this.props.viewer}
            />
          }
        </section>
        <footer className="info">
          <p>
            Double-click to edit a todo
          </p>
          <p>
            Created by the <a href="https://facebook.github.io/relay/">
              Relay team
            </a>
          </p>
          <p>
            Part of <a href="http://todomvc.com">TodoMVC</a>
          </p>
        </footer>
      </div>
    );
  }
}

export default Relay.createContainer(TodoApp, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on User {
        todos(first: 9007199254740991) {
          edges {
            node {
              id,
            },
          },
          totalCount,
          ${TodoList.getFragment('todos')},
          ${TodoListFooter.getFragment('todos')},
        },
        ${AddTodoMutation.getFragment('viewer')},
        ${TodoList.getFragment('viewer')},
        ${TodoListFooter.getFragment('viewer')},
      }
    `,
  },
});

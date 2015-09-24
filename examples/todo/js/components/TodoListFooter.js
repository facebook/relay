/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import RemoveCompletedTodosMutation from '../mutations/RemoveCompletedTodosMutation';

class TodoListFooter extends React.Component {
  _handleRemoveCompletedTodosClick = () => {
    Relay.Store.update(
      new RemoveCompletedTodosMutation({
        todos: this.props.todos,
        viewer: this.props.viewer,
      })
    );
  }
  render() {
    var numTodos = this.props.todos.totalCount;
    var numCompletedTodos = this.props.todos.completedCount;
    return (
      <footer className="footer">
        <span className="todo-count">
          <strong>{numTodos}</strong> item{numTodos === 1 ? '' : 's'} left
        </span>
        { /* TODO: Implement routing
        <ul className="filters">
          <li>
            <a className="selected" href="#/">All</a>
          </li>
          <li>
            <a href="#/active">Active</a>
          </li>
          <li>
            <a href="#/completed">Completed</a>
          </li>
        </ul>
        */ }
        {numCompletedTodos > 0 &&
          <button
            className="clear-completed"
            onClick={this._handleRemoveCompletedTodosClick}>
            Clear completed
          </button>
        }
      </footer>
    );
  }
}

export default Relay.createContainer(TodoListFooter, {
  fragments: {
    todos: () => Relay.QL`
      fragment on TodoConnection {
        completedCount,
        edges {
          node {
            complete,
          },
        },
        totalCount,
        ${RemoveCompletedTodosMutation.getFragment('todos')},
      }
    `,
    viewer: () => Relay.QL`
      fragment on User {
        ${RemoveCompletedTodosMutation.getFragment('viewer')},
      }
    `,
  },
});

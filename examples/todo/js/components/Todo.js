/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only.  Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import ChangeTodoStatusMutation from '../mutations/ChangeTodoStatusMutation';
import RemoveTodoMutation from '../mutations/RemoveTodoMutation';
import RenameTodoMutation from '../mutations/RenameTodoMutation';
import TodoTextInput from './TodoTextInput';

import React from 'react';
import Relay from 'react-relay';
import classnames from 'classnames';

class Todo extends React.Component {
  state = {
    isEditing: false,
  };
  _handleCompleteChange = (e) => {
    var complete = e.target.checked;
    Relay.Store.update(
      new ChangeTodoStatusMutation({
        complete,
        todo: this.props.todo,
        viewer: this.props.viewer,
      })
    );
  }
  _handleDestroyClick = () => {
    this._removeTodo();
  }
  _handleLabelDoubleClick = () => {
    this._setEditMode(true);
  }
  _handleTextInputCancel = () => {
    this._setEditMode(false);
  }
  _handleTextInputDelete = () => {
    this._setEditMode(false);
    this._removeTodo();
  }
  _handleTextInputSave = (text) => {
    this._setEditMode(false);
    Relay.Store.update(
      new RenameTodoMutation({todo: this.props.todo, text})
    );
  }
  _removeTodo() {
    Relay.Store.update(
      new RemoveTodoMutation({todo: this.props.todo, viewer: this.props.viewer})
    );
  }
  _setEditMode = (shouldEdit) => {
    this.setState({isEditing: shouldEdit});
  }
  renderTextInput() {
    return (
      <TodoTextInput
        className="edit"
        commitOnBlur={true}
        initialValue={this.props.todo.text}
        onCancel={this._handleTextInputCancel}
        onDelete={this._handleTextInputDelete}
        onSave={this._handleTextInputSave}
      />
    );
  }
  render() {
    return (
      <li
        className={classnames({
          completed: this.props.todo.complete,
          editing: this.state.isEditing,
        })}>
        <div className="view">
          <input
            checked={this.props.todo.complete}
            className="toggle"
            onChange={this._handleCompleteChange}
            type="checkbox"
          />
          <label onDoubleClick={this._handleLabelDoubleClick}>
            {this.props.todo.text}
          </label>
          <button
            className="destroy"
            onClick={this._handleDestroyClick}
          />
        </div>
        {this.state.isEditing && this.renderTextInput()}
      </li>
    );
  }
}

export default Relay.createContainer(Todo, {
  fragments: {
    todo: () => Relay.QL`
      fragment on Todo {
        complete,
        id,
        text,
        ${ChangeTodoStatusMutation.getFragment('todo')},
        ${RemoveTodoMutation.getFragment('todo')},
        ${RenameTodoMutation.getFragment('todo')},
      }
    `,
    viewer: () => Relay.QL`
      fragment on User {
        ${ChangeTodoStatusMutation.getFragment('viewer')},
        ${RemoveTodoMutation.getFragment('viewer')},
      }
    `,
  },
});

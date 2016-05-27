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

'use strict';

import AddTodoMutation from '../mutations/AddTodoMutation';
import MarkAllTodosMutation from '../mutations/MarkAllTodosMutation';
import Relay from 'react-relay';
import RemoveTodoMutation from '../mutations/RemoveTodoMutation';
import Swipeout from 'react-native-swipeout';
import Todo from './Todo';
import TodoTextInput from './TodoTextInput';
import React, { Component, PropTypes } from 'react';
import {
  ListView,
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

const _todosDataSource = new ListView.DataSource({
  rowHasChanged: (r1, r2) => r1.__dataID__ !== r2.__dataID__,
});

class TodoList extends Component {
  static propTypes = {
    status: PropTypes.oneOf(['active', 'any', 'completed']).isRequired,
    style: View.propTypes.style,
  };
  constructor(props, context) {
    super(props, context);
    const {edges} = props.viewer.todos;
    this.state = {
      initialListSize: edges.length,
      listScrollEnabled: true,
      todosDataSource: _todosDataSource.cloneWithRows(edges),
    };
    this._handleMarkAllPress = this._handleMarkAllPress.bind(this);
    this._handleSwipeInactive = this._handleSwipeInactive.bind(this);
    this._handleTextInputSave = this._handleTextInputSave.bind(this);
    this._handleTodoDestroy = this._handleTodoDestroy.bind(this);
    this.renderTodoEdge = this.renderTodoEdge.bind(this);
  }
  _handleMarkAllPress() {
    const numTodos = this.props.viewer.totalCount;
    const numCompletedTodos = this.props.viewer.completedCount;
    const complete = numTodos !== numCompletedTodos;
    this.props.relay.commitUpdate(
      new MarkAllTodosMutation({
        complete,
        todos: this.props.viewer.todos,
        viewer: this.props.viewer,
      })
    );
  }
  _handleSwipeInactive(swipeInactive) {
    this.setState({listScrollEnabled: swipeInactive});
  }
  _handleTextInputSave(text) {
    this.props.relay.commitUpdate(
      new AddTodoMutation({text, viewer: this.props.viewer})
    );
  }
  _handleTodoDestroy(todo) {
    this.props.relay.commitUpdate(
      new RemoveTodoMutation({
        todo,
        viewer: this.props.viewer,
      })
    );
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.viewer.todos.edges !== nextProps.viewer.todos.edges) {
      this.setState({
        todosDataSource:
          _todosDataSource.cloneWithRows(nextProps.viewer.todos.edges),
      });
    }
  }
  renderTodoEdge(todoEdge) {
    const destroyHandler = this._handleTodoDestroy.bind(null, todoEdge.node);
    return (
      <Swipeout
        key={todoEdge.node.id}
        right={[{
          text: 'Delete',
          type: 'delete',
          onPress: destroyHandler,
        }]}
        scroll={this._handleSwipeInactive}>
        <Todo
          onDestroy={destroyHandler}
          style={styles.todo}
          todo={todoEdge.node}
          viewer={this.props.viewer}
        />
      </Swipeout>
    );
  }
  renderSeparator(sectionId, rowId) {
    return <View key={`sep_${sectionId}_${rowId}`} style={styles.separator} />;
  }
  render() {
    const numTodos = this.props.viewer.totalCount;
    const numCompletedTodos = this.props.viewer.completedCount;
    return (
      <View style={[this.props.style, styles.container]}>
        <View style={styles.addTodoContainer}>
          <TouchableHighlight
            onPress={this._handleMarkAllPress}
            style={styles.markAllButtonContainer}
            underlayColor="transparent">
            <Text
              style={[
                styles.markAllButton,
                numTodos !== numCompletedTodos && styles.markAllButtonDisabled,
              ]}>
              {'\u276F'}
            </Text>
          </TouchableHighlight>
          <TodoTextInput
            clearButtonMode="while-editing"
            onSave={this._handleTextInputSave}
            placeholder="What needs to be done?"
            style={styles.input}
          />
        </View>
        <ListView
          dataSource={this.state.todosDataSource}
          enableEmptySections={true}
          initialListSize={this.state.initialListSize}
          renderRow={this.renderTodoEdge}
          renderSeparator={this.renderSeparator}
        />
      </View>
    );
  }
}

export default Relay.createContainer(TodoList, {
  initialVariables: {
    status: 'any',
  },
  prepareVariables({status}) {
    let nextStatus;
    if (status === 'active' || status === 'completed') {
      nextStatus = status;
    } else {
      // This matches the Backbone example, which displays all todos on an
      // invalid route.
      nextStatus = 'any';
    }
    return {
      status: nextStatus,
    };
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on User {
        completedCount
        todos(
          status: $status,
          first: 2147483647  # max GraphQLInt
        ) {
          edges {
            node {
              id
              ${RemoveTodoMutation.getFragment('todo')}
              ${Todo.getFragment('todo')}
            }
          }
          ${MarkAllTodosMutation.getFragment('todos')}
        }
        totalCount
        ${AddTodoMutation.getFragment('viewer')}
        ${MarkAllTodosMutation.getFragment('viewer')}
        ${RemoveTodoMutation.getFragment('viewer')}
        ${Todo.getFragment('viewer')}
      }
    `,
  },
});

const styles = StyleSheet.create({
  addTodoContainer: {
    borderBottomColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: 1,
    height: 58,
    paddingHorizontal: 8,
    paddingVertical: 9,
  },
  container: {
    backgroundColor: 'white',
  },
  input: {
    bottom: 0,
    // FIXME: TextInput doesn't honor `fontWeight` or `fontStyle`
    //        https://github.com/facebook/react-native/issues/2140
    fontFamily: Platform.OS === 'android' ? 'sans-serif-light' : undefined,
    fontSize: 24,
    fontStyle: 'italic',
    fontWeight: '300',
    // fontFamily: Platform.OS === 'android' ? 'sans-serif-regular' : undefined,
    left: Platform.OS === 'android' ? 61 : 65,
    position: 'absolute',
    right: 15,
    top: 0,
  },
  markAllButton: {
    color: '#737373',
    fontSize: 22,
  },
  markAllButtonContainer: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    transform: [{rotate: '90deg'}],
    width: 44,
  },
  markAllButtonDisabled: {
    color: '#e6e6e6',
  },
  separator: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    height: 1,
  },
  todo: {
    backgroundColor: 'white',
    flex: 1,
    paddingLeft: 10,
    paddingRight: 8,
  },
});

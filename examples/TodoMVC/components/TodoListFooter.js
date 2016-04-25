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

import Relay from 'react-relay';
import RemoveCompletedTodosMutation from '../mutations/RemoveCompletedTodosMutation';
import React, {
  Component,
  PropTypes,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

class TodoListFooter extends Component {
  static propTypes = {
    status: PropTypes.oneOf(['active', 'any', 'completed']).isRequired,
    style: View.propTypes.style,
  };
  constructor(props, context) {
    super(props, context);
    this._handleRemoveCompletedTodosPress =
      this._handleRemoveCompletedTodosPress.bind(this);
  }
  _handleRemoveCompletedTodosPress() {
    Relay.Store.commitUpdate(
      new RemoveCompletedTodosMutation({
        todos: this.props.viewer.todos,
        viewer: this.props.viewer,
      })
    );
  }
  render() {
    const numCompletedTodos = this.props.viewer.completedCount;
    const numRemainingTodos = this.props.viewer.totalCount - numCompletedTodos;
    return (
      <View style={[this.props.style, styles.container]}>
        <Text>
          <Text style={styles.strong}>
            {numRemainingTodos}
          </Text> item{numRemainingTodos === 1 ? '' : 's'} left
        </Text>
        {numCompletedTodos > 0 &&
          <TouchableHighlight onPress={this._handleRemoveCompletedTodosPress}>
            <Text>Clear completed</Text>
          </TouchableHighlight>
        }
      </View>
    );
  }
}

export default Relay.createContainer(TodoListFooter, {
  initialVariables: {
    status: 'any',
  },
  prepareVariables(prevVars) {
    return {
      ...prevVars,
      limit: 2147483647,  // GraphQLInt
    };
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on User {
        completedCount
        todos(status: $status, first: $limit) {
          ${RemoveCompletedTodosMutation.getFragment('todos')}
        }
        totalCount
        ${RemoveCompletedTodosMutation.getFragment('viewer')}
      }
    `,
  },
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 40,
    justifyContent: 'space-between',
  },
  strong: {
    fontWeight: 'bold',
  },
});

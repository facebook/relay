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

import ChangeTodoStatusMutation from '../mutations/ChangeTodoStatusMutation';
import RenameTodoMutation from '../mutations/RenameTodoMutation';
import Relay from 'react-relay';
import TodoTextInput from './TodoTextInput';
import React, { Component, PropTypes } from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

class Todo extends Component {
  static propTypes = {
    onDestroy: PropTypes.func.isRequired,
    style: View.propTypes.style,
  };
  state = {
    isEditing: false,
  };
  constructor(props, context) {
    super(props, context);
    this._handleCompletePress = this._handleCompletePress.bind(this);
    this._handleLabelPress = this._handleLabelPress.bind(this);
    this._handleTextInputCancel = this._handleTextInputCancel.bind(this);
    this._handleTextInputDelete = this._handleTextInputDelete.bind(this);
    this._handleTextInputSave = this._handleTextInputSave.bind(this);
    this._setEditMode = this._setEditMode.bind(this);
  }
  _handleCompletePress() {
    const complete = !this.props.todo.complete;
    this.props.relay.commitUpdate(
      new ChangeTodoStatusMutation({
        complete,
        todo: this.props.todo,
        viewer: this.props.viewer,
      })
    );
  }
  _handleLabelPress() {
    this._setEditMode(true);
  }
  _handleTextInputCancel() {
    this._setEditMode(false);
  }
  _handleTextInputDelete() {
    this._setEditMode(false);
    this.props.onDestroy();
  }
  _handleTextInputSave(text) {
    this._setEditMode(false);
    this.props.relay.commitUpdate(
      new RenameTodoMutation({todo: this.props.todo, text})
    );
  }
  _setEditMode(shouldEdit) {
    this.setState({isEditing: shouldEdit});
  }
  renderCompleteCheckbox() {
    const imageModule = this.props.todo.complete ?
      require('../images/todo_checkbox-active.png') :
      require('../images/todo_checkbox.png');
    return (
      <TouchableHighlight
        onPress={this._handleCompletePress}
        style={styles.checkbox}
        underlayColor="transparent">
        <Image source={imageModule} />
      </TouchableHighlight>
    );
  }
  render() {
    return (
      <View style={[this.props.style, styles.container]}>
        {this.renderCompleteCheckbox()}
        {this.state.isEditing ?
          <TodoTextInput
            autoFocus={true}
            commitOnBlur={true}
            initialValue={this.props.todo.text}
            onCancel={this._handleTextInputCancel}
            onDelete={this._handleTextInputDelete}
            onSave={this._handleTextInputSave}
            style={[styles.labelText, styles.inputText, styles.input]}
          /> :
          <TouchableHighlight
            activeOpacity={1}
            onPress={this._handleLabelPress}
            style={styles.label}
            underlayColor="transparent">
            <Text
              numberOfLines={1}
              style={styles.labelText}>
              {this.props.todo.text}
            </Text>
          </TouchableHighlight>
        }
      </View>
    );
  }
}

export default Relay.createContainer(Todo, {
  fragments: {
    todo: () => Relay.QL`
      fragment on Todo {
        complete
        id
        text
        ${ChangeTodoStatusMutation.getFragment('todo')}
        ${RenameTodoMutation.getFragment('todo')}
      }
    `,
    viewer: () => Relay.QL`
      fragment on User {
        ${ChangeTodoStatusMutation.getFragment('viewer')}
      }
    `,
  },
});

const styles = StyleSheet.create({
  checkbox: {
    width: 40,
  },
  container: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    height: 58,
  },
  input: {
    flex: 1,
  },
  inputText: {
    marginHorizontal: Platform.OS === 'android' ? 11 : 15,
  },
  label: {
    borderBottomColor: Platform.OS === 'android' ? 'transparent' : undefined,
    borderBottomWidth: Platform.OS === 'android' ? 1 : undefined,
    flex: 1,
  },
  labelText: {
    color: 'rgb(77, 77, 77)',
    fontFamily: Platform.OS === 'android' ? 'sans-serif-regular' : undefined,
    fontSize: 24,
    fontWeight: '300',
    marginHorizontal: 15,
    textAlign: 'left',
  },
});

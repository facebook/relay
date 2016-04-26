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

import React, { Component, PropTypes } from 'react';
import {
  TextInput,
} from 'react-native';

export default class TodoTextInput extends Component {
  static defaultProps = {
    commitOnBlur: false,
  };
  static propTypes = {
    autoFocus: TextInput.propTypes.autoFocus,
    clearButtonMode: TextInput.propTypes.clearButtonMode,
    commitOnBlur: PropTypes.bool.isRequired,
    onCancel: PropTypes.func,
    onDelete: PropTypes.func,
    onSave: PropTypes.func.isRequired,
    placeholder: TextInput.propTypes.placeholder,
    style: TextInput.propTypes.style,
    value: TextInput.propTypes.value,
  };
  state = {
    text: this.props.initialValue || '',
  };
  constructor(props, context) {
    super(props, context);
    this._commitChanges = this._commitChanges.bind(this);
    this._handleBlur = this._handleBlur.bind(this);
    this._handleChangeText = this._handleChangeText.bind(this);
    this._handleSubmitEditing = this._handleSubmitEditing.bind(this);
  }
  _commitChanges() {
    const newText = this.state.text.trim();
    if (this.props.onDelete && newText === '') {
      this.props.onDelete();
    } else if (this.props.onCancel && newText === this.props.initialValue) {
      this.props.onCancel();
    } else if (newText !== '') {
      this.props.onSave(newText);
      if (this._mounted !== false) {
        this.setState({text: ''});
      }
    }
  }
  _handleBlur() {
    if (this.props.commitOnBlur) {
      this._commitChanges();
    }
  }
  _handleChangeText(text) {
    if (this._mounted !== false) {
      this.setState({text: text});
    }
  }
  _handleSubmitEditing() {
    this._commitChanges();
  }
  componentWillUnmount() {
    this._mounted = false;
  }
  render() {
    return (
      <TextInput
        autoFocus={this.props.autoFocus}
        clearButtonMode={this.props.clearButtonMode}
        onBlur={this._handleBlur}
        onChangeText={this._handleChangeText}
        onSubmitEditing={this._handleSubmitEditing}
        placeholder={this.props.placeholder}
        style={this.props.style}
        underlineColorAndroid="transparent"
        value={this.state.text}
      />
    );
  }
}

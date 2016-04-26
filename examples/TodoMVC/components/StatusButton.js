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
  StyleSheet,
  Text,
  TouchableHighlight,
} from 'react-native';

export default class StatusButton extends Component {
  static propTypes = {
    active: PropTypes.bool.isRequired,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]).isRequired,
    onPress: PropTypes.func.isRequired,
    style: Text.propTypes.style,
  };
  render() {
    return (
      <TouchableHighlight
        onPress={this.props.onPress}
        style={[
          styles.baseButton,
          this.props.active && styles.activeButton,
        ]}
        underlayColor="transparent">
        <Text style={[this.props.style, styles.buttonText]}>
          {this.props.children}
        </Text>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  activeButton: {
    borderColor: 'rgba(175, 47, 47, 0.2)',
    borderRadius: 6,
  },
  baseButton: {
    borderColor: 'transparent',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    top: 1,
  },
  buttonText: {
    fontSize: 16,
  },
});

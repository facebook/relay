/**
 * This file is provided by Facebook for testing and evaluation purposes
 * only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
 * AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from 'react';
import Relay from 'react-relay';
import AddMessageMutation from '../mutations/AddMessageMutation';

var ENTER_KEY_CODE = 13;

class MessageComposer extends React.Component {

  state = {text: ''};

  render() {
    return (
      <textarea
        className="message-composer"
        name="message"
        value={this.state.text}
        onChange={this._onChange}
        onKeyDown={this._onKeyDown}
      />
    );
  }

  _onChange = (event) => {
    this.setState({text: event.target.value});
  }

  _onKeyDown = (event) => {
    if (event.keyCode === ENTER_KEY_CODE) {
      event.preventDefault();
      var text = this.state.text.trim();
      if (text) {
        Relay.Store.update(new AddMessageMutation({
          text,
          viewer: this.props.viewer,
          thread: this.props.thread
        }));
      }
      this.setState({text: ''});
    }
  }

}

export default Relay.createContainer(MessageComposer, {
  fragments: {
    thread: () => Relay.QL`
      fragment on Thread {
        id
        ${AddMessageMutation.getFragment('thread')}
      }
    `,
    viewer: () => Relay.QL`
      fragment on User {
        id
        ${AddMessageMutation.getFragment('viewer')}
      }
    `,
  }
});

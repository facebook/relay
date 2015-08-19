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
import MessageComposer from './MessageComposer';
import MessageListItem from './MessageListItem';

function getMessageListItem(edge) {
  return (
    <MessageListItem
      key={edge.node.id}
      message={edge.node}
    />
  );
}

class MessageSection extends React.Component {

  render() {
    var messageListItems = this.props.messages.edges.map(getMessageListItem);
    return (
      <div className="message-section">
        <h3 className="message-thread-heading">{this.props.thread.name}</h3>
        <ul className="message-list" ref="messageList">
          {messageListItems}
        </ul>
        <MessageComposer threadID={this.props.thread.id}/>
      </div>
    );
  }

  componentDidUpdate() {
    this._scrollToBottom();
  }

  _scrollToBottom() {
    var ul = React.findDomNode(this.refs.messageList);
    ul.scrollTop = ul.scrollHeight;
  }

}

export default Relay.createContainer(MessageSection, {
  fragments: {
    thread: () => Relay.QL`
      fragment on Thread {
        id,
        name
        messages {
          edges {
            node {
              ${MessageListItem.getFragment('message')}
            }
          }
        }
        ${MessageComposer.getFragment('thread')}
      }
    `,
    viewer: () => Relay.QL`
      fragment on User {
        ${MessageComposer.getFragment('viewer')}
      }
    `
  }
});

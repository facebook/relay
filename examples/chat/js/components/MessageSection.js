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
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import MessageComposer from './MessageComposer';
import MessageListItem from './MessageListItem';

class MessageSection extends React.Component {

  render() {
    const {thread, viewer} = this.props;
    var messageListItems = thread.messages.edges.map(edge => {
      return (
        <MessageListItem
          key={edge.node.id}
          message={edge.node}
        />
      );
    });
    return (
      <div className="message-section">
        <h3 className="message-thread-heading">{thread.name}</h3>
        <ul className="message-list" ref="messageList">
          {messageListItems}
        </ul>
        <MessageComposer thread={thread} viewer={viewer}/>
      </div>
    );
  }

  componentDidUpdate() {
    this._scrollToBottom();
  }

  _scrollToBottom() {
    var ul = ReactDOM.findDOMNode(this.refs.messageList);
    ul.scrollTop = ul.scrollHeight;
  }

}

export default Relay.createContainer(MessageSection, {
  fragments: {
    thread: () => Relay.QL`
      fragment on Thread {
        name
        messages(first: 9007199254740991) {
          edges {
            node {
              id,
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

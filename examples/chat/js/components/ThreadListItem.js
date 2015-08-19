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
// import classNames from 'classnames';
import MarkThreadAsReadMutation from '../mutations/MarkThreadAsReadMutation';

class ThreadListItem extends React.Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  }

  render() {
    var thread = this.props.thread;
    var lastMessage = thread.messages.edges[0].node;
    return (
      <li
        // className={classNames({
        //   'thread-list-item': true,
        //   active: thread.id === this.props.currentThreadID
        // })}
        onClick={this._onClick}>
        <h5 className="thread-name">{thread.name}</h5>
        <div className="thread-time">
          {new Date(lastMessage.timestamp).toLocaleTimeString()}
        </div>
        <div className="thread-last-message">
          {lastMessage.text}
        </div>
      </li>
    );
  }

  _onClick = () => {
    this.context.router.transitionTo(`/thread/${this.props.thread.id}`);
    Relay.Store.update(new MarkThreadAsReadMutation({
      viewer: this.props.viewer,
      thread: this.props.thread,
      isRead: true
    }));
  }

}

export default Relay.createContainer(ThreadListItem, {
  fragments: {
    thread: () => Relay.QL`
      fragment on Thread {
        id,
        name,
        messages(last: 1) {
          edges {
            node {
              text,
              timestamp
            }
          }
        },
        ${MarkThreadAsReadMutation.getFragment('thread')}
      }
    `,
    viewer: () => Relay.QL`
      fragment on User {
        ${MarkThreadAsReadMutation.getFragment('viewer')}
      }
    `
  }
});

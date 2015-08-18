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
import ThreadListItem from '../components/ThreadListItem';

class ThreadSection extends React.Component {

  render() {
    var threadListItems = this.props.threads.edges.map(edge => {
      return (
        <ThreadListItem
          key={edge.node.id}
          thread={edge.node}
          currentThreadID={window.history.state.currentThreadID}
        />
      );
    }, this);
    var unread = this.props.threads.unreadCount === 0 ?
      null :
      <span>Unread threads: {this.props.threads.unreadCount}</span>;
    return (
      <div className="thread-section">
        <div className="thread-count">
          {unread}
        </div>
        <ul className="thread-list">
          {threadListItems}
          </ul>
      </div>
    );
  }

}

export default Relay.createContainer(ThreadSection, {
  fragments: {
    threads: () => Relay.QL`
      fragment on ThreadConnection {
        unreadCount,
        edges {
          node {
            ${ThreadListItem.getFragment('thread')}
          }
        }
      }
    `,
    viewer: () => Relay.QL`
      fragment on User {
        ${ThreadListItem.getFragment('viewer')}
      }
    `
  }
});

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
import MessageSection from './MessageSection';
import ThreadSection from './ThreadSection';

class ChatApp extends React.Component {

  componentDidMount() {
    // by default, set threads[0] to currentID that MessageSection will show
    let currentThreadID = this.props.viewer.threads.edges[0].node.id;
    if (!window.history.state) {
      window.history.pushState({currentThreadID}, '');
    }
  }

  render() {
    return (
      <div className="chatapp">
        <ThreadSection />
        <MessageSection />
      </div>
    );
  }

}

export default Relay.createContainer(ChatApp, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on User {
        threads(first: 9007199254740991) {
          edges {
            node {
              id,
              ${MessageSection.getFragment('thread')}
            },
          },
          ${ThreadSection.getFragment('threads')}
        },
        ${ThreadSection.getFragment('viewer')}
      }
    `,
  },
});

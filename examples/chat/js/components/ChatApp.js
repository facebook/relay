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
import ThreadSection from './ThreadSection';
import MessageSection from './MessageSection';

class ChatApp extends React.Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  }

  componentWillMount() {
    // by default, set threads[0].id to currentID if pathname === '/'
    // TODO: better if we can do it in route config
    let currentThreadID = this.props.viewer.threads.edges[0].node.id;
    if (window.location.pathname === '/' ) {
      this.context.router.transitionTo(`/thread/${currentThreadID}`);
    }
  }

  render() {
    let {viewer} = this.props;
    console.log('MessageSection', MessageSection);
    console.log('ChatApp.props.children', this.props.children);
    return (
      <div className="chatapp">
        <ThreadSection threads={viewer.threads} viewer={viewer}/>
        {this.props.children}
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
            },
          },
          ${ThreadSection.getFragment('threads')}
        },
        ${ThreadSection.getFragment('viewer')},
        ${MessageSection.getFragment('viewer')}
      }
    `
  },
});

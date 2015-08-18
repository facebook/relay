export default class AddMessageMutation extends Relay.Mutation {
  static fragments = {
    viewer: () => Relay.QL`
      fragment on User {
        id,
        threads {
          unreadCount,
        },
      }
    `,
  };
  getMutation() {
    return Relay.QL`mutation{addMessage}`;
  }
  getFatQuery() {
    return Relay.QL`
      fragment on addMessagePayload {
        messageEdge,
        thread,
        viewer {
          threads {
            unreadCount,
          },
        },
      }
    `;
  }
  getConfigs() {
    return [{
      type: 'RANGE_ADD',
      parentName: 'thread',
      parentID: this.props.thread.id,
      connectionName: 'messages',
      edgeName: 'messageEdge',
      rangeBehaviors: {
        '': 'append',
      },
    }];
  }
  getVariables() {
    return {
      text: this.props.text,
    };
  }
  getOptimisticResponse() {
    return {
      messageEdge: {
        node: {
          id: 'm_' + Date.now(),
          authorName: 'me', // hard coded for the example
          timestamp: Date.now(),
          text: this.props.text,
        },
      },
      thread: {
        id: this.props.currentThreadID,
        isRead: true
      },
      viewer: {
        id: this.props.viewer.id
      },
    };
  }
}

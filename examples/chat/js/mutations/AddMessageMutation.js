import Relay from 'react-relay';

export default class AddMessageMutation extends Relay.Mutation {
  static fragments = {
    thread: () => Relay.QL`
      fragment on Thread {
        id,
        isRead,
        lastUpdated
      }
    `,
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
      fragment on AddMessagePayload {
        messageEdge,
        thread {
          isRead,
          lastUpdated
        },
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
      id: this.props.thread.id
    };
  }
  getOptimisticResponse() {
    console.log('AddMessageMutation getOptimisticResponse', this.props);
    let timestamp = Date.now();
    return {
      messageEdge: {
        node: {
          id: 'm_' + timestamp,
          authorName: 'me', // hard coded for the example
          timestamp: timestamp,
          text: this.props.text,
        },
      },
      thread: {
        id: this.props.thread.id,
        isRead: true,
        lastUpdated: timestamp
      },
      viewer: {
        id: this.props.viewer.id
      },
    };
  }
}

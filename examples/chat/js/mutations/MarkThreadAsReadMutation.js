import Relay from 'react-relay';

export default class MarkThreadAsReadMutation extends Relay.Mutation {
  static fragments = {
    thread: () => Relay.QL`
      fragment on Thread {
        id,
        isRead
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
    return Relay.QL`mutation{markThreadAsRead}`;
  }
  getFatQuery() {
    return Relay.QL`
      fragment on MarkThreadAsReadPayload {
        thread {
          isRead,
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
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        thread: this.props.thread.id,
        viewer: this.props.viewer.id,
      },
    }];
  }
  getVariables() {
    return {
      id: this.props.thread.id,
    };
  }
  getOptimisticResponse() {
    var viewerPayload;
    var threads = this.props.viewer.threads;
    if (threads) {
      viewerPayload = {id: this.props.viewer.id, threads: {}};
      if (threads.unreadCount != null) {
        viewerPayload.threads.unreadCount = threads.unreadCount > 0 ?
          threads.unreadCount - 1 : 0;
      }
    }
    return {
      thread: {
        isRead: this.props.isRead,
        id: this.props.thread.id,
      },
      viewer: viewerPayload,
    };
  }
}

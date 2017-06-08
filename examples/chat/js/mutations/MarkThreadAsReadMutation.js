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
    let viewerPayload;
    const {id, threads} = this.props.viewer;
    const {unreadCount} = threads;
    if (threads) {
      viewerPayload = {id: id, threads: {}};
      if (unreadCount != null) {
        viewerPayload.threads.unreadCount = unreadCount > 0 ?
          !this.props.thread.isRead ? unreadCount - 1 : unreadCount
          : 0;
    // make sure no double decrementing on same thread and no minus unreadCount
      }
    }
    return {
      thread: {
        isRead: this.props.isRead,
        id: this.props.thread.id,
      },
      viewer: viewerPayload
    };
  }
}

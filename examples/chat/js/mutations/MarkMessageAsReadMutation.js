export default class ChangeTodoStatusMutation extends Relay.Mutation {
  static fragments = {
    todo: () => Relay.QL`
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
        todo: this.props.thread.id,
        viewer: this.props.viewer.id,
      },
    }];
  }
  getVariables() {
    return {
      isRead: this.props.isRead,
      id: this.props.thread.id,
    };
  }
  getOptimisticResponse() {
    var viewerPayload;
    if (this.props.viewer.threads) {
      viewerPayload = {id: this.props.viewer.id, threads: {}};
      if (this.props.viewer.threads.unreadCount != null) {
        viewerPayload.threads.unreadCount = this.props.isRead
          ? this.props.viewer.threads.unreadCount + 1
          : this.props.viewer.threads.unreadCount - 1;
      }
    }
    return {
      todo: {
        isRead: this.props.isRead,
        id: this.props.thread.id,
      },
      viewer: viewerPayload,
    };
  }
}

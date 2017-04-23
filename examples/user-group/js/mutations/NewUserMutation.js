import Relay from 'react-relay';

export default class NewUserMutation extends Relay.Mutation {
  static fragments = {
    viewer: () => Relay.QL`
      fragment on Viewer {
        id,
      }
    `,
  };
  getMutation () {
    return Relay.QL`mutation{newUser}`;
  }
  getFatQuery () {
    return Relay.QL`
      fragment on NewUserPayload {
        userEdge,
        viewer {
          users,
        },
      }
    `;
  }
  getConfigs () {
    return [{
      type: 'RANGE_ADD',
      parentName: 'viewer',
      parentID: this.props.viewer.id,
      connectionName: 'users',
      edgeName: 'userEdge',
      rangeBehaviors: {
        '': 'append',
      },
    }];
  }
  getVariables () {
    return {
      userName: this.props.userName,
    };
  }
}

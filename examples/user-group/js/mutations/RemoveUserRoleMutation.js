import Relay from 'react-relay';

export default class RemoveUserRoleMutation extends Relay.Mutation {
  static fragments = {
    user: () => Relay.QL`
      fragment on User {
        id,
      }
    `,
    role: () => Relay.QL`
      fragment on Role {
        id,
      }
    `,
  };
  getMutation () {
    return Relay.QL`mutation{removeUserRole}`;
  }
  getFatQuery () {
    return Relay.QL`
      fragment on RemoveUserRolePayload {
        user,
        role,
        removedUserID,
        removedRoleID,
      }
    `;
  }
  getConfigs () {
    return [
      {
        type: 'NODE_DELETE',
        parentName: 'user',
        parentID: this.props.user.id,
        connectionName: 'roles',
        deletedIDFieldName: 'removedRoleID',
      },
      {
        type: 'NODE_DELETE',
        parentName: 'role',
        parentID: this.props.role.id,
        connectionName: 'users',
        deletedIDFieldName: 'removedUserID',
      },
    ];
  }
  getVariables () {
    return {
      userId: this.props.user.id,
      roleId: this.props.role.id,
    };
  }
}


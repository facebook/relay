import RemoveUserRoleMutation from '../mutations/RemoveUserRoleMutation';
import React from 'react';
import Relay from 'react-relay';

class UserSwitch extends React.Component {
  _handleDestroyClick = () => {
    this._removeUser();
  }
  _removeUser () {
    Relay.Store.update(
      new RemoveUserRoleMutation({
        user: this.props.user,
        role: this.props.role,
      })
    );
  }
  render () {
    var {user} = this.props;
    return <div onClick={this._handleDestroyClick}>{user.name}</div>;
  }
}

export default Relay.createContainer(UserSwitch, {
  fragments: {
    role: () => Relay.QL`
      fragment on Role {
        id,
        ${RemoveUserRoleMutation.getFragment('role')},
      }
    `,
    user: () => Relay.QL`
      fragment on User {
        id,
        name,
        ${RemoveUserRoleMutation.getFragment('user')},
      }
    `,
  },
});


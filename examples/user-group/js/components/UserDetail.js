import React from 'react';
import Relay from 'react-relay';
import RoleSwitch from './RoleSwitch';

class UserDetail extends React.Component {
  getStyles () {
    return {
      name: {
        display: 'inline-block',
        width: '70%',
      },
      listContainer: {
        display: 'inline-block',
        width: '30%',
      },
      list: {
        display: 'flex',
        padding: 0,
        listStyleType: 'none',
      },
      item: {
        flexGrow: 1,
      },
    };
  }
  render () {
    var {user, roles} = this.props;
    var styles = this.getStyles();
    var userRoleIds = user.roles.edges.map(edge => edge.node.id);

    return <div style={styles.container}>
      <span style={styles.name}>{user.name}</span>
      <div style={styles.listContainer}>
        <ul style={styles.list}>
          {roles.edges.map(edge => <li key={edge.node.id} style={styles.item}>
            <RoleSwitch
              user={user}
              role={edge.node}
              connected={!!userRoleIds.find(id => id === edge.node.id)}
            />
          </li>)}
        </ul>
      </div>
    </div>;
  }
}

export default Relay.createContainer(UserDetail, {
  fragments: {
    user: () => Relay.QL`
      fragment on User {
        name,
        roles(first: 10) {
          edges {
            node {
              id,
            }
          }
        },
        ${RoleSwitch.getFragment('user')},
      }
    `,
    roles: () => Relay.QL`
      fragment on RoleConnection {
        edges {
          node {
            id,
            ${RoleSwitch.getFragment('role')},
          }
        }
      }
    `,
  },
});


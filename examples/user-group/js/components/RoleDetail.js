import React from 'react';
import Relay from 'react-relay';
import UserSwitch from './UserSwitch';

class RoleDetail extends React.Component {
  getStyles () {
    return {
      container: {
        padding: '0 1.34em',
      },
      name: {
        margin: 0,
        fontWeight: 'bold',
      },
      list: {
        margin: '0.4em 0 0.67em 1em',
        padding: 0,
        listStyleType: 'none',
      },
    };
  }
  render () {
    var {role} = this.props;
    var styles = this.getStyles();
    return <div style={styles.container}>
      <div style={styles.name}>{role.name}</div>
      <ul style={styles.list}>
        {role.users.edges.map(edge => <li key={edge.node.id}>
          <UserSwitch role={role} user={edge.node} />
        </li>)}
      </ul>
    </div>;
  }
}

export default Relay.createContainer(RoleDetail, {
  fragments: {
    role: () => Relay.QL`
      fragment on Role {
        name,
        users(first: 10) {
          edges {
            node {
              id,
              ${UserSwitch.getFragment('user')},
            }
          }
        },
        ${UserSwitch.getFragment('role')},
      }
    `,
  },
});


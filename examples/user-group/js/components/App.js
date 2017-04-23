import React from 'react';
import Relay from 'react-relay';
import NewUser from './NewUser';
import UserDetail from './UserDetail';
import RoleDetail from './RoleDetail';

class App extends React.Component {
  getStyles () {
    return {
      container: {
        display: 'flex',
        flexWrap: 'wrap',
        lineHeight: '1.34em',
      },
      list: {
        flexGrow: 1,
        padding: 0,
        minWidth: 200,
        maxWidth: 260,
        listStyleType: 'none',
      },
    };
  }
  render () {
    var {viewer} = this.props;
    var styles = this.getStyles();
    var {users, roles} = viewer;

    return <div style={styles.container}>
      <ul style={styles.list}>
        {users.edges.map(edge => <li key={edge.node.id}>
          <UserDetail user={edge.node} roles={roles} />
        </li>)}
        <li><NewUser viewer={viewer}/></li>
      </ul>
      <ul style={styles.list}>
        {roles.edges.map(edge => <li key={edge.node.id}>
          <RoleDetail role={edge.node} />
        </li>)}
      </ul>
    </div>;
  }
}

export default Relay.createContainer(App, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        users(first: 18) {
          edges {
            node {
              id,
              ${UserDetail.getFragment('user')},
            },
          }
        },
        roles(first: 5) {
          edges {
            node {
              id,
              ${RoleDetail.getFragment('role')},
            },
          }
          ${UserDetail.getFragment('roles')},
        },
        ${NewUser.getFragment('viewer')},
      }
    `,
  },
});


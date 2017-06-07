import HobbyList from './HobbyList.js';
import FriendsList from './FriendsList.js';

class User extends React.Component {
  render() {
    var user = this.props.user;

    return (
      <div>
        <h1>Hello {user.name} {user.surname}</h1>
        <h2>Hobbies</h2>
        <HobbyList user={user} />
        <h2>Friends</h2>
        <FriendsList user={user} />
        <h2>Age: {user.age}</h2>
      </div>
    );
  }
}

export default Relay.createContainer(User, {
  fragments: {
    user: () => Relay.QL`
      fragment on User {
        id
        name
        surname
        age
        ${HobbyList.getFragment('user')}
        ${FriendsList.getFragment('user')}
      }
    `
  }
});
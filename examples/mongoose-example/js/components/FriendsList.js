import Friend from './Friend.js';

class FriendList extends React.Component {
  render() {
    let user = this.props.user;
    let friends = user.friends.map((friend) => {
      return <Friend friend={friend} />;
    });

    return (<div>{friends}</div>);
  }
}

export default Relay.createContainer(FriendList, {
  fragments: {
    user: () => Relay.QL`
      fragment on User {
        friends {
          ${Friend.getFragment('friend')}
        }
      }`
  }
});
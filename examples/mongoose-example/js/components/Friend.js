class Friend extends React.Component {
  render() {
    let friend = this.props.friend;
    return (
      <li>
        {friend.name} {friend.surname} ({friend.age})
      </li>
    );
  }
}

export default Relay.createContainer(Friend, {
  fragments: {
    friend: () => Relay.QL`
      fragment on User {
        name
        surname
        age
      }`
  }
});
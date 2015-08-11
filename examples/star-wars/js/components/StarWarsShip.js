class StarWarsShip extends React.Component {
  render() {
    var {ship} = this.props;
    return <div>{ship.name}</div>;
  }
}

export default Relay.createContainer(StarWarsShip, {
  fragments: {
    ship: () => Relay.QL`
      fragment on Ship {
        name
      }
    `,
  },
});

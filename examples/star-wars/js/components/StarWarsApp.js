import StarWarsShip from './StarWarsShip';

class StarWarsApp extends React.Component {
  render() {
    var {factions} = this.props;
    return (
      <ol>
        {factions.map(faction => (
          <li>
            <h1>{faction.name}</h1>
            <ol>
              {faction.ships.edges.map(edge => (
                <li><StarWarsShip ship={edge.node} /></li>
              ))}
            </ol>
          </li>
        ))}
      </ol>
    );
  }
}

export default Relay.createContainer(StarWarsApp, {
  fragments: {
    factions: () => Relay.QL`
      fragment on Faction @relay(plural: true) {
        name,
        ships(first: 10) {
          edges {
            node {
              ${StarWarsShip.getFragment('ship')}
            }
          }
        }
      }
    `,
  },
});

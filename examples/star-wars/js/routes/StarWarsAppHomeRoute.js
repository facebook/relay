export default class extends Relay.Route {
  static path = '/';
  static queries = {
    factions: (Component) => Relay.QL`
      query {
        factions(names: $factionNames) {
          ${Component.getFragment('factions')},
        },
      }
    `,
  };
  static routeName = 'StarWarsAppHomeRoute';
}

export default class extends Relay.Route {
  static path = '/';
  static queries = {
    game: (Component) => Relay.QL`
      query {
        game {
          ${Component.getFragment('game')},
        },
      }
    `,
  };
  static routeName = 'AppHomeRoute';
}

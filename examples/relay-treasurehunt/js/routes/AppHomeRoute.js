export default class extends Relay.Route {
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

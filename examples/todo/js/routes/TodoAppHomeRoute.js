export default class extends Relay.Route {
  static queries = {
    viewer: Component => Relay.QL`
      query RootQuery {
        viewer {
          ${Component.getFragment('viewer')},
        }
      }
    `,
  };
  static routeName = 'TodosHomeRoute';
}

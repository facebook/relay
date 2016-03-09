/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

// Welcome to Relay.
// Allow us to introduce you to the four elements.

/**
 * #1 - Your React components
 * This will look familiar to React developers.
 *
 * To learn more about React, visit:
 *  https://facebook.github.io/react
 */
class HelloApp extends React.Component {
  render() {
    // Relay will materialize this prop based on the
    // result of the query in the next component.
    const {hello} = this.props.greetings;
    return <h1>{hello}</h1>;
  }
}

/**
 * #2 - Relay containers
 * Compose your React components with a declaration of
 * the GraphQL query fragments that fetch their data.
 *
 * To learn more about Relay containers, visit:
 *   https://facebook.github.io/relay/docs/guides-containers.html
 */
HelloApp = Relay.createContainer(HelloApp, {
  fragments: {
    // This GraphQL query executes against
    // the schema in the 'schema' tab above.
    //
    // To learn more about Relay.QL, visit:
    //   https://facebook.github.io/relay/docs/api-reference-relay-ql.html
    greetings: () => Relay.QL`
      fragment on Greetings {
        hello,
      }
    `,
  }
});

/**
 * #3 - Relay routes
 * Define a root GraphQL query into which your
 * containers' query fragments will be composed.
 *
 * To learn more about Relay routes, visit:
 *   https://facebook.github.io/relay/docs/guides-routes.html
 */
class HelloRoute extends Relay.Route {
  static routeName = 'Hello';  // A unique name
  static queries = {
    // Here, we compose your Relay container's
    // 'greetings' fragment into the 'greetings'
    // field at the root of the GraphQL schema.
    greetings: (Component) => Relay.QL`
      query GreetingsQuery {
        greetings {
          ${Component.getFragment('greetings')},
        },
      }
    `,
  };
}

/**
 * #4 - Relay root containers
 * Compose a Relay container with a Relay route.
 * This enables Relay to synthesize a complete query
 * to fetch the data necessary to render your app.
 *
 * To learn more about Relay root containers, visit:
 *   https://facebook.github.io/relay/docs/guides-root-container.html
 */
ReactDOM.render(
  <Relay.RootContainer
    Component={HelloApp}
    route={new HelloRoute()}
  />,
  mountNode
);

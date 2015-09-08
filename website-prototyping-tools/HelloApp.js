class HelloApp extends React.Component {
  render() {
    return (
      <h1>
        {this.props.greetings.hello}
      </h1>
    );
  }
}

HelloApp = Relay.createContainer(HelloApp, {
  fragments: {
    greetings: () => Relay.QL`
      fragment on Greetings {
        hello,
      }
    `,
  }
});

class HelloRoute extends Relay.Route {
  static routeName = 'Hello';
  static queries = {
    greetings: (Component) => Relay.QL`
      query GreetingsQuery {
        greetings {
          ${Component.getFragment('greetings')},
        },
      }
    `,
  };
}

ReactDOM.render(
  <Relay.RootContainer
    Component={HelloApp}
    route={new HelloRoute()}
  />,
  mountNode
);

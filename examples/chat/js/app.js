import {Router, Route} from 'react-router';
import BrowserHistory from 'react-router/lib/BrowserHistory';
import relayNestedRoutes from 'relay-nested-routes';
import ChatApp from './components/ChatApp';
import MessageSection from './components/MessageSection';

const NestedRootContainer = relayNestedRoutes(React, Relay);

var HomeQueries = {
  viewer: (Component) => Relay.QL`
    query {
      viewer {
        ${Component.getFragment('viewer')},
      },
    }
  `,
};

var MessageSectionQueries = {
  thread: (Component) => Relay.QL`
    query {
      node(id: $id) {
        ${Component.getFragment('thread')},
      },
    }
  `,
  viewer: (Component) => Relay.QL`
    query {
      viewer {
        ${Component.getFragment('viewer')},
      },
    }
  `,
};

React.render(
  <Router history={new BrowserHistory()}>
    <Route component={NestedRootContainer}>
      <Route path="/" component={ChatApp} queries={HomeQueries}>
        <Route path="thread/:id" component={MessageSection}
          queries={MessageSectionQueries} />
      </Route>
    </Route>
  </Router>,
  document.getElementById('root')
);

import ChatApp from './components/ChatApp';
import ChatAppHomeRoute from './routes/ChatAppHomeRoute';

React.render(
  <Relay.RootContainer Component={ChatApp} route={new ChatAppHomeRoute()} />,
  document.getElementById('root')
);

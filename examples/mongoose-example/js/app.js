import User from './components/User.js';
import AppHomeRoute from './routes/AppHomeRoute';

React.render(
  <Relay.RootContainer
    Component={User}
    //TODO Update userId
    route={new AppHomeRoute({userId: "55df44ba8b56b74b143f5084"})}
  />,
  document.getElementById('root')
);

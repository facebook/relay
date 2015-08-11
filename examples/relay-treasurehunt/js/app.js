import App from './components/App';
import AppHomeRoute from './routes/AppHomeRoute';

React.render(
  <Relay.RootContainer
    Component={App}
    route={new AppHomeRoute()}
  />,
  document.getElementById('root')
);

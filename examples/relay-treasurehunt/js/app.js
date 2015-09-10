import 'babel/polyfill';
import App from './components/App';
import AppHomeRoute from './routes/AppHomeRoute';

ReactDOM.render(
  <Relay.RootContainer
    Component={App}
    route={new AppHomeRoute()}
  />,
  document.getElementById('root')
);

import 'babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import App from './components/App';
import HomeRoute from './routes/HomeRoute';

ReactDOM.render(
  <Relay.RootContainer
    Component={App}
    route={new HomeRoute()}
  />,
  document.getElementById('root')
);


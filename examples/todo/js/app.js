import 'babel/polyfill';
import TodoApp from './components/TodoApp';
import TodoAppHomeRoute from './routes/TodoAppHomeRoute';

React.render(
  <Relay.RootContainer Component={TodoApp} route={new TodoAppHomeRoute()} />,
  document.getElementById('root')
);

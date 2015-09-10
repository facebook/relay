import 'babel/polyfill';
import TodoApp from './components/TodoApp';
import TodoAppHomeRoute from './routes/TodoAppHomeRoute';

ReactDOM.render(
  <Relay.RootContainer Component={TodoApp} route={new TodoAppHomeRoute()} />,
  document.getElementById('root')
);

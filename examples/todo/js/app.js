import 'babel/polyfill';
import createHashHistory from 'history/lib/createHashHistory';
import {IndexRoute, Route, Router} from 'react-router';
import ReactRouterRelay from 'react-router-relay';
import TodoApp from './components/TodoApp';
import TodoList from './components/TodoList';
import ViewerQueries from './queries/ViewerQueries';

ReactDOM.render(
  <Router
    createElement={ReactRouterRelay.createElement}
    history={createHashHistory({queryKey: false})}
  >
    <Route
      path="/" component={TodoApp}
      queries={ViewerQueries}>
      <IndexRoute
        component={TodoList}
        queries={ViewerQueries}
        queryParams={['status']}
      />
      <Route
        path=":status" component={TodoList}
        queries={ViewerQueries}
      />
    </Route>
  </Router>,
  document.getElementById('root')
);

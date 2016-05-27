/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only.  Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import 'todomvc-common';

import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import {IndexRoute, Route, Router} from 'react-router';
import TodoApp from './components/TodoApp';
import TodoList from './components/TodoList';
import ViewerQueries from './queries/ViewerQueries';

import {createHashHistory} from 'history';
const history = useRouterHistory(createHashHistory)({ queryKey: false });
const mountNode = document.getElementById('root');
import {applyRouterMiddleware, useRouterHistory} from 'react-router';
import useRelay from 'react-router-relay';

ReactDOM.render(
  <Router
    environment={Relay.Store}
    history={history}
    render={applyRouterMiddleware(useRelay)}>
    <Route path="/"
      component={TodoApp}
      queries={ViewerQueries}>
      <IndexRoute
        component={TodoList}
        queries={ViewerQueries}
        prepareParams={() => ({status: 'any'})}
      />
      <Route path=":status"
        component={TodoList}
        queries={ViewerQueries}
      />
    </Route>
  </Router>,
  mountNode
);

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

import 'babel/polyfill';
import Relay from 'react-relay';
import NgStarWarsApp from './components/NgStarWarsApp';
import StarWarsAppHomeRoute from './routes/StarWarsAppHomeRoute';
import angular from 'angular';

angular.module('ngStarWars', ['starWarsApp'])
.directive('app', app);

function app() {
  return {
    restrict: 'E',
    scope: {
    },
    template: '<div><star-wars-app relay-props="vm.relayProps"></star-wars-app></div>',
    bindToController: true,
    controllerAs: 'vm',
    controller: controllerFn
  };

  function controllerFn($scope, $rootScope) {
    const vm = this;
    const route = new StarWarsAppHomeRoute({
      factionNames: ['empire', 'rebels'],
    });
    $rootScope.route = route;
    const callback = ({data}) => {
      $scope.$apply(() => {
        vm.relayProps = data;
      });
    };
    const rootContainer = new Relay.GenericRootContainer(callback);
    rootContainer.update(NgStarWarsApp, route);
  }
}

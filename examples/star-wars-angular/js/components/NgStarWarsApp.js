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

import Relay from 'react-relay';
import angular from 'angular';

import StarWarsShip from './NgStarWarsShip';

angular.module('starWarsApp', ['starWarsShip'])
 .directive('starWarsApp', starWarsApp);

const StarWarsAppComponent = Relay.createGenericContainer('StartWarsApp', {
  fragments: {
    factions: () => Relay.QL`
      fragment on Faction @relay(plural: true) {
        name,
        ships(first: 10) {
          edges {
            node {
              ${StarWarsShip.getFragment('ship')}
            }
          }
        }
      }
    `,
  },
});





function starWarsApp() {
  return {
    restrict: 'E',
    scope: {},
    bindToController: {
      relayProps :'=',
    },
    controllerAs: 'vm',
    controller: controllerFn,
    template: '<ol><li ng-repeat="faction in vm.relayData.factions"><h1>Faction name {{faction.name}}</h1>'
    + '<ol><li ng-repeat="edge in faction.ships.edges"><star-wars-ship ship="edge.node"/></li></ol></li></ol>',
  };

  function controllerFn($scope, $rootScope) {

    const updateCallback = (state) => {
      if (!$rootScope.$$phase) {
        $scope.$apply(() => {this.relayData = state.data;});
      }else {
        this.relayData = state.data;
      }
    };
    const starWarsApp = new StarWarsAppComponent(this.relayProps || {}, updateCallback);

    $scope.$watch('vm.relayProps', (newValue, oldValue) => {
      if (newValue == null) {
        return;
      }
      starWarsApp.update(this.relayProps);

    }, false);

  }
}

export default StarWarsAppComponent;

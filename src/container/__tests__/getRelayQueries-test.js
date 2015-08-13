/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

var RelayTestUtils = require('RelayTestUtils');
RelayTestUtils.unmockRelay();

describe('getRelayQueries', () => {
  var React;
  var Relay;

  var getRelayQueries;

  var MockPageContainer;

  var makeRoute;

  var {getNode} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModuleRegistry();

    React = require('React');
    Relay = require('Relay');

    getRelayQueries = require('getRelayQueries');

    class MockPageComponent extends React.Component {
      render() {
        return <div/>;
      }
    }

    MockPageContainer = Relay.createContainer(MockPageComponent, {
      fragments: {
        first: () => Relay.QL`fragment on Node{id,firstName}`,
        last: () => Relay.QL`fragment on Node{id,lastName}`,
      },
    });

    makeRoute = function() {
      class MockRoute extends Relay.Route {}
      MockRoute.routeName = 'MockRoute';
      MockRoute.path = '/{id}';
      MockRoute.paramDefinitions = {
        id: {
          type: 'String',
          id: true,
        },
      };
      MockRoute.queries = {
        first: (Component, params) => Relay.QL`
          query {
            node(id:$id) {
              ${Component.getFragment('first')}
            }
          }
        `,
        last: (Component, params) => Relay.QL`
          query {
            node(id:$id) {
              ${Component.getFragment('last')}
            }
          }
        `,
      };
      return MockRoute;
    };

    jest.addMatchers(RelayTestUtils.matchers);
  });

  it('creates a query for a component given a route', () => {
    var MockRoute = makeRoute();
    var route = new MockRoute({id: '123'});
    var queries = getRelayQueries(MockPageContainer, route);

    var expected = {
      first: getNode(Relay.QL`query{node(id:"123"){${Relay.QL`fragment on Node{id,firstName}`}}}`),
      last: getNode(Relay.QL`query{node(id:"123"){${Relay.QL`fragment on Node{id,lastName}`}}}`),
    };

    expect(queries.first).toEqualQueryRoot(expected.first);
    expect(queries.first.getVariables()).toBe(route.params);

    expect(queries.last).toEqualQueryRoot(expected.last);
    expect(queries.last.getVariables()).toBe(route.params);
  });

  it('omits queries with undefined root call values', () => {
    var MockRoute = makeRoute();
    var route = new MockRoute({id: undefined});
    var queries = getRelayQueries(MockPageContainer, route);

    expect(queries).toEqual({
      first: null,
      last: null,
    });
  });

  it('throws for invalid `Relay.QL` queries', () => {
    class BadRoute extends Relay.Route {}
    BadRoute.routeName = 'BadRoute';
    BadRoute.queries = {
      first: () => Relay.QL`fragment on Node{id}`,
    };
    var badRoute = new BadRoute({});

    expect(() => {
      getRelayQueries(MockPageContainer, badRoute);
    }).toFailInvariant(
      'Relay.QL defined on route `BadRoute` named `first` is not a valid ' +
      'query. A A typical query is defined using: Relay.QL`query {...}`'
    );
  });
});

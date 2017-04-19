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

jest.mock('warning');

var RelayTestUtils = require('RelayTestUtils');
RelayTestUtils.unmockRelay();

var React = require('React');
var Relay = require('Relay');
var getRelayQueries = require('getRelayQueries');

describe('getRelayQueries', () => {
  var MockPageContainer;
  var MockPageComponent;

  var makeRoute;

  var {getNode} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModuleRegistry();

    MockPageComponent = class MockPageComponent extends React.Component {
      render() {
        return <div/>;
      }
    };

    MockPageContainer = Relay.createContainer(MockPageComponent, {
      fragments: {
        first: () => Relay.QL`fragment on Node{id,firstName}`,
        last: () => Relay.QL`fragment on Node{id,lastName}`,
      }
    });

    makeRoute = function() {
      class MockRoute extends Relay.Route {}
      MockRoute.routeName = 'MockRoute';
      MockRoute.path = '/{id}';
      MockRoute.paramDefinitions = {
        id: {
          type: 'String',
          id: true
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

  it('returns null for fragments without a matching route query', () => {
    class FirstRoute extends Relay.Route {}
    FirstRoute.routeName = 'BadRoute';
    FirstRoute.queries = {
      first: (Component, params) => Relay.QL`query { node(id:"123") }`,
    };
    var route = new FirstRoute({});
    var queries = getRelayQueries(MockPageContainer, route);

    expect(queries.last).toBe(null);
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
      'Relay.QL: query `BadRoute.queries.first` is invalid, a typical ' +
      'query is defined using: () => Relay.QL`query { ... }`.'
    );
  });

  it('warns if a container does not include a required fragment', () => {
    var MockRoute = makeRoute();
    var route = new MockRoute({id: '123'});

    var AnotherMockContainer = Relay.createContainer(MockPageComponent, {
      fragments: {
        first: () => Relay.QL`fragment on Node{id}`,
      }
    });

    var queries = getRelayQueries(AnotherMockContainer, route);
    expect(queries.last).toBe(undefined);

    expect([
      'Relay.QL: query `%s.queries.%s` is invalid, expected fragment ' +
      '`%s.fragments.%s` to be defined.',
      'MockRoute',
      'last',
      'Relay(MockPageComponent)',
      'last'
    ]).toBeWarnedNTimes(1);
  });

  it('sets root fragment variables to route params', () => {
    class MockRoute extends Relay.Route {}
    MockRoute.routeName = 'MockRoute';
    MockRoute.path = '/';
    MockRoute.paramDefinitions = {};
    MockRoute.queries = {
      first: () => Relay.QL`
        query {
          viewer
        }
      `,
    };

    var route = new MockRoute({
      fragmentParam: 'foo',
      otherParam: 'bar',
    });

    var AnotherMockContainer = Relay.createContainer(MockPageComponent, {
      initialVariables: {
        fragmentParam: null,
      },
      fragments: {
        first: () => Relay.QL`fragment on Node{id}`,
      },
    });

    var queries = getRelayQueries(AnotherMockContainer, route);

    expect(queries.first.getVariables()).toEqual(route.params);
    // `otherParam` is not passed to the root fragment since the variable
    // is not defined in the component's `initialVariables`.
    expect(queries.first.getChildren()[0].getVariables()).toEqual({
      fragmentParam: 'foo',
    });
  });
});

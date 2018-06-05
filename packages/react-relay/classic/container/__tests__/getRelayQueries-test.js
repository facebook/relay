/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

require('configureForRelayOSS');

jest.mock('warning');

const React = require('React');
const RelayClassic = require('../../RelayPublic');
const RelayTestUtils = require('RelayTestUtils');

const getRelayQueries = require('../getRelayQueries');

describe('getRelayQueries', () => {
  let MockPageContainer;
  let MockPageComponent;

  let makeRoute;

  const {getNode} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModules();

    MockPageComponent = class _MockPageComponent extends React.Component {
      render() {
        return <div />;
      }
    };

    MockPageContainer = RelayClassic.createContainer(MockPageComponent, {
      fragments: {
        first: () => RelayClassic.QL`fragment on Node{id,firstName}`,
        last: () => RelayClassic.QL`fragment on Node{id,lastName}`,
      },
    });

    makeRoute = function() {
      class MockRoute extends RelayClassic.Route {}
      MockRoute.routeName = 'MockRoute';
      MockRoute.path = '/{id}';
      MockRoute.paramDefinitions = {
        id: {
          type: 'String',
          id: true,
        },
      };
      MockRoute.queries = {
        first: Component => RelayClassic.QL`
          query {
            node(id:$id) {
              ${Component.getFragment('first')}
            }
          }
        `,
        last: Component => RelayClassic.QL`
          query {
            node(id:$id) {
              ${Component.getFragment('last')}
            }
          }
        `,
      };
      return MockRoute;
    };

    expect.extend(RelayTestUtils.matchers);
  });

  it('creates a query for a component given a route', () => {
    const MockRoute = makeRoute();
    const route = new MockRoute({id: '123'});
    const queries = getRelayQueries(MockPageContainer, route);

    const expected = {
      first: getNode(
        RelayClassic.QL`
        query {
          node(id: "123") {
            ${RelayClassic.QL`fragment on Node{id,firstName}`}
          }
        }
      `,
      ),
      last: getNode(
        RelayClassic.QL`
        query {
          node(id: "123") {
            ${RelayClassic.QL`fragment on Node{id,lastName}`}
          }
        }
      `,
      ),
    };

    expect(queries.first).toEqualQueryRoot(expected.first);
    expect(queries.first.getVariables()).toBe(route.params);

    expect(queries.last).toEqualQueryRoot(expected.last);
    expect(queries.last.getVariables()).toBe(route.params);
  });

  it('omits queries with undefined root call values', () => {
    const MockRoute = makeRoute();
    const route = new MockRoute({id: undefined});
    const queries = getRelayQueries(MockPageContainer, route);

    expect(queries).toEqual({
      first: null,
      last: null,
    });
  });

  it('returns null for fragments without a matching route query', () => {
    class FirstRoute extends RelayClassic.Route {}
    FirstRoute.routeName = 'BadRoute';
    FirstRoute.queries = {
      first: () => RelayClassic.QL`query { node(id:"123") }`,
    };
    const route = new FirstRoute({});
    var queries = getRelayQueries(MockPageContainer, route);

    expect(queries.last).toBe(null);
  });

  it('throws for invalid `Relay.QL` queries', () => {
    class BadRoute extends RelayClassic.Route {}
    BadRoute.routeName = 'BadRoute';
    BadRoute.queries = {
      first: () => RelayClassic.QL`fragment on Node{id}`,
    };
    const badRoute = new BadRoute({});

    expect(() => {
      getRelayQueries(MockPageContainer, badRoute);
    }).toFailInvariant(
      'Relay.QL: query `BadRoute.queries.first` is invalid, a typical ' +
        'query is defined using: () => Relay.QL`query { ... }`.',
    );
  });

  it('warns if a container does not include a required fragment', () => {
    const MockRoute = makeRoute();
    const route = new MockRoute({id: '123'});

    const AnotherMockContainer = RelayClassic.createContainer(
      MockPageComponent,
      {
        fragments: {
          first: () => RelayClassic.QL`fragment on Node{id}`,
        },
      },
    );

    const queries = getRelayQueries(AnotherMockContainer, route);
    expect(queries.last).toBe(undefined);

    expect([
      'Relay.QL: query `%s.queries.%s` is invalid, expected fragment ' +
        '`%s.fragments.%s` to be defined.',
      'MockRoute',
      'last',
      'Relay(_MockPageComponent)',
      'last',
    ]).toBeWarnedNTimes(1);
  });

  it('sets root fragment variables to route params', () => {
    class MockRoute extends RelayClassic.Route {}
    MockRoute.routeName = 'MockRoute';
    MockRoute.path = '/';
    MockRoute.paramDefinitions = {};
    MockRoute.queries = {
      first: () => RelayClassic.QL`
        query {
          viewer
        }
      `,
    };

    const route = new MockRoute({
      fragmentParam: 'foo',
      otherParam: 'bar',
    });

    const AnotherMockContainer = RelayClassic.createContainer(
      MockPageComponent,
      {
        initialVariables: {
          fragmentParam: null,
        },
        fragments: {
          first: () => RelayClassic.QL`fragment on Node{id}`,
        },
      },
    );

    var queries = getRelayQueries(AnotherMockContainer, route);

    expect(queries.first.getVariables()).toEqual(route.params);
    // `otherParam` is not passed to the root fragment since the variable
    // is not defined in the component's `initialVariables`.
    expect(queries.first.getChildren()[0].getVariables()).toEqual({
      fragmentParam: 'foo',
    });
  });
});

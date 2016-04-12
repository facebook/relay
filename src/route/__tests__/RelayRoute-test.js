/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

require('configureForRelayOSS');

const Relay = require('Relay');
const RelayRoute = require('RelayRoute');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayRoute', () => {
  let makeRoute;

  beforeEach(() => {
    jest.resetModuleRegistry();

    makeRoute = function() {
      class MockRoute extends RelayRoute {}
      MockRoute.routeName = 'MockRoute';
      MockRoute.path = '/{required}';
      MockRoute.paramDefinitions = {
        required: {
          type: 'String',
          required: true,
        },
        optional: {
          type: 'String',
          required: false,
        },
      };
      MockRoute.queries = {
        required: Component => Relay.QL`
          query {
            node(id:$required) {
              ${Component.getFragment('required')}
            }
          }
        `,
        optional: Component => Relay.QL`
          query {
            node(id:$optional) {
              ${Component.getFragment('optional')}
            }
          }
        `,
      };
      return MockRoute;
    };

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  it('can be created using inheritance', () => {
    const MockRoute = makeRoute();
    const route = new MockRoute({required: 'foo'});
    expect(route.name).toEqual('MockRoute');
    expect(route.params.required).toEqual('foo');
    expect(route.queries.required).toBeTruthy();
  });

  it('has an immutable spec in __DEV__', () => {
    const dev = __DEV__;
    window.__DEV__ = true;

    const MockRoute = makeRoute();
    const route = new MockRoute({required: 'foo'});
    expect(() => {
      route.name = 'yo';
    }).toThrow();
    expect(() => {
      route.params = 'I am';
    }).toThrow();
    expect(() => {
      route.queries = 'immutable';
    }).toThrow();
    expect(() => {
      route.params.foo = 'bar';
    }).toThrow();
    expect(() => {
      route.queries.myCustomQuery = () => {};
    }).toThrow();

    window.__DEV__ = dev;
  });

  it('allows params to be processed if `prepareParams` is defined', () => {
    const MockRoute = makeRoute();
    MockRoute.prepareParams =
      jest.fn(() => ({required: 'bar'}));
    const route = new MockRoute({required: 'foo'});
    expect(MockRoute.prepareParams).toBeCalledWith({required: 'foo'});
    expect(route.params.required).toEqual('bar');
  });

  it('throws if a requires param is not supplied', () => {
    const MockRoute = makeRoute();
    expect(() => {
      /* eslint-disable no-new */
      new MockRoute({});
      /* eslint-enable no-new */
    }).toFailInvariant(
      'RelayRoute: Missing required parameter `required` in `MockRoute`. ' +
      'Check the supplied params or URI.'
    );
  });

  it('defaults optional param definitions to undefined', () => {
    const MockRoute = makeRoute();
    const route = new MockRoute({required: 'foo'});
    expect(Object.keys(route.params)).toContain('optional');
  });

  it('exposes queries in the queries property', () => {
    const MockRoute = makeRoute();
    const route = new MockRoute({required: 'foo'});
    expect(route.queries.required).toBeTruthy();
    expect(route.queries.optional).toBeTruthy();
  });

  it('allows to inject a URI creator', () => {
    RelayRoute.injectURICreator(
      (_, params) => '/foo/' + params.required
    );
    const MockRoute = makeRoute();
    const route = new MockRoute({required: 'bar'});

    expect(route.uri).not.toBe(null);
    expect(route.uri).toEqual('/foo/bar');
  });

  it('uses the injection only if the URI is not already passed in', () => {
    const mockCallback = jest.fn();
    RelayRoute.injectURICreator(mockCallback);
    const MockRoute = makeRoute();
    const uri = '/foo/bar';
    const route = new MockRoute({required: 'bar'}, uri);

    expect(mockCallback).not.toBeCalled();
    expect(route.uri).toEqual(uri);
  });

  it('throws for route subclasses missing `routeName`', () => {
    class InvalidRoute extends RelayRoute {}

    expect(() => {
      /* eslint-disable no-new */
      new InvalidRoute();
      /* eslint-enable no-new */
    }).toFailInvariant(
      'InvalidRoute: Subclasses of RelayRoute must define a `routeName`.'
    );
  });
});

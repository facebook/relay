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
const RelayQueryConfig = require('RelayQueryConfig');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayQueryConfig', () => {
  let makeConfig;

  beforeEach(() => {
    jest.resetModuleRegistry();

    makeConfig = function() {
      class MockConfig extends RelayQueryConfig <{
        required: string,
        optional?: string
      }> {}
      MockConfig.routeName = 'MockConfig';
      MockConfig.queries = {
        required: Component => Relay.QL`
          query {
            node(id:$required) {
              ${Component.getQuery('required')}
            }
          }
        `,
        optional: Component => Relay.QL`
          query {
            node(id:$optional) {
              ${Component.getQuery('optional')}
            }
          }
        `,
      };
      return MockConfig;
    };

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  it('can be created using inheritance', () => {
    const MockConfig = makeConfig();
    const config = new MockConfig({required: 'foo'});
    expect(config.name).toEqual('MockConfig');
    expect(config.params.required).toEqual('foo');
    expect(config.queries.required).toBeTruthy();
  });

  it('has an immutable spec in __DEV__', () => {
    const dev = __DEV__;
    window.__DEV__ = true;

    const MockConfig = makeConfig();
    const config = new MockConfig({required: 'foo'});
    expect(() => {
      config.name = 'yo';
    }).toThrow();
    expect(() => {
      config.params = 'I am';
    }).toThrow();
    expect(() => {
      config.queries = 'immutable';
    }).toThrow();
    expect(() => {
      config.params.foo = 'bar';
    }).toThrow();
    expect(() => {
      config.queries.myCustomQuery = () => {};
    }).toThrow();

    window.__DEV__ = dev;
  });

  it('allows params to be processed if `prepareParams` is defined', () => {
    const MockConfig = makeConfig();
    MockConfig.prototype.prepareVariables =
      jest.fn(() => ({required: 'bar'}));
    const config = new MockConfig({required: 'foo'});
    expect(MockConfig.prototype.prepareVariables)
      .toBeCalledWith({required: 'foo'});
    expect(config.params.required).toEqual('bar');
  });

  it('exposes queries in the queries property', () => {
    const MockConfig = makeConfig();
    const config = new MockConfig({required: 'foo'});
    expect(config.queries.required).toBeTruthy();
    expect(config.queries.optional).toBeTruthy();
  });
});

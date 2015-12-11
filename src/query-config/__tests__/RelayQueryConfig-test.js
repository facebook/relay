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

require('configureForRelayOSS');

const Relay = require('Relay');
const RelayQueryConfig = require('RelayQueryConfig');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayQueryConfig', () => {
  var makeConfig;

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
    var MockConfig = makeConfig();
    var config = new MockConfig({required: 'foo'});
    expect(config.name).toEqual('MockConfig');
    expect(config.params.required).toEqual('foo');
    expect(config.queries.required).toBeTruthy();
  });

  it('has an immutable spec in __DEV__', () => {
    var dev = __DEV__;
    window.__DEV__ = true;

    var MockConfig = makeConfig();
    var config = new MockConfig({required: 'foo'});
    expect(() => config.name = 'yo').toThrow();
    expect(() => config.params = 'I am').toThrow();
    expect(() => config.queries = 'immutable').toThrow();
    expect(() => config.params.foo = 'bar').toThrow();
    expect(() => config.queries.myCustomQuery = () => {}).toThrow();

    window.__DEV__ = dev;
  });

  it('allows params to be processed if `prepareParams` is defined', () => {
    var MockConfig = makeConfig();
    MockConfig.prototype.prepareVariables =
      jest.genMockFunction().mockReturnValue({required: 'bar'});
    var config = new MockConfig({required: 'foo'});
    expect(MockConfig.prototype.prepareVariables)
      .toBeCalledWith({required: 'foo'});
    expect(config.params.required).toEqual('bar');
  });

  it('exposes queries in the queries property', () => {
    var MockConfig = makeConfig();
    var config = new MockConfig({required: 'foo'});
    expect(config.queries.required).toBeTruthy();
    expect(config.queries.optional).toBeTruthy();
  });
});

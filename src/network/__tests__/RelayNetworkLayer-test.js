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

const Deferred = require('Deferred');
const RelayNetworkLayer = require('RelayNetworkLayer');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayNetworkLayer', () => {
  var RelayQuery;

  var injectedNetworkLayer;

  beforeEach(() => {
    jest.resetModuleRegistry();

    RelayQuery = jest.genMockFromModule('RelayQuery');
    jest.setMock('RelayQuery', RelayQuery);

    injectedNetworkLayer = {
      sendMutation: jest.genMockFunction(),
      sendQueries: jest.genMockFunction(),
      sendSubscription: jest.genMockFunction().mockReturnValue({
        dispose: jest.genMockFunction(),
      }),
      supports: jest.genMockFunction().mockReturnValue(true),
    };
    RelayNetworkLayer.injectNetworkLayer(injectedNetworkLayer);

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  describe('supports', () => {
    it('throws when no network layer is injected', () => {
      RelayNetworkLayer.injectNetworkLayer(null);
      expect(() => {
        RelayNetworkLayer.sendQueries([]);
      }).toFailInvariant(
        'RelayNetworkLayer: Use `injectNetworkLayer` to configure a network ' +
        'layer.'
      );
    });

    it('delegates to the injected network layer', () => {
      expect(injectedNetworkLayer.supports).not.toBeCalled();
      RelayNetworkLayer.supports('foo', 'bar');
      expect(injectedNetworkLayer.supports).toBeCalledWith('foo', 'bar');
    });
  });

  describe('sendQueries', () => {
    it('throws when no network layer is injected', () => {
      RelayNetworkLayer.injectNetworkLayer(null);
      expect(() => {
        RelayNetworkLayer.sendQueries([]);
      }).toFailInvariant(
        'RelayNetworkLayer: Use `injectNetworkLayer` to configure a network ' +
        'layer.'
      );
    });

    it('delegates queries to the injected network layer', () => {
      var queries = [];
      expect(injectedNetworkLayer.sendQueries).not.toBeCalled();
      RelayNetworkLayer.sendQueries(queries);
      expect(injectedNetworkLayer.sendQueries).toBeCalledWith(queries);
    });
  });

  describe('sendMutation', () => {
    var mutation;
    var variables;
    var deferred;
    var resolvedCallback;
    var rejectedCallback;

    beforeEach(() => {
      mutation = {};
      variables = {};
      resolvedCallback = jest.genMockFunction();
      rejectedCallback = jest.genMockFunction();
      deferred = new Deferred();
      deferred.getPromise().done(resolvedCallback, rejectedCallback);
    });

    it('throws when no network layer is injected', () => {
      RelayNetworkLayer.injectNetworkLayer(null);
      expect(() => {
        RelayNetworkLayer.sendMutation({mutation, variables, deferred});
      }).toFailInvariant(
        'RelayNetworkLayer: Use `injectNetworkLayer` to configure a network ' +
        'layer.'
      );
    });

    it('delegates mutation to the injected network layer', () => {
      expect(injectedNetworkLayer.sendQueries).not.toBeCalled();
      RelayNetworkLayer.sendMutation({mutation, variables, deferred});
      expect(injectedNetworkLayer.sendMutation).toBeCalled();

      var pendingMutation = injectedNetworkLayer.sendMutation.mock.calls[0][0];
      expect(pendingMutation.mutation).toBe(mutation);
      expect(pendingMutation.variables).toBe(variables);
    });

    it('resolves the deferred if the mutation succeeds', () => {
      RelayNetworkLayer.sendMutation({mutation, variables, deferred});
      expect(resolvedCallback).not.toBeCalled();
      expect(rejectedCallback).not.toBeCalled();

      var pendingMutation = injectedNetworkLayer.sendMutation.mock.calls[0][0];
      var response = {};
      pendingMutation.deferred.resolve(response);
      jest.runAllTimers();

      expect(resolvedCallback).toBeCalledWith(response);
      expect(rejectedCallback).not.toBeCalled();
    });

    it('rejects the deferred if the mutation fails', () => {
      RelayNetworkLayer.sendMutation({mutation, variables, deferred});
      expect(resolvedCallback).not.toBeCalled();
      expect(rejectedCallback).not.toBeCalled();

      var pendingMutation = injectedNetworkLayer.sendMutation.mock.calls[0][0];
      var error = new Error('Mutation Error');
      pendingMutation.deferred.reject(error);
      jest.runAllTimers();

      expect(resolvedCallback).not.toBeCalled();
      expect(rejectedCallback).toBeCalledWith(error);
    });
  });

  describe('sendSubscription', () => {
    var subscription;

    beforeEach(() => {
      subscription = {};
    });

    it('throws when no network layer is injected', () => {
      RelayNetworkLayer.injectNetworkLayer(null);
      expect(() => {
        RelayNetworkLayer.sendSubscription({subscription});
      }).toFailInvariant(
        'RelayNetworkLayer: Use `injectNetworkLayer` to configure a network ' +
        'layer.'
      );
    });

    it('throws when network layer does not implement sendSubscription', () => {
      class CustomNetworkLayer { }
      injectedNetworkLayer = new CustomNetworkLayer();
      Object.assign(injectedNetworkLayer, {
        sendMutation: jest.genMockFunction(),
        sendQueries: jest.genMockFunction(),
        supports: jest.genMockFunction().mockReturnValue(true),
      });

      RelayNetworkLayer.injectNetworkLayer(injectedNetworkLayer);
      expect(() => {
        RelayNetworkLayer.sendSubscription({subscription});
      }).toFailInvariant(
        'CustomNetworkLayer: does not support subscriptions.  Expected `sendSubscription` to be ' +
        'a function.'
      );
    });

    it('delegates subscription to the injected network layer', () => {
      RelayNetworkLayer.sendSubscription({subscription});
      expect(injectedNetworkLayer.sendSubscription).toBeCalled();

      const pendingSubscription = injectedNetworkLayer.sendSubscription.mock.calls[0][0];
      expect(pendingSubscription.subscription).toBe(subscription);
    });

    it('returns a disposable that calls the network layers return value disposable', () => {
      const injectedReturnValue = {
        dispose: jest.genMockFunction(),
      };
      injectedNetworkLayer.sendSubscription.mockReturnValue(injectedReturnValue);
      const returnValue = RelayNetworkLayer.sendSubscription({subscription});

      expect(typeof returnValue.dispose).toBe('function');
      expect(injectedReturnValue.dispose).not.toBeCalled();

      returnValue.dispose();
      expect(injectedReturnValue.dispose).toBeCalled();
    });

    it('throws when the return value is not a disposable', () => {

      const message = 'RelayNetworkLayer: `sendSubscription` should return an ' +
      'object with a `dispose` property that is a no-argument function.  This ' +
      'function is called when the client unsubscribes from the ' +
      'subscription and any network layer resources can be cleaned up.';

      injectedNetworkLayer.sendSubscription.mockReturnValue(null);
      expect(() => {
        RelayNetworkLayer.sendSubscription({subscription});
      }).toFailInvariant(message);

      injectedNetworkLayer.sendSubscription.mockReturnValue({});
      expect(() => {
        RelayNetworkLayer.sendSubscription({subscription});
      }).toFailInvariant(message);

      injectedNetworkLayer.sendSubscription.mockReturnValue(jest.genMockFunction);
      expect(() => {
        RelayNetworkLayer.sendSubscription({subscription});
      }).toFailInvariant(message);
    });
  });
});

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
});

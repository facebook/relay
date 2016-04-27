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

jest.unmock('RelayNetworkLayer');

const Deferred = require('Deferred');
const RelayNetworkLayer = require('RelayNetworkLayer');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayNetworkLayer', () => {
  let injectedNetworkLayer;
  let networkLayer;

  beforeEach(() => {
    jest.resetModuleRegistry();

    const RelayQuery = jest.genMockFromModule('RelayQuery');
    jest.setMock('RelayQuery', RelayQuery);
    jest.mock('warning');

    injectedNetworkLayer = {
      sendMutation: jest.fn(),
      sendQueries: jest.fn(),
      supports: jest.fn(() => true),
    };
    networkLayer = new RelayNetworkLayer();
    networkLayer.injectImplementation(injectedNetworkLayer);

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  describe('layer injection', () => {
    beforeEach(() => {
      networkLayer = new RelayNetworkLayer();
    });

    it('complains if no implementation is injected', () => {
      expect(() => networkLayer.supports([])).toFailInvariant(
        'RelayNetworkLayer: Use `RelayEnvironment.injectNetworkLayer` to ' +
        'configure a network layer.'
      );
    });

    it('accepts a default implementation', () => {
      const supports = jest.fn();
      networkLayer.injectDefaultImplementation({supports});
      expect(() => networkLayer.supports([])).not.toThrow();
      expect(supports.mock.calls.length).toBe(1);
    });

    it('allows the default implementation to be overridden', () => {
      const defaultSupports = jest.fn();
      const supports = jest.fn();
      networkLayer.injectDefaultImplementation({supports: defaultSupports});
      networkLayer.injectImplementation({supports});
      expect(() => networkLayer.supports([])).not.toThrow();
      expect(defaultSupports.mock.calls.length).toBe(0);
      expect(supports.mock.calls.length).toBe(1);
    });

    it('complains if the default is set more than once', () => {
      const first = jest.fn();
      const second = jest.fn();
      networkLayer.injectDefaultImplementation({supports: first});
      networkLayer.injectDefaultImplementation({supports: second});
      expect(() => networkLayer.supports([])).not.toThrow();
      expect(first.mock.calls.length).toBe(0);
      expect(second.mock.calls.length).toBe(1);
      expect([
        'RelayNetworkLayer: Call received to injectDefaultImplementation(), ' +
        'but a default layer was already injected.',
      ]).toBeWarnedNTimes(1);
    });

    it('complains if the (non-default) implementation is overridden', () => {
      const first = jest.fn();
      const second = jest.fn();
      networkLayer.injectImplementation({supports: first});
      networkLayer.injectImplementation({supports: second});
      expect(() => networkLayer.supports([])).not.toThrow();
      expect(first.mock.calls.length).toBe(0);
      expect(second.mock.calls.length).toBe(1);
      expect([
        'RelayNetworkLayer: Call received to injectImplementation(), but ' +
        'a layer was already injected.',
      ]).toBeWarnedNTimes(1);
    });
  });

  describe('supports', () => {
    it('throws when no network layer is injected', () => {
      networkLayer = new RelayNetworkLayer();
      expect(() => {
        networkLayer.sendQueries([]);
      }).toFailInvariant(
        'RelayNetworkLayer: Use `RelayEnvironment.injectNetworkLayer` to ' +
        'configure a network layer.'
      );
    });

    it('delegates to the injected network layer', () => {
      expect(injectedNetworkLayer.supports).not.toBeCalled();
      networkLayer.supports('foo', 'bar');
      expect(injectedNetworkLayer.supports).toBeCalledWith('foo', 'bar');
    });
  });

  describe('sendQueries', () => {
    it('throws when no network layer is injected', () => {
      networkLayer = new RelayNetworkLayer();
      expect(() => {
        networkLayer.sendQueries([]);
      }).toFailInvariant(
        'RelayNetworkLayer: Use `RelayEnvironment.injectNetworkLayer` to ' +
        'configure a network layer.'
      );
    });

    it('delegates queries to the injected network layer', () => {
      const queries = [];
      expect(injectedNetworkLayer.sendQueries).not.toBeCalled();
      networkLayer.sendQueries(queries);
      expect(injectedNetworkLayer.sendQueries).toBeCalledWith(queries);
    });
  });

  describe('sendMutation', () => {
    let mutation;
    let variables;
    let deferred;
    let resolvedCallback;
    let rejectedCallback;

    beforeEach(() => {
      mutation = {};
      variables = {};
      resolvedCallback = jest.fn();
      rejectedCallback = jest.fn();
      deferred = new Deferred();
      deferred.done(resolvedCallback, rejectedCallback);
    });

    it('throws when no network layer is injected', () => {
      networkLayer = new RelayNetworkLayer();
      expect(() => {
        networkLayer.sendMutation({mutation, variables, deferred});
      }).toFailInvariant(
        'RelayNetworkLayer: Use `RelayEnvironment.injectNetworkLayer` to ' +
        'configure a network layer.'
      );
    });

    it('delegates mutation to the injected network layer', () => {
      expect(injectedNetworkLayer.sendQueries).not.toBeCalled();
      networkLayer.sendMutation({mutation, variables, deferred});
      expect(injectedNetworkLayer.sendMutation).toBeCalled();

      const pendingMutation =
        injectedNetworkLayer.sendMutation.mock.calls[0][0];
      expect(pendingMutation.mutation).toBe(mutation);
      expect(pendingMutation.variables).toBe(variables);
    });

    it('resolves the deferred if the mutation succeeds', () => {
      networkLayer.sendMutation({mutation, variables, deferred});
      expect(resolvedCallback).not.toBeCalled();
      expect(rejectedCallback).not.toBeCalled();

      const pendingMutation =
        injectedNetworkLayer.sendMutation.mock.calls[0][0];
      const response = {};
      pendingMutation.deferred.resolve(response);
      jest.runAllTimers();

      expect(resolvedCallback).toBeCalledWith(response);
      expect(rejectedCallback).not.toBeCalled();
    });

    it('rejects the deferred if the mutation fails', () => {
      networkLayer.sendMutation({mutation, variables, deferred});
      expect(resolvedCallback).not.toBeCalled();
      expect(rejectedCallback).not.toBeCalled();

      const pendingMutation =
        injectedNetworkLayer.sendMutation.mock.calls[0][0];
      const error = new Error('Mutation Error');
      pendingMutation.deferred.reject(error);
      jest.runAllTimers();

      expect(resolvedCallback).not.toBeCalled();
      expect(rejectedCallback).toBeCalledWith(error);
    });
  });

  describe('addNetworkSubscriber', () => {
    let mutationCallback;
    let queryCallback;
    let changeSubscriber;

    beforeEach(() => {

      mutationCallback = jest.fn();
      queryCallback = jest.fn();

      changeSubscriber =
        networkLayer.addNetworkSubscriber(queryCallback, mutationCallback);
    });

    it('calls subscriber with query', () => {
      expect(queryCallback).not.toBeCalled();

      const deferred1 = new Deferred();
      const deferred2 = new Deferred();
      deferred2.done(jest.fn(), jest.fn());
      networkLayer.sendQueries([deferred1, deferred2]);
      const pendingQueries = injectedNetworkLayer.sendQueries.mock.calls[0][0];
      const response = 'response';
      pendingQueries[0].resolve(response);
      const error = new Error('Network Error');
      pendingQueries[1].reject(error);
      jest.runAllTimers();

      expect(queryCallback.mock.calls.length).toBe(2);
    });

    it('calls subscriber with mutation', () => {
      expect(mutationCallback).not.toBeCalled();

      const deferred = new Deferred();
      networkLayer.sendMutation(deferred);
      const pendingMutation =
        injectedNetworkLayer.sendMutation.mock.calls[0][0];
      const response = 'response';
      pendingMutation.resolve(response);
      jest.runAllTimers();

      expect(mutationCallback.mock.calls.length).toBe(1);
    });

    it('does not call subscriber once it is removed', () => {
      changeSubscriber.remove();

      const deferred1 = new Deferred();
      const deferred2 = new Deferred();
      networkLayer.sendQueries([deferred1]);
      networkLayer.sendMutation(deferred2);
      const pendingQuery = injectedNetworkLayer.sendQueries.mock.calls[0][0][0];
      pendingQuery.resolve('response');
      const pendingMutation =
        injectedNetworkLayer.sendMutation.mock.calls[0][0];
      pendingMutation.resolve('response');
      jest.runAllTimers();

      expect(queryCallback).not.toBeCalled();
      expect(mutationCallback).not.toBeCalled();
    });
  });
});

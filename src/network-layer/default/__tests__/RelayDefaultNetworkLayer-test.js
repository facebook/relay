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

describe('RelayDefaultNetworkLayer', () => {
  var Promise;
  var Relay;
  var RelayConnectionInterface;
  var RelayDefaultNetworkLayer;
  var RelayMetaRoute;
  var RelayMutationRequest;
  var RelayQuery;
  var RelayQueryRequest;

  var fetch;
  var fetchWithRetries;

  var networkConfig;
  var networkLayer;

  function genResponse(data) {
    return {
      json: () => Promise.resolve(data),
      status: 200,
    };
  }

  beforeEach(() => {
    jest.resetModuleRegistry();

    Promise = require('Promise');
    Relay = require('Relay');
    RelayConnectionInterface = require('RelayConnectionInterface');
    RelayDefaultNetworkLayer = require('RelayDefaultNetworkLayer');
    RelayMetaRoute = require('RelayMetaRoute');
    RelayMutationRequest =  require('RelayMutationRequest');
    RelayQuery = require('RelayQuery');
    RelayQueryRequest = require('RelayQueryRequest');

    fetch = require('fetch');
    fetchWithRetries = require('fetchWithRetries');

    networkConfig = {
      uri: '/graphql',
      timeout: 15000,
      retryDelays: [1000, 3000],
    };
    // Spread properties to test that functions are bound correctly.
    networkLayer = {
      ...new RelayDefaultNetworkLayer(
        networkConfig.uri,
        networkConfig.timeout,
        networkConfig.retryDelays
      ),
    };

    jest.addMatchers(RelayTestUtils.matchers);
  });

  describe('sendMutation', () => {
    var request;
    var variables;
    var responseCallback;
    var rejectCallback;

    beforeEach(() => {
      responseCallback = jest.genMockFunction();
      rejectCallback = jest.genMockFunction();

      var mutation = RelayQuery.Node.buildMutation(
        'FeedbackLikeMutation',
        'FeedbackLikeResponsePayload',
        'feedback_like',
        [RelayQuery.Node.buildField('does_viewer_like')],
        {inputType: 'FeedbackLikeInput'}
      );
      variables = {
        input: {
          [RelayConnectionInterface.CLIENT_MUTATION_ID]: 'client:a',
          actor_id: 4,
        },
      };
      request = new RelayMutationRequest(mutation, variables);
      request.getPromise().then(responseCallback).catch(rejectCallback);
    });

    it('sends correct data to server', () => {
      expect(fetch).not.toBeCalled();
      networkLayer.sendMutation(request);
      expect(fetch).toBeCalled();

      var call = fetch.mock.calls[0];
      expect(call[0]).toBe(networkConfig.uri);
      var {body, headers, method} = call[1];

      expect(method).toBe('POST');
      expect(headers).toEqual({
        'Content-Type': 'application/json'
      });
      expect(body).toEqual(JSON.stringify({
        query: request.getQueryString(),
        variables: variables,
      }));
    });

    it('handles responses', () => {
      var response = {
        data: {
          test_call: {
            field: 1
          },
        },
      };

      expect(fetch).not.toBeCalled();
      networkLayer.sendMutation(request);
      expect(fetch).toBeCalled();

      fetch.mock.deferreds[0].resolve(genResponse(response));
      jest.runAllTimers();

      expect(rejectCallback.mock.calls.length).toBe(0);
      expect(responseCallback.mock.calls.length).toBe(1);
      expect(responseCallback.mock.calls[0][0]).toEqual({
        response: response.data,
      });
    });

    it('handles errors', () => {
      var response = {
        errors: [{
          message: 'Something went wrong.',
          locations: [{
            column: 10,
            line: 1,
          }],
        }],
      };

      expect(fetch).not.toBeCalled();
      networkLayer.sendMutation(request);
      expect(fetch).toBeCalled();

      fetch.mock.deferreds[0].resolve(genResponse(response));
      jest.runAllTimers();

      expect(rejectCallback.mock.calls.length).toBe(1);
      var error = rejectCallback.mock.calls[0][0];
      expect(error instanceof Error).toBe(true);
      expect(error.message).toEqual([
        'Server request for mutation \`FeedbackLikeMutation\` failed for the ' +
          'following reasons:',
        '',
        '1. Something went wrong.',
        '   ' + request.getQueryString().substr(0, 60),
        '            ^^^',
      ].join('\n'));
      expect(error.source).toEqual(response);
    });
  });

  describe('sendQueries', () => {
    var queryA;
    var queryB;
    var requestA;
    var requestB;
    var route;

    beforeEach(() => {
      route = RelayMetaRoute.get('$fetchRelayQuery');
      queryA = RelayQuery.Node.create(Relay.QL`query{node(id:"123"){id}}`, route, {});
      queryB = RelayQuery.Node.create(Relay.QL`query{node(id:"456"){id}}`, route, {});
      requestA = new RelayQueryRequest(queryA);
      requestB = new RelayQueryRequest(queryB);
    });

    it('invokes `fetchWithRetries` with the correct values', () => {
      expect(fetchWithRetries).not.toBeCalled();
      networkLayer.sendQueries([requestA]);
      expect(fetchWithRetries).toBeCalled();
      var call = fetchWithRetries.mock.calls[0];
      expect(call[0]).toBe(networkConfig.uri);
      var {body, fetchTimeout, method, retryDelays} = call[1];
      expect(body).toBe(JSON.stringify({
        query: requestA.getQueryString(),
        variables: queryA.getVariables(),
      }));
      expect(fetchTimeout).toBe(networkConfig.timeout);
      expect(method).toBe('POST');
      expect(retryDelays).toEqual(networkConfig.retryDelays);
    });

    it('resolves with fetched response payloads', () => {
      var resolveACallback = jest.genMockFunction();
      var resolveBCallback = jest.genMockFunction();
      networkLayer.sendQueries([requestA, requestB]);
      requestA.getPromise().done(resolveACallback);
      requestB.getPromise().done(resolveBCallback);
      jest.runAllTimers();

      var payloadA = {
        data: {'123': {id: '123'}},
      };
      var payloadB = {
        data: {'456': {id: '456'}},
      };
      fetchWithRetries.mock.deferreds[0].resolve(genResponse(payloadA));
      fetchWithRetries.mock.deferreds[1].resolve(genResponse(payloadB));
      jest.runAllTimers();

      expect(resolveACallback.mock.calls.length).toBe(1);
      expect(resolveACallback.mock.calls[0][0]).toEqual({
        response: payloadA.data,
      });
      expect(resolveBCallback.mock.calls.length).toBe(1);
      expect(resolveBCallback.mock.calls[0][0]).toEqual({
        response: payloadB.data,
      });
    });

    it('rejects invalid JSON response payloads', () => {
      var rejectCallback = jest.genMockFunction();
      networkLayer.sendQueries([requestA]);
      requestA.getPromise().catch(rejectCallback);
      jest.runAllTimers();

      fetchWithRetries.mock.deferreds[0].resolve({
        json: () => Promise.reject(JSON.parse('{ // invalid')),
        status: 200,
      });
      jest.runAllTimers();

      expect(rejectCallback).toBeCalled();
      expect(rejectCallback.mock.calls[0][0].message).toEqual(
        'Unexpected token /'
      );
    });

    it('rejects errors in query responses', () => {
      var rejectCallback = jest.genMockFunction();
      networkLayer.sendQueries([requestA]);
      requestA.getPromise().catch(rejectCallback);
      jest.runAllTimers();

      var payloadA = {
        data: {},
        errors: [{
          message: 'Something went wrong.',
          locations: [{
            column: 7,
            line: 1,
          }],
        }],
      };
      fetchWithRetries.mock.deferreds[0].resolve(genResponse(payloadA));
      jest.runAllTimers();

      expect(rejectCallback).toBeCalled();
      var error = rejectCallback.mock.calls[0][0];
      expect(error.message).toEqual([
        'Server request for query `UnknownFile` failed for the following ' +
          'reasons:',
        '',
        '1. Something went wrong.',
        '   ' + requestA.getQueryString().substr(0, 60),
        '         ^^^',
      ].join('\n'));
      expect(error.source).toEqual(payloadA);
    });

    it('rejects requests with missing responses', () => {
      var rejectACallback = jest.genMockFunction();
      var resolveBCallback = jest.genMockFunction();
      networkLayer.sendQueries([requestA, requestB]);
      requestA.getPromise().catch(rejectACallback);
      requestB.getPromise().done(resolveBCallback);
      jest.runAllTimers();

      var payload = {
        data: {'456': {id: '456'}},
      };
      fetchWithRetries.mock.deferreds[0].resolve(genResponse({}));
      fetchWithRetries.mock.deferreds[1].resolve(genResponse(payload));
      jest.runAllTimers();

      expect(resolveBCallback).toBeCalled();
      expect(rejectACallback).toBeCalled();
      expect(rejectACallback.mock.calls[0][0].message).toEqual(
        'Server response was missing for query `UnknownFile`.'
      );
    });
  });
});

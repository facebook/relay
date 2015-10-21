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

jest
  .mock('warning')
  .dontMock('DliteFetchModeConstants')
  .dontMock('GraphQL_DEPRECATED')
  .dontMock('GraphQLDeferredQueryTracker')
  .dontMock('GraphQLQueryRunner')
  .dontMock('RelayStoreData');

var DliteFetchModeConstants = require('DliteFetchModeConstants');
var GraphQLQueryRunner = require('GraphQLQueryRunner');
var Relay = require('Relay');
var RelayNetworkLayer = require('RelayNetworkLayer');
var RelayPendingQueryTracker = require('RelayPendingQueryTracker');
var RelayStoreData = require('RelayStoreData');
var checkRelayQueryData = require('checkRelayQueryData');
var diffRelayQuery = require('diffRelayQuery');
var splitDeferredRelayQueries = require('splitDeferredRelayQueries');
var warning = require('warning');

describe('GraphQLQueryRunner', () => {
  var queryRunner;

  var mockCallback;
  var mockQuerySet;

  var {defer, getNode} = RelayTestUtils;

  /**
   * Helper method, returns a clone of `query` that has been marked as
   * deferred.
   */
  function deferQuery(relayQuery) {
    var node = {
      ...relayQuery.__concreteNode__,
      isDeferred: true,
    };
    return getNode(node, relayQuery.getVariables());
  }

  function mockSplitDeferredQueries() {
    splitDeferredRelayQueries.mockImplementation(
      query => ({
        required: query,
        deferred: [],
      })
    );
  }

  beforeEach(() => {
    jest.resetModuleRegistry();

    RelayNetworkLayer.injectNetworkLayer({
      supports: () => true,
    });

    queryRunner = new GraphQLQueryRunner(RelayStoreData.getDefaultInstance());

    mockCallback = jest.genMockFunction();
    mockQuerySet = {
      foo: getNode(Relay.QL`query{viewer{actor{id,name}}}`),
      bar: getNode(Relay.QL`query{node(id:"4"){id,name}}`),
      baz: null
    };

    jest.addMatchers(RelayTestUtils.matchers);
  });

  it('immediately succeeds for empty queries', () => {
    queryRunner.run({}, mockCallback);

    expect(mockCallback).not.toBeCalled();
    jest.runAllTimers();
    expect(mockCallback.mock.calls).toEqual([
      [{aborted: false, done: true, error: null, ready: true, stale: false}],
    ]);
  });

  it('immediately succeeds for no diff queries', () => {
    diffRelayQuery.mockReturnValue([]);

    queryRunner.run(mockQuerySet, mockCallback);
    jest.runAllTimers();

    var diffQueryCalls = diffRelayQuery.mock.calls;
    expect(diffQueryCalls.length).toBe(2);
    expect(diffQueryCalls[0][0]).toEqualQueryNode(mockQuerySet.foo);
    expect(diffQueryCalls[1][0]).toEqualQueryNode(mockQuerySet.bar);
    expect(mockCallback.mock.calls).toEqual([
      [{aborted: false, done: true, error: null, ready: true, stale: false}],
    ]);
  });

  it('warns and uses fallback when defer is unsupported', () => {
    diffRelayQuery.mockImplementation(query => [query]);
    checkRelayQueryData.mockImplementation(() => false);
    RelayNetworkLayer.injectNetworkLayer({
      supports: () => false,
    });

    var fragment = Relay.QL`fragment on Node{id}`;
    var querySet = {
      foo: getNode(Relay.QL`query{node(id:"123"){${defer(fragment)}}}`),
    };

    warning.mockClear();
    queryRunner.run(querySet, mockCallback);
    jest.runAllTimers();

    expect(RelayPendingQueryTracker.add.mock.calls.length).toBe(1);
    expect(RelayPendingQueryTracker.add.mock.calls[0][0].query)
      .toBe(querySet.foo);
    expect(splitDeferredRelayQueries).not.toBeCalled();
    expect(warning.mock.calls[0]).toEqual([
      false,
      'Relay: Query `%s` contains a deferred fragment (e.g. ' +
      '`getFragment(\'foo\').defer()`) which is not supported by the ' +
      'default network layer. This query will be sent without deferral.',
      querySet.foo.getName(),
    ]);
  });

  it('is not ready if required data is being fetched', () => {
    diffRelayQuery.mockImplementation(query => [query]);
    checkRelayQueryData.mockImplementation(() => false);
    mockSplitDeferredQueries();

    queryRunner.run(mockQuerySet, mockCallback);
    jest.runAllTimers();

    expect(mockCallback.mock.calls).toEqual([
      [{aborted: false, done: false, error: null, ready: false, stale: false}],
    ]);
  });

  it('adds all split and diff queries to RelayPendingQueryTracker', () => {
    diffRelayQuery.mockImplementation(query => [query]);
    mockSplitDeferredQueries();

    queryRunner.run(mockQuerySet, mockCallback);
    jest.runAllTimers();

    expect(RelayPendingQueryTracker.add.mock.calls.length).toBe(2);
    expect(RelayPendingQueryTracker.add.mock.calls[0][0].query)
      .toEqualQueryNode(mockQuerySet.foo);
    expect(RelayPendingQueryTracker.add.mock.calls[1][0].query)
      .toEqualQueryNode(mockQuerySet.bar);
  });

  it('waits for all required data before being ready', () => {
    diffRelayQuery.mockImplementation(query => [query]);
    mockSplitDeferredQueries();

    queryRunner.run(mockQuerySet, mockCallback);
    jest.runAllTimers();

    RelayPendingQueryTracker.add.mock.fetches[0].resolve();
    jest.runAllTimers();
    expect(mockCallback.mock.calls).toEqual([
      [{aborted: false, done: false, error: null, ready: false, stale: false}],
    ]);

    RelayPendingQueryTracker.add.mock.fetches[1].resolve();
    jest.runAllTimers();
    expect(mockCallback).lastCalledWith(
      {aborted: false, done: true, error: null, ready: true, stale: false}
    );
  });

  it('throws to global if the callback throws', () => {
    diffRelayQuery.mockImplementation(query => [query]);
    mockSplitDeferredQueries();

    var mockError = new Error('Expected callback error.');
    mockCallback.mockImplementation(() => {
      throw mockError;
    });

    queryRunner.run(mockQuerySet, mockCallback);
    expect(() => {
      jest.runAllTimers();
    }).toThrow(mockError);
  });

  it('is immediately ready for no required queries', () => {
    diffRelayQuery.mockImplementation(query => [query]);
    // Treat all queries as deferred.
    splitDeferredRelayQueries.mockImplementation(query => ({
      required: null,
      deferred: [{
        required: deferQuery(query),
        deferred: [],
      }],
    }));

    queryRunner.run(mockQuerySet, mockCallback);
    jest.runAllTimers();

    expect(mockCallback.mock.calls).toEqual([
      [{aborted: false, done: false, error: null, ready: true, stale: false}],
    ]);
  });

  it('calls the callback for each deferred query', () => {
    diffRelayQuery.mockImplementation(query => [query]);
    splitDeferredRelayQueries.mockImplementation(query => {
      if (query.getFieldName() === 'viewer') {
        return {
          required: query,
          deferred: [],
        };
      } else {
        // Treat `mockQuerySet.bar` as deferred.
        return {
          query: null,
          deferred: [{
            required: deferQuery(query),
            deferred: [],
          }],
        };
      }
    });

    queryRunner.run(mockQuerySet, mockCallback);
    jest.runAllTimers();

    RelayPendingQueryTracker.add.mock.fetches[0].resolve();
    jest.runAllTimers();

    expect(mockCallback.mock.calls).toEqual([
      [{aborted: false, done: false, error: null, ready: false, stale: false}],
      [{aborted: false, done: false, error: null, ready: true, stale: false}],
    ]);

    RelayPendingQueryTracker.add.mock.fetches[1].resolve();
    jest.runAllTimers();

    expect(mockCallback).lastCalledWith(
      {aborted: false, done: true, error: null, ready: true, stale: false}
    );
  });

  it('calls the callback only once when completing all queries', () => {
    diffRelayQuery.mockImplementation(query => [query]);
    mockSplitDeferredQueries();

    queryRunner.run(mockQuerySet, mockCallback);
    jest.runAllTimers();

    expect(mockCallback.mock.calls).toEqual([
      [{aborted: false, done: false, error: null, ready: false, stale: false}],
    ]);

    RelayPendingQueryTracker.add.mock.fetches[0].resolve();
    RelayPendingQueryTracker.add.mock.fetches[1].resolve();
    jest.runAllTimers();

    expect(mockCallback.mock.calls).toEqual([
      [{aborted: false, done: false, error: null, ready: false, stale: false}],
      [{aborted: false, done: true, error: null, ready: true, stale: false}],
    ]);
  });

  it('is done after all data is fetched', () => {
    diffRelayQuery.mockImplementation(query => [query]);
    mockSplitDeferredQueries();

    queryRunner.run(mockQuerySet, mockCallback);
    jest.runAllTimers();

    RelayPendingQueryTracker.add.mock.fetches[0].resolve();
    RelayPendingQueryTracker.add.mock.fetches[1].resolve();
    jest.runAllTimers();

    expect(mockCallback).lastCalledWith(
      {aborted: false, done: true, error: null, ready: true, stale: false}
    );
  });

  it('calls the callback when aborted', () => {
    diffRelayQuery.mockImplementation(query => [query]);
    mockSplitDeferredQueries();

    queryRunner.run(mockQuerySet, mockCallback).abort();
    jest.runAllTimers();

    expect(mockCallback.mock.calls).toEqual([
      [{aborted: true, done: false, error: null, ready: false, stale: false}],
    ]);
  });

  it('ignores subsequent calls to abort', () => {
    diffRelayQuery.mockImplementation(query => [query]);
    mockSplitDeferredQueries();

    var request = queryRunner.run(mockQuerySet, mockCallback);
    request.abort();
    jest.runAllTimers();

    request.abort();
    jest.runAllTimers();

    expect(mockCallback.mock.calls).toEqual([
      [{aborted: true, done: false, error: null, ready: false, stale: false}],
    ]);
  });

  it('ignores calls to abort after being done', () => {
    diffRelayQuery.mockImplementation(query => [query]);
    mockSplitDeferredQueries();

    var request = queryRunner.run(mockQuerySet, mockCallback);
    jest.runAllTimers();

    RelayPendingQueryTracker.add.mock.fetches[0].resolve();
    RelayPendingQueryTracker.add.mock.fetches[1].resolve();
    jest.runAllTimers();

    var before = mockCallback.mock.calls.length;

    expect(() => {
      request.abort();
      jest.runAllTimers();
    }).not.toThrow();

    expect(mockCallback.mock.calls.length - before).toBe(0);
  });

  it('ignores state changes after being aborted', () => {
    diffRelayQuery.mockImplementation(query => [query]);
    mockSplitDeferredQueries();

    queryRunner.run(mockQuerySet, mockCallback).abort();
    jest.runAllTimers();

    RelayPendingQueryTracker.add.mock.fetches[0].resolve();
    RelayPendingQueryTracker.add.mock.fetches[1].resolve();
    jest.runAllTimers();

    expect(mockCallback.mock.calls).toEqual([
      [{aborted: true, done: false, error: null, ready: false, stale: false}],
    ]);
  });

  it('is ready if required data is in disk cache', () => {
    diffRelayQuery.mockImplementation(query => [query]);
    RelayStoreData.prototype.hasCacheManager =
      jest.genMockFunction().mockImplementation(() => true);
    RelayStoreData.prototype.readFromDiskCache =
      jest.genMockFunction().mockImplementation((queries, callback) => {
        callback.onSuccess();
      });
    mockSplitDeferredQueries();

    queryRunner.run(mockQuerySet, mockCallback);
    jest.runAllTimers();

    expect(mockCallback.mock.calls).toEqual([
      [{aborted: false, done: false, error: null, ready: false, stale: false}],
      [{aborted: false, done: false, error: null, ready: true, stale: true}],
    ]);
  });

  it('adds query on `forceFetch` even if there are no diff queries', () => {
    diffRelayQuery.mockImplementation(query => []);
    mockSplitDeferredQueries();

    var singleMockQuery = {foo: mockQuerySet.foo};
    queryRunner.forceFetch(singleMockQuery, mockCallback);
    jest.runAllTimers();

    expect(RelayPendingQueryTracker.add.mock.calls.length).toBe(1);
    expect(RelayPendingQueryTracker.add.mock.calls[0][0].query)
      .toEqualQueryNode(singleMockQuery.foo);
  });

  it('is completely ready on `forceFetch` when all data is available', () => {
    diffRelayQuery.mockImplementation(() => []);
    checkRelayQueryData.mockImplementation(() => true);
    mockSplitDeferredQueries();
    var singleMockQuery = {foo: mockQuerySet.foo};
    queryRunner.forceFetch(singleMockQuery, mockCallback);
    jest.runAllTimers();

    expect(mockCallback.mock.calls).toEqual([
      [{aborted: false, done: false, error: null, ready: false, stale: false}],
      [{aborted: false, done: false, error: null, ready: true, stale: true}],
    ]);
    expect(RelayPendingQueryTracker.add.mock.calls.length).toBe(1);

    RelayPendingQueryTracker.add.mock.fetches[0].resolve();
    jest.runAllTimers();

    expect(mockCallback).lastCalledWith(
      {aborted: false, done: true, error: null, ready: true, stale: false}
    );
  });

  describe('Batch callback for multiple queries', () => {
    var runTest;
    var fetchMode;
    beforeEach(() => {
      diffRelayQuery.mockImplementation(query => [query]);

      var mockQuery = getNode(Relay.QL`
        query {
          viewer{actor{id,firstName,lastName,name,address{city},hometown{id}}}
        }
      `);

      var mockSplitQueries = {
        required: getNode(Relay.QL`
          query {
            viewer{actor{id,name}}
          }
        `),
        deferred: [
          Relay.QL`
            query {
              viewer{actor{id,address{city}}}
            }
          `,
          Relay.QL`
            query {
              viewer{actor{id,hometown{id}}}
            }
          `,
          Relay.QL`
            query {
              viewer{actor{id,firstName}}
            }
          `,
          Relay.QL`
            query {
              viewer{actor{id,lastName}}
            }
          `,
        ].map(query => ({
          required: deferQuery(getNode(query)),
          deferred: [],
        }))
      };

      splitDeferredRelayQueries.mockImplementation(query => {
        expect(query).toEqualQueryNode(mockQuery);
        return mockSplitQueries;
      });

      var resolveSplitQueryByIndex = index => {
        RelayPendingQueryTracker.add.mock.fetches[index].resolve();
      };
      runTest = () => {
        queryRunner.run(
          {foo: mockQuery},
          mockCallback,
          fetchMode
        );
        resolveSplitQueryByIndex(1);
        resolveSplitQueryByIndex(0);
        jest.runAllTimers();

        var defaultState = {
          aborted: false,
          done: false,
          error: null,
          ready: false,
          stale: false,
        };

        // Only called once after both splitQuery#0 and splitQuery#1.
        expect(mockCallback.mock.calls).toEqual([
          [{...defaultState}],
          [{...defaultState, ready: true}],
        ]);

        resolveSplitQueryByIndex(2);
        resolveSplitQueryByIndex(3);
        jest.runAllTimers();

        // Only called once more after both splitQuery#2 and splitQuery#3.
        expect(mockCallback.mock.calls).toEqual([
          [{...defaultState, ready: false}],
          [{...defaultState, ready: true}],
          [{...defaultState, ready: true}],
        ]);

        resolveSplitQueryByIndex(4);
        jest.runAllTimers();

        expect(mockCallback).lastCalledWith(
          {...defaultState, done: true, ready: true}
        );
      };
    });

    it('does in preload mode', () => {
      fetchMode = DliteFetchModeConstants.FETCH_MODE_PRELOAD;
      runTest();
    });

    it('does in client mode', () => {
      fetchMode = DliteFetchModeConstants.FETCH_MODE_CLIENT;
      runTest();
    });
  });
});

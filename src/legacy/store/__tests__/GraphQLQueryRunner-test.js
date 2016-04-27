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

jest
  .mock('warning')
  .unmock('GraphQLQueryRunner')
  .unmock('RelayTaskQueue');

const Relay = require('Relay');
const RelayFetchMode = require('RelayFetchMode');
const RelayStoreData = require('RelayStoreData');
const RelayTestUtils = require('RelayTestUtils');

const checkRelayQueryData = require('checkRelayQueryData');
const diffRelayQuery = require('diffRelayQuery');
const splitDeferredRelayQueries = require('splitDeferredRelayQueries');
const warning = require('warning');

describe('GraphQLQueryRunner', () => {
  let networkLayer;
  let queryRunner;
  let pendingQueryTracker;

  let mockCallback;
  let mockQuerySet;

  const {defer, getNode} = RelayTestUtils;

  /**
   * Helper method, returns a clone of `query` that has been marked as
   * deferred.
   */
  function deferQuery(relayQuery) {
    const node = {
      ...relayQuery.getConcreteQueryNode(),
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

    const storeData = new RelayStoreData();
    networkLayer = storeData.getNetworkLayer();
    queryRunner = storeData.getQueryRunner();
    pendingQueryTracker = storeData.getPendingQueryTracker();

    networkLayer.injectImplementation({
      supports: () => true,
    });

    mockCallback = jest.fn();
    mockQuerySet = {
      foo: getNode(Relay.QL`query{viewer{actor{id,name}}}`),
      bar: getNode(Relay.QL`query{node(id:"4"){id,name}}`),
      baz: null,
    };

    jasmine.addMatchers(RelayTestUtils.matchers);
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

    const diffQueryCalls = diffRelayQuery.mock.calls;
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
    networkLayer.injectImplementation({
      supports: () => false,
    });

    const fragment = Relay.QL`fragment on Node{id}`;
    const querySet = {
      foo: getNode(Relay.QL`query{node(id:"123"){${defer(fragment)}}}`),
    };

    warning.mockClear();
    queryRunner.run(querySet, mockCallback);
    jest.runAllTimers();

    expect(pendingQueryTracker.add.mock.calls.length).toBe(1);
    expect(pendingQueryTracker.add.mock.calls[0][0].query)
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

  it('adds all split and diff queries to the pending query tracker', () => {
    diffRelayQuery.mockImplementation(query => [query]);
    mockSplitDeferredQueries();

    queryRunner.run(mockQuerySet, mockCallback);
    jest.runAllTimers();

    expect(pendingQueryTracker.add.mock.calls.length).toBe(2);
    expect(pendingQueryTracker.add.mock.calls[0][0].query)
      .toEqualQueryNode(mockQuerySet.foo);
    expect(pendingQueryTracker.add.mock.calls[1][0].query)
      .toEqualQueryNode(mockQuerySet.bar);
  });

  it('waits for all required data before being ready', () => {
    diffRelayQuery.mockImplementation(query => [query]);
    mockSplitDeferredQueries();

    queryRunner.run(mockQuerySet, mockCallback);
    jest.runAllTimers();

    pendingQueryTracker.add.mock.fetches[0].resolve();
    jest.runAllTimers();
    expect(mockCallback.mock.calls).toEqual([
      [{aborted: false, done: false, error: null, ready: false, stale: false}],
    ]);

    pendingQueryTracker.add.mock.fetches[1].resolve();
    jest.runAllTimers();
    expect(mockCallback).lastCalledWith(
      {aborted: false, done: true, error: null, ready: true, stale: false}
    );
  });

  it('throws to global if the callback throws', () => {
    diffRelayQuery.mockImplementation(query => [query]);
    mockSplitDeferredQueries();

    const mockError = new Error('Expected callback error.');
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

    pendingQueryTracker.add.mock.fetches[0].resolve();
    jest.runAllTimers();

    expect(mockCallback.mock.calls).toEqual([
      [{aborted: false, done: false, error: null, ready: false, stale: false}],
      [{aborted: false, done: false, error: null, ready: true, stale: false}],
    ]);

    pendingQueryTracker.add.mock.fetches[1].resolve();
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

    pendingQueryTracker.add.mock.fetches[0].resolve();
    pendingQueryTracker.add.mock.fetches[1].resolve();
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

    pendingQueryTracker.add.mock.fetches[0].resolve();
    pendingQueryTracker.add.mock.fetches[1].resolve();
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

  it('is ready if required data is in disk cache', () => {
    diffRelayQuery.mockImplementation(query => [query]);
    RelayStoreData.prototype.hasCacheManager =
      jest.fn(() => true);
    RelayStoreData.prototype.readFromDiskCache =
      jest.fn((queries, callback) => {
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

    const singleMockQuery = {foo: mockQuerySet.foo};
    queryRunner.forceFetch(singleMockQuery, mockCallback);
    jest.runAllTimers();

    expect(pendingQueryTracker.add.mock.calls.length).toBe(1);
    expect(pendingQueryTracker.add.mock.calls[0][0].query)
      .toEqualQueryNode(singleMockQuery.foo);
  });

  it('is completely ready on `forceFetch` when all data is available', () => {
    diffRelayQuery.mockImplementation(() => []);
    checkRelayQueryData.mockImplementation(() => true);
    mockSplitDeferredQueries();
    const singleMockQuery = {foo: mockQuerySet.foo};
    queryRunner.forceFetch(singleMockQuery, mockCallback);
    jest.runAllTimers();

    expect(mockCallback.mock.calls).toEqual([
      [{aborted: false, done: false, error: null, ready: false, stale: false}],
      [{aborted: false, done: false, error: null, ready: true, stale: true}],
    ]);
    expect(pendingQueryTracker.add.mock.calls.length).toBe(1);

    pendingQueryTracker.add.mock.fetches[0].resolve();
    jest.runAllTimers();

    expect(mockCallback).lastCalledWith(
      {aborted: false, done: true, error: null, ready: true, stale: false}
    );
  });

  describe('Batch callback for multiple queries', () => {
    let runTest;
    let fetchMode;
    beforeEach(() => {
      diffRelayQuery.mockImplementation(query => [query]);

      const mockQuery = getNode(Relay.QL`
        query {
          viewer{actor{id,firstName,lastName,name,address{city},hometown{id}}}
        }
      `);

      const mockSplitQueries = {
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
        })),
      };

      splitDeferredRelayQueries.mockImplementation(query => {
        expect(query).toEqualQueryNode(mockQuery);
        return mockSplitQueries;
      });

      const resolveSplitQueryByIndex = index => {
        pendingQueryTracker.add.mock.fetches[index].resolve();
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

        const defaultState = {
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
      fetchMode = RelayFetchMode.PRELOAD;
      runTest();
    });

    it('does in client mode', () => {
      fetchMode = RelayFetchMode.CLIENT;
      runTest();
    });
  });
});

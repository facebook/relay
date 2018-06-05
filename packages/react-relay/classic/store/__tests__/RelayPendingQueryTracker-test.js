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

jest
  .mock('../../network/RelayNetworkLayer')
  .mock('../../traversal/writeRelayQueryPayload')
  .useFakeTimers();

require('configureForRelayOSS');

const RelayClassic = require('../../RelayPublic');
const RelayFetchMode = require('../RelayFetchMode');
const RelayStoreData = require('../RelayStoreData');
const RelayTestUtils = require('RelayTestUtils');

const writeRelayQueryPayload = require('../../traversal/writeRelayQueryPayload');

describe('RelayPendingQueryTracker', () => {
  let pendingQueryTracker;

  let addPending;

  let fetchRelayQuery;

  const {getNode} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModules();

    const storeData = new RelayStoreData();
    fetchRelayQuery = storeData.getNetworkLayer().fetchRelayQuery;
    pendingQueryTracker = storeData.getPendingQueryTracker();

    addPending = ({query, fetchMode}) => {
      fetchMode = fetchMode || RelayFetchMode.CLIENT;
      return pendingQueryTracker
        .add({
          query,
          fetchMode,
          forceIndex: null,
        })
        .getResolvedPromise();
    };

    expect.extend(RelayTestUtils.matchers);
    expect.extend({
      toConsoleWarn(callback, expected) {
        const consoleWarn = console.warn;
        let pass = false;
        console.warn = (...args) => {
          if (
            args.length === expected.length &&
            args.every((arg, ii) => arg === expected[ii])
          ) {
            pass = true;
          } else {
            consoleWarn(...args);
          }
        };
        callback();
        console.warn = consoleWarn;
        return {pass};
      },
    });
  });

  it('calls `onSuccess` callback when inner fetch resolves', () => {
    const mockQueryA = getNode(
      RelayClassic.QL`
      query {
        viewer{actor{id,name}}
      }
    `,
    );

    const pendingA = addPending({query: mockQueryA});
    const mockSuccessA = jest.fn();
    pendingA.done(mockSuccessA);
    jest.runAllTimers();

    fetchRelayQuery.mock.requests[0].resolve({viewer: {}});
    jest.runAllTimers();

    expect(mockSuccessA).toBeCalled();
  });

  it('calls `writeRelayQueryPayload` when receiving data', () => {
    const mockQueryA = getNode(
      RelayClassic.QL`
      query {
        viewer{actor{id,name}}
      }
    `,
    );

    addPending({query: mockQueryA});
    jest.runAllTimers();

    fetchRelayQuery.mock.requests[0].resolve({viewer: {}});
    jest.runAllTimers();

    const writeCalls = writeRelayQueryPayload.mock.calls;
    expect(writeCalls.length).toBe(1);
    expect(writeCalls[0][1]).toEqualQueryRoot(mockQueryA);
    expect(writeCalls[0][2]).toEqual({viewer: {}});
  });

  it('fails if fetching throws an error', () => {
    const mockQuery = getNode(
      RelayClassic.QL`
      query {
        viewer{actor{id,name}}
      }
    `,
    );
    const pendingA = addPending({query: mockQuery});
    const mockFailureA = jest.fn();
    pendingA.catch(mockFailureA);

    const mockError = new Error('Expected error.');
    fetchRelayQuery.mock.requests[0].reject(mockError);
    expect(() => {
      jest.runAllTimers();
    }).toConsoleWarn([mockError.message]);

    expect(mockFailureA).toBeCalledWith(mockError);
  });

  it('fails if `writeRelayQueryPayload` throws', () => {
    const mockQuery = getNode(
      RelayClassic.QL`
      query {
        viewer{actor{id,name}}
      }
    `,
    );
    const pendingA = addPending({query: mockQuery});
    const mockFailureA = jest.fn();
    pendingA.catch(mockFailureA);

    const mockError = new Error('Expected error.');
    fetchRelayQuery.mock.requests[0].resolve({viewer: {}});
    writeRelayQueryPayload.mockImplementation(() => {
      throw mockError;
    });
    expect(() => {
      jest.runAllTimers();
    }).toConsoleWarn([mockError.message]);

    expect(mockFailureA).toBeCalledWith(mockError);
  });

  it('can resolve preload queries *after* they are added', () => {
    const mockQuery = getNode(
      RelayClassic.QL`
      query {
        viewer{actor{id,name}}
      }
    `,
    );

    addPending({
      query: mockQuery,
      fetchMode: RelayFetchMode.PRELOAD,
    });

    pendingQueryTracker.resolvePreloadQuery(mockQuery.getID(), {
      response: {viewer: {}},
    });

    jest.runAllTimers();

    expect(pendingQueryTracker.hasPendingQueries()).toBeFalsy();
    const writeCalls = writeRelayQueryPayload.mock.calls;
    expect(writeCalls.length).toBe(1);
    expect(writeCalls[0][1]).toEqualQueryRoot(mockQuery);
    expect(writeCalls[0][2]).toEqual({viewer: {}});
  });

  it('can resolve preload queries *before* they are added', () => {
    const mockQuery = getNode(
      RelayClassic.QL`
      query {
        viewer{actor{id,name}}
      }
    `,
    );

    pendingQueryTracker.resolvePreloadQuery(mockQuery.getID(), {
      response: {viewer: {}},
    });

    addPending({
      query: mockQuery,
      fetchMode: RelayFetchMode.PRELOAD,
    });

    jest.runAllTimers();

    expect(pendingQueryTracker.hasPendingQueries()).toBeFalsy();
    const writeCalls = writeRelayQueryPayload.mock.calls;
    expect(writeCalls.length).toBe(1);
    expect(writeCalls[0][1]).toEqualQueryRoot(mockQuery);
    expect(writeCalls[0][2]).toEqual({viewer: {}});
  });

  it('can reject preloaded pending queries by id', () => {
    const mockQuery = getNode(
      RelayClassic.QL`
      query {
        viewer{actor{id,name}}
      }
    `,
    );

    const mockPending = addPending({
      query: mockQuery,
      fetchMode: RelayFetchMode.PRELOAD,
    });
    const mockCallback = jest.fn();
    mockPending.catch(mockCallback);

    const mockError = new Error('Expected error.');
    pendingQueryTracker.rejectPreloadQuery(mockQuery.getID(), mockError);
    expect(() => {
      jest.runAllTimers();
    }).toConsoleWarn([mockError.message]);

    jest.runAllTimers();

    expect(pendingQueryTracker.hasPendingQueries()).toBeFalsy();
    expect(mockCallback).toBeCalledWith(mockError);
  });

  it('has pending queries when not queries are all resolved', () => {
    const mockQueryA = getNode(
      RelayClassic.QL`
      query {
        viewer{actor{id,name}}
      }
    `,
    );
    addPending({query: mockQueryA});
    jest.runAllTimers();

    expect(pendingQueryTracker.hasPendingQueries()).toBeTruthy();
  });

  it('has no pending queries when queries are all resolved', () => {
    const mockQueryA = getNode(
      RelayClassic.QL`
      query {
        viewer{actor{id,name}}
      }
    `,
    );
    addPending({query: mockQueryA});
    jest.runAllTimers();

    fetchRelayQuery.mock.requests[0].resolve({viewer: {}});
    jest.runAllTimers();

    expect(pendingQueryTracker.hasPendingQueries()).toBeFalsy();
  });

  it('has no pending queries after being reset', () => {
    const mockQueryA = getNode(
      RelayClassic.QL`
      query {
        viewer{actor{id,name}}
      }
    `,
    );
    addPending({query: mockQueryA});
    jest.runAllTimers();

    pendingQueryTracker.resetPending();

    expect(pendingQueryTracker.hasPendingQueries()).toBeFalsy();
  });
});

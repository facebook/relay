/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

require('configureForRelayOSS');

jest.unmock('RelayPendingQueryTracker').unmock('RelayTaskQueue');

const Relay = require('Relay');
const RelayFetchMode = require('RelayFetchMode');
const RelayStoreData = require('RelayStoreData');
const RelayTestUtils = require('RelayTestUtils');

const writeRelayQueryPayload = require('writeRelayQueryPayload');

describe('RelayPendingQueryTracker', () => {
  let pendingQueryTracker;

  let addPending;

  let fetchRelayQuery;

  let spyOnConsole;

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

    jasmine.addMatchers(RelayTestUtils.matchers);

    let consoleWarn = console.warn;

    spyOnConsole = () => {
      const spy = {};
      console.warn = (...args) => {
        spy.args = args;
      };
      return spy;
    };

    jasmine.addMatchers({
      toHaveWarned() {
        return {
          compare(spy, expected) {
            let pass = false;
            if (
              spy.args.length === expected.length &&
              spy.args.every((arg, ii) => arg === expected[ii])
            ) {
              pass = true;
            } else {
              consoleWarn(...args);
            }
            console.warn = consoleWarn;
            return {pass};
          },
        };
      },
    });
  });

  it('calls `onSuccess` callback when inner fetch resolves', async () => {
    const mockQueryA = getNode(
      Relay.QL`
      query {
        viewer{actor{id,name}}
      }
    `,
    );

    const pendingA = addPending({query: mockQueryA});
    const mockSuccessA = jest.fn();
    const promise = pendingA.then(mockSuccessA);

    fetchRelayQuery.mock.requests[0].resolve({viewer: {}});
    await promise;

    expect(mockSuccessA).toBeCalled();
  });

  it('calls `writeRelayQueryPayload` when receiving data', async () => {
    const mockQueryA = getNode(
      Relay.QL`
      query {
        viewer{actor{id,name}}
      }
    `,
    );

    const promise = addPending({query: mockQueryA});

    fetchRelayQuery.mock.requests[0].resolve({viewer: {}});
    await promise;

    const writeCalls = writeRelayQueryPayload.mock.calls;
    expect(writeCalls.length).toBe(1);
    expect(writeCalls[0][1]).toEqualQueryRoot(mockQueryA);
    expect(writeCalls[0][2]).toEqual({viewer: {}});
  });

  it('fails if fetching throws an error', async () => {
    const mockQuery = getNode(
      Relay.QL`
      query {
        viewer{actor{id,name}}
      }
    `,
    );
    const pendingA = addPending({query: mockQuery});
    const mockFailureA = jest.fn();
    const promise = pendingA.catch(mockFailureA);

    const mockError = new Error('Expected error.');
    fetchRelayQuery.mock.requests[0].reject(mockError);

    const spy = spyOnConsole();
    await promise;
    expect(spy).toHaveWarned([mockError.message]);

    expect(mockFailureA).toBeCalledWith(mockError);
  });

  it('fails if `writeRelayQueryPayload` throws', async () => {
    const mockQuery = getNode(
      Relay.QL`
      query {
        viewer{actor{id,name}}
      }
    `,
    );
    const pendingA = addPending({query: mockQuery});
    const mockFailureA = jest.fn();
    const promise = pendingA.catch(mockFailureA);

    const mockError = new Error('Expected error.');
    fetchRelayQuery.mock.requests[0].resolve({viewer: {}});
    writeRelayQueryPayload.mockImplementation(() => {
      throw mockError;
    });

    const spy = spyOnConsole();
    await promise;
    expect(spy).toHaveWarned([mockError.message]);

    expect(mockFailureA).toBeCalledWith(mockError);
  });

  it('can resolve preload queries *after* they are added', async () => {
    const mockQuery = getNode(
      Relay.QL`
      query {
        viewer{actor{id,name}}
      }
    `,
    );

    const promise = addPending({
      query: mockQuery,
      fetchMode: RelayFetchMode.PRELOAD,
    });

    pendingQueryTracker.resolvePreloadQuery(mockQuery.getID(), {
      response: {viewer: {}},
    });

    await promise;

    expect(pendingQueryTracker.hasPendingQueries()).toBeFalsy();
    const writeCalls = writeRelayQueryPayload.mock.calls;
    expect(writeCalls.length).toBe(1);
    expect(writeCalls[0][1]).toEqualQueryRoot(mockQuery);
    expect(writeCalls[0][2]).toEqual({viewer: {}});
  });

  it('can resolve preload queries *before* they are added', async () => {
    const mockQuery = getNode(
      Relay.QL`
      query {
        viewer{actor{id,name}}
      }
    `,
    );

    pendingQueryTracker.resolvePreloadQuery(mockQuery.getID(), {
      response: {viewer: {}},
    });

    await addPending({
      query: mockQuery,
      fetchMode: RelayFetchMode.PRELOAD,
    });

    expect(pendingQueryTracker.hasPendingQueries()).toBeFalsy();
    const writeCalls = writeRelayQueryPayload.mock.calls;
    expect(writeCalls.length).toBe(1);
    expect(writeCalls[0][1]).toEqualQueryRoot(mockQuery);
    expect(writeCalls[0][2]).toEqual({viewer: {}});
  });

  it('can reject preloaded pending queries by id', async () => {
    const mockQuery = getNode(
      Relay.QL`
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
    const promise = mockPending.catch(mockCallback);

    const mockError = new Error('Expected error.');
    pendingQueryTracker.rejectPreloadQuery(mockQuery.getID(), mockError);

    const spy = spyOnConsole();
    await promise;
    expect(spy).toHaveWarned([mockError.message]);

    expect(pendingQueryTracker.hasPendingQueries()).toBeFalsy();
    expect(mockCallback).toBeCalledWith(mockError);
  });

  it('has pending queries when not queries are all resolved', () => {
    const mockQueryA = getNode(
      Relay.QL`
      query {
        viewer{actor{id,name}}
      }
    `,
    );
    addPending({query: mockQueryA});

    expect(pendingQueryTracker.hasPendingQueries()).toBeTruthy();
  });

  it('has no pending queries when queries are all resolved', async () => {
    const mockQueryA = getNode(
      Relay.QL`
      query {
        viewer{actor{id,name}}
      }
    `,
    );
    const promise = addPending({query: mockQueryA});

    fetchRelayQuery.mock.requests[0].resolve({viewer: {}});
    await promise;

    expect(pendingQueryTracker.hasPendingQueries()).toBeFalsy();
  });

  it('has no pending queries after being reset', () => {
    const mockQueryA = getNode(
      Relay.QL`
      query {
        viewer{actor{id,name}}
      }
    `,
    );
    const promise = addPending({query: mockQueryA});

    pendingQueryTracker.resetPending();

    expect(pendingQueryTracker.hasPendingQueries()).toBeFalsy();
  });
});

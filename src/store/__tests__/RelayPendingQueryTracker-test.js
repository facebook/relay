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
  .dontMock('RelayPendingQueryTracker')
  .dontMock('RelayTaskQueue');

const Relay = require('Relay');
const RelayFetchMode = require('RelayFetchMode');
const RelayStoreData = require('RelayStoreData');
const RelayTestUtils = require('RelayTestUtils');

const subtractRelayQuery = require('subtractRelayQuery');
const writeRelayQueryPayload = require('writeRelayQueryPayload');

describe('RelayPendingQueryTracker', () => {
  let pendingQueryTracker;

  let addPending;

  let fetchRelayQuery;

  const {getNode} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModuleRegistry();

    const storeData = new RelayStoreData();
    fetchRelayQuery = storeData.getNetworkLayer().fetchRelayQuery;
    pendingQueryTracker = storeData.getPendingQueryTracker();

    subtractRelayQuery.mockImplementation(query => query);

    addPending = ({query, fetchMode}) => {
      fetchMode = fetchMode || RelayFetchMode.CLIENT;
      return pendingQueryTracker.add({
        query,
        fetchMode,
        forceIndex: null,
      }).getResolvedPromise();
    };

    jasmine.addMatchers(RelayTestUtils.matchers);
    jasmine.addMatchers({
      toConsoleWarn() {
        return {
          compare(callback, expected) {
            const consoleWarn = console.warn;
            let pass = false;
            console.warn = (...args) => {
              if (args.length === expected.length &&
                  args.every((arg, ii) => arg === expected[ii])) {
                pass = true;
              } else {
                consoleWarn(...args);
              }
            };
            callback();
            console.warn = consoleWarn;
            return {pass};
          },
        };
      },
    });
  });

  it('subtracts pending queries that share root call', () => {
    const mockQueryA = getNode(Relay.QL`
      query {
        viewer{actor{id,name}}
      }
    `);
    const mockQueryB = getNode(Relay.QL`
      query {
        node(id:"4"){actor{id,name}}
      }
    `);
    const mockQueryC = getNode(Relay.QL`
      query {
        viewer{actor{id,name,birthdate{day}}}
      }
    `);
    const mockQueryD = getNode(Relay.QL`
      query {
        node(id:"4"){actor{id,name,birthdate{day}}}
      }
    `);

    addPending({query: mockQueryA});
    jest.runAllTimers();

    expect(subtractRelayQuery).not.toBeCalled();

    addPending({query: mockQueryB});
    jest.runAllTimers();

    expect(subtractRelayQuery).not.toBeCalled();

    addPending({query: mockQueryC});
    jest.runAllTimers();

    expect(subtractRelayQuery.mock.calls).toEqual([
      [mockQueryC, mockQueryA],
    ]);

    fetchRelayQuery.mock.requests[1].resolve({node: {__typename: 'User'}});
    jest.runAllTimers();

    subtractRelayQuery.mockClear();
    addPending({query: mockQueryD});
    jest.runAllTimers();

    expect(subtractRelayQuery).not.toBeCalled();
  });

  it('subtracts pending queries until completely subtracted', () => {
    const mockQueryA = getNode(Relay.QL`
      query {
        viewer{actor{id,name}}
      }
    `);
    const mockQueryB = getNode(Relay.QL`
      query {
        viewer{actor{id,name}}
      }
    `);
    const mockQueryC = getNode(Relay.QL`
      query {
        viewer{actor{id,name}}
      }
    `);

    addPending({query: mockQueryA});
    jest.runAllTimers();

    subtractRelayQuery.mockImplementation(() => null);

    addPending({query: mockQueryB});
    addPending({query: mockQueryC});
    jest.runAllTimers();

    expect(subtractRelayQuery.mock.calls).toEqual([
      [mockQueryB, mockQueryA],
      [mockQueryC, mockQueryA],
    ]);
  });

  it('does not fetch completely subtracted queries', () => {
    const mockQueryA = getNode(Relay.QL`
      query {
        viewer{actor{id,name}}
      }
    `);
    const mockQueryB = getNode(Relay.QL`
      query {
        viewer{actor{id,name}}
      }
    `);

    addPending({query: mockQueryA});
    jest.runAllTimers();

    subtractRelayQuery.mockImplementation((query, subQuery) => {
      expect(query).toBe(mockQueryB);
      expect(subQuery).toBe(mockQueryA);
      return null;
    });

    addPending({query: mockQueryB});
    jest.runAllTimers();

    expect(fetchRelayQuery.mock.calls.length).toBe(1);
    expect(fetchRelayQuery.mock.calls[0][0]).toEqualQueryRoot(mockQueryA);
  });

  it('calls `writeRelayQueryPayload` when receiving data', () => {
    const mockQueryA = getNode(Relay.QL`
      query {
        viewer{actor{id,name}}
      }
    `);

    addPending({query: mockQueryA});
    jest.runAllTimers();

    fetchRelayQuery.mock.requests[0].resolve({viewer:{}});
    jest.runAllTimers();

    const writeCalls = writeRelayQueryPayload.mock.calls;
    expect(writeCalls.length).toBe(1);
    expect(writeCalls[0][1]).toEqualQueryRoot(mockQueryA);
    expect(writeCalls[0][2]).toEqual({viewer:{}});
  });

  it('resolves after dependencies are ready', () => {
    const mockQueryA = getNode(Relay.QL`
      query {
        viewer{actor{id,name}}
      }
    `);
    const mockQueryB = getNode(Relay.QL`
      query {
        viewer{actor{id,name,birthdate{day}}}
      }
    `);
    const mockQueryC = getNode(Relay.QL`
      query {
        viewer{actor{id,birthdate{day}}}
      }
    `);

    const pendingA = addPending({query: mockQueryA});
    const mockSuccessA = jest.fn();
    pendingA.done(mockSuccessA);

    // Simulates: B - A = C
    subtractRelayQuery.mockImplementation((query, subQuery) => {
      expect(query).toBe(mockQueryB);
      expect(subQuery).toBe(mockQueryA);
      return mockQueryC;
    });

    const pendingB = addPending({query: mockQueryB});
    const mockSuccessB = jest.fn();
    pendingB.done(mockSuccessB);

    fetchRelayQuery.mock.requests[1].resolve({viewer:{}});
    jest.runAllTimers();

    expect(mockSuccessA).not.toBeCalled();
    expect(mockSuccessB).not.toBeCalled();

    fetchRelayQuery.mock.requests[0].resolve({viewer:{}});
    jest.runAllTimers();

    expect(mockSuccessA).toBeCalled();
    expect(mockSuccessB).toBeCalled();
  });

  it('fails direct dependents and not indirect ones', () => {
    const mockQueryA = getNode(Relay.QL`
      query {
        viewer{actor{id,name}}
      }
    `);
    const mockQueryB = getNode(Relay.QL`
      query {
        viewer{actor{id,name,birthdate{day}}}
      }
    `);
    const mockQueryBPrime = getNode(Relay.QL`
      query {
        viewer{actor{id,birthdate{day}}}
      }
    `);
    const mockQueryC = getNode(Relay.QL`
      query {
        viewer{actor{id,firstName,birthdate{day}}}
      }
    `);
    const mockQueryCPrime = getNode(Relay.QL`
      query {
        viewer{actor{id,firstName,birthdate{day}}}
      }
    `);

    const pendingA = addPending({query: mockQueryA});
    const mockFailureA = jest.fn();
    pendingA.catch(mockFailureA);
    jest.runAllTimers();

    // Simulates: B - A = B'
    subtractRelayQuery.mockImplementation((query, subQuery) => {
      expect(query).toBe(mockQueryB);
      expect(subQuery).toBe(mockQueryA);
      return mockQueryBPrime;
    });

    const pendingB = addPending({query: mockQueryB});
    const mockFailureB = jest.fn();
    pendingB.catch(mockFailureB);
    jest.runAllTimers();

    // Simulates: C - A = C, C - B' = C'
    subtractRelayQuery.mockImplementation((query, subQuery) => {
      expect(query).toBe(mockQueryC);
      expect([mockQueryA, mockQueryBPrime]).toContain(subQuery);
      return subQuery === mockQueryA ? mockQueryC : mockQueryCPrime;
    });

    const pendingC = addPending({query: mockQueryC});
    const mockSuccessC = jest.fn();
    pendingC.done(mockSuccessC);
    jest.runAllTimers();

    const mockFetchError = new Error('Expected `fetchRelayQuery` error.');
    fetchRelayQuery.mock.requests[1].resolve({viewer:{}});
    fetchRelayQuery.mock.requests[0].reject(mockFetchError);
    fetchRelayQuery.mock.requests[2].resolve({viewer:{}});

    expect(() => {
      jest.runAllTimers();
    }).toConsoleWarn([mockFetchError.message]);

    const writeCalls = writeRelayQueryPayload.mock.calls;
    expect(writeCalls.length).toBe(2);
    expect(writeCalls[0][1]).toEqualQueryRoot(mockQueryBPrime);
    expect(writeCalls[0][2]).toEqual({viewer:{}});
    expect(writeCalls[1][1]).toEqualQueryRoot(mockQueryCPrime);
    expect(writeCalls[1][2]).toEqual({viewer:{}});

    expect(mockFailureA).toBeCalled();
    expect(mockFailureB).toBeCalled();
    expect(mockSuccessC).toBeCalled();
  });

  it('fails if fetching throws an error', () => {
    const mockQuery = getNode(Relay.QL`
      query {
        viewer{actor{id,name}}
      }
    `);
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
    const mockQuery = getNode(Relay.QL`
      query {
        viewer{actor{id,name}}
      }
    `);
    const pendingA = addPending({query: mockQuery});
    const mockFailureA = jest.fn();
    pendingA.catch(mockFailureA);

    const mockError = new Error('Expected error.');
    fetchRelayQuery.mock.requests[0].resolve({viewer:{}});
    writeRelayQueryPayload.mockImplementation(() => {
      throw mockError;
    });
    expect(() => {
      jest.runAllTimers();
    }).toConsoleWarn([mockError.message]);

    expect(mockFailureA).toBeCalledWith(mockError);
  });

  it('can resolve preload queries *after* they are added', () => {
    const mockQuery = getNode(Relay.QL`
      query {
        viewer{actor{id,name}}
      }
    `);

    addPending({
      query: mockQuery,
      fetchMode: RelayFetchMode.PRELOAD,
    });

    pendingQueryTracker.resolvePreloadQuery(
      mockQuery.getID(),
      {response: {viewer:{}}}
    );

    jest.runAllTimers();

    expect(pendingQueryTracker.hasPendingQueries()).toBeFalsy();
    const writeCalls = writeRelayQueryPayload.mock.calls;
    expect(writeCalls.length).toBe(1);
    expect(writeCalls[0][1]).toEqualQueryRoot(mockQuery);
    expect(writeCalls[0][2]).toEqual({viewer:{}});
  });

  it('can resolve preload queries *before* they are added', () => {
    const mockQuery = getNode(Relay.QL`
      query {
        viewer{actor{id,name}}
      }
    `);

    pendingQueryTracker.resolvePreloadQuery(
      mockQuery.getID(),
      {response: {viewer:{}}}
    );

    addPending({
      query: mockQuery,
      fetchMode: RelayFetchMode.PRELOAD,
    });

    jest.runAllTimers();

    expect(pendingQueryTracker.hasPendingQueries()).toBeFalsy();
    const writeCalls = writeRelayQueryPayload.mock.calls;
    expect(writeCalls.length).toBe(1);
    expect(writeCalls[0][1]).toEqualQueryRoot(mockQuery);
    expect(writeCalls[0][2]).toEqual({viewer:{}});
  });

  it('can reject preloaded pending queries by id', () => {
    const mockQuery = getNode(Relay.QL`
      query {
        viewer{actor{id,name}}
      }
    `);

    const mockPending = addPending({
      query: mockQuery,
      fetchMode: RelayFetchMode.PRELOAD,
    });
    const mockCallback = jest.fn();
    mockPending.catch(mockCallback);

    const mockError = new Error('Expected error.');
    pendingQueryTracker.rejectPreloadQuery(
      mockQuery.getID(),
      mockError
    );
    expect(() => {
      jest.runAllTimers();
    }).toConsoleWarn([mockError.message]);

    jest.runAllTimers();

    expect(pendingQueryTracker.hasPendingQueries()).toBeFalsy();
    expect(mockCallback).toBeCalledWith(mockError);
  });

  it('has pending queries when not queries are all resolved', () => {
    const mockQueryA = getNode(Relay.QL`
      query {
        viewer{actor{id,name}}
      }
    `);
    addPending({query: mockQueryA});
    jest.runAllTimers();

    expect(pendingQueryTracker.hasPendingQueries()).toBeTruthy();
  });

  it('has no pending queries when queries are all resolved', () => {
    const mockQueryA = getNode(Relay.QL`
      query {
        viewer{actor{id,name}}
      }
    `);
    addPending({query: mockQueryA});
    jest.runAllTimers();

    fetchRelayQuery.mock.requests[0].resolve({viewer:{}});
    jest.runAllTimers();

    expect(pendingQueryTracker.hasPendingQueries()).toBeFalsy();
  });

  it('has no pending queries after being reset', () => {
    const mockQueryA = getNode(Relay.QL`
      query {
        viewer{actor{id,name}}
      }
    `);
    addPending({query: mockQueryA});
    jest.runAllTimers();

    pendingQueryTracker.resetPending();

    expect(pendingQueryTracker.hasPendingQueries()).toBeFalsy();
  });
});

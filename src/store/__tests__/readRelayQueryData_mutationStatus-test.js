/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+relay
 */

'use strict';

const Relay = require('Relay');
const RelayMutationTransaction = require('RelayMutationTransaction');
const RelayMutationTransactionStatus = require('RelayMutationTransactionStatus');
const RelayStoreData = require('RelayStoreData');
const RelayTestUtils = require('RelayTestUtils');

const readRelayQueryData = require('readRelayQueryData');

describe('readRelayQueryData (mutationStatus)', () => {
  const {getNode, writePayload} = RelayTestUtils;

  let mutationIDs;
  let mutationTransactions;
  let mutationStatuses;
  let storeData;

  function createMockTransaction({dataID, mutationID, mutationStatus}) {
    if (mutationTransactions.hasOwnProperty(mutationID)) {
      throw new Error('Mutation transactions must have unique mutation IDs.');
    }
    mutationIDs[dataID] = mutationIDs[dataID] || [];
    mutationIDs[dataID].push(mutationID);

    mutationStatuses[mutationID] = mutationStatus;
    mutationTransactions[mutationID] =
      new RelayMutationTransaction(storeData.getMutationQueue(), mutationID);

    return {
      setStatus(newStatus) {
        mutationStatuses[mutationID] = newStatus;
      },
    };
  }

  function read({dataID, node}) {
    return readRelayQueryData(storeData, node, dataID).data;
  }

  function writeQueryPayload({query, payload}) {
    writePayload(
      storeData.getRecordStore(),
      storeData.getRecordWriter(),
      query,
      payload
    );
  }

  function writeOptimisticPayload({clientMutationID, query, payload}) {
    writePayload(
      storeData.getRecordStoreForOptimisticMutation(clientMutationID),
      storeData.getRecordWriterForOptimisticMutation(clientMutationID),
      query,
      payload
    );
  }

  beforeEach(() => {
    jest.resetModuleRegistry();

    mutationIDs = {};
    mutationStatuses = {};
    mutationTransactions = {};
    storeData = new RelayStoreData();

    storeData.getClientMutationIDs =
      jest.genMockFunction().mockImplementation(dataID => mutationIDs[dataID]);
    storeData.getMutationQueue().getStatus =
      jest.genMockFunction().mockImplementation(id => mutationStatuses[id]);
    storeData.getMutationQueue().getTransaction =
      jest.genMockFunction().mockImplementation(id => mutationTransactions[id]);

    writeQueryPayload({
      query: getNode(Relay.QL`
        query {
          node(id: "123") {
            ...on Actor {
              __typename
              firstName
              id
            }
          }
        }
      `),
      payload: {
        node: {
          __typename: 'Actor',
          firstName: 'Alice',
          id: '123',
        },
      },
    });
  });

  it('omits `__mutationStatus__` for records without pending mutations', () => {
    const data = read({
      dataID: '123',
      node: getNode(Relay.QL`
        fragment on Actor {
          firstName
        }
      `),
    });
    expect(data).toEqual({
      __dataID__: '123',
      firstName: 'Alice',
    });
  });

  it('sets `__mutationStatus__` for records with pending mutations', () => {
    const mockTransaction = createMockTransaction({
      dataID: '123',
      mutationID: '0',
      mutationStatus: RelayMutationTransactionStatus.UNCOMMITTED,
    });

    const data = read({
      dataID: '123',
      node: getNode(Relay.QL`
        fragment on Actor {
          firstName
        }
      `),
    });
    expect(data).toEqual({
      __dataID__: '123',
      __mutationStatus__: '0:UNCOMMITTED',
      firstName: 'Alice',
    });
  });

  it('changes `__mutationStatus__` to reflect pending mutation status', () => {
    const mockTransactionA = createMockTransaction({
      dataID: '123',
      mutationID: '0',
      mutationStatus: RelayMutationTransactionStatus.UNCOMMITTED,
    });
    const mockTransactionB = createMockTransaction({
      dataID: '123',
      mutationID: '1',
      mutationStatus: RelayMutationTransactionStatus.COMMIT_QUEUED,
    });

    const dataA = read({
      dataID: '123',
      node: getNode(Relay.QL`
        fragment on Actor {
          firstName
        }
      `),
    });
    expect(dataA).toEqual({
      __dataID__: '123',
      __mutationStatus__: '0:UNCOMMITTED,1:COMMIT_QUEUED',
      firstName: 'Alice',
    });

    mockTransactionA.setStatus(
      RelayMutationTransactionStatus.COMMIT_FAILED
    );
    mockTransactionB.setStatus(
      RelayMutationTransactionStatus.COLLISION_COMMIT_FAILED
    );

    const dataB = read({
      dataID: '123',
      node: getNode(Relay.QL`
        fragment on Actor {
          firstName
        }
      `),
    });
    expect(dataB).toEqual({
      __dataID__: '123',
      __mutationStatus__: '0:COMMIT_FAILED,1:COLLISION_COMMIT_FAILED',
      firstName: 'Alice',
    });
  });
});

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
  .unmock('GraphQLRange')
  .unmock('GraphQLSegment');

const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayQueryPath = require('RelayQueryPath');
const RelayStoreData = require('RelayStoreData');
const RelayGarbageCollector = require('RelayGarbageCollector');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayStoreData', () => {
  let Relay;
  let RelayQueryTracker;

  const {getNode, getVerbatimNode} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModules();

    // @side-effect related to garbage collection
    Relay = require('Relay');

    RelayQueryTracker = require('RelayQueryTracker');

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  describe('handleQueryPayload()', () => {
    it('writes responses to `records`', () => {
      const storeData = new RelayStoreData();

      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            id
            doesViewerLike
            topLevelComments {
              count
            }
          }
        }
      `);
      const response = {
        node: {
          id: '123',
          doesViewerLike: false,
          topLevelComments: {
            count: 1,
          },
          __typename: 'Story',
        },
      };
      storeData.handleQueryPayload(query, response);

      // results are written to `records`
      const recordStore = storeData.getRecordStore();
      expect(recordStore.getRecordState('123')).toBe('EXISTENT');
      expect(recordStore.getField('123', 'doesViewerLike')).toBe(false);
      const commentsID =
        recordStore.getLinkedRecordID('123', 'topLevelComments');
      expect(recordStore.getField(commentsID, 'count')).toBe(1);

      // `queuedRecords` is unchanged
      expect(storeData.getQueuedData()).toEqual({});
    });

    it('broadcasts changes for created and updated records', () => {
      const storeData = new RelayStoreData();

      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            id
            doesViewerLike
            topLevelComments {
              count
            }
          }
        }
      `);
      const response = {
        node: {
          id: '123',
          doesViewerLike: false,
          topLevelComments: {
            count: 1,
          },
          __typename: 'Story',
        },
      };
      storeData.handleQueryPayload(query, response);
      const commentsID =
        storeData.getRecordStore().getLinkedRecordID('123', 'topLevelComments');

      const changeEmitter = storeData.getChangeEmitter();
      // broadcasts for created ids
      expect(changeEmitter.broadcastChangeForID).toBeCalledWith('123');
      expect(changeEmitter.broadcastChangeForID).toBeCalledWith(commentsID);

      const updatedResponse = {
        node: {
          id: '123',
          doesViewerLike: true, // false -> true
          topLevelComments: {
            count: 2, // 1 -> 2
          },
          __typename: 'Story',
        },
      };
      changeEmitter.broadcastChangeForID.mockClear();
      storeData.handleQueryPayload(query, updatedResponse);

      // broadcasts for updated ids
      expect(changeEmitter.broadcastChangeForID).toBeCalledWith('123');
      expect(changeEmitter.broadcastChangeForID).toBeCalledWith(commentsID);
    });

    it('uses cached IDs for root fields without IDs', () => {
      const storeData = new RelayStoreData();

      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            id
            doesViewerLike
            topLevelComments {
              count
            }
          }
        }
      `);
      const response = {
        node: {
          id: '123',
          doesViewerLike: false,
          topLevelComments: {
            count: 1,
          },
          __typename: 'Story',
        },
      };
      storeData.handleQueryPayload(query, response);

      // results are written to `records`
      const recordStore = storeData.getRecordStore();
      expect(recordStore.getRecordState('123')).toBe('EXISTENT');
      expect(recordStore.getField('123', 'doesViewerLike')).toBe(false);
      const commentsID =
        recordStore.getLinkedRecordID('123', 'topLevelComments');
      expect(recordStore.getField(commentsID, 'count')).toBe(1);

      // `queuedRecords` is unchanged
      expect(storeData.getQueuedData()).toEqual({});
    });
  });

  describe('handleFragmentPayload()', () => {
    let fragment, rootPath, storeData;
    beforeEach(() => {
      storeData = new RelayStoreData();

      fragment = getNode(Relay.QL`
        fragment on Node {
          id
          doesViewerLike
          topLevelComments {
            count
          }
        }
      `);
      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            id
          }
        }
      `);
      rootPath = RelayQueryPath.create(query);
      const response = {
        id: '123',
        doesViewerLike: false,
        topLevelComments: {
          count: 1,
        },
        __typename: 'Story',
      };
      storeData.handleFragmentPayload(
        '123',
        fragment,
        rootPath,
        response
      );
    });

    it('writes responses to `records`', () => {
      // results are written to `records`
      const recordStore = storeData.getRecordStore();
      expect(recordStore.getRecordState('123')).toBe('EXISTENT');
      expect(recordStore.getField('123', 'doesViewerLike')).toBe(false);
      const commentsID =
        recordStore.getLinkedRecordID('123', 'topLevelComments');
      expect(recordStore.getField(commentsID, 'count')).toBe(1);

      // `queuedRecords` is unchanged
      expect(storeData.getQueuedData()).toEqual({});
    });

    it('broadcasts changes for created and updated records', () => {
      const commentsID =
        storeData.getRecordStore().getLinkedRecordID('123', 'topLevelComments');

      const changeEmitter = storeData.getChangeEmitter();
      // broadcasts for created ids
      expect(changeEmitter.broadcastChangeForID).toBeCalledWith('123');
      expect(changeEmitter.broadcastChangeForID).toBeCalledWith(commentsID);

      const updatedResponse = {
        id: '123',
        doesViewerLike: true, // false -> true
        topLevelComments: {
          count: 2, // 1 -> 2
        },
        __typename: 'Story',
      };
      changeEmitter.broadcastChangeForID.mockClear();
      storeData.handleFragmentPayload(
        '123',
        fragment,
        rootPath,
        updatedResponse
      );

      // broadcasts for updated ids
      expect(changeEmitter.broadcastChangeForID).toBeCalledWith('123');
      expect(changeEmitter.broadcastChangeForID).toBeCalledWith(commentsID);
    });
  });

  describe('handleUpdatePayload()', () => {
    it('writes server payloads to `records`', () => {
      const storeData = new RelayStoreData();
      // create the root node
      storeData.getRecordWriter().putRecord('123');

      const mutationQuery = getNode(Relay.QL`
        mutation {
          feedbackLike(input:$input) {
            clientMutationId
            feedback {
              id
              doesViewerLike
              topLevelComments {
                count
              }
            }
          }
        }
      `);
      const payload = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: 'abc',
        feedback: {
          id: '123',
          doesViewerLike: false,
          topLevelComments: {
            count: 1,
          },
        },
      };
      storeData.handleUpdatePayload(mutationQuery, payload, {
        configs: [],
        isOptimisticUpdate: false,
      });

      // results are written to `records`
      const recordStore = storeData.getRecordStore();
      expect(recordStore.getRecordState('123')).toBe('EXISTENT');
      expect(recordStore.getField('123', 'doesViewerLike')).toBe(false);
      const commentsID =
        recordStore.getLinkedRecordID('123', 'topLevelComments');
      expect(recordStore.getField(commentsID, 'count')).toBe(1);

      // `queuedRecords` is unchanged
      expect(storeData.getQueuedData()).toEqual({});
    });

    it('writes optimistic payloads to `queuedRecords`', () => {
      const storeData = new RelayStoreData();
      // create the root node
      storeData.getRecordWriter().putRecord('123');

      const mutationQuery = getNode(Relay.QL`
        mutation {
          feedbackLike(input:$input) {
            clientMutationId
            feedback {
              id
              doesViewerLike
              topLevelComments {
                count
              }
            }
          }
        }
      `);
      const payload = {
        [RelayConnectionInterface.CLIENT_MUTATION_ID]: 'abc',
        feedback: {
          id: '123',
          doesViewerLike: false,
          topLevelComments: {
            count: 1,
          },
        },
      };
      storeData.handleUpdatePayload(mutationQuery, payload, {
        configs: [],
        isOptimisticUpdate: true,
        clientMutationID: 'mutationID',
      });

      // results are written to `queuedRecords`
      const queuedStore = storeData.getQueuedStore();
      expect(queuedStore.getRecordState('123')).toBe('EXISTENT');
      expect(queuedStore.getField('123', 'doesViewerLike')).toBe(false);
      const commentsID =
        queuedStore.getLinkedRecordID('123', 'topLevelComments');
      expect(queuedStore.getField(commentsID, 'count')).toBe(1);

      // `records` is unchanged
      expect(storeData.getNodeData()).toEqual({
        '123': {
          __dataID__: '123',
          __typename: undefined,
        },
      });
    });

    it(
      'writes optimistic payloads to `queuedRecords` even if values are ' +
      'identical to those in `records`',
      () => {
        // Example case: With a story unliked, quickly like and unlike it. The
        // second unlike will have the same value as the store
        // (`doesViewerLike === false`), but this must be recorded as an
        // optimistic value so that the first server payload (with the story
        // liked) is ignored.
        const storeData = new RelayStoreData();

        // write starting values for a query
        const query = getNode(Relay.QL`
          query {
            node(id:"123") {
              id
              doesViewerLike
              topLevelComments {
                count
              }
            }
          }
        `);
        let response = {
          node: {
            id: '123',
            doesViewerLike: false,
            topLevelComments: {
              count: 1,
            },
            __typename: 'Story',
          },
        };
        storeData.handleQueryPayload(query, response);

        // write an optimistic update with the same values as the store
        const mutationQuery = getNode(Relay.QL`
          mutation {
            feedbackLike(input:$input) {
              clientMutationId
              feedback {
                id
                doesViewerLike
                topLevelComments {
                  count
                }
              }
            }
          }
        `);
        const payload = {
          [RelayConnectionInterface.CLIENT_MUTATION_ID]: 'abc',
          feedback: {
            id: '123',
            doesViewerLike: false,
            topLevelComments: {
              count: 1,
            },
          },
        };
        storeData.handleUpdatePayload(mutationQuery, payload, {
          configs: [],
          isOptimisticUpdate: true,
          clientMutationID: 'mutationID',
        });

        // simulate a server response with different data
        response = {
          node: {
            __typename: 'Feedback',
            id: '123',
            doesViewerLike: true, // inverted
            topLevelComments: null, // delete
          },
        };
        storeData.handleQueryPayload(query, response);

        // verify that the optimistic update takes precedence over the
        // server update
        const recordStore = storeData.getQueuedStore();
        expect(recordStore.getField('123', 'doesViewerLike')).toBe(false);
        const commentsID =
          recordStore.getLinkedRecordID('123', 'topLevelComments');
        expect(commentsID).toBeTruthy();
        expect(recordStore.getField(commentsID, 'count')).toBe(1);
      }
    );
  });

  describe('buildFragmentQueryForDataID()', () => {
    it('builds root queries for refetchable IDs', () => {
      const data = new RelayStoreData();
      const fragment = getNode(Relay.QL`
        fragment on User {
          id
          name
        }
      `);
      const query = data.buildFragmentQueryForDataID(
        fragment,
        '123'
      );
      expect(query).toEqualQueryRoot(getNode(Relay.QL`
        query {
          node(id:"123") {
            id
            __typename
            ... on User {
              id
              name
            }
          }
        }
      `));
      expect(query.getName()).toBe(fragment.getDebugName());
      expect(query.isAbstract()).toBe(true);
    });

    it('builds root queries using the path for non-refetchable IDs', () => {
      const storeData = new RelayStoreData();
      const addressFragment = Relay.QL`fragment on User{id,address{city}}`;
      const node = getNode(Relay.QL`
        query {
          node(id: "123") {
            id
            ${addressFragment}
          }
        }
      `);
      const payload = {
        node: {
          id: '123',
          __typename: 'User',
          address: {
            city: 'Menlo Park',
          },
        },
      };
      storeData.handleQueryPayload(node, payload);

      const fragment = getNode(Relay.QL`
        fragment on StreetAddress {
          city
        }
      `);
      const query = storeData.buildFragmentQueryForDataID(fragment, 'client:1');
      expect(query).toEqualQueryRoot(getVerbatimNode(Relay.QL`
        query RelayStoreData($id_0: ID!) {
          node(id: $id_0) {
            ... on User {
              id
              __typename
              address {
                ... on StreetAddress {
                  city
                }
              }
            }
          }
        }
      `, {id_0: '123'}));
      expect(query.getName()).toBe(node.getName());
      expect(query.isAbstract()).toBe(true);
    });
  });

  describe('garbage collection', () => {
    it('initializes the garbage collector if no data has been added', () => {
      const data = new RelayStoreData();
      expect(data.getGarbageCollector()).toBe(undefined);
      expect(() => data.initializeGarbageCollector()).not.toThrow();
      expect(
        data.getGarbageCollector() instanceof RelayGarbageCollector
      ).toBe(true);
    });

    it('warns if initialized after data has been added', () => {
      jest.mock('warning');

      const response = {node: {id: '123', __typename: 'User'}};
      const data = new RelayStoreData();
      const query = getNode(Relay.QL`query{node(id:"123") {id}}`);
      data.handleQueryPayload(query, response);

      const warningMsg =
        'RelayStoreData: Garbage collection can only be initialized when ' +
        'no data is present.';
      expect([warningMsg]).toBeWarnedNTimes(0);
      data.initializeGarbageCollector();
      expect([warningMsg]).toBeWarnedNTimes(1);
    });

    it(
      'registers created dataIDs in the garbage collector if it has been ' +
      'initialized',
      () => {
        RelayGarbageCollector.prototype.register = jest.fn();
        const response = {node: {id: '123'}};
        const data = new RelayStoreData();
        data.initializeGarbageCollector();
        const query = getNode(Relay.QL`query{node(id:"123") {id}}`);
        const garbageCollector = data.getGarbageCollector();

        expect(garbageCollector.register).not.toBeCalled();
        data.handleQueryPayload(query, response);
        expect(garbageCollector.register).toBeCalled();
        expect(garbageCollector.register.mock.calls[0][0]).toBe('123');
      }
    );
  });

  describe('injectQueryTracker()', () => {
    let storeData;

    beforeEach(() => {
      storeData = new RelayStoreData();
    });

    it('starts off configured with a default tracker', () => {
      const tracker = storeData.getQueryTracker();
      expect(tracker instanceof RelayQueryTracker).toBe(true);
    });

    it('clears the pre-set tracker', () => {
      storeData.injectQueryTracker(null);
      expect(storeData.getQueryTracker()).toBe(null);
    });

    it('can overwrite the pre-set tracker', () => {
      const tracker = new RelayQueryTracker();
      storeData.injectQueryTracker(tracker);
      expect(storeData.getQueryTracker()).toBe(tracker);
    });
  });

  it('should toJSON', () => {
    const storeData = new RelayStoreData();
    const query = getNode(Relay.QL`
      query {
        node(id:"123") {
          id
          ... on User {
            friends(first:"2") {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
    `);

    const response = {
      node: {
        id: '123',
        _friends48QovS: {
          edges: [
            {
              node: {
                id: '456',
              },
            },
            {
              node: {
                id: '789',
              },
            },
          ],
        },
        __typename: 'User',
      },
    };
    storeData.handleQueryPayload(query, response);
    const stringifiedStoreData = JSON.stringify(storeData);
    const graphQLRangeData = storeData.getNodeData()['client:1']['__range__'];

    const expectedStoreData = {
      'cachedRecords': {},
      'cachedRootCallMap': {},
      'queuedRecords': {},
      'records': {
        '123': {
          '__dataID__': '123',
          '__typename': 'User',
          'id': '123',
          'friends': {
            '__dataID__': 'client:1',
          },
        },
        '456': {
          '__dataID__': '456',
          '__typename': 'User',
          'id': '456',
        },
        '789': {
          '__dataID__': '789',
          '__typename': 'User',
          'id': '789',
        },
        'client:1': {
          '__dataID__': 'client:1',
          '__typename': null,
          '__filterCalls__': [],
          '__forceIndex__': 0,
          // GraphQLRange implements toJSON/fromJSON
          '__range__': graphQLRangeData,
        },
        'client:client:1:456': {
          '__dataID__': 'client:client:1:456',
          '__typename': null,
          'node': {
            '__dataID__': '456',
          },
          'cursor': null,
        },
        'client:client:1:789': {
          '__dataID__': 'client:client:1:789',
          '__typename': null,
          'node': {
            '__dataID__': '789',
          },
          'cursor': null,
        },
      },
      'rootCallMap': {},
      'nodeRangeMap': {
        '456': {
          'client:1': true,
        },
        '789': {
          'client:1': true,
        },
      },
    };
    expect(stringifiedStoreData).toEqual(JSON.stringify(expectedStoreData));
  });
});

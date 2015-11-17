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
  .dontMock('GraphQLMutatorConstants')
  .dontMock('GraphQLRange')
  .dontMock('GraphQLSegment')
  .dontMock('RelayStoreData');

var RelayConnectionInterface = require('RelayConnectionInterface');
var RelayQueryPath = require('RelayQueryPath');
var RelayStoreData = require('RelayStoreData');

var RelayStoreGarbageCollector = require('RelayStoreGarbageCollector');

describe('RelayStoreData', () => {
  var Relay;

  var {getNode, getVerbatimNode} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModuleRegistry();

    // @side-effect related to garbage collection
    Relay = require('Relay');

    jest.addMatchers(RelayTestUtils.matchers);
  });

  describe('handleQueryPayload', () => {
    it('writes responses to `records`', () => {
      var storeData = new RelayStoreData();

      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            id,
            doesViewerLike,
            topLevelComments {
              count,
            },
          }
        }
      `);
      var response = {
        node: {
          id: '123',
          doesViewerLike: false,
          topLevelComments: {
            count: 1,
          },
        }
      };
      storeData.handleQueryPayload(query, response);

      // results are written to `records`
      var recordStore = storeData.getRecordStore();
      expect(recordStore.getRecordState('123')).toBe('EXISTENT');
      expect(recordStore.getField('123', 'doesViewerLike')).toBe(false);
      var commentsID =
        recordStore.getLinkedRecordID('123', 'topLevelComments');
      expect(recordStore.getField(commentsID, 'count')).toBe(1);

      // `queuedRecords` is unchanged
      expect(storeData.getQueuedData()).toEqual({});
    });
  });

  describe('handleUpdatePayload', () => {
    it('writes server payloads to `records`', () => {
      var storeData = new RelayStoreData();
      // create the root node
      storeData.getRecordStore().putRecord('123');

      var mutationQuery = getNode(Relay.QL`
        mutation {
          feedbackLike(input:$input) {
            clientMutationId,
            feedback {
              id,
              doesViewerLike,
              topLevelComments {
                count,
              }
            },
          }
        }
      `);
      var payload = {
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
      var recordStore = storeData.getRecordStore();
      expect(recordStore.getRecordState('123')).toBe('EXISTENT');
      expect(recordStore.getField('123', 'doesViewerLike')).toBe(false);
      var commentsID =
        recordStore.getLinkedRecordID('123', 'topLevelComments');
      expect(recordStore.getField(commentsID, 'count')).toBe(1);

      // `queuedRecords` is unchanged
      expect(storeData.getQueuedData()).toEqual({});
    });

    it('writes optimistic payloads to `queuedRecords`', () => {
      var storeData = new RelayStoreData();
      // create the root node
      storeData.getRecordStore().putRecord('123');

      var mutationQuery = getNode(Relay.QL`
        mutation {
          feedbackLike(input:$input) {
            clientMutationId,
            feedback {
              id,
              doesViewerLike,
              topLevelComments {
                count,
              }
            },
          }
        }
      `);
      var payload = {
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
      var queuedStore = storeData.getQueuedStore();
      expect(queuedStore.getRecordState('123')).toBe('EXISTENT');
      expect(queuedStore.getField('123', 'doesViewerLike')).toBe(false);
      var commentsID =
        queuedStore.getLinkedRecordID('123', 'topLevelComments');
      expect(queuedStore.getField(commentsID, 'count')).toBe(1);

      // `records` is unchanged
      expect(storeData.getNodeData()).toEqual({
        '123': {__dataID__: '123'},
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
        var storeData = new RelayStoreData();

        // write starting values for a query
        var query = getNode(Relay.QL`
          query {
            node(id:"123") {
              id,
              doesViewerLike,
              topLevelComments {
                count,
              },
            }
          }
        `);
        var response = {
          node: {
            id: '123',
            doesViewerLike: false,
            topLevelComments: {
              count: 1,
            },
          }
        };
        storeData.handleQueryPayload(query, response);

        // write an optimistic update with the same values as the store
        var mutationQuery = getNode(Relay.QL`
          mutation {
            feedbackLike(input:$input) {
              clientMutationId,
              feedback {
                id,
                doesViewerLike,
                topLevelComments {
                  count,
                }
              },
            }
          }
        `);
        var payload = {
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
            id: '123',
            doesViewerLike: true, // inverted
            topLevelComments: null, // delete
          },
        };
        storeData.handleQueryPayload(query, response);

        // verify that the optimistic update takes precedence over the
        // server update
        var recordStore = storeData.getQueuedStore();
        expect(recordStore.getField('123', 'doesViewerLike')).toBe(false);
        var commentsID =
          recordStore.getLinkedRecordID('123', 'topLevelComments');
        expect(commentsID).toBeTruthy();
        expect(recordStore.getField(commentsID, 'count')).toBe(1);
      }
    );
  });

  describe('buildFragmentQueryForDataID', () => {
    it('builds root queries for refetchable IDs', () => {
      var data = new RelayStoreData();
      var fragment = Relay.QL`
        fragment on Node {
          id,
          __typename,
          name,
        }
      `;
      var node = getNode(fragment);
      var query = data.buildFragmentQueryForDataID(
        node,
        '123'
      );
      expect(query).toEqualQueryRoot(getVerbatimNode(Relay.QL`
        query {
          node(id:"123") {
            ${fragment}
          }
        }
      `));
      expect(query.getName()).toBe(node.getDebugName());
    });

    it('builds root queries using the path for non-refetchable IDs', () => {
      var addressFragment = Relay.QL`fragment on User{id,address{city,street}}`;
      var node = getVerbatimNode(Relay.QL`
        query {
          node(id:"123") {
            id,
            ${addressFragment},
          }
        }
      `);
      var storeData = new RelayStoreData();
      var addressID = 'client:1';
      var recordStore = storeData.getRecordStore();
      var path = new RelayQueryPath(node);
      path = path.getPath(getNode(addressFragment).getChildren()[1], addressID);
      recordStore.putRecord(
        addressID,
        'Type',
        path
      );

      var fragment = Relay.QL`
        fragment on StreetAddress {
          city,
        }
      `;
      var query = storeData.buildFragmentQueryForDataID(
        getNode(fragment),
        addressID
      );
      expect(query).toEqualQueryRoot(getVerbatimNode(Relay.QL`
        query {
          node(id:"123") {
            ${Relay.QL`
        fragment on User {
          address {
            ${fragment},
          },
        }
      `},
            ${Relay.QL`fragment on Node{id}`},
          }
        }
      `));
      expect(query.getName()).toBe(path.getName());
    });
  });

  describe('garbage collection', () => {
    it('initializes the garbage collector if no data has been added', () => {
      var data = new RelayStoreData();
      expect(RelayStoreGarbageCollector.mock.instances.length).toBe(0);
      expect(() => data.initializeGarbageCollector()).not.toThrow();
      expect(RelayStoreGarbageCollector.mock.instances.length).toBe(1);
    });

    it('warns if initialized after data has been added', () => {
      // Mock console.error so we can spy on it
      console.error = jest.genMockFunction();
      var response = {node: {id: 0}};
      var data = new RelayStoreData();
      var query = getNode(Relay.QL`query{node(id:"a") {id}}`);
      data.handleQueryPayload(query, response);
      expect(console.error).not.toBeCalled();
      data.initializeGarbageCollector();
      expect(console.error).toBeCalledWith(
        'Warning: ' +
        'RelayStoreData: Garbage collection can only be initialized when ' +
        'no data is present.'
      );
    });

    it(
      'registers created dataIDs in the garbage collector if it has been ' +
      'initialized',
      () => {
        var response = {node: {id: 0}};
        var data = new RelayStoreData();
        data.initializeGarbageCollector();
        var query = getNode(Relay.QL`query{node(id:"a") {id}}`);
        var garbageCollector = data.getGarbageCollector();

        expect(garbageCollector.register).not.toBeCalled();
        data.handleQueryPayload(query, response);
        expect(garbageCollector.register).toBeCalled();
        expect(garbageCollector.register.mock.calls[0][0]).toBe('a');
      }
    );
  });
});

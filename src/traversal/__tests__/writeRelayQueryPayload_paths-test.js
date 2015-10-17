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

jest
  .dontMock('GraphQLRange')
  .dontMock('GraphQLSegment');

var RelayTestUtils = require('RelayTestUtils');
RelayTestUtils.unmockRelay();

var Relay = require('Relay');
var RelayQueryPath = require('RelayQueryPath');
var invariant = require('invariant');

describe('writePayload()', () => {
  var RelayRecordStore;

  var {getNode, writePayload} = RelayTestUtils;

  function getField(node, ...fieldNames) {
    for (var ii = 0; ii < fieldNames.length; ii++) {
      node = node.getFieldByStorageKey(fieldNames[ii]);
      invariant(
        node,
        'getField(): Expected node to have field named `%s`.',
        fieldNames[ii]
      );
    }
    return node;
  }

  beforeEach(() => {
    jest.resetModuleRegistry();

    RelayRecordStore = require('RelayRecordStore');

    jest.addMatchers(RelayTestUtils.matchers);
  });

  describe('paths', () => {
    it('writes path for id-less root records', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          viewer {
            actor {
              id,
            },
          }
        }
      `);
      var payload = {
        viewer: {
          actor: {
            id: '123',
          },
        },
      };
      var results = writePayload(store, query, payload);
      expect(results).toEqual({
        created: {
          'client:viewer': true,
          '123': true,
        },
        updated: {}
      });

      // viewer has a client id and must be refetched by the original root call
      var path = new RelayQueryPath(query);
      expect(store.getRecordState('client:viewer')).toBe('EXISTENT');
      expect(store.getPathToRecord('client:viewer')).toMatchPath(path);

      // actor is refetchable by ID
      expect(store.getPathToRecord('123')).toBe(undefined);
    });

    it('does not write paths to refetchable root records', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            id,
          }
        }
      `);
      var payload = {
        node: {
          id: '123',
        },
      };
      var results = writePayload(store, query, payload);
      expect(results).toEqual({
        created: {
          '123': true,
        },
        updated: {}
      });

      expect(store.getRecordState('123')).toBe('EXISTENT');
      expect(store.getPathToRecord('123')).toBe(undefined);
    });

    it('writes paths to non-refetchable linked records', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          viewer {
            actor {
              address {
                city,
              },
            },
          }
        }
      `);
      var payload = {
        viewer: {
          'actor': {
            id: '123',
            address: {
              city: 'San Francisco',
            },
          },
        },
      };
      writePayload(store, query, payload);

      // linked nodes use a minimal path from the nearest refetchable node
      var addressID = 'client:1';
      var pathQuery = getNode(Relay.QL`
        query {
          node(id:"123") {
            address {
              city,
            },
          }
        }
      `);
      var path = new RelayQueryPath(pathQuery)
        .getPath(getField(pathQuery, 'address'), addressID);
      expect(store.getPathToRecord(addressID)).toMatchPath(path);
    });

    it('writes paths to plural linked fields', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      var phone = {
        isVerified: true,
        phoneNumber: {
          displayNumber: '1-800-555-1212', // directory assistance
          countryCode: '1',
        },
      };
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            allPhones {
              isVerified,
              phoneNumber {
                displayNumber,
                countryCode,
              },
            },
          }
        }
      `);
      var payload = {
        node: {
          id: '123',
          allPhones: [phone],
        },
      };
      writePayload(store, query, payload);

      // plural fields must be refetched through the parent
      // get linked records to verify the client id
      var allPhoneIDs = store.getLinkedRecordIDs('123', 'allPhones');
      expect(allPhoneIDs.length).toBe(1);
      var path = new RelayQueryPath(query)
        .getPath(getField(query, 'allPhones'), allPhoneIDs[0]);
      expect(store.getPathToRecord(allPhoneIDs[0])).toMatchPath(path);

      // plural items must be refetched through the parent plural field
      // get field to verify the client id is correct
      var phoneNoID = store.getLinkedRecordID(allPhoneIDs[0], 'phoneNumber');
      path = new RelayQueryPath(query)
        .getPath(getField(query, 'allPhones'), allPhoneIDs[0])
        .getPath(getField(query, 'allPhones', 'phoneNumber'), phoneNoID);
      expect(store.getPathToRecord(phoneNoID)).toMatchPath(path);
    });

    it('writes paths to connection records', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            friends(first:"1") {
              edges {
                node {
                  id,
                  address {
                    city,
                  },
                },
              },
            },
          }
        }
      `);
      var payload = {
        node: {
          id: '123',
          friends: {
            edges: [
              {
                cursor: 'cursor1',
                node: {
                  id: 'node1',
                  address: {
                    city: 'San Francisco',
                  },
                },
              },
            ],
          },
        },
      };
      writePayload(store, query, payload);

      // connections and edges must be refetched through the parent
      var path = new RelayQueryPath(query)
        .getPath(getField(query, 'friends'), 'client:1');
      expect(store.getPathToRecord('client:1')).toMatchPath(path);
      path = new RelayQueryPath(query)
        .getPath(getField(query, 'friends'), 'client:1')
        .getPath(getField(query, 'friends', 'edges'), 'client:client:1:node1');
      expect(store.getPathToRecord('client:client:1:node1')).toMatchPath(path);

      // connection nodes with an ID are refetchable
      expect(store.getPathToRecord('node1')).toBe(undefined);

      // linked nodes use a minimal path from the nearest refetchable node
      var pathQuery = getNode(Relay.QL`query{node(id:"node1"){address{city}}}`);
      path = new RelayQueryPath(pathQuery)
        .getPath(getField(pathQuery, 'address'), 'client:2');
      expect(store.getField('client:2', 'city')).toBe('San Francisco');
      expect(store.getPathToRecord('client:2')).toMatchPath(path);
    });
  });
});

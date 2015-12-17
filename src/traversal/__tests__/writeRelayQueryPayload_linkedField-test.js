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

require('configureForRelayOSS');

jest
  .dontMock('GraphQLRange')
  .dontMock('GraphQLSegment')
  .mock('warning');

const Relay = require('Relay');
const RelayTestUtils = require('RelayTestUtils');

describe('writeRelayQueryPayload()', () => {
  var RelayRecordStore;

  var {
    getNode,
    getVerbatimNode,
    writePayload,
    writeVerbatimPayload,
  } = RelayTestUtils;

  beforeEach(() => {
    jest.resetModuleRegistry();

    RelayRecordStore = require('RelayRecordStore');

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  describe('linked fields', () => {
    it('are created and set to null when the response is null', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          viewer {
            actor {
              id
            }
          }
        }
      `);
      var payload = {
        viewer: {
          actor: null,
        },
      };
      var results = writePayload(store, query, payload);
      expect(results).toEqual({
        created: {
          'client:1': true,
        },
        updated: {},
      });
      expect(store.getRecordState('client:1')).toBe('EXISTENT');
      expect(store.getLinkedRecordID('client:1', 'actor')).toBe(null);
    });

    it('are deleted when the response is null', () => {
      var records = {
        'client:1': {
          __dataID__: 'client:1',
          actor: {
            __dataID__: 'client:2',
          },
        },
        'client:2': {
          __dataID__: 'client:2',
        },
      };
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          viewer {
            actor {
              id
            }
          }
        }
      `);
      var payload = {
        viewer: {
          actor: null,
        },
      };
      var results = writePayload(store, query, payload);
      expect(results).toEqual({
        created: {
        },
        updated: {
          'client:1': true,
        },
      });
      expect(store.getRecordState('client:1')).toBe('EXISTENT');
      expect(store.getLinkedRecordID('client:1', 'actor')).toBe(null);
    });

    it('are not created when the response is undefined', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          viewer {
            actor {
              id
            }
          }
        }
      `);
      var payload = {
        viewer: {
          actor: undefined,
        },
      };
      writePayload(store, query, payload);
      expect(store.getRecordState('client:1')).toBe('EXISTENT');
      expect(store.getLinkedRecordID('client:1', 'actor')).toBe(undefined);
    });

    it('are not deleted when the response is undefined', () => {
      var records = {
        'client:1': {
          __dataID__: 'client:1',
          actor: {
            __dataID__: '123',
          },
        },
        '123': {
          __dataID__: '123',
          id: '123',
        },
      };
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          viewer {
            actor {
              id
            }
          }
        }
      `);
      var payload = {
        viewer: {
          actor: undefined,
        },
      };
      writePayload(store, query, payload);
      expect(store.getRecordState('client:1')).toBe('EXISTENT');
      expect(store.getLinkedRecordID('client:1', 'actor')).toBe('123');
      expect(store.getRecordState('123')).toBe('EXISTENT');
      expect(store.getField('123', 'id')).toBe('123');
    });

    it('are created with the specified id', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      var actorID = '123';
      var query = getNode(Relay.QL`
        query {
          viewer {
            actor {
              id
            }
          }
        }
      `);
      var payload = {
        viewer: {
          actor: {
            id: actorID,
          },
        },
      };
      var results = writePayload(store, query, payload);
      expect(results).toEqual({
        created: {
          'client:1': true,
          '123': true,
        },
        updated: {},
      });
      expect(store.getLinkedRecordID('client:1', 'actor')).toBe(actorID);
      expect(store.getRecordState(actorID)).toBe('EXISTENT');
    });

    it('updates the parent if the id changes', () => {
      var actorID = '123';
      var records = {
        'client:1': {
          __dataID__: 'client:1',
          actor: {
            __dataID__: actorID,
          },
        },
        '123': {
          __dataID__: actorID,
        },
      };
      var store = new RelayRecordStore({records});
      var nextActorID = '456';
      var query = getNode(Relay.QL`
        query {
          viewer {
            actor {
              id
            }
          }
        }
      `);
      var payload = {
        viewer: {
          actor: {
            id: nextActorID,
          },
        },
      };
      var results = writePayload(store, query, payload);
      expect(results).toEqual({
        created: {
          '456': true,
        },
        updated: {
          'client:1': true,
        },
      });
      expect(store.getLinkedRecordID('client:1', 'actor')).toBe(nextActorID);
      expect(store.getRecordState(nextActorID)).toBe('EXISTENT');
      expect(store.getRecordState(actorID)).toBe('EXISTENT'); // unlinked only
    });

    it('are created with a generated id if none is present', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      var addressID = 'client:1';
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            address {
              city
            }
          }
        }
      `);
      var payload = {
        node: {
          id: '123',
          // address has no id and receives a generated client id
          address: {
            city: 'San Francisco',
          },
        },
      };
      var results = writePayload(store, query, payload);
      expect(results).toEqual({
        created: {
          '123': true,
          'client:1': true,
        },
        updated: {},
      });
      expect(store.getLinkedRecordID('123', 'address')).toBe(addressID);
      expect(store.getRecordState(addressID)).toBe('EXISTENT');
      expect(store.getField(addressID, 'city')).toBe('San Francisco');
    });

    it('reuses existing generated ids', () => {
      var addressID = 'client:1';
      var records = {
        '123': {
          __dataID__: '123',
          id: '123',
          address: {
            __dataID__: addressID,
          },
        },
        'client:1': {
          __dataID__: addressID,
          city: 'San Francisco',
        },
      };
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            address {
              city
            }
          }
        }
      `);
      var payload = {
        node: {
          id: '123',
          // the address record has no id but should reuse the previously
          // generated client id
          address: {
            city: 'San Francisco',
          },
        },
      };
      var results = writePayload(store, query, payload);
      expect(results).toEqual({
        created: {},
        updated: {},
      });
      expect(store.getLinkedRecordID('123', 'address')).toBe(addressID);
      expect(store.getField(addressID, 'city')).toBe('San Francisco');
    });

    it('records an update on the parent if a linked field is created', () => {
      var records = {
        'user:1': {
          __dataID__: 'user:1',
          'hometown': {
            __dataID__: 'hometown:1',
          },
          id: 'user:1',
        },
        'hometown:1': null,
      };
      var store = new RelayRecordStore({records});
      store.removeRecord('hometown:1');
      var query = getNode(Relay.QL`
        query {
          node(id:"user:1") {
            hometown {
              name
            }
          }
        }
      `);
      var payload = {
        node: {
          id: 'user:1',
          'hometown': {
            id: 'hometown:1',
            name: 'World',
          },
        },
      };
      var results = writePayload(store, query, payload);
      expect(results).toEqual({
        created: {
          'hometown:1': true,
        },
        updated: {
          'user:1': true,
        },
      });
    });

    it('records the concrete type if `__typename` is present', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          viewer {
            actor {
              id,
              __typename
            }
          }
        }
      `);
      var payload = {
        viewer: {
          actor: {
            id: '123',
            __typename: 'User',
          },
        },
      };
      writePayload(store, query, payload);
      expect(store.getType('123')).toBe('User');
    });

    it('warns if the typename cannot be determined for a node', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      // No `id` or `__typename` fields or responses
      var query = getVerbatimNode(Relay.QL`
        query {
          viewer {
            actor {
              name
            }
          }
        }
      `);
      var payload = {
        viewer: {
          actor: {
            id: '123',
            name: 'Joe',
          },
        },
      };
      writeVerbatimPayload(store, query, payload);
      expect(store.getType('123')).toBe(null);
      expect([
        'RelayQueryWriter: Could not find a type name for record `%s`.',
        '123',
      ]).toBeWarnedNTimes(1);
    });

    it('stores types for client records', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          me {
            id
            __typename
            ... on User {
              address {
                city
              }
            }
          }
        }
      `);
      var payload = {
        me: {
          id: '123',
          __typename: 'User',
          address: {
            city: 'Menlo Park',
          },
        },
      };
      writePayload(store, query, payload);
      var addressID = store.getLinkedRecordID('123', 'address');
      expect(store.getType('123')).toBe('User');
      expect(store.getType(addressID)).toBe('StreetAddress');
    });
  });
});

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
  .dontMock('GraphQLRange')
  .dontMock('GraphQLSegment');

var VIEWER_ID = 'client:viewer';

describe('writeRelayQueryPayload()', () => {
  var Relay;
  var RelayRecordStore;

  var {getNode, writePayload} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModuleRegistry();

    Relay = require('Relay');
    RelayRecordStore = require('RelayRecordStore');

    jest.addMatchers(RelayTestUtils.matchers);
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
          'client:viewer': true,
        },
        updated: {},
      });
      expect(store.getRecordStatus(VIEWER_ID)).toBe('EXISTENT');
      expect(store.getLinkedRecordID(VIEWER_ID, 'actor')).toBe(null);
    });

    it('are deleted when the response is null', () => {
      var records = {
        'client:viewer': {
          __dataID__: VIEWER_ID,
          actor: {
            __dataID__: 'client:1',
          },
        },
        'client:1': {
          __dataID__: 'client:1',
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
          'client:viewer': true,
        },
      });
      expect(store.getRecordStatus(VIEWER_ID)).toBe('EXISTENT');
      expect(store.getLinkedRecordID(VIEWER_ID, 'actor')).toBe(null);
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
      expect(store.getRecordStatus(VIEWER_ID)).toBe('EXISTENT');
      expect(store.getLinkedRecordID(VIEWER_ID, 'actor')).toBe(undefined);
    });

    it('are not deleted when the response is undefined', () => {
      var records = {
        'client:viewer': {
          __dataID__: VIEWER_ID,
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
      expect(store.getRecordStatus(VIEWER_ID)).toBe('EXISTENT');
      expect(store.getLinkedRecordID(VIEWER_ID, 'actor')).toBe('123');
      expect(store.getRecordStatus('123')).toBe('EXISTENT');
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
            id: actorID
          },
        },
      };
      var results = writePayload(store, query, payload);
      expect(results).toEqual({
        created: {
          'client:viewer': true,
          '123': true,
        },
        updated: {},
      });
      expect(store.getLinkedRecordID(VIEWER_ID, 'actor')).toBe(actorID);
      expect(store.getRecordStatus(actorID)).toBe('EXISTENT');
    });

    it('updates the parent if the id changes', () => {
      var actorID = '123';
      var records = {
        'client:viewer': {
          __dataID__: 'client:viewer',
          actor: {
            __dataID__: actorID
          }
        },
        '123': {
          __dataID__: actorID
        }
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
            id: nextActorID
          },
        },
      };
      var results = writePayload(store, query, payload);
      expect(results).toEqual({
        created: {
          '456': true,
        },
        updated: {
          'client:viewer': true,
        },
      });
      expect(store.getLinkedRecordID(VIEWER_ID, 'actor')).toBe(nextActorID);
      expect(store.getRecordStatus(nextActorID)).toBe('EXISTENT');
      expect(store.getRecordStatus(actorID)).toBe('EXISTENT'); // unlinked only
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
        '123': {
          id: '123',
          // address has no id and receives a generated client id
          address: {
            city: 'San Francisco'
          }
        }
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
      expect(store.getRecordStatus(addressID)).toBe('EXISTENT');
      expect(store.getField(addressID, 'city')).toBe('San Francisco');
    });

    it('reuses existing generated ids', () => {
      var addressID = 'client:1';
      var records = {
        '123': {
          __dataID__: '123',
          id: '123',
          address: {
            __dataID__: addressID
          }
        },
        'client:1': {
          __dataID__: addressID,
          city: 'San Francisco'
        }
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
        '123': {
          id: '123',
          // the address record has no id but should reuse the previously
          // generated client id
          address: {
            city: 'San Francisco'
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
            __dataID__: 'hometown:1'
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
        'user:1': {
          id: 'user:1',
          'hometown': {
            id: 'hometown:1',
            name: 'World',
          }
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
  });
});

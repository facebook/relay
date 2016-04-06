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
  .dontMock('GraphQLRange')
  .dontMock('GraphQLSegment')
  .mock('warning');

const Relay = require('Relay');
const RelayTestUtils = require('RelayTestUtils');

describe('writeRelayQueryPayload()', () => {
  let RelayRecordStore;
  let RelayRecordWriter;

  const {
    getNode,
    getVerbatimNode,
    writePayload,
    writeVerbatimPayload,
  } = RelayTestUtils;

  beforeEach(() => {
    jest.resetModuleRegistry();

    RelayRecordStore = require('RelayRecordStore');
    RelayRecordWriter = require('RelayRecordWriter');

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  describe('linked fields', () => {
    it('are created and set to null when the response is null', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
        query {
          viewer {
            actor {
              id
            }
          }
        }
      `);
      const payload = {
        viewer: {
          actor: null,
        },
      };
      const results = writePayload(store, writer, query, payload);
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
      const records = {
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
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
        query {
          viewer {
            actor {
              id
            }
          }
        }
      `);
      const payload = {
        viewer: {
          actor: null,
        },
      };
      const results = writePayload(store, writer, query, payload);
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

    it('are created with the specified id', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const actorID = '123';
      const query = getNode(Relay.QL`
        query {
          viewer {
            actor {
              id
            }
          }
        }
      `);
      const payload = {
        viewer: {
          actor: {
            id: actorID,
          },
        },
      };
      const results = writePayload(store, writer, query, payload);
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
      const actorID = '123';
      const records = {
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
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const nextActorID = '456';
      const query = getNode(Relay.QL`
        query {
          viewer {
            actor {
              id
            }
          }
        }
      `);
      const payload = {
        viewer: {
          actor: {
            id: nextActorID,
          },
        },
      };
      const results = writePayload(store, writer, query, payload);
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
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const addressID = 'client:1';
      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            address {
              city
            }
          }
        }
      `);
      const payload = {
        node: {
          id: '123',
          // address has no id and receives a generated client id
          address: {
            city: 'San Francisco',
          },
        },
      };
      const results = writePayload(store, writer, query, payload);
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
      const addressID = 'client:1';
      const records = {
        '123': {
          __dataID__: '123',
          __typename: 'User',
          id: '123',
          address: {
            __dataID__: addressID,
          },
        },
        [addressID]: {
          __dataID__: addressID,
          __typename: 'StreetAddress',
          city: 'San Francisco',
        },
      };
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            address {
              city
            }
          }
        }
      `);
      const payload = {
        node: {
          id: '123',
          // the address record has no id but should reuse the previously
          // generated client id
          address: {
            city: 'San Francisco',
          },
          __typename: 'User',
        },
      };
      const results = writePayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {},
        updated: {},
      });
      expect(store.getLinkedRecordID('123', 'address')).toBe(addressID);
      expect(store.getField(addressID, 'city')).toBe('San Francisco');
    });

    it('records the concrete type if `__typename` is present', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
        query {
          viewer {
            actor {
              id,
              __typename
            }
          }
        }
      `);
      const payload = {
        viewer: {
          actor: {
            id: '123',
            __typename: 'User',
          },
        },
      };
      writePayload(store, writer, query, payload);
      expect(store.getType('123')).toBe('User');
    });

    it('warns if the typename cannot be determined for a node', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      // No `id` or `__typename` fields or responses
      const query = getVerbatimNode(Relay.QL`
        query {
          viewer {
            actor {
              name
            }
          }
        }
      `);
      const payload = {
        viewer: {
          actor: {
            id: '123',
            name: 'Joe',
          },
        },
      };
      writeVerbatimPayload(store, writer, query, payload);
      expect(store.getType('123')).toBe(null);
      expect([
        'RelayQueryWriter: Could not find a type name for record `%s`.',
        '123',
      ]).toBeWarnedNTimes(1);
    });

    it('stores types for client records', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
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
      const payload = {
        me: {
          id: '123',
          __typename: 'User',
          address: {
            city: 'Menlo Park',
          },
        },
      };
      writePayload(store, writer, query, payload);
      const addressID = store.getLinkedRecordID('123', 'address');
      expect(store.getType('123')).toBe('User');
      expect(store.getType(addressID)).toBe('StreetAddress');
    });
  });
});

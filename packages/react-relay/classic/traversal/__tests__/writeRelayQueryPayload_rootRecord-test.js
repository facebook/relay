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
  .unmock('GraphQLSegment')
  .mock('warning');

const Relay = require('Relay');
const RelayTestUtils = require('RelayTestUtils');

const stableStringify = require('stableStringify');

describe('writeRelayQueryPayload()', () => {
  let RelayRecordStore;
  let RelayRecordWriter;

  const {
    getNode,
    getRefNode,
    getVerbatimNode,
    writePayload,
    writeVerbatimPayload,
  } = RelayTestUtils;

  beforeEach(() => {
    jest.resetModules();

    RelayRecordStore = require('RelayRecordStore');
    RelayRecordWriter = require('RelayRecordWriter');

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  describe('root record', () => {

    it('is created for argument-less custom root calls with an id', () => {
      const records = {};
      const rootCallMap = {};
      const store = new RelayRecordStore({records}, {rootCallMap});
      const writer = new RelayRecordWriter(records, rootCallMap, false);
      const query = getNode(Relay.QL`
        query {
          me {
            id
          }
        }
      `);
      const payload = {
        me: {
          id: '123',
        },
      };
      const results = writePayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {
          123: true,
        },
        updated: {},
      });
      expect(store.getRecordState('123')).toBe('EXISTENT');
      expect(store.getField('123', 'id')).toBe('123');
      expect(store.getDataID('me')).toBe('123');
    });

    it('is created for argument-less custom root calls without an id', () => {
      const records = {};
      const rootCallMap = {};
      const store = new RelayRecordStore({records}, {rootCallMap});
      const writer = new RelayRecordWriter(records, rootCallMap, false);
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
            id: '123',
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
      expect(store.getRecordState('client:1')).toBe('EXISTENT');
      expect(store.getLinkedRecordID('client:1', 'actor')).toBe('123');
      expect(store.getDataID('viewer')).toBe('client:1');
    });

    it('uses existing id for custom root calls without an id', () => {
      const cachedRootCallMap = {
        'viewer': {'': 'client:12345'},
      };
      const cachedRecords = {
        'client:12345': {__dataID__: 'client:12345'},
      };
      const rootCallMap = {};
      const records = {};
      const store = new RelayRecordStore({records}, {rootCallMap});
      const writer = new RelayRecordWriter(records, rootCallMap, false);
      const cachedStore = new RelayRecordStore(
        {records, cachedRecords},
        {cachedRootCallMap, rootCallMap}
      );
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
            id: '123',
          },
        },
      };
      const results = writePayload(cachedStore, writer, query, payload);
      expect(results).toEqual({
        created: {
          '123': true,
        },
        updated: {
          'client:12345': true,
        },
      });
      expect(store.getRecordState('client:12345')).toBe('EXISTENT');
      expect(store.getLinkedRecordID('client:12345', 'actor')).toBe('123');
      expect(store.getDataID('viewer')).toBe('client:12345');
    });

    it('is created for custom root calls with an id', () => {
      const records = {};
      const rootCallMap = {};
      const store = new RelayRecordStore({records}, {rootCallMap});
      const writer = new RelayRecordWriter(records, rootCallMap, false);
      const query = getNode(Relay.QL`
        query {
          username(name:"yuzhi") {
            id
          }
        }
      `);
      const payload = {
        username: {
          id: '1055790163',
        },
      };
      const results = writePayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {
          '1055790163': true,
        },
        updated: {},
      });
      expect(store.getRecordState('1055790163')).toBe('EXISTENT');
      expect(store.getField('1055790163', 'id')).toBe('1055790163');
      expect(store.getDataID('username', 'yuzhi')).toBe('1055790163');
    });

    it('is updated for custom root calls with an id', () => {
      const records = {};
      const rootCallMap = {};
      const store = new RelayRecordStore({records}, {rootCallMap});
      const writer = new RelayRecordWriter(records, rootCallMap, false);
      const query = getNode(Relay.QL`
        query {
          username(name:"yuzhi") {
            id
          }
        }
      `);
      const payload = {
        username: {
          id: '1055790163',
        },
      };
      writePayload(store, writer, query, payload);
      const newPayload = {
        username: {
          id: '123',
        },
      };
      const results = writePayload(store, writer, query, newPayload);
      expect(results).toEqual({
        created: {
          '123': true,
        },
        updated: {},
      });
      expect(store.getRecordState('123')).toBe('EXISTENT');
      expect(store.getField('123', 'id')).toBe('123');
      expect(store.getDataID('username', 'yuzhi')).toBe('123');
    });

    it('is created for custom root calls without an id', () => {
      const records = {};
      const rootCallMap = {};
      const store = new RelayRecordStore({records}, {rootCallMap});
      const writer = new RelayRecordWriter(records, rootCallMap, false);
      // note: this test simulates an `id`-less root call
      let query = getNode(Relay.QL`
        query {
          username(name:"yuzhi") {
            name
          }
        }
      `);
      // remove the autogenerated `id` field
      query = query.clone(query.getChildren().slice(0, 1));
      // no `id` value is present, so the root ID is autogenerated
      const payload = {
        username: {
          name: 'Yuzhi Zheng',
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
      expect(store.getField('client:1', 'name')).toBe('Yuzhi Zheng');
      expect(store.getDataID('username', 'yuzhi')).toBe('client:1');
    });

    it('is created for custom root calls with batch call variables', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getRefNode(Relay.QL`
        query {
          nodes(ids:$ref_q0) {
            id
          }
        }
      `, {path: '$.*.id'}); // This path is bogus.
      const payload = {
        nodes: [
          {
            id: '123',
          },
        ],
      };
      const results = writePayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {
          '123': true,
        },
        updated: {},
      });
      expect(store.getRecordState('123')).toBe('EXISTENT');
      expect(store.getField('123', 'id')).toBe('123');
    });

    it('are created for plural identifying root calls', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
        query {
          nodes(ids: ["123","456"]) {
            id
          }
        }
      `);
      const payload = {
        nodes: [
          {
            id: '123',
          },
          {
            id: '456',
          },
        ],
      };
      const results = writeVerbatimPayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {
          '123': true,
          '456': true,
        },
        updated: {},
      });
      expect(store.getRecordState('123')).toBe('EXISTENT');
      expect(store.getField('123', 'id')).toBe('123');
      expect(store.getRecordState('456')).toBe('EXISTENT');
      expect(store.getField('456', 'id')).toBe('456');
    });

    it('are created for numeric identifying arguments', () => {
      const records = {};
      const rootCallMap = {};
      const store = new RelayRecordStore({records}, {rootCallMap});
      const writer = new RelayRecordWriter(records, rootCallMap, false);
      const query = getNode(Relay.QL`
        query {
          task(number: 5) {
            title
          }
        }
      `);
      expect(query.getIdentifyingArg().value).toBe(5);
      const payload = {
        task: {
          title: 'Relay Next',
        },
      };
      const results = writeVerbatimPayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {
          'client:1': true,
        },
        updated: {},
      });
      expect(store.getRecordState('client:1')).toBe('EXISTENT');
      expect(store.getField('client:1', 'title')).toBe('Relay Next');
      expect(store.getDataID('task', '5')).toBe('client:1');
    });

    it('are created for object identifying arguments', () => {
      const records = {};
      const rootCallMap = {};
      const store = new RelayRecordStore({records}, {rootCallMap});
      const writer = new RelayRecordWriter(records, rootCallMap, false);
      const query = getNode(Relay.QL`
        query {
          checkinSearchQuery(query: {query: "Facebook"}) {
            query
          }
        }
      `);
      const payload = {
        checkinSearchQuery: {
          query: 'Facebook',
        },
      };
      const results = writeVerbatimPayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {
          'client:1': true,
        },
        updated: {},
      });
      expect(store.getRecordState('client:1')).toBe('EXISTENT');
      expect(store.getField('client:1', 'query')).toBe('Facebook');
      const identifyingArgKey = stableStringify({query: 'Facebook'});
      expect(store.getDataID('checkinSearchQuery', identifyingArgKey)).toBe(
        'client:1'
      );
    });

    // TODO: support plural non-identifying root arguments
    // it('are created for array identifying arguments', () => {
    //   var records = {};
    //   var rootCallMap = {};
    //   var store = new RelayRecordStore({records}, {rootCallMap});
    //   var writer = new RelayRecordWriter(records, rootCallMap, false);
    //   const waypoints = [
    //     {lat: '0.0', lon: '0.0'},
    //     {lat: '1.1', lon: '1.1'}
    //   ];
    //   var query = getNode(Relay.QL`
    //     query {
    //       route(waypoints: $waypoints) {
    //         steps {
    //           note
    //         }
    //       }
    //     }
    //   `, {waypoints});
    //   var payload = {
    //     route: {
    //       steps: [
    //         {
    //           note: 'Depart',
    //         },
    //       ],
    //     },
    //   };
    //   var results = writeVerbatimPayload(store, writer, query, payload);
    //   expect(results).toEqual({
    //     created: {
    //       'client:1': true,
    //       'client:2': true,
    //     },
    //     updated: {},
    //   });
    //   expect(store.getRecordState('client:1')).toBe('EXISTENT');
    //   expect(store.getLinkedRecordIDs('client:1', 'steps')).toBe(['client:2']);
    //   expect(store.getField('client:2', 'note')).toBe('Depart');
    //   const identifyingArgKey = stableStringify(waypoints);
    //   expect(store.getDataID('route', identifyingArgKey)).toBe(
    //     'client:1'
    //   );
    // });

    it('requires arguments to `node()` root calls', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
        query {
          node {
            id
          }
        }
      `);
      const payload = {
        node: null,
      };
      expect(() => {
        writePayload(store, writer, query, payload);
      }).toFailInvariant(
        'RelayRecordStore.getDataID(): Argument to `node()` cannot be ' +
        'null or undefined.'
      );
    });

    it('is created and set to null when the response is null', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            id
          }
        }
      `);
      const payload = {
        node: null,
      };
      const results = writePayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {},
        updated: {},
      });
      expect(store.getRecordState('123')).toBe('NONEXISTENT');
    });

    it('is deleted when a response returns null', () => {
      const records = {
        '123': {
          __dataID__: '123',
          id: '123',
        },
      };
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            id
          }
        }
      `);
      const payload = {
        node: null,
      };
      const results = writePayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {},
        updated: {
          '123': true,
        },
      });
      expect(store.getRecordState('123')).toBe('NONEXISTENT');
    });

    it('requires an array if root args is an array', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
        query {
          nodes(ids:["123", "456"]) {
            id
          }
        }
      `);
      const payload = {
        me: {
          __dataID__: '123',
          id: '123',
        },
      };
      expect(() => {
        writePayload(store, writer, query, payload);
      }).toFailInvariant(
        'RelayNodeInterface: Expected payload for root field `nodes` to ' +
        'be an array with 2 results, instead received a single non-array ' +
        'result.'
      );
    });

    it('requires a single result if root args is a single value', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
        query {
          me {
            id
          }
        }
      `);
      const payload = {
        me: [
          {
            __dataID__: '123',
            id: '123',
          },
          {
            __dataID__: '456',
            id: '456',
          },
        ],
      };
      expect(() => {
        writePayload(store, writer, query, payload);
      }).toFailInvariant(
        'RelayNodeInterface: Expected payload for root field `me` to be a ' +
        'single non-array result, instead received an array with 2 results.'
      );
    });

    it('handles plural results for ref queries', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getRefNode(Relay.QL`
        query {
          nodes(ids:$ref_q0) {
            id
            name
          }
        }
      `, {path: '$.*.id'}); // This path is bogus.
      const payload = {
        nodes: [
          {
            __dataID__: '123',
            id: '123',
            name: 'Yuzhi',
          },
          {
            __dataID__: '456',
            id: '456',
            name: 'Jing',
          },
        ],
      };
      writePayload(store, writer, query, payload);
      expect(store.getRecordState('123')).toBe('EXISTENT');
      expect(store.getField('123', 'name')).toBe('Yuzhi');
      expect(store.getRecordState('456')).toBe('EXISTENT');
      expect(store.getField('456', 'name')).toBe('Jing');
    });

    it('is created when the response is missing', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            id
          }
        }
      `);
      const payload = {};
      writePayload(store, writer, query, payload);
      expect(store.getRecordState('123')).toBe('NONEXISTENT');
    });

    it('is deleted when the response is ommited', () => {
      const records = {
        '123': {
          __dataID__: '123',
          id: '123',
        },
      };
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            actor {
              id
            }
          }
        }
      `);
      const payload = {};
      writePayload(store, writer, query, payload);
      expect(store.getRecordState('123')).toBe('NONEXISTENT');
    });

    it('is created when a new record returns a value', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            id
          }
        }
      `);
      const payload = {
        node: {
          id: '123',
        },
      };
      const results = writePayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {
          '123': true,
        },
        updated: {},
      });
      expect(store.getRecordState('123')).toBe('EXISTENT');
    });

    it('is not updated if the record exists and has no changes', () => {
      const records = {
        '123': {
          __dataID__: '123',
          id: '123',
          __typename: null,
        },
      };
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            id
          }
        }
      `);
      const payload = {
        node: {
          id: '123',
        },
      };
      const results = writePayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {},
        updated: {},
      });
      expect(store.getRecordState('123')).toBe('EXISTENT');
    });

    it('is updated if the record has changes', () => {
      const records = {
        '123': {
          __dataID__: '123',
          id: '123',
          name: 'Joe',
        },
      };
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            id
            name
          }
        }
      `);
      const payload = {
        node: {
          id: '123',
          name: 'Joseph',
        },
      };
      const results = writePayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {},
        updated: {
          '123': true,
        },
      });
      expect(store.getRecordState('123')).toBe('EXISTENT');
      expect(store.getField('123', 'name')).toBe('Joseph');
    });

    it('is not affected by non-requested fields', () => {
      const records = {
        '123': {
          __dataID__: '123',
          id: '123',
          __typename: null,
        },
      };
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            id
          }
        }
      `);
      const payload = {
        node: {
          id: '123',
          name: 'Joseph',
        },
      };
      const results = writePayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {},
        updated: {},
      });
      expect(store.getRecordState('123')).toBe('EXISTENT');
      expect(store.getField('123', 'name')).toBe(undefined);
    });

    it('records the concrete type if `__typename` is present', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
        query {
          node(id: "123") {
            id
            __typename
          }
        }
      `);
      const payload = {
        node: {
          id: '123',
          __typename: 'User',
          foo: 'bar',
        },
      };
      writePayload(store, writer, query, payload);
      expect(store.getType('123')).toBe('User');
    });

    it('warns if the typename cannot be determined for a node', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      // No `id` or `__typename` fields
      const query = getVerbatimNode(Relay.QL`
        query {
          node(id: "123") {
            name
          }
        }
      `);
      // But the payload contains an `id` so the writer will attempt to store a
      // `__typename`.
      const payload = {
        node: {
          id: '123',
          name: 'Joe',
        },
      };
      writeVerbatimPayload(store, writer, query, payload);
      expect(store.getType('123')).toBe(null);
      expect([
        'RelayQueryWriter: Could not find a type name for record `%s`.',
        '123',
      ]).toBeWarnedNTimes(1);
    });

    it('does not warn if the typename is already known', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);

      // Add the record to the store with a concrete type
      writer.putRecord('123', 'User', null);
      // No `id` or `__typename` fields
      const query = getVerbatimNode(Relay.QL`
        query {
          node(id: "123") {
            name
          }
        }
      `);
      // No typename in the payload; this will warn for new records, but
      // shouldn't for existing ones with a known type.
      const payload = {
        node: {
          id: '123',
          name: 'Joe',
        },
      };
      writeVerbatimPayload(store, writer, query, payload);
      expect(store.getType('123')).toBe('User');
      expect([
        'RelayQueryWriter: Could not find a type name for record `%s`.',
        '123',
      ]).toBeWarnedNTimes(0);
    });

    it('stores types for client records', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
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
            __typename: 'User',
          },
        },
      };
      writePayload(store, writer, query, payload);
      expect(store.getType('client:1')).toBe('Viewer');
    });
  });
});

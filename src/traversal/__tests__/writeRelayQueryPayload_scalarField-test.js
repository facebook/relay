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
  .dontMock('GraphQLSegment');

const Relay = require('Relay');
const RelayTestUtils = require('RelayTestUtils');

describe('writeRelayQueryPayload()', () => {
  var RelayRecordStore;

  var {getNode, writePayload} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModuleRegistry();

    RelayRecordStore = require('RelayRecordStore');

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  describe('scalar fields', () => {
    it('created with null when the response is null', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            name
          }
        }
      `);
      var payload = {
        node: {
          id: '123',
          name: null,
          __typename: 'User',
        },
      };
      var results = writePayload(store, query, payload);
      expect(results).toEqual({
        created: {
          '123': true,
        },
        updated: {},
      });
      expect(store.getField('123', 'name')).toBe(null);
    });

    it('adds null fields to an existing record when response is null', () => {
      var records = {
        '123': {
          __dataID__: '123',
          id: '123',
        },
      };
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            name
          }
        }
      `);
      var payload = {
        node: {
          id: '123',
          name: null,
        },
      };
      var results = writePayload(store, query, payload);
      expect(results).toEqual({
        created: {},
        updated: {
          '123': true,
        },
      });
      expect(store.getField('123', 'name')).toBe(null);
    });

    it('updates fields when the response is null', () => {
      var records = {
        '123': {
          __dataID__: '123',
          id: '123',
          name: 'Joe',
        },
      };
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            name
          }
        }
      `);
      var payload = {
        node: {
          id: '123',
          name: null,
        },
      };
      var results = writePayload(store, query, payload);
      expect(results).toEqual({
        created: {},
        updated: {
          '123': true,
        },
      });
      expect(store.getField('123', 'name')).toBe(null);
    });

    it('does not add undefined fields to a new record', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            name
          }
        }
      `);
      var payload = {
        node: {
          id: '123',
          name: undefined,
          __typename: 'User',
        },
      };
      writePayload(store, query, payload);
      expect(store.getField('123', 'id')).toBe('123');
      expect(store.getField('123', 'name')).toBe(undefined);
    });

    it('does not add undefined fields to an existing record', () => {
      var records = {
        '123': {
          __dataID__: '123',
          id: '123',
        },
      };
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            name
          }
        }
      `);
      var payload = {
        node: {
          id: '123',
          name: undefined,
        },
      };
      writePayload(store, query, payload);
      expect(store.getField('123', 'id')).toBe('123');
      expect(store.getField('123', 'name')).toBe(undefined);
    });

    it('does not update fields when the response is undefined', () => {
      var records = {
        '123': {
          __dataID__: '123',
          id: '123',
          name: 'Joe',
        },
      };
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            name
          }
        }
      `);
      var payload = {
        node: {
          id: '123',
          name: undefined,
        },
      };
      writePayload(store, query, payload);
      expect(store.getField('123', 'name')).toBe('Joe');
    });

    it('updates fields wth new scalar values', () => {
      var records = {
        '123': {
          __dataID__: '123',
          id: '123',
          name: 'Joe',
        },
      };
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            name
          }
        }
      `);
      var payload = {
        node: {
          id: '123',
          name: 'Joseph',
        },
      };
      var results = writePayload(store, query, payload);
      expect(results).toEqual({
        created: {},
        updated: {
          '123': true,
        },
      });
      expect(store.getField('123', 'name')).toBe('Joseph');
    });
  });
});

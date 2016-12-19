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

const Relay = require('Relay');
const RelayTestUtils = require('RelayTestUtils');

describe('writeRelayQueryPayload()', () => {
  let RelayRecordStore;
  let RelayRecordWriter;

  const {getNode, writePayload} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModules();

    RelayRecordStore = require('RelayRecordStore');
    RelayRecordWriter = require('RelayRecordWriter');

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  describe('scalar fields', () => {
    it('created with null when the response is null', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            name
          }
        }
      `);
      const payload = {
        node: {
          __typename: 'User',
          id: '123',
          name: null,
        },
      };
      const results = writePayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {
          '123': true,
        },
        updated: {},
      });
      expect(store.getField('123', 'name')).toBe(null);
    });

    it('adds null fields to an existing record when response is null', () => {
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
            name
          }
        }
      `);
      const payload = {
        node: {
          __typename: 'User',
          id: '123',
          name: null,
        },
      };
      const results = writePayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {},
        updated: {
          '123': true,
        },
      });
      expect(store.getField('123', 'name')).toBe(null);
    });

    it('updates fields when the response is null', () => {
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
            name
          }
        }
      `);
      const payload = {
        node: {
          __typename: 'User',
          id: '123',
          name: null,
        },
      };
      const results = writePayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {},
        updated: {
          '123': true,
        },
      });
      expect(store.getField('123', 'name')).toBe(null);
    });

    it('updates fields wth new scalar values', () => {
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
            name
          }
        }
      `);
      const payload = {
        node: {
          __typename: 'User',
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
      expect(store.getField('123', 'name')).toBe('Joseph');
    });
  });
});

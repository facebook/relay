/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

jest
  .mock('../../store/RelayQueryTracker')
  .mock('../../store/RelayClassicRecordState');

require('configureForRelayOSS');

const Relay = require('../RelayPublic');
const RelayTestUtils = require('RelayTestUtils');

describe('writeRelayQueryPayload()', () => {
  let RelayRecordStore;
  let RelayRecordWriter;

  const {getNode, writePayload} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModules();

    RelayRecordStore = require('../../store/RelayRecordStore');
    RelayRecordWriter = require('../../store/RelayRecordWriter');

    expect.extend(RelayTestUtils.matchers);
  });

  describe('scalar fields', () => {
    it('created with null when the response is null', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(
        Relay.QL`
        query {
          node(id:"123") {
            name
          }
        }
      `,
      );
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
      const query = getNode(
        Relay.QL`
        query {
          node(id:"123") {
            name
          }
        }
      `,
      );
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
      const query = getNode(
        Relay.QL`
        query {
          node(id:"123") {
            name
          }
        }
      `,
      );
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
      const query = getNode(
        Relay.QL`
        query {
          node(id:"123") {
            name
          }
        }
      `,
      );
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

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

jest.mock('../../legacy/store/generateClientID').mock('warning');

require('configureForRelayOSS');

const RelayClassic = require('../../RelayPublic');
const RelayRecordStore = require('../../store/RelayRecordStore');
const RelayRecordWriter = require('../../store/RelayRecordWriter');
const RelayTestUtils = require('RelayTestUtils');

describe('writeRelayQueryPayload()', () => {
  const {getNode, writePayload} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModules();
    expect.extend(RelayTestUtils.matchers);
  });

  describe('default null', () => {
    it('writes missing scalar field as null', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);

      const query = getNode(
        RelayClassic.QL`
        query {
          node(id:"123") {
            id
            name
          }
        }
      `,
      );
      const payload = {
        node: {
          __typename: 'User',
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
      expect(store.getField('123', 'name')).toBe(null);
    });

    it('warns and skips explicitly `undefined` fields', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);

      const query = getNode(
        RelayClassic.QL`
        query {
          node(id:"123") {
            id
            name
          }
        }
      `,
      );
      const payload = {
        node: {
          __typename: 'User',
          id: '123',
          name: undefined,
        },
      };
      const results = writePayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {
          '123': true,
        },
        updated: {},
      });
      expect(store.getField('123', 'name')).toBe(undefined);
      expect([
        'RelayQueryWriter: Encountered an explicit `undefined` field `%s` on ' +
          'record `%s`, expected response to not contain `undefined`.',
        'name',
        '123',
      ]).toBeWarnedNTimes(1);
    });

    it('writes missing linked field as null', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(
        RelayClassic.QL`
        query {
          viewer {
            actor {
              id
            }
          }
        }
      `,
      );
      const payload = {
        viewer: {},
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

    it('writes missing plural linked field as null', () => {
      const records = {
        '123': {
          __dataID__: '123',
          id: '123',
        },
      };
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);

      const query = getNode(
        RelayClassic.QL`
        query {
          node(id:"123") {
            allPhones {
              phoneNumber {
                displayNumber
              }
            }
          }
        }
      `,
      );
      const payload = {
        node: {
          __typename: 'User',
          id: '123',
        },
      };
      const results = writePayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {},
        updated: {
          '123': true,
        },
      });
      const phoneIDs = store.getLinkedRecordIDs('123', 'allPhones');
      expect(phoneIDs).toEqual(null);
    });

    it('writes missing connection as null', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(
        RelayClassic.QL`
        query {
          node(id:"123") {
            friends(first: 3) {
              edges {
                cursor
                node {
                  id
                }
              }
              pageInfo {
                hasNextPage
                hasPreviousPage
              }
            }
          }
        }
      `,
      );

      const payload = {
        node: {
          id: '123',
          __typename: 'User',
        },
      };

      const results = writePayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {
          '123': true,
        },
        updated: {},
      });
      expect(store.getField('123', 'friends')).toBe(null);
    });
  });
});

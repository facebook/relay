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
  });

  describe('plural scalar fields', () => {
    it('updates elements in a plural field', () => {
      const email = 'user@example.com';
      const records = {
        '123': {
          __dataID__: '123',
          __typename: 'User',
          id: '123',
          emailAddresses: [email],
        },
      };
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const newEmail = 'user2@example.com';
      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            emailAddresses
          }
        }
      `);
      const payload = {
        node: {
          __typename: 'User',
          id: '123',
          emailAddresses: [newEmail],
        },
      };
      const results = writePayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {},
        updated: {
          '123': true,
        },
      });
      expect(store.getField('123', 'emailAddresses')).toEqual([newEmail]);
    });

    it('prepends elements to a plural field', () => {
      const email = 'user@example.com';
      const records = {
        '123': {
          __dataID__: '123',
          __typename: 'User',
          id: '123',
          emailAddresses: [email],
        },
      };
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const newEmail = 'user2@example.com';
      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            emailAddresses
          }
        }
      `);
      const payload = {
        node: {
          __typename: 'User',
          id: '123',
          emailAddresses: [newEmail, email],
        },
      };
      const results = writePayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {},
        updated: {
          '123': true,
        },
      });
      expect(store.getField('123', 'emailAddresses'))
        .toEqual([newEmail, email]);
    });

    it('appends elements to a plural field', () => {
      const email = 'user@example.com';
      const records = {
        '123': {
          __dataID__: '123',
          __typename: 'User',
          id: '123',
          emailAddresses: [email],
        },
      };
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const newEmail = 'user2@example.com';
      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            emailAddresses
          }
        }
      `);
      const payload = {
        node: {
          __typename: 'User',
          id: '123',
          emailAddresses: [email, newEmail],
        },
      };
      const results = writePayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {},
        updated: {
          '123': true,
        },
      });
      expect(store.getField('123', 'emailAddresses'))
        .toEqual([email, newEmail]);
    });

    it('does not update if a plural field is unchanged', () => {
      const email = 'user@example.com';
      const records = {
        '123': {
          __dataID__: '123',
          __typename: 'User',
          id: '123',
          emailAddresses: [email],
        },
      };
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);

      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            emailAddresses
          }
        }
      `);
      const payload = {
        node: {
          __typename: 'User',
          id: '123',
          emailAddresses: [email],
        },
      };
      const results = writePayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {},
        updated: {},
      });
      expect(store.getField('123', 'emailAddresses')).toEqual([email]);
    });
  });
});

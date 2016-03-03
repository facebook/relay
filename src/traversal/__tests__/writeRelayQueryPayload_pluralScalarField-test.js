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
  .dontMock('GraphQLSegment');

const Relay = require('Relay');
const RelayTestUtils = require('RelayTestUtils');

describe('writeRelayQueryPayload()', () => {
  var RelayRecordStore;
  var RelayRecordWriter;

  var {getNode, writePayload} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModuleRegistry();

    RelayRecordStore = require('RelayRecordStore');
    RelayRecordWriter = require('RelayRecordWriter');
  });

  describe('plural scalar fields', () => {
    it('updates elements in a plural field', () => {
      var email = 'user@example.com';
      var records = {
        '123': {
          __dataID__: '123',
          __typename: 'User',
          id: '123',
          emailAddresses: [email],
        },
      };
      var store = new RelayRecordStore({records});
      var writer = new RelayRecordWriter(records, {}, false);
      var newEmail = 'user2@example.com';
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            emailAddresses
          }
        }
      `);
      var payload = {
        node: {
          __typename: 'User',
          id: '123',
          emailAddresses: [newEmail],
        },
      };
      var results = writePayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {},
        updated: {
          '123': true,
        },
      });
      expect(store.getField('123', 'emailAddresses')).toEqual([newEmail]);
    });

    it('prepends elements to a plural field', () => {
      var email = 'user@example.com';
      var records = {
        '123': {
          __dataID__: '123',
          __typename: 'User',
          id: '123',
          emailAddresses: [email],
        },
      };
      var store = new RelayRecordStore({records});
      var writer = new RelayRecordWriter(records, {}, false);
      var newEmail = 'user2@example.com';
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            emailAddresses
          }
        }
      `);
      var payload = {
        node: {
          __typename: 'User',
          id: '123',
          emailAddresses: [newEmail, email],
        },
      };
      var results = writePayload(store, writer, query, payload);
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
      var email = 'user@example.com';
      var records = {
        '123': {
          __dataID__: '123',
          __typename: 'User',
          id: '123',
          emailAddresses: [email],
        },
      };
      var store = new RelayRecordStore({records});
      var writer = new RelayRecordWriter(records, {}, false);
      var newEmail = 'user2@example.com';
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            emailAddresses
          }
        }
      `);
      var payload = {
        node: {
          __typename: 'User',
          id: '123',
          emailAddresses: [email, newEmail],
        },
      };
      var results = writePayload(store, writer, query, payload);
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
      var email = 'user@example.com';
      var records = {
        '123': {
          __dataID__: '123',
          __typename: 'User',
          id: '123',
          emailAddresses: [email],
        },
      };
      var store = new RelayRecordStore({records});
      var writer = new RelayRecordWriter(records, {}, false);

      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            emailAddresses
          }
        }
      `);
      var payload = {
        node: {
          __typename: 'User',
          id: '123',
          emailAddresses: [email],
        },
      };
      var results = writePayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {},
        updated: {},
      });
      expect(store.getField('123', 'emailAddresses')).toEqual([email]);
    });
  });
});

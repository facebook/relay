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

  describe('plural linked fields', () => {
    it('creates empty linked records', () => {
      const records = {
        '123': {
          __dataID__: '123',
          __typename: 'User',
          id: '123',
        },
      };
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);

      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            ... on User {
              allPhones {
                phoneNumber {
                  displayNumber
                }
              }
            }
          }
        }
      `);
      const payload = {
        node: {
          __typename: 'User',
          id: '123',
          allPhones: [],
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
      expect(phoneIDs).toEqual([]);
    });

    it('creates linked records', () => {
      const records = {
        '123': {
          __dataID__: '123',
          id: '123',
        },
      };
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const phone = {
        isVerified: true,
        phoneNumber: {
          displayNumber: '1-800-555-1212', // directory assistance
          countryCode: '1',
        },
      };
      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            allPhones {
              isVerified
              phoneNumber {
                displayNumber
                countryCode
              }
            }
          }
        }
      `);
      const payload = {
        node: {
          __typename: 'User',
          id: '123',
          allPhones: [phone],
        },
      };
      const results = writePayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {
          'client:1': true,
          'client:2': true,
        },
        updated: {
          '123': true,
        },
      });
      const phoneIDs = store.getLinkedRecordIDs('123', 'allPhones');
      expect(phoneIDs).toEqual(['client:1']);
      const phoneID = phoneIDs[0];
      expect(store.getRecordState(phoneID)).toBe('EXISTENT');
      expect(store.getField(phoneID, 'id')).toBe(undefined);
      expect(store.getField(phoneID, 'isVerified')).toBe(true);
      const phoneNumberID = store.getLinkedRecordID(phoneID, 'phoneNumber');
      expect(phoneNumberID).toBe('client:2');
      expect(store.getField(phoneNumberID, 'displayNumber'))
        .toBe(phone.phoneNumber.displayNumber);
      expect(store.getField(phoneNumberID, 'countryCode'))
        .toBe(phone.phoneNumber.countryCode);
    });

    it('updates if response changes', () => {
      const phone = {
        isVerified: true,
        phoneNumber: {
          displayNumber: '1-800-555-1212',
          countryCode: '1',
        },
      };
      const records = {
        '123': {
          __dataID__: '123',
          __typename: 'User',
          id: '123',
          allPhones: [
            {__dataID__: 'client:1'},
          ],
        },
        'client:1': {
          isVerified: true,
          __typename: 'Phone',
          phoneNumber: {
            __dataID__: 'client:2',
          },
        },
        'client:2': {
          __dataID__: 'client:2',
          __typename: 'PhoneNumber',
          displayNumber: phone.phoneNumber.displayNumber,
          countryCode: phone.phoneNumber.countryCode,
        },
      };
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const newPhone = {
        isVerified: true,
        phoneNumber: {
          displayNumber: '1-800-555-1212',
          countryCode: '*',                 // *changed*
        },
      };
      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            allPhones {
              isVerified
              phoneNumber {
                displayNumber
                countryCode
              }
            }
          }
        }
      `);
      const payload = {
        node: {
          __typename: 'User',
          id: '123',
          allPhones: [newPhone],
        },
      };
      const results = writePayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {},
        updated: {
          // intermediate phone object has no changes
          'client:2': true,
        },
      });
      const phoneIDs = store.getLinkedRecordIDs('123', 'allPhones');
      expect(phoneIDs).toEqual(['client:1']);
      const phoneID = phoneIDs[0];
      expect(store.getRecordState(phoneID)).toBe('EXISTENT');
      expect(store.getField(phoneID, 'id')).toBe(undefined);
      expect(store.getField(phoneID, 'isVerified')).toBe(true);
      const phoneNumberID = store.getLinkedRecordID(phoneID, 'phoneNumber');
      expect(phoneNumberID).toBe('client:2');
      expect(store.getField(phoneNumberID, 'displayNumber'))
        .toBe(phone.phoneNumber.displayNumber);
      expect(store.getField(phoneNumberID, 'countryCode'))
        .toBe(newPhone.phoneNumber.countryCode);
    });

    it('updates if length changes', () => {
      const records = {
        '123': {
          __dataID__: '123',
          __typename: 'User',
          id: '123',
          allPhones: [
            {__dataID__: 'client:1'},
            {__dataID__: 'client:2'},
          ],
        },
        'client:1': {
          __dataID__: 'client:1',
          __typename: 'Phone',
          phoneNumber: {__dataID__: 'phone1'},
        },
        'phone1': {
          __dataID__:'phone1',
          __typename: 'PhoneNumber',
          displayNumber: '1-800-555-1212',
          countryCode: '1',
        },
        'client:2': {
          __dataID__: 'client:2',
          __typename: 'Phone',
          phoneNumber: {__dataID__: 'phone2'},
        },
        'phone2': {
          __dataID__:'phone2',
          __typename: 'PhoneNumber',
          displayNumber: '1-800-555-1313',
          countryCode: '2',
        },
      };
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            allPhones {
              phoneNumber {
                displayNumber
                countryCode
              }
            }
          }
        }
      `);
      const payload = {
        node: {
          __typename: 'User',
          id: '123',
          allPhones: [{
            phoneNumber: {
              displayNumber: '1-800-555-1212',
              countryCode: '1',
            },
          }],
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
      expect(phoneIDs).toEqual(['client:1']);
    });

    it('does not update if response does not change', () => {
      const phone = {
        isVerified: true,
        phoneNumber: {
          displayNumber: '1-800-555-1212',
          countryCode: '1',
        },
      };
      const records = {
        '123': {
          __dataID__: '123',
          __typename: 'User',
          id: '123',
          allPhones: [
            {__dataID__: 'client:1'},
          ],
        },
        'client:1': {
          __dataID__: 'client:1',
          __typename: 'Phone',
          isVerified: true,
          phoneNumber: {
            __dataID__: 'client:2',
          },
        },
        'client:2': {
          __dataID__: 'client:2',
          __typename: 'PhoneNumber',
          displayNumber: phone.phoneNumber.displayNumber,
          countryCode: phone.phoneNumber.countryCode,
        },
      };
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            allPhones {
              isVerified
              phoneNumber {
                displayNumber
                countryCode
              }
            }
          }
        }
      `);
      const payload = {
        node: {
          __typename: 'User',
          id: '123',
          allPhones: [phone],
        },
      };
      const results = writePayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {},
        updated: {},
      });
      const phoneIDs = store.getLinkedRecordIDs('123', 'allPhones');
      expect(phoneIDs).toEqual(['client:1']);
      const phoneID = phoneIDs[0];
      expect(store.getRecordState(phoneID)).toBe('EXISTENT');
      expect(store.getField(phoneID, 'id')).toBe(undefined);
      expect(store.getField(phoneID, 'isVerified')).toBe(true);
      const phoneNumberID = store.getLinkedRecordID(phoneID, 'phoneNumber');
      expect(phoneNumberID).toBe('client:2');
      expect(store.getField(phoneNumberID, 'displayNumber'))
        .toBe(phone.phoneNumber.displayNumber);
      expect(store.getField(phoneNumberID, 'countryCode'))
        .toBe(phone.phoneNumber.countryCode);
    });

    it('does not update if response remains empty', () => {
      const records = {
        '123': {
          __dataID__: '123',
          __typename: 'User',
          id: '123',
          allPhones: [],
        },
      };
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);

      const query = getNode(Relay.QL`
        query {
          node(id:"123") {
            allPhones {
              phoneNumber {
                displayNumber
              }
            }
          }
        }
      `);
      const payload = {
        node: {
          __typename: 'User',
          id: '123',
          allPhones: [],
        },
      };
      const results = writePayload(store, writer, query, payload);
      expect(results).toEqual({
        created: {},
        updated: {},
      });
      const phoneIDs = store.getLinkedRecordIDs('123', 'allPhones');
      expect(phoneIDs).toEqual([]);
    });

    it('records the concrete type if `__typename` is present', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
        query {
          node(id: "1") {
            actors {
              __typename
              id
            }
          }
        }
      `);
      const payload = {
        node: {
          id: '1',
          actors: [{
            __typename: 'User',
            id: '123',
          }],
          __typename: 'Story',
        },
      };
      writePayload(store, writer, query, payload);
      expect(store.getType('123')).toBe('User');
    });

    it('does not overwrite nested child field', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(Relay.QL`
        query {
          node(id: "1") {
            ... on Story {
              attachments {
                target {
                  attachments {
                    styleList
                  }
                }
              }
            }
          }
        }
      `);
      const styleList = ['Image'];
      const payload = {
        node: {
          id: '1',
          attachments: [{
            target: {
              id: '1',
              attachments: [{
                styleList,
              }],
            },
          }],
          __typename: 'Story',
        },
      };
      writePayload(store, writer, query, payload);
      const attachmentIDs = store.getLinkedRecordIDs('1', 'attachments');
      expect(attachmentIDs.length).toBe(1);
      expect(store.getField(attachmentIDs[0], 'styleList'))
        .toEqual(styleList);
      expect(store.getLinkedRecordID(attachmentIDs[0], 'target')).toBe('1');
    });
  });
});

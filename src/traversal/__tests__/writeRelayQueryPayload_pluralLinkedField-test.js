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

var Relay = require('Relay');

describe('writeRelayQueryPayload()', () => {
  var RelayRecordStore;

  var {getNode, getVerbatimNode, writePayload} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModuleRegistry();

    RelayRecordStore = require('RelayRecordStore');
  });

  describe('plural linked fields', () => {
    it('creates empty linked records', () => {
      var records = {
        '123': {
          __dataID__: '123',
          id: '123',
        }
      };
      var store = new RelayRecordStore({records});

      var query = getNode(Relay.QL`
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
      var payload = {
        node: {
          id: '123',
          allPhones: [],
        }
      };
      var results = writePayload(store, query, payload);
      expect(results).toEqual({
        created: {},
        updated: {
          '123': true,
        }
      });
      var phoneIDs = store.getLinkedRecordIDs('123', 'allPhones');
      expect(phoneIDs).toEqual([]);
    });

    it('creates linked records', () => {
      var records = {
        '123': {
          __dataID__: '123',
          id: '123',
        }
      };
      var store = new RelayRecordStore({records});
      var phone = {
        isVerified: true,
        phoneNumber: {
          displayNumber: '1-800-555-1212', // directory assistance
          countryCode: '1'
        }
      };
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            allPhones {
              isVerified,
              phoneNumber {
                displayNumber,
                countryCode,
              }
            }
          }
        }
      `);
      var payload = {
        node: {
          id: '123',
          allPhones: [phone]
        }
      };
      var results = writePayload(store, query, payload);
      expect(results).toEqual({
        created: {
          'client:1': true,
          'client:2': true,
        },
        updated: {
          '123': true,
        }
      });
      var phoneIDs = store.getLinkedRecordIDs('123', 'allPhones');
      expect(phoneIDs).toEqual(['client:1']);
      var phoneID = phoneIDs[0];
      expect(store.getRecordState(phoneID)).toBe('EXISTENT');
      expect(store.getField(phoneID, 'id')).toBe(undefined);
      expect(store.getField(phoneID, 'isVerified')).toBe(true);
      var phoneNumberID = store.getLinkedRecordID(phoneID, 'phoneNumber');
      expect(phoneNumberID).toBe('client:2');
      expect(store.getField(phoneNumberID, 'displayNumber'))
        .toBe(phone.phoneNumber.displayNumber);
      expect(store.getField(phoneNumberID, 'countryCode'))
        .toBe(phone.phoneNumber.countryCode);
    });

    it('updates if response changes', () => {
      var phone = {
        isVerified: true,
        phoneNumber: {
          displayNumber: '1-800-555-1212',
          countryCode: '1'
        }
      };
      var records = {
        '123': {
          __dataID__: '123',
          id: '123',
          allPhones: [
            {__dataID__: 'client:1'}
          ]
        },
        'client:1': {
          isVerified: true,
          phoneNumber: {
            __dataID__: 'client:2'
          }
        },
        'client:2': {
          __dataID__: 'client:2',
          displayNumber: phone.phoneNumber.displayNumber,
          countryCode: phone.phoneNumber.countryCode,
        }
      };
      var store = new RelayRecordStore({records});
      var newPhone = {
        isVerified: true,
        phoneNumber: {
          displayNumber: '1-800-555-1212',
          countryCode: '*'                 // *changed*
        }
      };
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            allPhones {
              isVerified,
              phoneNumber {
                displayNumber,
                countryCode,
              }
            }
          }
        }
      `);
      var payload = {
        node: {
          id: '123',
          allPhones: [newPhone]
        }
      };
      var results = writePayload(store, query, payload);
      expect(results).toEqual({
        created: {},
        updated: {
          // intermediate phone object has no changes
          'client:2': true,
        }
      });
      var phoneIDs = store.getLinkedRecordIDs('123', 'allPhones');
      expect(phoneIDs).toEqual(['client:1']);
      var phoneID = phoneIDs[0];
      expect(store.getRecordState(phoneID)).toBe('EXISTENT');
      expect(store.getField(phoneID, 'id')).toBe(undefined);
      expect(store.getField(phoneID, 'isVerified')).toBe(true);
      var phoneNumberID = store.getLinkedRecordID(phoneID, 'phoneNumber');
      expect(phoneNumberID).toBe('client:2');
      expect(store.getField(phoneNumberID, 'displayNumber'))
        .toBe(phone.phoneNumber.displayNumber);
      expect(store.getField(phoneNumberID, 'countryCode'))
        .toBe(newPhone.phoneNumber.countryCode);
    });

    it('updates if length changes', () => {
      var records = {
        '123': {
          __dataID__: '123',
          id: '123',
          allPhones: [
            {__dataID__: 'client:1'},
            {__dataID__: 'client:2'}
          ]
        },
        'client:1': {
          __dataID__: 'client:1',
          displayNumber: '1-800-555-1212',
          countryCode: '1'
        },
        'client:2': {
          __dataID__: 'client:2',
          displayNumber: '1-800-555-1313',
          countryCode: '2'
        }
      };
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            allPhones {
              phoneNumber {
                displayNumber,
                countryCode,
              }
            }
          }
        }
      `);
      var payload = {
        node: {
          id: '123',
          allPhones: [{
            displayNumber: '1-800-555-1212',
            countryCode: '1'
          }]
        }
      };
      var results = writePayload(store, query, payload);
      expect(results).toEqual({
        created: {},
        updated: {
          '123': true
        }
      });
      var phoneIDs = store.getLinkedRecordIDs('123', 'allPhones');
      expect(phoneIDs).toEqual(['client:1']);
    });

    it('does not update if response does not change', () => {
      var phone = {
        isVerified: true,
        phoneNumber: {
          displayNumber: '1-800-555-1212',
          countryCode: '1'
        }
      };
      var records = {
        '123': {
          __dataID__: '123',
          id: '123',
          allPhones: [
            {__dataID__: 'client:1'}
          ]
        },
        'client:1': {
          isVerified: true,
          phoneNumber: {
            __dataID__: 'client:2'
          }
        },
        'client:2': {
          __dataID__: 'client:2',
          displayNumber: phone.phoneNumber.displayNumber,
          countryCode: phone.phoneNumber.countryCode,
        }
      };
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            allPhones {
              isVerified,
              phoneNumber {
                displayNumber,
                countryCode,
              }
            }
          }
        }
      `);
      var payload = {
        node: {
          id: '123',
          allPhones: [phone]
        }
      };
      var results = writePayload(store, query, payload);
      expect(results).toEqual({
        created: {},
        updated: {}
      });
      var phoneIDs = store.getLinkedRecordIDs('123', 'allPhones');
      expect(phoneIDs).toEqual(['client:1']);
      var phoneID = phoneIDs[0];
      expect(store.getRecordState(phoneID)).toBe('EXISTENT');
      expect(store.getField(phoneID, 'id')).toBe(undefined);
      expect(store.getField(phoneID, 'isVerified')).toBe(true);
      var phoneNumberID = store.getLinkedRecordID(phoneID, 'phoneNumber');
      expect(phoneNumberID).toBe('client:2');
      expect(store.getField(phoneNumberID, 'displayNumber'))
        .toBe(phone.phoneNumber.displayNumber);
      expect(store.getField(phoneNumberID, 'countryCode'))
        .toBe(phone.phoneNumber.countryCode);
    });

    it('does not update if response remains empty', () => {
      var records = {
        '123': {
          __dataID__: '123',
          id: '123',
          allPhones: [],
        }
      };
      var store = new RelayRecordStore({records});

      var query = getNode(Relay.QL`
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
      var payload = {
        node: {
          id: '123',
          allPhones: [],
        }
      };
      var results = writePayload(store, query, payload);
      expect(results).toEqual({
        created: {},
        updated: {},
      });
      var phoneIDs = store.getLinkedRecordIDs('123', 'allPhones');
      expect(phoneIDs).toEqual([]);
    });

    it('records the concrete type if `__typename` is present', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          node(id: "1") {
            actors {
              id,
              __typename
            }
          }
        }
      `);
      var payload = {
        node: {
          id: '1',
          actors: [{
            id: '123',
            __typename: 'User',
          }],
        },
      };
      writePayload(store, query, payload);
      expect(store.getType('123')).toBe('User');
    });

    it('records the parent field type if `__typename` is not present', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      var query = getVerbatimNode(Relay.QL`
        query {
          node(id: "1") {
            actors {
              id
            }
          }
        }
      `);
      var payload = {
        node: {
          id: '1',
          actors: [{
            id: '123',
          }],
        },
      };
      writePayload(store, query, payload);
      expect(store.getType('123')).toBe('Actor');
    });
  });
});

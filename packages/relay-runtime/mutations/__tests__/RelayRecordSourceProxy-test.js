/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

const defaultGetDataID = require('../../store/defaultGetDataID');
const RelayRecordSource = require('../../store/RelayRecordSource');
const RelayStoreUtils = require('../../store/RelayStoreUtils');
const RelayRecordProxy = require('../RelayRecordProxy');
const RelayRecordSourceMutator = require('../RelayRecordSourceMutator');
const RelayRecordSourceProxy = require('../RelayRecordSourceProxy');
const {simpleClone} = require('relay-test-utils-internal');

const {ID_KEY, REF_KEY, REFS_KEY, ROOT_ID, ROOT_TYPE, TYPENAME_KEY} =
  RelayStoreUtils;

describe('RelayRecordSourceProxy', () => {
  let baseSource;
  let mutator;
  let store;
  let sinkSource;
  const initialData = {
    '4': {
      [ID_KEY]: '4',
      [TYPENAME_KEY]: 'User',
      'address(location:"WORK")': '1 Hacker Way',
      administeredPages: {[REFS_KEY]: ['beast']},
      blockedPages: {[REFS_KEY]: ['mpk']},
      hometown: {[REF_KEY]: 'mpk'},
      name: 'Mark',
      pet: {[REF_KEY]: 'beast'},
    },
    '660361306': {
      [ID_KEY]: '660361306',
      [TYPENAME_KEY]: 'User',
      administeredPages: {
        [REFS_KEY]: ['mpk'],
      },
      status: 'alive',
    },
    beast: {
      [ID_KEY]: 'beast',
      [TYPENAME_KEY]: 'Page',
      name: 'Beast',
      owner: {[REF_KEY]: '4'},
    },
    deleted: null,
    mpk: {
      [ID_KEY]: 'mpk',
      [TYPENAME_KEY]: 'Page',
      name: 'Menlo Park',
    },
    sf: {
      [ID_KEY]: 'sf',
      [TYPENAME_KEY]: 'Page',
      name: 'San Francisco',
    },
    [ROOT_ID]: {
      [ID_KEY]: ROOT_ID,
      [TYPENAME_KEY]: ROOT_TYPE,
    },
  };

  beforeEach(() => {
    jest.resetModules();
    baseSource = new RelayRecordSource(simpleClone(initialData));
    sinkSource = new RelayRecordSource({});
    mutator = new RelayRecordSourceMutator(baseSource, sinkSource);
    store = new RelayRecordSourceProxy(
      mutator,
      defaultGetDataID,
      undefined,
      [],
    );
  });

  describe('get()', () => {
    test('returns undefined for unfetched records', () => {
      expect(store.get('unfetched')).toBe(undefined);
    });

    test('returns null for deleted records', () => {
      expect(store.get('deleted')).toBe(null);
    });

    test('returns a writer for defined records', () => {
      const record = store.get('4');
      if (record == null) {
        throw new Error('Exepcted to find record with id 4');
      }
      expect(record.getDataID()).toBe('4');
      expect(record instanceof RelayRecordProxy).toBe(true);
    });

    test('returns the same writer for the same id', () => {
      expect(store.get('4')).toBe(store.get('4'));
    });
  });

  describe('getRoot()', () => {
    test('returns a writer for the root', () => {
      const root = store.getRoot();
      expect(root instanceof RelayRecordProxy).toBe(true);
      expect(root.getDataID()).toBe(ROOT_ID);
    });

    test('returns the same root writer', () => {
      expect(store.getRoot()).toBe(store.getRoot());
    });

    test('synthesizes a root if it does not exist', () => {
      baseSource.remove(ROOT_ID);
      sinkSource.remove(ROOT_ID);
      const root = store.getRoot();
      expect(root instanceof RelayRecordProxy).toBe(true);
      expect(root.getDataID()).toBe(ROOT_ID);
      expect(sinkSource.toJSON()[ROOT_ID]).toEqual({
        [ID_KEY]: ROOT_ID,
        [TYPENAME_KEY]: ROOT_TYPE,
      });
    });

    test('throws if the root is of a different type', () => {
      const root = baseSource.get(ROOT_ID);
      expect(root).not.toBeUndefined();
      if (root != null) {
        // Flow
        root.__typename = 'User';
      }
      expect(() => {
        store.getRoot();
      }).toThrow(
        'RelayRecordSourceProxy#getRoot(): Expected the source to contain a root record, found a root record of type `User`.',
      );
    });
  });

  describe('delete()', () => {
    test('deletes records that are in the source', () => {
      store.delete('4');
      expect(sinkSource.toJSON()['4']).toBe(null);
    });

    test('marks unknown records as deleted', () => {
      store.delete('unfetched');
      expect(sinkSource.toJSON().unfetched).toBe(null);
    });

    test('get() returns null for deleted records', () => {
      store.delete('4');
      expect(store.get('4')).toBe(null);
    });

    test('throws if the root is deleted', () => {
      expect(() => store.delete(ROOT_ID)).toThrowError(
        'RelayRecordSourceProxy#delete(): Cannot delete the root record.',
      );
    });
  });

  describe('copyFields()', () => {
    test('copies fields', () => {
      const sf = store.get('sf');
      const mpk = store.get('mpk');
      if (sf == null) {
        throw new Error('Exepcted to find record with id sf');
      }
      if (mpk == null) {
        throw new Error('Exepcted to find record with id mpk');
      }
      sf.copyFieldsFrom(mpk);
      expect(sinkSource.toJSON()).toEqual({
        sf: {
          [ID_KEY]: 'sf',
          [TYPENAME_KEY]: 'Page',
          name: 'Menlo Park',
        },
      });
    });
  });

  describe('create()', () => {
    test('creates a record writer with the id and type', () => {
      const joe = store.create('842472', 'User');
      expect(joe instanceof RelayRecordProxy).toBe(true);
      expect(store.get('842472')).toBe(joe);
      expect(joe.getDataID()).toBe('842472');
      expect(joe.getType()).toBe('User');
      expect(sinkSource.toJSON()['842472']).toEqual({
        [ID_KEY]: '842472',
        [TYPENAME_KEY]: 'User',
      });
    });

    test('creates records that were previously deleted', () => {
      // Prime the RecordProxy cache
      let zombie = store.get('deleted');
      expect(zombie).toBe(null);
      zombie = store.create('deleted', 'User');
      expect(zombie instanceof RelayRecordProxy).toBe(true);
      expect(store.get('deleted')).toBe(zombie);
    });

    test('throws if a duplicate record is created', () => {
      expect(() => {
        store.create('4', 'User');
      }).toThrowError(
        'RelayRecordSourceMutator#create(): Cannot create a record with id ' +
          '`4`, this record already exists.',
      );
    });
  });

  describe('setValue()', () => {
    test('sets a scalar value', () => {
      const user = store.create('c1', 'User');

      user.setValue('Jan', 'firstName');
      expect(user.getValue('firstName')).toBe('Jan');

      user.setValue(null, 'firstName');
      expect(user.getValue('firstName')).toBe(null);
    });

    test('sets an array of scalars', () => {
      const user = store.create('c1', 'User');

      user.setValue(['a@example.com', 'b@example.com'], 'emailAddresses');
      expect(user.getValue('emailAddresses')).toEqual([
        'a@example.com',
        'b@example.com',
      ]);

      user.setValue(['c@example.com'], 'emailAddresses');
      expect(user.getValue('emailAddresses')).toEqual(['c@example.com']);
    });

    test('throws if a complex object is written', () => {
      const user = store.create('c1', 'User');

      expect(() => {
        user.setValue({day: 1, month: 1, year: 1970}, 'birthdate');
      }).toThrowError(
        'RelayRecordProxy#setValue(): Expected a scalar or array of scalars, ' +
          'got `{"day":1,"month":1,"year":1970}`.',
      );
    });
  });

  describe('getLinkedRecord and getLinkedRecords', () => {
    test('throws if singular/plural is wrong', () => {
      const zuck = store.get('4');
      if (zuck == null) {
        throw new Error('Exepcted to find record with id 4');
      }
      expect(() => zuck.getLinkedRecords('hometown')).toThrow(
        'It appears to be a singular linked record: did you mean to call ' +
          'getLinkedRecord() instead of getLinkedRecords()',
      );
      expect(() => zuck.getLinkedRecord('blockedPages')).toThrow(
        'It appears to be a plural linked record: did you mean to call ' +
          'getLinkedRecords() instead of getLinkedRecord()?',
      );
    });
  });

  describe('getOrCreateLinkedRecord', () => {
    test('retrieves a record if it already exists', () => {
      const zuck = store.get('4');
      if (zuck == null) {
        throw new Error('Exepcted to find record with id 4');
      }
      expect(
        zuck.getOrCreateLinkedRecord('hometown', 'Page').getValue('name'),
      ).toBe('Menlo Park');
    });

    test('creates a record if it does not already exist', () => {
      const greg = store.get('660361306');
      if (greg == null) {
        throw new Error('Exepcted to find record with id 6603613064');
      }
      expect(greg.getLinkedRecord('hometown')).toBe(undefined);

      greg
        .getOrCreateLinkedRecord('hometown', 'Page')
        .setValue('Adelaide', 'name');

      expect(
        greg.getOrCreateLinkedRecord('hometown', 'Page').getValue('name'),
      ).toBe('Adelaide');
    });

    test('links to existing client records if the field was unset', () => {
      const greg = store.get('660361306');
      if (greg == null) {
        throw new Error('Exepcted to find record with id 6603613064');
      }
      expect(greg.getLinkedRecord('hometown')).toBe(undefined);

      const hometown = greg.getOrCreateLinkedRecord('hometown', 'Page');
      hometown.setValue('Adelaide', 'name');
      // unset the field but don't delete the newly created record
      greg.setValue(null, 'hometown');
      const hometown2 = greg.getOrCreateLinkedRecord('hometown', 'Page');

      expect(hometown2).toBe(hometown);
      expect(hometown2.getValue('name')).toBe('Adelaide');
      expect(
        greg.getOrCreateLinkedRecord('hometown', 'Page').getValue('name'),
      ).toBe('Adelaide');
    });
  });

  describe('record invalidation', () => {
    test('correctly marks store as invalid', () => {
      store.invalidateStore();
      expect(store.isStoreMarkedForInvalidation()).toBe(true);
    });

    test('correctly marks individual records invalid', () => {
      const user = store.create('c1', 'User');

      user.invalidateRecord();
      // Assert that id is correctly marked for invalidation
      expect(Array.from(store.getIDsMarkedForInvalidation())).toEqual(['c1']);

      user.invalidateRecord();
      expect(Array.from(store.getIDsMarkedForInvalidation())).toEqual(['c1']);

      const sameUser = store.get('c1');
      if (!sameUser) {
        throw new Error('Expected to find record with id c1');
      }
      sameUser.invalidateRecord();
      expect(Array.from(store.getIDsMarkedForInvalidation())).toEqual(['c1']);

      const otherUser = store.create('c2', 'User');
      otherUser.invalidateRecord();
      expect(Array.from(store.getIDsMarkedForInvalidation())).toEqual([
        'c1',
        'c2',
      ]);
    });
  });

  test('combines operations', () => {
    const mark = store.get('4');
    if (mark == null) {
      throw new Error('Exepcted to find record with id 4');
    }
    mark.setValue('Marcus', 'name');
    mark.setValue('Marcus Jr.', 'name');
    mark.setValue('1601 Willow Road', 'address', {location: 'WORK'});
    const beast = store.get('beast');
    if (beast == null) {
      throw new Error('Exepcted to find record with id beast');
    }
    beast.setValue('Dog', 'name');
    mark.setLinkedRecord(beast, 'hometown');
    const mpk = store.get('mpk');
    if (mpk == null) {
      throw new Error('Exepcted to find record with id mpk');
    }
    mark.setLinkedRecord(mpk, 'pet');
    mark.setLinkedRecord(beast, 'pet');
    const greg = store.get('660361306');
    if (greg == null) {
      throw new Error('Exepcted to find record with id 6603613064');
    }
    greg.setLinkedRecord(mpk, 'hometown');
    mark.setLinkedRecords([mpk], 'administeredPages');
    mark.setLinkedRecords([], 'blockedPages');
    greg.setLinkedRecords([mpk, beast], 'blockedPages');

    expect(baseSource.toJSON()).toEqual(initialData);
    expect(sinkSource.toJSON()).toEqual({
      '4': {
        [ID_KEY]: '4',
        [TYPENAME_KEY]: 'User',
        'address(location:"WORK")': '1601 Willow Road',
        administeredPages: {[REFS_KEY]: ['mpk']},
        blockedPages: {[REFS_KEY]: []},
        hometown: {[REF_KEY]: 'beast'},
        name: 'Marcus Jr.',
        pet: {[REF_KEY]: 'beast'},
      },
      '660361306': {
        [ID_KEY]: '660361306',
        [TYPENAME_KEY]: 'User',
        blockedPages: {[REFS_KEY]: ['mpk', 'beast']},
        hometown: {[REF_KEY]: 'mpk'},
      },
      beast: {
        [ID_KEY]: 'beast',
        [TYPENAME_KEY]: 'Page',
        name: 'Dog',
      },
    });
  });
});

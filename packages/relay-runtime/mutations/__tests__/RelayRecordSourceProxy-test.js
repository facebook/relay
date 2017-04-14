/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

jest.autoMockOff();

const RelayInMemoryRecordSource = require('RelayInMemoryRecordSource');
const RelayRecordSourceMutator = require('RelayRecordSourceMutator');
const RelayRecordSourceProxy = require('RelayRecordSourceProxy');
const RelayRecordProxy = require('RelayRecordProxy');
const RelayStoreUtils = require('RelayStoreUtils');
const RelayStaticTestUtils = require('RelayStaticTestUtils');

const simpleClone = require('simpleClone');

const {
  ID_KEY,
  REF_KEY,
  REFS_KEY,
  ROOT_ID,
  ROOT_TYPE,
  TYPENAME_KEY,
} = RelayStoreUtils;

describe('RelayRecordSourceProxy', () => {
  let backupData;
  let backupSource;
  let baseData;
  let baseSource;
  let initialData;
  let mutator;
  let store;
  let sinkData;
  let sinkSource;

  beforeEach(() => {
    jest.resetModules();
    jasmine.addMatchers(RelayStaticTestUtils.matchers);

    initialData = {
      4: {
        [ID_KEY]: '4',
        [TYPENAME_KEY]: 'User',
        'address{"location":"WORK"}': '1 Hacker Way',
        administeredPages: {[REFS_KEY]: ['beast']},
        blockedPages: {[REFS_KEY]: ['mpk']},
        hometown: {[REF_KEY]: 'mpk'},
        name: 'Mark',
        pet: {[REF_KEY]: 'beast'},
      },
      660361306: {
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
    backupData = {};
    sinkData = {};
    baseData = simpleClone(initialData);
    baseSource = new RelayInMemoryRecordSource(baseData);
    backupSource = new RelayInMemoryRecordSource(backupData);
    sinkSource = new RelayInMemoryRecordSource(sinkData);
    mutator = new RelayRecordSourceMutator(
      baseSource,
      sinkSource,
      backupSource
    );
    store = new RelayRecordSourceProxy(mutator);
  });

  describe('get()', () => {
    it('returns undefined for unfetched records', () => {
      expect(store.get('unfetched')).toBe(undefined);
    });

    it('returns null for deleted records', () => {
      expect(store.get('deleted')).toBe(null);
    });

    it('returns a writer for defined records', () => {
      const record = store.get('4');
      expect(record.getDataID()).toBe('4');
      expect(record instanceof RelayRecordProxy).toBe(true);
    });

    it('returns the same writer for the same id', () => {
      expect(store.get('4')).toBe(store.get('4'));
    });
  });

  describe('getRoot()', () => {
    it('returns a writer for the root', () => {
      const root = store.getRoot();
      expect(root instanceof RelayRecordProxy).toBe(true);
      expect(root.getDataID()).toBe(ROOT_ID);
    });

    it('returns the same root writer', () => {
      expect(store.getRoot()).toBe(store.getRoot());
    });

    it('synthesizes a root if it does not exist', () => {
      delete backupData[ROOT_ID];
      delete baseData[ROOT_ID];
      delete sinkData[ROOT_ID];
      const root = store.getRoot();
      expect(root instanceof RelayRecordProxy).toBe(true);
      expect(root.getDataID()).toBe(ROOT_ID);
      expect(sinkData[ROOT_ID]).toEqual({
        [ID_KEY]: ROOT_ID,
        [TYPENAME_KEY]: ROOT_TYPE,
      });
    });
  });

  describe('delete()', () => {
    it('deletes records that are in the source', () => {
      store.delete('4');
      expect(sinkData['4']).toBe(null);
    });

    it('marks unknown records as deleted', () => {
      store.delete('unfetched');
      expect(sinkData.unfetched).toBe(null);
    });

    it('get() returns null for deleted records', () => {
      store.delete('4');
      expect(store.get('4')).toBe(null);
    });

    it('throws if the root is deleted', () => {
      expect(() => store.delete(ROOT_ID)).toFailInvariant(
        'RelayRecordSourceProxy#delete(): Cannot delete the root record.'
      );
    });
  });

  describe('copyFields()', () => {
    it('copies fields', () => {
      const sf = store.get('sf');
      const mpk = store.get('mpk');
      sf.copyFieldsFrom(mpk);
      expect(sinkData).toEqual({
        sf: {
          [ID_KEY]: 'sf',
          [TYPENAME_KEY]: 'Page',
          name: 'Menlo Park',
        },
      });
    });
  });

  describe('commitPayload()', () => {
    const {generateWithTransforms} = RelayStaticTestUtils;
    it('override current fields ', () => {
      const {Query} = generateWithTransforms(`
        query Query {
          node(id: "sf") {
            id
            __typename
            name
          }
        }
      `);
      const rawPayload = {
        node: {
          id: 'sf',
          __typename: 'Page',
          name: 'SF',
        },
      };
      store.commitPayload(
        {
          dataID: ROOT_ID,
          node: Query,
          variables: {},
        },
        rawPayload
      );
      expect(sinkData.sf).toEqual({
          [ID_KEY]: 'sf',
          [TYPENAME_KEY]: 'Page',
          id: 'sf',
          name: 'SF',
      });
    });

    it('applies new records ', () => {
      const {Query} = generateWithTransforms(`
        query Query {
          node(id: "seattle") {
            id
            __typename
            name
          }
        }
      `);
      const rawPayload = {
        node: {
          id: 'seattle',
          __typename: 'Page',
          name: 'Seattle',
        },
      };
      store.commitPayload(
        {
          dataID: ROOT_ID,
          node: Query,
          variables: {},
        },
        rawPayload
      );
      expect(sinkData.seattle).toEqual({
          [ID_KEY]: 'seattle',
          [TYPENAME_KEY]: 'Page',
          id: 'seattle',
          name: 'Seattle',
      });
    });

    it('calls handler with field payload', () => {
      const handlerFunction = jest.fn();
      const handlers = {
        handlerName: {update: handlerFunction},
      };
      const handlerProvider = name => handlers[name];
      store = new RelayRecordSourceProxy(mutator, handlerProvider);

      const {Query} = generateWithTransforms(`
        query Query {
          node(id: "sf") {
            id
            __typename
            name @__clientField(handle: "handlerName")
          }
        }
      `);
      const rawPayload = {
        node: {
          id: 'sf',
          __typename: 'Page',
          name: 'SF',
        },
      };
      store.commitPayload(
        {
          dataID: ROOT_ID,
          node: Query,
          variables: {},
        },
        rawPayload
      );

      const fieldPayload = {
        args: {},
        dataID: 'sf',
        fieldKey: 'name',
        handle: 'handlerName',
        handleKey: '__name_handlerName',
      };
      expect(handlerFunction).toBeCalledWith(store, fieldPayload);
    });
  });

  describe('create()', () => {
    it('creates a record writer with the id and type', () => {
      const joe = store.create('842472', 'User');
      expect(joe instanceof RelayRecordProxy).toBe(true);
      expect(store.get('842472')).toBe(joe);
      expect(joe.getDataID()).toBe('842472');
      expect(joe.getType()).toBe('User');
      expect(sinkData['842472']).toEqual({
        [ID_KEY]: '842472',
        [TYPENAME_KEY]: 'User',
      });
    });

    it('creates records that were previously deleted', () => {
      // Prime the RecordProxy cache
      let zombie = store.get('deleted');
      expect(zombie).toBe(null);
      zombie = store.create('deleted', 'User');
      expect(zombie instanceof RelayRecordProxy).toBe(true);
      expect(store.get('deleted')).toBe(zombie);
    });

    it('throws if a duplicate record is created', () => {
      expect(() => {
        store.create('4', 'User');
      }).toFailInvariant(
        'RelayRecordSourceMutator#create(): Cannot create a record with id ' +
        '`4`, this record already exists.'
      );
    });
  });

  describe('getOrCreateLinkedRecord', () => {
    it('retrieves a record if it already exists', () => {
      const zuck = store.get('4');
      expect(
        zuck.getOrCreateLinkedRecord('hometown').getValue('name')
      ).toBe('Menlo Park');
    });

    it('creates a record if it does not already exist', () => {
      const greg = store.get('660361306');
      expect(greg.getLinkedRecord('hometown')).toBe(undefined);

      greg.getOrCreateLinkedRecord('hometown', 'Page')
        .setValue('Adelaide', 'name');

      expect(
        greg.getLinkedRecord('hometown').getValue('name')
      ).toBe('Adelaide');
    });
  });

  it('combines operations', () => {
    const markBackup = baseSource.get('4');
    const gregBackup = baseSource.get('660361306');
    const mark = store.get('4');
    mark.setValue('Marcus', 'name');
    mark.setValue('Marcus Jr.', 'name');
    mark.setValue('1601 Willow Road', 'address', {location: 'WORK'});
    const beast = store.get('beast');
    beast.setValue('Dog', 'name');
    mark.setLinkedRecord(beast, 'hometown');
    const mpk = store.get('mpk');
    mark.setLinkedRecord(mpk, 'pet');
    mark.setLinkedRecord(beast, 'pet');
    const greg = store.get('660361306');
    greg.setLinkedRecord(mpk, 'hometown');
    mark.setLinkedRecords([mpk], 'administeredPages');
    mark.setLinkedRecords([], 'blockedPages');
    greg.setLinkedRecords([mpk, beast], 'blockedPages');

    expect(baseData).toEqual(initialData);
    expect(sinkData).toEqual({
      4: {
        [ID_KEY]: '4',
        [TYPENAME_KEY]: 'User',
        'address{"location":"WORK"}': '1601 Willow Road',
        administeredPages: {[REFS_KEY]: ['mpk']},
        blockedPages: {[REFS_KEY]: []},
        hometown: {[REF_KEY]: 'beast'},
        name: 'Marcus Jr.',
        pet: {[REF_KEY]: 'beast'},
      },
      660361306: {
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
    expect(backupSource.get('4')).toBe(markBackup); // Same record (referential equality).
    expect(backupSource.get('4')).toEqual(initialData['4']); // And not mutated.
    expect(backupSource.get('660361306')).toBe(gregBackup); // Same record (referential equality).
    expect(backupSource.get('660361306')).toEqual(initialData['660361306']); // And not mutated.
  });
});

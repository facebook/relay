/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

jest
  .autoMockOff();

const RelayInMemoryRecordSource = require('RelayInMemoryRecordSource');
const RelayRecordSourceMutator = require('RelayRecordSourceMutator');
const RelayStoreUtils = require('RelayStoreUtils');
const RelayRecordState = require('RelayRecordState');
const RelayStaticTestUtils = require('RelayStaticTestUtils');

const simpleClone = require('simpleClone');

const {
  ID_KEY,
  REF_KEY,
  REFS_KEY,
  TYPENAME_KEY,
  UNPUBLISH_RECORD_SENTINEL,
} = RelayStoreUtils;
const {
  EXISTENT,
  NONEXISTENT,
  UNKNOWN,
} = RelayRecordState;

describe('RelayRecordSourceMutator', () => {
  let backupData;
  let backupMutator;
  let backupSource;
  let baseData;
  let baseSource;
  let initialData;
  let mutator;
  let sinkData;
  let sinkSource;

  beforeEach(() => {
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
    );
    backupMutator = new RelayRecordSourceMutator(
      baseSource,
      sinkSource,
      backupSource
    );
  });

  describe('copyFields()', () => {
    it('throws if the source does not exist', () => {
      expect(() => mutator.copyFields('unfetched', '4')).toFailInvariant(
        'RelayRecordSourceMutator#copyFields(): Cannot copy fields from ' +
        'non-existent record `unfetched`.',
      );
    });

    it('copies fields between existing records', () => {
      backupMutator.copyFields('sf', 'mpk');
      expect(sinkData).toEqual({
        mpk: {
          [ID_KEY]: 'mpk',
          [TYPENAME_KEY]: 'Page',
          name: 'San Francisco',
        },
      });
      expect(Object.keys(backupData)).toEqual(['mpk']);
      expect(backupData.mpk).toBe(baseData.mpk);
    });

    it('copies fields from an existing record to a created record', () => {
      backupMutator.create('seattle', 'Page');
      backupMutator.copyFields('sf', 'seattle');
      expect(sinkData).toEqual({
        seattle: {
          [ID_KEY]: 'seattle',
          [TYPENAME_KEY]: 'Page',
          name: 'San Francisco',
        },
      });
      expect(backupData).toEqual({
        seattle: UNPUBLISH_RECORD_SENTINEL,
      });
    });

    it('copies fields from a created record to an existing record', () => {
      backupMutator.create('seattle', 'Page');
      backupMutator.setValue('seattle', 'name', 'Seattle');
      backupMutator.copyFields('seattle', 'sf');
      expect(sinkData).toEqual({
        seattle: {
          [ID_KEY]: 'seattle',
          [TYPENAME_KEY]: 'Page',
          name: 'Seattle',
        },
        sf: {
          [ID_KEY]: 'sf',
          [TYPENAME_KEY]: 'Page',
          name: 'Seattle',
        },
      });
      expect(Object.keys(backupData)).toEqual(['seattle', 'sf']);
      expect(backupData.sf).toBe(baseData.sf);
      expect(backupData.seattle).toEqual(UNPUBLISH_RECORD_SENTINEL);
    });

    it('copies fields from a modified record to an existing record', () => {
      backupMutator.setLinkedRecordID('mpk', 'mayor', 'beast');
      backupMutator.copyFields('mpk', 'sf');
      expect(sinkData).toEqual({
        mpk: {
          [ID_KEY]: 'mpk',
          [TYPENAME_KEY]: 'Page',
          mayor: {[REF_KEY]: 'beast'},
        },
        sf: {
          [ID_KEY]: 'sf',
          [TYPENAME_KEY]: 'Page',
          mayor: {[REF_KEY]: 'beast'},
          name: 'Menlo Park',
        },
      });
      expect(Object.keys(backupData)).toEqual(['mpk', 'sf']);
      expect(backupData.mpk).toBe(baseData.mpk);
      expect(backupData.sf).toBe(baseData.sf);
    });
  });

  describe('copyFieldsFromRecord()', () => {
    it('throws if the sink does not exist', () => {
      const sourceRecord = initialData['4'];
      expect(() => mutator.copyFieldsFromRecord(sourceRecord, 'unfetched'))
        .toFailInvariant(
          'RelayRecordSourceMutator: Cannot modify non-existent record ' +
          '`unfetched`.',
        );
    });

    it('copies fields to existing records', () => {
      const sourceRecord = initialData.sf;
      backupMutator.copyFieldsFromRecord(sourceRecord, 'mpk');
      expect(sinkData).toEqual({
        mpk: {
          [ID_KEY]: 'mpk',
          [TYPENAME_KEY]: 'Page',
          name: 'San Francisco',
        },
      });
      expect(Object.keys(backupData)).toEqual(['mpk']);
      expect(backupData.mpk).toBe(baseData.mpk);
    });

    it('copies new fields to existing records', () => {
      const sourceRecord = {
        [ID_KEY]: 'sf',
        [TYPENAME_KEY]: 'Page',
        state: 'California',
      };
      backupMutator.copyFieldsFromRecord(sourceRecord, 'sf');
      expect(sinkData).toEqual({
        sf: {
          [ID_KEY]: 'sf',
          [TYPENAME_KEY]: 'Page',
          name: 'San Francisco',
          state: 'California',
        },
      });
      expect(Object.keys(backupData)).toEqual(['sf']);
      expect(backupData.sf).toBe(baseData.sf);
    });

    it('copies fields from to a created record', () => {
      const sourceRecord = initialData.sf;
      backupMutator.create('seattle', 'Page');
      backupMutator.copyFieldsFromRecord(sourceRecord, 'seattle');
      expect(sinkData).toEqual({
        seattle: {
          [ID_KEY]: 'seattle',
          [TYPENAME_KEY]: 'Page',
          name: 'San Francisco',
        },
      });
      expect(backupData.seattle).toBe(UNPUBLISH_RECORD_SENTINEL);
    });
  });

  describe('create()', () => {
    it('throws if the record already exists', () => {
      expect(() => mutator.create('4', 'User')).toFailInvariant(
        'RelayRecordSourceMutator#create(): Cannot create a record with id ' +
        '`4`, this record already exists.'
      );
    });

    it('throws if the record was previously created', () => {
      mutator.create('842472', 'User');
      expect(() => mutator.create('842472', 'User')).toFailInvariant(
        'RelayRecordSourceMutator#create(): Cannot create a record with id ' +
        '`842472`, this record already exists.'
      );
    });

    it('creates new records', () => {
      mutator.create('842472', 'User');
      mutator.setValue('842472', 'name', 'Joe');
      expect(mutator.getType('842472')).toBe('User');
      expect(mutator.getValue('842472', 'name')).toBe('Joe');
      expect(sinkSource.has('842472')).toBe(true);
      expect(baseData).toEqual(initialData);
      expect(sinkData).toEqual({
        842472: {
          [ID_KEY]: '842472',
          [TYPENAME_KEY]: 'User',
          name: 'Joe',
        },
      });
      expect(backupData).toEqual({});
    });

    it('creates previously deleted records', () => {
      mutator.create('deleted', 'User');
      mutator.setValue('deleted', 'name', 'Zombie');
      expect(mutator.getType('deleted')).toBe('User');
      expect(mutator.getValue('deleted', 'name')).toBe('Zombie');
      expect(sinkSource.has('deleted')).toBe(true);
      expect(baseData).toEqual(initialData);
      expect(sinkData).toEqual({
        deleted: {
          [ID_KEY]: 'deleted',
          [TYPENAME_KEY]: 'User',
          name: 'Zombie',
        },
      });
      expect(backupData).toEqual({});
    });

    it('creates newly deleted records', () => {
      mutator.delete('842472');
      mutator.create('842472', 'User');
      mutator.setValue('842472', 'name', 'Joe');
      expect(mutator.getType('842472')).toBe('User');
      expect(mutator.getValue('842472', 'name')).toBe('Joe');
      expect(sinkSource.has('842472')).toBe(true);
      expect(baseData).toEqual(initialData);
      expect(sinkData).toEqual({
        842472: {
          [ID_KEY]: '842472',
          [TYPENAME_KEY]: 'User',
          name: 'Joe',
        },
      });
      expect(backupData).toEqual({});
    });

    it('creates an "unpublish" backup record', () => {
      backupMutator.create('842472', 'User');
      expect(sinkSource.has('842472')).toBe(true);
      expect(baseData).toEqual(initialData);
      expect(sinkData).toEqual({
        842472: {
          [ID_KEY]: '842472',
          [TYPENAME_KEY]: 'User',
        },
      });
      expect(backupData).toEqual({
        842472: UNPUBLISH_RECORD_SENTINEL,
      });
    });
  });

  describe('delete()', () => {
    it('marks the record as deleted', () => {
      mutator.delete('4');
      expect(mutator.getStatus('4')).toBe(NONEXISTENT);
    });

    it('marks the record as deleted in the sink source', () => {
      mutator.delete('4');
      expect(sinkSource.get('4')).toBe(null);
    });

    it('does not modify the base source', () => {
      const mark = baseSource.get('4');
      mutator.delete('4');
      expect(baseSource.get('4')).toBe(mark);
      expect(baseSource.get('4')).toEqual(initialData['4']);
      expect(backupData).toEqual({});
    });

    it('makes a backup record reference in the backup source', () => {
      const mark = baseSource.get('4');
      backupMutator.delete('4');
      const backup = backupSource.get('4');
      expect(backup).toBe(mark); // Same record (referential equality).
      expect(backup).toEqual(initialData['4']); // And not mutated.
    });
  });

  describe('getStatus()', () => {
    it('returns the status of an unmutated record', () => {
      expect(mutator.getStatus('4')).toBe(EXISTENT);
    });

    it('returns the status of a unknown record', () => {
      expect(mutator.getStatus('rms')).toBe(UNKNOWN);
    });

    it('returns the status of a non-existent record', () => {
      expect(mutator.getStatus('deleted')).toBe(NONEXISTENT);
    });

    it('returns the updated status of a mutated record', () => {
      mutator.delete('4');
      expect(mutator.getStatus('4')).toBe(NONEXISTENT);
    });
  });

  describe('getType()', () => {
    it('returns the type of an unmutated record', () => {
      expect(mutator.getType('4')).toBe('User');
    });

    it('returns undefined for unknown records', () => {
      expect(mutator.getType('rms')).toBe(undefined);
    });

    it('returns null for deleted records', () => {
      expect(mutator.getType('deleted')).toBe(null);
    });

    it('returns the updated type of a mutated record', () => {
      mutator.delete('4');
      expect(mutator.getType('4')).toBe(null);
    });
  });

  describe('getValue()', () => {
    it('returns the value if set', () => {
      expect(mutator.getValue('4', 'name')).toBe('Mark');
    });

    it('returns null if the record is deleted', () => {
      mutator.delete('4');
      expect(mutator.getValue('4', 'name')).toBe(null);
    });

    it('returns undefined for unfetched fields', () => {
      expect(mutator.getValue('4', 'unfetched')).toBe(undefined);
    });
  });

  describe('setValue()', () => {
    it('mutates a field on a record', () => {
      expect(mutator.getValue('4', 'name')).toBe('Mark');
      mutator.setValue('4', 'name', 'Marcus');
      expect(mutator.getValue('4', 'name')).toBe('Marcus');
      expect(baseData).toEqual(initialData);
      expect(sinkData).toEqual({
        4: {
          [ID_KEY]: '4',
          [TYPENAME_KEY]: 'User',
          name: 'Marcus',
        },
      });
      expect(backupData).toEqual({});
    });

    it('creates a backup of the record', () => {
      const mark = baseSource.get('4');
      backupMutator.setValue('4', 'name', 'Marcus');
      expect(baseData).toEqual(initialData);
      expect(sinkData).toEqual({
        4: {
          [ID_KEY]: '4',
          [TYPENAME_KEY]: 'User',
          name: 'Marcus',
        },
      });
      const backup = backupSource.get('4');
      expect(backup).toBe(mark); // Same record (referential equality).
      expect(backup).toEqual(initialData['4']); // And not mutated.
    });

    it('mutates multiple fields on a record', () => {
      mutator.setValue('4', 'name', 'Marcus');
      mutator.setValue('4', 'address{"location":"WORK"}', '1601 Willow Road');
      expect(baseData).toEqual(initialData);
      expect(sinkData).toEqual({
        4: {
          [ID_KEY]: '4',
          [TYPENAME_KEY]: 'User',
          name: 'Marcus',
          'address{"location":"WORK"}': '1601 Willow Road',
        },
      });
    });

    it('mutates fields on multiple records', () => {
      mutator.setValue('4', 'name', 'Marcus');
      mutator.setValue('beast', 'name', 'Dog');
      expect(baseData).toEqual(initialData);
      expect(sinkData).toEqual({
        4: {
          [ID_KEY]: '4',
          [TYPENAME_KEY]: 'User',
          name: 'Marcus',
        },
        beast: {
          [ID_KEY]: 'beast',
          [TYPENAME_KEY]: 'Page',
          name: 'Dog',
        },
      });
    });

    it('mutates the same field multiple times', () => {
      mutator.setValue('4', 'name', 'Marcus');
      mutator.setValue('4', 'name', 'Zuck');
      expect(baseData).toEqual(initialData);
      expect(sinkData).toEqual({
        4: {
          [ID_KEY]: '4',
          [TYPENAME_KEY]: 'User',
          name: 'Zuck',
        },
      });
    });

    it('round-trips a field back to its original value', () => {
      const mark = baseSource.get('4');
      mutator.setValue('4', 'name', 'Marcus');
      mutator.setValue('4', 'name', 'Mark');
      expect(baseData).toEqual(initialData);
      expect(sinkData).toEqual({
        4: {
          [ID_KEY]: '4',
          [TYPENAME_KEY]: 'User',
          name: 'Mark',
        },
      });

      // Note that because we are dealing with a clone it is not actually the
      // same record even though it is equal.
      expect(sinkSource.get('4')).not.toBe(mark);
    });
  });

  describe('getLinkedRecordID()', () => {
    it('returns the id if set', () => {
      expect(mutator.getLinkedRecordID('4', 'hometown')).toBe('mpk');
    });

    it('returns null if the record is deleted', () => {
      mutator.delete('4');
      expect(mutator.getLinkedRecordID('4', 'hometown')).toBe(null);
    });

    it('returns undefined for unfetched fields', () => {
      expect(mutator.getLinkedRecordID('4', 'unfetched')).toBe(undefined);
    });
  });

  describe('setLinkedRecordID()', () => {
    it('sets a linked record ID on a record', () => {
      expect(mutator.getLinkedRecordID('4', 'hometown')).toBe('mpk');
      mutator.setLinkedRecordID('4', 'hometown', 'beast');
      expect(mutator.getLinkedRecordID('4', 'hometown')).toBe('beast');
      expect(baseData).toEqual(initialData);
      expect(sinkData).toEqual({
        4: {
          [ID_KEY]: '4',
          [TYPENAME_KEY]: 'User',
          hometown: {[REF_KEY]: 'beast'},
        },
      });
      expect(backupData).toEqual({});
    });

    it('creates a backup of the record', () => {
      const mark = baseSource.get('4');
      backupMutator.setLinkedRecordID('4', 'hometown', 'beast');
      expect(baseData).toEqual(initialData);
      expect(sinkData).toEqual({
        4: {
          [ID_KEY]: '4',
          [TYPENAME_KEY]: 'User',
          hometown: {[REF_KEY]: 'beast'},
        },
      });
      const backup = backupSource.get('4');
      expect(backup).toBe(mark); // Same record (referential equality).
      expect(backup).toEqual(initialData['4']); // And not mutated.
    });

    it('sets multiple linked record IDs on a record', () => {
      mutator.setLinkedRecordID('4', 'hometown', 'beast');
      mutator.setLinkedRecordID('4', 'pet', 'mpk');
      expect(baseData).toEqual(initialData);
      expect(sinkData).toEqual({
        4: {
          [ID_KEY]: '4',
          [TYPENAME_KEY]: 'User',
          hometown: {[REF_KEY]: 'beast'},
          pet: {[REF_KEY]: 'mpk'},
        },
      });
    });

    it('sets linked record IDs on multiple records', () => {
      mutator.setLinkedRecordID('4', 'hometown', 'beast');
      mutator.setLinkedRecordID('660361306', 'hometown', 'mpk');
      expect(baseData).toEqual(initialData);
      expect(sinkData).toEqual({
        4: {
          [ID_KEY]: '4',
          [TYPENAME_KEY]: 'User',
          hometown: {[REF_KEY]: 'beast'},
        },
        660361306: {
          [ID_KEY]: '660361306',
          [TYPENAME_KEY]: 'User',
          hometown: {[REF_KEY]: 'mpk'},
        },
      });
    });

    it('mutates the same link multiple times', () => {
      mutator.setLinkedRecordID('4', 'hometown', 'beast');
      mutator.setLinkedRecordID('4', 'hometown', 'sf');
      expect(baseData).toEqual(initialData);
      expect(sinkData).toEqual({
        4: {
          [ID_KEY]: '4',
          [TYPENAME_KEY]: 'User',
          hometown: {[REF_KEY]: 'sf'},
        },
      });
    });

    it('round-trips a link back to its original value', () => {
      const mark = baseSource.get('4');
      mutator.setLinkedRecordID('4', 'hometown', 'sf');
      mutator.setLinkedRecordID('4', 'hometown', 'mpk');
      expect(baseData).toEqual(initialData);
      expect(sinkData).toEqual({
        4: {
          [ID_KEY]: '4',
          [TYPENAME_KEY]: 'User',
          hometown: {[REF_KEY]: 'mpk'},
        },
      });

      // Note that because we are dealing with a clone it is not actually the
      // same record even though it is equal.
      expect(sinkSource.get('4')).not.toBe(mark);
    });
  });

  describe('getLinkedRecordIDs()', () => {
    it('returns ids if set', () => {
      expect(mutator.getLinkedRecordIDs('4', 'administeredPages')).toEqual(['beast']);
    });

    it('returns null if the record is deleted', () => {
      mutator.delete('4');
      expect(mutator.getLinkedRecordIDs('4', 'administeredPages')).toEqual(null);
    });

    it('returns undefined for unfetched fields', () => {
      expect(mutator.getLinkedRecordIDs('4', 'unfetched')).toBe(undefined);
    });
  });

  describe('setLinkedRecordIDs()', () => {
    it('sets a list of linked record IDs on a record', () => {
      expect(mutator.getLinkedRecordIDs('4', 'administeredPages')).toEqual(['beast']);
      mutator.setLinkedRecordIDs('4', 'administeredPages', ['mpk']);
      expect(mutator.getLinkedRecordIDs('4', 'administeredPages')).toEqual(['mpk']);
      expect(baseData).toEqual(initialData);
      expect(sinkData).toEqual({
        4: {
          [ID_KEY]: '4',
          [TYPENAME_KEY]: 'User',
          administeredPages: {[REFS_KEY]: ['mpk']},
        },
      });
      expect(backupData).toEqual({});
    });

    it('creates a backup of modified records', () => {
      const mark = baseSource.get('4');
      backupMutator.setLinkedRecordIDs('4', 'administeredPages', ['mpk']);
      expect(baseData).toEqual(initialData);
      expect(sinkData).toEqual({
        4: {
          [ID_KEY]: '4',
          [TYPENAME_KEY]: 'User',
          administeredPages: {[REFS_KEY]: ['mpk']},
        },
      });
      const backup = backupSource.get('4');
      expect(backup).toBe(mark); // Same record (referential equality).
      expect(backup).toEqual(initialData['4']); // And not mutated.
    });

    it('sets multiple lists of linked record IDs on a record', () => {
      mutator.setLinkedRecordIDs('4', 'administeredPages', ['mpk']);
      mutator.setLinkedRecordIDs('4', 'blockedPages', []);
      expect(baseData).toEqual(initialData);
      expect(sinkData).toEqual({
        4: {
          [ID_KEY]: '4',
          [TYPENAME_KEY]: 'User',
          administeredPages: {[REFS_KEY]: ['mpk']},
          blockedPages: {[REFS_KEY]: []},
        },
      });
    });

    it('sets lists of linked record IDs on multiple records', () => {
      mutator.setLinkedRecordIDs('4', 'administeredPages', ['mpk']);
      mutator.setLinkedRecordIDs('660361306', 'blockedPages', ['mpk', 'beast']);
      expect(baseData).toEqual(initialData);
      expect(sinkData).toEqual({
        4: {
          [ID_KEY]: '4',
          [TYPENAME_KEY]: 'User',
          administeredPages: {[REFS_KEY]: ['mpk']},
        },
        660361306: {
          [ID_KEY]: '660361306',
          [TYPENAME_KEY]: 'User',
          blockedPages: {[REFS_KEY]: ['mpk', 'beast']},
        },
      });
    });

    it('mutates the same links multiple times', () => {
      mutator.setLinkedRecordIDs('4', 'administeredPages', ['mpk']);
      mutator.setLinkedRecordIDs('4', 'administeredPages', ['beast', 'mpk']);
      expect(baseData).toEqual(initialData);
      expect(sinkData).toEqual({
        4: {
          [ID_KEY]: '4',
          [TYPENAME_KEY]: 'User',
          administeredPages: {[REFS_KEY]: ['beast', 'mpk']},
        },
      });
    });

    it('round-trips links back to their original values', () => {
      const mark = baseSource.get('4');
      mutator.setLinkedRecordIDs('4', 'administeredPages', ['mpk']);
      mutator.setLinkedRecordIDs('4', 'administeredPages', ['beast']);
      expect(baseData).toEqual(initialData);
      expect(sinkData).toEqual({
        4: {
          [ID_KEY]: '4',
          [TYPENAME_KEY]: 'User',
          administeredPages: {[REFS_KEY]: ['beast']},
        },
      });

      // Note that because we are dealing with a clone it is not actually the
      // same record even though it is equal.
      expect(sinkSource.get('4')).not.toBe(mark);
    });
  });

  describe('combining operations', () => {
    it('combines the effect of multiple operations', () => {
      mutator.setValue('4', 'name', 'Marcus');
      mutator.setValue('4', 'name', 'Marcus Jr.'); // Overwrite.
      mutator.setValue('4', 'address{"location":"WORK"}', '1601 Willow Road');
      mutator.setValue('beast', 'name', 'Dog');
      mutator.setLinkedRecordID('4', 'hometown', 'beast');
      mutator.setLinkedRecordID('4', 'pet', 'mpk');
      mutator.setLinkedRecordID('4', 'pet', 'beast'); // Reset to original.
      mutator.setLinkedRecordID('660361306', 'hometown', 'mpk');
      mutator.setLinkedRecordIDs('4', 'administeredPages', ['mpk']);
      mutator.setLinkedRecordIDs('4', 'blockedPages', []);
      mutator.setLinkedRecordIDs('660361306', 'blockedPages', ['mpk', 'beast']);
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
      expect(backupData).toEqual({});
    });

    it('combines the effect of multiple operations with a backup', () => {
      const mark = baseSource.get('4');
      const greg = baseSource.get('660361306');
      backupMutator.setValue('4', 'name', 'Marcus');
      backupMutator.setValue('4', 'name', 'Marcus Jr.'); // Overwrite.
      backupMutator.setValue('4', 'address{"location":"WORK"}', '1601 Willow Road');
      backupMutator.setValue('beast', 'name', 'Dog');
      backupMutator.setLinkedRecordID('4', 'hometown', 'beast');
      backupMutator.setLinkedRecordID('4', 'pet', 'mpk');
      backupMutator.setLinkedRecordID('4', 'pet', 'beast'); // Reset to original.
      backupMutator.setLinkedRecordID('660361306', 'hometown', 'mpk');
      backupMutator.setLinkedRecordIDs('4', 'administeredPages', ['mpk']);
      backupMutator.setLinkedRecordIDs('4', 'blockedPages', []);
      backupMutator.setLinkedRecordIDs('660361306', 'blockedPages', ['mpk', 'beast']);
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
      const markBackup = backupSource.get('4');
      expect(markBackup).toBe(mark); // Same record (referential equality).
      expect(markBackup).toEqual(initialData['4']); // And not mutated.
      const gregBackup = backupSource.get('660361306');
      expect(gregBackup).toBe(greg); // Same record (referential equality).
      expect(gregBackup).toEqual(initialData['660361306']); // And not mutated.
    });
  });
});

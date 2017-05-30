/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 */

'use strict';

jest.autoMockOff();

const RelayModernRecord = require('RelayModernRecord');
const RelayStoreUtils = require('RelayStoreUtils');
const RelayModernTestUtils = require('RelayModernTestUtils');

const deepFreeze = require('deepFreeze');

const {ID_KEY, REF_KEY, REFS_KEY, TYPENAME_KEY} = RelayStoreUtils;

describe('RelayModernRecord', () => {
  beforeEach(() => {
    jasmine.addMatchers(RelayModernTestUtils.matchers);
  });

  describe('clone', () => {
    it('returns a shallow copy of the record', () => {
      const record = {
        [ID_KEY]: '4',
        name: 'Mark',
        pet: {[REF_KEY]: 'beast'},
      };
      const clone = RelayModernRecord.clone(record);
      expect(clone).toEqual(record);
      expect(clone).not.toBe(record);
      expect(clone.pet).toBe(record.pet);
    });
  });

  describe('copyFields()', () => {
    it('copies fields', () => {
      const sink = {
        [ID_KEY]: '4',
        [TYPENAME_KEY]: 'User',
      };
      const source = {
        [ID_KEY]: '__4',
        [TYPENAME_KEY]: '__User',
        name: 'Zuck',
        pet: {[REF_KEY]: 'beast'},
        pets: {[REFS_KEY]: ['beast']},
      };
      deepFreeze(source);
      RelayModernRecord.copyFields(source, sink);
      expect(sink).toEqual({
        [ID_KEY]: '4',
        [TYPENAME_KEY]: 'User',
        name: 'Zuck',
        pet: {[REF_KEY]: 'beast'},
        pets: {[REFS_KEY]: ['beast']},
      });
      // values are copied by reference not value
      expect(sink.pet).toBe(source.pet);
      expect(sink.pets).toBe(source.pets);
    });
  });

  describe('getLinkedRecordIDsByStorageKey()', () => {
    let record;

    beforeEach(() => {
      record = {
        [ID_KEY]: 4,
        name: 'Mark',
        enemies: null,
        hometown: {
          [REF_KEY]: 'mpk',
        },
        'friends{"first":10}': {
          [REFS_KEY]: ['beast', 'greg', null],
        },
      };
    });

    it('returns undefined when the link is unknown', () => {
      expect(
        RelayModernRecord.getLinkedRecordIDsByStorageKey(record, 'colors'),
      ).toBe(undefined);
    });

    it('returns null when the link is non-existent', () => {
      expect(
        RelayModernRecord.getLinkedRecordIDsByStorageKey(record, 'enemies'),
      ).toBe(null);
    });

    it('returns the linked record IDs when they exist', () => {
      expect(
        RelayModernRecord.getLinkedRecordIDsByStorageKey(
          record,
          'friends{"first":10}',
        ),
      ).toEqual(['beast', 'greg', null]);
    });

    it('throws if the field is actually a scalar', () => {
      expect(() =>
        RelayModernRecord.getLinkedRecordIDsByStorageKey(record, 'name'),
      ).toFailInvariant(
        'RelayModernRecord.getLinkedRecordIDsByStorageKey(): Expected `4.name` to contain ' +
          'an array of linked IDs, got `"Mark"`.',
      );
    });

    it('throws if the field is a singular link', () => {
      expect(() =>
        RelayModernRecord.getLinkedRecordIDsByStorageKey(record, 'hometown'),
      ).toFailInvariant(
        'RelayModernRecord.getLinkedRecordIDsByStorageKey(): Expected `4.hometown` to contain ' +
          'an array of linked IDs, got `{"__ref":"mpk"}`.',
      );
    });
  });

  describe('setLinkedRecordID()', () => {
    it('sets a link', () => {
      const record = {
        [ID_KEY]: '4',
      };
      RelayModernRecord.setLinkedRecordID(record, 'pet', 'beast');
      expect(RelayModernRecord.getLinkedRecordID(record, 'pet')).toBe('beast');
    });
  });

  describe('setLinkedRecordIDs()', () => {
    it('sets an array of links', () => {
      const record = {
        [ID_KEY]: '4',
      };
      const storageKey = 'friends{"first":10}';
      RelayModernRecord.setLinkedRecordIDs(record, storageKey, [
        'beast',
        'greg',
        null,
      ]);
      expect(
        RelayModernRecord.getLinkedRecordIDsByStorageKey(record, storageKey),
      ).toEqual(['beast', 'greg', null]);
    });
  });

  describe('getValue()', () => {
    let record;

    beforeEach(() => {
      record = {
        [ID_KEY]: 4,
        name: 'Mark',
        blockbusterMembership: null,
        hometown: {
          [REF_KEY]: 'mpk',
        },
        'friends{"first":10}': {
          [REFS_KEY]: ['beast', 'greg'],
        },
        favoriteColors: ['red', 'green', 'blue'],
        other: {
          customScalar: true,
        },
      };
    });

    it('returns a scalar value', () => {
      expect(RelayModernRecord.getValueByStorageKey(record, 'name')).toBe(
        'Mark',
      );
    });

    it('returns a (list) scalar value', () => {
      // Note that lists can be scalars too. The definition of scalar value is
      // "not a singular or plural link", and means that no query can traverse
      // into it.
      expect(
        RelayModernRecord.getValueByStorageKey(record, 'favoriteColors'),
      ).toEqual(['red', 'green', 'blue']);
    });

    it('returns a (custom object) scalar value', () => {
      // Objects can be scalars too. The definition of scalar value is
      // "not a singular or plural link", and means that no query can traverse
      // into it.
      expect(RelayModernRecord.getValueByStorageKey(record, 'other')).toEqual({
        customScalar: true,
      });
    });

    it('returns null when the field is non-existent', () => {
      expect(
        RelayModernRecord.getValueByStorageKey(record, 'blockbusterMembership'),
      ).toBe(null);
    });

    it('returns undefined when the field is unknown', () => {
      expect(RelayModernRecord.getValueByStorageKey(record, 'horoscope')).toBe(
        undefined,
      );
    });

    it('throws on encountering a linked record', () => {
      expect(() =>
        RelayModernRecord.getValueByStorageKey(record, 'hometown'),
      ).toFailInvariant(
        'RelayModernRecord.getValueByStorageKey(): Expected a scalar (non-link) value for ' +
          '`4.hometown` but found a linked record.',
      );
    });

    it('throws on encountering a plural linked record', () => {
      expect(() =>
        RelayModernRecord.getValueByStorageKey(record, 'friends{"first":10}'),
      ).toFailInvariant(
        'RelayModernRecord.getValueByStorageKey(): Expected a scalar (non-link) value for ' +
          '`4.friends{"first":10}` but found plural linked records.',
      );
    });
  });

  describe('freeze()', () => {
    it('prevents modification of records', () => {
      const record = RelayModernRecord.create('4', 'User');
      RelayModernRecord.freeze(record);
      expect(() => {
        RelayModernRecord.setValue(record, 'pet', 'Beast');
      }).toThrowTypeError();
    });
  });
});

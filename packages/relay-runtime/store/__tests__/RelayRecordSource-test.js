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

import type {RecordSourceJSON} from '../RelayStoreTypes';

const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const RelayModernRecord = require('../RelayModernRecord');
const RelayRecordSource = require('../RelayRecordSource');
const {RELAY_RESOLVER_RECORD_TYPENAME} = require('../RelayStoreUtils');

jest.mock('../../util/RelayFeatureFlags', () => ({
  FILTER_OUT_RELAY_RESOLVER_RECORDS: false,
}));

describe('RelayRecordSource', () => {
  describe('constructor', () => {
    it('creates an empty record source when no data is provided', () => {
      const source = new RelayRecordSource();
      expect(source.toJSON()).toEqual({});
      expect(source.size()).toBe(0);
    });

    it('initializes with provided records', () => {
      const data: RecordSourceJSON = {
        'user:1': {
          __id: 'user:1',
          __typename: 'User',
          name: 'Veronica Mars',
        },
        'user:2': {
          __id: 'user:2',
          __typename: 'User',
          name: 'Weevil Navarro',
        },
      };

      const source = new RelayRecordSource(data);
      expect(source.size()).toBe(2);
      expect(source.has('user:1')).toBe(true);
      expect(source.has('user:2')).toBe(true);
      expect(source.get('user:1')).toEqual({
        __id: 'user:1',
        __typename: 'User',
        name: 'Veronica Mars',
      });
      expect(source.get('user:2')).toEqual({
        __id: 'user:2',
        __typename: 'User',
        name: 'Weevil Navarro',
      });
      expect(source.toJSON()).toEqual(data);
    });
  });

  describe('basic operations', () => {
    let source;

    beforeEach(() => {
      source = new RelayRecordSource();
    });

    it('can set and get records', () => {
      const record = RelayModernRecord.create('test:1', 'Test');
      source.set('test:1', record);

      expect(source.get('test:1')).toBe(record);
      expect(source.has('test:1')).toBe(true);
      expect(source.size()).toBe(1);
    });

    it('can delete records', () => {
      const record = RelayModernRecord.create('test:1', 'Test');
      source.set('test:1', record);

      source.delete('test:1');

      expect(source.get('test:1')).toBe(null);
      expect(source.has('test:1')).toBe(true);
      expect(source.size()).toBe(1);
    });

    it('can remove records', () => {
      const record = RelayModernRecord.create('test:1', 'Test');
      source.set('test:1', record);

      source.remove('test:1');

      expect(source.get('test:1')).toBe(undefined);
      expect(source.has('test:1')).toBe(false);
      expect(source.size()).toBe(0);
    });

    it('can clear all records', () => {
      const record1 = RelayModernRecord.create('test:1', 'Test');
      const record2 = RelayModernRecord.create('test:2', 'Test');
      source.set('test:1', record1);
      source.set('test:2', record2);

      expect(source.size()).toBe(2);
      source.clear();
      expect(source.size()).toBe(0);
      expect(source.toJSON()).toEqual({});
    });

    it('returns correct record IDs', () => {
      const record1 = RelayModernRecord.create('test:1', 'Test');
      const record2 = RelayModernRecord.create('test:2', 'Test');
      source.set('test:1', record1);
      source.set('test:2', record2);

      const recordIDs = source.getRecordIDs();
      expect(recordIDs).toContain('test:1');
      expect(recordIDs).toContain('test:2');
      expect(recordIDs).toHaveLength(2);
    });
  });

  describe('static create method', () => {
    it('creates a new RelayRecordSource instance', () => {
      const data: RecordSourceJSON = {
        'user:1': {
          __id: 'user:1',
          __typename: 'User',
          name: 'Alice',
        },
      };

      const source = RelayRecordSource.create(data);
      expect(source).toBeInstanceOf(RelayRecordSource);
      expect(source.has('user:1')).toBe(true);
    });
  });

  describe('toJSON()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('returns the correct JSON representation', () => {
      RelayFeatureFlags.FILTER_OUT_RELAY_RESOLVER_RECORDS = false;

      const data: RecordSourceJSON = {
        'user:1': {
          __id: 'user:1',
          __typename: 'User',
          name: 'Alice',
        },
        'resolver:1': {
          __id: 'resolver:1',
          __typename: RELAY_RESOLVER_RECORD_TYPENAME,
          __resolverValue: 'value 1',
        },
      };

      const source = new RelayRecordSource(data);
      const recordSourceJSON = source.toJSON();

      expect(recordSourceJSON).toEqual({
        'user:1': {
          __id: 'user:1',
          __typename: 'User',
          name: 'Alice',
        },
        'resolver:1': {
          __id: 'resolver:1',
          __typename: RELAY_RESOLVER_RECORD_TYPENAME,
          __resolverValue: 'value 1',
        },
      });
    });

    it('filters out Relay Resolver records when FILTER_OUT_RELAY_RESOLVER_RECORDS is true', () => {
      RelayFeatureFlags.FILTER_OUT_RELAY_RESOLVER_RECORDS = true;

      const data: RecordSourceJSON = {
        'user:1': {
          __id: 'user:1',
          __typename: 'User',
          name: 'Alice',
        },
        'user:2': {
          __id: 'user:2',
          __typename: 'User',
          name: 'Bob',
        },
        'resolver:1': {
          __id: 'resolver:1',
          __typename: RELAY_RESOLVER_RECORD_TYPENAME,
          __resolverValue: 'value 1',
        },
        'resolver:2': {
          __id: 'resolver:2',
          __typename: RELAY_RESOLVER_RECORD_TYPENAME,
          __resolverValue: 'value 2',
        },
      };

      const source = new RelayRecordSource(data);
      const recordSourceJSON = source.toJSON();

      expect(recordSourceJSON).toEqual({
        'user:1': {
          __id: 'user:1',
          __typename: 'User',
          name: 'Alice',
        },
        'user:2': {
          __id: 'user:2',
          __typename: 'User',
          name: 'Bob',
        },
      });

      expect(recordSourceJSON['resolver:1']).toBeUndefined();
      expect(recordSourceJSON['resolver:2']).toBeUndefined();
    });
  });
});

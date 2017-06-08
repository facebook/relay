/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

jest.enableAutomock();

require('configureForRelayOSS');

jest.mock('warning');

const GraphQLRange = require('GraphQLRange');
const Relay = require('Relay');
const RelayQueryPath = require('RelayQueryPath');
const RelayRecordStore = require('RelayRecordStore');
const RelayRecordWriter = require('RelayRecordWriter');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayRecordStore', () => {
  const {getNode} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModules();

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  describe('getRecordState()', () => {
    it('returns "UNKNOWN" if an ID is unfetched', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      expect(store.getRecordState('4')).toBe('UNKNOWN');
    });

    it('returns "NONEXISTENT" if an ID is deleted', () => {
      const records = {'4': null};
      const store = new RelayRecordStore({records});
      expect(store.getRecordState('4')).toBe('NONEXISTENT');
    });

    it('returns "EXISTENT" if the record exists', () => {
      const records = {
        '4': {
          id: '4',
          __dataID__: '4',
        },
      };
      const store = new RelayRecordStore({records});
      expect(store.getRecordState('4')).toBe('EXISTENT');
    });

    it('prefers queued records over non-existent records', () => {
      const queuedRecord = {
        id: '4',
        __dataID__: '4',
      };
      const store = new RelayRecordStore({
        records: {},
        queuedRecords: {'4': queuedRecord},
      });
      expect(store.getRecordState('4')).toBe('EXISTENT');
    });

    it('prefers queued records over deleted records', () => {
      const queuedRecord = {
        id: '4',
        __dataID__: '4',
      };
      const store = new RelayRecordStore({
        records: {'4': null},
        queuedRecords: {'4': queuedRecord},
      });
      expect(store.getRecordState('4')).toBe('EXISTENT');
    });

    it('prefers queued records when they are deleted', () => {
      const record = {
        id: '4',
        __dataID__: '4',
      };
      const store = new RelayRecordStore({
        records: {'4': record},
        queuedRecords: {'4': null},
      });
      expect(store.getRecordState('4')).toBe('NONEXISTENT');
    });

    it('prefers queued records over cached records', () => {
      const record = {
        id: '4',
        __dataID__: '4',
      };
      const store = new RelayRecordStore({
        queuedRecords: {'4': record},
        records: {},
        cachedRecords: {'4': null},
      });
      expect(store.getRecordState('4')).toBe('EXISTENT');
    });

    it('prefers existing records over cached records', () => {
      const record = {
        id: '4',
        __dataID__: '4',
      };
      const store = new RelayRecordStore({
        records: {'4': record},
        cachedRecords: {'4': null},
      });
      expect(store.getRecordState('4')).toBe('EXISTENT');
    });

    it('falls back to cached records when necessary', () => {
      const record = {
        id: '4',
        __dataID__: '4',
      };
      const store = new RelayRecordStore({
        records: {},
        cachedRecords: {'4': record},
      });
      expect(store.getRecordState('4')).toBe('EXISTENT');
    });
  });

  describe('hasOptimisticUpdate', () => {
    it('returns true if record is queued', () => {
      const store = new RelayRecordStore({
        records: {},
        queuedRecords: {'4': {__dataID__: '4'}},
      });
      expect(store.hasOptimisticUpdate('4')).toBe(true);
    });

    it('returns false if record is not queued', () => {
      const store = new RelayRecordStore({
        records: {'4': {__dataID__: '4'}},
        queuedRecords: {},
      });
      expect(store.hasOptimisticUpdate('4')).toBe(false);
    });

    it('returns false if called on a non-queued record store', () => {
      const store = new RelayRecordStore({
        records: {'4': {__dataID__: '4'}},
      });
      expect(store.hasOptimisticUpdate('4')).toBe(false);
    });
  });

  describe('getPathToRecord', () => {
    it('returns undefined for refetchable records', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(
        Relay.QL`
        query {
          viewer {
            actor {
              id
            }
          }
        }
      `,
      );
      const actorID = '123';
      const path = RelayQueryPath.getPath(
        RelayQueryPath.create(query),
        query.getFieldByStorageKey('actor'),
        actorID,
      );
      writer.putRecord(actorID, 'Type', path);
      expect(store.getPathToRecord(actorID)).toBe(undefined);
    });

    it('returns the path for non-refetchable records', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      const query = getNode(
        Relay.QL`
        query {
          viewer {
            actor {
              address {
                city
              }
            }
          }
        }
      `,
      );
      const actorID = '123';
      const addressID = 'client:1';
      const path = RelayQueryPath.getPath(
        RelayQueryPath.getPath(
          RelayQueryPath.create(query),
          query.getFieldByStorageKey('actor'),
          actorID,
        ),
        query.getFieldByStorageKey('actor').getFieldByStorageKey('address'),
        addressID,
      );
      writer.putRecord(addressID, 'Type', path);
      expect(store.getPathToRecord(addressID)).toMatchPath(path);
    });
  });

  describe('getField()', () => {
    it('returns undefined if the record is undefined', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      expect(store.getField('4', 'name')).toBe(undefined);
    });

    it('returns null if the record is deleted', () => {
      const records = {'4': null};
      const store = new RelayRecordStore({records});
      expect(store.getField('4', 'name')).toBe(null);
    });

    it('returns undefined if the field is undefined', () => {
      const records = {'4': {}};
      const store = new RelayRecordStore({records});
      expect(store.getField('4', 'name')).toBe(undefined);
    });

    it('returns null if the field is deleted', () => {
      const records = {'4': {name: null}};
      const store = new RelayRecordStore({records});
      expect(store.getField('4', 'name')).toBe(null);
    });

    it('returns field values for scalar fields', () => {
      const records = {
        '4': {
          id: '4',
          __dataID__: '4',
          name: 'Zuck',
        },
      };
      const store = new RelayRecordStore({records});
      expect(store.getField('4', 'name')).toBe('Zuck');
      expect(store.getField('4', 'id')).toBe('4');

      const queuedStore = new RelayRecordStore({queuedRecords: records});
      expect(queuedStore.getField('4', 'name')).toBe('Zuck');
      expect(queuedStore.getField('4', 'id')).toBe('4');

      const cachedStore = new RelayRecordStore({cachedRecords: records});
      expect(cachedStore.getField('4', 'name')).toBe('Zuck');
      expect(cachedStore.getField('4', 'id')).toBe('4');
    });

    it('prefers fields from queued records', () => {
      const record = {
        id: '4',
        name: 'Zuck',
        __dataID__: '4',
      };
      const queuedRecord = {
        id: '4',
        name: 'Mark',
        __dataID__: '4',
      };
      const store = new RelayRecordStore({
        records: {'4': record},
        queuedRecords: {'4': queuedRecord},
      });
      expect(store.getField('4', 'name')).toBe('Mark');
    });

    it('prefers fields from existing records over cached records', () => {
      const record = {
        id: '4',
        name: 'Zuck',
        __dataID__: '4',
      };
      const cachedRecord = {
        id: '4',
        name: 'Mark',
        __dataID__: '4',
      };
      const store = new RelayRecordStore({
        records: {'4': record},
        cachedRecords: {'4': cachedRecord},
      });
      expect(store.getField('4', 'name')).toBe('Zuck');
    });

    it('falls through to existing records for fields not in the queued record', () => {
      const record = {
        id: '4',
        name: 'Zuck',
        __dataID__: '4',
      };
      const queuedRecord = {
        id: '4',
        __dataID__: '4',
      };
      const store = new RelayRecordStore({
        records: {'4': record},
        queuedRecords: {'4': queuedRecord},
      });
      expect(store.getField('4', 'name')).toBe('Zuck');
    });

    it('falls through to cached records for fields not in the existing record', () => {
      const record = {
        id: '4',
        __dataID__: '4',
      };
      const cachedRecord = {
        id: '4',
        name: 'Mark',
        __dataID__: '4',
      };
      const store = new RelayRecordStore({
        cachedRecords: {'4': cachedRecord},
        records: {'4': record},
      });
      expect(store.getField('4', 'name')).toBe('Mark');
    });
  });

  describe('getLinkedRecordID()', () => {
    it('throws if the data is an unexpected format', () => {
      const records = {
        story: {
          feedback: 'not an object',
        },
      };
      const store = new RelayRecordStore({records});
      expect(() => {
        store.getLinkedRecordID('story', 'feedback');
      }).toThrow();
    });

    it('returns undefined for unfetched objects', () => {
      const records = {
        '4': {
          id: '4',
          __dataID__: '4',
        },
      };
      const store = new RelayRecordStore({records});
      expect(store.getLinkedRecordID('4', 'address')).toBe(undefined);
    });

    it('returns null for deleted linked fields', () => {
      const records = {
        '4': {
          id: '4',
          __dataID__: '4',
          address: null,
        },
      };
      const store = new RelayRecordStore({records});
      expect(store.getLinkedRecordID('4', 'address')).toBe(null);
    });

    it('returns the data ID for linked fields', () => {
      const records = {
        '4': {
          id: '4',
          __dataID__: '4',
          address: {
            __dataID__: 'client:1',
          },
        },
        'client:1': {
          street: '1 Hacker Way',
        },
      };
      const store = new RelayRecordStore({records});
      expect(store.getLinkedRecordID('4', 'address')).toBe('client:1');
    });
  });

  describe('getLinkedRecordIDs()', () => {
    it('throws if the data is an unexpected format', () => {
      const records = {
        story: {
          actors: ['not an object'],
        },
      };
      const store = new RelayRecordStore({records});
      expect(() => {
        store.getLinkedRecordIDs('story', 'actors');
      }).toThrow();
    });

    it('returns undefined for unfetched fields', () => {
      const records = {
        '4': {
          id: '4',
          __dataID__: '4',
        },
      };
      const store = new RelayRecordStore({records});
      expect(store.getLinkedRecordIDs('4', 'actors')).toBe(undefined);
    });

    it('returns null for deleted linked fields', () => {
      const records = {
        '4': {
          id: '4',
          __dataID__: '4',
          actors: null,
        },
      };
      const store = new RelayRecordStore({records});
      expect(store.getLinkedRecordIDs('4', 'actors')).toBe(null);
    });

    it('returns an array of linked data IDs', () => {
      const records = {
        '4': {
          id: '4',
          __dataID__: '4',
          actors: [{__dataID__: 'item:1'}, {__dataID__: 'item:2'}],
        },
      };
      const store = new RelayRecordStore({records});
      expect(store.getLinkedRecordIDs('4', 'actors')).toEqual([
        'item:1',
        'item:2',
      ]);
    });
  });

  describe('getRangeMetadata()', () => {
    let mockRange, records;

    beforeEach(() => {
      mockRange = new GraphQLRange();
      records = {
        '4': {
          id: '4',
          __dataID__: '4',
          friends: {
            __dataID__: 'client:1',
          },
        },
        'client:1': {
          __range__: mockRange,
        },
        'edge:1': {
          __dataID__: 'edge:1',
          node: {
            __dataID__: 'node:1',
          },
        },
        'node:1': {
          __dataID__: 'node:1',
        },
      };
    });

    it('returns null/undefined if the connection ID is null-ish', () => {
      const store = new RelayRecordStore({records: {}});
      expect(store.getRangeMetadata(null, [])).toBe(null);
      expect(store.getRangeMetadata(undefined, [])).toBe(undefined);
    });

    it('returns undefined if the `edges` are unfetched', () => {
      delete records['client:1'].__range__;
      const store = new RelayRecordStore({records});
      const calls = [
        {name: 'first', value: '10'},
        {name: 'orderby', value: 'TOP_STORIES'},
      ];
      expect(store.getRangeMetadata('client:1', calls)).toBe(undefined);
    });

    it('throws if the range is null', () => {
      records['client:1'].__range__ = null;
      const store = new RelayRecordStore({records});
      store.getRangeMetadata('client:1', []);
      expect([
        'RelayRecordStore.getRangeMetadata(): Expected range to exist if ' +
          '`edges` has been fetched.',
      ]).toBeWarnedNTimes(1);
    });

    it('filters out edges without nodes', () => {
      records['node:1'] = null;
      const store = new RelayRecordStore({records});
      mockRange.retrieveRangeInfoForQuery.mockReturnValue({
        requestedEdgeIDs: ['edge:1'],
      });
      const metadata = store.getRangeMetadata('client:1', [
        {name: 'first', value: 1},
      ]);
      expect(metadata.filteredEdges).toEqual([]);
    });

    it('returns empty diff calls if range is already fetched', () => {
      const diffCalls = [];
      mockRange.retrieveRangeInfoForQuery.mockReturnValue({diffCalls});
      const store = new RelayRecordStore({records});
      const rangeInfo = store.getRangeMetadata('client:1', []);
      expect(rangeInfo.diffCalls).toEqual([]);
      expect(rangeInfo.filterCalls).toEqual([]);
      expect(rangeInfo.filteredEdges).toEqual([]);
    });

    it('returns diff/filter calls and requested edges from the range', () => {
      mockRange.retrieveRangeInfoForQuery.mockReturnValue({
        requestedEdgeIDs: ['edge:1'],
        diffCalls: [
          {name: 'first', value: '1'},
          {name: 'after', value: 'edge:1'},
        ],
      });
      const store = new RelayRecordStore({records});
      const rangeInfo = store.getRangeMetadata('client:1', [
        {name: 'orderby', value: ['TOP_STORIES']},
        {name: 'first', value: 2},
      ]);
      expect(mockRange.retrieveRangeInfoForQuery).toBeCalled();
      expect(rangeInfo.diffCalls).toEqual([
        {name: 'orderby', value: ['TOP_STORIES']},
        {name: 'first', value: '1'},
        {name: 'after', value: 'edge:1'},
      ]);
      expect(rangeInfo.filteredEdges).toEqual([
        {
          edgeID: 'edge:1',
          nodeID: 'node:1',
        },
      ]);
      expect(rangeInfo.filterCalls).toEqual([
        {name: 'orderby', value: ['TOP_STORIES']},
      ]);
    });
  });

  describe('getRangeFilterCalls', () => {
    it('returns null/undefined for deleted/unfetched records', () => {
      const records = {
        deleted: null,
        notARange: {},
      };
      const store = new RelayRecordStore({records});

      expect(store.getRangeFilterCalls('unfetched')).toBe(undefined);
      expect(store.getRangeFilterCalls('deleted')).toBe(null);
      expect(store.getRangeFilterCalls('notARange')).toBe(undefined);
    });

    it('returns filter calls for range records', () => {
      const calls = [
        {
          name: 'orderby',
          value: 'TOP_STORIES',
        },
      ];
      const records = {
        'client:1': {
          __range__: new GraphQLRange(),
          __filterCalls__: calls,
        },
      };
      const store = new RelayRecordStore({records});

      expect(store.getRangeFilterCalls('client:1')).toEqual(calls);
    });
  });

  describe('getConnectionIDsForRecord', () => {
    it('returns null for non-existent records', () => {
      const records = {
        deleted: null,
      };
      const store = new RelayRecordStore({records});
      expect(store.getConnectionIDsForRecord('unfetched')).toBe(null);
      expect(store.getConnectionIDsForRecord('deleted')).toBe(null);
    });

    it('returns null if the record is not in a connection', () => {
      const records = {
        '1': {
          __dataID__: '1',
        },
      };
      const store = new RelayRecordStore({records});
      expect(store.getConnectionIDsForRecord('1')).toBe(null);
    });

    it('returns the connection ids containing the node', () => {
      const records = {
        '1': {
          __dataID__: '1',
        },
        'range:1': {
          __dataID__: 'range:1',
        },
        'range:2': {
          __dataID__: 'range:2',
        },
      };
      const nodeRangeMap = {
        '1': {
          'range:1': true,
          'range:2': true,
        },
      };
      const store = new RelayRecordStore({records}, null, nodeRangeMap);
      const writer = new RelayRecordWriter(records, {}, false, nodeRangeMap);
      expect(store.getConnectionIDsForRecord('1')).toEqual([
        'range:1',
        'range:2',
      ]);

      // node/connection link is cleared when the node is deleted
      writer.deleteRecord('1');
      expect(store.getConnectionIDsForRecord('1')).toEqual(null);
    });
  });

  describe('getConnectionIDsForField()', () => {
    it('returns null/undefined for non-existent records', () => {
      const records = {
        deleted: null,
      };
      const store = new RelayRecordStore({records});
      expect(store.getConnectionIDsForField('unfetched', 'news_feed')).toBe(
        undefined,
      );
      expect(store.getConnectionIDsForField('deleted', 'news_feed')).toBe(null);
    });

    it('returns undefined if the connection is unfetched', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      const writer = new RelayRecordWriter(records, {}, false);
      writer.putRecord('1', 'Type');
      expect(store.getConnectionIDsForField('1', 'news_feed')).toBe(undefined);
    });

    it('returns all fetched connections', () => {
      const records = {
        '1': {
          __dataID__: '1',
          photos: {
            __dataID__: '2',
          },
          'photos{orderby:"likes"}': {
            __dataID__: '3',
          },
        },
      };
      const store = new RelayRecordStore({records});
      expect(store.getConnectionIDsForField('1', 'photos')).toEqual(['2', '3']);
    });
  });

  describe('getRootCallID', () => {
    it('returns undefined if unfetched and not cached', () => {
      const records = {};
      const store = new RelayRecordStore({records});
      expect(store.getDataID('viewer')).toBe(undefined);
    });

    it('returns cached id if unfetched', () => {
      const id = 'client:1';
      const cachedRootCallMap = {viewer: {'': id}};
      const rootCallMap = {};
      const records = {};

      const store = new RelayRecordStore(
        {records},
        {rootCallMap, cachedRootCallMap},
      );
      expect(store.getDataID('viewer')).toBe(id);
    });

    it('returns fetched id over cached id', () => {
      const cachedID = 'client:cached';
      const cachedRootCallMap = {viewer: {'': cachedID}};
      const id = 'client:fetched';
      const rootCallMap = {viewer: {'': id}};
      const records = {};

      const store = new RelayRecordStore(
        {records},
        {rootCallMap, cachedRootCallMap},
      );
      expect(store.getDataID('viewer')).toBe(id);
    });
  });

  describe('removeRecord', () => {
    it('completely removes the data from the store', () => {
      const cachedRecords = {a: {__dataID__: 'a'}};
      const queuedRecords = {a: {__dataID__: 'a'}};
      const records = {a: {__dataID__: 'a'}};
      const nodeConnectionMap = {
        a: {'client:1': true},
      };
      const store = new RelayRecordStore(
        {cachedRecords, queuedRecords, records},
        null,
        nodeConnectionMap,
      );
      expect(cachedRecords.hasOwnProperty('a')).toBe(true);
      expect(queuedRecords.hasOwnProperty('a')).toBe(true);
      expect(records.hasOwnProperty('a')).toBe(true);
      expect(nodeConnectionMap.hasOwnProperty('a')).toBe(true);
      store.removeRecord('a');
      expect(cachedRecords.hasOwnProperty('a')).toBe(false);
      expect(queuedRecords.hasOwnProperty('a')).toBe(false);
      expect(records.hasOwnProperty('a')).toBe(false);
      expect(nodeConnectionMap.hasOwnProperty('a')).toBe(false);
    });
  });

  describe('hasFragmentData()', () => {
    it('returns true when a fragment has been marked as resolved', () => {
      const records = {
        a: {__resolvedFragmentMap__: {fragID: true}},
      };
      const store = new RelayRecordStore({records});
      expect(store.hasFragmentData('a', 'fragID')).toBe(true);
    });

    it('returns false when a fragment has not been marked as resolved', () => {
      const records = {
        // No resolved fragment map at all
        a: {},
        // Map does not contain a key corresponding to our fragment
        b: {__resolvedFragmentMap__: {otherFragID: true}},
      };
      const store = new RelayRecordStore({records});
      expect(store.hasFragmentData('a', 'fragID')).toBe(false);
      expect(store.hasFragmentData('b', 'fragID')).toBe(false);
    });
  });
});

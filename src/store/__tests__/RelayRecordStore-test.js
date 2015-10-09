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

jest.mock('warning');

var GraphQLRange = require('GraphQLRange');
var Relay = require('Relay');
var RelayQueryPath = require('RelayQueryPath');
var RelayRecordStatusMap = require('RelayRecordStatusMap');

describe('RelayRecordStore', () => {
  var RelayRecordStore;

  var {getNode} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModuleRegistry();

    RelayRecordStore = require('RelayRecordStore');

    jest.addMatchers(RelayTestUtils.matchers);
  });

  describe('getRecordState()', () => {
    it('returns "UNKNOWN" if an ID is unfetched', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      expect(store.getRecordState('4')).toBe('UNKNOWN');
    });

    it('returns "NONEXISTENT" if an ID is deleted', () => {
      var records = {'4': null};
      var store = new RelayRecordStore({records});
      expect(store.getRecordState('4')).toBe('NONEXISTENT');
    });

    it('returns "EXISTENT" if the record exists', () => {
      var records = {
        '4': {
          id: '4',
          __dataID__: '4',
        },
      };
      var store = new RelayRecordStore({records});
      expect(store.getRecordState('4')).toBe('EXISTENT');
    });

    it('prefers queued records over non-existent records', () => {
      var queuedRecord = {
        id: '4',
        __dataID__: '4',
      };
      var store = new RelayRecordStore({
        records: {},
        queuedRecords: {'4': queuedRecord},
      });
      expect(store.getRecordState('4')).toBe('EXISTENT');
    });

    it('prefers queued records over deleted records', () => {
      var queuedRecord = {
        id: '4',
        __dataID__: '4',
      };
      var store = new RelayRecordStore({
        records: {'4': null},
        queuedRecords: {'4': queuedRecord},
      });
      expect(store.getRecordState('4')).toBe('EXISTENT');
    });

    it('prefers queued records when they are deleted', () => {
      var record = {
        id: '4',
        __dataID__: '4',
      };
      var store = new RelayRecordStore({
        records: {'4': record},
        queuedRecords: {'4': null},
      });
      expect(store.getRecordState('4')).toBe('NONEXISTENT');
    });

    it('prefers queued records over cached records', () => {
      var record = {
        id: '4',
        __dataID__: '4',
      };
      var store = new RelayRecordStore({
        queuedRecords: {'4': record},
        records: {},
        cachedRecords: {'4': null},
      });
      expect(store.getRecordState('4')).toBe('EXISTENT');
    });

    it('prefers existing records over cached records', () => {
      var record = {
        id: '4',
        __dataID__: '4',
      };
      var store = new RelayRecordStore({
        records: {'4': record},
        cachedRecords: {'4': null},
      });
      expect(store.getRecordState('4')).toBe('EXISTENT');
    });

    it('falls back to cached records when necessary', () => {
      var record = {
        id: '4',
        __dataID__: '4',
      };
      var store = new RelayRecordStore({
        records: {},
        cachedRecords: {'4': record},
      });
      expect(store.getRecordState('4')).toBe('EXISTENT');
    });
  });

  describe('hasOptimisticUpdate', () => {
    it('returns true if record is queued', () => {
      var store = new RelayRecordStore({
        records: {},
        queuedRecords: {'4': {__dataID__: '4'}},
      });
      expect(store.hasOptimisticUpdate('4')).toBe(true);
    });

    it('returns false if record is not queued', () => {
      var store = new RelayRecordStore({
        records: {'4': {__dataID__: '4'}},
        queuedRecords: {},
      });
      expect(store.hasOptimisticUpdate('4')).toBe(false);
    });

    it('throws if called on a non-queued record store', () => {
      var store = new RelayRecordStore({
        records: {'4': {__dataID__: '4'}},
      });
      expect(() => {
        store.hasOptimisticUpdate('4');
      }).toFailInvariant(
        'RelayRecordStore.hasOptimisticUpdate(): Optimistic updates require ' +
        'queued records.'
      );
    });
  });

  describe('hasMutationError()', () => {
    it('returns true when an error is set', () => {
      var queuedRecords = {
        '1': {
          __dataID__: '1',
          __status__: RelayRecordStatusMap.setErrorStatus(0, true),
        },
      };
      var store = new RelayRecordStore({queuedRecords});
      expect(store.hasMutationError('1')).toBe(true);
    });

    it('returns false when an error is unset or record does not exist', () => {
      var queuedRecords = {
        '1': {
          __dataID__: '1',
          __status__: 0,
        },
      };
      var store = new RelayRecordStore({queuedRecords});
      expect(store.hasMutationError('1')).toBe(false);
      expect(store.hasMutationError('2')).toBe(false);

      store = new RelayRecordStore({records: {}});
      expect(store.hasMutationError('1')).toBe(false);
    });
  });

  describe('setMutationErrorStatus', () => {
    it('throws if queuedRecords are not available', () => {
      var records = {
        '1': {
          __dataID__: '1',
        },
      };
      var store = new RelayRecordStore({records});
      expect(() => {
        store.setMutationErrorStatus('1', true);
      }).toFailInvariant(
        'RelayRecordStore.setMutationErrorStatus(): Can only set the ' +
        'mutation status of queued records.'
      );
    });

    it('throws if the queued record does not exist', () => {
      var store = new RelayRecordStore({queuedRecords: {}});
      expect(() => {
        store.setMutationErrorStatus('1', true);
      }).toFailInvariant(
        'RelayRecordStore.setMutationErrorStatus(): Expected record `1` to ' +
        'exist before settings its mutation error status.'
      );
    });

    it('updates the error status for existing queued records', () => {
      var queuedRecords = {
        '1': {
          __dataID__: '1',
        },
      };
      var store = new RelayRecordStore({queuedRecords});
      store.setMutationErrorStatus('1', true);
      expect(store.hasMutationError('1')).toBe(true);
      store.setMutationErrorStatus('1', false);
      expect(store.hasMutationError('1')).toBe(false);
      store.setMutationErrorStatus('1', true);
      expect(store.hasMutationError('1')).toBe(true);
      store.deleteRecord('1');
      expect(store.hasMutationError('1')).toBe(false);
    });
  });

  describe('getPathToRecord', () => {
    it('returns undefined for refetchable records', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          viewer {
            actor {
              id
            }
          }
        }
      `);
      var actorID = '123';
      var path = new RelayQueryPath(query);
      path = path.getPath(query.getFieldByStorageKey('actor'), actorID);
      store.putRecord(actorID, path);
      expect(store.getPathToRecord(actorID)).toBe(undefined);
    });

    it('returns the path for non-refetchable records', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      var query = getNode(Relay.QL`
        query {
          viewer {
            actor {
              address {
                city
              }
            }
          }
        }
      `);
      var actorID = '123';
      var addressID = 'client:1';
      var path = new RelayQueryPath(query);
      path = path.getPath(query.getFieldByStorageKey('actor'), actorID);
      path = path.getPath(
        query.getFieldByStorageKey('actor').getFieldByStorageKey('address'),
        addressID
      );
      store.putRecord(addressID, 'Type', path);
      expect(store.getPathToRecord(addressID)).toMatchPath(path);
    });
  });

  describe('getField()', () => {
    it('returns undefined if the record is undefined', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      expect(store.getField('4', 'name')).toBe(undefined);
    });

    it('returns null if the record is deleted', () => {
      var records = {'4': null};
      var store = new RelayRecordStore({records});
      expect(store.getField('4', 'name')).toBe(null);
    });

    it('returns undefined if the field is undefined', () => {
      var records = {'4': {}};
      var store = new RelayRecordStore({records});
      expect(store.getField('4', 'name')).toBe(undefined);
    });

    it('returns null if the field is deleted', () => {
      var records = {'4': {'name': null}};
      var store = new RelayRecordStore({records});
      expect(store.getField('4', 'name')).toBe(null);
    });

    it('returns field values for scalar fields', () => {
      var records = {
        '4': {
          id: '4',
          __dataID__: '4',
          name: 'Zuck',
        },
      };
      var store = new RelayRecordStore({records});
      expect(store.getField('4', 'name')).toBe('Zuck');
      expect(store.getField('4', 'id')).toBe('4');

      var queuedStore = new RelayRecordStore({queuedRecords: records});
      expect(queuedStore.getField('4', 'name')).toBe('Zuck');
      expect(queuedStore.getField('4', 'id')).toBe('4');

      var cachedStore = new RelayRecordStore({cachedRecords: records});
      expect(cachedStore.getField('4', 'name')).toBe('Zuck');
      expect(cachedStore.getField('4', 'id')).toBe('4');
    });

    it('prefers fields from queued records', () => {
      var record = {
        id: '4',
        name: 'Zuck',
        __dataID__: '4',
      };
      var queuedRecord = {
        id: '4',
        name: 'Mark',
        __dataID__: '4',
      };
      var store = new RelayRecordStore({
        records: {'4': record},
        queuedRecords: {'4': queuedRecord},
      });
      expect(store.getField('4', 'name')).toBe('Mark');
    });

    it('prefers fields from existing records over cached records', () => {
      var record = {
        id: '4',
        name: 'Zuck',
        __dataID__: '4',
      };
      var cachedRecord = {
        id: '4',
        name: 'Mark',
        __dataID__: '4',
      };
      var store = new RelayRecordStore({
        records: {'4': record},
        cachedRecords: {'4': cachedRecord},
      });
      expect(store.getField('4', 'name')).toBe('Zuck');
    });

    it('falls through to existing records for fields not in the queued record', () => {
      var record = {
        id: '4',
        name: 'Zuck',
        __dataID__: '4',
      };
      var queuedRecord = {
        id: '4',
        __dataID__: '4',
      };
      var store = new RelayRecordStore({
        records: {'4': record},
        queuedRecords: {'4': queuedRecord},
      });
      expect(store.getField('4', 'name')).toBe('Zuck');
    });

    it('falls through to cached records for fields not in the existing record', () => {
      var record = {
        id: '4',
        __dataID__: '4',
      };
      var cachedRecord = {
        id: '4',
        name: 'Mark',
        __dataID__: '4',
      };
      var store = new RelayRecordStore({
        cachedRecords: {'4': cachedRecord},
        records: {'4': record},
      });
      expect(store.getField('4', 'name')).toBe('Mark');
    });
  });

  describe('getLinkedRecordID()', () => {
    it('throws if the data is an unexpected format', () => {
      var records = {
        story: {
          feedback: 'not an object'
        }
      };
      var store = new RelayRecordStore({records});
      expect(() => {
        store.getLinkedRecordID('story', 'feedback');
      }).toThrow();
    });

    it('returns undefined for unfetched objects', () => {
      var records = {
        '4': {
          id: '4',
          __dataID__: '4',
        }
      };
      var store = new RelayRecordStore({records});
      expect(store.getLinkedRecordID('4', 'address')).toBe(undefined);
    });

    it('returns null for deleted linked fields', () => {
      var records = {
        '4': {
          id: '4',
          __dataID__: '4',
          address: null
        },
      };
      var store = new RelayRecordStore({records});
      expect(store.getLinkedRecordID('4', 'address')).toBe(null);
    });

    it('returns the data ID for linked fields', () => {
      var records = {
        '4': {
          id: '4',
          __dataID__: '4',
          address: {
            __dataID__: 'client:1',
          }
        },
        'client:1': {
          street: '1 Hacker Way',
        },
      };
      var store = new RelayRecordStore({records});
      expect(store.getLinkedRecordID('4', 'address')).toBe('client:1');
    });
  });

  describe('getLinkedRecordIDs()', () => {
    it('throws if the data is an unexpected format', () => {
      var records = {
        'story': {
          actors: ['not an object']
        }
      };
      var store = new RelayRecordStore({records});
      expect(() => {
        store.getLinkedRecordIDs('story', 'actors');
      }).toThrow();
    });

    it('returns undefined for unfetched fields', () => {
      var records = {
        '4': {
          id: '4',
          __dataID__: '4'
        }
      };
      var store = new RelayRecordStore({records});
      expect(store.getLinkedRecordIDs('4', 'actors')).toBe(undefined);
    });

    it('returns null for deleted linked fields', () => {
      var records = {
        '4': {
          id: '4',
          __dataID__: '4',
          actors: null
        }
      };
      var store = new RelayRecordStore({records});
      expect(store.getLinkedRecordIDs('4', 'actors')).toBe(null);
    });

    it('returns an array of linked data IDs', () => {
      var records = {
        '4': {
          id: '4',
          __dataID__: '4',
          actors: [
            {__dataID__: 'item:1'},
            {__dataID__: 'item:2'},
          ]
        }
      };
      var store = new RelayRecordStore({records});
      expect(store.getLinkedRecordIDs('4', 'actors')).toEqual([
        'item:1',
        'item:2'
      ]);
    });
  });

  describe('getRangeMetadata()', () => {
    var mockRange, records;

    beforeEach(() => {
      mockRange = new GraphQLRange();
      records = {
        '4': {
          id: '4',
          __dataID__: '4',
          'friends': {
            __dataID__: 'client:1'
          },
        },
        'client:1': {
          __range__: mockRange,
        },
        'edge:1': {
          __dataID__: 'edge:1',
          node: {
            __dataID__: 'node:1'
          }
        },
        'node:1': {
          __dataID__: 'node:1',
        },
      };
    });

    it('returns null/undefined if the connection ID is null-ish', () => {
      var store = new RelayRecordStore({records: {}});
      expect(store.getRangeMetadata(null, [])).toBe(null);
      expect(store.getRangeMetadata(undefined, [])).toBe(undefined);
    });

    it('returns undefined if the `edges` are unfetched', () => {
      delete records['client:1'].__range__;
      var store = new RelayRecordStore({records});
      var calls = [
        {name: 'first', value: '10'},
        {name: 'orderby', value: 'TOP_STORIES'}
      ];
      expect(store.getRangeMetadata('client:1', calls)).toBe(undefined);
    });

    it('throws if the range is null', () => {
      records['client:1'].__range__ = null;
      var store = new RelayRecordStore({records});
      store.getRangeMetadata('client:1', []);
      expect([
        'RelayRecordStore.getRangeMetadata(): Expected range to exist if ' +
        '`edges` has been fetched.'
      ]).toBeWarnedNTimes(1);
    });

    it('filters out edges without nodes', () => {
      records['node:1'] = null;
      var store = new RelayRecordStore({records});
      mockRange.retrieveRangeInfoForQuery.mockReturnValue({
        requestedEdgeIDs: ['edge:1'],
      });
      var metadata = store.getRangeMetadata(
        'client:1',
        [{name: 'first', value: 1}]
      );
      expect(metadata.requestedEdges).toEqual([]);
    });

    it('returns empty diff calls if range is already fetched', () => {
      var diffCalls = [];
      mockRange.retrieveRangeInfoForQuery.mockReturnValue({diffCalls});
      var store = new RelayRecordStore({records});
      var rangeInfo = store.getRangeMetadata('client:1', []);
      expect(rangeInfo.diffCalls).toEqual([]);
      expect(rangeInfo.filterCalls).toEqual([]);
      expect(rangeInfo.requestedEdges).toEqual([]);
    });

    it('returns diff/filter calls and requested edges from the range', () => {
      mockRange.retrieveRangeInfoForQuery.mockReturnValue({
        requestedEdgeIDs: ['edge:1'],
        diffCalls: [
          {name: 'first', value: '1'},
          {name: 'after', value: 'edge:1'},
        ]
      });
      var store = new RelayRecordStore({records});
      var rangeInfo = store.getRangeMetadata('client:1', [
        {name: 'orderby', value: ['TOP_STORIES']},
        {name: 'first', value: 2},
      ]);
      expect(mockRange.retrieveRangeInfoForQuery).toBeCalled();
      expect(rangeInfo.diffCalls).toEqual([
        {name: 'orderby', value: ['TOP_STORIES']},
        {name: 'first', value: '1'},
        {name: 'after', value: 'edge:1'},
      ]);
      expect(rangeInfo.requestedEdges).toEqual([{
        edgeID: 'edge:1',
        nodeID: 'node:1'
      }]);
      expect(rangeInfo.filterCalls).toEqual([
        {name: 'orderby', value: ['TOP_STORIES']}
      ]);
    });
  });

  describe('getRangeFilterCalls', () => {
    it('returns null/undefined for deleted/unfetched records', () => {
      var records = {
        deleted: null,
        notARange: {},
      };
      var store = new RelayRecordStore({records});

      expect(store.getRangeFilterCalls('unfetched')).toBe(undefined);
      expect(store.getRangeFilterCalls('deleted')).toBe(null);
      expect(store.getRangeFilterCalls('notARange')).toBe(undefined);
    });

    it('returns filter calls for range records', () => {
      var calls = [
        {
          name: 'orderby',
          value: 'TOP_STORIES'
        }
      ];
      var records = {
        'client:1': {
          __range__: new GraphQLRange(),
          __filterCalls__: calls,
        },
      };
      var store = new RelayRecordStore({records});

      expect(store.getRangeFilterCalls('client:1')).toEqual(calls);
    });
  });

  describe('getConnectionIDsForRecord', () => {
    it('returns null for non-existent records', () => {
      var records = {
        deleted: null,
      };
      var store = new RelayRecordStore({records});
      expect(store.getConnectionIDsForRecord('unfetched')).toBe(null);
      expect(store.getConnectionIDsForRecord('deleted')).toBe(null);
    });

    it('returns null if the record is not in a connection', () => {
      var records = {
        '1': {
          __dataID__: '1'
        },
      };
      var store = new RelayRecordStore({records});
      expect(store.getConnectionIDsForRecord('1')).toBe(null);
    });

    it('returns the connection ids containing the node', () => {
      var records = {
        '1': {
          __dataID__: '1'
        },
        'range:1': {
          __dataID__: 'range:1',
        },
        'range:2': {
          __dataID__: 'range:2',
        },
      };
      var nodeRangeMap = {
        '1': {
          'range:1': true,
          'range:2': true,
        },
      };
      var store = new RelayRecordStore({records}, null, nodeRangeMap);
      expect(store.getConnectionIDsForRecord('1')).toEqual([
        'range:1',
        'range:2'
      ]);

      // node/connection link is cleared when the node is deleted
      store.deleteRecord('1');
      expect(store.getConnectionIDsForRecord('1')).toEqual(null);
    });
  });

  describe('getConnectionIDsForField()', () => {
    it('returns null/undefined for non-existent records', () => {
      var records = {
        'deleted': null,
      };
      var store = new RelayRecordStore({records});
      expect(store.getConnectionIDsForField('unfetched', 'news_feed')).toBe(
        undefined
      );
      expect(store.getConnectionIDsForField('deleted', 'news_feed')).toBe(null);
    });

    it('returns undefined if the connection is unfetched', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      store.putRecord('1', 'Type');
      expect(store.getConnectionIDsForField('1', 'news_feed')).toBe(undefined);
    });

    it('returns all fetched connections', () => {
      var records = {
        '1': {
          __dataID__: '1',
          'photos': {
            __dataID__: '2'
          },
          'photos.orderby(likes)': {
            __dataID__: '3'
          }
        },
      };
      var store = new RelayRecordStore({records});
      expect(store.getConnectionIDsForField('1', 'photos')).toEqual(['2', '3']);
    });
  });

  describe('getRootCallID', () => {
    it('returns undefined if unfetched and not cached', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      expect(store.getDataID('viewer')).toBe(undefined);
    });

    it('returns cached id if unfetched', () => {
      var id = 'client:viewer';
      var cachedRootCallMap = {viewer: {'': id}};
      var rootCallMap = {};
      var records = {};

      var store = new RelayRecordStore(
        {records},
        {rootCallMap, cachedRootCallMap}
      );
      expect(store.getDataID('viewer')).toBe(id);
    });

    it('returns fetched id over cached id', () => {
      var cachedID = 'client:cached';
      var cachedRootCallMap = {viewer: {'': cachedID}};
      var id = 'client:fetched';
      var rootCallMap = {viewer: {'': id}};
      var records = {};

      var store = new RelayRecordStore(
        {records},
        {rootCallMap, cachedRootCallMap}
      );
      expect(store.getDataID('viewer')).toBe(id);
    });
  });

  describe('removeRecord', () => {
    it('completely removes the data from the store', () => {
      var cachedRecords = {'a': {__dataID__: 'a'}};
      var queuedRecords = {'a': {__dataID__: 'a'}};
      var records = {'a': {__dataID__: 'a'}};
      var store = new RelayRecordStore({cachedRecords, queuedRecords, records});
      expect(cachedRecords.hasOwnProperty('a')).toBe(true);
      expect(queuedRecords.hasOwnProperty('a')).toBe(true);
      expect(records.hasOwnProperty('a')).toBe(true);
      store.removeRecord('a');
      expect(cachedRecords.hasOwnProperty('a')).toBe(false);
      expect(queuedRecords.hasOwnProperty('a')).toBe(false);
      expect(records.hasOwnProperty('a')).toBe(false);
    });
  });
});

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

jest.autoMockOff();

var GraphQLRange = require('GraphQLRange');
var RelayConnectionInterface = require('RelayConnectionInterface');
var RelayMockCacheManager = require('RelayMockCacheManager');
var RelayRecordStatusMap = require('RelayRecordStatusMap');
var RelayTestUtils = require('RelayTestUtils');
var {APPEND, PREPEND, REMOVE} = require('GraphQLMutatorConstants');

describe('RelayRecordStore', () => {
  var RelayRecordStore;

  var HAS_NEXT_PAGE, HAS_PREV_PAGE;

  beforeEach(() => {
    jest.resetModuleRegistry();

    RelayRecordStore = require('RelayRecordStore');

    ({HAS_NEXT_PAGE, HAS_PREV_PAGE} = RelayConnectionInterface);

    jest.addMatchers(RelayTestUtils.matchers);
  });

  describe('getDataID()', () => {
    it('returns undefined for unknown root call ids', () => {
      var store = new RelayRecordStore({records: {}});
      expect(store.getDataID('username', 'zuck')).toBe(undefined);
    });
    it('returns id for node/nodes root call ids', () => {
      var store = new RelayRecordStore({records: {}});
      expect(store.getDataID('node', '4')).toBe('4');
      expect(store.getDataID('nodes', '4')).toBe('4');
    });
  });

  describe('putDataID()', () => {
    it('sets root call ids', () => {
      var cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      var store = new RelayRecordStore({records: {}}, null, null, cache);
      store.putDataID('username', 'zuck', 'node:4');
      expect(store.getDataID('username', 'zuck')).toBe('node:4');
      expect(cache.writeRootCall).toBeCalledWith('username', 'zuck', 'node:4');
    });
    it('does not set ids for node/nodes root calls', () => {
      var cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      var rootCallMap = {};
      var store =
        new RelayRecordStore({records: {}}, {rootCallMap}, null, cache);
      store.putDataID('node', '4', 'node:4');
      store.putDataID('nodes', '4', 'node:4');
      expect(rootCallMap).toEqual({});
      expect(cache.writeRootCall).not.toBeCalled();
    });
  });

  describe('deleteRecord()', () => {
    it('sets records to null', () => {
      var cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      var records = {
        '1': {
          __dataID__: '1'
        },
      };
      var store = new RelayRecordStore({records}, null, null, cache);
      store.deleteRecord('1');
      expect(store.getRecordState('1')).toBe('NONEXISTENT');
      expect(cache.writeNode).toBeCalledWith('1', null);
      store.deleteRecord('2');
      expect(store.getRecordState('2')).toBe('NONEXISTENT');
      expect(cache.writeNode).toBeCalledWith('2', null);
    });

    it('writes to queued data if available, otherwise base data', () => {
      var cachedRecords = {
        a: {__dataID__: 'a'},
        b: {__dataID__: 'b'},
      };
      var records = {};
      var queuedRecords = {};
      var recordStore = new RelayRecordStore({cachedRecords, records});
      var queuedStore = new RelayRecordStore(
        {cachedRecords, records, queuedRecords},
        undefined,
        undefined,
        undefined,
        'mutationID',
      );

      queuedStore.deleteRecord('a');
      expect(recordStore.getRecordState('a')).toBe('EXISTENT');
      expect(queuedStore.getRecordState('a')).toBe('NONEXISTENT');

      recordStore.deleteRecord('b');
      expect(recordStore.getRecordState('b')).toBe('NONEXISTENT');
      expect(queuedStore.getRecordState('b')).toBe('NONEXISTENT');
    });
  });

  describe('putRecord()', () => {
    it('creates records', () => {
      var cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      var records = {};
      var store = new RelayRecordStore({records}, null, null, cache);
      store.putRecord('1', 'Type');
      expect(store.getRecordState('1')).toBe('EXISTENT');
      expect(store.getType('1')).toBe('Type');
      expect(cache.writeField).toBeCalledWith('1', '__dataID__', '1', 'Type');
    });

    it('writes to queued data if available, otherwise base data', () => {
      var cachedRecords = {};
      var records = {};
      var queuedRecords = {};
      var recordStore = new RelayRecordStore({cachedRecords, records});
      var queuedStore = new RelayRecordStore(
        {cachedRecords, records, queuedRecords},
        undefined,
        undefined,
        undefined,
        'mutationID',
      );

      recordStore.putRecord('a', 'Type');
      expect(recordStore.getRecordState('a')).toBe('EXISTENT');
      expect(queuedStore.getRecordState('a')).toBe('EXISTENT');

      queuedStore.putRecord('b', 'Type');
      expect(recordStore.getRecordState('b')).toBe('UNKNOWN');
      expect(queuedStore.getRecordState('b')).toBe('EXISTENT');
      expect(queuedRecords['b'].__status__)
        .toBe(RelayRecordStatusMap.setOptimisticStatus(0, true));
    });
  });

  describe('putField()', () => {
    it('throws if the record does not exist', () => {
      var store = new RelayRecordStore({records: {}});
      expect(() => {
        store.putField('1', 'name', null);
      }).toFailInvariant(
        'RelayRecordStore.putField(): Expected record `1` to exist before ' +
        'writing field `name`.'
      );
    });

    it('writes scalar fields', () => {
      var cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      var store = new RelayRecordStore({records: {}}, null, null, cache);
      store.putRecord('1', 'Type');
      store.putField('1', 'name', null);
      expect(store.getField('1', 'name')).toBe(null);
      expect(cache.writeField).toBeCalledWith('1', 'name', null, 'Type');
      store.putField('1', 'name', undefined);
      expect(store.getField('1', 'name')).toBe(undefined);
      expect(cache.writeField)
        .toBeCalledWith('1', 'name', undefined, 'Type');
      store.putField('1', 'name', 'Joe');
      expect(store.getField('1', 'name')).toBe('Joe');
      expect(cache.writeField).toBeCalledWith('1', 'name', 'Joe', 'Type');
      var email = 'joesavona@fb.com';
      store.putField('1', 'email_addresses', [email]);
      expect(store.getField('1', 'email_addresses')).toEqual([email]);
      expect(cache.writeField)
        .toBeCalledWith('1', 'email_addresses', [email], 'Type');
      var phone = {
        is_verified: true,
        phone_number: {
          display_number: '1-800-555-1212', // directory assistance
        }
      };
      store.putField('1', 'all_phones', [phone]);
      expect(store.getField('1', 'all_phones')).toEqual([phone]);
      expect(cache.writeField)
        .toBeCalledWith('1', 'all_phones', [phone], 'Type');
    });

    it('writes to queued data if available, otherwise base data', () => {
      var cachedRecords = {
        'a': {__dataID__: 'a'},
        'b': {__dataID__: 'b'},
      };
      var records = {};
      var queuedRecords = {};
      var recordStore = new RelayRecordStore({cachedRecords, records});
      var queuedStore = new RelayRecordStore(
        {cachedRecords, records, queuedRecords},
        undefined,
        undefined,
        undefined,
        'mutationID',
      );

      recordStore.putField('a', 'name', 'c');
      expect(recordStore.getField('a', 'name')).toBe('c');
      expect(queuedStore.getField('a', 'name')).toBe('c');

      queuedStore.putField('b', 'name', 'd');
      expect(recordStore.getField('b', 'name')).toBe(undefined);
      expect(queuedStore.getField('b', 'name')).toBe('d');
      expect(queuedRecords['b'].__status__)
        .toBe(RelayRecordStatusMap.setOptimisticStatus(0, true));
    });
  });

  describe('deleteField()', () => {
    it('throws if the record does not exist', () => {
      var store = new RelayRecordStore({records: {}});
      expect(() => {
        store.deleteField('1', 'name', null);
      }).toThrow(
        'Invariant Violation: RelayRecordStore.deleteField(): Expected ' +
        'record `1` to exist before deleting field `name`.'
      );
    });

    it('deletes fields', () => {
      var cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      var store = new RelayRecordStore({records: {}}, null, null, cache);
      store.putRecord('1', 'Type');
      store.putRecord('2', 'Type');

      store.putField('1', 'scalar', 'foo');
      store.deleteField('1', 'scalar');
      expect(store.getField('1', 'scalar')).toBe(null);
      expect(cache.writeField).toBeCalledWith('1', 'scalar', null);

      store.putLinkedRecordID('1', 'singular', '2');
      store.deleteField('1', 'singular');
      expect(store.getField('1', 'singular')).toBe(null);
      expect(cache.writeField).toBeCalledWith('1', 'singular', null);

      store.putLinkedRecordIDs('1', 'plural', ['2']);
      store.deleteField('1', 'plural');
      expect(store.getField('1', 'plural')).toBe(null);
      expect(cache.writeField).toBeCalledWith('1', 'plural', null);
    });

    it('writes to queued data if available, otherwise base data', () => {
      var cachedRecords = {
        'a': {
          __dataID__: 'a',
          name: 'A',
        },
        'b': {
          __dataID__: 'b',
          name: 'B',
        },
      };
      var records = {};
      var queuedRecords = {};
      var recordStore = new RelayRecordStore({cachedRecords, records});
      var queuedStore = new RelayRecordStore(
        {cachedRecords, records, queuedRecords},
        undefined,
        undefined,
        undefined,
        'mutationID',
      );

      recordStore.deleteField('a', 'name');
      expect(recordStore.getField('a', 'name')).toBe(null);
      expect(queuedStore.getField('a', 'name')).toBe(null);

      queuedStore.deleteField('b', 'name');
      expect(recordStore.getField('b', 'name')).toBe('B');
      expect(queuedStore.getField('b', 'name')).toBe(null);
    });
  });

  describe('putLinkedRecordID()', () => {
    it('throws if either record does not exist', () => {
      var store = new RelayRecordStore({records: {}});
      store.putRecord('1', 'Type');
      expect(() => {
        store.putLinkedRecordID('2', 'link', '1');
      }).toFailInvariant(
        'RelayRecordStore.putLinkedRecordID(): Expected record `2` to exist ' +
        'before linking to record `1`.'
      );
      expect(() => {
        store.putLinkedRecordID('1', 'link', '2');
      }).toFailInvariant(
        'RelayRecordStore.putLinkedRecordID(): Expected record `2` to exist ' +
        'before linking from record `1`.'
      );
    });

    it('writes links between records', () => {
      var cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      var store = new RelayRecordStore({records: {}}, null, null, cache);
      store.putRecord('viewerID', 'Type');
      store.putRecord('actorID', 'Type');
      store.putLinkedRecordID('viewerID', 'actor', 'actorID');
      expect(store.getLinkedRecordID('viewerID', 'actor')).toBe('actorID');
      expect(cache.writeField).toBeCalledWith('viewerID', 'actor', {
        __dataID__: 'actorID',
      });
    });

    it('writes to queued data if available, otherwise base data', () => {
      var cachedRecords = {};
      var records = {};
      var queuedRecords = {};
      var recordStore = new RelayRecordStore({cachedRecords, records});
      var queuedStore = new RelayRecordStore(
        {cachedRecords, records, queuedRecords},
        undefined,
        undefined,
        undefined,
        'mutationID',
      );

      recordStore.putRecord('a', 'Type');
      recordStore.putRecord('b', 'Type');
      recordStore.putRecord('c', 'Type');
      recordStore.putRecord('d', 'Type');

      recordStore.putLinkedRecordID('a', 'friend', 'c');
      expect(recordStore.getLinkedRecordID('a', 'friend')).toBe('c');
      expect(queuedStore.getLinkedRecordID('a', 'friend')).toBe('c');

      queuedStore.putLinkedRecordID('b', 'friend', 'd');
      expect(recordStore.getLinkedRecordID('b', 'friend')).toBe(undefined);
      expect(queuedStore.getLinkedRecordID('b', 'friend')).toBe('d');
    });
  });

  describe('putLinkedRecordIDs()', () => {
    it('throws if either record does not exist', () => {
      var store = new RelayRecordStore({records: {}});
      store.putRecord('1', 'Type');
      expect(() => {
        store.putLinkedRecordIDs('2', 'link', ['1']);
      }).toFailInvariant(
        'RelayRecordStore.putLinkedRecordIDs(): Expected record `2` to exist ' +
        'before linking records.'
      );
      expect(() => {
        store.putLinkedRecordIDs('1', 'link', ['2']);
      }).toFailInvariant(
        'RelayRecordStore.putLinkedRecordIDs(): Expected record `2` to exist ' +
        'before linking from `1`.'
      );
    });

    it('writes one-to-n links between records', () => {
      var cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      var store = new RelayRecordStore({records: {}}, null, null, cache);
      store.putRecord('storyID', 'Type');
      store.putRecord('actor1', 'Type');
      store.putRecord('actor2', 'Type');
      store.putLinkedRecordIDs('storyID', 'actors', ['actor1', 'actor2']);
      expect(store.getLinkedRecordIDs('storyID', 'actors'))
        .toEqual(['actor1', 'actor2']);
      expect(cache.writeField).toBeCalledWith('storyID', 'actors', [
        {__dataID__: 'actor1'},
        {__dataID__: 'actor2'},
      ]);
    });

    it('writes to queued data if available, otherwise base data', () => {
      var cachedRecords = {};
      var records = {};
      var queuedRecords = {};
      var recordStore = new RelayRecordStore({cachedRecords, records});
      var queuedStore = new RelayRecordStore(
        {cachedRecords, records, queuedRecords},
        undefined,
        undefined,
        undefined,
        'mutationID',
      );

      recordStore.putRecord('a', 'Type');
      recordStore.putRecord('b', 'Type');
      recordStore.putRecord('c', 'Type');
      recordStore.putRecord('d', 'Type');

      recordStore.putLinkedRecordIDs('a', 'friends', ['c']);
      expect(recordStore.getLinkedRecordIDs('a', 'friends')).toEqual(['c']);
      expect(queuedStore.getLinkedRecordIDs('a', 'friends')).toEqual(['c']);

      queuedStore.putLinkedRecordIDs('b', 'friends', ['d']);
      expect(recordStore.getLinkedRecordIDs('b', 'friends')).toBe(undefined);
      expect(queuedStore.getLinkedRecordIDs('b', 'friends')).toEqual(['d']);
    });
  });

  describe('putRange()', () => {
    it('throws if the record does not exist', () => {
      var store = new RelayRecordStore({records: {}});
      expect(() => {
        store.putRange('1', []);
      }).toFailInvariant(
        'RelayRecordStore.putRange(): Expected record `1` to exist ' +
        'before adding a range.'
      );
    });

    it('creates ranges if not defined', () => {
      var cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      var records = {};
      var store = new RelayRecordStore({records}, null, null, cache);
      store.putRecord('1', 'Type');
      store.putRange('1', []);
      expect(records['1'].__range__ instanceof GraphQLRange).toBe(true);
      expect(cache.writeField).toBeCalledWith(
        '1',
        '__range__',
        records['1'].__range__
      );
    });

    it('overwrites ranges if present',  () => {
      var cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      var records = {};
      var store = new RelayRecordStore({records}, null, null, cache);
      store.putRecord('1', 'Type');
      store.putRange('1', []);
      var range1 = records['1'].__range__;
      store.putRange('1', []);
      var range2 = records['1'].__range__;
      expect(range2 instanceof GraphQLRange).toBe(true);
      expect(range1).not.toBe(range2);
      expect(cache.writeField).toBeCalledWith(
        '1',
        '__range__',
        range2
      );
      expect(cache.writeField).toBeCalledWith(
        '1',
        '__forceIndex__',
        0
      );
      expect(cache.writeField).toBeCalledWith(
        '1',
        '__filterCalls__',
        []
      );
    });

    it('sets the force index for the new range', () => {
      var cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      var records = {};
      var store = new RelayRecordStore({records}, null, null, cache);
      expect(store.getRangeForceIndex('1')).toBe(0); // not in store yet
      store.putRecord('1', 'Type');
      store.putRange('1', []);
      expect(store.getRangeForceIndex('1')).toBe(0);
      store.putRange('1', [], 10);
      expect(store.getRangeForceIndex('1')).toBe(10);
      expect(cache.writeField).toBeCalledWith(
        '1',
        '__forceIndex__',
        10
      );
    });

    it('returns a negative force index for deleted ranges', () => {
      var records = {};
      var store = new RelayRecordStore({records});
      store.putRecord('1', 'Type');
      store.putRange('1', []);
      store.deleteRecord('1');
      expect(store.getRecordState('1')).toBe('NONEXISTENT');
      expect(store.getRangeForceIndex('1')).toBe(-1);
    });

    it('sets the filter calls for a range', () => {
      var cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      var records = {};
      var store = new RelayRecordStore({records}, null, null, cache);
      var calls = [
        {
          name: 'orderby',
          value: 'TOP_STORIES'
        },
        {
          name: 'first',
          value: '10'
        },
      ];
      store.putRecord('1', 'Type');
      store.putRange('1', calls);
      expect(store.getRangeFilterCalls('1')).toEqual(calls.slice(0, 1));
      expect(cache.writeField).toBeCalledWith(
        '1',
        '__filterCalls__',
        calls.slice(0, 1)
      );
    });
  });

  describe('putRangeEdges()', () => {
    it('throws if the record or range does not exist', () => {
      var store = new RelayRecordStore({records: {}});
      expect(() => {
        store.putRangeEdges('1', [], {}, []);
      }).toFailInvariant(
        'RelayRecordStore.putRangeEdges(): Expected record `1` to exist and ' +
        'have a range.'
      );
      store.putRecord('1', 'Type');
      expect(() => {
        store.putRangeEdges('1', [], {}, []);
      }).toFailInvariant(
        'RelayRecordStore.putRangeEdges(): Expected record `1` to exist and ' +
        'have a range.'
      );
    });

    it('adds edges to the range', () => {
      var connectionID = '1';
      var cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      var records = {};
      var store = new RelayRecordStore({records}, null, null, cache);
      store.putRecord(connectionID, 'Type');
      store.putRange(connectionID, []);
      var pageInfo = {
        [HAS_NEXT_PAGE]: true,
        [HAS_PREV_PAGE]: false,
      };
      var calls = [{name: 'first', value: 3}];
      var edges = [];
      var nodes = [];
      for (var ii = 0; ii < 3; ii++) {
        var edgeID = 'edge' + ii;
        var nodeID = 'node' + ii;
        store.putRecord(edgeID, 'Type');
        store.putRecord(nodeID, 'Type');
        store.putLinkedRecordID(edgeID, 'node', nodeID);
        store.putField(edgeID, 'cursor', 'cursor' + ii);
        edges.push(edgeID);
        nodes.push(nodeID);
      }
      store.putRangeEdges(
        connectionID,
        calls,
        pageInfo,
        edges
      );

      // node are automatically associated with the range
      nodes.forEach(nodeID => {
        expect(store.getConnectionIDsForRecord(nodeID)).toEqual([connectionID]);
      });

      var rangeInfo = store.getRangeMetadata(connectionID, calls);
      expect(rangeInfo.diffCalls).toEqual([]);
      expect(rangeInfo.filterCalls).toEqual([]);
      expect(rangeInfo.requestedEdges).toEqual([
        {edgeID: 'edge0', nodeID: 'node0'},
        {edgeID: 'edge1', nodeID: 'node1'},
        {edgeID: 'edge2', nodeID: 'node2'},
      ]);
      expect(cache.writeField).toBeCalledWith(
        connectionID,
        '__range__',
        records[connectionID].__range__
      );
    });
  });

  describe('applyRangeUpdate()', () => {
    var cache;
    var connectionID;
    var firstEdgeID;
    var firstNodeID;
    var lastEdgeID;
    var queuedRecords;
    var queuedStore;
    var records;
    var store;

    var _inc = 0;
    function addEdgeToStore(store) {
      var index = _inc++;
      var edgeID = 'edge:' + index;
      var nodeID = 'node:' + index;
      var cursor = 'cursor:' + index;

      store.putRecord(edgeID, 'Type');
      store.putRecord(nodeID, 'Type');
      store.putLinkedRecordID(edgeID, 'node', nodeID);
      store.putField(edgeID, 'cursor', cursor);

      return {cursor, edgeID, nodeID};
    }

    beforeEach(() => {
      records = {};
      queuedRecords = {};
      cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      store = new RelayRecordStore({records}, null, null, cache);
      queuedStore = new RelayRecordStore(
        {records, queuedRecords},
        undefined,
        undefined,
        undefined,
        'mutationID',
      );
      connectionID = '123';

      // create a range record
      store.putRecord(connectionID, 'Type');
      store.putRange(connectionID, []);

      // ...with a first edge
      var edge = addEdgeToStore(store);
      firstEdgeID = edge.edgeID;
      firstNodeID = edge.nodeID;
      store.putRangeEdges(
        connectionID,
        [{name: 'first', value: 1}],
        {
          [HAS_NEXT_PAGE]: true,
          [HAS_PREV_PAGE]: false,
        },
        [firstEdgeID]
      );

      // ...and a last edge
      edge = addEdgeToStore(store);
      lastEdgeID = edge.edgeID;
      store.putRangeEdges(
        connectionID,
        [{name: 'last', value: 1}],
        {
          [HAS_NEXT_PAGE]: false,
          [HAS_PREV_PAGE]: true,
        },
        [lastEdgeID]
      );

      cache.writeNode.mockClear();
      cache.writeField.mockClear();
      cache.writeRootCall.mockClear();
    });

    it('throws if the connection does not exist', () => {
      var {edgeID} = addEdgeToStore(store);
      expect(() => {
        store.applyRangeUpdate('client:does.not.exist', edgeID, PREPEND);
      }).toFailInvariant(
        'RelayRecordStore: Cannot apply `prepend` ' +
        'update to non-existent record `client:does.not.exist`.'
      );
    });

    it('prepends edges to base stores', () => {
      var {edgeID, nodeID} = addEdgeToStore(store);
      store.applyRangeUpdate(connectionID, edgeID, PREPEND);

      // contains prepended edge
      var calls = [{name: 'first', value: 2}];
      var rangeInfo = store.getRangeMetadata(connectionID, calls);
      expect(rangeInfo.requestedEdges.map(edge => edge.edgeID)).toEqual([
        edgeID,
        firstEdgeID
      ]);
      expect(store.getConnectionIDsForRecord(nodeID)).toEqual([connectionID]);
      expect(cache.writeField).toBeCalledWith(
        connectionID,
        '__range__',
        records[connectionID].__range__
      );
    });

    it('optimistically prepends edges to queued stores', () => {
      var {edgeID, nodeID} = addEdgeToStore(queuedStore);
      queuedStore.applyRangeUpdate(connectionID, edgeID, PREPEND);

      // contains prepended edge
      var calls = [{name: 'first', value: 2}];
      var rangeInfo = queuedStore.getRangeMetadata(connectionID, calls);
      expect(rangeInfo.requestedEdges.map(edge => edge.edgeID)).toEqual([
        edgeID,
        firstEdgeID
      ]);
      // cache not updated on optimistic range update
      expect(cache.writeField).not.toBeCalledWith(
        connectionID,
        '__range__',
        records[connectionID].__range__
      );

      // base store is unchanged
      rangeInfo = store.getRangeMetadata(connectionID, calls);
      expect(rangeInfo.requestedEdges.map(edge => edge.edgeID)).toEqual([
        firstEdgeID
      ]);
      expect(store.getConnectionIDsForRecord(nodeID)).toEqual(null);
    });

    it('appends edges to base stores', () => {
      var {edgeID, nodeID} = addEdgeToStore(store);
      store.applyRangeUpdate(connectionID, edgeID, APPEND);

      // contains appended edge
      var calls = [{name: 'last', value: 2}];
      var rangeInfo = store.getRangeMetadata(connectionID, calls);
      expect(rangeInfo.requestedEdges.map(edge => edge.edgeID)).toEqual([
        lastEdgeID,
        edgeID
      ]);
      expect(store.getConnectionIDsForRecord(nodeID)).toEqual([connectionID]);
      expect(cache.writeField).toBeCalledWith(
        connectionID,
        '__range__',
        records[connectionID].__range__
      );
    });

    it('optimistically appends edges to queued stores', () => {
      var {edgeID, nodeID} = addEdgeToStore(queuedStore);
      queuedStore.applyRangeUpdate(connectionID, edgeID, APPEND);

      // contains appended edge
      var calls = [{name: 'last', value: 2}];
      var rangeInfo = queuedStore.getRangeMetadata(connectionID, calls);
      expect(rangeInfo.requestedEdges.map(edge => edge.edgeID)).toEqual([
        lastEdgeID,
        edgeID
      ]);
      // cache not updated on optimistic range update
      expect(cache.writeField).not.toBeCalledWith(
        connectionID,
        '__range__',
        records[connectionID].__range__
      );

      // base store is unchanged
      rangeInfo = store.getRangeMetadata(connectionID, calls);
      expect(rangeInfo.requestedEdges.map(edge => edge.edgeID)).toEqual([
        lastEdgeID
      ]);
      expect(store.getConnectionIDsForRecord(nodeID)).toEqual(null);
    });

    it('deletes edges from base stores', () => {
      expect(store.getConnectionIDsForRecord(firstNodeID)).toEqual([
        connectionID
      ]);
      store.applyRangeUpdate(connectionID, firstEdgeID, REMOVE);

      // does not contain removed edge
      var calls = [{name: 'first', value: 2}];
      var rangeInfo = store.getRangeMetadata(connectionID, calls);
      expect(rangeInfo.requestedEdges).toEqual([]);
      expect(store.getConnectionIDsForRecord(firstNodeID)).toEqual(null);
      expect(cache.writeField).toBeCalledWith(
        connectionID,
        '__range__',
        records[connectionID].__range__
      );
    });

    it('optimistically deletes existing edges from queued stores', () => {
      queuedStore.applyRangeUpdate(connectionID, firstEdgeID, REMOVE);

      // does not contain removed edge
      var calls = [{name: 'first', value: 2}];
      var rangeInfo = queuedStore.getRangeMetadata(connectionID, calls);
      expect(rangeInfo.requestedEdges).toEqual([]);
      // cache not updated on optimistic range update
      expect(cache.writeField).not.toBeCalledWith(
        connectionID,
        '__range__',
        records[connectionID].__range__
      );

      // base store is unchanged
      rangeInfo = store.getRangeMetadata(connectionID, calls);
      expect(rangeInfo.requestedEdges.map(edge => edge.edgeID)).toEqual([
        firstEdgeID
      ]);
      expect(store.getConnectionIDsForRecord(firstNodeID)).toEqual([
        connectionID
      ]);
    });

    it('deletes optimistically prepended edges from queued stores', () => {
      var {edgeID} = addEdgeToStore(queuedStore);
      queuedStore.applyRangeUpdate(connectionID, edgeID, PREPEND);
      queuedStore.applyRangeUpdate(connectionID, edgeID, REMOVE);

      // does not contain prepended & removed edge
      var calls = [{name: 'first', value: 1}];
      var rangeInfo = queuedStore.getRangeMetadata(connectionID, calls);
      expect(rangeInfo.requestedEdges.map(edge => edge.edgeID)).toEqual([
        firstEdgeID
      ]);
    });

    it('deletes optimistically appended edges from queued stores', () => {
      var {edgeID} = addEdgeToStore(queuedStore);
      queuedStore.applyRangeUpdate(connectionID, edgeID, APPEND);
      queuedStore.applyRangeUpdate(connectionID, edgeID, REMOVE);

      // does not contain prepended & removed edge
      var calls = [{name: 'last', value: 1}];
      var rangeInfo = queuedStore.getRangeMetadata(connectionID, calls);
      expect(rangeInfo.requestedEdges.map(edge => edge.edgeID)).toEqual([
        lastEdgeID
      ]);
    });
  });
});

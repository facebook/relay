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

jest.autoMockOff();

const GraphQLRange = require('GraphQLRange');
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayMockCacheManager = require('RelayMockCacheManager');
const RelayRecordStatusMap = require('RelayRecordStatusMap');
const RelayRecordStore = require('RelayRecordStore');
const RelayRecordWriter = require('RelayRecordWriter');
const RelayTestUtils = require('RelayTestUtils');
const {APPEND, PREPEND, REMOVE} = require('GraphQLMutatorConstants');
const rangeOperationToMetadataKey = require('rangeOperationToMetadataKey');

describe('RelayRecordWriter', () => {

  var HAS_NEXT_PAGE, HAS_PREV_PAGE;

  beforeEach(() => {
    jest.resetModuleRegistry();

    ({HAS_NEXT_PAGE, HAS_PREV_PAGE} = RelayConnectionInterface);

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  describe('getDataID()', () => {
    it('returns undefined for unknown root call ids', () => {
      const store = new RelayRecordWriter({}, {}, false);
      expect(store.getDataID('username', 'zuck')).toBe(undefined);
    });
    it('returns id for node/nodes root call ids', () => {
      const store = new RelayRecordWriter({}, {}, false);
      expect(store.getDataID('node', '4')).toBe('4');
      expect(store.getDataID('nodes', '4')).toBe('4');
    });
  });

  describe('putDataID()', () => {
    it('sets root call ids', () => {
      const cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      const store = new RelayRecordWriter({}, {}, false, null, cache);
      store.putDataID('username', 'zuck', 'node:4');
      expect(store.getDataID('username', 'zuck')).toBe('node:4');
      expect(cache.writeRootCall).toBeCalledWith('username', 'zuck', 'node:4');
    });

    it('does not set ids for node/nodes root calls', () => {
      const cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      const rootCallMap = {};
      const store =
        new RelayRecordWriter({}, rootCallMap, false, null, cache);
      store.putDataID('node', '4', 'node:4');
      store.putDataID('nodes', '4', 'node:4');
      expect(rootCallMap).toEqual({});
      expect(cache.writeRootCall).not.toBeCalled();
    });
  });

  describe('deleteRecord()', () => {
    it('sets records to null', () => {
      const cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      const records = {
        '1': {
          __dataID__: '1',
        },
      };
      const store = new RelayRecordWriter(records, {}, false, null, cache);
      store.deleteRecord('1');
      expect(store.getRecordState('1')).toBe('NONEXISTENT');
      expect(cache.writeNode).toBeCalledWith('1', null);
      store.deleteRecord('2');
      expect(store.getRecordState('2')).toBe('NONEXISTENT');
      expect(cache.writeNode).toBeCalledWith('2', null);
    });
  });

  describe('putRecord()', () => {
    it('creates records', () => {
      const cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      const records = {};
      const store = new RelayRecordWriter(records, {}, false, null, cache);

      store.putRecord('1', 'Type');
      expect(store.getRecordState('1')).toBe('EXISTENT');
      expect(store.getType('1')).toBe('Type');
      expect(cache.writeField).toBeCalledWith('1', '__dataID__', '1', 'Type');
    });

    it('creates records for optimistic write', () => {
      const records = {};
      const store =
        new RelayRecordWriter(records, {}, true, null, null, 'mutationID');

      store.putRecord('b', 'Type');
      expect(store.getRecordState('b')).toBe('EXISTENT');
      expect(records.b.__status__)
        .toBe(RelayRecordStatusMap.setOptimisticStatus(0, true));
      expect(records.b.__mutationIDs__).toEqual(['mutationID']);
    });
  });

  describe('putField()', () => {
    it('throws if the record does not exist', () => {
      const store = new RelayRecordWriter({}, {}, false);
      expect(() => {
        store.putField('1', 'name', null);
      }).toFailInvariant(
        'RelayRecordWriter.putField(): Expected record `1` to exist before ' +
        'writing field `name`.'
      );
    });

    it('writes scalar fields', () => {
      const cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      const store = new RelayRecordWriter({}, {}, false, null, cache);
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
      const email = 'joesavona@fb.com';
      store.putField('1', 'email_addresses', [email]);
      expect(store.getField('1', 'email_addresses')).toEqual([email]);
      expect(cache.writeField)
        .toBeCalledWith('1', 'email_addresses', [email], 'Type');
      const phone = {
        is_verified: true,
        phone_number: {
          display_number: '1-800-555-1212', // directory assistance
        },
      };
      store.putField('1', 'all_phones', [phone]);
      expect(store.getField('1', 'all_phones')).toEqual([phone]);
      expect(cache.writeField)
        .toBeCalledWith('1', 'all_phones', [phone], 'Type');
    });

    it('writes fields optimistically', () => {
      var records = {};
      var store =
        new RelayRecordWriter(records, {}, true, null, null, 'mutationID');

      store.putRecord('b', 'Type');
      store.putField('b', 'name', 'd');
      expect(store.getField('b', 'name')).toBe('d');
      expect(records.b.__status__)
        .toBe(RelayRecordStatusMap.setOptimisticStatus(0, true));
      expect(records.b.__mutationIDs__).toEqual(['mutationID']);
    });
  });

  describe('deleteField()', () => {
    it('throws if the record does not exist', () => {
      const store = new RelayRecordWriter({}, {}, false);
      expect(() => {
        store.deleteField('1', 'name', null);
      }).toThrowError(
        'RelayRecordWriter.deleteField(): Expected record `1` to exist ' +
        'before deleting field `name`.'
      );
    });

    it('deletes fields', () => {
      var cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      var store = new RelayRecordWriter({}, {}, false, null, cache);
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

    it('deletes fields optimistically', () => {
      var records = {};
      var store =
        new RelayRecordWriter(records, {}, true, null, null, 'mutationID');

      store.putRecord('b', 'Type');
      store.deleteField('b', 'name');
      expect(store.getField('b', 'name')).toBe(null);
      expect(records.b.__status__)
        .toBe(RelayRecordStatusMap.setOptimisticStatus(0, true));
      expect(records.b.__mutationIDs__).toEqual(['mutationID']);
    });
  });

  describe('putLinkedRecordID()', () => {
    it('throws if either record does not exist', () => {
      var store = new RelayRecordWriter({}, {}, false);
      store.putRecord('1', 'Type');
      expect(() => {
        store.putLinkedRecordID('2', 'link', '1');
      }).toFailInvariant(
        'RelayRecordWriter.putLinkedRecordID(): Expected record `2` to exist ' +
        'before linking to record `1`.'
      );
      expect(() => {
        store.putLinkedRecordID('1', 'link', '2');
      }).toFailInvariant(
        'RelayRecordWriter.putLinkedRecordID(): Expected record `2` to exist ' +
        'before linking from record `1`.'
      );
    });

    it('writes links between records', () => {
      var cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      var store = new RelayRecordWriter({}, {}, false, null, cache);
      store.putRecord('viewerID', 'Type');
      store.putRecord('actorID', 'Type');
      store.putLinkedRecordID('viewerID', 'actor', 'actorID');
      expect(store.getLinkedRecordID('viewerID', 'actor')).toBe('actorID');
      expect(cache.writeField).toBeCalledWith('viewerID', 'actor', {
        __dataID__: 'actorID',
      });
    });

    it('writes linked record optimistically', () => {
      var records = {};
      var store =
        new RelayRecordWriter(records, {}, true, null, null, 'mutationID');

      store.putRecord('a', 'Type');
      store.putRecord('b', 'Type');

      store.putLinkedRecordID('a', 'friend', 'b');
      expect(store.getLinkedRecordID('a', 'friend')).toBe('b');
      expect(records.a.__status__)
        .toBe(RelayRecordStatusMap.setOptimisticStatus(0, true));
      expect(records.a.__mutationIDs__).toEqual(['mutationID']);
    });
  });

  describe('putLinkedRecordIDs()', () => {
    it('throws if either record does not exist', () => {
      var store = new RelayRecordWriter({}, {}, false);
      store.putRecord('1', 'Type');
      expect(() => {
        store.putLinkedRecordIDs('2', 'link', ['1']);
      }).toFailInvariant(
        'RelayRecordWriter.putLinkedRecordIDs(): Expected record `2` to ' +
        'exist before linking records.'
      );
      expect(() => {
        store.putLinkedRecordIDs('1', 'link', ['2']);
      }).toFailInvariant(
        'RelayRecordWriter.putLinkedRecordIDs(): Expected record `2` to ' +
        'exist before linking from `1`.'
      );
    });

    it('writes one-to-n links between records', () => {
      var cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      var store = new RelayRecordWriter({}, {}, false, null, cache);
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

    it('writes linked records optimistically', () => {
      var records = {};
      var store =
        new RelayRecordWriter(records, {}, true, null, null, 'mutationID');

      store.putRecord('a', 'Type');
      store.putRecord('b', 'Type');

      store.putLinkedRecordIDs('a', 'friends', ['b']);
      expect(store.getLinkedRecordIDs('a', 'friends')).toEqual(['b']);
      expect(records.a.__status__)
        .toBe(RelayRecordStatusMap.setOptimisticStatus(0, true));
      expect(records.a.__mutationIDs__).toEqual(['mutationID']);
    });
  });

  describe('putRange()', () => {
    it('throws if the record does not exist', () => {
      var store = new RelayRecordWriter({}, {}, false);
      expect(() => {
        store.putRange('1', []);
      }).toFailInvariant(
        'RelayRecordWriter.putRange(): Expected record `1` to exist ' +
        'before adding a range.'
      );
    });

    it('creates ranges if not defined', () => {
      var cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      var records = {};
      var store = new RelayRecordWriter(records, {}, false, null, cache);
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
      var store = new RelayRecordWriter(records, {}, false, null, cache);
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
      var store = new RelayRecordWriter(records, {}, false, null, cache);
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
      var store = new RelayRecordWriter(records, {}, false);
      store.putRecord('1', 'Type');
      store.putRange('1', []);
      store.deleteRecord('1');
      expect(store.getRecordState('1')).toBe('NONEXISTENT');
      expect(store.getRangeForceIndex('1')).toBe(-1);
    });

    it('sets the filter calls for a range', () => {
      var cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      var records = {};
      var store = new RelayRecordWriter(records, {}, false, null, cache);
      var calls = [
        {
          name: 'orderby',
          value: 'TOP_STORIES',
        },
        {
          name: 'first',
          value: '10',
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
      var store = new RelayRecordWriter({}, {}, false);
      expect(() => {
        store.putRangeEdges('1', [], {}, []);
      }).toFailInvariant(
        'RelayRecordWriter.putRangeEdges(): Expected record `1` to exist and ' +
        'have a range.'
      );
      store.putRecord('1', 'Type');
      expect(() => {
        store.putRangeEdges('1', [], {}, []);
      }).toFailInvariant(
        'RelayRecordWriter.putRangeEdges(): Expected record `1` to exist and ' +
        'have a range.'
      );
    });

    it('adds edges to the range', () => {
      var connectionID = '1';
      var cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      var records = {};
      var nodeConnectionMap = {};
      var store = new RelayRecordStore({records}, null, nodeConnectionMap);
      var writer = new RelayRecordWriter(
        records,
        {},
        false,
        nodeConnectionMap,
        cache
      );
      writer.putRecord(connectionID, 'Type');
      writer.putRange(connectionID, []);
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
        writer.putRecord(edgeID, 'Type');
        writer.putRecord(nodeID, 'Type');
        writer.putLinkedRecordID(edgeID, 'node', nodeID);
        writer.putField(edgeID, 'cursor', 'cursor' + ii);
        edges.push(edgeID);
        nodes.push(nodeID);
      }
      writer.putRangeEdges(
        connectionID,
        calls,
        pageInfo,
        edges
      );

      // node are automatically associated with the range
      nodes.forEach(nodeID => {
        expect(Object.keys(nodeConnectionMap[nodeID])).toEqual([connectionID]);
      });

      var rangeInfo = store.getRangeMetadata(connectionID, calls);
      expect(rangeInfo.diffCalls).toEqual([]);
      expect(rangeInfo.filterCalls).toEqual([]);
      expect(rangeInfo.filteredEdges).toEqual([
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
    var nodeConnectionMap;
    var optimisticWriter;
    var queuedRecords;
    var records;
    var store;
    var writer;

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
      nodeConnectionMap = {};
      store = new RelayRecordStore(
        {records, queuedRecords},
        null,
        nodeConnectionMap
      );
      writer = new RelayRecordWriter(
        records,
        {},
        false,
        nodeConnectionMap,
        cache
      );
      optimisticWriter = new RelayRecordWriter(
        queuedRecords,
        {},
        true,
        nodeConnectionMap,
        cache,
        'mutationID'
      );
      connectionID = '123';

      // create a range record
      writer.putRecord(connectionID, 'Type');
      writer.putRange(connectionID, []);
      optimisticWriter.putRecord(connectionID, 'Type');

      // ...with a first edge
      var edge = addEdgeToStore(writer);
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
      edge = addEdgeToStore(writer);
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
      var {edgeID} = addEdgeToStore(writer);
      expect(() => {
        writer.applyRangeUpdate('client:does.not.exist', edgeID, PREPEND);
      }).toFailInvariant(
        'RelayRecordWriter: Cannot apply `prepend` ' +
        'update to non-existent record `client:does.not.exist`.'
      );
    });

    it('prepends edges to base stores', () => {
      var {edgeID, nodeID} = addEdgeToStore(writer);
      writer.applyRangeUpdate(connectionID, edgeID, PREPEND);

      // contains prepended edge
      var calls = [{name: 'first', value: 2}];
      var rangeInfo = store.getRangeMetadata(connectionID, calls);
      expect(rangeInfo.filteredEdges.map(edge => edge.edgeID)).toEqual([
        edgeID,
        firstEdgeID,
      ]);
      expect(store.getConnectionIDsForRecord(nodeID)).toEqual([connectionID]);
      expect(cache.writeField).toBeCalledWith(
        connectionID,
        '__range__',
        records[connectionID].__range__
      );
    });

    it('optimistically prepends edges to queued stores', () => {
      var {edgeID} = addEdgeToStore(optimisticWriter);
      optimisticWriter.applyRangeUpdate(
        connectionID,
        edgeID,
        rangeOperationToMetadataKey[PREPEND]
      );

      // contains prepended edge
      var calls = [{name: 'first', value: 2}];
      var rangeInfo = store.getRangeMetadata(connectionID, calls);
      expect(rangeInfo.filteredEdges.map(edge => edge.edgeID)).toEqual([
        edgeID,
        firstEdgeID,
      ]);
      // cache not updated on optimistic range update
      expect(cache.writeField).not.toBeCalledWith(
        connectionID,
        '__range__',
        records[connectionID].__range__
      );

      expect(queuedRecords[connectionID].__status__)
        .toBe(RelayRecordStatusMap.setOptimisticStatus(0, true));
      expect(queuedRecords[connectionID].__mutationIDs__)
        .toEqual(['mutationID']);
    });

    it('appends edges to base stores', () => {
      var {edgeID, nodeID} = addEdgeToStore(writer);
      writer.applyRangeUpdate(connectionID, edgeID, APPEND);

      // contains appended edge
      var calls = [{name: 'last', value: 2}];
      var rangeInfo = store.getRangeMetadata(connectionID, calls);
      expect(rangeInfo.filteredEdges.map(edge => edge.edgeID)).toEqual([
        lastEdgeID,
        edgeID,
      ]);
      expect(store.getConnectionIDsForRecord(nodeID)).toEqual([connectionID]);
      expect(cache.writeField).toBeCalledWith(
        connectionID,
        '__range__',
        records[connectionID].__range__
      );
    });

    it('optimistically appends edges to queued stores', () => {
      var {edgeID, nodeID} = addEdgeToStore(optimisticWriter);
      optimisticWriter.applyRangeUpdate(
        connectionID,
        edgeID,
        rangeOperationToMetadataKey[APPEND]
      );

      // contains appended edge
      var calls = [{name: 'last', value: 2}];
      var rangeInfo = store.getRangeMetadata(connectionID, calls);
      expect(rangeInfo.filteredEdges.map(edge => edge.edgeID)).toEqual([
        lastEdgeID,
        edgeID,
      ]);
      // cache not updated on optimistic range update
      expect(cache.writeField).not.toBeCalledWith(
        connectionID,
        '__range__',
        records[connectionID].__range__
      );

      expect(store.getConnectionIDsForRecord(nodeID)).toEqual(null);
      expect(queuedRecords[connectionID].__status__)
        .toBe(RelayRecordStatusMap.setOptimisticStatus(0, true));
      expect(queuedRecords[connectionID].__mutationIDs__)
        .toEqual(['mutationID']);
    });

    it('deletes edges from base stores', () => {
      expect(store.getConnectionIDsForRecord(firstNodeID)).toEqual([
        connectionID,
      ]);
      writer.applyRangeUpdate(connectionID, firstEdgeID, REMOVE);

      // does not contain removed edge
      var calls = [{name: 'first', value: 2}];
      var rangeInfo = store.getRangeMetadata(connectionID, calls);
      expect(rangeInfo.filteredEdges).toEqual([]);
      expect(store.getConnectionIDsForRecord(firstNodeID)).toEqual(null);
      expect(cache.writeField).toBeCalledWith(
        connectionID,
        '__range__',
        records[connectionID].__range__
      );
    });

    it('optimistically deletes existing edges from queued stores', () => {
      optimisticWriter.applyRangeUpdate(
        connectionID,
        firstEdgeID,
        rangeOperationToMetadataKey[REMOVE]
      );

      // does not contain removed edge
      var calls = [{name: 'first', value: 2}];
      var rangeInfo = store.getRangeMetadata(connectionID, calls);
      expect(rangeInfo.filteredEdges).toEqual([]);
      // cache not updated on optimistic range update
      expect(cache.writeField).not.toBeCalledWith(
        connectionID,
        '__range__',
        records[connectionID].__range__
      );

      // base store is unchanged
      expect(store.getConnectionIDsForRecord(firstNodeID)).toEqual([
        connectionID,
      ]);
      expect(queuedRecords[connectionID].__status__)
        .toBe(RelayRecordStatusMap.setOptimisticStatus(0, true));
      expect(queuedRecords[connectionID].__mutationIDs__)
        .toEqual(['mutationID']);
    });

    it('deletes optimistically prepended edges from queued stores', () => {
      var {edgeID} = addEdgeToStore(optimisticWriter);
      optimisticWriter.applyRangeUpdate(connectionID, edgeID, PREPEND);
      optimisticWriter.applyRangeUpdate(connectionID, edgeID, REMOVE);

      // does not contain prepended & removed edge
      var calls = [{name: 'first', value: 1}];
      var rangeInfo = store.getRangeMetadata(connectionID, calls);
      expect(rangeInfo.filteredEdges.map(edge => edge.edgeID)).toEqual([
        firstEdgeID,
      ]);
    });

    it('deletes optimistically appended edges from queued stores', () => {
      var {edgeID} = addEdgeToStore(optimisticWriter);
      optimisticWriter.applyRangeUpdate(connectionID, edgeID, APPEND);
      optimisticWriter.applyRangeUpdate(connectionID, edgeID, REMOVE);

      // does not contain prepended & removed edge
      var calls = [{name: 'last', value: 1}];
      var rangeInfo = store.getRangeMetadata(connectionID, calls);
      expect(rangeInfo.filteredEdges.map(edge => edge.edgeID)).toEqual([
        lastEdgeID,
      ]);
    });
  });
});

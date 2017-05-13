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

jest.disableAutomock();

const GraphQLRange = require('GraphQLRange');
const Relay = require('Relay');
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayMockCacheManager = require('RelayMockCacheManager');
const RelayQueryPath = require('RelayQueryPath');
const RelayRecordStatusMap = require('RelayRecordStatusMap');
const RelayRecordStore = require('RelayRecordStore');
const RelayRecordWriter = require('RelayRecordWriter');
const RelayTestUtils = require('RelayTestUtils');
const {APPEND, PREPEND, REMOVE} = require('GraphQLMutatorConstants');

const generateClientID = require('generateClientID');

describe('RelayRecordWriter', () => {
  let HAS_NEXT_PAGE, HAS_PREV_PAGE;

  beforeEach(() => {
    jest.resetModules();

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
      const store = new RelayRecordWriter({}, rootCallMap, false, null, cache);
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

    it('ignores paths for server records', () => {
      const {getNode} = RelayTestUtils;

      const writer = new RelayRecordWriter({}, {}, false);
      const path = RelayQueryPath.create(getNode(Relay.QL`query { viewer }`));
      writer.putRecord('1', 'Type', path);
      expect(writer.getPathToRecord('1')).toBe(undefined);
    });

    it('creates client records with paths', () => {
      const {getNode} = RelayTestUtils;

      const writer = new RelayRecordWriter({}, {}, false);
      const path = RelayQueryPath.create(getNode(Relay.QL`query { viewer }`));
      const id = generateClientID();
      writer.putRecord(id, 'Type', path);
      expect(writer.getPathToRecord(id)).toBe(path);
    });

    it('creates client records without paths', () => {
      const writer = new RelayRecordWriter({}, {}, false);
      const id = generateClientID();
      writer.putRecord(id, 'Type');
      expect(writer.getPathToRecord(id)).toBe(undefined);
    });

    it('creates records for optimistic write', () => {
      const records = {};
      const store = new RelayRecordWriter(
        records,
        {},
        true,
        null,
        null,
        'mutationID',
      );

      store.putRecord('b', 'Type');
      expect(store.getRecordState('b')).toBe('EXISTENT');
      expect(records.b.__status__).toBe(
        RelayRecordStatusMap.setOptimisticStatus(0, true),
      );
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
          'writing field `name`.',
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
      expect(cache.writeField).toBeCalledWith('1', 'name', undefined, 'Type');
      store.putField('1', 'name', 'Joe');
      expect(store.getField('1', 'name')).toBe('Joe');
      expect(cache.writeField).toBeCalledWith('1', 'name', 'Joe', 'Type');
      const email = 'joesavona@fb.com';
      store.putField('1', 'email_addresses', [email]);
      expect(store.getField('1', 'email_addresses')).toEqual([email]);
      expect(cache.writeField).toBeCalledWith(
        '1',
        'email_addresses',
        [email],
        'Type',
      );
      const phone = {
        is_verified: true,
        phone_number: {
          display_number: '1-800-555-1212', // directory assistance
        },
      };
      store.putField('1', 'all_phones', [phone]);
      expect(store.getField('1', 'all_phones')).toEqual([phone]);
      expect(cache.writeField).toBeCalledWith(
        '1',
        'all_phones',
        [phone],
        'Type',
      );
    });

    it('writes fields optimistically', () => {
      const records = {};
      const store = new RelayRecordWriter(
        records,
        {},
        true,
        null,
        null,
        'mutationID',
      );

      store.putRecord('b', 'Type');
      store.putField('b', 'name', 'd');
      expect(store.getField('b', 'name')).toBe('d');
      expect(records.b.__status__).toBe(
        RelayRecordStatusMap.setOptimisticStatus(0, true),
      );
      expect(records.b.__mutationIDs__).toEqual(['mutationID']);
    });
  });

  describe('deleteField()', () => {
    it('throws if the record does not exist', () => {
      const store = new RelayRecordWriter({}, {}, false);
      expect(() => {
        store.deleteField('1', 'name', null);
      }).toFailInvariant(
        'RelayRecordWriter.deleteField(): Expected record `1` to exist ' +
          'before deleting field `name`.',
      );
    });

    it('deletes fields', () => {
      const cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      const store = new RelayRecordWriter({}, {}, false, null, cache);
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
      const records = {};
      const store = new RelayRecordWriter(
        records,
        {},
        true,
        null,
        null,
        'mutationID',
      );

      store.putRecord('b', 'Type');
      store.deleteField('b', 'name');
      expect(store.getField('b', 'name')).toBe(null);
      expect(records.b.__status__).toBe(
        RelayRecordStatusMap.setOptimisticStatus(0, true),
      );
      expect(records.b.__mutationIDs__).toEqual(['mutationID']);
    });
  });

  describe('putLinkedRecordID()', () => {
    it('throws if the parent record does not exist', () => {
      const store = new RelayRecordWriter({}, {}, false);
      store.putRecord('1', 'Type');
      expect(() => {
        store.putLinkedRecordID('2', 'link', '1');
      }).toFailInvariant(
        'RelayRecordWriter.putLinkedRecordID(): Expected record `2` to exist ' +
          'before linking to record `1`.',
      );
    });

    it('writes links to non-existent records', () => {
      const writer = new RelayRecordWriter({}, {}, false);
      writer.putRecord('1', 'Type');
      writer.putLinkedRecordID('1', 'link', '2');
      expect(writer.getLinkedRecordID('1', 'link')).toBe('2');
    });

    it('writes links between records', () => {
      const cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      const store = new RelayRecordWriter({}, {}, false, null, cache);
      store.putRecord('viewerID', 'Type');
      store.putRecord('actorID', 'Type');
      store.putLinkedRecordID('viewerID', 'actor', 'actorID');
      expect(store.getLinkedRecordID('viewerID', 'actor')).toBe('actorID');
      expect(cache.writeField).toBeCalledWith('viewerID', 'actor', {
        __dataID__: 'actorID',
      });
    });

    it('writes linked record optimistically', () => {
      const records = {};
      const store = new RelayRecordWriter(
        records,
        {},
        true,
        null,
        null,
        'mutationID',
      );

      store.putRecord('a', 'Type');
      store.putRecord('b', 'Type');

      store.putLinkedRecordID('a', 'friend', 'b');
      expect(store.getLinkedRecordID('a', 'friend')).toBe('b');
      expect(records.a.__status__).toBe(
        RelayRecordStatusMap.setOptimisticStatus(0, true),
      );
      expect(records.a.__mutationIDs__).toEqual(['mutationID']);
    });
  });

  describe('putLinkedRecordIDs()', () => {
    it('throws if the parent record does not exist', () => {
      const store = new RelayRecordWriter({}, {}, false);
      store.putRecord('1', 'Type');
      expect(() => {
        store.putLinkedRecordIDs('2', 'link', ['1']);
      }).toFailInvariant(
        'RelayRecordWriter.putLinkedRecordIDs(): Expected record `2` to ' +
          'exist before linking records.',
      );
    });

    it('writes links to non-existent records', () => {
      const writer = new RelayRecordWriter({}, {}, false);
      writer.putRecord('1', 'Type');
      writer.putLinkedRecordIDs('1', 'link', ['2']);
      expect(writer.getLinkedRecordIDs('1', 'link')).toEqual(['2']);
    });

    it('writes one-to-n links between records', () => {
      const cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      const store = new RelayRecordWriter({}, {}, false, null, cache);
      store.putRecord('storyID', 'Type');
      store.putRecord('actor1', 'Type');
      store.putRecord('actor2', 'Type');
      store.putLinkedRecordIDs('storyID', 'actors', ['actor1', 'actor2']);
      expect(store.getLinkedRecordIDs('storyID', 'actors')).toEqual([
        'actor1',
        'actor2',
      ]);
      expect(cache.writeField).toBeCalledWith('storyID', 'actors', [
        {__dataID__: 'actor1'},
        {__dataID__: 'actor2'},
      ]);
    });

    it('writes linked records optimistically', () => {
      const records = {};
      const store = new RelayRecordWriter(
        records,
        {},
        true,
        null,
        null,
        'mutationID',
      );

      store.putRecord('a', 'Type');
      store.putRecord('b', 'Type');

      store.putLinkedRecordIDs('a', 'friends', ['b']);
      expect(store.getLinkedRecordIDs('a', 'friends')).toEqual(['b']);
      expect(records.a.__status__).toBe(
        RelayRecordStatusMap.setOptimisticStatus(0, true),
      );
      expect(records.a.__mutationIDs__).toEqual(['mutationID']);
    });
  });

  describe('putRange()', () => {
    it('throws if the record does not exist', () => {
      const store = new RelayRecordWriter({}, {}, false);
      expect(() => {
        store.putRange('1', []);
      }).toFailInvariant(
        'RelayRecordWriter.putRange(): Expected record `1` to exist ' +
          'before adding a range.',
      );
    });

    it('creates ranges if not defined', () => {
      const cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      const records = {};
      const store = new RelayRecordWriter(records, {}, false, null, cache);
      store.putRecord('1', 'Type');
      store.putRange('1', []);
      expect(records['1'].__range__ instanceof GraphQLRange).toBe(true);
      expect(cache.writeField).toBeCalledWith(
        '1',
        '__range__',
        records['1'].__range__,
      );
    });

    it('overwrites ranges if present', () => {
      const cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      const records = {};
      const store = new RelayRecordWriter(records, {}, false, null, cache);
      store.putRecord('1', 'Type');
      store.putRange('1', []);
      const range1 = records['1'].__range__;
      store.putRange('1', []);
      const range2 = records['1'].__range__;
      expect(range2 instanceof GraphQLRange).toBe(true);
      expect(range1).not.toBe(range2);
      expect(cache.writeField).toBeCalledWith('1', '__range__', range2);
      expect(cache.writeField).toBeCalledWith('1', '__forceIndex__', 0);
      expect(cache.writeField).toBeCalledWith('1', '__filterCalls__', []);
    });

    it('sets the force index for the new range', () => {
      const cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      const records = {};
      const store = new RelayRecordWriter(records, {}, false, null, cache);
      expect(store.getRangeForceIndex('1')).toBe(0); // not in store yet
      store.putRecord('1', 'Type');
      store.putRange('1', []);
      expect(store.getRangeForceIndex('1')).toBe(0);
      store.putRange('1', [], 10);
      expect(store.getRangeForceIndex('1')).toBe(10);
      expect(cache.writeField).toBeCalledWith('1', '__forceIndex__', 10);
    });

    it('returns a negative force index for deleted ranges', () => {
      const records = {};
      const store = new RelayRecordWriter(records, {}, false);
      store.putRecord('1', 'Type');
      store.putRange('1', []);
      store.deleteRecord('1');
      expect(store.getRecordState('1')).toBe('NONEXISTENT');
      expect(store.getRangeForceIndex('1')).toBe(-1);
    });

    it('sets the filter calls for a range', () => {
      const cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      const records = {};
      const store = new RelayRecordWriter(records, {}, false, null, cache);
      const calls = [
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
        calls.slice(0, 1),
      );
    });
  });

  describe('putRangeEdges()', () => {
    it('throws if the record or range does not exist', () => {
      const store = new RelayRecordWriter({}, {}, false);
      expect(() => {
        store.putRangeEdges('1', [], {}, []);
      }).toFailInvariant(
        'RelayRecordWriter.putRangeEdges(): Expected record `1` to exist and ' +
          'have a range.',
      );
      store.putRecord('1', 'Type');
      expect(() => {
        store.putRangeEdges('1', [], {}, []);
      }).toFailInvariant(
        'RelayRecordWriter.putRangeEdges(): Expected record `1` to exist and ' +
          'have a range.',
      );
    });

    it('adds edges to the range', () => {
      const connectionID = '1';
      const cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      const records = {};
      const nodeConnectionMap = {};
      const store = new RelayRecordStore({records}, null, nodeConnectionMap);
      const writer = new RelayRecordWriter(
        records,
        {},
        false,
        nodeConnectionMap,
        cache,
      );
      writer.putRecord(connectionID, 'Type');
      writer.putRange(connectionID, []);
      const pageInfo = {
        [HAS_NEXT_PAGE]: true,
        [HAS_PREV_PAGE]: false,
      };
      const calls = [{name: 'first', value: 3}];
      const edges = [];
      const nodes = [];
      for (let ii = 0; ii < 3; ii++) {
        var edgeID = 'edge' + ii;
        var nodeID = 'node' + ii;
        writer.putRecord(edgeID, 'Type');
        writer.putRecord(nodeID, 'Type');
        writer.putLinkedRecordID(edgeID, 'node', nodeID);
        writer.putField(edgeID, 'cursor', 'cursor' + ii);
        edges.push(edgeID);
        nodes.push(nodeID);
      }
      writer.putRangeEdges(connectionID, calls, pageInfo, edges);

      // node are automatically associated with the range
      nodes.forEach(eachNodeID => {
        expect(Object.keys(nodeConnectionMap[eachNodeID])).toEqual([
          connectionID,
        ]);
      });

      const rangeInfo = store.getRangeMetadata(connectionID, calls);
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
        records[connectionID].__range__,
      );
    });
  });

  describe('applyRangeUpdate()', () => {
    let cache;
    let connectionID;
    let firstEdgeID;
    let firstNodeID;
    let lastEdgeID;
    let optimisticWriter;
    let queuedRecords;
    let records;
    let store;
    let writer;

    let _inc = 0;
    function addEdgeToStore(writerArg) {
      const index = _inc++;
      const edgeID = 'edge:' + index;
      const nodeID = 'node:' + index;
      const cursor = 'cursor:' + index;

      writerArg.putRecord(edgeID, 'Type');
      writerArg.putRecord(nodeID, 'Type');
      writerArg.putLinkedRecordID(edgeID, 'node', nodeID);
      writerArg.putField(edgeID, 'cursor', cursor);

      return {cursor, edgeID, nodeID};
    }

    beforeEach(() => {
      records = {};
      queuedRecords = {};
      cache = RelayMockCacheManager.genCacheManager().getQueryWriter();
      const nodeConnectionMap = {};
      store = new RelayRecordStore(
        {records, queuedRecords},
        null,
        nodeConnectionMap,
      );
      writer = new RelayRecordWriter(
        records,
        {},
        false,
        nodeConnectionMap,
        cache,
      );
      optimisticWriter = new RelayRecordWriter(
        queuedRecords,
        {},
        true,
        nodeConnectionMap,
        cache,
        'mutationID',
      );
      connectionID = '123';

      // create a range record
      writer.putRecord(connectionID, 'Type');
      writer.putRange(connectionID, []);
      optimisticWriter.putRecord(connectionID, 'Type');

      // ...with a first edge
      let edge = addEdgeToStore(writer);
      firstEdgeID = edge.edgeID;
      firstNodeID = edge.nodeID;
      writer.putRangeEdges(
        connectionID,
        [{name: 'first', value: 1}],
        {
          [HAS_NEXT_PAGE]: true,
          [HAS_PREV_PAGE]: false,
        },
        [firstEdgeID],
      );

      // ...and a last edge
      edge = addEdgeToStore(writer);
      lastEdgeID = edge.edgeID;
      writer.putRangeEdges(
        connectionID,
        [{name: 'last', value: 1}],
        {
          [HAS_NEXT_PAGE]: false,
          [HAS_PREV_PAGE]: true,
        },
        [lastEdgeID],
      );

      cache.writeNode.mockClear();
      cache.writeField.mockClear();
      cache.writeRootCall.mockClear();
    });

    it('throws if the connection does not exist', () => {
      const {edgeID} = addEdgeToStore(writer);
      expect(() => {
        writer.applyRangeUpdate('client:does.not.exist', edgeID, PREPEND);
      }).toFailInvariant(
        'RelayRecordWriter: Cannot apply `prepend` ' +
          'update to non-existent record `client:does.not.exist`.',
      );
    });

    it('prepends edges to base stores', () => {
      const {edgeID, nodeID} = addEdgeToStore(writer);
      writer.applyRangeUpdate(connectionID, edgeID, PREPEND);

      // contains prepended edge
      const calls = [{name: 'first', value: 2}];
      const rangeInfo = store.getRangeMetadata(connectionID, calls);
      expect(rangeInfo.filteredEdges.map(edge => edge.edgeID)).toEqual([
        edgeID,
        firstEdgeID,
      ]);
      expect(store.getConnectionIDsForRecord(nodeID)).toEqual([connectionID]);
      expect(cache.writeField).toBeCalledWith(
        connectionID,
        '__range__',
        records[connectionID].__range__,
      );
    });

    it('optimistically prepends edges to queued stores', () => {
      const {edgeID} = addEdgeToStore(optimisticWriter);
      optimisticWriter.applyRangeUpdate(connectionID, edgeID, PREPEND);

      // contains prepended edge
      const calls = [{name: 'first', value: 2}];
      const rangeInfo = store.getRangeMetadata(connectionID, calls);
      expect(rangeInfo.filteredEdges.map(edge => edge.edgeID)).toEqual([
        edgeID,
        firstEdgeID,
      ]);
      // cache not updated on optimistic range update
      expect(cache.writeField).not.toBeCalledWith(
        connectionID,
        '__range__',
        records[connectionID].__range__,
      );

      expect(queuedRecords[connectionID].__status__).toBe(
        RelayRecordStatusMap.setOptimisticStatus(0, true),
      );
      expect(queuedRecords[connectionID].__mutationIDs__).toEqual([
        'mutationID',
      ]);
    });

    it('appends edges to base stores', () => {
      const {edgeID, nodeID} = addEdgeToStore(writer);
      writer.applyRangeUpdate(connectionID, edgeID, APPEND);

      // contains appended edge
      const calls = [{name: 'last', value: 2}];
      const rangeInfo = store.getRangeMetadata(connectionID, calls);
      expect(rangeInfo.filteredEdges.map(edge => edge.edgeID)).toEqual([
        lastEdgeID,
        edgeID,
      ]);
      expect(store.getConnectionIDsForRecord(nodeID)).toEqual([connectionID]);
      expect(cache.writeField).toBeCalledWith(
        connectionID,
        '__range__',
        records[connectionID].__range__,
      );
    });

    it('optimistically appends edges to queued stores', () => {
      const {edgeID, nodeID} = addEdgeToStore(optimisticWriter);
      optimisticWriter.applyRangeUpdate(connectionID, edgeID, APPEND);

      // contains appended edge
      const calls = [{name: 'last', value: 2}];
      const rangeInfo = store.getRangeMetadata(connectionID, calls);
      expect(rangeInfo.filteredEdges.map(edge => edge.edgeID)).toEqual([
        lastEdgeID,
        edgeID,
      ]);
      // cache not updated on optimistic range update
      expect(cache.writeField).not.toBeCalledWith(
        connectionID,
        '__range__',
        records[connectionID].__range__,
      );

      expect(store.getConnectionIDsForRecord(nodeID)).toEqual(null);
      expect(queuedRecords[connectionID].__status__).toBe(
        RelayRecordStatusMap.setOptimisticStatus(0, true),
      );
      expect(queuedRecords[connectionID].__mutationIDs__).toEqual([
        'mutationID',
      ]);
    });

    it('deletes edges from base stores', () => {
      expect(store.getConnectionIDsForRecord(firstNodeID)).toEqual([
        connectionID,
      ]);
      writer.applyRangeUpdate(connectionID, firstEdgeID, REMOVE);

      // does not contain removed edge
      const calls = [{name: 'first', value: 2}];
      const rangeInfo = store.getRangeMetadata(connectionID, calls);
      expect(rangeInfo.filteredEdges).toEqual([]);
      expect(store.getConnectionIDsForRecord(firstNodeID)).toEqual(null);
      expect(cache.writeField).toBeCalledWith(
        connectionID,
        '__range__',
        records[connectionID].__range__,
      );
    });

    it('optimistically deletes existing edges from queued stores', () => {
      optimisticWriter.applyRangeUpdate(connectionID, firstEdgeID, REMOVE);

      // does not contain removed edge
      const calls = [{name: 'first', value: 2}];
      const rangeInfo = store.getRangeMetadata(connectionID, calls);
      expect(rangeInfo.filteredEdges).toEqual([]);
      // cache not updated on optimistic range update
      expect(cache.writeField).not.toBeCalledWith(
        connectionID,
        '__range__',
        records[connectionID].__range__,
      );

      // base store is unchanged
      expect(store.getConnectionIDsForRecord(firstNodeID)).toEqual([
        connectionID,
      ]);
      expect(queuedRecords[connectionID].__status__).toBe(
        RelayRecordStatusMap.setOptimisticStatus(0, true),
      );
      expect(queuedRecords[connectionID].__mutationIDs__).toEqual([
        'mutationID',
      ]);
    });

    it('deletes optimistically prepended edges from queued stores', () => {
      const {edgeID} = addEdgeToStore(optimisticWriter);
      optimisticWriter.applyRangeUpdate(connectionID, edgeID, PREPEND);
      optimisticWriter.applyRangeUpdate(connectionID, edgeID, REMOVE);

      // does not contain prepended & removed edge
      const calls = [{name: 'first', value: 1}];
      const rangeInfo = store.getRangeMetadata(connectionID, calls);
      expect(rangeInfo.filteredEdges.map(edge => edge.edgeID)).toEqual([
        firstEdgeID,
      ]);
    });

    it('deletes optimistically appended edges from queued stores', () => {
      const {edgeID} = addEdgeToStore(optimisticWriter);
      optimisticWriter.applyRangeUpdate(connectionID, edgeID, APPEND);
      optimisticWriter.applyRangeUpdate(connectionID, edgeID, REMOVE);

      // does not contain prepended & removed edge
      const calls = [{name: 'last', value: 1}];
      const rangeInfo = store.getRangeMetadata(connectionID, calls);
      expect(rangeInfo.filteredEdges.map(edge => edge.edgeID)).toEqual([
        lastEdgeID,
      ]);
    });
  });

  describe('setHasDeferredFragmentData()', () => {
    it('creates a cache in honor of the first entry', () => {
      const records = {a: {}};
      const store = new RelayRecordWriter(records, {}, false);
      store.setHasDeferredFragmentData('a', 'fragID');
      expect(records.a.hasOwnProperty('__resolvedFragmentMap__')).toBe(true);
    });

    it('creates a key in an already existing cache', () => {
      const resolvedFragmentMap = {fragID: true};
      const records = {
        a: {__resolvedFragmentMap__: resolvedFragmentMap},
      };
      const store = new RelayRecordWriter(records, {}, false);
      store.setHasDeferredFragmentData('a', 'otherFragID');
      expect(resolvedFragmentMap.hasOwnProperty('otherFragID')).toBe(true);
    });

    it("increments generation when a fragment's resolvedness changes", () => {
      const records = {
        // No resolved fragment map at all
        a: {},
        // Map does not contain a key corresponding to our fragment
        b: {
          __resolvedFragmentMap__: {otherFragID: true},
          __resolvedFragmentMapGeneration__: 0,
        },
      };
      const store = new RelayRecordWriter(records, {}, false);
      store.setHasDeferredFragmentData('a', 'fragID');
      expect(records.a.__resolvedFragmentMapGeneration__).toBe(0);
      store.setHasDeferredFragmentData('b', 'fragID');
      expect(records.b.__resolvedFragmentMapGeneration__).toBe(1);
    });

    it(
      "increments the generation even when a fragment's resolvedness " +
        'does not change',
      () => {
        const records = {
          // No resolved fragment map at all
          a: {},
          // Map contains a key corresponding to our fragment
          b: {
            __resolvedFragmentMap__: {fragID: true},
            __resolvedFragmentMapGeneration__: 0,
          },
        };
        const store = new RelayRecordWriter(records, {}, false);
        store.setHasDeferredFragmentData('a', 'fragID');
        expect(records.a.__resolvedFragmentMapGeneration__).toBe(0);
        store.setHasDeferredFragmentData('b', 'fragID');
        expect(records.b.__resolvedFragmentMapGeneration__).toBe(1);
      },
    );
  });
});

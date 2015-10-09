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

jest.dontMock('GraphQLSegment');

var GraphQLSegment = require('GraphQLSegment');
var GraphQLStoreDataHandler = require('GraphQLStoreDataHandler');
GraphQLStoreDataHandler.getID.mockImplementation(function(data) {
  return data.__dataID__;
});

var edges = [
  {
    __dataID__:'edge1',
    node: {__dataID__: 'id1'},
    cursor: 'cursor1'
  }, {
    __dataID__:'edge2',
    node: {__dataID__: 'id2'},
    cursor: 'cursor2'
  }, {
    __dataID__:'edge3',
    node: {__dataID__: 'id3'},
    cursor: 'cursor3'
  }
];

var moreEdges = [
  {
    __dataID__:'edge4',
    node: {__dataID__: 'id4'},
    cursor: 'cursor4'
  }, {
    __dataID__:'edge5',
    node: {__dataID__: 'id5'},
    cursor: 'cursor5'
  }, {
    __dataID__:'edge6',
    node: {__dataID__: 'id6'},
    cursor: 'cursor6'
  }
];

var lastEdges = [
  {
    __dataID__:'edge98',
    node: {__dataID__: 'id98'},
    cursor: 'cursor98'
  }, {
    __dataID__:'edge99',
    node: {__dataID__: 'id99'},
    cursor: 'cursor99'
  }, {
    __dataID__:'edge100',
    node: {__dataID__: 'id100'},
    cursor: 'cursor100'
  }
];

var beforeLastEdges = [
  {
    __dataID__:'edge95',
    node: {__dataID__: 'id95'},
    cursor: 'cursor95'
  }, {
    __dataID__:'edge96',
    node: {__dataID__: 'id96'},
    cursor: 'cursor96'
  }, {
    __dataID__:'edge97',
    node: {__dataID__: 'id97'},
    cursor: 'cursor97'
  }
];

var oneEdge = {
  __dataID__:'edgeOneEdge',
  node: {__dataID__: 'idOneEdge'},
  cursor: 'cursorOneEdge'
};

var anotherEdge = {
  __dataID__:'edgeAnotherEdge',
  node: {__dataID__: 'idAnotherEdge'},
  cursor: 'cursorAnotherEdge'
};

/**
 * Returns all valid ids and cursors.
 */
function getAllMetadata(segment) {
  return segment.getMetadataAfterCursor(segment.getLength(), null);
}

describe('GraphQLSegment', () => {
  var segment;
  var consoleWarn;

  beforeEach(() => {
    segment = new GraphQLSegment();
    consoleWarn = console.warn;
  });

  afterEach(() => {
    console.warn = consoleWarn;
  });

  it('should add after', () => {
    // Initial add
    segment.addEdgesAfterCursor(edges, null);
    var metadata = getAllMetadata(segment);
    expect(metadata.edgeIDs).toEqual(['edge1', 'edge2', 'edge3']);
    expect(metadata.cursors).toEqual(['cursor1', 'cursor2', 'cursor3']);

    // Add more
    segment.addEdgesAfterCursor(moreEdges, 'cursor3');
    metadata = getAllMetadata(segment);
    expect(metadata.edgeIDs).toEqual(
      ['edge1', 'edge2', 'edge3', 'edge4', 'edge5', 'edge6']
    );
    expect(metadata.cursors).toEqual(
      ['cursor1', 'cursor2', 'cursor3', 'cursor4', 'cursor5', 'cursor6']
    );

  });

  it('should add before', () => {
    // Initial add
    segment.addEdgesBeforeCursor(lastEdges, null);
    var metadata = getAllMetadata(segment);
    expect(metadata.edgeIDs).toEqual(['edge98', 'edge99', 'edge100']);
    expect(metadata.cursors).toEqual(['cursor98', 'cursor99', 'cursor100']);

    // Add more
    segment.addEdgesBeforeCursor(beforeLastEdges, 'cursor98');
    metadata = getAllMetadata(segment);
    expect(metadata.edgeIDs).toEqual(
      ['edge95', 'edge96', 'edge97', 'edge98', 'edge99', 'edge100']
    );
    expect(metadata.cursors).toEqual(
      ['cursor95', 'cursor96', 'cursor97', 'cursor98', 'cursor99', 'cursor100']
    );

  });

  it('should prepend', () => {
    // Prepend on new segment
    segment.prependEdge(oneEdge);
    var metadata = getAllMetadata(segment);
    expect(metadata.edgeIDs).toEqual(['edgeOneEdge']);
    expect(metadata.cursors).toEqual(['cursorOneEdge']);

    // Prepend on segment that already has item
    segment.prependEdge(anotherEdge);
    metadata = getAllMetadata(segment);
    expect(metadata.edgeIDs).toEqual(['edgeAnotherEdge', 'edgeOneEdge']);
    expect(metadata.cursors).toEqual(['cursorAnotherEdge', 'cursorOneEdge']);
  });

  it('should append', () => {
    // Append on new segment
    segment.appendEdge(oneEdge);
    var metadata = getAllMetadata(segment);
    expect(metadata.edgeIDs).toEqual(['edgeOneEdge']);
    expect(metadata.cursors).toEqual(['cursorOneEdge']);

    // Append on segment that already has item
    segment.appendEdge(anotherEdge);
    metadata = getAllMetadata(segment);
    expect(metadata.edgeIDs).toEqual(['edgeOneEdge', 'edgeAnotherEdge']);
    expect(metadata.cursors).toEqual(['cursorOneEdge', 'cursorAnotherEdge']);
  });

  it('should retrieve metadata correctly', () => {
    var before = segment.getMetadataBeforeCursor(
      segment.getLength(),
      null
    );
    var after = segment.getMetadataAfterCursor(
      segment.getLength(),
      null
    );

    expect(before.edgeIDs).toEqual([]);
    expect(before.edgeIDs).toEqual(after.edgeIDs);
    expect(before.cursors).toEqual([]);
    expect(before.cursors).toEqual(after.cursors);

    segment.addEdgesAfterCursor(edges, null);
    before = segment.getMetadataBeforeCursor(
      segment.getLength(),
      null
    );
    after = segment.getMetadataAfterCursor(
      segment.getLength(),
      null
    );
    expect(before.edgeIDs).toEqual(['edge1', 'edge2', 'edge3']);
    expect(before.edgeIDs).toEqual(after.edgeIDs);
    expect(before.cursors).toEqual(['cursor1', 'cursor2', 'cursor3']);
    expect(before.cursors).toEqual(after.cursors);
  });

  it('should remove', () => {
    segment.addEdgesAfterCursor(edges, null);
    // Remove the middle edge
    segment.removeEdge('edge2');
    var metadata = getAllMetadata(segment);
    expect(metadata.edgeIDs).toEqual(['edge1', 'edge3']);
    expect(metadata.cursors).toEqual(['cursor1', 'cursor3']);
  });

  it('should include removed edges in `getLength()` calculation', () => {
    expect(segment.getCount()).toBe(0);
    segment.addEdgesAfterCursor(edges, null);
    expect(segment.getLength()).toBe(3);
    segment.removeEdge('edge2');
    expect(segment.getLength()).toBe(3);
  });

  it('should exclude removed edges from `getCount()` calculation', () => {
    // with addEdgesAfterCursor
    expect(segment.getCount()).toBe(0);
    segment.addEdgesAfterCursor(edges, null);
    expect(segment.getCount()).toBe(3);
    segment.removeEdge('edge2');
    expect(segment.getCount()).toBe(2);

    // with concatSegment
    var otherSegment = new GraphQLSegment();
    otherSegment.addEdgesAfterCursor(edges.slice(0, 2), null);
    expect(otherSegment.getCount()).toBe(2);
    otherSegment.removeEdge('edge2');
    expect(otherSegment.getCount()).toBe(1);
    segment.removeEdge('edge1');
    otherSegment.concatSegment(segment, null);
    expect(otherSegment.getCount()).toBe(2);
  });

  it('rolls back failed concatSegment operations', () => {
    console.warn = jest.genMockFunction();
    segment.addEdgesAfterCursor(edges.slice(0, 2), null);
    expect(segment.getCount()).toBe(2);
    expect(segment.getLength()).toBe(2);

    var otherSegment = new GraphQLSegment();
    otherSegment.addEdgesAfterCursor(edges.slice(1, 2), null);

    var concatResult = segment.concatSegment(otherSegment);
    expect(concatResult).toBe(false);
    expect(console.warn).toBeCalledWith(
      'Attempt to concat an ID already in GraphQLSegment: %s',
      'edge2'
    );
    expect(segment.getCount()).toBe(2);
    expect(segment.getLength()).toBe(2);
  });

  it('rolls back bumped edges from failed concatSegment operations', () => {
    console.warn = jest.genMockFunction();
    segment.addEdgesAfterCursor(edges.slice(0, 2), null);
    expect(segment.__debug().idToIndices.edge2.length).toBe(1);

    var otherSegment = new GraphQLSegment();
    var edge2 = edges.slice(1, 2);
    otherSegment.addEdgesAfterCursor(edge2, null);
    // bumping the edge
    otherSegment.removeEdge('edge2', 1001);
    otherSegment.addEdgesAfterCursor(edge2, null, 1001);

    var concatResult = segment.concatSegment(otherSegment);
    expect(concatResult).toBe(false);
    expect(console.warn).toBeCalledWith(
      'Attempt to concat an ID already in GraphQLSegment: %s',
      'edge2'
    );
    // Make sure it rolled back the deleted edge from indices map
    expect(segment.__debug().idToIndices.edge2.length).toBe(1);
  });

  it('should check for valid id in segment', () => {
    segment.addEdgesAfterCursor(edges, null);
    // Remove the middle edge
    segment.removeEdge('edge2');

    // Never added
    expect(segment.containsEdgeWithID('edge0')).toBeFalsy();
    // Added
    expect(segment.containsEdgeWithID('edge1')).toBeTruthy();
    // Deleted
    expect(segment.containsEdgeWithID('edge2')).toBeFalsy();
  });

  it('should check for valid cursor in segment', () => {
    segment.addEdgesAfterCursor(edges, null);
    // Remove the middle edge
    segment.removeEdge('edge2');

    // Never added
    expect(segment.containsEdgeWithCursor('cursor0')).toBeFalsy();
    // Added
    expect(segment.containsEdgeWithCursor('cursor1')).toBeTruthy();
    // Deleted
    expect(segment.containsEdgeWithCursor('cursor2')).toBeFalsy();
  });

  it('should get first and last cursor in segment', () => {
    // Returns undefined for empty segment
    expect(segment.getFirstCursor()).toBeUndefined();
    expect(segment.getLastCursor()).toBeUndefined();

    // Returns property for basic edges
    segment.addEdgesAfterCursor(edges, null);
    expect(segment.getFirstCursor()).toEqual('cursor1');
    expect(segment.getLastCursor()).toEqual('cursor3');

    // Skips over deleted edges
    segment.removeEdge('edge1');
    segment.removeEdge('edge3');
    expect(segment.getFirstCursor()).toEqual('cursor2');
    expect(segment.getLastCursor()).toEqual('cursor2');

    // Returns undefined when all edges are deleted
    segment.removeEdge('edge2');
    expect(segment.getFirstCursor()).toBeUndefined();
    expect(segment.getLastCursor()).toBeUndefined();

    // Appends and prepends new edges
    segment.prependEdge(oneEdge);
    segment.appendEdge(anotherEdge);
    expect(segment.getFirstCursor()).toEqual('cursorOneEdge');
    expect(segment.getLastCursor()).toEqual('cursorAnotherEdge');

    // Returns null for null cursors
    segment = new GraphQLSegment();
    segment.addEdgesAfterCursor(
      [{__dataID__: 'edgeid', cursor: null, node: {__dataID__: 'id'}}],
      null
    );
    expect(segment.getFirstCursor()).toBeNull();
    expect(segment.getLastCursor()).toBeNull();
  });

  it('should get first and last id in segment', () => {
    // Returns undefined for empty segment
    expect(segment.getFirstID()).toBeUndefined();
    expect(segment.getLastID()).toBeUndefined();

    // Returns property for basic edges
    segment.addEdgesAfterCursor(edges, null);
    expect(segment.getFirstID()).toEqual('edge1');
    expect(segment.getLastID()).toEqual('edge3');

    // Skips over deleted edges
    segment.removeEdge('edge1');
    segment.removeEdge('edge3');
    expect(segment.getFirstID()).toEqual('edge2');
    expect(segment.getLastID()).toEqual('edge2');

    // Returns undefined when all edges are deleted
    segment.removeEdge('edge2');
    expect(segment.getFirstID()).toBeUndefined();
    expect(segment.getLastID()).toBeUndefined();

    // Appends and prepends new edges
    segment.prependEdge(oneEdge);
    segment.appendEdge(anotherEdge);
    expect(segment.getFirstID()).toEqual('edgeOneEdge');
    expect(segment.getLastID()).toEqual('edgeAnotherEdge');
  });

  it('should concat segments', () => {
    segment.addEdgesAfterCursor(edges, null);
    var segment2 = new GraphQLSegment();
    segment2.addEdgesAfterCursor(moreEdges, null);
    var concatenated = segment.concatSegment(segment2);
    expect(concatenated).toBe(true);
    var metadata = getAllMetadata(segment);
    expect(metadata.edgeIDs).toEqual(
      ['edge1', 'edge2', 'edge3', 'edge4', 'edge5', 'edge6']
    );
    expect(metadata.cursors).toEqual(
      ['cursor1', 'cursor2', 'cursor3', 'cursor4', 'cursor5', 'cursor6']
    );
  });

  it('should concat with empty segments', () => {
    var segment2 = new GraphQLSegment();
    segment2.addEdgesAfterCursor(edges, null);
    // Concatenating from an empty segment
    var concatenated = segment.concatSegment(segment2);
    expect(concatenated).toBe(true);
    var metadata = getAllMetadata(segment);
    expect(metadata.edgeIDs).toEqual(['edge1', 'edge2', 'edge3']);
    expect(metadata.cursors).toEqual(['cursor1', 'cursor2', 'cursor3']);

    var segment3 = new GraphQLSegment();
    // Concatenating empty segment
    concatenated = segment.concatSegment(segment3);
    expect(concatenated).toBe(true);
    metadata = getAllMetadata(segment);
    expect(metadata.edgeIDs).toEqual(['edge1', 'edge2', 'edge3']);
    expect(metadata.cursors).toEqual(['cursor1', 'cursor2', 'cursor3']);
  });

  it('should concat with deleted edges', () => {
    // Makes sure we update cursor and id to index map correctly
    // based on removal time.
    var edges345 = [
      {
        __dataID__: 'edge3',
        node: {__dataID__: 'id3'},
        cursor: 'cursor3'
      }, {
        __dataID__: 'edge4',
        node: {__dataID__: 'id4'},
        cursor: 'cursor4'
      }, {
        __dataID__: 'edge5',
        node: {__dataID__: 'id5'},
        cursor: 'cursor5'
      }
    ];

    // deleted edge in the original segment
    segment.addEdgesAfterCursor(edges, null);
    segment.removeEdge('edge3');
    var segment2 = new GraphQLSegment();
    segment2.addEdgesAfterCursor(edges345, null);
    var concatenated = segment.concatSegment(segment2);
    expect(concatenated).toBe(true);
    var metadata = getAllMetadata(segment);
    expect(metadata.edgeIDs).toEqual(
      ['edge1', 'edge2', 'edge3', 'edge4', 'edge5']
    );
    expect(metadata.cursors).toEqual(
      ['cursor1', 'cursor2', 'cursor3', 'cursor4', 'cursor5']
    );
    expect(segment.containsEdgeWithID('edge3')).toBe(true);
    expect(segment.containsEdgeWithCursor('cursor3')).toBe(true);

    // deleted edge in the input segment
    segment = new GraphQLSegment();
    segment.addEdgesAfterCursor(edges, null);
    segment2 = new GraphQLSegment();
    segment2.addEdgesAfterCursor(edges345, null);
    segment2.removeEdge('edge3');
    concatenated = segment.concatSegment(segment2);
    expect(concatenated).toBe(true);
    metadata = getAllMetadata(segment);
    expect(metadata.edgeIDs).toEqual(
      ['edge1', 'edge2', 'edge3', 'edge4', 'edge5']
    );
    expect(metadata.cursors).toEqual(
      ['cursor1', 'cursor2', 'cursor3', 'cursor4', 'cursor5']
    );
    expect(segment.containsEdgeWithID('edge3')).toBe(true);
    expect(segment.containsEdgeWithCursor('cursor3')).toBe(true);
  });

  it('should toJSON', () => {
    segment.addEdgesAfterCursor(edges, null);
    var actual = JSON.stringify(segment);
    expect(actual).toEqual('[{"0":{"edgeID":"edge1","cursor":"cursor1",' +
      '"deleted":false},"1":{"edgeID":"edge2","cursor":"cursor2",' +
      '"deleted":false},"2":{"edgeID":"edge3","cursor":"cursor3","deleted"' +
      ':false}},{"edge1":[0],"edge2":[1],"edge3":[2]},{"cursor1":0,' +
      '"cursor2":1,"cursor3":2},0,2,3]'
    );

    segment = GraphQLSegment.fromJSON(JSON.parse(actual));
    var metadata = getAllMetadata(segment);
    expect(metadata.edgeIDs).toEqual(['edge1', 'edge2', 'edge3']);
    expect(metadata.cursors).toEqual(['cursor1', 'cursor2', 'cursor3']);
  });
});

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

jest
  .dontMock('GraphQLSegment')
  .dontMock('GraphQLRange')
  .dontMock('GraphQL')
  .mock('warning');

var GraphQLRange = require('GraphQLRange');
var GraphQLStoreDataHandler = require('GraphQLStoreDataHandler');
var RelayConnectionInterface = require('RelayConnectionInterface');

function getFirstSegment(range) {
  return range.__debug().orderedSegments[0];
}

function getLastSegment(range) {
  var orderedSegments = range.__debug().orderedSegments;
  return orderedSegments[orderedSegments.length - 1];
}

function mockEdge(id, hasNullCursor) {
  var dataID = 'edge' + (hasNullCursor ? 'WithNullCursor' : '') + id;
  var edge = {
    __dataID__: dataID,
    node: {__dataID__: 'id' + id},
    cursor: (hasNullCursor ? null : 'cursor' + id)
  };
  return edge;
}

var edgeNeg10 = mockEdge('-10');
var edgeNeg9 = mockEdge('-9');
var edgeNeg3 = mockEdge('-3');
var edgeNeg2 = mockEdge('-2');
var edgeNeg1 = mockEdge('-1');
var edge0 = mockEdge('0');
var edge1 = mockEdge('1');
var edge2 = mockEdge('2');
var edge3 = mockEdge('3');
var edge4 = mockEdge('4');
var edge5 = mockEdge('5');
var edge96 = mockEdge('96');
var edge97 = mockEdge('97');
var edge98 = mockEdge('98');
var edge99 = mockEdge('99');
var edge100 = mockEdge('100');
var edge101 = mockEdge('101');
var edge102 = mockEdge('102');
var edge103 = mockEdge('103');
var edge104 = mockEdge('104');
var edge110 = mockEdge('110');
var edge111 = mockEdge('111');
var edgeWithNullCursor1 = mockEdge('1', true);
var edgeWithNullCursor2 = mockEdge('2', true);
var edgeWithNullCursor3 = mockEdge('3', true);

var first3Edges = [edge1, edge2, edge3];
var first5Edges = [edge1, edge2, edge3, edge4, edge5];
var last3Edges = [edge98, edge99, edge100];
var last5Edges = [edge96, edge97, edge98, edge99, edge100];

describe('GraphQLRange', () => {
  var consoleError;
  var consoleWarn;
  var range;

  var HAS_NEXT_PAGE, HAS_PREV_PAGE;

  beforeEach(() => {
    jest.resetModuleRegistry();
    consoleError = console.error;
    consoleWarn = console.warn;

    GraphQLStoreDataHandler.getID.mockImplementation(function(data) {
      return data.__dataID__;
    });
    range = new GraphQLRange();

    ({HAS_NEXT_PAGE, HAS_PREV_PAGE} = RelayConnectionInterface);

    jest.addMatchers(RelayTestUtils.matchers);
  });

  afterEach(() => {
    console.error = consoleError;
    console.warn = consoleWarn;
  });

  it('should add for first() query', () => {
    var queryCalls = [
      {name: 'first', value: 3}
    ];
    var pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false
    };

    range.addItems(queryCalls, first3Edges, pageInfo);

    // Request the full set
    var result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual(
      [edge1.__dataID__, edge2.__dataID__, edge3.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);
  });

  it('should add for after().first() query', () => {
    var queryCalls = [
      {name: 'after', value: null},
      {name: 'first', value: 3},
    ];
    var pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false
    };

    range.addItems(
      queryCalls,
      first3Edges,
      pageInfo
    );

    var incrementalEdges = [edge4, edge5];
    var incrementalPageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: true
    };

    queryCalls = [
      {name: 'after', value: 'cursor3'},
      {name: 'first', value: 2},
    ];
    range.addItems(
      queryCalls,
      incrementalEdges,
      incrementalPageInfo
    );

    // Request the full set
    queryCalls = [
      {name: 'after', value: null},
      {name: 'first', value: 5},
    ];
    var result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__,
      edge4.__dataID__,
      edge5.__dataID__
    ]);
    expect(result.diffCalls.length).toBe(0);

  });

  it('should add for after().first() query in last segment', () => {
    var queryCalls = [
      {name: 'last', value: 3},
    ];
    var pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true
    };

    range.addItems(queryCalls, last3Edges, pageInfo);

    var incrementalQueryCall = [
      {name: 'after', value: 'cursor100'},
      {name: 'first', value: 2}
    ];
    var incrementalEdges = [edge101, edge102];
    var incrementalPageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true
    };

    range.addItems(
      incrementalQueryCall,
      incrementalEdges,
      incrementalPageInfo
    );

    // Request the full set
    queryCalls = [
      {name: 'last', value: 5},
    ];
    var result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([
      edge98.__dataID__,
      edge99.__dataID__,
      edge100.__dataID__,
      edge101.__dataID__,
      edge102.__dataID__
    ]);
    expect(result.diffCalls.length).toBe(0);

  });

  it('should add for before().first() query', () => {
    var queryCalls = [
      {name: 'last', value: 3}
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false
    };

    range.addItems(queryCalls, first3Edges, pageInfo);

    var incrementalQueryCall = [
      {name: 'before', value: 'cursor1'},
      {name: 'first', value: 2}
    ];

    var incrementalEdges = [edgeNeg1, edge0];
    var incrementalPageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: false
    };
    range.addItems(
      incrementalQueryCall,
      incrementalEdges,
      incrementalPageInfo
    );
    // Request the full set to make sure it is stitched properly
    queryCalls = [
      {name: 'last', value: 5}
    ];
    var result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([
      edgeNeg1.__dataID__,
      edge0.__dataID__,
      edge1.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__
    ]);
    expect(result.diffCalls.length).toBe(0);

  });

  it('should add for before().first() query with gap', () => {
    var queryCalls = [
      {name: 'first', value: 3}
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false
    };

    range.addItems(queryCalls, first3Edges, pageInfo);

    var incrementalQueryCall = [
      {name: 'before', value: 'cursor1'},
      {name: 'first', value: 2}
    ];

    var incrementalEdges = [edgeNeg10, edgeNeg9];
    var incrementalPageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false
    };
    range.addItems(
      incrementalQueryCall,
      incrementalEdges,
      incrementalPageInfo
    );
    // Request super set
    queryCalls = [
      {name: 'first', value: 5}
    ];
    var result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual(
      [edgeNeg10.__dataID__, edgeNeg9.__dataID__]
    );
    expect(result.diffCalls).toEqual([
      {name: 'after', value: 'cursor-9'},
      {name: 'before', value: 'cursor1'},
      {name: 'first', value: 3}
    ]);

  });

  it('should add for last() query', () => {
    var queryCalls = [
      {name: 'last', value: 3}
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true
    };

    range.addItems(queryCalls, last3Edges, pageInfo);

    // Request the full set
    var result = range.retrieveRangeInfoForQuery(queryCalls, {count: 3});

    expect(result.requestedEdgeIDs).toEqual(
      [edge98.__dataID__, edge99.__dataID__, edge100.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);
  });

  it('should add for before().last() query', () => {
    var queryCalls = [
      {name: 'last', value: 3}
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true
    };

    range.addItems(queryCalls, last3Edges, pageInfo);

    var incrementalQueryCall = [
      {name: 'before', value: 'cursor98'},
      {name: 'last', value: 2}
    ];

    var incrementalEdges = [edge96, edge97];

    var incrementalPageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: true
    };

    range.addItems(
      incrementalQueryCall,
      incrementalEdges,
      incrementalPageInfo
    );

    // Request the full set
    queryCalls = [
      {name: 'last', value: 5}
    ];
    var result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([
      edge96.__dataID__,
      edge97.__dataID__,
      edge98.__dataID__,
      edge99.__dataID__,
      edge100.__dataID__
    ]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should add for before().last() query in first segment', () => {
    var queryCalls = [
      {name: 'first', value: 3}
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false
    };

    range.addItems(queryCalls, first3Edges, pageInfo);

    var incrementalQueryCall = [
      {name: 'before', value: 'cursor1'},
      {name: 'last', value: 2}
    ];

    var incrementalEdges = [edgeNeg1, edge0];
    var incrementalPageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false
    };

    range.addItems(
      incrementalQueryCall,
      incrementalEdges,
      incrementalPageInfo
    );

    // Request the full set
    queryCalls = [
      {name: 'first', value: 5}
    ];
    var result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([
      edgeNeg1.__dataID__,
      edge0.__dataID__,
      edge1.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__
    ]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should add for after().last() query', () => {
    var queryCalls = [
      {name: 'last', value: 3}
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true
    };

    range.addItems(queryCalls, last3Edges, pageInfo);
    var incrementalQueryCall = [
      {name: 'after', value: 'cursor100'},
      {name: 'last', value: 2}
    ];

    var incrementalEdges = [edge101, edge102];
    var incrementalPageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: false
    };

    range.addItems(
      incrementalQueryCall,
      incrementalEdges,
      incrementalPageInfo
    );

    // Request the full set
    queryCalls = [
      {name: 'last', value: 5}
    ];
    var result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([
      edge98.__dataID__,
      edge99.__dataID__,
      edge100.__dataID__,
      edge101.__dataID__,
      edge102.__dataID__
    ]);
    expect(result.diffCalls.length).toBe(0);

  });

  it('should add for after().last() with gap', () => {
    var queryCalls = [
      {name: 'after', value: null},
      {name: 'last', value: 3},
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true
    };

    range.addItems(queryCalls, last3Edges, pageInfo);

    queryCalls = [
      {name: 'after', value: 'cursor100'},
      {name: 'last', value: 2},
    ];
    range.addItems(
      queryCalls,
      [edge110, edge111],
      {[HAS_NEXT_PAGE]: false, [HAS_PREV_PAGE]: true}
    );

    // Request the super set
    queryCalls = [
      {name: 'after', value: null},
      {name: 'last', value: 5},
    ];
    var result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual(
      [edge110.__dataID__, edge111.__dataID__]
    );
    expect(result.diffCalls).toEqual([
      {name: 'before', value: 'cursor110'},
      {name: 'after', value: 'cursor100'},
      {name: 'last', value: 3}
    ]);
  });

  it('should error for invalid call value', () => {
    console.error = jest.genMockFunction();
    var queryCalls = [
      {name: 'first', value: 0}
    ];

    var result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(console.error.mock.calls.length).toBe(1);
    expect(console.error.mock.calls[0]).toEqual([
      'GraphQLRange only supports first(<count>) or last(<count>) ' +
      'where count is greater than 0'
    ]);
    expect(result.requestedEdgeIDs).toEqual([]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should retrieve for first() queries', () => {
    var queryCalls = [
      {name: 'first', value: 3}
    ];

    // Request from empty range
    var result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([]);
    expect(result.diffCalls).toEqual([{name: 'first', value: 3}]);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(false);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(true);

    var pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false
    };

    range.addItems(queryCalls, first3Edges, pageInfo);

    // Request the full set
    result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual(
      [edge1.__dataID__, edge2.__dataID__, edge3.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(false);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(true);

    // Request a subset
    queryCalls = [
      {name: 'first', value: 2}
    ];
    result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual(
      [edge1.__dataID__, edge2.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(false);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(true);

    // Request a superset
    queryCalls = [
      {name: 'first', value: 5}
    ];
    result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual(
      [edge1.__dataID__, edge2.__dataID__, edge3.__dataID__]
    );
    expect(result.diffCalls).toEqual([
      {name: 'after', value: 'cursor3'},
      {name: 'first', value: 2}
    ]);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(false);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(true);

  });

  it('should retrieve for after().first() queries', () => {
    var queryCalls = [
      {name: 'after', value: null},
      {name: 'first', value: 3},
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false
    };

    range.addItems(
      queryCalls,
      first3Edges,
      pageInfo
    );

    // Request a subset with after
    queryCalls = [
      {name: 'after', value: 'cursor1'},
      {name: 'first', value: 2},
    ];
    var result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual(
      [edge2.__dataID__, edge3.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(false);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(true);

    // Request a superset with after
    queryCalls = [
      {name: 'after', value: 'cursor1'},
      {name: 'first', value: 5},
    ];
    result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual(
      [edge2.__dataID__, edge3.__dataID__]
    );
    expect(result.diffCalls).toEqual([
      {name: 'after', value: 'cursor3'},
      {name: 'first', value: 3}
    ]);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(false);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(true);

    // Request a non-intersecting superset with after
    queryCalls = [
      {name: 'after', value: 'cursor3'},
      {name: 'first', value: 2},
    ];
    result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([]);
    expect(result.diffCalls).toEqual([
      {name: 'after', value: 'cursor3'},
      {name: 'first', value: 2}
    ]);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(false);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(true);
  });

  it('should retrieve for last() queries', () => {
    var queryCalls = [
      {name: 'last', value: 3},
    ];

    // Request the from empty range
    var result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([]);
    expect(result.diffCalls).toEqual([{name: 'last', value: 3}]);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(true);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(false);

    var pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true
    };

    range.addItems(queryCalls, last3Edges, pageInfo);

    // Request the full set
    result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual(
      [edge98.__dataID__, edge99.__dataID__, edge100.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(true);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(false);

    // Request a subset
    queryCalls = [{name: 'last', value: 2}];
    result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual(
      [edge99.__dataID__, edge100.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(true);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(false);

    // Requst a superset
    queryCalls = [{name: 'last', value: 5}];
    result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual(
      [edge98.__dataID__, edge99.__dataID__, edge100.__dataID__]
    );
    expect(result.diffCalls).toEqual([
      {name: 'before', value: 'cursor98'},
      {name: 'last', value: 2}
    ]);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(true);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(false);
  });

  it('should retrieve for before().last() queries', () => {
    var queryCalls = [
      {name: 'last', value: 3}
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true
    };

    range.addItems(queryCalls, last3Edges, pageInfo);

    // Request a subset with before
    var result = range.retrieveRangeInfoForQuery([
      {name: 'before', value: 'cursor100'},
      {name: 'last', value: 2}
    ]);

    expect(result.requestedEdgeIDs).toEqual(
      [edge98.__dataID__, edge99.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(true);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(false);

    // Request a superset with before
    result = range.retrieveRangeInfoForQuery([
      {name: 'before', value: 'cursor100'},
      {name: 'last', value: 5}
    ]);

    expect(result.requestedEdgeIDs).toEqual(
      [edge98.__dataID__, edge99.__dataID__]
    );
    expect(result.diffCalls).toEqual([
      {name: 'before', value: 'cursor98'},
      {name: 'last', value: 3}
    ]);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(true);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(false);

    // Request a non-intersecting superset with before
    result = range.retrieveRangeInfoForQuery([
      {name: 'before', value: 'cursor98'},
      {name: 'last', value: 2}
    ]);

    expect(result.requestedEdgeIDs).toEqual([]);
    expect(result.diffCalls).toEqual([
      {name: 'before', value: 'cursor98'},
      {name: 'last', value: 2}
    ]);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(true);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(false);

  });

  it('should retrieve for after().first() from last segment', () => {
    var queryCalls = [
      {name: 'last', value: 3}
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true
    };
    range.addItems(queryCalls, last3Edges, pageInfo);

    // Request a subset with after
    var result = range.retrieveRangeInfoForQuery([
      {name: 'after', value: 'cursor98'},
      {name: 'first', value: 1}
    ]);

    expect(result.requestedEdgeIDs).toEqual([edge99.__dataID__]);
    expect(result.diffCalls.length).toBe(0);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(false);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(true);

    // Request a superset with after
    result = range.retrieveRangeInfoForQuery([
      {name: 'after', value: 'cursor98'},
      {name: 'first', value: 5}
    ]);

    expect(result.requestedEdgeIDs).toEqual(
      [edge99.__dataID__, edge100.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(false);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(false);

    // Request a non-intersecting superset with after
    result = range.retrieveRangeInfoForQuery([
      {name: 'after', value: 'cursor100'},
      {name: 'first', value: 2}
    ]);

    expect(result.requestedEdgeIDs).toEqual([]);
    expect(result.diffCalls.length).toBe(0);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(false);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(false);

  });

  it('should retrieve for before().last() from first segment', () => {
    var queryCalls = [
      {name: 'first', value: 3}
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false
    };

    range.addItems(queryCalls, first3Edges, pageInfo);

    // Request a subset with before
    var result = range.retrieveRangeInfoForQuery([
      {name: 'before', value: 'cursor3'},
      {name: 'last', value: 1}
    ]);

    expect(result.requestedEdgeIDs).toEqual([edge2.__dataID__]);
    expect(result.diffCalls.length).toBe(0);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(true);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(false);

    // Request a superset with before
    result = range.retrieveRangeInfoForQuery([
      {name: 'before', value: 'cursor3'},
      {name: 'last', value: 5}
    ]);

    expect(result.requestedEdgeIDs).toEqual(
      [edge1.__dataID__, edge2.__dataID__]
    );
    expect(result.diffCalls).toEqual([]);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(false);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(false);

    // Request a non-intersecting superset with before
    result = range.retrieveRangeInfoForQuery([
      {name: 'before', value: 'cursor1'},
      {name: 'last', value: 2}
    ]);

    expect(result.requestedEdgeIDs).toEqual([]);
    expect(result.diffCalls).toEqual([]);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(false);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(false);

  });

  it('should support calls with no arguments', () => {
    var queryCalls = [
      {name: 'first', value: 3},
      {name: 'dummy_call', value: null},
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false
    };

    range.addItems(queryCalls, first3Edges, pageInfo);

    // Request the full set
    var result = range.retrieveRangeInfoForQuery([
      {name: 'first', value: 3},
      {name: 'dummy_call', value: null},
    ]);

    expect(result.requestedEdgeIDs).toEqual(
      [edge1.__dataID__, edge2.__dataID__, edge3.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);
  });

  it('should support nodes with null cursors', () => {
    var queryCalls = [
      {name: 'first', value: 3}
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false
    };

    var first3EdgesWithNullCursors = [
      edgeWithNullCursor1,
      edgeWithNullCursor2,
      edgeWithNullCursor3
    ];

    range.addItems(queryCalls, first3EdgesWithNullCursors, pageInfo);

    // Request the full set
    var result = range.retrieveRangeInfoForQuery([
      {name: 'first', value: 3}
    ]);

    expect(result.requestedEdgeIDs).toEqual([
      'edgeWithNullCursor1',
      'edgeWithNullCursor2',
      'edgeWithNullCursor3'
    ]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should support prepending edge to range', () => {
    // Prepend on new range
    range.prependEdge(edge2);
    var result = range.retrieveRangeInfoForQuery([
      {name: 'first', value: 1}
    ]);
    expect(result.requestedEdgeIDs).toEqual([edge2.__dataID__]);
    expect(result.diffCalls.length).toBe(0);

    // Prepend on range that already has edge
    range.prependEdge(edge1);
    result = range.retrieveRangeInfoForQuery([
      {name: 'first', value: 2}
    ]);
    expect(result.requestedEdgeIDs).toEqual(
      [edge1.__dataID__, edge2.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);
  });

  it('should support appending edge to range', () => {
    // Append on new range
    range.appendEdge(edge1);
    var result = range.retrieveRangeInfoForQuery([
      {name: 'last', value: 1}
    ]);
    expect(result.requestedEdgeIDs).toEqual([edge1.__dataID__]);
    expect(result.diffCalls.length).toBe(0);

    // Append on range that already has an edge
    range.appendEdge(edge2);
    result = range.retrieveRangeInfoForQuery([
      {name: 'last', value: 2}
    ]);
    expect(result.requestedEdgeIDs).toEqual(
      [edge1.__dataID__, edge2.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);
  });

  it('should support bumping', () => {
    var queryCalls = [
      {name: 'first', value: 3}
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false
    };

    range.addItems(queryCalls, first3Edges, pageInfo);

    var afterQueryCalls = [
      {name: 'after', value: 'cursor3'},
      {name: 'first', value: 1}
    ];

    // Testing add after: adding id2 to end of range
    range.addItems(afterQueryCalls, [first3Edges[1]], pageInfo);
    var result = range.retrieveRangeInfoForQuery(queryCalls);
    expect(result.requestedEdgeIDs).toEqual(
      [edge1.__dataID__, edge3.__dataID__, edge2.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);

    // Testing prepend: adding id3 to the front of the range
    range.prependEdge(first3Edges[2]);
    result = range.retrieveRangeInfoForQuery(queryCalls);
    expect(result.requestedEdgeIDs).toEqual(
      [edge3.__dataID__, edge1.__dataID__, edge2.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);

    queryCalls = [
      {name: 'last', value: 3}
    ];

    pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true
    };

    range.addItems(queryCalls, last3Edges, pageInfo);

    var beforeQueryCalls = [
      {name: 'before', value: 'cursor98'},
      {name: 'last', value: 1}
    ];

    // Testing add before: adding id99 to end of range
    range.addItems(beforeQueryCalls, [last3Edges[1]], pageInfo);
    result = range.retrieveRangeInfoForQuery(queryCalls);
    expect(result.requestedEdgeIDs).toEqual(
      [edge99.__dataID__, edge98.__dataID__, edge100.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);

    // Testing append: adding id98 to the end of the range
    range.appendEdge(last3Edges[0]);
    result = range.retrieveRangeInfoForQuery(queryCalls);
    expect(result.requestedEdgeIDs).toEqual(
      [edge99.__dataID__, edge100.__dataID__, edge98.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);
  });

  it('should not generate diff query when range is empty', () => {
    var queryFirstCalls = [
      {name: 'first', value: 3}
    ];

    var queryLastCalls = [
      {name: 'last', value: 3}
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: false
    };

    // Add empty first edges
    range.addItems(queryFirstCalls, [], pageInfo);

    var result = range.retrieveRangeInfoForQuery(queryFirstCalls);
    expect(result.diffCalls.length).toBe(0);
    result = range.retrieveRangeInfoForQuery(queryLastCalls);
    expect(result.diffCalls.length).toBe(0);

    // Add empty last edges
    range = new GraphQLRange();
    range.addItems(queryLastCalls, [], pageInfo);

    result = range.retrieveRangeInfoForQuery(queryFirstCalls);
    expect(result.diffCalls.length).toBe(0);
    result = range.retrieveRangeInfoForQuery(queryLastCalls);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should collesce segments when we reach end', () => {
    var queryFirstCalls = [
      {name: 'first', value: 1}
    ];

    var queryLastCalls = [
      {name: 'last', value: 1}
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: false
    };

    range.addItems(queryFirstCalls, [edge1], pageInfo);
    range.addItems(queryLastCalls, [edge1], pageInfo);

    var result = range.retrieveRangeInfoForQuery(queryFirstCalls);
    expect(result.requestedEdgeIDs).toEqual([edge1.__dataID__]);
    expect(result.diffCalls.length).toBe(0);
    result = range.retrieveRangeInfoForQuery(queryLastCalls);
    expect(result.requestedEdgeIDs).toEqual([edge1.__dataID__]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should not generate diff query when there is no more', () => {
    var queryCalls = [
      {name: 'first', value: 3}
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false
    };
    var beforeQueryCalls = [
      {name: 'before', value: 'cursor1'},
      {name: 'last', value: 1}
    ];

    range.addItems(queryCalls, first3Edges, pageInfo);
    var result = range.retrieveRangeInfoForQuery(beforeQueryCalls);
    // We know there is no more before cursor1 since that is the first edge
    expect(result.diffCalls.length).toBe(0);

    queryCalls = [
      {name: 'last', value: 3}
    ];

    pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true
    };
    var afterQueryCalls = [
      {name: 'after', value: 'cursor100'},
      {name: 'first', value: 1}
    ];

    range.addItems(queryCalls, last3Edges, pageInfo);
    result = range.retrieveRangeInfoForQuery(afterQueryCalls);
    // We know there is no more after cursor100 since that is the last edge
    expect(result.diffCalls.length).toBe(0);
  });

  it('should add  and retrieve for surrounds() query', () => {
    var queryCalls = [
      {name: 'surrounds', value: ['id2', 1]},
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: false
    };

    range.addItems(queryCalls, first3Edges, pageInfo);
    var result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual(
      [edge1.__dataID__, edge2.__dataID__, edge3.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);
  });

  it('should not return surrounds query data for first query', () => {
    var surroundQueryCalls = [
      {name: 'surrounds', value: ['id2', 1]},
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: false
    };

    range.addItems(surroundQueryCalls, first3Edges, pageInfo);

    var firstQueryCalls = [
      {name: 'first', value: 5}
    ];

    var resultForFirstQuery = range.retrieveRangeInfoForQuery(
      firstQueryCalls,
    );

    expect(resultForFirstQuery.requestedEdgeIDs).toEqual([]);
    expect(resultForFirstQuery.diffCalls).toEqual(firstQueryCalls);
  });

  it('should warn when reconciling conflicting first() ranges', () => {
    console.error = jest.genMockFunction();

    var queryCalls = [
      {name: 'first', value: 3}
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false
    };

    range.addItems(queryCalls, [edge1, edge2, edge3], pageInfo);
    range.addItems(queryCalls, [edge1, edge3, edge4], pageInfo);

    expect(console.error.mock.calls.length).toBe(0);
    expect([
      'Relay was unable to reconcile edges on a connection. This most ' +
      'likely occurred while trying to handle a server response that ' +
      'includes connection edges with nodes that lack an `id` field.'
    ]).toBeWarnedNTimes(1);

    var result = range.retrieveRangeInfoForQuery(queryCalls);
    expect(result.requestedEdgeIDs).toEqual(
      [edge1.__dataID__, edge2.__dataID__, edge3.__dataID__]
    );
  });

  it('should warn when reconciling conflicting last() ranges', () => {
    console.error = jest.genMockFunction();

    var queryCalls = [
      {name: 'last', value: 3}
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true
    };

    // Add items twice
    range.addItems(queryCalls, [edge98, edge99, edge100], pageInfo);
    range.addItems(queryCalls, [edge98, edge1, edge100], pageInfo);

    expect(console.error.mock.calls.length).toBe(0);
    expect([
      'Relay was unable to reconcile edges on a connection. This most ' +
      'likely occurred while trying to handle a server response that ' +
      'includes connection edges with nodes that lack an `id` field.'
    ]).toBeWarnedNTimes(1);

    var result = range.retrieveRangeInfoForQuery(queryCalls);
    expect(result.requestedEdgeIDs).toEqual(
      [edge98.__dataID__, edge99.__dataID__, edge100.__dataID__]
    );
  });

  it('should reconcile duplicated queries', () => {
    console.error = jest.genMockFunction();
    console.warn = jest.genMockFunction();

    var queryCalls = [
      {name: 'first', value: 3}
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false
    };

    // Add items twice
    range.addItems(queryCalls, first3Edges, pageInfo);
    range.addItems(queryCalls, first3Edges, pageInfo);

    expect(console.error.mock.calls.length).toBe(0);
    expect(console.warn.mock.calls.length).toBe(0);

    var result = range.retrieveRangeInfoForQuery(queryCalls);
    expect(result.requestedEdgeIDs).toEqual(
      [edge1.__dataID__, edge2.__dataID__, edge3.__dataID__]
    );

    queryCalls = [
      {name: 'last', value: 3}
    ];

    pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true
    };

    // Add items twice
    range.addItems(queryCalls, last3Edges, pageInfo);
    range.addItems(queryCalls, last3Edges, pageInfo);

    expect(console.error.mock.calls.length).toBe(0);
    expect(console.warn.mock.calls.length).toBe(0);

    result = range.retrieveRangeInfoForQuery(queryCalls);
    expect(result.requestedEdgeIDs).toEqual(
      [edge98.__dataID__, edge99.__dataID__, edge100.__dataID__]
    );
  });

  it('should reconcile extending queries', () => {
    console.error = jest.genMockFunction();
    console.warn = jest.genMockFunction();

    var queryCalls = [
      {name: 'first', value: 3}
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false
    };

    range.addItems(queryCalls, first3Edges, pageInfo);

    queryCalls = [
      {name: 'first', value: 5}
    ];
    range.addItems(queryCalls, first5Edges, pageInfo);

    expect(console.error.mock.calls.length).toBe(0);
    expect(console.warn.mock.calls.length).toBe(0);

    var result = range.retrieveRangeInfoForQuery(queryCalls);
    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__,
      edge4.__dataID__,
      edge5.__dataID__
    ]);

    queryCalls = [
      {name: 'last', value: 3}
    ];

    pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true
    };

    range.addItems(queryCalls, last3Edges, pageInfo);

    queryCalls = [
      {name: 'last', value: 5}
    ];
    range.addItems(queryCalls, last5Edges, pageInfo);

    expect(console.error.mock.calls.length).toBe(0);
    expect(console.warn.mock.calls.length).toBe(0);

    result = range.retrieveRangeInfoForQuery(queryCalls);
    expect(result.requestedEdgeIDs).toEqual([
      edge96.__dataID__,
      edge97.__dataID__,
      edge98.__dataID__,
      edge99.__dataID__,
      edge100.__dataID__
    ]);
  });

  it('should stitch first and last segment', () => {
    var firstQueryCalls = [
      {name: 'first', value: 3}
    ];
    var lastQueryCalls = [
      {name: 'last', value: 3}
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false
    };

    range.addItems(firstQueryCalls, first3Edges, pageInfo);
    var result = range.retrieveRangeInfoForQuery(lastQueryCalls);

    expect(result.diffCalls).toEqual([
      {name: 'after', value: 'cursor3'},
      {name: 'last', value: 3}
    ]);

    pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: false
    };
    range.addItems(result.diffCalls, last3Edges, pageInfo);
    result = range.retrieveRangeInfoForQuery(
      [{name: 'first', value: 6}],
    );
    expect(result.diffCalls.length).toBe(0);
    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__,
      edge98.__dataID__,
      edge99.__dataID__,
      edge100.__dataID__
    ]);
    result = range.retrieveRangeInfoForQuery(
      [{name: 'last', value: 6}],
    );
    expect(result.diffCalls.length).toBe(0);
    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__,
      edge98.__dataID__,
      edge99.__dataID__,
      edge100.__dataID__
    ]);

    range = new GraphQLRange();

    pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true
    };

    range.addItems(lastQueryCalls, last3Edges, pageInfo);
    result = range.retrieveRangeInfoForQuery(firstQueryCalls);

    expect(result.diffCalls).toEqual([
      {name: 'before', value: 'cursor98'},
      {name: 'first', value: 3}
    ]);

    pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: false
    };

    range.addItems(result.diffCalls, first3Edges, pageInfo);
    result = range.retrieveRangeInfoForQuery(
      [{name: 'first', value: 6}],
    );
    expect(result.diffCalls.length).toBe(0);
    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__,
      edge98.__dataID__,
      edge99.__dataID__,
      edge100.__dataID__
    ]);
    result = range.retrieveRangeInfoForQuery(
      [{name: 'last', value: 6}],
    );
    expect(result.diffCalls.length).toBe(0);
    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__,
      edge98.__dataID__,
      edge99.__dataID__,
      edge100.__dataID__
    ]);
  });

  it('should stitch up gap in first segment', () => {
    // Add initial edges
    var queryCalls = [
      {name: 'first', value: 3}
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false
    };

    range.addItems(queryCalls, first3Edges, pageInfo);

    var result = range.retrieveRangeInfoForQuery(queryCalls);

    // Create gap
    var incrementalQueryCall = [
      {name: 'before', value: 'cursor1'},
      {name: 'first', value: 2}
    ];
    var incrementalEdges = [edgeNeg3, edgeNeg2];
    var incrementalPageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false
    };
    range.addItems(
      incrementalQueryCall,
      incrementalEdges,
      incrementalPageInfo
    );

    result = range.retrieveRangeInfoForQuery([
      {name: 'first', value: 5}
    ]);
    var diffCalls = result.diffCalls;
    expect(result.diffCalls).toEqual([
      {name: 'after', value: 'cursor-2'},
      {name: 'before', value: 'cursor1'},
      {name: 'first', value: 3}
    ]);

    // Fill in gap
    var gapEdges = [edgeNeg1, edge0];
    pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: false
    };
    range.addItems(diffCalls, gapEdges, pageInfo);

    result = range.retrieveRangeInfoForQuery([
      {name: 'first', value: 5}
    ]);
    expect(result.requestedEdgeIDs).toEqual([
      edgeNeg3.__dataID__,
      edgeNeg2.__dataID__,
      edgeNeg1.__dataID__,
      edge0.__dataID__,
      edge1.__dataID__
    ]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should stitch up gap in last segment', () => {
    // Add initial edges
    var queryCalls = [
      {name: 'last', value: 3}
    ];
    var pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true
    };
    range.addItems(queryCalls, last3Edges, pageInfo);

    var result = range.retrieveRangeInfoForQuery(queryCalls);

    // Create gap
    var incrementalQueryCall = [
      {name: 'after', value: 'cursor100'},
      {name: 'last', value: 2}
    ];

    var incrementalEdges = [edge103, edge104];
    var incrementalPageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true
    };
    range.addItems(
      incrementalQueryCall,
      incrementalEdges,
      incrementalPageInfo
    );

    result = range.retrieveRangeInfoForQuery([
      {name: 'last', value: 5}
    ]);
    var diffCalls = result.diffCalls;
    expect(result.diffCalls).toEqual([
      {name: 'before', value: 'cursor103'},
      {name: 'after', value: 'cursor100'},
      {name: 'last', value: 3}
    ]);

    // Fill in gap
    var gapEdges = [edge101, edge102];
    pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: false
    };
    range.addItems(diffCalls, gapEdges, pageInfo);

    result = range.retrieveRangeInfoForQuery([
      {name: 'last', value: 5}
    ]);
    expect(result.requestedEdgeIDs).toEqual([
      edge100.__dataID__,
      edge101.__dataID__,
      edge102.__dataID__,
      edge103.__dataID__,
      edge104.__dataID__
    ]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should refetch for whole ranges for null cursor', () => {
    var queryCalls = [
      {name: 'first', value: 3}
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false
    };

    var nullCursorEdges = [
      edgeWithNullCursor1,
      edgeWithNullCursor2,
      edgeWithNullCursor3,
    ];

    range.addItems(queryCalls, nullCursorEdges, pageInfo);
    var five = [{name: 'first', value: 5}];
    var result = range.retrieveRangeInfoForQuery(five);
    expect(result.requestedEdgeIDs).toEqual([
      'edgeWithNullCursor1',
      'edgeWithNullCursor2',
      'edgeWithNullCursor3',
    ]);
    expect(result.diffCalls).toEqual(five);
  });

  it('replaces whole first() ranges when working with null cursors', () => {
    var queryCalls = [
      {name: 'first', value: 1}
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: true,
    };

    var nullCursorEdges = [
      edgeWithNullCursor1,
      edgeWithNullCursor2,
      edgeWithNullCursor3,
    ];

    // we don't replace empty ranges
    var segment = getFirstSegment(range);
    range.addItems(queryCalls, nullCursorEdges.slice(0, 1), pageInfo);
    expect(segment).toBe(getFirstSegment(range));

    // if we request more results but get the same number, we replace
    // (in case there were deleted items, different items, or reordering)
    var three = [{name: 'first', value: 3}];
    range.addItems(three, nullCursorEdges.slice(0, 1), pageInfo);
    expect(segment).not.toBe(getFirstSegment(range));

    // if the range has gotten bigger, we replace it
    segment = getFirstSegment(range);
    range.addItems(three, nullCursorEdges, pageInfo);
    expect(segment).not.toBe(getFirstSegment(range));

    // if the range has gotten bigger but has cursor info, we don't replace it
    var cursorEdges = [
      edge0,
      edge1,
      edge2,
    ];
    range = new GraphQLRange();
    segment = getFirstSegment(range);
    range.addItems(queryCalls, cursorEdges.slice(0, 1), pageInfo);
    expect(segment).toBe(getFirstSegment(range));
    range.addItems(three, cursorEdges, pageInfo);
    expect(segment).toBe(getFirstSegment(range));
  });

  it('replaces whole last() ranges when working with null cursors', () => {
    var queryCalls = [
      {name: 'last', value: 1}
    ];

    var pageInfo = {
      [HAS_PREV_PAGE]: true,
    };

    var nullCursorEdges = [
      edgeWithNullCursor1,
      edgeWithNullCursor2,
      edgeWithNullCursor3,
    ];

    // we don't replace empty ranges
    var segment = getLastSegment(range);
    range.addItems(queryCalls, nullCursorEdges.slice(2), pageInfo);
    expect(segment).toBe(getLastSegment(range));

    // if we request more results but get the same number, we replace
    // (in case there were deleted items, different items, or reordering)
    var three = [{name: 'last', value: 3}];
    range.addItems(three, nullCursorEdges.slice(2), pageInfo);
    expect(segment).not.toBe(getLastSegment(range));

    // if the range has gotten bigger, we replace it
    segment = getLastSegment(range);
    range.addItems(three, nullCursorEdges, pageInfo);
    expect(segment).not.toBe(getLastSegment(range));

    // if the range has gotten bigger but has cursor info, we don't replace it
    var cursorEdges = [
      edge0,
      edge1,
      edge2,
    ];
    range = new GraphQLRange();
    segment = getLastSegment(range);
    range.addItems(queryCalls, cursorEdges.slice(2), pageInfo);
    expect(segment).toBe(getLastSegment(range));
    range.addItems(three, cursorEdges, pageInfo);
    expect(segment).toBe(getLastSegment(range));
  });

  it('should retrieve correct page_info for ranges with null cursors', () => {
    var two = [{name: 'first', value: 2}];
    var three = [{name: 'first', value: 3}];

    var pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: false
    };

    var nullCursorEdges = [
      edgeWithNullCursor1,
      edgeWithNullCursor2,
      edgeWithNullCursor3,
    ];

    range.addItems(three, nullCursorEdges, pageInfo);
    var result = range.retrieveRangeInfoForQuery(two);
    expect(result.requestedEdgeIDs).toEqual([
      'edgeWithNullCursor1',
      'edgeWithNullCursor2',
    ]);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(true);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(false);

    result = range.retrieveRangeInfoForQuery(three);
    expect(result.requestedEdgeIDs).toEqual([
      'edgeWithNullCursor1',
      'edgeWithNullCursor2',
      'edgeWithNullCursor3',
    ]);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(false);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(false);
  });

  it('should delete', () => {
    var queryCalls = [
      {name: 'first', value: 3}
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false
    };

    range.addItems(queryCalls, first3Edges, pageInfo);
    range.removeEdgeWithID(edge2.__dataID__);
    var result = range.retrieveRangeInfoForQuery(queryCalls);
    expect(result.requestedEdgeIDs).toEqual(
      [edge1.__dataID__, edge3.__dataID__]
    );
    expect(result.diffCalls).toEqual([
      {name: 'after', value: 'cursor3'},
      {name: 'first', value: 1}
    ]);
  });

  it('should not retrieve deleted bumped edges', () => {
    var queryCalls = [
      {name: 'first', value: 3}
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false
    };

    range.addItems(queryCalls, first3Edges, pageInfo);
    var result = range.retrieveRangeInfoForQuery(queryCalls);

    // bump the second edge
    var afterQueryCalls = [
      {name: 'after', value: 'cursor3'},
      {name: 'first', value: 1}
    ];

    range.addItems(afterQueryCalls, [first3Edges[1]], pageInfo);

    // delete the second edge
    range.removeEdgeWithID(edge2.__dataID__);
    result = range.retrieveRangeInfoForQuery(queryCalls);
    expect(result.requestedEdgeIDs).toEqual(
      [edge1.__dataID__, edge3.__dataID__]
    );
    expect(result.diffCalls).toEqual([
      {name: 'after', value: 'cursor3'},
      {name: 'first', value: 1}
    ]);
    var queryCallsWithSession = [
      {name: 'first', value: 3}
    ];
    result = range.retrieveRangeInfoForQuery(queryCallsWithSession);
    expect(result.requestedEdgeIDs).toEqual(
      [edge1.__dataID__, edge3.__dataID__]
    );
    expect(result.diffCalls).toEqual([
      {name: 'after', value: 'cursor3'},
      {name: 'first', value: 1}
    ]);
  });

  it('should retrieve info for first() query given optimistic data', () => {
    var queryCalls = [
      {name: 'first', value: 3}
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false
    };

    range.addItems(queryCalls, first3Edges, pageInfo);

    var result = range.retrieveRangeInfoForQuery(
      [{name: 'first', value: 3}],
      {'prepend': [edge4.__dataID__]}
    );

    expect(result.requestedEdgeIDs).toEqual(
      [edge4.__dataID__, edge1.__dataID__, edge2.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);

    result = range.retrieveRangeInfoForQuery(
      [{name: 'first', value: 3}],
      {'prepend': [edge4.__dataID__, edge5.__dataID__]}
    );

    expect(result.requestedEdgeIDs).toEqual(
      [edge4.__dataID__, edge5.__dataID__, edge1.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);

    // append shouldn't affect 'first' call
    result = range.retrieveRangeInfoForQuery(
      [{name: 'first', value: 3}],
      {'append': [edge4.__dataID__, edge5.__dataID__]}
    );

    expect(result.requestedEdgeIDs).toEqual(
      [edge1.__dataID__, edge2.__dataID__, edge3.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);

    result = range.retrieveRangeInfoForQuery(
      [{name: 'first', value: 2}],
      {
        'remove': [edge1.__dataID__]
      }
    );

    expect(result.requestedEdgeIDs).toEqual(
      [edge2.__dataID__, edge3.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);

    result = range.retrieveRangeInfoForQuery(
      [{name: 'first', value: 3}],
      {
        'prepend': [edge4.__dataID__, edge5.__dataID__],
        'remove': [edge4.__dataID__, edge1.__dataID__]
      }
    );

    expect(result.requestedEdgeIDs).toEqual(
      [edge5.__dataID__, edge2.__dataID__, edge3.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);
  });

  it('should retrieve optimistically appended edges when the last edge has been fetched', () => {
    var queryCalls = [
      {name: 'first', value: 3}
    ];

    // No next page means we have the very last edge.
    var pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(queryCalls, first3Edges, pageInfo);

    var result = range.retrieveRangeInfoForQuery(
      [{name: 'first', value: 4}],
      {'append': [edge4.__dataID__]}
    );

    expect(result.requestedEdgeIDs).toEqual(
      [edge1.__dataID__, edge2.__dataID__, edge3.__dataID__, edge4.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);

    // Should not return extra edges
    result = range.retrieveRangeInfoForQuery(
      [{name: 'first', value: 3}],
      {'append': [edge4.__dataID__]}
    );

    expect(result.requestedEdgeIDs).toEqual(
      [edge1.__dataID__, edge2.__dataID__, edge3.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);
  });

  it('should retrieve info for last() query given optimistic data', () => {
    var queryCalls = [
      {name: 'last', value: 3}
    ];

    var pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true
    };

    range.addItems(queryCalls, last3Edges, pageInfo);

    var result = range.retrieveRangeInfoForQuery(
      [{name: 'last', value: 3}],
      {'append': [edge97.__dataID__]}
    );

    expect(result.requestedEdgeIDs).toEqual(
      [edge99.__dataID__, edge100.__dataID__, edge97.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);

    result = range.retrieveRangeInfoForQuery(
      [{name: 'last', value: 3}],
      {'append': [edge97.__dataID__, edge96.__dataID__]}
    );

    expect(result.requestedEdgeIDs).toEqual(
      [edge100.__dataID__, edge97.__dataID__, edge96.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);

    // prepend shouldn't affect 'last' call
    result = range.retrieveRangeInfoForQuery(
      [{name: 'last', value: 3}],
      {'prepend': [edge97.__dataID__, edge96.__dataID__]}
    );

    expect(result.requestedEdgeIDs).toEqual(
      [edge98.__dataID__, edge99.__dataID__, edge100.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);

    result = range.retrieveRangeInfoForQuery(
      [{name: 'last', value: 2}],
      {'remove': [edge99.__dataID__]}
    );

    expect(result.requestedEdgeIDs).toEqual(
      [edge98.__dataID__, edge100.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);

    result = range.retrieveRangeInfoForQuery(
      [{name: 'last', value: 3}],
      {
        'append': [edge97.__dataID__, edge96.__dataID__],
        'remove': [edge100.__dataID__, edge96.__dataID__]
      }
    );

    expect(result.requestedEdgeIDs).toEqual(
      [edge98.__dataID__, edge99.__dataID__, edge97.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);
  });

  it('should retrieve optimistically prepended edges when the first edge has been fetched', () => {
    var queryCalls = [
      {name: 'last', value: 3}
    ];

    // No previous page means we have the very first edge.
    var pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(queryCalls, last3Edges, pageInfo);

    var result = range.retrieveRangeInfoForQuery(
      [{name: 'last', value: 4}],
      {'prepend': [edge97.__dataID__]}
    );

    expect(result.requestedEdgeIDs).toEqual([
      edge97.__dataID__,
      edge98.__dataID__,
      edge99.__dataID__,
      edge100.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);

    // Should not return extra edges
    result = range.retrieveRangeInfoForQuery(
      [{name: 'last', value: 3}],
      {'prepend': [edge97.__dataID__]}
    );

    expect(result.requestedEdgeIDs).toEqual([
      edge98.__dataID__,
      edge99.__dataID__,
      edge100.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should toJSON', () => {
    var queryCalls = [
      {name: 'first', value: 3}
    ];
    var pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false
    };

    range.addItems(queryCalls, first3Edges, pageInfo);
    var actual = JSON.stringify(range);

    expect(actual).toEqual('[true,false,{},[[{' +
      '"0":{"edgeID":"edge1","cursor":"cursor1","deleted":false},' +
      '"1":{"edgeID":"edge2","cursor":"cursor2","deleted":false},' +
      '"2":{"edgeID":"edge3","cursor":"cursor3","deleted":false}},' +
      '{"edge1":[0],"edge2":[1],"edge3":[2]},' +
      '{"cursor1":0,"cursor2":1,"cursor3":2},0,2,3],' +
      '[{},{},{},null,null,0]]]'
    );

    range = GraphQLRange.fromJSON(JSON.parse(actual));

    // Request the full set
    var result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual(
      [edge1.__dataID__, edge2.__dataID__, edge3.__dataID__]
    );
    expect(result.diffCalls.length).toBe(0);
  });

  it('returns the DataIDs of all edges', () => {
    // Add a static edges
    var surroundQueryCalls = [
      {name: 'surrounds', value: ['id2', 1]},
    ];
    var pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: false
    };
    range.addItems(surroundQueryCalls, first3Edges, pageInfo);

    // Non-static edges
    var queryCalls = [
      {name: 'last', value: 3}
    ];
    range.addItems(queryCalls, last3Edges, pageInfo);
    // Sorting the IDs to make testing easier.
    expect(range.getEdgeIDs().sort()).toEqual([
      edge1.__dataID__,
      edge100.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__,
      edge98.__dataID__,
      edge99.__dataID__,
    ]);
  });
});

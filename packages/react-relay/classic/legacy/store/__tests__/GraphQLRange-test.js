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

jest
  .enableAutomock()
  .unmock('GraphQLSegment')
  .unmock('GraphQLRange')
  .mock('warning');

const RelayTestUtils = require('RelayTestUtils');

const GraphQLRange = require('GraphQLRange');
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayRecord = require('RelayRecord');

function getFirstSegment(range) {
  return range.__debug().orderedSegments[0];
}

function getLastSegment(range) {
  const orderedSegments = range.__debug().orderedSegments;
  return orderedSegments[orderedSegments.length - 1];
}

function mockEdge(id, hasNullCursor) {
  const dataID = 'edge' + (hasNullCursor ? 'WithNullCursor' : '') + id;
  const edge = {
    __dataID__: dataID,
    node: {__dataID__: 'id' + id},
    cursor: hasNullCursor ? null : 'cursor' + id,
  };
  return edge;
}

const edgeNeg10 = mockEdge('-10');
const edgeNeg9 = mockEdge('-9');
const edgeNeg3 = mockEdge('-3');
const edgeNeg2 = mockEdge('-2');
const edgeNeg1 = mockEdge('-1');
const edge0 = mockEdge('0');
const edge1 = mockEdge('1');
const edge2 = mockEdge('2');
const edge3 = mockEdge('3');
const edge4 = mockEdge('4');
const edge5 = mockEdge('5');
const edge96 = mockEdge('96');
const edge97 = mockEdge('97');
const edge98 = mockEdge('98');
const edge99 = mockEdge('99');
const edge100 = mockEdge('100');
const edge101 = mockEdge('101');
const edge102 = mockEdge('102');
const edge103 = mockEdge('103');
const edge104 = mockEdge('104');
const edge110 = mockEdge('110');
const edge111 = mockEdge('111');
const edgeWithNullCursor1 = mockEdge('1', true);
const edgeWithNullCursor2 = mockEdge('2', true);
const edgeWithNullCursor3 = mockEdge('3', true);

const first3Edges = [edge1, edge2, edge3];
const first5Edges = [edge1, edge2, edge3, edge4, edge5];
const last3Edges = [edge98, edge99, edge100];
const last5Edges = [edge96, edge97, edge98, edge99, edge100];

describe('GraphQLRange', () => {
  let consoleError;
  let consoleWarn;
  let range;

  let HAS_NEXT_PAGE, HAS_PREV_PAGE;

  beforeEach(() => {
    jest.resetModules();
    consoleError = console.error;
    consoleWarn = console.warn;

    RelayRecord.getDataIDForObject.mockImplementation(function(data) {
      return data.__dataID__;
    });
    range = new GraphQLRange();

    ({HAS_NEXT_PAGE, HAS_PREV_PAGE} = RelayConnectionInterface);

    expect.extend(RelayTestUtils.matchers);
  });

  afterEach(() => {
    console.error = consoleError;
    console.warn = consoleWarn;
  });

  it('should add for first() query', () => {
    const queryCalls = [{name: 'first', value: 3}];
    const pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(queryCalls, first3Edges, pageInfo);

    // Request the full set
    const result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should add for after().first() query', () => {
    let queryCalls = [{name: 'after', value: null}, {name: 'first', value: 3}];
    const pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(queryCalls, first3Edges, pageInfo);

    const incrementalEdges = [edge4, edge5];
    const incrementalPageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: true,
    };

    queryCalls = [{name: 'after', value: 'cursor3'}, {name: 'first', value: 2}];
    range.addItems(queryCalls, incrementalEdges, incrementalPageInfo);

    // Request the full set
    queryCalls = [{name: 'after', value: null}, {name: 'first', value: 5}];
    const result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__,
      edge4.__dataID__,
      edge5.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should add for after().first() query in last segment', () => {
    let queryCalls = [{name: 'last', value: 3}];
    const pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true,
    };

    range.addItems(queryCalls, last3Edges, pageInfo);

    const incrementalQueryCall = [
      {name: 'after', value: 'cursor100'},
      {name: 'first', value: 2},
    ];
    const incrementalEdges = [edge101, edge102];
    const incrementalPageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true,
    };

    range.addItems(incrementalQueryCall, incrementalEdges, incrementalPageInfo);

    // Request the full set
    queryCalls = [{name: 'last', value: 5}];
    const result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([
      edge98.__dataID__,
      edge99.__dataID__,
      edge100.__dataID__,
      edge101.__dataID__,
      edge102.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should add for before().first() query', () => {
    let queryCalls = [{name: 'last', value: 3}];

    const pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(queryCalls, first3Edges, pageInfo);

    const incrementalQueryCall = [
      {name: 'before', value: 'cursor1'},
      {name: 'first', value: 2},
    ];

    const incrementalEdges = [edgeNeg1, edge0];
    const incrementalPageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: false,
    };
    range.addItems(incrementalQueryCall, incrementalEdges, incrementalPageInfo);
    // Request the full set to make sure it is stitched properly
    queryCalls = [{name: 'last', value: 5}];
    const result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([
      edgeNeg1.__dataID__,
      edge0.__dataID__,
      edge1.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should add for before().first() query with gap', () => {
    let queryCalls = [{name: 'first', value: 3}];

    const pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(queryCalls, first3Edges, pageInfo);

    const incrementalQueryCall = [
      {name: 'before', value: 'cursor1'},
      {name: 'first', value: 2},
    ];

    const incrementalEdges = [edgeNeg10, edgeNeg9];
    const incrementalPageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false,
    };
    range.addItems(incrementalQueryCall, incrementalEdges, incrementalPageInfo);
    // Request super set
    queryCalls = [{name: 'first', value: 5}];
    const result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([
      edgeNeg10.__dataID__,
      edgeNeg9.__dataID__,
    ]);
    expect(result.diffCalls).toEqual([
      {name: 'after', value: 'cursor-9'},
      {name: 'before', value: 'cursor1'},
      {name: 'first', value: 3},
    ]);
  });

  it('should not make empty segment for before().first() query with gap', () => {
    let queryCalls = [{name: 'first', value: 3}];

    const pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(queryCalls, first3Edges, pageInfo);

    const incrementalQueryCall = [
      {name: 'before', value: 'cursor1'},
      {name: 'first', value: 2},
    ];

    const incrementalEdges = [];
    const incrementalPageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false,
    };
    range.addItems(incrementalQueryCall, incrementalEdges, incrementalPageInfo);
    // Request super set
    queryCalls = [{name: 'first', value: 5}];
    const result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__,
    ]);
    expect(result.diffCalls).toEqual([
      {name: 'after', value: 'cursor3'},
      {name: 'first', value: 2},
    ]);
  });

  it('should add for last() query', () => {
    const queryCalls = [{name: 'last', value: 3}];

    const pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true,
    };

    range.addItems(queryCalls, last3Edges, pageInfo);

    // Request the full set
    const result = range.retrieveRangeInfoForQuery(queryCalls, {count: 3});

    expect(result.requestedEdgeIDs).toEqual([
      edge98.__dataID__,
      edge99.__dataID__,
      edge100.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should add for before().last() query', () => {
    let queryCalls = [{name: 'last', value: 3}];

    const pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true,
    };

    range.addItems(queryCalls, last3Edges, pageInfo);

    const incrementalQueryCall = [
      {name: 'before', value: 'cursor98'},
      {name: 'last', value: 2},
    ];

    const incrementalEdges = [edge96, edge97];

    const incrementalPageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: true,
    };

    range.addItems(incrementalQueryCall, incrementalEdges, incrementalPageInfo);

    // Request the full set
    queryCalls = [{name: 'last', value: 5}];
    const result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([
      edge96.__dataID__,
      edge97.__dataID__,
      edge98.__dataID__,
      edge99.__dataID__,
      edge100.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should add for before().last() query in first segment', () => {
    let queryCalls = [{name: 'first', value: 3}];

    const pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(queryCalls, first3Edges, pageInfo);

    const incrementalQueryCall = [
      {name: 'before', value: 'cursor1'},
      {name: 'last', value: 2},
    ];

    const incrementalEdges = [edgeNeg1, edge0];
    const incrementalPageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(incrementalQueryCall, incrementalEdges, incrementalPageInfo);

    // Request the full set
    queryCalls = [{name: 'first', value: 5}];
    const result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([
      edgeNeg1.__dataID__,
      edge0.__dataID__,
      edge1.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should add for after().last() query', () => {
    let queryCalls = [{name: 'last', value: 3}];

    const pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true,
    };

    range.addItems(queryCalls, last3Edges, pageInfo);
    const incrementalQueryCall = [
      {name: 'after', value: 'cursor100'},
      {name: 'last', value: 2},
    ];

    const incrementalEdges = [edge101, edge102];
    const incrementalPageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(incrementalQueryCall, incrementalEdges, incrementalPageInfo);

    // Request the full set
    queryCalls = [{name: 'last', value: 5}];
    const result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([
      edge98.__dataID__,
      edge99.__dataID__,
      edge100.__dataID__,
      edge101.__dataID__,
      edge102.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should add for after().last() with gap', () => {
    let queryCalls = [{name: 'after', value: null}, {name: 'last', value: 3}];

    const pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true,
    };

    range.addItems(queryCalls, last3Edges, pageInfo);

    queryCalls = [
      {name: 'after', value: 'cursor100'},
      {name: 'last', value: 2},
    ];
    range.addItems(queryCalls, [edge110, edge111], {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true,
    });

    // Request the super set
    queryCalls = [{name: 'after', value: null}, {name: 'last', value: 5}];
    const result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([
      edge110.__dataID__,
      edge111.__dataID__,
    ]);
    expect(result.diffCalls).toEqual([
      {name: 'before', value: 'cursor110'},
      {name: 'after', value: 'cursor100'},
      {name: 'last', value: 3},
    ]);
  });

  it('should not make empty segment for after().last() query with gap', () => {
    let queryCalls = [{name: 'after', value: null}, {name: 'last', value: 3}];

    const pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true,
    };

    range.addItems(queryCalls, last3Edges, pageInfo);

    queryCalls = [
      {name: 'after', value: 'cursor100'},
      {name: 'last', value: 2},
    ];
    range.addItems(queryCalls, [], {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true,
    });

    // Request the super set
    queryCalls = [{name: 'after', value: null}, {name: 'last', value: 5}];
    const result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([
      edge98.__dataID__,
      edge99.__dataID__,
      edge100.__dataID__,
    ]);
    expect(result.diffCalls).toEqual([
      {name: 'before', value: 'cursor98'},
      {name: 'last', value: 2},
    ]);
  });

  it('should error for invalid call value', () => {
    console.error = jest.fn();
    const queryCalls = [{name: 'first', value: 0}];

    const result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(console.error.mock.calls.length).toBe(1);
    expect(console.error.mock.calls[0]).toEqual([
      'GraphQLRange only supports first(<count>) or last(<count>) ' +
        'where count is greater than 0',
    ]);
    expect(result.requestedEdgeIDs).toEqual([]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should error for first().last() query', () => {
    console.error = jest.fn();
    const queryCalls = [{name: 'first', value: 3}, {name: 'last', value: 3}];

    const result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(console.error.mock.calls.length).toBe(1);
    expect(console.error.mock.calls[0]).toEqual([
      'GraphQLRange currently only handles first(<count>), ' +
        'after(<cursor>).first(<count>), last(<count>), ' +
        'before(<cursor>).last(<count>), before(<cursor>).first(<count>), ' +
        'and after(<cursor>).last(<count>)',
    ]);
    expect(result.requestedEdgeIDs).toEqual([]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should retrieve for first() queries', () => {
    let queryCalls = [{name: 'first', value: 3}];

    // Request from empty range
    let result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([]);
    expect(result.diffCalls).toEqual([{name: 'first', value: 3}]);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(false);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(true);

    const pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(queryCalls, first3Edges, pageInfo);

    // Request the full set
    result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(false);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(true);

    // Request a subset
    queryCalls = [{name: 'first', value: 2}];
    result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge2.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(false);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(true);

    // Request a superset
    queryCalls = [{name: 'first', value: 5}];
    result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__,
    ]);
    expect(result.diffCalls).toEqual([
      {name: 'after', value: 'cursor3'},
      {name: 'first', value: 2},
    ]);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(false);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(true);
  });

  it('should retrieve for after().first() queries', () => {
    let queryCalls = [{name: 'after', value: null}, {name: 'first', value: 3}];

    const pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(queryCalls, first3Edges, pageInfo);

    // Request a subset with after
    queryCalls = [{name: 'after', value: 'cursor1'}, {name: 'first', value: 2}];
    let result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([
      edge2.__dataID__,
      edge3.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(false);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(true);

    // Request a superset with after
    queryCalls = [{name: 'after', value: 'cursor1'}, {name: 'first', value: 5}];
    result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([
      edge2.__dataID__,
      edge3.__dataID__,
    ]);
    expect(result.diffCalls).toEqual([
      {name: 'after', value: 'cursor3'},
      {name: 'first', value: 3},
    ]);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(false);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(true);

    // Request a non-intersecting superset with after
    queryCalls = [{name: 'after', value: 'cursor3'}, {name: 'first', value: 2}];
    result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([]);
    expect(result.diffCalls).toEqual([
      {name: 'after', value: 'cursor3'},
      {name: 'first', value: 2},
    ]);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(false);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(true);
  });

  it('should retrieve for last() queries', () => {
    let queryCalls = [{name: 'last', value: 3}];

    // Request the from empty range
    let result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([]);
    expect(result.diffCalls).toEqual([{name: 'last', value: 3}]);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(true);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(false);

    const pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true,
    };

    range.addItems(queryCalls, last3Edges, pageInfo);

    // Request the full set
    result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([
      edge98.__dataID__,
      edge99.__dataID__,
      edge100.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(true);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(false);

    // Request a subset
    queryCalls = [{name: 'last', value: 2}];
    result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([
      edge99.__dataID__,
      edge100.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(true);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(false);

    // Requst a superset
    queryCalls = [{name: 'last', value: 5}];
    result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([
      edge98.__dataID__,
      edge99.__dataID__,
      edge100.__dataID__,
    ]);
    expect(result.diffCalls).toEqual([
      {name: 'before', value: 'cursor98'},
      {name: 'last', value: 2},
    ]);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(true);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(false);
  });

  it('should retrieve for before().last() queries', () => {
    const queryCalls = [{name: 'last', value: 3}];

    const pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true,
    };

    range.addItems(queryCalls, last3Edges, pageInfo);

    // Request a subset with before
    let result = range.retrieveRangeInfoForQuery([
      {name: 'before', value: 'cursor100'},
      {name: 'last', value: 2},
    ]);

    expect(result.requestedEdgeIDs).toEqual([
      edge98.__dataID__,
      edge99.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(true);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(false);

    // Request a superset with before
    result = range.retrieveRangeInfoForQuery([
      {name: 'before', value: 'cursor100'},
      {name: 'last', value: 5},
    ]);

    expect(result.requestedEdgeIDs).toEqual([
      edge98.__dataID__,
      edge99.__dataID__,
    ]);
    expect(result.diffCalls).toEqual([
      {name: 'before', value: 'cursor98'},
      {name: 'last', value: 3},
    ]);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(true);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(false);

    // Request a non-intersecting superset with before
    result = range.retrieveRangeInfoForQuery([
      {name: 'before', value: 'cursor98'},
      {name: 'last', value: 2},
    ]);

    expect(result.requestedEdgeIDs).toEqual([]);
    expect(result.diffCalls).toEqual([
      {name: 'before', value: 'cursor98'},
      {name: 'last', value: 2},
    ]);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(true);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(false);
  });

  it('should retrieve for after().first() from last segment', () => {
    const queryCalls = [{name: 'last', value: 3}];

    const pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true,
    };
    range.addItems(queryCalls, last3Edges, pageInfo);

    // Request a subset with after
    let result = range.retrieveRangeInfoForQuery([
      {name: 'after', value: 'cursor98'},
      {name: 'first', value: 1},
    ]);

    expect(result.requestedEdgeIDs).toEqual([edge99.__dataID__]);
    expect(result.diffCalls.length).toBe(0);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(false);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(true);

    // Request a superset with after
    result = range.retrieveRangeInfoForQuery([
      {name: 'after', value: 'cursor98'},
      {name: 'first', value: 5},
    ]);

    expect(result.requestedEdgeIDs).toEqual([
      edge99.__dataID__,
      edge100.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(false);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(false);

    // Request a non-intersecting superset with after
    result = range.retrieveRangeInfoForQuery([
      {name: 'after', value: 'cursor100'},
      {name: 'first', value: 2},
    ]);

    expect(result.requestedEdgeIDs).toEqual([]);
    expect(result.diffCalls.length).toBe(0);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(false);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(false);
  });

  it('should retrieve for before().last() from first segment', () => {
    const queryCalls = [{name: 'first', value: 3}];

    const pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(queryCalls, first3Edges, pageInfo);

    // Request a subset with before
    let result = range.retrieveRangeInfoForQuery([
      {name: 'before', value: 'cursor3'},
      {name: 'last', value: 1},
    ]);

    expect(result.requestedEdgeIDs).toEqual([edge2.__dataID__]);
    expect(result.diffCalls.length).toBe(0);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(true);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(false);

    // Request a superset with before
    result = range.retrieveRangeInfoForQuery([
      {name: 'before', value: 'cursor3'},
      {name: 'last', value: 5},
    ]);

    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge2.__dataID__,
    ]);
    expect(result.diffCalls).toEqual([]);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(false);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(false);

    // Request a non-intersecting superset with before
    result = range.retrieveRangeInfoForQuery([
      {name: 'before', value: 'cursor1'},
      {name: 'last', value: 2},
    ]);

    expect(result.requestedEdgeIDs).toEqual([]);
    expect(result.diffCalls).toEqual([]);
    expect(result.pageInfo[HAS_PREV_PAGE]).toBe(false);
    expect(result.pageInfo[HAS_NEXT_PAGE]).toBe(false);
  });

  it('should support calls with no arguments', () => {
    const queryCalls = [
      {name: 'first', value: 3},
      {name: 'dummy_call', value: null},
    ];

    const pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(queryCalls, first3Edges, pageInfo);

    // Request the full set
    const result = range.retrieveRangeInfoForQuery([
      {name: 'first', value: 3},
      {name: 'dummy_call', value: null},
    ]);

    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should support nodes with null cursors', () => {
    const queryCalls = [{name: 'first', value: 3}];

    const pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false,
    };

    const first3EdgesWithNullCursors = [
      edgeWithNullCursor1,
      edgeWithNullCursor2,
      edgeWithNullCursor3,
    ];

    range.addItems(queryCalls, first3EdgesWithNullCursors, pageInfo);

    // Request the full set
    const result = range.retrieveRangeInfoForQuery([{name: 'first', value: 3}]);

    expect(result.requestedEdgeIDs).toEqual([
      'edgeWithNullCursor1',
      'edgeWithNullCursor2',
      'edgeWithNullCursor3',
    ]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should support prepending edge to range', () => {
    // Prepend on new range
    range.prependEdge(edge2);
    let result = range.retrieveRangeInfoForQuery([{name: 'first', value: 1}]);
    expect(result.requestedEdgeIDs).toEqual([edge2.__dataID__]);
    expect(result.diffCalls.length).toBe(0);

    // Prepend on range that already has edge
    range.prependEdge(edge1);
    result = range.retrieveRangeInfoForQuery([{name: 'first', value: 2}]);
    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge2.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should support appending edge to range', () => {
    // Append on new range
    range.appendEdge(edge1);
    let result = range.retrieveRangeInfoForQuery([{name: 'last', value: 1}]);
    expect(result.requestedEdgeIDs).toEqual([edge1.__dataID__]);
    expect(result.diffCalls.length).toBe(0);

    // Append on range that already has an edge
    range.appendEdge(edge2);
    result = range.retrieveRangeInfoForQuery([{name: 'last', value: 2}]);
    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge2.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should dedup non-mutation edges', () => {
    let queryCalls = [{name: 'first', value: 3}];

    let pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(queryCalls, first3Edges, pageInfo);

    const afterQueryCalls = [
      {name: 'after', value: 'cursor3'},
      {name: 'first', value: 1},
    ];

    // Testing add after: adding id2 to end of range should not change ordering
    range.addItems(afterQueryCalls, [first3Edges[1]], pageInfo);
    let result = range.retrieveRangeInfoForQuery(queryCalls);
    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);

    // Testing prepend: adding id3 to the front of the range
    range.prependEdge(first3Edges[2]);
    result = range.retrieveRangeInfoForQuery(queryCalls);
    expect(result.requestedEdgeIDs).toEqual([
      edge3.__dataID__,
      edge1.__dataID__,
      edge2.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);

    queryCalls = [{name: 'last', value: 3}];

    pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true,
    };

    range.addItems(queryCalls, last3Edges, pageInfo);

    const beforeQueryCalls = [
      {name: 'before', value: 'cursor98'},
      {name: 'last', value: 1},
    ];

    // Testing add before: adding id99 to end of range should not change
    // ordering
    range.addItems(beforeQueryCalls, [last3Edges[1]], pageInfo);
    result = range.retrieveRangeInfoForQuery(queryCalls);
    expect(result.requestedEdgeIDs).toEqual([
      edge98.__dataID__,
      edge99.__dataID__,
      edge100.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);

    // Testing append: adding id98 to the end of the range
    range.appendEdge(last3Edges[0]);
    result = range.retrieveRangeInfoForQuery(queryCalls);
    expect(result.requestedEdgeIDs).toEqual([
      edge99.__dataID__,
      edge100.__dataID__,
      edge98.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should not generate diff query when range is empty', () => {
    const queryFirstCalls = [{name: 'first', value: 3}];

    const queryLastCalls = [{name: 'last', value: 3}];

    const pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: false,
    };

    // Add empty first edges
    range.addItems(queryFirstCalls, [], pageInfo);

    let result = range.retrieveRangeInfoForQuery(queryFirstCalls);
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
    const queryFirstCalls = [{name: 'first', value: 1}];

    const queryLastCalls = [{name: 'last', value: 1}];

    const pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(queryFirstCalls, [edge1], pageInfo);
    range.addItems(queryLastCalls, [edge1], pageInfo);

    let result = range.retrieveRangeInfoForQuery(queryFirstCalls);
    expect(result.requestedEdgeIDs).toEqual([edge1.__dataID__]);
    expect(result.diffCalls.length).toBe(0);
    result = range.retrieveRangeInfoForQuery(queryLastCalls);
    expect(result.requestedEdgeIDs).toEqual([edge1.__dataID__]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should not generate diff query when there is no more', () => {
    let queryCalls = [{name: 'first', value: 3}];

    let pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false,
    };
    const beforeQueryCalls = [
      {name: 'before', value: 'cursor1'},
      {name: 'last', value: 1},
    ];

    range.addItems(queryCalls, first3Edges, pageInfo);
    let result = range.retrieveRangeInfoForQuery(beforeQueryCalls);
    // We know there is no more before cursor1 since that is the first edge
    expect(result.diffCalls.length).toBe(0);

    queryCalls = [{name: 'last', value: 3}];

    pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true,
    };
    const afterQueryCalls = [
      {name: 'after', value: 'cursor100'},
      {name: 'first', value: 1},
    ];

    range.addItems(queryCalls, last3Edges, pageInfo);
    result = range.retrieveRangeInfoForQuery(afterQueryCalls);
    // We know there is no more after cursor100 since that is the last edge
    expect(result.diffCalls.length).toBe(0);
  });

  it('should add  and retrieve for surrounds() query', () => {
    const queryCalls = [{name: 'surrounds', value: ['id2', 1]}];

    const pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(queryCalls, first3Edges, pageInfo);
    const result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should not return surrounds query data for first query', () => {
    const surroundQueryCalls = [{name: 'surrounds', value: ['id2', 1]}];

    const pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(surroundQueryCalls, first3Edges, pageInfo);

    const firstQueryCalls = [{name: 'first', value: 5}];

    const resultForFirstQuery = range.retrieveRangeInfoForQuery(
      firstQueryCalls,
    );

    expect(resultForFirstQuery.requestedEdgeIDs).toEqual([]);
    expect(resultForFirstQuery.diffCalls).toEqual(firstQueryCalls);
  });

  it('should warn when reconciling conflicting first() ranges', () => {
    console.error = jest.fn();

    const queryCalls = [{name: 'first', value: 3}];

    const pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(queryCalls, [edge1, edge2, edge3], pageInfo);
    range.addItems(queryCalls, [edge1, edge3, edge4], pageInfo);

    expect(console.error.mock.calls.length).toBe(0);
    expect([
      'Relay was unable to reconcile edges on a connection. This most ' +
        'likely occurred while trying to handle a server response that ' +
        'includes connection edges with nodes that lack an `id` field.',
    ]).toBeWarnedNTimes(1);

    const result = range.retrieveRangeInfoForQuery(queryCalls);
    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__,
    ]);
  });

  it('should warn when reconciling conflicting last() ranges', () => {
    console.error = jest.fn();

    const queryCalls = [{name: 'last', value: 3}];

    const pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true,
    };

    // Add items twice
    range.addItems(queryCalls, [edge98, edge99, edge100], pageInfo);
    range.addItems(queryCalls, [edge98, edge1, edge100], pageInfo);

    expect(console.error.mock.calls.length).toBe(0);
    expect([
      'Relay was unable to reconcile edges on a connection. This most ' +
        'likely occurred while trying to handle a server response that ' +
        'includes connection edges with nodes that lack an `id` field.',
    ]).toBeWarnedNTimes(1);

    const result = range.retrieveRangeInfoForQuery(queryCalls);
    expect(result.requestedEdgeIDs).toEqual([
      edge98.__dataID__,
      edge99.__dataID__,
      edge100.__dataID__,
    ]);
  });

  it('should reconcile duplicated queries', () => {
    console.error = jest.fn();
    console.warn = jest.fn();

    let queryCalls = [{name: 'first', value: 3}];

    let pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false,
    };

    // Add items twice
    range.addItems(queryCalls, first3Edges, pageInfo);
    range.addItems(queryCalls, first3Edges, pageInfo);

    expect(console.error.mock.calls.length).toBe(0);
    expect(console.warn.mock.calls.length).toBe(0);

    let result = range.retrieveRangeInfoForQuery(queryCalls);
    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__,
    ]);

    queryCalls = [{name: 'last', value: 3}];

    pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true,
    };

    // Add items twice
    range.addItems(queryCalls, last3Edges, pageInfo);
    range.addItems(queryCalls, last3Edges, pageInfo);

    expect(console.error.mock.calls.length).toBe(0);
    expect(console.warn.mock.calls.length).toBe(0);

    result = range.retrieveRangeInfoForQuery(queryCalls);
    expect(result.requestedEdgeIDs).toEqual([
      edge98.__dataID__,
      edge99.__dataID__,
      edge100.__dataID__,
    ]);
  });

  it('should reconcile duplicated queries with no cursor', () => {
    console.error = jest.fn();
    console.warn = jest.fn();

    let queryCalls = [{name: 'first', value: 3}];

    let pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false,
    };
    const e1 = mockEdge('1', true);
    const e2 = mockEdge('2', true);
    const e3 = mockEdge('3', true);

    let edges = [e1, e2, e3];

    // Add items twice
    range.addItems(queryCalls, edges, pageInfo);
    range.addItems(queryCalls, edges, pageInfo);

    expect(console.error.mock.calls.length).toBe(0);
    expect(console.warn.mock.calls.length).toBe(0);

    let result = range.retrieveRangeInfoForQuery(queryCalls);
    expect(result.requestedEdgeIDs).toEqual([
      e1.__dataID__,
      e2.__dataID__,
      e3.__dataID__,
    ]);

    queryCalls = [{name: 'last', value: 3}];

    pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true,
    };
    const e100 = mockEdge('100', true);
    const e99 = mockEdge('99', true);
    const e98 = mockEdge('98', true);

    edges = [e98, e99, e100];

    // Add items twice
    range.addItems(queryCalls, edges, pageInfo);
    range.addItems(queryCalls, edges, pageInfo);

    expect(console.error.mock.calls.length).toBe(0);
    expect(console.warn.mock.calls.length).toBe(0);

    result = range.retrieveRangeInfoForQuery(queryCalls);
    expect(result.requestedEdgeIDs).toEqual([
      e98.__dataID__,
      e99.__dataID__,
      e100.__dataID__,
    ]);
  });

  it('should reconcile extending queries', () => {
    console.error = jest.fn();
    console.warn = jest.fn();

    let queryCalls = [{name: 'first', value: 3}];

    let pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(queryCalls, first3Edges, pageInfo);

    queryCalls = [{name: 'first', value: 5}];
    range.addItems(queryCalls, first5Edges, pageInfo);

    expect(console.error.mock.calls.length).toBe(0);
    expect(console.warn.mock.calls.length).toBe(0);

    let result = range.retrieveRangeInfoForQuery(queryCalls);
    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__,
      edge4.__dataID__,
      edge5.__dataID__,
    ]);

    queryCalls = [{name: 'last', value: 3}];

    pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true,
    };

    range.addItems(queryCalls, last3Edges, pageInfo);

    queryCalls = [{name: 'last', value: 5}];
    range.addItems(queryCalls, last5Edges, pageInfo);

    expect(console.error.mock.calls.length).toBe(0);
    expect(console.warn.mock.calls.length).toBe(0);

    result = range.retrieveRangeInfoForQuery(queryCalls);
    expect(result.requestedEdgeIDs).toEqual([
      edge96.__dataID__,
      edge97.__dataID__,
      edge98.__dataID__,
      edge99.__dataID__,
      edge100.__dataID__,
    ]);
  });

  it('should stitch first and last segment', () => {
    const firstQueryCalls = [{name: 'first', value: 3}];
    const lastQueryCalls = [{name: 'last', value: 3}];

    let pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(firstQueryCalls, first3Edges, pageInfo);
    let result = range.retrieveRangeInfoForQuery(lastQueryCalls);

    expect(result.diffCalls).toEqual([
      {name: 'after', value: 'cursor3'},
      {name: 'last', value: 3},
    ]);

    pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: false,
    };
    range.addItems(result.diffCalls, last3Edges, pageInfo);
    result = range.retrieveRangeInfoForQuery([{name: 'first', value: 6}]);
    expect(result.diffCalls.length).toBe(0);
    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__,
      edge98.__dataID__,
      edge99.__dataID__,
      edge100.__dataID__,
    ]);
    result = range.retrieveRangeInfoForQuery([{name: 'last', value: 6}]);
    expect(result.diffCalls.length).toBe(0);
    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__,
      edge98.__dataID__,
      edge99.__dataID__,
      edge100.__dataID__,
    ]);

    range = new GraphQLRange();

    pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true,
    };

    range.addItems(lastQueryCalls, last3Edges, pageInfo);
    result = range.retrieveRangeInfoForQuery(firstQueryCalls);

    expect(result.diffCalls).toEqual([
      {name: 'before', value: 'cursor98'},
      {name: 'first', value: 3},
    ]);

    pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(result.diffCalls, first3Edges, pageInfo);
    result = range.retrieveRangeInfoForQuery([{name: 'first', value: 6}]);
    expect(result.diffCalls.length).toBe(0);
    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__,
      edge98.__dataID__,
      edge99.__dataID__,
      edge100.__dataID__,
    ]);
    result = range.retrieveRangeInfoForQuery([{name: 'last', value: 6}]);
    expect(result.diffCalls.length).toBe(0);
    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__,
      edge98.__dataID__,
      edge99.__dataID__,
      edge100.__dataID__,
    ]);
  });

  it('should stitch up gap in first segment', () => {
    // Add initial edges
    const queryCalls = [{name: 'first', value: 3}];

    let pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(queryCalls, first3Edges, pageInfo);

    let result = range.retrieveRangeInfoForQuery(queryCalls);

    // Create gap
    const incrementalQueryCall = [
      {name: 'before', value: 'cursor1'},
      {name: 'first', value: 2},
    ];
    const incrementalEdges = [edgeNeg3, edgeNeg2];
    const incrementalPageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false,
    };
    range.addItems(incrementalQueryCall, incrementalEdges, incrementalPageInfo);

    result = range.retrieveRangeInfoForQuery([{name: 'first', value: 5}]);
    const diffCalls = result.diffCalls;
    expect(result.diffCalls).toEqual([
      {name: 'after', value: 'cursor-2'},
      {name: 'before', value: 'cursor1'},
      {name: 'first', value: 3},
    ]);

    // Fill in gap
    const gapEdges = [edgeNeg1, edge0];
    pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: false,
    };
    range.addItems(diffCalls, gapEdges, pageInfo);

    result = range.retrieveRangeInfoForQuery([{name: 'first', value: 5}]);
    expect(result.requestedEdgeIDs).toEqual([
      edgeNeg3.__dataID__,
      edgeNeg2.__dataID__,
      edgeNeg1.__dataID__,
      edge0.__dataID__,
      edge1.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should stitch up gap in last segment', () => {
    // Add initial edges
    const queryCalls = [{name: 'last', value: 3}];
    let pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true,
    };
    range.addItems(queryCalls, last3Edges, pageInfo);

    let result = range.retrieveRangeInfoForQuery(queryCalls);

    // Create gap
    const incrementalQueryCall = [
      {name: 'after', value: 'cursor100'},
      {name: 'last', value: 2},
    ];

    const incrementalEdges = [edge103, edge104];
    const incrementalPageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true,
    };
    range.addItems(incrementalQueryCall, incrementalEdges, incrementalPageInfo);

    result = range.retrieveRangeInfoForQuery([{name: 'last', value: 5}]);
    const diffCalls = result.diffCalls;
    expect(result.diffCalls).toEqual([
      {name: 'before', value: 'cursor103'},
      {name: 'after', value: 'cursor100'},
      {name: 'last', value: 3},
    ]);

    // Fill in gap
    const gapEdges = [edge101, edge102];
    pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: false,
    };
    range.addItems(diffCalls, gapEdges, pageInfo);

    result = range.retrieveRangeInfoForQuery([{name: 'last', value: 5}]);
    expect(result.requestedEdgeIDs).toEqual([
      edge100.__dataID__,
      edge101.__dataID__,
      edge102.__dataID__,
      edge103.__dataID__,
      edge104.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should refetch for whole ranges for null cursor', () => {
    const queryCalls = [{name: 'first', value: 3}];

    const pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false,
    };

    const nullCursorEdges = [
      edgeWithNullCursor1,
      edgeWithNullCursor2,
      edgeWithNullCursor3,
    ];

    range.addItems(queryCalls, nullCursorEdges, pageInfo);
    const five = [{name: 'first', value: 5}];
    const result = range.retrieveRangeInfoForQuery(five);
    expect(result.requestedEdgeIDs).toEqual([
      'edgeWithNullCursor1',
      'edgeWithNullCursor2',
      'edgeWithNullCursor3',
    ]);
    expect(result.diffCalls).toEqual(five);
  });

  it('replaces whole first() ranges when working with null cursors', () => {
    const queryCalls = [{name: 'first', value: 1}];

    const pageInfo = {
      [HAS_NEXT_PAGE]: true,
    };

    const nullCursorEdges = [
      edgeWithNullCursor1,
      edgeWithNullCursor2,
      edgeWithNullCursor3,
    ];

    // we don't replace empty ranges
    let segment = getFirstSegment(range);
    range.addItems(queryCalls, nullCursorEdges.slice(0, 1), pageInfo);
    expect(segment).toBe(getFirstSegment(range));

    // if we request more results but get the same number, we replace
    // (in case there were deleted items, different items, or reordering)
    const three = [{name: 'first', value: 3}];
    range.addItems(three, nullCursorEdges.slice(0, 1), pageInfo);
    expect(segment).not.toBe(getFirstSegment(range));

    // if the range has gotten bigger, we replace it
    segment = getFirstSegment(range);
    range.addItems(three, nullCursorEdges, pageInfo);
    expect(segment).not.toBe(getFirstSegment(range));

    // if the range has gotten bigger but has cursor info, we don't replace it
    const cursorEdges = [edge0, edge1, edge2];
    range = new GraphQLRange();
    segment = getFirstSegment(range);
    range.addItems(queryCalls, cursorEdges.slice(0, 1), pageInfo);
    expect(segment).toBe(getFirstSegment(range));
    range.addItems(three, cursorEdges, pageInfo);
    expect(segment).toBe(getFirstSegment(range));
  });

  it('replaces whole last() ranges when working with null cursors', () => {
    const queryCalls = [{name: 'last', value: 1}];

    const pageInfo = {
      [HAS_PREV_PAGE]: true,
    };

    const nullCursorEdges = [
      edgeWithNullCursor1,
      edgeWithNullCursor2,
      edgeWithNullCursor3,
    ];

    // we don't replace empty ranges
    let segment = getLastSegment(range);
    range.addItems(queryCalls, nullCursorEdges.slice(2), pageInfo);
    expect(segment).toBe(getLastSegment(range));

    // if we request more results but get the same number, we replace
    // (in case there were deleted items, different items, or reordering)
    const three = [{name: 'last', value: 3}];
    range.addItems(three, nullCursorEdges.slice(2), pageInfo);
    expect(segment).not.toBe(getLastSegment(range));

    // if the range has gotten bigger, we replace it
    segment = getLastSegment(range);
    range.addItems(three, nullCursorEdges, pageInfo);
    expect(segment).not.toBe(getLastSegment(range));

    // if the range has gotten bigger but has cursor info, we don't replace it
    const cursorEdges = [edge0, edge1, edge2];
    range = new GraphQLRange();
    segment = getLastSegment(range);
    range.addItems(queryCalls, cursorEdges.slice(2), pageInfo);
    expect(segment).toBe(getLastSegment(range));
    range.addItems(three, cursorEdges, pageInfo);
    expect(segment).toBe(getLastSegment(range));
  });

  it('should retrieve correct page_info for ranges with null cursors', () => {
    const two = [{name: 'first', value: 2}];
    const three = [{name: 'first', value: 3}];

    const pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: false,
    };

    const nullCursorEdges = [
      edgeWithNullCursor1,
      edgeWithNullCursor2,
      edgeWithNullCursor3,
    ];

    range.addItems(three, nullCursorEdges, pageInfo);
    let result = range.retrieveRangeInfoForQuery(two);
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
    const queryCalls = [{name: 'first', value: 3}];

    const pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(queryCalls, first3Edges, pageInfo);
    range.removeEdgeWithID(edge2.__dataID__);
    const result = range.retrieveRangeInfoForQuery(queryCalls);
    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge3.__dataID__,
    ]);
    expect(result.diffCalls).toEqual([
      {name: 'after', value: 'cursor3'},
      {name: 'first', value: 1},
    ]);
  });

  it('should not retrieve deleted bumped edges', () => {
    const queryCalls = [{name: 'first', value: 3}];

    const pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(queryCalls, first3Edges, pageInfo);
    let result = range.retrieveRangeInfoForQuery(queryCalls);

    // bump the second edge
    const afterQueryCalls = [
      {name: 'after', value: 'cursor3'},
      {name: 'first', value: 1},
    ];

    range.addItems(afterQueryCalls, [first3Edges[1]], pageInfo);

    // delete the second edge
    range.removeEdgeWithID(edge2.__dataID__);
    result = range.retrieveRangeInfoForQuery(queryCalls);
    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge3.__dataID__,
    ]);
    expect(result.diffCalls).toEqual([
      {name: 'after', value: 'cursor3'},
      {name: 'first', value: 1},
    ]);
  });

  it('should retrieve info for first() query given optimistic data', () => {
    const queryCalls = [{name: 'first', value: 3}];

    const pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(queryCalls, first3Edges, pageInfo);

    let result = range.retrieveRangeInfoForQuery([{name: 'first', value: 3}], {
      __rangeOperationPrepend__: [edge4.__dataID__],
    });

    expect(result.requestedEdgeIDs).toEqual([
      edge4.__dataID__,
      edge1.__dataID__,
      edge2.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);

    result = range.retrieveRangeInfoForQuery([{name: 'first', value: 3}], {
      __rangeOperationPrepend__: [edge4.__dataID__, edge5.__dataID__],
    });

    expect(result.requestedEdgeIDs).toEqual([
      edge4.__dataID__,
      edge5.__dataID__,
      edge1.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);

    // append shouldn't affect 'first' call
    result = range.retrieveRangeInfoForQuery([{name: 'first', value: 3}], {
      __rangeOperationAppend__: [edge4.__dataID__, edge5.__dataID__],
    });

    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);

    result = range.retrieveRangeInfoForQuery([{name: 'first', value: 2}], {
      __rangeOperationRemove__: [edge1.__dataID__],
    });

    expect(result.requestedEdgeIDs).toEqual([
      edge2.__dataID__,
      edge3.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);

    result = range.retrieveRangeInfoForQuery([{name: 'first', value: 3}], {
      __rangeOperationPrepend__: [edge4.__dataID__, edge5.__dataID__],
      __rangeOperationRemove__: [edge4.__dataID__, edge1.__dataID__],
    });

    expect(result.requestedEdgeIDs).toEqual([
      edge5.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should retrieve optimistically appended edges when the last edge has been fetched', () => {
    const queryCalls = [{name: 'first', value: 3}];

    // No next page means we have the very last edge.
    const pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(queryCalls, first3Edges, pageInfo);

    let result = range.retrieveRangeInfoForQuery([{name: 'first', value: 4}], {
      __rangeOperationAppend__: [edge4.__dataID__],
    });

    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__,
      edge4.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);

    // Should not return extra edges
    result = range.retrieveRangeInfoForQuery([{name: 'first', value: 3}], {
      __rangeOperationAppend__: [edge4.__dataID__],
    });

    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should retrieve info for last() query given optimistic data', () => {
    const queryCalls = [{name: 'last', value: 3}];

    const pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: true,
    };

    range.addItems(queryCalls, last3Edges, pageInfo);

    let result = range.retrieveRangeInfoForQuery([{name: 'last', value: 3}], {
      __rangeOperationAppend__: [edge97.__dataID__],
    });

    expect(result.requestedEdgeIDs).toEqual([
      edge99.__dataID__,
      edge100.__dataID__,
      edge97.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);

    result = range.retrieveRangeInfoForQuery([{name: 'last', value: 3}], {
      __rangeOperationAppend__: [edge97.__dataID__, edge96.__dataID__],
    });

    expect(result.requestedEdgeIDs).toEqual([
      edge100.__dataID__,
      edge97.__dataID__,
      edge96.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);

    // prepend shouldn't affect 'last' call
    result = range.retrieveRangeInfoForQuery([{name: 'last', value: 3}], {
      __rangeOperationPrepend__: [edge97.__dataID__, edge96.__dataID__],
    });

    expect(result.requestedEdgeIDs).toEqual([
      edge98.__dataID__,
      edge99.__dataID__,
      edge100.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);

    result = range.retrieveRangeInfoForQuery([{name: 'last', value: 2}], {
      __rangeOperationRemove__: [edge99.__dataID__],
    });

    expect(result.requestedEdgeIDs).toEqual([
      edge98.__dataID__,
      edge100.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);

    result = range.retrieveRangeInfoForQuery([{name: 'last', value: 3}], {
      __rangeOperationAppend__: [edge97.__dataID__, edge96.__dataID__],
      __rangeOperationRemove__: [edge100.__dataID__, edge96.__dataID__],
    });

    expect(result.requestedEdgeIDs).toEqual([
      edge98.__dataID__,
      edge99.__dataID__,
      edge97.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should retrieve optimistically prepended edges when the first edge has been fetched', () => {
    const queryCalls = [{name: 'last', value: 3}];

    // No previous page means we have the very first edge.
    const pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(queryCalls, last3Edges, pageInfo);

    let result = range.retrieveRangeInfoForQuery([{name: 'last', value: 4}], {
      __rangeOperationPrepend__: [edge97.__dataID__],
    });

    expect(result.requestedEdgeIDs).toEqual([
      edge97.__dataID__,
      edge98.__dataID__,
      edge99.__dataID__,
      edge100.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);

    // Should not return extra edges
    result = range.retrieveRangeInfoForQuery([{name: 'last', value: 3}], {
      __rangeOperationPrepend__: [edge97.__dataID__],
    });

    expect(result.requestedEdgeIDs).toEqual([
      edge98.__dataID__,
      edge99.__dataID__,
      edge100.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('should toJSON', () => {
    const queryCalls = [{name: 'first', value: 3}];
    const pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(queryCalls, first3Edges, pageInfo);
    const actual = JSON.stringify(range);

    expect(actual).toEqual(
      '[true,false,{},[[{' +
        '"0":{"edgeID":"edge1","cursor":"cursor1","deleted":false},' +
        '"1":{"edgeID":"edge2","cursor":"cursor2","deleted":false},' +
        '"2":{"edgeID":"edge3","cursor":"cursor3","deleted":false}},' +
        '{"edge1":[0],"edge2":[1],"edge3":[2]},' +
        '{"cursor1":0,"cursor2":1,"cursor3":2},0,2,3],' +
        '[{},{},{},null,null,0]]]',
    );

    range = GraphQLRange.fromJSON(JSON.parse(actual));

    // Request the full set
    const result = range.retrieveRangeInfoForQuery(queryCalls);

    expect(result.requestedEdgeIDs).toEqual([
      edge1.__dataID__,
      edge2.__dataID__,
      edge3.__dataID__,
    ]);
    expect(result.diffCalls.length).toBe(0);
  });

  it('returns the DataIDs of all edges', () => {
    // Add a static edges
    const surroundQueryCalls = [{name: 'surrounds', value: ['id2', 1]}];
    const pageInfo = {
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: false,
    };
    range.addItems(surroundQueryCalls, first3Edges, pageInfo);

    // Non-static edges
    const queryCalls = [{name: 'last', value: 3}];
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

  it('returns correct segmented edge ids', () => {
    // Starts off with two empty segments.
    expect(range.getSegmentedEdgeIDs()).toEqual([[], []]);

    const queryCalls = [{name: 'first', value: 3}];
    const pageInfo = {
      [HAS_NEXT_PAGE]: true,
      [HAS_PREV_PAGE]: false,
    };

    range.addItems(queryCalls, first3Edges, pageInfo);
    expect(range.getSegmentedEdgeIDs()).toEqual([
      [edge1.__dataID__, edge2.__dataID__, edge3.__dataID__],
      [],
    ]);
  });
});

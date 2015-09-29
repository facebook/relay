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

jest
  .dontMock('GraphQLRange')
  .dontMock('GraphQLSegment');

var Relay = require('Relay');
var RelayConnectionInterface = require('RelayConnectionInterface');
var RelayMetaRoute = require('RelayMetaRoute');
var RelayQuery = require('RelayQuery');

describe('writeRelayQueryPayload()', () => {
  var RelayRecordStore;

  var {getNode, writePayload} = RelayTestUtils;
  var END_CURSOR, HAS_NEXT_PAGE, HAS_PREV_PAGE, PAGE_INFO, START_CURSOR;

  beforeEach(() => {
    jest.resetModuleRegistry();

    RelayRecordStore = require('RelayRecordStore');

    ({
      END_CURSOR,
      HAS_NEXT_PAGE,
      HAS_PREV_PAGE,
      PAGE_INFO,
      START_CURSOR,
    } = RelayConnectionInterface);

    jest.addMatchers(RelayTestUtils.matchers);
  });

  it('creates empty first() connection records', () => {
    var records = {};
    var store = new RelayRecordStore({records});
    var query = getNode(Relay.QL`
      query {
        node(id:"123") {
          friends(first:"3") {
            edges {
              cursor,
              node {
                id
              },
              source {
                id
              }
            },
            pageInfo {
              hasNextPage,
              hasPreviousPage,
            }
          }
        }
      }
    `);

    var payload = {
      node: {
        id: '123',
        friends: {
          edges: [],
          [PAGE_INFO]: {
            [HAS_NEXT_PAGE]: false,
            [HAS_PREV_PAGE]: false,
          },
        }
      }
    };

    var results = writePayload(store, query, payload);
    expect(results).toEqual({
      created: {
        '123': true,
        'client:1': true, // `friends` connection
      },
      updated: {}
    });
    expect(store.getRangeMetadata('client:1', [
      {name: 'first', value: 3}
    ])).toEqual({
      diffCalls: [],
      filterCalls: [],
      pageInfo: {
        [END_CURSOR]: undefined,
        [HAS_NEXT_PAGE]: false,
        [HAS_PREV_PAGE]: false,
        [START_CURSOR]: undefined,
      },
      requestedEdges: []
    });
  });

  it('creates first() connection records', () => {
    var records = {};
    var store = new RelayRecordStore({records});
    var query = getNode(Relay.QL`
      query {
        node(id:"123") {
          friends(first:"3") {
            edges {
              cursor,
              node {
                id
              },
              source {
                id
              }
            },
            pageInfo {
              hasNextPage,
              hasPreviousPage,
            }
          }
        }
      }
    `);
    var payload = {
      node: {
        id: '123',
        friends: {
          edges: [
            {
              cursor: 'friend1',
              node: {
                id: 'friend1ID'
              },
              source: {
                id: '123'
              }
            },
            {
              cursor: 'friend2',
              node: {
                id: 'friend2ID'
              },
              source: {
                id: '123'
              }
            },
            {
              cursor: 'friend3',
              node: {
                id: 'friend3ID'
              },
              source: {
                id: '123'
              }
            }
          ],
          [PAGE_INFO]: {
            [HAS_NEXT_PAGE]: true,
            [HAS_PREV_PAGE]: false,
          },
        },
      },
    };
    var results = writePayload(store, query, payload);
    expect(results).toEqual({
      created: {
        '123': true,
        'client:1': true, // `friends` connection
        'client:client:1:friend1ID': true,  // edges
        'client:client:1:friend2ID': true,
        'client:client:1:friend3ID': true,
        'friend1ID': true, // nodes
        'friend2ID': true,
        'friend3ID': true,
      },
      updated: {}
    });
    expect(store.getField('friend1ID', 'id')).toBe('friend1ID');
    expect(store.getField('friend2ID', 'id')).toBe('friend2ID');
    expect(store.getField('friend3ID', 'id')).toBe('friend3ID');
    expect(store.getRangeMetadata('client:1', [
      {name: 'first', value: 3}
    ])).toEqual({
      diffCalls: [],
      filterCalls: [],
      pageInfo: {
        [END_CURSOR]: 'friend3',
        [HAS_NEXT_PAGE]: true,
        [HAS_PREV_PAGE]: false,
        [START_CURSOR]: 'friend1',
      },
      requestedEdges: [
        {edgeID: 'client:client:1:friend1ID', nodeID: 'friend1ID'},
        {edgeID: 'client:client:1:friend2ID', nodeID: 'friend2ID'},
        {edgeID: 'client:client:1:friend3ID', nodeID: 'friend3ID'},
      ]
    });
  });

  it('skips over null edges and nodes', () => {
    var records = {};
    var store = new RelayRecordStore({records});
    var query = getNode(Relay.QL`
      query {
        node(id:"123") {
          friends(first:"3") {
            edges {
              cursor,
              node {
                id
              },
            },
            pageInfo {
              hasNextPage,
              hasPreviousPage,
            }
          }
        }
      }
    `);
    var payload = {
      node: {
        id: '123',
        friends: {
          edges: [
            null,
            {
              cursor: 'friend2',
              node: null,
            },
            {
              cursor: 'friend3',
              node: {
                id: 'friend3ID'
              },
            }
          ],
          [PAGE_INFO]: {
            [HAS_NEXT_PAGE]: true,
            [HAS_PREV_PAGE]: false,
          },
        },
      },
    };
    var results = writePayload(store, query, payload);
    expect(results).toEqual({
      created: {
        '123': true,
        'client:1': true, // `friends` connection
        'client:client:1:friend3ID': true, // edges
        'friend3ID': true,
      },
      updated: {}
    });
    expect(store.getField('friend3ID', 'id')).toBe('friend3ID');
    expect(store.getRangeMetadata('client:1', [
      {name: 'first', value: 1}
    ])).toEqual({
      diffCalls: [],
      filterCalls: [],
      pageInfo: {
        [END_CURSOR]: 'friend3',
        [HAS_NEXT_PAGE]: true,
        [HAS_PREV_PAGE]: false,
        [START_CURSOR]: 'friend3',
      },
      requestedEdges: [
        {edgeID: 'client:client:1:friend3ID', nodeID: 'friend3ID'},
      ]
    });
  });

  it('creates range when a connection record already exists', () => {
    var records = {};
    var store = new RelayRecordStore({records});
    var query = getNode(Relay.QL`
      query {
        node(id:"123") {
          friends {count}
        }
      }
    `);
    var payload = {
      node: {
        id: '123',
        friends: {count: 5}
      }
    };
    writePayload(store, query, payload);

    query = getNode(Relay.QL`
      query {
        node(id:"123") {
          friends(first:"1") {
            edges {
              cursor,
              node {
                id
              },
              source {
                id
              }
            },
            pageInfo {
              hasNextPage,
              hasPreviousPage,
            }
          }
        }
      }
    `);
    payload = {
      node: {
        id: '123',
        friends: {
          edges: [
            {
              cursor: 'friend1',
              node: {
                id: 'friend1ID'
              },
              source: {
                id: '123'
              }
            },
          ],
          [PAGE_INFO]: {
            [HAS_NEXT_PAGE]: true,
            [HAS_PREV_PAGE]: false,
          },
        },
      },
    };
    var results = writePayload(store, query, payload);
    expect(results).toEqual({
      created: {
        'client:client:1:friend1ID': true,  // edges
        'friend1ID': true, // nodes
      },
      updated: {
        'client:1': true,
      }
    });
    expect(store.getField('friend1ID', 'id')).toBe('friend1ID');
    expect(store.getRangeMetadata('client:1', [
      {name: 'first', value: 1}
    ])).toEqual({
      diffCalls: [],
      filterCalls: [],
      pageInfo: {
        [END_CURSOR]: 'friend1',
        [HAS_NEXT_PAGE]: true,
        [HAS_PREV_PAGE]: false,
        [START_CURSOR]: 'friend1',
      },
      requestedEdges: [
        {edgeID: 'client:client:1:friend1ID', nodeID: 'friend1ID'},
      ]
    });
  });

  it('should throw when connection is missing required calls', () => {
    var records = {};
    var store = new RelayRecordStore({records});
    var query = getNode(Relay.QL`
      query {
        node(id:"123") {
          friends(isViewerFriend:true) {
            edges {
              cursor,
              node {
                id
              },
              source {
                id
              }
            },
            pageInfo {
              hasNextPage,
              hasPreviousPage,
            }
          }
        }
      }
    `);
    var payload = {
      node: {
        id: '123',
        friends: {
          edges: [
            {
              cursor: 'friend1',
              node: {
                id: 'friend1ID'
              },
              source: {
                id: '123'
              }
            }
          ],
          [PAGE_INFO]: {
            [HAS_NEXT_PAGE]: true,
            [HAS_PREV_PAGE]: false,
          },
        },
      },
    };
    expect(() => writePayload(store, query, payload)).toFailInvariant(
      'RelayQueryWriter: Cannot write edges for connection ' +
      '`friends.isViewerFriend(true)` on record `client:1` without ' +
      '`first`, `last`, or `find` argument.'
    );
  });

  describe('first() connections with existing data', () => {
    var store;

    beforeEach(() => {
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            friends(first:"1") {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      `);
      var payload = {
        node: {
          id: '123',
          friends: {
            edges: [{
              node: {
                id: 'node1'
              },
              cursor: 'cursor1'
            }],
            [PAGE_INFO]: {
              [HAS_NEXT_PAGE]: true,
              [HAS_PREV_PAGE]: false,
            },
          },
        },
      };
      var records = {};
      store = new RelayRecordStore({records});
      writePayload(store, query, payload);
    });

    it('appends new edges', () => {
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            friends(first:"1",after:"cursor1") {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      `);
      var payload = {
        node: {
          id: '123',
          friends: {
            edges: [{
              node: {
                id: 'node2'
              },
              cursor: 'cursor2'
            }],
            [PAGE_INFO]: {
              [HAS_NEXT_PAGE]: true,
              [HAS_PREV_PAGE]: true,
            },
          },
        },
      };
      var results = writePayload(store, query, payload);
      expect(results).toEqual({
        created: {
          'node2': true,
          'client:client:1:node2': true, // 2nd edge
        },
        updated: {
          'client:1': true, // range updated
        }
      });
      expect(store.getRangeMetadata('client:1', [
        {name: 'first', value: 2}
      ])).toEqual({
        diffCalls: [],
        filterCalls: [],
        pageInfo: {
          [END_CURSOR]: 'cursor2',
          [HAS_NEXT_PAGE]: true,
          [HAS_PREV_PAGE]: false,
          [START_CURSOR]: 'cursor1',
        },
        requestedEdges: [
          {edgeID: 'client:client:1:node1', nodeID: 'node1'},
          {edgeID: 'client:client:1:node2', nodeID: 'node2'},
        ],
      });
    });

    it('updates existing edges when ids match', () => {
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            friends(find:"node1") {
              edges {
                node {
                  id,
                  name
                }
              }
            }
          }
        }
      `);
      var payload = {
        node: {
          id: '123',
          friends: {
            edges: [{
              node: {
                id: 'node1',
                name: 'Tim' // added field
              },
              cursor: 'cursor1'
            }],
            [PAGE_INFO]: {
              [HAS_NEXT_PAGE]: true,
              [HAS_PREV_PAGE]: true,
            },
          },
        },
      };
      var results = writePayload(store, query, payload);
      expect(results).toEqual({
        created: {},
        updated: {
          'node1': true,    // `name` added
          // range not updated, only the node changed
        },
      });
      expect(store.getField('node1', 'name')).toBe('Tim');
      expect(store.getRangeMetadata('client:1', [
        {name: 'first', value: 1}
      ])).toEqual({
        diffCalls: [],
        filterCalls: [],
        pageInfo: {
          [END_CURSOR]: 'cursor1',
          [HAS_NEXT_PAGE]: true,
          [HAS_PREV_PAGE]: false,
          [START_CURSOR]: 'cursor1',
        },
        requestedEdges: [
          {edgeID: 'client:client:1:node1', nodeID: 'node1'},
        ],
      });
    });

    it('updates the range when edge data changes', () => {
      // NOTE: Hack to preserve `source{id}` in all environments for now.
      var query = RelayQuery.Root.create(Relay.QL`
        query {
          node(id:"123") {
            friends(find:"node1") {
              edges {
                node {
                  id,
                },
                source {
                  id
                }
              }
            }
          }
        }
      `, RelayMetaRoute.get('$RelayTest'), {});
      var payload = {
        node: {
          id: '123',
          friends: {
            edges: [{
              node: {
                id: 'node1',
              },
              source: { // new edge field
                id: '456'
              },
              cursor: 'cursor1'
            }],
            [PAGE_INFO]: {
              [HAS_NEXT_PAGE]: true,
              [HAS_PREV_PAGE]: true,
            },
          },
        },
      };
      var results = writePayload(store, query, payload);
      expect(results).toEqual({
        created: {
          '456': true, // `source` added
        },
        updated: {
          'client:1': true, // range updated because an edge had a change
          'client:client:1:node1': true, // `source` added to edge
        },
      });
      expect(store.getRangeMetadata('client:1', [
        {name: 'first', value: 1}
      ])).toEqual({
        diffCalls: [],
        filterCalls: [],
        pageInfo: {
          [END_CURSOR]: 'cursor1',
          [HAS_NEXT_PAGE]: true,
          [HAS_PREV_PAGE]: false,
          [START_CURSOR]: 'cursor1',
        },
        requestedEdges: [
          {edgeID: 'client:client:1:node1', nodeID: 'node1'},
        ],
      });
      var sourceID = store.getLinkedRecordID('client:client:1:node1', 'source');
      expect(sourceID).toBe('456');
      expect(store.getField(sourceID, 'id')).toBe('456');
    });

    it('does not overwrite edges when ids conflict', () => {
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            friends(first:"1") {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      `);
      var payload = {
        node: {
          id: '123',
          friends: {
            edges: [{
              node: {
                id: 'node1b'
              },
              cursor: 'cursor1b'
            }],
            [PAGE_INFO]: {
              [HAS_NEXT_PAGE]: true,
              [HAS_PREV_PAGE]: false,
            },
          },
        },
      };
      var results = writePayload(store, query, payload);
      expect(results).toEqual({
        created: {
          'node1b': true,
          'client:client:1:node1b': true,   // edge added but never referenced
        },
        updated: {
          'client:1': true,     // range updated
        }
      });
      expect(store.getField('node1b', 'id')).toBe('node1b');
      expect(store.getRangeMetadata('client:1', [
        {name: 'first', value: 1}
      ])).toEqual({
        diffCalls: [],
        filterCalls: [],
        pageInfo: {
          [END_CURSOR]: 'cursor1',
          [HAS_NEXT_PAGE]: true,
          [HAS_PREV_PAGE]: false,
          [START_CURSOR]: 'cursor1',
        },
        requestedEdges: [
          {edgeID: 'client:client:1:node1', nodeID: 'node1'},
        ],
      });
    });

    it('overwrites ranges when force index is set', () => {
      var query = getNode(Relay.QL`
        query {
          node(id:"123") {
            friends(first:"1") {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      `);
      var payload = {
        node: {
          id: '123',
          friends: {
            edges: [{
              node: {
                id: 'node1b'
              },
              cursor: 'cursor1b'
            }],
            [PAGE_INFO]: {
              [HAS_NEXT_PAGE]: true,
              [HAS_PREV_PAGE]: false,
            },
          },
        },
      };
      var results = writePayload(store, query, payload, null, {forceIndex: 1});
      expect(results).toEqual({
        created: {
          'node1b': true,
          'client:client:1:node1b': true,
        },
        updated: {
          'client:1': true,     // range updated
        }
      });
      expect(store.getField('node1b', 'id')).toBe('node1b');
      expect(store.getRangeMetadata('client:1', [
        {name: 'first', value: 1}
      ])).toEqual({
        diffCalls: [],
        filterCalls: [],
        pageInfo: {
          [END_CURSOR]: 'cursor1b',
          [HAS_NEXT_PAGE]: true,
          [HAS_PREV_PAGE]: false,
          [START_CURSOR]: 'cursor1b',
        },
        requestedEdges: [
          {edgeID: 'client:client:1:node1b', nodeID: 'node1b'},
        ],
      });
    });
  });
});

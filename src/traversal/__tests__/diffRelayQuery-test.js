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

var GraphQLRange = require('GraphQLRange');
var Relay = require('Relay');
var RelayQuery = require('RelayQuery');
var RelayQueryTracker = require('RelayQueryTracker');
var diffRelayQuery = require('diffRelayQuery');

describe('diffRelayQuery', () => {
  var RelayRecordStore;

  var {defer, getNode, getVerbatimNode} = RelayTestUtils;

  var rootCallMap;

  beforeEach(() => {
    jest.resetModuleRegistry();

    RelayRecordStore = require('RelayRecordStore');

    rootCallMap = {
      viewer: {'': 'client:viewer'},
    };

    jest.addMatchers(RelayTestUtils.matchers);
  });

  it('returns the same query with an empty store', () => {
    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          name
        }
      }
    `);
    var records = {};
    var store = new RelayRecordStore({records});
    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toBeQueryRoot(query);
  });

  it('removes requisite fields if fetched', () => {
    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id
        }
      }
    `);
    var records = {
      '4': {
        __dataID__: '4',
        id: '4',
      },
    };
    var store = new RelayRecordStore({records});
    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(0);
  });

  it('removes fetched scalar fields', () => {
    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          name
        }
      }
    `);
    var records = {
      '4': {
        __dataID__: '4',
        id: '4',
        name: 'Mark'
      },
    };
    var store = new RelayRecordStore({records});
    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(0);
  });

  it('removes fetched fields with the same calls', () => {
    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          profilePicture(size:"32")
        }
      }
    `);
    var records = {
      '4': {
        __dataID__: '4',
        id: '4',
        'profilePicture.size(32)': 'https://facebook.com',
      }
    };
    var store = new RelayRecordStore({records});
    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(0);
  });

  it('keeps fetched fields with different calls', () => {
    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          profilePicture(size:"64")
        }
      }
    `);
    var records = {
      '4': {
        __dataID__: '4',
        id: '4',
        'profilePicture.size(32)': 'https://facebook.com',
      }
    };
    var store = new RelayRecordStore({records});
    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toBeQueryRoot(query);
  });

  it('removes fetched fragments', () => {
    var fragment = Relay.QL`
      fragment on Actor {
        id,
        name
      }
    `;
    var query = getNode(Relay.QL`
      query {
        viewer {
          actor {
            ${fragment}
          }
        }
      }
    `);
    var records = {
      'client:viewer': {
        __dataID__: 'client:viewer',
        actor: {__dataID__: '4808495'}
      },
      '4808495': {
        __dataID__: '4808495',
        id: '4808495',
        name: 'Joe'
      },
    };
    var store = new RelayRecordStore({records}, {rootCallMap});
    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(0);
  });

  it('does not fetch known connection metadata for unfetched ranges', () => {
    // `topLevelComments.count` is already fetched and should be diffed out,
    // `edges` is not fetched and should be retained
    var query = getNode(Relay.QL`
      query {
        node(id:"story") {
          feedback {
            topLevelComments(first:"10") {
              count,
              edges {
                node {
                  id,
                  body {
                    text
                  }
                }
              }
            }
          }
        }
      }
    `);
    var records = {
      story: {
        __dataID__: 'story',
        id: 'story',
        feedback: {
          __dataID__: 'story:feedback',
        },
      },
      'story:feedback': {
        __dataID__: 'story:feedback',
        topLevelComments: {
          __dataID__: 'story:feedback:comments',
        },
      },
      'story:feedback:comments': {
        __dataID__: 'story:feedback:comments',
        count: 5,
      },
    };
    var store = new RelayRecordStore({records});
    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    // does not refetch `feedback.topLevelComments.count` but keeps other
    // range fields
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"story") {
          feedback {
            topLevelComments(first:"10") {
              edges {
                node {
                  id,
                  body {
                    text
                  }
                }
              }
            }
          }
        }
      }
    `));

    var body = Relay.QL`
      fragment on Comment {
        body {
          text
        }
      }
    `;
    var fragment = Relay.QL`
      fragment on TopLevelCommentsConnection {
        count,
        edges {
          node {
            id,
            ${body},
          }
        }
      }
    `;
    query = getNode(Relay.QL`
      query {
        node(id:"story") {
          feedback {
            topLevelComments(first:"10") {
              ${fragment},
            }
          }
        }
      }
    `);
    store = new RelayRecordStore({records});
    tracker = new RelayQueryTracker();
    diffQueries = diffRelayQuery(query, store, tracker);
    // does not refetch `feedback.topLevelComments.count` but keeps other
    // range fields
    expect(diffQueries.length).toBe(1);
    var edgesFragment = Relay.QL`
      fragment on TopLevelCommentsConnection {
        edges {
          node {
            ${body},
          },
        },
      }
    `;
    var expectedQuery = getNode(Relay.QL`
      query {
        node(id:"story") {
          feedback {
            topLevelComments(first:"10") {
              ${edgesFragment},
            }
          }
        }
      }
    `);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(expectedQuery);
  });

  it('diffs connection metadata when edges are unfetched', () => {
    var records = {
      story: {
        __dataID__: 'story',
        id: 'story',
        feedback: {
          __dataID__: 'story:feedback',
        },
      },
      'story:feedback': {
        __dataID__: 'story:feedback',
        topLevelComments: {
          __dataID__: 'story:feedback:comments',
        },
      },
      'story:feedback:comments': {
        __dataID__: 'story:feedback:comments',
        count: 5,
      },
    };
    var store = new RelayRecordStore({records});

    var query = getNode(Relay.QL`
      query {
        node(id:"story") {
          feedback {
            topLevelComments {
              count,
              totalCount,
            }
          }
        }
      }
    `);

    // `topLevelComments.totalCount` is not fetched and should be retained
    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"story") {
          feedback {
            topLevelComments {
              totalCount
            }
          }
        }
      }
    `));
  });

  it('keeps connection `edges` when only metadata is fetched', () => {
    var records = {
      story: {
        __dataID__: 'story',
        id: 'story',
        feedback: {
          __dataID__: 'story:feedback',
        },
      },
      'story:feedback': {
        __dataID__: 'story:feedback',
        topLevelComments: {
          __dataID__: 'story:feedback:comments',
        },
      },
      'story:feedback:comments': {
        __dataID__: 'story:feedback:comments',
        count: 5,
      },
    };
    var store = new RelayRecordStore({records});

    // `edges` have not been fetched, should be kept
    var query = getNode(Relay.QL`
      query {
        node(id:"story") {
          feedback {
            topLevelComments {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
    `);

    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toBeQueryRoot(query);
  });

  it('fetches missing connection metadata without fetched edges', () => {
    var mockRange = new GraphQLRange();
    mockRange.retrieveRangeInfoForQuery.mockReturnValue({
      diffCalls: [],
      requestedEdges: [],
    });
    var records = {
      story: {
        __dataID__: 'story',
        id: 'story',
        feedback: {
          __dataID__: 'story:feedback',
        },
      },
      'story:feedback': {
        __dataID__: 'story:feedback',
        topLevelComments: {
          __dataID__: 'story:feedback:comments',
        },
      },
      'story:feedback:comments': {
        __dataID__: 'story:feedback:comments',
        __range__: mockRange,
      },
    };
    var store = new RelayRecordStore({records});
    var query = getNode(Relay.QL`
      query {
        node(id:"story") {
          feedback {
            topLevelComments(first:"10") {
              count,
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
    `);

    // `topLevelComments.count` is not fetched and should be retained,
    // `edges` is fetched and should be diffed out
    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    // does not refetch `feedback.topLevelComments.edges` but keeps `count`
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"story") {
          feedback {
            topLevelComments(first:"10") {
              count
            }
          }
        }
      }
    `));

    var fragment = Relay.QL`
      fragment on TopLevelCommentsConnection {
        count,
        edges {
          node {
            id
          }
        }
      }
    `;
    query = getNode(Relay.QL`
      query {
        node(id:"story") {
          feedback {
            topLevelComments(first:"10") {
              ${fragment},
            }
          }
        }
      }
    `);
    tracker = new RelayQueryTracker();
    diffQueries = diffRelayQuery(query, store, tracker);
    // does not refetch `feedback.topLevelComments.count` but keeps other
    // range fields
    var edgesFragment = Relay.QL`
      fragment on TopLevelCommentsConnection {
        count
      }
    `;
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"story") {
          feedback {
            topLevelComments(first:"10") {
              ${edgesFragment},
            }
          }
        }
      }
    `));
  });

  it('returns an id-only query if the id is unfetched', () => {
    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id
        }
      }
    `);
    var store = new RelayRecordStore({records: {}});
    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toBeQueryRoot(query);

    query = getNode(Relay.QL`
      query {
        viewer {
          actor {
            id
          }
        }
      }
    `);
    var records = {
      'client:viewer': {
        __dataID__: 'client:viewer',
        actor: {
          __dataID__: 'actor'
        }
      },
      'actor': {
        __dataID__: 'actor',
        // `id` should always be fetched, but should work correctly regardless
      }
    };
    store = new RelayRecordStore({records}, {rootCallMap});
    tracker = new RelayQueryTracker();
    diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toBeQueryRoot(query);
  });

  it('fetches a known id if a sibling field is missing', () => {
    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          name
        }
      }
    `);
    var records = {
      '4': {
        __dataID__: '4',
        id: '4',
      },
    };
    var store = new RelayRecordStore({records});
    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toBeQueryRoot(query);

    query = getNode(Relay.QL`
      query {
        viewer {
          actor {
            id,
            name
          }
        }
      }
    `);
    records = {
      'client:viewer': {
        __dataID__: 'client:viewer',
        actor: {
          __dataID__: 'actor'
        }
      },
      'client:actor': {
        __dataID__: 'actor',
        id: 'actor'
      }
    };
    store = new RelayRecordStore({records}, {rootCallMap});
    tracker = new RelayQueryTracker();
    diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toBeQueryRoot(query);
  });

  it('returns nothing for an empty query', () => {
    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          ${null}
        }
      }
    `);
    var store = new RelayRecordStore({records: {}});
    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(0);

    var records = {
      '4': {
        __dataID__: '4',
        id: '4'
      }
    };
    store = new RelayRecordStore({records});
    tracker = new RelayQueryTracker();
    diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(0);
  });

  it('returns nothing if a range field is null', () => {
    // `friends` is null, should not refetch it. This broke when refactoring
    // `diffConnectionEdge` to work around flow; adding it as a regression test.
    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          friends {
            count
          }
        }
      }
    `);
    var records = {
      '4': {
        __dataID__: '4',
        friends: null,
      }
    };
    var store = new RelayRecordStore({records});
    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(0);
  });

  it('splits multiple IDs into separate queries', () => {
    var records = {};
    var store = new RelayRecordStore({records});
    var query = getNode(Relay.QL`
      query {
        nodes(ids:["4","4808495"]) {
          id,
          name
        }
      }
    `);
    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(2);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(getNode(
      Relay.QL`query{nodes(ids:["4"]) {id, name}}`
    ));
    expect(diffQueries[1].getName()).toBe(query.getName());
    expect(diffQueries[1]).toEqualQueryRoot(getNode(
      Relay.QL`query{nodes(ids:["4808495"]) {id, name}}`
    ));
  });

  it('splits viewer-rooted queries', () => {
    var records = {
      'client:viewer': {
        __dataID__: 'client:viewer',
        actor: {__dataID__: '4808495'}
      },
      '4808495': {
        __dataID__: '4808495',
        id: '4808495'
      }
    };
    var store = new RelayRecordStore({records}, {rootCallMap});
    var query = getNode(Relay.QL`
      query {
        viewer {
          actor {
            id
          },
          primaryEmail,
        }
      }
    `);

    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(getNode(
      Relay.QL`query{viewer{primaryEmail}}`
    ));
  });

  it('does not split refetchable fields', () => {
    var records = {
      'client:viewer': {
        __dataID__: 'client:viewer',
        actor: {
          __dataID__: '123'
        }
      },
      '123': {
        __dataID__: '123',
        id: '123',
        name: 'Name'
      }
    };
    var store = new RelayRecordStore({records}, {rootCallMap});
    var query = getNode(Relay.QL`
      query {
        viewer {
          actor {
            id,
            name,
            address {
              city
            }
          }
        }
      }
    `);
    // TODO: split lone-refetchable fields into node queries #6917343
    var field = query.getFieldByStorageKey('actor');
    expect(field.getInferredRootCallName()).toBe('node');

    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(getNode(Relay.QL`
      query {
        viewer {
          actor{
            address{
              city
            }
          }
        }
      }
    `));
  });

  it('reuses fields and fragments if both unchanged', () => {
    var records = {};
    var store = new RelayRecordStore({records});
    var frag = Relay.QL`fragment on Node {name}`;
    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          firstName,
          ${frag},
        }
      }
    `);
    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);

    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toBeQueryRoot(query);
  });

  it('reuses fields if unchanged', () => {
    var records = {
      '4': {
        __dataID__: '4',
        id: '4',
        name: 'Mark Zuckerberg'
      }
    };
    var store = new RelayRecordStore({records});
    var frag = Relay.QL`fragment on Node {name}`;
    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          firstName,
          ${frag},
        }
      }
    `);

    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"4") {
          firstName
        }
      }
    `));
  });

  it('reuses fragments if unchanged', () => {
    var fragment = Relay.QL`fragment on Node {name}`;
    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          firstName,
          ${fragment},
        }
      }
    `);
    var records = {
      '4': {
        __dataID__: '4',
        id: '4',
        firstName: 'Mark'
      }
    };
    var store = new RelayRecordStore({records});

    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"4") {
          ${fragment},
        }
      }
    `));
  });

  it('returns no queries if everything exists', () => {
    var records = {
      '4': {
        __dataID__: '4',
        id: '4',
        firstName: 'Mark'
      }
    };
    var store = new RelayRecordStore({records});
    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          firstName,
        }
      }
    `);

    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(0);

    query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
        }
      }
    `);
    tracker = new RelayQueryTracker();
    diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(0);
  });

  it('removes fields that have data, except id', () => {
    var records = {
      '4': {
        __dataID__: '4',
        id: '4',
        firstName: 'Mark'
      }
    };
    var store = new RelayRecordStore({records});

    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          firstName,
          lastName,
        }
      }
    `);

    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          lastName
        }
      }
    `));
  });

  it('recurses into subfields', () => {
    var records = {
      '4': {
        __dataID__: '4',
        id: '4',
        hometown: {
          __dataID__: '1234'
        }
      },
      '1234': {
        __dataID__: '1234',
        id: '1234',
        name: 'Palo Alto, California'
      }
    };
    var store = new RelayRecordStore({records});
    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          hometown {
            id,
            name,
            websites,
          }
        }
      }
    `);

    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          hometown {
            id,
            websites,
          }
        }
      }
    `));
  });

  it('handles arrays containing Nodes', () => {
    var records = {
      '12345': {
        __dataID__: '12345',
        id: '12345',
        actors: [
          {__dataID__: '4'},
          {__dataID__: '4808495'},
          {__dataID__: '1023896548'}
        ]
      },
      '4': {
        __dataID__: '4',
        id: '4',
        name: 'Mark Zuckerberg',
        firstName: 'Mark',
        lastName: 'Zuckerberg'
      },
      '4808495': {
        __dataID__: '4808495',
        id: '4808495',
        firstName: 'Marshall'
      },
      '1023896548': {
        __dataID__: '1023896548',
        id: '1023896548',
        name: 'Laney Kuenzel'
      }
    };
    var store = new RelayRecordStore({records});

    var query = getNode(Relay.QL`
      query {
        node(id:"12345") {
          id,
          actors {
            id,
            name,
            firstName,
            lastName,
          }
        }
      }
    `);

    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(2);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(getVerbatimNode(Relay.QL`
      query {
        node(id:"4808495") {
          __typename,
          id,
          ... on Actor {
            __typename,
            id,
            lastName,
            name,
          },
        }
      }
    `));
    expect(diffQueries[1].getName()).toBe(query.getName());
    expect(diffQueries[1]).toEqualQueryRoot(getVerbatimNode(Relay.QL`
      query {
        node(id:"1023896548") {
          __typename,
          id,
          ... on Actor {
            __typename,
            firstName,
            id,
            lastName,
          },
        }
      }
    `));

    var trackedQuery = getNode(Relay.QL`
      query {
        node(id:"12345") {
          id,
          actors {
            id,
            firstName,
            lastName,
            name,
          }
        }
      }
    `);
    var trackedQueries = tracker.trackNodeForID.mock.calls;
    expect(trackedQueries.length).toBe(1);
    expect(trackedQueries[0][1]).toBe('12345');
    expect(trackedQueries[0][0]).toEqualQueryNode(trackedQuery);
  });

  it('handles arrays containing non-Nodes', () => {
    var records = {
      '12345': {
        __dataID__: '12345',
        id: '12345',
        screennames: [
          {__dataID__: 'client:1'},
          {__dataID__: 'client:2'}
        ]
      },
      'client:1': {
        __dataID__: 'client:1',
        service: 'GTALK'
      },
      'client:2': {
        __dataID__: 'client:2',
        service: 'TWITTER'
      }
    };
    var store = new RelayRecordStore({records});
    var expected = getNode(Relay.QL`
      query {
        node(id:"12345") {
          id,
          screennames {
            name,
          },
        }
      }
    `);

    // Assume node(12345) is a Story
    var query = getNode(Relay.QL`
      query {
        node(id:"12345") {
          id,
          screennames {
            name,
            service
          }
        }
      }
    `);

    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(expected);
  });

  it('handles missing fields in fragments', () => {
    var records = {
      '4': {
        __dataID__: '4',
        id: '4',
        name: 'Mark Zuckerberg',
        lastName: 'Zuckerberg'
      }
    };
    var store = new RelayRecordStore({records});
    var firstNameFrag = Relay.QL`
      fragment on Node {
        firstName
      }
    `;
    var lastNameFrag = Relay.QL`
      fragment on Node {
        lastName
      }
    `;
    var nestingFrag = Relay.QL`
      fragment on Node {
        ${firstNameFrag},
        ${lastNameFrag}
      }
    `;
    var query = getNode(Relay.QL`
      query {
        nodes(ids:["4","4808495"]) {
          id,
          name,
          ${defer(firstNameFrag)},
          ${lastNameFrag},
          ${defer(nestingFrag)},
        }
      }
    `);
    var expectedFragment = Relay.QL`
      fragment on Node {
        ${firstNameFrag},
      }
    `;
    var expected0 = getNode(Relay.QL`
      query {
        nodes(ids:["4"]) {
          id,
          ${firstNameFrag},
          ${expectedFragment},
        }
      }
    `);
    var expected1 = getNode(Relay.QL`
      query {
        nodes(ids:["4808495"]) {
          id,
          name,
          ${defer(firstNameFrag)},
          ${lastNameFrag},
          ${defer(nestingFrag)}
        }
      }
    `);

    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);

    expect(diffQueries.length).toBe(2);

    var query0 = diffQueries[0];
    var query0Fragments = query0.getChildren().filter(
      child => child instanceof RelayQuery.Fragment
    );
    expect(query0.getName()).toBe(query.getName());
    expect(query0).toEqualQueryRoot(expected0);
    expect(query0Fragments.length).toBe(2);
    expect(query0Fragments[0].isDeferred()).toBeTruthy();
    expect(query0Fragments[0].isDeferred()).toBeTruthy();

    var query1 = diffQueries[1];
    var query1Fragments = query1.getChildren().filter(
      child => child instanceof RelayQuery.Fragment
    );
    expect(query1.getName()).toBe(query.getName());
    expect(query1).toEqualQueryRoot(expected1);
    expect(query1Fragments.length).toBe(3);
    expect(query1Fragments[0].isDeferred()).toBeTruthy();
    expect(query1Fragments[1].isDeferred()).toBeFalsy();
    expect(query1Fragments[2].isDeferred()).toBeTruthy();
  });

  it('fetches the whole range if it is missing', () => {
    var records = {
      '4': {
        __dataID__: '4',
        id: '4',
        name: 'Mark Zuckerberg'
      }
    };
    var store = new RelayRecordStore({records});

    var expected = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          friends(first:"5") {
            edges {
              node {
                id
              },
              cursor
            },
            pageInfo {
              hasNextPage,
              hasPreviousPage
            }
          }
        }
      }
    `);

    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          name,
          friends(first:"5") {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    `);

    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(expected);
  });

  it('fetches an extension of a range', () => {
    var mockRange = new GraphQLRange();
    var records = {
      '4': {
        __dataID__: '4',
        id: '4',
        friends: {__dataID__: 'client:1'}
      },
      'client:1': {
        __dataID__: 'client:1',
        __range__: mockRange
      },
      'client:4:4808495': {
        __dataID__: 'client:4:4808495',
        node: {__dataID__: '4808495'},
        cursor: 'cursor1'
      },
      '4808495': {
        __dataID__: '4808495',
        id: '4808495'
      }
    };
    var store = new RelayRecordStore({records});
    mockRange.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['client:4:4808495'],
      diffCalls: [
        {name: 'after', value: 'cursor1'},
        {name: 'first', value: '4'}
      ]
    });

    var expected = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          friends(after:"cursor1",first:"4") {
            edges {
              cursor,
              node {
                id
              }
            },
            pageInfo {
              hasNextPage,
              hasPreviousPage
            }
          }
        }
      }
    `);

    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          friends(first:"5") {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    `);

    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(expected);
  });

  it('fetches missing parts of a range and diffs nodes it has', () => {
    var mockRange = new GraphQLRange();
    var mockEdge = {
      __dataID__: 'client:4:4808495',
      node: {__dataID__: '4808495'},
      cursor: 'cursor1'
    };
    var records = {
      '4': {
        __dataID__: '4',
        id: '4',
        friends: {__dataID__: 'client:1'}
      },
      'client:1': {
        __dataID__: 'client:1',
        __range__: mockRange
      },
      'client:4:4808495': mockEdge,
      '4808495': {
        __dataID__: '4808495',
        id: '4808495'
      }
    };
    var store = new RelayRecordStore({records});
    mockRange.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['client:4:4808495'],
      diffCalls: [
        {name: 'after', value: 'cursor1'},
        {name: 'first', value: '4'}
      ]
    });

    var expected1 = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          friends(after:"cursor1",first:"4") {
            edges{
              cursor,
              node {
                id,
                name
              }
            },
            pageInfo {
              hasNextPage,
              hasPreviousPage
            }
          }
        }
      }
    `);

    var expected2 = getVerbatimNode(Relay.QL`
      query {
        node(id:"4808495") {
          id,
          __typename,
          ... on User {
            id,
            name,
          },
        }
      }
    `);

    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          friends(first:"5") {
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

    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(2);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(expected1);
    expect(diffQueries[1].getName()).toBe(query.getName());
    expect(diffQueries[1]).toEqualQueryRoot(expected2);

    var trackedQueries = tracker.trackNodeForID.mock.calls;
    expect(trackedQueries.length).toBe(2);
    expect(trackedQueries[1][1]).toBe('4');
    expect(trackedQueries[1][0]).toEqualQueryNode(getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          friends(first:"5") {
            edges {
              node {
                id,
                name
              }
            }
          }
        }
      }
    `));
  });

  it('skips known-deleted nodes from ranges', () => {
    var mockRange = new GraphQLRange();
    var mockEdges = [
      {
        __dataID__: 'client:4:4808495',
        node: {__dataID__: '4808495'},
        cursor: 'cursor1'
      },
      {
        __dataID__: 'client:4:660361306',
        node: {__dataID__: '660361306'},
        cursor: 'cursor1'
      },
    ];
    var records = {
      '4': {
        __dataID__: '4',
        id: '4',
        friends: {__dataID__: 'client:1'}
      },
      'client:1': {
        __dataID__: 'client:1',
        __range__: mockRange
      },
      'client:4:4808495': mockEdges[0],
      '4808495': null,
      'client:4:660361306': mockEdges[1],
      '660361306': {
        __dataID__: '660361306',
        id: '660361306'
      }
    };
    var store = new RelayRecordStore({records});
    mockRange.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['client:4:4808495', 'client:4:660361306'],
      diffCalls: [
        {name: 'after', value: 'cursor1'},
        {name: 'first', value: '4'}
      ]
    });

    var expected1 = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          friends(after:"cursor1",first:"4") {
            edges{
              cursor,
              node {
                id,
                name
              }
            },
            pageInfo {
              hasNextPage,
              hasPreviousPage
            }
          }
        }
      }
    `);
    var expected2 = getVerbatimNode(Relay.QL`
      query {
        node(id:"660361306") {
          id,
          __typename,
          ... on User {
            id,
            name,
          },
        }
      }
    `);

    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          friends(first:"5") {
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

    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);

    expect(diffQueries.length).toBe(2);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(expected1);
    expect(diffQueries[1].getName()).toBe(query.getName());
    expect(diffQueries[1]).toEqualQueryRoot(expected2);

    var trackedQueries = tracker.trackNodeForID.mock.calls;
    expect(trackedQueries.length).toBe(2);
    expect(trackedQueries[1][1]).toBe('4');
    expect(trackedQueries[1][0]).toEqualQueryNode(getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          friends(first:"5") {
            edges {
              node {
                id,
                name
              }
            }
          }
        }
      }
    `));
  });

  it('splits out node() queries inside viewer-rooted queries', () => {
    var mockEdge = {
      __dataID__: 'client:viewer:4808495',
      node: {__dataID__: '4808495'},
      cursor: 'cursor1'
    };

    var mockRange = new GraphQLRange();
    mockRange.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['client:viewer:4808495'],
      diffCalls: null
    });

    var records = {
      'client:viewer': {
        __dataID__: 'client:viewer',
        actor: {__dataID__: '4'},
      },
      '4': {
        __dataID__: '4',
        id: '4',
        friends: {__dataID__: 'client:1'}
      },
      'client:1': {
        __dataID__: 'client:1',
        __range__: mockRange
      },
      'client:viewer:4808495': mockEdge,
      '4808495': {
        __dataID__: '4808495',
        id: '4808495',
        firstName: 'Marshall'
      }
    };
    var store = new RelayRecordStore({records}, {rootCallMap});

    var query = getNode(Relay.QL`
      query {
        viewer {
          actor {
            friends(first:"1") {
              edges {
                node {
                  name,
                },
              },
            },
          },
        }
      }
    `);
    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(getVerbatimNode(Relay.QL`
      query {
        node(id:"4808495"){
          id,
          __typename,
          ... on User {
            id,
            name,
          },
        }
      }
    `));

    var trackedQuery = getNode(Relay.QL`
      query {
        viewer {
          actor {
            id,
            friends(first:"1") {
              edges {
                node {
                  id,
                  name,
                },
              },
            },
          },
        }
      }
    `);
    var innerTrackedQuery = trackedQuery.getFieldByStorageKey('actor');
    var trackedQueries = tracker.trackNodeForID.mock.calls;
    expect(trackedQueries.length).toBe(3);
    expect(trackedQueries[1][1]).toBe('4');
    expect(trackedQueries[1][0]).toEqualQueryNode(innerTrackedQuery);
    expect(trackedQueries[2][1]).toBe('client:viewer');
    expect(trackedQueries[2][0]).toEqualQueryNode(trackedQuery);
  });

  it('splits out node() queries inside fragments', () => {
    var mockRange = new GraphQLRange();
    var records = {
      '4': {
        __dataID__: '4',
        id: '4',
        friends: {__dataID__: 'client:1'}
      },
      'client:1': {
        __dataID__: 'client:1',
        __range__: mockRange
      },
      'client:4:4808495': {
        __dataID__: 'client:4:4808495',
        node: {__dataID__: '4808495'},
        cursor: 'cursor1'
      },
      '4808495': {
        __dataID__: '4808495',
        id: '4808495',
        firstName: 'Marshall'
      }
    };
    var store = new RelayRecordStore({records});
    mockRange.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['client:4:4808495'],
      diffCalls: null
    });

    var expected = getVerbatimNode(Relay.QL`
      query {
        node(id:"4808495") {
          id,
          __typename,
          ... on User {
            id,
            lastName,
          },
        }
      }
    `);

    var fragment = Relay.QL`
      fragment on User {
        friends(first:"1") {
          edges {
            node {
              firstName,
              lastName,
            }
          }
        }
      }
    `;
    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          ${fragment}
        }
      }
    `);

    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(expected);

    var trackedQuery = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          ${fragment},
        }
      }
    `);
    var trackedQueries = tracker.trackNodeForID.mock.calls;
    expect(trackedQueries.length).toBe(2);
    expect(trackedQueries[1][1]).toBe('4');
    expect(trackedQueries[1][0]).toEqualQueryNode(trackedQuery);
  });

  it('creates a find() query for edges', () => {
    var mockRange = new GraphQLRange();
    var mockEdge = {
      __dataID__: 'client:4:4808495',
      node: {__dataID__: '4808495'},
      source: {__dataID__: '4'},
      cursor: 'cursor1'
    };
    var records = {
      '4': {
        __dataID__: '4',
        id: '4',
        name: 'Mark Zuckerberg',
        friends: {__dataID__: 'client:1'}
      },
      'client:1': {
        __dataID__: 'client:1',
        __range__: mockRange
      },
      'client:4:4808495': mockEdge,
      '4808495': {
        __dataID__: '4808495',
        id: '4808495'
      }
    };
    var store = new RelayRecordStore({records});
    mockRange.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['client:4:4808495'],
      diffCalls: null
    });

    var query = getNode(Relay.QL`
      query {
        nodes(ids:"4") {
          id,
          friends(first:"1") {
            edges {
              node {
                id
              },
              source {
                id,
                name,
                firstName
              }
            }
          }
        }
      }
    `);
    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);

    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(getVerbatimNode(Relay.QL`
      query {
        nodes(ids:"4") {
          id,
          __typename,
          friends(find:"4808495") {
            edges {
              cursor,
              node {
                id,
                __typename, # not strictly required here
              },
              source {
                id,
                firstName
              }
            }
          }
        }
      }
    `));
  });

  it('supports diff queries inside find() queries', () => {
    var mockRange = new GraphQLRange();
    var mockEdge = {
      __dataID__: 'client:4:4808495',
      node: {__dataID__: '4808495'},
      source: {__dataID__: '4'},
      cursor: 'cursor1'
    };
    var records = {
      '4': {
        __dataID__: '4',
        id: '4',
        friends: {__dataID__: 'client:1'}
      },
      'client:1': {
        __dataID__: 'client:1',
        __range__: mockRange
      },
      'client:4:4808495': mockEdge,
      '4808495': {
        __dataID__: '4808495',
        id: '4808495',
        name: 'Marshall Roch'
      }
    };
    var store = new RelayRecordStore({records});
    mockRange.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['client:4:4808495'],
      diffCalls: null
    });

    var expected = getVerbatimNode(Relay.QL`
      query {
        node(id:"4808495") {
          id,
          __typename,
          ... on User {
            id,
            lastName,
          },
        }
      }
    `);

    var query = getNode(Relay.QL`
      query {
        nodes(ids:"4") {
          id,
          friends(first:"1") {
            edges {
              node {
                id,
              },
              source {
                id,
                friends(first:"1") {
                  edges {
                    node {
                      id,
                      name,
                      lastName
                    }
                  }
                }
              }
            }
          }
        }
      }
    `);
    var tracker = new RelayQueryTracker();
    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(expected);

    var trackedQueries = tracker.trackNodeForID.mock.calls;
    expect(trackedQueries.length).toBe(5);
    expect(trackedQueries[1][1]).toBe('4');
    expect(trackedQueries[1][0]).toEqualQueryNode(getNode(Relay.QL`
      fragment on FriendsEdge {
        source {
          id,
          friends(first:"1") {
            edges {
              node {
                id,
                name,
                lastName,
              }
            }
          }
        }
      }
    `).getChildren()[0]);

    expect(trackedQueries[4][1]).toBe('4');
    expect(trackedQueries[4][0]).toEqualQueryNode(getNode(Relay.QL`
      query {
        nodes(ids:"4") {
          id,
          friends(first:"1") {
            edges {
              source {
                id,
                friends(first:"1") {
                  edges {
                    node {
                      id,
                      name,
                      lastName
                    }
                  }
                }
              }
            }
          }
        }
      }
    `));
  });
});

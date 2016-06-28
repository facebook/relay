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

require('configureForRelayOSS');

const GraphQLRange = require('GraphQLRange');
const Relay = require('Relay');
const RelayQuery = require('RelayQuery');
const RelayQueryTracker = require('RelayQueryTracker');
const RelayRecordWriter = require('RelayRecordWriter');
const RelayTestUtils = require('RelayTestUtils');

const diffRelayQuery = require('diffRelayQuery');

describe('diffRelayQuery', () => {
  let RelayRecordStore;

  const {defer, getNode, getVerbatimNode, writePayload} = RelayTestUtils;

  let rootCallMap;

  beforeEach(() => {
    jest.resetModuleRegistry();

    RelayRecordStore = require('RelayRecordStore');

    rootCallMap = {
      viewer: {'': 'client:1'},
    };

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  it('returns the same query with an empty store', () => {
    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id
          name
        }
      }
    `);
    const records = {};
    const store = new RelayRecordStore({records});
    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toBeQueryRoot(query);
  });

  it('removes requisite fields if fetched', () => {
    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id
        }
      }
    `);
    const records = {
      '4': {
        __dataID__: '4',
        id: '4',
      },
    };
    const store = new RelayRecordStore({records});
    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(0);
  });

  it('removes fetched scalar fields', () => {
    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id
          name
        }
      }
    `);
    const records = {
      '4': {
        __dataID__: '4',
        id: '4',
        name: 'Mark',
      },
    };
    const store = new RelayRecordStore({records});
    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(0);
  });

  it('removes fetched fields with the same calls', () => {
    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id
          profilePicture(size:"32") { uri }
        }
      }
    `);
    const records = {
      'client:1': {
        __dataID__: 'client:1',
        uri: 'https://facebook.com',
      },
      '4': {
        __dataID__: '4',
        id: '4',
        'profilePicture{size:"32"}': {__dataID__: 'client:1'},
      },
    };
    const store = new RelayRecordStore({records});
    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(0);
  });

  it('keeps fetched fields with different calls', () => {
    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id
          profilePicture(size:"64") { uri }
        }
      }
    `);
    const records = {
      'client:1': {
        __dataID__: 'client:1',
        uri: 'https://facebook.com',
      },
      '4': {
        __dataID__: '4',
        id: '4',
        'profilePicture{size:"32"}': {__dataID__: 'client:1'},
      },
    };
    const store = new RelayRecordStore({records});
    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toBeQueryRoot(query);
  });

  it('removes fetched fragments', () => {
    const fragment = Relay.QL`
      fragment on Actor {
        id
        name
      }
    `;
    const query = getNode(Relay.QL`
      query {
        viewer {
          actor {
            ${fragment}
          }
        }
      }
    `);
    const records = {
      'client:1': {
        __dataID__: 'client:1',
        actor: {__dataID__: '4808495'},
      },
      '4808495': {
        __dataID__: '4808495',
        id: '4808495',
        name: 'Joe',
      },
    };
    const store = new RelayRecordStore({records}, {rootCallMap});
    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(0);
  });

  it('does not fetch known connection metadata for unfetched ranges', () => {
    // `topLevelComments.count` is already fetched and should be diffed out,
    // `edges` is not fetched and should be retained
    let query = getNode(Relay.QL`
      query {
        node(id:"story") {
          feedback {
            topLevelComments(first:"10") {
              count
              edges {
                node {
                  id
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
    const records = {
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
    let store = new RelayRecordStore({records});
    let tracker = new RelayQueryTracker();
    let diffQueries = diffRelayQuery(query, store, tracker);
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
                  id
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

    const body = Relay.QL`
      fragment on Comment {
        body {
          text
        }
      }
    `;
    const fragment = Relay.QL`
      fragment on TopLevelCommentsConnection {
        count
        edges {
          node {
            id
            ${body}
          }
        }
      }
    `;
    query = getNode(Relay.QL`
      query {
        node(id:"story") {
          feedback {
            topLevelComments(first:"10") {
              ${fragment}
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
    const edgesFragment = Relay.QL`
      fragment on TopLevelCommentsConnection {
        edges {
          node {
            ${body}
          }
        }
      }
    `;
    const expectedQuery = getNode(Relay.QL`
      query {
        node(id:"story") {
          feedback {
            topLevelComments(first:"10") {
              ${edgesFragment}
            }
          }
        }
      }
    `);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(expectedQuery);
  });

  it('diffs connection metadata when edges are unfetched', () => {
    const records = {
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
    const store = new RelayRecordStore({records});

    const query = getNode(Relay.QL`
      query {
        node(id:"story") {
          feedback {
            topLevelComments {
              count
              totalCount
            }
          }
        }
      }
    `);

    // `topLevelComments.totalCount` is not fetched and should be retained
    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);
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
    const records = {
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
    const store = new RelayRecordStore({records});

    // `edges` have not been fetched, should be kept
    const query = getNode(Relay.QL`
      query {
        node(id:"story") {
          feedback {
            topLevelComments(first: "10") {
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

    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toBeQueryRoot(query);
  });

  it('fetches missing connection metadata without fetched edges', () => {
    const mockRange = new GraphQLRange();
    mockRange.retrieveRangeInfoForQuery.mockReturnValue({
      diffCalls: [],
      filteredEdges: [],
    });
    const records = {
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
    const store = new RelayRecordStore({records});
    let query = getNode(Relay.QL`
      query {
        node(id:"story") {
          feedback {
            topLevelComments(first:"10") {
              count
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
    let tracker = new RelayQueryTracker();
    let diffQueries = diffRelayQuery(query, store, tracker);
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

    const fragment = Relay.QL`
      fragment on TopLevelCommentsConnection {
        count
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
              ${fragment}
            }
          }
        }
      }
    `);
    tracker = new RelayQueryTracker();
    diffQueries = diffRelayQuery(query, store, tracker);
    // does not refetch `feedback.topLevelComments.count` but keeps other
    // range fields
    const edgesFragment = Relay.QL`
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
              ${edgesFragment}
            }
          }
        }
      }
    `));
  });

  it('returns an id-only query if the id is unfetched', () => {
    let query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id
        }
      }
    `);
    let store = new RelayRecordStore({records: {}});
    let tracker = new RelayQueryTracker();
    let diffQueries = diffRelayQuery(query, store, tracker);
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
      'client:1': {
        __dataID__: 'client:1',
        actor: {
          __dataID__: 'actor',
        },
      },
      'actor': {
        __dataID__: 'actor',
        // `id` should always be fetched, but should work correctly regardless
      },
    };
    store = new RelayRecordStore({records}, {rootCallMap});
    tracker = new RelayQueryTracker();
    diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toBeQueryRoot(query);
  });

  it('fetches a known id if a sibling field is missing', () => {
    let query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id
          name
        }
      }
    `);
    let records = {
      '4': {
        __dataID__: '4',
        id: '4',
      },
    };
    let store = new RelayRecordStore({records});
    let tracker = new RelayQueryTracker();
    let diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toBeQueryRoot(query);

    query = getNode(Relay.QL`
      query {
        viewer {
          actor {
            id
            name
          }
        }
      }
    `);
    records = {
      'client:1': {
        __dataID__: 'client:1',
        actor: {
          __dataID__: 'actor',
        },
      },
      'actor': {
        __dataID__: 'actor',
        id: 'actor',
      },
    };
    store = new RelayRecordStore({records}, {rootCallMap});
    tracker = new RelayQueryTracker();
    diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toBeQueryRoot(query);
  });

  it('returns nothing for an empty query', () => {
    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          ${null}
        }
      }
    `);
    let store = new RelayRecordStore({records: {}});
    let tracker = new RelayQueryTracker();
    let diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(0);

    var records = {
      '4': {
        __dataID__: '4',
        id: '4',
      },
    };
    store = new RelayRecordStore({records});
    tracker = new RelayQueryTracker();
    diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(0);
  });

  it('returns nothing if a range field is null', () => {
    // `friends` is null, should not refetch it. This broke when refactoring
    // `diffConnectionEdge` to work around flow; adding it as a regression test.
    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          friends {
            count
          }
        }
      }
    `);
    const records = {
      '4': {
        __dataID__: '4',
        friends: null,
      },
    };
    const store = new RelayRecordStore({records});
    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(0);
  });

  it('splits multiple IDs into separate queries', () => {
    const records = {};
    const store = new RelayRecordStore({records});
    const query = getNode(Relay.QL`
      query {
        nodes(ids:["4","4808495"]) {
          id
          name
        }
      }
    `);
    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(2);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(getNode(Relay.QL`
      query {
        nodes(ids:["4"]) {
          id
          __typename
          name
        }
      }
    `));
    expect(diffQueries[0].getIdentifyingArg()).toEqual({
      name: 'ids',
      type: '[ID!]',
      value: ['4'],
    });
    expect(diffQueries[1].getName()).toBe(query.getName());
    expect(diffQueries[1]).toEqualQueryRoot(getNode(Relay.QL`
      query {
        nodes(ids:["4808495"]) {
          id
          __typename
          name
        }
      }
    `));
    expect(diffQueries[1].getIdentifyingArg()).toEqual({
      name: 'ids',
      type: '[ID!]',
      value: ['4808495'],
    });
  });

  it('splits viewer-rooted queries', () => {
    const records = {
      'client:1': {
        __dataID__: 'client:1',
        actor: {__dataID__: '4808495'},
      },
      '4808495': {
        __dataID__: '4808495',
        id: '4808495',
      },
    };
    const store = new RelayRecordStore({records}, {rootCallMap});
    const query = getNode(Relay.QL`
      query {
        viewer {
          actor {
            id
          }
          primaryEmail
        }
      }
    `);

    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(getNode(
      Relay.QL`query{viewer{primaryEmail}}`
    ));
  });

  it('does not split refetchable fields', () => {
    const records = {
      'client:1': {
        __dataID__: 'client:1',
        actor: {
          __dataID__: '123',
        },
      },
      '123': {
        __dataID__: '123',
        id: '123',
        name: 'Name',
      },
    };
    const store = new RelayRecordStore({records}, {rootCallMap});
    const query = getNode(Relay.QL`
      query {
        viewer {
          actor {
            id
            name
            address {
              city
            }
          }
        }
      }
    `);
    // TODO: split lone-refetchable fields into node queries #6917343
    const field = query.getFieldByStorageKey('actor');
    expect(field.getInferredRootCallName()).toBe('node');

    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);
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
    const records = {};
    const store = new RelayRecordStore({records});
    const frag = Relay.QL`fragment on Node {name}`;
    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          firstName
          ${frag}
        }
      }
    `);
    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);

    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toBeQueryRoot(query);
  });

  it('reuses fields if unchanged', () => {
    const records = {
      '4': {
        __dataID__: '4',
        id: '4',
        name: 'Mark Zuckerberg',
      },
    };
    const store = new RelayRecordStore({records});
    const frag = Relay.QL`fragment on Node {name}`;
    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          firstName
          ${frag}
        }
      }
    `);

    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);
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
    const fragment = Relay.QL`fragment on Node {name}`;
    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          firstName
          ${fragment}
        }
      }
    `);
    const records = {
      '4': {
        __dataID__: '4',
        id: '4',
        firstName: 'Mark',
      },
    };
    const store = new RelayRecordStore({records});

    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"4") {
          ${fragment}
        }
      }
    `));
  });

  it('returns no queries if everything exists', () => {
    const records = {
      '4': {
        __dataID__: '4',
        id: '4',
        firstName: 'Mark',
      },
    };
    const store = new RelayRecordStore({records});
    let query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id
          firstName
        }
      }
    `);

    let tracker = new RelayQueryTracker();
    let diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(0);

    query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id
        }
      }
    `);
    tracker = new RelayQueryTracker();
    diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(0);
  });

  it('removes fields that have data, except id', () => {
    const records = {
      '4': {
        __dataID__: '4',
        id: '4',
        firstName: 'Mark',
      },
    };
    const store = new RelayRecordStore({records});

    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id
          firstName
          lastName
        }
      }
    `);

    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"4") {
          id
          lastName
        }
      }
    `));
  });

  it('recurses into subfields', () => {
    const records = {
      '4': {
        __dataID__: '4',
        id: '4',
        hometown: {
          __dataID__: '1234',
        },
      },
      '1234': {
        __dataID__: '1234',
        id: '1234',
        name: 'Palo Alto, California',
      },
    };
    const store = new RelayRecordStore({records});
    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id
          hometown {
            id
            name
            websites
          }
        }
      }
    `);

    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"4") {
          id
          hometown {
            id
            websites
          }
        }
      }
    `));
  });

  it('handles arrays containing Nodes', () => {
    const records = {
      '12345': {
        __dataID__: '12345',
        id: '12345',
        actors: [
          {__dataID__: '4'},
          {__dataID__: '4808495'},
          {__dataID__: '1023896548'},
        ],
      },
      '4': {
        __dataID__: '4',
        id: '4',
        name: 'Mark Zuckerberg',
        firstName: 'Mark',
        lastName: 'Zuckerberg',
      },
      '4808495': {
        __dataID__: '4808495',
        id: '4808495',
        firstName: 'Marshall',
      },
      '1023896548': {
        __dataID__: '1023896548',
        id: '1023896548',
        name: 'Laney Kuenzel',
      },
    };
    const store = new RelayRecordStore({records});

    const query = getNode(Relay.QL`
      query {
        node(id:"12345") {
          id
          actors {
            id
            name
            firstName
            lastName
          }
        }
      }
    `);

    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(2);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(getVerbatimNode(Relay.QL`
      query {
        node(id:"4808495") {
          __typename
          id
          ... on Actor {
            __typename
            id
            lastName
            name
          }
        }
      }
    `));
    expect(diffQueries[1].getName()).toBe(query.getName());
    expect(diffQueries[1]).toEqualQueryRoot(getVerbatimNode(Relay.QL`
      query {
        node(id:"1023896548") {
          __typename
          id
          ... on Actor {
            __typename
            firstName
            id
            lastName
          }
        }
      }
    `));

    const trackedQuery = getNode(Relay.QL`
      query {
        node(id:"12345") {
          id
          actors {
            id
            firstName
            lastName
            name
          }
        }
      }
    `);
    const trackedQueries = tracker.trackNodeForID.mock.calls;
    expect(trackedQueries.length).toBe(1);
    expect(trackedQueries[0][1]).toBe('12345');
    expect(trackedQueries[0][0]).toEqualQueryNode(trackedQuery);
  });

  it('diffs plural fields having exactly one linked record', () => {
    const records = {
      '12345': {
        __dataID__: '12345',
        id: '12345',
        screennames: [
          {__dataID__: 'client:1'},
        ],
      },
      'client:1': {
        __dataID__: 'client:1',
        service: 'GTALK',
      },
    };
    const store = new RelayRecordStore({records});
    const expected = getNode(Relay.QL`
      query {
        node(id:"12345") {
          id
          screennames {
            name
          }
        }
      }
    `);

    // Assume node(12345) is a Story
    const query = getNode(Relay.QL`
      query {
        node(id:"12345") {
          id
          screennames {
            name
            service
          }
        }
      }
    `);

    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(expected);
  });

  it('does not diff plural fields having more than one linked record', () => {
    const records = {
      '12345': {
        __dataID__: '12345',
        id: '12345',
        screennames: [
          {__dataID__: 'client:1'},
          {__dataID__: 'client:2'},
        ],
      },
      'client:1': {
        __dataID__: 'client:1',
        service: 'GTALK',
      },
      'client:2': {
        __dataID__: 'client:2',
        service: 'TWITTER',
      },
    };
    const store = new RelayRecordStore({records});

    // Assume node(12345) is a Story
    const query = getNode(Relay.QL`
      query {
        node(id:"12345") {
          id
          screennames {
            name
            service
          }
        }
      }
    `);

    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toBe(query);
  });

  it('handles missing fields in fragments', () => {
    const records = {
      '4': {
        __dataID__: '4',
        id: '4',
        name: 'Mark Zuckerberg',
        lastName: 'Zuckerberg',
      },
    };
    const store = new RelayRecordStore({records});
    const firstNameFrag = Relay.QL`
      fragment on Node {
        firstName
      }
    `;
    const lastNameFrag = Relay.QL`
      fragment on Node {
        lastName
      }
    `;
    const nestingFrag = Relay.QL`
      fragment on Node {
        ${firstNameFrag}
        ${lastNameFrag}
      }
    `;
    const query = getNode(Relay.QL`
      query {
        nodes(ids:["4","4808495"]) {
          id
          name
          ${defer(firstNameFrag)}
          ${lastNameFrag}
          ${defer(nestingFrag)}
        }
      }
    `);
    const expectedFragment = Relay.QL`
      fragment on Node {
        ${firstNameFrag}
      }
    `;
    const expected0 = getNode(Relay.QL`
      query {
        nodes(ids:["4"]) {
          id
          ${firstNameFrag}
          ${expectedFragment}
        }
      }
    `);
    const expected1 = getNode(Relay.QL`
      query {
        nodes(ids:["4808495"]) {
          id
          name
          ${defer(firstNameFrag)}
          ${lastNameFrag}
          ${defer(nestingFrag)}
        }
      }
    `);

    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);

    expect(diffQueries.length).toBe(2);

    const query0 = diffQueries[0];
    const query0Fragments = query0.getChildren().filter(
      child => child instanceof RelayQuery.Fragment
    );
    expect(query0.getName()).toBe(query.getName());
    expect(query0).toEqualQueryRoot(expected0);
    expect(query0Fragments.length).toBe(2);
    expect(query0Fragments[0].isDeferred()).toBeTruthy();
    expect(query0Fragments[0].isDeferred()).toBeTruthy();

    const query1 = diffQueries[1];
    const query1Fragments = query1.getChildren().filter(
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
    const records = {
      '4': {
        __dataID__: '4',
        id: '4',
        name: 'Mark Zuckerberg',
      },
    };
    const store = new RelayRecordStore({records});

    const expected = getNode(Relay.QL`
      query {
        node(id:"4") {
          id
          friends(first:"5") {
            edges {
              node {
                id
              }
              cursor
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      }
    `);

    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id
          name
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

    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(expected);
  });

  it('fetches an extension of a range', () => {
    const mockRange = new GraphQLRange();
    const records = {
      '4': {
        __dataID__: '4',
        id: '4',
        friends: {__dataID__: 'client:1'},
      },
      'client:1': {
        __dataID__: 'client:1',
        __range__: mockRange,
      },
      'client:4:4808495': {
        __dataID__: 'client:4:4808495',
        node: {__dataID__: '4808495'},
        cursor: 'cursor1',
      },
      '4808495': {
        __dataID__: '4808495',
        id: '4808495',
      },
    };
    const store = new RelayRecordStore({records});
    mockRange.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['client:4:4808495'],
      diffCalls: [
        {name: 'after', value: 'cursor1'},
        {name: 'first', value: '4'},
      ],
    });

    const expected = getNode(Relay.QL`
      query {
        node(id:"4") {
          id
          friends(after:"cursor1",first:"4") {
            edges {
              cursor
              node {
                id
              }
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      }
    `);

    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id
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

    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(expected);
  });

  it('fetches missing parts of a range and diffs nodes it has', () => {
    const mockRange = new GraphQLRange();
    const mockEdge = {
      __dataID__: 'client:4:4808495',
      node: {__dataID__: '4808495'},
      cursor: 'cursor1',
    };
    const records = {
      '4': {
        __dataID__: '4',
        id: '4',
        friends: {__dataID__: 'client:1'},
      },
      'client:1': {
        __dataID__: 'client:1',
        __range__: mockRange,
      },
      'client:4:4808495': mockEdge,
      '4808495': {
        __dataID__: '4808495',
        id: '4808495',
      },
    };
    const store = new RelayRecordStore({records});
    mockRange.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['client:4:4808495'],
      diffCalls: [
        {name: 'after', value: 'cursor1'},
        {name: 'first', value: '4'},
      ],
    });

    const expected1 = getNode(Relay.QL`
      query {
        node(id:"4") {
          id
          friends(after:"cursor1",first:"4") {
            edges{
              cursor
              node {
                id
                name
              }
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      }
    `);

    const expected2 = getVerbatimNode(Relay.QL`
      query {
        node(id:"4808495") {
          id
          __typename
          ... on User {
            id
            name
          }
        }
      }
    `);

    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id
          friends(first:"5") {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }
    `);

    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(2);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(expected1);
    expect(diffQueries[1].getName()).toBe(query.getName());
    expect(diffQueries[1]).toEqualQueryRoot(expected2);

    const trackedQueries = tracker.trackNodeForID.mock.calls;
    expect(trackedQueries.length).toBe(2);
    expect(trackedQueries[1][1]).toBe('4');
    expect(trackedQueries[1][0]).toEqualQueryNode(getNode(Relay.QL`
      query {
        node(id:"4") {
          id
          friends(first:"5") {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }
    `));
  });

  it('skips known-deleted nodes from ranges', () => {
    const mockRange = new GraphQLRange();
    const mockEdges = [
      {
        __dataID__: 'client:4:4808495',
        node: {__dataID__: '4808495'},
        cursor: 'cursor1',
      },
      {
        __dataID__: 'client:4:660361306',
        node: {__dataID__: '660361306'},
        cursor: 'cursor1',
      },
    ];
    const records = {
      '4': {
        __dataID__: '4',
        id: '4',
        friends: {__dataID__: 'client:1'},
      },
      'client:1': {
        __dataID__: 'client:1',
        __range__: mockRange,
      },
      'client:4:4808495': mockEdges[0],
      '4808495': null,
      'client:4:660361306': mockEdges[1],
      '660361306': {
        __dataID__: '660361306',
        id: '660361306',
      },
    };
    const store = new RelayRecordStore({records});
    mockRange.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['client:4:4808495', 'client:4:660361306'],
      diffCalls: [
        {name: 'after', value: 'cursor1'},
        {name: 'first', value: '4'},
      ],
    });

    const expected1 = getNode(Relay.QL`
      query {
        node(id:"4") {
          id
          friends(after:"cursor1",first:"4") {
            edges{
              cursor
              node {
                id
                name
              }
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      }
    `);
    const expected2 = getVerbatimNode(Relay.QL`
      query {
        node(id:"660361306") {
          id
          __typename
          ... on User {
            id
            name
          }
        }
      }
    `);

    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id
          friends(first:"5") {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }
    `);

    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);

    expect(diffQueries.length).toBe(2);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(expected1);
    expect(diffQueries[1].getName()).toBe(query.getName());
    expect(diffQueries[1]).toEqualQueryRoot(expected2);

    const trackedQueries = tracker.trackNodeForID.mock.calls;
    expect(trackedQueries.length).toBe(2);
    expect(trackedQueries[1][1]).toBe('4');
    expect(trackedQueries[1][0]).toEqualQueryNode(getNode(Relay.QL`
      query {
        node(id:"4") {
          id
          friends(first:"5") {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }
    `));
  });

  it('splits out node() queries inside viewer-rooted queries', () => {
    const mockEdge = {
      __dataID__: 'client:1:4808495',
      node: {__dataID__: '4808495'},
      cursor: 'cursor1',
    };

    const mockRange = new GraphQLRange();
    mockRange.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['client:1:4808495'],
      diffCalls: null,
    });

    const records = {
      'client:1': {  // viewer
        __dataID__: 'client:1',
        actor: {__dataID__: '4'},
      },
      '4': {
        __dataID__: '4',
        id: '4',
        friends: {__dataID__: 'client:2'},
      },
      'client:2': {  // friends
        __dataID__: 'client:2',
        __range__: mockRange,
      },
      'client:1:4808495': mockEdge,
      '4808495': {
        __dataID__: '4808495',
        id: '4808495',
        firstName: 'Marshall',
      },
    };
    const store = new RelayRecordStore({records}, {rootCallMap});

    const query = getNode(Relay.QL`
      query {
        viewer {
          actor {
            friends(first:"1") {
              edges {
                node {
                  name
                }
              }
            }
          }
        }
      }
    `);
    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(getVerbatimNode(Relay.QL`
      query {
        node(id:"4808495"){
          id
          __typename
          ... on User {
            id
            name
          }
        }
      }
    `));

    const trackedQuery = getNode(Relay.QL`
      query {
        viewer {
          actor {
            id
            friends(first:"1") {
              edges {
                node {
                  id
                  name
                }
              }
            }
          }
        }
      }
    `);
    const innerTrackedQuery = trackedQuery.getFieldByStorageKey('actor');
    const trackedQueries = tracker.trackNodeForID.mock.calls;
    expect(trackedQueries.length).toBe(3);
    expect(trackedQueries[1][1]).toBe('4');
    expect(trackedQueries[1][0]).toEqualQueryNode(innerTrackedQuery);
    expect(trackedQueries[2][1]).toBe('client:1');
    expect(trackedQueries[2][0]).toEqualQueryNode(trackedQuery);
  });

  it('splits out node() queries inside fragments', () => {
    const mockRange = new GraphQLRange();
    const records = {
      '4': {
        __dataID__: '4',
        id: '4',
        friends: {__dataID__: 'client:1'},
      },
      'client:1': {
        __dataID__: 'client:1',
        __range__: mockRange,
      },
      'client:4:4808495': {
        __dataID__: 'client:4:4808495',
        node: {__dataID__: '4808495'},
        cursor: 'cursor1',
      },
      '4808495': {
        __dataID__: '4808495',
        id: '4808495',
        firstName: 'Marshall',
      },
    };
    const store = new RelayRecordStore({records});
    mockRange.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['client:4:4808495'],
      diffCalls: null,
    });

    const expected = getVerbatimNode(Relay.QL`
      query {
        node(id:"4808495") {
          id
          __typename
          ... on User {
            id
            lastName
          }
        }
      }
    `);

    const fragment = Relay.QL`
      fragment on User {
        friends(first:"1") {
          edges {
            node {
              firstName
              lastName
            }
          }
        }
      }
    `;
    const query = getNode(Relay.QL`
      query {
        node(id:"4") {
          ${fragment}
        }
      }
    `);

    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(expected);

    const trackedQuery = getNode(Relay.QL`
      query {
        node(id:"4") {
          id
          ${fragment}
        }
      }
    `);
    const trackedQueries = tracker.trackNodeForID.mock.calls;
    expect(trackedQueries.length).toBe(2);
    expect(trackedQueries[1][1]).toBe('4');
    expect(trackedQueries[1][0]).toEqualQueryNode(trackedQuery);
  });

  it('creates a find() query for edges', () => {
    const mockRange = new GraphQLRange();
    const mockEdge = {
      __dataID__: 'client:4:4808495',
      node: {__dataID__: '4808495'},
      source: {__dataID__: '4'},
      cursor: 'cursor1',
    };
    const records = {
      '4': {
        __dataID__: '4',
        __typename: 'User',
        id: '4',
        name: 'Mark Zuckerberg',
        friends: {__dataID__: 'client:1'},
      },
      'client:1': {
        __dataID__: 'client:1',
        __range__: mockRange,
      },
      'client:4:4808495': mockEdge,
      '4808495': {
        __dataID__: '4808495',
        id: '4808495',
      },
    };
    const store = new RelayRecordStore({records});
    mockRange.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['client:4:4808495'],
      diffCalls: null,
    });

    const query = getNode(Relay.QL`
      query {
        nodes(ids:"4") {
          id
          friends(first:"1") {
            edges {
              node {
                id
              }
              source {
                id
                name
                firstName
              }
            }
          }
        }
      }
    `);
    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);

    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(getVerbatimNode(Relay.QL`
      query {
        nodes(ids:"4") {
          ... on User {
            id
            __typename
            friends(find:"4808495") {
              edges {
                cursor
                node {
                  id
                  __typename, # not strictly required here
                }
                source {
                  id
                  firstName
                }
              }
            }
          }
        }
      }
    `));
  });

  it('supports diff queries inside find() queries', () => {
    const mockRange = new GraphQLRange();
    const mockEdge = {
      __dataID__: 'client:4:4808495',
      node: {__dataID__: '4808495'},
      source: {__dataID__: '4'},
      cursor: 'cursor1',
    };
    const records = {
      '4': {
        __dataID__: '4',
        id: '4',
        friends: {__dataID__: 'client:1'},
      },
      'client:1': {
        __dataID__: 'client:1',
        __range__: mockRange,
      },
      'client:4:4808495': mockEdge,
      '4808495': {
        __dataID__: '4808495',
        id: '4808495',
        name: 'Marshall Roch',
      },
    };
    const store = new RelayRecordStore({records});
    mockRange.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['client:4:4808495'],
      diffCalls: null,
    });

    const expected = getVerbatimNode(Relay.QL`
      query {
        node(id:"4808495") {
          id
          __typename
          ... on User {
            id
            lastName
          }
        }
      }
    `);

    const query = getNode(Relay.QL`
      query {
        nodes(ids:"4") {
          id
          friends(first:"1") {
            edges {
              node {
                id
              }
              source {
                id
                friends(first:"1") {
                  edges {
                    node {
                      id
                      name
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
    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(expected);

    const trackedQueries = tracker.trackNodeForID.mock.calls;
    expect(trackedQueries.length).toBe(5);
    expect(trackedQueries[1][1]).toBe('4');
    expect(trackedQueries[1][0]).toEqualQueryNode(getNode(Relay.QL`
      fragment on FriendsEdge {
        source {
          id
          friends(first:"1") {
            edges {
              node {
                id
                name
                lastName
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
          id
          friends(first:"1") {
            edges {
              source {
                id
                friends(first:"1") {
                  edges {
                    node {
                      id
                      name
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

  it('tracks fragments on null plural fields', () => {
    const records = {};
    const store = new RelayRecordStore({records}, {rootCallMap});
    const writer = new RelayRecordWriter(records, rootCallMap, false);
    const tracker = new RelayQueryTracker();

    // Create the first query with a selection on a plural field.
    const firstQuery = getNode(Relay.QL`
      query {
        node(id: "123") {
          id
          __typename
          actors {
            id
          }
        }
      }
    `);

    const firstPayload = {
      node: {
        id: '123',
        __typename: 'User',
        actors: null,
      },
    };
    writePayload(store, writer, firstQuery, firstPayload, tracker);
    let trackedQueries = tracker.trackNodeForID.mock.calls;
    expect(trackedQueries.length).toBe(1);
    expect(trackedQueries[0][1]).toBe('123');
    expect(trackedQueries[0][0]).toEqualQueryRoot(firstQuery);

    // Create a second query that requests a different selection on the null
    // plural field.
    const secondQuery = getNode(Relay.QL`
      query {
        node(id: "123") {
          actors {
            name
          }
        }
      }
    `);

    // Everything can be diffed out, plural field is null
    const diffQueries = diffRelayQuery(secondQuery, store, tracker);
    expect(diffQueries.length).toBe(0);

    // Ensure the new `actors { name }` field is tracked.
    trackedQueries = tracker.trackNodeForID.mock.calls;
    expect(trackedQueries.length).toBe(2);
    expect(trackedQueries[1][1]).toBe('123');
    expect(trackedQueries[1][0]).toEqualQueryRoot(secondQuery);
  });

  it('tracks fragments on empty plural fields', () => {
    const records = {};
    const store = new RelayRecordStore({records}, {rootCallMap});
    const writer = new RelayRecordWriter(records, rootCallMap, false);
    const tracker = new RelayQueryTracker();

    // Create the first query with a selection on a plural field
    const firstQuery = getNode(Relay.QL`
      query {
        node(id: "123") {
          id
          __typename
          actors {
            id
          }
        }
      }
    `);

    const firstPayload = {
      node: {
        id: '123',
        __typename: 'User',
        actors: [],
      },
    };
    writePayload(store, writer, firstQuery, firstPayload, tracker);
    let trackedQueries = tracker.trackNodeForID.mock.calls;
    expect(trackedQueries.length).toBe(1);
    expect(trackedQueries[0][1]).toBe('123');
    expect(trackedQueries[0][0]).toEqualQueryRoot(firstQuery);

    // Create a second query that requests a different selection on the empty
    // plural field.
    const secondQuery = getNode(Relay.QL`
      query {
        node(id: "123") {
          actors {
            name
          }
        }
      }
    `);

    // Everything can be diffed out, plural field is empty.
    const diffQueries = diffRelayQuery(secondQuery, store, tracker);
    expect(diffQueries.length).toBe(0);

    // Ensure the new `actors { name }` field is tracked.
    trackedQueries = tracker.trackNodeForID.mock.calls;
    expect(trackedQueries.length).toBe(2);
    expect(trackedQueries[1][1]).toBe('123');
    expect(trackedQueries[1][0]).toEqualQueryRoot(secondQuery);
  });

  it('produces non-abstract diffs from non-abstract plural roots', () => {
    const records = {};
    const store = new RelayRecordStore({records});
    const query = getNode(Relay.QL`
      query {
        route(waypoints:[
          {lat: "49.246292", lon: "-123.116226"}
          {lat: "49.246292", lon: "-123.116226"}
        ]) {
          steps { note }
        }
      }
    `);
    const tracker = new RelayQueryTracker();
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(2);
    expect(diffQueries[0].isAbstract()).toBe(false);
    expect(diffQueries[1].isAbstract()).toBe(false);
  });

  it('uses the supplied query tracker', () => {
    const query = getNode(Relay.QL`
      query {
        node(id: "4") {
          friends {
            count
          }
        }
      }
    `);
    const records = {
      '4': {
        __dataID__: '4',
        friends: null,
      },
    };
    const store = new RelayRecordStore({records});
    const tracker = new RelayQueryTracker();
    tracker.trackNodeForID = jest.fn();
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(0);
    expect(tracker.trackNodeForID).toBeCalled();
  });

  it('degrades gracefully in the absence of a query tracker', () => {
    const query = getNode(Relay.QL`
      query {
        node(id: "4") {
          friends {
            count
          }
        }
      }
    `);
    const records = {
      '4': {
        __dataID__: '4',
        friends: null,
      },
    };
    const store = new RelayRecordStore({records});
    let diffQueries;
    expect(() => {
      diffQueries = diffRelayQuery(query, store, null);
    }).not.toThrow();
    expect(diffQueries.length).toBe(0);
  });
});

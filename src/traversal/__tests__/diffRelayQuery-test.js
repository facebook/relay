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
  .dontMock('GraphQLSegment')
  .dontMock('generateClientID');

var GraphQLRange = require('GraphQLRange');
var Relay = require('Relay');
var RelayQuery = require('RelayQuery');
var generateClientEdgeID = require('generateClientEdgeID');
var diffRelayQuery = require('diffRelayQuery');

describe('diffRelayQuery', () => {
  var RelayRecordStore;

  var {defer, getNode, getVerbatimNode, writePayload} = RelayTestUtils;

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
    var store = new RelayRecordStore({records: {}});
    var diffQueries = diffRelayQuery(query, store);
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
    var payload = {
      node: {
        id: '4',
      },
    };
    var store = new RelayRecordStore({records: {}});
    writePayload(store, query, payload);
    var diffQueries = diffRelayQuery(query, store);
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
    var payload = {
      node: {
        id: '4',
        name: 'Mark'
      },
    };
    var store = new RelayRecordStore({records: {}});
    writePayload(store, query, payload);
    var diffQueries = diffRelayQuery(query, store);
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
    var payload = {
      node: {
        id: '4',
        'profilePicture': 'https://facebook.com',
      }
    };
    var store = new RelayRecordStore({records: {}});
    writePayload(store, query, payload);
    var diffQueries = diffRelayQuery(query, store);
    expect(diffQueries.length).toBe(0);
  });

  it('keeps fetched fields with different calls', () => {
    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          profilePicture(size:"32")
        }
      }
    `);
    var payload = {
      node: {
        id: '4',
        'profilePicture': 'https://facebook.com',
      },
    };
    var diffQuery = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          profilePicture(size:"64")
        }
      }
    `);
    var store = new RelayRecordStore({records: {}});
    writePayload(store, query, payload);
    var diffQueries = diffRelayQuery(diffQuery, store);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toBeQueryRoot(diffQuery);
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
    var payload = {
      'viewer': {
        actor: {
          id: '4808495',
          name: 'Joe',
        },
      },
    };
    var store = new RelayRecordStore({records: {}}, {rootCallMap});
    writePayload(store, query, payload);
    var diffQueries = diffRelayQuery(query, store);
    expect(diffQueries.length).toBe(0);
  });

  it('does not fetch known connection metadata for unfetched ranges', () => {
    // `topLevelComments.count` is already fetched and should be diffed out,
    // `edges` is not fetched and should be retained
    var query = getNode(Relay.QL`
      query {
        node(id:"story") {
          feedback {
            topLevelComments(first: 10) {
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
    var payload = {
      node: {
        id: 'story',
        feedback: {
          topLevelComments: {
            count: 5,
          },
        },
      },
    };
    var store = new RelayRecordStore({records: {}});
    writePayload(store, query, payload);
    var diffQueries = diffRelayQuery(query, store);
    // does not refetch `feedback.topLevelComments.count` but keeps other
    // range fields
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"story") {
          feedback {
            topLevelComments(first: 10) {
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
            topLevelComments(first: 10) {
              ${fragment},
            }
          }
        }
      }
    `);
    store = new RelayRecordStore({records: {}});
    writePayload(store, query, payload);

    diffQueries = diffRelayQuery(query, store);
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
            topLevelComments(first: 10) {
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
    var payload = {
      node: {
        id: 'story',
        feedback: {
          topLevelComments: {
            count: 5,
          },
        },
      },
    };
    var store = new RelayRecordStore({records: {}});
    writePayload(store, query, payload);

    // `topLevelComments.totalCount` is not fetched and should be retained
    var diffQueries = diffRelayQuery(query, store);
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
    // `edges` have not been fetched, should be kept
    var query = getNode(Relay.QL`
      query {
        node(id:"story") {
          feedback {
            topLevelComments {
              count
            }
          }
        }
      }
    `);
    var payload = {
      node: {
        id: 'story',
        feedback: {
          topLevelComments: {
            count: 5,
          },
        },
      },
    };
    var store = new RelayRecordStore({records: {}});
    writePayload(store, query, payload);

    var diffQuery = getNode(Relay.QL`
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
    var diffQueries = diffRelayQuery(diffQuery, store);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toBeQueryRoot(diffQuery);
  });

  it('fetches missing connection metadata without fetched edges', () => {
    var query = getNode(Relay.QL`
      query {
        node(id:"story") {
          feedback {
            topLevelComments(first: 10) {
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
    var payload = {
      node: {
        id: 'story',
        feedback: {
          topLevelComments: {
            edges: [],
          },
        },
      },
    };
    var store = new RelayRecordStore({records: {}});
    writePayload(store, query, payload);

    // `topLevelComments.count` is not fetched and should be retained,
    // `edges` is fetched and should be diffed out
    var diffQueries = diffRelayQuery(query, store);
    // does not refetch `feedback.topLevelComments.edges` but keeps `count`
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"story") {
          feedback {
            topLevelComments(first: 10) {
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
            topLevelComments(first: 10) {
              ${fragment},
            }
          }
        }
      }
    `);
    diffQueries = diffRelayQuery(query, store);
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
            topLevelComments(first: 10) {
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
    var diffQueries = diffRelayQuery(query, store);
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
    var payload = {
      'viewer': {
        actor: {},
      },
    };
    store = new RelayRecordStore({records: {}}, {rootCallMap});
    writePayload(store, query, payload);
    diffQueries = diffRelayQuery(query, store);
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
    var payload = {
      node: {
        id: '4',
      },
    };
    var store = new RelayRecordStore({records: {}});
    writePayload(store, query, payload);
    var diffQueries = diffRelayQuery(query, store);
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
    payload = {
      'viewer': {
        actor: {
          id: 'actor',
        },
      },
    };
    store = new RelayRecordStore({records: {}}, {rootCallMap});
    writePayload(store, query, payload);
    diffQueries = diffRelayQuery(query, store);
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
    var diffQueries = diffRelayQuery(query, store);
    expect(diffQueries.length).toBe(0);

    var payload = {
      node: {
        id: '4',
      },
    };
    store = new RelayRecordStore({records: {}});
    writePayload(store, query, payload);
    diffQueries = diffRelayQuery(query, store);
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
    var payload = {
      node: {
        friends: null,
      },
    };
    var store = new RelayRecordStore({records: {}});
    writePayload(store, query, payload);
    var diffQueries = diffRelayQuery(query, store);
    expect(diffQueries.length).toBe(0);
  });

  it('splits multiple IDs into separate queries', () => {
    var store = new RelayRecordStore({records: {}});
    var query = getNode(Relay.QL`
      query {
        nodes(ids:["4","4808495"]) {
          id,
          name
        }
      }
    `);
    var diffQueries = diffRelayQuery(query, store);
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
    var payload = {
      'viewer': {
        actor: {
          id: '4808495',
        },
      },
    };
    var store = new RelayRecordStore({records: {}}, {rootCallMap});
    writePayload(store, query, payload);

    var diffQueries = diffRelayQuery(query, store);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(getNode(
      Relay.QL`query{viewer{primaryEmail}}`
    ));
  });

  it('does not split refetchable fields', () => {
    var payload = {
      'viewer': {
        actor: {
          id: '123',
          name: 'Name',
        },
      },
    };
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
    var store = new RelayRecordStore({records: {}}, {rootCallMap});
    writePayload(store, query, payload);
    // TODO: split lone-refetchable fields into node queries #6917343
    var field = query.getFieldByStorageKey('actor');
    expect(field.getInferredRootCallName()).toBe('node');

    var diffQueries = diffRelayQuery(query, store);
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
    var store = new RelayRecordStore({records: {}});
    var frag = Relay.QL`fragment on Node {name}`;
    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          firstName,
          ${frag},
        }
      }
    `);
    var diffQueries = diffRelayQuery(query, store);

    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toBeQueryRoot(query);
  });

  it('reuses fields if unchanged', () => {
    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          firstName,
          ${frag},
        }
      }
    `);
    var payload = {
      node: {
        id: '4',
        name: 'Mark Zuckerberg',
      },
    };
    var store = new RelayRecordStore({records: {}});
    writePayload(store, query, payload);
    var frag = Relay.QL`fragment on Node {name}`;

    var diffQueries = diffRelayQuery(query, store);
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
    var payload = {
      node: {
        id: '4',
        firstName: 'Mark'
      },
    };
    var store = new RelayRecordStore({records: {}});
    writePayload(store, query, payload);

    var diffQueries = diffRelayQuery(query, store);
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
    var payload = {
      node: {
        id: '4',
        firstName: 'Mark',
      },
    };
    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          firstName,
        }
      }
    `);
    var store = new RelayRecordStore({records: {}});
    writePayload(store, query, payload);

    var diffQueries = diffRelayQuery(query, store);
    expect(diffQueries.length).toBe(0);

    query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
        }
      }
    `);
    diffQueries = diffRelayQuery(query, store);
    expect(diffQueries.length).toBe(0);
  });

  it('removes fields that have data, except id', () => {
    var payload = {
      node: {
        id: '4',
        firstName: 'Mark',
      },
    };
    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          firstName,
          lastName,
        }
      }
    `);
    var store = new RelayRecordStore({records: {}});
    writePayload(store, query, payload);

    var diffQueries = diffRelayQuery(query, store);
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
    var payload = {
      node: {
        id: '4',
        hometown: {
          id: '1234',
          name: 'Palo Alto, California',
        },
      },
    };
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
    var store = new RelayRecordStore({records: {}});
    writePayload(store, query, payload);

    var diffQueries = diffRelayQuery(query, store);
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
    var payload = {
      node: {
        id: '12345',
        actors: [
          {
            id: '4',
            name: 'Mark Zuckerberg',
            firstName: 'Mark',
            lastName: 'Zuckerberg',
          },
          {
            id: '4808495',
            firstName: 'Marshall',
          },
          {
            id: '1023896548',
            name: 'Laney Kuenzel',
          },
        ],
      },
    };
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
    var store = new RelayRecordStore({records: {}});
    writePayload(store, query, payload);

    var diffQueries = diffRelayQuery(query, store);
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
  });

  it('handles arrays containing non-Nodes', () => {
    var payload = {
      node: {
        id: '12345',
        screennames: [
          {service: 'GTALK'},
          {service: 'TWITTER'},
        ],
      },
    };
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
    var store = new RelayRecordStore({records: {}});
    writePayload(store, query, payload);

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
    var diffQueries = diffRelayQuery(query, store);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(expected);
  });

  it('handles missing fields in fragments', () => {
    var payload = {
      nodes: [
        {
          id: '4',
          name: 'Mark Zuckerberg',
          lastName: 'Zuckerberg',
        },
        {},
      ],
    };
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
    var store = new RelayRecordStore({records: {}});
    writePayload(store, query, payload);

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

    var diffQueries = diffRelayQuery(query, store);

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
    var payload = {
      node: {
        id: '4',
        name: 'Mark Zuckerberg',
      },
    };
    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          name,
          friends(first: 5) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    `);
    var store = new RelayRecordStore({records: {}});
    writePayload(store, query, payload);

    var expected = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          friends(first: 5) {
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

    var diffQueries = diffRelayQuery(query, store);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(expected);
  });

  it('fetches an extension of a range', () => {
    var payload = {
      node: {
        id: '4',
        friends: {
          edges: [
            {
              cursor: 'cursor1',
              node: {
                id: '4808495',
              },
            },
          ],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
          },
        },
      },
    };
    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          friends(first: 5) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    `);
    var store = new RelayRecordStore({records: {}});
    writePayload(store, query, payload);

    var expected = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          friends(after:"cursor1",first: 4) {
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

    var diffQueries = diffRelayQuery(query, store);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(expected);
  });

  it('fetches missing parts of a range and diffs nodes it has', () => {
    var payload = {
      node: {
        id: '4',
        friends: {
          edges: [
            {
              cursor: 'cursor1',
              node: {
                id: '4808495',
              },
            },
          ],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
          },
        },
      },
    };
    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          friends(first: 5) {
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
    var store = new RelayRecordStore({records: {}});
    writePayload(store, query, payload);

    var expected1 = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          friends(after:"cursor1",first:4) {
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

    var diffQueries = diffRelayQuery(query, store);
    expect(diffQueries.length).toBe(2);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(expected1);
    expect(diffQueries[1].getName()).toBe(query.getName());
    expect(diffQueries[1]).toEqualQueryRoot(expected2);
  });

  it('skips known-deleted nodes from ranges', () => {
    var payload = {
      node: {
        id: '4',
        friends: {
          edges: [
            {
              cursor: 'cursor1',
              node: {
                id: 'deleteme',
              },
            },
            {
              cursor: 'cursor2',
              node: {
                id: '660361306',
              },
            },
          ],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
          },
        },
      },
    };
    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          friends(first: 5) {
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
    var store = new RelayRecordStore({records: {}});
    writePayload(store, query, payload);
    var connectionID = store.getLinkedRecordID('4', 'friends');
    var edgeID = generateClientEdgeID(connectionID, 'deleteme');
    store.applyRangeUpdate(connectionID, edgeID, 'remove');

    var expected1 = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          friends(after:"cursor2",first: 4) {
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

    var diffQueries = diffRelayQuery(query, store);
    expect(diffQueries.length).toBe(2);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(expected1);
    expect(diffQueries[1].getName()).toBe(query.getName());
    expect(diffQueries[1]).toEqualQueryRoot(expected2);
  });

  it('splits out node() queries inside viewer-rooted queries', () => {
    var mockEdge = {
      __dataID__: 'client:viewer:4808495',
      node: {__dataID__: '4808495'},
      cursor: 'cursor1'
    };

    var payload = {
      'viewer': {
        actor: {
          id: '4',
          friends: {
            edges: [
              {
                cursor: 'cursor1',
                node: {
                  id: '4808495',
                  firstName: 'Marshall',
                },
              },
            ],
          },
        },
      },
    };
    var query = getNode(Relay.QL`
      query {
        viewer {
          actor {
            friends(first: 1) {
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
    var store = new RelayRecordStore({records: {}}, {rootCallMap});
    writePayload(store, query, payload);

    var diffQueries = diffRelayQuery(query, store);
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
  });

  it('splits out node() queries inside fragments', () => {
    var payload = {
      node: {
        id: '4',
        friends: {
          edges: [
            {
              cursor: 'cursor1',
              node: {
                id: '4808495',
                firstName: 'Marshall',
              },
            },
          ],
        },
      },
    };
    var fragment = Relay.QL`
      fragment on User {
        friends(first: 1) {
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
    var store = new RelayRecordStore({records: {}});
    writePayload(store, query, payload);

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



    var diffQueries = diffRelayQuery(query, store);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(expected);
  });

  it('creates a find() query for edges', () => {
    var mockEdge = {
      __dataID__: 'client:4:4808495',
      node: {__dataID__: '4808495'},
      source: {__dataID__: '4'},
      cursor: 'cursor1'
    };
    var payload = {
      node: {
        id: '4',
        name: 'Mark Zuckerberg',
        friends: {
          edges: [
            {
              cursor: 'cursor1',
              node: {
                id: '4808495',
              },
              source: {
                id: '4',
                name: 'Mark Zuckerberg',
              },
            },
          ],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
          },
        },
      },
    };
    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          friends(first: 1) {
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
    var store = new RelayRecordStore({records: {}});
    writePayload(store, query, payload);

    var diffQueries = diffRelayQuery(query, store);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(getVerbatimNode(Relay.QL`
      query {
        node(id:"4") {
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
    var payload = {
      node: {
        id: '4',
        friends: {
          edges: [
            {
              cursor: 'cursor1',
              node: {
                id: '4808495',
              },
              source: {
                id: '4',
                friends: {
                  edges: [
                    {
                      node: {
                        id: '4808495',
                        name: 'Marshall Roch',
                      },
                    },
                  ],
                },
              },
            },
          ],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
          },
        },
      },
    };
    var query = getNode(Relay.QL`
      query {
        node(id:"4") {
          id,
          friends(first: 1) {
            edges {
              node {
                id,
              },
              source {
                id,
                friends(first: 1) {
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
    var records = {};
    var store = new RelayRecordStore({records});
    writePayload(store, query, payload);

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

    var diffQueries = diffRelayQuery(query, store);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getName()).toBe(query.getName());
    expect(diffQueries[0]).toEqualQueryRoot(expected);
  });
});

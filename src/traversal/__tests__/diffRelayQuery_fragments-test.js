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

jest
  .dontMock('GraphQLRange')
  .dontMock('GraphQLSegment');

const Relay = require('Relay');
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayQueryTracker = require('RelayQueryTracker');
const RelayTestUtils = require('RelayTestUtils');

const diffRelayQuery = require('diffRelayQuery');

describe('diffRelayQuery - fragments', () => {
  var RelayRecordStore;
  var RelayRecordWriter;

  var {getNode, writePayload} = RelayTestUtils;
  var HAS_NEXT_PAGE, HAS_PREV_PAGE, PAGE_INFO;

  var rootCallMap = {
    'viewer': {'': 'client:1'},
  };

  beforeEach(() => {
    jest.resetModuleRegistry();

    RelayRecordStore = require('RelayRecordStore');
    RelayRecordWriter = require('RelayRecordWriter');
    ({HAS_NEXT_PAGE, HAS_PREV_PAGE, PAGE_INFO} = RelayConnectionInterface);

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  it('removes matching fragments with fetched fields', () => {
    var records = {};
    var store = new RelayRecordStore({records});
    var writer = new RelayRecordWriter(records, {}, false);
    var tracker = new RelayQueryTracker();

    var query = getNode(Relay.QL`
      query {
        node(id:"123") {
          ... on User {
            firstName
          }
        }
      }
    `);
    var payload = {
      node: {
        id: '123',
        __typename: 'User',
        firstName: 'Joe',
      },
    };
    writePayload(store, writer, query, payload, tracker);

    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(0);
  });

  it('tracks fragments for null linked fields', () => {
    var records = {};
    var store = new RelayRecordStore({records});
    var writer = new RelayRecordWriter(records, {}, false);
    var tracker = new RelayQueryTracker();

    // Create the first query with a selection on a linked field.
    var firstQuery = getNode(Relay.QL`
      query {
        node(id:"123") {
          ... on User {
            address {
              country
            }
          }
        }
      }
    `);

    var firstPayload = {
      node: {
        id: '123',
        __typename: 'User',
        firstName: 'Joe',
        address: null,
      },
    };
    writePayload(store, writer, firstQuery, firstPayload, tracker);
    var trackedQueries = tracker.trackNodeForID.mock.calls;
    expect(trackedQueries.length).toBe(1);
    expect(trackedQueries[0][1]).toBe('123');
    expect(trackedQueries[0][0]).toEqualQueryRoot(firstQuery);

    // Create a second query that requests a different selection on the null
    // linked field.
    var secondQuery = getNode(Relay.QL`
      query {
        node(id:"123") {
          ... on User {
            address {
              city
            }
          }
        }
      }
    `);

    // Everything can be diffed out, linked field is null.
    var diffQueries = diffRelayQuery(secondQuery, store, tracker);
    expect(diffQueries.length).toBe(0);

    // Ensure the new `address { city }` field is tracked.
    trackedQueries = tracker.trackNodeForID.mock.calls;
    expect(trackedQueries.length).toBe(2);
    expect(trackedQueries[1][1]).toBe('123');
    expect(trackedQueries[1][0]).toEqualQueryRoot(secondQuery);
  });

  it('refetches matching fragments with missing fields', () => {
    var records = {};
    var store = new RelayRecordStore({records});
    var writer = new RelayRecordWriter(records, {}, false);
    var tracker = new RelayQueryTracker();

    var query = getNode(Relay.QL`
      query {
        node(id:"123") {
          ... on User {
            firstName
            lastName
          }
        }
      }
    `);
    var payload = {
      node: {
        id: '123',
        __typename: 'User',
        firstName: 'Joe', // missing `lastName`
      },
    };
    writePayload(store, writer, query, payload, tracker);

    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"123") {
          ... on User {
            lastName
          }
        }
      }
    `));
  });

  it('removes non-matching fragments if other fields are fetched', () => {
    var records = {};
    var store = new RelayRecordStore({records});
    var writer = new RelayRecordWriter(records, {}, false);
    var tracker = new RelayQueryTracker();

    var query = getNode(Relay.QL`
      query {
        node(id:"123") {
          ... on User {
            firstName
          }
          ... on Page {
            name
          }
        }
      }
    `);
    var payload = {
      node: {
        id: '123',
        __typename: 'User',
        firstName: 'Joe',
      },
    };
    writePayload(store, writer, query, payload, tracker);

    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(0);
  });

  it('refetches non-matching fragments if other fields are missing', () => {
    var records = {};
    var store = new RelayRecordStore({records});
    var writer = new RelayRecordWriter(records, {}, false);
    var tracker = new RelayQueryTracker();

    var query = getNode(Relay.QL`
      query {
        node(id:"123") {
          ... on User {
            firstName
            lastName
          }
          ... on Page {
            name
          }
        }
      }
    `);
    var payload = {
      node: {
        id: '123',
        __typename: 'User',
        firstName: 'Joe', // missing `lastName`
      },
    };
    writePayload(store, writer, query, payload, tracker);

    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"123") {
          ... on User {
            lastName
          }
          ... on Page {
            name
          }
        }
      }
    `));
  });

  it('removes non-matching fragments if connection fields are fetched', () => {
    var records = {};
    var store = new RelayRecordStore({records}, {rootCallMap});
    var writer = new RelayRecordWriter(records, rootCallMap, false);
    var tracker = new RelayQueryTracker();

    var payload = {
      viewer: {
        newsFeed: {
          edges: [
            {
              cursor: 'c1',
              node: {
                id: 's1',
                __typename: 'Story',
                message: {text: 's1'},
              },
            },
          ],
          [PAGE_INFO]: {
            [HAS_NEXT_PAGE]: true,
            [HAS_PREV_PAGE]: false,
          },
        },
      },
    };
    var query = getNode(Relay.QL`
      query {
        viewer {
          newsFeed(first:"1") {
            edges {
              node {
                ... on Story {
                  message {
                    text
                  }
                }
                ... on PhotoStory {
                  photo {
                    uri
                  }
                }
              }
            }
          }
        }
      }
    `);
    writePayload(store, writer, query, payload, tracker);

    var diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(0);
  });

  it(
    'refetches non-matching fragments if connection fields are missing',
    () => {
      var records = {};
      var store = new RelayRecordStore({records}, {rootCallMap});
      var writer = new RelayRecordWriter(records, rootCallMap, false);
      var tracker = new RelayQueryTracker();

      var payload = {
        viewer: {
          newsFeed: {
            edges: [
              {
                cursor: 'c1',
                node: {
                  id: 's1',
                  __typename: 'Story',
                  message: {
                    text: 's1', // missing `ranges`
                  },
                },
              },
            ],
            [PAGE_INFO]: {
              [HAS_NEXT_PAGE]: true,
              [HAS_PREV_PAGE]: false,
            },
          },
        },
      };
      var query = getNode(Relay.QL`
        query {
          viewer {
            newsFeed(first:"1") {
              edges {
                node {
                  ... on Story {
                    message {
                      text
                      ranges
                    }
                  }
                  ... on PhotoStory {
                    photo {
                      uri
                    }
                  }
                }
              }
            }
          }
        }
      `);
      writePayload(store, writer, query, payload, tracker);

      var diffQueries = diffRelayQuery(query, store, tracker);
      expect(diffQueries.length).toBe(1);
      expect(diffQueries[0]).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"s1") {
          ... on Story {
            message {
              ranges
            }
          }
          ... on PhotoStory {
            photo {
              uri
            }
          }
          ... on FeedUnit {
            id
            __typename
          }
        }
      }
    `));
    }
  );
});

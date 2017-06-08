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

jest.enableAutomock();

require('configureForRelayOSS');

jest.unmock('GraphQLRange').unmock('GraphQLSegment');

const Relay = require('Relay');
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayFragmentReference = require('RelayFragmentReference');
const RelayQueryTracker = require('RelayQueryTracker');
const RelayTestUtils = require('RelayTestUtils');

const diffRelayQuery = require('diffRelayQuery');

describe('diffRelayQuery - fragments', () => {
  let RelayRecordStore;
  let RelayRecordWriter;

  const {getNode, writePayload} = RelayTestUtils;
  let HAS_NEXT_PAGE, HAS_PREV_PAGE, PAGE_INFO;

  const rootCallMap = {
    viewer: {'': 'client:1'},
  };

  beforeEach(() => {
    jest.resetModules();

    RelayRecordStore = require('RelayRecordStore');
    RelayRecordWriter = require('RelayRecordWriter');
    ({HAS_NEXT_PAGE, HAS_PREV_PAGE, PAGE_INFO} = RelayConnectionInterface);

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  it('removes matching fragments with fetched fields', () => {
    const records = {};
    const store = new RelayRecordStore({records});
    const writer = new RelayRecordWriter(records, {}, false);
    const tracker = new RelayQueryTracker();

    const query = getNode(
      Relay.QL`
      query {
        node(id:"123") {
          ... on User {
            firstName
          }
        }
      }
    `,
    );
    const payload = {
      node: {
        id: '123',
        __typename: 'User',
        firstName: 'Joe',
      },
    };
    writePayload(store, writer, query, payload, tracker);

    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(0);
  });

  it('caches original fragment composite hash if deferred and missing fields', () => {
    const records = {};
    const store = new RelayRecordStore({records});
    const writer = new RelayRecordWriter(records, {}, false);
    const tracker = new RelayQueryTracker();

    const writeFragment = Relay.QL`
      fragment on User {
        firstName
      }
    `;
    const writeQuery = getNode(
      Relay.QL`
      query {
        node(id:"123") {
          ${writeFragment}
        }
      }
    `,
    );
    const payload = {
      node: {
        id: '123',
        __typename: 'User',
        firstName: 'Joe', // missing `lastName`
      },
    };
    writePayload(store, writer, writeQuery, payload, tracker);

    const readFragment = getNode(
      Relay.QL`
      fragment on User {
        firstName
        lastName
      }
    `,
    );

    const fragmentReference = new RelayFragmentReference(
      () => readFragment.getConcreteQueryNode(),
      {},
    );
    fragmentReference.defer();

    const query = getNode(
      Relay.QL`
      query {
        node(id:"123") {
          ${fragmentReference}
        }
      }
    `,
    );

    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0].getChildren().length).toBe(3);

    const fragmentRef = diffQueries[0].getChildren()[2];
    const originalCompositeHash = readFragment.getCompositeHash();
    expect(fragmentRef.getSourceCompositeHash()).toBe(originalCompositeHash);

    expect(diffQueries[0]).toEqualQueryRoot(
      getNode(
        Relay.QL`
      query {
        node(id:"123") {
          ... on User {
            lastName
          }
        }
      }
    `,
      ),
    );
  });

  it('tracks fragments for null linked fields', () => {
    const records = {};
    const store = new RelayRecordStore({records});
    const writer = new RelayRecordWriter(records, {}, false);
    const tracker = new RelayQueryTracker();

    // Create the first query with a selection on a linked field.
    const firstQuery = getNode(
      Relay.QL`
      query {
        node(id:"123") {
          ... on User {
            address {
              country
            }
          }
        }
      }
    `,
    );

    const firstPayload = {
      node: {
        id: '123',
        __typename: 'User',
        firstName: 'Joe',
        address: null,
      },
    };
    writePayload(store, writer, firstQuery, firstPayload, tracker);
    let trackedQueries = tracker.trackNodeForID.mock.calls;
    expect(trackedQueries.length).toBe(1);
    expect(trackedQueries[0][1]).toBe('123');
    expect(trackedQueries[0][0]).toEqualQueryRoot(firstQuery);

    // Create a second query that requests a different selection on the null
    // linked field.
    const secondQuery = getNode(
      Relay.QL`
      query {
        node(id:"123") {
          ... on User {
            address {
              city
            }
          }
        }
      }
    `,
    );

    // Everything can be diffed out, linked field is null.
    const diffQueries = diffRelayQuery(secondQuery, store, tracker);
    expect(diffQueries.length).toBe(0);

    // Ensure the new `address { city }` field is tracked.
    trackedQueries = tracker.trackNodeForID.mock.calls;
    expect(trackedQueries.length).toBe(2);
    expect(trackedQueries[1][1]).toBe('123');
    expect(trackedQueries[1][0]).toEqualQueryRoot(secondQuery);
  });

  it('removes non-matching fragments if other fields are fetched', () => {
    const records = {};
    const store = new RelayRecordStore({records});
    const writer = new RelayRecordWriter(records, {}, false);
    const tracker = new RelayQueryTracker();

    const query = getNode(
      Relay.QL`
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
    `,
    );
    const payload = {
      node: {
        id: '123',
        __typename: 'User',
        firstName: 'Joe',
      },
    };
    writePayload(store, writer, query, payload, tracker);

    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(0);
  });

  it('refetches non-matching fragments if other fields are missing', () => {
    const records = {};
    const store = new RelayRecordStore({records});
    const writer = new RelayRecordWriter(records, {}, false);
    const tracker = new RelayQueryTracker();

    const writeQuery = getNode(
      Relay.QL`
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
    `,
    );
    const payload = {
      node: {
        id: '123',
        __typename: 'User',
        firstName: 'Joe', // missing `lastName`
      },
    };
    writePayload(store, writer, writeQuery, payload, tracker);

    const query = getNode(
      Relay.QL`
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
    `,
    );
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toEqualQueryRoot(
      getNode(
        Relay.QL`
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
    `,
      ),
    );
  });

  it('removes non-matching fragments if connection fields are fetched', () => {
    const records = {};
    const store = new RelayRecordStore({records}, {rootCallMap});
    const writer = new RelayRecordWriter(records, rootCallMap, false);
    const tracker = new RelayQueryTracker();

    const payload = {
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
    const query = getNode(
      Relay.QL`
      query {
        viewer {
          newsFeed(first: 1) {
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
    `,
    );
    writePayload(store, writer, query, payload, tracker);

    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(0);
  });

  it('refetches non-matching fragments if connection fields are missing', () => {
    const records = {};
    const store = new RelayRecordStore({records}, {rootCallMap});
    const writer = new RelayRecordWriter(records, rootCallMap, false);
    const tracker = new RelayQueryTracker();

    const payload = {
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
    const writeQuery = getNode(
      Relay.QL`
        query {
          viewer {
            newsFeed(first: 1) {
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
      `,
    );
    writePayload(store, writer, writeQuery, payload, tracker);

    const query = getNode(
      Relay.QL`
        query {
          viewer {
            newsFeed(first: 1) {
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
      `,
    );
    const diffQueries = diffRelayQuery(query, store, tracker);
    expect(diffQueries.length).toBe(1);
    expect(diffQueries[0]).toEqualQueryRoot(
      getNode(
        Relay.QL`
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
      `,
      ),
    );
  });

  describe('fragments inside connections', () => {
    let records;
    let store;
    let writer;
    let queryTracker;

    function writeEdgesForQuery(edges, query) {
      const payload = {
        viewer: {
          newsFeed: {
            edges: edges,
            [PAGE_INFO]: {
              [HAS_NEXT_PAGE]: true,
              [HAS_PREV_PAGE]: false,
            },
          },
        },
      };
      writePayload(store, writer, query, payload, queryTracker);
    }

    beforeEach(() => {
      records = {};
      store = new RelayRecordStore({records}, {rootCallMap});
      writer = new RelayRecordWriter(records, rootCallMap, false);
      queryTracker = new RelayQueryTracker();

      // Load 2 stories without message
      writeEdgesForQuery(
        [
          {cursor: 'c1', node: {id: 's1', __typename: 'Story'}},
          {cursor: 'c2', node: {id: 's2', __typename: 'Story'}},
        ],
        getNode(
          Relay.QL`
          query {
            viewer {
              newsFeed(first: 2) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        `,
        ),
      );
    });

    it('generates a valid diff query', () => {
      const feedQuery = Relay.QL`
        query {
          viewer {
            newsFeed(after: $after, first: $count) {
              edges {
                ... on NewsFeedEdge {
                  node {
                    ... on Story {
                      message {
                        text
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      // Load 1 story with message
      writeEdgesForQuery(
        [
          {
            cursor: 'c1',
            node: {
              id: 's1',
              __typename: 'Story',
              message: {
                text: 's1',
              },
            },
          },
        ],
        getNode(feedQuery, {count: 1, after: null}),
      );

      // Query for 3 stories with text
      const diffQueries = diffRelayQuery(
        getNode(feedQuery, {count: 3, after: null}),
        store,
        queryTracker,
      );
      expect(diffQueries.length).toBe(2);
      expect(diffQueries[0]).toEqualQueryRoot(
        getNode(feedQuery, {count: 1, after: 'c2'}),
      );
      expect(diffQueries[1]).toEqualQueryRoot(
        getNode(
          Relay.QL`
        query {
          node(id: "s2") {
            ... on FeedUnit {
              id
              ... on Story {
                id
                message { text }
              }
            }
            ... on FeedUnit {
              id
            }
          }
        }
      `,
        ),
      );
    });

    it('skips tracked fragments', () => {
      const query = getNode(
        Relay.QL`
        query {
          node(id: "123") {
            ... on User {
              friends(first: 1) {
                edges {
                  ... on FriendsEdge @relay(variables: []) {
                    node {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      `,
      );
      const payload = {
        node: {
          id: '123',
          __typename: 'User',
          friends: {
            edges: [
              {
                cursor: 'cursor1',
                node: {
                  id: 'node1',
                  __typename: 'User',
                  name: 'Alice',
                },
              },
            ],
            [PAGE_INFO]: {
              [HAS_NEXT_PAGE]: true,
            },
          },
        },
      };
      writePayload(store, writer, query, payload, queryTracker);

      // All fields present, nothing to diff.
      expect(diffRelayQuery(query, store, queryTracker).length).toBe(0);

      // Removing a field should not result in a diff query since the edge is
      // tracked.
      delete records.node1.name;
      expect(diffRelayQuery(query, store, queryTracker).length).toBe(0);
    });
  });
});

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
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayFragmentReference = require('RelayFragmentReference');
const RelayStoreData = require('RelayStoreData');
const RelayRecordStatusMap = require('RelayRecordStatusMap');
const RelayTestUtils = require('RelayTestUtils');

const callsToGraphQL = require('callsToGraphQL');
const readRelayQueryData = require('readRelayQueryData');

describe('readRelayQueryData', () => {
  let RelayRecordStore;

  const {getNode, getVerbatimNode} = RelayTestUtils;
  let END_CURSOR, HAS_NEXT_PAGE, HAS_PREV_PAGE, PAGE_INFO, START_CURSOR;

  function getStoreData(records) {
    const recordStore = new RelayRecordStore(records);
    const storeData = new RelayStoreData();

    storeData.getQueuedStore = jest.fn(() => {
      return recordStore;
    });

    return storeData;
  }

  function readData(storeData, queryNode, dataID, options) {
    return readRelayQueryData(
      storeData,
      queryNode,
      dataID,
      options
    ).data;
  }

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

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  it('returns undefined for data that is not in the store', () => {
    const records = {};
    const query = getNode(Relay.QL`fragment on Actor{id}`);
    const data = readData(getStoreData({records}), query, '1055790163');
    expect(data).toBe(undefined);
  });

  it('returns null for data that is null in the store', () => {
    const records = {1055790163: null};
    const query = getNode(Relay.QL`fragment on Actor{id}`);
    const data = readData(getStoreData({records}), query, '1055790163');
    expect(data).toBe(null);
  });

  it('retrieves data that is in the store', () => {
    const records = {
      'client:1': {
        __dataID__: 'client:1',
        actor: {
          __dataID__: '660361306',
        },
      },
      660361306: {
        __dataID__: '660361306',
        firstName: 'Greg',
      },
    };
    const query = getNode(Relay.QL`query{viewer{actor{firstName}}}`);
    const data = readData(getStoreData({records}), query, 'client:1');
    expect(data).toEqual({
      __dataID__: 'client:1',
      actor: {
        __dataID__: '660361306',
        firstName: 'Greg',
      },
    });
  });

  describe('references to null records', () => {
    it('returns the id of null scalar links', () => {
      const records = {
        address: null,
        node: {
          name: 'Chris',
          address: {__dataID__: 'address'},
        },
      };
      const fragment = getNode(Relay.QL`
        fragment on User {
          name
          address {
            city
          }
        }
      `);
      const {dataIDs} = readRelayQueryData(
        getStoreData({records}),
        fragment,
        'node'
      );
      expect(dataIDs).toEqual({
        address: true,
        node: true,
      });
    });

    it('returns the id of null plural links', () => {
      const records = {
        actor: null,
        node: {
          id: 'node',
          actors: [{__dataID__: 'actor'}],
        },
      };
      const fragment = getNode(Relay.QL`
        fragment on Story {
          id
          actors {
            name
          }
        }
      `);
      const {dataIDs} = readRelayQueryData(
        getStoreData({records}),
        fragment,
        'node'
      );
      expect(dataIDs).toEqual({
        actor: true,
        node: true,
      });
    });

    it('returns the id of null connections', () => {
      const records = {
        friends: null,
        node: {
          id: 'node',
          friends: {__dataID__: 'friends'},
        },
      };
      const fragment = getNode(Relay.QL`
        fragment on User {
          id
          friends(first: "2") {
            edges {
              node {
                id
              }
            }
          }
        }
      `);
      const {dataIDs} = readRelayQueryData(
        getStoreData({records}),
        fragment,
        'node'
      );
      expect(dataIDs).toEqual({
        friends: true,
        node: true,
      });
    });

    it('returns the id of null connection edges', () => {
      const range = new GraphQLRange();
      range.retrieveRangeInfoForQuery.mockReturnValue({
        requestedEdgeIDs: ['edge'],
        diffCalls: [],
        pageInfo: {
          [START_CURSOR]: 'cursor',
          [END_CURSOR]: 'cursor',
          [HAS_NEXT_PAGE]: false,
          [HAS_PREV_PAGE]: false,
        },
      });
      const records = {
        friends: {
          __range__: range,
        },
        edge: null,
        node: {
          id: 'node',
          friends: {__dataID__: 'friends'},
        },
      };
      const fragment = getNode(Relay.QL`
        fragment on User {
          id
          friends(first: "2") {
            edges {
              node {
                id
              }
            }
          }
        }
      `);
      const {data, dataIDs} = readRelayQueryData(
        getStoreData({records}),
        fragment,
        'node'
      );
      expect(data).toEqual({
        __dataID__: 'node',
        id: 'node',
        friends: {
          __dataID__: 'friends_first(2)',
          edges: [],
        },
      });
      expect(dataIDs).toEqual({
        edge: true,
        friends: true,
        node: true,
      });
    });
  });

  it('returns the ids for all read data', () => {
    const records = {
      address: null,
      date: {day: 21},
      hometown: {name: 'Vancouver'},
      node: {
        name: 'Chris',
        birthdate: {__dataID__: 'date'},
        address: {__dataID__: 'address'},
        hometown: {__dataID__: 'hometown'},
      },
    };
    const hometownFragmentReference = RelayFragmentReference.createForContainer(
      () => Relay.QL`fragment on Page {name}`,
      {}
    );
    const query = getNode(Relay.QL`
      fragment on User {
        address {city}
        birthdate {day}
        hometown {${hometownFragmentReference}}
      }
    `);
    const {dataIDs} = readRelayQueryData(
      getStoreData({records}),
      query,
      'node'
    );
    expect(dataIDs).toEqual({
      address: true,
      date: true,
      hometown: true,
      node: true,
    });
  });

  it('retrieves data that references null nodes in the store', () => {
    const records = {
      1055790163: {
        address: {__dataID__: 'client:1'},
        firstName: 'Yuzhi',
      },
      'client:1': null,
    };
    const query = getNode(Relay.QL`
      fragment on Actor {
        address {
          city
        }
        firstName
      }
    `);
    const data = readData(getStoreData({records}), query, '1055790163');
    expect(data).toEqual({
      __dataID__: '1055790163',
      address: null,
      firstName: 'Yuzhi',
    });
  });

  it('includes `null` scalar values along with existing sibling fields', () => {
    let records = {
      feedbackID: {
        __dataID__: 'feedbackID',
        doesViewerLike: null,
        id: 'feedbackID',
      },
    };
    const query = getNode(Relay.QL`
      fragment on Feedback {
        id
        doesViewerLike
      }
    `);
    let data = readData(getStoreData({records}), query, 'feedbackID');
    expect(data.id).toBe('feedbackID');
    expect(data.doesViewerLike).toBeNull();

    records = {
      feedbackID: {
        __dataID__: 'feedbackID',
        id: 'feedbackID',
      },
    };
    data = readData(getStoreData({records}), query, 'feedbackID');
    expect(data.id).toBe('feedbackID');
    expect(data.doesViewerLike).toBeUndefined();
    expect('doesViewerLike' in data).toBe(false);
  });

  it('retrieves empty plural fields', () => {
    const records = {
      user_id: {
        id: 'user_id',
        websites: [],
      },
    };
    const query = getNode(Relay.QL`fragment on User{id,websites}`);
    const data = readData(getStoreData({records}), query, 'user_id');
    expect(data.websites).toEqual([]);
  });

  it('retrieves plural fields', () => {
    const websites = ['website1', 'website2'];

    const records = {
      user_id: {
        id: 'user_id',
        websites,
      },
    };
    const query = getNode(Relay.QL`fragment on User{id,websites}`);
    const data = readData(getStoreData({records}), query, 'user_id');
    expect(data.websites).toEqual(
      ['website1', 'website2']
    );
  });

  it('retrieves status information for nodes with queued changes', () => {
    const STATUS = RelayRecordStatusMap.setOptimisticStatus(0, true);
    const records = {
      660361306: {
        __dataID__: '660361306',
        firstName: 'Greg',
      },
    };
    const queuedRecords = {
      660361306: {
        __dataID__: '660361306',
        __status__: STATUS,
        firstName: 'Snoop Lion',
      },
    };
    const query = getNode(Relay.QL`fragment on User{firstName}`);
    const storeData = getStoreData({records, queuedRecords});
    const data = readData(storeData, query, '660361306');
    expect(data).toEqual({
      __dataID__: '660361306',
      __status__: STATUS,
      firstName: 'Snoop Lion',
    });
  });

  it('retrieves resolved fragment map generation information', () => {
    const records = {
      'a': {
        __dataID__: 'a',
        __resolvedFragmentMapGeneration__: 42,
        firstName: 'Steve',
      },
    };
    const query = getNode(Relay.QL`fragment on User{firstName}`);
    const data = readData(getStoreData({records}), query, 'a');
    expect(data).toEqual({
      __dataID__: 'a',
      __resolvedFragmentMapGeneration__: 42,
      firstName: 'Steve',
    });
  });

  it('retrieves resolved fragment map info for fragment references', () => {
    const records = {
      user: {
        __dataID__: 'a',
        address: {
          __dataID__: 'address',
        },
      },
      address: {
        __dataID__: 'address',
        __resolvedFragmentMapGeneration__: 42,
        city: 'Menlo Park',
      },
    };
    const fragment = Relay.QL`fragment on StreetAddress { city }`;
    const fragmentReference = RelayFragmentReference.createForContainer(
      () => fragment,
      {}
    );
    const query = getVerbatimNode(Relay.QL`
      fragment on User {
        address {
          ${fragmentReference}
        }
      }
    `);
    const data = readData(getStoreData({records}), query, 'user');
    expect(data).toEqual({
      __dataID__: 'user',
      address: {
        __dataID__: 'address',
        __fragments__: {
          [fragment.id]: [{}],
        },
        __resolvedFragmentMapGeneration__: 42,
      },
    });
  });

  it('populates data ID for nodes containing only non-local fragments', () => {
    const records = {
      'client:1': {
        __dataID__: 'client:1',
        actor: {
          __dataID__: '660361306',
        },
      },
      660361306: {
        __dataID__: '660361306',
        firstName: 'Greg',
      },
    };
    const fragment = Relay.QL`fragment on Viewer{actor{firstName}}`;
    const fragmentReference = RelayFragmentReference.createForContainer(
      () => fragment,
      {
        foo: 'bar',
      }
    );
    const query = getNode(Relay.QL`query{viewer{${fragmentReference}}}`);
    const data = readData(getStoreData({records}), query, 'client:1');
    expect(data.__dataID__).toBe('client:1');
    expect(data.__fragments__).toEqual({
      [getNode(fragment).getConcreteFragmentID()]: [{foo: 'bar'}],
    });
  });

  it('reads data for non-container fragment references', () => {
    const records = {
      'client:1': {
        __dataID__: 'client:1',
        actor: {
          __dataID__: '660361306',
        },
      },
      660361306: {
        __dataID__: '660361306',
        firstName: 'Greg',
      },
    };
    const fragmentReference = new RelayFragmentReference(
      () => Relay.QL`fragment on Viewer{actor{firstName}}`,
      {}
    );
    const query = getNode(Relay.QL`query{viewer{${fragmentReference}}}`);
    const data = readData(getStoreData({records}), query, 'client:1');
    expect(data).toEqual({
      __dataID__: 'client:1',
      actor: {
        __dataID__: '660361306',
        firstName: 'Greg',
      },
    });
  });

  it('merges data from multiple fragments that reference the same node', () => {
    const records = {
      1055790163: {
        __dataID__: '1055790163',
        address: {__dataID__: 'client:1'},
        last_name: 'Zheng',
      },
      'client:1': {
        __dataID__: 'client:1',
        city: 'San Francisco',
        country: 'US',
      },
    };

    const fragment1 = Relay.QL`fragment on Actor{address{city}}`;
    const fragment2 = Relay.QL`fragment on Actor{address{country}}`;
    const query = getNode(Relay.QL`  fragment on Actor {
            ${fragment1}
            ${fragment2}
          }`);
    const data = readData(getStoreData({records}), query, '1055790163');
    expect(data).toEqual({
      __dataID__: '1055790163',
      address: {
        __dataID__: 'client:1',
        city: 'San Francisco',
        country: 'US',
      },
    });
  });

  it('retrieves non-edge fields from filtered connections', () => {
    const records = {
      'client:123': {
        id: 'client:123',
        count: 42,
        __dataID__: 'client:123',
        __range__: new GraphQLRange(),
      },
    };
    const query = getNode(Relay.QL`
      fragment on FriendsConnection {
        count
      }
    `);
    const storeData = getStoreData({records});
    const rangeID = storeData.getRangeData().getClientIDForRangeWithID(
      callsToGraphQL([
        {name: 'is_viewer_friend', value: null},
        {name: 'first', value: 10},
      ]),
      {},
      'client:123'
    );
    expect(rangeID).toBe('client:123_is_viewer_friend(),first(10)');

    GraphQLRange.prototype.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: [],
      diffCalls: [],
      pageInfo: {
        [START_CURSOR]: 'cursor',
        [END_CURSOR]: 'cursor',
        [HAS_NEXT_PAGE]: false,
        [HAS_PREV_PAGE]: false,
      },
    });
    const data = readData(storeData, query, rangeID);
    expect(data).toEqual({
      __dataID__: rangeID,
      count: 42,
    });
  });

  it('retrieves non-edge fields from a connection', () => {
    const records = {
      feedback_id: {
        __dataID__: 'feedback_id',
        likers: {
          __dataID__: 'likers_id',
        },
      },
      likers_id: {
        __dataID__: 'likers_id',
        count: 31337,
      },
    };
    const query = getNode(Relay.QL`fragment on Feedback{likers{count}}`);
    const data = readData(getStoreData({records}), query, 'feedback_id');
    expect(data).toEqual({
      __dataID__: 'feedback_id',
      likers: {
        __dataID__: 'likers_id',
        count: 31337,
      },
    });
  });

  it('retrieves non-"range" fields within a connection', () => {
    // This is a silly query (we don't need the `first(1)` call here) but was
    // seen in the wild and should be handled gracefully.
    const query = getNode(Relay.QL`
      fragment on Feedback {
        topLevelComments(first:"1") {
          count
        }
      }
    `);

    const records = {
      feedbackID: {
        __dataID__: 'feedbackID',
        topLevelComments: {
          __dataID__: 'commentsID',
        },
      },
      commentsID: {
        __dataID__: 'commentsID',
        __range__: new GraphQLRange(),
        count: 57,
      },
    };

    GraphQLRange.prototype.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['comment_edge_id'],
      diffCalls: [],
      pageInfo: {
        [START_CURSOR]: 'cursor',
        [END_CURSOR]: 'cursor',
        [HAS_NEXT_PAGE]: true,
        [HAS_PREV_PAGE]: false,
      },
    });

    const data = readData(getStoreData({records}), query, 'feedbackID');
    expect(data).toEqual({
      __dataID__: 'feedbackID',
      topLevelComments: {
        __dataID__: 'commentsID_first(1)',
        count: 57,
      },
    });
  });

  it('retrieves a mixture of "range" and non-"range" connection fields', () => {
    const query = getNode(Relay.QL`
      fragment on Feedback {
        topLevelComments(first:"1") {
          count
          pageInfo {
            hasNextPage
          }
        }
      }`
    );

    const records = {
      feedbackID: {
        __dataID__: 'feedbackID',
        topLevelComments: {
          __dataID__: 'commentsID',
        },
      },
      commentsID: {
        __dataID__: 'commentsID',
        __range__: new GraphQLRange(),
        count: 57,
      },
    };

    GraphQLRange.prototype.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['comment_edge_id'],
      diffCalls: [],
      pageInfo: {
        [START_CURSOR]: 'cursor',
        [END_CURSOR]: 'cursor',
        [HAS_NEXT_PAGE]: true,
        [HAS_PREV_PAGE]: false,
      },
    });

    const data = readData(getStoreData({records}), query, 'feedbackID');
    expect(data).toEqual({
      __dataID__: 'feedbackID',
      topLevelComments: {
        __dataID__: 'commentsID_first(1)',
        count: 57,
        [PAGE_INFO]: {
          [HAS_NEXT_PAGE]: true,
        },
      },
    });
  });

  it('requires filter calls on connections with range fields', () => {
    const records = {
      story_id: {
        __dataID__: 'story_id',
        feedback: {
          __dataID__: 'feedback_id',
        },
      },
      feedback_id: {
        __dataID__: 'feedback_id',
        likers: {
          __dataID__: 'likers_id',
        },
      },
      likers_id: {
        __dataID__: 'likers_id',
        __range__: new GraphQLRange(),
        count: 31337,
      },
    };
    const error =
      'readRelayQueryData(): The field `likers` is a connection. ' +
      'Fields `edges` and `pageInfo` cannot be fetched without a ' +
      '`first`, `last` or `find` argument.';

    // Use fragment because all inline violations are caugh at transform time.
    const edgesFragment = Relay.QL`
      fragment on LikersOfContentConnection {
        edges {
          node {
            name
          }
        }
      }
    `;
    let query = getNode(Relay.QL`
      fragment on Story {
        feedback {
          likers {
            ${edgesFragment}
          }
        }
      }
    `);
    expect(
      () => readData(getStoreData({records}), query, 'story_id')
    ).toFailInvariant(error);

    // Note that `pageInfo` also triggers the error...
    const pageInfoFragment = Relay.QL`
      fragment on LikersOfContentConnection {
        pageInfo {
          hasNextPage
        }
      }
    `;
    query = getNode(Relay.QL`
      fragment on Story {
        feedback {
          likers {
            ${pageInfoFragment}
          }
        }
      }
    `);
    expect(
      () => readData(getStoreData({records}), query, 'story_id')
    ).toFailInvariant(error);

    // ...but not `count`:
    query = getNode(Relay.QL`fragment on Story{feedback{likers{count}}}`);
    expect(
      () => readData(getStoreData({records}), query, 'story_id')
    ).not.toThrowError();
  });

  it('requires filter calls on connections with filtered range fields ', () => {
    const records = {
      story_id: {
        __dataID__: 'story_id',
        feedback: {
          __dataID__: 'feedback_id',
        },
      },
      feedback_id: {
        __dataID__: 'feedback_id',
        likers: {
          __dataID__: 'likers_id',
        },
      },
      likers_id: {
        __dataID__: 'likers_id',
        __range__: new GraphQLRange(),
        count: 31337,
      },
    };
    const error =
      'readRelayQueryData(): The field `likers` is a connection. ' +
      'Fields `edges` and `pageInfo` cannot be fetched without a ' +
      '`first`, `last` or `find` argument.';

    const fragmentReference = RelayFragmentReference.createForContainer(
      () => Relay.QL`fragment on LikersOfContentConnection{edges{node{name}}}`,
      {}
    );
    let query = getNode(Relay.QL`
      fragment on Story{feedback{likers{${fragmentReference}}}}
    `);
    expect(() => readData(getStoreData({records}), query, 'story_id'))
      .toFailInvariant(error);

    let fragment = Relay.QL`fragment on LikersOfContentConnection{pageInfo}`;
    query = getNode(Relay.QL`fragment on Story{feedback{likers{${fragment}}}}`);
    expect(() => readData(getStoreData({records}), query, 'story_id'))
      .toFailInvariant(error);

    fragment = Relay.QL`fragment on LikersOfContentConnection{count}`;
    query = getNode(Relay.QL`fragment on Story{feedback{likers{${fragment}}}}`);
    expect(() => readData(getStoreData({records}), query, 'story_id'))
      .not.toThrowError();
  });

  it('reads `edge`/`pageInfo` without range info like linked records', () => {
    const records = {
      feedback_id: {
        __dataID__: 'feedback_id',
        likers: {
          __dataID__: 'likers_id',
        },
      },
      likers_id: {
        __dataID__: 'likers_id',
        edges: [
          {
            __dataID__: 'likers_edge_id',
          },
        ],
        [PAGE_INFO]: {
          __dataID__: 'likers_page_info_id',
        },
      },
      likers_edge_id: {
        __dataID__: 'likers_edge_id',
        node: {
          __dataID__: 'liker_id',
        },
      },
      likers_page_info_id: {
        __dataID__: 'likers_page_info_id',
        [HAS_NEXT_PAGE]: true,
      },
      liker_id: {
        __dataID__: 'liker_id',
        name: 'Tim',
      },
    };

    let query = getNode(Relay.QL`
      fragment on Feedback{likers(first:"1"){edges{node{name}}}}
    `);
    let data = readData(getStoreData({records}), query, 'feedback_id');
    expect(data).toEqual({
      __dataID__: 'feedback_id',
      likers: {
        __dataID__: 'likers_id_first(1)',
        edges: [
          {
            __dataID__: 'likers_edge_id',
            node: {
              __dataID__: 'liker_id',
              name: 'Tim',
            },
          },
        ],
      },
    });

    query = getNode(Relay.QL`
      fragment on Feedback{likers(first:"1"){pageInfo{hasNextPage}}}
    `);
    data = readData(getStoreData({records}), query, 'feedback_id');
    expect(data).toEqual({
      __dataID__: 'feedback_id',
      likers: {
        __dataID__: 'likers_id_first(1)',
        [PAGE_INFO]: {
          __dataID__: 'likers_page_info_id',
          [HAS_NEXT_PAGE]: true,
        },
      },
    });
  });

  it('recurses through fragments when retrieving pageInfo', () => {
    const records = {
      feedback_id: {
        __dataID__: 'feedback_id',
        comments: {
          __dataID__: 'comments_id',
        },
      },
      comments_id: {
        __dataID__: 'comments_id',
        __range__: new GraphQLRange(),
      },
    };
    const fragmentReference = RelayFragmentReference.createForContainer(
      () => Relay.QL`fragment on PageInfo{hasNextPage}`,
      {}
    );
    const query = getNode(Relay.QL`  fragment on Feedback{
            comments(first:"1") {
              pageInfo {
                startCursor
                ${fragmentReference}
              }
            }
          }`);

    GraphQLRange.prototype.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: [],
      diffCalls: [],
      pageInfo: {
        [START_CURSOR]: 'cursor',
        [END_CURSOR]: 'cursor',
        [HAS_NEXT_PAGE]: true,
        [HAS_PREV_PAGE]: false,
      },
    });

    let data = readData(
      getStoreData({records}),
      query,
      'feedback_id',
      {traverseFragmentReferences: true}
    );

    expect(data.comments).toEqual({
      __dataID__: 'comments_id_first(1)',
      [PAGE_INFO]: {
        [START_CURSOR]: 'cursor',
        [HAS_NEXT_PAGE]: true,
      },
    });

    data = readData(getStoreData({records}), query, 'feedback_id');

    const fragmentSourceID =
      getNode(fragmentReference.getFragment()).getConcreteFragmentID();
    expect(data.comments.pageInfo.__fragments__).toEqual({
      [fragmentSourceID]: [{}],
    });
  });

  it('retrieves data and fragment pointers from range', () => {
    const records = {
      feedback_id: {
        __dataID__: 'feedback_id',
        comments: {
          __dataID__: 'comments_id',
        },
      },
      comments_id: {
        __dataID__: 'comments_id',
        __range__: new GraphQLRange(),
      },
      comment_node_id: {
        __dataID__: 'comment_node_id',
        id: 'comment_node_id',
      },
      comment_edge_id: {
        __dataID__: 'comment_edge_id',
        node: {__dataID__: 'comment_node_id'},
        cursor: 'cursor',
      },
    };
    const fragmentReference = RelayFragmentReference.createForContainer(
      () => Relay.QL`fragment on CommentsConnection{edges{node{id}}}`,
      {}
    );
    const query = getNode(Relay.QL`  fragment on Feedback{
            comments(first:"1") {
              edges {
                node {
                  id
                }
              }
              pageInfo {
                startCursor
              }
              ${fragmentReference}
            }
          }`);

    GraphQLRange.prototype.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['comment_edge_id'],
      diffCalls: [],
      pageInfo: {
        [START_CURSOR]: 'cursor',
        [END_CURSOR]: 'cursor',
        [HAS_NEXT_PAGE]: true,
        [HAS_PREV_PAGE]: false,
      },
    });

    let data = readData(
      getStoreData({records}),
      query,
      'feedback_id',
      {traverseFragmentReferences: true}
    );

    expect(data.comments).toEqual({
      __dataID__: 'comments_id_first(1)',
      edges: [{
        __dataID__: 'comment_edge_id',
        node: {
          __dataID__: 'comment_node_id',
          id: 'comment_node_id',
        },
      }],
      [PAGE_INFO]: {
        [START_CURSOR]: 'cursor',
      },
    });

    data = readData(getStoreData({records}), query, 'feedback_id');

    const fragmentSourceID =
      getNode(fragmentReference.getFragment()).getConcreteFragmentID();
    expect(data.comments.__fragments__).toEqual({
      [fragmentSourceID]: [{}],
    });
  });

  it('returns RelayFragmentPointers for child queries', () => {
    const records = {
      user_id: {
        __dataID__: 'user_id',
        id: 'user_id',
        screennames: [
          {__dataID__: 'client1'},
          {__dataID__: 'client2'},
        ],
        hometown: {__dataID__: 'hometown_id'},
      },
      hometown_id: {
        __dataID__: 'hometown_id',
        id: 'hometown_id',
        name: 'hometown name',
      },
      client1: {
        __dataID__: 'client1',
        service: 'GTALK',
        name: '123',
      },
      client2: {
        __dataID__: 'client1',
        service: 'TWITTER',
        name: '123',
      },
    };
    const fragmentReference = RelayFragmentReference.createForContainer(
      () => Relay.QL`fragment on Screenname {service, name}`,
      {}
    );
    const query = getNode(Relay.QL`
      fragment on User {
        id
        hometown {
          name
        }
        screennames {
          ${fragmentReference}
        }
      }
    `);

    // Mark top fragment as local, and child fragment as non-local.
    const data = readData(getStoreData({records}), query, 'user_id');

    expect(data.id).toBe('user_id');
    expect(data.hometown.name).toEqual('hometown name');
    expect(data.screennames.length).toBe(2);
    const screennames = data.screennames;
    const fragmentSourceID0 =
      getNode(fragmentReference.getFragment()).getConcreteFragmentID();
    expect(screennames[0].__fragments__).toEqual({
      [fragmentSourceID0]: [{}],
    });
    const fragmentSourceID1 =
      getNode(fragmentReference.getFragment()).getConcreteFragmentID();
    expect(screennames[1].__fragments__).toEqual({
      [fragmentSourceID1]: [{}],
    });
  });

  it('reads dataID if a linked dataID is `null` or `undefined`', () => {
    const query = getNode(Relay.QL`
      query {
        viewer {
          actor {
            name
          }
        }
      }
    `);
    let records = {
      'client:1': {
        __dataID__: 'client:1',
        actor: null,
      },
    };
    let data = readData(getStoreData({records}), query, 'client:1');
    expect(data.actor).toBeNull();

    records = {
      'client:1': {
        __dataID__: 'client:1',
      },
    };
    data = readData(getStoreData({records}), query, 'client:1');
    expect(data.actor).toBeUndefined();
  });

  it('does not clobber previously-read sibling fields when a linked dataID is `null` or `undefined`', () => {
    const query = getNode(Relay.QL`
      fragment on User {
        id
        address {
          city
        }
      }
    `);
    let records = {
      user_id: {
        __dataID__: 'user_id',
        id: 'user_id',
        address: null,
      },
    };
    let data = readData(getStoreData({records}), query, 'user_id');
    expect(data.address).toBeNull();
    expect(data.id).toBe('user_id');

    records = {
      user_id: {
        __dataID__: 'user_id',
        id: 'user_id',
      },
    };
    data = readData(getStoreData({records}), query, 'user_id');
    expect(data.address).toBeUndefined();
    expect(data.id).toBe('user_id');
  });

  it('does not set undefined value if linked dataID missing', () => {
    const query = getNode(Relay.QL`
      query {
        viewer {
          actor {
            name
          }
        }
      }
    `);

    const records = {
      'client:1': {
        __dataID__: 'client:1',
      },
    };

    const data = readData(getStoreData({records}), query, 'client:1');
    expect(data.__dataID__).toBe('client:1');

    // Extra assertion because `toEqual` matcher skips over properties with
    // undefined values...
    expect('actor' in data).toBe(false);
  });

  it('allocates fragments even if all child fields are null', () => {
    const query = getNode(Relay.QL`
      fragment on Feedback {
        id
      }
    `);
    const records = {
      feedbackID: {
        __dataID__: 'feedbackID',
        id: null,
      },
    };
    const store = getStoreData({records});
    const {data, dataIDs} = readRelayQueryData(store, query, 'feedbackID');
    expect(data).toEqual({
      __dataID__: 'feedbackID',
      id: null,
    });
    expect(dataIDs).toEqual({
      feedbackID: true,
    });
  });

  it('allocates connection fields even if all child fields are null', () => {
    const query = getNode(Relay.QL`
      fragment on Feedback {
        comments {
          count
        }
      }
    `);
    const records = {
      feedbackID: {
        __dataID__: 'feedbackID',
        comments: {
          __dataID__: 'commentsID',
        },
      },
      commentsID: {
        __dataID__: 'commentsID',
        count: null,
      },
    };
    const store = getStoreData({records});
    const {data, dataIDs} = readRelayQueryData(store, query, 'feedbackID');
    expect(data).toEqual({
      __dataID__: 'feedbackID',
      comments: {
        __dataID__: 'commentsID',
        count: null,
      },
    });
    expect(dataIDs).toEqual({
      commentsID: true,
      feedbackID: true,
    });
  });

  it('allocates plural fields even if all child fields are null', () => {
    const query = getNode(Relay.QL`
      fragment on User {
        allPhones {
          isVerified
        }
      }
    `);
    const records = {
      userID: {
        __dataID__: 'userID',
        allPhones: [{__dataID__: 'phone1ID'}, {__dataID__: 'phone2ID'}],
      },
      phone1ID: {
        __dataID__: 'phone1ID',
        isVerified: null,
      },
      phone2ID: {
        __dataID__: 'phone2ID',
        isVerified: null,
      },
    };
    const store = getStoreData({records});
    const {data, dataIDs} = readRelayQueryData(store, query, 'userID');
    expect(data).toEqual({
      __dataID__: 'userID',
      allPhones: [
        {
          __dataID__: 'phone1ID',
          isVerified: null,
        },
        {
          __dataID__: 'phone2ID',
          isVerified: null,
        },
      ],
    });
    expect(dataIDs).toEqual({
      phone1ID: true,
      phone2ID: true,
      userID: true,
    });
  });

  it('allocates linked fields even if all child fields are null', () => {
    const query = getNode(Relay.QL`
      fragment on User {
        birthdate {
          year
        }
      }
    `);
    const records = {
      userID: {
        __dataID__: 'userID',
        birthdate: {
          __dataID__: 'birthdateID',
        },
      },
      birthdateID: {
        __dataID__: 'birthdateID',
        year: null,
      },
    };
    const store = getStoreData({records});
    const {data, dataIDs} = readRelayQueryData(store, query, 'userID');
    expect(data).toEqual({
      __dataID__: 'userID',
      birthdate: {
        __dataID__: 'birthdateID',
        year: null,
      },
    });
    expect(dataIDs).toEqual({
      birthdateID: true,
      userID: true,
    });
  });

  it('reads fields for connections without calls', () => {
    const query = getNode(Relay.QL`
      fragment on User {
        friends {
          count
        }
      }
    `);
    let records = {
      'user_id': {
        __dataID__: 'user_id',
        friends: {
          __dataID__: 'client:1',
        },
      },
      'client:1': {
        __dataID__: 'client:1',
        count: 42,
      },
    };
    let data = readData(getStoreData({records}), query, 'user_id');
    expect(data.friends.count).toBe(42);

    // Now imagine another query (say, a deferred query) has populated the store
    // with range info for this connection.
    records = {
      'user_id': {
        __dataID__: 'user_id',
        friends: {
          __dataID__: 'client:1',
        },
      },
      'client:1': {
        __dataID__: 'client:1',
        __range__: new GraphQLRange(),
        count: 42,
      },
    };
    GraphQLRange.prototype.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['edgeID'],
      diffCalls: [],
      pageInfo: {
        [START_CURSOR]: 'cursor',
        [END_CURSOR]: 'cursor',
        [HAS_NEXT_PAGE]: true,
        [HAS_PREV_PAGE]: false,
      },
    });
    data = readData(getStoreData({records}), query, 'user_id');
    expect(data.friends.count).toBe(42);
  });

  it('handles "empty" ref query dependencies', () => {
    // People normally won't write queries like this by hand, but they can be
    // produced as the result of splitting deferred queries.
    //
    // The `feedback` field here only has a generated `id`, so is "empty".
    let query = getNode(Relay.QL`
      fragment on Story {
        id
        feedback
      }
    `);

    // Mark the `id` field in `feedback{id}` as a ref query dependency.
    query = query.clone(
      query.getChildren().map((outerChild, ii) => {
        if (ii === 1) {
          return outerChild.clone(
            outerChild.getChildren().map((innerChild, jj) => {
              if (jj === 0) {
                return innerChild.cloneAsRefQueryDependency();
              } else {
                return innerChild;
              }
            })
          );
        } else {
          return outerChild;
        }
      })
    );

    const records = {
      storyID: {
        __dataID__: 'storyID',
        id: 'storyID',
        feedback: {
          __dataID__: 'feedbackID',
        },
      },
      feedbackID: {
        __dataID__: 'feedbackID',
        id: 'feedbackID',
      },
    };
    const data = readData(getStoreData({records}), query, 'storyID');
    expect(data).toEqual({
      __dataID__: 'storyID',
      id: 'storyID',
      feedback: {
        __dataID__: 'feedbackID',
      },
    });
  });

  it('parses range client IDs', () => {
    const fragmentReference = RelayFragmentReference.createForContainer(
      () => Relay.QL`
        fragment on FriendsConnection {
          edges {
            node {
              address {
                city
                country
              }
            }
          }
        }
      `,
      {}
    );
    const query = getNode(Relay.QL`
      fragment on User {
        friends(first:"25") {
          ${fragmentReference}
        }
      }
    `);

    const records = {
      userID: {
        __dataID__: 'userID',
        friends: {
          __dataID__: 'friendsID',
        },
      },
      friendsID: {
        __dataID__: 'friendsID',
        __range__: new GraphQLRange(),
      },
      edgeID: {
        __dataID__: 'edgeID',
        node: {
          __dataID__: 'friendID',
        },
        cursor: 'cursor',
      },
      friendID: {
        __dataID__: 'friendID',
        address: {
          __dataID__: 'addressID',
        },
      },
      addressID: {
        __dataID__: 'addressID',
        city: 'Menlo Park',
        country: 'USA',
      },
    };
    const storeData = getStoreData({records});

    GraphQLRange.prototype.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['edgeID'],
      diffCalls: [],
      pageInfo: {
        [START_CURSOR]: 'cursor',
        [END_CURSOR]: 'cursor',
        [HAS_NEXT_PAGE]: false,
        [HAS_PREV_PAGE]: false,
      },
    });

    // First we read the outer fragment, which populates the
    // GraphQLStoreRangeUtils rangeData cache.
    // (TODO: task to fix that hidden global state: #7250441)
    let data = readData(storeData, query, 'userID');
    const fragmentSourceID =
      getNode(fragmentReference.getFragment()).getConcreteFragmentID();
    expect(data).toEqual({
      __dataID__: 'userID',
      friends: {
        __dataID__: 'friendsID_first(25)',
        __fragments__: {
          [fragmentSourceID]: [{}],
        },
      },
    });

    // Now we read the inner (non-local) fragment, using the range client ID.
    data = readData(
      storeData,
      getNode(fragmentReference.getFragment()),
      'friendsID_first(25)'
    );
    expect(data).toEqual({
      __dataID__: 'friendsID_first(25)',
      edges: [
        {
          __dataID__: 'edgeID',
          node: {
            __dataID__: 'friendID',
            address: {
              __dataID__: 'addressID',
              city: 'Menlo Park',
              country: 'USA',
            },
          },
        },
      ],
    });
  });

  it('can be configured to read generated fields (scalar case)', () => {
    const records = {
      'client:1': {
        __dataID__: 'client:1',
        actor: {
          __dataID__: '660361306',
        },
      },
      660361306: {
        __dataID__: '660361306',
        __typename: 'User',
        firstName: 'Greg',
        id: '660361306',
      },
    };
    const query = getNode(Relay.QL`query{viewer{actor{firstName}}}`);
    const data = readData(
      getStoreData({records}),
      query,
      'client:1',
      {traverseGeneratedFields: true}
    );
    expect(data).toEqual({
      __dataID__: 'client:1',
      actor: {
        __dataID__: '660361306',
        __typename: 'User',
        firstName: 'Greg',
        id: '660361306',
      },
    });
  });

  it('can be configured to read generated fields (page info case)', () => {
    const query = getNode(Relay.QL`
      fragment on Feedback {
        topLevelComments(first:"1") {
          pageInfo {
            hasNextPage
          }
        }
      }`
    );

    const records = {
      feedbackID: {
        __dataID__: 'feedbackID',
        id: 'feedbackID',
        topLevelComments: {
          __dataID__: 'commentsID',
        },
      },
      commentsID: {
        __dataID__: 'commentsID',
        __range__: new GraphQLRange(),
        count: 57,
      },
    };

    GraphQLRange.prototype.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['commentEdgeID'],
      diffCalls: [],
      pageInfo: {
        [START_CURSOR]: 'cursor',
        [END_CURSOR]: 'cursor',
        [HAS_NEXT_PAGE]: true,
        [HAS_PREV_PAGE]: false,
      },
    });

    const data = readData(
      getStoreData({records}),
      query,
      'feedbackID',
      {traverseGeneratedFields: true}
    );
    expect(data).toEqual({
      __dataID__: 'feedbackID',
      id: 'feedbackID',
      topLevelComments: {
        __dataID__: 'commentsID_first(1)',
        [PAGE_INFO]: {
          [HAS_NEXT_PAGE]: true,
          [HAS_PREV_PAGE]: false,
        },
      },
    });
  });

  it('does not attempt to traverse missing data IDs', () => {
    const records = {};

    // If we did traverse, this fragment reference would lead us to create an
    // object with a __dataID__ instead of the desired `undefined`.
    const fragmentReference = RelayFragmentReference.createForContainer(
      () => Relay.QL`fragment on User{name}`,
      {}
    );
    const query = getNode(Relay.QL`query{node(id:"4"){${fragmentReference}}}`);
    const data = readData(getStoreData({records}), query, '4');
    expect(data).toBe(undefined);
  });

  it('does not attempt to traverse non-existent data IDs', () => {
    const records = {4: null};

    // If we did traverse, this fragment reference would lead us to create an
    // object with a __dataID__ instead of the desired `null`.
    const fragmentReference = RelayFragmentReference.createForContainer(
      () => Relay.QL`fragment on User{name}`,
      {}
    );
    const query = getNode(Relay.QL`query{node(id:"4"){${fragmentReference}}}`);
    const data = readData(getStoreData({records}), query, '4');
    expect(data).toBe(null);
  });

  it('reads data for matching fragments', () => {
    const records = {
      123: {
        __dataID__: '123',
        id: '123',
        __typename: 'User',
      },
    };
    const query = getNode(Relay.QL`fragment on User { id }`);
    const data = readData(getStoreData({records}), query, '123');
    expect(data).toEqual({
      __dataID__: '123',
      id: '123',
    });
  });

  it('omits fields for non-matching fragments', () => {
    const records = {
      123: {
        __dataID__: '123',
        id: '123',
        __typename: 'User',
      },
    };
    const query = getNode(Relay.QL`fragment on Page { id }`);
    const data = readData(getStoreData({records}), query, '123');
    expect(data).toEqual({__dataID__: '123'});
  });

  it('skips non-matching child fragments', () => {
    const records = {
      123: {
        __dataID__: '123',
        id: '123',
        __typename: 'User',
        name: 'Greg',
      },
    };
    const query = getNode(Relay.QL`fragment on Actor {
      ... on User {
        name
      }
      ... on Page {
        id
      }
    }`);
    const data = readData(getStoreData({records}), query, '123');
    expect(data).toEqual({
      __dataID__: '123',
      name: 'Greg',
    });
  });

  describe('readRelayQueryData-partialStatus', () => {
    beforeEach(() => {
      jasmine.addMatchers({
        toHavePartialStatus() {
          return {
            compare(record) {
              const isValidRecord =
                typeof record === 'object' && record && !Array.isArray(record);
              if (isValidRecord) {
                if (record.hasOwnProperty('__status__') &&
                    RelayRecordStatusMap.isPartialStatus(record.__status__)) {
                  return {
                    pass: true,
                  };
                } else {
                  return {
                    pass: false,
                    message:
                      'Expected record to have partial status, but it does ' +
                      'not:\n' + JSON.stringify(record, null, 2),
                  };
                }
              } else {
                return {
                  pass: false,
                  message:
                    'Expected a record to have partial status, but the ' +
                    'supplied value is not a valid record: ' + record,
                };
              }
            },
          };
        },
      });
    });

    it('marks nodes with missing scalar field as partial', () => {
      const records = {
        feedbackID: {
          __dataID__: 'feedbackID',
          id: 'feedbackID',
        },
      };
      // Missing `doesViewerLike` in store
      const query = getNode(Relay.QL`
        fragment on Feedback {
          id
          doesViewerLike
        }
      `);
      const data = readData(getStoreData({records}), query, 'feedbackID');

      expect(data).toHavePartialStatus();
    });

    it('marks nested nodes with missing field as partial', () => {
      const records = {
        feedbackID: {
          __dataID__: 'feedbackID',
          id: 'feedbackID',
          comments: {__dataID__: 'commentsID'},
        },
        commentsID: {
          __dataID__:'commentsID',
        },
      };
      // Missing `comments.count` in store
      const query = getNode(Relay.QL`
        fragment on Feedback {
          id
          comments {
            count
          }
        }
      `);
      const data = readData(getStoreData({records}), query, 'feedbackID');

      expect(data).toHavePartialStatus();
      expect(data.comments).toHavePartialStatus();
    });

    it('marks nodes with missing linked nodes as partial', () => {
      const records = {
        'client:1': {
          __dataID__: 'client:1',
          actor: {
            __dataID__: '123',
          },
        },
      };
      // Missing the actor node.
      const query = getNode(Relay.QL`
        query {
          viewer {
            actor {
              firstName
            }
          }
        }
      `);
      const data = readData(getStoreData({records}), query, 'client:1');

      expect(data).toHavePartialStatus();
    });

    it('marks nodes with missing plural linked nodes as partial', () => {
      const records = {
        '123': {
          __dataID__: '123',
          allPhones: [
            {__dataID__: 'client:1'},
            {__dataID__: 'client:2'},
          ],
        },
        'client:1': {
          __dataID__: 'client:1',
        },
        'client:2': {
          __dataID__: 'client:2',
          isVerified: true,
        },
      };
      // Missing `isVerified` in the first element.
      const query = getNode(Relay.QL`
        fragment on User {
          allPhones {
            isVerified
          }
        }
      `);
      const data = readData(getStoreData({records}), query, '123');

      expect(data).toHavePartialStatus();
      expect(data.allPhones[0]).toHavePartialStatus();
    });

    it('marks nodes with missing edges as partial', () => {
      const records = {
        feedbackID: {
          __dataID__: 'feedbackID',
          comments: {
            __dataID__: 'commentsID',
          },
        },
        commentsID: {
          __dataID__: 'commentsID',
          __range__: new GraphQLRange(),
        },
        commentEdgeID: {
          __dataID__: 'commentEdgeID',
          node: {__dataID__: 'commentNodeID'},
          cursor: 'cursor',
        },
        commentNodeID: {
          __dataID__: 'commentNodeID',
          id: 'commentNodeID',
        },
      };
      const query = getNode(Relay.QL`
        fragment on Feedback {
          comments(first: "5") {
            edges {
              node {
                id
              }
            }
            pageInfo {
              startCursor
            }
          }
        }
      `);
      // Missing edges due to non-empty `diffCalls`.
      GraphQLRange.prototype.retrieveRangeInfoForQuery.mockReturnValue({
        requestedEdgeIDs: ['commentEdgeID'],
        diffCalls: [RelayTestUtils.createCall('first', 4)],
        pageInfo: {
          [START_CURSOR]: 'cursor',
          [END_CURSOR]: 'cursor',
          [HAS_NEXT_PAGE]: true,
          [HAS_PREV_PAGE]: false,
        },
      });
      const data = readData(getStoreData({records}), query, 'feedbackID', {
        traverseFragmentReferences: true,
      });

      expect(data).toHavePartialStatus();
      expect(data.comments).toHavePartialStatus();
    });

    it('marks nodes with missing edge data as partial', () => {
      const records = {
        feedbackID: {
          __dataID__: 'feedbackID',
          comments: {
            __dataID__: 'commentsID',
          },
        },
        commentsID: {
          __dataID__: 'commentsID',
          __range__: new GraphQLRange(),
        },
        commentEdgeID: {
          __dataID__: 'commentEdgeID',
          node: {__dataID__: 'commentNodeID'},
          cursor: 'cursor',
        },
        commentNodeID: {
          __dataID__: 'commentNodeID',
          id: 'commentNodeID',
        },
      };
      // Missing `body.text` on the comment.
      const query = getNode(Relay.QL`
        fragment on Feedback {
          comments(first: "1") {
            edges {
              node {
                id
                body {
                  text
                }
              }
            }
            pageInfo {
              startCursor
            }
          }
        }
      `);
      GraphQLRange.prototype.retrieveRangeInfoForQuery.mockReturnValue({
        requestedEdgeIDs: ['commentEdgeID'],
        diffCalls: [],
        pageInfo: {
          [START_CURSOR]: 'cursor',
          [END_CURSOR]: 'cursor',
          [HAS_NEXT_PAGE]: true,
          [HAS_PREV_PAGE]: false,
        },
      });
      const data = readData(getStoreData({records}), query, 'feedbackID', {
        traverseFragmentReferences: true,
      });

      expect(data).toHavePartialStatus();
      expect(data.comments).toHavePartialStatus();
      expect(data.comments.edges[0].node).toHavePartialStatus();
    });
  });
});

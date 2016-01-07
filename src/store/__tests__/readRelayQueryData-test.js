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

require('configureForRelayOSS');

const GraphQLFragmentPointer = require('GraphQLFragmentPointer');
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
  var RelayRecordStore;

  var {getNode} = RelayTestUtils;
  var END_CURSOR, HAS_NEXT_PAGE, HAS_PREV_PAGE, PAGE_INFO, START_CURSOR;

  function getStoreData(records) {
    var recordStore = new RelayRecordStore(records);
    var storeData = new RelayStoreData();

    storeData.getQueuedStore = jest.genMockFunction().mockImplementation(() => {
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
    var records = {};
    var query = getNode(Relay.QL`fragment on Actor{id}`);
    var data = readData(getStoreData({records}), query, '1055790163');
    expect(data).toBe(undefined);
  });

  it('returns null for data that is null in the store', () => {
    var records = {1055790163: null};
    var query = getNode(Relay.QL`fragment on Actor{id}`);
    var data = readData(getStoreData({records}), query, '1055790163');
    expect(data).toBe(null);
  });

  it('retrieves data that is in the store', () => {
    var records = {
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
    var query = getNode(Relay.QL`query{viewer{actor{firstName}}}`);
    var data = readData(getStoreData({records}), query, 'client:1');
    expect(data).toEqual({
      __dataID__: 'client:1',
      actor: {
        __dataID__: '660361306',
        firstName: 'Greg',
      },
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
    var records = {
      1055790163: {
        address: {__dataID__: 'client:1'},
        firstName: 'Yuzhi',
      },
      'client:1': null,
    };
    var query = getNode(Relay.QL`
      fragment on Actor {
        address {
          city,
        },
        firstName,
      }
    `);
    var data = readData(getStoreData({records}), query, '1055790163');
    expect(data).toEqual({
      __dataID__: '1055790163',
      address: null,
      firstName: 'Yuzhi',
    });
  });

  it('includes `null` scalar values along with existing sibling fields', () => {
    var records = {
      feedbackID: {
        __dataID__: 'feedbackID',
        doesViewerLike: null,
        id: 'feedbackID',
      },
    };
    var query = getNode(Relay.QL`
      fragment on Feedback {
        id,
        doesViewerLike,
      }
    `);
    var data = readData(getStoreData({records}), query, 'feedbackID');
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
    var records = {
      user_id: {
        id: 'user_id',
        websites: [],
      },
    };
    var query = getNode(Relay.QL`fragment on User{id,websites}`);
    var data = readData(getStoreData({records}), query, 'user_id');
    expect(data.websites).toEqual([]);
  });

  it('retrieves plural fields', () => {
    var websites = ['website1', 'website2'];

    var records = {
      user_id: {
        id: 'user_id',
        websites,
      },
    };
    var query = getNode(Relay.QL`fragment on User{id,websites}`);
    var data = readData(getStoreData({records}), query, 'user_id');
    expect(data.websites).toEqual(
      ['website1', 'website2']
    );
  });

  it('retrieves status information for nodes with queued changes', () => {
    var STATUS = RelayRecordStatusMap.setOptimisticStatus(
      RelayRecordStatusMap.setErrorStatus(0, true),
      0
    );
    var records = {
      660361306: {
        __dataID__: '660361306',
        firstName: 'Greg',
      },
    };
    var queuedRecords = {
      660361306: {
        __dataID__: '660361306',
        __status__: STATUS,
        firstName: 'Snoop Lion',
      },
    };
    var query = getNode(Relay.QL`fragment on User{firstName}`);
    var storeData = getStoreData({records, queuedRecords});
    var data = readData(storeData, query, '660361306');
    expect(data).toEqual({
      __dataID__: '660361306',
      __status__: STATUS,
      firstName: 'Snoop Lion',
    });
  });

  it('retrieves resolved fragment map generation information', () => {
    var records = {
      'a': {
        __dataID__: 'a',
        __resolvedFragmentMapGeneration__: 42,
        firstName: 'Steve',
      },
    };
    var query = getNode(Relay.QL`fragment on User{firstName}`);
    var data = readData(getStoreData({records}), query, 'a');
    expect(data).toEqual({
      __dataID__: 'a',
      __resolvedFragmentMapGeneration__: 42,
      firstName: 'Steve',
    });
  });

  it('populates data ID for nodes containing only non-local fragments', () => {
    var records = {
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
    var fragmentReference = RelayFragmentReference.createForContainer(
      () => Relay.QL`fragment on Viewer{actor{firstName}}`,
      {}
    );
    var query = getNode(Relay.QL`query{viewer{${fragmentReference}}}`);
    var data = readData(getStoreData({records}), query, 'client:1');
    var pointer = data[getNode(fragmentReference).getConcreteNodeHash()];
    expect(pointer instanceof GraphQLFragmentPointer).toBe(true);
    expect(data.__dataID__).toBe('client:1');
  });

  it('reads data for non-container fragment references', () => {
    var records = {
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
    var fragmentReference = new RelayFragmentReference(
      () => Relay.QL`fragment on Viewer{actor{firstName}}`,
      {}
    );
    var query = getNode(Relay.QL`query{viewer{${fragmentReference}}}`);
    var data = readData(getStoreData({records}), query, 'client:1');
    expect(data).toEqual({
      __dataID__: 'client:1',
      actor: {
        __dataID__: '660361306',
        firstName: 'Greg',
      },
    });
  });

  it('merges data from multiple fragments that reference the same node', () => {
    var records = {
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

    var fragment1 = Relay.QL`fragment on Actor{address{city}}`;
    var fragment2 = Relay.QL`fragment on Actor{address{country}}`;
    var query = getNode(Relay.QL`  fragment on Actor {
            ${fragment1},
            ${fragment2},
          }`);
    var data = readData(getStoreData({records}), query, '1055790163');
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
    var records = {
      'client:123': {
        id: 'client:123',
        count: 42,
        __dataID__: 'client:123',
        __range__: new GraphQLRange(),
      },
    };
    var query = getNode(Relay.QL`
      fragment on FriendsConnection {
        count
      }
    `);
    var storeData = getStoreData({records});
    var rangeID = storeData.getRangeData().getClientIDForRangeWithID(
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
    var data = readData(storeData, query, rangeID);
    expect(data).toEqual({
      __dataID__: rangeID,
      count: 42,
    });
  });

  it('retrieves non-edge fields from a connection', () => {
    var records = {
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
    var query = getNode(Relay.QL`fragment on Feedback{likers{count}}`);
    var data = readData(getStoreData({records}), query, 'feedback_id');
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
    var query = getNode(Relay.QL`
      fragment on Feedback {
        topLevelComments(first:"1") {
          count,
        },
      }
    `);

    var records = {
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

    var data = readData(getStoreData({records}), query, 'feedbackID');
    expect(data).toEqual({
      __dataID__: 'feedbackID',
      topLevelComments: {
        __dataID__: 'commentsID_first(1)',
        count: 57,
      },
    });
  });

  it('retrieves a mixture of "range" and non-"range" connection fields', () => {
    var query = getNode(Relay.QL`
      fragment on Feedback {
        topLevelComments(first:"1") {
          count,
          pageInfo {
            hasNextPage,
          },
        },
      }`
    );

    var records = {
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

    var data = readData(getStoreData({records}), query, 'feedbackID');
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
    var records = {
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
    var error =
      'readRelayQueryData(): The field `likers` is a connection. ' +
      'Fields `edges` and `pageInfo` cannot be fetched without a ' +
      '`first`, `last` or `find` argument.';

    // Use fragment because all inline violations are caugh at transform time.
    var edgesFragment = Relay.QL`
      fragment on LikersOfContentConnection {
        edges {
          node {
            name,
          },
        },
      }
    `;
    var query = getNode(Relay.QL`
      fragment on Story {
        feedback {
          likers {
            ${edgesFragment}
          },
        },
      }
    `);
    expect(
      () => readData(getStoreData({records}), query, 'story_id')
    ).toThrowError(error);

    // Note that `pageInfo` also triggers the error...
    var pageInfoFragment = Relay.QL`
      fragment on LikersOfContentConnection {
        pageInfo {
          hasNextPage,
        },
      }
    `;
    query = getNode(Relay.QL`
      fragment on Story {
        feedback {
          likers {
            ${pageInfoFragment}
          },
        },
      },
    `);
    expect(
      () => readData(getStoreData({records}), query, 'story_id')
    ).toThrowError(error);

    // ...but not `count`:
    query = getNode(Relay.QL`fragment on Story{feedback{likers{count}}}`);
    expect(
      () => readData(getStoreData({records}), query, 'story_id')
    ).not.toThrowError();
  });

  it('requires filter calls on connections with filtered range fields ', () => {
    var records = {
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
    var error =
      'readRelayQueryData(): The field `likers` is a connection. ' +
      'Fields `edges` and `pageInfo` cannot be fetched without a ' +
      '`first`, `last` or `find` argument.';

    var fragmentReference = RelayFragmentReference.createForContainer(
      () => Relay.QL`fragment on LikersOfContentConnection{edges{node{name}}}`,
      {}
    );
    var query = getNode(Relay.QL`
      fragment on Story{feedback{likers{${fragmentReference}}}}
    `);
    expect(() => readData(getStoreData({records}), query, 'story_id'))
      .toThrowError(error);

    var fragment = Relay.QL`fragment on LikersOfContentConnection{pageInfo}`;
    query = getNode(Relay.QL`fragment on Story{feedback{likers{${fragment}}}}`);
    expect(() => readData(getStoreData({records}), query, 'story_id'))
      .toThrowError(error);

    fragment = Relay.QL`fragment on LikersOfContentConnection{count}`;
    query = getNode(Relay.QL`fragment on Story{feedback{likers{${fragment}}}}`);
    expect(() => readData(getStoreData({records}), query, 'story_id'))
      .not.toThrowError();
  });

  it('reads `edge`/`pageInfo` without range info like linked records', () => {
    var records = {
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

    var query = getNode(Relay.QL`
      fragment on Feedback{likers(first:"1"){edges{node{name}}}}
    `);
    var data = readData(getStoreData({records}), query, 'feedback_id');
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
    var records = {
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
    var fragmentReference = RelayFragmentReference.createForContainer(
      () => Relay.QL`fragment on PageInfo{hasNextPage}`,
      {}
    );
    var query = getNode(Relay.QL`  fragment on Feedback{
            comments(first:"1") {
              pageInfo {
                startCursor,
                ${fragmentReference},
              },
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

    var data = readData(
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

    var fragmentPointer = data.comments.pageInfo[
      getNode(fragmentReference).getConcreteNodeHash()
    ];
    expect(fragmentPointer instanceof GraphQLFragmentPointer).toBe(true);
    expect(fragmentPointer.getDataID()).toBe('comments_id_first(1)');
    expect(fragmentPointer.getFragment())
      .toEqualQueryNode(getNode(fragmentReference.getFragment()));
  });

  it('retrieves data and fragment pointers from range', () => {
    var records = {
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
    var fragmentReference = RelayFragmentReference.createForContainer(
      () => Relay.QL`fragment on CommentsConnection{edges{node{id}}}`,
      {}
    );
    var query = getNode(Relay.QL`  fragment on Feedback{
            comments(first:"1") {
              edges {
                node {
                  id
                },
              },
              pageInfo {
                startCursor
              },
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

    var data = readData(
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

    var fragmentPointer = data.comments[
      getNode(fragmentReference).getConcreteNodeHash()
    ];
    expect(fragmentPointer instanceof GraphQLFragmentPointer).toBe(true);
    expect(fragmentPointer.getDataID()).toBe('comments_id_first(1)');
    expect(fragmentPointer.getFragment())
      .toEqualQueryNode(getNode(fragmentReference.getFragment()));
  });

  it('returns GraphQLFragmentPointers for child queries', () => {
    var records = {
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
    var fragmentReference = RelayFragmentReference.createForContainer(
      () => Relay.QL`fragment on Screenname {service, name}`,
      {}
    );
    var query = getNode(Relay.QL`
      fragment on User {
        id,
        hometown {
          name,
        },
        screennames {
          ${fragmentReference},
        },
      }
    `);

    // Mark top fragment as local, and child fragment as non-local.
    var data = readData(getStoreData({records}), query, 'user_id');

    expect(data.id).toBe('user_id');
    expect(data.hometown.name).toEqual('hometown name');
    expect(data.screennames.length).toBe(2);
    var screennames = data.screennames;
    var namePointer1 =
      screennames[0][getNode(fragmentReference).getConcreteNodeHash()];
    var namePointer2 =
      screennames[1][getNode(fragmentReference).getConcreteNodeHash()];
    expect(namePointer1 instanceof GraphQLFragmentPointer).toBe(true);
    expect(namePointer1.getDataID()).toBe('client1');
    expect(namePointer1.getFragment())
      .toEqualQueryNode(getNode(fragmentReference.getFragment()));
    expect(namePointer2 instanceof GraphQLFragmentPointer).toBe(true);
    expect(namePointer2.getDataID()).toBe('client2');
    expect(namePointer2.getFragment())
      .toEqualQueryNode(getNode(fragmentReference.getFragment()));
  });

  it('reads dataID if a linked dataID is `null` or `undefined`', () => {
    var query = getNode(Relay.QL`
      query {
        viewer {
          actor {
            name
          },
        }
      }
    `);
    var records = {
      'client:1': {
        __dataID__: 'client:1',
        actor: null,
      },
    };
    var data = readData(getStoreData({records}), query, 'client:1');
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
    var query = getNode(Relay.QL`
      fragment on User {
        id,
        address {
          city,
        },
      }
    `);
    var records = {
      user_id: {
        __dataID__: 'user_id',
        id: 'user_id',
        address: null,
      },
    };
    var data = readData(getStoreData({records}), query, 'user_id');
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
    var query = getNode(Relay.QL`
      query {
        viewer {
          actor {
            name,
          },
        }
      }
    `);

    var records = {
      'client:1': {
        __dataID__: 'client:1',
      },
    };

    var data = readData(getStoreData({records}), query, 'client:1');
    expect(data).toEqual({__dataID__: 'client:1'});

    // Extra assertion because `toEqual` matcher skips over properties with
    // undefined values...
    expect('actor' in data).toBe(false);
  });

  it('allocates linked fields even if all child fields are null', () => {
    var query = getNode(Relay.QL`
      query {
        node(id:"123") {
          birthdate {
            year,
          },
        }
      }
    `);
    var records = {
      '123': {
        __dataID__: '123',
        birthdate: {
          __dataID__: 'client:1',
        },
      },
      'client:1': {
        __dataID__: 'client:1',
        year: null,
      },
    };
    var data = readData(getStoreData({records}), query, '123');

    expect(data.birthdate).not.toBeNull();
    expect(data.birthdate.year).toBeNull();
  });

  it('reads fields for connections without calls', () => {
    var query = getNode(Relay.QL`
      fragment on User {
        friends {
          count,
        },
      }
    `);
    var records = {
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
    var data = readData(getStoreData({records}), query, 'user_id');
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
    var query = getNode(Relay.QL`
      fragment on Story {
        id,
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

    var records = {
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
    var data = readData(getStoreData({records}), query, 'storyID');
    expect(data).toEqual({
      __dataID__: 'storyID',
      id: 'storyID',
      feedback: {
        __dataID__: 'feedbackID',
      },
    });
  });

  it('parses range client IDs', () => {
    var fragmentReference = RelayFragmentReference.createForContainer(
      () => Relay.QL`
        fragment on FriendsConnection {
          edges {
            node {
              address {
                city,
                country
              }
            },
          },
        }
      `,
      {}
    );
    var query = getNode(Relay.QL`
      fragment on User {
        friends(first:"25") {
          ${fragmentReference},
        },
      }
    `);

    var records = {
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
    var storeData = getStoreData({records});

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
    var data = readData(storeData, query, 'userID');
    var pointer = data.friends[
      getNode(fragmentReference).getConcreteNodeHash()
    ];
    expect(pointer instanceof GraphQLFragmentPointer).toBe(true);
    expect(data).toEqual({
      __dataID__: 'userID',
      friends: {
        __dataID__: 'friendsID_first(25)',
        [getNode(fragmentReference).getConcreteNodeHash()]: pointer,
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
    var records = {
      'client:1': {
        __dataID__: 'client:1',
        actor: {
          __dataID__: '660361306',
        },
      },
      660361306: {
        __dataID__: '660361306',
        firstName: 'Greg',
        id: '660361306',
      },
    };
    var query = getNode(Relay.QL`query{viewer{actor{firstName}}}`);
    var data = readData(
      getStoreData({records}),
      query,
      'client:1',
      {traverseGeneratedFields: true}
    );
    expect(data).toEqual({
      __dataID__: 'client:1',
      actor: {
        __dataID__: '660361306',
        firstName: 'Greg',
        id: '660361306',
      },
    });
  });

  it('can be configured to read generated fields (page info case)', () => {
    var query = getNode(Relay.QL`
      fragment on Feedback {
        topLevelComments(first:"1") {
          pageInfo {
            hasNextPage,
          },
        },
      }`
    );

    var records = {
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

    var data = readData(
      getStoreData({records}),
      query,
      'feedbackID',
      {traverseGeneratedFields: true}
    );
    expect(data).toEqual({
      __dataID__: 'feedbackID',
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
    var records = {};

    // If we did traverse, this fragment reference would lead us to create an
    // object with a __dataID__ instead of the desired `undefined`.
    var fragmentReference = RelayFragmentReference.createForContainer(
      () => Relay.QL`fragment on User{name}`,
      {}
    );
    var query = getNode(Relay.QL`query{node(id:"4"){${fragmentReference}}}`);
    var data = readData(getStoreData({records}), query, '4');
    expect(data).toBe(undefined);
  });

  it('does not attempt to traverse non-existent data IDs', () => {
    var records = {4: null};

    // If we did traverse, this fragment reference would lead us to create an
    // object with a __dataID__ instead of the desired `null`.
    var fragmentReference = RelayFragmentReference.createForContainer(
      () => Relay.QL`fragment on User{name}`,
      {}
    );
    var query = getNode(Relay.QL`query{node(id:"4"){${fragmentReference}}}`);
    var data = readData(getStoreData({records}), query, '4');
    expect(data).toBe(null);
  });

  it('reads data for matching fragments', () => {
    var records = {
      123: {
        __dataID__: '123',
        id: '123',
        __typename: 'User',
      },
    };
    var query = getNode(Relay.QL`fragment on User { id }`);
    var data = readData(getStoreData({records}), query, '123');
    expect(data).toEqual({
      __dataID__: '123',
      id: '123',
    });
  });

  it('returns undefined for non-matching fragments', () => {
    var records = {
      123: {
        __dataID__: '123',
        id: '123',
        __typename: 'User',
      },
    };
    var query = getNode(Relay.QL`fragment on Page { id }`);
    var data = readData(getStoreData({records}), query, '123');
    expect(data).toEqual(undefined);
  });

  it('skips non-matching child fragments', () => {
    var records = {
      123: {
        __dataID__: '123',
        id: '123',
        __typename: 'User',
        name: 'Greg',
      },
    };
    var query = getNode(Relay.QL`fragment on Actor {
      ... on User {
        name
      }
      ... on Page {
        id
      }
    }`);
    var data = readData(getStoreData({records}), query, '123');
    expect(data).toEqual({
      __dataID__: '123',
      name: 'Greg',
    });
  });
});

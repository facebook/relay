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

var GraphQLFragmentPointer = require('GraphQLFragmentPointer');
var GraphQLRange = require('GraphQLRange');
var GraphQLStoreRangeUtils = require('GraphQLStoreRangeUtils');
var Relay = require('Relay');
var RelayConnectionInterface = require('RelayConnectionInterface');
var RelayFragmentReference = require('RelayFragmentReference');
var RelayRecordStatusMap = require('RelayRecordStatusMap');
var callsToGraphQL = require('callsToGraphQL');
var readRelayQueryData = require('readRelayQueryData');

describe('readRelayQueryData', () => {
  var RelayRecordStore;

  var {getNode} = RelayTestUtils;
  var END_CURSOR, HAS_NEXT_PAGE, HAS_PREV_PAGE, PAGE_INFO, START_CURSOR;

  function getData({records, queuedRecords}, queryNode, dataID, options) {
    return readRelayQueryData(
      new RelayRecordStore({records, queuedRecords}),
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
      START_CURSOR
    } = RelayConnectionInterface);

    jest.addMatchers(RelayTestUtils.matchers);
  });

  it('returns undefined for data that is not in the store', () => {
    var records = {};
    var query = getNode(Relay.QL`fragment on Actor{id}`);
    var data = getData({records}, query, '1055790163');
    expect(data).toBe(undefined);
  });

  it('returns null for data that is null in the store', () => {
    var records = {1055790163: null};
    var query = getNode(Relay.QL`fragment on Actor{id}`);
    var data = getData({records}, query, '1055790163');
    expect(data).toBe(null);
  });

  it('retrieves data that is in the store', () => {
    var records = {
      'client:viewer': {
        __dataID__: 'client:viewer',
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
    var data = getData({records}, query, 'client:viewer');
    expect(data).toEqual({
      __dataID__: 'client:viewer',
      actor: {
        __dataID__: '660361306',
        firstName: 'Greg',
      },
    });
  });

  it('returns the ids for all read data', () => {
    var records = {
      node: {
        name: 'Chris',
        birthdate: {__dataID__: 'date'},
        address: {__dataID__: 'address'},
      },
      date: {day: 21},
      address: null,
    };
    var query = getNode(Relay.QL`fragment on User{birthdate {day}, address {city}}`);
    expect(
      readRelayQueryData(new RelayRecordStore({records}), query, 'node').dataIDs
    ).toEqual({
      node: true,
      date: true,
      address: true,
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
    var data = getData({records}, query, '1055790163');
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
    var data = getData({records}, query, 'feedbackID');
    expect(data.id).toBe('feedbackID');
    expect(data.doesViewerLike).toBeNull();

    records = {
      feedbackID: {
        __dataID__: 'feedbackID',
        id: 'feedbackID',
      },
    };
    data = getData({records}, query, 'feedbackID');
    expect(data.id).toBe('feedbackID');
    expect(data.doesViewerLike).toBeUndefined();
    expect('doesViewerLike' in data).toBe(false);
  });

  it('retrieves empty plural fields', () => {
    var records = {
      user_id: {
        id: 'user_id',
        websites: [],
      }
    };
    var query = getNode(Relay.QL`fragment on User{id,websites}`);
    var data = getData({records}, query, 'user_id');
    expect(data.websites).toEqual([]);
  });

  it('retrieves plural fields', () => {
    var websites = ['website1', 'website2'];

    var records = {
      user_id: {
        id: 'user_id',
        websites
      }
    };
    var query = getNode(Relay.QL`fragment on User{id,websites}`);
    var data = getData({records}, query, 'user_id');
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
    var data = getData({records, queuedRecords}, query, '660361306');
    expect(data).toEqual({
      __dataID__: '660361306',
      __status__: STATUS,
      firstName: 'Snoop Lion',
    });
  });

  it('populates data ID for nodes containing only non-local fragments', () => {
    var records = {
      'client:viewer': {
        __dataID__: 'client:viewer',
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
    var data = getData({records}, query, 'client:viewer');
    var pointer = data[getNode(fragmentReference).getConcreteFragmentID()];
    expect(pointer instanceof GraphQLFragmentPointer).toBe(true);
    expect(data.__dataID__).toBe('client:viewer');
  });

  it('reads data for non-container fragment references', () => {
    var records = {
      'client:viewer': {
        __dataID__: 'client:viewer',
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
    var data = getData({records}, query, 'client:viewer');
    expect(data).toEqual({
      __dataID__: 'client:viewer',
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
      }
    };

    var fragment1 = Relay.QL`fragment on Actor{address{city}}`;
    var fragment2 = Relay.QL`fragment on Actor{address{country}}`;
    var query = getNode(Relay.QL`  fragment on Actor {
            ${fragment1},
            ${fragment2},
          }`);
    var data = getData({records}, query, '1055790163');
    expect(data).toEqual({
      __dataID__: '1055790163',
      address: {
        __dataID__: 'client:1',
        city: 'San Francisco',
        country: 'US',
      }
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
    var rangeID = GraphQLStoreRangeUtils.getClientIDForRangeWithID(
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
      }
    });
    var data = getData({records}, query, rangeID);
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
    var data = getData({records}, query, 'feedback_id');
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
      }
    });

    var data = getData({records}, query, 'feedbackID');
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
      }
    });

    var data = getData({records}, query, 'feedbackID');
    expect(data).toEqual({
      __dataID__: 'feedbackID',
      topLevelComments: {
        __dataID__: 'commentsID_first(1)',
        count: 57,
        [PAGE_INFO]: {
          [HAS_NEXT_PAGE]: true,
        }
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
      'Invariant Violation: ' +
      'readRelayQueryData(): The field `likers` is a connection. ' +
      'Fields `edges` and `pageInfo` cannot be fetched without a ' +
      '`first`, `last` or `find` argument.';

    var query = getNode(Relay.QL`fragment on Story{feedback{likers{edges{node{name}}}}}`);
    expect(() => getData({records}, query, 'story_id')).toThrow(error);

    // Note that `pageInfo` also triggers the error...
    query = getNode(Relay.QL`fragment on Story{feedback{likers{pageInfo}}}`);
    expect(() => getData({records}, query, 'story_id')).toThrow(error);

    // ...but not `count`:
    query = getNode(Relay.QL`fragment on Story{feedback{likers{count}}}`);
    expect(() => getData({records}, query, 'story_id')).not.toThrow();
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
      'Invariant Violation: ' +
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
    expect(() => getData({records}, query, 'story_id'))
      .toThrow(error);

    var fragment = Relay.QL`fragment on LikersOfContentConnection{pageInfo}`;
    query = getNode(Relay.QL`fragment on Story{feedback{likers{${fragment}}}}`);
    expect(() => getData({records}, query, 'story_id'))
      .toThrow(error);

    fragment = Relay.QL`fragment on LikersOfContentConnection{count}`;
    query = getNode(Relay.QL`fragment on Story{feedback{likers{${fragment}}}}`);
    expect(() => getData({records}, query, 'story_id'))
      .not.toThrow();
  });

  it('reads `edge`/`pageInfo` without range info like linked records', () => {
    var records = {
      feedback_id: {
        __dataID__: 'feedback_id',
        likers: {
          __dataID__: 'likers_id',
        }
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
        }
      },
      likers_page_info_id: {
        __dataID__: 'likers_page_info_id',
        [HAS_NEXT_PAGE]: true
      },
      liker_id: {
        __dataID__: 'liker_id',
        name: 'Tim'
      }
    };

    var query = getNode(Relay.QL`fragment on Feedback{likers(first:"1"){edges{node{name}}}}`);
    var data = getData({records}, query, 'feedback_id');
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
    data = getData({records}, query, 'feedback_id');
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
        }
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
      }
    });

    var data = getData(
      {records},
      query,
      'feedback_id',
      {traverseFragmentReferences: true}
    );

    expect(data.comments).toEqual({
      __dataID__: 'comments_id_first(1)',
      [PAGE_INFO]: {
        [START_CURSOR]: 'cursor',
        [HAS_NEXT_PAGE]: true,
      }
    });

    data = getData({records}, query, 'feedback_id');

    var fragmentPointer = data.comments.pageInfo[
      getNode(fragmentReference).getConcreteFragmentID()
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
        }
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
      }
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
      }
    });

    var data = getData(
      {records},
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
          id: 'comment_node_id'
        }
      }],
      [PAGE_INFO]: {
        [START_CURSOR]: 'cursor',
      }
    });

    data = getData({records}, query, 'feedback_id');

    var fragmentPointer = data.comments[
      getNode(fragmentReference).getConcreteFragmentID()
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
        hometown: {__dataID__: 'hometown_id'}
      },
      hometown_id: {
        __dataID__: 'hometown_id',
        id: 'hometown_id',
        name: 'hometown name'
      },
      client1: {
        __dataID__: 'client1',
        service: 'GTALK',
        name: '123'
      },
      client2: {
        __dataID__: 'client1',
        service: 'TWITTER',
        name: '123'
      }
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
    var data = getData({records}, query, 'user_id');

    expect(data.id).toBe('user_id');
    expect(data.hometown.name).toEqual('hometown name');
    expect(data.screennames.length).toBe(2);
    var screennames = data.screennames;
    var namePointer1 =
      screennames[0][getNode(fragmentReference).getConcreteFragmentID()];
    var namePointer2 =
      screennames[1][getNode(fragmentReference).getConcreteFragmentID()];
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
      'client:viewer': {
        __dataID__: 'client:viewer',
        actor: null,
      },
    };
    var data = getData({records}, query, 'client:viewer');
    expect(data.actor).toBeNull();

    records = {
      'client:viewer': {
        __dataID__: 'client:viewer',
      },
    };
    data = getData({records}, query, 'client:viewer');
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
    var data = getData({records}, query, 'user_id');
    expect(data.address).toBeNull();
    expect(data.id).toBe('user_id');

    records = {
      user_id: {
        __dataID__: 'user_id',
        id: 'user_id',
      },
    };
    data = getData({records}, query, 'user_id');
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
      'client:viewer': {
        __dataID__: 'client:viewer',
      },
    };

    var data = getData({records}, query, 'client:viewer');
    expect(data).toEqual({__dataID__: 'client:viewer'});

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
    var data = getData({records}, query, '123');

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
          __dataID__: 'client:friends',
        },
      },
      'client:friends': {
        __dataID__: 'client:friends',
        count: 42,
      },
    };
    var data = getData({records}, query, 'user_id');
    expect(data.friends.count).toBe(42);

    // Now imagine another query (say, a deferred query) has populated the store
    // with range info for this connection.
    records = {
      'user_id': {
        __dataID__: 'user_id',
        friends: {
          __dataID__: 'client:friends',
        },
      },
      'client:friends': {
        __dataID__: 'client:friends',
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
      }
    });
    data = getData({records}, query, 'user_id');
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
    var data = getData({records}, query, 'storyID');
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

    GraphQLRange.prototype.retrieveRangeInfoForQuery.mockReturnValue({
      requestedEdgeIDs: ['edgeID'],
      diffCalls: [],
      pageInfo: {
        [START_CURSOR]: 'cursor',
        [END_CURSOR]: 'cursor',
        [HAS_NEXT_PAGE]: false,
        [HAS_PREV_PAGE]: false,
      }
    });

    // First we read the outer fragment, which populates the
    // GraphQLStoreRangeUtils rangeData cache.
    // (TODO: task to fix that hidden global state: #7250441)
    var data = getData({records}, query, 'userID');
    var pointer = data.friends[
      getNode(fragmentReference).getConcreteFragmentID()
    ];
    expect(pointer instanceof GraphQLFragmentPointer).toBe(true);
    expect(data).toEqual({
      __dataID__: 'userID',
      friends: {
        __dataID__: 'friendsID_first(25)',
        [getNode(fragmentReference).getConcreteFragmentID()]: pointer,
      },
    });

    // Now we read the inner (non-local) fragment, using the range client ID.
    data = getData(
      {records},
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
      'client:viewer': {
        __dataID__: 'client:viewer',
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
    var data = getData(
      {records},
      query,
      'client:viewer',
      {traverseGeneratedFields: true}
    );
    expect(data).toEqual({
      __dataID__: 'client:viewer',
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
      }
    });

    var data = getData(
      {records},
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
    var data = getData({records}, query, '4');
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
    var data = getData({records}, query, '4');
    expect(data).toBe(null);
  });
});

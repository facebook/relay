/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';
import type {RecordSourceSelectorProxy} from 'relay-runtime/store/RelayStoreTypes';

import type {GraphQLResponseWithoutData} from '../../network/RelayNetworkTypes';

const ConnectionHandler = require('../../handlers/connection/ConnectionHandler');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const {getFragment, getRequest, graphql} = require('../../query/GraphQLTag');
const RelayModernEnvironment = require('../../store/RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../../store/RelayModernOperationDescriptor');
const {createReaderSelector} = require('../../store/RelayModernSelector');
const RelayModernStore = require('../../store/RelayModernStore');
const RelayRecordSource = require('../../store/RelayRecordSource');
const {ROOT_ID} = require('../../store/RelayStoreUtils');
const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const commitMutation = require('../commitMutation');
const nullthrows = require('nullthrows');
const {createMockEnvironment} = require('relay-test-utils-internal');

describe('Configs: NODE_DELETE', () => {
  jest.resetModules();

  it('deletes a node', () => {
    const environment = createMockEnvironment();
    const store = environment.getStore();
    const mutation = getRequest(graphql`
      mutation commitMutationTest1Mutation($input: CommentDeleteInput) {
        commentDelete(input: $input) {
          deletedCommentId
          feedback {
            id
            topLevelComments {
              count
            }
          }
        }
      }
    `);
    const feedbackID = 'feedback123';
    const firstCommentID = 'comment456';
    const secondCommentID = 'comment789';
    const variables = {
      input: {
        deletedCommentId: firstCommentID,
      },
    };
    const FeedbackCommentQuery = getRequest(graphql`
      query commitMutationTest1Query {
        node(id: "feedback123") {
          ... on Feedback {
            topLevelComments(first: 2) {
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
    const payload = {
      node: {
        __typename: 'Feedback',
        id: feedbackID,
        topLevelComments: {
          count: 2,
          edges: [
            {
              cursor: firstCommentID + ':cursor',
              node: {
                id: firstCommentID,
              },
            },
            {
              cursor: secondCommentID + ':cursor',
              node: {
                id: secondCommentID,
              },
            },
          ],
        },
      },
    };
    const optimisticResponse = () => ({
      commentDelete: {
        deletedCommentId: firstCommentID,
        feedback: {
          id: feedbackID,
          topLevelComments: {
            count: 1,
          },
        },
      },
    });
    const configs = [
      {
        type: 'NODE_DELETE',
        deletedIDFieldName: 'deletedCommentId',
      },
    ];
    const optimisticUpdater = jest.fn();
    const updater = jest.fn();
    const operationDescriptor = createOperationDescriptor(
      FeedbackCommentQuery,
      {},
    );
    environment.commitPayload(operationDescriptor, payload);
    const snapshot = store.lookup(
      createReaderSelector(
        FeedbackCommentQuery.fragment,
        ROOT_ID,
        {},
        operationDescriptor.request,
      ),
    );
    const callback = jest.fn();
    store.subscribe(snapshot, callback);
    commitMutation(environment, {
      configs,
      mutation,
      optimisticResponse,
      optimisticUpdater,
      updater,
      variables,
    });
    expect(callback.mock.calls.length).toBe(1);
    expect(optimisticUpdater).toBeCalled();
    callback.mockClear();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    const operation = environment.executeMutation.mock.calls[0][0].operation;
    environment.mock.resolve(operation, {
      data: {
        commentDelete: {
          deletedCommentId: firstCommentID,
          feedback: {
            id: feedbackID,
            topLevelComments: {
              count: 1,
            },
          },
        },
      },
    });
    jest.runAllTimers();
    expect(updater).toBeCalled();
    expect(callback.mock.calls.length).toBe(0);
  });
});

describe('Configs: RANGE_DELETE', () => {
  let environment, FeedbackCommentQuery, store;

  beforeEach(() => {
    jest.resetModules();

    environment = createMockEnvironment();
    store = environment.getStore();
  });

  it('handles configs', () => {
    const mutation = getRequest(graphql`
      mutation commitMutationTest2Mutation($input: CommentDeleteInput) {
        commentDelete(input: $input) {
          deletedCommentId
          feedback {
            comments {
              count
            }
          }
        }
      }
    `);
    const commentID = 'comment123';
    const variables = {
      input: {
        commentId: commentID,
      },
    };
    const optimisticResponse = {
      commentDelete: {
        deletedCommentId: commentID,
        feedback: {
          id: '123',
          comments: {
            count: 0,
          },
        },
      },
    };
    const configs = [
      {
        type: 'RANGE_DELETE',
        parentName: 'feedback',
        parentID: '123',
        connectionKeys: [{key: 'Feedback_comments'}],
        deletedIDFieldName: 'deletedCommentId',
        pathToConnection: ['feedback', 'comments'],
      },
    ];
    FeedbackCommentQuery = getRequest(graphql`
      query commitMutationTest2Query {
        node(id: "123") {
          ... on Feedback {
            comments(first: 10) @connection(key: "Feedback_comments") {
              edges {
                node {
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
    const payload = {
      node: {
        __typename: 'Feedback',
        id: '123',
        comments: {
          count: 1,
          edges: [
            {
              cursor: '<cursor>',
              node: {
                id: commentID,
                __typename: 'Comment',
                body: {
                  text: '...',
                },
              },
            },
          ],
          page_info: {
            end_cursor: '<cursor>',
            has_next_page: true,
            has_previous_page: false,
            start_cursor: '<cursor>',
          },
        },
      },
    };
    const operationDescriptor = createOperationDescriptor(
      FeedbackCommentQuery,
      {},
    );
    environment.commitPayload(operationDescriptor, payload);
    const optimisticUpdater = jest.fn();
    const updater = jest.fn();
    const snapshot = store.lookup(
      createReaderSelector(
        FeedbackCommentQuery.fragment,
        ROOT_ID,
        {},
        operationDescriptor.request,
      ),
    );
    const callback = jest.fn();
    store.subscribe(snapshot, callback);
    commitMutation(environment, {
      configs,
      mutation,
      optimisticResponse,
      optimisticUpdater,
      updater,
      variables,
    });
    // Optimistically deletes
    expect(callback.mock.calls.length).toBe(1);
    expect(optimisticUpdater).toBeCalled();
    callback.mockClear();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    const operation = environment.executeMutation.mock.calls[0][0].operation;
    environment.mock.resolve(operation, {
      data: {
        commentDelete: {
          deletedCommentId: commentID,
          feedback: {
            id: '123',
            comments: {
              count: 1,
            },
          },
        },
      },
    });
    jest.runAllTimers();
    // Does not need to fire again since server data should be the same
    expect(updater).toBeCalled();
    expect(callback.mock.calls.length).toBe(0);
  });

  it('handles config with deletedIDFieldName as path', () => {
    const optimisticUpdater = jest.fn();
    const updater = jest.fn();
    const mutation = getRequest(graphql`
      mutation commitMutationTest3Mutation($input: UnfriendInput) {
        unfriend(input: $input) {
          actor {
            id
          }
          formerFriend {
            id
          }
        }
      }
    `);
    const configs = [
      {
        type: 'RANGE_DELETE',
        parentName: 'actor',
        parentID: '123',
        connectionKeys: [{key: 'Friends_friends'}],
        deletedIDFieldName: ['formerFriend'],
        pathToConnection: ['actor', 'friends'],
      },
    ];
    const variables = {
      input: {
        friendId: '456',
      },
    };
    environment = createMockEnvironment();
    store = environment.getStore();

    const FriendQuery = getRequest(graphql`
      query commitMutationTest3Query {
        viewer {
          actor {
            ... on User {
              friends(first: 1) @connection(key: "Friends_friends") {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          }
        }
      }
    `);
    const payload = {
      viewer: {
        actor: {
          __typename: 'User',
          id: '123',
          friends: {
            edges: [
              {
                cursor: '<cursor>',
                __typename: 'User',
                node: {
                  id: '456',
                },
              },
            ],
          },
        },
      },
    };
    const operationDescriptor = createOperationDescriptor(FriendQuery, {});
    environment.commitPayload(operationDescriptor, payload);
    const optimisticResponse = {
      unfriend: {
        actor: {
          id: '123',
          __typename: 'User',
        },
        formerFriend: {
          id: '456',
        },
      },
    };
    const snapshot = store.lookup(
      createReaderSelector(
        FriendQuery.fragment,
        ROOT_ID,
        {},
        operationDescriptor.request,
      ),
    );
    const callback = jest.fn();
    store.subscribe(snapshot, callback);
    commitMutation(environment, {
      configs,
      mutation,
      optimisticUpdater,
      optimisticResponse,
      updater,
      variables,
    });
    expect(callback.mock.calls.length).toBe(1);
    expect(optimisticUpdater).toBeCalled();
    callback.mockClear();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    const operation = environment.executeMutation.mock.calls[0][0].operation;
    environment.mock.resolve(operation, {
      data: {
        unfriend: {
          actor: {
            id: '123',
            __typename: 'User',
          },
          formerFriend: {
            id: '456',
          },
        },
      },
    });
    jest.runAllTimers();
    expect(updater).toBeCalled();
    expect(callback.mock.calls.length).toBe(0);
  });
});

describe('Configs: RANGE_ADD', () => {
  let callback,
    CommentQuery,
    data,
    environment,
    mutation,
    optimisticUpdater,
    payload,
    store,
    updater;
  const commentID = 'comment123';

  const feedbackID = 'feedback123';
  const variables = {
    input: {
      feedback: feedbackID,
      message: {
        text: 'Hello!',
        ranges: [],
      },
    },
  };
  const nextCursor = 'comment789:cursor';
  const nextNodeID = 'comment789';
  const optimisticResponse = {
    commentCreate: {
      feedbackCommentEdge: {
        __typename: 'CommentsEdge',
        cursor: nextCursor,
        node: {
          id: nextNodeID,
          body: {
            text: variables.input.message.text,
          },
        },
      },
    },
  };

  beforeEach(() => {
    jest.resetModules();

    environment = createMockEnvironment();
    store = environment.getStore();

    mutation = getRequest(graphql`
      mutation commitMutationTest4Mutation($input: CommentCreateInput) {
        commentCreate(input: $input) {
          feedbackCommentEdge {
            cursor
            node {
              id
              body {
                text
              }
            }
          }
        }
      }
    `);

    CommentQuery = getRequest(graphql`
      query commitMutationTest4Query {
        node(id: "feedback123") {
          ... on Feedback {
            topLevelComments(first: 1)
              @connection(key: "Feedback_topLevelComments") {
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
    payload = {
      node: {
        id: feedbackID,
        __typename: 'Feedback',
        topLevelComments: {
          edges: [
            {
              cursor: commentID + ':cursor',
              node: {
                id: commentID,
              },
            },
          ],
        },
      },
    };
    callback = jest.fn();
    optimisticUpdater = jest.fn();
    updater = jest.fn();
    data = {
      data: {
        commentCreate: {
          feedbackCommentEdge: {
            __typename: 'CommentsEdge',
            cursor: nextCursor,
            node: {
              id: nextNodeID,
              body: {
                text: variables.input.message.text,
              },
            },
          },
        },
      },
    };
  });

  it('appends new edge', () => {
    const configs = [
      {
        type: 'RANGE_ADD',
        connectionName: 'topLevelComments',
        connectionInfo: [
          {
            key: 'Feedback_topLevelComments',
            rangeBehavior: 'append',
          },
        ],
        parentID: 'feedback123',
        edgeName: 'feedbackCommentEdge',
      },
    ];
    const operationDescriptor = createOperationDescriptor(CommentQuery, {});
    environment.commitPayload(operationDescriptor, nullthrows(payload));
    const snapshot = store.lookup(
      createReaderSelector(
        CommentQuery.fragment,
        ROOT_ID,
        {},
        operationDescriptor.request,
      ),
    );
    store.subscribe(snapshot, callback);
    commitMutation(environment, {
      configs,
      mutation,
      optimisticResponse,
      optimisticUpdater,
      updater,
      variables,
    });
    // Optimistically appends
    expect(callback.mock.calls.length).toBe(1);
    expect(optimisticUpdater).toBeCalled();
    callback.mockClear();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    const operation = environment.executeMutation.mock.calls[0][0].operation;
    environment.mock.resolve(operation, data);
    jest.runAllTimers();
    // Does not need to fire again since server data should be the same
    expect(updater).toBeCalled();
    expect(callback.mock.calls.length).toBe(0);
  });

  it('does not overwrite previous edge when appended multiple times', () => {
    const configs = [
      {
        type: 'RANGE_ADD',
        connectionName: 'topLevelComments',
        connectionInfo: [
          {
            key: 'Feedback_topLevelComments',
            rangeBehavior: 'append',
          },
        ],
        parentID: 'feedback123',
        edgeName: 'feedbackCommentEdge',
      },
    ];
    // prepare existing data
    const operationDescriptor = createOperationDescriptor(CommentQuery, {});
    environment.commitPayload(operationDescriptor, {
      node: {
        id: feedbackID,
        __typename: 'Feedback',
        topLevelComments: {
          count: 1,
          edges: [
            {
              cursor: 'comment1:cursor',
              node: {
                id: 'comment1',
              },
            },
          ],
        },
      },
    });
    // send mutation
    commitMutation(environment, {
      configs,
      mutation,
      variables,
    });

    let serverResponse = {
      data: {
        commentCreate: {
          feedbackCommentEdge: {
            __typename: 'CommentsEdge',
            cursor: 'comment2:cursor',
            node: {
              id: 'comment2',
              // these are extra fields which should be stripped off before appending
              // to the connection.
              body: {
                text: variables.input.message.text,
              },
            },
          },
        },
      },
    };
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    const operation = environment.executeMutation.mock.calls[0][0].operation;
    environment.mock.resolve(operation, serverResponse);
    jest.runAllTimers();

    let snapshot = store.lookup(
      createReaderSelector(
        CommentQuery.fragment,
        ROOT_ID,
        {},
        operationDescriptor.request,
      ),
    );
    expect(snapshot.data).toEqual({
      node: {
        topLevelComments: {
          edges: [
            {
              cursor: 'comment1:cursor',
              node: {
                __typename: 'Comment',
                id: 'comment1',
              },
            },
            {
              cursor: 'comment2:cursor',
              node: {
                __typename: 'Comment',
                id: 'comment2',
              },
            },
          ],
          // The following fields are not quite related. Though not explicted requested in the query,
          // Relay now automatically adds the page info.
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
        },
      },
    });

    serverResponse = {
      data: {
        commentCreate: {
          feedbackCommentEdge: {
            __typename: 'CommentsEdge',
            cursor: 'comment3:cursor',
            node: {
              id: 'comment3',
              // these are extra fields which should be stripped off before appending
              // to the connection.
              body: {
                text: variables.input.message.text,
              },
            },
          },
        },
      },
    };
    // send the same mutation again
    commitMutation(environment, {
      configs,
      mutation,
      variables,
    });
    environment.mock.resolve(operation, serverResponse);
    jest.runAllTimers();

    snapshot = store.lookup(
      createReaderSelector(
        CommentQuery.fragment,
        ROOT_ID,
        {},
        operationDescriptor.request,
      ),
    );

    expect(snapshot.data).toEqual({
      node: {
        topLevelComments: {
          edges: [
            {
              cursor: 'comment1:cursor',
              node: {
                __typename: 'Comment',
                id: 'comment1',
              },
            },
            {
              cursor: 'comment2:cursor',
              node: {
                __typename: 'Comment',
                id: 'comment2',
              },
            },
            {
              cursor: 'comment3:cursor',
              node: {
                __typename: 'Comment',
                id: 'comment3',
              },
            },
          ],
          // The following fields are not quite related. Though not explicted requested in the query,
          // Relay now automatically adds the page info.
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
        },
      },
    });
  });

  it('prepends new edge', () => {
    const configs = [
      {
        type: 'RANGE_ADD',
        connectionName: 'topLevelComments',
        connectionInfo: [
          {
            key: 'Feedback_topLevelComments',
            rangeBehavior: 'prepend',
          },
        ],
        parentID: 'feedback123',
        edgeName: 'feedbackCommentEdge',
      },
    ];
    const operationDescriptor = createOperationDescriptor(CommentQuery, {});
    environment.commitPayload(operationDescriptor, nullthrows(payload));
    const snapshot = store.lookup(
      createReaderSelector(
        CommentQuery.fragment,
        ROOT_ID,
        {},
        operationDescriptor.request,
      ),
    );
    store.subscribe(snapshot, callback);
    commitMutation(environment, {
      configs,
      mutation,
      optimisticResponse,
      optimisticUpdater,
      updater,
      variables,
    });
    // Optimistically prepends
    expect(callback.mock.calls.length).toBe(1);
    expect(optimisticUpdater).toBeCalled();
    callback.mockClear();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    const operation = environment.executeMutation.mock.calls[0][0].operation;
    environment.mock.resolve(operation, data);
    jest.runAllTimers();
    // Does not need to fire again since server data should be the same
    expect(updater).toBeCalled();
    expect(callback.mock.calls.length).toBe(0);
  });

  it('filters connections then applies the rangeBehavior', () => {
    const configs = [
      {
        type: 'RANGE_ADD',
        connectionName: 'topLevelComments',
        connectionInfo: [
          {
            key: 'Feedback_topLevelComments',
            filters: {orderBy: 'chronological'},
            rangeBehavior: 'append',
          },
        ],
        parentID: 'feedback123',
        edgeName: 'feedbackCommentEdge',
      },
    ];
    CommentQuery = getRequest(graphql`
      query commitMutationTest5Query {
        node(id: "feedback123") {
          ... on Feedback {
            topLevelComments(orderBy: chronological, first: 1)
              @connection(key: "Feedback_topLevelComments") {
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
    const operationDescriptor = createOperationDescriptor(CommentQuery, {});
    environment.commitPayload(operationDescriptor, nullthrows(payload));
    const snapshot = store.lookup(
      createReaderSelector(
        CommentQuery.fragment,
        ROOT_ID,
        {},
        operationDescriptor.request,
      ),
    );
    store.subscribe(snapshot, callback);
    commitMutation(environment, {
      configs,
      mutation,
      optimisticResponse,
      optimisticUpdater,
      updater,
      variables,
    });
    // Optimistically appends orderBy(chronological)
    expect(callback.mock.calls.length).toBe(1);
    expect(optimisticUpdater).toBeCalled();
    callback.mockClear();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    const operation = environment.executeMutation.mock.calls[0][0].operation;
    environment.mock.resolve(operation, data);
    jest.runAllTimers();
    // Does not need to fire again since server data should be the same
    expect(updater).toBeCalled();
    expect(callback.mock.calls.length).toBe(0);
  });

  it('does not overwrite previous edge when appended multiple times in updater function', () => {
    updater = (updaterStore: $FlowFixMe | RecordSourceSelectorProxy) => {
      payload = updaterStore.getRootField('commentCreate');
      const newEdge = nullthrows(payload).getLinkedRecord(
        'feedbackCommentEdge',
      );
      const feedbackProxy = nullthrows(updaterStore).get(feedbackID);
      const conn = ConnectionHandler.getConnection(
        nullthrows(feedbackProxy),
        'Feedback_topLevelComments',
      );
      ConnectionHandler.insertEdgeAfter(nullthrows(conn), nullthrows(newEdge));
    };
    // prepare existing data
    const operationDescriptor = createOperationDescriptor(CommentQuery, {});
    environment.commitPayload(operationDescriptor, {
      node: {
        id: feedbackID,
        __typename: 'Feedback',
        topLevelComments: {
          count: 1,
          edges: [
            {
              cursor: 'comment1:cursor',
              node: {
                id: 'comment1',
              },
            },
          ],
        },
      },
    });

    // send mutation
    commitMutation(environment, {
      updater,
      mutation,
      variables,
    });

    let serverResponse = {
      data: {
        commentCreate: {
          feedbackCommentEdge: {
            __typename: 'CommentsEdge',
            cursor: 'comment2:cursor',
            node: {
              id: 'comment2',
              // these are extra fields which should be stripped off before appending
              // to the connection.
              body: {
                text: variables.input.message.text,
              },
            },
          },
        },
      },
    };

    const snapshot = store.lookup(
      createReaderSelector(
        CommentQuery.fragment,
        ROOT_ID,
        {},
        operationDescriptor.request,
      ),
    );

    environment.subscribe(snapshot, callback);

    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    const operation = environment.executeMutation.mock.calls[0][0].operation;
    environment.mock.resolve(operation, serverResponse);
    jest.runAllTimers();

    expect(callback).toBeCalledTimes(1);
    expect(callback.mock.calls[0][0].data).toEqual({
      node: {
        topLevelComments: {
          edges: [
            {
              cursor: 'comment1:cursor',
              node: {
                __typename: 'Comment',
                id: 'comment1',
              },
            },
            {
              cursor: 'comment2:cursor',
              node: {
                __typename: 'Comment',
                id: 'comment2',
              },
            },
          ],
          // The following fields are not quite related. Though not explicted requested in the query,
          // Relay now automatically adds the page info.
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
        },
      },
    });
    callback.mockClear();

    serverResponse = {
      data: {
        commentCreate: {
          feedbackCommentEdge: {
            __typename: 'CommentsEdge',
            cursor: 'comment3:cursor',
            node: {
              id: 'comment3',
              // these are extra fields which should be stripped off before appending
              // to the connection.
              body: {
                text: variables.input.message.text,
              },
            },
          },
        },
      },
    };
    // send the same mutation again
    commitMutation(environment, {
      updater,
      mutation,
      variables,
    });
    environment.mock.resolve(operation, serverResponse);
    jest.runAllTimers();

    expect(callback).toBeCalledTimes(1);
    expect(callback.mock.calls[0][0].data).toEqual({
      node: {
        topLevelComments: {
          edges: [
            {
              cursor: 'comment1:cursor',
              node: {
                __typename: 'Comment',
                id: 'comment1',
              },
            },
            {
              cursor: 'comment2:cursor',
              node: {
                __typename: 'Comment',
                id: 'comment2',
              },
            },
            {
              cursor: 'comment3:cursor',
              node: {
                __typename: 'Comment',
                id: 'comment3',
              },
            },
          ],
          // The following fields are not quite related. Though not explicted requested in the query,
          // Relay now automatically adds the page info.
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
        },
      },
    });
  });
});

describe('Aliased mutation roots', () => {
  beforeEach(() => {
    jest.mock('warning');
  });

  it('does not present a warning when mutation uses an aliased in combination with a optimistcResponse', () => {
    const environment = createMockEnvironment();
    const mutation = getRequest(graphql`
      mutation commitMutationTest5Mutation($input: CommentDeleteInput) {
        alias: commentDelete(input: $input) {
          deletedCommentId
          feedback {
            id
            topLevelComments {
              count
            }
          }
        }
      }
    `);
    commitMutation(environment, {
      mutation,
      variables: {},
      optimisticResponse: {
        alias: {
          deletedCommentId: 'oo ahh zippy do wah',
          feedback: {
            id: 'the feedback id',
            topLevelComments: {
              count: '>9000',
            },
          },
        },
      },
    });
    expect(require('warning')).not.toHaveBeenCalledWith(
      undefined,
      expect.anything(),
      expect.anything(),
    );
  });
});

describe('Required mutation roots', () => {
  let dataSource;
  let environment;
  beforeEach(() => {
    RelayFeatureFlags.ENABLE_REQUIRED_DIRECTIVES = true;
    const fetch = jest.fn((_query, _variables, _cacheConfig) => {
      return RelayObservable.create(sink => {
        dataSource = sink;
      });
    });
    const source = RelayRecordSource.create({});
    const store = new RelayModernStore(source);
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(fetch),
      store,
    });
  });
  it('does not throw when accessing the root field', () => {
    const mutation = getRequest(graphql`
      mutation commitMutationTestRequiredRootFieldMutation(
        $input: CommentDeleteInput
      ) {
        commentDelete(input: $input) @required(action: THROW) {
          deletedCommentId
        }
      }
    `);

    let idInUpdater;
    commitMutation(environment, {
      mutation,
      variables: {},
      updater: updaterStore => {
        const payload = updaterStore.getRootField('commentDelete');
        idInUpdater = payload?.getValue('deletedCommentId');
      },
    });
    dataSource.next({
      data: {
        commentDelete: {
          deletedCommentId: '1',
        },
      },
    });

    expect(idInUpdater).toBe('1');
  });
});

describe('commitMutation()', () => {
  let dataSource;
  let environment;
  let fragment;
  let mutation;
  let onCompleted;
  let onError;
  let onNext;
  let variables;

  beforeEach(() => {
    fragment = getFragment(graphql`
      fragment commitMutationTest2Fragment on Comment {
        id
        body {
          text
        }
      }
    `);
    mutation = getRequest(graphql`
      mutation commitMutationTest6Mutation($input: CommentCreateInput!) {
        commentCreate(input: $input) {
          comment {
            id
            body {
              text
            }
          }
        }
      }
    `);
    variables = {
      input: {
        feedbackId: '1',
      },
    };

    onCompleted = jest.fn();
    onError = jest.fn();
    onNext = jest.fn();
    const fetch = jest.fn((_query, _variables, _cacheConfig) => {
      return RelayObservable.create(sink => {
        dataSource = sink;
      });
    });
    const source = RelayRecordSource.create({});
    const store = new RelayModernStore(source);
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(fetch),
      store,
    });
  });

  it('publishes each payload to the store as it arrives', () => {
    const operation = createOperationDescriptor(mutation, variables);
    const initialSnapshot = environment.lookup(
      createReaderSelector(fragment, '1', {}, operation.request),
    );
    const callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    commitMutation(environment, {
      mutation,
      variables,
      onCompleted,
      onError,
    });
    dataSource.next({
      data: {
        commentCreate: {
          comment: {
            id: '1',
            body: {
              text: 'Gave Relay',
            },
          },
        },
      },
    });
    expect(callback).toBeCalledTimes(1);
    const snapshot = callback.mock.calls[0][0];
    expect(snapshot.isMissingData).toBe(false);
    expect(snapshot.data).toEqual({
      id: '1',
      body: {text: 'Gave Relay'},
    });

    dataSource.next({
      data: {
        commentCreate: {
          comment: {
            id: '1',
            body: {
              text: 'GAVE RELAY!!!!', // updated
            },
          },
        },
      },
    });
    expect(callback).toBeCalledTimes(2);
    const nextSnapshot = callback.mock.calls[1][0];
    expect(nextSnapshot.isMissingData).toBe(false);
    expect(nextSnapshot.data).toEqual({
      id: '1',
      body: {text: 'GAVE RELAY!!!!'}, // updated text
    });

    expect(onCompleted).toBeCalledTimes(0);
    expect(onError).toBeCalledTimes(0);
  });

  it('calls onCompleted when the mutation completes after one payload', () => {
    commitMutation(environment, {
      mutation,
      variables,
      onCompleted,
      onError,
    });
    dataSource.next({
      data: {
        commentCreate: {
          comment: {
            id: '1',
            body: {
              text: 'Gave Relay',
            },
          },
        },
      },
    });
    expect(onCompleted).toBeCalledTimes(0);
    dataSource.complete();

    expect(onCompleted).toBeCalledTimes(1);
    expect(onCompleted.mock.calls[0][0]).toEqual({
      commentCreate: {
        comment: {
          id: '1',
          body: {
            text: 'Gave Relay',
          },
        },
      },
    });
    expect(onCompleted.mock.calls[0][1]).toBe(null);
    expect(onError).toBeCalledTimes(0);
  });

  it('calls onCompleted when the mutation completes after one payload with errors', () => {
    commitMutation(environment, {
      mutation,
      variables,
      onCompleted,
      onError,
    });
    dataSource.next(
      ({
        data: {
          commentCreate: {
            comment: {
              id: '1',
              body: {
                text: 'Gave Relay',
              },
            },
          },
        },
        errors: [
          {
            message: 'wtf',
            locations: [],
            severity: 'ERROR',
          },
        ],
      }: GraphQLResponseWithoutData),
    );
    expect(onCompleted).toBeCalledTimes(0);
    dataSource.complete();

    expect(onCompleted).toBeCalledTimes(1);
    expect(onCompleted.mock.calls[0][0]).toEqual({
      commentCreate: {
        comment: {
          id: '1',
          body: {
            text: 'Gave Relay',
          },
        },
      },
    });
    expect(onCompleted.mock.calls[0][1]).toEqual([
      {
        message: 'wtf',
        locations: [],
        severity: 'ERROR',
      },
    ]);
    expect(onError).toBeCalledTimes(0);
  });

  it('calls onCompleted with the latest data when the mutation completes after multiple payloads', () => {
    commitMutation(environment, {
      mutation,
      variables,
      onCompleted,
      onError,
      onNext,
    });
    dataSource.next(
      ({
        data: {
          commentCreate: {
            comment: {
              id: '1',
              body: {
                text: 'Gave Relay', // overridden by later payload
              },
            },
          },
        },
        errors: [
          {
            message: 'wtf',
            locations: [],
            severity: 'ERROR',
          },
        ],
      }: GraphQLResponseWithoutData),
    );
    expect(onNext).toBeCalledTimes(1);
    expect(onNext.mock.calls[0][0]).toBe(undefined);
    dataSource.next(
      ({
        data: {
          commentCreate: {
            comment: {
              id: '1',
              body: {
                text: 'GAVE RELAY',
              },
            },
          },
        },
        errors: [
          {
            message: 'wtf again!',
            locations: [],
            severity: 'ERROR',
          },
        ],
      }: GraphQLResponseWithoutData),
    );
    expect(onCompleted).toBeCalledTimes(0);
    expect(onNext).toBeCalledTimes(2);
    expect(onNext.mock.calls[1][0]).toBe(undefined);
    dataSource.complete();

    expect(onCompleted).toBeCalledTimes(1);
    expect(onCompleted.mock.calls[0][0]).toEqual({
      commentCreate: {
        comment: {
          id: '1',
          body: {
            text: 'GAVE RELAY', // matches value in latest payload
          },
        },
      },
    });
    expect(onCompleted.mock.calls[0][1]).toEqual([
      {
        message: 'wtf',
        locations: [],
        severity: 'ERROR',
      },
      {
        message: 'wtf again!',
        locations: [],
        severity: 'ERROR',
      },
    ]);
    expect(onNext).toBeCalledTimes(2); // from before
    expect(onError).toBeCalledTimes(0);
  });

  it('calls onError when the payload is mising data', () => {
    commitMutation(environment, {
      mutation,
      variables,
      onCompleted,
      onError,
    });
    dataSource.next({
      data: null, // error: missing data
      errors: [
        {
          message: 'wtf',
          locations: [],
          severity: 'ERROR',
        },
      ],
    });
    expect(onCompleted).toBeCalledTimes(0);
    expect(onError).toBeCalledTimes(1);
    expect(onError.mock.calls[0][0].message).toContain(
      'No data returned for operation `commitMutationTest6Mutation`',
    );
  });

  it('calls onError when the network errors', () => {
    commitMutation(environment, {
      mutation,
      variables,
      onCompleted,
      onError,
    });
    const error = new Error('wtf');
    dataSource.error(error);
    expect(onCompleted).toBeCalledTimes(0);
    expect(onError).toBeCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBe(error);
  });
});

describe('commitMutation() cacheConfig', () => {
  let cacheConfig;
  let environment;
  let fragment;
  let mutation;
  let variables;

  beforeEach(() => {
    fragment = getFragment(graphql`
      fragment commitMutationTest1Fragment on Comment {
        id
        body {
          text
        }
      }
    `);

    mutation = getRequest(graphql`
      mutation commitMutationTest7Mutation($input: CommentCreateInput!) {
        commentCreate(input: $input) {
          comment {
            id
            body {
              text
            }
          }
        }
      }
    `);
    variables = {
      input: {
        clientMutationId: '0',
        feedbackId: '1',
      },
    };

    cacheConfig = undefined;
    const fetch = jest.fn((_query, _variables, _cacheConfig) => {
      cacheConfig = _cacheConfig;
      return RelayObservable.create(() => {});
    });
    const source = RelayRecordSource.create({});
    const store = new RelayModernStore(source);
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(fetch),
      store,
    });
  });

  it('with cacheConfig', () => {
    const operation = createOperationDescriptor(mutation, variables);
    const initialSnapshot = environment.lookup(
      createReaderSelector(fragment, '1', {}, operation.request),
    );
    const callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    const metadata = {
      text: 'Gave Relay',
    };

    commitMutation(environment, {
      cacheConfig: {
        force: false, // should be overriden with false
        metadata,
      },
      mutation,
      variables,
    });

    expect(cacheConfig).toEqual({
      force: true,
      metadata,
    });
  });

  it('without cacheConfig', () => {
    const operation = createOperationDescriptor(mutation, variables);
    const initialSnapshot = environment.lookup(
      createReaderSelector(fragment, '1', {}, operation.request),
    );
    const callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    commitMutation(environment, {
      mutation,
      variables,
    });

    expect(cacheConfig).toEqual({force: true});
  });
});

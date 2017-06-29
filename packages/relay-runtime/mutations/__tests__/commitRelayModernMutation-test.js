/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const commitRelayModernMutation = require('commitRelayModernMutation');

const {commitMutation} = require('ReactRelayPublic');
const {createOperationSelector} = require('RelayModernOperationSelector');
const {generateAndCompile} = require('RelayModernTestUtils');
const {createMockEnvironment} = require('RelayModernMockEnvironment');
const {ROOT_ID} = require('RelayStoreUtils');

describe('Configs: NODE_DELETE', () => {
  jest.resetModules();

  it('deletes a node properly', () => {
    const environment = createMockEnvironment();
    const store = environment.getStore();
    const mutation = generateAndCompile(`
			mutation CommentDeleteMutation(
				$input: CommentDeleteInput
			) {
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
		`).CommentDeleteMutation;
    const feedbackID = 'feedback123';
    const firstCommentID = 'comment456';
    const secondCommentID = 'comment789';
    const variables = {
      input: {
        clientMutationId: '0',
        deletedCommentId: firstCommentID,
      },
    };
    const {FeedbackCommentQuery} = generateAndCompile(`
			query FeedbackCommentQuery {
					node(id: "feedback123") {
						...on Feedback {
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
    const snapshot = store.lookup({
      dataID: ROOT_ID,
      node: FeedbackCommentQuery.fragment,
      variables: {},
    });
    const callback = jest.fn();
    const operationSelector = createOperationSelector(FeedbackCommentQuery, {});
    environment.commitPayload(operationSelector, payload);
    store.subscribe(snapshot, callback);
    commitRelayModernMutation(environment, {
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
    const sendMutation =
      environment.sendMutation.mock.calls[0][0].operation.node;
    environment.mock.resolve(sendMutation, {
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

  it('handles configs properly', () => {
    const mutation = generateAndCompile(`
		mutation CommentDeleteMutation(
			$input: CommentDeleteInput
		) {
			commentDelete(input: $input) {
				clientMutationId
				deletedCommentId
				feedback {
					comments {
						count
					}
				}
			}
		}
	`).CommentDeleteMutation;
    const commentID = 'comment123';
    const variables = {
      input: {
        clientMutationId: '0',
        commentId: commentID,
      },
    };
    const optimisticResponse = {
      commentDelete: {
        clientMutationId: '0',
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
    ({FeedbackCommentQuery} = generateAndCompile(`
		query FeedbackCommentQuery {
				node(id: "123") {
					...on Feedback {
						comments(first: 10) @connection(
							key: "Feedback_comments"
						) {
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
		`));
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
    const operationSelector = createOperationSelector(FeedbackCommentQuery, {});
    environment.commitPayload(operationSelector, payload);
    const optimisticUpdater = jest.fn();
    const updater = jest.fn();
    const snapshot = store.lookup({
      dataID: ROOT_ID,
      node: FeedbackCommentQuery.fragment,
      variables: {},
    });
    const callback = jest.fn();
    store.subscribe(snapshot, callback);
    commitRelayModernMutation(environment, {
      configs,
      mutation,
      optimisticResponse,
      optimisticUpdater,
      updater,
      variables,
    });
    // Optimistically deletes properly
    expect(callback.mock.calls.length).toBe(1);
    expect(optimisticUpdater).toBeCalled();
    callback.mockClear();
    const sendMutation =
      environment.sendMutation.mock.calls[0][0].operation.node;
    environment.mock.resolve(sendMutation, {
      data: {
        commentDelete: {
          clientMutationId: '0',
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
    const mutation = generateAndCompile(`
			mutation UnfriendMutation(
				$input: UnfriendInput
			) {
				unfriend(input: $input) {
					actor {
						id
					}
					formerFriend {
						id
					}
				}
			}
		`).UnfriendMutation;
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
        clientMutationId: '0',
        friendId: '456',
      },
    };
    environment = createMockEnvironment();
    store = environment.getStore();

    const {FriendQuery} = generateAndCompile(`
		query FriendQuery {
			viewer {
				actor {
					...on User {
						friends(first: 1) @connection(
							key: "Friends_friends") {
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
    const operationSelector = createOperationSelector(FriendQuery, {});
    environment.commitPayload(operationSelector, payload);
    const optimisticResponse = {
      unfriend: {
        clientMutationId: '0',
        actor: {
          id: '123',
          __typename: 'User',
        },
        formerFriend: {
          id: '456',
        },
      },
    };
    const snapshot = store.lookup({
      dataID: ROOT_ID,
      node: FriendQuery.fragment,
      variables: {},
    });
    const callback = jest.fn();
    store.subscribe(snapshot, callback);
    commitRelayModernMutation(environment, {
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
    const sendMutation =
      environment.sendMutation.mock.calls[0][0].operation.node;
    environment.mock.resolve(sendMutation, {
      data: {
        unfriend: {
          clientMutationId: '0',
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
      feedback: {
        id: feedbackID,
        topLevelComments: {
          count: 2,
        },
      },
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

    mutation = generateAndCompile(`
		mutation CommentCreateMutation(
			$input: CommentCreateInput 
		) {
			commentCreate(input: $input) {
				feedback {
					id
					topLevelComments {
						count
					}
				}
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
		}`).CommentCreateMutation;

    ({CommentQuery} = generateAndCompile(`
		query CommentQuery {
			node(id:"feedback123") {
				...on Feedback {
					topLevelComments(first: 1) @connection(
						key: Feedback_topLevelComments
					) {
						count
						edges {
							node {
								id
							}
						}
					}
				}
			}
		}`));
    payload = {
      node: {
        id: feedbackID,
        __typename: 'Feedback',
        topLevelComments: {
          count: 1,
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
          feedback: {
            id: feedbackID,
            topLevelComments: {
              count: 2,
            },
          },
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

  it('appends edges', () => {
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
    const snapshot = store.lookup({
      dataID: ROOT_ID,
      node: CommentQuery.fragment,
      variables: {},
    });
    const operationSelector = createOperationSelector(CommentQuery, {});
    environment.commitPayload(operationSelector, payload);
    store.subscribe(snapshot, callback);
    commitMutation(environment, {
      configs,
      mutation,
      optimisticResponse,
      optimisticUpdater,
      updater,
      variables,
    });
    // Optimistically appends properly
    expect(callback.mock.calls.length).toBe(1);
    expect(optimisticUpdater).toBeCalled();
    callback.mockClear();
    const sendMutation =
      environment.sendMutation.mock.calls[0][0].operation.node;
    environment.mock.resolve(sendMutation, data);
    jest.runAllTimers();
    // Does not need to fire again since server data should be the same
    expect(updater).toBeCalled();
    expect(callback.mock.calls.length).toBe(0);
  });

  it('prepends edges', () => {
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
    const snapshot = store.lookup({
      dataID: ROOT_ID,
      node: CommentQuery.fragment,
      variables: {},
    });
    const operationSelector = createOperationSelector(CommentQuery, {});
    environment.commitPayload(operationSelector, payload);
    store.subscribe(snapshot, callback);
    commitMutation(environment, {
      configs,
      mutation,
      optimisticResponse,
      optimisticUpdater,
      updater,
      variables,
    });
    // Optimistically prepends properly
    expect(callback.mock.calls.length).toBe(1);
    expect(optimisticUpdater).toBeCalled();
    callback.mockClear();
    const sendMutation =
      environment.sendMutation.mock.calls[0][0].operation.node;
    environment.mock.resolve(sendMutation, data);
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
    ({CommentQuery} = generateAndCompile(`
		query CommentQuery {
			node(id:"feedback123") {
				...on Feedback {
					topLevelComments(orderBy: "chronological", first: 1) @connection(
						key: Feedback_topLevelComments
					) {
						count
						edges {
							node {
								id
							}
						}
					}
				}
			}
		}`));
    const operationSelector = createOperationSelector(CommentQuery, {});
    environment.commitPayload(operationSelector, payload);
    const snapshot = store.lookup({
      dataID: ROOT_ID,
      node: CommentQuery.fragment,
      variables: {},
    });
    store.subscribe(snapshot, callback);
    commitMutation(environment, {
      configs,
      mutation,
      optimisticResponse,
      optimisticUpdater,
      updater,
      variables,
    });
    // Optimistically appends orderBy(chronological) properly
    expect(callback.mock.calls.length).toBe(1);
    expect(optimisticUpdater).toBeCalled();
    callback.mockClear();
    const sendMutation =
      environment.sendMutation.mock.calls[0][0].operation.node;
    environment.mock.resolve(sendMutation, data);
    jest.runAllTimers();
    // Does not need to fire again since server data should be the same
    expect(updater).toBeCalled();
    expect(callback.mock.calls.length).toBe(0);
  });
});

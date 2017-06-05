/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

jest.autoMockOff();

const {commitMutation} = require('RelayModern');
const {createOperationSelector} = require('RelayModernOperationSelector');
const RelayModernTestUtils = require('RelayModernTestUtils');
const {createMockEnvironment} = require('RelayMockFBEnvironment');
const {ROOT_ID} = require('RelayStoreUtils');

describe('Configs: RANGE_DELETE', () => {
  let environment, FeedbackCommentQuery, store;
  const {generateAndCompile} = RelayModernTestUtils;

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
    const optimisticResponse = () => ({
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
    });
    const configs = [{
      type: 'RANGE_DELETE',
      parentName: 'feedback',
      parentID: '123',
      connectionKeys: [{key: 'Feedback_comments'}],
      deletedIDFieldName: 'deletedCommentId',
      pathToConnection: ['feedback', 'comments'],
    }];
    ({FeedbackCommentQuery} = environment.mock.compile(`
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
    const operationSelector = createOperationSelector(
      FeedbackCommentQuery,
      {}
    );
    environment.commitPayload(
      operationSelector,
      payload,
    );
    const optimisticUpdater = jest.fn();
    const updater = jest.fn();
    const snapshot = store.lookup({
      dataID: ROOT_ID,
      node: FeedbackCommentQuery.fragment,
      variables: {},
    });
    const callback = jest.fn();
    store.subscribe(snapshot, callback);
    commitMutation(
      environment,
      {
        configs,
        mutation,
        optimisticResponse,
        optimisticUpdater,
        updater,
        variables,
      }
    );
    // Optimistically deletes properly
    expect(callback.mock.calls.length).toBe(1);
    expect(optimisticUpdater).toBeCalled();
    callback.mockClear();
    const sendMutation = environment.sendMutation.mock.calls[0][0].operation.node;
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
    const configs = [{
      type: 'RANGE_DELETE',
      parentName: 'actor',
      parentID: '123',
      connectionKeys: [{key: 'Friends_friends'}],
      deletedIDFieldName: ['formerFriend'],
      pathToConnection: ['actor', 'friends'],
    }];
    const variables = {
      input: {
        clientMutationId: '0',
        friendId: '456',
      },
    };
    environment = createMockEnvironment();
    store = environment.getStore();

    const {FriendQuery} = environment.mock.compile(`
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
    const operationSelector = createOperationSelector(
      FriendQuery,
      {}
    );
    environment.commitPayload(
      operationSelector,
      payload,
    );
    const optimisticResponse = () => ({
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
    });
    const snapshot = store.lookup({
      dataID: ROOT_ID,
      node: FriendQuery.fragment,
      variables: {},
    });
    const callback = jest.fn();
    store.subscribe(snapshot, callback);
    commitMutation(
      environment,
      {
        configs,
        mutation,
        optimisticUpdater,
        optimisticResponse,
        updater,
        variables,
      }
    );
    expect(callback.mock.calls.length).toBe(1);
    expect(optimisticUpdater).toBeCalled();
    callback.mockClear();
    const sendMutation = environment.sendMutation.mock.calls[0][0].operation.node;
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

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

const RelayModernEnvironment = require('../../store/RelayModernEnvironment');
const RelayModernStore = require('../../store/RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const RelayRecordSource = require('../../store/RelayRecordSource');

const requestSubscription = require('../requestSubscription');

const {
  createOperationDescriptor,
} = require('../../store/RelayModernOperationDescriptor');
const {createReaderSelector} = require('../../store/RelayModernSelector');
const {ROOT_ID} = require('../../store/RelayStoreUtils');
const {
  createMockEnvironment,
  generateAndCompile,
} = require('relay-test-utils-internal');

describe('requestSubscription-test', () => {
  it('Config: `RANGE_ADD`', () => {
    const environment = createMockEnvironment();
    const store = environment.getStore();

    // write some data to the store
    const feedbackId = 'foo';
    const firstCommentId = 'comment-1';
    const firstCommentBody = 'first comment';
    const secondCommentId = 'comment-2';
    const {FeedbackCommentQuery} = generateAndCompile(`
			query FeedbackCommentQuery($id: ID) {
					node(id: $id) {
						...on Feedback {
							comments(first: 2)@connection(key: "FeedbackCommentQuery_comments") {
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
    const payload = {
      node: {
        __typename: 'Feedback',
        id: feedbackId,
        comments: {
          edges: [
            {
              cursor: '<cursor>',
              node: {
                id: firstCommentId,
                __typename: 'Comment',
                body: {
                  text: firstCommentBody,
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
      {
        id: feedbackId,
      },
    );
    environment.commitPayload(operationDescriptor, payload);

    const {CommentCreateSubscription} = generateAndCompile(`
      subscription CommentCreateSubscription(
        $input: CommentCreateSubscriptionInput
      ) {
        commentCreateSubscribe(input: $input) {
          feedbackCommentEdge {
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

    const configs = [
      {
        type: 'RANGE_ADD',
        connectionName: 'comments',
        connectionInfo: [
          {
            key: 'FeedbackCommentQuery_comments',
            rangeBehavior: 'append',
          },
        ],
        parentID: feedbackId,
        edgeName: 'feedbackCommentEdge',
      },
    ];

    const secondCommentBody = 'second comment';
    requestSubscription(environment, {
      configs,
      subscription: CommentCreateSubscription,
      variables: {
        feedbackId,
        text: secondCommentBody,
        clientSubscriptionId: '0',
      },
    });

    const subscriptionPayload = {
      data: {
        commentCreateSubscribe: {
          feedbackCommentEdge: {
            node: {
              __typename: 'Comment',
              id: secondCommentId,
              body: {
                text: secondCommentBody,
              },
            },
          },
        },
      },
    };
    environment.mock.nextValue(CommentCreateSubscription, subscriptionPayload);
    const snapshot = store.lookup(
      createReaderSelector(
        FeedbackCommentQuery.fragment,
        ROOT_ID,
        {
          id: feedbackId,
        },
        operationDescriptor.request,
      ),
    );
    expect(snapshot.data).toEqual({
      node: {
        comments: {
          edges: [
            {
              cursor: '<cursor>',
              node: {
                __typename: 'Comment',
                body: {
                  text: firstCommentBody,
                },
                id: firstCommentId,
              },
            },
            {
              cursor: undefined,
              node: {
                __typename: 'Comment',
                body: {
                  text: secondCommentBody,
                },
                id: secondCommentId,
              },
            },
          ],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
        },
      },
    });
  });

  describe('requestSubscription() cacheConfig', () => {
    let cacheMetadata;
    let environment;
    let CommentCreateSubscription;
    const feedbackId = 'foo';
    const secondCommentBody = 'second comment';
    const metadata = {
      text: 'Gave Relay',
    };
    const variables = {
      feedbackId,
      text: secondCommentBody,
      clientSubscriptionId: '0',
    };

    beforeEach(() => {
      ({CommentCreateSubscription} = generateAndCompile(`
      subscription CommentCreateSubscription(
        $input: CommentCreateSubscriptionInput
      ) {
        commentCreateSubscribe(input: $input) {
          feedbackCommentEdge {
            node {
              id
              body {
                text
              }
            }
          }
        }
      }
    `));

      cacheMetadata = undefined;
      const fetch = jest.fn((_query, _variables, _cacheConfig) => {
        cacheMetadata = _cacheConfig.metadata;
        return RelayObservable.create(() => {});
      });
      const source = RelayRecordSource.create({});
      const store = new RelayModernStore(source);
      environment = new RelayModernEnvironment({
        network: RelayNetwork.create(fetch, fetch),
        store,
      });
    });
    it('with cacheConfig', () => {
      requestSubscription(environment, {
        subscription: CommentCreateSubscription,
        variables,
        cacheConfig: {
          metadata,
        },
      });

      expect(cacheMetadata).toEqual(metadata);
    });

    it('without cacheConfig', () => {
      requestSubscription(environment, {
        subscription: CommentCreateSubscription,
        variables,
      });

      expect(cacheMetadata).toEqual(undefined);
    });
  });
});

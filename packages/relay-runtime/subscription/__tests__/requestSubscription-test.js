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

const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const RelayModernEnvironment = require('../../store/RelayModernEnvironment');
const RelayModernStore = require('../../store/RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const RelayRecordSource = require('../../store/RelayRecordSource');

const requestSubscription = require('../requestSubscription');

const {graphql, getRequest} = require('../../query/GraphQLTag');
const {
  createOperationDescriptor,
} = require('../../store/RelayModernOperationDescriptor');
const {createReaderSelector} = require('../../store/RelayModernSelector');
const {ROOT_ID} = require('../../store/RelayStoreUtils');
const {createMockEnvironment} = require('relay-test-utils-internal');

describe('requestSubscription-test', () => {
  RelayFeatureFlags.ENABLE_UNIQUE_SUBSCRIPTION_ROOT = true;
  it('Config: `RANGE_ADD`', () => {
    const environment = createMockEnvironment();
    const store = environment.getStore();

    // write some data to the store
    const feedbackId = 'foo';
    const firstCommentId = 'comment-1';
    const firstCommentBody = 'first comment';
    const secondCommentId = 'comment-2';
    const FeedbackCommentQuery = getRequest(graphql`
      query requestSubscriptionTestFeedbackCommentQuery($id: ID) {
        node(id: $id) {
          ... on Feedback {
            comments(first: 2)
              @connection(key: "FeedbackCommentQuery_comments") {
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

    const CommentCreateSubscription = getRequest(graphql`
      subscription requestSubscriptionTestCommentCreateSubscription(
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
              cursor: null,
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
      CommentCreateSubscription = getRequest(graphql`
        subscription requestSubscriptionTest1CommentCreateSubscription(
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

  it('does not overwrite existing data', () => {
    const ConfigsQuery = getRequest(graphql`
      query requestSubscriptionTestConfigsQuery {
        viewer {
          configs {
            edges {
              node {
                name
              }
            }
          }
        }
      }
    `);

    const ConfigCreateSubscription = getRequest(graphql`
      subscription requestSubscriptionTestConfigCreateSubscription {
        configCreateSubscribe {
          config {
            name
          }
        }
      }
    `);

    const operationDescriptor = createOperationDescriptor(ConfigsQuery, {});
    const environment = createMockEnvironment();
    const store = environment.getStore();

    environment.commitPayload(operationDescriptor, {
      viewer: {
        configs: {
          edges: [],
        },
      },
    });

    const selector = createReaderSelector(
      ConfigsQuery.fragment,
      ROOT_ID,
      {},
      operationDescriptor.request,
    );
    const onNext = jest.fn();

    let id = 0;
    requestSubscription(environment, {
      subscription: ConfigCreateSubscription,
      variables: {},
      updater: storeProxy => {
        const configs = storeProxy
          .getRoot()
          .getLinkedRecord('viewer')
          ?.getLinkedRecord('configs');
        if (configs == null) {
          throw Error('Expected edges to exist');
        }
        const config = storeProxy
          .getRootField('configCreateSubscribe')
          ?.getLinkedRecord('config');

        if (config == null) {
          throw Error('Expected config to exist');
        }
        const edge = storeProxy.create(String(id++), 'ConfigsConnectionEdge');
        edge.setLinkedRecord(config, 'node');
        const edges = configs.getLinkedRecords('edges');
        if (edges == null) {
          throw Error('Expected edges to exist');
        }
        edges.push(edge);
        configs.setLinkedRecords(edges, 'edges');
      },
      onNext,
    });

    environment.mock.nextValue(ConfigCreateSubscription, {
      data: {
        configCreateSubscribe: {
          config: {
            name: 'Mark',
          },
        },
      },
    });
    expect(store.lookup(selector).data).toEqual({
      viewer: {
        configs: {
          edges: [
            {
              node: {
                name: 'Mark',
              },
            },
          ],
        },
      },
    });
    expect(onNext).toBeCalledTimes(1);
    expect(onNext.mock.calls[0][0]).toEqual({
      configCreateSubscribe: {config: {name: 'Mark'}},
    });

    environment.mock.nextValue(ConfigCreateSubscription, {
      data: {
        configCreateSubscribe: {
          config: {
            name: 'Zuck',
          },
        },
      },
    });
    expect(store.lookup(selector).data).toEqual({
      viewer: {
        configs: {
          edges: [
            {
              node: {
                name: 'Mark',
              },
            },
            {
              node: {
                name: 'Zuck',
              },
            },
          ],
        },
      },
    });
    expect(onNext).toBeCalledTimes(2);
    expect(onNext.mock.calls[1][0]).toEqual({
      configCreateSubscribe: {config: {name: 'Zuck'}},
    });
  });
});

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

const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const {getRequest, graphql} = require('../../query/GraphQLTag');
const RelayModernEnvironment = require('../../store/RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../../store/RelayModernOperationDescriptor');
const {createReaderSelector} = require('../../store/RelayModernSelector');
const RelayModernStore = require('../../store/RelayModernStore');
const RelayRecordSource = require('../../store/RelayRecordSource');
const {ROOT_ID} = require('../../store/RelayStoreUtils');
const requestSubscription = require('../requestSubscription');
const {createMockEnvironment} = require('relay-test-utils-internal');

describe('requestSubscription-test', () => {
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

    graphql`
      fragment requestSubscriptionTestExtraFragment on Config {
        isEnabled
      }
    `;

    const ConfigCreateSubscription = getRequest(graphql`
      subscription requestSubscriptionTestConfigCreateSubscription {
        configCreateSubscribe {
          config {
            name
            ...requestSubscriptionTestExtraFragment
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
      configCreateSubscribe: {
        config: {
          name: 'Mark',
          __id: expect.any(String),
          __fragments: {requestSubscriptionTestExtraFragment: {}},
          __fragmentOwner: expect.any(Object),
          // TODO T96653810: Correctly detect reading from root of mutation/subscription
          __isWithinUnmatchedTypeRefinement: true, // should be false
        },
      },
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
      configCreateSubscribe: {
        config: {
          name: 'Zuck',
          __id: expect.any(String),
          __fragments: {requestSubscriptionTestExtraFragment: {}},
          __fragmentOwner: expect.any(Object),
          __isWithinUnmatchedTypeRefinement: true,
        },
      },
    });
  });

  it('reads the data using the correct rootID in onNext when resources are resolved synchronously', () => {
    const normalization = require('./__generated__/requestSubscriptionTestPlainUserNameRenderer_name$normalization.graphql');
    const subscription = getRequest(graphql`
      subscription requestSubscriptionTestSubscription(
        $input: CommentCreateSubscriptionInput!
      ) {
        commentCreateSubscribe(input: $input) {
          comment {
            actor {
              name
              nameRenderer @match {
                ...requestSubscriptionTestPlainUserNameRenderer_name
                  @module(name: "PlainUserNameRenderer.react")
              }
            }
          }
        }
      }
    `);

    graphql`
      fragment requestSubscriptionTestPlainUserNameRenderer_name on PlainUserNameRenderer {
        plaintext
        data {
          text
        }
      }
    `;
    const environment = createMockEnvironment({
      operationLoader: {
        load: jest.fn(moduleName => {
          return Promise.resolve(normalization);
        }),
        get: () => normalization,
      },
    });

    const onNext = jest.fn();
    const updater = jest.fn();

    requestSubscription(environment, {
      subscription,
      variables: {},
      updater,
      onNext,
    });
    environment.mock.nextValue(subscription, {
      data: {
        commentCreateSubscribe: {
          comment: {
            id: '1',
            actor: {
              id: '4',
              name: 'actor-name',
              __typename: 'User',
              nameRenderer: {
                __typename: 'PlainUserNameRenderer',
                __module_component_requestSubscriptionTestSubscription:
                  'MarkdownUserNameRenderer.react',
                __module_operation_requestSubscriptionTestSubscription:
                  'RelayModernEnvironmentExecuteSubscriptionWithMatchTestMarkdownUserNameRenderer_name$normalization.graphql',
                markdown: 'markdown payload',
                data: {
                  id: 'data-1',
                  plaintext: 'text',
                },
              },
            },
          },
        },
      },
    });
    jest.runAllTimers();

    expect(onNext).toBeCalledTimes(1);
    expect(onNext).toBeCalledWith({
      commentCreateSubscribe: {
        comment: {
          actor: {
            name: 'actor-name',
            nameRenderer: expect.any(Object),
          },
        },
      },
    });
    expect(updater).toBeCalledTimes(1);
  });
});

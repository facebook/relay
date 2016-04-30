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

jest
  .unmock('GraphQLRange')
  .unmock('GraphQLSegment')
  .unmock('RelayMutation')
  .unmock('RelayNetworkLayer');

const Relay = require('Relay');
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayEnvironment = require('RelayEnvironment');
const RelayGraphQLMutation = require('RelayGraphQLMutation');
const RelayMutationTransactionStatus = require('RelayMutationTransactionStatus');
const RelayTestUtils = require('RelayTestUtils');
const generateRQLFieldAlias = require('generateRQLFieldAlias');
const readRelayQueryData = require('readRelayQueryData');

const {
  COMMITTING,
  COMMIT_QUEUED,
  UNCOMMITTED,
} = RelayMutationTransactionStatus;
const {HAS_NEXT_PAGE, HAS_PREV_PAGE, PAGE_INFO} = RelayConnectionInterface;

const {getNode} = RelayTestUtils;

describe('RelayGraphQLMutation', () => {
  let environment;
  let feedbackLikeQuery;
  let feedbackLikeVariables;
  let optimisticQuery;
  let optimisticResponse;
  let queue;
  let requests;
  let sendMutation;
  let store;
  let storeData;

  // Convenience wrapper around `RelayTestUtils.writePayload`.
  function writePayload(query, payload) {
    const writer = storeData.getRecordWriter();
    const queryTracker = storeData.getQueryTracker();
    RelayTestUtils.writePayload(
      store,
      writer,
      query,
      payload,
      queryTracker
    );
  }

  // Convenience wrapper around `readRelayQueryData`.
  function readData(query, dataID) {
    return readRelayQueryData(
      storeData,
      query,
      dataID
    ).data;
  }

  beforeEach(() => {
    jasmine.addMatchers(RelayTestUtils.matchers);
    jest.resetModuleRegistry();

    requests = [];
    environment = new RelayEnvironment();
    storeData = environment.getStoreData();
    store = storeData.getRecordStore();
    queue = storeData.getMutationQueue();
    sendMutation = jest.fn(request => {
      requests.push(request);
      return request.getPromise();
    });
    storeData.getNetworkLayer().injectImplementation({sendMutation});

    feedbackLikeQuery =
      Relay.QL`mutation FeedbackLikeMutation {
        feedbackLike(input: $input) {
          clientMutationId
          feedback {
            doesViewerLike
            id
            likers(first: $likersCount) {
              count
              edges {
                node {
                  name
                }
              }
            }
          }
        }
      }`;
    feedbackLikeVariables = {
      input: {
        feedbackId: 'aFeedbackId',
      },
      likersCount: 10,
    };

    optimisticQuery =
      Relay.QL`mutation FeedbackLikeOptimisticUpdate {
        feedbackLike(input: $input) {
          clientMutationId
          feedback {
            doesViewerLike
            id
            likers(first: $likersCount) {
              count
            }
          }
        }
      }`;
    const likers = generateRQLFieldAlias('likers.first(10)');
    optimisticResponse = {
      feedback: {
        doesViewerLike: true,
        id: 'aFeedbackId',
        [likers]: {
          count: 2,
        },
        __typename: 'Feedback',
      },
    };
  });

  describe('applyOptimistic()', () => {
    it('complains if called twice', () => {
      const mutation = RelayGraphQLMutation.create(
        feedbackLikeQuery,
        feedbackLikeVariables,
        environment
      );
      const mutate = () => mutation.applyOptimistic(
        optimisticQuery,
        optimisticResponse
      );
      expect(mutate).not.toThrow();
      expect(mutate).toFailInvariant(
        'RelayGraphQLMutation: `applyOptimistic()` was called on an instance ' +
        'that already has a transaction in progress.'
      );
    });

    it('optimistically updates the store', () => {
      writePayload(
        getNode(Relay.QL`
          query {
            node(id: "aFeedbackId") {
              ... on Feedback {
                doesViewerLike
                id
                likers(first: "10") {
                  count
                  edges {
                    node {
                      id
                      name
                    }
                  }
                }
              }
            }
          }
        `),
        {
          node: {
            __typename: 'Feedback',
            doesViewerLike: false,
            id: 'aFeedbackId',
            likers: {
              count: 1,
              edges: [
                {
                  cursor: 'cursor1',
                  node: {
                    __typename: 'User',
                    id: '1055790163',
                    name: 'Yuzhi',
                  },
                },
              ],
              [PAGE_INFO]: {
                [HAS_NEXT_PAGE]: false,
                [HAS_PREV_PAGE]: false,
              },
            },
          },
        }
      );

      const callbacks = {
        onFailure: jest.fn(),
        onSuccess: jest.fn(),
      };
      const mutation = new RelayGraphQLMutation(
        feedbackLikeQuery,
        feedbackLikeVariables,
        null,
        environment,
        callbacks
      );
      const transaction = mutation.applyOptimistic(
        optimisticQuery,
        optimisticResponse,
      );
      const id = transaction.getID();
      expect(queue.getStatus(id)).toBe(UNCOMMITTED);
      expect(sendMutation.mock.calls.length).toBe(0);

      const data = readData(
        getNode(Relay.QL`
          fragment on Feedback {
            doesViewerLike
            id
            likers(first: "10") {
              count
            }
          }
        `),
        'aFeedbackId'
      );
      expect(data).toMatchRecord({
        __mutationStatus__: '0:UNCOMMITTED',
        doesViewerLike: true,
        id: 'aFeedbackId',
        likers: {
          __mutationStatus__: '0:UNCOMMITTED',
          count: 2,
        },
      });

      // Callbacks don't fire for optimistic updates.
      expect(callbacks.onFailure).not.toBeCalled();
      expect(callbacks.onSuccess).not.toBeCalled();
    });
  });

  describe('commit()', () => {
    describe('variable validation', () => {
      it('complains about missing `input` variable', () => {
        const variables = {
          inptu: /* <- Note the typo. */ {
            feedbackId: 'aFeedbackId',
          },
          likersCount: '10',
        };
        const mutation = RelayGraphQLMutation.create(
          feedbackLikeQuery,
          variables,
          environment
        );
        expect(() => mutation.commit())
          .toFailInvariant(
            'RelayGraphQLMutation: Required `input` variable is missing ' +
            '(supplied variables were: [inptu, likersCount]).'
          );
      });

      it('complains about missing non-`input` variables', () => {
        const variables = {
          input: {
            feedbackId: 'aFeedbackId',
          },
        };
        const mutation = RelayGraphQLMutation.create(
          feedbackLikeQuery,
          variables,
          environment
        );

        // Need to actually print the query to see this invariant.
        sendMutation.mockImplementation(request => request.getQueryString());

        expect(() => mutation.commit())
          .toFailInvariant(
            'callsFromGraphQL(): Expected a declared value for variable, ' +
            '`$likersCount`.'
          );
      });
    });

    describe('updating an existing node', () => {
      pit('can toggle a boolean', () => {
        writePayload(
          getNode(Relay.QL`
            query {
              node(id: "aFeedbackId") {
                ... on Feedback {
                  doesViewerLike
                  id
                  likers(first: "10") {
                    count
                    edges {
                      node {
                        id
                        name
                      }
                    }
                  }
                }
              }
            }
          `),
          {
            node: {
              __typename: 'Feedback',
              doesViewerLike: false,
              id: 'aFeedbackId',
              likers: {
                count: 1,
                edges: [
                  {
                    cursor: 'cursor1',
                    node: {
                      __typename: 'User',
                      id: '1055790163',
                      name: 'Yuzhi',
                    },
                  },
                ],
                [PAGE_INFO]: {
                  [HAS_NEXT_PAGE]: false,
                  [HAS_PREV_PAGE]: false,
                },
              },
            },
          }
        );

        // Creating the mutation does not send it.
        const callbacks = {
          onFailure: jest.fn(),
          onSuccess: jest.fn(),
        };
        const mutation = new RelayGraphQLMutation(
          feedbackLikeQuery,
          feedbackLikeVariables,
          null,
          environment,
          callbacks
        );
        expect(sendMutation.mock.calls.length).toBe(0);

        const transaction = mutation.commit();
        const id = transaction.getID();
        expect(queue.getStatus(id)).toBe(COMMITTING);
        expect(sendMutation.mock.calls.length).toBe(1);

        expect(requests.length).toBe(1);

        const request = requests[0];
        const likers = generateRQLFieldAlias('likers.first(10)');
        const result = {
          response: {
            clientMutationId: id,
            feedbackLike: {
              feedback: {
                id: 'aFeedbackId',
                doesViewerLike: true,
                [likers]: {
                  count: 2,
                  edges: [
                    {
                      cursor: 'cursor1',
                      node: {
                        __typename: 'User',
                        id: '1055790163',
                        name: 'Yuzhi',
                      },
                    },
                    {
                      cursor: 'cursor2',
                      node: {
                        __typename: 'User',
                        id: '660361306',
                        name: 'Greg',
                      },
                    },
                  ],
                  [PAGE_INFO]: {
                    [HAS_NEXT_PAGE]: false,
                    [HAS_PREV_PAGE]: false,
                  },
                },
              },
            },
          },
        };
        request.resolve(result);
        return request.then(() => {
          // Item is removed from queue.
          expect(() => queue.getStatus(id))
            .toFailInvariant(
              'RelayMutationQueue: `' + id + '` is not a valid pending ' +
              'transaction ID.'
            );

          // Success callback is notified.
          expect(callbacks.onSuccess.mock.calls.length).toBe(1);
          expect(callbacks.onSuccess.mock.calls[0]).toEqual([result.response]);

          //  Store is updated
          const data = readData(
            getNode(Relay.QL`
              fragment on Feedback {
                doesViewerLike
                id
                likers(first: "10") {
                  count
                  edges {
                    cursor
                    node {
                      id
                      name
                    }
                  }
                  pageInfo {
                    hasNextPage
                    hasPreviousPage
                  }
                }
              }
            `),
            'aFeedbackId'
          );
          expect(data).toMatchRecord({
            doesViewerLike: true,
            id: 'aFeedbackId',
            likers: {
              count: 2,
              edges: [
                {
                  cursor: 'cursor1',
                  node: {
                    id: '1055790163',
                    name: 'Yuzhi',
                  },
                },
                {
                  cursor: 'cursor2',
                  node: {
                    id: '660361306',
                    name: 'Greg',
                  },
                },
              ],
              pageInfo: {
                hasNextPage: false,
                hasPreviousPage: false,
              },
            },
          });
        });
      });

      describe('collision keys', () => {
        it('enqueues colliding keys', () => {
          // Colliding keys: only first transaction runs.
          const mutation1 = new RelayGraphQLMutation(
            feedbackLikeQuery,
            feedbackLikeVariables,
            null,
            environment,
            null,
            'aKey'
          );
          const mutation2 = new RelayGraphQLMutation(
            feedbackLikeQuery,
            feedbackLikeVariables,
            null,
            environment,
            null,
            'aKey'
          );
          const transaction1 = mutation1.commit();
          const transaction2 = mutation2.commit();
          expect(queue.getStatus(transaction1.getID())).toBe(COMMITTING);
          expect(queue.getStatus(transaction2.getID())).toBe(COMMIT_QUEUED);
        });

        it('allows non-collding keys to send concurrently', () => {
          // Non-colliding keys: both transactions run.
          const mutation1 = new RelayGraphQLMutation(
            feedbackLikeQuery,
            feedbackLikeVariables,
            null,
            environment,
            'oneKey'
          );
          const mutation2 = new RelayGraphQLMutation(
            feedbackLikeQuery,
            feedbackLikeVariables,
            null,
            environment,
            'anotherKey'
          );
          const transaction1 = mutation1.commit();
          const transaction2 = mutation2.commit();
          expect(queue.getStatus(transaction1.getID())).toBe(COMMITTING);
          expect(queue.getStatus(transaction2.getID())).toBe(COMMITTING);
        });

        it('auto-generates non-colliding keys if none provided', () =>{
          const mutation1 = RelayGraphQLMutation.create(
            feedbackLikeQuery,
            feedbackLikeVariables,
            environment
          );
          const mutation2 = RelayGraphQLMutation.create(
            feedbackLikeQuery,
            feedbackLikeVariables,
            environment
          );
          const transaction1 = mutation1.commit();
          const transaction2 = mutation2.commit();
          expect(queue.getStatus(transaction1.getID())).toBe(COMMITTING);
          expect(queue.getStatus(transaction2.getID())).toBe(COMMITTING);
        });
      });

      it('complains if committed twice', () => {
        const mutation = RelayGraphQLMutation.create(
          feedbackLikeQuery,
          feedbackLikeVariables,
          environment
        );
        mutation.commit();

        // Note: we're actually relying on RelayMutationTransaction invariant.
        expect(() => mutation.commit()).toFailInvariant(
          'RelayMutationTransaction: Only transactions with status `CREATED` ' +
          'or `UNCOMMITTED` can be committed.'
        );
      });
    });
  });
});

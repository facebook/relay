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
  .dontMock('GraphQLRange')
  .dontMock('GraphQLSegment')
  .dontMock('RelayMutation')
  .dontMock('RelayNetworkLayer');

const Relay = require('Relay');
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayEnvironment = require('RelayEnvironment');
const RelayGraphQLMutation = require('RelayGraphQLMutation');
const RelayMutationTransactionStatus = require('RelayMutationTransactionStatus');
const RelayTestUtils = require('RelayTestUtils');
const generateRQLFieldAlias = require('generateRQLFieldAlias');
const readRelayQueryData = require('readRelayQueryData');

const {COMMITTING} = RelayMutationTransactionStatus;
const {HAS_NEXT_PAGE, HAS_PREV_PAGE, PAGE_INFO} = RelayConnectionInterface;

const {getNode} = RelayTestUtils;

describe('RelayGraphQLMutation', function() {
  let environment;
  let callbacks;
  let feedbackLikeQuery;
  let queue;
  let requests;
  let sendMutation;
  let store;
  let storeData;
  let variables;

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
    jest.addMatchers(RelayTestUtils.matchers);

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
  });

  describe('commitUpdate()', () => {
    describe('variable validation', () => {
      it('complains about missing `input` variable', () => {
        variables = {
          inptu: /* <- Note the typo. */ {
            feedbackId: 'aFeedbackId',
          },
          likersCount: '10',
        };
        const mutation = new RelayGraphQLMutation(feedbackLikeQuery, variables);
        expect(() => mutation.commitUpdate(environment))
          .toFailInvariant(
            'RelayGraphQLMutation: Required `input` variable is missing ' +
            '(supplied variables were: [inptu, likersCount]).'
          );
      });

      it('complains about missing non-`input` variables', () => {
        variables = {
          input: {
            feedbackId: 'aFeedbackId',
          },
        };
        const mutation = new RelayGraphQLMutation(feedbackLikeQuery, variables);

        // Need to actually print the query to see this invariant.
        sendMutation.mockImplementation(request => request.getQueryString());

        expect(() => mutation.commitUpdate(environment))
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

        variables = {
          input: {
            feedbackId: 'aFeedbackId',
          },
          likersCount: 10,
        };

        // Creating the mutation does not send it.
        const mutation = new RelayGraphQLMutation(feedbackLikeQuery, variables);
        expect(sendMutation.mock.calls.length).toBe(0);

        callbacks = {
          onFailure: jest.fn(),
          onSuccess: jest.fn(),
        };
        const transaction = mutation.commitUpdate(
          environment,
          callbacks
        );
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
    });
  });
});

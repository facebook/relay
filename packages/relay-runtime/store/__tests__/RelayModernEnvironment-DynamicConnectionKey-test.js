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

'use strict';

const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernStore = require('../RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const RelayRecordSource = require('../RelayRecordSource');

const nullthrows = require('nullthrows');

const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {getSingularSelector} = require('../RelayModernSelector');
const {generateAndCompile} = require('relay-test-utils-internal');

describe('@connection with dynamic key', () => {
  let callbacks;
  let complete;
  let dataSource;
  let environment;
  let error;
  let fetch;
  let fragment;
  let next;
  let operation;
  let paginationQuery;
  let query;
  let source;
  let store;

  beforeEach(() => {
    jest.resetModules();
    jest.mock('warning');
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    RelayFeatureFlags.ENABLE_VARIABLE_CONNECTION_KEY = true;
    ({
      FeedbackQuery: query,
      FeedbackFragment: fragment,
      PaginationQuery: paginationQuery,
    } = generateAndCompile(`
      query FeedbackQuery($id: ID!, $commentsKey: String) {
        node(id: $id) {
          ...FeedbackFragment
        }
      }

      query PaginationQuery(
        $id: ID!
        $commentsKey: String
        $count: Int!
        $cursor: ID!
      ) {
        node(id: $id) {
          ...FeedbackFragment @arguments(count: $count, cursor: $cursor)
        }
      }

      fragment FeedbackFragment on Feedback @argumentDefinitions(
        count: {type: "Int", defaultValue: 2},
        cursor: {type: "ID"}
      ) {
        id
        comments(after: $cursor, first: $count, orderby: "date") @connection(
          key: "FeedbackFragment_comments"
          dynamicKey_UNSTABLE: $commentsKey
          filters: ["orderby"]
        ) {
          edges {
            node {
              id
            }
          }
        }
      }
    `));
    const variables = {
      id: '<feedbackid>',
      commentsKey: '<comments>',
    };
    operation = createOperationDescriptor(query, variables);

    complete = jest.fn();
    error = jest.fn();
    next = jest.fn();
    callbacks = {complete, error, next};
    fetch = jest.fn((_query, _variables, _cacheConfig) => {
      return RelayObservable.create(sink => {
        dataSource = sink;
      });
    });
    source = RelayRecordSource.create();
    store = new RelayModernStore(source);
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(fetch),
      store,
    });
  });

  afterEach(() => {
    RelayFeatureFlags.ENABLE_VARIABLE_CONNECTION_KEY = false;
  });

  it('publishes initial results to the store', () => {
    const operationSnapshot = environment.lookup(operation.fragment);
    const operationCallback = jest.fn();
    environment.subscribe(operationSnapshot, operationCallback);

    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        node: {
          __typename: 'Feedback',
          id: '<feedbackid>',
          comments: {
            edges: [
              {
                cursor: 'cursor-1',
                node: {
                  __typename: 'Comment',
                  id: 'node-1',
                },
              },
              {
                cursor: 'cursor-2',
                node: {
                  __typename: 'Comment',
                  id: 'node-2',
                },
              },
            ],
            pageInfo: {
              hasNextPage: true,
              endCursor: 'cursor-2',
            },
          },
        },
      },
    };
    dataSource.next(payload);
    jest.runAllTimers();

    expect(operationCallback).toBeCalledTimes(1);
    const nextOperationSnapshot = operationCallback.mock.calls[0][0];
    expect(nextOperationSnapshot.isMissingData).toBe(false);
    expect(nextOperationSnapshot.data).toEqual({
      node: {
        __id: '<feedbackid>',

        __fragments: {
          FeedbackFragment: {},
        },

        __fragmentOwner: operation.request,
      },
    });

    const selector = nullthrows(
      getSingularSelector(fragment, nextOperationSnapshot.data?.node),
    );
    const snapshot = environment.lookup(selector);
    expect(snapshot.isMissingData).toBe(false);
    expect(snapshot.data).toEqual({
      id: '<feedbackid>',
      comments: {
        edges: [
          {cursor: 'cursor-1', node: {id: 'node-1', __typename: 'Comment'}},
          {cursor: 'cursor-2', node: {id: 'node-2', __typename: 'Comment'}},
        ],
        pageInfo: {
          hasNextPage: true,
          endCursor: 'cursor-2',
        },
      },
    });
  });

  describe('after initial data has been fetched and subscribed', () => {
    let callback;

    beforeEach(() => {
      environment.execute({operation}).subscribe(callbacks);
      const payload = {
        data: {
          node: {
            __typename: 'Feedback',
            id: '<feedbackid>',
            comments: {
              edges: [
                {
                  cursor: 'cursor-1',
                  node: {
                    __typename: 'Comment',
                    id: 'node-1',
                  },
                },
                {
                  cursor: 'cursor-2',
                  node: {
                    __typename: 'Comment',
                    id: 'node-2',
                  },
                },
              ],
              pageInfo: {
                hasNextPage: true,
                endCursor: 'cursor-2',
              },
            },
          },
        },
      };
      dataSource.next(payload);
      dataSource.complete();
      fetch.mockClear();
      jest.runAllTimers();

      const operationSnapshot = environment.lookup(operation.fragment);

      const selector = nullthrows(
        getSingularSelector(fragment, operationSnapshot.data?.node),
      );
      const snapshot = environment.lookup(selector);
      callback = jest.fn();
      environment.subscribe(snapshot, callback);
    });

    it('updates when paginated with the same dynamic key value', () => {
      const paginationOperation = createOperationDescriptor(paginationQuery, {
        id: '<feedbackid>',
        commentsKey: '<comments>',
        count: 2,
        cursor: 'cursor-2',
      });
      environment.execute({operation: paginationOperation}).subscribe({});
      const paginationPayload = {
        data: {
          node: {
            __typename: 'Feedback',
            id: '<feedbackid>',
            comments: {
              edges: [
                {
                  cursor: 'cursor-3',
                  node: {
                    __typename: 'Comment',
                    id: 'node-3',
                  },
                },
                {
                  cursor: 'cursor-4',
                  node: {
                    __typename: 'Comment',
                    id: 'node-4',
                  },
                },
              ],
              pageInfo: {
                hasNextPage: true,
                endCursor: 'cursor-4',
              },
            },
          },
        },
      };
      dataSource.next(paginationPayload);
      jest.runAllTimers();

      expect(callback).toBeCalledTimes(1);
      const nextSnapshot = callback.mock.calls[0][0];
      expect(nextSnapshot.isMissingData).toBe(false);
      expect(nextSnapshot.data).toEqual({
        id: '<feedbackid>',
        comments: {
          edges: [
            {cursor: 'cursor-1', node: {id: 'node-1', __typename: 'Comment'}},
            {cursor: 'cursor-2', node: {id: 'node-2', __typename: 'Comment'}},
            {cursor: 'cursor-3', node: {id: 'node-3', __typename: 'Comment'}},
            {cursor: 'cursor-4', node: {id: 'node-4', __typename: 'Comment'}},
          ],
          pageInfo: {
            hasNextPage: true,
            endCursor: 'cursor-4',
          },
        },
      });
    });

    it('does not update when paginated with a different dynamic key', () => {
      const paginationOperation = createOperationDescriptor(paginationQuery, {
        id: '<feedbackid>',
        commentsKey: '<other-comments>', // different key
        count: 2,
        cursor: 'cursor-2',
      });
      environment.execute({operation: paginationOperation}).subscribe({});
      const paginationPayload = {
        data: {
          node: {
            __typename: 'Feedback',
            id: '<feedbackid>',
            comments: {
              edges: [
                {
                  cursor: 'cursor-3',
                  node: {
                    __typename: 'Comment',
                    id: 'node-3',
                  },
                },
                {
                  cursor: 'cursor-4',
                  node: {
                    __typename: 'Comment',
                    id: 'node-4',
                  },
                },
              ],
              pageInfo: {
                hasNextPage: true,
                endCursor: 'cursor-4',
              },
            },
          },
        },
      };
      dataSource.next(paginationPayload);
      jest.runAllTimers();

      expect(callback).toBeCalledTimes(0);
    });
  });
});

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

const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernStore = require('../RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const RelayRecordSource = require('../RelayRecordSource');

const nullthrows = require('nullthrows');

const {getHandleStorageKey} = require('../../store/RelayStoreUtils');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {getSingularSelector} = require('../RelayModernSelector');
const {generateAndCompile} = require('relay-test-utils-internal');

describe('@connection', () => {
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

    ({
      FeedbackQuery: query,
      FeedbackFragment: fragment,
      PaginationQuery: paginationQuery,
    } = generateAndCompile(`
      query FeedbackQuery($id: ID!) {
        node(id: $id) {
          ...FeedbackFragment
        }
      }

      query PaginationQuery(
        $id: ID!
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

    it('updates when paginated', () => {
      const paginationOperation = createOperationDescriptor(paginationQuery, {
        id: '<feedbackid>',
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

    it('updates when paginated if the connection field is unset but the record exists', () => {
      const variables = {
        id: '<feedbackid>',
        count: 2,
        cursor: 'cursor-2',
      };
      environment.commitUpdate(storeProxy => {
        const handleField = paginationQuery.operation.selections
          .find(
            selection =>
              selection.kind === 'LinkedField' && selection.name === 'node',
          )
          .selections.find(
            selection =>
              selection.kind === 'InlineFragment' &&
              selection.type === 'Feedback',
          )
          .selections.find(
            selection =>
              selection.kind === 'LinkedHandle' &&
              selection.name === 'comments',
          );
        expect(handleField).toBeTruthy();
        const handleKey = getHandleStorageKey(handleField, variables);
        const feedback = storeProxy.get('<feedbackid>');
        expect(feedback).toBeTruthy();
        if (feedback != null) {
          feedback.setValue(null, handleKey);
        }
      });
      expect(callback).toBeCalledTimes(1);
      const nextSnapshot = callback.mock.calls[0][0];
      expect(nextSnapshot.isMissingData).toBe(false);
      expect(nextSnapshot.data).toEqual({
        id: '<feedbackid>',
        comments: null,
      });

      const paginationOperation = createOperationDescriptor(
        paginationQuery,
        variables,
      );
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

      expect(callback).toBeCalledTimes(2);
      const nextSnapshot2 = callback.mock.calls[1][0];
      expect(nextSnapshot2.isMissingData).toBe(false);
      expect(nextSnapshot2.data).toEqual({
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
  });
});

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 * @emails oncall+relay
 */

'use strict';

const RelayConnectionHandler = require('../../handlers/connection/RelayConnectionHandler');
const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernOperationDescriptor = require('../RelayModernOperationDescriptor');
const RelayModernStore = require('../RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const RelayRecordSource = require('../RelayRecordSource');
const RelayViewerHandler = require('../../handlers/viewer/RelayViewerHandler');

const {generateAndCompile, matchers} = require('relay-test-utils-internal');

const {VIEWER_ID} = RelayViewerHandler;

function createOperationDescriptor(...args) {
  const operation = RelayModernOperationDescriptor.createOperationDescriptor(
    ...args,
  );
  // For convenience of the test output, override toJSON to print
  // a more succint description of the operation.
  // $FlowFixMe
  operation.toJSON = () => {
    return {
      name: operation.fragment.node.name,
      variables: operation.variables,
    };
  };
  return operation;
}

describe('execute() fetches a @stream-ed @connection', () => {
  let callback;
  let callbacks;
  let complete;
  let dataSource;
  let environment;
  let error;
  let feedFragment;
  let fetch;
  let next;
  let operation;
  let query;
  let selector;
  let source;
  let store;
  let variables;

  beforeEach(() => {
    jest.resetModules();
    jest.mock('warning');
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect.extend(matchers);

    ({FeedQuery: query, FeedFragment: feedFragment} = generateAndCompile(`
        query FeedQuery($enableStream: Boolean!, $after: ID) {
          viewer {
            ...FeedFragment
          }
        }

        fragment FeedFragment on Viewer {
          newsFeed(first: 10, after: $after)
          @stream_connection(
            key: "RelayModernEnvironment_newsFeed"
            label: "newsFeed"
            if: $enableStream
            initial_count: 0
          ) {
            edges {
              cursor
              node {
                __typename
                id
                feedback {
                  id
                  actors {
                    id
                    name @__clientField(handle: "name_handler")
                  }
                }
              }
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }

        fragment FeedEdgeFragment on NewsFeedEdge {
          cursor
          node {
            id
            feedback {
              id
            }
          }
        }
      `));
    variables = {enableStream: true, after: null};
    operation = createOperationDescriptor(query, variables);
    selector = {
      dataID: VIEWER_ID,
      node: feedFragment,
      variables,
    };

    const NameHandler = {
      update(storeProxy, payload) {
        const record = storeProxy.get(payload.dataID);
        if (record != null) {
          const markup = record.getValue(payload.fieldKey);
          record.setValue(
            typeof markup === 'string' ? markup.toUpperCase() : null,
            payload.handleKey,
          );
        }
      },
    };

    complete = jest.fn();
    error = jest.fn();
    next = jest.fn();
    callbacks = {complete, error, next};
    fetch = (_query, _variables, _cacheConfig) => {
      return RelayObservable.create(sink => {
        dataSource = sink;
      });
    };
    source = RelayRecordSource.create();
    store = new RelayModernStore(source);
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(fetch),
      store,
      handlerProvider: name => {
        switch (name) {
          case 'name_handler':
            return NameHandler;
          case 'connection':
            return RelayConnectionHandler;
        }
      },
    });
  });

  it('initializes the connection with the first edge (0 => 1 edges)', () => {
    const initialSnapshot = environment.lookup(selector);
    callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        viewer: {
          newsFeed: {
            edges: [],
          },
        },
      },
    });
    jest.runAllTimers();
    next.mockClear();
    callback.mockClear();

    dataSource.next({
      data: {
        cursor: 'cursor-1',
        node: {
          __typename: 'Story',
          id: '1',
          feedback: {
            id: 'feedback-1',
            actors: [
              {
                id: 'actor-1',
                __typename: 'User',
                name: 'Alice',
              },
            ],
          },
        },
      },
      label: 'FeedFragment$stream$newsFeed',
      path: ['viewer', 'newsFeed', 'edges', 0],
    });
    expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
    expect(next).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);
    const snapshot = callback.mock.calls[0][0];
    expect(snapshot.isMissingData).toBe(false);
    expect(snapshot.data).toEqual({
      newsFeed: {
        edges: [
          {
            cursor: 'cursor-1',
            node: {
              __typename: 'Story',
              id: '1',
              feedback: {
                id: 'feedback-1',
                actors: [{id: 'actor-1', name: 'ALICE'}],
              },
            },
          },
        ],
        pageInfo: {
          endCursor: null,
          hasNextPage: false,
        },
      },
    });

    dataSource.next({
      data: {
        pageInfo: {
          endCursor: 'cursor-1',
          hasNextPage: true,
        },
      },
      label: 'FeedFragment$defer$newsFeed$pageInfo',
      path: ['viewer', 'newsFeed'],
    });
    expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
    expect(callback).toBeCalledTimes(2);
    const snapshot2 = callback.mock.calls[1][0];
    expect(snapshot2.isMissingData).toBe(false);
    expect(snapshot2.data).toEqual({
      newsFeed: {
        edges: [
          {
            cursor: 'cursor-1',
            node: {
              __typename: 'Story',
              id: '1',
              feedback: {
                id: 'feedback-1',
                actors: [{id: 'actor-1', name: 'ALICE'}],
              },
            },
          },
        ],
        pageInfo: {
          endCursor: 'cursor-1',
          hasNextPage: true,
        },
      },
    });
  });

  it('initializes the connection with subsequent edges (1 => 2 edges)', () => {
    const initialSnapshot = environment.lookup(selector);
    callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        viewer: {
          newsFeed: {
            edges: [],
          },
        },
      },
    });
    jest.runAllTimers();
    next.mockClear();
    callback.mockClear();

    // first edge
    dataSource.next({
      data: {
        cursor: 'cursor-1',
        node: {
          __typename: 'Story',
          id: '1',
          feedback: {
            id: 'feedback-1',
            actors: [
              {
                id: 'actor-1',
                __typename: 'User',
                name: 'Alice',
              },
            ],
          },
        },
      },
      label: 'FeedFragment$stream$newsFeed',
      path: ['viewer', 'newsFeed', 'edges', 0],
    });
    // second edge should be appended, not replace first edge
    dataSource.next({
      data: {
        cursor: 'cursor-2',
        node: {
          __typename: 'Story',
          id: '2',
          feedback: {
            id: 'feedback-2',
            actors: [
              {
                id: 'actor-2',
                __typename: 'User',
                name: 'Bob',
              },
            ],
          },
        },
      },
      label: 'FeedFragment$stream$newsFeed',
      path: ['viewer', 'newsFeed', 'edges', 1],
    });
    expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
    expect(next).toBeCalledTimes(2);
    expect(callback).toBeCalledTimes(2);
    const snapshot = callback.mock.calls[1][0];
    expect(snapshot.isMissingData).toBe(false);
    expect(snapshot.data).toEqual({
      newsFeed: {
        edges: [
          {
            cursor: 'cursor-1',
            node: {
              __typename: 'Story',
              id: '1',
              feedback: {
                id: 'feedback-1',
                actors: [{id: 'actor-1', name: 'ALICE'}],
              },
            },
          },
          {
            cursor: 'cursor-2',
            node: {
              __typename: 'Story',
              id: '2',
              feedback: {
                id: 'feedback-2',
                actors: [{id: 'actor-2', name: 'BOB'}],
              },
            },
          },
        ],
        pageInfo: {
          endCursor: null,
          hasNextPage: false,
        },
      },
    });
  });

  it('initializes the connection with subsequent edges (1 => 2 edges) when initial_count=1', () => {
    const initialSnapshot = environment.lookup(selector);
    callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        viewer: {
          newsFeed: {
            edges: [
              {
                cursor: 'cursor-1',
                node: {
                  __typename: 'Story',
                  id: '1',
                  feedback: {
                    id: 'feedback-1',
                    actors: [
                      {
                        id: 'actor-1',
                        __typename: 'User',
                        name: 'Alice',
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
      },
    });
    jest.runAllTimers();
    next.mockClear();
    callback.mockClear();

    // second edge should be appended, not replace first edge
    dataSource.next({
      data: {
        cursor: 'cursor-2',
        node: {
          __typename: 'Story',
          id: '2',
          feedback: {
            id: 'feedback-2',
            actors: [
              {
                id: 'actor-2',
                __typename: 'User',
                name: 'Bob',
              },
            ],
          },
        },
      },
      label: 'FeedFragment$stream$newsFeed',
      path: ['viewer', 'newsFeed', 'edges', 1],
    });
    expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
    expect(next).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);
    const snapshot = callback.mock.calls[0][0];
    expect(snapshot.isMissingData).toBe(false);
    expect(snapshot.data).toEqual({
      newsFeed: {
        edges: [
          {
            cursor: 'cursor-1',
            node: {
              __typename: 'Story',
              id: '1',
              feedback: {
                id: 'feedback-1',
                actors: [{id: 'actor-1', name: 'ALICE'}],
              },
            },
          },
          {
            cursor: 'cursor-2',
            node: {
              __typename: 'Story',
              id: '2',
              feedback: {
                id: 'feedback-2',
                actors: [{id: 'actor-2', name: 'BOB'}],
              },
            },
          },
        ],
        pageInfo: {
          endCursor: null,
          hasNextPage: false,
        },
      },
    });
  });

  it('initializes the connection with subsequent edges (0 => 2 edges) when edges arrive out of order', () => {
    const initialSnapshot = environment.lookup(selector);
    callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        viewer: {
          newsFeed: {
            edges: [],
          },
        },
      },
    });
    jest.runAllTimers();
    next.mockClear();
    callback.mockClear();

    // second edge arrives first
    dataSource.next({
      data: {
        cursor: 'cursor-2',
        node: {
          __typename: 'Story',
          id: '2',
          feedback: {
            id: 'feedback-2',
            actors: [
              {
                id: 'actor-2',
                __typename: 'User',
                name: 'Bob',
              },
            ],
          },
        },
      },
      label: 'FeedFragment$stream$newsFeed',
      path: ['viewer', 'newsFeed', 'edges', 1],
    });
    // first edge arrives second
    dataSource.next({
      data: {
        cursor: 'cursor-1',
        node: {
          __typename: 'Story',
          id: '1',
          feedback: {
            id: 'feedback-1',
            actors: [
              {
                id: 'actor-1',
                __typename: 'User',
                name: 'Alice',
              },
            ],
          },
        },
      },
      label: 'FeedFragment$stream$newsFeed',
      path: ['viewer', 'newsFeed', 'edges', 0],
    });
    expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
    expect(next).toBeCalledTimes(2);
    expect(callback).toBeCalledTimes(2);
    const snapshot = callback.mock.calls[1][0];
    expect(snapshot.isMissingData).toBe(false);
    expect(snapshot.data).toEqual({
      newsFeed: {
        edges: [
          {
            cursor: 'cursor-1',
            node: {
              __typename: 'Story',
              id: '1',
              feedback: {
                id: 'feedback-1',
                actors: [{id: 'actor-1', name: 'ALICE'}],
              },
            },
          },
          {
            cursor: 'cursor-2',
            node: {
              __typename: 'Story',
              id: '2',
              feedback: {
                id: 'feedback-2',
                actors: [{id: 'actor-2', name: 'BOB'}],
              },
            },
          },
        ],
        pageInfo: {
          endCursor: null,
          hasNextPage: false,
        },
      },
    });
  });

  it('updates the connection on forward pagination with new edges (when initial data has pageInfo)', () => {
    // populate the first "page" of results (one item) using the query
    // with streaming disabled
    variables = {enableStream: false, after: 'cursor-1'};
    operation = createOperationDescriptor(query, variables);
    environment.execute({operation}).subscribe({});
    dataSource.next({
      data: {
        viewer: {
          newsFeed: {
            edges: [
              {
                cursor: 'cursor-1',
                node: {
                  __typename: 'Story',
                  id: '1',
                  feedback: {
                    id: 'feedback-1',
                    actors: [
                      {
                        id: 'actor-1',
                        __typename: 'User',
                        name: 'Alice',
                      },
                    ],
                  },
                },
              },
            ],
            pageInfo: {
              hasNextPage: true,
              endCursor: 'cursor-1',
            },
          },
        },
      },
    });
    dataSource.complete();
    jest.runAllTimers();
    complete.mockClear();
    error.mockClear();
    next.mockClear();

    const initialSnapshot = environment.lookup(selector);
    callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    // fetch the second page of results with streaming enabled
    variables = {enableStream: true, after: 'cursor-1'};
    operation = createOperationDescriptor(query, variables);
    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        viewer: {
          newsFeed: {
            edges: [],
          },
        },
      },
    });
    jest.runAllTimers();
    next.mockClear();
    callback.mockClear();

    // second edge should be appended, not replace first edge
    dataSource.next({
      data: {
        cursor: 'cursor-2',
        node: {
          __typename: 'Story',
          id: '2',
          feedback: {
            id: 'feedback-2',
            actors: [
              {
                id: 'actor-2',
                __typename: 'User',
                name: 'Bob',
              },
            ],
          },
        },
      },
      label: 'FeedFragment$stream$newsFeed',
      path: ['viewer', 'newsFeed', 'edges', 0],
    });
    // third edge should be appended, not replace first edge
    dataSource.next({
      data: {
        cursor: 'cursor-3',
        node: {
          __typename: 'Story',
          id: '3',
          feedback: {
            id: 'feedback-3',
            actors: [
              {
                id: 'actor-3',
                __typename: 'User',
                name: 'Claire',
              },
            ],
          },
        },
      },
      label: 'FeedFragment$stream$newsFeed',
      path: ['viewer', 'newsFeed', 'edges', 1],
    });
    expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
    expect(next).toBeCalledTimes(2);
    expect(callback).toBeCalledTimes(2);
    const snapshot = callback.mock.calls[0][0];
    expect(snapshot.isMissingData).toBe(false);
    expect(snapshot.data).toEqual({
      newsFeed: {
        edges: [
          {
            cursor: 'cursor-1',
            node: {
              __typename: 'Story',
              id: '1',
              feedback: {
                id: 'feedback-1',
                actors: [{id: 'actor-1', name: 'ALICE'}],
              },
            },
          },
          {
            cursor: 'cursor-2',
            node: {
              __typename: 'Story',
              id: '2',
              feedback: {
                id: 'feedback-2',
                actors: [{id: 'actor-2', name: 'BOB'}],
              },
            },
          },
        ],
        pageInfo: {
          endCursor: 'cursor-1',
          hasNextPage: true,
        },
      },
    });
    const snapshot2 = callback.mock.calls[1][0];
    expect(snapshot2.isMissingData).toBe(false);
    expect(snapshot2.data).toEqual({
      newsFeed: {
        edges: [
          {
            cursor: 'cursor-1',
            node: {
              __typename: 'Story',
              id: '1',
              feedback: {
                id: 'feedback-1',
                actors: [{id: 'actor-1', name: 'ALICE'}],
              },
            },
          },
          {
            cursor: 'cursor-2',
            node: {
              __typename: 'Story',
              id: '2',
              feedback: {
                id: 'feedback-2',
                actors: [{id: 'actor-2', name: 'BOB'}],
              },
            },
          },
          {
            cursor: 'cursor-3',
            node: {
              __typename: 'Story',
              id: '3',
              feedback: {
                id: 'feedback-3',
                actors: [{id: 'actor-3', name: 'CLAIRE'}],
              },
            },
          },
        ],
        pageInfo: {
          endCursor: 'cursor-1',
          hasNextPage: true,
        },
      },
    });

    dataSource.next({
      data: {
        pageInfo: {
          endCursor: 'cursor-3', // cursor-1 => cursor-3
          hasNextPage: false, // true => false
        },
      },
      label: 'FeedFragment$defer$newsFeed$pageInfo',
      path: ['viewer', 'newsFeed'],
    });
    expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
    expect(callback).toBeCalledTimes(3);
    const snapshot3 = callback.mock.calls[2][0];
    expect(snapshot3.isMissingData).toBe(false);
    expect(snapshot3.data).toEqual({
      newsFeed: {
        edges: [
          {
            cursor: 'cursor-1',
            node: {
              __typename: 'Story',
              id: '1',
              feedback: {
                id: 'feedback-1',
                actors: [{id: 'actor-1', name: 'ALICE'}],
              },
            },
          },
          {
            cursor: 'cursor-2',
            node: {
              __typename: 'Story',
              id: '2',
              feedback: {
                id: 'feedback-2',
                actors: [{id: 'actor-2', name: 'BOB'}],
              },
            },
          },
          {
            cursor: 'cursor-3',
            node: {
              __typename: 'Story',
              id: '3',
              feedback: {
                id: 'feedback-3',
                actors: [{id: 'actor-3', name: 'CLAIRE'}],
              },
            },
          },
        ],
        pageInfo: {
          endCursor: 'cursor-3',
          hasNextPage: false,
        },
      },
    });
  });

  it('does not update the connection on forward pagination when initial data was missing pageInfo', () => {
    // populate the first "page" of results (one item)
    environment.execute({operation}).subscribe({});
    dataSource.next({
      data: {
        viewer: {
          newsFeed: {
            edges: [
              {
                cursor: 'cursor-1',
                node: {
                  __typename: 'Story',
                  id: '1',
                  feedback: {
                    id: 'feedback-1',
                    actors: [
                      {
                        id: 'actor-1',
                        __typename: 'User',
                        name: 'Alice',
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
      },
    });
    dataSource.complete();
    jest.runAllTimers();
    complete.mockClear();
    error.mockClear();
    next.mockClear();

    const initialSnapshot = environment.lookup(selector);
    callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    // fetch the second page of results
    variables = {enableStream: true, after: 'cursor-1'};
    operation = createOperationDescriptor(query, variables);
    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        viewer: {
          newsFeed: {
            edges: [],
          },
        },
      },
    });
    jest.runAllTimers();
    next.mockClear();
    callback.mockClear();

    // second edge is ignored
    dataSource.next({
      data: {
        cursor: 'cursor-2',
        node: {
          __typename: 'Story',
          id: '2',
          feedback: {
            id: 'feedback-2',
            actors: [
              {
                id: 'actor-2',
                __typename: 'User',
                name: 'Bob',
              },
            ],
          },
        },
      },
      label: 'FeedFragment$stream$newsFeed',
      path: ['viewer', 'newsFeed', 'edges', 0],
    });
    expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
    expect(next).toBeCalledTimes(1);
    // connection not updated with new edge, the after cursor doesn't match
    // pageInfo.endCursor
    expect(callback).toBeCalledTimes(0);
  });
});

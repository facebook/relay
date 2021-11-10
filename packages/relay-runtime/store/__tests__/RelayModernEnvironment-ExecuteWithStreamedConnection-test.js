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
import type {
  Variables,
  CacheConfig,
} from 'relay-runtime/util/RelayRuntimeTypes';
import type {RequestParameters} from 'relay-runtime/util/RelayConcreteNode';
import type {
  RecordSourceProxy,
  HandleFieldPayload,
} from 'relay-runtime/store/RelayStoreTypes';

const ConnectionHandler = require('../../handlers/connection/ConnectionHandler');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const {getFragment, getRequest, graphql} = require('../../query/GraphQLTag');
const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {createReaderSelector} = require('../RelayModernSelector');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const {VIEWER_ID} = require('../ViewerPattern');
const {disallowWarnings, expectToWarn} = require('relay-test-utils-internal');

disallowWarnings();

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
    query = getRequest(graphql`
      query RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedQuery(
        $enableStream: Boolean!
        $after: ID
      ) {
        viewer {
          ...RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment
        }
      }
    `);

    feedFragment = getFragment(graphql`
      fragment RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment on Viewer {
        newsFeed(first: 10, after: $after)
          @stream_connection(
            key: "RelayModernEnvironment_newsFeed"
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
    `);
    variables = {enableStream: true, after: null};
    operation = createOperationDescriptor(query, variables);
    selector = createReaderSelector(
      feedFragment,
      VIEWER_ID,
      variables,
      operation.request,
    );

    const NameHandler = {
      update(storeProxy: RecordSourceProxy, payload: HandleFieldPayload) {
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
    fetch = (
      _query: RequestParameters,
      _variables: Variables,
      _cacheConfig: CacheConfig,
    ) => {
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
            return ConnectionHandler;
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
      label:
        'RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$stream$RelayModernEnvironment_newsFeed',
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
      label:
        'RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$defer$RelayModernEnvironment_newsFeed$pageInfo',
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
      label:
        'RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$stream$RelayModernEnvironment_newsFeed',
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
      label:
        'RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$stream$RelayModernEnvironment_newsFeed',
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
      label:
        'RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$stream$RelayModernEnvironment_newsFeed',
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

  it('initializes the connection with subsequent edges (1 => 3 edges) when initial_count=1 with batch response', () => {
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
    dataSource.next([
      {
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
        label:
          'RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$stream$RelayModernEnvironment_newsFeed',
        path: ['viewer', 'newsFeed', 'edges', 1],
      },
      {
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
                  name: 'Clair',
                },
              ],
            },
          },
        },
        label:
          'RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$stream$RelayModernEnvironment_newsFeed',
        path: ['viewer', 'newsFeed', 'edges', 2],
      },
    ]);
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
          {
            cursor: 'cursor-3',
            node: {
              __typename: 'Story',
              id: '3',
              feedback: {
                id: 'feedback-3',
                actors: [{id: 'actor-3', name: 'CLAIR'}],
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

  it('initializes the connection with subsequent edges (0 => 2 edges) when edges arrive out of order with batching', () => {
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
      label:
        'RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$stream$RelayModernEnvironment_newsFeed',
      path: ['viewer', 'newsFeed', 'edges', 1],
    });
    // first edge arrives second
    dataSource.next([
      {
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
                  name: 'Clair',
                },
              ],
            },
          },
        },
        label:
          'RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$stream$RelayModernEnvironment_newsFeed',
        path: ['viewer', 'newsFeed', 'edges', 2],
      },
      {
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
        label:
          'RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$stream$RelayModernEnvironment_newsFeed',
        path: ['viewer', 'newsFeed', 'edges', 0],
      },
    ]);
    expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
    expect(next).toBeCalledTimes(2);
    expect(callback).toBeCalledTimes(2);
    const snapshot1 = callback.mock.calls[0][0];
    expect(snapshot1.isMissingData).toBe(false);
    expect(snapshot1.data).toEqual({
      newsFeed: {
        edges: [
          undefined,
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
                actors: [{id: 'actor-3', name: 'CLAIR'}],
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
      label:
        'RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$stream$RelayModernEnvironment_newsFeed',
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
      label:
        'RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$stream$RelayModernEnvironment_newsFeed',
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
      label:
        'RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$stream$RelayModernEnvironment_newsFeed',
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
      label:
        'RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$stream$RelayModernEnvironment_newsFeed',
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
      label:
        'RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$defer$RelayModernEnvironment_newsFeed$pageInfo',
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
    expectToWarn(
      'Relay: Unexpected after cursor `cursor-1`, edges must be fetched from the end of the list (`null`).',
      () => {
        dataSource.next({
          data: {
            viewer: {
              newsFeed: {
                edges: [],
              },
            },
          },
        });
      },
    );
    jest.runAllTimers();
    next.mockClear();
    callback.mockClear();

    expectToWarn(
      'Relay: Unexpected after cursor `cursor-1`, edges must be fetched from the end of the list (`null`).',
      () => {
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
          label:
            'RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$stream$RelayModernEnvironment_newsFeed',
          path: ['viewer', 'newsFeed', 'edges', 0],
        });
      },
    );
    expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
    expect(next).toBeCalledTimes(1);
    // connection not updated with new edge, the after cursor doesn't match
    // pageInfo.endCursor
    expect(callback).toBeCalledTimes(0);
  });

  it('warns if executed in non-streaming mode and initializes the connection', () => {
    const initialSnapshot = environment.lookup(selector);
    callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    expectToWarn(
      'RelayModernEnvironment: Operation `RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedQuery` contains @defer/@stream directives but was executed in non-streaming mode. See https://fburl.com/relay-incremental-delivery-non-streaming-warning.',
      () => {
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
                  endCursor: 'cursor-1',
                  hasNextPage: true,
                },
              },
            },
          },
          extensions: {
            is_final: true,
          },
        });
      },
    );
    jest.runAllTimers();

    expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
    expect(next).toBeCalledTimes(1);
    const snapshot = callback.mock.calls[0][0];
    expect(callback).toBeCalledTimes(1);
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
          endCursor: 'cursor-1', // updated
          hasNextPage: true, // updated
        },
      },
    });
  });

  it('does not garbage collect the server connection when a pagination query is in flight', () => {
    environment.retain(operation);
    const initialSnapshot = environment.lookup(selector);
    callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    // populate the first "page" of results (one item) using the query
    // with streaming disabled
    variables = {enableStream: false, after: null};
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
    next.mockClear();
    callback.mockClear();

    // Start pagination query
    const paginationOperation = createOperationDescriptor(query, {
      enableStream: true,
      after: 'cursor-1',
    });
    environment.execute({operation: paginationOperation}).subscribe(callbacks);
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

    // Triggers a GC
    store.scheduleGC();
    jest.runAllTimers();

    // Second edge should be appended correctly
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
      label:
        'RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$stream$RelayModernEnvironment_newsFeed',
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
  });
});

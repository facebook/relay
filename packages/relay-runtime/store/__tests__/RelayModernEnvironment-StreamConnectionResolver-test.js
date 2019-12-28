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

const RelayConnectionResolver = require('../RelayConnectionResolver');
const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernStore = require('../RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const RelayRecordSource = require('../RelayRecordSource');

const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {createReaderSelector} = require('../RelayModernSelector');
const {VIEWER_ID} = require('../ViewerPattern');
const {generateAndCompile} = require('relay-test-utils-internal');

describe('execute() fetches a @stream-ed @connection', () => {
  let callback;
  let callbacks;
  let complete;
  let dataSource;
  let enableConnectionResolvers;
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

    enableConnectionResolvers = RelayFeatureFlags.ENABLE_CONNECTION_RESOLVERS;
    RelayFeatureFlags.ENABLE_CONNECTION_RESOLVERS = true;

    ({FeedQuery: query, FeedFragment: feedFragment} = generateAndCompile(`
        query FeedQuery($enableStream: Boolean!, $after: ID) {
          viewer {
            ...FeedFragment
          }
        }

        fragment FeedFragment on Viewer {
          newsFeed(first: 10, after: $after)
          @stream_connection_resolver(
            label: "FeedFragment"
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
                    name
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
    selector = createReaderSelector(
      feedFragment,
      VIEWER_ID,
      variables,
      operation.request,
    );

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
    });
  });

  afterEach(() => {
    RelayFeatureFlags.ENABLE_CONNECTION_RESOLVERS = enableConnectionResolvers;
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
    expect(callback).toBeCalledTimes(1);
    const connectionSnapshot = environment
      .getStore()
      .lookupConnection_UNSTABLE(
        (callback.mock.calls[0][0].data: $FlowFixMe).newsFeed.__connection,
        RelayConnectionResolver,
      );
    const connectionCallback = jest.fn();
    environment
      .getStore()
      .subscribeConnection_UNSTABLE(
        connectionSnapshot,
        RelayConnectionResolver,
        connectionCallback,
      );
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
      label: 'FeedFragment$stream$FeedFragment',
      path: ['viewer', 'newsFeed', 'edges', 0],
    });
    expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
    expect(next).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(0);
    expect(connectionCallback).toBeCalledTimes(1);
    const snapshot = connectionCallback.mock.calls[0][0];
    expect(snapshot.state.edges).toEqual([
      {
        __id: 'client:root:viewer:newsFeed:__connection_page(first:10):edges:0',
        cursor: 'cursor-1',
        node: {
          __id: '1',
          __typename: 'Story',
          id: '1',
          feedback: {
            id: 'feedback-1',
            actors: [{id: 'actor-1', name: 'Alice'}],
          },
        },
      },
    ]);
    expect(snapshot.state.pageInfo).toEqual({
      endCursor: 'cursor-1',
      hasNextPage: null,
      hasPrevPage: null,
      startCursor: null,
    });

    dataSource.next({
      data: {
        pageInfo: {
          endCursor: 'cursor-1',
          hasNextPage: true,
        },
      },
      label: 'FeedFragment$defer$FeedFragment',
      path: ['viewer', 'newsFeed'],
    });
    expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
    expect(callback).toBeCalledTimes(0);
    expect(connectionCallback).toBeCalledTimes(2);
    const snapshot2 = connectionCallback.mock.calls[1][0];
    expect(snapshot2.state.edges).toEqual([
      {
        __id: 'client:root:viewer:newsFeed:__connection_page(first:10):edges:0',
        cursor: 'cursor-1',
        node: {
          __id: '1',
          __typename: 'Story',
          id: '1',
          feedback: {
            id: 'feedback-1',
            actors: [{id: 'actor-1', name: 'Alice'}],
          },
        },
      },
    ]);
    expect(snapshot2.state.pageInfo).toEqual({
      endCursor: 'cursor-1',
      hasNextPage: true,
      hasPrevPage: null,
      startCursor: null,
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
    expect(callback).toBeCalledTimes(1);
    const connectionSnapshot = environment
      .getStore()
      .lookupConnection_UNSTABLE(
        (callback.mock.calls[0][0].data: $FlowFixMe).newsFeed.__connection,
        RelayConnectionResolver,
      );
    const connectionCallback = jest.fn();
    environment
      .getStore()
      .subscribeConnection_UNSTABLE(
        connectionSnapshot,
        RelayConnectionResolver,
        connectionCallback,
      );
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
      label: 'FeedFragment$stream$FeedFragment',
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
      label: 'FeedFragment$stream$FeedFragment',
      path: ['viewer', 'newsFeed', 'edges', 1],
    });
    expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
    expect(next).toBeCalledTimes(2);
    expect(connectionCallback).toBeCalledTimes(2);
    const snapshot = connectionCallback.mock.calls[1][0];
    expect(snapshot.state.edges).toEqual([
      {
        __id: 'client:root:viewer:newsFeed:__connection_page(first:10):edges:0',
        cursor: 'cursor-1',
        node: {
          __id: '1',
          __typename: 'Story',
          id: '1',
          feedback: {
            id: 'feedback-1',
            actors: [{id: 'actor-1', name: 'Alice'}],
          },
        },
      },
      {
        __id: 'client:root:viewer:newsFeed:__connection_page(first:10):edges:1',
        cursor: 'cursor-2',
        node: {
          __id: '2',
          __typename: 'Story',
          id: '2',
          feedback: {
            id: 'feedback-2',
            actors: [{id: 'actor-2', name: 'Bob'}],
          },
        },
      },
    ]);
    expect(snapshot.state.pageInfo).toEqual({
      endCursor: 'cursor-2',
      hasNextPage: null,
      hasPrevPage: null,
      startCursor: null,
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
    expect(callback).toBeCalledTimes(1);
    const connectionSnapshot = environment
      .getStore()
      .lookupConnection_UNSTABLE(
        (callback.mock.calls[0][0].data: $FlowFixMe).newsFeed.__connection,
        RelayConnectionResolver,
      );
    const connectionCallback = jest.fn();
    environment
      .getStore()
      .subscribeConnection_UNSTABLE(
        connectionSnapshot,
        RelayConnectionResolver,
        connectionCallback,
      );
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
      label: 'FeedFragment$stream$FeedFragment',
      path: ['viewer', 'newsFeed', 'edges', 1],
    });
    expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
    expect(next).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(0);
    expect(connectionCallback).toBeCalledTimes(1);
    const snapshot = connectionCallback.mock.calls[0][0];
    expect(snapshot.state.edges).toEqual([
      {
        __id: 'client:root:viewer:newsFeed:__connection_page(first:10):edges:0',
        cursor: 'cursor-1',
        node: {
          __id: '1',
          __typename: 'Story',
          id: '1',
          feedback: {
            id: 'feedback-1',
            actors: [{id: 'actor-1', name: 'Alice'}],
          },
        },
      },
      {
        __id: 'client:root:viewer:newsFeed:__connection_page(first:10):edges:1',
        cursor: 'cursor-2',
        node: {
          __id: '2',
          __typename: 'Story',
          id: '2',
          feedback: {
            id: 'feedback-2',
            actors: [{id: 'actor-2', name: 'Bob'}],
          },
        },
      },
    ]);
    expect(snapshot.state.pageInfo).toEqual({
      endCursor: 'cursor-2',
      hasNextPage: null,
      hasPrevPage: null,
      startCursor: null,
    });
  });

  it('updates the connection on forward pagination with new edges (when initial data has pageInfo)', () => {
    // populate the first "page" of results (one item) using the query
    // with streaming disabled
    variables = {enableStream: false};
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
    const connectionSnapshot = environment
      .getStore()
      .lookupConnection_UNSTABLE(
        (initialSnapshot.data: $FlowFixMe).newsFeed.__connection,
        RelayConnectionResolver,
      );
    const connectionCallback = jest.fn();
    environment
      .getStore()
      .subscribeConnection_UNSTABLE(
        connectionSnapshot,
        RelayConnectionResolver,
        connectionCallback,
      );

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
      label: 'FeedFragment$stream$FeedFragment',
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
      label: 'FeedFragment$stream$FeedFragment',
      path: ['viewer', 'newsFeed', 'edges', 1],
    });
    expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
    expect(next).toBeCalledTimes(2);
    expect(callback).toBeCalledTimes(0);
    expect(connectionCallback).toBeCalledTimes(2);
    const snapshot = connectionCallback.mock.calls[0][0];
    expect(snapshot.state.edges).toEqual([
      {
        __id: 'client:root:viewer:newsFeed:__connection_page(first:10):edges:0',
        cursor: 'cursor-1',
        node: {
          __id: '1',
          __typename: 'Story',
          id: '1',
          feedback: {
            id: 'feedback-1',
            actors: [{id: 'actor-1', name: 'Alice'}],
          },
        },
      },
      {
        __id:
          'client:root:viewer:newsFeed:__connection_page(after:"cursor-1",first:10):edges:0',
        cursor: 'cursor-2',
        node: {
          __id: '2',
          __typename: 'Story',
          id: '2',
          feedback: {
            id: 'feedback-2',
            actors: [{id: 'actor-2', name: 'Bob'}],
          },
        },
      },
    ]);
    expect(snapshot.state.pageInfo).toEqual({
      endCursor: 'cursor-2',
      hasNextPage: true,
      hasPrevPage: null,
      startCursor: null,
    });
    const snapshot2 = connectionCallback.mock.calls[1][0];
    expect(snapshot2.state.edges).toEqual([
      {
        __id: 'client:root:viewer:newsFeed:__connection_page(first:10):edges:0',
        cursor: 'cursor-1',
        node: {
          __id: '1',
          __typename: 'Story',
          id: '1',
          feedback: {
            id: 'feedback-1',
            actors: [{id: 'actor-1', name: 'Alice'}],
          },
        },
      },
      {
        __id:
          'client:root:viewer:newsFeed:__connection_page(after:"cursor-1",first:10):edges:0',
        cursor: 'cursor-2',
        node: {
          __id: '2',
          __typename: 'Story',
          id: '2',
          feedback: {
            id: 'feedback-2',
            actors: [{id: 'actor-2', name: 'Bob'}],
          },
        },
      },
      {
        __id:
          'client:root:viewer:newsFeed:__connection_page(after:"cursor-1",first:10):edges:1',
        cursor: 'cursor-3',
        node: {
          __id: '3',
          __typename: 'Story',
          id: '3',
          feedback: {
            id: 'feedback-3',
            actors: [{id: 'actor-3', name: 'Claire'}],
          },
        },
      },
    ]);
    expect(snapshot2.state.pageInfo).toEqual({
      endCursor: 'cursor-3',
      hasNextPage: true,
      hasPrevPage: null,
      startCursor: null,
    });

    dataSource.next({
      data: {
        pageInfo: {
          endCursor: 'cursor-3', // cursor-1 => cursor-3
          hasNextPage: false, // true => false
        },
      },
      label: 'FeedFragment$defer$FeedFragment',
      path: ['viewer', 'newsFeed'],
    });
    expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
    expect(connectionCallback).toBeCalledTimes(3);
    const snapshot3 = connectionCallback.mock.calls[2][0];
    expect(snapshot3.state.edges).toEqual([
      {
        __id: 'client:root:viewer:newsFeed:__connection_page(first:10):edges:0',
        cursor: 'cursor-1',
        node: {
          __id: '1',
          __typename: 'Story',
          id: '1',
          feedback: {
            id: 'feedback-1',
            actors: [{id: 'actor-1', name: 'Alice'}],
          },
        },
      },
      {
        __id:
          'client:root:viewer:newsFeed:__connection_page(after:"cursor-1",first:10):edges:0',
        cursor: 'cursor-2',
        node: {
          __id: '2',
          __typename: 'Story',
          id: '2',
          feedback: {
            id: 'feedback-2',
            actors: [{id: 'actor-2', name: 'Bob'}],
          },
        },
      },
      {
        __id:
          'client:root:viewer:newsFeed:__connection_page(after:"cursor-1",first:10):edges:1',
        cursor: 'cursor-3',
        node: {
          __id: '3',
          __typename: 'Story',
          id: '3',
          feedback: {
            id: 'feedback-3',
            actors: [{id: 'actor-3', name: 'Claire'}],
          },
        },
      },
    ]);
    expect(snapshot3.state.pageInfo).toEqual({
      endCursor: 'cursor-3',
      hasNextPage: false,
      hasPrevPage: null,
      startCursor: null,
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
    const connectionSnapshot = environment
      .getStore()
      .lookupConnection_UNSTABLE(
        (initialSnapshot.data: $FlowFixMe).newsFeed.__connection,
        RelayConnectionResolver,
      );
    const connectionCallback = jest.fn();
    environment
      .getStore()
      .subscribeConnection_UNSTABLE(
        connectionSnapshot,
        RelayConnectionResolver,
        connectionCallback,
      );
    callback.mockClear();

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

    // second edge is *not* ignored even though args don't match: streaming
    // appends by default
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
      label: 'FeedFragment$stream$FeedFragment',
      path: ['viewer', 'newsFeed', 'edges', 0],
    });
    expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
    expect(next).toBeCalledTimes(1);
    // connection not updated with new edge, the after cursor doesn't match
    // pageInfo.endCursor
    expect(callback).toBeCalledTimes(0);
    expect(connectionCallback).toBeCalledTimes(1);
    const snapshot = connectionCallback.mock.calls[0][0];
    expect(snapshot.state.edges).toEqual([
      {
        __id: 'client:root:viewer:newsFeed:__connection_page(first:10):edges:0',
        cursor: 'cursor-1',
        node: {
          __id: '1',
          __typename: 'Story',
          id: '1',
          feedback: {
            id: 'feedback-1',
            actors: [{id: 'actor-1', name: 'Alice'}],
          },
        },
      },
      {
        __id:
          'client:root:viewer:newsFeed:__connection_page(after:"cursor-1",first:10):edges:0',
        cursor: 'cursor-2',
        node: {
          __id: '2',
          __typename: 'Story',
          id: '2',
          feedback: {
            id: 'feedback-2',
            actors: [{id: 'actor-2', name: 'Bob'}],
          },
        },
      },
    ]);
    expect(snapshot.state.pageInfo).toEqual({
      endCursor: 'cursor-2',
      hasNextPage: null,
      hasPrevPage: null,
      startCursor: null,
    });
  });

  it('initializes the connection if streaming is disabled', () => {
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
    jest.runAllTimers();
    expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
    expect(next).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);
    const connectionSnapshot = environment
      .getStore()
      .lookupConnection_UNSTABLE(
        (callback.mock.calls[0][0].data: $FlowFixMe).newsFeed.__connection,
        RelayConnectionResolver,
      );
    expect(connectionSnapshot.state.edges).toEqual([
      {
        __id: 'client:root:viewer:newsFeed:__connection_page(first:10):edges:0',
        cursor: 'cursor-1',
        node: {
          __id: '1',
          __typename: 'Story',
          id: '1',
          feedback: {
            id: 'feedback-1',
            actors: [{id: 'actor-1', name: 'Alice'}],
          },
        },
      },
    ]);
    expect(connectionSnapshot.state.pageInfo).toEqual({
      endCursor: 'cursor-1',
      hasNextPage: true,
      hasPrevPage: null,
      startCursor: null,
    });
  });
});

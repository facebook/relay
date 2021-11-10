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
const {
  MultiActorEnvironment,
  getActorIdentifier,
} = require('../../multi-actor-environment');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const {getFragment, getRequest, graphql} = require('../../query/GraphQLTag');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {createReaderSelector} = require('../RelayModernSelector');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const {VIEWER_ID} = require('../ViewerPattern');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

describe.each(['RelayModernEnvironment', 'MultiActorEnvironment'])(
  'execute() fetches a @defer-ed @stream-ed @connection',
  environmentType => {
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

    describe(environmentType, () => {
      beforeEach(() => {
        query = getRequest(graphql`
          query RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedQuery(
            $enableStream: Boolean!
            $after: ID
          ) {
            viewer {
              __typename
              ...RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedFragment
                @defer(label: "FeedFragment")
            }
          }
        `);

        feedFragment = getFragment(graphql`
          fragment RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedFragment on Viewer {
            newsFeed(first: 10, after: $after)
              @connection(key: "RelayModernEnvironment_newsFeed") {
              edges
                @stream(
                  label: "newsFeed"
                  if: $enableStream
                  initial_count: 0
                ) {
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
        const handlerProvider = (
          name:
            | string
            | $TEMPORARY$string<'connection'>
            | $TEMPORARY$string<'name_handler'>,
        ) => {
          switch (name) {
            case 'name_handler':
              return NameHandler;
            case 'connection':
              return ConnectionHandler;
          }
        };
        const multiActorEnvironment = new MultiActorEnvironment({
          createNetworkForActor: _actorID => RelayNetwork.create(fetch),
          createStoreForActor: _actorID => store,
          handlerProvider,
        });
        environment =
          environmentType === 'MultiActorEnvironment'
            ? multiActorEnvironment.forActor(getActorIdentifier('actor:1234'))
            : new RelayModernEnvironment({
                network: RelayNetwork.create(fetch),
                store,
                handlerProvider,
              });
      });

      it('does not initialize the connection with the root payload', () => {
        const initialSnapshot = environment.lookup(selector);
        callback = jest.fn();
        environment.subscribe(initialSnapshot, callback);

        environment.execute({operation}).subscribe(callbacks);
        dataSource.next({
          data: {
            viewer: {
              __typename: 'Viewer',
            },
          },
        });

        expect(next).toBeCalledTimes(1);
        expect(callback).toBeCalledTimes(1);
        const snapshot = callback.mock.calls[0][0];
        expect(snapshot.isMissingData).toBe(true);
        expect(snapshot.data).toEqual({
          newsFeed: undefined,
        });
      });

      it('initializes the connection with the deferred payload', () => {
        const initialSnapshot = environment.lookup(selector);
        callback = jest.fn();
        environment.subscribe(initialSnapshot, callback);

        environment.execute({operation}).subscribe(callbacks);
        dataSource.next({
          data: {
            viewer: {
              __typename: 'Viewer',
            },
          },
        });
        jest.runAllTimers();
        next.mockClear();
        callback.mockClear();

        dataSource.next({
          data: {
            newsFeed: {
              edges: [],
              pageInfo: {
                endCursor: null,
                hasNextPage: false,
              },
            },
          },
          label:
            'RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedQuery$defer$FeedFragment',
          path: ['viewer'],
        });
        expect(next).toBeCalledTimes(1);
        expect(callback).toBeCalledTimes(1);
        const snapshot = callback.mock.calls[0][0];
        expect(snapshot.isMissingData).toBe(false);
        expect(snapshot.data).toEqual({
          newsFeed: {
            edges: [],
            pageInfo: {
              endCursor: null,
              hasNextPage: false,
            },
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
              __typename: 'Viewer',
            },
          },
        });
        dataSource.next({
          data: {
            newsFeed: {
              edges: [],
              pageInfo: {
                endCursor: null,
                hasNextPage: false,
              },
            },
          },
          label:
            'RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedQuery$defer$FeedFragment',
          path: ['viewer'],
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
            'RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedFragment$stream$newsFeed',
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
      });

      it('initializes the connection with subsequent edges (1 => 2 edges)', () => {
        const initialSnapshot = environment.lookup(selector);
        callback = jest.fn();
        environment.subscribe(initialSnapshot, callback);

        environment.execute({operation}).subscribe(callbacks);
        dataSource.next({
          data: {
            viewer: {
              __typename: 'Viewer',
            },
          },
        });
        dataSource.next({
          data: {
            newsFeed: {
              edges: [],
              pageInfo: {
                endCursor: null,
                hasNextPage: false,
              },
            },
          },
          label:
            'RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedQuery$defer$FeedFragment',
          path: ['viewer'],
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
            'RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedFragment$stream$newsFeed',
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
            'RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedFragment$stream$newsFeed',
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
              __typename: 'Viewer',
            },
          },
        });
        dataSource.next({
          data: {
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
                endCursor: null,
                hasNextPage: false,
              },
            },
          },
          label:
            'RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedQuery$defer$FeedFragment',
          path: ['viewer'],
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
            'RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedFragment$stream$newsFeed',
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
    });
  },
);

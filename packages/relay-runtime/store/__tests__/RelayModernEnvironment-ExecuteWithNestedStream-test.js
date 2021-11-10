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

describe('execute() a query with nested @stream', () => {
  let actorFragment;
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
      query RelayModernEnvironmentExecuteWithNestedStreamTestFeedQuery(
        $enableStream: Boolean!
      ) {
        viewer {
          ...RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment
        }
      }
    `);

    feedFragment = getFragment(graphql`
      fragment RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment on Viewer {
        newsFeed(first: 10) {
          edges
            @stream(label: "newsFeed", if: $enableStream, initial_count: 0) {
            cursor
            node {
              id
              feedback {
                actors
                  @stream(
                    label: "actors"
                    if: $enableStream
                    initial_count: 0
                  ) {
                  name @__clientField(handle: "name_handler")
                }
              }
            }
          }
        }
      }
    `);

    actorFragment = getFragment(graphql`
      fragment RelayModernEnvironmentExecuteWithNestedStreamTestActorFragment on User {
        # keep in sync with above
        name @__clientField(handle: "name_handler")
      }
    `);
    variables = {enableStream: true};
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
        }
      },
    });

    // Publish an initial root payload and a parent nested stream payload
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
            actors: [],
          },
        },
      },
      label:
        'RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$stream$newsFeed',
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
              id: '1',
              feedback: {
                actors: [],
              },
            },
          },
        ],
      },
    });
    callback.mockClear();
    complete.mockClear();
    error.mockClear();
    next.mockClear();
  });

  it('processes nested payloads', () => {
    dataSource.next({
      data: {
        __typename: 'User',
        id: 'user-1',
        name: 'Alice',
      },
      label:
        'RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$stream$actors',
      path: ['viewer', 'newsFeed', 'edges', 0, 'node', 'feedback', 'actors', 0],
    });
    expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
    expect(next).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);
    const snapshot2 = callback.mock.calls[0][0];
    expect(snapshot2.isMissingData).toBe(false);
    expect(snapshot2.data).toEqual({
      newsFeed: {
        edges: [
          {
            cursor: 'cursor-1',
            node: {
              id: '1',
              feedback: {
                actors: [
                  {
                    name: 'ALICE',
                  },
                ],
              },
            },
          },
        ],
      },
    });

    dataSource.next({
      data: {
        __typename: 'User',
        id: 'user-2',
        name: 'Bob',
      },
      label:
        'RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$stream$actors',
      path: ['viewer', 'newsFeed', 'edges', 0, 'node', 'feedback', 'actors', 1],
    });
    expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
    expect(next).toBeCalledTimes(2);
    expect(callback).toBeCalledTimes(2);
    const snapshot3 = callback.mock.calls[1][0];
    expect(snapshot3.isMissingData).toBe(false);
    expect(snapshot3.data).toEqual({
      newsFeed: {
        edges: [
          {
            cursor: 'cursor-1',
            node: {
              id: '1',
              feedback: {
                actors: [
                  {
                    name: 'ALICE',
                  },
                  {name: 'BOB'},
                ],
              },
            },
          },
        ],
      },
    });

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
  });

  it('processes @stream payloads when the parent record has been deleted', () => {
    environment.commitUpdate(proxy => {
      proxy.delete('feedback-1');
    });
    const snapshot = callback.mock.calls[0][0];
    expect(snapshot.isMissingData).toBe(false);
    expect(snapshot.data).toEqual({
      newsFeed: {
        edges: [
          {
            cursor: 'cursor-1',
            node: {
              id: '1',
              feedback: null,
            },
          },
        ],
      },
    });
    callback.mockClear();

    dataSource.next({
      data: {
        __typename: 'User',
        id: 'user-1',
        name: 'Alice',
      },
      label:
        'RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$stream$actors',
      path: ['viewer', 'newsFeed', 'edges', 0, 'node', 'feedback', 'actors', 0],
    });
    expect(next).toBeCalledTimes(1);
    // parent Feedback is not updated
    expect(callback).toBeCalledTimes(0);

    // but the streamed entity is added to the store
    const actorSnapshot = environment.lookup(
      createReaderSelector(actorFragment, 'user-1', {}, operation.request),
    );
    expect(actorSnapshot.isMissingData).toBe(false);
    expect(actorSnapshot.data).toEqual({
      name: 'ALICE',
    });

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
  });

  it('processes @stream payloads when the streamed field has been deleted on the parent record', () => {
    environment.commitUpdate(proxy => {
      const feedback = proxy.get('feedback-1');
      if (feedback != null) {
        feedback.setValue(null, 'actors');
      }
    });
    const snapshot = callback.mock.calls[0][0];
    expect(snapshot.isMissingData).toBe(false);
    expect(snapshot.data).toEqual({
      newsFeed: {
        edges: [
          {
            cursor: 'cursor-1',
            node: {
              id: '1',
              feedback: {
                actors: null,
              },
            },
          },
        ],
      },
    });
    callback.mockClear();

    dataSource.next({
      data: {
        __typename: 'User',
        id: 'user-1',
        name: 'Alice',
      },
      label:
        'RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$stream$actors',
      path: ['viewer', 'newsFeed', 'edges', 0, 'node', 'feedback', 'actors', 0],
    });
    expect(next).toBeCalledTimes(1);
    // parent Feedback is not updated
    expect(callback).toBeCalledTimes(0);

    // but the streamed entity is added to the store
    const actorSnapshot = environment.lookup(
      createReaderSelector(actorFragment, 'user-1', {}, operation.request),
    );
    expect(actorSnapshot.isMissingData).toBe(false);
    expect(actorSnapshot.data).toEqual({
      name: 'ALICE',
    });

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
  });

  it(
    'processes @stream payloads when the identity of the item at the ' +
      'target index has changed on the parent record ()',
    () => {
      environment.commitUpdate(proxy => {
        const parent = proxy.get('feedback-1');
        const actor = proxy.create('<other>', 'User');
        actor.setValue('Other user', '__name_name_handler');
        if (parent != null) {
          parent.setLinkedRecords([actor], 'actors');
        }
      });
      const snapshot = callback.mock.calls[0][0];
      expect(snapshot.isMissingData).toBe(false);
      expect(snapshot.data).toEqual({
        newsFeed: {
          edges: [
            {
              cursor: 'cursor-1',
              node: {
                id: '1',
                feedback: {
                  actors: [{name: 'Other user'}],
                },
              },
            },
          ],
        },
      });
      callback.mockClear();

      dataSource.next({
        data: {
          __typename: 'User',
          id: 'user-1',
          name: 'Alice',
        },
        label:
          'RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$stream$actors',
        path: [
          'viewer',
          'newsFeed',
          'edges',
          0,
          'node',
          'feedback',
          'actors',
          0,
        ],
      });
      expect(next).toBeCalledTimes(1);
      // parent Feedback is not updated
      expect(callback).toBeCalledTimes(0);

      // but the streamed entity is added to the store
      const actorSnapshot = environment.lookup(
        createReaderSelector(actorFragment, 'user-1', {}, operation.request),
      );
      expect(actorSnapshot.isMissingData).toBe(false);
      expect(actorSnapshot.data).toEqual({
        name: 'ALICE',
      });

      expect(complete).toBeCalledTimes(0);
      expect(error).toBeCalledTimes(0);
    },
  );

  it(
    'processes @stream payloads when the identity of the item at the ' +
      'an index other than the target has changed on the parent record ()',
    () => {
      environment.commitUpdate(proxy => {
        const parent = proxy.get('feedback-1');
        const actor = proxy.create('<other>', 'User');
        actor.setValue('Other user', '__name_name_handler');
        if (parent != null) {
          parent.setLinkedRecords([actor], 'actors');
        }
      });
      const snapshot = callback.mock.calls[0][0];
      expect(snapshot.isMissingData).toBe(false);
      expect(snapshot.data).toEqual({
        newsFeed: {
          edges: [
            {
              cursor: 'cursor-1',
              node: {
                id: '1',
                feedback: {
                  actors: [{name: 'Other user'}],
                },
              },
            },
          ],
        },
      });
      callback.mockClear();

      dataSource.next({
        data: {
          __typename: 'User',
          id: 'user-2',
          name: 'Bob',
        },
        label:
          'RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$stream$actors',
        path: [
          'viewer',
          'newsFeed',
          'edges',
          0,
          'node',
          'feedback',
          'actors',
          1,
        ],
      });
      expect(next).toBeCalledTimes(1);
      // parent Feedback is not updated
      expect(callback).toBeCalledTimes(0);

      // but the streamed entity is added to the store
      const actorSnapshot = environment.lookup(
        createReaderSelector(actorFragment, 'user-2', {}, operation.request),
      );
      expect(actorSnapshot.isMissingData).toBe(false);
      expect(actorSnapshot.data).toEqual({
        name: 'BOB',
      });

      expect(complete).toBeCalledTimes(0);
      expect(error).toBeCalledTimes(0);
    },
  );

  it('processes streamed payloads that arrive out of order', () => {
    // return index 1 before index 0
    dataSource.next({
      data: {
        __typename: 'User',
        id: 'user-2',
        name: 'Bob',
      },
      label:
        'RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$stream$actors',
      path: ['viewer', 'newsFeed', 'edges', 0, 'node', 'feedback', 'actors', 1],
    });
    dataSource.next({
      data: {
        __typename: 'User',
        id: 'user-1',
        name: 'Alice',
      },
      label:
        'RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$stream$actors',
      path: ['viewer', 'newsFeed', 'edges', 0, 'node', 'feedback', 'actors', 0],
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
              id: '1',
              feedback: {
                actors: [
                  {
                    name: 'ALICE',
                  },
                  {name: 'BOB'},
                ],
              },
            },
          },
        ],
      },
    });

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
  });

  it('processes streamed payloads relative to the most recent root payload', () => {
    dataSource.next({
      data: {
        cursor: 'cursor-1',
        node: {
          __typename: 'Story',
          id: '1',
          feedback: {
            id: 'feedback-2',
            actors: [],
          },
        },
      },
      label:
        'RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$stream$newsFeed',
      path: ['viewer', 'newsFeed', 'edges', 0],
    });
    next.mockClear();
    callback.mockClear();

    dataSource.next({
      data: {
        __typename: 'User',
        id: 'user-1',
        name: 'Alice',
      },
      label:
        'RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$stream$actors',
      path: ['viewer', 'newsFeed', 'edges', 0, 'node', 'feedback', 'actors', 0],
    });

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
              id: '1',
              feedback: {
                actors: [{name: 'ALICE'}],
              },
            },
          },
        ],
      },
    });
  });

  it('calls complete() when server completes', () => {
    dataSource.complete();
    expect(complete).toBeCalledTimes(1);
    expect(error).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(0);
  });

  it('calls error() when server errors', () => {
    const err = new Error('wtf');
    dataSource.error(err);
    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(1);
    expect(error.mock.calls[0][0]).toBe(err);
  });

  it('calls error() when streamed payload is missing data', () => {
    dataSource.next({
      errors: [
        {
          message: 'wtf',
          locations: [],
          severity: 'ERROR',
        },
      ],
      label:
        'RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$stream$actors',
      path: [
        '<unknown-path>',
        'viewer',
        'newsFeed',
        'edges',
        0,
        'node',
        'feedback',
        'actors',
        0,
      ],
    });

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(1);
    expect(error.mock.calls[0][0].message).toContain(
      'No data returned for operation `RelayModernEnvironmentExecuteWithNestedStreamTestFeedQuery`',
    );
    expect(next).toBeCalledTimes(0);
    expect(callback).toBeCalledTimes(0);
  });
});

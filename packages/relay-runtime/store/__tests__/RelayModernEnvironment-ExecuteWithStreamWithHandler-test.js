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
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

describe('execute() a query with @stream with handler', () => {
  let actorFragment;
  let callbacks;
  let complete;
  let dataSource;
  let environment;
  let error;
  let fetch;
  let fragment;
  let next;
  let operation;
  let query;
  let selector;
  let variables;
  let source;
  let store;

  beforeEach(() => {
    query = getRequest(graphql`
      query RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackQuery(
        $id: ID!
        $enableStream: Boolean!
      ) {
        node(id: $id) {
          ...RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment
        }
      }
    `);
    fragment = getFragment(graphql`
      fragment RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment on Feedback {
        id
        actors
          @stream(label: "actors", if: $enableStream, initial_count: 0)
          @__clientField(handle: "actors_handler") {
          name @__clientField(handle: "name_handler")
        }
      }
    `);
    actorFragment = getFragment(graphql`
      fragment RelayModernEnvironmentExecuteWithStreamWithHandlerTestActorFragment on User {
        # keep in sync with above
        name @__clientField(handle: "name_handler")
      }
    `);
    variables = {id: '1', enableStream: true};
    operation = createOperationDescriptor(query, variables);
    selector = createReaderSelector(fragment, '1', {}, operation.request);

    // Handler to upper-case the value of the (string) field to which its
    // applied
    const NameHandler = {
      update(storeProxy: RecordSourceProxy, payload: HandleFieldPayload) {
        const record = storeProxy.get(payload.dataID);
        if (record != null) {
          const name = record.getValue(payload.fieldKey);
          record.setValue(
            typeof name === 'string' ? name.toUpperCase() : null,
            payload.handleKey,
          );
        }
      },
    };
    // Handler that simply copies the plural linked source field to the
    // synthesized client field: this is just to check whether the handler
    // ran or not.
    const ActorsHandler = {
      update(storeProxy: RecordSourceProxy, payload: HandleFieldPayload) {
        const record = storeProxy.get(payload.dataID);
        if (record != null) {
          const actors = record.getLinkedRecords(payload.fieldKey);
          if (actors == null) {
            record.setValue(actors, payload.handleKey);
          } else {
            record.setLinkedRecords(actors, payload.handleKey);
          }
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
          case 'actors_handler':
            return ActorsHandler;
        }
      },
    });
  });

  it('calls next() and publishes the initial payload to the store', () => {
    const initialSnapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        node: {
          __typename: 'Feedback',
          id: '1',
          actors: [],
        },
      },
    };
    dataSource.next(payload);
    jest.runAllTimers();

    expect(next.mock.calls.length).toBe(1);
    expect(complete).not.toBeCalled();
    expect(error).not.toBeCalled();
    expect(callback.mock.calls.length).toBe(1);
    const snapshot = callback.mock.calls[0][0];
    expect(snapshot.isMissingData).toBe(false);
    expect(snapshot.data).toEqual({
      id: '1',
      actors: [],
    });
  });

  it('processes streamed payloads', () => {
    const initialSnapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        node: {
          __typename: 'Feedback',
          id: '1',
          actors: [],
        },
      },
    });
    jest.runAllTimers();
    next.mockClear();
    callback.mockClear();

    dataSource.next({
      data: {
        __typename: 'User',
        id: '2',
        name: 'Alice',
      },
      label:
        'RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$stream$actors',
      path: ['node', 'actors', 0],
    });
    expect(next).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);
    const snapshot = callback.mock.calls[0][0];
    expect(snapshot.isMissingData).toBe(false);
    expect(snapshot.data).toEqual({
      id: '1',
      actors: [{name: 'ALICE'}],
    });

    dataSource.next({
      data: {
        __typename: 'User',
        id: '3',
        name: 'Bob',
      },
      label:
        'RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$stream$actors',
      path: ['node', 'actors', 1],
    });
    expect(next).toBeCalledTimes(2);
    expect(callback).toBeCalledTimes(2);
    const snapshot2 = callback.mock.calls[1][0];
    expect(snapshot2.isMissingData).toBe(false);
    expect(snapshot2.data).toEqual({
      id: '1',
      actors: [{name: 'ALICE'}, {name: 'BOB'}],
    });

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
  });

  it('processes @stream payloads when the parent record has been deleted', () => {
    const initialSnapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        node: {
          __typename: 'Feedback',
          id: '1',
          actors: [],
        },
      },
    });
    jest.runAllTimers();
    next.mockClear();
    callback.mockClear();

    environment.commitUpdate(proxy => {
      proxy.delete('1');
    });
    const snapshot = callback.mock.calls[0][0];
    expect(snapshot.isMissingData).toBe(false);
    expect(snapshot.data).toEqual(null);
    callback.mockClear();

    dataSource.next({
      data: {
        __typename: 'User',
        id: '2',
        name: 'Alice',
      },
      label:
        'RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$stream$actors',
      path: ['node', 'actors', 0],
    });
    expect(next).toBeCalledTimes(1);
    // parent Feedback is not updated
    expect(callback).toBeCalledTimes(0);

    // but the streamed entity is added to the store
    const actorSnapshot = environment.lookup(
      createReaderSelector(actorFragment, '2', {}, operation.request),
    );
    expect(actorSnapshot.isMissingData).toBe(false);
    expect(actorSnapshot.data).toEqual({
      name: 'ALICE',
    });

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
  });

  it('processes @stream payloads when the streamed field has been deleted on the parent record', () => {
    const initialSnapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        node: {
          __typename: 'Feedback',
          id: '1',
          actors: [],
        },
      },
    });
    jest.runAllTimers();
    next.mockClear();
    callback.mockClear();

    environment.commitUpdate(proxy => {
      const parent = proxy.get('1');
      if (parent != null) {
        parent.setValue(null, 'actors');
      }
    });
    expect(callback).toBeCalledTimes(0);

    dataSource.next({
      data: {
        __typename: 'User',
        id: '2',
        name: 'Alice',
      },
      label:
        'RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$stream$actors',
      path: ['node', 'actors', 0],
    });
    expect(next).toBeCalledTimes(1);
    // field payloads are republished and the actors change propagates to
    // the client field *without* the new entity, which isn't added to the
    // base actors field since it was concurrently modified
    expect(callback).toBeCalledTimes(1);
    const snapshot = callback.mock.calls[0][0];
    expect(snapshot.isMissingData).toBe(false);
    expect(snapshot.data).toEqual({
      id: '1',
      actors: null,
    });

    // the streamed entity is also added to the store
    const actorSnapshot = environment.lookup(
      createReaderSelector(actorFragment, '2', {}, operation.request),
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
      const initialSnapshot = environment.lookup(selector);
      const callback = jest.fn();
      environment.subscribe(initialSnapshot, callback);

      environment.execute({operation}).subscribe(callbacks);
      dataSource.next({
        data: {
          node: {
            __typename: 'Feedback',
            id: '1',
            actors: [],
          },
        },
      });
      jest.runAllTimers();
      next.mockClear();
      callback.mockClear();

      // Change the first item in the actors array prior to returning the
      // streamed payload for the first item
      environment.commitUpdate(proxy => {
        const parent = proxy.get('1');
        const actor = proxy.create('<other>', 'User');
        actor.setValue('Other user', '__name_name_handler');
        if (parent != null) {
          parent.setLinkedRecords([actor], 'actors');
        }
      });
      // handle field is not updated by commitUpdate
      expect(callback).toBeCalledTimes(0);

      dataSource.next({
        data: {
          __typename: 'User',
          id: '2',
          name: 'Alice',
        },
        label:
          'RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$stream$actors',
        path: ['node', 'actors', 0],
      });
      expect(next).toBeCalledTimes(1);
      // field payloads are republished and the actors change propagates to
      // the client field *without* the new entity, which isn't added to the
      // base actors field since it was concurrently modified
      expect(callback).toBeCalledTimes(1);
      const snapshot = callback.mock.calls[0][0];
      expect(snapshot.isMissingData).toBe(false);
      expect(snapshot.data).toEqual({
        id: '1',
        actors: [{name: 'Other user'}],
      });

      // and the streamed entity is added to the store
      const actorSnapshot = environment.lookup(
        createReaderSelector(actorFragment, '2', {}, operation.request),
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
      const initialSnapshot = environment.lookup(selector);
      const callback = jest.fn();
      environment.subscribe(initialSnapshot, callback);

      environment.execute({operation}).subscribe(callbacks);
      dataSource.next({
        data: {
          node: {
            __typename: 'Feedback',
            id: '1',
            actors: [],
          },
        },
      });
      jest.runAllTimers();
      next.mockClear();
      callback.mockClear();

      dataSource.next({
        data: {
          __typename: 'User',
          id: '2',
          name: 'Alice',
        },
        label:
          'RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$stream$actors',
        path: ['node', 'actors', 0],
      });
      expect(next).toBeCalledTimes(1);
      expect(callback).toBeCalledTimes(1);
      const snapshot = callback.mock.calls[0][0];
      expect(snapshot.isMissingData).toBe(false);
      expect(snapshot.data).toEqual({
        id: '1',
        actors: [{name: 'ALICE'}],
      });
      callback.mockClear();

      // Change the first item in the actors array prior to returning the
      // streamed payload for the second item
      environment.commitUpdate(proxy => {
        const parent = proxy.get('1');
        const actor = proxy.create('<other>', 'User');
        actor.setValue('Other user', '__name_name_handler');
        if (parent != null) {
          parent.setLinkedRecords([actor], 'actors');
        }
      });
      // client field is not explicitly updated by commitUpdate
      expect(callback).toBeCalledTimes(0);

      dataSource.next({
        data: {
          __typename: 'User',
          id: '3',
          name: 'Bob',
        },
        label:
          'RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$stream$actors',
        path: ['node', 'actors', 1],
      });
      expect(next).toBeCalledTimes(2);
      // field payloads are republished and the actors change propagates to
      // the client field *without* the new entity, which isn't added to the
      // base actors field since it was concurrently modified
      expect(callback).toBeCalledTimes(1);
      const snapshot2 = callback.mock.calls[0][0];
      expect(snapshot2.isMissingData).toBe(false);
      expect(snapshot2.data).toEqual({
        id: '1',
        actors: [{name: 'Other user'}],
      });

      // but the streamed entity is added to the store
      const actorSnapshot = environment.lookup(
        createReaderSelector(actorFragment, '2', {}, operation.request),
      );
      expect(actorSnapshot.isMissingData).toBe(false);
      expect(actorSnapshot.data).toEqual({
        name: 'ALICE',
      });

      expect(complete).toBeCalledTimes(0);
      expect(error).toBeCalledTimes(0);
    },
  );

  it('processes streamed payloads that arrive out of order', () => {
    const initialSnapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        node: {
          __typename: 'Feedback',
          id: '1',
          actors: [],
        },
      },
    });
    jest.runAllTimers();
    next.mockClear();
    callback.mockClear();

    // publish index 1 before index 0
    dataSource.next({
      data: {
        __typename: 'User',
        id: '3',
        name: 'Bob',
      },
      label:
        'RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$stream$actors',
      path: ['node', 'actors', 1],
    });
    expect(next).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);
    const snapshot = callback.mock.calls[0][0];
    expect(snapshot.isMissingData).toBe(false);
    expect(snapshot.data).toEqual({
      id: '1',
      actors: [undefined, {name: 'BOB'}],
    });

    // publish index 0 after index 1
    dataSource.next({
      data: {
        __typename: 'User',
        id: '2',
        name: 'Alice',
      },
      label:
        'RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$stream$actors',
      path: ['node', 'actors', 0],
    });
    expect(next).toBeCalledTimes(2);
    expect(callback).toBeCalledTimes(2);
    const snapshot2 = callback.mock.calls[1][0];
    expect(snapshot2.isMissingData).toBe(false);
    expect(snapshot2.data).toEqual({
      id: '1',
      actors: [{name: 'ALICE'}, {name: 'BOB'}],
    });

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
  });

  it('processes streamed payloads relative to the most recent root payload', () => {
    const initialSnapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        node: {
          __typename: 'Feedback',
          id: '1',
          actors: [],
        },
      },
    });
    jest.runAllTimers();
    next.mockClear();
    callback.mockClear();

    dataSource.next({
      data: {
        node: {
          __typename: 'Feedback',
          id: 'not1', // change the relationship of node(1) to point to not1
          actors: [],
        },
      },
    });
    jest.runAllTimers();
    next.mockClear();
    // this doesn't affect the fragment subscribed on id 1
    expect(callback).toBeCalledTimes(0);
    callback.mockClear();

    dataSource.next({
      data: {
        __typename: 'User',
        id: '2',
        name: 'Alice',
      },
      label:
        'RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$stream$actors',
      path: ['node', 'actors', 0],
    });
    expect(next).toBeCalledTimes(1);
    // the streamed entity is processed relative to the most recent
    // root record, not1
    expect(callback).toBeCalledTimes(0);

    const snapshot = environment.lookup(
      createReaderSelector(fragment, 'not1', {}, operation.request),
    );
    expect(snapshot.isMissingData).toBe(false);
    expect(snapshot.data).toEqual({
      id: 'not1',
      actors: [{name: 'ALICE'}],
    });

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
  });

  it('calls complete() when server completes after streamed payload resolves', () => {
    const initialSnapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        node: {
          __typename: 'Feedback',
          id: '1',
          actors: [],
        },
      },
    });
    jest.runAllTimers();

    dataSource.next({
      data: {
        __typename: 'User',
        id: '2',
        name: 'Alice',
      },
      label:
        'RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$stream$actors',
      path: ['node', 'actors', 0],
    });

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(2);
    expect(callback).toBeCalledTimes(2);

    dataSource.complete();

    expect(complete).toBeCalledTimes(1);
    expect(error).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(2);
    expect(callback).toBeCalledTimes(2);
  });

  it('calls complete() when server completes before streamed payload resolves', () => {
    const initialSnapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        node: {
          __typename: 'Feedback',
          id: '1',
          actors: [],
        },
      },
    });
    jest.runAllTimers();

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);

    dataSource.complete();

    expect(complete).toBeCalledTimes(1);
    expect(error).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);
  });

  it('calls error() when server errors after streamed payload resolves', () => {
    const initialSnapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        node: {
          __typename: 'Feedback',
          id: '1',
          actors: [],
        },
      },
    });
    jest.runAllTimers();

    dataSource.next({
      data: {
        __typename: 'User',
        id: '2',
        name: 'Alice',
      },
      label:
        'RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$stream$actors',
      path: ['node', 'actors', 0],
    });

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(2);
    expect(callback).toBeCalledTimes(2);

    const err = new Error('wtf');
    dataSource.error(err);

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(1);
    expect(error.mock.calls[0][0]).toBe(err);
    expect(next).toBeCalledTimes(2);
    expect(callback).toBeCalledTimes(2);
  });

  it('calls error() when server errors before streamed payload resolves', () => {
    const initialSnapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        node: {
          __typename: 'Feedback',
          id: '1',
          actors: [],
        },
      },
    });
    jest.runAllTimers();

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);

    const err = new Error('wtf');
    dataSource.error(err);

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(1);
    expect(error.mock.calls[0][0]).toBe(err);
    expect(next).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);
  });

  it('calls error() when streamed payload is missing data', () => {
    const initialSnapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        node: {
          __typename: 'Feedback',
          id: '1',
          actors: [],
        },
      },
    });
    jest.runAllTimers();

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);

    dataSource.next({
      errors: [
        {
          message: 'wtf',
          locations: [],
          severity: 'ERROR',
        },
      ],
      label:
        'RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackFragment$stream$actors',
      path: ['node', 'actors', 0],
    });

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(1);
    expect(error.mock.calls[0][0].message).toContain(
      'No data returned for operation `RelayModernEnvironmentExecuteWithStreamWithHandlerTestFeedbackQuery`',
    );
    expect(next).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);
  });
});

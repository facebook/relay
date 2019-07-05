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

const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernOperationDescriptor = require('../RelayModernOperationDescriptor');
const RelayModernStore = require('../RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const RelayRecordSource = require('../RelayRecordSource');

const warning = require('warning');

const {generateAndCompile, matchers} = require('relay-test-utils-internal');

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

describe('execute() a query with @stream', () => {
  let actorFragment;
  let callbacks;
  let complete;
  let dataSource;
  let environment;
  let error;
  let fetch;
  let fragment;
  let NameHandler;
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

    ({
      FeedbackQuery: query,
      FeedbackFragment: fragment,
      ActorFragment: actorFragment,
    } = generateAndCompile(`
        query FeedbackQuery($id: ID!, $enableStream: Boolean!) {
          node(id: $id) {
            ...FeedbackFragment
          }
        }

        fragment FeedbackFragment on Feedback {
          id
          actors @stream(label: "actors", if: $enableStream, initial_count: 0) {
            name @__clientField(handle: "name_handler")
          }
        }

        # keep in sync with above
        fragment ActorFragment on Actor {
          name @__clientField(handle: "name_handler")
        }
      `));
    variables = {id: '1', enableStream: true};
    operation = createOperationDescriptor(query, variables);
    selector = {
      dataID: '1',
      node: fragment,
      variables: {},
    };

    NameHandler = {
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

    function getDataID(data, typename) {
      if (typename === 'MessagingParticipant') {
        return `${typename}:${String(data.id)}`;
      }
      return data.id;
    }

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
      UNSTABLE_DO_NOT_USE_getDataID: getDataID,
      network: RelayNetwork.create(fetch),
      store,
      handlerProvider: name => {
        switch (name) {
          case 'name_handler':
            return NameHandler;
        }
      },
    });
  });

  it('calls next() and publishes the initial payload to the store', () => {
    const initialSnapshot = environment.lookup(selector, operation);
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
    const initialSnapshot = environment.lookup(selector, operation);
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
      label: 'FeedbackFragment$stream$actors',
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
      label: 'FeedbackFragment$stream$actors',
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

  it('processes streamed payloads with scheduling', () => {
    let taskID = 0;
    const tasks = new Map();
    const scheduler = {
      cancel: id => {
        tasks.delete(id);
      },
      schedule: task => {
        const id = String(taskID++);
        tasks.set(id, task);
        return id;
      },
    };
    const runTask = () => {
      for (const [id, task] of tasks) {
        tasks.delete(id);
        task();
        break;
      }
    };
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(fetch),
      scheduler,
      store,
      handlerProvider: name => {
        switch (name) {
          case 'name_handler':
            return NameHandler;
        }
      },
    });

    const initialSnapshot = environment.lookup(selector, operation);
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
    expect(next).toBeCalledTimes(0);
    expect(tasks.size).toBe(1);
    runTask();
    expect(next).toBeCalledTimes(1);
    next.mockClear();
    callback.mockClear();

    dataSource.next({
      data: {
        __typename: 'User',
        id: '2',
        name: 'Alice',
      },
      label: 'FeedbackFragment$stream$actors',
      path: ['node', 'actors', 0],
    });
    expect(next).toBeCalledTimes(0);
    expect(tasks.size).toBe(1);
    runTask();
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
      label: 'FeedbackFragment$stream$actors',
      path: ['node', 'actors', 1],
    });
    expect(next).toBeCalledTimes(1);
    expect(tasks.size).toBe(1);
    runTask();
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

  it('cancels processing of streamed payloads with scheduling', () => {
    let taskID = 0;
    const tasks = new Map();
    const scheduler = {
      cancel: id => {
        tasks.delete(id);
      },
      schedule: task => {
        const id = String(taskID++);
        tasks.set(id, task);
        return id;
      },
    };
    const runTask = () => {
      for (const [id, task] of tasks) {
        tasks.delete(id);
        task();
        break;
      }
    };
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(fetch),
      scheduler,
      store,
      handlerProvider: name => {
        switch (name) {
          case 'name_handler':
            return NameHandler;
        }
      },
    });

    const initialSnapshot = environment.lookup(selector, operation);
    const callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    const subscription = environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        node: {
          __typename: 'Feedback',
          id: '1',
          actors: [],
        },
      },
    });
    expect(next).toBeCalledTimes(0);
    expect(tasks.size).toBe(1);
    runTask();
    expect(next).toBeCalledTimes(1);
    next.mockClear();
    callback.mockClear();

    dataSource.next({
      data: {
        __typename: 'User',
        id: '2',
        name: 'Alice',
      },
      label: 'FeedbackFragment$stream$actors',
      path: ['node', 'actors', 0],
    });
    expect(next).toBeCalledTimes(0);
    expect(tasks.size).toBe(1);

    subscription.unsubscribe();
    expect(tasks.size).toBe(0);
    expect(next).toBeCalledTimes(0);
    expect(callback).toBeCalledTimes(0);
  });

  it('processes @stream payloads when the parent record has been deleted', () => {
    const initialSnapshot = environment.lookup(selector, operation);
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
      label: 'FeedbackFragment$stream$actors',
      path: ['node', 'actors', 0],
    });
    expect(next).toBeCalledTimes(1);
    // parent Feedback is not updated
    expect(callback).toBeCalledTimes(0);

    // but the streamed entity is added to the store
    const actorSnapshot = environment.lookup(
      {
        dataID: '2',
        node: actorFragment,
        variables: {},
      },
      operation,
    );
    expect(actorSnapshot.isMissingData).toBe(false);
    expect(actorSnapshot.data).toEqual({
      name: 'ALICE',
    });

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
  });

  it('processes @stream payloads when the streamed field has been deleted on the parent record', () => {
    const initialSnapshot = environment.lookup(selector, operation);
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
    const snapshot = callback.mock.calls[0][0];
    expect(snapshot.isMissingData).toBe(false);
    expect(snapshot.data).toEqual({
      id: '1',
      actors: null,
    });
    callback.mockClear();

    dataSource.next({
      data: {
        __typename: 'User',
        id: '2',
        name: 'Alice',
      },
      label: 'FeedbackFragment$stream$actors',
      path: ['node', 'actors', 0],
    });
    expect(next).toBeCalledTimes(1);
    // parent Feedback is not updated
    expect(callback).toBeCalledTimes(0);

    // but the streamed entity is added to the store
    const actorSnapshot = environment.lookup(
      {
        dataID: '2',
        node: actorFragment,
        variables: {},
      },
      operation,
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
      const initialSnapshot = environment.lookup(selector, operation);
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
      const snapshot = callback.mock.calls[0][0];
      expect(snapshot.isMissingData).toBe(false);
      expect(snapshot.data).toEqual({
        id: '1',
        actors: [{name: 'Other user'}],
      });
      callback.mockClear();

      dataSource.next({
        data: {
          __typename: 'User',
          id: '2',
          name: 'Alice',
        },
        label: 'FeedbackFragment$stream$actors',
        path: ['node', 'actors', 0],
      });
      expect(next).toBeCalledTimes(1);
      // parent Feedback is not updated: the item at index 0 no longer matches
      expect(callback).toBeCalledTimes(0);

      // but the streamed entity is added to the store
      const actorSnapshot = environment.lookup(
        {
          dataID: '2',
          node: actorFragment,
          variables: {},
        },
        operation,
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
      const initialSnapshot = environment.lookup(selector, operation);
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
        label: 'FeedbackFragment$stream$actors',
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
      expect(callback).toBeCalledTimes(1);
      const snapshot2 = callback.mock.calls[0][0];
      expect(snapshot2.isMissingData).toBe(false);
      expect(snapshot2.data).toEqual({
        id: '1',
        actors: [{name: 'Other user'}],
      });
      callback.mockClear();

      dataSource.next({
        data: {
          __typename: 'User',
          id: '3',
          name: 'Bob',
        },
        label: 'FeedbackFragment$stream$actors',
        path: ['node', 'actors', 1],
      });
      expect(next).toBeCalledTimes(2);
      // parent Feedback is not updated: the list has changed since the parent
      // payload was received.
      expect(callback).toBeCalledTimes(0);

      // but the streamed entity is added to the store
      const actorSnapshot = environment.lookup(
        {
          dataID: '2',
          node: actorFragment,
          variables: {},
        },
        operation,
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
    const initialSnapshot = environment.lookup(selector, operation);
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
      label: 'FeedbackFragment$stream$actors',
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
      label: 'FeedbackFragment$stream$actors',
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
    const initialSnapshot = environment.lookup(selector, operation);
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
      label: 'FeedbackFragment$stream$actors',
      path: ['node', 'actors', 0],
    });
    expect(next).toBeCalledTimes(1);
    // the streamed entity is processed relative to the most recent
    // root record, not1
    expect(callback).toBeCalledTimes(0);

    const snapshot = environment.lookup(
      {
        dataID: 'not1',
        node: fragment,
        variables: {},
      },
      operation,
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
    const initialSnapshot = environment.lookup(selector, operation);
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
      label: 'FeedbackFragment$stream$actors',
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
    const initialSnapshot = environment.lookup(selector, operation);
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
    const initialSnapshot = environment.lookup(selector, operation);
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
      label: 'FeedbackFragment$stream$actors',
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
    const initialSnapshot = environment.lookup(selector, operation);
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
    const initialSnapshot = environment.lookup(selector, operation);
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
      label: 'FeedbackFragment$stream$actors',
      path: ['node', 'actors', 0],
    });

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(1);
    expect(error.mock.calls[0][0].message).toContain(
      'No data returned for operation `FeedbackQuery`',
    );
    expect(next).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);
  });

  it('uses user-defined getDataID to generate ID from streamed payload.', () => {
    const initialSnapshot = environment.lookup(selector, operation);
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
        __typename: 'MessagingParticipant',
        id: '2',
        name: 'Alice',
      },
      label: 'FeedbackFragment$stream$actors',
      path: ['node', 'actors', 0],
    });

    expect(next).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);
    expect(source.get('MessagingParticipant:2')).toEqual({
      __id: 'MessagingParticipant:2',
      __typename: 'MessagingParticipant',
      id: '2',
      name: 'Alice',
      __name_name_handler: 'ALICE',
    });

    dataSource.next({
      data: {
        __typename: 'User',
        id: '3',
        name: 'Bob',
      },
      label: 'FeedbackFragment$stream$actors',
      path: ['node', 'actors', 1],
    });

    expect(next).toBeCalledTimes(2);
    expect(callback).toBeCalledTimes(2);

    expect(source.get('3')).toEqual({
      __id: '3',
      __typename: 'User',
      id: '3',
      name: 'Bob',
      __name_name_handler: 'BOB',
    });

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
  });

  it('warns if executed in non-streaming mode', () => {
    const initialSnapshot = environment.lookup(selector, operation);
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
      extensions: {
        is_final: true,
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
    expect(warning).toHaveBeenCalledWith(
      false,
      'RelayModernEnvironment: Operation `%s` contains @defer/@stream ' +
        'directives but was executed in non-streaming mode. See ' +
        'https://fburl.com/relay-incremental-delivery-non-streaming-warning.',
      'FeedbackQuery',
    );
  });
});

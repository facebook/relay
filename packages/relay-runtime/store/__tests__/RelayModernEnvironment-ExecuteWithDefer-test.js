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

const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernStore = require('../RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const RelayRecordSource = require('../RelayRecordSource');

const warning = require('warning');

const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {createReaderSelector} = require('../RelayModernSelector');
const {generateAndCompile} = require('relay-test-utils-internal');

describe('execute() a query with @defer', () => {
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

    ({UserQuery: query, UserFragment: fragment} = generateAndCompile(`
        query UserQuery($id: ID!) {
          node(id: $id) {
            ...UserFragment @defer(label: "UserFragment")
          }
        }

        fragment UserFragment on User {
          id
          name @__clientField(handle: "name_handler")
        }
      `));
    variables = {id: '1'};
    operation = createOperationDescriptor(query, variables);
    selector = createReaderSelector(fragment, '1', {}, operation.request);

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
          id: '1',
          __typename: 'User',
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
    expect(snapshot.isMissingData).toBe(true);
    expect(snapshot.data).toEqual({
      id: '1',
      name: undefined,
    });
  });

  it('processes deferred payloads', () => {
    const initialSnapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        node: {
          id: '1',
          __typename: 'User',
        },
      },
    });
    jest.runAllTimers();
    next.mockClear();
    callback.mockClear();

    dataSource.next({
      data: {
        id: '1',
        __typename: 'User',
        name: 'joe',
      },
      label: 'UserQuery$defer$UserFragment',
      path: ['node'],
    });

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);
    const snapshot = callback.mock.calls[0][0];
    expect(snapshot.isMissingData).toBe(false);
    expect(snapshot.data).toEqual({
      id: '1',
      name: 'JOE',
    });
  });

  it('processes deferred payloads mixed with extensions-only payloads', () => {
    const initialSnapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        node: {
          id: '1',
          __typename: 'User',
        },
      },
    });
    jest.runAllTimers();
    next.mockClear();
    callback.mockClear();

    const extensionsPayload = {data: null, extensions: {foo: 'foo'}};
    dataSource.next(extensionsPayload);
    expect(callback).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(1);
    expect(next.mock.calls[0][0]).toBe(extensionsPayload);
    next.mockClear();

    dataSource.next({
      data: {
        id: '1',
        __typename: 'User',
        name: 'joe',
      },
      label: 'UserQuery$defer$UserFragment',
      path: ['node'],
    });

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);
    const snapshot = callback.mock.calls[0][0];
    expect(snapshot.isMissingData).toBe(false);
    expect(snapshot.data).toEqual({
      id: '1',
      name: 'JOE',
    });
  });

  it('processes deferred payloads with scheduling', () => {
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
    const initialSnapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        node: {
          id: '1',
          __typename: 'User',
        },
      },
    });
    expect(next).toBeCalledTimes(0);
    expect(callback).toBeCalledTimes(0);
    expect(tasks.size).toBe(1);
    runTask();
    expect(next).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);
    jest.runAllTimers();
    next.mockClear();
    callback.mockClear();

    dataSource.next({
      data: {
        id: '1',
        __typename: 'User',
        name: 'joe',
      },
      label: 'UserQuery$defer$UserFragment',
      path: ['node'],
    });
    expect(next).toBeCalledTimes(0);
    expect(callback).toBeCalledTimes(0);
    expect(tasks.size).toBe(1);
    runTask();

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);
    const snapshot = callback.mock.calls[0][0];
    expect(snapshot.isMissingData).toBe(false);
    expect(snapshot.data).toEqual({
      id: '1',
      name: 'JOE',
    });
  });

  it('cancels processing of deferred payloads with scheduling', () => {
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
    const initialSnapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    const subscription = environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        node: {
          id: '1',
          __typename: 'User',
        },
      },
    });
    expect(next).toBeCalledTimes(0);
    expect(callback).toBeCalledTimes(0);
    expect(tasks.size).toBe(1);
    runTask();
    expect(next).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);
    jest.runAllTimers();
    next.mockClear();
    callback.mockClear();

    dataSource.next({
      data: {
        id: '1',
        __typename: 'User',
        name: 'joe',
      },
      label: 'UserQuery$defer$UserFragment',
      path: ['node'],
    });
    expect(next).toBeCalledTimes(0);
    expect(callback).toBeCalledTimes(0);
    expect(tasks.size).toBe(1);

    subscription.unsubscribe();
    expect(tasks.size).toBe(0);
    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(0);
    expect(callback).toBeCalledTimes(0);
  });

  it('calls complete() when server completes after deferred payload resolves', () => {
    const initialSnapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        node: {
          id: '1',
          __typename: 'User',
        },
      },
    });
    jest.runAllTimers();

    dataSource.next({
      data: {
        id: '1',
        __typename: 'User',
        name: 'joe',
      },
      label: 'UserQuery$defer$UserFragment',
      path: ['node'],
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

  it('calls complete() when server completes before deferred payload resolves', () => {
    const initialSnapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        node: {
          id: '1',
          __typename: 'User',
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

  it('calls error() when server errors after deferred payload resolves', () => {
    const initialSnapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        node: {
          id: '1',
          __typename: 'User',
        },
      },
    });
    jest.runAllTimers();

    dataSource.next({
      data: {
        id: '1',
        __typename: 'User',
        name: 'joe',
      },
      label: 'UserQuery$defer$UserFragment',
      path: ['node'],
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

  it('calls error() when server errors before deferred payload resolves', () => {
    const initialSnapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        node: {
          id: '1',
          __typename: 'User',
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

  it('calls error() when deferred payload is missing data', () => {
    const initialSnapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        node: {
          id: '1',
          __typename: 'User',
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
      label: 'UserQuery$defer$UserFragment',
      path: ['node'],
    });

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(1);
    expect(error.mock.calls[0][0].message).toContain(
      'No data returned for operation `UserQuery`',
    );
    expect(next).toBeCalledTimes(1);
    expect(callback).toBeCalledTimes(1);
  });

  it('warns if executed in non-streaming mode and processes deferred selections', () => {
    const initialSnapshot = environment.lookup(selector);
    const callback = jest.fn();
    environment.subscribe(initialSnapshot, callback);

    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        node: {
          id: '1',
          __typename: 'User',
          name: 'Alice',
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
    expect(callback.mock.calls.length).toBe(2);
    const snapshot = callback.mock.calls[0][0];
    expect(snapshot.isMissingData).toBe(true);
    expect(snapshot.data).toEqual({
      id: '1',
      name: undefined, // not initially published
    });
    const snapshot2 = callback.mock.calls[1][0];
    expect(snapshot2.isMissingData).toBe(false);
    expect(snapshot2.data).toEqual({
      id: '1',
      name: 'ALICE',
    });
    expect(warning).toHaveBeenCalledWith(
      false,
      'RelayModernEnvironment: Operation `%s` contains @defer/@stream ' +
        'directives but was executed in non-streaming mode. See ' +
        'https://fburl.com/relay-incremental-delivery-non-streaming-warning.',
      'UserQuery',
    );
  });

  it('warns if executed in non-streaming mode and skips deferred selections if cancelled', () => {
    const initialSnapshot = environment.lookup(selector);
    let subscription = null;
    const callback = jest.fn(() => {
      if (subscription != null) {
        subscription.unsubscribe();
        subscription = null;
      }
    });
    environment.subscribe(initialSnapshot, callback);

    subscription = environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        node: {
          id: '1',
          __typename: 'User',
          name: 'Alice',
        },
      },
      extensions: {
        is_final: true,
      },
    };
    dataSource.next(payload);
    jest.runAllTimers();

    expect(next).not.toBeCalled();
    expect(complete).not.toBeCalled();
    expect(error).not.toBeCalled();
    expect(callback.mock.calls.length).toBe(1);
    const snapshot = callback.mock.calls[0][0];
    expect(snapshot.isMissingData).toBe(true);
    expect(snapshot.data).toEqual({
      id: '1',
      name: undefined, // not initially published
    });
    expect(warning).not.toHaveBeenCalledWith(
      false,
      'RelayModernEnvironment: Operation `%s` contains @defer/@stream ' +
        'directives but was executed in non-streaming mode. See ' +
        'https://fburl.com/relay-incremental-delivery-non-streaming-warning.',
      'UserQuery',
    );
  });
});

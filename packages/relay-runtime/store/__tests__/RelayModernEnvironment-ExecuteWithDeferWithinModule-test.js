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

const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {createReaderSelector} = require('../RelayModernSelector');
const {generateAndCompile} = require('relay-test-utils-internal');

function createOperationLoader() {
  const cache = new Map();
  const resolve = operation => {
    const moduleName = `${operation.name}.graphql`;
    const entry = cache.get(moduleName);
    if (entry && entry.kind === 'promise') {
      entry.resolve(operation);
    }
    cache.set(moduleName, {kind: 'value', operation: operation});
  };
  const loader = {
    get: jest.fn(moduleName => {
      const entry = cache.get(moduleName);
      if (entry && entry.kind === 'value') {
        return entry.operation;
      }
    }),
    load: jest.fn(moduleName => {
      let entry = cache.get(moduleName);
      if (entry == null) {
        let resolveFn = _x => undefined;
        const promise = new Promise(resolve_ => {
          resolveFn = resolve_;
        });
        entry = {kind: 'promise', promise, resolve: resolveFn};
        cache.set(moduleName, entry);
        return promise;
      } else if (entry.kind === 'value') {
        return Promise.resolve(entry.operation);
      } else {
        return entry.promise;
      }
    }),
  };
  return [resolve, loader];
}

describe('execute() a query with @defer', () => {
  let actorCallback;
  let actorNormalizationFragment;
  let callbacks;
  let complete;
  let dataSource;
  let environment;
  let error;
  let fetch;
  let fragment;
  let next;
  let operation;
  let operationLoader;
  let query;
  let resolveFragment;
  let source;
  let store;
  let userCallback;
  let userNormalizationFragment;
  let variables;

  beforeEach(() => {
    jest.resetModules();
    jest.mock('warning');
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    ({
      Actor_actor$normalization: actorNormalizationFragment,
      UserQuery: query,
      UserFragment: fragment,
      User_user$normalization: userNormalizationFragment,
    } = generateAndCompile(`

      # NOTE: the query is structured to have the same exact deferred fragment
      # used at two different paths (node / viewer.actor), each within a distict
      # @module selection so that the data and @module for each can resolve
      # independently.

      query UserQuery($id: ID!) {
        node(id: $id) {
          ...User_user @module(name: "User.react")
        }
        viewer {
          actor @match(key: "UserQuery_actor") {
            ...Actor_actor @module(name: "Actor.react")
          }
        }
      }

      fragment Actor_actor on User {
        # NOTE: deferring UserFragment directly here would create
        # a different label
        ...User_user
      }

      fragment User_user on User {
        ...UserFragment @defer(label: "UserFragment")
      }

      fragment UserFragment on User {
        id
        name
      }
    `));
    variables = {id: '1'};
    operation = createOperationDescriptor(query, variables);
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

    [resolveFragment, operationLoader] = createOperationLoader();
    environment = new RelayModernEnvironment({
      network: RelayNetwork.create(fetch),
      operationLoader,
      store,
    });

    const userSelector = createReaderSelector(
      fragment,
      '1',
      {},
      operation.request,
    );
    const userSnapshot = environment.lookup(userSelector);
    userCallback = jest.fn();
    environment.subscribe(userSnapshot, userCallback);

    const actorSelector = createReaderSelector(
      fragment,
      '2',
      {},
      operation.request,
    );
    const actorSnapshot = environment.lookup(actorSelector);
    actorCallback = jest.fn();
    environment.subscribe(actorSnapshot, actorCallback);
  });

  it('calls next() and publishes the initial payload to the store', () => {
    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        node: {
          id: '1',
          __typename: 'User',
          __module_component_UserQuery: 'User.react',
          __module_operation_UserQuery: 'User_user$normalization.graphql',
        },
        viewer: {
          actor: {
            id: '2',
            __typename: 'User',
            __module_component_UserQuery_actor: 'Actor.react',
            __module_operation_UserQuery_actor:
              'Actor_actor$normalization.graphql',
          },
        },
      },
    };
    dataSource.next(payload);
    jest.runAllTimers();

    expect(operationLoader.load).toBeCalledTimes(2);
    expect(operationLoader.load.mock.calls[0][0]).toBe(
      'User_user$normalization.graphql',
    );
    expect(operationLoader.load.mock.calls[1][0]).toBe(
      'Actor_actor$normalization.graphql',
    );

    expect(next.mock.calls.length).toBe(1);
    expect(complete).not.toBeCalled();
    expect(error).not.toBeCalled();
    expect(userCallback).toBeCalledTimes(1);
    const userSnapshot = userCallback.mock.calls[0][0];
    expect(userSnapshot.isMissingData).toBe(true);
    expect(userSnapshot.data).toEqual({
      id: '1',
      name: undefined,
    });
    expect(actorCallback).toBeCalledTimes(1);
    const actorSnapshot = actorCallback.mock.calls[0][0];
    expect(actorSnapshot.isMissingData).toBe(true);
    expect(actorSnapshot.data).toEqual({
      id: '2',
      name: undefined,
    });
  });

  it('does not process deferred payloads that arrive before their parent @module is processed', () => {
    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        node: {
          id: '1',
          __typename: 'User',
          __module_component_UserQuery: 'User.react',
          __module_operation_UserQuery: 'User_user$normalization.graphql',
        },
        viewer: {
          actor: {
            id: '2',
            __typename: 'User',
            __module_component_UserQuery_actor: 'Actor.react',
            __module_operation_UserQuery_actor:
              'Actor_actor$normalization.graphql',
          },
        },
      },
    });
    jest.runAllTimers();
    next.mockClear();
    userCallback.mockClear();
    actorCallback.mockClear();

    dataSource.next({
      data: {
        id: '1',
        __typename: 'User',
        name: 'Alice',
      },
      label: 'User_user$defer$UserFragment',
      path: ['node'],
    });
    dataSource.next({
      data: {
        id: '2',
        __typename: 'User',
        name: 'Bob',
      },
      label: 'User_user$defer$UserFragment',
      path: ['viewer', 'actor'],
    });

    expect(userCallback).toBeCalledTimes(0);
    expect(actorCallback).toBeCalledTimes(0);
    expect(complete).toBeCalledTimes(0);
    expect(error.mock.calls.map(call => call[0])).toEqual([]);
    expect(error).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(2);

    resolveFragment(userNormalizationFragment);
    jest.runAllTimers();
    expect(error.mock.calls.map(call => call[0])).toEqual([]);
    expect(userCallback).toBeCalledTimes(1);
    const userSnapshot = userCallback.mock.calls[0][0];
    expect(userSnapshot.isMissingData).toBe(false);
    expect(userSnapshot.data).toEqual({
      id: '1',
      name: 'Alice',
    });
    expect(actorCallback).toBeCalledTimes(0);
    userCallback.mockClear();

    resolveFragment(actorNormalizationFragment);
    jest.runAllTimers();
    expect(error.mock.calls.map(call => call[0])).toEqual([]);
    expect(userCallback).toBeCalledTimes(0);
    expect(actorCallback).toBeCalledTimes(1);
    const actorSnapshot = actorCallback.mock.calls[0][0];
    expect(actorSnapshot.isMissingData).toBe(false);
    expect(actorSnapshot.data).toEqual({
      id: '2',
      name: 'Bob',
    });
  });

  it('processes deferred payloads that arrive after the parent module has resolved', () => {
    environment.execute({operation}).subscribe(callbacks);
    dataSource.next({
      data: {
        node: {
          id: '1',
          __typename: 'User',
          __module_component_UserQuery: 'User.react',
          __module_operation_UserQuery: 'User_user$normalization.graphql',
        },
        viewer: {
          actor: {
            id: '2',
            __typename: 'User',
            __module_component_UserQuery_actor: 'Actor.react',
            __module_operation_UserQuery_actor:
              'Actor_actor$normalization.graphql',
          },
        },
      },
    });
    jest.runAllTimers();
    next.mockClear();
    userCallback.mockClear();
    actorCallback.mockClear();
    expect(operationLoader.load).toBeCalledTimes(2);
    expect(operationLoader.load.mock.calls[0][0]).toBe(
      'User_user$normalization.graphql',
    );
    expect(operationLoader.load.mock.calls[1][0]).toBe(
      'Actor_actor$normalization.graphql',
    );

    resolveFragment(userNormalizationFragment);
    jest.runAllTimers();
    expect(userCallback).toBeCalledTimes(0);
    expect(actorCallback).toBeCalledTimes(0);

    dataSource.next({
      data: {
        id: '1',
        __typename: 'User',
        name: 'Alice',
      },
      label: 'User_user$defer$UserFragment',
      path: ['node'],
    });

    expect(complete).toBeCalledTimes(0);
    expect(error.mock.calls.map(call => call[0])).toEqual([]);
    expect(error).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(1);
    expect(userCallback).toBeCalledTimes(1);
    const userSnapshot = userCallback.mock.calls[0][0];
    expect(userSnapshot.isMissingData).toBe(false);
    expect(userSnapshot.data).toEqual({
      id: '1',
      name: 'Alice',
    });
    expect(actorCallback).toBeCalledTimes(0);
    userCallback.mockClear();

    resolveFragment(actorNormalizationFragment);
    jest.runAllTimers();
    expect(userCallback).toBeCalledTimes(0);
    expect(actorCallback).toBeCalledTimes(0);

    dataSource.next({
      data: {
        id: '2',
        __typename: 'User',
        name: 'Bob',
      },
      label: 'User_user$defer$UserFragment',
      path: ['viewer', 'actor'],
    });

    expect(complete).toBeCalledTimes(0);
    expect(error.mock.calls.map(call => call[0])).toEqual([]);
    expect(error).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(2);
    expect(userCallback).toBeCalledTimes(0);
    expect(actorCallback).toBeCalledTimes(1);
    const actorSnapshot = actorCallback.mock.calls[0][0];
    expect(actorSnapshot.isMissingData).toBe(false);
    expect(actorSnapshot.data).toEqual({
      id: '2',
      name: 'Bob',
    });
  });
});

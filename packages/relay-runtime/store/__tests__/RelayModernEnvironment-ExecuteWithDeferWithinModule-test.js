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

import type {NormalizationRootNode} from '../../util/NormalizationNode';

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
const {disallowWarnings, expectToWarn} = require('relay-test-utils-internal');

disallowWarnings();

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

describe.each(['RelayModernEnvironment', 'MultiActorEnvironment'])(
  'execute() a query with @defer',
  environmentType => {
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
    let operationLoader: {|
      get: JestMockFn<$ReadOnlyArray<mixed>, ?NormalizationRootNode>,
      load: JestMockFn<$ReadOnlyArray<mixed>, Promise<?NormalizationRootNode>>,
    |};
    let query;
    let resolveFragment;
    let source;
    let store;
    let userCallback;
    let userNormalizationFragment;
    let variables;

    describe(environmentType, () => {
      beforeEach(() => {
        query = getRequest(graphql`
          query RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery(
            $id: ID!
          ) {
            # NOTE: the query is structured to have the same exact deferred fragment
            # used at two different paths (node / viewer.actor), each within a distinct
            # @module selection so that the data and @module for each can resolve
            # independently.
            node(id: $id) {
              ...RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user
                @module(name: "User.react")
            }
            viewer {
              actor
                @match(
                  key: "RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery_actor"
                ) {
                ...RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor
                  @module(name: "Actor.react")
              }
            }
          }
        `);

        actorNormalizationFragment = require('./__generated__/RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$normalization.graphql');
        graphql`
          fragment RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor on User {
            # NOTE: deferring UserFragment directly here would create
            # a different label
            ...RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user
          }
        `;

        userNormalizationFragment = require('./__generated__/RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$normalization.graphql');
        graphql`
          fragment RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user on User
          @no_inline {
            ...RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment
              @defer(label: "UserFragment")
          }
        `;

        fragment = getFragment(graphql`
          fragment RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment on User {
            id
            name
          }
        `);
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
        const multiActorEnvironment = new MultiActorEnvironment({
          createNetworkForActor: _actorID => RelayNetwork.create(fetch),
          createStoreForActor: _actorID => store,
          operationLoader,
        });
        environment =
          environmentType === 'MultiActorEnvironment'
            ? multiActorEnvironment.forActor(getActorIdentifier('actor:1234'))
            : new RelayModernEnvironment({
                network: RelayNetwork.create(fetch),
                store,
                operationLoader,
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
              __module_component_RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery:
                'User.react',
              __module_operation_RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery:
                'RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$normalization.graphql',
            },
            viewer: {
              actor: {
                id: '2',
                __typename: 'User',
                __module_component_RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery_actor:
                  'Actor.react',
                __module_operation_RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery_actor:
                  'RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$normalization.graphql',
              },
            },
          },
        };
        dataSource.next(payload);
        jest.runAllTimers();

        expect(operationLoader.load).toBeCalledTimes(2);
        expect(operationLoader.load.mock.calls[0][0]).toBe(
          'RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$normalization.graphql',
        );
        expect(operationLoader.load.mock.calls[1][0]).toBe(
          'RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$normalization.graphql',
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
              __module_component_RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery:
                'User.react',
              __module_operation_RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery:
                'RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$normalization.graphql',
            },
            viewer: {
              actor: {
                id: '2',
                __typename: 'User',
                __module_component_RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery_actor:
                  'Actor.react',
                __module_operation_RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery_actor:
                  'RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$normalization.graphql',
              },
            },
          },
        });
        jest.runAllTimers();
        next.mockClear();
        userCallback.mockClear();
        actorCallback.mockClear();

        expectToWarn(
          'RelayPublishQueue.run was called, but the call would have been a noop.',
          () => {
            dataSource.next({
              data: {
                id: '1',
                __typename: 'User',
                name: 'Alice',
              },
              label:
                'RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$defer$UserFragment',
              path: ['node'],
            });
          },
        );

        expectToWarn(
          'RelayPublishQueue.run was called, but the call would have been a noop.',
          () => {
            dataSource.next({
              data: {
                id: '2',
                __typename: 'User',
                name: 'Bob',
              },
              label:
                'RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$defer$UserFragment',
              path: ['viewer', 'actor'],
            });
          },
        );

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
              __module_component_RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery:
                'User.react',
              __module_operation_RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery:
                'RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$normalization.graphql',
            },
            viewer: {
              actor: {
                id: '2',
                __typename: 'User',
                __module_component_RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery_actor:
                  'Actor.react',
                __module_operation_RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery_actor:
                  'RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$normalization.graphql',
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
          'RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$normalization.graphql',
        );
        expect(operationLoader.load.mock.calls[1][0]).toBe(
          'RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$normalization.graphql',
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
          label:
            'RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$defer$UserFragment',
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
          label:
            'RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$defer$UserFragment',
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

      describe('when using a scheduler', () => {
        let taskID;
        let tasks;
        let scheduler;
        let runTask;

        beforeEach(() => {
          taskID = 0;
          tasks = new Map();
          scheduler = {
            cancel: id => {
              tasks.delete(id);
            },
            schedule: task => {
              const id = String(taskID++);
              tasks.set(id, task);
              return id;
            },
          };
          runTask = () => {
            for (const [id, task] of tasks) {
              tasks.delete(id);
              task();
              break;
            }
          };
          const multiActorEnvironment = new MultiActorEnvironment({
            createNetworkForActor: _actorID => RelayNetwork.create(fetch),
            createStoreForActor: _actorID => store,
            operationLoader,
            scheduler,
          });
          environment =
            environmentType === 'MultiActorEnvironment'
              ? multiActorEnvironment.forActor(getActorIdentifier('actor:1234'))
              : new RelayModernEnvironment({
                  network: RelayNetwork.create(fetch),
                  store,
                  operationLoader,
                  scheduler,
                });
        });
        it('processes deferred payloads that had arrived before parent @module in a single scheduler step', () => {
          environment.execute({operation}).subscribe(callbacks);
          dataSource.next({
            data: {
              node: {
                id: '1',
                __typename: 'User',
                __module_component_RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery:
                  'User.react',
                __module_operation_RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery:
                  'RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$normalization.graphql',
              },
              viewer: {
                actor: {
                  id: '2',
                  __typename: 'User',
                  __module_component_RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery_actor:
                    'Actor.react',
                  __module_operation_RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserQuery_actor:
                    'RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$normalization.graphql',
                },
              },
            },
          });
          jest.runAllTimers();

          expect(tasks.size).toBe(1);
          runTask();

          next.mockClear();
          userCallback.mockClear();
          actorCallback.mockClear();

          dataSource.next({
            data: {
              id: '1',
              __typename: 'User',
              name: 'Alice',
            },
            label:
              'RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$defer$UserFragment',
            path: ['node'],
          });
          dataSource.next({
            data: {
              id: '2',
              __typename: 'User',
              name: 'Bob',
            },
            label:
              'RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$defer$UserFragment',
            path: ['viewer', 'actor'],
          });
          jest.runAllTimers();

          expect(tasks.size).toBe(2);

          expectToWarn(
            'RelayPublishQueue.run was called, but the call would have been a noop.',
            () => {
              runTask();
            },
          );
          expectToWarn(
            'RelayPublishQueue.run was called, but the call would have been a noop.',
            () => {
              runTask();
            },
          );

          expect(userCallback).toBeCalledTimes(0);
          expect(actorCallback).toBeCalledTimes(0);
          expect(complete).toBeCalledTimes(0);
          expect(error).toBeCalledTimes(0);
          expect(next).toBeCalledTimes(2);

          resolveFragment(userNormalizationFragment);
          jest.runAllTimers();

          // Run scheduler task to process @module
          expect(tasks.size).toBe(1);
          runTask();

          // A new task should not have been scheduled to process the
          // deferred payloads, it should've be processed synchronously
          // in the same tasks
          expect(tasks.size).toBe(0);

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

          // Run scheduler task to process @module
          expect(tasks.size).toBe(1);
          runTask();

          // A new task should not have been scheduled to process the
          // deferred payloads, it should've be processed synchronously
          // in the same tasks
          expect(tasks.size).toBe(0);

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
      });
    });
  },
);

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
const RelayRecordSource = require('../RelayRecordSource');

const {
  getActorIdentifier,
  MultiActorEnvironment,
} = require('../../multi-actor-environment');
const {graphql, getFragment, getRequest} = require('../../query/GraphQLTag');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {createReaderSelector} = require('../RelayModernSelector');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

describe.each(['RelayModernEnvironment', 'MultiActorEnvironment'])(
  'applyUpdate()',
  environmentType => {
    let environment;
    let operation;
    let ParentQuery;
    let source;
    let store;
    let UserFragment;

    describe(environmentType, () => {
      beforeEach(() => {
        jest.resetModules();

        ParentQuery = getRequest(graphql`
          query RelayModernEnvironmentApplyUpdateTestParentQuery {
            me {
              id
              name
            }
          }
        `);
        UserFragment = getFragment(graphql`
          fragment RelayModernEnvironmentApplyUpdateTestUserFragment on User {
            id
            name
          }
        `);

        source = RelayRecordSource.create();
        store = new RelayModernStore(source);
        const multiActorEnvironment = new MultiActorEnvironment({
          createNetworkForActor: _actorID => RelayNetwork.create(jest.fn()),
          createStoreForActor: _actorID => store,
        });
        environment =
          environmentType === 'MultiActorEnvironment'
            ? multiActorEnvironment.forActor(getActorIdentifier('actor:1234'))
            : new RelayModernEnvironment({
                network: RelayNetwork.create(jest.fn()),
                store,
              });
        operation = createOperationDescriptor(ParentQuery, {});
      });

      it('applies the mutation to the store', () => {
        const selector = createReaderSelector(
          UserFragment,
          '4',
          {},
          operation.request,
        );
        const callback = jest.fn();
        const snapshot = environment.lookup(selector);
        environment.subscribe(snapshot, callback);

        environment.applyUpdate({
          storeUpdater: proxyStore => {
            const zuck = proxyStore.create('4', 'User');
            zuck.setValue('4', 'id');
            zuck.setValue('zuck', 'name');
          },
        });
        expect(callback.mock.calls.length).toBe(1);
        expect(callback.mock.calls[0][0].data).toEqual({
          id: '4',
          name: 'zuck',
        });
      });

      it('reverts mutations when disposed', () => {
        const selector = createReaderSelector(
          UserFragment,
          '4',
          {},
          operation.request,
        );
        const callback = jest.fn();
        const snapshot = environment.lookup(selector);
        environment.subscribe(snapshot, callback);

        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        const {dispose} = environment.applyUpdate({
          storeUpdater: proxyStore => {
            const zuck = proxyStore.create('4', 'User');
            zuck.setValue('zuck', 'name');
          },
        });
        callback.mockClear();
        dispose();
        expect(callback.mock.calls.length).toBe(1);
        expect(callback.mock.calls[0][0].data).toEqual(undefined);
      });

      it('can replace one mutation with another', () => {
        const selector = createReaderSelector(
          UserFragment,
          '4',
          {},
          operation.request,
        );
        const callback = jest.fn();
        const snapshot = environment.lookup(selector);
        environment.subscribe(snapshot, callback);

        callback.mockClear();
        const updater = {
          storeUpdater: proxyStore => {
            const zuck = proxyStore.create('4', 'User');
            zuck.setValue('4', 'id');
          },
        };
        environment.applyUpdate(updater);
        environment.replaceUpdate(updater, {
          storeUpdater: proxyStore => {
            const zuck = proxyStore.create('4', 'User');
            zuck.setValue('4', 'id');
            zuck.setValue('zuck', 'name');
          },
        });
        expect(callback.mock.calls.length).toBe(2);
        expect(callback.mock.calls[0][0].data).toEqual({
          id: '4',
        });
        expect(callback.mock.calls[1][0].data).toEqual({
          id: '4',
          name: 'zuck',
        });
      });

      it('notifies the subscription when an optimistic update is reverted after commiting a server response for the same operation and also does not update the data subscribed', () => {
        const selector = createReaderSelector(
          UserFragment,
          '4',
          {},
          operation.request,
        );
        const callback = jest.fn();
        const snapshot = environment.lookup(selector);
        expect(snapshot.data).toEqual(undefined);
        environment.subscribe(snapshot, callback);

        const disposable = environment.applyUpdate({
          storeUpdater: proxyStore => {
            const zuck = proxyStore.create('4', 'User');
            zuck.setValue('4', 'id');
            zuck.setValue('zuck', 'name');
          },
        });
        expect(callback.mock.calls.length).toBe(1);
        expect(callback.mock.calls[0][0].data).toEqual({
          id: '4',
          name: 'zuck',
        });

        callback.mockClear();
        environment.commitPayload(operation, {
          me: null,
        });
        expect(callback.mock.calls.length).toBe(0);

        disposable.dispose();
        expect(callback.mock.calls.length).toBe(1);
        expect(callback.mock.calls[0][0].data).toEqual(undefined);

        callback.mockClear();
        const disposable2 = environment.applyUpdate({
          storeUpdater: proxyStore => {
            const zuck = proxyStore.get('4') ?? proxyStore.create('4', 'User');
            zuck.setValue('4', 'id');
            zuck.setValue('Mark', 'name');
          },
        });
        expect(callback.mock.calls.length).toBe(1);
        expect(callback.mock.calls[0][0].data).toEqual({
          id: '4',
          name: 'Mark',
        });

        callback.mockClear();
        environment.commitPayload(operation, {
          me: {
            id: '4',
            name: 'Zuck',
          },
        });
        // no updates, overridden by still-applied optimistic update
        expect(callback.mock.calls.length).toBe(0);

        callback.mockClear();
        disposable2.dispose();
        expect(callback.mock.calls.length).toBe(1);
        expect(callback.mock.calls[0][0].data).toEqual({
          id: '4',
          name: 'Zuck', // reverts to latest final value
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
          environment = new RelayModernEnvironment({
            network: RelayNetwork.create(jest.fn()),
            scheduler,
            store,
          });
        });

        it('applies the mutation to the store', () => {
          const selector = createReaderSelector(
            UserFragment,
            '4',
            {},
            operation.request,
          );
          const callback = jest.fn();
          const snapshot = environment.lookup(selector);
          environment.subscribe(snapshot, callback);

          environment.applyUpdate({
            storeUpdater: proxyStore => {
              const zuck = proxyStore.create('4', 'User');
              zuck.setValue('4', 'id');
              zuck.setValue('zuck', 'name');
            },
          });

          // Verify task was scheduled and run it
          expect(tasks.size).toBe(1);
          runTask();

          // Update is applied after scheduler runs scheduled tas
          expect(callback.mock.calls.length).toBe(1);
          expect(callback.mock.calls[0][0].data).toEqual({
            id: '4',
            name: 'zuck',
          });
        });

        it('reverts mutations when disposed', () => {
          const selector = createReaderSelector(
            UserFragment,
            '4',
            {},
            operation.request,
          );
          const callback = jest.fn();
          const snapshot = environment.lookup(selector);
          environment.subscribe(snapshot, callback);

          // $FlowFixMe[method-unbinding] added when improving typing for this parameters
          const {dispose} = environment.applyUpdate({
            storeUpdater: proxyStore => {
              const zuck = proxyStore.create('4', 'User');
              zuck.setValue('zuck', 'name');
            },
          });

          // Verify task was scheduled and run it
          expect(tasks.size).toBe(1);
          runTask();

          callback.mockClear();

          dispose();

          // Verify task was scheduled and run it
          expect(tasks.size).toBe(1);
          runTask();

          // Update is reverted after scheduler runs scheduled tas
          expect(callback.mock.calls.length).toBe(1);
          expect(callback.mock.calls[0][0].data).toEqual(undefined);
        });

        it('can replace one mutation with another', () => {
          const selector = createReaderSelector(
            UserFragment,
            '4',
            {},
            operation.request,
          );
          const callback = jest.fn();
          const snapshot = environment.lookup(selector);
          environment.subscribe(snapshot, callback);

          callback.mockClear();
          const updater = {
            storeUpdater: proxyStore => {
              const zuck = proxyStore.create('4', 'User');
              zuck.setValue('4', 'id');
            },
          };
          environment.applyUpdate(updater);
          environment.replaceUpdate(updater, {
            storeUpdater: proxyStore => {
              const zuck = proxyStore.create('4', 'User');
              zuck.setValue('4', 'id');
              zuck.setValue('zuck', 'name');
            },
          });

          // Verify tasks were scheduled and run them
          expect(tasks.size).toBe(2);
          runTask();
          runTask();

          // Updates are applied after scheduler runs scheduled tasks
          expect(callback.mock.calls.length).toBe(2);
          expect(callback.mock.calls[0][0].data).toEqual({
            id: '4',
          });
          expect(callback.mock.calls[1][0].data).toEqual({
            id: '4',
            name: 'zuck',
          });
        });

        it('notifies the subscription when an optimistic update is reverted after commiting a server response for the same operation and also does not update the data subscribed', () => {
          const selector = createReaderSelector(
            UserFragment,
            '4',
            {},
            operation.request,
          );
          const callback = jest.fn();
          const snapshot = environment.lookup(selector);
          expect(snapshot.data).toEqual(undefined);
          environment.subscribe(snapshot, callback);

          const disposable = environment.applyUpdate({
            storeUpdater: proxyStore => {
              const zuck = proxyStore.create('4', 'User');
              zuck.setValue('4', 'id');
              zuck.setValue('zuck', 'name');
            },
          });
          // Verify task was scheduled and run it
          expect(tasks.size).toBe(1);
          runTask();

          expect(callback.mock.calls.length).toBe(1);
          expect(callback.mock.calls[0][0].data).toEqual({
            id: '4',
            name: 'zuck',
          });

          callback.mockClear();
          environment.commitPayload(operation, {
            me: null,
          });
          // Verify task was scheduled and run it
          expect(tasks.size).toBe(1);
          runTask();
          expect(callback.mock.calls.length).toBe(0);

          disposable.dispose();
          // Verify task was scheduled and run it
          expect(tasks.size).toBe(1);
          runTask();
          expect(callback.mock.calls.length).toBe(1);
          expect(callback.mock.calls[0][0].data).toEqual(undefined);

          callback.mockClear();
          const disposable2 = environment.applyUpdate({
            storeUpdater: proxyStore => {
              const zuck =
                proxyStore.get('4') ?? proxyStore.create('4', 'User');
              zuck.setValue('4', 'id');
              zuck.setValue('Mark', 'name');
            },
          });
          // Verify task was scheduled and run it
          expect(tasks.size).toBe(1);
          runTask();
          expect(callback.mock.calls.length).toBe(1);
          expect(callback.mock.calls[0][0].data).toEqual({
            id: '4',
            name: 'Mark',
          });

          callback.mockClear();
          environment.commitPayload(operation, {
            me: {
              id: '4',
              name: 'Zuck',
            },
          });
          // Verify task was scheduled and run it
          expect(tasks.size).toBe(1);
          runTask();
          // no updates, overridden by still-applied optimistic update
          expect(callback.mock.calls.length).toBe(0);

          callback.mockClear();
          disposable2.dispose();
          // Verify task was scheduled and run it
          expect(tasks.size).toBe(1);
          runTask();
          expect(callback.mock.calls.length).toBe(1);
          expect(callback.mock.calls[0][0].data).toEqual({
            id: '4',
            name: 'Zuck', // reverts to latest final value
          });
        });
      });
    });
  },
);

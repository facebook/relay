/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const {graphql} = require('../../query/GraphQLTag');
const getRelayHandleKey = require('../../util/getRelayHandleKey');
const defaultGetDataID = require('../defaultGetDataID');
const normalizeRelayPayload = require('../normalizeRelayPayload');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const RelayModernRecord = require('../RelayModernRecord');
const RelayModernStore = require('../RelayModernStore');
const RelayPublishQueue = require('../RelayPublishQueue');
const RelayRecordSource = require('../RelayRecordSource');
const {
  ID_KEY,
  REF_KEY,
  ROOT_ID,
  ROOT_TYPE,
  TYPENAME_KEY,
} = require('../RelayStoreUtils');
const invariant = require('invariant');
const {
  disallowWarnings,
  expectToWarn,
  expectWarningWillFire,
  simpleClone,
} = require('relay-test-utils-internal');

disallowWarnings();

describe('RelayPublishQueue', () => {
  beforeEach(() => {
    global.ErrorUtils = {
      applyWithGuard: jest.fn((callback, context, params) => {
        try {
          callback.apply(context, params);
        } catch (guarded) {} // eslint-disable-line lint/no-unused-catch-bindings
      }),
    };
  });

  describe('applyUpdate()/revertUpdate()', () => {
    let operationDescriptor;
    let operationDescriptorAliased;
    let source;
    let store;

    const initialData = {
      [ROOT_ID]: {
        __id: ROOT_ID,
        __typename: ROOT_TYPE,
      },
      4: {
        [ID_KEY]: '4',
        [TYPENAME_KEY]: 'User',
        // id: '4',
        hometown: {[REF_KEY]: 'mpk'},
        log: '',
        name: 'Mark',
        pet: {[REF_KEY]: 'beast'},
        'address(location:"WORK")': '1 Hacker Way',
      },
      660361306: {
        [ID_KEY]: '660361306',
        [TYPENAME_KEY]: 'User',
        status: 'alive',
      },
      beast: {
        [ID_KEY]: 'beast',
        [TYPENAME_KEY]: 'Page',
        name: 'Beast',
        owner: {[REF_KEY]: '4'},
      },
      mpk: {
        [ID_KEY]: 'mpk',
        [TYPENAME_KEY]: 'Page',
        name: 'Menlo Park',
        mayor: null,
        population: 9000,
      },
    };

    beforeEach(() => {
      source = new RelayRecordSource(simpleClone(initialData));
      store = new RelayModernStore(source);
      const mutationQuery = graphql`
        mutation RelayPublishQueueTest1Mutation($input: ActorNameChangeInput!) {
          actorNameChange(input: $input) {
            actor {
              name
            }
          }
        }
      `;

      const mutationQueryAliased = graphql`
        mutation RelayPublishQueueTest2Mutation($input: ActorNameChangeInput!) {
          changeName: actorNameChange(input: $input) {
            actor {
              name
            }
          }
        }
      `;

      const variables = {
        input: {
          clientMutationId: '0',
          newName: 'zuck',
        },
      };
      operationDescriptor = createOperationDescriptor(mutationQuery, variables);
      operationDescriptorAliased = createOperationDescriptor(
        mutationQueryAliased,
        variables,
      );
    });

    it('runs an `storeUpdater` and applies the changes to the store', () => {
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      const optimisticUpdate = {
        storeUpdater: storeProxy => {
          const zuck = storeProxy.get('4');
          zuck.setValue('zuck', 'name');
        },
      };
      queue.applyUpdate(optimisticUpdate);
      let sourceData = store.getSource().toJSON();
      expect(sourceData).toEqual(initialData);
      queue.run();
      sourceData = store.getSource().toJSON();
      expect(sourceData).toEqual({
        ...initialData,
        4: {
          ...initialData['4'],
          name: 'zuck',
        },
      });
    });

    it('runs an `selectorStoreUpdater` and applies the changes to the store', () => {
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      const payload = normalizeRelayPayload(
        operationDescriptor.root,
        {
          actorNameChange: {
            actor: {
              id: '4',
              name: 'zuck',
              __typename: 'Actor',
            },
          },
        },
        null,
        {getDataID: defaultGetDataID},
      );
      const optimisticUpdate = {
        operation: operationDescriptor,
        payload,
        updater: null,
      };
      queue.applyUpdate(optimisticUpdate);
      let sourceData = store.getSource().toJSON();
      expect(sourceData).toEqual(initialData);
      queue.run();
      sourceData = store.getSource().toJSON();
      expect(sourceData['4'].name).toEqual('zuck');
    });

    it('handles aliases correctly when used with optimistic update', () => {
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      const payload = normalizeRelayPayload(
        operationDescriptorAliased.root,
        {
          changeName: {
            actor: {
              id: '4',
              name: 'zuck',
              __typename: 'Actor',
            },
          },
        },
        null,
        {getDataID: defaultGetDataID},
      );
      const optimisticUpdate = {
        operation: operationDescriptorAliased,
        payload,
        updater: null,
      };
      queue.applyUpdate(optimisticUpdate);
      let sourceData = store.getSource().toJSON();
      expect(sourceData).toEqual(initialData);
      queue.run();
      sourceData = store.getSource().toJSON();
      expect(sourceData['4'].name).toEqual('zuck');
    });

    it('unpublishes changes from `storeUpdater` when reverted in the same run()', () => {
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      const optimisticUpdate = {
        storeUpdater: storeProxy => {
          const zuck = storeProxy.get('4');
          zuck.setValue('zuck', 'name');
        },
      };
      queue.applyUpdate(optimisticUpdate);
      queue.revertUpdate(optimisticUpdate);
      let sourceData = store.getSource().toJSON();
      expect(sourceData).toEqual(initialData);
      expectWarningWillFire(
        'RelayPublishQueue.run was called, but the call would have been a noop.',
      );
      queue.run();
      sourceData = store.getSource().toJSON();
      expect(sourceData).toEqual(initialData);
    });

    it('unpublishes changes from `selectorStoreUpdater` when reverted in the same run()', () => {
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      const payload = normalizeRelayPayload(
        operationDescriptor.root,
        {
          actorNameChange: {
            actor: {
              id: '4',
              name: 'zuck',
              __typename: 'Actor',
            },
          },
        },
        null,
        {getDataID: defaultGetDataID},
      );
      const optimisticUpdate = {
        operation: operationDescriptor,
        source: payload.source,
      };
      queue.applyUpdate(optimisticUpdate);
      queue.revertUpdate(optimisticUpdate);
      let sourceData = store.getSource().toJSON();
      expect(sourceData).toEqual(initialData);
      expectWarningWillFire(
        'RelayPublishQueue.run was called, but the call would have been a noop.',
      );
      queue.run();
      sourceData = store.getSource().toJSON();
      expect(sourceData).toEqual(initialData);
    });

    it('unpublishes changes from `storeUpdater` when reverted in a subsequent run()', () => {
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      const optimisticUpdate = {
        storeUpdater: storeProxy => {
          const zuck = storeProxy.get('4');
          zuck.setValue('zuck', 'name');
        },
      };
      queue.applyUpdate(optimisticUpdate);
      queue.run();
      queue.revertUpdate(optimisticUpdate);
      let sourceData = store.getSource().toJSON();
      expect(sourceData).not.toEqual(initialData);
      queue.run();
      sourceData = store.getSource().toJSON();
      expect(sourceData).toEqual(initialData);
    });

    it('unpublishes changes from `selectorStoreUpdater` when reverted in a subsequent run()', () => {
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      const payload = normalizeRelayPayload(
        operationDescriptor.root,
        {
          actorNameChange: {
            actor: {
              id: '4',
              name: 'zuck',
              __typename: 'Actor',
            },
          },
        },
        null,
        {getDataID: defaultGetDataID},
      );
      const optimisticUpdate = {
        operation: operationDescriptor,
        payload,
        updater: null,
      };
      queue.applyUpdate(optimisticUpdate);
      queue.run();
      queue.revertUpdate(optimisticUpdate);
      let sourceData = store.getSource().toJSON();
      expect(sourceData).not.toEqual(initialData);
      queue.run();
      sourceData = store.getSource().toJSON();
      expect(sourceData).toEqual(initialData);
    });

    it('applies multiple updaters in the same run()', () => {
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      const payload = normalizeRelayPayload(
        operationDescriptor.root,
        {
          actorNameChange: {
            actor: {
              id: '4',
              name: 'zuck',
              __typename: 'Actor',
            },
          },
        },
        null,
        {getDataID: defaultGetDataID},
      );
      queue.applyUpdate({
        operation: operationDescriptor,
        payload,
        updater: null,
      });
      queue.applyUpdate({
        storeUpdater: storeProxy => {
          const zuck = storeProxy.get('4');
          zuck.setValue(zuck.getValue('name').toUpperCase(), 'name');
        },
      });
      let sourceData = store.getSource().toJSON();
      expect(sourceData).toEqual(initialData);
      queue.run();
      sourceData = store.getSource().toJSON();
      expect(sourceData['4'].name).toEqual('ZUCK');
    });

    it('applies updates in subsequent run()s (payload then updater)', () => {
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      const payload = normalizeRelayPayload(
        operationDescriptor.root,
        {
          actorNameChange: {
            actor: {
              id: '4',
              name: 'zuck',
              __typename: 'Actor',
            },
          },
        },
        null,
        {getDataID: defaultGetDataID},
      );
      queue.applyUpdate({
        operation: operationDescriptor,
        payload,
        updater: null,
      });
      queue.run();
      queue.applyUpdate({
        storeUpdater: storeProxy => {
          const zuck = storeProxy.get('4');
          zuck.setValue(zuck.getValue('name').toUpperCase(), 'name');
        },
      });
      queue.run();
      const sourceData = store.getSource().toJSON();
      expect(sourceData['4'].name).toEqual('ZUCK');
    });

    it('applies updates in subsequent run()s (updater then updater)', () => {
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      const optimisticUpdate = {
        storeUpdater: storeProxy => {
          const zuck = storeProxy.get('4');
          zuck.setValue('zuck', 'name');
        },
      };
      const optimisticUpdate2 = {
        storeUpdater: storeProxy => {
          const zuck = storeProxy.get('4');
          zuck.setValue('zuckerberg', 'lastName');
        },
      };
      queue.applyUpdate(optimisticUpdate);
      queue.applyUpdate(optimisticUpdate2);
      queue.run();
      const sourceData = store.getSource().toJSON();
      expect(sourceData).toEqual({
        ...initialData,
        4: {
          ...initialData['4'],
          name: 'zuck', // from first updater
          lastName: 'zuckerberg', // from second updater
        },
      });
    });

    it('applies updates in subsequent run()s (payload then payload)', () => {
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      // First set `name`.
      const nameMutation = graphql`
        mutation RelayPublishQueueTest3Mutation($input: ActorNameChangeInput!) {
          actorNameChange(input: $input) {
            actor {
              name
            }
          }
        }
      `;
      const nameMutationDescriptor = createOperationDescriptor(nameMutation, {
        input: {},
      });
      const nameMutatorPayload = normalizeRelayPayload(
        nameMutationDescriptor.root,
        {
          actorNameChange: {
            actor: {
              __typename: 'User',
              id: '4',
              name: 'zuck',
            },
          },
        },
        null,
        {getDataID: defaultGetDataID},
      );
      queue.applyUpdate({
        operation: nameMutationDescriptor,
        payload: nameMutatorPayload,
        updater: null,
      });
      // Next set `lastName`.
      const lastNameMutation = graphql`
        mutation RelayPublishQueueTest4Mutation($input: ActorNameChangeInput!) {
          actorNameChange(input: $input) {
            actor {
              lastName
            }
          }
        }
      `;
      const lastNameMutationDescriptor = createOperationDescriptor(
        lastNameMutation,
        {input: {}},
      );
      const lastNamePayload = normalizeRelayPayload(
        lastNameMutationDescriptor.root,
        {
          actorNameChange: {
            actor: {
              __typename: 'User',
              id: '4',
              lastName: 'zuckerberg',
            },
          },
        },
        null,
        {getDataID: defaultGetDataID},
      );
      queue.applyUpdate({
        operation: lastNameMutationDescriptor,
        payload: lastNamePayload,
        updater: null,
      });
      queue.run();
      const sourceData = store.getSource().toJSON();
      expect(sourceData).toEqual({
        ...initialData,
        [ROOT_ID]: {
          ...initialData[ROOT_ID],
          'actorNameChange(input:{})': {
            __ref: 'client:root:actorNameChange(input:{})',
          },
        },
        'client:root:actorNameChange(input:{})': {
          __id: 'client:root:actorNameChange(input:{})',
          __typename: 'ActorNameChangePayload',
          actor: {__ref: '4'},
        },
        4: {
          ...initialData['4'],
          id: '4',
          name: 'zuck', // from first updater
          lastName: 'zuckerberg', // from second updater
        },
      });
    });

    it('rebases changes when an earlier change is reverted', () => {
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      const payload = normalizeRelayPayload(
        operationDescriptor.root,
        {
          actorNameChange: {
            actor: {
              id: '4',
              name: 'zuck',
              __typename: 'Actor',
            },
          },
        },
        null,
        {getDataID: defaultGetDataID},
      );
      const optimisticUpdate = {
        operation: operationDescriptor,
        payload,
        updater: null,
      };
      queue.applyUpdate(optimisticUpdate);
      // The second update should be applied to the reverted store state
      queue.applyUpdate({
        storeUpdater: storeProxy => {
          const zuck = storeProxy.get('4');
          zuck.setValue(zuck.getValue('name').toUpperCase(), 'name');
        },
      });
      queue.run();
      // Cause a rebase
      queue.revertUpdate(optimisticUpdate);
      queue.run();
      const sourceData = store.getSource().toJSON();
      expect(sourceData).toEqual({
        ...initialData,
        4: {
          ...initialData['4'],
          name: 'MARK',
        },
      });
    });

    it('rebases multiple changes on the same value', () => {
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      const incrementPopulation = {
        storeUpdater: storeProxy => {
          const mpk = storeProxy.get('mpk');
          invariant(mpk, 'should have mpk');
          const population = mpk.getValue('population');
          mpk.setValue(population + 1000, 'population');
        },
      };
      const doublePopulation = {
        storeUpdater: storeProxy => {
          const mpk = storeProxy.get('mpk');
          invariant(mpk, 'should have mpk');
          const population = mpk.getValue('population');
          mpk.setValue(population * 2, 'population');
        },
      };

      const getPopulation = () => {
        const sourceData = store.getSource().toJSON();
        return sourceData.mpk.population;
      };

      expect(getPopulation()).toBe(9000);

      queue.applyUpdate(incrementPopulation);
      queue.run();
      expect(getPopulation()).toBe(10000);

      queue.applyUpdate(doublePopulation);
      queue.run();
      expect(getPopulation()).toBe(20000);

      queue.revertUpdate(incrementPopulation);
      queue.run();
      expect(getPopulation()).toBe(18000);
    });

    it('unpublishes previously rebased changes when reverted', () => {
      // Test that backups are created correctly during a rebase
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      const mutation1 = {
        storeUpdater: storeProxy => {
          const zuck = storeProxy.get('4');
          zuck.setValue('Zuckerberg', 'name');
        },
      };
      const mutation2 = {
        storeUpdater: storeProxy => {
          const zuck = storeProxy.get('4');
          zuck.setValue('Mark Zuckerberg', 'name');
        },
      };
      queue.applyUpdate(mutation1);
      queue.applyUpdate(mutation2);
      queue.run();
      // Cause a rebase
      queue.revertUpdate(mutation1);
      queue.run();
      // Revert the rebased change
      queue.revertUpdate(mutation2);
      let sourceData = store.getSource().toJSON();
      expect(sourceData).not.toEqual(initialData);
      queue.run();
      sourceData = store.getSource().toJSON();
      // Ensures the intermediate backup was correct
      expect(sourceData).toEqual(initialData);
    });
  });

  describe('revertAll()', () => {
    let initialData;
    let source;
    let store;

    beforeEach(() => {
      initialData = {
        [ROOT_ID]: {
          [ID_KEY]: ROOT_ID,
          [TYPENAME_KEY]: ROOT_TYPE,
        },
        4: {
          [ID_KEY]: '4',
          [TYPENAME_KEY]: 'User',
          name: 'Mark',
        },
      };
      source = new RelayRecordSource(simpleClone(initialData));
      store = new RelayModernStore(source);
    });

    it('reverts executed changes', () => {
      const publish = jest.spyOn(store, 'publish');
      const restore = jest.spyOn(store, 'restore');
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      // Run the updates
      queue.applyUpdate({
        storeUpdater: storeProxy => {
          const zuck = storeProxy.get('4');
          zuck.setValue('zuck', 'name');
        },
      });
      queue.applyUpdate({
        storeUpdater: storeProxy => {
          const zuck = storeProxy.get('4');
          zuck.setValue(zuck.getValue('name').toUpperCase(), 'name');
        },
      });
      queue.run();
      expect(store.publish.mock.calls.length).toBe(1);
      publish.mockClear();

      // Then run the revert
      queue.revertAll();
      let sourceData = store.getSource().toJSON();
      expect(sourceData).not.toEqual(initialData);
      expect(restore).toBeCalledTimes(0);
      queue.run();
      sourceData = store.getSource().toJSON();
      expect(sourceData).toEqual(initialData);
      expect(publish).toBeCalledTimes(0);
      expect(restore).toBeCalledTimes(1);
    });

    it('reverts partially executed/unexecuted changes', () => {
      const publish = jest.spyOn(store, 'publish');
      const restore = jest.spyOn(store, 'restore');
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      // Run the first update
      queue.applyUpdate({
        storeUpdater: storeProxy => {
          const zuck = storeProxy.get('4');
          zuck.setValue('zuck', 'name');
        },
      });
      queue.run();
      // Apply a second update
      queue.applyUpdate({
        storeUpdater: storeProxy => {
          const zuck = storeProxy.get('4');
          zuck.setValue(zuck.getValue('name').toUpperCase(), 'name');
        },
      });
      publish.mockClear();

      // Then run the revert
      queue.revertAll();
      let sourceData = store.getSource().toJSON();
      expect(sourceData).not.toEqual(initialData);
      expect(restore).toBeCalledTimes(0);
      queue.run();
      sourceData = store.getSource().toJSON();
      expect(sourceData).toEqual(initialData);
      expect(publish).toBeCalledTimes(0);
      expect(restore).toBeCalledTimes(1);
    });

    it('reverts unexecuted changes', () => {
      store.publish = jest.fn(store.publish.bind(store));
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      // Apply but don't run the updates
      queue.applyUpdate({
        storeUpdater: storeProxy => {
          const zuck = storeProxy.get('4');
          zuck.setValue('zuck', 'name');
        },
      });
      queue.applyUpdate({
        storeUpdater: storeProxy => {
          const zuck = storeProxy.get('4');
          zuck.setValue(zuck.getValue('name').toUpperCase(), 'name');
        },
      });

      queue.revertAll();
      let sourceData = store.getSource().toJSON();
      expect(sourceData).toEqual(initialData);
      queue.run();
      sourceData = store.getSource().toJSON();
      expect(sourceData).toEqual(initialData);
      expect(store.publish.mock.calls.length).toBe(0);
    });

    it('reverts addition of new fields', () => {
      store.publish = jest.fn(store.publish.bind(store));
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      queue.applyUpdate({
        storeUpdater: storeProxy => {
          const zuck = storeProxy.get('4');
          zuck.setValue('zuck124', 'username');
        },
      });
      queue.run();
      let sourceData = store.getSource().toJSON();
      expect(sourceData).not.toEqual(initialData);
      queue.revertAll();
      queue.run();
      sourceData = store.getSource().toJSON();
      expect(sourceData).toEqual(initialData);
    });

    it('reverts addition of linked field', () => {
      store.publish = jest.fn(store.publish.bind(store));
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      queue.applyUpdate({
        storeUpdater: storeProxy => {
          const date = storeProxy.create('fookey', 'Date');
          date.setValue(14, 'day').setValue(5, 'month');
          const zuck = storeProxy.get('4');
          zuck.setLinkedRecord(date, 'birthdate');
        },
      });
      queue.run();
      let sourceData = store.getSource().toJSON();
      expect(sourceData).not.toEqual(initialData);
      queue.revertAll();
      queue.run();
      sourceData = store.getSource().toJSON();
      expect(sourceData).toEqual(initialData);
    });

    it('reverts addition of linked fields', () => {
      store.publish = jest.fn(store.publish.bind(store));
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      queue.applyUpdate({
        storeUpdater: storeProxy => {
          const phone1 = storeProxy.create('fookey1', 'Phone');
          phone1.setValue(1234, 'phoneNumber');
          const phone2 = storeProxy.create('fookey2', 'Phone');
          phone2.setValue(5678, 'phoneNumber');
          const zuck = storeProxy.get('4');
          zuck.setLinkedRecords([phone1, phone2], 'allPhones');
        },
      });
      queue.run();
      let sourceData = store.getSource().toJSON();
      expect(sourceData).not.toEqual(initialData);
      queue.revertAll();
      queue.run();
      sourceData = store.getSource().toJSON();
      expect(sourceData).toEqual(initialData);
    });
  });

  describe('commitPayload()', () => {
    it('publishes the source to the store', () => {
      const notify = jest.fn(() => []);
      const publish = jest.fn();
      const source = new RelayRecordSource();
      const store = {
        getSource: () => source,
        notify,
        publish,
        holdGC: jest.fn(),
        restore: jest.fn(),
        snapshot: jest.fn(() => []),
      };
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      const publishSource = new RelayRecordSource();
      const ActorQuery = graphql`
        query RelayPublishQueueTest1Query {
          me {
            name
          }
        }
      `;

      queue.commitPayload(createOperationDescriptor(ActorQuery, {}), {
        source: publishSource,
      });
      expect(notify).not.toBeCalled();
      expect(publish).not.toBeCalled();
      queue.run();
      expect(publish.mock.calls.length).toBe(1);
      expect(publish.mock.calls[0][0]).toBe(publishSource);
      expect(notify.mock.calls.length).toBe(1);
    });

    it('runs the provided updater before publishing', () => {
      const notify = jest.fn(() => []);
      const publish = jest.fn();
      const source = new RelayRecordSource();
      const store = {
        getSource: () => source,
        notify,
        publish,
        holdGC: jest.fn(),
        restore: jest.fn(),
        snapshot: jest.fn(() => []),
      };
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      graphql`
        fragment RelayPublishQueueTest1Fragment on User {
          username
        }
      `;
      const ActorQuery = graphql`
        query RelayPublishQueueTest2Query {
          me {
            name
            ...RelayPublishQueueTest1Fragment
          }
          nodes(ids: ["4"]) {
            name
          }
        }
      `;
      const operation = createOperationDescriptor(ActorQuery, {});
      const updater = jest.fn((storeProxy, data) => {
        const zuck = storeProxy.getRootField('me');
        const nodes = storeProxy.getPluralRootField('nodes');
        expect(nodes.length).toBe(1);
        expect(nodes[0]).toBe(zuck);

        expect(data).toEqual({
          me: {
            __id: '4',
            __fragments: {RelayPublishQueueTest1Fragment: {}},
            __fragmentOwner: operation.request,
            __isWithinUnmatchedTypeRefinement: false,
            name: 'Zuck',
          },
          nodes: [{name: 'Zuck'}],
        });

        zuck.setValue(zuck.getValue('name').toUpperCase(), 'name');
      });
      queue.commitPayload(
        operation,
        {
          source: new RelayRecordSource({
            '4': {
              __id: '4',
              __typename: 'User',
              id: '4',
              name: 'Zuck',
              username: 'zuck',
            },
            'client:root': {
              __id: 'client:root',
              __typename: '__Root',
              me: {__ref: '4'},
              'nodes(ids:["4"])': {__refs: ['4']},
            },
          }),
        },
        updater,
      );
      expect(notify).not.toBeCalled();
      expect(publish).not.toBeCalled();
      expect(updater).not.toBeCalled();
      queue.run();
      expect(publish.mock.calls.length).toBe(1);
      expect(updater.mock.calls.length).toBe(1);
      const publishSource = publish.mock.calls[0][0];
      expect(publishSource.toJSON()).toEqual({
        '4': {
          __id: '4',
          __typename: 'User',
          id: '4',
          name: 'ZUCK',
          username: 'zuck',
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          me: {__ref: '4'},
          'nodes(ids:["4"])': {__refs: ['4']},
        },
      });
      expect(notify.mock.calls.length).toBe(1);
    });

    it('processes handle fields before publishing', () => {
      const notify = jest.fn(() => []);
      const publish = jest.fn();
      const source = new RelayRecordSource();
      const store = {
        getSource: () => source,
        notify,
        publish,
        holdGC: jest.fn(),
        restore: jest.fn(),
        snapshot: jest.fn(() => []),
      };
      const ScreennameHandler = {
        update(storeProxy, payload) {
          const record = storeProxy.get(payload.dataID);
          const linkedRecords = record.getLinkedRecords(payload.fieldKey);
          record.setLinkedRecords(
            [...linkedRecords].reverse(),
            payload.handleKey,
          );
        },
      };
      const NameHandler = {
        update(storeProxy, payload) {
          const record = storeProxy.get(payload.dataID);
          const name = record.getValue(payload.fieldKey);
          record.setValue(name.toUpperCase(), payload.handleKey);
        },
      };
      const handleProvider = name => {
        switch (name) {
          case 'handleScreennames':
            return ScreennameHandler;
          case 'handleName':
            return NameHandler;
        }
      };
      const queue = new RelayPublishQueue(store, handleProvider);

      const ActorQuery = graphql`
        query RelayPublishQueueTest3Query {
          me {
            screennames @__clientField(handle: "handleScreennames") {
              name @__clientField(handle: "handleName")
            }
          }
        }
      `;

      queue.commitPayload(createOperationDescriptor(ActorQuery, {}), {
        fieldPayloads: [
          {
            dataID: '4',
            fieldKey: 'screennames',
            handleKey: getRelayHandleKey(
              'handleScreennames',
              null,
              'screennames',
            ),
            handle: 'handleScreennames',
          },
          {
            dataID: 'client:4:screennames:0',
            fieldKey: 'name',
            handleKey: getRelayHandleKey('handleName', null, 'name'),
            handle: 'handleName',
          },
          {
            dataID: 'client:4:screennames:1',
            fieldKey: 'name',
            handleKey: getRelayHandleKey('handleName', null, 'name'),
            handle: 'handleName',
          },
        ],
        source: new RelayRecordSource({
          '4': {
            __id: '4',
            __typename: 'User',
            id: '4',
            screennames: {
              __refs: ['client:4:screennames:0', 'client:4:screennames:1'],
            },
          },
          'client:4:screennames:0': {
            __id: 'client:4:screennames:0',
            __typename: 'Screenname',
            name: 'zuck',
          },
          'client:4:screennames:1': {
            __id: 'client:4:screennames:1',
            __typename: 'Screenname',
            name: 'beast',
          },
          'client:root': {
            __id: 'client:root',
            __typename: '__Root',
            me: {__ref: '4'},
          },
        }),
      });
      expect(notify).not.toBeCalled();
      expect(publish).not.toBeCalled();
      queue.run();
      expect(publish.mock.calls.length).toBe(1);
      const publishSource = publish.mock.calls[0][0];
      expect(publishSource.toJSON()).toEqual({
        '4': {
          __id: '4',
          __typename: 'User',
          id: '4',
          screennames: {
            __refs: ['client:4:screennames:0', 'client:4:screennames:1'],
          },
          // reversed order
          __screennames_handleScreennames: {
            __refs: ['client:4:screennames:1', 'client:4:screennames:0'],
          },
        },
        'client:4:screennames:0': {
          __id: 'client:4:screennames:0',
          __typename: 'Screenname',
          name: 'zuck',
          // uppercase
          __name_handleName: 'ZUCK',
        },
        'client:4:screennames:1': {
          __id: 'client:4:screennames:1',
          __typename: 'Screenname',
          name: 'beast',
          // uppercase
          __name_handleName: 'BEAST',
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          me: {__ref: '4'},
        },
      });
      expect(notify.mock.calls.length).toBe(1);
    });

    it('applies optimistic updates and commits server data together', () => {
      const initialData = {
        4: {
          __id: '4',
          __typename: 'User',
          name: 'mark',
        },
      };
      const source = new RelayRecordSource(simpleClone(initialData));
      const store = new RelayModernStore(source);
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      // Set name to 'MARK' *without* running the update
      queue.applyUpdate({
        storeUpdater: storeProxy => {
          const zuck = storeProxy.get('4');
          zuck.setValue(zuck.getValue('name').toUpperCase(), 'name');
        },
      });
      const NameQuery = graphql`
        query RelayPublishQueueTest4Query {
          me {
            name
          }
        }
      `;
      // Query payload sets name to 'zuck'
      queue.commitPayload(createOperationDescriptor(NameQuery, {id: '4'}), {
        source: new RelayRecordSource({
          [ROOT_ID]: {
            [ID_KEY]: ROOT_ID,
            [TYPENAME_KEY]: ROOT_TYPE,
            me: {[REF_KEY]: '4'},
          },
          4: {
            [ID_KEY]: '4',
            [TYPENAME_KEY]: 'User',
            id: '4',
            name: 'zuck',
          },
        }),
      });
      // Run both the optimistic and server update
      queue.run();
      expect(store.getSource().toJSON()).toEqual({
        [ROOT_ID]: {
          __id: ROOT_ID,
          __typename: ROOT_TYPE,
          me: {[REF_KEY]: '4'},
        },
        4: {
          ...initialData['4'],
          id: '4', // added by server payload
          name: 'ZUCK', // optimistic update is re-applied on the new data
        },
      });
    });

    it('reverts/rebases optimistic updates when publishing server data', () => {
      const initialData = {
        4: {
          __id: '4',
          __typename: 'User',
          name: 'mark',
        },
      };
      const source = new RelayRecordSource(simpleClone(initialData));
      const store = new RelayModernStore(source);
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      // Set name to 'MARK', running the update immediately
      queue.applyUpdate({
        storeUpdater: storeProxy => {
          const zuck = storeProxy.get('4');
          zuck.setValue(zuck.getValue('name').toUpperCase(), 'name');
        },
      });
      queue.run();
      // Query payload sets name to 'zuck'
      const NameQuery = graphql`
        query RelayPublishQueueTest5Query {
          me {
            name
          }
        }
      `;
      queue.commitPayload(createOperationDescriptor(NameQuery, {id: '4'}), {
        source: new RelayRecordSource({
          [ROOT_ID]: {
            [ID_KEY]: ROOT_ID,
            [TYPENAME_KEY]: ROOT_TYPE,
            me: {[REF_KEY]: '4'},
          },
          4: {
            [ID_KEY]: '4',
            [TYPENAME_KEY]: 'User',
            id: '4',
            name: 'zuck',
          },
        }),
      });
      queue.run();
      // Optimistic update should rebase, capitalizing the new name
      expect(store.getSource().toJSON()).toEqual({
        [ROOT_ID]: {
          __id: ROOT_ID,
          __typename: ROOT_TYPE,
          me: {[REF_KEY]: '4'},
        },
        4: {
          ...initialData['4'],
          id: '4', // added by server payload
          name: 'ZUCK', // optimistic update is re-applied on the new data
        },
      });
    });

    it('can rollback an optimistic mutation after committing a payload', () => {
      const initialData = {
        4: {
          __id: '4',
          __typename: 'User',
          name: 'mark',
        },
      };
      const source = new RelayRecordSource(simpleClone(initialData));
      const store = new RelayModernStore(source);
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      // Set name to 'MARK'
      const mutation = {
        storeUpdater: storeProxy => {
          const zuck = storeProxy.get('4');
          zuck.setValue(zuck.getValue('name').toUpperCase(), 'name');
        },
      };
      queue.applyUpdate(mutation);
      const NameQuery = graphql`
        query RelayPublishQueueTest6Query {
          me {
            name
          }
        }
      `;
      // Query payload sets name to 'zuck'
      queue.commitPayload(createOperationDescriptor(NameQuery, {id: '4'}), {
        source: new RelayRecordSource({
          [ROOT_ID]: {
            [ID_KEY]: ROOT_ID,
            [TYPENAME_KEY]: ROOT_TYPE,
            me: {[REF_KEY]: '4'},
          },
          4: {
            [ID_KEY]: '4',
            [TYPENAME_KEY]: 'User',
            id: '4',
            name: 'zuck',
          },
        }),
      });
      queue.run();

      queue.revertUpdate(mutation);
      queue.run();
      expect(store.getSource().toJSON()).toEqual({
        [ROOT_ID]: {
          __id: ROOT_ID,
          __typename: ROOT_TYPE,
          me: {[REF_KEY]: '4'},
        },
        4: {
          ...initialData['4'],
          id: '4', // added by server payload
          name: 'zuck', // reverts to the server data, not initial data
        },
      });
    });

    it('can rollback an optimistic mutation after committing an updater', () => {
      const source = new RelayRecordSource({
        '84872': {
          __id: '84872',
          __typename: 'Amp',
          volume: 3,
        },
      });
      const store = new RelayModernStore(source);
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);

      const increaseVolumeUpdater = {
        storeUpdater: storeProxy => {
          const amp = storeProxy.get('84872');
          amp.setValue(amp.getValue('volume') + 1, 'volume');
        },
      };

      const setVolumeTo10Updater = storeProxy => {
        const amp = storeProxy.get('84872');
        amp.setValue(10, 'volume');
      };

      const getVolume = () => store.getSource().get('84872').volume;

      expect(getVolume()).toBe(3);

      queue.applyUpdate(increaseVolumeUpdater);
      queue.run();

      expect(getVolume()).toBe(4);

      queue.commitUpdate(setVolumeTo10Updater);
      queue.run();

      // All the way to 11.
      expect(getVolume()).toBe(11);

      queue.revertAll();
      queue.run();

      // The optimistic update (+1) is reverted, the client mutation (set 10)
      // remains.
      expect(getVolume()).toBe(10);
    });
    it('can commit payload with buggy updaters', () => {
      const initialData = {
        4: {
          __id: '4',
          __typename: 'User',
          name: 'mark',
        },
      };
      const source = new RelayRecordSource(simpleClone(initialData));
      const store = new RelayModernStore(source);
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      const buggyUpdater = storeProxy => {
        invariant(false, 'buggy updater throwing error');
      };
      const mutation = {
        storeUpdater: buggyUpdater,
      };
      queue.applyUpdate(mutation);
      queue.commitUpdate(buggyUpdater);
      const NameQuery = graphql`
        query RelayPublishQueueTest7Query {
          me {
            name
          }
        }
      `;
      // Query payload sets name to 'zuck'
      queue.commitPayload(createOperationDescriptor(NameQuery, {id: '4'}), {
        source: new RelayRecordSource({
          [ROOT_ID]: {
            [ID_KEY]: ROOT_ID,
            [TYPENAME_KEY]: ROOT_TYPE,
            me: {[REF_KEY]: '4'},
          },
          4: {
            [ID_KEY]: '4',
            [TYPENAME_KEY]: 'User',
            id: '4',
            name: 'zuck',
          },
        }),
      });
      queue.run();
      expect(store.getSource().toJSON()).toEqual({
        [ROOT_ID]: {
          __id: ROOT_ID,
          __typename: ROOT_TYPE,
          me: {[REF_KEY]: '4'},
        },
        4: {
          ...initialData['4'],
          id: '4', // added by server payload
          name: 'zuck', // reverts to the server data, not initial data
        },
      });
    });

    it('invalidates the store if invalidated via updater', () => {
      const notify = jest.fn(() => []);
      const publish = jest.fn();
      const source = new RelayRecordSource();
      const store = {
        getSource: () => source,
        notify,
        publish,
        holdGC: jest.fn(),
        restore: jest.fn(),
        snapshot: jest.fn(() => []),
      };
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      graphql`
        fragment RelayPublishQueueTest2Fragment on User {
          username
        }
      `;
      const ActorQuery = graphql`
        query RelayPublishQueueTest8Query {
          me {
            name
            ...RelayPublishQueueTest2Fragment
          }
          nodes(ids: ["4"]) {
            name
          }
        }
      `;

      const operation = createOperationDescriptor(ActorQuery, {});
      const updater = jest.fn((storeProxy, data) => {
        storeProxy.invalidateStore();
      });
      queue.commitPayload(
        operation,
        {
          source: new RelayRecordSource({
            '4': {
              __id: '4',
              __typename: 'User',
              id: '4',
              name: 'Zuck',
              username: 'zuck',
            },
            'client:root': {
              __id: 'client:root',
              __typename: '__Root',
              me: {__ref: '4'},
              'nodes(ids:["4"])': {__refs: ['4']},
            },
          }),
        },
        updater,
      );
      expect(notify).not.toBeCalled();
      expect(publish).not.toBeCalled();
      expect(updater).not.toBeCalled();
      queue.run();
      expect(publish.mock.calls.length).toBe(1);
      expect(updater.mock.calls.length).toBe(1);
      expect(publish.mock.calls.length).toBe(1);
      expect(notify.mock.calls.length).toBe(1);
      // Assert that we indicated to the store that it should be invalidated
      expect(notify.mock.calls[0][1]).toBe(true);
    });

    it('invalidates any ids marked as invalid via the updater', () => {
      const notify = jest.fn(() => []);
      const publish = jest.fn();
      const source = new RelayRecordSource();
      const store = {
        getSource: () => source,
        notify,
        publish,
        holdGC: jest.fn(),
        restore: jest.fn(),
        snapshot: jest.fn(() => []),
      };
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      graphql`
        fragment RelayPublishQueueTest3Fragment on User {
          username
        }
      `;
      const ActorQuery = graphql`
        query RelayPublishQueueTest9Query {
          me {
            name
            ...RelayPublishQueueTest3Fragment
          }
          nodes(ids: ["4"]) {
            name
          }
        }
      `;

      const operation = createOperationDescriptor(ActorQuery, {});
      const updater = jest.fn((storeProxy, data) => {
        const zuck = storeProxy.getRootField('me');
        if (!zuck) {
          throw new Error('Expected to `me` root field');
        }
        zuck.invalidateRecord();
      });
      queue.commitPayload(
        operation,
        {
          source: new RelayRecordSource({
            '4': {
              __id: '4',
              __typename: 'User',
              id: '4',
              name: 'Zuck',
              username: 'zuck',
            },
            'client:root': {
              __id: 'client:root',
              __typename: '__Root',
              me: {__ref: '4'},
              'nodes(ids:["4"])': {__refs: ['4']},
            },
          }),
        },
        updater,
      );
      expect(notify).not.toBeCalled();
      expect(publish).not.toBeCalled();
      expect(updater).not.toBeCalled();
      queue.run();
      expect(publish.mock.calls.length).toBe(1);
      expect(updater.mock.calls.length).toBe(1);
      expect(publish.mock.calls.length).toBe(1);
      // Assert that we indicated to the store that that id should be invalidated
      expect(Array.from(publish.mock.calls[0][1])).toEqual(['4']);
      expect(notify.mock.calls.length).toBe(1);
      expect(notify.mock.calls[0][1]).toBe(false);
    });
  });

  describe('commitSource()', () => {
    it('publishes the source to the store', () => {
      const notify = jest.fn(() => []);
      const publish = jest.fn();
      const store_source = new RelayRecordSource();
      const store = {
        getSource: () => store_source,
        notify,
        publish,
        holdGC: jest.fn(),
        restore: jest.fn(),
        snapshot: jest.fn(() => []),
      };
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);

      const source = new RelayRecordSource();
      const user = RelayModernRecord.create('1364586419', 'User');
      RelayModernRecord.setValue(user, 'name', 'Jan');
      source.set('1364586419', user);
      queue.commitSource(source);
      expect(notify).not.toBeCalled();
      expect(publish).not.toBeCalled();
      queue.run();
      expect(publish.mock.calls[0][0].toJSON()).toEqual({
        '1364586419': {
          __id: '1364586419',
          __typename: 'User',
          name: 'Jan',
        },
      });
      expect(notify.mock.calls.length).toBe(1);
    });

    describe('it commits in order', () => {
      let namePayload, nameSelector, nameSource, queue, source, store;
      beforeEach(() => {
        source = new RelayRecordSource({});
        store = new RelayModernStore(source);
        queue = new RelayPublishQueue(store, null, defaultGetDataID);
        const nameQuery = graphql`
          query RelayPublishQueueTest11Query {
            me {
              name
            }
          }
        `;
        nameSelector = createOperationDescriptor(nameQuery, {id: '4'});
        namePayload = {
          source: new RelayRecordSource({
            [ROOT_ID]: {
              [ID_KEY]: ROOT_ID,
              [TYPENAME_KEY]: ROOT_TYPE,
              me: {[REF_KEY]: '4'},
            },
            4: {
              [ID_KEY]: '4',
              [TYPENAME_KEY]: 'User',
              id: '4',
              name: 'zuck',
            },
          }),
        };
        nameSource = new RelayRecordSource({
          4: {
            [ID_KEY]: '4',
            [TYPENAME_KEY]: 'User',
            id: '4',
            name: 'mark',
          },
        });
      });

      it('commits a source and then payload', () => {
        queue.commitSource(nameSource); // sets name as mark
        queue.commitPayload(nameSelector, namePayload); // sets name as zuck
        queue.run();
        expect(store.getSource().toJSON()).toEqual({
          [ROOT_ID]: {
            __id: ROOT_ID,
            __typename: ROOT_TYPE,
            me: {[REF_KEY]: '4'},
          },
          4: {
            __id: '4',
            __typename: 'User',
            id: '4',
            name: 'zuck',
          },
        });
      });
      it('commits a payload and then a source', () => {
        queue.commitPayload(nameSelector, namePayload); // sets name as zuck
        queue.commitSource(nameSource); // sets name as mark
        queue.run();
        expect(store.getSource().toJSON()).toEqual({
          [ROOT_ID]: {
            __id: ROOT_ID,
            __typename: ROOT_TYPE,
            me: {[REF_KEY]: '4'},
          },
          4: {
            __id: '4',
            __typename: 'User',
            id: '4',
            name: 'mark',
          },
        });
      });
    });

    it('reverts/rebases optimistic updates when committing sources', () => {
      const initialData = {
        4: {
          __id: '4',
          __typename: 'User',
          name: 'mark',
        },
      };
      const source = new RelayRecordSource(simpleClone(initialData));
      const store = new RelayModernStore(source);
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      // Set name to 'MARK', running the update immediately
      queue.applyUpdate({
        storeUpdater: storeProxy => {
          const zuck = storeProxy.get('4');
          zuck.setValue(zuck.getValue('name').toUpperCase(), 'name');
        },
      });
      queue.run();
      queue.commitSource(
        new RelayRecordSource({
          4: {
            [ID_KEY]: '4',
            [TYPENAME_KEY]: 'User',
            id: '4',
            name: 'zuck',
          },
        }),
      );
      queue.run();
      // Optimistic update should rebase, capitalizing the new name
      expect(store.getSource().toJSON()).toEqual({
        4: {
          ...initialData['4'],
          id: '4', // added by server payload
          name: 'ZUCK', // optimistic update is re-applied on the new data
        },
        [ROOT_ID]: {
          __id: ROOT_ID,
          __typename: ROOT_TYPE,
        },
      });
    });

    it('can rollback an optimistic mutation after committing a source', () => {
      const initialData = {
        4: {
          __id: '4',
          __typename: 'User',
          name: 'mark',
        },
      };
      const source = new RelayRecordSource(simpleClone(initialData));
      const store = new RelayModernStore(source);
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      // Set name to 'MARK'
      const mutation = {
        storeUpdater: storeProxy => {
          const zuck = storeProxy.get('4');
          zuck.setValue(zuck.getValue('name').toUpperCase(), 'name');
        },
      };
      queue.applyUpdate(mutation);
      queue.commitSource(
        new RelayRecordSource({
          4: {
            [ID_KEY]: '4',
            [TYPENAME_KEY]: 'User',
            id: '4',
            name: 'zuck',
          },
        }),
      );
      queue.run();

      queue.revertUpdate(mutation);
      queue.run();
      expect(store.getSource().toJSON()).toEqual({
        4: {
          ...initialData['4'],
          id: '4', // added by server payload
          name: 'zuck', // reverts to the server data, not initial data
        },
        [ROOT_ID]: {
          __id: ROOT_ID,
          __typename: ROOT_TYPE,
        },
      });
    });
  });

  describe('commitUpdate()', () => {
    it('publishes the source to the store', () => {
      const notify = jest.fn(() => []);
      const publish = jest.fn();
      const source = new RelayRecordSource();
      const store = {
        getSource: () => source,
        notify,
        publish,
        holdGC: jest.fn(),
        restore: jest.fn(),
        snapshot: jest.fn(() => []),
      };
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      queue.commitUpdate(storeProxy => {
        const user = storeProxy.create('1364586419', 'User');
        user.setValue('Jan', 'name');
      });
      expect(notify).not.toBeCalled();
      expect(publish).not.toBeCalled();
      queue.run();
      expect(publish.mock.calls[0][0].toJSON()).toEqual({
        '1364586419': {
          __id: '1364586419',
          __typename: 'User',
          name: 'Jan',
        },
      });
      expect(notify.mock.calls.length).toBe(1);
    });

    it('invalidates the store if invalidated via updater', () => {
      const notify = jest.fn(() => []);
      const publish = jest.fn();
      const source = new RelayRecordSource();
      const store = {
        getSource: () => source,
        notify,
        publish,
        holdGC: jest.fn(),
        restore: jest.fn(),
        snapshot: jest.fn(() => []),
      };
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      queue.commitUpdate(storeProxy => {
        storeProxy.invalidateStore();
      });
      expect(notify).not.toBeCalled();
      expect(publish).not.toBeCalled();
      queue.run();
      expect(publish.mock.calls.length).toBe(1);
      expect(notify.mock.calls.length).toBe(1);
      // Assert that we indicated to the store that it should be invalidated
      expect(notify.mock.calls[0][1]).toBe(true);
    });

    it('invalidates any ids marked as invalid via the updater', () => {
      const notify = jest.fn(() => []);
      const publish = jest.fn();
      const source = new RelayRecordSource();
      const store = {
        getSource: () => source,
        notify,
        publish,
        holdGC: jest.fn(),
        restore: jest.fn(),
        snapshot: jest.fn(() => []),
      };
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      queue.commitUpdate(storeProxy => {
        const user = storeProxy.create('1364586419', 'User');
        user.setValue('Jan', 'name');
        user.invalidateRecord();
      });
      expect(notify).not.toBeCalled();
      expect(publish).not.toBeCalled();
      queue.run();
      expect(publish.mock.calls.length).toBe(1);
      // Assert that we indicated to the store that that id should be invalidated
      expect(Array.from(publish.mock.calls[0][1])).toEqual(['1364586419']);
      expect(notify.mock.calls.length).toBe(1);
      expect(notify.mock.calls[0][1]).toBe(false);
    });
  });

  describe('run()', () => {
    it('does not notify the store if no mutations have occurred', () => {
      const notify = jest.fn(() => []);
      const publish = jest.fn();
      const source = new RelayRecordSource();
      const store = {
        getSource: () => source,
        notify,
        publish,
        holdGC: jest.fn(),
        restore: jest.fn(),
        snapshot: jest.fn(() => []),
      };
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      expectWarningWillFire(
        'RelayPublishQueue.run was called, but the call would have been a noop.',
      );
      queue.run();
      expect(publish).not.toBeCalled();
      expect(notify).not.toBeCalled();
    });

    it('notifies the store if an optimistic mutation is applied', () => {
      const notify = jest.fn(() => []);
      const publish = jest.fn();
      const source = new RelayRecordSource();
      const store = {
        getSource: () => source,
        notify,
        publish,
        holdGC: jest.fn(),
        restore: jest.fn(),
        snapshot: jest.fn(() => []),
      };
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      queue.applyUpdate({
        storeUpdater: storeProxy => {
          storeProxy.create('4', 'User');
        },
      });
      queue.run();
      expect(publish).toBeCalled();
      expect(notify).toBeCalled();
    });

    it('notifies the store if an optimistic mutation is reverted', () => {
      const notify = jest.fn(() => []);
      const publish = jest.fn();
      const restore = jest.fn();
      const source = new RelayRecordSource();
      const store = {
        getSource: () => source,
        notify,
        publish,
        holdGC: jest.fn(),
        restore,
        snapshot: jest.fn(() => []),
      };
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      const mutation = {
        storeUpdater: storeProxy => {
          storeProxy.create('4', 'User');
        },
      };
      queue.applyUpdate(mutation);
      queue.run();
      notify.mockClear();
      publish.mockClear();

      queue.revertUpdate(mutation);
      queue.run();
      expect(publish).toBeCalledTimes(0);
      expect(notify).toBeCalledTimes(1);
      expect(restore).toBeCalledTimes(1);
    });

    it('notifies the store if a server mutation is committed', () => {
      const notify = jest.fn(() => []);
      const publish = jest.fn();
      const source = new RelayRecordSource();
      const store = {
        getSource: () => source,
        notify,
        publish,
        holdGC: jest.fn(),
        restore: jest.fn(),
        snapshot: jest.fn(() => []),
      };
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);

      const NameQuery = graphql`
        query RelayPublishQueueTest10Query {
          me {
            name
          }
        }
      `;
      // Query payload sets name to 'zuck'
      queue.commitPayload(createOperationDescriptor(NameQuery, {id: '4'}), {
        me: {
          id: '4',
          __typename: 'User',
          name: 'zuck',
        },
      });
      expect(notify).not.toBeCalled();
      expect(publish).not.toBeCalled();
      queue.run();
      expect(publish).toBeCalled();
      expect(notify).toBeCalled();
    });

    it('should disable CG if there are any applied optimistic updates', () => {
      const holdGC = jest.fn();
      const source = new RelayRecordSource();
      const store = {
        getSource: () => source,
        notify: jest.fn(() => []),
        publish: jest.fn(),
        holdGC,
        restore: jest.fn(),
        snapshot: jest.fn(() => []),
      };
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      const mutation = {
        storeUpdater: storeProxy => {
          storeProxy.create('4', 'User');
        },
      };
      queue.applyUpdate(mutation);
      queue.run();
      expect(holdGC).toBeCalled();
    });

    it('should not disable GC if there are no optimistic updates', () => {
      const holdGC = jest.fn();
      const source = new RelayRecordSource();
      const store = {
        getSource: () => source,
        notify: jest.fn(() => []),
        publish: jest.fn(),
        holdGC,
        restore: jest.fn(),
        snapshot: jest.fn(() => []),
      };
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      expectWarningWillFire(
        'RelayPublishQueue.run was called, but the call would have been a noop.',
      );
      queue.run();
      expect(holdGC).not.toBeCalled();
    });

    it('should dispose gc hold, when there are no optimistic updates are in the queue', () => {
      const disposeGC = jest.fn();
      const holdGC = jest.fn(() => ({
        dispose: disposeGC,
      }));
      const source = new RelayRecordSource();
      const store = {
        getSource: () => source,
        notify: jest.fn(() => []),
        publish: jest.fn(),
        holdGC,
        restore: jest.fn(),
        snapshot: jest.fn(() => []),
      };
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      const mutation = {
        storeUpdater: storeProxy => {
          storeProxy.create('4', 'User');
        },
      };
      queue.applyUpdate(mutation);
      queue.run();
      expect(holdGC).toBeCalled();
      expect(disposeGC).not.toBeCalled();
      expectToWarn(
        'RelayPublishQueue.run was called, but the call would have been a noop.',
        () => {
          queue.run();
        },
      );
      expect(disposeGC).not.toBeCalled(); // Exactly! We should not dispose GC on each run
      // Let's revert all updates
      queue.revertAll();
      queue.run();
      // Now, it's time to release GC
      expect(disposeGC).toBeCalled();
    });

    it('should warn if run() is called during a run()', () => {
      const source = new RelayRecordSource();
      const store = new RelayModernStore(source);
      const queue = new RelayPublishQueue(store, null, defaultGetDataID);
      let runInUpdaterOnce = false;
      queue.applyUpdate({
        storeUpdater: storeProxy => {
          storeProxy.create('4', 'User');
          if (!runInUpdaterOnce) {
            // We need to stop calling `run` here, as every next `run` will warn again
            // and we want to check that `expectWarningWillFire` was called only once.
            runInUpdaterOnce = true;
            queue.run();
          }
        },
      });
      expectWarningWillFire(
        "A store update was detected within another store update. Please make sure new store updates aren't being executed within an updater function for a different update.",
      );
      queue.run();
    });
  });
});

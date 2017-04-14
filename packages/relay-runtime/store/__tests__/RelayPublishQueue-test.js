/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

jest
  .autoMockOff();

const RelayInMemoryRecordSource = require('RelayInMemoryRecordSource');
const RelayMarkSweepStore = require('RelayMarkSweepStore');
const RelayPublishQueue = require('RelayPublishQueue');
const RelayStoreUtils = require('RelayStoreUtils');
const RelayStaticTestUtils = require('RelayStaticTestUtils');

const getRelayStaticHandleKey = require('getRelayStaticHandleKey');
const invariant = require('invariant');
const simpleClone = require('simpleClone');

const {
  ID_KEY,
  REF_KEY,
  ROOT_ID,
  ROOT_TYPE,
  TYPENAME_KEY,
} = RelayStoreUtils;

describe('RelayPublishQueue', () => {
  const {generateAndCompile} = RelayStaticTestUtils;

  beforeEach(() => {
    jest.resetModules();
    jest.addMatchers(RelayStaticTestUtils.matchers);
  });

  describe('applyUpdate()/revertUpdate()', () => {
    let initialData;
    let sourceData;
    let source;
    let store;

    beforeEach(() => {
      initialData = {
        [ROOT_ID]: {
          __id: ROOT_ID,
          __typename: ROOT_TYPE,
        },
        4: {
          [ID_KEY]: '4',
          [TYPENAME_KEY]: 'User',
          hometown: {[REF_KEY]: 'mpk'},
          log: '',
          name: 'Mark',
          pet: {[REF_KEY]: 'beast'},
          'address{"location":"WORK"}': '1 Hacker Way',
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
      sourceData = simpleClone(initialData);
      source = new RelayInMemoryRecordSource(sourceData);
      store = new RelayMarkSweepStore(source);
    });

    it('runs an updater and applies the changes to the store', () => {
      const queue = new RelayPublishQueue(store);
      queue.applyUpdate(store => {
        const zuck = store.get('4');
        zuck.setValue('zuck', 'name');
      });
      expect(sourceData).toEqual(initialData);
      queue.run();
      expect(sourceData).toEqual({
        ...initialData,
        4: {
          ...initialData['4'],
          name: 'zuck',
        },
      });
    });

    it('unpublishes changes when reverted in the same run()', () => {
      const queue = new RelayPublishQueue(store);
      const updater = store => {
        const zuck = store.get('4');
        zuck.setValue('zuck', 'name');
      };
      queue.applyUpdate(updater);
      queue.revertUpdate(updater);
      expect(sourceData).toEqual(initialData);
      queue.run();
      expect(sourceData).toEqual(initialData);
    });

    it('unpublishes changes when reverted in a subsequent run()', () => {
      const queue = new RelayPublishQueue(store);
      const updater = store => {
        const zuck = store.get('4');
        zuck.setValue('zuck', 'name');
      };
      queue.applyUpdate(updater);
      queue.run();
      queue.revertUpdate(updater);
      expect(sourceData).not.toEqual(initialData);
      queue.run();
      expect(sourceData).toEqual(initialData);
    });

    it('applies multiple updaters in the same run()', () => {
      const queue = new RelayPublishQueue(store);
      queue.applyUpdate(store => {
        const zuck = store.get('4');
        zuck.setValue('zuck', 'name');
      });
      queue.applyUpdate(store => {
        const zuck = store.get('4');
        zuck.setValue(
          zuck.getValue('name').toUpperCase(),
          'name'
        );
      });
      expect(sourceData).toEqual(initialData);
      queue.run();
      expect(sourceData).toEqual({
        ...initialData,
        4: {
          ...initialData['4'],
          name: 'ZUCK',
        },
      });
    });

    it('applies multiple updaters in subsequent run()s', () => {
      const queue = new RelayPublishQueue(store);
      queue.applyUpdate(store => {
        const zuck = store.get('4');
        zuck.setValue('zuck', 'name');
      });
      queue.run();
      queue.applyUpdate(store => {
        const zuck = store.get('4');
        zuck.setValue(
          zuck.getValue('name').toUpperCase(),
          'name'
        );
      });
      queue.run();
      expect(sourceData).toEqual({
        ...initialData,
        4: {
          ...initialData['4'],
          name: 'ZUCK',
        },
      });
    });

    it('rebases changes when an earlier change is reverted', () => {
      const queue = new RelayPublishQueue(store);
      const updater = store => {
        const zuck = store.get('4');
        zuck.setValue('zuck', 'name');
      };
      queue.applyUpdate(updater);
      // The second update should be applied to the reverted store state
      queue.applyUpdate(store => {
        const zuck = store.get('4');
        zuck.setValue(
          zuck.getValue('name').toUpperCase(),
          'name'
        );
      });
      queue.run();
      // Cause a rebase
      queue.revertUpdate(updater);
      expect(sourceData).not.toEqual(initialData);
      queue.run();
      expect(sourceData).toEqual({
        ...initialData,
        4: {
          ...initialData['4'],
          name: 'MARK',
        },
      });
    });

    it('rebases multiple changes on the same value', () => {
      const queue = new RelayPublishQueue(store);
      const incrementPopulation = store => {
        const mpk = store.get('mpk');
        invariant(mpk, 'should have mpk');
        const population = mpk.getValue('population');
        mpk.setValue(population + 1000, 'population');
      };
      const doublePopulation = store => {
        const mpk = store.get('mpk');
        invariant(mpk, 'should have mpk');
        const population = mpk.getValue('population');
        mpk.setValue(population * 2, 'population');
      };
      const getPopulation = () => sourceData.mpk.population;

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
      const queue = new RelayPublishQueue(store);
      const mutation1 = store => {
        const zuck = store.get('4');
        zuck.setValue('Zuckerberg', 'name');
      };
      const mutation2 = store => {
        const zuck = store.get('4');
        zuck.setValue('Mark Zuckerberg', 'name');
      };
      queue.applyUpdate(mutation1);
      queue.applyUpdate(mutation2);
      queue.run();
      // Cause a rebase
      queue.revertUpdate(mutation1);
      queue.run();
      // Revert the rebased change
      queue.revertUpdate(mutation2);
      expect(sourceData).not.toEqual(initialData);
      queue.run();
      // Ensures the intermediate backup was correct
      expect(sourceData).toEqual(initialData);
    });
  });

  describe('revertAll()', () => {
    let initialData;
    let sourceData;
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
      sourceData = simpleClone(initialData);
      source = new RelayInMemoryRecordSource(sourceData);
      store = new RelayMarkSweepStore(source);
    });

    it('reverts executed changes', () => {
      store.publish = jest.fn(store.publish.bind(store));
      const queue = new RelayPublishQueue(store);
      // Run the updates
      queue.applyUpdate(store => {
        const zuck = store.get('4');
        zuck.setValue('zuck', 'name');
      });
      queue.applyUpdate(store => {
        const zuck = store.get('4');
        zuck.setValue(
          zuck.getValue('name').toUpperCase(),
          'name'
        );
      });
      queue.run();
      expect(store.publish.mock.calls.length).toBe(1);
      store.publish.mockClear();

      // Then run the revert
      queue.revertAll();
      expect(sourceData).not.toEqual(initialData);
      queue.run();
      expect(sourceData).toEqual(initialData);
      expect(store.publish.mock.calls.length).toBe(1);
    });

    it('reverts partially executed/unexecuted changes', () => {
      store.publish = jest.fn(store.publish.bind(store));
      const queue = new RelayPublishQueue(store);
      // Run the first update
      queue.applyUpdate(store => {
        const zuck = store.get('4');
        zuck.setValue('zuck', 'name');
      });
      queue.run();
      // Apply a second update
      queue.applyUpdate(store => {
        const zuck = store.get('4');
        zuck.setValue(
          zuck.getValue('name').toUpperCase(),
          'name'
        );
      });
      store.publish.mockClear();

      // Then run the revert
      queue.revertAll();
      expect(sourceData).not.toEqual(initialData);
      queue.run();
      expect(sourceData).toEqual(initialData);
      expect(store.publish.mock.calls.length).toBe(1);
    });

    it('reverts unexecuted changes', () => {
      store.publish = jest.fn(store.publish.bind(store));
      const queue = new RelayPublishQueue(store);
      // Apply but don't run the updates
      queue.applyUpdate(store => {
        const zuck = store.get('4');
        zuck.setValue('zuck', 'name');
      });
      queue.applyUpdate(store => {
        const zuck = store.get('4');
        zuck.setValue(
          zuck.getValue('name').toUpperCase(),
          'name'
        );
      });

      queue.revertAll();
      expect(sourceData).toEqual(initialData);
      queue.run();
      expect(sourceData).toEqual(initialData);
      expect(store.publish.mock.calls.length).toBe(0);
    });
  });

  describe('commitPayload()', () => {
    it('publishes the source to the store', () => {
      const notify = jest.fn();
      const publish = jest.fn();
      const source = new RelayInMemoryRecordSource();
      const store = {getSource: () => source, notify, publish};
      const queue = new RelayPublishQueue(store);
      const publishSource = new RelayInMemoryRecordSource();
      const {ActorQuery} = generateAndCompile(`
        query ActorQuery {
          me {
            name
          }
        }
      `);

      queue.commitPayload(
        {
          dataID: ROOT_ID,
          node: ActorQuery.query,
          variables: {},
        },
        {source: publishSource},
      );
      expect(notify).not.toBeCalled();
      expect(publish).not.toBeCalled();
      queue.run();
      expect(publish.mock.calls.length).toBe(1);
      expect(publish.mock.calls[0][0]).toBe(publishSource);
      expect(notify.mock.calls.length).toBe(1);
    });

    it('runs the provided updater before publishing', () => {
      const notify = jest.fn();
      const publish = jest.fn();
      const source = new RelayInMemoryRecordSource();
      const store = {getSource: () => source, notify, publish};
      const queue = new RelayPublishQueue(store);
      const {ActorQuery} = generateAndCompile(`
        query ActorQuery {
          me {
            name
          }
          nodes(ids: ["4"]) {
            name
          }
        }
      `);

      const updater = jest.fn(store => {
        const zuck = store.getRootField('me');
        const nodes = store.getPluralRootField('nodes');
        expect(nodes.length).toBe(1);
        expect(nodes[0]).toBe(zuck);
        zuck.setValue(zuck.getValue('name').toUpperCase(), 'name');
      });
      queue.commitPayload(
        {
          dataID: ROOT_ID,
          node: ActorQuery.query,
          variables: {},
        },
        {
          source: new RelayInMemoryRecordSource({
            '4': {
              __id: '4',
              __typename: 'User',
              id: '4',
              name: 'Zuck',
            },
            'client:root': {
              __id: 'client:root',
              __typename: '__Root',
              me: {__ref: '4'},
              'nodes{"ids":["4"]}': {__refs: ['4']},
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
        },
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          me: {__ref: '4'},
          'nodes{"ids":["4"]}': {__refs: ['4']},
        },
      });
      expect(notify.mock.calls.length).toBe(1);
    });

    it('processes handle fields before publishing', () => {
      const notify = jest.fn();
      const publish = jest.fn();
      const source = new RelayInMemoryRecordSource();
      const store = {getSource: () => source, notify, publish};
      const ScreennameHandler = {
        update(store, payload) {
          const record = store.get(payload.dataID);
          const linkedRecords = record.getLinkedRecords(payload.fieldKey);
          record.setLinkedRecords([...linkedRecords].reverse(), payload.handleKey);
        },
      };
      const NameHandler = {
        update(store, payload) {
          const record = store.get(payload.dataID);
          const name = record.getValue(payload.fieldKey);
          record.setValue(name.toUpperCase(), payload.handleKey);
        },
      };
      const handleProvider = (name) => {
        switch (name) {
          case 'handleScreennames':
            return ScreennameHandler;
          case 'handleName':
            return NameHandler;
        }
      };
      const queue = new RelayPublishQueue(store, handleProvider);

      const {ActorQuery} = generateAndCompile(`
        query ActorQuery {
          me {
            screennames @__clientField(handle: "handleScreennames") {
              name @__clientField(handle: "handleName")
            }
          }
        }
      `);

      queue.commitPayload(
        {
          dataID: ROOT_ID,
          node: ActorQuery.query,
          variables: {},
        },
        {
          fieldPayloads: [{
            dataID: '4',
            fieldKey: 'screennames',
            handleKey: getRelayStaticHandleKey('handleScreennames', null, 'screennames'),
            handle: 'handleScreennames',
          }, {
            dataID: 'client:4:screennames:0',
            fieldKey: 'name',
            handleKey: getRelayStaticHandleKey('handleName', null, 'name'),
            handle: 'handleName',
          }, {
            dataID: 'client:4:screennames:1',
            fieldKey: 'name',
            handleKey: getRelayStaticHandleKey('handleName', null, 'name'),
            handle: 'handleName',
          }],
          source: new RelayInMemoryRecordSource({
            '4': {
              __id: '4',
              __typename: 'User',
              id: '4',
              screennames: {__refs: [
                'client:4:screennames:0',
                'client:4:screennames:1',
              ]},
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
        },
      );
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
          screennames: {__refs: [
            'client:4:screennames:0',
            'client:4:screennames:1',
          ]},
          // reversed order
          '__screennames_handleScreennames': {__refs: [
            'client:4:screennames:1',
            'client:4:screennames:0',
          ]},
        },
        'client:4:screennames:0': {
          __id: 'client:4:screennames:0',
          __typename: 'Screenname',
          name: 'zuck',
          // uppercase
          '__name_handleName': 'ZUCK',
        },
        'client:4:screennames:1': {
          __id: 'client:4:screennames:1',
          __typename: 'Screenname',
          name: 'beast',
          // uppercase
          '__name_handleName': 'BEAST',
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
      const sourceData = {
        4: {
          __id: '4',
          __typename: 'User',
          name: 'mark',
        },
      };
      const initialData = simpleClone(sourceData);
      const source = new RelayInMemoryRecordSource(sourceData);
      const store = new RelayMarkSweepStore(source);
      const queue = new RelayPublishQueue(store);
      // Set name to 'MARK' *without* running the update
      queue.applyUpdate(store => {
        const zuck = store.get('4');
        zuck.setValue(
          zuck.getValue('name').toUpperCase(),
          'name'
        );
      });
      const {NameQuery} = generateAndCompile(`
        query NameQuery {
          me {
            name
          }
        }
      `);
      // Query payload sets name to 'zuck'
      queue.commitPayload(
        {
          dataID: ROOT_ID,
          node: NameQuery.query,
          variables: {id: '4'},
        },
        {
          source: new RelayInMemoryRecordSource({
            [ROOT_ID]: {
              [ID_KEY]: ROOT_ID,
              [TYPENAME_KEY]: ROOT_TYPE,
              me: {[REF_KEY]: '4'},
            },
            4: {
              id: '4',
              __typename: 'User',
              name: 'zuck',
            },
          }),
        }
      );
      // Run both the optimisitc and server update
      queue.run();
      expect(sourceData).toEqual({
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
      const sourceData = {
        4: {
          __id: '4',
          __typename: 'User',
          name: 'mark',
        },
      };
      const initialData = simpleClone(sourceData);
      const source = new RelayInMemoryRecordSource(sourceData);
      const store = new RelayMarkSweepStore(source);
      const queue = new RelayPublishQueue(store);
      // Set name to 'MARK', running the update immediately
      queue.applyUpdate(store => {
        const zuck = store.get('4');
        zuck.setValue(
          zuck.getValue('name').toUpperCase(),
          'name'
        );
      });
      queue.run();
      // Query payload sets name to 'zuck'
      const {NameQuery} = generateAndCompile(`
        query NameQuery {
          me {
            name
          }
        }
      `);
      queue.commitPayload(
        {
          dataID: ROOT_ID,
          node: NameQuery.query,
          variables: {id: '4'},
        },
        {
          source: new RelayInMemoryRecordSource({
            [ROOT_ID]: {
              [ID_KEY]: ROOT_ID,
              [TYPENAME_KEY]: ROOT_TYPE,
              me: {[REF_KEY]: '4'},
            },
            4: {
              id: '4',
              __typename: 'User',
              name: 'zuck',
            },
          }),
        }
      );
      queue.run();
      // Optimistic update should rebase, capitalizing the new name
      expect(sourceData).toEqual({
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
      const sourceData = {
        4: {
          __id: '4',
          __typename: 'User',
          name: 'mark',
        },
      };
      const initialData = simpleClone(sourceData);
      const source = new RelayInMemoryRecordSource(sourceData);
      const store = new RelayMarkSweepStore(source);
      const queue = new RelayPublishQueue(store);
      // Set name to 'MARK'
      const mutation = store => {
        const zuck = store.get('4');
        zuck.setValue(
          zuck.getValue('name').toUpperCase(),
          'name'
        );
      };
      queue.applyUpdate(mutation);
      const {NameQuery} = generateAndCompile(`
        query NameQuery {
          me {
            name
          }
        }
      `);
      // Query payload sets name to 'zuck'
      queue.commitPayload(
        {
          dataID: ROOT_ID,
          node: NameQuery.query,
          variables: {id: '4'},
        },
        {
          source: new RelayInMemoryRecordSource({
            [ROOT_ID]: {
              [ID_KEY]: ROOT_ID,
              [TYPENAME_KEY]: ROOT_TYPE,
              me: {[REF_KEY]: '4'},
            },
            4: {
              id: '4',
              __typename: 'User',
              name: 'zuck',
            },
          }),
        }
      );
      queue.run();

      queue.revertUpdate(mutation);
      queue.run();
      expect(sourceData).toEqual({
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
      const sourceData = {
        '84872': {
          __id: '84872',
          __typename: 'Amp',
          volume: 3,
        },
      };
      const source = new RelayInMemoryRecordSource(sourceData);
      const store = new RelayMarkSweepStore(source);
      const queue = new RelayPublishQueue(store);

      const increaseVolumeUpdater = store => {
        const amp = store.get('84872');
        amp.setValue(amp.getValue('volume') + 1, 'volume');
      };

      const setVolumeTo10Updater = store => {
        const amp = store.get('84872');
        amp.setValue(10, 'volume');
      };

      const getVolume = () => source.get('84872').volume;

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
  });

  describe('commitUpdate()', () => {
    it('publishes the source to the store', () => {
      const notify = jest.fn();
      const publish = jest.fn();
      const source = new RelayInMemoryRecordSource();
      const store = {getSource: () => source, notify, publish};
      const queue = new RelayPublishQueue(store);
      queue.commitUpdate(store => {
        const user = store.create('1364586419', 'User');
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
  });

  describe('run()', () => {
    it('notifies the store even when no mutations have occurred', () => {
      const notify = jest.fn();
      const publish = jest.fn();
      const source = new RelayInMemoryRecordSource();
      const store = {getSource: () => source, notify, publish};
      const queue = new RelayPublishQueue(store);
      queue.run();
      expect(publish).not.toBeCalled();
      expect(notify).toBeCalled();
    });

    it('notifies the store if an optimistic mutation is applied', () => {
      const notify = jest.fn();
      const publish = jest.fn();
      const source = new RelayInMemoryRecordSource();
      const store = {getSource: () => source, notify, publish};
      const queue = new RelayPublishQueue(store);
      queue.applyUpdate(store => {
        store.create('4', 'User');
      });
      queue.run();
      expect(publish).toBeCalled();
      expect(notify).toBeCalled();
    });

    it('notifies the store if an optimistic mutation is reverted', () => {
      const notify = jest.fn();
      const publish = jest.fn();
      const source = new RelayInMemoryRecordSource();
      const store = {getSource: () => source, notify, publish};
      const queue = new RelayPublishQueue(store);
      const mutation = store => {
        store.create('4', 'User');
      };
      queue.applyUpdate(mutation);
      queue.run();
      notify.mockClear();
      publish.mockClear();

      queue.revertUpdate(mutation);
      queue.run();
      expect(publish).toBeCalled();
      expect(notify).toBeCalled();
    });

    it('notifies the store if a server mutation is committed', () => {
      const notify = jest.fn();
      const publish = jest.fn();
      const source = new RelayInMemoryRecordSource();
      const store = {getSource: () => source, notify, publish};
      const queue = new RelayPublishQueue(store);

      const {NameQuery} = generateAndCompile(`
        query NameQuery {
          me {
            name
          }
        }
      `);
      // Query payload sets name to 'zuck'
      queue.commitPayload(
        {
          dataID: ROOT_ID,
          node: NameQuery.query,
          variables: {id: '4'},
        },
        {
          me: {
            id: '4',
            __typename: 'User',
            name: 'zuck',
          },
        }
      );
      expect(notify).not.toBeCalled();
      expect(publish).not.toBeCalled();
      queue.run();
      expect(publish).toBeCalled();
      expect(notify).toBeCalled();
    });
  });
});

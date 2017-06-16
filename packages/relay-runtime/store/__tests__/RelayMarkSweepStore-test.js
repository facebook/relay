/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const RelayInMemoryRecordSource = require('RelayInMemoryRecordSource');
const RelayMarkSweepStore = require('RelayMarkSweepStore');
const RelayModernRecord = require('RelayModernRecord');
const RelayStoreUtils = require('RelayStoreUtils');
const RelayModernTestUtils = require('RelayModernTestUtils');

const forEachObject = require('forEachObject');
const simpleClone = require('simpleClone');

const {REF_KEY, ROOT_ID, ROOT_TYPE} = RelayStoreUtils;

describe('RelayStore', () => {
  const {generateWithTransforms} = RelayModernTestUtils;

  beforeEach(() => {
    jest.resetModules();
    expect.extend(RelayModernTestUtils.matchers);
  });

  describe('retain()', () => {
    let UserFragment;
    let data;
    let initialData;
    let source;
    let store;

    beforeEach(() => {
      data = {
        '4': {
          __id: '4',
          id: '4',
          __typename: 'User',
          name: 'Zuck',
          'profilePicture{"size":32}': {[REF_KEY]: 'client:1'},
        },
        'client:1': {
          __id: 'client:1',
          uri: 'https://photo1.jpg',
        },
      };
      initialData = simpleClone(data);
      source = new RelayInMemoryRecordSource(data);
      store = new RelayMarkSweepStore(source);
      ({UserFragment} = generateWithTransforms(
        `
        fragment UserFragment on User {
          name
          profilePicture(size: $size) {
            uri
          }
        }
      `,
      ));
    });

    it('prevents data from being collected', () => {
      store.retain({
        dataID: '4',
        node: UserFragment,
        variables: {size: 32},
      });
      jest.runAllTimers();
      expect(source.toJSON()).toEqual(initialData);
    });

    it('frees data when disposed', () => {
      const {dispose} = store.retain({
        dataID: '4',
        node: UserFragment,
        variables: {size: 32},
      });
      dispose();
      expect(data).toEqual(initialData);
      jest.runAllTimers();
      expect(source.toJSON()).toEqual({});
    });

    it('only collects unreferenced data', () => {
      const {JoeFragment} = generateWithTransforms(
        `
        fragment JoeFragment on Query @argumentDefinitions(
          id: {type: "ID"}
        ) {
          node(id: $id) {
            ... on User {
              name
            }
          }
        }
      `,
      );
      const nextSource = new RelayInMemoryRecordSource({
        842472: {
          __id: '842472',
          __typename: 'User',
          name: 'Joe',
        },
        [ROOT_ID]: {
          __id: ROOT_ID,
          __typename: ROOT_TYPE,
          'node{"id":"842472"}': {[REF_KEY]: '842472'},
        },
      });
      store.publish(nextSource);
      const {dispose} = store.retain({
        dataID: '4',
        node: UserFragment,
        variables: {size: 32},
      });
      store.retain({
        dataID: ROOT_ID,
        node: JoeFragment,
        variables: {id: '842472'},
      });

      dispose(); // release one of the holds but not the other
      jest.runAllTimers();
      expect(source.toJSON()).toEqual(nextSource.toJSON());
    });
  });

  describe('lookup()', () => {
    let UserFragment;
    let data;
    let source;
    let store;

    beforeEach(() => {
      data = {
        '4': {
          __id: '4',
          id: '4',
          __typename: 'User',
          name: 'Zuck',
          'profilePicture{"size":32}': {[REF_KEY]: 'client:1'},
        },
        'client:1': {
          __id: 'client:1',
          uri: 'https://photo1.jpg',
        },
      };
      source = new RelayInMemoryRecordSource(data);
      store = new RelayMarkSweepStore(source);
      ({UserFragment} = generateWithTransforms(
        `
        fragment UserFragment on User {
          name
          profilePicture(size: $size) {
            uri
          }
        }
      `,
      ));
    });

    it('returns selector data', () => {
      const selector = {
        dataID: '4',
        node: UserFragment,
        variables: {size: 32},
      };
      const snapshot = store.lookup(selector);
      expect(snapshot).toEqual({
        ...selector,
        data: {
          name: 'Zuck',
          profilePicture: {
            uri: 'https://photo1.jpg',
          },
        },
        seenRecords: {
          ...data,
        },
      });
      forEachObject(snapshot.seenRecords, (record, id) => {
        expect(record).toBe(data[id]);
      });
    });

    it('returns deeply-frozen objects', () => {
      const selector = {
        dataID: '4',
        node: UserFragment,
        variables: {size: 32},
      };
      const snapshot = store.lookup(selector);
      expect(snapshot).toBeDeeplyFrozen();
    });

    it('returns updated data after a publish', () => {
      const nextData = {
        4: {
          __id: '4',
          __typename: 'User',
          'profilePicture{"size":32}': {[REF_KEY]: 'client:2'},
        },
        'client:2': {
          __id: 'client:2',
          __typename: 'Image',
          uri: 'https://photo1.jpg',
        },
      };
      const nextSource = new RelayInMemoryRecordSource(nextData);
      store.publish(nextSource); // takes effect w/o calling notify()

      const selector = {
        dataID: '4',
        node: UserFragment,
        variables: {size: 32},
      };
      const snapshot = store.lookup(selector);
      expect(snapshot).toEqual({
        ...selector,
        data: {
          name: 'Zuck',
          profilePicture: {
            uri: 'https://photo1.jpg',
          },
        },
        seenRecords: {
          4: {...data['4'], ...nextData['4']},
          'client:2': nextData['client:2'],
        },
      });
    });
  });

  describe('notify/publish/subscribe', () => {
    let UserFragment;
    let data;
    let source;
    let store;

    beforeEach(() => {
      data = {
        '4': {
          __id: '4',
          id: '4',
          __typename: 'User',
          name: 'Zuck',
          'profilePicture{"size":32}': {[REF_KEY]: 'client:1'},
          emailAddresses: ['a@b.com'],
        },
        'client:1': {
          __id: 'client:1',
          uri: 'https://photo1.jpg',
        },
      };
      source = new RelayInMemoryRecordSource(data);
      store = new RelayMarkSweepStore(source);
      ({UserFragment} = generateWithTransforms(
        `
        fragment UserFragment on User {
          name
          profilePicture(size: $size) {
            uri
          }
          emailAddresses
        }
      `,
      ));
    });

    it('calls subscribers whose data has changed since previous notify', () => {
      // subscribe(), publish(), notify() -> subscriber called
      const selector = {
        dataID: '4',
        node: UserFragment,
        variables: {size: 32},
      };
      const snapshot = store.lookup(selector);
      const callback = jest.fn();
      store.subscribe(snapshot, callback);
      // Publish a change to profilePicture.uri
      const nextSource = new RelayInMemoryRecordSource({
        'client:1': {
          __id: 'client:1',
          uri: 'https://photo2.jpg',
        },
      });
      store.publish(nextSource);
      expect(callback).not.toBeCalled();
      store.notify();
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0]).toEqual({
        ...snapshot,
        data: {
          name: 'Zuck',
          profilePicture: {
            uri: 'https://photo2.jpg', // new uri
          },
          emailAddresses: ['a@b.com'],
        },
        seenRecords: {
          ...data,
          'client:1': {
            ...data['client:1'],
            uri: 'https://photo2.jpg',
          },
        },
      });
    });

    it('vends deeply-frozen objects', () => {
      const selector = {
        dataID: '4',
        node: UserFragment,
        variables: {size: 32},
      };
      const snapshot = store.lookup(selector);
      const callback = jest.fn();
      store.subscribe(snapshot, callback);
      // Publish a change to profilePicture.uri
      const nextSource = new RelayInMemoryRecordSource({
        'client:1': {
          __id: 'client:1',
          uri: 'https://photo2.jpg',
        },
      });
      store.publish(nextSource);
      store.notify();
      expect(callback.mock.calls.length).toBe(1);
      const nextSnapshot = callback.mock.calls[0][0];
      expect(nextSnapshot).toBeDeeplyFrozen();
    });

    it('calls affected subscribers only once', () => {
      // subscribe(), publish(), publish(), notify() -> subscriber called once
      const selector = {
        dataID: '4',
        node: UserFragment,
        variables: {size: 32},
      };
      const snapshot = store.lookup(selector);
      const callback = jest.fn();
      store.subscribe(snapshot, callback);
      // Publish a change to profilePicture.uri
      let nextSource = new RelayInMemoryRecordSource({
        4: {
          __id: '4',
          name: 'Mark',
          emailAddresses: ['a@b.com', 'c@d.net'],
        },
        'client:1': {
          __id: 'client:1',
          uri: 'https://photo2.jpg',
        },
      });
      store.publish(nextSource);
      nextSource = new RelayInMemoryRecordSource({
        'client:1': {
          __id: 'client:1',
          uri: 'https://photo3.jpg',
        },
      });
      store.publish(nextSource);
      expect(callback).not.toBeCalled();
      store.notify();
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0]).toEqual({
        ...snapshot,
        data: {
          name: 'Mark',
          profilePicture: {
            uri: 'https://photo3.jpg', // most recent uri
          },
          emailAddresses: ['a@b.com', 'c@d.net'],
        },
        seenRecords: {
          4: {
            ...data['4'],
            name: 'Mark',
          },
          'client:1': {
            ...data['client:1'],
            uri: 'https://photo3.jpg',
          },
        },
      });
    });

    it('notifies subscribers of changes to unfetched records', () => {
      const selector = {
        dataID: '842472',
        node: UserFragment,
        variables: {size: 32},
      };
      const snapshot = store.lookup(selector);
      const callback = jest.fn();
      // Record does not exist when subscribed
      store.subscribe(snapshot, callback);
      const nextSource = new RelayInMemoryRecordSource({
        842472: {
          __id: '842472',
          __typename: 'User',
          name: 'Joe',
        },
      });
      store.publish(nextSource);
      store.notify();
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0]).toEqual({
        ...snapshot,
        data: {
          name: 'Joe',
          profilePicture: undefined,
        },
        seenRecords: nextSource.toJSON(),
      });
    });

    it('notifies subscribers of changes to deleted records', () => {
      const selector = {
        dataID: '842472',
        node: UserFragment,
        variables: {size: 32},
      };
      // Initially delete the record
      source.delete('842472');
      const snapshot = store.lookup(selector);
      const callback = jest.fn();
      // Record does not exist when subscribed
      store.subscribe(snapshot, callback);
      // Create it again
      const nextSource = new RelayInMemoryRecordSource({
        842472: {
          __id: '842472',
          __typename: 'User',
          name: 'Joe',
        },
      });
      store.publish(nextSource);
      store.notify();
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0]).toEqual({
        ...snapshot,
        data: {
          name: 'Joe',
          profilePicture: undefined,
        },
        seenRecords: nextSource.toJSON(),
      });
    });

    it('does not call subscribers whose data has not changed', () => {
      // subscribe(), publish() -> subscriber *not* called
      const selector = {
        dataID: '4',
        node: UserFragment,
        variables: {size: 32},
      };
      const snapshot = store.lookup(selector);
      const callback = jest.fn();
      store.subscribe(snapshot, callback);
      // Publish a change to profilePicture.uri
      const nextSource = new RelayInMemoryRecordSource({
        842472: {
          __id: '842472',
          __typename: 'User',
          name: 'Joe',
        },
      });
      store.publish(nextSource);
      store.notify();
      expect(callback).not.toBeCalled();
    });

    it('does not notify disposed subscribers', () => {
      // subscribe(), publish(), dispose(), notify() -> subscriber *not* called
      const selector = {
        dataID: '4',
        node: UserFragment,
        variables: {size: 32},
      };
      const snapshot = store.lookup(selector);
      const callback = jest.fn();
      const {dispose} = store.subscribe(snapshot, callback);
      // Publish a change to profilePicture.uri
      const nextSource = new RelayInMemoryRecordSource({
        'client:1': {
          __id: 'client:1',
          uri: 'https://photo2.jpg',
        },
      });
      store.publish(nextSource);
      dispose();
      store.notify();
      expect(callback).not.toBeCalled();
    });

    it('unpublishes records via a sentinel value', () => {
      const nextSource = new RelayInMemoryRecordSource({});
      nextSource.set('4', RelayStoreUtils.UNPUBLISH_RECORD_SENTINEL);
      store.publish(nextSource);

      expect(source.has('4')).toBe(false);
      expect(source.get('4')).toBe(undefined);
    });

    it('throws if source records are modified', () => {
      const zuck = source.get('4');
      expect(() => {
        RelayModernRecord.setValue(zuck, 'pet', 'Beast');
      }).toThrowTypeError();
    });

    it('throws if published records are modified', () => {
      // Create and publish a source with a new record
      const nextSource = new RelayInMemoryRecordSource();
      const beast = RelayModernRecord.create('beast', 'Pet');
      nextSource.set('beast', beast);
      store.publish(nextSource);
      expect(() => {
        RelayModernRecord.setValue(beast, 'name', 'Beast');
      }).toThrowTypeError();
    });

    it('throws if updated records are modified', () => {
      // Create and publish a source with a record of the same id
      const nextSource = new RelayInMemoryRecordSource();
      const beast = RelayModernRecord.create('beast', 'Pet');
      nextSource.set('beast', beast);
      const zuck = RelayModernRecord.create('4', 'User');
      RelayModernRecord.setLinkedRecordID(zuck, 'pet', 'beast');
      nextSource.set('4', zuck);
      store.publish(nextSource);

      // Cannot modify merged record
      expect(() => {
        const mergedRecord = source.get('4');
        RelayModernRecord.setValue(mergedRecord, 'pet', null);
      }).toThrowTypeError();
      // Cannot modify the published record, even though it isn't in the store
      // This is for consistency because it is non-deterinistic if published
      // records will be merged into a new object or used as-is.
      expect(() => {
        RelayModernRecord.setValue(zuck, 'pet', null);
      }).toThrowTypeError();
    });
  });

  describe('check()', () => {
    let UserFragment;
    let data;
    let source;
    let store;

    beforeEach(() => {
      data = {
        '4': {
          __id: '4',
          id: '4',
          __typename: 'User',
          name: 'Zuck',
          'profilePicture{"size":32}': {[REF_KEY]: 'client:1'},
        },
        'client:1': {
          __id: 'client:1',
          uri: 'https://photo1.jpg',
        },
      };
      source = new RelayInMemoryRecordSource(data);
      store = new RelayMarkSweepStore(source);
      ({UserFragment} = generateWithTransforms(
        `
        fragment UserFragment on User {
          name
          profilePicture(size: $size) {
            uri
          }
        }
      `,
      ));
    });

    it('returns true if all data exists in the cache', () => {
      const selector = {
        dataID: '4',
        node: UserFragment,
        variables: {size: 32},
      };
      expect(store.check(selector)).toBe(true);
    });

    it('returns false if a scalar field is missing', () => {
      const selector = {
        dataID: '4',
        node: UserFragment,
        variables: {size: 32},
      };
      store.publish(
        new RelayInMemoryRecordSource({
          'client:1': {
            __id: 'client:1',
            uri: undefined, // unpublish the field
          },
        }),
      );
      expect(store.check(selector)).toBe(false);
    });

    it('returns false if a linked field is missing', () => {
      const selector = {
        dataID: '4',
        node: UserFragment,
        variables: {size: 64}, // unfetched size
      };
      expect(store.check(selector)).toBe(false);
    });

    it('returns false if a linked record is missing', () => {
      const selector = {
        dataID: '4',
        node: UserFragment,
        variables: {size: 32},
      };
      delete data['client:1']; // profile picture
      expect(store.check(selector)).toBe(false);
    });

    it('returns false if the root record is missing', () => {
      const selector = {
        dataID: '842472', // unfetched record
        node: UserFragment,
        variables: {size: 32},
      };
      expect(store.check(selector)).toBe(false);
    });
  });

  describe('resolve()', () => {
    let UserFragment;
    let data;
    let source;
    let store;

    beforeEach(() => {
      data = {
        '4': {
          __id: '4',
          id: '4',
          __typename: 'User',
          name: 'Zuck',
          'profilePicture{"size":32}': {[REF_KEY]: 'client:1'},
        },
        'client:1': {
          __id: 'client:1',
          uri: 'https://photo1.jpg',
        },
      };
      source = new RelayInMemoryRecordSource(data);
      store = new RelayMarkSweepStore(source);
      ({UserFragment} = generateWithTransforms(
        `
        fragment UserFragment on User {
          name
          profilePicture(size: $size) {
            uri
          }
        }
      `,
      ));
    });

    it('resolves data from cache', () => {
      const selector = {
        dataID: '4',
        node: UserFragment,
        variables: {size: 32},
      };
      const callback = jest.fn();
      const target = new RelayInMemoryRecordSource();
      store.resolve(target, selector, callback);
      expect(callback.mock.calls.length).toBe(1);
      expect(callback).toBeCalledWith({
        status: 'complete',
      });
      const snapshot = store.lookup(selector);
      expect(snapshot).toEqual({
        ...selector,
        data: {
          name: 'Zuck',
          profilePicture: {
            uri: 'https://photo1.jpg',
          },
        },
        seenRecords: {
          ...data,
        },
      });
      expect(target.toJSON()).toEqual(data);
    });
  });
});

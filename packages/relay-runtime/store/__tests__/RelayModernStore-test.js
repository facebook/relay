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

const RelayModernRecord = require('../RelayModernRecord');
const RelayModernStore = require('../RelayModernStore');
const RelayOptimisticRecordSource = require('../RelayOptimisticRecordSource');
const RelayRecordSourceMapImpl = require('../RelayRecordSourceMapImpl');
const RelayRecordSourceObjectImpl = require('../RelayRecordSourceObjectImpl');

const {getRequest} = require('../../query/GraphQLTag');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {createReaderSelector} = require('../RelayModernSelector');
const {
  INVALIDATED_AT_KEY,
  REF_KEY,
  ROOT_ID,
  ROOT_TYPE,
} = require('../RelayStoreUtils');
const {
  createMockEnvironment,
  generateAndCompile,
  simpleClone,
} = require('relay-test-utils-internal');

function assertIsDeeplyFrozen(value: ?{...} | ?$ReadOnlyArray<{...}>) {
  if (!value) {
    throw new Error(
      'Expected value to be a non-null object or array of objects',
    );
  }
  expect(Object.isFrozen(value)).toBe(true);
  if (Array.isArray(value)) {
    value.forEach(item => assertIsDeeplyFrozen(item));
  } else if (typeof value === 'object' && value !== null) {
    for (const key in value) {
      assertIsDeeplyFrozen(value[key]);
    }
  }
}

[
  [data => new RelayRecordSourceObjectImpl(data), 'Object'],
  [data => new RelayRecordSourceMapImpl(data), 'Map'],
  [
    data =>
      RelayOptimisticRecordSource.create(new RelayRecordSourceMapImpl(data)),
    'Optimistic',
  ],
].forEach(([getRecordSourceImplementation, ImplementationName]) => {
  describe(`Relay Store with ${ImplementationName} Record Source`, () => {
    describe('retain()', () => {
      let UserQuery;
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
            'profilePicture(size:32)': {[REF_KEY]: 'client:1'},
          },
          'client:1': {
            __id: 'client:1',
            uri: 'https://photo1.jpg',
          },
          'client:root': {
            __id: 'client:root',
            __typename: '__Root',
            'node(id:"4")': {__ref: '4'},
          },
        };
        initialData = simpleClone(data);
        source = getRecordSourceImplementation(data);
        store = new RelayModernStore(source);
        ({UserQuery} = generateAndCompile(`
          query UserQuery($id: ID!, $size: Int) {
            node(id: $id) {
              ...UserFragment
            }
          }

          fragment UserFragment on User {
            name
            profilePicture(size: $size) {
              uri
            }
          }
        `));
      });

      it('prevents data from being collected', () => {
        store.retain(createOperationDescriptor(UserQuery, {id: '4', size: 32}));
        jest.runAllTimers();
        expect(source.toJSON()).toEqual(initialData);
      });

      it('frees data when disposed', () => {
        const {dispose} = store.retain(
          createOperationDescriptor(UserQuery, {id: '4', size: 32}),
        );
        dispose();
        expect(data).toEqual(initialData);
        jest.runAllTimers();
        expect(source.toJSON()).toEqual({});
      });

      it('only collects unreferenced data', () => {
        const {JoeQuery} = generateAndCompile(`
          fragment JoeFragment on Query @argumentDefinitions(
            id: {type: "ID"}
          ) {
            node(id: $id) {
              ... on User {
                name
              }
            }
          }

          query JoeQuery($id: ID!) {
            ...JoeFragment @arguments(id: $id)
          }
        `);
        const nextSource = getRecordSourceImplementation({
          '842472': {
            __id: '842472',
            __typename: 'User',
            name: 'Joe',
          },
          [ROOT_ID]: {
            __id: ROOT_ID,
            __typename: ROOT_TYPE,
            'node(id:"842472")': {[REF_KEY]: '842472'},
            'node(id:"4")': {[REF_KEY]: '4'},
          },
        });
        store.publish(nextSource);
        const {dispose} = store.retain(
          createOperationDescriptor(UserQuery, {id: '4', size: 32}),
        );
        store.retain(createOperationDescriptor(JoeQuery, {id: '842472'}));

        dispose(); // release one of the holds but not the other
        jest.runAllTimers();
        expect(source.toJSON()).toEqual(nextSource.toJSON());
      });
    });

    describe('lookup()', () => {
      let UserQuery;
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
            'profilePicture(size:32)': {[REF_KEY]: 'client:1'},
          },
          'client:1': {
            __id: 'client:1',
            uri: 'https://photo1.jpg',
          },
        };
        source = getRecordSourceImplementation(data);
        store = new RelayModernStore(source);
        ({UserFragment, UserQuery} = generateAndCompile(`
          fragment UserFragment on User {
            name
            profilePicture(size: $size) {
              uri
            }
          }

          query UserQuery($size: Int) {
            me {
              ...UserFragment
            }
          }
        `));
      });

      it('returns selector data', () => {
        const owner = createOperationDescriptor(UserQuery, {});
        const selector = createReaderSelector(
          UserFragment,
          '4',
          {size: 32},
          owner.request,
        );
        const snapshot = store.lookup(selector);
        expect(snapshot).toEqual({
          selector,
          data: {
            name: 'Zuck',
            profilePicture: {
              uri: 'https://photo1.jpg',
            },
          },
          seenRecords: {
            ...data,
          },
          isMissingData: false,
        });
        for (const id in snapshot.seenRecords) {
          if (snapshot.seenRecords.hasOwnProperty(id)) {
            const record = snapshot.seenRecords[id];
            expect(record).toBe(data[id]);
          }
        }
      });

      it('includes fragment owner in selector data when owner is provided', () => {
        ({UserQuery, UserFragment} = generateAndCompile(`
          query UserQuery($size: Float!) {
            me {
              ...UserFragment
            }
          }

          fragment UserFragment on User {
            name
            profilePicture(size: $size) {
              uri
            }
            ...ChildUserFragment
          }

          fragment ChildUserFragment on User {
            username
          }
        `));
        const queryNode = getRequest(UserQuery);
        const owner = createOperationDescriptor(queryNode, {size: 32});
        const selector = createReaderSelector(
          UserFragment,
          '4',
          {size: 32},
          owner.request,
        );
        const snapshot = store.lookup(selector);
        expect(snapshot).toEqual({
          selector,
          data: {
            name: 'Zuck',

            profilePicture: {
              uri: 'https://photo1.jpg',
            },

            __id: '4',
            __fragments: {ChildUserFragment: {}},
            __fragmentOwner: owner.request,
          },
          seenRecords: {
            ...data,
          },
          isMissingData: false,
        });
        expect(snapshot.data?.__fragmentOwner).toBe(owner.request);
        for (const id in snapshot.seenRecords) {
          if (snapshot.seenRecords.hasOwnProperty(id)) {
            const record = snapshot.seenRecords[id];
            expect(record).toBe(data[id]);
          }
        }
      });

      it('returns deeply-frozen objects', () => {
        const owner = createOperationDescriptor(UserQuery, {});
        const selector = createReaderSelector(
          UserFragment,
          '4',
          {size: 32},
          owner.request,
        );
        const snapshot = store.lookup(selector);
        expect(Object.isFrozen(snapshot)).toBe(true);
        assertIsDeeplyFrozen(snapshot.data);
        assertIsDeeplyFrozen(snapshot.selector.variables);
      });

      it('returns updated data after a publish', () => {
        const nextData = {
          '4': {
            __id: '4',
            __typename: 'User',
            'profilePicture(size:32)': {[REF_KEY]: 'client:2'},
          },
          'client:2': {
            __id: 'client:2',
            __typename: 'Image',
            uri: 'https://photo1.jpg',
          },
        };
        const nextSource = getRecordSourceImplementation(nextData);
        store.publish(nextSource); // takes effect w/o calling notify()

        const owner = createOperationDescriptor(UserQuery, {size: 32});
        const selector = createReaderSelector(
          UserFragment,
          '4',
          {size: 32},
          owner.request,
        );
        const snapshot = store.lookup(selector);
        expect(snapshot).toEqual({
          selector,
          data: {
            name: 'Zuck',
            profilePicture: {
              uri: 'https://photo1.jpg',
            },
          },
          seenRecords: {
            '4': {...data['4'], ...nextData['4']},
            'client:2': nextData['client:2'],
          },
          isMissingData: false,
        });
      });
    });

    describe('notify/publish/subscribe', () => {
      let UserQuery;
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
            'profilePicture(size:32)': {[REF_KEY]: 'client:1'},
            emailAddresses: ['a@b.com'],
          },
          'client:1': {
            __id: 'client:1',
            uri: 'https://photo1.jpg',
          },
          'client:root': {
            __id: 'client:root',
            __typename: '__Root',
            'node(id:"4")': {__ref: '4'},
            me: {__ref: '4'},
          },
        };
        source = getRecordSourceImplementation(data);
        store = new RelayModernStore(source);
        ({UserFragment, UserQuery} = generateAndCompile(`
          fragment UserFragment on User {
            name
            profilePicture(size: $size) {
              uri
            }
            emailAddresses
          }

          query UserQuery($size: Int) {
            me {
              ...UserFragment
            }
          }
        `));
      });

      it('calls subscribers whose data has changed since previous notify', () => {
        // subscribe(), publish(), notify() -> subscriber called
        const owner = createOperationDescriptor(UserQuery, {});
        const selector = createReaderSelector(
          UserFragment,
          '4',
          {size: 32},
          owner.request,
        );
        const snapshot = store.lookup(selector);
        const callback = jest.fn();
        store.subscribe(snapshot, callback);
        // Publish a change to profilePicture.uri
        const nextSource = getRecordSourceImplementation({
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
            '4': {
              __id: '4',
              id: '4',
              __typename: 'User',
              name: 'Zuck',
              'profilePicture(size:32)': {[REF_KEY]: 'client:1'},
              emailAddresses: ['a@b.com'],
            },
            'client:1': {
              ...data['client:1'],
              uri: 'https://photo2.jpg',
            },
          },
        });
      });

      it('calls subscribers and reads data with fragment owner if one is available in subscription snapshot', () => {
        // subscribe(), publish(), notify() -> subscriber called
        ({UserQuery, UserFragment} = generateAndCompile(`
          query UserQuery($size: Float!) {
            me {
              ...UserFragment
            }
          }

          fragment UserFragment on User {
            name
            profilePicture(size: $size) {
              uri
            }
            emailAddresses
          }
        `));
        const queryNode = getRequest(UserQuery);
        const owner = createOperationDescriptor(queryNode, {size: 32});
        const selector = createReaderSelector(
          UserFragment,
          '4',
          {size: 32},
          owner.request,
        );
        const snapshot = store.lookup(selector);
        expect(snapshot.selector).toBe(selector);

        const callback = jest.fn();
        store.subscribe(snapshot, callback);
        // Publish a change to profilePicture.uri
        const nextSource = getRecordSourceImplementation({
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
            '4': {
              __id: '4',
              id: '4',
              __typename: 'User',
              name: 'Zuck',
              'profilePicture(size:32)': {[REF_KEY]: 'client:1'},
              emailAddresses: ['a@b.com'],
            },
            'client:1': {
              ...data['client:1'],
              uri: 'https://photo2.jpg',
            },
          },
        });
        expect(callback.mock.calls[0][0].selector).toBe(selector);
      });

      it('vends deeply-frozen objects', () => {
        const owner = createOperationDescriptor(UserQuery, {});
        const selector = createReaderSelector(
          UserFragment,
          '4',
          {size: 32},
          owner.request,
        );
        const snapshot = store.lookup(selector);
        const callback = jest.fn();
        store.subscribe(snapshot, callback);
        // Publish a change to profilePicture.uri
        const nextSource = getRecordSourceImplementation({
          'client:1': {
            __id: 'client:1',
            uri: 'https://photo2.jpg',
          },
        });
        store.publish(nextSource);
        store.notify();
        expect(callback.mock.calls.length).toBe(1);
        const nextSnapshot = callback.mock.calls[0][0];
        expect(Object.isFrozen(nextSnapshot)).toBe(true);
        assertIsDeeplyFrozen(nextSnapshot.data);
        assertIsDeeplyFrozen(nextSnapshot.selector.variables);
      });

      it('calls affected subscribers only once', () => {
        // subscribe(), publish(), publish(), notify() -> subscriber called once
        const owner = createOperationDescriptor(UserQuery, {});
        const selector = createReaderSelector(
          UserFragment,
          '4',
          {size: 32},
          owner.request,
        );
        const snapshot = store.lookup(selector);
        const callback = jest.fn();
        store.subscribe(snapshot, callback);
        // Publish a change to profilePicture.uri
        let nextSource = getRecordSourceImplementation({
          '4': {
            __id: '4',
            __typename: 'User',
            name: 'Mark',
            emailAddresses: ['a@b.com', 'c@d.net'],
          },
          'client:1': {
            __id: 'client:1',
            uri: 'https://photo2.jpg',
          },
        });
        store.publish(nextSource);
        nextSource = getRecordSourceImplementation({
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
            '4': {
              ...data['4'],
              name: 'Mark',
              emailAddresses: ['a@b.com', 'c@d.net'],
            },
            'client:1': {
              ...data['client:1'],
              uri: 'https://photo3.jpg',
            },
          },
        });
      });

      it('notifies subscribers and sets updated value for isMissingData', () => {
        data = {
          '4': {
            __id: '4',
            id: '4',
            __typename: 'User',
            name: 'Zuck',
            'profilePicture(size:32)': {[REF_KEY]: 'client:1'},
          },
          'client:1': {
            __id: 'client:1',
            uri: 'https://photo1.jpg',
          },
        };
        source = getRecordSourceImplementation(data);
        store = new RelayModernStore(source);
        const owner = createOperationDescriptor(UserQuery, {});
        const selector = createReaderSelector(
          UserFragment,
          '4',
          {size: 32},
          owner.request,
        );
        const snapshot = store.lookup(selector);
        expect(snapshot.isMissingData).toEqual(true);

        const callback = jest.fn();
        // Record does not exist when subscribed
        store.subscribe(snapshot, callback);
        const nextSource = getRecordSourceImplementation({
          '4': {
            __id: '4',
            __typename: 'User',
            emailAddresses: ['a@b.com'],
          },
        });
        store.publish(nextSource);
        store.notify();
        expect(callback.mock.calls.length).toBe(1);
        expect(callback.mock.calls[0][0]).toEqual({
          ...snapshot,
          isMissingData: false,
          data: {
            name: 'Zuck',
            profilePicture: {
              uri: 'https://photo1.jpg',
            },
            emailAddresses: ['a@b.com'],
          },
          seenRecords: {
            '4': {
              ...data['4'],
              emailAddresses: ['a@b.com'],
            },
            'client:1': {
              ...data['client:1'],
            },
          },
        });
      });

      it('notifies subscribers of changes to unfetched records', () => {
        const owner = createOperationDescriptor(UserQuery, {});
        const selector = createReaderSelector(
          UserFragment,
          '842472',
          {
            size: 32,
          },
          owner.request,
        );
        const snapshot = store.lookup(selector);
        const callback = jest.fn();
        // Record does not exist when subscribed
        store.subscribe(snapshot, callback);
        const nextSource = getRecordSourceImplementation({
          '842472': {
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
          isMissingData: true,
          seenRecords: nextSource.toJSON(),
        });
      });

      it('notifies subscribers of changes to deleted records', () => {
        const owner = createOperationDescriptor(UserQuery, {});
        const selector = createReaderSelector(
          UserFragment,
          '842472',
          {
            size: 32,
          },
          owner.request,
        );
        // Initially delete the record
        source.delete('842472');
        const snapshot = store.lookup(selector);
        const callback = jest.fn();
        // Record does not exist when subscribed
        store.subscribe(snapshot, callback);
        // Create it again
        const nextSource = getRecordSourceImplementation({
          '842472': {
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
          isMissingData: true,
          seenRecords: nextSource.toJSON(),
        });
      });

      it('does not call subscribers whose data has not changed', () => {
        // subscribe(), publish() -> subscriber *not* called
        const owner = createOperationDescriptor(UserQuery, {});
        const selector = createReaderSelector(
          UserFragment,
          '4',
          {size: 32},
          owner.request,
        );
        const snapshot = store.lookup(selector);
        const callback = jest.fn();
        store.subscribe(snapshot, callback);
        // Publish a change to profilePicture.uri
        const nextSource = getRecordSourceImplementation({
          '842472': {
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
        const owner = createOperationDescriptor(UserQuery, {});
        const selector = createReaderSelector(
          UserFragment,
          '4',
          {size: 32},
          owner.request,
        );
        const snapshot = store.lookup(selector);
        const callback = jest.fn();
        const {dispose} = store.subscribe(snapshot, callback);
        // Publish a change to profilePicture.uri
        const nextSource = getRecordSourceImplementation({
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

      it('throws if source records are modified', () => {
        const zuck = source.get('4');
        expect(zuck).toBeTruthy();
        expect(() => {
          // $FlowFixMe
          RelayModernRecord.setValue(zuck, 'pet', 'Beast');
        }).toThrow(TypeError);
      });

      it('throws if published records are modified', () => {
        // Create and publish a source with a new record
        const nextSource = getRecordSourceImplementation();
        const beast = RelayModernRecord.create('beast', 'Pet');
        nextSource.set('beast', beast);
        store.publish(nextSource);
        expect(() => {
          RelayModernRecord.setValue(beast, 'name', 'Beast');
        }).toThrow(TypeError);
      });

      it('throws if updated records are modified', () => {
        // Create and publish a source with a record of the same id
        const nextSource = getRecordSourceImplementation();
        const beast = RelayModernRecord.create('beast', 'Pet');
        nextSource.set('beast', beast);
        const zuck = RelayModernRecord.create('4', 'User');
        RelayModernRecord.setLinkedRecordID(zuck, 'pet', 'beast');
        nextSource.set('4', zuck);
        store.publish(nextSource);

        // Cannot modify merged record
        expect(() => {
          const mergedRecord = source.get('4');
          expect(mergedRecord).toBeTruthy();
          // $FlowFixMe
          RelayModernRecord.setValue(mergedRecord, 'pet', null);
        }).toThrow(TypeError);
        // Cannot modify the published record, even though it isn't in the store
        // This is for consistency because it is non-deterinistic if published
        // records will be merged into a new object or used as-is.
        expect(() => {
          RelayModernRecord.setValue(zuck, 'pet', null);
        }).toThrow(TypeError);
      });

      describe('with data invalidation', () => {
        it('correctly invalidates store when store is globally invalidated', () => {
          const owner = createOperationDescriptor(UserQuery, {
            id: '4',
            size: 32,
          });
          const selector = createReaderSelector(
            UserFragment,
            '4',
            {size: 32},
            owner.request,
          );
          const snapshot = store.lookup(selector);
          const callback = jest.fn();
          store.subscribe(snapshot, callback);
          // Publish a change to profilePicture.uri
          const nextSource = getRecordSourceImplementation({
            'client:1': {
              __id: 'client:1',
              uri: 'https://photo2.jpg',
            },
          });
          store.publish(
            nextSource,
            new Set(), // indicate that no individual ids were invalidated
          );
          store.notify(
            owner,
            true, // indicate that store should be globally invalidated
          );
          // Results are asserted in earlier tests

          expect(store.check(owner)).toEqual('stale');
        });

        it('correctly invalidates individual records', () => {
          const owner = createOperationDescriptor(UserQuery, {
            id: '4',
            size: 32,
          });
          const selector = createReaderSelector(
            UserFragment,
            '4',
            {size: 32},
            owner.request,
          );
          const snapshot = store.lookup(selector);
          const callback = jest.fn();
          store.subscribe(snapshot, callback);
          // Publish a change to profilePicture.uri
          const nextSource = getRecordSourceImplementation({
            'client:1': {
              __id: 'client:1',
              uri: 'https://photo2.jpg',
            },
          });
          store.publish(
            nextSource,
            new Set(['client:1']), // indicate that this id was invalidated
          );
          store.notify(owner, false);
          // Results are asserted in earlier tests

          const record = store.getSource().get('client:1');
          if (!record) {
            throw new Error('Expected to find record with id client:1');
          }
          expect(record[INVALIDATED_AT_KEY]).toEqual(1);
          expect(store.check(owner)).toEqual('stale');
        });

        it("correctly invalidates records even when they weren't modified in the source being published", () => {
          const owner = createOperationDescriptor(UserQuery, {
            id: '4',
            size: 32,
          });
          const selector = createReaderSelector(
            UserFragment,
            '4',
            {size: 32},
            owner.request,
          );
          const snapshot = store.lookup(selector);
          const callback = jest.fn();
          store.subscribe(snapshot, callback);
          // Publish a change to profilePicture.uri
          const nextSource = getRecordSourceImplementation({
            'client:1': {
              __id: 'client:1',
              uri: 'https://photo2.jpg',
            },
          });
          store.publish(
            nextSource,
            new Set(['4']), // indicate that this id was invalidated
          );
          store.notify(owner, false);
          // Results are asserted in earlier tests

          const record = store.getSource().get('4');
          if (!record) {
            throw new Error('Expected to find record with id "4"');
          }
          expect(record[INVALIDATED_AT_KEY]).toEqual(1);
          expect(store.check(owner)).toEqual('stale');
        });
      });
    });

    describe('check()', () => {
      let UserQuery;
      let data;
      let source;
      let store;
      let environment;

      beforeEach(() => {
        data = {
          '4': {
            __id: '4',
            id: '4',
            __typename: 'User',
            name: 'Zuck',
            'profilePicture(size:32)': {[REF_KEY]: 'client:1'},
          },
          'client:1': {
            __id: 'client:1',
            uri: 'https://photo1.jpg',
          },
          'client:root': {
            __id: 'client:root',
            __typename: '__Root',
            'node(id:"4")': {__ref: '4'},
          },
        };
        source = getRecordSourceImplementation(data);
        store = new RelayModernStore(source);
        ({UserQuery} = generateAndCompile(`
          fragment UserFragment on User {
            name
            profilePicture(size: $size) {
              uri
            }
          }

          query UserQuery($id: ID!, $size: [Int]) {
            node(id: $id) {
              ...UserFragment
            }
          }
        `));
        environment = createMockEnvironment({store});
      });

      it('returns available if all data exists in the cache', () => {
        const operation = createOperationDescriptor(UserQuery, {
          id: '4',
          size: 32,
        });
        expect(store.check(operation)).toBe('available');
      });

      it('returns missing if a scalar field is missing', () => {
        const operation = createOperationDescriptor(UserQuery, {
          id: '4',
          size: 32,
        });
        store.publish(
          getRecordSourceImplementation({
            'client:1': {
              __id: 'client:1',
              uri: undefined, // unpublish the field
            },
          }),
        );
        expect(store.check(operation)).toBe('missing');
      });

      it('returns missing if a linked field is missing', () => {
        const operation = createOperationDescriptor(UserQuery, {
          id: '4',
          size: 64,
        });
        expect(store.check(operation)).toBe('missing');
      });

      it('returns missing if a linked record is missing', () => {
        // $FlowFixMe found deploying v0.109.0
        delete data['client:1']; // profile picture
        source = getRecordSourceImplementation(data);
        store = new RelayModernStore(source);
        const operation = createOperationDescriptor(UserQuery, {
          id: '4',
          size: 32,
        });
        expect(store.check(operation)).toBe('missing');
      });

      it('returns missing if the root record is missing', () => {
        const operation = createOperationDescriptor(UserQuery, {
          id: '842472',
          size: 32,
        });
        expect(store.check(operation)).toBe('missing');
      });

      describe('with global store invalidation', () => {
        describe("when query hasn't been written to the store before", () => {
          it('returns stale if data is cached and store has been invalidated', () => {
            environment.commitUpdate(storeProxy => {
              storeProxy.invalidateStore();
            });
            const operation = createOperationDescriptor(UserQuery, {
              id: '4',
              size: 32,
            });
            expect(store.check(operation)).toBe('stale');
          });

          it('returns stale if data is not cached and store has been invalidated', () => {
            environment.commitUpdate(storeProxy => {
              storeProxy.invalidateStore();
            });
            const operation = createOperationDescriptor(UserQuery, {
              id: '842472',
              size: 32,
            });
            expect(store.check(operation)).toBe('stale');
          });
        });

        describe('when query has been written to the store', () => {
          it('returns stale even if data is cached but store was invalidated after query was written', () => {
            const operation = createOperationDescriptor(UserQuery, {
              id: '4',
              size: 32,
            });

            // Write query data and record operation write
            store.retain(operation);
            store.publish(source);
            store.notify(operation);

            environment.commitUpdate(storeProxy => {
              storeProxy.invalidateStore();
            });
            expect(store.check(operation)).toBe('stale');
          });

          it('returns available if data is cached and store was invalidated before query was written', () => {
            environment.commitUpdate(storeProxy => {
              storeProxy.invalidateStore();
            });
            const operation = createOperationDescriptor(UserQuery, {
              id: '4',
              size: 32,
            });

            // Write query data and record operation write
            store.retain(operation);
            store.publish(source);
            store.notify(operation);

            expect(store.check(operation)).toBe('available');
          });

          it('returns stale if data is not cached and store was invalidated after query was written', () => {
            const operation = createOperationDescriptor(UserQuery, {
              id: '842472',
              size: 32,
            });

            // Write query data and record operation write
            store.retain(operation);
            store.publish(source);
            store.notify(operation);

            environment.commitUpdate(storeProxy => {
              storeProxy.invalidateStore();
            });
            expect(store.check(operation)).toBe('stale');
          });

          it('returns missing if data is not cached and store was invalidated before query was written', () => {
            environment.commitUpdate(storeProxy => {
              storeProxy.invalidateStore();
            });
            const operation = createOperationDescriptor(UserQuery, {
              id: '842472',
              size: 32,
            });

            // Write query data and record operation write
            store.retain(operation);
            store.publish(source);
            store.notify(operation);

            expect(store.check(operation)).toBe('missing');
          });
        });
      });

      describe('when individual records are invalidated', () => {
        describe('when data is cached in the store', () => {
          it('returns stale if operation has not been written before', () => {
            const operation = createOperationDescriptor(UserQuery, {
              id: '4',
              size: 32,
            });

            environment.commitUpdate(storeProxy => {
              const user = storeProxy.get('4');
              if (!user) {
                throw new Error('Expected to find record with id "4"');
              }
              user.invalidateRecord();
            });
            expect(store.check(operation)).toBe('stale');
          });

          it('returns stale if operation was written before record was invalidated', () => {
            const operation = createOperationDescriptor(UserQuery, {
              id: '4',
              size: 32,
            });

            // Write query data and record operation write
            store.retain(operation);
            store.publish(source);
            store.notify(operation);

            environment.commitUpdate(storeProxy => {
              const user = storeProxy.get('4');
              if (!user) {
                throw new Error('Expected to find record with id "4"');
              }
              user.invalidateRecord();
            });
            expect(store.check(operation)).toBe('stale');
          });

          it('returns available if operation was written after record was invalidated', () => {
            const operation = createOperationDescriptor(UserQuery, {
              id: '4',
              size: 32,
            });

            environment.commitUpdate(storeProxy => {
              const user = storeProxy.get('4');
              if (!user) {
                throw new Error('Expected to find record with id "4"');
              }
              user.invalidateRecord();
            });

            // Write query data and record operation write
            store.retain(operation);
            store.publish(source);
            store.notify(operation);

            expect(store.check(operation)).toBe('available');
          });
        });

        describe('when data is missing', () => {
          beforeEach(() => {
            store.publish(
              getRecordSourceImplementation({
                'client:1': {
                  __id: 'client:1',
                  uri: undefined, // missing uri
                },
              }),
            );
          });

          it('returns stale if operation has not been written before', () => {
            const operation = createOperationDescriptor(UserQuery, {
              id: '4',
              size: 32,
            });

            environment.commitUpdate(storeProxy => {
              const user = storeProxy.get('4');
              if (!user) {
                throw new Error('Expected to find record with id "4"');
              }
              user.invalidateRecord();
            });
            expect(store.check(operation)).toBe('stale');
          });

          it('returns stale if operation was written before record was invalidated', () => {
            const operation = createOperationDescriptor(UserQuery, {
              id: '4',
              size: 32,
            });

            // Write query data and record operation write
            store.retain(operation);
            store.publish(source);
            store.notify(operation);

            environment.commitUpdate(storeProxy => {
              const user = storeProxy.get('4');
              if (!user) {
                throw new Error('Expected to find record with id "4"');
              }
              user.invalidateRecord();
            });
            expect(store.check(operation)).toBe('stale');
          });

          it('returns missing if stale record is unreachable', () => {
            const operation = createOperationDescriptor(UserQuery, {
              id: '842472',
              size: 32,
            });
            // Write query data and record operation write
            store.retain(operation);
            store.publish(source);
            store.notify(operation);

            environment.commitUpdate(storeProxy => {
              const user = storeProxy.get('4');
              if (!user) {
                throw new Error('Expected to find record with id "4"');
              }
              user.invalidateRecord();
            });
            expect(store.check(operation)).toBe('missing');
          });

          it('returns missing if operation was written after record was invalidated', () => {
            const operation = createOperationDescriptor(UserQuery, {
              id: '4',
              size: 32,
            });

            environment.commitUpdate(storeProxy => {
              const user = storeProxy.get('4');
              if (!user) {
                throw new Error('Expected to find record with id "4"');
              }
              user.invalidateRecord();
            });

            // Write query data and record operation write
            store.retain(operation);
            store.publish(source);
            store.notify(operation);

            expect(store.check(operation)).toBe('missing');
          });
        });
      });
    });

    describe('invalidation state', () => {
      let UserQuery;
      let data;
      let source;
      let store;
      let environment;

      beforeEach(() => {
        data = {
          '4': {
            __id: '4',
            id: '4',
            __typename: 'User',
            name: 'Zuck',
            'profilePicture(size:32)': {[REF_KEY]: 'client:1'},
          },
          '5': {
            __id: '5',
            id: '5',
            __typename: 'User',
            name: 'Someone',
            'profilePicture(size:32)': {[REF_KEY]: 'client:2'},
          },
          'client:1': {
            __id: 'client:1',
            uri: 'https://photo1.jpg',
          },
          'client:2': {
            __id: 'client:2',
            uri: 'https://photo2.jpg',
          },
          'client:root': {
            __id: 'client:root',
            __typename: '__Root',
            'node(id:"4")': {__ref: '4'},
          },
        };
        source = getRecordSourceImplementation(data);
        store = new RelayModernStore(source);
        ({UserQuery} = generateAndCompile(`
          fragment UserFragment on User {
            name
            profilePicture(size: $size) {
              uri
            }
          }

          query UserQuery($id: ID!, $size: [Int]) {
            node(id: $id) {
              ...UserFragment
            }
          }
        `));
        environment = createMockEnvironment({store});
      });

      describe('lookupInvalidationState() / checkInvalidationState()', () => {
        const dataIDs = ['4', 'client:1'];

        it('returns false if the provided ids have not been invalidated', () => {
          const invalidationState = store.lookupInvalidationState(dataIDs);
          expect(store.checkInvalidationState(invalidationState)).toBe(false);
        });

        it('returns false if the provided ids have not been invalidated regardless of order of ids', () => {
          const invalidationState1 = store.lookupInvalidationState(dataIDs);
          const invalidationState2 = store.lookupInvalidationState(
            dataIDs.reverse(),
          );
          expect(store.checkInvalidationState(invalidationState1)).toBe(false);
          expect(store.checkInvalidationState(invalidationState2)).toBe(false);
        });

        it('returns true if the store was globally invalidated', () => {
          const invalidationState = store.lookupInvalidationState(dataIDs);
          environment.commitUpdate(storeProxy => {
            storeProxy.invalidateStore();
          });
          expect(store.checkInvalidationState(invalidationState)).toBe(true);
        });

        it('returns true if some of the provided ids were invalidated', () => {
          const invalidationState = store.lookupInvalidationState(dataIDs);
          environment.commitUpdate(storeProxy => {
            const user = storeProxy.get('4');
            if (!user) {
              throw new Error('Expected to find record with id "4"');
            }
            user.invalidateRecord();
          });
          expect(store.checkInvalidationState(invalidationState)).toBe(true);
        });

        it('returns true if some of the provided ids were invalidated regardless of order of ids', () => {
          const invalidationState1 = store.lookupInvalidationState(dataIDs);
          const invalidationState2 = store.lookupInvalidationState(
            dataIDs.reverse(),
          );
          environment.commitUpdate(storeProxy => {
            const user = storeProxy.get('4');
            if (!user) {
              throw new Error('Expected to find record with id "4"');
            }
            user.invalidateRecord();
          });
          expect(store.checkInvalidationState(invalidationState1)).toBe(true);
          expect(store.checkInvalidationState(invalidationState2)).toBe(true);
        });

        it('returns true if multiple ids were invalidated in separate updates', () => {
          const invalidationState = store.lookupInvalidationState(dataIDs);
          environment.commitUpdate(storeProxy => {
            const user = storeProxy.get('4');
            if (!user) {
              throw new Error('Expected to find record with id "4"');
            }
            user.invalidateRecord();
          });
          expect(store.checkInvalidationState(invalidationState)).toBe(true);

          const nextInvalidationState = store.lookupInvalidationState(dataIDs);
          environment.commitUpdate(storeProxy => {
            const record = storeProxy.get('client:1');
            if (!record) {
              throw new Error('Expected to find record with id "client:1"');
            }
            record.invalidateRecord();
          });
          expect(store.checkInvalidationState(nextInvalidationState)).toBe(
            true,
          );
        });

        it('returns true if multiple ids were invalidated in the same update', () => {
          const invalidationState = store.lookupInvalidationState(dataIDs);
          environment.commitUpdate(storeProxy => {
            const user = storeProxy.get('4');
            if (!user) {
              throw new Error('Expected to find record with id "4"');
            }
            user.invalidateRecord();

            const record = storeProxy.get('client:1');
            if (!record) {
              throw new Error('Expected to find record with id "client:1"');
            }
            record.invalidateRecord();
          });

          expect(store.checkInvalidationState(invalidationState)).toBe(true);
        });

        it('returns true if both store and individual records were invalidated in separate updates', () => {
          const invalidationState = store.lookupInvalidationState(dataIDs);
          environment.commitUpdate(storeProxy => {
            storeProxy.invalidateStore();
          });
          expect(store.checkInvalidationState(invalidationState)).toBe(true);

          let nextInvalidationState = store.lookupInvalidationState(dataIDs);
          environment.commitUpdate(storeProxy => {
            const user = storeProxy.get('4');
            if (!user) {
              throw new Error('Expected to find record with id "4"');
            }
            user.invalidateRecord();
          });
          expect(store.checkInvalidationState(nextInvalidationState)).toBe(
            true,
          );

          nextInvalidationState = store.lookupInvalidationState(dataIDs);
          environment.commitUpdate(storeProxy => {
            const record = storeProxy.get('client:1');
            if (!record) {
              throw new Error('Expected to find record with id "client:1"');
            }
            record.invalidateRecord();
          });
          expect(store.checkInvalidationState(nextInvalidationState)).toBe(
            true,
          );
        });

        it('returns true if both store and individual records were invalidated in the same update', () => {
          const invalidationState = store.lookupInvalidationState(dataIDs);
          environment.commitUpdate(storeProxy => {
            storeProxy.invalidateStore();

            const user = storeProxy.get('4');
            if (!user) {
              throw new Error('Expected to find record with id "4"');
            }
            user.invalidateRecord();

            const record = storeProxy.get('client:1');
            if (!record) {
              throw new Error('Expected to find record with id "client:1"');
            }
            record.invalidateRecord();
          });
          expect(store.checkInvalidationState(invalidationState)).toBe(true);
        });
      });

      describe('lookupInvalidationState() / subscribeToInvalidationState()', () => {
        let callback;
        const dataIDs = ['4', 'client:1'];

        beforeEach(() => {
          callback = jest.fn();
        });

        it('notifies when invalidation state changes due to global invalidation', () => {
          const invalidationState = store.lookupInvalidationState(dataIDs);
          store.subscribeToInvalidationState(invalidationState, callback);

          environment.commitUpdate(storeProxy => {
            storeProxy.invalidateStore();
          });

          expect(callback).toHaveBeenCalledTimes(1);
          expect(store.checkInvalidationState(invalidationState)).toEqual(true);
        });

        it('notifies when invalidation state changes due to invalidating one of the provided ids', () => {
          const invalidationState = store.lookupInvalidationState(dataIDs);
          store.subscribeToInvalidationState(invalidationState, callback);

          environment.commitUpdate(storeProxy => {
            const user = storeProxy.get('4');
            if (!user) {
              throw new Error('Expected to find record with id "4"');
            }
            user.invalidateRecord();
          });

          expect(callback).toHaveBeenCalledTimes(1);
          expect(store.checkInvalidationState(invalidationState)).toEqual(true);
        });

        it('notifies once when invalidating multiple affected records in the same update', () => {
          const invalidationState = store.lookupInvalidationState(dataIDs);
          store.subscribeToInvalidationState(invalidationState, callback);
          environment.commitUpdate(storeProxy => {
            const user = storeProxy.get('4');
            if (!user) {
              throw new Error('Expected to find record with id "4"');
            }
            user.invalidateRecord();

            const record = storeProxy.get('client:1');
            if (!record) {
              throw new Error('Expected to find record with id "client:1"');
            }
            record.invalidateRecord();
          });

          expect(callback).toHaveBeenCalledTimes(1);
          expect(store.checkInvalidationState(invalidationState)).toEqual(true);
        });

        it('notifies once per update when multiple affected records invalidated', () => {
          let invalidationState = store.lookupInvalidationState(dataIDs);
          store.subscribeToInvalidationState(invalidationState, callback);
          environment.commitUpdate(storeProxy => {
            const user = storeProxy.get('4');
            if (!user) {
              throw new Error('Expected to find record with id "4"');
            }
            user.invalidateRecord();
          });
          expect(callback).toHaveBeenCalledTimes(1);
          expect(store.checkInvalidationState(invalidationState)).toEqual(true);

          invalidationState = store.lookupInvalidationState(dataIDs);
          environment.commitUpdate(storeProxy => {
            const record = storeProxy.get('client:1');
            if (!record) {
              throw new Error('Expected to find record with id "client:1"');
            }
            record.invalidateRecord();
          });

          expect(callback).toHaveBeenCalledTimes(2);
          expect(store.checkInvalidationState(invalidationState)).toEqual(true);
        });

        it('notifies once when invalidation state changes due to both global and local invalidation in a single update', () => {
          const invalidationState = store.lookupInvalidationState(dataIDs);
          store.subscribeToInvalidationState(invalidationState, callback);
          environment.commitUpdate(storeProxy => {
            storeProxy.invalidateStore();

            const user = storeProxy.get('4');
            if (!user) {
              throw new Error('Expected to find record with id "4"');
            }
            user.invalidateRecord();

            const record = storeProxy.get('client:1');
            if (!record) {
              throw new Error('Expected to find record with id "client:1"');
            }
            record.invalidateRecord();
          });

          expect(callback).toHaveBeenCalledTimes(1);
          expect(store.checkInvalidationState(invalidationState)).toEqual(true);
        });

        it('notifies once per update when invalidation state changes due to both global and local invalidation in multiple', () => {
          let invalidationState = store.lookupInvalidationState(dataIDs);
          store.subscribeToInvalidationState(invalidationState, callback);
          environment.commitUpdate(storeProxy => {
            storeProxy.invalidateStore();
          });
          expect(callback).toHaveBeenCalledTimes(1);
          expect(store.checkInvalidationState(invalidationState)).toEqual(true);

          invalidationState = store.lookupInvalidationState(dataIDs);
          environment.commitUpdate(storeProxy => {
            const user = storeProxy.get('4');
            if (!user) {
              throw new Error('Expected to find record with id "4"');
            }
            user.invalidateRecord();
          });
          expect(callback).toHaveBeenCalledTimes(2);
          expect(store.checkInvalidationState(invalidationState)).toEqual(true);

          invalidationState = store.lookupInvalidationState(dataIDs);
          environment.commitUpdate(storeProxy => {
            const record = storeProxy.get('client:1');
            if (!record) {
              throw new Error('Expected to find record with id "client:1"');
            }
            record.invalidateRecord();
          });

          expect(callback).toHaveBeenCalledTimes(3);
          expect(store.checkInvalidationState(invalidationState)).toEqual(true);
        });

        it('does not notify if invalidated ids do not affect subscription', () => {
          const invalidationState = store.lookupInvalidationState(dataIDs);
          store.subscribeToInvalidationState(invalidationState, callback);
          environment.commitUpdate(storeProxy => {
            const user = storeProxy.get('5');
            if (!user) {
              throw new Error('Expected to find record with id "5"');
            }
            user.invalidateRecord();
          });
          expect(callback).toHaveBeenCalledTimes(0);
          expect(store.checkInvalidationState(invalidationState)).toEqual(
            false,
          );
        });

        it('does not notify if subscription has been disposed of', () => {
          const invalidationState = store.lookupInvalidationState(dataIDs);
          const disposable = store.subscribeToInvalidationState(
            invalidationState,
            callback,
          );

          disposable.dispose();
          environment.commitUpdate(storeProxy => {
            storeProxy.invalidateStore();
          });
          expect(callback).toHaveBeenCalledTimes(0);

          // Even though subscription wasn't notified, the record is
          // now invalid
          expect(store.checkInvalidationState(invalidationState)).toEqual(true);
        });

        it('does not notify if record was deleted', () => {
          const invalidationState = store.lookupInvalidationState(dataIDs);
          store.subscribeToInvalidationState(invalidationState, callback);

          environment.commitUpdate(storeProxy => {
            storeProxy.delete('4');
          });
          expect(callback).toHaveBeenCalledTimes(0);
          expect(store.checkInvalidationState(invalidationState)).toEqual(
            false,
          );
        });

        it('notifes correctly if record was deleted and then re-added', () => {
          const invalidationState = store.lookupInvalidationState(dataIDs);
          store.subscribeToInvalidationState(invalidationState, callback);

          environment.commitUpdate(storeProxy => {
            const user = storeProxy.get('4');
            if (!user) {
              throw new Error('Expected to find record with id "4"');
            }
            user.invalidateRecord();
          });
          expect(callback).toHaveBeenCalledTimes(1);

          callback.mockClear();
          environment.commitUpdate(storeProxy => {
            storeProxy.delete('4');
          });
          expect(callback).toHaveBeenCalledTimes(0);
          expect(store.checkInvalidationState(invalidationState)).toEqual(
            false,
          );

          environment.commitUpdate(storeProxy => {
            const user = storeProxy.create('4', 'User');
            user.invalidateRecord();
          });
          expect(callback).toHaveBeenCalledTimes(1);
        });

        it('does not notify if record was invalidated and deleted in same update', () => {
          const invalidationState = store.lookupInvalidationState(dataIDs);
          store.subscribeToInvalidationState(invalidationState, callback);

          environment.commitUpdate(storeProxy => {
            const user = storeProxy.get('4');
            if (!user) {
              throw new Error('Expected to find record with id "4"');
            }
            user.invalidateRecord();
            storeProxy.delete('4');
          });
          expect(callback).toHaveBeenCalledTimes(0);
          expect(store.checkInvalidationState(invalidationState)).toEqual(
            false,
          );
        });
      });
    });

    describe('GC with a release buffer', () => {
      let UserQuery;
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
            'profilePicture(size:32)': {[REF_KEY]: 'client:1'},
          },
          '5': {
            __id: '5',
            id: '5',
            __typename: 'User',
            name: 'Other',
            'profilePicture(size:32)': {[REF_KEY]: 'client:2'},
          },
          'client:1': {
            __id: 'client:1',
            uri: 'https://photo1.jpg',
          },
          'client:2': {
            __id: 'client:2',
            uri: 'https://photo2.jpg',
          },
          'client:root': {
            __id: 'client:root',
            __typename: '__Root',
            'node(id:"4")': {__ref: '4'},
            'node(id:"5")': {__ref: '5'},
          },
        };
        initialData = simpleClone(data);
        source = getRecordSourceImplementation(data);
        store = new RelayModernStore(source, {gcReleaseBufferSize: 1});
        ({UserQuery} = generateAndCompile(`
          fragment UserFragment on User {
            name
            profilePicture(size: $size) {
              uri
            }
          }

          query UserQuery($id: ID!, $size: [Int]) {
            node(id: $id) {
              ...UserFragment
            }
          }
        `));
      });

      it('keeps the data retained in the release buffer after released by caller', () => {
        const disposable = store.retain(
          createOperationDescriptor(UserQuery, {id: '4', size: 32}),
        );

        jest.runAllTimers();
        // Assert data is not collected
        expect(source.toJSON()).toEqual(initialData);

        // Assert data is still not collected since it's still
        // retained in the release buffer
        disposable.dispose();
        jest.runAllTimers();
        expect(source.toJSON()).toEqual(initialData);
      });

      it('releases the operation and collects data after release buffer reaches capacity', () => {
        const disposable = store.retain(
          createOperationDescriptor(UserQuery, {id: '4', size: 32}),
        );
        jest.runAllTimers();
        // Assert data is not collected
        expect(source.toJSON()).toEqual(initialData);

        // Assert data is still not collected since it's still
        // retained in the release buffer
        disposable.dispose();
        jest.runAllTimers();
        expect(source.toJSON()).toEqual(initialData);

        const disposable2 = store.retain(
          createOperationDescriptor(UserQuery, {id: '5', size: 32}),
        );
        jest.runAllTimers();
        expect(source.toJSON()).toEqual(initialData);

        // Releasing second operation should cause release buffer to
        // go over capacity
        disposable2.dispose();
        jest.runAllTimers();
        // Assert that the data for the first operation is collected, while
        // data for second operation is still retained via the release buffer
        expect(source.toJSON()).toEqual({
          '5': {
            __id: '5',
            id: '5',
            __typename: 'User',
            name: 'Other',
            'profilePicture(size:32)': {[REF_KEY]: 'client:2'},
          },
          'client:2': {
            __id: 'client:2',
            uri: 'https://photo2.jpg',
          },
          'client:root': {
            __id: 'client:root',
            __typename: '__Root',
            'node(id:"4")': {__ref: '4'},
            'node(id:"5")': {__ref: '5'},
          },
        });
      });

      it('when same operation retained multiple times, data is only collected until fully released from buffer', () => {
        const disposable = store.retain(
          createOperationDescriptor(UserQuery, {id: '4', size: 32}),
        );
        jest.runAllTimers();
        expect(source.toJSON()).toEqual(initialData);

        // Retain the same operation again
        const disposable2 = store.retain(
          createOperationDescriptor(UserQuery, {id: '4', size: 32}),
        );
        jest.runAllTimers();
        expect(source.toJSON()).toEqual(initialData);

        // Retain different operation
        const disposable3 = store.retain(
          createOperationDescriptor(UserQuery, {id: '5', size: 32}),
        );
        jest.runAllTimers();
        expect(source.toJSON()).toEqual(initialData);

        // Assert data is still not collected since it's still
        // retained in the release buffer
        disposable.dispose();
        jest.runAllTimers();
        expect(source.toJSON()).toEqual(initialData);

        // Assert data is still not collected since it's still
        // retained in the release buffer via the equivalent operation
        disposable2.dispose();
        jest.runAllTimers();
        expect(source.toJSON()).toEqual(initialData);

        // Releasing different operation should cause release buffer to
        // go over capacity
        disposable3.dispose();
        jest.runAllTimers();
        // Assert that the data for the first operation is collected, while
        // data for secont operation is still retained via the release buffer
        expect(source.toJSON()).toEqual({
          '5': {
            __id: '5',
            id: '5',
            __typename: 'User',
            name: 'Other',
            'profilePicture(size:32)': {[REF_KEY]: 'client:2'},
          },
          'client:2': {
            __id: 'client:2',
            uri: 'https://photo2.jpg',
          },
          'client:root': {
            __id: 'client:root',
            __typename: '__Root',
            'node(id:"4")': {__ref: '4'},
            'node(id:"5")': {__ref: '5'},
          },
        });
      });
    });

    describe('GC Scheduler', () => {
      let UserQuery;
      let data;
      let initialData;
      let source;
      let store;
      let callbacks;
      let scheduler;

      beforeEach(() => {
        data = {
          '4': {
            __id: '4',
            id: '4',
            __typename: 'User',
            name: 'Zuck',
            'profilePicture(size:32)': {[REF_KEY]: 'client:1'},
          },
          'client:1': {
            __id: 'client:1',
            uri: 'https://photo1.jpg',
          },
          'client:root': {
            __id: 'client:root',
            __typename: '__Root',
            'node(id:"4")': {__ref: '4'},
          },
        };
        initialData = simpleClone(data);
        callbacks = [];
        scheduler = jest.fn(callbacks.push.bind(callbacks));
        source = getRecordSourceImplementation(data);
        store = new RelayModernStore(source, {gcScheduler: scheduler});
        ({UserQuery} = generateAndCompile(`
          fragment UserFragment on User {
            name
            profilePicture(size: $size) {
              uri
            }
          }

          query UserQuery($id: ID!, $size: [Int]) {
            node(id: $id) {
              ...UserFragment
            }
          }
        `));
      });

      it('calls the gc scheduler function when GC should run', () => {
        const {dispose} = store.retain(
          createOperationDescriptor(UserQuery, {id: '4', size: 32}),
        );
        expect(scheduler).not.toBeCalled();
        dispose();
        expect(scheduler).toBeCalled();
        expect(callbacks.length).toBe(1);
      });

      it('Runs GC when the GC scheduler executes the task', () => {
        const {dispose} = store.retain(
          createOperationDescriptor(UserQuery, {id: '4', size: 32}),
        );
        dispose();
        expect(source.toJSON()).toEqual(initialData);
        callbacks[0](); // run gc
        expect(source.toJSON()).toEqual({});
      });
    });

    describe('holdGC()', () => {
      let UserQuery;
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
            'profilePicture(size:32)': {[REF_KEY]: 'client:1'},
          },
          'client:1': {
            __id: 'client:1',
            uri: 'https://photo1.jpg',
          },
          'client:root': {
            __id: 'client:root',
            __typename: '__Root',
            'node(id:"4")': {__ref: '4'},
          },
        };
        initialData = simpleClone(data);
        source = getRecordSourceImplementation(data);
        store = new RelayModernStore(source);
        ({UserQuery} = generateAndCompile(`
          fragment UserFragment on User {
            name
            profilePicture(size: $size) {
              uri
            }
          }

          query UserQuery($id: ID!, $size: [Int]) {
            node(id: $id) {
              ...UserFragment
            }
          }
        `));
      });

      it('prevents data from being collected with disabled GC, and reruns GC when it is enabled', () => {
        const gcHold = store.holdGC();
        const {dispose} = store.retain(
          createOperationDescriptor(UserQuery, {id: '4', size: 32}),
        );
        dispose();
        expect(data).toEqual(initialData);
        jest.runAllTimers();
        expect(source.toJSON()).toEqual(initialData);
        gcHold.dispose();
        jest.runAllTimers();
        expect(source.toJSON()).toEqual({});
      });
    });
  });
});

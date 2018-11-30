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

const RelayInMemoryRecordSource = require('../RelayInMemoryRecordSource');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernStore = require('../RelayModernStore');
const RelayModernTestUtils = require('RelayModernTestUtils');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');

const nullthrows = require('nullthrows');

const {createOperationSelector} = require('../RelayModernOperationSelector');
const {getSelector} = require('../RelayModernSelector');
const {ROOT_ID} = require('../RelayStoreUtils');

describe('RelayModernEnvironment', () => {
  const {generateAndCompile} = RelayModernTestUtils;
  let config;
  let source;
  let store;

  beforeEach(() => {
    jest.resetModules();
    expect.extend(RelayModernTestUtils.matchers);
    source = new RelayInMemoryRecordSource();
    store = new RelayModernStore(source);

    config = {
      network: RelayNetwork.create(jest.fn()),
      store,
    };
  });

  describe('getStore()', () => {
    it('returns the store passed to the constructor', () => {
      const environment = new RelayModernEnvironment(config);
      expect(environment.getStore()).toBe(store);
    });
  });

  describe('check()', () => {
    let ParentQuery;
    let environment;
    let operationSelector;

    beforeEach(() => {
      ({ParentQuery} = generateAndCompile(`
        query ParentQuery($size: [Int]!) {
          me {
            id
            name
            profilePicture(size: $size) {
              uri
            }
          }
        }
      `));
      environment = new RelayModernEnvironment(config);
      operationSelector = createOperationSelector(ParentQuery, {size: 32});
    });

    it('returns true if all data exists in the environment', () => {
      environment.commitPayload(operationSelector, {
        me: {
          id: '4',
          name: 'Zuck',
          profilePicture: {
            uri: 'https://...',
          },
        },
      });
      expect(environment.check(operationSelector.fragment)).toBe(true);
    });

    it('returns false if data is missing from the environment', () => {
      environment.commitPayload(operationSelector, {
        me: {
          id: '4',
          name: 'Zuck',
          profilePicture: {
            uri: undefined,
          },
        },
      });
      expect(environment.check(operationSelector.fragment)).toBe(false);
    });
  });

  describe('lookup()', () => {
    let ParentQuery;
    let environment;

    beforeEach(() => {
      ({ParentQuery} = generateAndCompile(`
        query ParentQuery {
          me {
            id
            name
          }
        }
        fragment ChildFragment on User {
          id
          name
        }
      `));
      environment = new RelayModernEnvironment(config);
      const operationSelector = createOperationSelector(ParentQuery, {});
      environment.commitPayload(operationSelector, {
        me: {
          id: '4',
          name: 'Zuck',
        },
      });
    });

    it('returns the results of executing a query', () => {
      const snapshot = environment.lookup({
        dataID: ROOT_ID,
        node: ParentQuery.fragment,
        variables: {},
      });
      expect(snapshot.data).toEqual({
        me: {
          id: '4',
          name: 'Zuck',
        },
      });
    });
  });

  describe('subscribe()', () => {
    let ParentQuery;
    let environment;

    function setName(id, name) {
      environment.applyUpdate({
        storeUpdater: proxyStore => {
          const user = proxyStore.get(id);
          if (!user) {
            throw new Error('Expected user to be in the store');
          }
          user.setValue(name, 'name');
        },
      });
    }

    beforeEach(() => {
      ({ParentQuery} = generateAndCompile(`
        query ParentQuery {
          me {
            id
            name
          }
        }
        fragment ChildFragment on User {
          id
          name
        }
      `));
      environment = new RelayModernEnvironment(config);
      const operationSelector = createOperationSelector(ParentQuery, {});
      environment.commitPayload(operationSelector, {
        me: {
          id: '4',
          name: 'Zuck',
        },
      });
    });

    it('calls the callback if data changes', () => {
      const snapshot = environment.lookup({
        dataID: ROOT_ID,
        node: ParentQuery.fragment,
        variables: {},
      });
      const callback = jest.fn();
      environment.subscribe(snapshot, callback);
      setName('4', 'Mark'); // Zuck -> Mark
      expect(callback.mock.calls.length).toBe(1);
      const nextSnapshot = callback.mock.calls[0][0];
      expect(nextSnapshot.data).toEqual({
        me: {
          id: '4',
          name: 'Mark', // reflects updated value
        },
      });
    });

    it('does not call the callback if disposed', () => {
      const snapshot = environment.lookup({
        dataID: ROOT_ID,
        node: ParentQuery.fragment,
        variables: {},
      });
      const callback = jest.fn();
      const {dispose} = environment.subscribe(snapshot, callback);
      dispose();
      setName('4', 'Mark'); // Zuck -> Mark
      expect(callback).not.toBeCalled();
    });
  });

  describe('retain()', () => {
    let ParentQuery;
    let environment;

    beforeEach(() => {
      ({ParentQuery} = generateAndCompile(`
        query ParentQuery {
          me {
            id
            name
          }
        }
        fragment ChildFragment on User {
          id
          name
        }
      `));
      environment = new RelayModernEnvironment(config);
      const operationSelector = createOperationSelector(ParentQuery, {});
      environment.commitPayload(operationSelector, {
        me: {
          id: '4',
          name: 'Zuck',
        },
      });
    });

    it('retains data when not disposed', () => {
      environment.retain({
        dataID: ROOT_ID,
        node: ParentQuery.root,
        variables: {},
      });
      const snapshot = environment.lookup({
        dataID: ROOT_ID,
        node: ParentQuery.fragment,
        variables: {},
      });
      // data is still in the store
      expect(snapshot.data).toEqual({
        me: {
          id: '4',
          name: 'Zuck',
        },
      });
    });

    it('releases data when disposed', () => {
      const {dispose} = environment.retain({
        dataID: ROOT_ID,
        node: ParentQuery.root,
        variables: {},
      });
      const selector = {
        dataID: ROOT_ID,
        node: ParentQuery.fragment,
        variables: {},
      };
      dispose();
      // GC runs asynchronously; data should still be in the store
      expect(environment.lookup(selector).data).toEqual({
        me: {
          id: '4',
          name: 'Zuck',
        },
      });
      jest.runAllTimers();
      // After GC runs data is missing
      expect(environment.lookup(selector).data).toBe(undefined);
    });
  });

  describe('applyUpdate()', () => {
    let UserFragment;
    let environment;

    beforeEach(() => {
      ({UserFragment} = generateAndCompile(`
        fragment UserFragment on User {
          id
          name
        }
      `));
      environment = new RelayModernEnvironment(config);
    });

    it('applies the mutation to the store', () => {
      const selector = {
        dataID: '4',
        node: UserFragment,
        variables: {},
      };
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
      const selector = {
        dataID: '4',
        node: UserFragment,
        variables: {},
      };
      const callback = jest.fn();
      const snapshot = environment.lookup(selector);
      environment.subscribe(snapshot, callback);

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
      const selector = {
        dataID: '4',
        node: UserFragment,
        variables: {},
      };
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
  });

  describe('commitPayload()', () => {
    let ActorQuery;
    let environment;
    let operationSelector;

    beforeEach(() => {
      ({ActorQuery} = generateAndCompile(`
        query ActorQuery {
          me {
            name
          }
        }
      `));
      operationSelector = createOperationSelector(ActorQuery, {});
      (store: $FlowFixMe).notify = jest.fn(store.notify.bind(store));
      (store: $FlowFixMe).publish = jest.fn(store.publish.bind(store));
      environment = new RelayModernEnvironment(config);
    });

    it('applies server updates', () => {
      const callback = jest.fn();
      const snapshot = environment.lookup(operationSelector.fragment);
      environment.subscribe(snapshot, callback);

      environment.commitPayload(operationSelector, {
        me: {
          id: '4',
          __typename: 'User',
          name: 'Zuck',
        },
      });
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0].data).toEqual({
        me: {
          name: 'Zuck',
        },
      });
    });

    it('rebases optimistic updates', () => {
      const callback = jest.fn();
      const snapshot = environment.lookup(operationSelector.fragment);
      environment.subscribe(snapshot, callback);

      environment.applyUpdate({
        storeUpdater: proxyStore => {
          const zuck = proxyStore.get('4');
          if (zuck) {
            const name = zuck.getValue('name');
            if (typeof name !== 'string') {
              throw new Error('Expected zuck.name to be defined');
            }
            zuck.setValue(name.toUpperCase(), 'name');
          }
        },
      });

      environment.commitPayload(operationSelector, {
        me: {
          id: '4',
          __typename: 'User',
          name: 'Zuck',
        },
      });
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0].data).toEqual({
        me: {
          name: 'ZUCK',
        },
      });
    });
  });

  describe('execute() with Promise network', () => {
    let callbacks;
    let deferred;
    let environment;
    let fetch;
    let complete;
    let error;
    let next;
    let operation;
    let query;
    let variables;

    beforeEach(() => {
      ({ActorQuery: query} = generateAndCompile(
        `
        query ActorQuery($fetchSize: Boolean!) {
          me {
            name
            profilePicture(size: 42) @include(if: $fetchSize) {
              uri
            }
          }
        }
      `,
      ));
      variables = {fetchSize: false};
      operation = createOperationSelector(query, {
        ...variables,
        foo: 'bar', // should be filtered from network fetch
      });

      complete = jest.fn();
      error = jest.fn();
      next = jest.fn();
      callbacks = {complete, error, next};
      fetch = jest.fn(
        () =>
          new Promise((resolve, reject) => {
            deferred = {resolve, reject};
          }),
      );
      environment = new RelayModernEnvironment({
        network: RelayNetwork.create((fetch: $FlowFixMe)),
        store,
      });
    });

    it('fetches queries', () => {
      environment.execute({operation}).subscribe(callbacks);
      expect(fetch.mock.calls.length).toBe(1);
      expect(fetch.mock.calls[0][0]).toBe(query);
      expect(fetch.mock.calls[0][1]).toEqual({fetchSize: false});
      expect(fetch.mock.calls[0][2]).toEqual({});
    });

    it('fetches queries with force:true', () => {
      const cacheConfig = {force: true};
      environment.execute({cacheConfig, operation}).subscribe(callbacks);
      expect(fetch.mock.calls.length).toBe(1);
      expect(fetch.mock.calls[0][0]).toBe(query);
      expect(fetch.mock.calls[0][1]).toEqual({fetchSize: false});
      expect(fetch.mock.calls[0][2]).toBe(cacheConfig);
    });

    it('calls complete() when the batch completes', () => {
      environment.execute({operation}).subscribe(callbacks);
      deferred.resolve({
        data: {
          me: {
            id: '842472',
            __typename: 'User',
            name: 'Joe',
          },
        },
      });
      jest.runAllTimers();
      expect(complete.mock.calls.length).toBe(1);
      expect(next.mock.calls.length).toBe(1);
      expect(error).not.toBeCalled();
    });

    it('calls error() when the batch has an error', () => {
      environment.execute({operation}).subscribe(callbacks);
      const e = new Error('wtf');
      deferred.reject(e);
      jest.runAllTimers();

      expect(error).toBeCalledWith(e);
      expect(complete).not.toBeCalled();
      expect(next.mock.calls.length).toBe(0);
    });

    it('calls next() and publishes payloads to the store', () => {
      const selector = {
        dataID: ROOT_ID,
        node: query.fragment,
        variables,
      };
      const snapshot = environment.lookup(selector);
      const callback = jest.fn();
      environment.subscribe(snapshot, callback);

      environment.execute({operation}).subscribe(callbacks);
      const payload = {
        data: {
          me: {
            id: '842472',
            __typename: 'User',
            name: 'Joe',
          },
        },
        errors: undefined,
      };
      deferred.resolve(payload);
      jest.runAllTimers();

      expect(next.mock.calls.length).toBe(1);
      expect(next).toBeCalledWith(payload);
      expect(complete).toBeCalled();
      expect(error).not.toBeCalled();
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0].data).toEqual({
        me: {
          name: 'Joe',
        },
      });
    });
  });

  describe('execute() with Observable network', () => {
    let callbacks;
    let environment;
    let fetch;
    let complete;
    let error;
    let next;
    let operation;
    let subject;
    let query;
    let variables;

    beforeEach(() => {
      ({ActorQuery: query} = generateAndCompile(
        `
        query ActorQuery($fetchSize: Boolean!) {
          me {
            name
            profilePicture(size: 42) @include(if: $fetchSize) {
              uri
            }
          }
        }
      `,
      ));
      variables = {fetchSize: false};
      operation = createOperationSelector(query, {
        ...variables,
        foo: 'bar', // should be filtered from network fetch
      });

      complete = jest.fn();
      error = jest.fn();
      next = jest.fn();
      callbacks = {complete, error, next};
      fetch = jest.fn((_query, _variables, _cacheConfig) =>
        RelayObservable.create(sink => {
          subject = sink;
        }),
      );
      environment = new RelayModernEnvironment({
        network: RelayNetwork.create((fetch: $FlowFixMe)),
        store,
      });
    });

    it('fetches queries', () => {
      environment.execute({operation}).subscribe(callbacks);
      expect(fetch.mock.calls.length).toBe(1);
      expect(fetch.mock.calls[0][0]).toBe(query);
      expect(fetch.mock.calls[0][1]).toEqual({fetchSize: false});
      expect(fetch.mock.calls[0][2]).toEqual({});
    });

    it('fetches queries with force:true', () => {
      const cacheConfig = {force: true};
      environment.execute({cacheConfig, operation}).subscribe(callbacks);
      expect(fetch.mock.calls.length).toBe(1);
      expect(fetch.mock.calls[0][0]).toBe(query);
      expect(fetch.mock.calls[0][1]).toEqual({fetchSize: false});
      expect(fetch.mock.calls[0][2]).toBe(cacheConfig);
    });

    it('calls next() when payloads return', () => {
      environment.execute({operation}).subscribe(callbacks);
      subject.next({
        data: {
          me: {
            id: '842472',
            __typename: 'User',
            name: 'Joe',
          },
        },
      });
      jest.runAllTimers();
      expect(next.mock.calls.length).toBe(1);
      subject.next({
        data: {
          me: {
            id: '842472',
            __typename: 'User',
            name: 'Joseph',
          },
        },
      });
      jest.runAllTimers();
      expect(next.mock.calls.length).toBe(2);
      expect(complete).not.toBeCalled();
      expect(error).not.toBeCalled();
    });

    it('calls next() and runs updater when payloads return', () => {
      const updater = jest.fn();
      environment.execute({operation, updater}).subscribe(callbacks);
      subject.next({
        data: {
          me: {
            id: '842472',
            __typename: 'User',
            name: 'Joe',
          },
        },
      });
      jest.runAllTimers();
      expect(next.mock.calls.length).toBe(1);
      subject.next({
        data: {
          me: {
            id: '842472',
            __typename: 'User',
            name: 'Joseph',
          },
        },
      });
      jest.runAllTimers();
      expect(next.mock.calls.length).toBe(2);
      expect(complete).not.toBeCalled();
      expect(error).not.toBeCalled();
      expect(updater).toBeCalled();
    });

    it('calls complete() when the network request completes', () => {
      environment.execute({operation}).subscribe(callbacks);
      subject.complete();
      expect(complete.mock.calls.length).toBe(1);
      expect(error).not.toBeCalled();
      expect(next).not.toBeCalled();
    });

    it('calls error() when the batch has an error', () => {
      environment.execute({operation}).subscribe(callbacks);
      const e = new Error('wtf');
      subject.error(e);
      jest.runAllTimers();

      expect(error).toBeCalledWith(e);
      expect(complete).not.toBeCalled();
      expect(next.mock.calls.length).toBe(0);
    });

    it('calls next() and publishes payloads to the store', () => {
      const selector = {
        dataID: ROOT_ID,
        node: query.fragment,
        variables,
      };
      const snapshot = environment.lookup(selector);
      const callback = jest.fn();
      environment.subscribe(snapshot, callback);

      environment.execute({operation}).subscribe(callbacks);
      const payload = {
        data: {
          me: {
            id: '842472',
            __typename: 'User',
            name: 'Joe',
          },
        },
        errors: undefined,
      };
      subject.next(payload);
      jest.runAllTimers();

      expect(next.mock.calls.length).toBe(1);
      expect(next).toBeCalledWith(payload);
      expect(complete).not.toBeCalled();
      expect(error).not.toBeCalled();
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0].data).toEqual({
        me: {
          name: 'Joe',
        },
      });
    });
  });

  describe('execute() with network that returns optimistic response', () => {
    let callbacks;
    let environment;
    let fetch;
    let complete;
    let error;
    let next;
    let operation;
    let query;
    let variables;
    let dataSource;

    beforeEach(() => {
      ({ActorQuery: query} = generateAndCompile(
        `
        query ActorQuery($fetchSize: Boolean!) {
          me {
            name
            profilePicture(size: 42) @include(if: $fetchSize) {
              uri
            }
          }
        }
      `,
      ));
      variables = {fetchSize: false};
      operation = createOperationSelector(query, {
        ...variables,
        foo: 'bar', // should be filtered from network fetch
      });

      complete = jest.fn();
      error = jest.fn();
      next = jest.fn();
      callbacks = {complete, error, next};
      fetch = (_query, _variables, _cacheConfig) => {
        return RelayObservable.create(sink => {
          dataSource = sink;
        });
      };
      environment = new RelayModernEnvironment({
        network: RelayNetwork.create(fetch),
        store,
      });
    });

    it('calls next() and publishes optimistic payload to the store', () => {
      const selector = {
        dataID: ROOT_ID,
        node: query.fragment,
        variables,
      };
      const snapshot = environment.lookup(selector);
      const callback = jest.fn();
      environment.subscribe(snapshot, callback);

      environment.execute({operation}).subscribe(callbacks);
      const payload = {
        data: {
          me: {
            id: '842472',
            __typename: 'User',
            name: 'Joe',
          },
        },
      };
      dataSource.next({
        ...payload,
        extensions: {
          isOptimistic: true,
        },
      });
      jest.runAllTimers();

      expect(next.mock.calls.length).toBe(1);
      expect(complete).not.toBeCalled();
      expect(error).not.toBeCalled();
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0].data).toEqual({
        me: {
          name: 'Joe',
        },
      });
    });

    it('reverts the optimistic payload before applying regular response', () => {
      const selector = {
        dataID: ROOT_ID,
        node: query.fragment,
        variables,
      };
      const snapshot = environment.lookup(selector);
      const callback = jest.fn();
      environment.subscribe(snapshot, callback);

      environment.execute({operation}).subscribe(callbacks);
      const optimisticResponse = {
        data: {
          me: {
            id: '842472',
            __typename: 'User',
            name: 'Joe',
          },
        },
      };

      const realResponse = {
        data: {
          me: {
            id: '842472',
            __typename: 'User',
            name: 'Jiyue',
          },
        },
      };

      dataSource.next({
        ...optimisticResponse,
        extensions: {
          isOptimistic: true,
        },
      });

      jest.runAllTimers();
      dataSource.next(realResponse);
      jest.runAllTimers();

      expect(next.mock.calls.length).toBe(2);
      expect(complete).not.toBeCalled();
      expect(error).not.toBeCalled();
      expect(callback.mock.calls.length).toBe(2);
      expect(callback.mock.calls[0][0].data).toEqual({
        me: {
          name: 'Joe',
        },
      });
      expect(callback.mock.calls[1][0].data).toEqual({
        me: {
          name: 'Jiyue',
        },
      });
    });

    it('reverts optimistic response on complete.', () => {
      const selector = {
        dataID: ROOT_ID,
        node: query.fragment,
        variables,
      };
      const snapshot = environment.lookup(selector);
      const callback = jest.fn();
      environment.subscribe(snapshot, callback);

      environment.execute({operation}).subscribe(callbacks);
      const payload = {
        data: {
          me: {
            id: '842472',
            __typename: 'User',
            name: 'Joe',
          },
        },
      };
      dataSource.next({
        ...payload,
        extensions: {
          isOptimistic: true,
        },
      });
      jest.runAllTimers();
      dataSource.complete();

      expect(next.mock.calls.length).toBe(1);
      expect(complete).toBeCalled();
      expect(error).not.toBeCalled();
      expect(callback.mock.calls.length).toBe(2);
      expect(callback.mock.calls[0][0].data).toEqual({
        me: {
          name: 'Joe',
        },
      });
      expect(callback.mock.calls[1][0].data).toEqual(undefined);
    });

    it('reverts optimistic response on error.', () => {
      const selector = {
        dataID: ROOT_ID,
        node: query.fragment,
        variables,
      };
      const snapshot = environment.lookup(selector);
      const callback = jest.fn();
      environment.subscribe(snapshot, callback);

      environment.execute({operation}).subscribe(callbacks);
      const payload = {
        data: {
          me: {
            id: '842472',
            __typename: 'User',
            name: 'Joe',
          },
        },
      };
      dataSource.next({
        ...payload,
        extensions: {
          isOptimistic: true,
        },
      });
      jest.runAllTimers();
      const queryError = new Error('fail');
      dataSource.error(queryError);

      expect(next.mock.calls.length).toBe(1);
      expect(complete).not.toBeCalled();
      expect(error).toBeCalledTimes(1);
      expect(error.mock.calls[0][0]).toBe(queryError);
      expect(callback.mock.calls.length).toBe(2);
      expect(callback.mock.calls[0][0].data).toEqual({
        me: {
          name: 'Joe',
        },
      });
      expect(callback.mock.calls[1][0].data).toEqual(undefined);
    });

    it('reverts optimistic response if unsubscribed.', () => {
      const selector = {
        dataID: ROOT_ID,
        node: query.fragment,
        variables,
      };
      const snapshot = environment.lookup(selector);
      const callback = jest.fn();
      environment.subscribe(snapshot, callback);

      const subscription = environment
        .execute({operation})
        .subscribe(callbacks);
      const payload = {
        data: {
          me: {
            id: '842472',
            __typename: 'User',
            name: 'Joe',
          },
        },
      };
      dataSource.next({
        ...payload,
        extensions: {
          isOptimistic: true,
        },
      });
      jest.runAllTimers();
      subscription.unsubscribe();

      expect(next.mock.calls.length).toBe(1);
      expect(complete).not.toBeCalled();
      expect(error).not.toBeCalled();
      expect(callback.mock.calls.length).toBe(2);
      expect(callback.mock.calls[0][0].data).toEqual({
        me: {
          name: 'Joe',
        },
      });
      expect(callback.mock.calls[1][0].data).toEqual(undefined);
    });
  });

  describe('execute() a query with @match', () => {
    let callbacks;
    let complete;
    let dataSource;
    let environment;
    let error;
    let fetch;
    let resolveFragment;
    let operationLoader;
    let markdownRendererFragment;
    let markdownRendererNormalizationFragment;
    let next;
    let operation;
    let query;
    let variables;

    beforeEach(() => {
      ({
        UserQuery: query,
        MarkdownUserNameRenderer_name: markdownRendererFragment,
        MarkdownUserNameRenderer_name$normalization: markdownRendererNormalizationFragment,
      } = generateAndCompile(`
          query UserQuery($id: ID!) {
            node(id: $id) {
              ... on User {
                nameRenderer @match {
                  ...PlainUserNameRenderer_name
                    @module(name: "PlainUserNameRenderer.react")
                  ...MarkdownUserNameRenderer_name
                    @module(name: "MarkdownUserNameRenderer.react")
                }
              }
            }
          }

          fragment PlainUserNameRenderer_name on PlainUserNameRenderer {
            plaintext
            data {
              text
            }
          }

          fragment MarkdownUserNameRenderer_name on MarkdownUserNameRenderer {
            __typename
            markdown
            data {
              markup @__clientField(handle: "markup_handler")
            }
          }
      `));

      variables = {id: '1'};
      operation = createOperationSelector(query, variables);

      const MarkupHandler = {
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
      operationLoader = {
        load: jest.fn(moduleName => {
          return new Promise(resolve => {
            resolveFragment = resolve;
          });
        }),
        get: jest.fn(),
      };
      environment = new RelayModernEnvironment({
        network: RelayNetwork.create(fetch),
        store,
        operationLoader,
        handlerProvider: name => {
          switch (name) {
            case 'markup_handler':
              return MarkupHandler;
          }
        },
      });
    });

    it('calls next() and publishes the initial payload to the store', () => {
      const snapshot = environment.lookup(operation.fragment);
      const callback = jest.fn();
      environment.subscribe(snapshot, callback);

      environment.execute({operation}).subscribe(callbacks);
      const payload = {
        data: {
          node: {
            id: '1',
            __typename: 'User',
            nameRenderer: {
              __typename: 'MarkdownUserNameRenderer',
              __match_component: 'MarkdownUserNameRenderer.react',
              __match_fragment:
                'MarkdownUserNameRenderer_name$normalization.graphql',
              markdown: 'markdown payload',
              data: {
                markup: '<markup/>',
              },
            },
          },
        },
      };
      dataSource.next(payload);
      jest.runAllTimers();

      expect(next.mock.calls.length).toBe(1);
      expect(complete).not.toBeCalled();
      expect(error).not.toBeCalled();
      expect(callback.mock.calls.length).toBe(1);
      const data = (callback.mock.calls[0][0].data: any);
      expect(data).toEqual({
        node: {
          nameRenderer: null, // match field data hasn't been processed yet
        },
      });
    });

    it('loads the @match fragment and normalizes/publishes the field payload', () => {
      environment.execute({operation}).subscribe(callbacks);
      const payload = {
        data: {
          node: {
            id: '1',
            __typename: 'User',
            nameRenderer: {
              __typename: 'MarkdownUserNameRenderer',
              __match_component: 'MarkdownUserNameRenderer.react',
              __match_fragment:
                'MarkdownUserNameRenderer_name$normalization.graphql',
              markdown: 'markdown payload',
              data: {
                // NOTE: should be uppercased when normalized (by MarkupHandler)
                markup: '<markup/>',
              },
            },
          },
        },
      };
      dataSource.next(payload);
      jest.runAllTimers();
      next.mockClear();

      expect(operationLoader.load).toBeCalledTimes(1);
      expect(operationLoader.load.mock.calls[0][0]).toEqual(
        'MarkdownUserNameRenderer_name$normalization.graphql',
      );

      const operationSnapshot = environment.lookup(operation.fragment);
      expect(operationSnapshot.data).toEqual({
        node: {
          nameRenderer: null, // match field data hasn't been processed yet
        },
      });
      const callback = jest.fn();
      environment.subscribe(operationSnapshot, callback);

      resolveFragment(markdownRendererNormalizationFragment);
      jest.runAllTimers();
      // next() should not be called when @match resolves, no new GraphQLResponse
      // was received for this case
      expect(next).toBeCalledTimes(0);
      expect(callback).toBeCalledTimes(1);
      const operationData = callback.mock.calls[0][0].data;
      expect(operationData).toEqual({
        node: {
          nameRenderer: {
            __id:
              'client:1:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
            __fragmentPropName: 'name',
            __fragments: {
              MarkdownUserNameRenderer_name: {},
            },
            __module: 'MarkdownUserNameRenderer.react',
          },
        },
      });

      const fragmentSelector = nullthrows(
        getSelector(
          variables,
          markdownRendererFragment,
          (operationData?.node: any)?.nameRenderer,
        ),
      );
      const snapshot = environment.lookup(fragmentSelector);
      expect(snapshot.data).toEqual({
        __typename: 'MarkdownUserNameRenderer',
        data: {
          // NOTE: should be uppercased by the MarkupHandler
          markup: '<MARKUP/>',
        },
        markdown: 'markdown payload',
      });
    });

    it('calls complete() if the network completes before processing the match', () => {
      environment.execute({operation}).subscribe(callbacks);
      const payload = {
        data: {
          node: {
            id: '1',
            __typename: 'User',
            nameRenderer: {
              __typename: 'MarkdownUserNameRenderer',
              __match_component: 'MarkdownUserNameRenderer.react',
              __match_fragment:
                'MarkdownUserNameRenderer_name$normalization.graphql',
              markdown: 'markdown payload',
              data: {
                markup: '<markup/>',
              },
            },
          },
        },
      };
      dataSource.next(payload);
      jest.runAllTimers();
      dataSource.complete();
      expect(callbacks.complete).toBeCalledTimes(0);
      expect(callbacks.error).toBeCalledTimes(0);
      expect(callbacks.next).toBeCalledTimes(1);

      expect(operationLoader.load).toBeCalledTimes(1);
      expect(operationLoader.load.mock.calls[0][0]).toBe(
        'MarkdownUserNameRenderer_name$normalization.graphql',
      );
      resolveFragment(markdownRendererNormalizationFragment);
      jest.runAllTimers();
      expect(callbacks.complete).toBeCalledTimes(1);
      expect(callbacks.error).toBeCalledTimes(0);
      expect(callbacks.next).toBeCalledTimes(1);
    });

    it('calls complete() if the network completes after processing the match', () => {
      environment.execute({operation}).subscribe(callbacks);
      const payload = {
        data: {
          node: {
            id: '1',
            __typename: 'User',
            nameRenderer: {
              __typename: 'MarkdownUserNameRenderer',
              __match_component: 'MarkdownUserNameRenderer.react',
              __match_fragment:
                'MarkdownUserNameRenderer_name$normalization.graphql',
              markdown: 'markdown payload',
              data: {
                markup: '<markup/>',
              },
            },
          },
        },
      };
      dataSource.next(payload);
      jest.runAllTimers();

      expect(operationLoader.load).toBeCalledTimes(1);
      expect(operationLoader.load.mock.calls[0][0]).toBe(
        'MarkdownUserNameRenderer_name$normalization.graphql',
      );
      resolveFragment(markdownRendererNormalizationFragment);
      jest.runAllTimers();
      expect(callbacks.complete).toBeCalledTimes(0);
      expect(callbacks.error).toBeCalledTimes(0);
      expect(callbacks.next).toBeCalledTimes(1);

      dataSource.complete();
      expect(callbacks.complete).toBeCalledTimes(1);
      expect(callbacks.error).toBeCalledTimes(0);
      expect(callbacks.next).toBeCalledTimes(1);
    });

    it('calls error() if the operationLoader function throws synchronously', () => {
      environment.execute({operation}).subscribe(callbacks);
      const payload = {
        data: {
          node: {
            id: '1',
            __typename: 'User',
            nameRenderer: {
              __typename: 'MarkdownUserNameRenderer',
              __match_component: 'MarkdownUserNameRenderer.react',
              __match_fragment:
                'MarkdownUserNameRenderer_name$normalization.graphql',
              markdown: 'markdown payload',
              data: {
                markup: '<markup/>',
              },
            },
          },
        },
      };
      const loaderError = new Error();
      operationLoader.load = jest.fn(() => {
        throw loaderError;
      });
      dataSource.next(payload);
      jest.runAllTimers();

      expect(callbacks.error).toBeCalledTimes(1);
      expect(callbacks.error.mock.calls[0][0]).toBe(loaderError);
    });

    it('calls error() if the operationLoader promise fails', () => {
      environment.execute({operation}).subscribe(callbacks);
      const payload = {
        data: {
          node: {
            id: '1',
            __typename: 'User',
            nameRenderer: {
              __typename: 'MarkdownUserNameRenderer',
              __match_component: 'MarkdownUserNameRenderer.react',
              __match_fragment:
                'MarkdownUserNameRenderer_name$normalization.graphql',
              markdown: 'markdown payload',
              data: {
                markup: '<markup/>',
              },
            },
          },
        },
      };
      const loaderError = new Error();
      operationLoader.load = jest.fn(() => {
        return Promise.reject(loaderError);
      });
      dataSource.next(payload);
      jest.runAllTimers();

      expect(callbacks.error).toBeCalledTimes(1);
      expect(callbacks.error.mock.calls[0][0]).toBe(loaderError);
    });

    it('calls error() if processing a match payload throws', () => {
      environment.execute({operation}).subscribe(callbacks);
      const payload = {
        data: {
          node: {
            id: '1',
            __typename: 'User',
            nameRenderer: {
              __typename: 'MarkdownUserNameRenderer',
              __match_component: 'MarkdownUserNameRenderer.react',
              __match_fragment:
                'MarkdownUserNameRenderer_name$normalization.graphql',
              markdown: 'markdown payload',
              data: {
                markup: '<markup/>',
              },
            },
          },
        },
      };
      operationLoader.load = jest.fn(() => {
        // Invalid fragment node, no 'selections' field
        // This is to make sure that users implementing operationLoader
        // incorrectly still get reasonable error handling
        return Promise.resolve(({}: any));
      });
      dataSource.next(payload);
      jest.runAllTimers();

      expect(callbacks.error).toBeCalledTimes(1);
      expect(callbacks.error.mock.calls[0][0].message).toBe(
        "Cannot read property 'forEach' of undefined",
      );
    });

    it('cancels @match processing if unsubscribed', () => {
      const selector = {
        dataID: ROOT_ID,
        node: query.fragment,
        variables,
      };
      const snapshot = environment.lookup(selector);
      const callback = jest.fn();
      environment.subscribe(snapshot, callback);

      const subscription = environment
        .execute({operation})
        .subscribe(callbacks);
      const payload = {
        data: {
          node: {
            id: '1',
            __typename: 'User',
            nameRenderer: {
              __typename: 'MarkdownUserNameRenderer',
              __match_component: 'MarkdownUserNameRenderer.react',
              __match_fragment:
                'MarkdownUserNameRenderer_name$normalization.graphql',
              markdown: 'markdown payload',
              data: {
                markup: '<markup/>',
              },
            },
          },
        },
      };
      dataSource.next(payload);
      jest.runAllTimers();

      next.mockClear();
      complete.mockClear();
      error.mockClear();
      callback.mockClear();

      expect(operationLoader.load).toBeCalledTimes(1);
      expect(operationLoader.load.mock.calls[0][0]).toEqual(
        'MarkdownUserNameRenderer_name$normalization.graphql',
      );
      // Cancel before the fragment resolves; normalization should be skipped
      subscription.unsubscribe();
      resolveFragment(markdownRendererNormalizationFragment);
      jest.runAllTimers();

      expect(callback).toBeCalledTimes(0);
      expect(environment.lookup(selector).data).toEqual({
        node: {
          nameRenderer: null,
        },
      });
    });
  });

  describe('executeMutation()', () => {
    let CreateCommentMutation;
    let CreateCommentWithSpreadMutation;
    let CommentFragment;
    let subject;
    let fetch;
    let environment;
    let complete;
    let error;
    let callbacks;
    let operation;
    let variables;

    beforeEach(() => {
      ({
        CreateCommentMutation,
        CreateCommentWithSpreadMutation,
        CommentFragment,
      } = generateAndCompile(
        `
        mutation CreateCommentMutation($input: CommentCreateInput!) {
          commentCreate(input: $input) {
            comment {
              id
              body {
                text
              }
            }
          }
        }

        fragment CommentFragment on Comment {
          id
          body {
            text
          }
        }

        mutation CreateCommentWithSpreadMutation($input: CommentCreateInput!) {
          commentCreate(input: $input) {
            comment {
              ...CommentFragment
            }
          }
        }
      `,
      ));
      variables = {
        input: {
          clientMutationId: '0',
          feedbackId: '1',
        },
      };
      operation = createOperationSelector(CreateCommentMutation, variables);

      fetch = jest.fn((_query, _variables, _cacheConfig) =>
        RelayObservable.create(sink => {
          subject = sink;
        }),
      );
      environment = new RelayModernEnvironment({
        network: RelayNetwork.create(fetch),
        store,
      });
      complete = jest.fn();
      error = jest.fn();
      callbacks = {complete, error};
    });

    it('fetches the mutation with the provided fetch function', () => {
      environment.executeMutation({operation});
      expect(fetch.mock.calls.length).toBe(1);
      expect(fetch.mock.calls[0][0]).toBe(CreateCommentMutation);
      expect(fetch.mock.calls[0][1]).toEqual(variables);
      expect(fetch.mock.calls[0][2]).toEqual({force: true});
    });

    it('executes the optimistic updater immediately', () => {
      const commentID = 'comment';
      const selector = {
        dataID: commentID,
        node: CommentFragment,
        variables: {},
      };
      const snapshot = environment.lookup(selector);
      const callback = jest.fn();
      environment.subscribe(snapshot, callback);

      environment
        .executeMutation({
          operation,
          optimisticUpdater: _store => {
            const comment = _store.create(commentID, 'Comment');
            comment.setValue(commentID, 'id');
            const body = _store.create(commentID + '.text', 'Text');
            comment.setLinkedRecord(body, 'body');
            body.setValue('Give Relay', 'text');
          },
        })
        .subscribe(callbacks);
      expect(complete).not.toBeCalled();
      expect(error).not.toBeCalled();
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0].data).toEqual({
        id: commentID,
        body: {
          text: 'Give Relay',
        },
      });
    });

    it('reverts the optimistic update if disposed', () => {
      const commentID = 'comment';
      const selector = {
        dataID: commentID,
        node: CommentFragment,
        variables: {},
      };
      const snapshot = environment.lookup(selector);
      const callback = jest.fn();
      environment.subscribe(snapshot, callback);

      const subscription = environment
        .executeMutation({
          operation,
          optimisticUpdater: _store => {
            const comment = _store.create(commentID, 'Comment');
            comment.setValue(commentID, 'id');
            const body = _store.create(commentID + '.text', 'Text');
            comment.setLinkedRecord(body, 'body');
            body.setValue('Give Relay', 'text');
          },
        })
        .subscribe(callbacks);
      callback.mockClear();
      subscription.unsubscribe();
      expect(complete).not.toBeCalled();
      expect(error).not.toBeCalled();
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0].data).toEqual(undefined);
    });

    it('reverts the optimistic update and commits the server payload', () => {
      const commentID = 'comment';
      const selector = {
        dataID: commentID,
        node: CommentFragment,
        variables: {},
      };
      const snapshot = environment.lookup(selector);
      const callback = jest.fn();
      environment.subscribe(snapshot, callback);

      environment
        .executeMutation({
          operation,
          optimisticUpdater: _store => {
            const comment = _store.create(commentID, 'Comment');
            comment.setValue(commentID, 'id');
            const body = _store.create(commentID + '.text', 'Text');
            comment.setLinkedRecord(body, 'body');
            body.setValue('Give Relay', 'text');
          },
        })
        .subscribe(callbacks);

      callback.mockClear();
      subject.next({
        data: {
          commentCreate: {
            comment: {
              id: commentID,
              body: {
                text: 'Gave Relay',
              },
            },
          },
        },
      });
      subject.complete();

      expect(complete).toBeCalled();
      expect(error).not.toBeCalled();
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0].data).toEqual({
        id: commentID,
        body: {
          text: 'Gave Relay',
        },
      });
    });

    it('commits the server payload and runs the updater', () => {
      const commentID = 'comment';
      const selector = {
        dataID: commentID,
        node: CommentFragment,
        variables: {},
      };
      const snapshot = environment.lookup(selector);
      const callback = jest.fn();
      environment.subscribe(snapshot, callback);

      environment
        .executeMutation({
          operation,
          updater: _store => {
            const comment = _store.get(commentID);
            if (!comment) {
              throw new Error('Expected comment to be in the store');
            }
            const body = comment.getLinkedRecord('body');
            if (!body) {
              throw new Error('Expected comment to have a body');
            }
            const bodyValue: string = (body.getValue('text'): $FlowFixMe);
            if (bodyValue == null) {
              throw new Error('Expected comment body to have text');
            }
            body.setValue(bodyValue.toUpperCase(), 'text');
          },
        })
        .subscribe(callbacks);

      callback.mockClear();
      subject.next({
        data: {
          commentCreate: {
            comment: {
              id: commentID,
              body: {
                text: 'Gave Relay', // server data is lowercase
              },
            },
          },
        },
      });
      subject.complete();

      expect(complete).toBeCalled();
      expect(error).not.toBeCalled();
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0].data).toEqual({
        id: commentID,
        body: {
          text: 'GAVE RELAY', // converted to uppercase by updater
        },
      });
    });

    it('reverts the optimistic update if the fetch is rejected', () => {
      const commentID = 'comment';
      const selector = {
        dataID: commentID,
        node: CommentFragment,
        variables: {},
      };
      const snapshot = environment.lookup(selector);
      const callback = jest.fn();
      environment.subscribe(snapshot, callback);

      environment
        .executeMutation({
          operation,
          optimisticUpdater: _store => {
            const comment = _store.create(commentID, 'Comment');
            comment.setValue(commentID, 'id');
            const body = _store.create(commentID + '.text', 'Text');
            comment.setLinkedRecord(body, 'body');
            body.setValue('Give Relay', 'text');
          },
        })
        .subscribe(callbacks);

      callback.mockClear();
      subject.error(new Error('wtf'));

      expect(complete).not.toBeCalled();
      expect(error).toBeCalled();
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0].data).toEqual(undefined);
    });

    it('commits optimistic response with fragment spread', () => {
      operation = createOperationSelector(
        CreateCommentWithSpreadMutation,
        variables,
      );

      const commentID = 'comment';
      const selector = {
        dataID: commentID,
        node: CommentFragment,
        variables: {},
      };
      const snapshot = environment.lookup(selector);
      const callback = jest.fn();
      environment.subscribe(snapshot, callback);

      environment
        .executeMutation({
          operation,
          optimisticResponse: {
            commentCreate: {
              comment: {
                id: commentID,
                body: {
                  text: 'Give Relay',
                },
              },
            },
          },
        })
        .subscribe(callbacks);

      expect(complete).not.toBeCalled();
      expect(error).not.toBeCalled();
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0][0].data).toEqual({
        id: commentID,
        body: {
          text: 'Give Relay',
        },
      });
    });

    it('does not commit the server payload if disposed', () => {
      const commentID = 'comment';
      const selector = {
        dataID: commentID,
        node: CommentFragment,
        variables: {},
      };
      const snapshot = environment.lookup(selector);
      const callback = jest.fn();
      environment.subscribe(snapshot, callback);

      const subscription = environment
        .executeMutation({
          operation,
          optimisticUpdater: _store => {
            const comment = _store.create(commentID, 'Comment');
            comment.setValue(commentID, 'id');
            const body = _store.create(commentID + '.text', 'Text');
            comment.setLinkedRecord(body, 'body');
            body.setValue('Give Relay', 'text');
          },
        })
        .subscribe(callbacks);

      subscription.unsubscribe();
      callback.mockClear();
      subject.next({
        data: {
          commentCreate: {
            comment: {
              id: commentID,
              body: {
                text: 'Gave Relay',
              },
            },
          },
        },
      });
      subject.complete();
      expect(complete).not.toBeCalled();
      expect(error).not.toBeCalled();
      // The optimistic update has already been reverted
      expect(callback.mock.calls.length).toBe(0);
    });
  });

  // Regression test: updaters read the store using the selector used to
  // publish, which can fail if a normalization ast was passed as the
  // selector.
  describe('execute() with handler and updater', () => {
    let callbacks;
    let environment;
    let fetch;
    let complete;
    let error;
    let next;
    let operation;
    let subject;
    let query;

    beforeEach(() => {
      ({ActorQuery: query} = generateAndCompile(`
        query ActorQuery {
          me {
            name @__clientField(handle: "name_handler")
          }
        }
      `));
      operation = createOperationSelector(query, {});

      complete = jest.fn();
      error = jest.fn();
      next = jest.fn();
      callbacks = {complete, error, next};
      fetch = jest.fn((_query, _variables, _cacheConfig) =>
        RelayObservable.create(sink => {
          subject = sink;
        }),
      );
      const NameHandler = {
        update(storeProxy, payload) {
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

      environment = new RelayModernEnvironment({
        network: RelayNetwork.create((fetch: $FlowFixMe)),
        store,
        handlerProvider: name => {
          switch (name) {
            case 'name_handler':
              return NameHandler;
          }
        },
      });
    });

    it('calls next() and runs updater when payloads return', () => {
      const updater = jest.fn();
      environment.execute({operation, updater}).subscribe(callbacks);
      subject.next({
        data: {
          me: {
            id: '1',
            __typename: 'User',
            name: 'Alice',
          },
        },
      });
      jest.runAllTimers();
      expect(next).toBeCalledTimes(1);
      expect(complete).toBeCalledTimes(0);
      expect(error).toBeCalledTimes(0);
      expect(updater).toBeCalledTimes(1);
      expect(environment.lookup(operation.fragment).data).toEqual({
        me: {
          name: 'ALICE',
        },
      });
    });
  });
});

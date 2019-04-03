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

const RelayConnectionHandler = require('../../handlers/connection/RelayConnectionHandler');
const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const RelayInMemoryRecordSource = require('../RelayInMemoryRecordSource');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernOperationDescriptor = require('../RelayModernOperationDescriptor');
const RelayModernSelector = require('../RelayModernSelector');
const RelayModernStore = require('../RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const RelayViewerHandler = require('../../handlers/viewer/RelayViewerHandler');

const invariant = require('invariant');
const nullthrows = require('nullthrows');

const {getRequest} = require('../RelayCore');
const {getSingularSelector} = require('../RelayModernSelector');
const {ROOT_ID} = require('../RelayStoreUtils');
const {generateAndCompile, matchers} = require('relay-test-utils');

const {VIEWER_ID} = RelayViewerHandler;

describe('RelayModernEnvironment', () => {
  let config;
  let source;
  let store;
  let previousEnableIncrementalDelivery;

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

  beforeEach(() => {
    jest.resetModules();
    previousEnableIncrementalDelivery =
      RelayFeatureFlags.ENABLE_INCREMENTAL_DELIVERY;
    RelayFeatureFlags.ENABLE_INCREMENTAL_DELIVERY = true;

    expect.extend(matchers);
    source = new RelayInMemoryRecordSource();
    store = new RelayModernStore(source);

    config = {
      network: RelayNetwork.create(jest.fn()),
      store,
    };
  });

  afterEach(() => {
    RelayFeatureFlags.ENABLE_INCREMENTAL_DELIVERY = previousEnableIncrementalDelivery;
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
    let operationDescriptor;

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
      operationDescriptor = createOperationDescriptor(ParentQuery, {size: 32});
    });

    it('returns true if all data exists in the environment', () => {
      environment.commitPayload(operationDescriptor, {
        me: {
          id: '4',
          name: 'Zuck',
          profilePicture: {
            uri: 'https://...',
          },
        },
      });
      expect(environment.check(operationDescriptor.root)).toBe(true);
    });

    it('returns false if data is missing from the environment', () => {
      environment.commitPayload(operationDescriptor, {
        me: {
          id: '4',
          name: 'Zuck',
          profilePicture: {
            uri: undefined,
          },
        },
      });
      expect(environment.check(operationDescriptor.root)).toBe(false);
    });
  });

  describe('lookup()', () => {
    let ParentQuery;
    let environment;
    let operation;

    beforeEach(() => {
      ({ParentQuery} = generateAndCompile(`
        query ParentQuery {
          me {
            id
            name
            ...ChildFragment
          }
        }
        fragment ChildFragment on User {
          id
          name
        }
      `));
      environment = new RelayModernEnvironment(config);
      operation = createOperationDescriptor(ParentQuery, {});
      environment.commitPayload(operation, {
        me: {
          id: '4',
          name: 'Zuck',
        },
      });
    });

    it('returns the results of executing a query', () => {
      const snapshot = environment.lookup(
        {
          dataID: ROOT_ID,
          node: ParentQuery.fragment,
          variables: {},
        },
        operation,
      );
      expect(snapshot.data).toEqual({
        me: {
          id: '4',
          name: 'Zuck',
          __id: '4',
          __fragments: {ChildFragment: {}},
          __fragmentOwner: operation,
        },
      });
    });

    it('includes fragment owner in result when owner is provided', () => {
      const queryNode = getRequest(ParentQuery);
      const owner = createOperationDescriptor(queryNode, {});
      const snapshot = environment.lookup(
        {
          dataID: ROOT_ID,
          node: ParentQuery.fragment,
          variables: {},
        },
        owner,
      );
      expect(snapshot.data).toEqual({
        me: {
          id: '4',
          name: 'Zuck',
          __id: '4',
          __fragments: {ChildFragment: {}},
          __fragmentOwner: owner,
        },
      });
      // $FlowFixMe
      expect(snapshot.data?.me?.__fragmentOwner).toBe(owner);
    });
  });

  describe('subscribe()', () => {
    let ParentQuery;
    let environment;
    let operation;

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
      operation = createOperationDescriptor(ParentQuery, {});
      environment.commitPayload(operation, {
        me: {
          id: '4',
          name: 'Zuck',
        },
      });
    });

    it('calls the callback if data changes', () => {
      const snapshot = environment.lookup(
        {
          dataID: ROOT_ID,
          node: ParentQuery.fragment,
          variables: {},
        },
        operation,
      );
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
      const snapshot = environment.lookup(
        {
          dataID: ROOT_ID,
          node: ParentQuery.fragment,
          variables: {},
        },
        operation,
      );
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
    let operation;

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
      operation = createOperationDescriptor(ParentQuery, {});
      environment.commitPayload(operation, {
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
      const snapshot = environment.lookup(
        {
          dataID: ROOT_ID,
          node: ParentQuery.fragment,
          variables: {},
        },
        operation,
      );
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
      expect(environment.lookup(selector, operation).data).toEqual({
        me: {
          id: '4',
          name: 'Zuck',
        },
      });
      jest.runAllTimers();
      // After GC runs data is missing
      expect(environment.lookup(selector, operation).data).toBe(undefined);
    });
  });

  describe('applyUpdate()', () => {
    let ParentQuery;
    let UserFragment;
    let environment;
    let operation;

    beforeEach(() => {
      ({ParentQuery, UserFragment} = generateAndCompile(`
        query ParentQuery {
          me {
            id
            name
          }
        }
        fragment UserFragment on User {
          id
          name
        }
      `));
      environment = new RelayModernEnvironment(config);
      operation = createOperationDescriptor(ParentQuery, {});
    });

    it('applies the mutation to the store', () => {
      const selector = {
        dataID: '4',
        node: UserFragment,
        variables: {},
      };
      const callback = jest.fn();
      const snapshot = environment.lookup(selector, operation);
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
      const snapshot = environment.lookup(selector, operation);
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
      const snapshot = environment.lookup(selector, operation);
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
    let operation;

    beforeEach(() => {
      ({ActorQuery} = generateAndCompile(`
        query ActorQuery {
          me {
            name
          }
        }
      `));
      operation = createOperationDescriptor(ActorQuery, {});
      (store: $FlowFixMe).notify = jest.fn(store.notify.bind(store));
      (store: $FlowFixMe).publish = jest.fn(store.publish.bind(store));
      environment = new RelayModernEnvironment(config);
    });

    it('applies server updates', () => {
      const callback = jest.fn();
      const snapshot = environment.lookup(operation.fragment, operation);
      environment.subscribe(snapshot, callback);

      environment.commitPayload(operation, {
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
      const snapshot = environment.lookup(operation.fragment, operation);
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

      environment.commitPayload(operation, {
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
      ({ActorQuery: query} = generateAndCompile(`
        query ActorQuery($fetchSize: Boolean!) {
          me {
            name
            profilePicture(size: 42) @include(if: $fetchSize) {
              uri
            }
          }
        }
      `));
      variables = {fetchSize: false};
      operation = createOperationDescriptor(query, {
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
      expect(fetch.mock.calls[0][0]).toEqual(query.params);
      expect(fetch.mock.calls[0][1]).toEqual({fetchSize: false});
      expect(fetch.mock.calls[0][2]).toEqual({});
    });

    it('fetches queries with force:true', () => {
      const cacheConfig = {force: true};
      environment.execute({cacheConfig, operation}).subscribe(callbacks);
      expect(fetch.mock.calls.length).toBe(1);
      expect(fetch.mock.calls[0][0]).toEqual(query.params);
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
      const snapshot = environment.lookup(selector, operation);
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
      ({ActorQuery: query} = generateAndCompile(`
        query ActorQuery($fetchSize: Boolean!) {
          me {
            name
            profilePicture(size: 42) @include(if: $fetchSize) {
              uri
            }
          }
        }
      `));
      variables = {fetchSize: false};
      operation = createOperationDescriptor(query, {
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
      expect(fetch.mock.calls[0][0]).toEqual(query.params);
      expect(fetch.mock.calls[0][1]).toEqual({fetchSize: false});
      expect(fetch.mock.calls[0][2]).toEqual({});
    });

    it('fetches queries with force:true', () => {
      const cacheConfig = {force: true};
      environment.execute({cacheConfig, operation}).subscribe(callbacks);
      expect(fetch.mock.calls.length).toBe(1);
      expect(fetch.mock.calls[0][0]).toEqual(query.params);
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
      const snapshot = environment.lookup(selector, operation);
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
      ({ActorQuery: query} = generateAndCompile(`
        query ActorQuery($fetchSize: Boolean!) {
          me {
            name
            profilePicture(size: 42) @include(if: $fetchSize) {
              uri
            }
          }
        }
      `));
      variables = {fetchSize: false};
      operation = createOperationDescriptor(query, {
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
      const snapshot = environment.lookup(selector, operation);
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
      const snapshot = environment.lookup(selector, operation);
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
      const snapshot = environment.lookup(selector, operation);
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
      const snapshot = environment.lookup(selector, operation);
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
      const snapshot = environment.lookup(selector, operation);
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

    it('calls error() if optimistic response is missing data', () => {
      const selector = {
        dataID: ROOT_ID,
        node: query.fragment,
        variables,
      };
      const snapshot = environment.lookup(selector, operation);
      const callback = jest.fn();
      environment.subscribe(snapshot, callback);

      const subscription = environment
        .execute({operation})
        .subscribe(callbacks);
      dataSource.next({
        errors: [
          {
            message: 'wtf',
            locations: [],
            severity: 'ERROR',
          },
        ],
        extensions: {
          isOptimistic: true,
        },
      });
      jest.runAllTimers();
      subscription.unsubscribe();

      expect(next).toBeCalledTimes(0);
      expect(complete).toBeCalledTimes(0);
      expect(error).toBeCalledTimes(1);
      expect(error.mock.calls[0][0].message).toContain(
        'No data returned for operation `ActorQuery`',
      );
      expect(callback).toBeCalledTimes(0);
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
    let operationCallback;
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
      operation = createOperationDescriptor(query, variables);
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

      const operationSnapshot = environment.lookup(
        operation.fragment,
        operation,
      );
      operationCallback = jest.fn();
      environment.subscribe(operationSnapshot, operationCallback);
    });

    it('calls next() and publishes the initial payload to the store', () => {
      environment.execute({operation}).subscribe(callbacks);
      const payload = {
        data: {
          node: {
            id: '1',
            __typename: 'User',
            nameRenderer: {
              __typename: 'MarkdownUserNameRenderer',
              __module_component: 'MarkdownUserNameRenderer.react',
              __module_operation:
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
      expect(operationLoader.load.mock.calls[0][0]).toEqual(
        'MarkdownUserNameRenderer_name$normalization.graphql',
      );

      expect(next.mock.calls.length).toBe(1);
      expect(complete).not.toBeCalled();
      expect(error).not.toBeCalled();
      expect(operationCallback).toBeCalledTimes(1);
      const operationSnapshot = operationCallback.mock.calls[0][0];
      expect(operationSnapshot.isMissingData).toBe(false);
      expect(operationSnapshot.data).toEqual({
        node: {
          nameRenderer: {
            __id:
              'client:1:nameRenderer(MarkdownUserNameRenderer_name:MarkdownUserNameRenderer.react,PlainUserNameRenderer_name:PlainUserNameRenderer.react)',
            __fragmentPropName: 'name',
            __fragments: {
              MarkdownUserNameRenderer_name: {},
            },
            __fragmentOwner: operation,
            __module_component: 'MarkdownUserNameRenderer.react',
          },
        },
      });

      const matchSelector = nullthrows(
        getSingularSelector(
          variables,
          markdownRendererFragment,
          (operationSnapshot.data?.node: any)?.nameRenderer,
        ),
      );
      const matchSnapshot = environment.lookup(
        matchSelector.selector,
        operation,
      );
      // ref exists but match field data hasn't been processed yet
      expect(matchSnapshot.isMissingData).toBe(true);
      expect(matchSnapshot.data).toEqual({
        __typename: 'MarkdownUserNameRenderer',
        data: undefined,
        markdown: undefined,
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
              __module_component: 'MarkdownUserNameRenderer.react',
              __module_operation:
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
      expect(operationCallback).toBeCalledTimes(1); // initial results tested above
      const operationSnapshot = operationCallback.mock.calls[0][0];
      operationCallback.mockClear();

      const matchSelector = nullthrows(
        getSingularSelector(
          variables,
          markdownRendererFragment,
          (operationSnapshot.data?.node: any)?.nameRenderer,
        ),
      );
      // initial results tested above
      const initialMatchSnapshot = environment.lookup(
        matchSelector.selector,
        operation,
      );
      expect(initialMatchSnapshot.isMissingData).toBe(true);
      const matchCallback = jest.fn();
      environment.subscribe(initialMatchSnapshot, matchCallback);

      resolveFragment(markdownRendererNormalizationFragment);
      jest.runAllTimers();
      // next() should not be called when @match resolves, no new GraphQLResponse
      // was received for this case
      expect(next).toBeCalledTimes(0);
      expect(operationCallback).toBeCalledTimes(0); // operation result shouldn't change
      expect(matchCallback).toBeCalledTimes(1);

      const matchSnapshot = matchCallback.mock.calls[0][0];
      expect(matchSnapshot.isMissingData).toBe(false);
      expect(matchSnapshot.data).toEqual({
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
              __module_component: 'MarkdownUserNameRenderer.react',
              __module_operation:
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
              __module_component: 'MarkdownUserNameRenderer.react',
              __module_operation:
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
              __module_component: 'MarkdownUserNameRenderer.react',
              __module_operation:
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
              __module_component: 'MarkdownUserNameRenderer.react',
              __module_operation:
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
              __module_component: 'MarkdownUserNameRenderer.react',
              __module_operation:
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
        "Cannot read property 'length' of undefined",
      );
    });

    it('cancels @match processing if unsubscribed before match payload is processed', () => {
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
              __module_component: 'MarkdownUserNameRenderer.react',
              __module_operation:
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
      expect(operationCallback).toBeCalledTimes(1); // initial results tested above
      const operationSnapshot = operationCallback.mock.calls[0][0];
      operationCallback.mockClear();

      const matchSelector = nullthrows(
        getSingularSelector(
          variables,
          markdownRendererFragment,
          (operationSnapshot.data?.node: any)?.nameRenderer,
        ),
      );
      // initial results tested above
      const initialMatchSnapshot = environment.lookup(
        matchSelector.selector,
        operation,
      );
      expect(initialMatchSnapshot.isMissingData).toBe(true);
      const matchCallback = jest.fn();
      environment.subscribe(initialMatchSnapshot, matchCallback);

      subscription.unsubscribe();
      resolveFragment(markdownRendererNormalizationFragment);
      jest.runAllTimers();
      // next() should not be called when @match resolves, no new GraphQLResponse
      // was received for this case
      expect(next).toBeCalledTimes(0);
      expect(operationCallback).toBeCalledTimes(0); // operation result shouldn't change
      expect(matchCallback).toBeCalledTimes(0); // match result shouldn't change
    });
  });

  describe('execute() a query with plural @match', () => {
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
    let operationCallback;
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
              nameRenderers @match {
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
      operation = createOperationDescriptor(query, variables);
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

      const operationSnapshot = environment.lookup(
        operation.fragment,
        operation,
      );
      operationCallback = jest.fn();
      environment.subscribe(operationSnapshot, operationCallback);
    });

    it('calls next() and publishes the initial payload to the store', () => {
      environment.execute({operation}).subscribe(callbacks);
      const payload = {
        data: {
          node: {
            id: '1',
            __typename: 'User',
            nameRenderers: [
              {
                __typename: 'MarkdownUserNameRenderer',
                __module_component: 'MarkdownUserNameRenderer.react',
                __module_operation:
                  'MarkdownUserNameRenderer_name$normalization.graphql',
                markdown: 'markdown payload',
                data: {
                  markup: '<markup/>',
                },
              },
            ],
          },
        },
      };
      dataSource.next(payload);
      jest.runAllTimers();

      expect(operationLoader.load).toBeCalledTimes(1);
      expect(operationLoader.load.mock.calls[0][0]).toEqual(
        'MarkdownUserNameRenderer_name$normalization.graphql',
      );

      expect(next.mock.calls.length).toBe(1);
      expect(complete).not.toBeCalled();
      expect(error).not.toBeCalled();
      expect(operationCallback).toBeCalledTimes(1);
      const operationSnapshot = operationCallback.mock.calls[0][0];
      expect(operationSnapshot.isMissingData).toBe(false);
      expect(operationSnapshot.data).toEqual({
        node: {
          nameRenderers: [
            {
              __id:
                'client:1:nameRenderers(MarkdownUserNameRenderer_name:MarkdownUserNameRenderer.react,PlainUserNameRenderer_name:PlainUserNameRenderer.react):0',
              __fragmentPropName: 'name',
              __fragments: {
                MarkdownUserNameRenderer_name: {},
              },
              __fragmentOwner: operation,
              __module_component: 'MarkdownUserNameRenderer.react',
            },
          ],
        },
      });

      const matchSelector = nullthrows(
        getSingularSelector(
          variables,
          markdownRendererFragment,
          (operationSnapshot.data?.node: any)?.nameRenderers[0],
        ),
      );
      const matchSnapshot = environment.lookup(
        matchSelector.selector,
        operation,
      );
      // ref exists but match field data hasn't been processed yet
      expect(matchSnapshot.isMissingData).toBe(true);
      expect(matchSnapshot.data).toEqual({
        __typename: 'MarkdownUserNameRenderer',
        data: undefined,
        markdown: undefined,
      });
    });

    it('loads the @match fragment and normalizes/publishes the field payload', () => {
      environment.execute({operation}).subscribe(callbacks);
      const payload = {
        data: {
          node: {
            id: '1',
            __typename: 'User',
            nameRenderers: [
              {
                __typename: 'MarkdownUserNameRenderer',
                __module_component: 'MarkdownUserNameRenderer.react',
                __module_operation:
                  'MarkdownUserNameRenderer_name$normalization.graphql',
                markdown: 'markdown payload',
                data: {
                  // NOTE: should be uppercased when normalized (by MarkupHandler)
                  markup: '<markup/>',
                },
              },
            ],
          },
        },
      };
      dataSource.next(payload);
      jest.runAllTimers();
      next.mockClear();
      expect(operationCallback).toBeCalledTimes(1); // initial results tested above
      const operationSnapshot = operationCallback.mock.calls[0][0];
      operationCallback.mockClear();

      const matchSelector = nullthrows(
        getSingularSelector(
          variables,
          markdownRendererFragment,
          (operationSnapshot.data?.node: any)?.nameRenderers[0],
        ),
      );
      // initial results tested above
      const initialMatchSnapshot = environment.lookup(
        matchSelector.selector,
        operation,
      );
      expect(initialMatchSnapshot.isMissingData).toBe(true);
      const matchCallback = jest.fn();
      environment.subscribe(initialMatchSnapshot, matchCallback);

      resolveFragment(markdownRendererNormalizationFragment);
      jest.runAllTimers();
      // next() should not be called when @match resolves, no new GraphQLResponse
      // was received for this case
      expect(next).toBeCalledTimes(0);
      expect(operationCallback).toBeCalledTimes(0); // operation result shouldn't change
      expect(matchCallback).toBeCalledTimes(1);

      const matchSnapshot = matchCallback.mock.calls[0][0];
      expect(matchSnapshot.isMissingData).toBe(false);
      expect(matchSnapshot.data).toEqual({
        __typename: 'MarkdownUserNameRenderer',
        data: {
          // NOTE: should be uppercased by the MarkupHandler
          markup: '<MARKUP/>',
        },
        markdown: 'markdown payload',
      });
    });
  });

  describe('execute() a query with @module', () => {
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
    let operationCallback;
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
              nameRenderer { # intentionally does not use @match
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
      operation = createOperationDescriptor(query, variables);

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
      const operationSnapshot = environment.lookup(
        operation.fragment,
        operation,
      );
      operationCallback = jest.fn();
      environment.subscribe(operationSnapshot, operationCallback);
    });

    it('calls next() and publishes the initial payload to the store', () => {
      environment.execute({operation}).subscribe(callbacks);
      const payload = {
        data: {
          node: {
            id: '1',
            __typename: 'User',
            nameRenderer: {
              __typename: 'MarkdownUserNameRenderer',
              __module_component: 'MarkdownUserNameRenderer.react',
              __module_operation:
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
      expect(operationLoader.load.mock.calls[0][0]).toEqual(
        'MarkdownUserNameRenderer_name$normalization.graphql',
      );

      expect(next.mock.calls.length).toBe(1);
      expect(complete).not.toBeCalled();
      expect(error).not.toBeCalled();
      expect(operationCallback).toBeCalledTimes(1);
      const operationSnapshot = operationCallback.mock.calls[0][0];
      expect(operationSnapshot.isMissingData).toBe(false);
      expect(operationSnapshot.data).toEqual({
        node: {
          nameRenderer: {
            __id: 'client:1:nameRenderer',
            __fragmentPropName: 'name',
            __fragments: {
              MarkdownUserNameRenderer_name: {},
            },
            __fragmentOwner: operation,
            __module_component: 'MarkdownUserNameRenderer.react',
          },
        },
      });

      const matchSelector = nullthrows(
        getSingularSelector(
          variables,
          markdownRendererFragment,
          (operationSnapshot.data?.node: any)?.nameRenderer,
        ),
      );
      const matchSnapshot = environment.lookup(
        matchSelector.selector,
        operation,
      );
      // ref exists but match field data hasn't been processed yet
      expect(matchSnapshot.isMissingData).toBe(true);
      expect(matchSnapshot.data).toEqual({
        __typename: 'MarkdownUserNameRenderer',
        data: undefined,
        markdown: undefined,
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
              __module_component: 'MarkdownUserNameRenderer.react',
              __module_operation:
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
      expect(operationCallback).toBeCalledTimes(1); // initial results tested above
      const operationSnapshot = operationCallback.mock.calls[0][0];
      operationCallback.mockClear();

      const matchSelector = nullthrows(
        getSingularSelector(
          variables,
          markdownRendererFragment,
          (operationSnapshot.data?.node: any)?.nameRenderer,
        ),
      );
      // initial results tested above
      const initialMatchSnapshot = environment.lookup(
        matchSelector.selector,
        operation,
      );
      expect(initialMatchSnapshot.isMissingData).toBe(true);
      const matchCallback = jest.fn();
      environment.subscribe(initialMatchSnapshot, matchCallback);

      resolveFragment(markdownRendererNormalizationFragment);
      jest.runAllTimers();
      // next() should not be called when @match resolves, no new GraphQLResponse
      // was received for this case
      expect(next).toBeCalledTimes(0);
      expect(operationCallback).toBeCalledTimes(0); // operation result shouldn't change
      expect(matchCallback).toBeCalledTimes(1);

      const matchSnapshot = matchCallback.mock.calls[0][0];
      expect(matchSnapshot.isMissingData).toBe(false);
      expect(matchSnapshot.data).toEqual({
        __typename: 'MarkdownUserNameRenderer',
        data: {
          // NOTE: should be uppercased by the MarkupHandler
          markup: '<MARKUP/>',
        },
        markdown: 'markdown payload',
      });
    });

    it('calls complete() if the network completes before processing the @module', () => {
      environment.execute({operation}).subscribe(callbacks);
      const payload = {
        data: {
          node: {
            id: '1',
            __typename: 'User',
            nameRenderer: {
              __typename: 'MarkdownUserNameRenderer',
              __module_component: 'MarkdownUserNameRenderer.react',
              __module_operation:
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

    it('calls complete() if the network completes after processing the @module', () => {
      environment.execute({operation}).subscribe(callbacks);
      const payload = {
        data: {
          node: {
            id: '1',
            __typename: 'User',
            nameRenderer: {
              __typename: 'MarkdownUserNameRenderer',
              __module_component: 'MarkdownUserNameRenderer.react',
              __module_operation:
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
              __module_component: 'MarkdownUserNameRenderer.react',
              __module_operation:
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
              __module_component: 'MarkdownUserNameRenderer.react',
              __module_operation:
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

    it('calls error() if processing a module payload throws', () => {
      environment.execute({operation}).subscribe(callbacks);
      const payload = {
        data: {
          node: {
            id: '1',
            __typename: 'User',
            nameRenderer: {
              __typename: 'MarkdownUserNameRenderer',
              __module_component: 'MarkdownUserNameRenderer.react',
              __module_operation:
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
        "Cannot read property 'length' of undefined",
      );
    });

    it('cancels @module processing if unsubscribed', () => {
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
              __module_component: 'MarkdownUserNameRenderer.react',
              __module_operation:
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
      expect(operationCallback).toBeCalledTimes(1); // initial results tested above
      const operationSnapshot = operationCallback.mock.calls[0][0];
      operationCallback.mockClear();

      const matchSelector = nullthrows(
        getSingularSelector(
          variables,
          markdownRendererFragment,
          (operationSnapshot.data?.node: any)?.nameRenderer,
        ),
      );
      // initial results tested above
      const initialMatchSnapshot = environment.lookup(
        matchSelector.selector,
        operation,
      );
      expect(initialMatchSnapshot.isMissingData).toBe(true);
      const matchCallback = jest.fn();
      environment.subscribe(initialMatchSnapshot, matchCallback);

      subscription.unsubscribe();
      resolveFragment(markdownRendererNormalizationFragment);
      jest.runAllTimers();
      // next() should not be called when @match resolves, no new GraphQLResponse
      // was received for this case
      expect(next).toBeCalledTimes(0);
      expect(operationCallback).toBeCalledTimes(0); // operation result shouldn't change
      expect(matchCallback).toBeCalledTimes(0); // match results don't change
    });
  });

  describe('execute() a query with @defer', () => {
    let callbacks;
    let complete;
    let dataSource;
    let environment;
    let error;
    let fetch;
    let fragment;
    let next;
    let operation;
    let query;
    let selector;
    let variables;

    beforeEach(() => {
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
      selector = {
        dataID: '1',
        node: fragment,
        variables: {},
      };

      const NameHandler = {
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
      const initialSnapshot = environment.lookup(selector, operation);
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
      const initialSnapshot = environment.lookup(selector, operation);
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

    it('calls error() for invalid deferred payloads (unknown label)', () => {
      const initialSnapshot = environment.lookup(selector, operation);
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
        label: '<unknown-label>',
        path: ['node'],
      });

      expect(complete).toBeCalledTimes(0);
      expect(error).toBeCalledTimes(1);
      expect(error.mock.calls[0][0].message).toContain(
        "RelayModernEnvironment: Received response for unknown label '<unknown-label>'",
      );
      expect(next).toBeCalledTimes(0);
      expect(callback).toBeCalledTimes(0);
    });

    it('calls error() for invalid deferred payloads (unknown path)', () => {
      const initialSnapshot = environment.lookup(selector, operation);
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
        path: ['<unknown-path>', 0],
      });

      expect(complete).toBeCalledTimes(0);
      expect(error).toBeCalledTimes(1);
      expect(error.mock.calls[0][0].message).toContain(
        'RelayModernEnvironment: Received response for unknown path ' +
          '`<unknown-path>.0` for label `UserQuery$defer$UserFragment`. ' +
          'Known paths: node.',
      );
      expect(next).toBeCalledTimes(0);
      expect(callback).toBeCalledTimes(0);
    });

    it('calls complete() when server completes after deferred payload resolves', () => {
      const initialSnapshot = environment.lookup(selector, operation);
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
      const initialSnapshot = environment.lookup(selector, operation);
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
      const initialSnapshot = environment.lookup(selector, operation);
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
      const initialSnapshot = environment.lookup(selector, operation);
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
      const initialSnapshot = environment.lookup(selector, operation);
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
  });

  describe('execute() a query with @stream', () => {
    let actorFragment;
    let callbacks;
    let complete;
    let dataSource;
    let environment;
    let error;
    let fetch;
    let fragment;
    let next;
    let operation;
    let query;
    let selector;
    let variables;

    beforeEach(() => {
      jest.mock('warning');
      jest.spyOn(console, 'warn').mockImplementation(() => undefined);

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

      const NameHandler = {
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

    it('calls error() for invalid streamed payloads (unknown label)', () => {
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
        label: '<unknown-label>',
        path: ['node', 'actors', 0],
      });

      expect(complete).toBeCalledTimes(0);
      expect(error).toBeCalledTimes(1);
      expect(error.mock.calls[0][0].message).toContain(
        "RelayModernEnvironment: Received response for unknown label '<unknown-label>'",
      );
      expect(next).toBeCalledTimes(0);
      expect(callback).toBeCalledTimes(0);
    });

    it('calls error() for invalid streamed payloads (unknown path)', () => {
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
        path: ['<unknown-path>', 'actors', 0],
      });

      expect(complete).toBeCalledTimes(0);
      expect(error).toBeCalledTimes(1);
      expect(error.mock.calls[0][0].message).toContain(
        'RelayModernEnvironment: Received response for unknown path ' +
          '`<unknown-path>` for label `FeedbackFragment$stream$actors`. ' +
          'Known paths: node.',
      );
      expect(next).toBeCalledTimes(0);
      expect(callback).toBeCalledTimes(0);
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
  });

  describe('execute() a query with nested @stream', () => {
    let actorFragment;
    let callback;
    let callbacks;
    let complete;
    let dataSource;
    let environment;
    let error;
    let fetch;
    let feedFragment;
    let next;
    let operation;
    let query;
    let selector;
    let variables;

    beforeEach(() => {
      jest.mock('warning');
      jest.spyOn(console, 'warn').mockImplementation(() => undefined);

      ({
        FeedQuery: query,
        FeedFragment: feedFragment,
        ActorFragment: actorFragment,
      } = generateAndCompile(`
        query FeedQuery($enableStream: Boolean!) {
          viewer {
            ...FeedFragment
          }
        }

        fragment FeedFragment on Viewer {
          newsFeed(first: 10) {
            edges  @stream(label: "newsFeed", if: $enableStream, initial_count: 0) {
              cursor
              node {
                id
                feedback {
                  actors @stream(label: "actors", if: $enableStream, initial_count: 0) {
                    name @__clientField(handle: "name_handler")
                  }
                }
              }
            }
          }
        }

        fragment FeedEdgeFragment on NewsFeedEdge {
          cursor
          node {
            id
            feedback {
              actors @stream(label: "actors", if: $enableStream, initial_count: 0) {
                name @__clientField(handle: "name_handler")
              }
            }
          }
        }

        # keep in sync with above
        fragment ActorFragment on Actor {
          name @__clientField(handle: "name_handler")
        }
      `));
      variables = {enableStream: true};
      operation = createOperationDescriptor(query, variables);
      selector = {
        dataID: VIEWER_ID,
        node: feedFragment,
        variables,
      };

      const NameHandler = {
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
      environment = new RelayModernEnvironment({
        network: RelayNetwork.create(fetch),
        store,
        handlerProvider: name => {
          switch (name) {
            case 'name_handler':
              return NameHandler;
            case 'viewer':
              return RelayViewerHandler;
          }
        },
      });
    });

    // Publish an initial root payload and a parent nested stream payload
    beforeEach(() => {
      const initialSnapshot = environment.lookup(selector, operation);
      callback = jest.fn();
      environment.subscribe(initialSnapshot, callback);

      environment.execute({operation}).subscribe(callbacks);
      dataSource.next({
        data: {
          viewer: {
            newsFeed: {
              edges: [],
            },
          },
        },
      });
      jest.runAllTimers();
      next.mockClear();
      callback.mockClear();

      dataSource.next({
        data: {
          cursor: 'cursor-1',
          node: {
            __typename: 'Story',
            id: '1',
            feedback: {
              id: 'feedback-1',
              actors: [],
            },
          },
        },
        label: 'FeedFragment$stream$newsFeed',
        path: ['viewer', 'newsFeed', 'edges', 0],
      });
      expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
      expect(next).toBeCalledTimes(1);
      expect(callback).toBeCalledTimes(1);
      const snapshot = callback.mock.calls[0][0];
      expect(snapshot.isMissingData).toBe(false);
      expect(snapshot.data).toEqual({
        newsFeed: {
          edges: [
            {
              cursor: 'cursor-1',
              node: {
                id: '1',
                feedback: {
                  actors: [],
                },
              },
            },
          ],
        },
      });
      callback.mockClear();
      complete.mockClear();
      error.mockClear();
      next.mockClear();
    });

    it('processes nested payloads', () => {
      dataSource.next({
        data: {
          __typename: 'User',
          id: 'user-1',
          name: 'Alice',
        },
        label: 'FeedFragment$stream$actors',
        path: [
          'viewer',
          'newsFeed',
          'edges',
          0,
          'node',
          'feedback',
          'actors',
          0,
        ],
      });
      expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
      expect(next).toBeCalledTimes(1);
      expect(callback).toBeCalledTimes(1);
      const snapshot2 = callback.mock.calls[0][0];
      expect(snapshot2.isMissingData).toBe(false);
      expect(snapshot2.data).toEqual({
        newsFeed: {
          edges: [
            {
              cursor: 'cursor-1',
              node: {
                id: '1',
                feedback: {
                  actors: [
                    {
                      name: 'ALICE',
                    },
                  ],
                },
              },
            },
          ],
        },
      });

      dataSource.next({
        data: {
          __typename: 'User',
          id: 'user-2',
          name: 'Bob',
        },
        label: 'FeedFragment$stream$actors',
        path: [
          'viewer',
          'newsFeed',
          'edges',
          0,
          'node',
          'feedback',
          'actors',
          1,
        ],
      });
      expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
      expect(next).toBeCalledTimes(2);
      expect(callback).toBeCalledTimes(2);
      const snapshot3 = callback.mock.calls[1][0];
      expect(snapshot3.isMissingData).toBe(false);
      expect(snapshot3.data).toEqual({
        newsFeed: {
          edges: [
            {
              cursor: 'cursor-1',
              node: {
                id: '1',
                feedback: {
                  actors: [
                    {
                      name: 'ALICE',
                    },
                    {name: 'BOB'},
                  ],
                },
              },
            },
          ],
        },
      });

      expect(complete).toBeCalledTimes(0);
      expect(error).toBeCalledTimes(0);
    });

    it('processes @stream payloads when the parent record has been deleted', () => {
      environment.commitUpdate(proxy => {
        proxy.delete('feedback-1');
      });
      const snapshot = callback.mock.calls[0][0];
      expect(snapshot.isMissingData).toBe(false);
      expect(snapshot.data).toEqual({
        newsFeed: {
          edges: [
            {
              cursor: 'cursor-1',
              node: {
                id: '1',
                feedback: null,
              },
            },
          ],
        },
      });
      callback.mockClear();

      dataSource.next({
        data: {
          __typename: 'User',
          id: 'user-1',
          name: 'Alice',
        },
        label: 'FeedFragment$stream$actors',
        path: [
          'viewer',
          'newsFeed',
          'edges',
          0,
          'node',
          'feedback',
          'actors',
          0,
        ],
      });
      expect(next).toBeCalledTimes(1);
      // parent Feedback is not updated
      expect(callback).toBeCalledTimes(0);

      // but the streamed entity is added to the store
      const actorSnapshot = environment.lookup(
        {
          dataID: 'user-1',
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
      environment.commitUpdate(proxy => {
        const feedback = proxy.get('feedback-1');
        if (feedback != null) {
          feedback.setValue(null, 'actors');
        }
      });
      const snapshot = callback.mock.calls[0][0];
      expect(snapshot.isMissingData).toBe(false);
      expect(snapshot.data).toEqual({
        newsFeed: {
          edges: [
            {
              cursor: 'cursor-1',
              node: {
                id: '1',
                feedback: {
                  actors: null,
                },
              },
            },
          ],
        },
      });
      callback.mockClear();

      dataSource.next({
        data: {
          __typename: 'User',
          id: 'user-1',
          name: 'Alice',
        },
        label: 'FeedFragment$stream$actors',
        path: [
          'viewer',
          'newsFeed',
          'edges',
          0,
          'node',
          'feedback',
          'actors',
          0,
        ],
      });
      expect(next).toBeCalledTimes(1);
      // parent Feedback is not updated
      expect(callback).toBeCalledTimes(0);

      // but the streamed entity is added to the store
      const actorSnapshot = environment.lookup(
        {
          dataID: 'user-1',
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
        environment.commitUpdate(proxy => {
          const parent = proxy.get('feedback-1');
          const actor = proxy.create('<other>', 'User');
          actor.setValue('Other user', '__name_name_handler');
          if (parent != null) {
            parent.setLinkedRecords([actor], 'actors');
          }
        });
        const snapshot = callback.mock.calls[0][0];
        expect(snapshot.isMissingData).toBe(false);
        expect(snapshot.data).toEqual({
          newsFeed: {
            edges: [
              {
                cursor: 'cursor-1',
                node: {
                  id: '1',
                  feedback: {
                    actors: [{name: 'Other user'}],
                  },
                },
              },
            ],
          },
        });
        callback.mockClear();

        dataSource.next({
          data: {
            __typename: 'User',
            id: 'user-1',
            name: 'Alice',
          },
          label: 'FeedFragment$stream$actors',
          path: [
            'viewer',
            'newsFeed',
            'edges',
            0,
            'node',
            'feedback',
            'actors',
            0,
          ],
        });
        expect(next).toBeCalledTimes(1);
        // parent Feedback is not updated
        expect(callback).toBeCalledTimes(0);

        // but the streamed entity is added to the store
        const actorSnapshot = environment.lookup(
          {
            dataID: 'user-1',
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
        environment.commitUpdate(proxy => {
          const parent = proxy.get('feedback-1');
          const actor = proxy.create('<other>', 'User');
          actor.setValue('Other user', '__name_name_handler');
          if (parent != null) {
            parent.setLinkedRecords([actor], 'actors');
          }
        });
        const snapshot = callback.mock.calls[0][0];
        expect(snapshot.isMissingData).toBe(false);
        expect(snapshot.data).toEqual({
          newsFeed: {
            edges: [
              {
                cursor: 'cursor-1',
                node: {
                  id: '1',
                  feedback: {
                    actors: [{name: 'Other user'}],
                  },
                },
              },
            ],
          },
        });
        callback.mockClear();

        dataSource.next({
          data: {
            __typename: 'User',
            id: 'user-2',
            name: 'Bob',
          },
          label: 'FeedFragment$stream$actors',
          path: [
            'viewer',
            'newsFeed',
            'edges',
            0,
            'node',
            'feedback',
            'actors',
            1,
          ],
        });
        expect(next).toBeCalledTimes(1);
        // parent Feedback is not updated
        expect(callback).toBeCalledTimes(0);

        // but the streamed entity is added to the store
        const actorSnapshot = environment.lookup(
          {
            dataID: 'user-2',
            node: actorFragment,
            variables: {},
          },
          operation,
        );
        expect(actorSnapshot.isMissingData).toBe(false);
        expect(actorSnapshot.data).toEqual({
          name: 'BOB',
        });

        expect(complete).toBeCalledTimes(0);
        expect(error).toBeCalledTimes(0);
      },
    );

    it('processes streamed payloads that arrive out of order', () => {
      // return index 1 before index 0
      dataSource.next({
        data: {
          __typename: 'User',
          id: 'user-2',
          name: 'Bob',
        },
        label: 'FeedFragment$stream$actors',
        path: [
          'viewer',
          'newsFeed',
          'edges',
          0,
          'node',
          'feedback',
          'actors',
          1,
        ],
      });
      dataSource.next({
        data: {
          __typename: 'User',
          id: 'user-1',
          name: 'Alice',
        },
        label: 'FeedFragment$stream$actors',
        path: [
          'viewer',
          'newsFeed',
          'edges',
          0,
          'node',
          'feedback',
          'actors',
          0,
        ],
      });
      expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
      expect(next).toBeCalledTimes(2);
      expect(callback).toBeCalledTimes(2);
      const snapshot = callback.mock.calls[1][0];
      expect(snapshot.isMissingData).toBe(false);
      expect(snapshot.data).toEqual({
        newsFeed: {
          edges: [
            {
              cursor: 'cursor-1',
              node: {
                id: '1',
                feedback: {
                  actors: [
                    {
                      name: 'ALICE',
                    },
                    {name: 'BOB'},
                  ],
                },
              },
            },
          ],
        },
      });

      expect(complete).toBeCalledTimes(0);
      expect(error).toBeCalledTimes(0);
    });

    it('processes streamed payloads relative to the most recent root payload', () => {
      dataSource.next({
        data: {
          cursor: 'cursor-1',
          node: {
            __typename: 'Story',
            id: '1',
            feedback: {
              id: 'feedback-2',
              actors: [],
            },
          },
        },
        label: 'FeedFragment$stream$newsFeed',
        path: ['viewer', 'newsFeed', 'edges', 0],
      });
      next.mockClear();
      callback.mockClear();

      dataSource.next({
        data: {
          __typename: 'User',
          id: 'user-1',
          name: 'Alice',
        },
        label: 'FeedFragment$stream$actors',
        path: [
          'viewer',
          'newsFeed',
          'edges',
          0,
          'node',
          'feedback',
          'actors',
          0,
        ],
      });

      expect(next).toBeCalledTimes(1);
      expect(callback).toBeCalledTimes(1);
      const snapshot = callback.mock.calls[0][0];
      expect(snapshot.isMissingData).toBe(false);
      expect(snapshot.data).toEqual({
        newsFeed: {
          edges: [
            {
              cursor: 'cursor-1',
              node: {
                id: '1',
                feedback: {
                  actors: [{name: 'ALICE'}],
                },
              },
            },
          ],
        },
      });
    });

    it('calls error() for invalid streamed payloads (unknown label)', () => {
      dataSource.next({
        data: {
          __typename: 'User',
          id: 'user-1',
          name: 'Alice',
        },
        label: '<unknown-label>',
        path: [
          'viewer',
          'newsFeed',
          'edges',
          0,
          'node',
          'feedback',
          'actors',
          0,
        ],
      });

      expect(complete).toBeCalledTimes(0);
      expect(error).toBeCalledTimes(1);
      expect(error.mock.calls[0][0].message).toContain(
        "RelayModernEnvironment: Received response for unknown label '<unknown-label>'",
      );
      expect(next).toBeCalledTimes(0);
      expect(callback).toBeCalledTimes(0);
    });

    it('calls error() for invalid streamed payloads (unknown path)', () => {
      dataSource.next({
        data: {
          __typename: 'User',
          id: 'user-1',
          name: 'Alice',
        },
        label: 'FeedFragment$stream$actors',
        path: [
          '<unknown-path>',
          'viewer',
          'newsFeed',
          'edges',
          0,
          'node',
          'feedback',
          'actors',
          0,
        ],
      });

      expect(complete).toBeCalledTimes(0);
      expect(error).toBeCalledTimes(1);
      expect(error.mock.calls[0][0].message).toContain(
        'RelayModernEnvironment: Received response for unknown path ' +
          '`<unknown-path>.viewer.newsFeed.edges.0.node.feedback` for label ' +
          '`FeedFragment$stream$actors`. Known paths: ' +
          'viewer.newsFeed.edges.0.node.feedback.',
      );
      expect(next).toBeCalledTimes(0);
      expect(callback).toBeCalledTimes(0);
    });

    it('calls complete() when server completes', () => {
      dataSource.complete();
      expect(complete).toBeCalledTimes(1);
      expect(error).toBeCalledTimes(0);
      expect(next).toBeCalledTimes(0);
    });

    it('calls error() when server errors', () => {
      const err = new Error('wtf');
      dataSource.error(err);
      expect(complete).toBeCalledTimes(0);
      expect(error).toBeCalledTimes(1);
      expect(error.mock.calls[0][0]).toBe(err);
    });

    it('calls error() when streamed payload is missing data', () => {
      dataSource.next({
        errors: [
          {
            message: 'wtf',
            locations: [],
            severity: 'ERROR',
          },
        ],
        label: 'FeedFragment$stream$actors',
        path: [
          '<unknown-path>',
          'viewer',
          'newsFeed',
          'edges',
          0,
          'node',
          'feedback',
          'actors',
          0,
        ],
      });

      expect(complete).toBeCalledTimes(0);
      expect(error).toBeCalledTimes(1);
      expect(error.mock.calls[0][0].message).toContain(
        'No data returned for operation `FeedQuery`',
      );
      expect(next).toBeCalledTimes(0);
      expect(callback).toBeCalledTimes(0);
    });
  });

  describe('execute() a query with @stream with handler', () => {
    let actorFragment;
    let callbacks;
    let complete;
    let dataSource;
    let environment;
    let error;
    let fetch;
    let fragment;
    let next;
    let operation;
    let query;
    let selector;
    let variables;

    beforeEach(() => {
      jest.mock('warning');
      jest.spyOn(console, 'warn').mockImplementation(() => undefined);

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
          actors
          @stream(label: "actors", if: $enableStream, initial_count: 0)
          @__clientField(handle: "actors_handler") {
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

      // Handler to upper-case the value of the (string) field to which its
      // applied
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
      // Handler that simply copies the plural linked source field to the
      // synthesized client field: this is just to check whether the handler
      // ran or not.
      const ActorsHandler = {
        update(storeProxy, payload) {
          const record = storeProxy.get(payload.dataID);
          if (record != null) {
            const actors = record.getLinkedRecords(payload.fieldKey);
            if (actors == null) {
              record.setValue(actors, payload.handleKey);
            } else {
              record.setLinkedRecords(actors, payload.handleKey);
            }
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
      environment = new RelayModernEnvironment({
        network: RelayNetwork.create(fetch),
        store,
        handlerProvider: name => {
          switch (name) {
            case 'name_handler':
              return NameHandler;
            case 'actors_handler':
              return ActorsHandler;
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
      const initialSnapshot = environment.lookup(selector);
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

    it('processes @stream payloads when the parent record has been deleted', () => {
      const initialSnapshot = environment.lookup(selector);
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
      const actorSnapshot = environment.lookup({
        dataID: '2',
        node: actorFragment,
        variables: {},
      });
      expect(actorSnapshot.isMissingData).toBe(false);
      expect(actorSnapshot.data).toEqual({
        name: 'ALICE',
      });

      expect(complete).toBeCalledTimes(0);
      expect(error).toBeCalledTimes(0);
    });

    it('processes @stream payloads when the streamed field has been deleted on the parent record', () => {
      const initialSnapshot = environment.lookup(selector);
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
      expect(callback).toBeCalledTimes(0);

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
      // field payloads are republished and the actors change propagates to
      // the client field *without* the new entity, which isn't added to the
      // base actors field since it was concurrently modified
      expect(callback).toBeCalledTimes(1);
      const snapshot = callback.mock.calls[0][0];
      expect(snapshot.isMissingData).toBe(false);
      expect(snapshot.data).toEqual({
        id: '1',
        actors: null,
      });

      // the streamed entity is also added to the store
      const actorSnapshot = environment.lookup({
        dataID: '2',
        node: actorFragment,
        variables: {},
      });
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
        const initialSnapshot = environment.lookup(selector);
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
        // handle field is not updated by commitUpdate
        expect(callback).toBeCalledTimes(0);

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
        // field payloads are republished and the actors change propagates to
        // the client field *without* the new entity, which isn't added to the
        // base actors field since it was concurrently modified
        expect(callback).toBeCalledTimes(1);
        const snapshot = callback.mock.calls[0][0];
        expect(snapshot.isMissingData).toBe(false);
        expect(snapshot.data).toEqual({
          id: '1',
          actors: [{name: 'Other user'}],
        });

        // and the streamed entity is added to the store
        const actorSnapshot = environment.lookup({
          dataID: '2',
          node: actorFragment,
          variables: {},
        });
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
        const initialSnapshot = environment.lookup(selector);
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
        // client field is not explicitly updated by commitUpdate
        expect(callback).toBeCalledTimes(0);

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
        // field payloads are republished and the actors change propagates to
        // the client field *without* the new entity, which isn't added to the
        // base actors field since it was concurrently modified
        expect(callback).toBeCalledTimes(1);
        const snapshot2 = callback.mock.calls[0][0];
        expect(snapshot2.isMissingData).toBe(false);
        expect(snapshot2.data).toEqual({
          id: '1',
          actors: [{name: 'Other user'}],
        });

        // but the streamed entity is added to the store
        const actorSnapshot = environment.lookup({
          dataID: '2',
          node: actorFragment,
          variables: {},
        });
        expect(actorSnapshot.isMissingData).toBe(false);
        expect(actorSnapshot.data).toEqual({
          name: 'ALICE',
        });

        expect(complete).toBeCalledTimes(0);
        expect(error).toBeCalledTimes(0);
      },
    );

    it('processes streamed payloads that arrive out of order', () => {
      const initialSnapshot = environment.lookup(selector);
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
      const initialSnapshot = environment.lookup(selector);
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

      const snapshot = environment.lookup({
        dataID: 'not1',
        node: fragment,
        variables: {},
      });
      expect(snapshot.isMissingData).toBe(false);
      expect(snapshot.data).toEqual({
        id: 'not1',
        actors: [{name: 'ALICE'}],
      });

      expect(complete).toBeCalledTimes(0);
      expect(error).toBeCalledTimes(0);
    });

    it('calls error() for invalid streamed payloads (unknown label)', () => {
      const initialSnapshot = environment.lookup(selector);
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
        label: '<unknown-label>',
        path: ['node', 'actors', 0],
      });

      expect(complete).toBeCalledTimes(0);
      expect(error).toBeCalledTimes(1);
      expect(error.mock.calls[0][0].message).toContain(
        "RelayModernEnvironment: Received response for unknown label '<unknown-label>'",
      );
      expect(next).toBeCalledTimes(0);
      expect(callback).toBeCalledTimes(0);
    });

    it('calls error() for invalid streamed payloads (unknown path)', () => {
      const initialSnapshot = environment.lookup(selector);
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
        path: ['<unknown-path>', 'actors', 0],
      });

      expect(complete).toBeCalledTimes(0);
      expect(error).toBeCalledTimes(1);
      expect(error.mock.calls[0][0].message).toContain(
        'RelayModernEnvironment: Received response for unknown path ' +
          '`<unknown-path>` for label `FeedbackFragment$stream$actors`. ' +
          'Known paths: node.',
      );
      expect(next).toBeCalledTimes(0);
      expect(callback).toBeCalledTimes(0);
    });

    it('calls complete() when server completes after streamed payload resolves', () => {
      const initialSnapshot = environment.lookup(selector);
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
      const initialSnapshot = environment.lookup(selector);
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
      const initialSnapshot = environment.lookup(selector);
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
      const initialSnapshot = environment.lookup(selector);
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
      const initialSnapshot = environment.lookup(selector);
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
  });

  describe('execute() fetches a @stream-ed @connection', () => {
    let callback;
    let callbacks;
    let complete;
    let dataSource;
    let environment;
    let error;
    let fetch;
    let feedFragment;
    let next;
    let operation;
    let query;
    let selector;
    let variables;

    beforeEach(() => {
      jest.mock('warning');
      jest.spyOn(console, 'warn').mockImplementation(() => undefined);

      ({FeedQuery: query, FeedFragment: feedFragment} = generateAndCompile(`
        query FeedQuery($enableStream: Boolean!, $after: ID) {
          viewer {
            ...FeedFragment
          }
        }

        fragment FeedFragment on Viewer {
          newsFeed(first: 10, after: $after)
          @stream_connection(
            key: "RelayModernEnvironment_newsFeed"
            label: "newsFeed"
            if: $enableStream
            initial_count: 0
          ) {
            edges {
              cursor
              node {
                __typename
                id
                feedback {
                  id
                  actors {
                    id
                    name @__clientField(handle: "name_handler")
                  }
                }
              }
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }

        fragment FeedEdgeFragment on NewsFeedEdge {
          cursor
          node {
            id
            feedback {
              id
            }
          }
        }
      `));
      variables = {enableStream: true, after: null};
      operation = createOperationDescriptor(query, variables);
      selector = {
        dataID: VIEWER_ID,
        node: feedFragment,
        variables,
      };

      const NameHandler = {
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
      environment = new RelayModernEnvironment({
        network: RelayNetwork.create(fetch),
        store,
        handlerProvider: name => {
          switch (name) {
            case 'name_handler':
              return NameHandler;
            case 'viewer':
              return RelayViewerHandler;
            case 'connection':
              return RelayConnectionHandler;
          }
        },
      });
    });

    it('initializes the connection with the first edge (0 => 1 edges)', () => {
      const initialSnapshot = environment.lookup(selector);
      callback = jest.fn();
      environment.subscribe(initialSnapshot, callback);

      environment.execute({operation}).subscribe(callbacks);
      dataSource.next({
        data: {
          viewer: {
            newsFeed: {
              edges: [],
            },
          },
        },
      });
      jest.runAllTimers();
      next.mockClear();
      callback.mockClear();

      dataSource.next({
        data: {
          cursor: 'cursor-1',
          node: {
            __typename: 'Story',
            id: '1',
            feedback: {
              id: 'feedback-1',
              actors: [
                {
                  id: 'actor-1',
                  __typename: 'User',
                  name: 'Alice',
                },
              ],
            },
          },
        },
        label: 'FeedFragment$stream$newsFeed',
        path: ['viewer', 'newsFeed', 'edges', 0],
      });
      expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
      expect(next).toBeCalledTimes(1);
      expect(callback).toBeCalledTimes(1);
      const snapshot = callback.mock.calls[0][0];
      expect(snapshot.isMissingData).toBe(false);
      expect(snapshot.data).toEqual({
        newsFeed: {
          edges: [
            {
              cursor: 'cursor-1',
              node: {
                __typename: 'Story',
                id: '1',
                feedback: {
                  id: 'feedback-1',
                  actors: [{id: 'actor-1', name: 'ALICE'}],
                },
              },
            },
          ],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
        },
      });

      dataSource.next({
        data: {
          pageInfo: {
            endCursor: 'cursor-1',
            hasNextPage: true,
          },
        },
        label: 'FeedFragment$defer$newsFeed$pageInfo',
        path: ['viewer', 'newsFeed'],
      });
      expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
      expect(callback).toBeCalledTimes(2);
      const snapshot2 = callback.mock.calls[1][0];
      expect(snapshot2.isMissingData).toBe(false);
      expect(snapshot2.data).toEqual({
        newsFeed: {
          edges: [
            {
              cursor: 'cursor-1',
              node: {
                __typename: 'Story',
                id: '1',
                feedback: {
                  id: 'feedback-1',
                  actors: [{id: 'actor-1', name: 'ALICE'}],
                },
              },
            },
          ],
          pageInfo: {
            endCursor: 'cursor-1',
            hasNextPage: true,
          },
        },
      });
    });

    it('initializes the connection with subsequent edges (1 => 2 edges)', () => {
      const initialSnapshot = environment.lookup(selector);
      callback = jest.fn();
      environment.subscribe(initialSnapshot, callback);

      environment.execute({operation}).subscribe(callbacks);
      dataSource.next({
        data: {
          viewer: {
            newsFeed: {
              edges: [],
            },
          },
        },
      });
      jest.runAllTimers();
      next.mockClear();
      callback.mockClear();

      // first edge
      dataSource.next({
        data: {
          cursor: 'cursor-1',
          node: {
            __typename: 'Story',
            id: '1',
            feedback: {
              id: 'feedback-1',
              actors: [
                {
                  id: 'actor-1',
                  __typename: 'User',
                  name: 'Alice',
                },
              ],
            },
          },
        },
        label: 'FeedFragment$stream$newsFeed',
        path: ['viewer', 'newsFeed', 'edges', 0],
      });
      // second edge should be appended, not replace first edge
      dataSource.next({
        data: {
          cursor: 'cursor-2',
          node: {
            __typename: 'Story',
            id: '2',
            feedback: {
              id: 'feedback-2',
              actors: [
                {
                  id: 'actor-2',
                  __typename: 'User',
                  name: 'Bob',
                },
              ],
            },
          },
        },
        label: 'FeedFragment$stream$newsFeed',
        path: ['viewer', 'newsFeed', 'edges', 1],
      });
      expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
      expect(next).toBeCalledTimes(2);
      expect(callback).toBeCalledTimes(2);
      const snapshot = callback.mock.calls[1][0];
      expect(snapshot.isMissingData).toBe(false);
      expect(snapshot.data).toEqual({
        newsFeed: {
          edges: [
            {
              cursor: 'cursor-1',
              node: {
                __typename: 'Story',
                id: '1',
                feedback: {
                  id: 'feedback-1',
                  actors: [{id: 'actor-1', name: 'ALICE'}],
                },
              },
            },
            {
              cursor: 'cursor-2',
              node: {
                __typename: 'Story',
                id: '2',
                feedback: {
                  id: 'feedback-2',
                  actors: [{id: 'actor-2', name: 'BOB'}],
                },
              },
            },
          ],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
        },
      });
    });

    it('initializes the connection with subsequent edges (1 => 2 edges) when initial_count=1', () => {
      const initialSnapshot = environment.lookup(selector);
      callback = jest.fn();
      environment.subscribe(initialSnapshot, callback);

      environment.execute({operation}).subscribe(callbacks);
      dataSource.next({
        data: {
          viewer: {
            newsFeed: {
              edges: [
                {
                  cursor: 'cursor-1',
                  node: {
                    __typename: 'Story',
                    id: '1',
                    feedback: {
                      id: 'feedback-1',
                      actors: [
                        {
                          id: 'actor-1',
                          __typename: 'User',
                          name: 'Alice',
                        },
                      ],
                    },
                  },
                },
              ],
            },
          },
        },
      });
      jest.runAllTimers();
      next.mockClear();
      callback.mockClear();

      // second edge should be appended, not replace first edge
      dataSource.next({
        data: {
          cursor: 'cursor-2',
          node: {
            __typename: 'Story',
            id: '2',
            feedback: {
              id: 'feedback-2',
              actors: [
                {
                  id: 'actor-2',
                  __typename: 'User',
                  name: 'Bob',
                },
              ],
            },
          },
        },
        label: 'FeedFragment$stream$newsFeed',
        path: ['viewer', 'newsFeed', 'edges', 1],
      });
      expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
      expect(next).toBeCalledTimes(1);
      expect(callback).toBeCalledTimes(1);
      const snapshot = callback.mock.calls[0][0];
      expect(snapshot.isMissingData).toBe(false);
      expect(snapshot.data).toEqual({
        newsFeed: {
          edges: [
            {
              cursor: 'cursor-1',
              node: {
                __typename: 'Story',
                id: '1',
                feedback: {
                  id: 'feedback-1',
                  actors: [{id: 'actor-1', name: 'ALICE'}],
                },
              },
            },
            {
              cursor: 'cursor-2',
              node: {
                __typename: 'Story',
                id: '2',
                feedback: {
                  id: 'feedback-2',
                  actors: [{id: 'actor-2', name: 'BOB'}],
                },
              },
            },
          ],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
        },
      });
    });

    it('initializes the connection with subsequent edges (0 => 2 edges) when edges arrive out of order', () => {
      const initialSnapshot = environment.lookup(selector);
      callback = jest.fn();
      environment.subscribe(initialSnapshot, callback);

      environment.execute({operation}).subscribe(callbacks);
      dataSource.next({
        data: {
          viewer: {
            newsFeed: {
              edges: [],
            },
          },
        },
      });
      jest.runAllTimers();
      next.mockClear();
      callback.mockClear();

      // second edge arrives first
      dataSource.next({
        data: {
          cursor: 'cursor-2',
          node: {
            __typename: 'Story',
            id: '2',
            feedback: {
              id: 'feedback-2',
              actors: [
                {
                  id: 'actor-2',
                  __typename: 'User',
                  name: 'Bob',
                },
              ],
            },
          },
        },
        label: 'FeedFragment$stream$newsFeed',
        path: ['viewer', 'newsFeed', 'edges', 1],
      });
      // first edge arrives second
      dataSource.next({
        data: {
          cursor: 'cursor-1',
          node: {
            __typename: 'Story',
            id: '1',
            feedback: {
              id: 'feedback-1',
              actors: [
                {
                  id: 'actor-1',
                  __typename: 'User',
                  name: 'Alice',
                },
              ],
            },
          },
        },
        label: 'FeedFragment$stream$newsFeed',
        path: ['viewer', 'newsFeed', 'edges', 0],
      });
      expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
      expect(next).toBeCalledTimes(2);
      expect(callback).toBeCalledTimes(2);
      const snapshot = callback.mock.calls[1][0];
      expect(snapshot.isMissingData).toBe(false);
      expect(snapshot.data).toEqual({
        newsFeed: {
          edges: [
            {
              cursor: 'cursor-1',
              node: {
                __typename: 'Story',
                id: '1',
                feedback: {
                  id: 'feedback-1',
                  actors: [{id: 'actor-1', name: 'ALICE'}],
                },
              },
            },
            {
              cursor: 'cursor-2',
              node: {
                __typename: 'Story',
                id: '2',
                feedback: {
                  id: 'feedback-2',
                  actors: [{id: 'actor-2', name: 'BOB'}],
                },
              },
            },
          ],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
        },
      });
    });

    it('updates the connection on forward pagination with new edges (when initial data has pageInfo)', () => {
      // populate the first "page" of results (one item) using the query
      // with streaming disabled
      variables = {enableStream: false, after: 'cursor-1'};
      operation = createOperationDescriptor(query, variables);
      environment.execute({operation}).subscribe({});
      dataSource.next({
        data: {
          viewer: {
            newsFeed: {
              edges: [
                {
                  cursor: 'cursor-1',
                  node: {
                    __typename: 'Story',
                    id: '1',
                    feedback: {
                      id: 'feedback-1',
                      actors: [
                        {
                          id: 'actor-1',
                          __typename: 'User',
                          name: 'Alice',
                        },
                      ],
                    },
                  },
                },
              ],
              pageInfo: {
                hasNextPage: true,
                endCursor: 'cursor-1',
              },
            },
          },
        },
      });
      dataSource.complete();
      jest.runAllTimers();
      complete.mockClear();
      error.mockClear();
      next.mockClear();

      const initialSnapshot = environment.lookup(selector);
      callback = jest.fn();
      environment.subscribe(initialSnapshot, callback);

      // fetch the second page of results with streaming enabled
      variables = {enableStream: true, after: 'cursor-1'};
      operation = createOperationDescriptor(query, variables);
      environment.execute({operation}).subscribe(callbacks);
      dataSource.next({
        data: {
          viewer: {
            newsFeed: {
              edges: [],
            },
          },
        },
      });
      jest.runAllTimers();
      next.mockClear();
      callback.mockClear();

      // second edge should be appended, not replace first edge
      dataSource.next({
        data: {
          cursor: 'cursor-2',
          node: {
            __typename: 'Story',
            id: '2',
            feedback: {
              id: 'feedback-2',
              actors: [
                {
                  id: 'actor-2',
                  __typename: 'User',
                  name: 'Bob',
                },
              ],
            },
          },
        },
        label: 'FeedFragment$stream$newsFeed',
        path: ['viewer', 'newsFeed', 'edges', 0],
      });
      // third edge should be appended, not replace first edge
      dataSource.next({
        data: {
          cursor: 'cursor-3',
          node: {
            __typename: 'Story',
            id: '3',
            feedback: {
              id: 'feedback-3',
              actors: [
                {
                  id: 'actor-3',
                  __typename: 'User',
                  name: 'Claire',
                },
              ],
            },
          },
        },
        label: 'FeedFragment$stream$newsFeed',
        path: ['viewer', 'newsFeed', 'edges', 1],
      });
      expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
      expect(next).toBeCalledTimes(2);
      expect(callback).toBeCalledTimes(2);
      const snapshot = callback.mock.calls[0][0];
      expect(snapshot.isMissingData).toBe(false);
      expect(snapshot.data).toEqual({
        newsFeed: {
          edges: [
            {
              cursor: 'cursor-1',
              node: {
                __typename: 'Story',
                id: '1',
                feedback: {
                  id: 'feedback-1',
                  actors: [{id: 'actor-1', name: 'ALICE'}],
                },
              },
            },
            {
              cursor: 'cursor-2',
              node: {
                __typename: 'Story',
                id: '2',
                feedback: {
                  id: 'feedback-2',
                  actors: [{id: 'actor-2', name: 'BOB'}],
                },
              },
            },
          ],
          pageInfo: {
            endCursor: 'cursor-1',
            hasNextPage: true,
          },
        },
      });
      const snapshot2 = callback.mock.calls[1][0];
      expect(snapshot2.isMissingData).toBe(false);
      expect(snapshot2.data).toEqual({
        newsFeed: {
          edges: [
            {
              cursor: 'cursor-1',
              node: {
                __typename: 'Story',
                id: '1',
                feedback: {
                  id: 'feedback-1',
                  actors: [{id: 'actor-1', name: 'ALICE'}],
                },
              },
            },
            {
              cursor: 'cursor-2',
              node: {
                __typename: 'Story',
                id: '2',
                feedback: {
                  id: 'feedback-2',
                  actors: [{id: 'actor-2', name: 'BOB'}],
                },
              },
            },
            {
              cursor: 'cursor-3',
              node: {
                __typename: 'Story',
                id: '3',
                feedback: {
                  id: 'feedback-3',
                  actors: [{id: 'actor-3', name: 'CLAIRE'}],
                },
              },
            },
          ],
          pageInfo: {
            endCursor: 'cursor-1',
            hasNextPage: true,
          },
        },
      });

      dataSource.next({
        data: {
          pageInfo: {
            endCursor: 'cursor-3', // cursor-1 => cursor-3
            hasNextPage: false, // true => false
          },
        },
        label: 'FeedFragment$defer$newsFeed$pageInfo',
        path: ['viewer', 'newsFeed'],
      });
      expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
      expect(callback).toBeCalledTimes(3);
      const snapshot3 = callback.mock.calls[2][0];
      expect(snapshot3.isMissingData).toBe(false);
      expect(snapshot3.data).toEqual({
        newsFeed: {
          edges: [
            {
              cursor: 'cursor-1',
              node: {
                __typename: 'Story',
                id: '1',
                feedback: {
                  id: 'feedback-1',
                  actors: [{id: 'actor-1', name: 'ALICE'}],
                },
              },
            },
            {
              cursor: 'cursor-2',
              node: {
                __typename: 'Story',
                id: '2',
                feedback: {
                  id: 'feedback-2',
                  actors: [{id: 'actor-2', name: 'BOB'}],
                },
              },
            },
            {
              cursor: 'cursor-3',
              node: {
                __typename: 'Story',
                id: '3',
                feedback: {
                  id: 'feedback-3',
                  actors: [{id: 'actor-3', name: 'CLAIRE'}],
                },
              },
            },
          ],
          pageInfo: {
            endCursor: 'cursor-3',
            hasNextPage: false,
          },
        },
      });
    });

    it('does not update the connection on forward pagination when initial data was missing pageInfo', () => {
      // populate the first "page" of results (one item)
      environment.execute({operation}).subscribe({});
      dataSource.next({
        data: {
          viewer: {
            newsFeed: {
              edges: [
                {
                  cursor: 'cursor-1',
                  node: {
                    __typename: 'Story',
                    id: '1',
                    feedback: {
                      id: 'feedback-1',
                      actors: [
                        {
                          id: 'actor-1',
                          __typename: 'User',
                          name: 'Alice',
                        },
                      ],
                    },
                  },
                },
              ],
            },
          },
        },
      });
      dataSource.complete();
      jest.runAllTimers();
      complete.mockClear();
      error.mockClear();
      next.mockClear();

      const initialSnapshot = environment.lookup(selector);
      callback = jest.fn();
      environment.subscribe(initialSnapshot, callback);

      // fetch the second page of results
      variables = {enableStream: true, after: 'cursor-1'};
      operation = createOperationDescriptor(query, variables);
      environment.execute({operation}).subscribe(callbacks);
      dataSource.next({
        data: {
          viewer: {
            newsFeed: {
              edges: [],
            },
          },
        },
      });
      jest.runAllTimers();
      next.mockClear();
      callback.mockClear();

      // second edge is ignored
      dataSource.next({
        data: {
          cursor: 'cursor-2',
          node: {
            __typename: 'Story',
            id: '2',
            feedback: {
              id: 'feedback-2',
              actors: [
                {
                  id: 'actor-2',
                  __typename: 'User',
                  name: 'Bob',
                },
              ],
            },
          },
        },
        label: 'FeedFragment$stream$newsFeed',
        path: ['viewer', 'newsFeed', 'edges', 0],
      });
      expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
      expect(next).toBeCalledTimes(1);
      // connection not updated with new edge, the after cursor doesn't match
      // pageInfo.endCursor
      expect(callback).toBeCalledTimes(0);
    });
  });

  describe('execute() fetches a @defer-ed @stream-ed @connection', () => {
    let callback;
    let callbacks;
    let complete;
    let dataSource;
    let environment;
    let error;
    let fetch;
    let feedFragment;
    let next;
    let operation;
    let query;
    let selector;
    let variables;

    beforeEach(() => {
      jest.mock('warning');
      jest.spyOn(console, 'warn').mockImplementation(() => undefined);

      ({FeedQuery: query, FeedFragment: feedFragment} = generateAndCompile(`
        query FeedQuery($enableStream: Boolean!, $after: ID) {
          viewer {
            __typename
            ...FeedFragment @defer(label: "FeedFragment")
          }
        }

        fragment FeedFragment on Viewer {
          newsFeed(first: 10, after: $after)
          @connection(key: "RelayModernEnvironment_newsFeed") {
            edges
            @stream(label: "newsFeed", if: $enableStream, initial_count: 0) {
              cursor
              node {
                __typename
                id
                feedback {
                  id
                  actors {
                    id
                    name @__clientField(handle: "name_handler")
                  }
                }
              }
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }

        fragment FeedEdgeFragment on NewsFeedEdge {
          cursor
          node {
            id
            feedback {
              id
            }
          }
        }
      `));
      variables = {enableStream: true, after: null};
      operation = createOperationDescriptor(query, variables);
      selector = {
        dataID: VIEWER_ID,
        node: feedFragment,
        variables,
      };

      const NameHandler = {
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
      environment = new RelayModernEnvironment({
        network: RelayNetwork.create(fetch),
        store,
        handlerProvider: name => {
          switch (name) {
            case 'name_handler':
              return NameHandler;
            case 'viewer':
              return RelayViewerHandler;
            case 'connection':
              return RelayConnectionHandler;
          }
        },
      });
    });

    it('does not initialize the connection with the root payload', () => {
      const initialSnapshot = environment.lookup(selector);
      callback = jest.fn();
      environment.subscribe(initialSnapshot, callback);

      environment.execute({operation}).subscribe(callbacks);
      dataSource.next({
        data: {
          viewer: {
            __typename: 'Viewer',
          },
        },
      });

      expect(next).toBeCalledTimes(1);
      expect(callback).toBeCalledTimes(1);
      const snapshot = callback.mock.calls[0][0];
      expect(snapshot.isMissingData).toBe(true);
      expect(snapshot.data).toEqual({
        newsFeed: undefined,
      });
    });

    it('initializes the connection with the deferred payload', () => {
      const initialSnapshot = environment.lookup(selector);
      callback = jest.fn();
      environment.subscribe(initialSnapshot, callback);

      environment.execute({operation}).subscribe(callbacks);
      dataSource.next({
        data: {
          viewer: {
            __typename: 'Viewer',
          },
        },
      });
      jest.runAllTimers();
      next.mockClear();
      callback.mockClear();

      dataSource.next({
        data: {
          newsFeed: {
            edges: [],
          },
        },
        label: 'FeedQuery$defer$FeedFragment',
        path: ['viewer'],
      });
      expect(next).toBeCalledTimes(1);
      expect(callback).toBeCalledTimes(1);
      const snapshot = callback.mock.calls[0][0];
      expect(snapshot.isMissingData).toBe(false);
      expect(snapshot.data).toEqual({
        newsFeed: {
          edges: [],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
        },
      });
    });

    it('initializes the connection with the first edge (0 => 1 edges)', () => {
      const initialSnapshot = environment.lookup(selector);
      callback = jest.fn();
      environment.subscribe(initialSnapshot, callback);

      environment.execute({operation}).subscribe(callbacks);
      dataSource.next({
        data: {
          viewer: {
            __typename: 'Viewer',
          },
        },
      });
      dataSource.next({
        data: {
          newsFeed: {
            edges: [],
          },
        },
        label: 'FeedQuery$defer$FeedFragment',
        path: ['viewer'],
      });
      jest.runAllTimers();
      next.mockClear();
      callback.mockClear();

      dataSource.next({
        data: {
          cursor: 'cursor-1',
          node: {
            __typename: 'Story',
            id: '1',
            feedback: {
              id: 'feedback-1',
              actors: [
                {
                  id: 'actor-1',
                  __typename: 'User',
                  name: 'Alice',
                },
              ],
            },
          },
        },
        label: 'FeedFragment$stream$newsFeed',
        path: ['viewer', 'newsFeed', 'edges', 0],
      });
      expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
      expect(next).toBeCalledTimes(1);
      expect(callback).toBeCalledTimes(1);
      const snapshot = callback.mock.calls[0][0];
      expect(snapshot.isMissingData).toBe(false);
      expect(snapshot.data).toEqual({
        newsFeed: {
          edges: [
            {
              cursor: 'cursor-1',
              node: {
                __typename: 'Story',
                id: '1',
                feedback: {
                  id: 'feedback-1',
                  actors: [{id: 'actor-1', name: 'ALICE'}],
                },
              },
            },
          ],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
        },
      });
    });

    it('initializes the connection with subsequent edges (1 => 2 edges)', () => {
      const initialSnapshot = environment.lookup(selector);
      callback = jest.fn();
      environment.subscribe(initialSnapshot, callback);

      environment.execute({operation}).subscribe(callbacks);
      dataSource.next({
        data: {
          viewer: {
            __typename: 'Viewer',
          },
        },
      });
      dataSource.next({
        data: {
          newsFeed: {
            edges: [],
          },
        },
        label: 'FeedQuery$defer$FeedFragment',
        path: ['viewer'],
      });
      jest.runAllTimers();
      next.mockClear();
      callback.mockClear();

      // first edge
      dataSource.next({
        data: {
          cursor: 'cursor-1',
          node: {
            __typename: 'Story',
            id: '1',
            feedback: {
              id: 'feedback-1',
              actors: [
                {
                  id: 'actor-1',
                  __typename: 'User',
                  name: 'Alice',
                },
              ],
            },
          },
        },
        label: 'FeedFragment$stream$newsFeed',
        path: ['viewer', 'newsFeed', 'edges', 0],
      });
      // second edge should be appended, not replace first edge
      dataSource.next({
        data: {
          cursor: 'cursor-2',
          node: {
            __typename: 'Story',
            id: '2',
            feedback: {
              id: 'feedback-2',
              actors: [
                {
                  id: 'actor-2',
                  __typename: 'User',
                  name: 'Bob',
                },
              ],
            },
          },
        },
        label: 'FeedFragment$stream$newsFeed',
        path: ['viewer', 'newsFeed', 'edges', 1],
      });
      expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
      expect(next).toBeCalledTimes(2);
      expect(callback).toBeCalledTimes(2);
      const snapshot = callback.mock.calls[1][0];
      expect(snapshot.isMissingData).toBe(false);
      expect(snapshot.data).toEqual({
        newsFeed: {
          edges: [
            {
              cursor: 'cursor-1',
              node: {
                __typename: 'Story',
                id: '1',
                feedback: {
                  id: 'feedback-1',
                  actors: [{id: 'actor-1', name: 'ALICE'}],
                },
              },
            },
            {
              cursor: 'cursor-2',
              node: {
                __typename: 'Story',
                id: '2',
                feedback: {
                  id: 'feedback-2',
                  actors: [{id: 'actor-2', name: 'BOB'}],
                },
              },
            },
          ],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
        },
      });
    });

    it('initializes the connection with subsequent edges (1 => 2 edges) when initial_count=1', () => {
      const initialSnapshot = environment.lookup(selector);
      callback = jest.fn();
      environment.subscribe(initialSnapshot, callback);

      environment.execute({operation}).subscribe(callbacks);
      dataSource.next({
        data: {
          viewer: {
            __typename: 'Viewer',
          },
        },
      });
      dataSource.next({
        data: {
          newsFeed: {
            edges: [
              {
                cursor: 'cursor-1',
                node: {
                  __typename: 'Story',
                  id: '1',
                  feedback: {
                    id: 'feedback-1',
                    actors: [
                      {
                        id: 'actor-1',
                        __typename: 'User',
                        name: 'Alice',
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
        label: 'FeedQuery$defer$FeedFragment',
        path: ['viewer'],
      });
      jest.runAllTimers();
      next.mockClear();
      callback.mockClear();

      // second edge should be appended, not replace first edge
      dataSource.next({
        data: {
          cursor: 'cursor-2',
          node: {
            __typename: 'Story',
            id: '2',
            feedback: {
              id: 'feedback-2',
              actors: [
                {
                  id: 'actor-2',
                  __typename: 'User',
                  name: 'Bob',
                },
              ],
            },
          },
        },
        label: 'FeedFragment$stream$newsFeed',
        path: ['viewer', 'newsFeed', 'edges', 1],
      });
      expect(error.mock.calls.map(call => call[0].stack)).toEqual([]);
      expect(next).toBeCalledTimes(1);
      expect(callback).toBeCalledTimes(1);
      const snapshot = callback.mock.calls[0][0];
      expect(snapshot.isMissingData).toBe(false);
      expect(snapshot.data).toEqual({
        newsFeed: {
          edges: [
            {
              cursor: 'cursor-1',
              node: {
                __typename: 'Story',
                id: '1',
                feedback: {
                  id: 'feedback-1',
                  actors: [{id: 'actor-1', name: 'ALICE'}],
                },
              },
            },
            {
              cursor: 'cursor-2',
              node: {
                __typename: 'Story',
                id: '2',
                feedback: {
                  id: 'feedback-2',
                  actors: [{id: 'actor-2', name: 'BOB'}],
                },
              },
            },
          ],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
        },
      });
    });
  });

  describe('execute() a query with nested @match', () => {
    let callbacks;
    let complete;
    let dataSource;
    let environment;
    let error;
    let fetch;
    let resolveFragment;
    let operationLoader;
    let markdownRendererFragment;
    let plaintextRendererFragment;
    let markdownRendererNormalizationFragment;
    let plaintextRendererNormalizationFragment;
    let next;
    let operation;
    let operationCallback;
    let query;
    let variables;

    beforeEach(() => {
      ({
        UserQuery: query,
        MarkdownUserNameRenderer_name: markdownRendererFragment,
        PlainUserNameRenderer_name: plaintextRendererFragment,
        MarkdownUserNameRenderer_name$normalization: markdownRendererNormalizationFragment,
        PlainUserNameRenderer_name$normalization: plaintextRendererNormalizationFragment,
      } = generateAndCompile(`
        query UserQuery($id: ID!) {
          node(id: $id) {
            ... on User {
              outerRenderer: nameRenderer @match {
                ...MarkdownUserNameRenderer_name
                  @module(name: "MarkdownUserNameRenderer.react")
              }
            }
          }
        }

        fragment MarkdownUserNameRenderer_name on MarkdownUserNameRenderer {
          __typename
          markdown
          data {
            markup @__clientField(handle: "markup_handler")
          }
          user {
            innerRenderer: nameRenderer @match {
                ...PlainUserNameRenderer_name
                  @module(name: "PlainUserNameRenderer.react")
            }
          }
        }

        fragment PlainUserNameRenderer_name on PlainUserNameRenderer {
          plaintext
          data {
            text
          }
        }
      `));
      variables = {id: '1'};
      operation = createOperationDescriptor(query, variables);

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
      const operationSnapshot = environment.lookup(
        operation.fragment,
        operation,
      );
      operationCallback = jest.fn();
      environment.subscribe(operationSnapshot, operationCallback);
    });

    it('calls next() and publishes the initial payload to the store', () => {
      environment.execute({operation}).subscribe(callbacks);
      const payload = {
        data: {
          node: {
            id: '1',
            __typename: 'User',
            outerRenderer: {
              __typename: 'MarkdownUserNameRenderer',
              __module_component: 'MarkdownUserNameRenderer.react',
              __module_operation:
                'MarkdownUserNameRenderer_name$normalization.graphql',
              markdown: 'markdown payload',
              data: {
                markup: '<markup/>',
              },
              user: {
                id: '2',
                innerRenderer: {
                  __typename: 'PlainUserNameRenderer',
                  __module_component: 'PlainUserNameRenderer.react',
                  __module_operation:
                    'PlainUserNameRenderer_name$normalization.graphql',
                  plaintext: 'plaintext payload',
                  data: {
                    text: 'plaintext!',
                  },
                },
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
      expect(operationCallback).toBeCalledTimes(1);
      const operationSnapshot = operationCallback.mock.calls[0][0];
      expect(operationSnapshot.isMissingData).toBe(false);
      expect(operationSnapshot.data).toEqual({
        node: {
          outerRenderer: {
            __id:
              'client:1:outerRenderer(MarkdownUserNameRenderer_name:MarkdownUserNameRenderer.react)',
            __fragmentPropName: 'name',
            __fragments: {
              MarkdownUserNameRenderer_name: {},
            },
            __fragmentOwner: operation,
            __module_component: 'MarkdownUserNameRenderer.react',
          },
        },
      });

      const matchSelector = nullthrows(
        getSingularSelector(
          variables,
          markdownRendererFragment,
          (operationSnapshot.data?.node: any)?.outerRenderer,
        ),
      );
      const matchSnapshot = environment.lookup(
        matchSelector.selector,
        operation,
      );
      expect(matchSnapshot.isMissingData).toBe(true);
      expect(matchSnapshot.data).toEqual({
        __typename: 'MarkdownUserNameRenderer',
        data: undefined,
        markdown: undefined,
        user: undefined,
      });
    });

    it('loads the @match fragments and normalizes/publishes payloads', () => {
      environment.execute({operation}).subscribe(callbacks);
      const payload = {
        data: {
          node: {
            id: '1',
            __typename: 'User',
            outerRenderer: {
              __typename: 'MarkdownUserNameRenderer',
              __module_component: 'MarkdownUserNameRenderer.react',
              __module_operation:
                'MarkdownUserNameRenderer_name$normalization.graphql',
              markdown: 'markdown payload',
              data: {
                // NOTE: should be uppercased when normalized (by MarkupHandler)
                markup: '<markup/>',
              },
              user: {
                id: '2',
                innerRenderer: {
                  __typename: 'PlainUserNameRenderer',
                  __module_component: 'PlainUserNameRenderer.react',
                  __module_operation:
                    'PlainUserNameRenderer_name$normalizationgraphql',
                  plaintext: 'plaintext payload',
                  data: {
                    text: 'plaintext!',
                  },
                },
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

      expect(operationCallback).toBeCalledTimes(1);
      // initial operation snapshot is tested above
      const operationSnapshot = operationCallback.mock.calls[0][0];
      operationCallback.mockClear();
      const outerMatchSelector = nullthrows(
        getSingularSelector(
          variables,
          markdownRendererFragment,
          (operationSnapshot.data?.node: any)?.outerRenderer,
        ),
      );
      // initial outer fragment snapshot is tested above
      const initialOuterMatchSnapshot = environment.lookup(
        outerMatchSelector.selector,
        operation,
      );
      expect(initialOuterMatchSnapshot.isMissingData).toBe(true);
      const outerMatchCallback = jest.fn();
      environment.subscribe(initialOuterMatchSnapshot, outerMatchCallback);

      resolveFragment(markdownRendererNormalizationFragment);
      jest.runAllTimers();
      // next() should not be called when @match resolves, no new GraphQLResponse
      // was received for this case
      expect(next).toBeCalledTimes(0);
      expect(operationCallback).toBeCalledTimes(0);
      expect(outerMatchCallback).toBeCalledTimes(1);
      const outerMatchSnapshot = outerMatchCallback.mock.calls[0][0];
      expect(outerMatchSnapshot.isMissingData).toBe(false);
      expect(outerMatchSnapshot.data).toEqual({
        __typename: 'MarkdownUserNameRenderer',
        data: {
          // NOTE: should be uppercased by the MarkupHandler
          markup: '<MARKUP/>',
        },
        markdown: 'markdown payload',
        user: {
          innerRenderer: {
            __fragmentOwner: operation,
            __fragmentPropName: 'name',
            __fragments: {
              PlainUserNameRenderer_name: {},
            },
            __id:
              'client:2:innerRenderer(PlainUserNameRenderer_name:PlainUserNameRenderer.react)',
            __module_component: 'PlainUserNameRenderer.react',
          },
        },
      });

      const innerMatchSelector = nullthrows(
        getSingularSelector(
          variables,
          plaintextRendererFragment,
          (outerMatchSnapshot.data?.user: $FlowFixMe)?.innerRenderer,
        ),
      );
      const initialInnerMatchSnapshot = environment.lookup(
        innerMatchSelector.selector,
        operation,
      );
      expect(initialInnerMatchSnapshot.isMissingData).toBe(true);
      const innerMatchCallback = jest.fn();
      environment.subscribe(initialInnerMatchSnapshot, innerMatchCallback);

      resolveFragment(plaintextRendererNormalizationFragment);
      jest.runAllTimers();

      expect(innerMatchCallback).toBeCalledTimes(1);
      const innerMatchSnapshot = innerMatchCallback.mock.calls[0][0];
      expect(innerMatchSnapshot.isMissingData).toBe(false);
      expect(innerMatchSnapshot.data).toEqual({
        data: {
          text: 'plaintext!',
        },
        plaintext: 'plaintext payload',
      });
    });

    it('calls complete() if the network completes before processing the match', () => {
      environment.execute({operation}).subscribe(callbacks);
      const payload = {
        data: {
          node: {
            id: '1',
            __typename: 'User',
            outerRenderer: {
              __typename: 'MarkdownUserNameRenderer',
              __module_component: 'MarkdownUserNameRenderer.react',
              __module_operation:
                'MarkdownUserNameRenderer_name$normalization.graphql',
              markdown: 'markdown payload',
              data: {
                // NOTE: should be uppercased when normalized (by MarkupHandler)
                markup: '<markup/>',
              },
              user: {
                id: '2',
                innerRenderer: {
                  __typename: 'PlainUserNameRenderer',
                  __module_component: 'PlainUserNameRenderer.react',
                  __module_operation:
                    'PlainUserNameRenderer_name$normalization.graphql',
                  plaintext: 'plaintext payload',
                  data: {
                    text: 'plaintext!',
                  },
                },
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

      expect(callbacks.complete).toBeCalledTimes(0);
      expect(callbacks.error).toBeCalledTimes(0);
      expect(callbacks.next).toBeCalledTimes(1);

      expect(operationLoader.load).toBeCalledTimes(2);
      expect(operationLoader.load.mock.calls[1][0]).toBe(
        'PlainUserNameRenderer_name$normalization.graphql',
      );
      resolveFragment(plaintextRendererNormalizationFragment);
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
            outerRenderer: {
              __typename: 'MarkdownUserNameRenderer',
              __module_component: 'MarkdownUserNameRenderer.react',
              __module_operation:
                'MarkdownUserNameRenderer_name$normalization.graphql',
              markdown: 'markdown payload',
              data: {
                // NOTE: should be uppercased when normalized (by MarkupHandler)
                markup: '<markup/>',
              },
              user: {
                id: '2',
                innerRenderer: {
                  __typename: 'PlainUserNameRenderer',
                  __module_component: 'PlainUserNameRenderer.react',
                  __module_operation:
                    'PlainUserNameRenderer_name$normalization.graphql',
                  plaintext: 'plaintext payload',
                  data: {
                    text: 'plaintext!',
                  },
                },
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

      expect(callbacks.complete).toBeCalledTimes(0);
      expect(callbacks.error).toBeCalledTimes(0);
      expect(callbacks.next).toBeCalledTimes(1);

      expect(operationLoader.load).toBeCalledTimes(2);
      expect(operationLoader.load.mock.calls[1][0]).toBe(
        'PlainUserNameRenderer_name$normalization.graphql',
      );
      resolveFragment(plaintextRendererNormalizationFragment);
      jest.runAllTimers();

      dataSource.complete();
      expect(callbacks.complete).toBeCalledTimes(1);
      expect(callbacks.error).toBeCalledTimes(0);
      expect(callbacks.next).toBeCalledTimes(1);
    });

    it('calls error() if processing a nested match payload throws', () => {
      environment.execute({operation}).subscribe(callbacks);
      const payload = {
        data: {
          node: {
            id: '1',
            __typename: 'User',
            outerRenderer: {
              __typename: 'MarkdownUserNameRenderer',
              __module_component: 'MarkdownUserNameRenderer.react',
              __module_operation:
                'MarkdownUserNameRenderer_name$normalization.graphql',
              markdown: 'markdown payload',
              data: {
                // NOTE: should be uppercased when normalized (by MarkupHandler)
                markup: '<markup/>',
              },
              user: {
                id: '2',
                innerRenderer: {
                  __typename: 'PlainUserNameRenderer',
                  __module_component: 'PlainUserNameRenderer.react',
                  __module_operation:
                    'PlainUserNameRenderer_name$normalization.graphql',
                  plaintext: 'plaintext payload',
                  data: {
                    text: 'plaintext!',
                  },
                },
              },
            },
          },
        },
      };
      dataSource.next(payload);
      expect(operationLoader.load).toBeCalledTimes(1);
      expect(operationLoader.load.mock.calls[0][0]).toBe(
        'MarkdownUserNameRenderer_name$normalization.graphql',
      );
      resolveFragment(markdownRendererNormalizationFragment);

      operationLoader.load = jest.fn(() => {
        // Invalid fragment node, no 'selections' field
        // This is to make sure that users implementing operationLoader
        // incorrectly still get reasonable error handling
        return Promise.resolve(({}: any));
      });
      jest.runAllTimers();

      expect(callbacks.error).toBeCalledTimes(1);
      expect(callbacks.error.mock.calls[0][0].message).toBe(
        "Cannot read property 'length' of undefined",
      );
    });

    it('cancels @match processing if unsubscribed before top-level match resolves', () => {
      const subscription = environment
        .execute({operation})
        .subscribe(callbacks);
      const payload = {
        data: {
          node: {
            id: '1',
            __typename: 'User',
            outerRenderer: {
              __typename: 'MarkdownUserNameRenderer',
              __module_component: 'MarkdownUserNameRenderer.react',
              __module_operation:
                'MarkdownUserNameRenderer_name$normalization.graphql',
              markdown: 'markdown payload',
              data: {
                // NOTE: should be uppercased when normalized (by MarkupHandler)
                markup: '<markup/>',
              },
              user: {
                id: '2',
                innerRenderer: {
                  __typename: 'PlainUserNameRenderer',
                  __module_component: 'PlainUserNameRenderer.react',
                  __module_operation:
                    'PlainUserNameRenderer_name$normalization.graphql',
                  plaintext: 'plaintext payload',
                  data: {
                    text: 'plaintext!',
                  },
                },
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

      expect(operationLoader.load).toBeCalledTimes(1);
      expect(operationLoader.load.mock.calls[0][0]).toEqual(
        'MarkdownUserNameRenderer_name$normalization.graphql',
      );
      // Cancel before the fragment resolves; normalization should be skipped
      subscription.unsubscribe();
      resolveFragment(markdownRendererNormalizationFragment);
      jest.runAllTimers();

      expect(operationCallback).toBeCalledTimes(1);
      // result shape tested above
      const operationSnapshot = operationCallback.mock.calls[0][0];
      const outerMatchSelector = nullthrows(
        getSingularSelector(
          variables,
          markdownRendererFragment,
          (operationSnapshot.data?.node: any)?.outerRenderer,
        ),
      );
      // initial outer fragment snapshot is tested above
      const outerMatchSnapshot = environment.lookup(
        outerMatchSelector.selector,
        operation,
      );
      expect(outerMatchSnapshot.isMissingData).toBe(true);
      expect(outerMatchSnapshot.data).toEqual({
        __typename: 'MarkdownUserNameRenderer',
        data: undefined,
        markdown: undefined,
        user: undefined,
      });
    });

    it('cancels @match processing if unsubscribed before inner match resolves', () => {
      const subscription = environment
        .execute({operation})
        .subscribe(callbacks);
      const payload = {
        data: {
          node: {
            id: '1',
            __typename: 'User',
            outerRenderer: {
              __typename: 'MarkdownUserNameRenderer',
              __module_component: 'MarkdownUserNameRenderer.react',
              __module_operation:
                'MarkdownUserNameRenderer_name$normalization.graphql',
              markdown: 'markdown payload',
              data: {
                // NOTE: should be uppercased when normalized (by MarkupHandler)
                markup: '<markup/>',
              },
              user: {
                id: '2',
                innerRenderer: {
                  __typename: 'PlainUserNameRenderer',
                  __module_component: 'PlainUserNameRenderer.react',
                  __module_operation:
                    'PlainUserNameRenderer_name$normalization.graphql',
                  plaintext: 'plaintext payload',
                  data: {
                    text: 'plaintext!',
                  },
                },
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

      expect(operationLoader.load).toBeCalledTimes(1);
      expect(operationLoader.load.mock.calls[0][0]).toEqual(
        'MarkdownUserNameRenderer_name$normalization.graphql',
      );
      resolveFragment(markdownRendererNormalizationFragment);
      jest.runAllTimers();

      // Cancel before the inner fragment resolves; normalization should be skipped
      subscription.unsubscribe();
      resolveFragment(plaintextRendererNormalizationFragment);
      jest.runAllTimers();

      expect(operationCallback).toBeCalledTimes(1);
      // result shape tested above
      const operationSnapshot = operationCallback.mock.calls[0][0];
      const outerMatchSelector = nullthrows(
        getSingularSelector(
          variables,
          markdownRendererFragment,
          (operationSnapshot.data?.node: any)?.outerRenderer,
        ),
      );
      // initial outer fragment snapshot is tested above
      const outerMatchSnapshot = environment.lookup(
        outerMatchSelector.selector,
        operation,
      );
      const innerMatchSelector = nullthrows(
        getSingularSelector(
          variables,
          plaintextRendererFragment,
          (outerMatchSnapshot.data?.user: $FlowFixMe)?.innerRenderer,
        ),
      );
      const innerMatchSnapshot = environment.lookup(
        innerMatchSelector.selector,
        operation,
      );
      expect(innerMatchSnapshot.isMissingData).toBe(true);
      expect(innerMatchSnapshot.data).toEqual({});
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
      } = generateAndCompile(`
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
      `));
      variables = {
        input: {
          clientMutationId: '0',
          feedbackId: '1',
        },
      };
      operation = createOperationDescriptor(CreateCommentMutation, variables);

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
      environment.executeMutation({operation}).subscribe({});
      expect(fetch.mock.calls.length).toBe(1);
      expect(fetch.mock.calls[0][0]).toEqual(CreateCommentMutation.params);
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
      const snapshot = environment.lookup(selector, operation);
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
      const snapshot = environment.lookup(selector, operation);
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
      const snapshot = environment.lookup(selector, operation);
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
      const snapshot = environment.lookup(selector, operation);
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
      const snapshot = environment.lookup(selector, operation);
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
      operation = createOperationDescriptor(
        CreateCommentWithSpreadMutation,
        variables,
      );

      const commentID = 'comment';
      const selector = {
        dataID: commentID,
        node: CommentFragment,
        variables: {},
      };
      const snapshot = environment.lookup(selector, operation);
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
      const snapshot = environment.lookup(selector, operation);
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

  describe('executeMutation() with @match', () => {
    let callbacks;
    let complete;
    let dataSource;
    let environment;
    let error;
    let fetch;
    let markdownRendererFragment;
    let markdownRendererNormalizationFragment;
    let mutation;
    let next;
    let operationLoader;
    let operation;
    let operationCallback;
    let resolveFragment;
    let variables;

    beforeEach(() => {
      ({
        CreateCommentMutation: mutation,
        MarkdownUserNameRenderer_name: markdownRendererFragment,
        MarkdownUserNameRenderer_name$normalization: markdownRendererNormalizationFragment,
      } = generateAndCompile(`
        mutation CreateCommentMutation($input: CommentCreateInput!) {
          commentCreate(input: $input) {
            comment {
              actor {
                nameRenderer @match {
                  ...PlainUserNameRenderer_name
                    @module(name: "PlainUserNameRenderer.react")
                  ...MarkdownUserNameRenderer_name
                    @module(name: "MarkdownUserNameRenderer.react")
                }
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
      variables = {
        input: {
          clientMutationId: '0',
          feedbackId: '1',
        },
      };
      operation = createOperationDescriptor(mutation, variables);

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
      const operationSnapshot = environment.lookup(
        operation.fragment,
        operation,
      );
      operationCallback = jest.fn();
      environment.subscribe(operationSnapshot, operationCallback);
    });

    it('calls next() and publishes the initial payload to the store', () => {
      environment.executeMutation({operation}).subscribe(callbacks);
      const payload = {
        data: {
          commentCreate: {
            comment: {
              id: '1',
              body: {
                text: 'Gave Relay', // server data is lowercase
              },
              actor: {
                id: '4',
                __typename: 'User',
                nameRenderer: {
                  __typename: 'MarkdownUserNameRenderer',
                  __module_component: 'MarkdownUserNameRenderer.react',
                  __module_operation:
                    'MarkdownUserNameRenderer_name$normalization.graphql',
                  markdown: 'markdown payload',
                  data: {
                    markup: '<markup/>',
                  },
                },
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
      expect(operationCallback).toBeCalledTimes(1);
      const operationSnapshot = operationCallback.mock.calls[0][0];
      expect(operationSnapshot.isMissingData).toBe(false);
      expect(operationSnapshot.data).toEqual({
        commentCreate: {
          comment: {
            actor: {
              nameRenderer: {
                __id:
                  'client:4:nameRenderer(MarkdownUserNameRenderer_name:MarkdownUserNameRenderer.react,PlainUserNameRenderer_name:PlainUserNameRenderer.react)',
                __fragmentPropName: 'name',
                __fragments: {
                  MarkdownUserNameRenderer_name: {},
                },
                __fragmentOwner: operation,
                __module_component: 'MarkdownUserNameRenderer.react',
              },
            },
          },
        },
      });

      const matchSelector = nullthrows(
        getSingularSelector(
          variables,
          markdownRendererFragment,
          (operationSnapshot.data: any)?.commentCreate?.comment?.actor
            ?.nameRenderer,
        ),
      );
      const matchSnapshot = environment.lookup(
        matchSelector.selector,
        operation,
      );
      // ref exists but match field data hasn't been processed yet
      expect(matchSnapshot.isMissingData).toBe(true);
      expect(matchSnapshot.data).toEqual({
        __typename: 'MarkdownUserNameRenderer',
        data: undefined,
        markdown: undefined,
      });
    });

    it('loads the @match fragment and normalizes/publishes the field payload', () => {
      environment.executeMutation({operation}).subscribe(callbacks);
      const payload = {
        data: {
          commentCreate: {
            comment: {
              id: '1',
              body: {
                text: 'Gave Relay', // server data is lowercase
              },
              actor: {
                id: '4',
                __typename: 'User',
                nameRenderer: {
                  __typename: 'MarkdownUserNameRenderer',
                  __module_component: 'MarkdownUserNameRenderer.react',
                  __module_operation:
                    'MarkdownUserNameRenderer_name$normalization.graphql',
                  markdown: 'markdown payload',
                  data: {
                    markup: '<markup/>',
                  },
                },
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

      expect(operationCallback).toBeCalledTimes(1);
      // result tested above
      const operationSnapshot = operationCallback.mock.calls[0][0];
      operationCallback.mockClear();

      const matchSelector = nullthrows(
        getSingularSelector(
          variables,
          markdownRendererFragment,
          (operationSnapshot.data: any)?.commentCreate?.comment?.actor
            ?.nameRenderer,
        ),
      );
      const initialMatchSnapshot = environment.lookup(
        matchSelector.selector,
        operation,
      );
      expect(initialMatchSnapshot.isMissingData).toBe(true);
      const matchCallback = jest.fn();
      environment.subscribe(initialMatchSnapshot, matchCallback);

      resolveFragment(markdownRendererNormalizationFragment);
      jest.runAllTimers();
      // next() should not be called when @match resolves, no new GraphQLResponse
      // was received for this case
      expect(next).toBeCalledTimes(0);
      expect(operationCallback).toBeCalledTimes(0);
      expect(matchCallback).toBeCalledTimes(1);

      const matchSnapshot = matchCallback.mock.calls[0][0];
      expect(matchSnapshot.isMissingData).toBe(false);
      expect(matchSnapshot.data).toEqual({
        __typename: 'MarkdownUserNameRenderer',
        data: {
          // NOTE: should be uppercased by the MarkupHandler
          markup: '<MARKUP/>',
        },
        markdown: 'markdown payload',
      });
    });

    it('calls complete() only after match payloads are processed (network completes first)', () => {
      environment.executeMutation({operation}).subscribe(callbacks);
      const payload = {
        data: {
          commentCreate: {
            comment: {
              id: '1',
              body: {
                text: 'Gave Relay', // server data is lowercase
              },
              actor: {
                id: '4',
                __typename: 'User',
                nameRenderer: {
                  __typename: 'MarkdownUserNameRenderer',
                  __module_component: 'MarkdownUserNameRenderer.react',
                  __module_operation:
                    'MarkdownUserNameRenderer_name$normalization.graphql',
                  markdown: 'markdown payload',
                  data: {
                    markup: '<markup/>',
                  },
                },
              },
            },
          },
        },
      };
      dataSource.next(payload);
      dataSource.complete();
      jest.runAllTimers();
      expect(complete).toBeCalledTimes(0);
      expect(error).toBeCalledTimes(0);
      expect(next).toBeCalledTimes(1);

      expect(operationLoader.load).toBeCalledTimes(1);
      expect(operationLoader.load.mock.calls[0][0]).toEqual(
        'MarkdownUserNameRenderer_name$normalization.graphql',
      );
      resolveFragment(markdownRendererNormalizationFragment);
      jest.runAllTimers();

      expect(complete).toBeCalledTimes(1);
      expect(error).toBeCalledTimes(0);
      expect(next).toBeCalledTimes(1);
    });

    it('calls complete() only after match payloads are processed (network completes last)', () => {
      environment.executeMutation({operation}).subscribe(callbacks);
      const payload = {
        data: {
          commentCreate: {
            comment: {
              id: '1',
              body: {
                text: 'Gave Relay', // server data is lowercase
              },
              actor: {
                id: '4',
                __typename: 'User',
                nameRenderer: {
                  __typename: 'MarkdownUserNameRenderer',
                  __module_component: 'MarkdownUserNameRenderer.react',
                  __module_operation:
                    'MarkdownUserNameRenderer_name$normalization.graphql',
                  markdown: 'markdown payload',
                  data: {
                    markup: '<markup/>',
                  },
                },
              },
            },
          },
        },
      };
      dataSource.next(payload);
      jest.runAllTimers();

      expect(operationLoader.load).toBeCalledTimes(1);
      expect(operationLoader.load.mock.calls[0][0]).toEqual(
        'MarkdownUserNameRenderer_name$normalization.graphql',
      );
      resolveFragment(markdownRendererNormalizationFragment);
      jest.runAllTimers();

      expect(complete).toBeCalledTimes(0);
      expect(error).toBeCalledTimes(0);
      expect(next).toBeCalledTimes(1);

      dataSource.complete();
      expect(complete).toBeCalledTimes(1);
      expect(error).toBeCalledTimes(0);
      expect(next).toBeCalledTimes(1);
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
      operation = createOperationDescriptor(query, {});

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
      expect(environment.lookup(operation.fragment, operation).data).toEqual({
        me: {
          name: 'ALICE',
        },
      });
    });
  });

  // Regression test
  describe('query with undeclared, unused fragment argument', () => {
    let environment;
    let fetch;
    let fragment;
    let innerFragment;
    let operation;
    let query;
    let subject;

    beforeEach(() => {
      ({
        QueryWithUnusedFragmentArgumentDefinition: query,
        Profile: fragment,
        ProfilePhotoWrapper: innerFragment,
      } = generateAndCompile(`
        query QueryWithUnusedFragmentArgumentDefinition($id: ID!) {
          node(id: $id) {
            ...Profile
          }
        }

        fragment Profile on User {
          id
          name
          ...ProfilePhotoWrapper @arguments(size: $size)
        }

        fragment ProfilePhotoWrapper on User @argumentDefinitions(size: {type: "Int"}) {
          __typename
          ...ProfilePhoto @arguments(size: $size)
        }

        fragment ProfilePhoto on User {
          profilePicture(size: [100]) {
            uri
          }
        }
      `));
      operation = createOperationDescriptor(query, {id: '4'});
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

    it('reads results with the undeclared variable set to undefined', () => {
      environment.execute({operation}).subscribe({});
      subject.next({
        data: {
          node: {
            __typename: 'User',
            id: '4',
            name: 'Zuck',
            profilePicture: {
              uri: 'https://facebook.com/zuck.jpg',
            },
          },
        },
      });
      subject.complete();
      const snapshot = environment.lookup(operation.fragment, operation);
      expect(snapshot.isMissingData).toBe(false);
      expect(snapshot.data).toEqual({
        node: {
          __fragmentOwner: operation,
          __fragments: {
            Profile: {},
          },
          __id: '4',
        },
      });
      const fragmentSelector = RelayModernSelector.getSelector(
        operation.variables,
        fragment,
        (snapshot.data: $FlowFixMe).node,
        operation,
      );
      invariant(
        fragmentSelector != null && !Array.isArray(fragmentSelector),
        'Expected a singular selector.',
      );
      const fragmentSnapshot = environment.lookup(
        fragmentSelector.selector,
        fragmentSelector.owner,
      );
      expect(fragmentSnapshot.isMissingData).toBe(false);
      expect(fragmentSnapshot.data).toEqual({
        __id: '4',
        __fragmentOwner: operation,
        __fragments: {
          ProfilePhotoWrapper: {size: undefined},
        },
        id: '4',
        name: 'Zuck',
      });
      const innerSelector = RelayModernSelector.getSelector(
        operation.variables,
        innerFragment,
        (fragmentSnapshot.data: $FlowFixMe),
        operation,
      );
      invariant(
        innerSelector != null && !Array.isArray(innerSelector),
        'Expected a singular selector.',
      );
      const innerSnapshot = environment.lookup(
        innerSelector.selector,
        innerSelector.owner,
      );
      expect(innerSnapshot.isMissingData).toBe(false);
      expect(innerSnapshot.data).toEqual({
        __id: '4',
        __fragmentOwner: operation,
        __fragments: {
          ProfilePhoto: {size: undefined},
        },
        __typename: 'User',
      });
    });
  });
});

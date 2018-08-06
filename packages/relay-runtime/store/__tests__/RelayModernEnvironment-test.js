/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const RelayInMemoryRecordSource = require('../RelayInMemoryRecordSource');
const RelayMarkSweepStore = require('../RelayMarkSweepStore');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernTestUtils = require('RelayModernTestUtils');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');

const {createOperationSelector} = require('../RelayModernOperationSelector');
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
    store = new RelayMarkSweepStore(source);

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
      ({ParentQuery} = generateAndCompile(
        `
        query ParentQuery($size: [Int]!) {
          me {
            id
            name
            profilePicture(size: $size) {
              uri
            }
          }
        }
      `,
      ));
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
      ({ParentQuery} = generateAndCompile(
        `
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
      `,
      ));
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
          user.setValue(name, 'name');
        },
      });
    }

    beforeEach(() => {
      ({ParentQuery} = generateAndCompile(
        `
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
      `,
      ));
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
      ({ParentQuery} = generateAndCompile(
        `
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
      `,
      ));
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
      ({UserFragment} = generateAndCompile(
        `
        fragment UserFragment on User {
          id
          name
        }
      `,
      ));
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
      ({ActorQuery} = generateAndCompile(
        `
        query ActorQuery {
          me {
            name
          }
        }
      `,
      ));
      operationSelector = createOperationSelector(ActorQuery, {});
      store.notify = jest.fn(store.notify.bind(store));
      store.publish = jest.fn(store.publish.bind(store));
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
        network: RelayNetwork.create(fetch),
        store,
      });
    });

    it('fetches queries', () => {
      environment.execute({operation});
      expect(fetch.mock.calls.length).toBe(1);
      expect(fetch.mock.calls[0][0]).toBe(query);
      expect(fetch.mock.calls[0][1]).toEqual({fetchSize: false});
      expect(fetch.mock.calls[0][2]).toEqual({});
    });

    it('fetches queries with force:true', () => {
      const cacheConfig = {force: true};
      environment.execute({cacheConfig, operation});
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
      expect(next).toBeCalledWith({
        response: payload,
        variables,
        operation: operation.node.operation,
      });
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
        network: RelayNetwork.create(fetch),
        store,
      });
    });

    it('fetches queries', () => {
      environment.execute({operation});
      expect(fetch.mock.calls.length).toBe(1);
      expect(fetch.mock.calls[0][0]).toBe(query);
      expect(fetch.mock.calls[0][1]).toEqual({fetchSize: false});
      expect(fetch.mock.calls[0][2]).toEqual({});
    });

    it('fetches queries with force:true', () => {
      const cacheConfig = {force: true};
      environment.execute({cacheConfig, operation});
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
      expect(next).toBeCalledWith({
        response: payload,
        variables,
        operation: operation.node.operation,
      });
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

    it('calls next() and publishes optimisitc payload to the store', () => {
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
        operation: query.operation,
        variables,
        response: payload,
        isOptimistic: true,
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

    it('reverts the optimisitc payload before applies regular response', () => {
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
        operation: query.operation,
        variables,
        response: optimisticResponse,
        isOptimistic: true,
      });

      jest.runAllTimers();
      dataSource.next({
        operation: query.operation,
        variables,
        response: realResponse,
      });
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

    it('reverts optimistic response as a cleanup.', () => {
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
        operation: query.operation,
        variables,
        response: payload,
        isOptimistic: true,
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
            const body = comment.getLinkedRecord('body');
            body.setValue(body.getValue('text').toUpperCase(), 'text');
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
});

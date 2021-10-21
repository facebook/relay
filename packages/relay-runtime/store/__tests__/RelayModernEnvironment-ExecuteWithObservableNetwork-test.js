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

const {
  MultiActorEnvironment,
  getActorIdentifier,
} = require('../../multi-actor-environment');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {createReaderSelector} = require('../RelayModernSelector');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const {ROOT_ID} = require('../RelayStoreUtils');
const {getRequest, graphql} = require('relay-runtime');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

describe.each(['RelayModernEnvironment', 'MultiActorEnvironment'])(
  'execute() with Observable network',
  environmentType => {
    let callbacks;
    let complete;
    let environment;
    let error;
    let fetch;
    let next;
    let operation;
    let query;
    let source;
    let store;
    let subject;
    let variables;

    describe(environmentType, () => {
      beforeEach(() => {
        query = getRequest(graphql`
          query RelayModernEnvironmentExecuteWithObservableNetworkTestQuery(
            $fetchSize: Boolean!
          ) {
            me {
              name
              profilePicture(size: 42) @include(if: $fetchSize) {
                uri
              }
            }
          }
        `);
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
        source = RelayRecordSource.create();
        store = new RelayModernStore(source);
        const multiActorEnvironment = new MultiActorEnvironment({
          createNetworkForActor: _actorID => RelayNetwork.create(fetch),
          createStoreForActor: _actorID => store,
        });
        environment =
          environmentType === 'MultiActorEnvironment'
            ? multiActorEnvironment.forActor(getActorIdentifier('actor:1234'))
            : new RelayModernEnvironment({
                network: RelayNetwork.create(fetch),
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
        operation = createOperationDescriptor(
          query,
          {
            ...variables,
            foo: 'bar', // should be filtered from network fetch
          },
          cacheConfig,
        );
        environment.execute({operation}).subscribe(callbacks);
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
        environment
          .executeSubscription({operation, updater})
          .subscribe(callbacks);
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
        const selector = createReaderSelector(
          query.fragment,
          ROOT_ID,
          variables,
          operation.request,
        );
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

      it('calls next() with extensions-only payloads', () => {
        environment.execute({operation}).subscribe(callbacks);
        const payload1 = {data: null, extensions: {}};
        const payload2 = {data: null, extensions: {is_final: true}};
        subject.next(payload1);
        jest.runAllTimers();
        expect(error).not.toBeCalled();
        expect(complete).not.toBeCalled();
        expect(next.mock.calls.length).toBe(1);
        const response = next.mock.calls[0][0];
        expect(response).toBe(payload1);
        next.mockClear();

        subject.next(payload2);
        jest.runAllTimers();
        expect(error).not.toBeCalled();
        expect(complete).not.toBeCalled();
        expect(next.mock.calls.length).toBe(1);
        const response2 = next.mock.calls[0][0];
        expect(response2).toBe(payload2);
      });
    });
  },
);

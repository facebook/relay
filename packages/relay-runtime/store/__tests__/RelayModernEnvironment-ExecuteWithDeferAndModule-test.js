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

// flowlint ambiguous-object-type:error

'use strict';
import type {
  Variables,
  CacheConfig,
} from 'relay-runtime/util/RelayRuntimeTypes';
import type {RequestParameters} from 'relay-runtime/util/RelayConcreteNode';

import type {NormalizationRootNode} from '../../util/NormalizationNode';
import type {ReaderFragment} from '../../util/ReaderNode';
import type {ConcreteRequest} from '../../util/RelayConcreteNode';

const {
  MultiActorEnvironment,
  getActorIdentifier,
} = require('../../multi-actor-environment');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {createReaderSelector} = require('../RelayModernSelector');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const QueryUserNormalizationFragment = require('./__generated__/RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$normalization.graphql');
const {graphql} = require('relay-runtime');
const {
  disallowWarnings,
  expectWarningWillFire,
} = require('relay-test-utils-internal');

disallowWarnings();

describe.each(['RelayModernEnvironment', 'MultiActorEnvironment'])(
  'execute() a query with @defer and @module',
  environmentType => {
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
      get: (reference: mixed) => ?NormalizationRootNode,
      load: JestMockFn<$ReadOnlyArray<mixed>, Promise<?NormalizationRootNode>>,
    |};
    let operationCallback;
    let query;
    let resolveFragment;
    let selector;
    let source;
    let store;
    let variables;

    describe(environmentType, () => {
      beforeEach(() => {
        query = graphql`
          query RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery(
            $id: ID!
          ) {
            node(id: $id) {
              ...RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user
                @defer(
                  label: "RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user"
                )
                @module(name: "User.react")
            }
          }
        `;
        fragment = graphql`
          fragment RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user on User {
            id
            name
          }
        `;
        variables = {id: '1'};
        operation = createOperationDescriptor(
          ((query: any): ConcreteRequest),
          variables,
        );
        selector = createReaderSelector(
          ((fragment: any): ReaderFragment),
          '1',
          {},
          operation.request,
        );

        complete = jest.fn();
        error = jest.fn();
        next = jest.fn();
        callbacks = {complete, error, next};
        fetch = (
          _query: RequestParameters,
          _variables: Variables,
          _cacheConfig: CacheConfig,
        ) => {
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
        source = RelayRecordSource.create();
        store = new RelayModernStore(source);

        environment = new RelayModernEnvironment({
          network: RelayNetwork.create(fetch),
          store,
          operationLoader,
        });

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

        const operationSnapshot = environment.lookup(operation.fragment);
        operationCallback = jest.fn();
        environment.subscribe(operationSnapshot, operationCallback);
      });

      it('calls next() and publishes the initial payload to the store', () => {
        const initialSnapshot = environment.lookup(selector);

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
        const initialSnapshot = environment.lookup(selector);
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
        expect(operationCallback).toBeCalledTimes(1);
        next.mockClear();
        callback.mockClear();
        operationCallback.mockClear();

        dataSource.next({
          data: {
            id: '1',
            name: 'joe',
            __typename: 'User',
            __module_component_RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery:
              'User.react',
            __module_operation_RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery:
              'RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$normalization.graphql',
          },
          label:
            'RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery$defer$RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user',
          path: ['node'],
        });

        expect(operationLoader.load).toBeCalledTimes(1);
        expect(operationLoader.load.mock.calls[0][0]).toEqual(
          'RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$normalization.graphql',
        );

        resolveFragment(QueryUserNormalizationFragment);
        jest.runAllTimers();
        operationCallback.mockClear();

        expect(complete).toBeCalledTimes(0);
        expect(error).toBeCalledTimes(0);
        expect(next).toBeCalledTimes(1);
        expect(callback).toBeCalledTimes(1);
        const snapshot = callback.mock.calls[0][0];
        expect(snapshot.isMissingData).toBe(false);
        expect(snapshot.data).toEqual({
          id: '1',
          name: 'joe',
        });
      });

      it('synchronously normalizes the deferred payload if the normalization fragment is available synchronously', () => {
        const initialSnapshot = environment.lookup(selector);
        const callback = jest.fn();
        environment.subscribe(initialSnapshot, callback);

        environment.execute({operation}).subscribe(callbacks);
        jest
          .spyOn(operationLoader, 'get')
          .mockImplementationOnce(() => QueryUserNormalizationFragment);

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
        expect(operationCallback).toBeCalledTimes(1);

        dataSource.next({
          data: {
            id: '1',
            name: 'joe',
            __typename: 'User',
            __module_component_RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery:
              'User.react',
            __module_operation_RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery:
              'RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$normalization.graphql',
          },
          label:
            'RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery$defer$RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user',
          path: ['node'],
        });

        expect(operationLoader.get).toBeCalledTimes(1);
        operationCallback.mockClear();

        const snapshot = callback.mock.calls[0][0];
        expect(snapshot.isMissingData).toBe(false);
        expect(snapshot.data).toEqual({
          id: '1',
          name: 'joe',
        });
      });

      it('processes deferred payloads if the normalization fragment is delivered in same network response', () => {
        const initialSnapshot = environment.lookup(selector);
        const callback = jest.fn();
        environment.subscribe(initialSnapshot, callback);

        environment.execute({operation}).subscribe(callbacks);
        jest
          .spyOn(operationLoader, 'get')
          .mockImplementationOnce(() => QueryUserNormalizationFragment);

        dataSource.next([
          {
            data: {
              node: {
                id: '1',
                __typename: 'User',
              },
            },
          },
          {
            data: {
              id: '1',
              name: 'joe',
              __typename: 'User',
              __module_component_RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery:
                'User.react',
              __module_operation_RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery:
                'RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$normalization.graphql',
            },
            label:
              'RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery$defer$RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user',
            path: ['node'],
          },
        ]);

        expect(callback).toHaveBeenCalledTimes(1);
        const snapshot = callback.mock.calls[0][0];
        expect(snapshot.isMissingData).toBe(false);
        expect(snapshot.data).toEqual({
          id: '1',
          name: 'joe',
        });
        expect(operationLoader.get).toBeCalledTimes(1);
        operationCallback.mockClear();
      });
    });
  },
);

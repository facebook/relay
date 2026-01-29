/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall relay
 */

'use strict';
import type {IActorEnvironment} from '../../multi-actor-environment/MultiActorEnvironmentTypes';
import type {GraphQLResponse} from '../../network/RelayNetworkTypes';
import type {NormalizationRootNode} from '../../util/NormalizationNode';
import type {ReaderFragment} from '../../util/ReaderNode';
import type {ConcreteRequest} from '../../util/RelayConcreteNode';
import type {Snapshot} from '../RelayStoreTypes';
import type {RequestParameters} from 'relay-runtime/util/RelayConcreteNode';
import type {
  CacheConfig,
  Variables,
} from 'relay-runtime/util/RelayRuntimeTypes';

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
const QueryUserNormalizationFragment = require('./__generated__/RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$normalization.graphql');
const {graphql} = require('relay-runtime');
const {expectToWarn, expectToWarnMany} = require('relay-test-utils-internal');
const {
  disallowWarnings,
  injectPromisePolyfill__DEPRECATED,
} = require('relay-test-utils-internal');

injectPromisePolyfill__DEPRECATED();
disallowWarnings();

describe.each(['RelayModernEnvironment', 'MultiActorEnvironment'])(
  'execute() a query with @defer and @module',
  environmentType => {
    let callbacks;
    let complete;
    let dataSource;
    let environment: IActorEnvironment | RelayModernEnvironment;
    let error;
    let fetch;
    let fragment;
    let next;
    let operation;
    let operationLoader: {
      get: (reference: unknown) => ?NormalizationRootNode,
      load: JestMockFn<ReadonlyArray<unknown>, Promise<?NormalizationRootNode>>,
    };
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
          query as any as ConcreteRequest,
          variables,
        );
        selector = createReaderSelector(
          fragment as any as ReaderFragment,
          '1',
          {},
          operation.request,
        );

        complete = jest.fn<[], unknown>();
        error = jest.fn<[Error], unknown>();
        next = jest.fn<[GraphQLResponse], unknown>();
        callbacks = {complete, error, next};
        fetch = (
          _query: RequestParameters,
          _variables: Variables,
          _cacheConfig: CacheConfig,
        ) => {
          // $FlowFixMe[missing-local-annot] Error found while enabling LTI on this file
          return RelayObservable.create(sink => {
            dataSource = sink;
          });
        };
        operationLoader = {
          get: jest.fn(),
          load: jest.fn(moduleName => {
            return new Promise(resolve => {
              resolveFragment = resolve;
            });
          }),
        };
        source = RelayRecordSource.create();
        store = new RelayModernStore(source);

        environment = new RelayModernEnvironment({
          network: RelayNetwork.create(fetch),
          operationLoader,
          store,
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
                operationLoader,
                store,
              });

        const operationSnapshot = environment.lookup(operation.fragment);
        operationCallback = jest.fn<[Snapshot], void>();
        environment.subscribe(operationSnapshot, operationCallback);
      });

      it('calls next() and publishes the initial payload to the store', () => {
        const initialSnapshot = environment.lookup(selector);

        const callback = jest.fn<[Snapshot], void>();
        environment.subscribe(initialSnapshot, callback);
        environment.execute({operation}).subscribe(callbacks);
        const payload = {
          data: {
            node: {
              __typename: 'User',
              id: '1',
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
        const callback = jest.fn<[Snapshot], void>();
        environment.subscribe(initialSnapshot, callback);

        environment.execute({operation}).subscribe(callbacks);
        dataSource.next({
          data: {
            node: {
              __typename: 'User',
              id: '1',
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
            __module_component_RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery:
              'User.react',
            __module_operation_RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery:
              'RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$normalization.graphql',
            __typename: 'User',
            id: '1',
            name: 'joe',
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
        const callback = jest.fn<[Snapshot], void>();
        environment.subscribe(initialSnapshot, callback);

        environment.execute({operation}).subscribe(callbacks);
        jest
          .spyOn(operationLoader, 'get')
          .mockImplementationOnce(() => QueryUserNormalizationFragment);

        dataSource.next({
          data: {
            node: {
              __typename: 'User',
              id: '1',
            },
          },
        });

        jest.runAllTimers();
        next.mockClear();
        callback.mockClear();
        expect(operationCallback).toBeCalledTimes(1);

        dataSource.next({
          data: {
            __module_component_RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery:
              'User.react',
            __module_operation_RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery:
              'RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$normalization.graphql',
            __typename: 'User',
            id: '1',
            name: 'joe',
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
        const callback = jest.fn<[Snapshot], void>();
        environment.subscribe(initialSnapshot, callback);

        environment.execute({operation}).subscribe(callbacks);
        jest
          .spyOn(operationLoader, 'get')
          .mockImplementationOnce(() => QueryUserNormalizationFragment);

        dataSource.next([
          {
            data: {
              node: {
                __typename: 'User',
                id: '1',
              },
            },
          },
          {
            data: {
              __module_component_RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery:
                'User.react',
              __module_operation_RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery:
                'RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$normalization.graphql',
              __typename: 'User',
              id: '1',
              name: 'joe',
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

      it('warns if executed in non-streaming mode and processes both defer and 3D', () => {
        const initialSnapshot = environment.lookup(selector);
        const callback = jest.fn<[Snapshot], void>();
        environment.subscribe(initialSnapshot, callback);

        environment.execute({operation}).subscribe(callbacks);
        jest
          .spyOn(operationLoader, 'get')
          .mockImplementationOnce(() => QueryUserNormalizationFragment);

        expectToWarn(
          'RelayModernEnvironment: Operation `RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery` contains @defer/@stream ' +
            'directives but was executed in non-streaming mode. See ' +
            'https://fburl.com/relay-incremental-delivery-non-streaming-warning.',
          () => {
            dataSource.next([
              {
                data: {
                  node: {
                    __module_component_RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery:
                      'User.react',
                    __module_operation_RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery:
                      'RelayModernEnvironmentExecuteWithDeferAndModuleTestQuery_user$normalization.graphql',
                    __typename: 'User',
                    id: '1',
                    name: 'joe',
                  },
                },
                extensions: {
                  is_final: true,
                },
              },
            ]);
          },
        );

        expect(callbacks.error).not.toBeCalled();
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

      it('warns if nested defer is executed in non-streaming mode and processes deferred selections', () => {
        const query = graphql`
          query RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery(
            $id: ID!
          ) {
            node(id: $id) {
              ...RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery_user
                @defer(
                  label: "RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery_user"
                )
                @module(name: "User.react")
            }
          }
        `;
        const fragment = graphql`
          fragment RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery_user on User {
            id
            ...RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInnerUserFragment
              @defer
          }
        `;
        const fragmentInner = graphql`
          fragment RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInnerUserFragment on User {
            name
            ...RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInner2UserFragment
              @defer
          }
        `;
        const fragmentInnerInner2 = graphql`
          fragment RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInner2UserFragment on User {
            lastName
          }
        `;
        variables = {id: '1'};
        operation = createOperationDescriptor(query, variables);
        selector = createReaderSelector(fragment, '1', {}, operation.request);

        const initialSnapshot = environment.lookup(selector);
        const callback = jest.fn<[Snapshot], void>();
        environment.subscribe(initialSnapshot, callback);

        environment.execute({operation}).subscribe(callbacks);
        jest
          .spyOn(operationLoader, 'get')
          .mockImplementationOnce(() =>
            require('./__generated__/RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery_user$normalization.graphql.js'),
          );

        expectToWarnMany(
          [
            'RelayModernEnvironment: Operation `RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery` contains @defer/@stream ' +
              'directives but was executed in non-streaming mode. See ' +
              'https://fburl.com/relay-incremental-delivery-non-streaming-warning.',
            'RelayModernEnvironment: Operation `RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery` contains @defer/@stream ' +
              'directives but was executed in non-streaming mode. See ' +
              'https://fburl.com/relay-incremental-delivery-non-streaming-warning.',
            'RelayModernEnvironment: Operation `RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery` contains @defer/@stream ' +
              'directives but was executed in non-streaming mode. See ' +
              'https://fburl.com/relay-incremental-delivery-non-streaming-warning.',
          ],
          () => {
            dataSource.next([
              {
                data: {
                  node: {
                    __module_component_RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery:
                      'User.react',
                    __module_operation_RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery:
                      'RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery$normalization.graphql',
                    __typename: 'User',
                    id: '1',
                    lastName: 'eoj',
                    name: 'joe',
                  },
                },
                extensions: {
                  is_final: true,
                },
              },
            ]);
          },
        );

        expect(callbacks.error).not.toBeCalled();
        expect(callback).toHaveBeenCalledTimes(1);
        const snapshot = callback.mock.calls[0][0];
        expect(snapshot.isMissingData).toBe(false);
        expect(snapshot.data?.id).toEqual('1');
        expect(operationLoader.get).toBeCalledTimes(1);
        operationCallback.mockClear();

        const innerSelector = createReaderSelector(
          fragmentInner,
          '1',
          {},
          operation.request,
        );
        const innerSnapshot = environment.lookup(innerSelector);
        expect(innerSnapshot.isMissingData).toBe(false);
        expect(innerSnapshot.data?.name).toEqual('joe');

        const innerInner2Selector = createReaderSelector(
          fragmentInnerInner2,
          '1',
          {},
          operation.request,
        );
        const innerInner2Snapshot = environment.lookup(innerInner2Selector);
        expect(innerInner2Snapshot.isMissingData).toBe(false);
        expect(innerInner2Snapshot.data).toEqual({
          lastName: 'eoj',
        });
      });
    });
  },
);

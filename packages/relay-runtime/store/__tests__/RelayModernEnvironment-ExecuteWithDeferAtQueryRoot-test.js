/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {GraphQLResponse} from 'relay-runtime/network/RelayNetworkTypes';
import type {Sink} from 'relay-runtime/network/RelayObservable';
import type {RequestParameters} from 'relay-runtime/util/RelayConcreteNode';
import type {
  CacheConfig,
  Variables,
} from 'relay-runtime/util/RelayRuntimeTypes';

const {
  MultiActorEnvironment,
  getActorIdentifier,
} = require('relay-runtime/multi-actor-environment');
const RelayNetwork = require('relay-runtime/network/RelayNetwork');
const RelayObservable = require('relay-runtime/network/RelayObservable');
const {graphql} = require('relay-runtime/query/GraphQLTag');
const RelayModernEnvironment = require('relay-runtime/store/RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('relay-runtime/store/RelayModernOperationDescriptor');
const {
  createReaderSelector,
} = require('relay-runtime/store/RelayModernSelector');
const RelayModernStore = require('relay-runtime/store/RelayModernStore');
const RelayRecordSource = require('relay-runtime/store/RelayRecordSource');
const {ROOT_ID} = require('relay-runtime/store/RelayStoreUtils');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

describe.each(['RelayModernEnvironment', 'MultiActorEnvironment'])(
  'execute() a query with @defer at the query root',
  environmentType => {
    let callbacks;
    let complete;
    let dataSource;
    let environment;
    let error;
    let next;

    const createEnvironment = (getDataID?: $FlowFixMe) => {
      const fetch = (
        _query: RequestParameters,
        _variables: Variables,
        _cacheConfig: CacheConfig,
      ): RelayObservable<GraphQLResponse> => {
        return RelayObservable.create<GraphQLResponse>(
          (sink: Sink<GraphQLResponse>) => {
            dataSource = sink;
          },
        );
      };
      const store = new RelayModernStore(RelayRecordSource.create());
      const multiActorEnvironment = new MultiActorEnvironment({
        createNetworkForActor: _actorID => RelayNetwork.create(fetch),
        createStoreForActor: _actorID => store,
        getDataID,
      });
      return environmentType === 'MultiActorEnvironment'
        ? multiActorEnvironment.forActor(getActorIdentifier('actor:1234'))
        : new RelayModernEnvironment({
            network: RelayNetwork.create(fetch),
            store,
            getDataID,
          });
    };

    describe(environmentType, () => {
      beforeEach(() => {
        complete = jest.fn<[], unknown>();
        error = jest.fn<[Error], unknown>();
        next = jest.fn<[GraphQLResponse], unknown>();
        callbacks = {complete, error, next};
        environment = createEnvironment();
      });

      it('processes a chunk for a fragment deferred at the query root', () => {
        const query = graphql`
          query RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootQuery {
            viewer {
              isFbEmployee
            }
            ...RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootFragment
              @dangerously_unaliased_fixme
              @defer(label: "RootFragment")
          }
        `;
        const fragment = graphql`
          fragment RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootFragment on Query {
            viewer {
              primaryEmail
            }
          }
        `;
        const operation = createOperationDescriptor(query, {});
        const selector = createReaderSelector(
          fragment,
          ROOT_ID,
          {},
          operation.request,
        );

        environment.execute({operation}).subscribe(callbacks);
        // The placeholder for the root fragment registers at path [] — the
        // empty prefix — while its chunks arrive at ['viewer', ...].
        dataSource.next({
          data: {viewer: {isFbEmployee: false}},
        });
        jest.runAllTimers();
        next.mockClear();

        dataSource.next({
          data: {primaryEmail: 'alice@example.com'},
          label:
            'RelayModernEnvironmentExecuteWithDeferAtQueryRootTestRootQuery$defer$RootFragment',
          path: ['viewer'],
        });

        expect(complete).toBeCalledTimes(0);
        expect(error).toBeCalledTimes(0);
        const snapshot = environment.lookup(selector);
        expect(snapshot.isMissingData).toBe(false);
        expect(snapshot.data).toEqual({
          viewer: {primaryEmail: 'alice@example.com'},
        });
      });

      it('keeps the record identity stable when a deduplicated chunk omits the fields getDataID derives it from', () => {
        // Mirrors defaultGetDataID's Viewer special case for schemas whose
        // Viewer carries a real identity: identity comes from the payload
        // when present, and falls back to a constant when it is not.
        const getDataID = (fieldValue: $FlowFixMe, typeName: string) => {
          if (typeName === 'Viewer') {
            return (
              fieldValue.id ??
              (fieldValue.primaryEmail != null
                ? `viewer-${String(fieldValue.primaryEmail)}`
                : 'viewer-fallback')
            );
          }
          return fieldValue.id;
        };
        environment = createEnvironment(getDataID);

        const query = graphql`
          query RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerQuery {
            viewer {
              primaryEmail
            }
            ...RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerFragment
              @dangerously_unaliased_fixme
              @defer(label: "ViewerFragment")
          }
        `;
        const fragment = graphql`
          fragment RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerFragment on Query {
            viewer {
              isFbEmployee
            }
          }
        `;
        const operation = createOperationDescriptor(query, {});
        const selector = createReaderSelector(
          fragment,
          ROOT_ID,
          {},
          operation.request,
        );

        environment.execute({operation}).subscribe(callbacks);
        dataSource.next({
          data: {viewer: {primaryEmail: 'alice@example.com'}},
        });
        jest.runAllTimers();
        next.mockClear();

        // The server dedupes already-delivered fields, so the chunk carries
        // neither `id` nor `primaryEmail`. Re-deriving identity from the
        // partial payload would answer the fallback constant, repointing the
        // root's viewer link away from the record the initial payload
        // created — stranding the chunk's fields and leaving the operation
        // permanently incomplete, which store-or-network readers answer by
        // refetching. Injecting the store's id keeps identity stable.
        dataSource.next({
          data: {isFbEmployee: true},
          label:
            'RelayModernEnvironmentExecuteWithDeferAtQueryRootTestViewerQuery$defer$ViewerFragment',
          path: ['viewer'],
        });

        expect(complete).toBeCalledTimes(0);
        expect(error).toBeCalledTimes(0);
        const snapshot = environment.lookup(selector);
        expect(snapshot.isMissingData).toBe(false);
        expect(snapshot.data).toEqual({viewer: {isFbEmployee: true}});
        const querySnapshot = environment.lookup(operation.fragment);
        expect(querySnapshot.isMissingData).toBe(false);
        expect((querySnapshot.data as $FlowFixMe).viewer.primaryEmail).toBe(
          'alice@example.com',
        );
        expect(environment.check(operation).status).toBe('available');
      });

      it('lands a root-deferred chunk addressed two links down on the linked records', () => {
        const query = graphql`
          query RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountQuery {
            viewer {
              account_user {
                id
              }
            }
            ...RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountFragment
              @dangerously_unaliased_fixme
              @defer(label: "AccountFragment")
          }
        `;
        const fragment = graphql`
          fragment RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountFragment on Query {
            viewer {
              account_user {
                name
              }
            }
          }
        `;
        const operation = createOperationDescriptor(query, {});
        const selector = createReaderSelector(
          fragment,
          ROOT_ID,
          {},
          operation.request,
        );

        environment.execute({operation}).subscribe(callbacks);
        dataSource.next({
          data: {
            viewer: {
              account_user: {id: '100'},
            },
          },
        });
        jest.runAllTimers();
        next.mockClear();

        dataSource.next({
          data: {name: 'Alice'},
          label:
            'RelayModernEnvironmentExecuteWithDeferAtQueryRootTestAccountQuery$defer$AccountFragment',
          path: ['viewer', 'account_user'],
        });

        expect(complete).toBeCalledTimes(0);
        expect(error).toBeCalledTimes(0);
        const snapshot = environment.lookup(selector);
        expect(snapshot.isMissingData).toBe(false);
        expect(snapshot.data).toEqual({
          viewer: {account_user: {name: 'Alice'}},
        });
        expect(environment.check(operation).status).toBe('available');
      });
    });
  },
);

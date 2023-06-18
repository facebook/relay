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
import type {
  GraphQLResponse,
  LogRequestInfoFunction,
  UploadableMap,
} from '../../network/RelayNetworkTypes';
import type {ObservableFromValue} from '../../network/RelayObservable';
import type {RequestParameters} from '../../util/RelayConcreteNode';
import type {CacheConfig, Variables} from '../../util/RelayRuntimeTypes';
import type {Snapshot} from '../RelayStoreTypes';

const {
  MultiActorEnvironment,
  getActorIdentifier,
} = require('../../multi-actor-environment');
const RelayNetwork = require('../../network/RelayNetwork');
const {graphql} = require('../../query/GraphQLTag');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {createReaderSelector} = require('../RelayModernSelector');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

describe.each(['RelayModernEnvironment', 'MultiActorEnvironment'])(
  'commitUpdate()',
  environmentType => {
    let environment;
    let operation;
    let ParentQuery;
    let source;
    let store;
    let UserFragment;

    describe(environmentType, () => {
      beforeEach(() => {
        ParentQuery = graphql`
          query RelayModernEnvironmentCommitUpdateTestParentQuery {
            me {
              id
              name
            }
          }
        `;
        UserFragment = graphql`
          fragment RelayModernEnvironmentCommitUpdateTestUserFragment on User {
            id
            name
          }
        `;

        source = RelayRecordSource.create();
        store = new RelayModernStore(source);
        const fetch = jest.fn<
          [
            RequestParameters,
            Variables,
            CacheConfig,
            ?UploadableMap,
            ?LogRequestInfoFunction,
          ],
          ObservableFromValue<GraphQLResponse>,
        >();
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
        operation = createOperationDescriptor(ParentQuery, {});
      });

      it('applies the update to the store', () => {
        const selector = createReaderSelector(
          UserFragment,
          '4',
          {},
          operation.request,
        );
        const callback = jest.fn<[Snapshot], void>();
        const snapshot = environment.lookup(selector);
        environment.subscribe(snapshot, callback);

        environment.commitUpdate(proxyStore => {
          const zuck = proxyStore.create('4', 'User');
          zuck.setValue('4', 'id');
          zuck.setValue('zuck', 'name');
        });
        expect(callback.mock.calls.length).toBe(1);
        expect(callback.mock.calls[0][0].data).toEqual({
          id: '4',
          name: 'zuck',
        });
      });

      describe('when using a scheduler', () => {
        let taskID;
        let tasks;
        let scheduler;
        let runTask;

        beforeEach(() => {
          taskID = 0;
          tasks = new Map<string, () => void>();
          scheduler = {
            cancel: (id: string) => {
              tasks.delete(id);
            },
            schedule: (task: () => void) => {
              const id = String(taskID++);
              tasks.set(id, task);
              return id;
            },
          };
          runTask = () => {
            for (const [id, task] of tasks) {
              tasks.delete(id);
              task();
              break;
            }
          };
          environment = new RelayModernEnvironment({
            network: RelayNetwork.create(jest.fn()),
            scheduler,
            store,
          });
        });

        it('applies the mutation to the store', () => {
          const selector = createReaderSelector(
            UserFragment,
            '4',
            {},
            operation.request,
          );
          const callback = jest.fn<[Snapshot], void>();
          const snapshot = environment.lookup(selector);
          environment.subscribe(snapshot, callback);

          environment.commitUpdate(proxyStore => {
            const zuck = proxyStore.create('4', 'User');
            zuck.setValue('4', 'id');
            zuck.setValue('zuck', 'name');
          });

          // Verify task was scheduled and run it
          expect(tasks.size).toBe(1);
          runTask();

          // Update is applied after scheduler runs scheduled tas
          expect(callback.mock.calls.length).toBe(1);
          expect(callback.mock.calls[0][0].data).toEqual({
            id: '4',
            name: 'zuck',
          });
        });
      });
    });
  },
);

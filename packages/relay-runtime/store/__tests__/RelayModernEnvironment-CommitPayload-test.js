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
const {getFragment, getRequest, graphql} = require('../../query/GraphQLTag');
const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {createReaderSelector} = require('../RelayModernSelector');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const {
  disallowWarnings,
  expectWarningWillFire,
} = require('relay-test-utils-internal');

disallowWarnings();

const ActorQuery = getRequest(graphql`
  query RelayModernEnvironmentCommitPayloadTestActorQuery {
    me {
      name
    }
  }
`);

describe.each(['RelayModernEnvironment', 'MultiActorEnvironment'])(
  'CommitPayload',
  environmentType => {
    let environment;
    let operation;
    let source;
    let store;
    describe(environmentType, () => {
      beforeEach(() => {
        operation = createOperationDescriptor(ActorQuery, {});
        source = RelayRecordSource.create();
        store = new RelayModernStore(source);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        (store: $FlowFixMe).notify = jest.fn(store.notify.bind(store));
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        (store: $FlowFixMe).publish = jest.fn(store.publish.bind(store));
        const fetch = jest.fn();
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

      it('applies server updates', () => {
        const callback = jest.fn();
        const snapshot = environment.lookup(operation.fragment);
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

      it('does not fill missing fields from server updates with null when treatMissingFieldsAsNull is disabled (default)', () => {
        const query = getRequest(graphql`
          query RelayModernEnvironmentCommitPayloadTest2ActorQuery {
            me {
              name
              birthdate {
                day
                month
                year
              }
            }
          }
        `);
        operation = createOperationDescriptor(query, {});
        const callback = jest.fn();
        const snapshot = environment.lookup(operation.fragment);
        environment.subscribe(snapshot, callback);

        expectWarningWillFire(
          'RelayResponseNormalizer: Payload did not contain a value for field `birthdate: birthdate`. Check that you are parsing with the same query that was used to fetch the payload.',
        );
        environment.commitPayload(operation, {
          me: {
            id: '4',
            __typename: 'User',
            name: 'Zuck',
            // birthdate is missing in this response
          },
        });
        expect(callback.mock.calls.length).toBe(1);
        expect(callback.mock.calls[0][0].data).toEqual({
          me: {
            name: 'Zuck',
            birthdate: undefined, // with treatMissingFieldsAsNull disabled this is left missing
          },
        });
        // and thus the snapshot has missing data
        expect(callback.mock.calls[0][0].isMissingData).toEqual(true);
      });

      it('fills missing fields from server updates with null when treatMissingFieldsAsNull is enabled', () => {
        environment = new RelayModernEnvironment({
          network: RelayNetwork.create(jest.fn()),
          store,
          treatMissingFieldsAsNull: true,
        });

        const query = getRequest(graphql`
          query RelayModernEnvironmentCommitPayloadTest3ActorQuery {
            me {
              name
              birthdate {
                day
                month
                year
              }
            }
          }
        `);
        operation = createOperationDescriptor(query, {});
        const callback = jest.fn();
        const snapshot = environment.lookup(operation.fragment);
        environment.subscribe(snapshot, callback);

        environment.commitPayload(operation, {
          me: {
            id: '4',
            __typename: 'User',
            name: 'Zuck',
            // birthdate is missing in this response
          },
        });
        expect(callback.mock.calls.length).toBe(1);
        expect(callback.mock.calls[0][0].data).toEqual({
          me: {
            name: 'Zuck',
            birthdate: null, // with treatMissingFieldsAsNull enabled this is filled with null
          },
        });
        // and thus the snapshot does not have missing data
        expect(callback.mock.calls[0][0].isMissingData).toEqual(false);
      });

      it('rebases optimistic updates', () => {
        const callback = jest.fn();
        const snapshot = environment.lookup(operation.fragment);
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

      it('applies payload on @defer fragments', () => {
        const id = '4';
        const query = getRequest(graphql`
          query RelayModernEnvironmentCommitPayloadTest4ActorQuery {
            me {
              name
              ...RelayModernEnvironmentCommitPayloadTest4UserFragment @defer
            }
          }
        `);
        const fragment = getFragment(graphql`
          fragment RelayModernEnvironmentCommitPayloadTest4UserFragment on User {
            username
          }
        `);
        operation = createOperationDescriptor(query, {});

        const selector = createReaderSelector(
          fragment,
          id,
          {},
          operation.request,
        );

        const queryCallback = jest.fn();
        const fragmentCallback = jest.fn();
        const querySnapshot = environment.lookup(operation.fragment);
        const fragmentSnapshot = environment.lookup(selector);
        environment.subscribe(querySnapshot, queryCallback);
        environment.subscribe(fragmentSnapshot, fragmentCallback);
        expect(queryCallback.mock.calls.length).toBe(0);
        expect(fragmentCallback.mock.calls.length).toBe(0);
        environment.commitPayload(operation, {
          me: {
            id,
            __typename: 'User',
            name: 'Zuck',
            username: 'Zucc',
          },
        });
        expect(queryCallback.mock.calls.length).toBe(1);
        expect(queryCallback.mock.calls[0][0].data).toEqual({
          me: {
            name: 'Zuck',
            __id: id,
            __fragments: {
              RelayModernEnvironmentCommitPayloadTest4UserFragment: {},
            },
            __fragmentOwner: operation.request,
            __isWithinUnmatchedTypeRefinement: false,
          },
        });
        expect(fragmentCallback.mock.calls.length).toBe(1);
        expect(fragmentCallback.mock.calls[0][0].data).toEqual({
          username: 'Zucc',
        });
      });

      it('applies payload on @defer fragments in a query with modules', () => {
        const id = '4';
        const query = getRequest(graphql`
          query RelayModernEnvironmentCommitPayloadTest6ActorQuery {
            me {
              name
              nameRenderer {
                ...RelayModernEnvironmentCommitPayloadTest6MarkdownUserNameRenderer_name
                  @module(name: "MarkdownUserNameRenderer.react")
              }
              ...RelayModernEnvironmentCommitPayloadTest6UserFragment @defer
            }
          }
        `);
        const nameFragmentNormalizationNode = require('./__generated__/RelayModernEnvironmentCommitPayloadTest6MarkdownUserNameRenderer_name$normalization.graphql');
        graphql`
          fragment RelayModernEnvironmentCommitPayloadTest6MarkdownUserNameRenderer_name on MarkdownUserNameRenderer {
            __typename
            markdown
          }
        `;
        const userFragment = getFragment(graphql`
          fragment RelayModernEnvironmentCommitPayloadTest6UserFragment on User {
            username
          }
        `);

        environment = new RelayModernEnvironment({
          network: RelayNetwork.create(jest.fn()),
          store,
          operationLoader: {
            get: () => {
              return nameFragmentNormalizationNode;
            },
            load: jest.fn(),
          },
        });

        operation = createOperationDescriptor(query, {});

        const selector = createReaderSelector(
          userFragment,
          id,
          {},
          operation.request,
        );

        const queryCallback = jest.fn();
        const fragmentCallback = jest.fn();
        const querySnapshot = environment.lookup(operation.fragment);
        const fragmentSnapshot = environment.lookup(selector);
        environment.subscribe(querySnapshot, queryCallback);
        environment.subscribe(fragmentSnapshot, fragmentCallback);
        expect(queryCallback.mock.calls.length).toBe(0);
        expect(fragmentCallback.mock.calls.length).toBe(0);
        environment.commitPayload(operation, {
          me: {
            id,
            __typename: 'User',
            nameRenderer: {
              __typename: 'MarkdownUserNameRenderer',
              __module_component_RelayModernEnvironmentCommitPayloadTest6ActorQuery:
                'MarkdownUserNameRenderer.react',
              __module_operation_RelayModernEnvironmentCommitPayloadTest6ActorQuery:
                'RelayModernEnvironmentCommitPayloadTest6MarkdownUserNameRenderer_name$normalization.graphql',
              markdown: 'markdown payload',
            },
            name: 'Zuck',
            username: 'Zucc',
          },
        });
        expect(queryCallback.mock.calls.length).toBe(1);
        expect(fragmentCallback.mock.calls.length).toBe(1);
        expect(fragmentCallback.mock.calls[0][0].data).toEqual({
          username: 'Zucc',
        });
      });

      describe('when using a scheduler', () => {
        let taskID;
        let tasks;
        let scheduler;
        let runTask;

        beforeEach(() => {
          taskID = 0;
          tasks = new Map();
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

        it('applies server updates', () => {
          const callback = jest.fn();
          const snapshot = environment.lookup(operation.fragment);
          environment.subscribe(snapshot, callback);

          environment.commitPayload(operation, {
            me: {
              id: '4',
              __typename: 'User',
              name: 'Zuck',
            },
          });
          // Verify task was scheduled and run it
          expect(tasks.size).toBe(1);
          runTask();
          expect(callback.mock.calls.length).toBe(1);
          expect(callback.mock.calls[0][0].data).toEqual({
            me: {
              name: 'Zuck',
            },
          });
        });
      });
    });
  },
);

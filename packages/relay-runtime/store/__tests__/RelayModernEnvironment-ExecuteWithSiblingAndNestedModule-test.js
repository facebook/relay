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

import type {NormalizationRootNode} from '../../util/NormalizationNode';

const {
  MultiActorEnvironment,
  getActorIdentifier,
} = require('../../multi-actor-environment');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const {getFragment, getRequest, graphql} = require('../../query/GraphQLTag');
const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {getSingularSelector} = require('../RelayModernSelector');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const nullthrows = require('nullthrows');
const {disallowWarnings} = require('relay-test-utils-internal');

disallowWarnings();

function runWithFeatureFlags(setFlags: (typeof RelayFeatureFlags) => void) {
  describe.each(['RelayModernEnvironment', 'MultiActorEnvironment'])(
    'execute() a query with nested @match',
    environmentType => {
      describe(environmentType, () => {
        let callbacks: {|
          +complete: JestMockFn<$ReadOnlyArray<mixed>, mixed>,
          +error: JestMockFn<$ReadOnlyArray<Error>, mixed>,
          +next: JestMockFn<$ReadOnlyArray<mixed>, mixed>,
          +start?: JestMockFn<$ReadOnlyArray<mixed>, mixed>,
          +unsubscribe?: JestMockFn<$ReadOnlyArray<mixed>, mixed>,
        |};
        let complete;
        let dataSource;
        let environment;
        let error;
        let fetch;
        let markdownRendererFragment;
        let markdownRendererNormalizationFragment;
        let next;
        let operation;
        let operationCallback;
        let operationLoader: {|
          get: (reference: mixed) => ?NormalizationRootNode,
          load: JestMockFn<
            $ReadOnlyArray<mixed>,
            Promise<?NormalizationRootNode>,
          >,
        |};
        let plaintextRendererFragment;
        let plaintextRendererNormalizationFragment;
        let query;
        let source;
        let store;
        let variables;
        let logger;
        let resolveFragments;

        beforeEach(() => {
          resolveFragments = [];
          setFlags(RelayFeatureFlags);
          markdownRendererNormalizationFragment = require('./__generated__/RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name$normalization.graphql');
          plaintextRendererNormalizationFragment = require('./__generated__/RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name$normalization.graphql');

          query = getRequest(graphql`
            query RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery(
              $id: ID!
            ) {
              node(id: $id) {
                ... on User {
                  outerRendererA: nameRenderer
                    @match(
                      key: "RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery_rendererA"
                    ) {
                    ...RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name
                      @module(name: "MarkdownUserNameRenderer.react")
                  }
                  outerRendererB: nameRenderer
                    @match(
                      key: "RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery_rendererB"
                    ) {
                    ...RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name
                      @module(name: "PlainTextUserNameRenderer.react")
                  }
                }
              }
            }
          `);

          markdownRendererFragment = getFragment(graphql`
            fragment RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {
              __typename
              markdown
              user {
                name
                innerRenderer: nameRenderer {
                  ...RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name
                    @module(name: "PlainUserNameRenderer.react")
                }
              }
            }
          `);

          plaintextRendererFragment = getFragment(graphql`
            fragment RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name on PlainUserNameRenderer {
              data {
                text
              }
              user {
                name
              }
            }
          `);
          variables = {id: '1'};
          operation = createOperationDescriptor(query, variables);

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
                resolveFragments.push(resolve);
              });
            }),
            get: jest.fn(),
          };
          source = RelayRecordSource.create();
          logger = jest.fn();
          store = new RelayModernStore(source, {
            log: logger,
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

        it('resolves sibling modules in one tick, and notifies once if the feature flag is on', () => {
          environment.execute({operation}).subscribe(callbacks);
          const payload = {
            data: {
              node: {
                id: '1',
                __typename: 'User',
                outerRendererA: {
                  __typename: 'MarkdownUserNameRenderer',
                  __module_component_RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery_rendererA:
                    'MarkdownUserNameRenderer.react',
                  __module_operation_RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery_rendererA:
                    'RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name$normalization.graphql',
                  markdown: 'markdown payload',
                  user: {
                    id: '2',
                    name: 'Mark',
                    innerRenderer: null,
                  },
                },
                outerRendererB: {
                  __typename: 'PlainUserNameRenderer',
                  __module_component_RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery_rendererB:
                    'PlainUserNameRenderer.react',
                  __module_operation_RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery_rendererB:
                    'RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name$normalization.graphql',
                  data: {
                    id: 'data-2',
                    text: 'plaintext!',
                  },
                  user: {
                    id: '2',
                    name: 'Zuck',
                  },
                },
              },
            },
          };
          dataSource.next(payload);
          jest.runAllTimers();
          next.mockClear();

          expect(operationLoader.load).toBeCalledTimes(2);
          expect(operationLoader.load.mock.calls[0][0]).toEqual(
            'RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name$normalization.graphql',
          );
          expect(operationLoader.load.mock.calls[1][0]).toEqual(
            'RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name$normalization.graphql',
          );

          expect(operationCallback).toBeCalledTimes(1);
          const operationSnapshot = operationCallback.mock.calls[0][0];
          const outerRendererASelector = nullthrows(
            getSingularSelector(
              markdownRendererFragment,
              (operationSnapshot.data?.node: any)?.outerRendererA,
            ),
          );
          const outerRendererASnapshot = environment.lookup(
            outerRendererASelector,
          );
          expect(outerRendererASnapshot.isMissingData).toBe(true);
          const outerRendererACallback = jest.fn();
          environment.subscribe(outerRendererASnapshot, outerRendererACallback);

          const outerRendererBSelector = nullthrows(
            getSingularSelector(
              plaintextRendererFragment,
              (operationSnapshot.data?.node: any)?.outerRendererB,
            ),
          );
          const outerRendererBSnapshot = environment.lookup(
            outerRendererBSelector,
          );
          expect(outerRendererBSnapshot.isMissingData).toBe(true);
          const outerRendererBCallback = jest.fn();
          environment.subscribe(outerRendererBSnapshot, outerRendererBCallback);

          logger.mockClear();
          resolveFragments[0](markdownRendererNormalizationFragment);
          resolveFragments[1](plaintextRendererNormalizationFragment);
          jest.runAllTimers();

          expect(operationCallback).toBeCalledTimes(1);
          expect(next).toBeCalledTimes(0);

          expect(outerRendererBCallback).toBeCalledTimes(1);
          const nextOuterRendererBSnapshot =
            outerRendererBCallback.mock.calls[0][0];
          expect(nextOuterRendererBSnapshot.isMissingData).toBe(false);
          expect(nextOuterRendererBSnapshot.data).toEqual({
            data: {
              text: 'plaintext!',
            },
            user: {
              name: 'Zuck',
            },
          });
          let nextOuterRendererASnapshot;
          // The store is notified once with the batching on
          if (RelayFeatureFlags.BATCH_ASYNC_MODULE_UPDATES_FN != null) {
            expect(outerRendererACallback).toBeCalledTimes(1);
            nextOuterRendererASnapshot =
              outerRendererACallback.mock.calls[0][0];
          } else {
            expect(outerRendererACallback).toBeCalledTimes(2);
            expect(outerRendererACallback.mock.calls[0][0].isMissingData).toBe(
              false,
            );
            expect(outerRendererACallback.mock.calls[0][0].data).toEqual({
              __typename: 'MarkdownUserNameRenderer',
              markdown: 'markdown payload',
              user: {
                innerRenderer: null,
                name: 'Mark',
              },
            });
            nextOuterRendererASnapshot =
              outerRendererACallback.mock.calls[1][0];
          }
          expect(nextOuterRendererASnapshot.isMissingData).toBe(false);
          expect(nextOuterRendererASnapshot.data).toEqual({
            __typename: 'MarkdownUserNameRenderer',
            markdown: 'markdown payload',
            user: {
              innerRenderer: null,
              name: 'Zuck',
            },
          });
        });

        it('resolves sibling and nested modules in one tick, and notifies once if the feature flag is on', () => {
          environment.execute({operation}).subscribe(callbacks);
          const payload = {
            data: {
              node: {
                id: '1',
                __typename: 'User',
                outerRendererA: {
                  __typename: 'MarkdownUserNameRenderer',
                  __module_component_RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery_rendererA:
                    'MarkdownUserNameRenderer.react',
                  __module_operation_RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery_rendererA:
                    'RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name$normalization.graphql',
                  markdown: 'markdown payload',
                  user: {
                    id: '2',
                    name: 'outerRendererA',
                    innerRenderer: {
                      __typename: 'PlainUserNameRenderer',
                      __module_component_RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name:
                        'PlainUserNameRenderer.react',
                      __module_operation_RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name:
                        'RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name$normalization.graphql',
                      data: {
                        id: 'data-inner',
                        text: 'plaintext-inner!',
                      },
                      user: {
                        id: '2',
                        name: 'innerRenderer',
                      },
                    },
                  },
                },
                outerRendererB: {
                  __typename: 'PlainUserNameRenderer',
                  __module_component_RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery_rendererB:
                    'PlainUserNameRenderer.react',
                  __module_operation_RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery_rendererB:
                    'RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name$normalization.graphql',
                  data: {
                    id: 'data-2',
                    text: 'plaintext!',
                  },
                  user: {
                    id: '2',
                    name: 'outerRendererB',
                  },
                },
              },
            },
          };
          dataSource.next(payload);
          jest.runAllTimers();
          next.mockClear();

          expect(operationLoader.load).toBeCalledTimes(2);
          expect(operationLoader.load.mock.calls[0][0]).toEqual(
            'RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name$normalization.graphql',
          );
          expect(operationLoader.load.mock.calls[1][0]).toEqual(
            'RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name$normalization.graphql',
          );

          expect(operationCallback).toBeCalledTimes(1);
          const operationSnapshot = operationCallback.mock.calls[0][0];
          const outerRendererASelector = nullthrows(
            getSingularSelector(
              markdownRendererFragment,
              (operationSnapshot.data?.node: any)?.outerRendererA,
            ),
          );
          const outerRendererASnapshot = environment.lookup(
            outerRendererASelector,
          );
          expect(outerRendererASnapshot.isMissingData).toBe(true);
          const outerRendererACallback = jest.fn();
          environment.subscribe(outerRendererASnapshot, outerRendererACallback);

          const outerRendererBSelector = nullthrows(
            getSingularSelector(
              plaintextRendererFragment,
              (operationSnapshot.data?.node: any)?.outerRendererB,
            ),
          );
          const outerRendererBSnapshot = environment.lookup(
            outerRendererBSelector,
          );
          expect(outerRendererBSnapshot.isMissingData).toBe(true);
          const outerRendererBCallback = jest.fn();
          environment.subscribe(outerRendererBSnapshot, outerRendererBCallback);

          logger.mockClear();
          resolveFragments[0](markdownRendererNormalizationFragment);
          resolveFragments[1](plaintextRendererNormalizationFragment);
          jest.runAllImmediates();
          resolveFragments[2](plaintextRendererNormalizationFragment);
          jest.runAllTimers();

          expect(operationCallback).toBeCalledTimes(1);
          expect(next).toBeCalledTimes(0);
          let nextOuterRendererASnapshot;
          let nextOuterRendererBSnapshot;
          if (RelayFeatureFlags.BATCH_ASYNC_MODULE_UPDATES_FN != null) {
            expect(outerRendererACallback).toBeCalledTimes(1);
            expect(outerRendererBCallback).toBeCalledTimes(1);
            nextOuterRendererASnapshot =
              outerRendererACallback.mock.calls[0][0];
            nextOuterRendererBSnapshot =
              outerRendererBCallback.mock.calls[0][0];
          } else {
            expect(outerRendererACallback).toBeCalledTimes(3);
            expect(outerRendererBCallback).toBeCalledTimes(2);
            nextOuterRendererASnapshot =
              outerRendererACallback.mock.calls[2][0];
            nextOuterRendererBSnapshot =
              outerRendererBCallback.mock.calls[1][0];
            expect(outerRendererBCallback.mock.calls[0][0].data).toEqual({
              data: {
                text: 'plaintext!',
              },
              user: {
                name: 'outerRendererB',
              },
            });
          }
          expect(nextOuterRendererASnapshot.isMissingData).toBe(false);
          expect(nextOuterRendererASnapshot.data).toEqual({
            __typename: 'MarkdownUserNameRenderer',
            markdown: 'markdown payload',
            user: {
              innerRenderer: {
                __fragmentOwner: operation.request,
                __isWithinUnmatchedTypeRefinement: false,
                __fragmentPropName: 'name',
                __fragments: {
                  RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name:
                    {},
                },
                __id: 'client:2:nameRenderer',
                __module_component: 'PlainUserNameRenderer.react',
              },
              name: 'innerRenderer',
            },
          });
          expect(nextOuterRendererBSnapshot.isMissingData).toBe(false);
          expect(nextOuterRendererBSnapshot.data).toEqual({
            data: {
              text: 'plaintext!',
            },
            user: {
              name: 'innerRenderer',
            },
          });
          const innerSelector = nullthrows(
            getSingularSelector(
              plaintextRendererFragment,
              (nextOuterRendererASnapshot.data?.user: $FlowFixMe)
                ?.innerRenderer,
            ),
          );
          const innerSnapshot = environment.lookup(innerSelector);
          expect(innerSnapshot.isMissingData).toBe(false);
          expect(innerSnapshot.data).toEqual({
            data: {
              text: 'plaintext-inner!',
            },
            user: {
              name: 'innerRenderer',
            },
          });
        });

        it('calls complete only after modules are resolved and published', () => {
          environment.execute({operation}).subscribe(callbacks);
          const payload = {
            data: {
              node: {
                id: '1',
                __typename: 'User',
                outerRendererA: {
                  __typename: 'MarkdownUserNameRenderer',
                  __module_component_RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery_rendererA:
                    'MarkdownUserNameRenderer.react',
                  __module_operation_RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery_rendererA:
                    'RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name$normalization.graphql',
                  markdown: 'markdown payload',
                  user: {
                    id: '2',
                    name: 'outerRendererA',
                    innerRenderer: {
                      __typename: 'MarkdownUserNameRenderer',
                    },
                  },
                },
                outerRendererB: {
                  __typename: 'PlainUserNameRenderer',
                  __module_component_RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery_rendererB:
                    'PlainUserNameRenderer.react',
                  __module_operation_RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery_rendererB:
                    'RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name$normalization.graphql',
                  data: {
                    id: 'data-2',
                    text: 'plaintext!',
                  },
                  user: {
                    id: '2',
                    name: 'outerRendererB',
                  },
                },
              },
            },
          };
          dataSource.next(payload);
          jest.runAllTimers();
          next.mockClear();

          dataSource.complete();
          jest.runAllImmediates();
          expect(next).toBeCalledTimes(0);
          expect(error).toBeCalledTimes(0);
          expect(complete).toBeCalledTimes(0);

          resolveFragments[0](markdownRendererNormalizationFragment);
          resolveFragments[1](plaintextRendererNormalizationFragment);
          if (RelayFeatureFlags.BATCH_ASYNC_MODULE_UPDATES_FN != null) {
            // Resolve fragments but not publish
            jest.runAllImmediates();
            expect(
              environment
                .getOperationTracker()
                .getPendingOperationsAffectingOwner(operation.request),
            ).not.toBe(null);
            expect(complete).toBeCalledTimes(0);
            // Publish to store
            jest.runAllTimers();
            expect(complete).toBeCalledTimes(1);
            expect(
              environment
                .getOperationTracker()
                .getPendingOperationsAffectingOwner(operation.request),
            ).toBe(null);
          } else {
            expect(
              environment
                .getOperationTracker()
                .getPendingOperationsAffectingOwner(operation.request),
            ).not.toBe(null);
            jest.runAllImmediates();
            expect(complete).toBeCalledTimes(1);
            expect(
              environment
                .getOperationTracker()
                .getPendingOperationsAffectingOwner(operation.request),
            ).toBe(null);
          }
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
                outerRendererA: {
                  __typename: 'MarkdownUserNameRenderer',
                  __module_component_RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery_rendererA:
                    'MarkdownUserNameRenderer.react',
                  __module_operation_RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery_rendererA:
                    'RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name$normalization.graphql',
                  markdown: 'markdown payload',
                  user: {
                    id: '2',
                    name: 'outerRendererA',
                    innerRenderer: {
                      __typename: 'MarkdownUserNameRenderer',
                    },
                  },
                },
                outerRendererB: {
                  __typename: 'PlainUserNameRenderer',
                  __module_component_RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery_rendererB:
                    'PlainUserNameRenderer.react',
                  __module_operation_RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestUserQuery_rendererB:
                    'RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name$normalization.graphql',
                  data: {
                    id: 'data-2',
                    text: 'plaintext!',
                  },
                  user: {
                    id: '2',
                    name: 'outerRendererB',
                  },
                },
              },
            },
          };
          dataSource.next(payload);
          jest.runAllTimers();
          const operationSnapshot = operationCallback.mock.calls[0][0];
          const outerRendererASelector = nullthrows(
            getSingularSelector(
              markdownRendererFragment,
              (operationSnapshot.data?.node: any)?.outerRendererA,
            ),
          );
          const outerRendererASnapshot = environment.lookup(
            outerRendererASelector,
          );
          expect(outerRendererASnapshot.isMissingData).toBe(true);
          const outerRendererACallback = jest.fn();
          environment.subscribe(outerRendererASnapshot, outerRendererACallback);

          next.mockClear();
          dataSource.complete();
          jest.runAllImmediates();
          expect(next).toBeCalledTimes(0);
          expect(error).toBeCalledTimes(0);
          expect(complete).toBeCalledTimes(0);

          resolveFragments[0](markdownRendererNormalizationFragment);
          resolveFragments[1](plaintextRendererNormalizationFragment);
          if (RelayFeatureFlags.BATCH_ASYNC_MODULE_UPDATES_FN != null) {
            jest.runAllImmediates();
            subscription.unsubscribe();
            jest.runAllTimers();
          } else {
            subscription.unsubscribe();
            jest.runAllImmediates();
          }
          expect(outerRendererACallback).toBeCalledTimes(0);
        });
      });
    },
  );
}

runWithFeatureFlags(flags => {
  flags.BATCH_ASYNC_MODULE_UPDATES_FN = null;
});

runWithFeatureFlags(flags => {
  flags.BATCH_ASYNC_MODULE_UPDATES_FN = task => {
    const handle = setTimeout(task, 0);
    return {
      dispose: () => clearTimeout(handle),
    };
  };
});

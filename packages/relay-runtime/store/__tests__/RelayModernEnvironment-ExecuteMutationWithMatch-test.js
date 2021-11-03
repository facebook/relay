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
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {
  createReaderSelector,
  getSingularSelector,
} = require('../RelayModernSelector');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const nullthrows = require('nullthrows');
const {
  disallowWarnings,
  expectWarningWillFire,
} = require('relay-test-utils-internal');

disallowWarnings();

const commentID = '1';

describe.each(['RelayModernEnvironment', 'MultiActorEnvironment'])(
  'executeMutation() with @match',
  environmentType => {
    let callbacks;
    let commentFragment;
    let complete;
    let dataSource;
    let environment;
    let error;
    let fetch;
    let fragmentCallback;
    let markdownRendererFragment;
    let markdownRendererNormalizationFragment;
    let mutation;
    let next;
    let operation;
    let commentQuery;
    let queryOperation;
    let operationCallback;
    let operationLoader: {|
      get: JestMockFn<$ReadOnlyArray<mixed>, ?NormalizationRootNode>,
      load: JestMockFn<$ReadOnlyArray<mixed>, Promise<?NormalizationRootNode>>,
    |};
    let resolveFragment;
    let source;
    let store;
    let variables;
    let queryVariables;

    describe(environmentType, () => {
      beforeEach(() => {
        markdownRendererNormalizationFragment = require('./__generated__/RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$normalization.graphql');

        mutation = getRequest(graphql`
          mutation RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation(
            $input: CommentCreateInput!
          ) {
            commentCreate(input: $input) {
              comment {
                actor {
                  name
                  nameRenderer @match {
                    ...RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name
                      @module(name: "PlainUserNameRenderer.react")
                    ...RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name
                      @module(name: "MarkdownUserNameRenderer.react")
                  }
                }
              }
            }
          }
        `);

        graphql`
          fragment RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name on PlainUserNameRenderer {
            plaintext
            data {
              text
            }
          }
        `;

        markdownRendererFragment = getFragment(graphql`
          fragment RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {
            __typename
            markdown
            data {
              markup @__clientField(handle: "markup_handler")
            }
          }
        `);

        commentFragment = getFragment(graphql`
          fragment RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment on Comment {
            id
            actor {
              name
              nameRenderer @match {
                ...RelayModernEnvironmentExecuteMutationWithMatchTestPlainUserNameRenderer_name
                  @module(name: "PlainUserNameRenderer.react")
                ...RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name
                  @module(name: "MarkdownUserNameRenderer.react")
              }
            }
          }
        `);

        commentQuery = getRequest(graphql`
          query RelayModernEnvironmentExecuteMutationWithMatchTestCommentQuery(
            $id: ID!
          ) {
            node(id: $id) {
              id
              ...RelayModernEnvironmentExecuteMutationWithMatchTestCommentFragment
            }
          }
        `);

        variables = {
          input: {
            clientMutationId: '0',
            feedbackId: '1',
          },
        };
        queryVariables = {
          id: commentID,
        };
        operation = createOperationDescriptor(mutation, variables);
        queryOperation = createOperationDescriptor(
          commentQuery,
          queryVariables,
        );

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
        source = RelayRecordSource.create();
        store = new RelayModernStore(source);

        const multiActorEnvironment = new MultiActorEnvironment({
          createNetworkForActor: _actorID => RelayNetwork.create(fetch),
          createStoreForActor: _actorID => store,
          operationLoader,
          handlerProvider: name => {
            switch (name) {
              case 'markup_handler':
                return MarkupHandler;
            }
          },
        });
        environment =
          environmentType === 'MultiActorEnvironment'
            ? multiActorEnvironment.forActor(getActorIdentifier('actor:1234'))
            : new RelayModernEnvironment({
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

        const selector = createReaderSelector(
          commentFragment,
          commentID,
          {},
          queryOperation.request,
        );
        const fragmentSnapshot = environment.lookup(selector);
        fragmentCallback = jest.fn();
        environment.subscribe(fragmentSnapshot, fragmentCallback);
        const operationSnapshot = environment.lookup(operation.fragment);
        operationCallback = jest.fn();
        environment.subscribe(operationSnapshot, operationCallback);
      });

      it('executes the optimistic updater immediately, does not mark the mutation as being in flight in the operation tracker', () => {
        environment
          .executeMutation({
            operation,
            optimisticUpdater: _store => {
              const comment = _store.create(commentID, 'Comment');
              comment.setValue(commentID, 'id');
              const actor = _store.create('4', 'User');
              comment.setLinkedRecord(actor, 'actor');
              actor.setValue('optimistic-name', 'name');
            },
          })
          .subscribe(callbacks);
        expect(complete).not.toBeCalled();
        expect(error).not.toBeCalled();
        expect(fragmentCallback.mock.calls.length).toBe(1);
        expect(fragmentCallback.mock.calls[0][0].data).toEqual({
          id: commentID,
          actor: {
            name: 'optimistic-name',
            nameRenderer: undefined,
          },
        });

        // The mutation affecting the query should not be marked as in flight yet
        expect(
          environment
            .getOperationTracker()
            .getPendingOperationsAffectingOwner(queryOperation.request),
        ).toBe(null);
      });

      it('calls next() and publishes the initial payload to the store', () => {
        environment.executeMutation({operation}).subscribe(callbacks);
        const payload = {
          data: {
            commentCreate: {
              comment: {
                id: commentID,
                actor: {
                  id: '4',
                  name: 'actor-name',
                  __typename: 'User',
                  nameRenderer: {
                    __typename: 'MarkdownUserNameRenderer',
                    __module_component_RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation:
                      'MarkdownUserNameRenderer.react',
                    __module_operation_RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation:
                      'RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$normalization.graphql',
                    markdown: 'markdown payload',
                    data: {
                      markup: '<markup/>', // server data is lowercase
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
                name: 'actor-name',
                nameRenderer: {
                  __id: 'client:4:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
                  __fragmentPropName: 'name',
                  __fragments: {
                    RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name:
                      {},
                  },
                  __fragmentOwner: operation.request,
                  __isWithinUnmatchedTypeRefinement: false,
                  __module_component: 'MarkdownUserNameRenderer.react',
                },
              },
            },
          },
        });

        expect(fragmentCallback).toBeCalledTimes(1);
        const fragmentSnapshot = fragmentCallback.mock.calls[0][0];
        // data is missing since match field data hasn't been processed yet
        expect(fragmentSnapshot.isMissingData).toBe(true);
        expect(fragmentSnapshot.data).toEqual({
          id: commentID,
          actor: {
            name: 'actor-name',
            nameRenderer: {},
          },
        });

        const matchSelector = nullthrows(
          getSingularSelector(
            markdownRendererFragment,
            (operationSnapshot.data: any)?.commentCreate?.comment?.actor
              ?.nameRenderer,
          ),
        );
        const matchSnapshot = environment.lookup(matchSelector);
        // ref exists but match field data hasn't been processed yet
        expect(matchSnapshot.isMissingData).toBe(true);
        expect(matchSnapshot.data).toEqual({
          __typename: 'MarkdownUserNameRenderer',
          data: undefined,
          markdown: undefined,
        });

        // The mutation affecting the query should be marked as in flight now
        expect(
          environment
            .getOperationTracker()
            .getPendingOperationsAffectingOwner(queryOperation.request),
        ).not.toBe(null);
      });

      it('loads the @match fragment and normalizes/publishes the field payload', () => {
        environment.executeMutation({operation}).subscribe(callbacks);
        const payload = {
          data: {
            commentCreate: {
              comment: {
                id: commentID,
                actor: {
                  id: '4',
                  name: 'actor-name',
                  __typename: 'User',
                  nameRenderer: {
                    __typename: 'MarkdownUserNameRenderer',
                    __module_component_RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation:
                      'MarkdownUserNameRenderer.react',
                    __module_operation_RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation:
                      'RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$normalization.graphql',
                    markdown: 'markdown payload',
                    data: {
                      id: 'data-1',
                      markup: '<markup/>', // server data is lowercase
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
          'RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$normalization.graphql',
        );

        expect(operationCallback).toBeCalledTimes(1);
        // result tested above
        const operationSnapshot = operationCallback.mock.calls[0][0];
        operationCallback.mockClear();

        const matchSelector = nullthrows(
          getSingularSelector(
            markdownRendererFragment,
            (operationSnapshot.data: any)?.commentCreate?.comment?.actor
              ?.nameRenderer,
          ),
        );
        const initialMatchSnapshot = environment.lookup(matchSelector);
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

        // The mutation affecting the query should still be marked as in flight
        expect(
          environment
            .getOperationTracker()
            .getPendingOperationsAffectingOwner(queryOperation.request),
        ).not.toBe(null);
      });

      it('calls complete() only after match payloads are processed (network completes first)', () => {
        environment.executeMutation({operation}).subscribe(callbacks);
        const payload = {
          data: {
            commentCreate: {
              comment: {
                id: commentID,
                actor: {
                  id: '4',
                  name: 'actor-name',
                  __typename: 'User',
                  nameRenderer: {
                    __typename: 'MarkdownUserNameRenderer',
                    __module_component_RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation:
                      'MarkdownUserNameRenderer.react',
                    __module_operation_RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation:
                      'RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$normalization.graphql',
                    markdown: 'markdown payload',
                    data: {
                      id: 'data-1',
                      markup: '<markup/>', // server data is lowercase
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

        // The mutation affecting the query should still be in flight
        // even if the network completed, since we're waiting for a 3d payload
        expect(
          environment
            .getOperationTracker()
            .getPendingOperationsAffectingOwner(queryOperation.request),
        ).not.toBe(null);

        expect(operationLoader.load).toBeCalledTimes(1);
        expect(operationLoader.load.mock.calls[0][0]).toEqual(
          'RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$normalization.graphql',
        );
        resolveFragment(markdownRendererNormalizationFragment);
        jest.runAllTimers();

        expect(complete).toBeCalledTimes(1);
        expect(error).toBeCalledTimes(0);
        expect(next).toBeCalledTimes(1);

        // The mutation affecting the query should no longer be in flight
        expect(
          environment
            .getOperationTracker()
            .getPendingOperationsAffectingOwner(queryOperation.request),
        ).toBe(null);
      });

      it('calls complete() only after match payloads are processed (network completes last)', () => {
        environment.executeMutation({operation}).subscribe(callbacks);
        const payload = {
          data: {
            commentCreate: {
              comment: {
                id: commentID,
                actor: {
                  id: '4',
                  name: 'actor-name',
                  __typename: 'User',
                  nameRenderer: {
                    __typename: 'MarkdownUserNameRenderer',
                    __module_component_RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation:
                      'MarkdownUserNameRenderer.react',
                    __module_operation_RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation:
                      'RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$normalization.graphql',
                    markdown: 'markdown payload',
                    data: {
                      id: 'data-1',
                      markup: '<markup/>', // server data is lowercase
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
          'RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$normalization.graphql',
        );
        resolveFragment(markdownRendererNormalizationFragment);
        jest.runAllTimers();

        // The mutation affecting the query should still be in flight
        // since the network hasn't completed
        expect(
          environment
            .getOperationTracker()
            .getPendingOperationsAffectingOwner(queryOperation.request),
        ).not.toBe(null);

        expect(complete).toBeCalledTimes(0);
        expect(error).toBeCalledTimes(0);
        expect(next).toBeCalledTimes(1);

        dataSource.complete();
        expect(complete).toBeCalledTimes(1);
        expect(error).toBeCalledTimes(0);
        expect(next).toBeCalledTimes(1);

        // The mutation affecting the query should no longer be in flight
        expect(
          environment
            .getOperationTracker()
            .getPendingOperationsAffectingOwner(queryOperation.request),
        ).toBe(null);
      });

      describe('optimistic updates', () => {
        const optimisticResponse = {
          commentCreate: {
            comment: {
              id: commentID,
              actor: {
                id: '4',
                name: 'optimistic-actor-name',
                __typename: 'User',
                nameRenderer: {
                  __typename: 'MarkdownUserNameRenderer',
                  __module_component_RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation:
                    'MarkdownUserNameRenderer.react',
                  __module_operation_RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation:
                    'RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$normalization.graphql',
                  markdown: 'markdown payload',
                  data: {
                    id: 'data-1',
                    markup: '<optimistic_markup/>', // server data is lowercase
                  },
                },
              },
            },
          },
        };

        it('optimistically creates @match fields', () => {
          operationLoader.get.mockImplementationOnce(name => {
            return markdownRendererNormalizationFragment;
          });
          environment
            .executeMutation({operation, optimisticResponse})
            .subscribe(callbacks);
          jest.runAllTimers();

          expect(next.mock.calls.length).toBe(0);
          expect(complete).not.toBeCalled();
          expect(error.mock.calls.map(call => call[0].message)).toEqual([]);
          expect(operationCallback).toBeCalledTimes(1);
          const operationSnapshot = operationCallback.mock.calls[0][0];
          expect(operationSnapshot.isMissingData).toBe(false);
          expect(operationSnapshot.data).toEqual({
            commentCreate: {
              comment: {
                actor: {
                  name: 'optimistic-actor-name',
                  nameRenderer: {
                    __id: 'client:4:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
                    __fragmentPropName: 'name',
                    __fragments: {
                      RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name:
                        {},
                    },
                    __fragmentOwner: operation.request,
                    __isWithinUnmatchedTypeRefinement: false,
                    __module_component: 'MarkdownUserNameRenderer.react',
                  },
                },
              },
            },
          });
          operationCallback.mockClear();

          const matchSelector = nullthrows(
            getSingularSelector(
              markdownRendererFragment,
              (operationSnapshot.data: any)?.commentCreate?.comment?.actor
                ?.nameRenderer,
            ),
          );
          const initialMatchSnapshot = environment.lookup(matchSelector);
          expect(initialMatchSnapshot.isMissingData).toBe(false);
          expect(initialMatchSnapshot.data).toEqual({
            __typename: 'MarkdownUserNameRenderer',
            data: {
              // NOTE: should be uppercased by the MarkupHandler
              markup: '<OPTIMISTIC_MARKUP/>',
            },
            markdown: 'markdown payload',
          });
        });

        it('optimistically creates @match fields and loads resources', () => {
          operationLoader.load.mockImplementationOnce(() => {
            return new Promise(resolve => {
              setImmediate(() => {
                resolve(markdownRendererNormalizationFragment);
              });
            });
          });
          environment
            .executeMutation({operation, optimisticResponse})
            .subscribe(callbacks);
          jest.runAllTimers();

          expect(next.mock.calls.length).toBe(0);
          expect(complete).not.toBeCalled();
          expect(error.mock.calls.map(call => call[0].message)).toEqual([]);
          expect(operationCallback).toBeCalledTimes(1);
          const operationSnapshot = operationCallback.mock.calls[0][0];
          expect(operationSnapshot.isMissingData).toBe(false);
          expect(operationSnapshot.data).toEqual({
            commentCreate: {
              comment: {
                actor: {
                  name: 'optimistic-actor-name',
                  nameRenderer: {
                    __id: 'client:4:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
                    __fragmentPropName: 'name',
                    __fragments: {
                      RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name:
                        {},
                    },
                    __fragmentOwner: operation.request,
                    __isWithinUnmatchedTypeRefinement: false,
                    __module_component: 'MarkdownUserNameRenderer.react',
                  },
                },
              },
            },
          });
          operationCallback.mockClear();

          const matchSelector = nullthrows(
            getSingularSelector(
              markdownRendererFragment,
              (operationSnapshot.data: any)?.commentCreate?.comment?.actor
                ?.nameRenderer,
            ),
          );
          const initialMatchSnapshot = environment.lookup(matchSelector);
          expect(initialMatchSnapshot.isMissingData).toBe(false);
          expect(initialMatchSnapshot.data).toEqual({
            __typename: 'MarkdownUserNameRenderer',
            data: {
              // NOTE: should be uppercased by the MarkupHandler
              markup: '<OPTIMISTIC_MARKUP/>',
            },
            markdown: 'markdown payload',
          });
        });

        it('does not apply async 3D optimistic updates if the server response arrives first', () => {
          operationLoader.load.mockImplementationOnce(() => {
            return new Promise(resolve => {
              setTimeout(() => {
                resolve(markdownRendererNormalizationFragment);
              }, 1000);
            });
          });

          environment
            .executeMutation({operation, optimisticResponse})
            .subscribe(callbacks);

          const serverPayload = {
            data: {
              commentCreate: {
                comment: {
                  id: commentID,
                  actor: {
                    id: '4',
                    name: 'actor-name',
                    __typename: 'User',
                    nameRenderer: {
                      __typename: 'MarkdownUserNameRenderer',
                      __module_component_RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation:
                        'MarkdownUserNameRenderer.react',
                      __module_operation_RelayModernEnvironmentExecuteMutationWithMatchTestCreateCommentMutation:
                        'RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name$normalization.graphql',
                      markdown: 'markdown payload',
                      data: {
                        markup: '<markup/>', // server data is lowercase
                      },
                    },
                  },
                },
              },
            },
          };
          dataSource.next(serverPayload);
          jest.runAllTimers();

          expect(next.mock.calls.length).toBe(1);
          expect(complete).not.toBeCalled();
          expect(error).not.toBeCalled();

          expect(operationCallback).toBeCalledTimes(2);
          const operationSnapshot = operationCallback.mock.calls[1][0];
          expect(operationSnapshot.isMissingData).toBe(false);
          expect(operationSnapshot.data).toEqual({
            commentCreate: {
              comment: {
                actor: {
                  name: 'actor-name',
                  nameRenderer: {
                    __id: 'client:4:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
                    __fragmentPropName: 'name',
                    __fragments: {
                      RelayModernEnvironmentExecuteMutationWithMatchTestMarkdownUserNameRenderer_name:
                        {},
                    },
                    __fragmentOwner: operation.request,
                    __isWithinUnmatchedTypeRefinement: false,
                    __module_component: 'MarkdownUserNameRenderer.react',
                  },
                },
              },
            },
          });

          const matchSelector = nullthrows(
            getSingularSelector(
              markdownRendererFragment,
              (operationSnapshot.data: any)?.commentCreate?.comment?.actor
                ?.nameRenderer,
            ),
          );
          const matchSnapshot = environment.lookup(matchSelector);
          // optimistic update should not be applied
          expect(matchSnapshot.isMissingData).toBe(true);
          expect(matchSnapshot.data).toEqual({
            __typename: 'MarkdownUserNameRenderer',
            data: undefined,
            markdown: undefined,
          });
        });

        it('does not apply async 3D optimistic updates if the operation is cancelled', () => {
          operationLoader.load.mockImplementationOnce(() => {
            return new Promise(resolve => {
              setTimeout(() => {
                resolve(markdownRendererNormalizationFragment);
              }, 1000);
            });
          });
          const disposable = environment
            .executeMutation({operation, optimisticResponse})
            .subscribe(callbacks);
          disposable.unsubscribe();

          jest.runAllImmediates();
          jest.runAllTimers();

          expect(next).not.toBeCalled();
          expect(complete).not.toBeCalled();
          expect(error).not.toBeCalled();
          expect(operationCallback).toBeCalledTimes(2);
          // get the match snapshot from sync optimistic response
          const operationSnapshot = operationCallback.mock.calls[0][0];
          expect(operationSnapshot.isMissingData).toBe(false);
          const matchSelector = nullthrows(
            getSingularSelector(
              markdownRendererFragment,
              (operationSnapshot.data: any)?.commentCreate?.comment?.actor
                ?.nameRenderer,
            ),
          );
          const matchSnapshot = environment.lookup(matchSelector);
          // optimistic update should not be applied
          expect(matchSnapshot.isMissingData).toBe(true);
          expect(matchSnapshot.data).toEqual(undefined);
        });

        it('catches error when operationLoader.load fails synchronously', () => {
          operationLoader.load.mockImplementationOnce(() => {
            throw new Error('<user-error>');
          });
          environment
            .executeMutation({operation, optimisticResponse})
            .subscribe(callbacks);
          jest.runAllTimers();
          expect(error.mock.calls.length).toBe(1);
          expect(error.mock.calls[0][0]).toEqual(new Error('<user-error>'));
        });
      });
    });
  },
);

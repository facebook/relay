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

const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernStore = require('../RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const RelayRecordSource = require('../RelayRecordSource');

const nullthrows = require('nullthrows');

const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {
  getSingularSelector,
  createReaderSelector,
} = require('../RelayModernSelector');
const {generateAndCompile} = require('relay-test-utils-internal');

import type {NormalizationRootNode} from '../../util/NormalizationNode';

describe('executeSubscrption() with @match', () => {
  let callbacks;
  let commentFragment;
  let commentID;
  let complete;
  let dataSource;
  let environment;
  let error;
  let fetchFn;
  let subscribeFn;
  let fragmentCallback;
  let markdownRendererFragment;
  let markdownRendererNormalizationFragment;
  let subscription;
  let next;
  let operation;
  let commentQuery;
  let queryOperation;
  let operationCallback;
  let operationLoader: {|
    +get: JestMockFn<$ReadOnlyArray<mixed>, ?NormalizationRootNode>,
    load: JestMockFn<$ReadOnlyArray<mixed>, Promise<?NormalizationRootNode>>,
  |};
  let resolveFragment;
  let source;
  let store;
  let variables;
  let queryVariables;

  beforeEach(() => {
    jest.resetModules();
    commentID = '1';

    ({
      CommentFragment: commentFragment,
      CommentQuery: commentQuery,
      CommentCreateSubscription: subscription,
      MarkdownUserNameRenderer_name: markdownRendererFragment,
      MarkdownUserNameRenderer_name$normalization: markdownRendererNormalizationFragment,
    } = generateAndCompile(`
        subscription CommentCreateSubscription($input: CommentCreateSubscriptionInput!) {
          commentCreateSubscribe(input: $input) {
            comment {
              actor {
                name
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

        fragment CommentFragment on Comment {
          id
          actor {
            name
            nameRenderer @match {
              ...PlainUserNameRenderer_name
                @module(name: "PlainUserNameRenderer.react")
              ...MarkdownUserNameRenderer_name
                @module(name: "MarkdownUserNameRenderer.react")
            }
          }
        }

        query CommentQuery($id: ID!) {
          node(id: $id) {
            id
            ...CommentFragment
          }
        }
      `));
    variables = {
      input: {
        clientMutationId: '0',
        feedbackId: '1',
      },
    };
    queryVariables = {
      id: commentID,
    };
    operation = createOperationDescriptor(subscription, variables);
    queryOperation = createOperationDescriptor(commentQuery, queryVariables);

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
    fetchFn = jest.fn((_query, _variables, _cacheConfig) =>
      RelayObservable.create(sink => {}),
    );
    subscribeFn = jest.fn((_query, _variables, _cacheConfig) =>
      RelayObservable.create(sink => {
        dataSource = sink;
      }),
    );
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
      network: RelayNetwork.create(fetchFn, subscribeFn),
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

  it('calls next() and publishes the initial payload to the store', () => {
    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        commentCreateSubscribe: {
          comment: {
            id: commentID,
            actor: {
              id: '4',
              name: 'actor-name',
              __typename: 'User',
              nameRenderer: {
                __typename: 'MarkdownUserNameRenderer',
                __module_component_CommentCreateSubscription:
                  'MarkdownUserNameRenderer.react',
                __module_operation_CommentCreateSubscription:
                  'MarkdownUserNameRenderer_name$normalization.graphql',
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
      commentCreateSubscribe: {
        comment: {
          actor: {
            name: 'actor-name',
            nameRenderer: {
              __id:
                'client:4:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
              __fragmentPropName: 'name',
              __fragments: {
                MarkdownUserNameRenderer_name: {},
              },
              __fragmentOwner: operation.request,
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
        (operationSnapshot.data: any)?.commentCreateSubscribe?.comment?.actor
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

    // The subscription affecting the owner should be marked as in flight now
    expect(
      environment
        .getOperationTracker()
        .getPromiseForPendingOperationsAffectingOwner(queryOperation.request),
    ).not.toBe(null);
  });

  it('loads the @match fragment and normalizes/publishes the field payload', () => {
    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        commentCreateSubscribe: {
          comment: {
            id: commentID,
            actor: {
              id: '4',
              name: 'actor-name',
              __typename: 'User',
              nameRenderer: {
                __typename: 'MarkdownUserNameRenderer',
                __module_component_CommentCreateSubscription:
                  'MarkdownUserNameRenderer.react',
                __module_operation_CommentCreateSubscription:
                  'MarkdownUserNameRenderer_name$normalization.graphql',
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
        markdownRendererFragment,
        (operationSnapshot.data: any)?.commentCreateSubscribe?.comment?.actor
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

    // The subscription should no longer be marked as in flight since incremental
    // payloads for the initial server payload have been resolved
    expect(
      environment
        .getOperationTracker()
        .getPromiseForPendingOperationsAffectingOwner(queryOperation.request),
    ).toBe(null);
  });

  it('calls complete() only after match payloads are processed (root network completes first)', () => {
    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        commentCreateSubscribe: {
          comment: {
            id: commentID,
            actor: {
              id: '4',
              name: 'actor-name',
              __typename: 'User',
              nameRenderer: {
                __typename: 'MarkdownUserNameRenderer',
                __module_component_CommentCreateSubscription:
                  'MarkdownUserNameRenderer.react',
                __module_operation_CommentCreateSubscription:
                  'MarkdownUserNameRenderer_name$normalization.graphql',
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
    dataSource.complete();
    jest.runAllTimers();
    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(1);

    // The subscription affecting the query should still appear in flight;
    // even though the root request has completed, we're still waiting on the
    // module resource
    expect(
      environment
        .getOperationTracker()
        .getPromiseForPendingOperationsAffectingOwner(queryOperation.request),
    ).not.toBe(null);

    expect(operationLoader.load).toBeCalledTimes(1);
    expect(operationLoader.load.mock.calls[0][0]).toEqual(
      'MarkdownUserNameRenderer_name$normalization.graphql',
    );
    resolveFragment(markdownRendererNormalizationFragment);
    jest.runAllTimers();

    expect(complete).toBeCalledTimes(1);
    expect(error).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(1);

    // The subscription affecting the query should no longer be in flight
    expect(
      environment
        .getOperationTracker()
        .getPromiseForPendingOperationsAffectingOwner(queryOperation.request),
    ).toBe(null);
  });

  it('calls complete() only after match payloads are processed (root network completes last)', () => {
    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        commentCreateSubscribe: {
          comment: {
            id: commentID,
            actor: {
              id: '4',
              name: 'actor-name',
              __typename: 'User',
              nameRenderer: {
                __typename: 'MarkdownUserNameRenderer',
                __module_component_CommentCreateSubscription:
                  'MarkdownUserNameRenderer.react',
                __module_operation_CommentCreateSubscription:
                  'MarkdownUserNameRenderer_name$normalization.graphql',
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

    // The subscription affecting the query should appear in flight
    // since module hasn't been resolved
    expect(
      environment
        .getOperationTracker()
        .getPromiseForPendingOperationsAffectingOwner(queryOperation.request),
    ).not.toBe(null);

    expect(operationLoader.load).toBeCalledTimes(1);
    expect(operationLoader.load.mock.calls[0][0]).toEqual(
      'MarkdownUserNameRenderer_name$normalization.graphql',
    );
    resolveFragment(markdownRendererNormalizationFragment);
    jest.runAllTimers();

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(1);

    // The subscription affecting the query should no longer be in flight
    // since module was resolved
    expect(
      environment
        .getOperationTracker()
        .getPromiseForPendingOperationsAffectingOwner(queryOperation.request),
    ).toBe(null);

    dataSource.complete();
    expect(complete).toBeCalledTimes(1);
    expect(error).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(1);

    // The subscription affecting the query should no longer be in flight
    expect(
      environment
        .getOperationTracker()
        .getPromiseForPendingOperationsAffectingOwner(queryOperation.request),
    ).toBe(null);
  });

  it('calls error() even if match payloads have not been resolved', () => {
    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        commentCreateSubscribe: {
          comment: {
            id: commentID,
            actor: {
              id: '4',
              name: 'actor-name',
              __typename: 'User',
              nameRenderer: {
                __typename: 'MarkdownUserNameRenderer',
                __module_component_CommentCreateSubscription:
                  'MarkdownUserNameRenderer.react',
                __module_operation_CommentCreateSubscription:
                  'MarkdownUserNameRenderer_name$normalization.graphql',
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

    // The subscription affecting the query should appear in flight
    // since module hasn't been resolved
    expect(
      environment
        .getOperationTracker()
        .getPromiseForPendingOperationsAffectingOwner(queryOperation.request),
    ).not.toBe(null);

    const err = new Error('Oops');
    dataSource.error(err);

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(1);
    expect(error.mock.calls[0][0]).toBe(err);
    expect(next).toBeCalledTimes(1);
    expect(fragmentCallback).toBeCalledTimes(1);

    // The subscription affecting the query should no longer be in flight
    // since request errored
    expect(
      environment
        .getOperationTracker()
        .getPromiseForPendingOperationsAffectingOwner(queryOperation.request),
    ).toBe(null);
  });
});

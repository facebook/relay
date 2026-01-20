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
import type {NormalizationRootNode} from '../../util/NormalizationNode';
import type {Snapshot} from '../RelayStoreTypes';
import type {
  HandleFieldPayload,
  RecordSourceProxy,
} from 'relay-runtime/store/RelayStoreTypes';
import type {RequestParameters} from 'relay-runtime/util/RelayConcreteNode';
import type {
  CacheConfig,
  Variables,
} from 'relay-runtime/util/RelayRuntimeTypes';

const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const {graphql} = require('../../query/GraphQLTag');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {getSingularSelector} = require('../RelayModernSelector');
const RelayModernStore = require('../RelayModernStore');
const RelayRecordSource = require('../RelayRecordSource');
const nullthrows = require('nullthrows');
const {
  cannotReadPropertyOfUndefined__DEPRECATED,
  disallowWarnings,
  injectPromisePolyfill__DEPRECATED,
} = require('relay-test-utils-internal');

injectPromisePolyfill__DEPRECATED();
disallowWarnings();

describe('execute() a query with @module', () => {
  let callbacks: {
    +complete: JestMockFn<ReadonlyArray<unknown>, unknown>,
    +error: JestMockFn<ReadonlyArray<Error>, unknown>,
    +next: JestMockFn<ReadonlyArray<unknown>, unknown>,
    +start?: JestMockFn<ReadonlyArray<unknown>, unknown>,
    +unsubscribe?: JestMockFn<ReadonlyArray<unknown>, unknown>,
  };
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
  let operationLoader: {
    get: (reference: unknown) => ?NormalizationRootNode,
    load: JestMockFn<ReadonlyArray<unknown>, Promise<?NormalizationRootNode>>,
  };
  let query;
  let resolveFragment;
  let source;
  let store;
  let variables;

  beforeEach(() => {
    query = graphql`
      query RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery(
        $id: ID!
      ) {
        node(id: $id) {
          ... on User {
            nameRenderer: nameRendererNoSupportedArg
              @match(
                key: "RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery__nameRenderer"
              ) {
              ...RelayModernEnvironmentExecuteWithModuleWithKeyTestPlainUserNameRenderer_name
                @module(name: "PlainUserNameRenderer.react")
              ...RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name
                @module(name: "MarkdownUserNameRenderer.react")
            }
          }
        }
      }
    `;

    graphql`
      fragment RelayModernEnvironmentExecuteWithModuleWithKeyTestPlainUserNameRenderer_name on PlainUserNameRenderer {
        plaintext
        data {
          text
        }
      }
    `;

    markdownRendererNormalizationFragment = require('./__generated__/RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name$normalization.graphql');
    markdownRendererFragment = graphql`
      fragment RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {
        __typename
        markdown
        data {
          markup @__clientField(handle: "markup_handler")
        }
      }
    `;
    variables = {id: '1'};
    operation = createOperationDescriptor(query, variables);

    const MarkupHandler = {
      update(storeProxy: RecordSourceProxy, payload: HandleFieldPayload) {
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

    complete = jest.fn<ReadonlyArray<unknown>, unknown>();
    error = jest.fn<ReadonlyArray<Error>, unknown>();
    next = jest.fn<ReadonlyArray<unknown>, unknown>();
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
      handlerProvider: name => {
        switch (name) {
          case 'markup_handler':
            return MarkupHandler;
        }
      },
      network: RelayNetwork.create(fetch),
      operationLoader,
      store,
    });
    const operationSnapshot = environment.lookup(operation.fragment);
    operationCallback = jest.fn<[Snapshot], void>();
    environment.subscribe(operationSnapshot, operationCallback);
  });

  it('calls next() and publishes the initial payload to the store', () => {
    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        node: {
          __typename: 'User',
          id: '1',
          nameRenderer: {
            __module_component_RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery__nameRenderer:
              'MarkdownUserNameRenderer.react',
            __module_operation_RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery__nameRenderer:
              'RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name$normalization.graphql',
            __typename: 'MarkdownUserNameRenderer',
            data: {
              markup: '<markup/>',
            },
            markdown: 'markdown payload',
          },
        },
      },
    };
    dataSource.next(payload);
    jest.runAllTimers();

    expect(operationLoader.load).toBeCalledTimes(1);
    expect(operationLoader.load.mock.calls[0][0]).toEqual(
      'RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name$normalization.graphql',
    );

    expect(next.mock.calls.length).toBe(1);
    expect(complete).not.toBeCalled();
    expect(error).not.toBeCalled();
    expect(operationCallback).toBeCalledTimes(1);
    const operationSnapshot = operationCallback.mock.calls[0][0];
    expect(operationSnapshot.isMissingData).toBe(false);
    expect(operationSnapshot.data).toEqual({
      node: {
        nameRenderer: {
          __fragmentOwner: operation.request,
          __fragmentPropName: 'name',
          __fragments: {
            RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name:
              {},
          },
          __id: 'client:1:nameRendererNoSupportedArg',
          __module_component: 'MarkdownUserNameRenderer.react',
        },
      },
    });

    const matchSelector = nullthrows(
      getSingularSelector(
        markdownRendererFragment,
        (operationSnapshot.data?.node as any)?.nameRenderer,
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
  });

  it('loads the @match fragment and normalizes/publishes the field payload', () => {
    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        node: {
          __typename: 'User',
          id: '1',
          nameRenderer: {
            __module_component_RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery__nameRenderer:
              'MarkdownUserNameRenderer.react',
            __module_operation_RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery__nameRenderer:
              'RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name$normalization.graphql',
            __typename: 'MarkdownUserNameRenderer',
            data: {
              id: 'data-1',
              // NOTE: should be uppercased when normalized (by MarkupHandler)
              markup: '<markup/>',
            },
            markdown: 'markdown payload',
          },
        },
      },
    };
    dataSource.next(payload);
    jest.runAllTimers();
    next.mockClear();
    expect(operationCallback).toBeCalledTimes(1); // initial results tested above
    const operationSnapshot = operationCallback.mock.calls[0][0];
    operationCallback.mockClear();

    const matchSelector = nullthrows(
      getSingularSelector(
        markdownRendererFragment,
        (operationSnapshot.data?.node as any)?.nameRenderer,
      ),
    );
    // initial results tested above
    const initialMatchSnapshot = environment.lookup(matchSelector);
    expect(initialMatchSnapshot.isMissingData).toBe(true);
    const matchCallback = jest.fn<[Snapshot], void>();
    environment.subscribe(initialMatchSnapshot, matchCallback);

    resolveFragment(markdownRendererNormalizationFragment);
    jest.runAllTimers();
    // next() should not be called when @match resolves, no new GraphQLResponse
    // was received for this case
    expect(next).toBeCalledTimes(0);
    expect(operationCallback).toBeCalledTimes(0); // operation result shouldn't change
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
  });

  it('synchronously normalizes/publishes the field payload if @match fragment is available synchronously', () => {
    environment.execute({operation}).subscribe(callbacks);
    jest
      .spyOn(operationLoader, 'get')
      .mockImplementationOnce(() => markdownRendererNormalizationFragment);

    const payload = {
      data: {
        node: {
          __typename: 'User',
          id: '1',
          nameRenderer: {
            __module_component_RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery__nameRenderer:
              'MarkdownUserNameRenderer.react',
            __module_operation_RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery__nameRenderer:
              'RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name$normalization.graphql',
            __typename: 'MarkdownUserNameRenderer',
            data: {
              id: 'data-1',
              // NOTE: should be uppercased when normalized (by MarkupHandler)
              markup: '<markup/>',
            },
            markdown: 'markdown payload',
          },
        },
      },
    };
    dataSource.next(payload);
    expect(next).toBeCalledTimes(1);
    next.mockClear();

    expect(operationCallback).toBeCalledTimes(1); // initial results tested above
    const operationSnapshot = operationCallback.mock.calls[0][0];
    operationCallback.mockClear();

    const matchSelector = nullthrows(
      getSingularSelector(
        markdownRendererFragment,
        (operationSnapshot.data?.node as any)?.nameRenderer,
      ),
    );

    // At this point the matchSnapshot should contain all the data,
    // since it should've been normalized synchronously
    const matchSnapshot = environment.lookup(matchSelector);
    expect(matchSnapshot.isMissingData).toBe(false);
    expect(matchSnapshot.data).toEqual({
      __typename: 'MarkdownUserNameRenderer',
      data: {
        // NOTE: should be uppercased by the MarkupHandler
        markup: '<MARKUP/>',
      },
      markdown: 'markdown payload',
    });
  });

  it('calls complete() if the network completes before processing the @module', () => {
    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        node: {
          __typename: 'User',
          id: '1',
          nameRenderer: {
            __module_component_RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery__nameRenderer:
              'MarkdownUserNameRenderer.react',
            __module_operation_RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery__nameRenderer:
              'RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name$normalization.graphql',
            __typename: 'MarkdownUserNameRenderer',
            data: {
              id: 'data-1',
              markup: '<markup/>',
            },
            markdown: 'markdown payload',
          },
        },
      },
    };
    dataSource.next(payload);
    jest.runAllTimers();
    dataSource.complete();
    expect(callbacks.complete).toBeCalledTimes(0);
    expect(callbacks.error).toBeCalledTimes(0);
    expect(callbacks.next).toBeCalledTimes(1);

    expect(operationLoader.load).toBeCalledTimes(1);
    expect(operationLoader.load.mock.calls[0][0]).toBe(
      'RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name$normalization.graphql',
    );
    resolveFragment(markdownRendererNormalizationFragment);
    jest.runAllTimers();
    expect(callbacks.complete).toBeCalledTimes(1);
    expect(callbacks.error).toBeCalledTimes(0);
    expect(callbacks.next).toBeCalledTimes(1);
  });

  it('calls complete() if the network completes after processing the @module', () => {
    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        node: {
          __typename: 'User',
          id: '1',
          nameRenderer: {
            __module_component_RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery__nameRenderer:
              'MarkdownUserNameRenderer.react',
            __module_operation_RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery__nameRenderer:
              'RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name$normalization.graphql',
            __typename: 'MarkdownUserNameRenderer',
            data: {
              id: 'data-1',
              markup: '<markup/>',
            },
            markdown: 'markdown payload',
          },
        },
      },
    };
    dataSource.next(payload);
    jest.runAllTimers();

    expect(operationLoader.load).toBeCalledTimes(1);
    expect(operationLoader.load.mock.calls[0][0]).toBe(
      'RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name$normalization.graphql',
    );
    resolveFragment(markdownRendererNormalizationFragment);
    jest.runAllTimers();
    expect(callbacks.complete).toBeCalledTimes(0);
    expect(callbacks.error).toBeCalledTimes(0);
    expect(callbacks.next).toBeCalledTimes(1);

    dataSource.complete();
    expect(callbacks.complete).toBeCalledTimes(1);
    expect(callbacks.error).toBeCalledTimes(0);
    expect(callbacks.next).toBeCalledTimes(1);
  });

  it('calls error() if the operationLoader function throws synchronously', () => {
    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        node: {
          __typename: 'User',
          id: '1',
          nameRenderer: {
            __module_component_RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery__nameRenderer:
              'MarkdownUserNameRenderer.react',
            __module_operation_RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery__nameRenderer:
              'RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name$normalization.graphql',
            __typename: 'MarkdownUserNameRenderer',
            data: {
              markup: '<markup/>',
            },
            markdown: 'markdown payload',
          },
        },
      },
    };
    const loaderError = new Error();
    operationLoader.load = jest.fn(() => {
      throw loaderError;
    });
    dataSource.next(payload);
    jest.runAllTimers();

    expect(callbacks.error).toBeCalledTimes(1);
    expect(callbacks.error.mock.calls[0][0]).toBe(loaderError);
  });

  it('calls error() if operationLoader.get function throws synchronously', () => {
    environment.execute({operation}).subscribe(callbacks);
    const loaderError = new Error();
    jest.spyOn(operationLoader, 'get').mockImplementationOnce(() => {
      throw loaderError;
    });

    const payload = {
      data: {
        node: {
          __typename: 'User',
          id: '1',
          nameRenderer: {
            __module_component_RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery__nameRenderer:
              'MarkdownUserNameRenderer.react',
            __module_operation_RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery__nameRenderer:
              'RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name$normalization.graphql',
            __typename: 'MarkdownUserNameRenderer',
            data: {
              markup: '<markup/>',
            },
            markdown: 'markdown payload',
          },
        },
      },
    };
    dataSource.next(payload);

    expect(callbacks.error).toBeCalledTimes(1);
    expect(callbacks.error.mock.calls[0][0]).toBe(loaderError);
  });

  it('calls error() if the operationLoader promise fails', () => {
    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        node: {
          __typename: 'User',
          id: '1',
          nameRenderer: {
            __module_component_RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery__nameRenderer:
              'MarkdownUserNameRenderer.react',
            __module_operation_RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery__nameRenderer:
              'RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name$normalization.graphql',
            __typename: 'MarkdownUserNameRenderer',
            data: {
              markup: '<markup/>',
            },
            markdown: 'markdown payload',
          },
        },
      },
    };
    const loaderError = new Error();
    operationLoader.load = jest.fn(() => {
      return Promise.reject(loaderError);
    });
    dataSource.next(payload);
    jest.runAllTimers();

    expect(callbacks.error).toBeCalledTimes(1);
    expect(callbacks.error.mock.calls[0][0]).toBe(loaderError);
  });

  it('calls error() if processing a module payload throws', () => {
    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        node: {
          __typename: 'User',
          id: '1',
          nameRenderer: {
            __module_component_RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery__nameRenderer:
              'MarkdownUserNameRenderer.react',
            __module_operation_RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery__nameRenderer:
              'RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name$normalization.graphql',
            __typename: 'MarkdownUserNameRenderer',
            data: {
              markup: '<markup/>',
            },
            markdown: 'markdown payload',
          },
        },
      },
    };
    operationLoader.load = jest.fn(() => {
      // Invalid fragment node, no 'selections' field
      // This is to make sure that users implementing operationLoader
      // incorrectly still get reasonable error handling
      return Promise.resolve({} as any);
    });
    dataSource.next(payload);
    jest.runAllTimers();

    expect(callbacks.error).toBeCalledTimes(1);
    expect(callbacks.error.mock.calls[0][0].message).toBe(
      cannotReadPropertyOfUndefined__DEPRECATED('length'),
    );
  });

  it('cancels @module processing if unsubscribed', () => {
    const subscription = environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        node: {
          __typename: 'User',
          id: '1',
          nameRenderer: {
            __module_component_RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery__nameRenderer:
              'MarkdownUserNameRenderer.react',
            __module_operation_RelayModernEnvironmentExecuteWithModuleWithKeyTestUserQuery__nameRenderer:
              'RelayModernEnvironmentExecuteWithModuleWithKeyTestMarkdownUserNameRenderer_name$normalization.graphql',
            __typename: 'MarkdownUserNameRenderer',
            data: {
              // NOTE: should be uppercased when normalized (by MarkupHandler)
              markup: '<markup/>',
            },
            markdown: 'markdown payload',
          },
        },
      },
    };
    dataSource.next(payload);
    jest.runAllTimers();
    next.mockClear();
    expect(operationCallback).toBeCalledTimes(1); // initial results tested above
    const operationSnapshot = operationCallback.mock.calls[0][0];
    operationCallback.mockClear();

    const matchSelector = nullthrows(
      getSingularSelector(
        markdownRendererFragment,
        (operationSnapshot.data?.node as any)?.nameRenderer,
      ),
    );
    // initial results tested above
    const initialMatchSnapshot = environment.lookup(matchSelector);
    expect(initialMatchSnapshot.isMissingData).toBe(true);
    const matchCallback = jest.fn<[Snapshot], void>();
    environment.subscribe(initialMatchSnapshot, matchCallback);

    subscription.unsubscribe();
    resolveFragment(markdownRendererNormalizationFragment);
    jest.runAllTimers();
    // next() should not be called when @match resolves, no new GraphQLResponse
    // was received for this case
    expect(next).toBeCalledTimes(0);
    expect(operationCallback).toBeCalledTimes(0); // operation result shouldn't change
    expect(matchCallback).toBeCalledTimes(0); // match results don't change
  });
});

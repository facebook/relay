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

'use strict';

const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const RelayInMemoryRecordSource = require('../RelayInMemoryRecordSource');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernOperationDescriptor = require('../RelayModernOperationDescriptor');
const RelayModernStore = require('../RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');

const nullthrows = require('nullthrows');

const {getSingularSelector} = require('../RelayModernSelector');
const {generateAndCompile, matchers} = require('relay-test-utils');

function createOperationDescriptor(...args) {
  const operation = RelayModernOperationDescriptor.createOperationDescriptor(
    ...args,
  );
  // For convenience of the test output, override toJSON to print
  // a more succint description of the operation.
  // $FlowFixMe
  operation.toJSON = () => {
    return {
      name: operation.fragment.node.name,
      variables: operation.variables,
    };
  };
  return operation;
}

describe('execute() a query with @module', () => {
  let callbacks;
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
  let operationLoader;
  let previousEnableIncrementalDelivery;
  let query;
  let resolveFragment;
  let source;
  let store;
  let variables;

  beforeEach(() => {
    jest.resetModules();
    previousEnableIncrementalDelivery =
      RelayFeatureFlags.ENABLE_INCREMENTAL_DELIVERY;
    RelayFeatureFlags.ENABLE_INCREMENTAL_DELIVERY = true;

    expect.extend(matchers);
    ({
      UserQuery: query,
      MarkdownUserNameRenderer_name: markdownRendererFragment,
      MarkdownUserNameRenderer_name$normalization: markdownRendererNormalizationFragment,
    } = generateAndCompile(`
        query UserQuery($id: ID!) {
          node(id: $id) {
            ... on User {
              nameRenderer { # intentionally does not use @match
                ...PlainUserNameRenderer_name
                  @module(name: "PlainUserNameRenderer.react")
                ...MarkdownUserNameRenderer_name
                  @module(name: "MarkdownUserNameRenderer.react")
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
      `));
    variables = {id: '1'};
    operation = createOperationDescriptor(query, variables);

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
    source = new RelayInMemoryRecordSource();
    store = new RelayModernStore(source);
    environment = new RelayModernEnvironment({
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
    const operationSnapshot = environment.lookup(operation.fragment, operation);
    operationCallback = jest.fn();
    environment.subscribe(operationSnapshot, operationCallback);
  });

  afterEach(() => {
    RelayFeatureFlags.ENABLE_INCREMENTAL_DELIVERY = previousEnableIncrementalDelivery;
  });

  it('calls next() and publishes the initial payload to the store', () => {
    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        node: {
          id: '1',
          __typename: 'User',
          nameRenderer: {
            __typename: 'MarkdownUserNameRenderer',
            __module_component: 'MarkdownUserNameRenderer.react',
            __module_operation:
              'MarkdownUserNameRenderer_name$normalization.graphql',
            markdown: 'markdown payload',
            data: {
              markup: '<markup/>',
            },
          },
        },
      },
    };
    dataSource.next(payload);
    jest.runAllTimers();

    expect(operationLoader.load).toBeCalledTimes(1);
    expect(operationLoader.load.mock.calls[0][0]).toEqual(
      'MarkdownUserNameRenderer_name$normalization.graphql',
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
          __id: 'client:1:nameRenderer',
          __fragmentPropName: 'name',
          __fragments: {
            MarkdownUserNameRenderer_name: {},
          },
          __fragmentOwner: operation,
          __module_component: 'MarkdownUserNameRenderer.react',
        },
      },
    });

    const matchSelector = nullthrows(
      getSingularSelector(
        variables,
        markdownRendererFragment,
        (operationSnapshot.data?.node: any)?.nameRenderer,
      ),
    );
    const matchSnapshot = environment.lookup(matchSelector.selector, operation);
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
          id: '1',
          __typename: 'User',
          nameRenderer: {
            __typename: 'MarkdownUserNameRenderer',
            __module_component: 'MarkdownUserNameRenderer.react',
            __module_operation:
              'MarkdownUserNameRenderer_name$normalization.graphql',
            markdown: 'markdown payload',
            data: {
              // NOTE: should be uppercased when normalized (by MarkupHandler)
              markup: '<markup/>',
            },
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
        variables,
        markdownRendererFragment,
        (operationSnapshot.data?.node: any)?.nameRenderer,
      ),
    );
    // initial results tested above
    const initialMatchSnapshot = environment.lookup(
      matchSelector.selector,
      operation,
    );
    expect(initialMatchSnapshot.isMissingData).toBe(true);
    const matchCallback = jest.fn();
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
          id: '1',
          __typename: 'User',
          nameRenderer: {
            __typename: 'MarkdownUserNameRenderer',
            __module_component: 'MarkdownUserNameRenderer.react',
            __module_operation:
              'MarkdownUserNameRenderer_name$normalization.graphql',
            markdown: 'markdown payload',
            data: {
              // NOTE: should be uppercased when normalized (by MarkupHandler)
              markup: '<markup/>',
            },
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
        variables,
        markdownRendererFragment,
        (operationSnapshot.data?.node: any)?.nameRenderer,
      ),
    );

    // At this point the matchSnapshot should contain all the data,
    // since it should've been normalized synchronously
    const matchSnapshot = environment.lookup(matchSelector.selector, operation);
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
          id: '1',
          __typename: 'User',
          nameRenderer: {
            __typename: 'MarkdownUserNameRenderer',
            __module_component: 'MarkdownUserNameRenderer.react',
            __module_operation:
              'MarkdownUserNameRenderer_name$normalization.graphql',
            markdown: 'markdown payload',
            data: {
              markup: '<markup/>',
            },
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
      'MarkdownUserNameRenderer_name$normalization.graphql',
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
          id: '1',
          __typename: 'User',
          nameRenderer: {
            __typename: 'MarkdownUserNameRenderer',
            __module_component: 'MarkdownUserNameRenderer.react',
            __module_operation:
              'MarkdownUserNameRenderer_name$normalization.graphql',
            markdown: 'markdown payload',
            data: {
              markup: '<markup/>',
            },
          },
        },
      },
    };
    dataSource.next(payload);
    jest.runAllTimers();

    expect(operationLoader.load).toBeCalledTimes(1);
    expect(operationLoader.load.mock.calls[0][0]).toBe(
      'MarkdownUserNameRenderer_name$normalization.graphql',
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
          id: '1',
          __typename: 'User',
          nameRenderer: {
            __typename: 'MarkdownUserNameRenderer',
            __module_component: 'MarkdownUserNameRenderer.react',
            __module_operation:
              'MarkdownUserNameRenderer_name$normalization.graphql',
            markdown: 'markdown payload',
            data: {
              markup: '<markup/>',
            },
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
          id: '1',
          __typename: 'User',
          nameRenderer: {
            __typename: 'MarkdownUserNameRenderer',
            __module_component: 'MarkdownUserNameRenderer.react',
            __module_operation:
              'MarkdownUserNameRenderer_name$normalization.graphql',
            markdown: 'markdown payload',
            data: {
              markup: '<markup/>',
            },
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
          id: '1',
          __typename: 'User',
          nameRenderer: {
            __typename: 'MarkdownUserNameRenderer',
            __module_component: 'MarkdownUserNameRenderer.react',
            __module_operation:
              'MarkdownUserNameRenderer_name$normalization.graphql',
            markdown: 'markdown payload',
            data: {
              markup: '<markup/>',
            },
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
          id: '1',
          __typename: 'User',
          nameRenderer: {
            __typename: 'MarkdownUserNameRenderer',
            __module_component: 'MarkdownUserNameRenderer.react',
            __module_operation:
              'MarkdownUserNameRenderer_name$normalization.graphql',
            markdown: 'markdown payload',
            data: {
              markup: '<markup/>',
            },
          },
        },
      },
    };
    operationLoader.load = jest.fn(() => {
      // Invalid fragment node, no 'selections' field
      // This is to make sure that users implementing operationLoader
      // incorrectly still get reasonable error handling
      return Promise.resolve(({}: any));
    });
    dataSource.next(payload);
    jest.runAllTimers();

    expect(callbacks.error).toBeCalledTimes(1);
    expect(callbacks.error.mock.calls[0][0].message).toBe(
      "Cannot read property 'length' of undefined",
    );
  });

  it('cancels @module processing if unsubscribed', () => {
    const subscription = environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        node: {
          id: '1',
          __typename: 'User',
          nameRenderer: {
            __typename: 'MarkdownUserNameRenderer',
            __module_component: 'MarkdownUserNameRenderer.react',
            __module_operation:
              'MarkdownUserNameRenderer_name$normalization.graphql',
            markdown: 'markdown payload',
            data: {
              // NOTE: should be uppercased when normalized (by MarkupHandler)
              markup: '<markup/>',
            },
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
        variables,
        markdownRendererFragment,
        (operationSnapshot.data?.node: any)?.nameRenderer,
      ),
    );
    // initial results tested above
    const initialMatchSnapshot = environment.lookup(
      matchSelector.selector,
      operation,
    );
    expect(initialMatchSnapshot.isMissingData).toBe(true);
    const matchCallback = jest.fn();
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

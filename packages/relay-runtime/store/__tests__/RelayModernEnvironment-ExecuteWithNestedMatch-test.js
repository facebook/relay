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
const {getSingularSelector} = require('../RelayModernSelector');
const {generateAndCompile} = require('relay-test-utils-internal');

describe('execute() a query with nested @match', () => {
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
  let plaintextRendererFragment;
  let plaintextRendererNormalizationFragment;
  let query;
  let resolveFragment;
  let source;
  let store;
  let variables;

  beforeEach(() => {
    jest.resetModules();

    ({
      UserQuery: query,
      MarkdownUserNameRenderer_name: markdownRendererFragment,
      PlainUserNameRenderer_name: plaintextRendererFragment,
      MarkdownUserNameRenderer_name$normalization: markdownRendererNormalizationFragment,
      PlainUserNameRenderer_name$normalization: plaintextRendererNormalizationFragment,
    } = generateAndCompile(`
        query UserQuery($id: ID!) {
          node(id: $id) {
            ... on User {
              outerRenderer: nameRenderer @match {
                ...MarkdownUserNameRenderer_name
                  @module(name: "MarkdownUserNameRenderer.react")
              }
            }
          }
        }

        fragment MarkdownUserNameRenderer_name on MarkdownUserNameRenderer {
          __typename
          markdown
          data {
            markup @__clientField(handle: "markup_handler")
          }
          user {
            innerRenderer: nameRenderer @match {
                ...PlainUserNameRenderer_name
                  @module(name: "PlainUserNameRenderer.react")
            }
          }
        }

        fragment PlainUserNameRenderer_name on PlainUserNameRenderer {
          plaintext
          data {
            text
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
    source = RelayRecordSource.create();
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
    const operationSnapshot = environment.lookup(operation.fragment);
    operationCallback = jest.fn();
    environment.subscribe(operationSnapshot, operationCallback);
  });

  it('calls next() and publishes the initial payload to the store', () => {
    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        node: {
          id: '1',
          __typename: 'User',
          outerRenderer: {
            __typename: 'MarkdownUserNameRenderer',
            __module_component_UserQuery: 'MarkdownUserNameRenderer.react',
            __module_operation_UserQuery:
              'MarkdownUserNameRenderer_name$normalization.graphql',
            markdown: 'markdown payload',
            data: {
              markup: '<markup/>',
            },
            user: {
              id: '2',
              innerRenderer: {
                __typename: 'PlainUserNameRenderer',
                __module_component_MarkdownUserNameRenderer_name:
                  'PlainUserNameRenderer.react',
                __module_operation_MarkdownUserNameRenderer_name:
                  'PlainUserNameRenderer_name$normalization.graphql',
                plaintext: 'plaintext payload',
                data: {
                  text: 'plaintext!',
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
      node: {
        outerRenderer: {
          __id: 'client:1:nameRenderer(supported:["MarkdownUserNameRenderer"])',
          __fragmentPropName: 'name',

          __fragments: {
            MarkdownUserNameRenderer_name: {},
          },

          __fragmentOwner: operation.request,
          __module_component: 'MarkdownUserNameRenderer.react',
        },
      },
    });

    const matchSelector = nullthrows(
      getSingularSelector(
        markdownRendererFragment,
        (operationSnapshot.data?.node: any)?.outerRenderer,
      ),
    );
    const matchSnapshot = environment.lookup(matchSelector);
    expect(matchSnapshot.isMissingData).toBe(true);
    expect(matchSnapshot.data).toEqual({
      __typename: 'MarkdownUserNameRenderer',
      data: undefined,
      markdown: undefined,
      user: undefined,
    });
  });

  it('loads the @match fragments and normalizes/publishes payloads', () => {
    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        node: {
          id: '1',
          __typename: 'User',
          outerRenderer: {
            __typename: 'MarkdownUserNameRenderer',
            __module_component_UserQuery: 'MarkdownUserNameRenderer.react',
            __module_operation_UserQuery:
              'MarkdownUserNameRenderer_name$normalization.graphql',
            markdown: 'markdown payload',
            data: {
              // NOTE: should be uppercased when normalized (by MarkupHandler)
              markup: '<markup/>',
            },
            user: {
              id: '2',
              innerRenderer: {
                __typename: 'PlainUserNameRenderer',
                __module_component_MarkdownUserNameRenderer_name:
                  'PlainUserNameRenderer.react',
                __module_operation_MarkdownUserNameRenderer_name:
                  'PlainUserNameRenderer_name$normalizationgraphql',
                plaintext: 'plaintext payload',
                data: {
                  text: 'plaintext!',
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
    // initial operation snapshot is tested above
    const operationSnapshot = operationCallback.mock.calls[0][0];
    operationCallback.mockClear();
    const outerMatchSelector = nullthrows(
      getSingularSelector(
        markdownRendererFragment,
        (operationSnapshot.data?.node: any)?.outerRenderer,
      ),
    );
    // initial outer fragment snapshot is tested above
    const initialOuterMatchSnapshot = environment.lookup(outerMatchSelector);
    expect(initialOuterMatchSnapshot.isMissingData).toBe(true);
    const outerMatchCallback = jest.fn();
    environment.subscribe(initialOuterMatchSnapshot, outerMatchCallback);

    resolveFragment(markdownRendererNormalizationFragment);
    jest.runAllTimers();
    // next() should not be called when @match resolves, no new GraphQLResponse
    // was received for this case
    expect(next).toBeCalledTimes(0);
    expect(operationCallback).toBeCalledTimes(0);
    expect(outerMatchCallback).toBeCalledTimes(1);
    const outerMatchSnapshot = outerMatchCallback.mock.calls[0][0];
    expect(outerMatchSnapshot.isMissingData).toBe(false);
    expect(outerMatchSnapshot.data).toEqual({
      __typename: 'MarkdownUserNameRenderer',
      data: {
        // NOTE: should be uppercased by the MarkupHandler
        markup: '<MARKUP/>',
      },
      markdown: 'markdown payload',
      user: {
        innerRenderer: {
          __fragmentOwner: operation.request,
          __fragmentPropName: 'name',

          __fragments: {
            PlainUserNameRenderer_name: {},
          },

          __id: 'client:2:nameRenderer(supported:["PlainUserNameRenderer"])',
          __module_component: 'PlainUserNameRenderer.react',
        },
      },
    });

    const innerMatchSelector = nullthrows(
      getSingularSelector(
        plaintextRendererFragment,
        (outerMatchSnapshot.data?.user: $FlowFixMe)?.innerRenderer,
      ),
    );
    const initialInnerMatchSnapshot = environment.lookup(innerMatchSelector);
    expect(initialInnerMatchSnapshot.isMissingData).toBe(true);
    const innerMatchCallback = jest.fn();
    environment.subscribe(initialInnerMatchSnapshot, innerMatchCallback);

    resolveFragment(plaintextRendererNormalizationFragment);
    jest.runAllTimers();

    expect(innerMatchCallback).toBeCalledTimes(1);
    const innerMatchSnapshot = innerMatchCallback.mock.calls[0][0];
    expect(innerMatchSnapshot.isMissingData).toBe(false);
    expect(innerMatchSnapshot.data).toEqual({
      data: {
        text: 'plaintext!',
      },
      plaintext: 'plaintext payload',
    });
  });

  it('calls complete() if the network completes before processing the match', () => {
    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        node: {
          id: '1',
          __typename: 'User',
          outerRenderer: {
            __typename: 'MarkdownUserNameRenderer',
            __module_component_UserQuery: 'MarkdownUserNameRenderer.react',
            __module_operation_UserQuery:
              'MarkdownUserNameRenderer_name$normalization.graphql',
            markdown: 'markdown payload',
            data: {
              // NOTE: should be uppercased when normalized (by MarkupHandler)
              markup: '<markup/>',
            },
            user: {
              id: '2',
              innerRenderer: {
                __typename: 'PlainUserNameRenderer',
                __module_component_MarkdownUserNameRenderer_name:
                  'PlainUserNameRenderer.react',
                __module_operation_MarkdownUserNameRenderer_name:
                  'PlainUserNameRenderer_name$normalization.graphql',
                plaintext: 'plaintext payload',
                data: {
                  text: 'plaintext!',
                },
              },
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

    expect(callbacks.complete).toBeCalledTimes(0);
    expect(callbacks.error).toBeCalledTimes(0);
    expect(callbacks.next).toBeCalledTimes(1);

    expect(operationLoader.load).toBeCalledTimes(2);
    expect(operationLoader.load.mock.calls[1][0]).toBe(
      'PlainUserNameRenderer_name$normalization.graphql',
    );
    resolveFragment(plaintextRendererNormalizationFragment);
    jest.runAllTimers();

    expect(callbacks.complete).toBeCalledTimes(1);
    expect(callbacks.error).toBeCalledTimes(0);
    expect(callbacks.next).toBeCalledTimes(1);
  });

  it('calls complete() if the network completes after processing the match', () => {
    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        node: {
          id: '1',
          __typename: 'User',
          outerRenderer: {
            __typename: 'MarkdownUserNameRenderer',
            __module_component_UserQuery: 'MarkdownUserNameRenderer.react',
            __module_operation_UserQuery:
              'MarkdownUserNameRenderer_name$normalization.graphql',
            markdown: 'markdown payload',
            data: {
              // NOTE: should be uppercased when normalized (by MarkupHandler)
              markup: '<markup/>',
            },
            user: {
              id: '2',
              innerRenderer: {
                __typename: 'PlainUserNameRenderer',
                __module_component_MarkdownUserNameRenderer_name:
                  'PlainUserNameRenderer.react',
                __module_operation_MarkdownUserNameRenderer_name:
                  'PlainUserNameRenderer_name$normalization.graphql',
                plaintext: 'plaintext payload',
                data: {
                  text: 'plaintext!',
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
    expect(operationLoader.load.mock.calls[0][0]).toBe(
      'MarkdownUserNameRenderer_name$normalization.graphql',
    );
    resolveFragment(markdownRendererNormalizationFragment);
    jest.runAllTimers();
    expect(callbacks.complete).toBeCalledTimes(0);
    expect(callbacks.error).toBeCalledTimes(0);
    expect(callbacks.next).toBeCalledTimes(1);

    expect(callbacks.complete).toBeCalledTimes(0);
    expect(callbacks.error).toBeCalledTimes(0);
    expect(callbacks.next).toBeCalledTimes(1);

    expect(operationLoader.load).toBeCalledTimes(2);
    expect(operationLoader.load.mock.calls[1][0]).toBe(
      'PlainUserNameRenderer_name$normalization.graphql',
    );
    resolveFragment(plaintextRendererNormalizationFragment);
    jest.runAllTimers();

    dataSource.complete();
    expect(callbacks.complete).toBeCalledTimes(1);
    expect(callbacks.error).toBeCalledTimes(0);
    expect(callbacks.next).toBeCalledTimes(1);
  });

  it('calls error() if processing a nested match payload throws', () => {
    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        node: {
          id: '1',
          __typename: 'User',
          outerRenderer: {
            __typename: 'MarkdownUserNameRenderer',
            __module_component_UserQuery: 'MarkdownUserNameRenderer.react',
            __module_operation_UserQuery:
              'MarkdownUserNameRenderer_name$normalization.graphql',
            markdown: 'markdown payload',
            data: {
              // NOTE: should be uppercased when normalized (by MarkupHandler)
              markup: '<markup/>',
            },
            user: {
              id: '2',
              innerRenderer: {
                __typename: 'PlainUserNameRenderer',
                __module_component_MarkdownUserNameRenderer_name:
                  'PlainUserNameRenderer.react',
                __module_operation_MarkdownUserNameRenderer_name:
                  'PlainUserNameRenderer_name$normalization.graphql',
                plaintext: 'plaintext payload',
                data: {
                  text: 'plaintext!',
                },
              },
            },
          },
        },
      },
    };
    dataSource.next(payload);
    expect(operationLoader.load).toBeCalledTimes(1);
    expect(operationLoader.load.mock.calls[0][0]).toBe(
      'MarkdownUserNameRenderer_name$normalization.graphql',
    );
    resolveFragment(markdownRendererNormalizationFragment);

    operationLoader.load = jest.fn(() => {
      // Invalid fragment node, no 'selections' field
      // This is to make sure that users implementing operationLoader
      // incorrectly still get reasonable error handling
      return Promise.resolve(({}: any));
    });
    jest.runAllTimers();

    expect(callbacks.error).toBeCalledTimes(1);
    expect(callbacks.error.mock.calls[0][0].message).toBe(
      "Cannot read property 'length' of undefined",
    );
  });

  it('cancels @match processing if unsubscribed before top-level match resolves', () => {
    const subscription = environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        node: {
          id: '1',
          __typename: 'User',
          outerRenderer: {
            __typename: 'MarkdownUserNameRenderer',
            __module_component_UserQuery: 'MarkdownUserNameRenderer.react',
            __module_operation_UserQuery:
              'MarkdownUserNameRenderer_name$normalization.graphql',
            markdown: 'markdown payload',
            data: {
              // NOTE: should be uppercased when normalized (by MarkupHandler)
              markup: '<markup/>',
            },
            user: {
              id: '2',
              innerRenderer: {
                __typename: 'PlainUserNameRenderer',
                __module_component_MarkdownUserNameRenderer_name:
                  'PlainUserNameRenderer.react',
                __module_operation_MarkdownUserNameRenderer_name:
                  'PlainUserNameRenderer_name$normalization.graphql',
                plaintext: 'plaintext payload',
                data: {
                  text: 'plaintext!',
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
    complete.mockClear();
    error.mockClear();

    expect(operationLoader.load).toBeCalledTimes(1);
    expect(operationLoader.load.mock.calls[0][0]).toEqual(
      'MarkdownUserNameRenderer_name$normalization.graphql',
    );
    // Cancel before the fragment resolves; normalization should be skipped
    subscription.unsubscribe();
    resolveFragment(markdownRendererNormalizationFragment);
    jest.runAllTimers();

    expect(operationCallback).toBeCalledTimes(1);
    // result shape tested above
    const operationSnapshot = operationCallback.mock.calls[0][0];
    const outerMatchSelector = nullthrows(
      getSingularSelector(
        markdownRendererFragment,
        (operationSnapshot.data?.node: any)?.outerRenderer,
      ),
    );
    // initial outer fragment snapshot is tested above
    const outerMatchSnapshot = environment.lookup(outerMatchSelector);
    expect(outerMatchSnapshot.isMissingData).toBe(true);
    expect(outerMatchSnapshot.data).toEqual({
      __typename: 'MarkdownUserNameRenderer',
      data: undefined,
      markdown: undefined,
      user: undefined,
    });
  });

  it('cancels @match processing if unsubscribed before inner match resolves', () => {
    const subscription = environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        node: {
          id: '1',
          __typename: 'User',
          outerRenderer: {
            __typename: 'MarkdownUserNameRenderer',
            __module_component_UserQuery: 'MarkdownUserNameRenderer.react',
            __module_operation_UserQuery:
              'MarkdownUserNameRenderer_name$normalization.graphql',
            markdown: 'markdown payload',
            data: {
              // NOTE: should be uppercased when normalized (by MarkupHandler)
              markup: '<markup/>',
            },
            user: {
              id: '2',
              innerRenderer: {
                __typename: 'PlainUserNameRenderer',
                __module_component_MarkdownUserNameRenderer_name:
                  'PlainUserNameRenderer.react',
                __module_operation_MarkdownUserNameRenderer_name:
                  'PlainUserNameRenderer_name$normalization.graphql',
                plaintext: 'plaintext payload',
                data: {
                  text: 'plaintext!',
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
    complete.mockClear();
    error.mockClear();

    expect(operationLoader.load).toBeCalledTimes(1);
    expect(operationLoader.load.mock.calls[0][0]).toEqual(
      'MarkdownUserNameRenderer_name$normalization.graphql',
    );
    resolveFragment(markdownRendererNormalizationFragment);
    jest.runAllTimers();

    // Cancel before the inner fragment resolves; normalization should be skipped
    subscription.unsubscribe();
    resolveFragment(plaintextRendererNormalizationFragment);
    jest.runAllTimers();

    expect(operationCallback).toBeCalledTimes(1);
    // result shape tested above
    const operationSnapshot = operationCallback.mock.calls[0][0];
    const outerMatchSelector = nullthrows(
      getSingularSelector(
        markdownRendererFragment,
        (operationSnapshot.data?.node: any)?.outerRenderer,
      ),
    );
    // initial outer fragment snapshot is tested above
    const outerMatchSnapshot = environment.lookup(outerMatchSelector);
    const innerMatchSelector = nullthrows(
      getSingularSelector(
        plaintextRendererFragment,
        (outerMatchSnapshot.data?.user: $FlowFixMe)?.innerRenderer,
      ),
    );
    const innerMatchSnapshot = environment.lookup(innerMatchSelector);
    expect(innerMatchSnapshot.isMissingData).toBe(true);
    expect(innerMatchSnapshot.data).toEqual({});
  });
});

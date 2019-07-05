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
const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernOperationDescriptor = require('../RelayModernOperationDescriptor');
const RelayModernStore = require('../RelayModernStore');
const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const RelayRecordSource = require('../RelayRecordSource');

const nullthrows = require('nullthrows');

const {getSingularSelector} = require('../RelayModernSelector');
const {generateAndCompile, matchers} = require('relay-test-utils-internal');

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

describe('executeMutation() with @match', () => {
  let callbacks;
  let complete;
  let dataSource;
  let environment;
  let error;
  let fetch;
  let markdownRendererFragment;
  let markdownRendererNormalizationFragment;
  let mutation;
  let next;
  let operation;
  let operationCallback;
  let operationLoader;
  let resolveFragment;
  let source;
  let store;
  let variables;

  beforeEach(() => {
    jest.resetModules();

    expect.extend(matchers);
    ({
      CreateCommentMutation: mutation,
      MarkdownUserNameRenderer_name: markdownRendererFragment,
      MarkdownUserNameRenderer_name$normalization: markdownRendererNormalizationFragment,
    } = generateAndCompile(`
        mutation CreateCommentMutation($input: CommentCreateInput!) {
          commentCreate(input: $input) {
            comment {
              actor {
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
      `));
    variables = {
      input: {
        clientMutationId: '0',
        feedbackId: '1',
      },
    };
    operation = createOperationDescriptor(mutation, variables);

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
    const operationSnapshot = environment.lookup(operation.fragment, operation);
    operationCallback = jest.fn();
    environment.subscribe(operationSnapshot, operationCallback);
  });

  it('calls next() and publishes the initial payload to the store', () => {
    environment.executeMutation({operation}).subscribe(callbacks);
    const payload = {
      data: {
        commentCreate: {
          comment: {
            id: '1',
            body: {
              text: 'Gave Relay', // server data is lowercase
            },
            actor: {
              id: '4',
              __typename: 'User',
              nameRenderer: {
                __typename: 'MarkdownUserNameRenderer',
                __module_component_CreateCommentMutation:
                  'MarkdownUserNameRenderer.react',
                __module_operation_CreateCommentMutation:
                  'MarkdownUserNameRenderer_name$normalization.graphql',
                markdown: 'markdown payload',
                data: {
                  markup: '<markup/>',
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
            nameRenderer: {
              __id:
                'client:4:nameRenderer(supported:["PlainUserNameRenderer","MarkdownUserNameRenderer"])',
              __fragmentPropName: 'name',
              __fragments: {
                MarkdownUserNameRenderer_name: {},
              },
              __fragmentOwner: operation,
              __module_component: 'MarkdownUserNameRenderer.react',
            },
          },
        },
      },
    });

    const matchSelector = nullthrows(
      getSingularSelector(
        variables,
        markdownRendererFragment,
        (operationSnapshot.data: any)?.commentCreate?.comment?.actor
          ?.nameRenderer,
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
    environment.executeMutation({operation}).subscribe(callbacks);
    const payload = {
      data: {
        commentCreate: {
          comment: {
            id: '1',
            body: {
              text: 'Gave Relay', // server data is lowercase
            },
            actor: {
              id: '4',
              __typename: 'User',
              nameRenderer: {
                __typename: 'MarkdownUserNameRenderer',
                __module_component_CreateCommentMutation:
                  'MarkdownUserNameRenderer.react',
                __module_operation_CreateCommentMutation:
                  'MarkdownUserNameRenderer_name$normalization.graphql',
                markdown: 'markdown payload',
                data: {
                  markup: '<markup/>',
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
        variables,
        markdownRendererFragment,
        (operationSnapshot.data: any)?.commentCreate?.comment?.actor
          ?.nameRenderer,
      ),
    );
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
  });

  it('calls complete() only after match payloads are processed (network completes first)', () => {
    environment.executeMutation({operation}).subscribe(callbacks);
    const payload = {
      data: {
        commentCreate: {
          comment: {
            id: '1',
            body: {
              text: 'Gave Relay', // server data is lowercase
            },
            actor: {
              id: '4',
              __typename: 'User',
              nameRenderer: {
                __typename: 'MarkdownUserNameRenderer',
                __module_component_CreateCommentMutation:
                  'MarkdownUserNameRenderer.react',
                __module_operation_CreateCommentMutation:
                  'MarkdownUserNameRenderer_name$normalization.graphql',
                markdown: 'markdown payload',
                data: {
                  markup: '<markup/>',
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

    expect(operationLoader.load).toBeCalledTimes(1);
    expect(operationLoader.load.mock.calls[0][0]).toEqual(
      'MarkdownUserNameRenderer_name$normalization.graphql',
    );
    resolveFragment(markdownRendererNormalizationFragment);
    jest.runAllTimers();

    expect(complete).toBeCalledTimes(1);
    expect(error).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(1);
  });

  it('calls complete() only after match payloads are processed (network completes last)', () => {
    environment.executeMutation({operation}).subscribe(callbacks);
    const payload = {
      data: {
        commentCreate: {
          comment: {
            id: '1',
            body: {
              text: 'Gave Relay', // server data is lowercase
            },
            actor: {
              id: '4',
              __typename: 'User',
              nameRenderer: {
                __typename: 'MarkdownUserNameRenderer',
                __module_component_CreateCommentMutation:
                  'MarkdownUserNameRenderer.react',
                __module_operation_CreateCommentMutation:
                  'MarkdownUserNameRenderer_name$normalization.graphql',
                markdown: 'markdown payload',
                data: {
                  markup: '<markup/>',
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
      'MarkdownUserNameRenderer_name$normalization.graphql',
    );
    resolveFragment(markdownRendererNormalizationFragment);
    jest.runAllTimers();

    expect(complete).toBeCalledTimes(0);
    expect(error).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(1);

    dataSource.complete();
    expect(complete).toBeCalledTimes(1);
    expect(error).toBeCalledTimes(0);
    expect(next).toBeCalledTimes(1);
  });
});

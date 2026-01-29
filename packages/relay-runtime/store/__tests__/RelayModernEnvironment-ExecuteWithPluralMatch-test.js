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
import type {GraphQLResponse} from '../../network/RelayNetworkTypes';
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
const {disallowWarnings} = require('relay-test-utils-internal');
const {
  injectPromisePolyfill__DEPRECATED,
} = require('relay-test-utils-internal');

injectPromisePolyfill__DEPRECATED();
disallowWarnings();

describe('execute() a query with plural @match', () => {
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
    jest.resetModules();

    query = graphql`
      query RelayModernEnvironmentExecuteWithPluralMatchTestUserQuery(
        $id: ID!
      ) {
        node(id: $id) {
          ... on User {
            nameRenderers @match {
              ...RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name
                @module(name: "PlainUserNameRenderer.react")
              ...RelayModernEnvironmentExecuteWithPluralMatchTestMarkdownUserNameRenderer_name
                @module(name: "MarkdownUserNameRenderer.react")
            }
          }
        }
      }
    `;

    graphql`
      fragment RelayModernEnvironmentExecuteWithPluralMatchTestPlainUserNameRenderer_name on PlainUserNameRenderer {
        plaintext
        data {
          text
        }
      }
    `;

    markdownRendererNormalizationFragment = require('./__generated__/RelayModernEnvironmentExecuteWithPluralMatchTestMarkdownUserNameRenderer_name$normalization.graphql');
    markdownRendererFragment = graphql`
      fragment RelayModernEnvironmentExecuteWithPluralMatchTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {
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

    complete = jest.fn<[], unknown>();
    error = jest.fn<[Error], unknown>();
    next = jest.fn<[GraphQLResponse], unknown>();
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
          nameRenderers: [
            {
              __module_component_RelayModernEnvironmentExecuteWithPluralMatchTestUserQuery:
                'MarkdownUserNameRenderer.react',
              __module_operation_RelayModernEnvironmentExecuteWithPluralMatchTestUserQuery:
                'RelayModernEnvironmentExecuteWithPluralMatchTestMarkdownUserNameRenderer_name$normalization.graphql',
              __typename: 'MarkdownUserNameRenderer',
              data: {
                markup: '<markup/>',
              },
              markdown: 'markdown payload',
            },
          ],
        },
      },
    };
    dataSource.next(payload);
    jest.runAllTimers();

    expect(operationLoader.load).toBeCalledTimes(1);
    expect(operationLoader.load.mock.calls[0][0]).toEqual(
      'RelayModernEnvironmentExecuteWithPluralMatchTestMarkdownUserNameRenderer_name$normalization.graphql',
    );

    expect(next.mock.calls.length).toBe(1);
    expect(complete).not.toBeCalled();
    expect(error).not.toBeCalled();
    expect(operationCallback).toBeCalledTimes(1);
    const operationSnapshot = operationCallback.mock.calls[0][0];
    expect(operationSnapshot.isMissingData).toBe(false);
    expect(operationSnapshot.data).toEqual({
      node: {
        nameRenderers: [
          {
            __fragmentOwner: operation.request,
            __fragmentPropName: 'name',
            __fragments: {
              RelayModernEnvironmentExecuteWithPluralMatchTestMarkdownUserNameRenderer_name:
                {},
            },
            __id: 'client:1:nameRenderers(supported:"34hjiS"):0',
            __module_component: 'MarkdownUserNameRenderer.react',
          },
        ],
      },
    });

    const matchSelector = nullthrows(
      getSingularSelector(
        markdownRendererFragment,
        (operationSnapshot.data?.node as any)?.nameRenderers[0],
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
          nameRenderers: [
            {
              __module_component_RelayModernEnvironmentExecuteWithPluralMatchTestUserQuery:
                'MarkdownUserNameRenderer.react',
              __module_operation_RelayModernEnvironmentExecuteWithPluralMatchTestUserQuery:
                'RelayModernEnvironmentExecuteWithPluralMatchTestMarkdownUserNameRenderer_name$normalization.graphql',
              __typename: 'MarkdownUserNameRenderer',
              data: {
                id: 'data-1',
                // NOTE: should be uppercased when normalized (by MarkupHandler)
                markup: '<markup/>',
              },
              markdown: 'markdown payload',
            },
          ],
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
        (operationSnapshot.data?.node as any)?.nameRenderers[0],
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
});

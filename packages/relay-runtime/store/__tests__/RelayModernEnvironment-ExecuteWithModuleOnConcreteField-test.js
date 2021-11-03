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

const RelayNetwork = require('../../network/RelayNetwork');
const RelayObservable = require('../../network/RelayObservable');
const {getFragment, getRequest, graphql} = require('../../query/GraphQLTag');
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

describe('execute() a query with @module on a field with a nullable concrete type', () => {
  let authorFragment;
  let authorNormalizationFragment;
  let callbacks;
  let complete;
  let dataSource;
  let environment;
  let error;
  let fetch;
  let next;
  let operation;
  let operationCallback;
  let operationLoader: {|
    get: (reference: mixed) => ?NormalizationRootNode,
    load: JestMockFn<$ReadOnlyArray<mixed>, Promise<?NormalizationRootNode>>,
  |};
  let query;
  let resolveFragment;
  let source;
  let store;
  let variables;

  beforeEach(() => {
    query = getRequest(graphql`
      query RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackQuery(
        $id: ID!
      ) {
        node(id: $id) {
          ... on Feedback {
            author {
              ...RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author
                @module(name: "FeedbackAuthor.react")
            }
          }
        }
      }
    `);

    authorNormalizationFragment = require('./__generated__/RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author$normalization.graphql');
    authorFragment = getFragment(graphql`
      fragment RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author on User {
        name
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
          __typename: 'Feedback',
          author: {
            id: '2',
            __module_component_RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackQuery:
              'FeedbackAuthor.react',
            __module_operation_RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackQuery:
              'RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author$normalization.graphql',
            name: 'Alice',
          },
        },
      },
    };
    dataSource.next(payload);
    expect(error.mock.calls).toEqual([]);
    jest.runAllTimers();

    expect(operationLoader.load).toBeCalledTimes(1);
    expect(operationLoader.load.mock.calls[0][0]).toEqual(
      'RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author$normalization.graphql',
    );

    expect(next.mock.calls.length).toBe(1);
    expect(complete).not.toBeCalled();
    expect(error).not.toBeCalled();
    expect(operationCallback).toBeCalledTimes(1);
    const operationSnapshot = operationCallback.mock.calls[0][0];
    expect(operationSnapshot.isMissingData).toBe(false);
    expect(operationSnapshot.data).toEqual({
      node: {
        author: {
          __id: '2',
          __fragmentPropName: 'author',

          __fragments: {
            RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author:
              {},
          },

          __fragmentOwner: operation.request,
          __isWithinUnmatchedTypeRefinement: false,
          __module_component: 'FeedbackAuthor.react',
        },
      },
    });

    const matchSelector = nullthrows(
      getSingularSelector(
        authorFragment,
        (operationSnapshot.data?.node: any)?.author,
      ),
    );
    const matchSnapshot = environment.lookup(matchSelector);
    // ref exists but match field data hasn't been processed yet
    expect(matchSnapshot.isMissingData).toBe(true);
    expect(matchSnapshot.data).toEqual({
      name: undefined,
    });
  });

  it('loads the @match fragment and normalizes/publishes the field payload', () => {
    environment.execute({operation}).subscribe(callbacks);
    const payload = {
      data: {
        node: {
          id: '1',
          __typename: 'Feedback',
          author: {
            id: '2',
            __module_component_RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackQuery:
              'FeedbackAuthor.react',
            __module_operation_RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackQuery:
              'RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author$normalization.graphql',
            name: 'Alice',
          },
        },
      },
    };
    dataSource.next(payload);
    jest.runAllTimers();
    next.mockClear();
    expect(error.mock.calls).toEqual([]);
    expect(operationCallback).toBeCalledTimes(1); // initial results tested above
    const operationSnapshot = operationCallback.mock.calls[0][0];
    operationCallback.mockClear();

    const matchSelector = nullthrows(
      getSingularSelector(
        authorFragment,
        (operationSnapshot.data?.node: any)?.author,
      ),
    );
    // initial results tested above
    const initialMatchSnapshot = environment.lookup(matchSelector);
    expect(initialMatchSnapshot.isMissingData).toBe(true);
    const matchCallback = jest.fn();
    environment.subscribe(initialMatchSnapshot, matchCallback);

    resolveFragment(authorNormalizationFragment);
    jest.runAllTimers();
    // next() should not be called when @match resolves, no new GraphQLResponse
    // was received for this case
    expect(next).toBeCalledTimes(0);
    expect(operationCallback).toBeCalledTimes(0); // operation result shouldn't change
    expect(matchCallback).toBeCalledTimes(1);

    const matchSnapshot = matchCallback.mock.calls[0][0];
    expect(matchSnapshot.isMissingData).toBe(false);
    expect(matchSnapshot.data).toEqual({
      name: 'Alice',
    });
  });
});

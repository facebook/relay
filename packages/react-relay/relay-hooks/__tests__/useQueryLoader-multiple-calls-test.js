/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const loadQueryModule = require('../loadQuery');
const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');
const usePreloadedQuery = require('../usePreloadedQuery');
const useQueryLoader = require('../useQueryLoader');
const React = require('react');
const ReactTestRenderer = require('react-test-renderer');
const {
  Network,
  Observable,
  PreloadableQueryRegistry,
  getRequest,
  graphql,
} = require('relay-runtime');
const {createMockEnvironment} = require('relay-test-utils');

const query = getRequest(graphql`
  query useQueryLoaderMultipleCallsTestQuery($id: ID!) {
    node(id: $id) {
      id
    }
  }
`);

const preloadableConcreteRequest = {
  kind: 'PreloadableConcreteRequest',
  params: query.params,
};

const response = {
  data: {
    node: {
      __typename: 'User',
      id: '4',
    },
  },
  extensions: {
    is_final: true,
  },
};

// Only queries with an ID are preloadable
const ID = '12345';
(query.params: $FlowFixMe).id = ID;

const variables = {id: '4'};

let environment;
let fetch;
let sink;
let executeObservable;
let executeUnsubscribe;
let networkUnsubscribe;

beforeEach(() => {
  jest.spyOn(loadQueryModule, 'loadQuery');

  PreloadableQueryRegistry.clear();

  fetch = jest.fn((_query, _variables, _cacheConfig) => {
    const observable = Observable.create(_sink => {
      sink = _sink;
    });
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    const originalSubscribe = observable.subscribe.bind(observable);
    networkUnsubscribe = jest.fn();
    jest.spyOn(observable, 'subscribe').mockImplementation((...args) => {
      const subscription = originalSubscribe(...args);
      jest
        .spyOn(subscription, 'unsubscribe')
        .mockImplementation(() => networkUnsubscribe());
      return subscription;
    });
    return observable;
  });

  environment = createMockEnvironment({network: Network.create(fetch)});

  const originalExecuteWithSource =
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    environment.executeWithSource.getMockImplementation();
  executeObservable = undefined;
  executeUnsubscribe = undefined;

  jest
    .spyOn(environment, 'executeWithSource')
    .mockImplementation((...params) => {
      executeObservable = originalExecuteWithSource(...params);
      const originalSubscribe =
        executeObservable.subscribe.bind(executeObservable);
      jest
        .spyOn(executeObservable, 'subscribe')
        .mockImplementation(subscriptionCallbacks => {
          originalSubscribe(subscriptionCallbacks);
          executeUnsubscribe = jest.fn();
          return {unsubscribe: executeUnsubscribe};
        });
      return executeObservable;
    });
});

describe('when loading and disposing same query multiple times', () => {
  it('loads correctly when ast is loaded in between calls to load and initial query ref is disposed', () => {
    let loadedQuery;
    let queryLoaderCallback;

    const QueryRenderer = function ({queryRef}) {
      const data = usePreloadedQuery(query, queryRef);
      return data.node.id;
    };
    const Inner = function ({initialPreloadedQuery}) {
      [loadedQuery, queryLoaderCallback] = useQueryLoader(
        preloadableConcreteRequest,
        initialPreloadedQuery,
      );
      return (
        <React.Suspense fallback="Loading">
          {loadedQuery != null ? (
            <QueryRenderer queryRef={loadedQuery} />
          ) : null}
        </React.Suspense>
      );
    };
    const Container = function ({initialPreloadedQuery = undefined}) {
      return (
        <RelayEnvironmentProvider environment={environment}>
          <Inner initialPreloadedQuery={initialPreloadedQuery} />
        </RelayEnvironmentProvider>
      );
    };
    let instance;
    const render = () => {
      ReactTestRenderer.act(() => {
        instance = ReactTestRenderer.create(
          <RelayEnvironmentProvider environment={environment}>
            <Container />
          </RelayEnvironmentProvider>,
        );
      });
    };
    render();
    if (!instance) {
      throw new Error('Expected renderer instance to be defined');
    }

    ReactTestRenderer.act(() => {
      queryLoaderCallback(variables);
      // Provide the query module ast
      PreloadableQueryRegistry.set(ID, query);
      queryLoaderCallback(variables);
    });
    expect(instance.toJSON()).toEqual('Loading');

    ReactTestRenderer.act(() => {
      sink.next(response);
      sink.complete();
      jest.runAllImmediates();
    });

    expect(instance.toJSON()).toEqual('4');
  });
});

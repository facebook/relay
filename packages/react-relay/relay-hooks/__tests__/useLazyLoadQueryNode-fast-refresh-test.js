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

import type {RelayMockEnvironment} from '../../../relay-test-utils/RelayModernMockEnvironment';
import type {
  OperationDescriptor,
  SelectorData,
} from 'relay-runtime/store/RelayStoreTypes';

const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');
const useLazyLoadQueryNode = require('../useLazyLoadQueryNode');
const React = require('react');
const ReactTestRenderer = require('react-test-renderer');
const {
  __internal: {fetchQuery},
  createOperationDescriptor,
  graphql,
} = require('relay-runtime');
const {createMockEnvironment} = require('relay-test-utils');

function expectToBeRendered(
  renderFn: JestMockFn<Array<mixed>, any & React$Node>,
  readyState: ?SelectorData,
) {
  // Ensure useEffect is called before other timers
  ReactTestRenderer.act(() => {
    jest.runAllImmediates();
  });
  expect(renderFn).toBeCalledTimes(1);
  expect(renderFn.mock.calls[0][0]).toEqual(readyState);
  renderFn.mockClear();
}

function expectToHaveFetched(
  environment: RelayMockEnvironment,
  query: OperationDescriptor,
  cacheConfig: {
    force?: ?boolean,
    liveConfigId?: ?string,
    metadata?: {[key: string]: mixed},
    onSubscribe?: () => void,
    poll?: ?number,
    transactionId?: ?string,
  },
) {
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(environment.execute).toBeCalledTimes(1);
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(environment.execute.mock.calls[0][0].operation).toMatchObject({
    fragment: expect.anything(),
    root: expect.anything(),
    request: {
      node: query.request.node,
      variables: query.request.variables,
    },
  });
  expect(
    environment.mock.isLoading(
      query.request.node,
      query.request.variables,
      cacheConfig,
    ),
  ).toEqual(true);
}

describe('useLazyLoadQueryNode-fast-refresh', () => {
  let environment;
  let gqlQuery;
  let renderFn;
  let query;
  let variables;

  beforeEach(() => {
    jest.resetModules();
    jest.spyOn(console, 'warn').mockImplementationOnce(() => {});

    environment = createMockEnvironment();

    graphql`
      fragment useLazyLoadQueryNodeFastRefreshTestUserFragment on User {
        name
      }
    `;
    gqlQuery = graphql`
      query useLazyLoadQueryNodeFastRefreshTestUserQuery($id: ID) {
        node(id: $id) {
          id
          name
          ...useLazyLoadQueryNodeFastRefreshTestUserFragment
        }
      }
    `;
    variables = {id: '1'};
    query = createOperationDescriptor(gqlQuery, variables);
    // $FlowFixMe[incompatible-use]
    renderFn = jest.fn((result: mixed) => result?.node?.name ?? 'Empty');
  });

  afterEach(() => {
    environment.mockClear();
    jest.clearAllTimers();
  });

  it('force a refetch in fast refresh', () => {
    // $FlowFixMe[cannot-resolve-module] (site=www)
    const ReactRefreshRuntime = require('react-refresh/runtime');
    ReactRefreshRuntime.injectIntoGlobalHook(global);
    const V1 = function (props: {variables: {id: string}}) {
      const _query = createOperationDescriptor(gqlQuery, props.variables);
      const result = useLazyLoadQueryNode<any>({
        query: _query,
        fetchPolicy: 'network-only',
        fetchObservable: fetchQuery(environment, _query),
        componentDisplayName: 'TestDisplayName',
      });
      return renderFn(result);
    };
    ReactRefreshRuntime.register(V1, 'Renderer');

    const instance = ReactTestRenderer.create(
      <RelayEnvironmentProvider environment={environment}>
        <React.Suspense fallback="Fallback">
          <V1 variables={variables} />
        </React.Suspense>
      </RelayEnvironmentProvider>,
    );

    expect(instance.toJSON()).toEqual('Fallback');
    expectToHaveFetched(environment, query, {});
    expect(renderFn).not.toBeCalled();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    expect(environment.retain).toHaveBeenCalledTimes(1);

    ReactTestRenderer.act(() =>
      environment.mock.resolve(gqlQuery, {
        data: {
          node: {
            __typename: 'User',
            id: variables.id,
            name: 'Alice',
          },
        },
      }),
    );

    const data = environment.lookup(query.fragment).data;
    // $FlowFixMe[incompatible-call] Error found while enabling LTI on this file
    // $FlowFixMe[invalid-tuple-arity] Error found while enabling LTI on this file
    expectToBeRendered(renderFn, data);

    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    environment.execute.mockClear();
    renderFn.mockClear();
    function V2(props: any) {
      const _query = createOperationDescriptor(gqlQuery, props.variables);
      const result = useLazyLoadQueryNode<any>({
        query: _query,
        fetchObservable: fetchQuery(environment, _query),
        fetchPolicy: 'network-only',
        componentDisplayName: 'TestDisplayName',
      });
      return renderFn(result);
    }
    // Trigger a fast fresh
    ReactRefreshRuntime.register(V2, 'Renderer');
    ReactTestRenderer.act(() => {
      ReactRefreshRuntime.performReactRefresh();
    });
    // It should start a new fetch in fast refresh
    expectToHaveFetched(environment, query, {});
    expect(renderFn).toBeCalledTimes(1);
    expect(instance.toJSON()).toEqual('Fallback');
    // It should render with the result of the new fetch
    ReactTestRenderer.act(() =>
      environment.mock.resolve(gqlQuery, {
        data: {
          node: {
            __typename: 'User',
            id: variables.id,
            name: 'Bob',
          },
        },
      }),
    );
    expect(instance.toJSON()).toEqual('Bob');
  });
});

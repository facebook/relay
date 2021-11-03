/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const ReactRelayQueryRenderer = require('../ReactRelayQueryRenderer');
const React = require('react');
const {useEffect} = require('react');
const ReactTestRenderer = require('react-test-renderer');
const {
  Observable,
  RelayFeatureFlags,
  createOperationDescriptor,
  getRequest,
  graphql,
} = require('relay-runtime');
const {createMockEnvironment} = require('relay-test-utils');

function expectToHaveFetched(environment, query, {count}) {
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(environment.execute).toBeCalledTimes(count);
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(environment.execute.mock.calls[0][0].operation).toMatchObject({
    fragment: expect.anything(),
    request: {
      node: query.request.node,
      variables: query.request.variables,
    },
    root: expect.anything(),
  });
  expect(
    environment.mock.isLoading(query.request.node, query.request.variables, {
      force: true,
    }),
  ).toEqual(true);
}

// TODO(T83890478): enable once double invoked effects lands in xplat
describe.skip('ReactRelayQueryRenderer-react-double-effects', () => {
  let environment;
  let gqlQuery;
  let query;
  let variables;
  let release;
  let cancelNetworkRequest;

  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementationOnce(() => {});
    RelayFeatureFlags.ENABLE_QUERY_RENDERER_OFFSCREEN_SUPPORT = true;

    environment = createMockEnvironment();
    release = jest.fn();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    const originalRetain = environment.retain;
    (environment: $FlowFixMe).retain = jest.fn(operation => {
      const originalDisposable = originalRetain(operation);
      return {
        dispose() {
          release();
          return originalDisposable.dispose();
        },
      };
    });

    cancelNetworkRequest = jest.fn();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    const originalExecute = environment.execute;
    (environment: $FlowFixMe).execute = jest.fn((...args) => {
      const originalObservable = originalExecute(...args);

      return Observable.create(sink => {
        const sub = originalObservable.subscribe(sink);
        return () => {
          cancelNetworkRequest();
          sub.unsubscribe();
        };
      });
    });

    gqlQuery = getRequest(graphql`
      query ReactRelayQueryRendererReactDoubleEffectsTestUserQuery($id: ID!) {
        node(id: $id) {
          id
          ... on User {
            name
          }
        }
      }
    `);

    variables = {id: '1'};
    query = createOperationDescriptor(gqlQuery, variables, {force: true});
  });

  afterEach(() => {
    environment.mockClear();
    jest.clearAllTimers();
    RelayFeatureFlags.ENABLE_QUERY_RENDERER_OFFSCREEN_SUPPORT = false;
  });

  it('forces a re-render and refetches query when effects are double invoked', () => {
    let renderLogs = [];
    const QueryComponent = function ({node}) {
      const name = node?.name ?? 'Empty';
      useEffect(() => {
        renderLogs.push(`commit: ${name}`);
        return () => {
          renderLogs.push(`cleanup: ${name}`);
        };
      }, [name]);

      renderLogs.push(`render: ${name}`);
      return name;
    };

    const QueryContainer = function (props) {
      return (
        <ReactRelayQueryRenderer
          cacheConfig={{force: true}}
          environment={environment}
          query={gqlQuery}
          render={({props: renderProps}) => {
            if (!renderProps) {
              return 'Fallback';
            }
            return <QueryComponent node={renderProps.node} />;
          }}
          variables={props.variables}
        />
      );
    };

    let instance;
    ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(
        // Using StrictMode will trigger double invoke effect behavior
        <React.StrictMode>
          <QueryContainer variables={variables} />
        </React.StrictMode>,
        // $FlowFixMe
        {unstable_isConcurrent: true, unstable_strictMode: true},
      );
    });
    if (!instance) {
      throw new Error('Failed to render during test.');
    }

    // After the component mounts, React double invoke effects will
    // be triggered, simulating what would happen if the component was
    // hidden and re-shown:

    // The effect cleanup will execute, so we assert that
    // the query is disposed:
    expect(release).toHaveBeenCalledTimes(1);
    // And that the request is cancelled
    expect(cancelNetworkRequest).toHaveBeenCalledTimes(1);

    // The component will be "reconstructed", so we assert
    // that a second network request is started
    expectToHaveFetched(environment, query, {count: 2});

    // Assert that query is permanentently retained
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    expect(environment.retain).toHaveBeenCalledTimes(2);

    // Assert the loading state while the query is loading
    expect(renderLogs).toEqual([]);
    expect(instance.toJSON()).toEqual('Fallback');

    // Resolve network response
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    environment.execute.mockClear();
    ReactTestRenderer.act(() => {
      environment.mock.resolve(gqlQuery, {
        data: {
          node: {
            __typename: 'User',
            id: variables.id,
            name: 'Alice 1',
            username: 'Alice',
          },
        },
      });
      jest.runAllImmediates();
    });

    expect(instance.toJSON()).toEqual('Alice 1');
    expect(renderLogs).toEqual([
      'render: Alice 1',
      'commit: Alice 1',
      'cleanup: Alice 1',
      'commit: Alice 1',
    ]);

    // Assert component is properly subscribed to the data.
    renderLogs = [];
    ReactTestRenderer.act(() => {
      environment.commitPayload(query, {
        node: {
          __typename: 'User',
          id: variables.id,
          name: 'Alice 2',
          username: 'Alice',
        },
      });
    });

    expect(instance.toJSON()).toEqual('Alice 2');
    expect(renderLogs).toEqual([
      'render: Alice 2',
      'cleanup: Alice 1',
      'commit: Alice 2',
    ]);
  });
});

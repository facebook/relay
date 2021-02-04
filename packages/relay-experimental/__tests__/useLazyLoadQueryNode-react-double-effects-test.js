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

const React = require('react');
const ReactTestRenderer = require('react-test-renderer');
const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');

const useLazyLoadQueryNode = require('../useLazyLoadQueryNode');

const {useEffect} = require('react');
const {
  createOperationDescriptor,
  __internal: {fetchQuery},
} = require('relay-runtime');

function expectToHaveFetched(environment, query, cacheConfig) {
  expect(environment.execute).toBeCalledTimes(1);
  expect(environment.execute.mock.calls[0][0].operation).toMatchObject({
    fragment: expect.anything(),
    request: {
      node: query.request.node,
      variables: query.request.variables,
    },
    root: expect.anything(),
  });
  expect(
    environment.mock.isLoading(
      query.request.node,
      query.request.variables,
      cacheConfig,
    ),
  ).toEqual(true);
}

// TODO(T83890478): enable once double invoked effects lands in xplat
describe.skip('useLazyLoadQueryNode-react-double-effects', () => {
  let environment;
  let gqlQuery;
  let createMockEnvironment;
  let generateAndCompile;
  let query;
  let variables;
  let release;

  beforeEach(() => {
    jest.mock('scheduler', () => require('scheduler/unstable_mock'));
    jest.spyOn(console, 'warn').mockImplementationOnce(() => {});

    ({
      createMockEnvironment,
      generateAndCompile,
    } = require('relay-test-utils-internal'));

    environment = createMockEnvironment();

    release = jest.fn();
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

    const generated = generateAndCompile(`
      fragment UserFragment on User {
        name
      }

      query UserQuery($id: ID) {
        node(id: $id) {
          id
          name
          ...UserFragment
        }
      }
    `);
    gqlQuery = generated.UserQuery;
    variables = {id: '1'};
    query = createOperationDescriptor(gqlQuery, variables);
  });

  afterEach(() => {
    environment.mockClear();
    jest.clearAllTimers();
  });

  it('forces a re-render when effects are double invoked and refetches when policy is network-only', () => {
    let renderLogs = [];
    const QueryComponent = function() {
      const result = useLazyLoadQueryNode<_>({
        componentDisplayName: 'TestDisplayName',
        fetchObservable: fetchQuery(environment, query),
        fetchPolicy: 'network-only',
        query,
      });

      const name = result?.node?.name ?? 'Empty';
      useEffect(() => {
        renderLogs.push(`commit: ${name}`);
        return () => {
          renderLogs.push(`cleanup: ${name}`);
        };
      }, [name]);

      renderLogs.push(`render: ${name}`);
      return name;
    };

    let instance;
    ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(
        // Using StrictMode will trigger double invoke effect behavior
        <React.StrictMode>
          <RelayEnvironmentProvider environment={environment}>
            <React.Suspense fallback="Fallback">
              <QueryComponent variables={variables} />
            </React.Suspense>
          </RelayEnvironmentProvider>
        </React.StrictMode>,
        // $FlowFixMe
        {unstable_isConcurrent: true},
      );
    });
    if (!instance) {
      throw new Error('Failed to render during test.');
    }

    // Assert that query is suspended
    expectToHaveFetched(environment, query, {});
    expect(environment.retain).toHaveBeenCalledTimes(1);
    expect(renderLogs).toEqual([]);
    expect(instance.toJSON()).toEqual('Fallback');

    // Resolve network response
    environment.execute.mockClear();
    ReactTestRenderer.act(() => {
      environment.mock.resolve(gqlQuery, {
        data: {
          node: {
            __typename: 'User',
            id: variables.id,
            name: 'Alice 1',
          },
        },
      });
      jest.runAllImmediates();
    });

    // After the query resolves, the component will mount, and
    // React double invoke effects will be triggered, simulating what would
    // happen if the component was hidden and re-shown:

    // The effect cleanup will execute, so we assert that
    // the query is disposed:
    expect(release).toHaveBeenCalledTimes(1);

    // The effect setup will re-execute, so we assert that
    // a re-render is triggered to refetch, re-retain, and
    // re-suspend:
    expectToHaveFetched(environment, query, {});
    expect(environment.retain).toHaveBeenCalledTimes(2);
    expect(instance.toJSON()).toEqual('Fallback');

    // Assert render state of component using the query up until
    // the point of re-suspending:
    expect(renderLogs).toEqual([
      // Assert component rendered and committed when network resolved:
      'render: Alice 1',
      'commit: Alice 1',

      // Assert double invoked effects simulates an unmount and remount.
      // Note that render doesn't happen in between:
      'cleanup: Alice 1',
      'commit: Alice 1',
    ]);

    // Resolve second network response
    renderLogs = [];
    environment.execute.mockClear();
    ReactTestRenderer.act(() => {
      environment.mock.resolve(gqlQuery, {
        data: {
          node: {
            __typename: 'User',
            id: variables.id,
            name: 'Alice 2',
          },
        },
      });
      jest.runAllImmediates();
    });

    // Assert that after refetch: double invoke effects don't trigger
    // again, and that we don't trigger a second refetch
    expect(environment.execute).toHaveBeenCalledTimes(0);
    expect(release).toHaveBeenCalledTimes(1);
    expect(environment.retain).toHaveBeenCalledTimes(2);
    expect(renderLogs).toEqual([
      'render: Alice 2',
      'cleanup: Alice 1',
      'commit: Alice 2',
    ]);
    expect(instance.toJSON()).toEqual('Alice 2');

    // Assert that query was correctly permanently retained,
    // and not released after a timeout
    ReactTestRenderer.act(() => {
      jest.runAllTimers();
    });
    expect(release).toHaveBeenCalledTimes(1);
    expect(environment.retain).toHaveBeenCalledTimes(2);
  });

  it('forces a re-render when effects are double invoked and does not refetch when policy is store-or-network', () => {
    const renderLogs = [];
    const QueryComponent = function() {
      const result = useLazyLoadQueryNode<_>({
        componentDisplayName: 'TestDisplayName',
        fetchObservable: fetchQuery(environment, query),
        fetchPolicy: 'store-or-network',
        query,
      });

      const name = result?.node?.name ?? 'Empty';
      useEffect(() => {
        renderLogs.push(`commit: ${name}`);
        return () => {
          renderLogs.push(`cleanup: ${name}`);
        };
      }, [name]);

      renderLogs.push(`render: ${name}`);
      return name;
    };

    let instance;
    ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(
        // Using StrictMode will trigger double invoke effect behavior
        <React.StrictMode>
          <RelayEnvironmentProvider environment={environment}>
            <React.Suspense fallback="Fallback">
              <QueryComponent variables={variables} />
            </React.Suspense>
          </RelayEnvironmentProvider>
        </React.StrictMode>,
        // $FlowFixMe
        {unstable_isConcurrent: true},
      );
    });
    if (!instance) {
      throw new Error('Failed to render during test.');
    }

    // Assert that query is suspended
    expectToHaveFetched(environment, query, {});
    expect(environment.retain).toHaveBeenCalledTimes(1);
    expect(renderLogs).toEqual([]);
    expect(instance.toJSON()).toEqual('Fallback');

    // Resolve network response
    environment.execute.mockClear();
    ReactTestRenderer.act(() => {
      environment.mock.resolve(gqlQuery, {
        data: {
          node: {
            __typename: 'User',
            id: variables.id,
            name: 'Alice 1',
          },
        },
      });
      jest.runAllImmediates();
    });

    // After the query resolves, the component will mount, and
    // React double invoke effects will be triggered, simulating what would
    // happen if the component was hidden and re-shown:

    // The effect cleanup will execute, so we assert that
    // the query is disposed:
    expect(release).toHaveBeenCalledTimes(1);

    // The effect setup will re-execute, so we assert that
    // a re-render is triggered to re-retain, but it does not
    // refetch:
    expect(environment.execute).toHaveBeenCalledTimes(0);
    expect(environment.retain).toHaveBeenCalledTimes(2);

    // Assert render state of component using the query after re-rendering:
    expect(renderLogs).toEqual([
      // Assert component rendered and committed when network resolved:
      'render: Alice 1',
      'commit: Alice 1',

      // Assert double invoked effects simulates an unmount and remount.
      // Note that render doesn't happen in between:
      'cleanup: Alice 1',
      'commit: Alice 1',

      // Assert final re-render triggered by query, without
      // fetching or suspending again. It does not trigger a commit
      // since the name didn't change.
      'render: Alice 1',
    ]);
    expect(instance.toJSON()).toEqual('Alice 1');

    // Assert that query was correctly permanently retained,
    // and not released after a timeout
    ReactTestRenderer.act(() => {
      jest.runAllTimers();
    });
    expect(release).toHaveBeenCalledTimes(1);
    expect(environment.retain).toHaveBeenCalledTimes(2);
  });
});

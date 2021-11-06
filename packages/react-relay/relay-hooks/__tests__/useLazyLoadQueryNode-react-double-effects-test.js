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

const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');
const useFragment = require('../useFragment');
const useLazyLoadQuery = require('../useLazyLoadQuery');
const React = require('react');
const {useEffect} = require('react');
const ReactTestRenderer = require('react-test-renderer');
const {
  Observable,
  createOperationDescriptor,
  getFragment,
  getRequest,
  graphql,
} = require('relay-runtime');
const {createMockEnvironment} = require('relay-test-utils');

function expectToHaveFetched(environment, query) {
  // $FlowFixMe[method-unbinding] added when improving typing for this parameters
  expect(environment.execute).toBeCalledTimes(1);
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
describe.skip('useLazyLoadQueryNode-react-double-effects', () => {
  let environment;
  let gqlQuery;
  let gqlQueryWithDefer;
  let gqlFragment;
  let query;
  let queryWithDefer;
  let variables;
  let release;
  let cancelNetworkRequest;

  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementationOnce(() => {});
    jest.mock('ReactFeatureFlags', () => {
      return {
        ...jest.requireActual('ReactFeatureFlags'),
        enableDoubleInvokingEffects: true,
      };
    });

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
      query useLazyLoadQueryNodeReactDoubleEffectsTestUserQuery($id: ID) {
        node(id: $id) {
          id
          name
          ...useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment
        }
      }
    `);
    gqlQueryWithDefer = getRequest(graphql`
      query useLazyLoadQueryNodeReactDoubleEffectsTestUserQueryWithDeferQuery(
        $id: ID
      ) {
        node(id: $id) {
          id
          name
          ...useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment @defer
        }
      }
    `);
    gqlFragment = getFragment(graphql`
      fragment useLazyLoadQueryNodeReactDoubleEffectsTestUserFragment on User {
        firstName
      }
    `);
    variables = {id: '1'};
    query = createOperationDescriptor(gqlQuery, variables, {force: true});
    queryWithDefer = createOperationDescriptor(gqlQueryWithDefer, variables, {
      force: true,
    });
  });

  afterEach(() => {
    environment.mockClear();
    jest.clearAllTimers();
  });

  it('forces a re-render when effects are double invoked and refetches when policy is network-only', () => {
    let renderLogs = [];
    const QueryComponent = function () {
      const result = useLazyLoadQuery<_>(gqlQuery, variables, {
        fetchPolicy: 'network-only',
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
    expectToHaveFetched(environment, query);
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    expect(environment.retain).toHaveBeenCalledTimes(1);
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
            firstName: 'Alice',
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
    // Request is "cancelled" because susbcription cleanup runs on completion
    expect(cancelNetworkRequest).toHaveBeenCalledTimes(1);

    // The effect setup will re-execute, so we assert that
    // a re-render is triggered to refetch, re-retain, and
    // re-suspend:
    expectToHaveFetched(environment, query);
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
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

    // Resolve response for second request
    renderLogs = [];
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    environment.execute.mockClear();
    ReactTestRenderer.act(() => {
      environment.mock.resolve(gqlQuery, {
        data: {
          node: {
            __typename: 'User',
            firstName: 'Alice',
            id: variables.id,
            name: 'Alice 2',
          },
        },
      });
      jest.runAllImmediates();
    });

    // Assert that after refetch: double invoke effects don't trigger
    // again, and that we don't trigger a second refetch
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    expect(environment.execute).toHaveBeenCalledTimes(0);
    expect(release).toHaveBeenCalledTimes(1);
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
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
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    expect(environment.retain).toHaveBeenCalledTimes(2);
  });

  it('forces a re-render when effects are double invoked and does not refetch when policy is store-or-network', () => {
    const renderLogs = [];
    const QueryComponent = function () {
      const result = useLazyLoadQuery<_>(gqlQuery, variables, {
        fetchPolicy: 'store-or-network',
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
    expectToHaveFetched(environment, query);
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    expect(environment.retain).toHaveBeenCalledTimes(1);
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
            firstName: 'Alice',
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
    // Request is "cancelled" because susbcription cleanup runs on completion
    expect(cancelNetworkRequest).toHaveBeenCalledTimes(1);

    // The effect setup will re-execute, so we assert that
    // a re-render is triggered to re-retain, but it does not
    // refetch:
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    expect(environment.execute).toHaveBeenCalledTimes(0);
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
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
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    expect(environment.retain).toHaveBeenCalledTimes(2);
  });

  describe('with incremental delivery', () => {
    it('with incremental delivery, forces a re-render when effects are double invoked and refetches when policy is network-only', () => {
      let renderLogs = [];
      const FragmentComponent = function (props) {
        const data = useFragment(gqlFragment, props.user);
        return data?.firstName === undefined ? 'Missing fragment data' : null;
      };

      const QueryComponent = function () {
        const result = useLazyLoadQuery<_>(gqlQueryWithDefer, variables, {
          fetchPolicy: 'network-only',
        });

        const name = result?.node?.name ?? 'Empty';
        useEffect(() => {
          renderLogs.push(`commit: ${name}`);
          return () => {
            renderLogs.push(`cleanup: ${name}`);
          };
        }, [name]);

        renderLogs.push(`render: ${name}`);
        return (
          <>
            {name}
            <React.Suspense fallback="Loading fragment">
              <FragmentComponent user={result?.node} />
            </React.Suspense>
          </>
        );
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
      expectToHaveFetched(environment, queryWithDefer);
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.retain).toHaveBeenCalledTimes(1);
      expect(renderLogs).toEqual([]);
      expect(instance.toJSON()).toEqual('Fallback');

      // Resolve network response
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      environment.execute.mockClear();
      ReactTestRenderer.act(() => {
        environment.mock.nextValue(gqlQueryWithDefer, {
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

      // After the first payload of the query resolves, the component
      // will mount, and React double invoke effects will be triggered,
      // simulating what would happen if the component was hidden and re-shown:

      // The effect cleanup will execute, so we assert that the query is
      // disposed. The network request is not canceled because it is not
      // a live query.
      expect(release).toHaveBeenCalledTimes(1);
      expect(cancelNetworkRequest).toHaveBeenCalledTimes(0);

      // The effect setup will re-execute, so we assert that
      // a re-render is triggered along with another retain.
      // We don't re-fetch because the existing request wasn't
      // cancelled when the component was unmounted, and is still ongoing.
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.execute).toBeCalledTimes(0);
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.retain).toHaveBeenCalledTimes(2);
      // Since the request is not canceled when the component is hidden,
      // it's still underway when the component is shown again; therefore
      // the component sees the initial part even though it's network-only,
      // and doesn't re-suspend.
      expect(instance.toJSON()).toEqual(['Alice 1', 'Loading fragment']);

      // Assert render state of component using the query up until now:
      expect(renderLogs).toEqual([
        // Assert component rendered and committed when network resolved:
        'render: Alice 1',
        'commit: Alice 1',

        // Assert double invoked effects simulates an unmount and remount.
        // Note that render doesn't happen in between:
        'cleanup: Alice 1',
        'commit: Alice 1',

        // Assert final re-render triggered by query.
        // It does not trigger a commit since the name didn't change.
        'render: Alice 1',
      ]);

      // Resolve response for second request
      renderLogs = [];
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      environment.execute.mockClear();
      ReactTestRenderer.act(() => {
        environment.mock.nextValue(gqlQueryWithDefer, {
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
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.execute).toHaveBeenCalledTimes(0);
      expect(release).toHaveBeenCalledTimes(1);
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.retain).toHaveBeenCalledTimes(2);
      expect(renderLogs).toEqual([
        'render: Alice 2',
        'cleanup: Alice 1',
        'commit: Alice 2',
      ]);
      expect(instance.toJSON()).toEqual(['Alice 2', 'Loading fragment']);

      // Resolve incremental payload for second network request
      ReactTestRenderer.act(() => {
        environment.mock.resolve(gqlQueryWithDefer, {
          data: {
            __typename: 'User',
            firstName: 'Alice',
            id: variables.id,
          },
          label: 'UserQueryWithDefer$defer$UserFragment',
          path: ['node'],
        });
        jest.runAllImmediates();
      });

      // Assert that after refetch: double invoke effects don't trigger
      // again, and that we don't trigger a second refetch
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.execute).toHaveBeenCalledTimes(0);
      expect(release).toHaveBeenCalledTimes(1);
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
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
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.retain).toHaveBeenCalledTimes(2);
    });

    it('with incremental delivery, forces a re-render when effects are double invoked and refetches when policy is store-or-network', () => {
      let renderLogs = [];
      const FragmentComponent = function (props) {
        const data = useFragment(gqlFragment, props.user);
        return data?.firstName === undefined ? 'Missing fragment data' : null;
      };

      const QueryComponent = function () {
        const result = useLazyLoadQuery<_>(gqlQueryWithDefer, variables, {
          fetchPolicy: 'store-or-network',
        });

        const name = result?.node?.name ?? 'Empty';
        useEffect(() => {
          renderLogs.push(`commit: ${name}`);
          return () => {
            renderLogs.push(`cleanup: ${name}`);
          };
        }, [name]);

        renderLogs.push(`render: ${name}`);
        return (
          <>
            {name}
            <React.Suspense fallback="Loading fragment">
              <FragmentComponent user={result?.node} />
            </React.Suspense>
          </>
        );
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
      expectToHaveFetched(environment, queryWithDefer);
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.retain).toHaveBeenCalledTimes(1);
      expect(renderLogs).toEqual([]);
      expect(instance.toJSON()).toEqual('Fallback');

      // Resolve network response
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      environment.execute.mockClear();
      ReactTestRenderer.act(() => {
        environment.mock.nextValue(gqlQueryWithDefer, {
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

      // After the first payload of the query resolves, the component
      // will mount, and React double invoke effects will be triggered,
      // simulating what would happen if the component was hidden and re-shown:

      // The effect cleanup will execute, so we assert that the query is
      // disposed. The network request is not canceled because it is not
      // a live query.
      expect(release).toHaveBeenCalledTimes(1);
      expect(cancelNetworkRequest).toHaveBeenCalledTimes(0);

      // The effect setup will re-execute, so we assert that
      // a re-render is triggered along with another retain.
      // We don't re-fetch because the existing request wasn't
      // cancelled when the component was unmounted, and is still ongoing.
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.execute).toBeCalledTimes(0);
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.retain).toHaveBeenCalledTimes(2);
      expect(instance.toJSON()).toEqual(['Alice 1', 'Loading fragment']);

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

        // Assert final re-render triggered by query.
        // It does not trigger a commit since the name didn't change.
        'render: Alice 1',
      ]);

      // Resolve response for second request
      renderLogs = [];
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      environment.execute.mockClear();
      ReactTestRenderer.act(() => {
        environment.mock.nextValue(gqlQueryWithDefer, {
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
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.execute).toHaveBeenCalledTimes(0);
      expect(release).toHaveBeenCalledTimes(1);
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.retain).toHaveBeenCalledTimes(2);
      expect(renderLogs).toEqual([
        'render: Alice 2',
        'cleanup: Alice 1',
        'commit: Alice 2',
      ]);
      expect(instance.toJSON()).toEqual(['Alice 2', 'Loading fragment']);

      // Resolve incremental payload for second network request
      ReactTestRenderer.act(() => {
        environment.mock.resolve(gqlQueryWithDefer, {
          data: {
            __typename: 'User',
            firstName: 'Alice',
            id: variables.id,
          },
          label: 'UserQueryWithDefer$defer$UserFragment',
          path: ['node'],
        });
        jest.runAllImmediates();
      });

      // Assert that after refetch: double invoke effects don't trigger
      // again, and that we don't trigger a second refetch
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.execute).toHaveBeenCalledTimes(0);
      expect(release).toHaveBeenCalledTimes(1);
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
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
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.retain).toHaveBeenCalledTimes(2);
    });
  });
});

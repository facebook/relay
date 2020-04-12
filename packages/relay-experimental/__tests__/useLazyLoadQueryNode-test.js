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

const useFragmentNode = require('../useFragmentNode');
const useLazyLoadQueryNode = require('../useLazyLoadQueryNode');

const {createOperationDescriptor, getFragment} = require('relay-runtime');

import type {FetchPolicy} from 'relay-runtime';

const defaultFetchPolicy = 'network-only';

function expectToBeRendered(renderFn, readyState) {
  // Ensure useEffect is called before other timers
  ReactTestRenderer.act(() => {
    jest.runAllImmediates();
  });
  expect(renderFn).toBeCalledTimes(1);
  expect(renderFn.mock.calls[0][0]).toEqual(readyState);
  renderFn.mockClear();
}

function expectToHaveFetched(environment, query) {
  expect(environment.execute).toBeCalledTimes(1);
  expect(environment.execute.mock.calls[0][0].operation).toMatchObject({
    fragment: expect.anything(),
    root: expect.anything(),
    request: {
      node: query.request.node,
      variables: query.request.variables,
    },
  });
  expect(
    environment.mock.isLoading(query.request.node, query.request.variables, {
      force: true,
    }),
  ).toEqual(true);
}

type Props = {|variables: {...}, fetchPolicy?: FetchPolicy|};

describe('useLazyLoadQueryNode', () => {
  let environment;
  let gqlQuery;
  let renderFn;
  let render;
  let release;
  let createMockEnvironment;
  let generateAndCompile;
  let query;
  let variables;
  let Container;
  let setProps;
  let logs;

  beforeEach(() => {
    jest.resetModules();
    jest.spyOn(console, 'warn').mockImplementationOnce(() => {});

    ({
      createMockEnvironment,
      generateAndCompile,
    } = require('relay-test-utils-internal'));

    class ErrorBoundary extends React.Component<any, any> {
      state = {error: null};
      componentDidCatch(error) {
        this.setState({error});
      }
      render() {
        const {children, fallback} = this.props;
        const {error} = this.state;
        if (error) {
          return React.createElement(fallback, {error});
        }
        return children;
      }
    }

    const Renderer = (props: Props) => {
      const _query = createOperationDescriptor(gqlQuery, props.variables);
      const data = useLazyLoadQueryNode<_>({
        query: _query,
        fetchPolicy: props.fetchPolicy || defaultFetchPolicy,
        componentDisplayName: 'TestDisplayName',
      });
      return renderFn(data);
    };

    Container = (props: Props) => {
      const [nextProps, setNextProps] = React.useState(props);
      setProps = setNextProps;
      return <Renderer {...nextProps} />;
    };

    render = (env, children) => {
      return ReactTestRenderer.create(
        <RelayEnvironmentProvider environment={env}>
          <ErrorBoundary
            fallback={({error}) =>
              `Error: ${error.message + ': ' + error.stack}`
            }>
            <React.Suspense fallback="Fallback">{children}</React.Suspense>
          </ErrorBoundary>
        </RelayEnvironmentProvider>,
      );
    };

    logs = [];
    environment = createMockEnvironment({
      log: event => {
        logs.push(event);
      },
    });
    release = jest.fn();
    const originalRetain = environment.retain.bind(environment);
    // $FlowFixMe
    environment.retain = jest.fn((...args) => {
      const originalDisposable = originalRetain(...args);
      return {
        dispose: () => {
          release(args[0].variables);
          originalDisposable.dispose();
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

      fragment RootFragment on Query {
        node(id: $id) {
          id
          name
          ...UserFragment
        }
      }

      query OnlyFragmentsQuery($id: ID) {
        ...RootFragment
      }
    `);
    gqlQuery = generated.UserQuery;
    variables = {id: '1'};
    query = createOperationDescriptor(gqlQuery, variables);
    renderFn = jest.fn(result => result?.node?.name ?? 'Empty');
  });

  afterEach(() => {
    environment.mockClear();
    jest.clearAllTimers();
  });

  it('fetches and renders the query data', () => {
    const instance = render(environment, <Container variables={variables} />);

    expect(instance.toJSON()).toEqual('Fallback');
    expectToHaveFetched(environment, query);
    expect(renderFn).not.toBeCalled();
    expect(environment.retain).toHaveBeenCalledTimes(1);

    environment.mock.resolve(gqlQuery, {
      data: {
        node: {
          __typename: 'User',
          id: variables.id,
          name: 'Alice',
        },
      },
    });

    const data = environment.lookup(query.fragment).data;
    expectToBeRendered(renderFn, data);
  });

  it('subscribes to query fragment results and preserves object identity', () => {
    const instance = render(environment, <Container variables={variables} />);

    expect(instance.toJSON()).toEqual('Fallback');
    expectToHaveFetched(environment, query);
    expect(renderFn).not.toBeCalled();
    expect(environment.retain).toHaveBeenCalledTimes(1);

    environment.mock.resolve(gqlQuery, {
      data: {
        node: {
          __typename: 'User',
          id: variables.id,
          name: 'Alice',
        },
      },
    });

    ReactTestRenderer.act(() => {
      jest.runAllImmediates();
    });
    expect(renderFn).toBeCalledTimes(1);
    const prevData = renderFn.mock.calls[0][0];
    expect(prevData.node.name).toBe('Alice');
    renderFn.mockClear();
    ReactTestRenderer.act(() => {
      jest.runAllImmediates();
    });

    environment.commitUpdate(store => {
      const alice = store.get('1');
      if (alice != null) {
        alice.setValue('ALICE', 'name');
      }
    });
    expect(renderFn).toBeCalledTimes(1);
    const nextData = renderFn.mock.calls[0][0];
    expect(nextData.node.name).toBe('ALICE');
    renderFn.mockClear();

    // object identity is preserved for unchanged data such as fragment references
    expect(nextData.node.__fragments).toBe(prevData.node.__fragments);
  });

  it('fetches and renders correctly even if fetched query data still has missing data', () => {
    // This scenario might happen if for example we are making selections on
    // abstract types which the concrete type doesn't implemenet

    const instance = render(environment, <Container variables={variables} />);

    expect(instance.toJSON()).toEqual('Fallback');
    expectToHaveFetched(environment, query);
    expect(renderFn).not.toBeCalled();
    expect(environment.retain).toHaveBeenCalledTimes(1);

    environment.mock.resolve(gqlQuery, {
      data: {
        node: {
          __typename: 'User',
          id: variables.id,
          // name is missing in response
        },
      },
    });

    const data = environment.lookup(query.fragment).data;
    expectToBeRendered(renderFn, data);
  });

  it('fetches and renders correctly if component unmounts before it can commit', () => {
    const payload = {
      data: {
        node: {
          __typename: 'User',
          id: variables.id,
          name: 'Alice',
        },
      },
    };

    let instance = render(environment, <Container variables={variables} />);

    expect(instance.toJSON()).toEqual('Fallback');
    expectToHaveFetched(environment, query);
    expect(renderFn).not.toBeCalled();
    expect(environment.retain).toHaveBeenCalledTimes(1);

    ReactTestRenderer.act(() => {
      environment.mock.resolve(gqlQuery, payload);
    });

    // Unmount the component before it gets to permanently retain the data
    instance.unmount();
    expect(renderFn).not.toBeCalled();

    // Running all immediates makes sure all useEffects run and GC isn't
    // Triggered by mistake
    ReactTestRenderer.act(() => jest.runAllImmediates());
    // Trigger timeout and GC to clear all references
    ReactTestRenderer.act(() => jest.runAllTimers());
    // Verify GC has run
    expect(
      environment
        .getStore()
        .getSource()
        .toJSON(),
    ).toEqual({});

    renderFn.mockClear();
    environment.retain.mockClear();
    environment.execute.mockClear();

    instance = render(environment, <Container variables={variables} />);

    expect(instance.toJSON()).toEqual('Fallback');
    expectToHaveFetched(environment, query);
    expect(renderFn).not.toBeCalled();
    expect(environment.retain).toHaveBeenCalledTimes(1);

    ReactTestRenderer.act(() => {
      environment.mock.resolve(gqlQuery, payload);
    });

    const data = environment.lookup(query.fragment).data;
    expectToBeRendered(renderFn, data);
  });

  it('fetches and renders correctly when switching between queries', () => {
    // Render the component
    const initialQuery = createOperationDescriptor(gqlQuery, {
      id: 'first-render',
    });
    environment.commitPayload(initialQuery, {
      node: {
        __typename: 'User',
        id: 'first-render',
        name: 'Bob',
      },
    });

    const instance = render(
      environment,
      <Container variables={{id: 'first-render'}} fetchPolicy="store-only" />,
    );
    expect(instance.toJSON()).toEqual('Bob');
    renderFn.mockClear();

    // Suspend on the first query
    ReactTestRenderer.act(() => {
      setProps({variables});
    });

    expect(instance.toJSON()).toEqual('Fallback');
    expectToHaveFetched(environment, query);
    expect(renderFn).not.toBeCalled();
    renderFn.mockClear();
    environment.retain.mockClear();
    environment.execute.mockClear();

    // Switch to the second query
    const nextVariables = {id: '2'};
    const nextQuery = createOperationDescriptor(gqlQuery, nextVariables);
    ReactTestRenderer.act(() => {
      setProps({variables: nextVariables});
    });

    expect(instance.toJSON()).toEqual('Fallback');
    expectToHaveFetched(environment, nextQuery);
    expect(renderFn).not.toBeCalled();
    expect(environment.retain).toHaveBeenCalledTimes(1);
    renderFn.mockClear();
    environment.retain.mockClear();
    environment.execute.mockClear();

    // Switch back to the first query, it shouldn't request again
    ReactTestRenderer.act(() => {
      setProps({variables});
    });

    expect(instance.toJSON()).toEqual('Fallback');
    expect(environment.execute).toBeCalledTimes(0);
    expect(renderFn).not.toBeCalled();
    expect(environment.retain).toHaveBeenCalledTimes(0);

    const payload = {
      data: {
        node: {
          __typename: 'User',
          id: variables.id,
          name: 'Alice',
        },
      },
    };
    ReactTestRenderer.act(() => {
      environment.mock.resolve(gqlQuery, payload);
      jest.runAllImmediates();
    });
    const data = environment.lookup(query.fragment).data;
    expect(renderFn.mock.calls[0][0]).toEqual(data);
    expect(instance.toJSON()).toEqual('Alice');
  });

  it('disposes ongoing network request when component unmounts while suspended', () => {
    const initialVariables = {id: 'first-render'};
    const initialQuery = createOperationDescriptor(gqlQuery, initialVariables);
    environment.commitPayload(initialQuery, {
      node: {
        __typename: 'User',
        id: 'first-render',
        name: 'Bob',
      },
    });

    const instance = render(
      environment,
      <Container variables={{id: 'first-render'}} fetchPolicy="store-only" />,
    );

    expect(instance.toJSON()).toEqual('Bob');
    renderFn.mockClear();
    environment.execute.mockClear();

    // Suspend on the first query
    ReactTestRenderer.act(() => {
      setProps({variables, fetchPolicy: 'store-or-network'});
    });

    expect(instance.toJSON()).toEqual('Fallback');
    expectToHaveFetched(environment, query);
    expect(renderFn).not.toBeCalled();
    expect(environment.retain).toHaveBeenCalledTimes(2);
    renderFn.mockClear();
    environment.retain.mockClear();
    environment.execute.mockClear();

    ReactTestRenderer.act(() => {
      instance.unmount();
    });

    // Assert data is released
    expect(release).toBeCalledTimes(2);

    // Assert request in flight is cancelled
    expect(environment.mock.isLoading(query.request.node, variables)).toEqual(
      false,
    );
  });

  it('disposes ongoing network request when component unmounts after committing', () => {
    const instance = render(environment, <Container variables={variables} />);

    expect(instance.toJSON()).toEqual('Fallback');
    expectToHaveFetched(environment, query);
    expect(renderFn).not.toBeCalled();
    expect(environment.retain).toHaveBeenCalledTimes(1);

    // Resolve a payload but don't complete the network request
    environment.mock.nextValue(gqlQuery, {
      data: {
        node: {
          __typename: 'User',
          id: variables.id,
          name: 'Alice',
        },
      },
    });

    // Assert that the component unsuspended and mounted
    const data = environment.lookup(query.fragment).data;
    expectToBeRendered(renderFn, data);

    ReactTestRenderer.act(() => {
      instance.unmount();
    });

    // Assert data is released
    expect(release).toBeCalledTimes(1);
    // Assert request in flight is cancelled
    expect(environment.mock.isLoading(query.request.node, variables)).toEqual(
      false,
    );
  });

  describe('partial rendering', () => {
    it('does not suspend at the root if query does not have direct data dependencies', () => {
      const generated = generateAndCompile(`
      fragment RootFragment on Query {
        node(id: $id) {
          id
          name
        }
      }

      query OnlyFragmentsQuery($id: ID) {
        ...RootFragment
      }
    `);
      const gqlOnlyFragmentsQuery = generated.OnlyFragmentsQuery;
      const gqlFragment = generated.RootFragment;
      const onlyFragsQuery = createOperationDescriptor(
        gqlOnlyFragmentsQuery,
        variables,
      );

      function FragmentComponent(props) {
        const fragment = getFragment(gqlFragment);
        const result: $FlowFixMe = useFragmentNode(
          fragment,
          props.query,
          'TestUseFragment',
        );
        renderFn(result.data);
        return null;
      }

      const Renderer = props => {
        const _query = createOperationDescriptor(
          gqlOnlyFragmentsQuery,
          props.variables,
        );
        const data = useLazyLoadQueryNode<_>({
          componentDisplayName: 'TestDisplayName',
          fetchPolicy: 'store-or-network',
          query: _query,
          renderPolicy: 'partial',
        });
        return (
          <React.Suspense fallback="Fallback around fragment">
            <FragmentComponent query={data} />
          </React.Suspense>
        );
      };

      const instance = render(environment, <Renderer variables={variables} />);

      // Assert that we suspended at the fragment level and not at the root
      expect(instance.toJSON()).toEqual('Fallback around fragment');
      expectToHaveFetched(environment, onlyFragsQuery);
      expect(renderFn).not.toBeCalled();
      expect(environment.retain).toHaveBeenCalledTimes(1);

      environment.mock.resolve(gqlOnlyFragmentsQuery, {
        data: {
          node: {
            __typename: 'User',
            id: variables.id,
            name: 'Alice',
          },
        },
      });

      expectToBeRendered(renderFn, {
        node: {
          id: variables.id,
          name: 'Alice',
        },
      });
    });
  });

  describe('logging', () => {
    test('simple fetch', () => {
      render(environment, <Container variables={variables} />);

      environment.mock.resolve(gqlQuery, {
        data: {
          node: {
            __typename: 'User',
            id: variables.id,
            name: 'Alice',
          },
        },
      });

      ReactTestRenderer.act(() => {
        jest.runAllImmediates();
      });

      expect(logs).toMatchObject([
        {
          name: 'execute.start',
          transactionID: 100000,
        },
        {
          name: 'queryresource.fetch',
          resourceID: 200000,
          profilerContext: expect.objectContaining({}),
        },
        {
          name: 'execute.next',
          transactionID: 100000,
        },
        {
          name: 'execute.complete',
          transactionID: 100000,
        },
        {
          name: 'queryresource.retain',
          resourceID: 200000,
          profilerContext: expect.objectContaining({}),
        },
      ]);
    });

    test('log when switching queries', () => {
      const initialVariables = {id: 'first-render'};
      const variablesOne = {id: '1'};
      const variablesTwo = {id: '2'};

      // Render the component
      const initialQuery = createOperationDescriptor(gqlQuery, {
        id: 'first-render',
      });
      environment.commitPayload(initialQuery, {
        node: {
          __typename: 'User',
          id: 'first-render',
          name: 'Bob',
        },
      });

      render(
        environment,
        <Container variables={initialVariables} fetchPolicy="store-only" />,
      );

      // Suspend on the first query
      ReactTestRenderer.act(() => {
        setProps({variables: variablesOne});
      });

      // Switch to the second query
      ReactTestRenderer.act(() => {
        setProps({variables: variablesTwo});
      });

      // Switch back to the first query and it should not request again
      ReactTestRenderer.act(() => {
        setProps({variables: variablesOne});
      });

      ReactTestRenderer.act(() => {
        const queryOne = createOperationDescriptor(gqlQuery, variablesOne);
        const payload = {
          data: {
            node: {
              __typename: 'User',
              id: variablesOne.id,
              name: 'Alice',
            },
          },
        };
        environment.mock.resolve(queryOne, payload);
        jest.runAllImmediates();
      });

      expect(logs).toMatchObject([
        {
          // initial fetch
          name: 'queryresource.fetch',
          resourceID: 200000,
          profilerContext: expect.objectContaining({}),
          shouldFetch: false,
          operation: {
            request: {
              variables: initialVariables,
            },
          },
        },
        {
          // initial fetch completes, since it was fulfilled from cache
          name: 'queryresource.retain',
          resourceID: 200000,
          profilerContext: expect.objectContaining({}),
        },
        {
          // request for variables one starts
          name: 'execute.start',
          transactionID: 100000,
          variables: variablesOne,
        },
        {
          // fetch event for variables one
          name: 'queryresource.fetch',
          resourceID: 200001,
          profilerContext: expect.objectContaining({}),
          shouldFetch: true,
          operation: {
            request: {
              variables: variablesOne,
            },
          },
        },
        {
          // request for variables two starts
          name: 'execute.start',
          transactionID: 100001,
          variables: variablesTwo,
        },
        {
          // fetch event for variables two
          name: 'queryresource.fetch',
          resourceID: 200002,
          profilerContext: expect.objectContaining({}),
          shouldFetch: true,
          operation: {
            request: {
              variables: variablesTwo,
            },
          },
        },
        // fetch event for variables one is skipped
        // since it's already cached and reused
        {
          name: 'execute.next',
          transactionID: 100000,
        },
        {
          name: 'execute.complete',
          transactionID: 100000,
        },
        // retain event for variables one
        {
          name: 'queryresource.retain',
          resourceID: 200001,
          profilerContext: expect.objectContaining({}),
        },
      ]);
    });
  });
});

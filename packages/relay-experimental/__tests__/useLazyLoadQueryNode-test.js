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

const {createOperationDescriptor} = require('relay-runtime');

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

type Props = {variables: Object, ...};

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

  beforeEach(() => {
    jest.resetModules();
    jest.spyOn(console, 'warn').mockImplementationOnce(() => {});
    jest.mock('../ExecutionEnvironment', () => ({
      isServer: false,
    }));

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

    const Renderer = props => {
      const _query = createOperationDescriptor(gqlQuery, props.variables);
      const data = useLazyLoadQueryNode<_>({
        query: _query,
        /* $FlowFixMe(>=0.111.0) This comment suppresses an error found when
         * Flow v0.111.0 was deployed. To see the error, delete this comment
         * and run Flow. */
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

    environment = createMockEnvironment();
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

  it('fetches and renders correctly if the same query was unsubscribed before', () => {
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

    // Switch to the second query to cancel the first query
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

    // Switch back to the first query and it should request again
    ReactTestRenderer.act(() => {
      setProps({variables});
    });

    expect(instance.toJSON()).toEqual('Fallback');
    expectToHaveFetched(environment, query);
    expect(renderFn).not.toBeCalled();
    expect(environment.retain).toHaveBeenCalledTimes(1);

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
    environment.retain.mockClear();
    environment.execute.mockClear();

    // Suspend on the first query
    ReactTestRenderer.act(() => {
      setProps({variables, fetchPolicy: 'store-or-network'});
    });

    expect(instance.toJSON()).toEqual('Fallback');
    expectToHaveFetched(environment, query);
    expect(renderFn).not.toBeCalled();
    expect(environment.retain).toHaveBeenCalledTimes(1);
    renderFn.mockClear();
    environment.retain.mockClear();
    environment.execute.mockClear();
    release.mockClear();

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
});

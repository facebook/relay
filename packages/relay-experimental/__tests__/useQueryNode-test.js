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

'use strict';

const React = require('react');
const ReactTestRenderer = require('react-test-renderer');
const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');

const useQueryNode = require('../useQueryNode');

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

function expectToBeFetched(environment, node, variables) {
  expect(environment.execute).toBeCalledTimes(1);
  expect(environment.execute.mock.calls[0][0].operation).toMatchObject({
    fragment: expect.anything(),
    root: expect.anything(),
    request: {
      node,
      variables,
    },
  });
}

type Props = {
  variables: Object,
};

describe('useQueryNode', () => {
  let environment;
  let gqlQuery;
  let renderFn;
  let render;
  let createMockEnvironment;
  let generateAndCompile;
  let Container;
  let setProps;

  beforeEach(() => {
    jest.resetModules();
    jest.spyOn(console, 'warn').mockImplementationOnce(() => {});
    jest.mock('fbjs/lib/ExecutionEnvironment', () => ({
      canUseDOM: () => true,
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
      const query = createOperationDescriptor(gqlQuery, props.variables);
      const data = useQueryNode<_>({
        query,
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

    render = (environment, children) => {
      return ReactTestRenderer.create(
        <RelayEnvironmentProvider environment={environment}>
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
    renderFn = jest.fn(result => result?.node?.name ?? 'Empty');
  });

  afterEach(() => {
    environment.mockClear();
    jest.clearAllTimers();
  });

  it('fetches and renders the query data', () => {
    const variables = {id: '1'};
    const instance = render(environment, <Container variables={variables} />);
    const operation = createOperationDescriptor(gqlQuery, variables);

    expect(instance.toJSON()).toEqual('Fallback');
    expectToBeFetched(environment, gqlQuery, variables);
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

    const data = environment.lookup(operation.fragment).data;
    expectToBeRendered(renderFn, data);
  });

  it('fetches and renders correctly if previously useEffect does not run', () => {
    const variables = {id: '1'};
    const operation = createOperationDescriptor(gqlQuery, variables);

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
    expectToBeFetched(environment, gqlQuery, variables);
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
    expectToBeFetched(environment, gqlQuery, variables);
    expect(renderFn).not.toBeCalled();
    expect(environment.retain).toHaveBeenCalledTimes(1);

    ReactTestRenderer.act(() => {
      environment.mock.resolve(gqlQuery, payload);
    });

    const data = environment.lookup(operation.fragment).data;
    expectToBeRendered(renderFn, data);
  });

  it('fetches and renders correctly if the same query was unsubscribed before', () => {
    // Render the component
    const initialDescriptor = createOperationDescriptor(gqlQuery, {
      id: 'first-render',
    });
    environment.commitPayload(initialDescriptor, {
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
    const variables = {id: '1'};
    ReactTestRenderer.act(() => {
      setProps({variables});
    });

    expect(instance.toJSON()).toEqual('Fallback');
    expectToBeFetched(environment, gqlQuery, variables);
    expect(renderFn).not.toBeCalled();
    renderFn.mockClear();
    environment.retain.mockClear();
    environment.execute.mockClear();

    // Switch to the second query to cancel the first query
    const nextVariables = {id: '2'};
    ReactTestRenderer.act(() => {
      setProps({variables: nextVariables});
    });

    expect(instance.toJSON()).toEqual('Fallback');
    expectToBeFetched(environment, gqlQuery, nextVariables);
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
    expectToBeFetched(environment, gqlQuery, variables);
    expect(renderFn).not.toBeCalled();
    expect(environment.retain).toHaveBeenCalledTimes(1);

    const operation = createOperationDescriptor(gqlQuery, variables);
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
    const data = environment.lookup(operation.fragment).data;
    expect(renderFn.mock.calls[0][0]).toEqual(data);
    expect(instance.toJSON()).toEqual('Alice');
  });
});

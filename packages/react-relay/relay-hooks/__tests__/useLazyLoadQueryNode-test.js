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

import type {FetchPolicy} from 'relay-runtime';

const RelayEnvironmentProvider = require('../RelayEnvironmentProvider');
const useFragmentNode = require('../useFragmentNode');
const useLazyLoadQueryNode = require('../useLazyLoadQueryNode');
const React = require('react');
const ReactTestRenderer = require('react-test-renderer');
const {
  RecordSource,
  Store,
  __internal,
  createOperationDescriptor,
  getFragment,
  getRequest,
  graphql,
} = require('relay-runtime');
const {createMockEnvironment} = require('relay-test-utils');

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
    environment.mock.isLoading(query.request.node, query.request.variables),
  ).toEqual(true);
}

type Props = {|
  variables: {...},
  fetchPolicy?: FetchPolicy,
  key?: number,
  extraData?: number,
|};

describe('useLazyLoadQueryNode', () => {
  let environment;
  let gqlQuery;
  let renderFn;
  let render;
  let release;
  let query;
  let variables;
  let Container;
  let setProps;
  let logs;
  let errorBoundaryDidCatchFn;

  beforeEach(() => {
    jest.resetModules();
    jest.spyOn(console, 'warn').mockImplementationOnce(() => {});
    errorBoundaryDidCatchFn = jest.fn();

    class ErrorBoundary extends React.Component<any, any> {
      state = {error: null};
      componentDidCatch(error) {
        errorBoundaryDidCatchFn(error);
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
        fetchObservable: __internal.fetchQuery(environment, _query),
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
      store: new Store(new RecordSource(), {gcReleaseBufferSize: 0}),
    });
    release = jest.fn();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    const originalRetain = environment.retain.bind(environment);
    // $FlowFixMe[cannot-write]
    environment.retain = jest.fn((...args) => {
      const originalDisposable = originalRetain(...args);
      return {
        dispose: () => {
          release(args[0].variables);
          originalDisposable.dispose();
        },
      };
    });

    gqlQuery = getRequest(graphql`
      query useLazyLoadQueryNodeTestUserQuery($id: ID) {
        node(id: $id) {
          id
          name
          ...useLazyLoadQueryNodeTestUserFragment
        }
      }
    `);
    graphql`
      fragment useLazyLoadQueryNodeTestUserFragment on User {
        name
      }
    `;

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
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    expect(environment.retain).toHaveBeenCalledTimes(1);

    ReactTestRenderer.act(() => {
      environment.mock.resolve(gqlQuery, {
        data: {
          node: {
            __typename: 'User',
            id: variables.id,
            name: 'Alice',
          },
        },
      });
      jest.runAllImmediates();
    });

    const data = environment.lookup(query.fragment).data;
    expectToBeRendered(renderFn, data);
  });

  it('subscribes to query fragment results and preserves object identity', () => {
    const instance = render(environment, <Container variables={variables} />);

    expect(instance.toJSON()).toEqual('Fallback');
    expectToHaveFetched(environment, query);
    expect(renderFn).not.toBeCalled();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
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

    ReactTestRenderer.act(() => {
      environment.commitUpdate(store => {
        const alice = store.get('1');
        if (alice != null) {
          alice.setValue('ALICE', 'name');
        }
      });
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
    // abstract types which the concrete type doesn't implement

    const instance = render(environment, <Container variables={variables} />);

    expect(instance.toJSON()).toEqual('Fallback');
    expectToHaveFetched(environment, query);
    expect(renderFn).not.toBeCalled();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    expect(environment.retain).toHaveBeenCalledTimes(1);

    ReactTestRenderer.act(() => {
      environment.mock.resolve(gqlQuery, {
        data: {
          node: {
            __typename: 'User',
            id: variables.id,
            // name is missing in response
          },
        },
      });
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
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
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
    expect(environment.getStore().getSource().toJSON()).toEqual({});

    renderFn.mockClear();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    environment.retain.mockClear();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    environment.execute.mockClear();

    instance = render(environment, <Container variables={variables} />);

    expect(instance.toJSON()).toEqual('Fallback');
    expectToHaveFetched(environment, query);
    expect(renderFn).not.toBeCalled();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
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
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    environment.retain.mockClear();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
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
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    expect(environment.retain).toHaveBeenCalledTimes(1);
    renderFn.mockClear();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    environment.retain.mockClear();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    environment.execute.mockClear();

    // Switch back to the first query, it shouldn't request again
    ReactTestRenderer.act(() => {
      setProps({variables});
    });

    expect(instance.toJSON()).toEqual('Fallback');
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    expect(environment.execute).toBeCalledTimes(0);
    expect(renderFn).not.toBeCalled();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
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

  it('fetches and renders correctly when re-mounting the same query (even if GC runs synchronously)', () => {
    const store = new Store(new RecordSource(), {
      gcScheduler: run => run(),
      gcReleaseBufferSize: 0,
    });
    jest.spyOn(store, 'scheduleGC');
    environment = createMockEnvironment({
      store,
    });
    // Render the component
    const instance = render(
      environment,
      <Container key={0} variables={variables} />,
    );

    expect(instance.toJSON()).toEqual('Fallback');
    expectToHaveFetched(environment, query);
    expect(renderFn).not.toBeCalled();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    expect(environment.retain).toHaveBeenCalledTimes(1);
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    environment.execute.mockClear();
    renderFn.mockClear();

    ReactTestRenderer.act(() => {
      environment.mock.resolve(gqlQuery, {
        data: {
          node: {
            __typename: 'User',
            id: '1',
            name: 'Bob',
          },
        },
      });
      jest.runAllImmediates();
    });

    const data = environment.lookup(query.fragment).data;
    expectToBeRendered(renderFn, data);
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    expect(environment.retain).toHaveBeenCalledTimes(1);
    renderFn.mockClear();

    ReactTestRenderer.act(() => {
      // Pass a new key to force a re-mount
      setProps({variables, key: 1});
      jest.runAllImmediates();
    });

    // Assert that GC doesn't run since the query doesn't
    // incorrectly get fully released (which would trigger GC)
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    expect(store.scheduleGC).toHaveBeenCalledTimes(0);

    // Assert that a new request was not started
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    expect(environment.execute).toHaveBeenCalledTimes(0);

    // Expect to still be able to render the same data
    expectToBeRendered(renderFn, data);
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    expect(environment.retain).toHaveBeenCalledTimes(1);
  });

  it('disposes the temporary retain when the component is re-rendered and switches to another query', () => {
    // Render the component
    const instance = render(
      environment,
      <Container extraData={0} variables={variables} />,
    );

    expect(instance.toJSON()).toEqual('Fallback');
    expectToHaveFetched(environment, query);
    expect(renderFn).not.toBeCalled();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    expect(environment.retain).toHaveBeenCalledTimes(1);
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    environment.execute.mockClear();
    renderFn.mockClear();

    ReactTestRenderer.act(() => {
      environment.mock.resolve(gqlQuery, {
        data: {
          node: {
            __typename: 'User',
            id: '1',
            name: 'Bob',
          },
        },
      });
      jest.runAllImmediates();
    });

    const data = environment.lookup(query.fragment).data;
    expectToBeRendered(renderFn, data);
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    expect(environment.retain).toHaveBeenCalledTimes(1);
    renderFn.mockClear();

    ReactTestRenderer.act(() => {
      // Update `extraData` to trigger a re-render
      setProps({variables, extraData: 1});
    });

    // Nothing to release here since variables didn't change
    expect(release).toHaveBeenCalledTimes(0);

    ReactTestRenderer.act(() => {
      // Update `variables` to fetch new data
      setProps({variables: {id: '2'}, extraData: 1});
    });

    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    expect(environment.execute).toHaveBeenCalledTimes(1);
    ReactTestRenderer.act(() => {
      environment.mock.resolve(gqlQuery, {
        data: {
          node: {
            __typename: 'User',
            id: '2',
            name: 'Bob',
          },
        },
      });
      jest.runAllImmediates();
    });

    // Variables were changed and the retain for the previous query
    // should be released
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('does not cancel ongoing network request when component unmounts while suspended', () => {
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
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    environment.execute.mockClear();

    // Suspend on the first query
    ReactTestRenderer.act(() => {
      setProps({variables, fetchPolicy: 'store-or-network'});
    });

    expect(instance.toJSON()).toEqual('Fallback');
    expectToHaveFetched(environment, query);
    expect(renderFn).not.toBeCalled();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    expect(environment.retain).toHaveBeenCalledTimes(2);
    renderFn.mockClear();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    environment.retain.mockClear();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    environment.execute.mockClear();
    expect(
      environment.mock.isLoading(query.request.node, variables, {}),
    ).toEqual(true);

    ReactTestRenderer.act(() => {
      instance.unmount();
    });

    // Assert data is released
    expect(release).toBeCalledTimes(1);

    // Assert request in flight is not cancelled
    expect(
      environment.mock.isLoading(query.request.node, variables, {}),
    ).toEqual(true);
  });

  it('does not cancel ongoing network request when component unmounts after committing', () => {
    const instance = render(environment, <Container variables={variables} />);

    expect(instance.toJSON()).toEqual('Fallback');
    expectToHaveFetched(environment, query);
    expect(renderFn).not.toBeCalled();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
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

    // Assert request was created
    expect(
      environment.mock.isLoading(query.request.node, variables, {}),
    ).toEqual(true);

    ReactTestRenderer.act(() => {
      instance.unmount();
    });

    // Assert data is released
    expect(release).toBeCalledTimes(1);
    // Assert request in flight is not cancelled
    expect(
      environment.mock.isLoading(query.request.node, variables, {}),
    ).toEqual(true);
  });

  it('does not cancel network request when temporarily retained component that never commits is disposed of after timeout', () => {
    const instance = render(environment, <Container variables={variables} />);

    expect(instance.toJSON()).toEqual('Fallback');
    expectToHaveFetched(environment, query);
    expect(renderFn).not.toBeCalled();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    expect(environment.retain).toHaveBeenCalledTimes(1);
    ReactTestRenderer.act(() => {
      instance.unmount();
    });
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
    // Assert request in created
    expect(
      environment.mock.isLoading(query.request.node, variables, {}),
    ).toEqual(true);

    // Trigger releasing of the temporary retain
    jest.runAllTimers();
    // Assert data is released
    expect(release).toBeCalledTimes(1);
    // Assert request in flight is not cancelled
    expect(
      environment.mock.isLoading(query.request.node, variables, {}),
    ).toEqual(true);
  });

  describe('with @defer and re-rendering', () => {
    beforeEach(() => {
      graphql`
        fragment useLazyLoadQueryNodeTestDeferFragment on User {
          id
          name
        }
      `;
      gqlQuery = getRequest(graphql`
        query useLazyLoadQueryNodeTest1Query($id: ID) {
          node(id: $id) {
            ...useLazyLoadQueryNodeTestDeferFragment @defer
          }
        }
      `);
      variables = {id: 'user:1234'};
      query = createOperationDescriptor(gqlQuery, variables);
    });

    it('should handle errors ', () => {
      const instance = render(
        environment,
        <Container key={0} variables={variables} />,
      );

      expect(instance.toJSON()).toEqual('Fallback');
      expect(renderFn).not.toBeCalled();

      const payloadError = new Error('Invalid Payload');

      expect(errorBoundaryDidCatchFn).not.toBeCalled();

      environment.mock.reject(query, payloadError);

      // force re-rendering of the component, to read from the QueryResource
      // by default, error responses do not trigger react updates
      ReactTestRenderer.act(() => {
        setProps({variables, key: 1});
      });

      // This time, error boundary will render the error
      expect(errorBoundaryDidCatchFn).toBeCalledWith(payloadError);
      expect(renderFn).not.toBeCalled();
    });

    it('should render the query with defer payloads without errors for defer payloads', () => {
      jest.mock('warning');
      const warning = require('warning');

      const instance = render(
        environment,
        <Container key={0} variables={variables} />,
      );

      expect(instance.toJSON()).toEqual('Fallback');
      expect(renderFn).not.toBeCalled();

      ReactTestRenderer.act(() => {
        environment.mock.nextValue(query, {
          data: {
            node: {
              __typename: 'User',
              id: variables.id,
            },
          },
        });
      });

      const data = environment.lookup(query.fragment).data;

      expectToBeRendered(renderFn, data);

      expect(errorBoundaryDidCatchFn).not.toBeCalled();

      const payloadError = new Error('Invalid Payload');
      // $FlowFixMe(prop-missing)
      warning.mockClear();

      environment.mock.reject(query, payloadError);
      expect(warning).toBeCalledWith(
        false,
        expect.stringContaining(
          'QueryResource: An incremental payload for query `%`',
        ),
        'useLazyLoadQueryNodeTest1Query',
        expect.stringContaining('Invalid Payload'),
        expect.stringContaining('Invalid Payload'),
      );

      // force re-rendering of the component, to read from the QueryResource
      // by default, error responses do not trigger react updates
      ReactTestRenderer.act(() => {
        setProps({variables, key: 1});
      });

      // error boundary should not display that error
      expect(errorBoundaryDidCatchFn).not.toBeCalled();

      // and we also should re-render the same view as for the initial response
      expectToBeRendered(renderFn, data);
    });
  });

  describe('partial rendering', () => {
    it('does not suspend at the root if query does not have direct data dependencies', () => {
      const gqlFragment = graphql`
        fragment useLazyLoadQueryNodeTestRootFragment on Query {
          node(id: $id) {
            id
            name
          }
        }
      `;
      const gqlOnlyFragmentsQuery = getRequest(graphql`
        query useLazyLoadQueryNodeTestOnlyFragmentsQuery($id: ID) {
          ...useLazyLoadQueryNodeTestRootFragment
        }
      `);
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
          fetchObservable: __internal.fetchQuery(environment, _query),
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
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
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
          executeId: 100001,
        },
        {
          name: 'network.start',
          networkRequestId: 100000,
        },
        {
          name: 'queryresource.fetch',
          resourceID: 200000,
          profilerContext: expect.objectContaining({}),
        },
        {
          name: 'suspense.query',
          fetchPolicy: 'network-only',
          isPromiseCached: false,
          operation: {
            request: {
              variables: variables,
            },
          },
          queryAvailability: {status: 'missing'},
          renderPolicy: 'partial',
        },
        {
          name: 'network.next',
          networkRequestId: 100000,
        },
        {
          name: 'execute.next',
          executeId: 100001,
        },
        {
          name: 'network.complete',
          networkRequestId: 100000,
        },
        {
          name: 'execute.complete',
          executeId: 100001,
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
      const initialQuery = createOperationDescriptor(
        gqlQuery,
        initialVariables,
      );
      environment.commitPayload(initialQuery, {
        node: {
          __typename: 'User',
          id: 'first-render',
          name: 'Bob',
        },
      });

      logs = [];
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
          // execution for variables one starts
          name: 'execute.start',
          executeId: 100002,
          variables: variablesOne,
        },
        {
          // request for variables one starts
          name: 'network.start',
          networkRequestId: 100001,
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
          name: 'suspense.query',
          fetchPolicy: 'network-only',
          isPromiseCached: false,
          operation: {
            request: {
              variables: variablesOne,
            },
          },
          queryAvailability: {status: 'missing'},
          renderPolicy: 'partial',
        },
        {
          // execution for variables two starts
          name: 'execute.start',
          executeId: 100004,
          variables: variablesTwo,
        },
        {
          // request for variables two starts
          name: 'network.start',
          networkRequestId: 100003,
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
        {
          name: 'suspense.query',
          fetchPolicy: 'network-only',
          isPromiseCached: false,
          operation: {
            request: {
              variables: variablesTwo,
            },
          },
          queryAvailability: {status: 'missing'},
          renderPolicy: 'partial',
        },
        {
          name: 'suspense.query',
          fetchPolicy: 'network-only',
          isPromiseCached: true,
          operation: {
            request: {
              variables: variablesOne,
            },
          },
          queryAvailability: {status: 'missing'},
          renderPolicy: 'partial',
        },
        // fetch event for variables one is skipped
        // since it's already cached and reused
        {
          name: 'network.next',
          networkRequestId: 100001,
        },
        {
          name: 'execute.next',
          executeId: 100002,
        },
        {
          name: 'network.complete',
          networkRequestId: 100001,
        },
        {
          name: 'execute.complete',
          executeId: 100002,
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

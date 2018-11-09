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

const React = require('React');
const ReactRelayContext = require('react-relay/modern/ReactRelayContext');
const ReactTestRenderer = require('ReactTestRenderer');

const createSuspenseQueryRenderer = require('../createSuspenseQueryRenderer');
const invariant = require('invariant');
const readContext = require('react-relay/modern/readContext');

const {createMockEnvironment} = require('RelayModernMockEnvironment');
const {generateAndCompile} = require('RelayModernTestUtils');
const {
  createOperationSelector,
  simpleClone,
  FRAGMENTS_KEY,
  ID_KEY,
} = require('relay-runtime');

const fetchPolicy = 'store-or-network';

const MISSING_PLACEHOLDER_EXCEPTION = /RelaySuspenseQueryRenderer\(.+?\) suspended while rendering, but no fallback UI was specified\./;

class PropsSetter extends React.Component<any, any> {
  constructor() {
    super();
    this.state = {
      props: null,
    };
  }
  setProps(props) {
    this.setState({props});
  }
  render() {
    const child = React.Children.only(this.props.children);
    if (this.state.props) {
      return React.cloneElement(child, this.state.props);
    }
    return child;
  }
}

function expectToBeRendered(renderFn, readyState) {
  expect(renderFn).toBeCalledTimes(1);
  expect(renderFn.mock.calls[0][0]).toEqual(readyState);
}

function expectToBeFetched(environment, executeVariables) {
  expect(environment.execute).toBeCalledTimes(1);
  expect(environment.execute.mock.calls[0][0].operation).toMatchObject({
    fragment: expect.anything(),
    variables: executeVariables,
  });
}

function commitUserPayload(environment, gqlQuery, id, name) {
  const operationSelector = createOperationSelector(gqlQuery, {id});
  environment.commitPayload(operationSelector, {
    node: {
      __typename: 'User',
      id,
      name,
    },
  });
}

describe('createSuspenseQueryRenderer', () => {
  let environment;
  let gqlQuery;
  let QueryRenderer;
  let renderFn;

  beforeEach(() => {
    environment = createMockEnvironment();
    const generated = generateAndCompile(
      `
        fragment UserFragment on User {
          name
        }

        query UserQuery($id: ID = "<default-id>") {
          node(id: $id) {
            id
            ...UserFragment
          }
        }
    `,
    );
    gqlQuery = generated.UserQuery;
    renderFn = jest.fn(() => <div />);
    QueryRenderer = createSuspenseQueryRenderer(gqlQuery, {fetchPolicy});
  });

  it('should render the component without a network request if data is available', () => {
    const variables = {id: '<available-data-id>'};
    commitUserPayload(environment, gqlQuery, variables.id, 'Alice');
    ReactTestRenderer.create(
      <QueryRenderer environment={environment} variables={variables}>
        {renderFn}
      </QueryRenderer>,
    );
    expect(environment.execute).not.toBeCalled();
    expectToBeRendered(renderFn, {
      node: {
        id: variables.id,
        [ID_KEY]: variables.id,
        [FRAGMENTS_KEY]: {
          UserFragment: {},
        },
      },
    });
  });

  it('should render even if some data is missing for query, and send a network request for missing data', () => {
    const variables = {id: '<partially-available-data-id>'};
    commitUserPayload(environment, gqlQuery, variables.id, undefined);
    ReactTestRenderer.create(
      <QueryRenderer environment={environment} variables={variables}>
        {renderFn}
      </QueryRenderer>,
    );
    expectToBeFetched(environment, variables);
    expectToBeRendered(renderFn, {
      node: {
        id: variables.id,
        [ID_KEY]: variables.id,
        [FRAGMENTS_KEY]: {
          UserFragment: {},
        },
      },
    });
  });

  it('should send a network request and suspend render if data is missing for the query', () => {
    // This prevents console.error output in the test, which is expected
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});

    const variables = {id: '<missing-id>'};
    expect(() => {
      return ReactTestRenderer.create(
        <QueryRenderer environment={environment} variables={variables}>
          {renderFn}
        </QueryRenderer>,
      );
    }).toThrow(MISSING_PLACEHOLDER_EXCEPTION);
    expectToBeFetched(environment, variables);
    expect(renderFn).not.toBeCalled();
  });

  it('should fetch the query with default variables', () => {
    // This prevents console.error output in the test, which is expected
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    expect(() =>
      ReactTestRenderer.create(
        <QueryRenderer environment={environment} variables={{}}>
          {renderFn}
        </QueryRenderer>,
      ),
    ).toThrow(MISSING_PLACEHOLDER_EXCEPTION);
    expectToBeFetched(environment, {
      id: '<default-id>',
    });
  });

  describe('refetch', () => {
    let refetch = (_1, _2) => {};
    const renderWithRefetch = jest.fn((data, opts) => {
      refetch = opts.refetch;
      return <div />;
    });

    beforeEach(() => {
      renderWithRefetch.mockClear();
    });

    it('should rerender without network request if data is available for refetched vars', () => {
      const variables = {id: '<available-data-id>'};
      commitUserPayload(environment, gqlQuery, variables.id, 'Alice');

      // Initial render doesn't suspend.
      ReactTestRenderer.create(
        <QueryRenderer environment={environment} variables={variables}>
          {renderWithRefetch}
        </QueryRenderer>,
      );
      expect(environment.execute).not.toBeCalled();
      expectToBeRendered(renderWithRefetch, {
        node: {
          id: variables.id,
          [ID_KEY]: variables.id,
          [FRAGMENTS_KEY]: {
            UserFragment: {},
          },
        },
      });

      const refetchVariables = {id: '<also-available>'};
      commitUserPayload(
        environment,
        gqlQuery,
        refetchVariables.id,
        'Also Available',
      );
      renderWithRefetch.mockClear();
      refetch(refetchVariables);
      expect(environment.execute).not.toBeCalled();
      expectToBeRendered(renderWithRefetch, {
        node: {
          id: refetchVariables.id,
          [ID_KEY]: refetchVariables.id,
          [FRAGMENTS_KEY]: {
            UserFragment: {},
          },
        },
      });
    });

    it('should rerender even if some data is missing for refetched vars, and send a network request for missing data', () => {
      const variables = {id: '<available-data-id>'};
      commitUserPayload(environment, gqlQuery, variables.id, 'Alice');

      // Initial render doesn't suspend.
      ReactTestRenderer.create(
        <QueryRenderer environment={environment} variables={variables}>
          {renderWithRefetch}
        </QueryRenderer>,
      );
      expect(environment.execute).not.toBeCalled();
      expectToBeRendered(renderWithRefetch, {
        node: {
          id: variables.id,
          [ID_KEY]: variables.id,
          [FRAGMENTS_KEY]: {
            UserFragment: {},
          },
        },
      });

      const refetchVariables = {id: '<partially-available>'};
      commitUserPayload(environment, gqlQuery, refetchVariables.id, undefined);
      renderWithRefetch.mockClear();
      refetch(refetchVariables);
      expectToBeFetched(environment, refetchVariables);
      expectToBeRendered(renderWithRefetch, {
        node: {
          id: refetchVariables.id,
          [ID_KEY]: refetchVariables.id,
          [FRAGMENTS_KEY]: {
            UserFragment: {},
          },
        },
      });
    });

    it('should send a network request and suspend render if data is missing for the refetched variables', () => {
      const variables = {id: '<available-data-id>'};
      commitUserPayload(environment, gqlQuery, variables.id, 'Alice');

      // Initial render doesn't suspend.
      const renderer = ReactTestRenderer.create(
        // $FlowFixMe Suspense component isn't typed yet
        <React.Suspense fallback="QUERY FALLBACK">
          <QueryRenderer environment={environment} variables={variables}>
            {renderWithRefetch}
          </QueryRenderer>
        </React.Suspense>,
      );
      expect(environment.execute).not.toBeCalled();
      expectToBeRendered(renderWithRefetch, {
        node: {
          id: variables.id,
          [ID_KEY]: variables.id,
          [FRAGMENTS_KEY]: {
            UserFragment: {},
          },
        },
      });

      // Refetch with missing data, assert it causes component to suspend
      const refetchVariables = {id: '<missing-id>'};
      refetch(refetchVariables);
      expectToBeFetched(environment, refetchVariables);
      expect(renderer.toJSON()).toEqual('QUERY FALLBACK');

      // Resolve refetch request, assert component rerenders with new data
      renderWithRefetch.mockClear();
      environment.mock.nextValue(gqlQuery, {
        data: {
          node: {
            __typename: 'User',
            id: refetchVariables.id,
            name: 'Missing one',
          },
        },
      });
      environment.mock.complete(gqlQuery);
      jest.runAllTimers();
      expectToBeRendered(renderWithRefetch, {
        node: {
          id: refetchVariables.id,
          [ID_KEY]: refetchVariables.id,
          [FRAGMENTS_KEY]: {
            UserFragment: {},
          },
        },
      });
    });

    it('rerenders with parent variables if parent variables change after a refetch', () => {
      const variables = {id: '<available-data-id>'};
      commitUserPayload(environment, gqlQuery, variables.id, 'Alice');

      // Initial render doesn't suspend.
      const renderer = ReactTestRenderer.create(
        <PropsSetter>
          <QueryRenderer environment={environment} variables={variables}>
            {renderWithRefetch}
          </QueryRenderer>
        </PropsSetter>,
      );
      expect(environment.execute).not.toBeCalled();
      expectToBeRendered(renderWithRefetch, {
        node: {
          id: variables.id,
          [ID_KEY]: variables.id,
          [FRAGMENTS_KEY]: {
            UserFragment: {},
          },
        },
      });

      // Refetch doesn't suspend
      const refetchVariables = {id: '<also-available>'};
      commitUserPayload(
        environment,
        gqlQuery,
        refetchVariables.id,
        'Also Available',
      );
      renderWithRefetch.mockClear();
      refetch(refetchVariables);
      expect(environment.execute).not.toBeCalled();
      expectToBeRendered(renderWithRefetch, {
        node: {
          id: refetchVariables.id,
          [ID_KEY]: refetchVariables.id,
          [FRAGMENTS_KEY]: {
            UserFragment: {},
          },
        },
      });

      // QueryRenderer rerenders with new parent vars
      const parentVariables = {id: '<available-too>'};
      commitUserPayload(
        environment,
        gqlQuery,
        parentVariables.id,
        'Available Too',
      );
      renderWithRefetch.mockClear();
      renderer.getInstance().setProps({
        variables: parentVariables,
      });
      expect(environment.execute).not.toBeCalled();
      expectToBeRendered(renderWithRefetch, {
        node: {
          id: parentVariables.id,
          [ID_KEY]: parentVariables.id,
          [FRAGMENTS_KEY]: {
            UserFragment: {},
          },
        },
      });
    });

    it('disposes refetch when QueryRenderer unmounts', () => {
      const variables = {id: '<available-data-id>'};
      commitUserPayload(environment, gqlQuery, variables.id, 'Alice');

      // Initial render doesn't suspend.
      const renderer = ReactTestRenderer.create(
        // $FlowFixMe Suspense component isn't typed yet
        <React.Suspense fallback="QUERY FALLBACK">
          <QueryRenderer environment={environment} variables={variables}>
            {renderWithRefetch}
          </QueryRenderer>
        </React.Suspense>,
      );
      expect(environment.execute).not.toBeCalled();
      expectToBeRendered(renderWithRefetch, {
        node: {
          id: variables.id,
          [ID_KEY]: variables.id,
          [FRAGMENTS_KEY]: {
            UserFragment: {},
          },
        },
      });

      // Start a refetch, assert component suspends
      const release = jest.fn();
      const refetchVariables = {id: '<missing-id>'};
      environment.retain.mockClear();
      jest.spyOn(environment, 'retain').mockImplementationOnce(() => ({
        dispose: release,
      }));
      refetch(refetchVariables);
      expectToBeFetched(environment, refetchVariables);
      expect(environment.retain).toBeCalledTimes(1);
      expect(renderer.toJSON()).toEqual('QUERY FALLBACK');

      // Unmount component
      renderer.unmount();

      // Assert data is disposed of after request completes
      environment.mock.nextValue(gqlQuery, {
        data: {
          node: {
            __typename: 'User',
            id: refetchVariables.id,
            name: 'Missing one',
          },
        },
      });
      environment.mock.complete(gqlQuery);
      // This prevents console.error output in the test, which is expected
      jest.spyOn(console, 'error').mockImplementationOnce(() => {});
      jest.runAllTimers();
      expect(release).toBeCalledTimes(1);
    });
  });

  describe('subscribe', () => {
    it('should subscribe to the store changes', () => {
      const generated = generateAndCompile(
        `
          query UserQuery($id: ID!) {
            node(id: $id) {
              id
              name
            }
          }
        `,
      );
      gqlQuery = generated.UserQuery;
      QueryRenderer = createSuspenseQueryRenderer(gqlQuery);
      const variables = {
        id: '<available-data-id>',
      };
      commitUserPayload(environment, gqlQuery, variables.id, 'Alice');
      ReactTestRenderer.create(
        <QueryRenderer environment={environment} variables={variables}>
          {renderFn}
        </QueryRenderer>,
      );
      expectToBeRendered(renderFn, {
        node: {
          id: variables.id,
          name: 'Alice',
        },
      });
      renderFn.mockReset();
      commitUserPayload(environment, gqlQuery, variables.id, 'Bob');
      expectToBeRendered(renderFn, {
        node: {
          id: variables.id,
          name: 'Bob',
        },
      });
    });
  });

  describe('context', () => {
    let relayContext: $FlowFixMe;

    beforeEach(() => {
      function ContextGetter() {
        relayContext = readContext(ReactRelayContext);
        return null;
      }
      renderFn = jest.fn(() => <ContextGetter />);
    });

    it('sets an environment and variables on context', () => {
      const variables = {id: '<available-data-id>'};
      const query = createOperationSelector(gqlQuery, variables);
      commitUserPayload(environment, gqlQuery, variables.id, 'Alice');

      ReactTestRenderer.create(
        <QueryRenderer environment={environment} variables={variables}>
          {renderFn}
        </QueryRenderer>,
      );
      expect(relayContext.query).toEqual(query);
      expect(relayContext.environment).toBe(environment);
      expect(relayContext.variables).toEqual(variables);
    });

    it('updates the context when the environment changes', () => {
      const variables = {id: '<available-data-id>'};
      commitUserPayload(environment, gqlQuery, variables.id, 'Alice');

      const renderer = ReactTestRenderer.create(
        <PropsSetter>
          <QueryRenderer environment={environment} variables={variables}>
            {renderFn}
          </QueryRenderer>
        </PropsSetter>,
      );
      const nextEnvironment = createMockEnvironment();
      commitUserPayload(nextEnvironment, gqlQuery, variables.id, 'Bob');

      const previousContext = relayContext;
      renderer.getInstance().setProps({
        environment: nextEnvironment,
      });
      expect(relayContext).not.toBe(previousContext);
      expect(relayContext.environment).toBe(nextEnvironment);
      expect(relayContext.variables).toEqual(variables);
    });

    it('updates the context when variables change', () => {
      const variables1 = {id: '<available-data-id-1>'};
      const variables2 = {id: '<available-data-id-2>'};

      commitUserPayload(environment, gqlQuery, variables1.id, 'Alice');
      commitUserPayload(environment, gqlQuery, variables2.id, 'Bob');

      const renderer = ReactTestRenderer.create(
        <PropsSetter>
          <QueryRenderer environment={environment} variables={variables1}>
            {renderFn}
          </QueryRenderer>
        </PropsSetter>,
      );
      expect(relayContext.variables).toEqual(variables1);
      const previousContext = relayContext;
      renderer.getInstance().setProps({
        variables: variables2,
      });
      expect(relayContext).not.toBe(previousContext);
      expect(relayContext.variables).toEqual(variables2);
    });

    it('does not update the context for equivalent variables', () => {
      const variables = {id: '<available-data-id-1>', foo: ['bar']};
      commitUserPayload(environment, gqlQuery, variables.id, 'Alice');

      const renderer = ReactTestRenderer.create(
        <PropsSetter>
          <QueryRenderer environment={environment} variables={variables}>
            {renderFn}
          </QueryRenderer>
        </PropsSetter>,
      );
      const nextVariables = simpleClone(variables);
      const previousContext = relayContext;
      const previousVariables = previousContext.variables;
      renderer.getInstance().setProps({
        variables: nextVariables,
      });
      expect(relayContext).toBe(previousContext);
      expect(relayContext.variables).toBe(previousVariables);
    });
  });

  describe('when variables change', () => {
    it('should render data from the store', () => {
      const variables1 = {id: '<available-data-id-1>'};
      commitUserPayload(environment, gqlQuery, variables1.id, 'Alice');

      const renderer = ReactTestRenderer.create(
        <PropsSetter>
          <QueryRenderer environment={environment} variables={variables1}>
            {renderFn}
          </QueryRenderer>
        </PropsSetter>,
      );
      expectToBeRendered(renderFn, {
        node: {
          id: variables1.id,
          [ID_KEY]: variables1.id,
          [FRAGMENTS_KEY]: {
            UserFragment: {},
          },
        },
      });
      renderFn.mockReset();

      const variables2 = {id: '<available-data-id-2>'};
      commitUserPayload(environment, gqlQuery, variables2.id, 'Bob');
      renderer.getInstance().setProps({
        variables: variables2,
      });
      expectToBeRendered(renderFn, {
        node: {
          id: variables2.id,
          [ID_KEY]: variables2.id,
          [FRAGMENTS_KEY]: {
            UserFragment: {},
          },
        },
      });
    });

    it('should render and send a network request for missing data', () => {
      // This prevents console.error output in the test, which is expected
      jest.spyOn(console, 'error').mockImplementationOnce(() => {});
      const variables = {
        id: '<available-data-id>',
      };
      commitUserPayload(environment, gqlQuery, variables.id, 'Alice');
      const renderer = ReactTestRenderer.create(
        <PropsSetter>
          <QueryRenderer environment={environment} variables={variables}>
            {renderFn}
          </QueryRenderer>
        </PropsSetter>,
      );
      expectToBeRendered(renderFn, {
        node: {
          id: variables.id,
          [ID_KEY]: variables.id,
          [FRAGMENTS_KEY]: {
            UserFragment: {},
          },
        },
      });
      renderFn.mockReset();
      const newVariables = {id: '<missing-id>'};
      expect(() =>
        renderer.getInstance().setProps({
          variables: newVariables,
        }),
      ).toThrow(MISSING_PLACEHOLDER_EXCEPTION);
      expect(renderFn).not.toBeCalled();
      expectToBeFetched(environment, newVariables);
    });
  });

  describe('when constructor fires multiple times', () => {
    it('fetches the query only once for missing data', () => {
      const variables = {
        id: '<missing-id>',
      };
      commitUserPayload(environment, gqlQuery, variables.id, undefined);
      function Child(props) {
        // NOTE the unstable_yield method will move to the static renderer.
        // When React sync runs we need to update this.
        ReactTestRenderer.unstable_yield(props.children);
        return props.children;
      }

      class TestComponent extends React.Component<any> {
        render() {
          return (
            <React.Fragment>
              <Child>A</Child>
              <QueryRenderer environment={environment} variables={variables}>
                {renderFn}
              </QueryRenderer>
              <Child>B</Child>
              <Child>C</Child>
            </React.Fragment>
          );
        }
      }
      const renderer = ReactTestRenderer.create(<TestComponent />, {
        unstable_isConcurrent: true,
      });

      // Flush some of the changes, but don't commit
      expect(renderer.unstable_flushNumberOfYields(2)).toEqual(['A', 'B']);
      expect(renderer.toJSON()).toEqual(null);
      expectToBeRendered(renderFn, {
        node: {
          id: variables.id,
          [ID_KEY]: variables.id,
          [FRAGMENTS_KEY]: {
            UserFragment: {},
          },
        },
      });
      expectToBeFetched(environment, variables);
      renderFn.mockClear();
      environment.execute.mockClear();

      // Interrupt with higher priority updates
      renderer.unstable_flushSync(() => {
        renderer.update(<TestComponent />);
      });
      expect(environment.execute).not.toBeCalled();
      expectToBeRendered(renderFn, {
        node: {
          id: variables.id,
          [ID_KEY]: variables.id,
          [FRAGMENTS_KEY]: {
            UserFragment: {},
          },
        },
      });
    });
  });

  describe('multiple QueryRenderer', () => {
    const TestComponentWithMultipleQueryRenderer = ({
      variables1,
      variables2,
      renderFn1 = renderFn,
      renderFn2 = renderFn,
    }: any) => {
      return (
        <React.Fragment>
          <QueryRenderer environment={environment} variables={variables1}>
            {renderFn1}
          </QueryRenderer>
          <QueryRenderer environment={environment} variables={variables2}>
            {renderFn2}
          </QueryRenderer>
        </React.Fragment>
      );
    };

    describe('with same variables', () => {
      it('should render both QueryRenderers without network request, when they are for the same query/variables that are already in the store', () => {
        const variables = {
          id: '<available-id>',
        };
        commitUserPayload(environment, gqlQuery, variables.id, 'Alice');
        ReactTestRenderer.create(
          <TestComponentWithMultipleQueryRenderer
            variables1={variables}
            variables2={variables}
          />,
        );
        expect(environment.execute).not.toBeCalled();
        expect(renderFn).toBeCalledTimes(2);
      });

      it('should render both QueryRenderer and send just one request if they have same variables', () => {
        const variables = {
          id: '<missing-id>',
        };
        commitUserPayload(environment, gqlQuery, variables.id, undefined);
        ReactTestRenderer.create(
          <TestComponentWithMultipleQueryRenderer
            variables1={variables}
            variables2={variables}
          />,
        );
        expectToBeFetched(environment, variables);
        expect(renderFn).toBeCalledTimes(2);
      });
    });

    describe('with different variables', () => {
      it('should render both QueryRenderers without network request, when data for query/variables is already in the store', () => {
        const variables1 = {
          id: '<available-id-1>',
        };
        const variables2 = {
          id: '<available-id-2>',
        };
        const renderFn1 = jest.fn();
        const renderFn2 = jest.fn();
        commitUserPayload(environment, gqlQuery, variables1.id, 'Alice');
        commitUserPayload(environment, gqlQuery, variables2.id, 'Bob');
        ReactTestRenderer.create(
          <TestComponentWithMultipleQueryRenderer
            variables1={variables1}
            variables2={variables2}
            renderFn1={renderFn1}
            renderFn2={renderFn2}
          />,
        );
        expect(environment.execute).not.toBeCalled();
        expectToBeRendered(renderFn1, {
          node: {
            id: variables1.id,
            [ID_KEY]: variables1.id,
            [FRAGMENTS_KEY]: {
              UserFragment: {},
            },
          },
        });
        expectToBeRendered(renderFn2, {
          node: {
            id: variables2.id,
            [ID_KEY]: variables2.id,
            [FRAGMENTS_KEY]: {
              UserFragment: {},
            },
          },
        });
      });

      it('should render both QueryRenderer and send a single request for missing data', () => {
        const variables1 = {
          id: '<available-id-1>',
        };
        const variables2 = {
          id: '<missing-id-2>',
        };
        commitUserPayload(environment, gqlQuery, variables1.id, 'Alice');
        commitUserPayload(environment, gqlQuery, variables2.id, undefined);
        const renderFn1 = jest.fn();
        const renderFn2 = jest.fn();
        ReactTestRenderer.create(
          <TestComponentWithMultipleQueryRenderer
            variables1={variables1}
            variables2={variables2}
            renderFn1={renderFn1}
            renderFn2={renderFn2}
          />,
        );
        expectToBeFetched(environment, variables2);
        expectToBeRendered(renderFn1, {
          node: {
            id: variables1.id,
            [ID_KEY]: variables1.id,
            [FRAGMENTS_KEY]: {
              UserFragment: {},
            },
          },
        });
        expectToBeRendered(renderFn2, {
          node: {
            id: variables2.id,
            [ID_KEY]: variables2.id,
            [FRAGMENTS_KEY]: {
              UserFragment: {},
            },
          },
        });
      });

      it('should render both query renderers and send network request for missing data', () => {
        // This prevents console.error output in the test, which is expected
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

        const variables1 = {id: '<missing-id-1>'};
        const variables2 = {id: '<missing-id-2>'};
        expect(() =>
          ReactTestRenderer.create(
            <TestComponentWithMultipleQueryRenderer
              variables1={variables1}
              variables2={variables2}
            />,
          ),
        ).toThrow(MISSING_PLACEHOLDER_EXCEPTION);
        expect(environment.execute).toBeCalledTimes(2);
        expect(environment.execute.mock.calls[0][0].operation).toMatchObject({
          fragment: expect.any(Object),
          variables: variables1,
        });
        expect(environment.execute.mock.calls[1][0].operation).toMatchObject({
          fragment: expect.any(Object),
          variables: variables2,
        });
        spy.mockReset();
      });
    });
  });

  describe('fetchPolicy', () => {
    const RENDER_NO_REQUEST =
      'render data from the store, no network request should be sent';
    const RENDER_WITH_REQUEST =
      'render data from the store and send a network request';
    const REQUST_PLACEHOLDER_RENDER =
      'send a network request and render a placeholder';
    const ERROR = 'throw an exception';

    const createExpectedBehaviorAssert = (
      testEnvironment,
      testGqlQuery,
      testVariables,
      expectedRenderOutput,
    ) => {
      return (testFetchPolicy, expectedBehavior) => {
        const TestQueryRenderer = createSuspenseQueryRenderer(testGqlQuery, {
          fetchPolicy: testFetchPolicy,
        });
        const testRenderFn = jest.fn();
        switch (expectedBehavior) {
          case RENDER_NO_REQUEST:
            ReactTestRenderer.create(
              <TestQueryRenderer
                environment={testEnvironment}
                variables={testVariables}>
                {testRenderFn}
              </TestQueryRenderer>,
            );
            expect(testRenderFn).toBeCalledTimes(1);
            expectToBeRendered(testRenderFn, expectedRenderOutput);
            expect(testEnvironment.execute).not.toBeCalled();
            break;
          case RENDER_WITH_REQUEST:
            ReactTestRenderer.create(
              <TestQueryRenderer
                environment={testEnvironment}
                variables={testVariables}>
                {testRenderFn}
              </TestQueryRenderer>,
            );
            expect(testRenderFn).toBeCalledTimes(1);
            expectToBeRendered(testRenderFn, expectedRenderOutput);
            expect(testEnvironment.execute).toBeCalledTimes(1);
            expect(
              testEnvironment.execute.mock.calls[0][0].operation,
            ).toMatchObject({
              fragment: expect.any(Object),
              variables: testVariables,
            });
            break;
          case REQUST_PLACEHOLDER_RENDER:
            expect(() => {
              return ReactTestRenderer.create(
                <TestQueryRenderer
                  environment={testEnvironment}
                  variables={testVariables}>
                  {testRenderFn}
                </TestQueryRenderer>,
              );
            }).toThrow(MISSING_PLACEHOLDER_EXCEPTION);
            break;
          case ERROR:
            expect(() => {
              return ReactTestRenderer.create(
                <TestQueryRenderer
                  environment={testEnvironment}
                  variables={testVariables}>
                  {testRenderFn}
                </TestQueryRenderer>,
              );
            }).toThrow(
              'DataResource: Tried reading a query that is not available locally and is not being fetched',
            );
            break;
          default:
            invariant(false, `Unexpected test behavior: ${expectedBehavior}.`);
        }
      };
    };

    describe('when data is available in the store', () => {
      let assertExpectedBehavior;

      beforeEach(() => {
        const testEnvironment = createMockEnvironment();
        const testGqlQuery = generateAndCompile(
          `
            query UserQuery($id: ID!) {
              node(id: $id) {
                id
                name
              }
            }
          `,
        ).UserQuery;
        const testVariables = {
          id: '<available-id>',
        };
        commitUserPayload(
          testEnvironment,
          testGqlQuery,
          testVariables.id,
          'Alice',
        );
        assertExpectedBehavior = createExpectedBehaviorAssert(
          testEnvironment,
          testGqlQuery,
          testVariables,
          {
            node: {
              id: testVariables.id,
              name: 'Alice',
            },
          },
        );
      });

      test.each([
        ['store-only', RENDER_NO_REQUEST],
        ['store-or-network', RENDER_NO_REQUEST],
        ['store-and-network', RENDER_WITH_REQUEST],
        ['network-only', REQUST_PLACEHOLDER_RENDER],
      ])(
        'if fetchPolicy is %s, then Query Renderer should %s',
        (testFetchPolicy, expectedBehavior) => {
          assertExpectedBehavior(testFetchPolicy, expectedBehavior);
        },
      );
    });

    describe('when data is partially available in the store', () => {
      let assertExpectedBehavior;

      beforeEach(() => {
        const testEnvironment = createMockEnvironment();
        const testGqlQuery = generateAndCompile(
          `
            fragment UserFragment on User {
              name
            }
            query UserQuery($id: ID!) {
              node(id: $id) {
                id
                ...UserFragment
              }
            }
          `,
        ).UserQuery;
        const testVariables = {
          id: '<partially-available-id>',
        };
        commitUserPayload(
          testEnvironment,
          testGqlQuery,
          testVariables.id,
          undefined,
        );
        assertExpectedBehavior = createExpectedBehaviorAssert(
          testEnvironment,
          testGqlQuery,
          testVariables,
          {
            node: {
              id: testVariables.id,
              [ID_KEY]: testVariables.id,
              [FRAGMENTS_KEY]: {
                UserFragment: {},
              },
            },
          },
        );
      });
      test.each([
        ['store-only', RENDER_NO_REQUEST],
        ['store-or-network', RENDER_WITH_REQUEST],
        ['store-and-network', RENDER_WITH_REQUEST],
        ['network-only', REQUST_PLACEHOLDER_RENDER],
      ])(
        'if fetchPolicy is %s, then Query Renderer should %s',
        (testFetchPolicy, expectedBehavior) => {
          assertExpectedBehavior(testFetchPolicy, expectedBehavior);
        },
      );
    });

    describe('when data is missing in the store', () => {
      let assertExpectedBehavior;

      beforeEach(() => {
        const testEnvironment = createMockEnvironment();
        const testGqlQuery = generateAndCompile(
          `
            query UserQuery($id: ID!) {
              node(id: $id) {
                id
                name
              }
            }
        `,
        ).UserQuery;
        const testVariables = {
          id: '<missing-id>',
        };
        commitUserPayload(
          testEnvironment,
          testGqlQuery,
          testVariables.id,
          undefined,
        );
        assertExpectedBehavior = createExpectedBehaviorAssert(
          testEnvironment,
          testGqlQuery,
          testVariables,
        );
      });
      test.each([
        ['store-only', ERROR],
        ['store-or-network', REQUST_PLACEHOLDER_RENDER],
        ['store-and-network', REQUST_PLACEHOLDER_RENDER],
        ['network-only', REQUST_PLACEHOLDER_RENDER],
      ])(
        'if fetchPolicy is %s, then Query Renderer should %s',
        (testFetchPolicy, expectedBehavior) => {
          assertExpectedBehavior(testFetchPolicy, expectedBehavior);
        },
      );
    });
  });
});

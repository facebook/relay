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

import type {OperationDescriptor, Variables} from 'relay-runtime';
const {useMemo, useState} = React;
const TestRenderer = require('react-test-renderer');

const invariant = require('invariant');
const useRefetchableFragmentNodeOriginal = require('../useRefetchableFragmentNode');
const ReactRelayContext = require('react-relay/ReactRelayContext');
const {
  FRAGMENT_OWNER_KEY,
  FRAGMENTS_KEY,
  ID_KEY,
  createOperationDescriptor,
} = require('relay-runtime');

describe('useRefetchableFragmentNode', () => {
  let environment;
  let gqlQuery;
  let gqlQueryNestedFragment;
  let gqlRefetchQuery;
  let gqlQueryWithArgs;
  let gqlQueryWithLiteralArgs;
  let gqlRefetchQueryWithArgs;
  let gqlFragment;
  let gqlFragmentWithArgs;
  let query;
  let queryNestedFragment;
  let refetchQuery;
  let queryWithArgs;
  let queryWithLiteralArgs;
  let refetchQueryWithArgs;
  let variables;
  let variablesNestedFragment;
  let setEnvironment;
  let setOwner;
  let fetchPolicy;
  let renderPolicy;
  let createMockEnvironment;
  let generateAndCompile;
  let renderFragment;
  let forceUpdate;
  let renderSpy;
  let refetch;
  let Renderer;

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

  function useRefetchableFragmentNode(fragmentNode, fragmentRef) {
    const result = useRefetchableFragmentNodeOriginal(
      fragmentNode,
      fragmentRef,
      'TestDisplayName',
    );
    refetch = result.refetch;
    renderSpy(result.fragmentData, refetch);
    return result;
  }

  function assertCall(expected, idx) {
    const actualData = renderSpy.mock.calls[idx][0];

    expect(actualData).toEqual(expected.data);
  }

  function expectFragmentResults(
    expectedCalls: $ReadOnlyArray<{|data: $FlowFixMe|}>,
  ) {
    // This ensures that useEffect runs
    TestRenderer.act(() => jest.runAllImmediates());
    expect(renderSpy).toBeCalledTimes(expectedCalls.length);
    expectedCalls.forEach((expected, idx) => assertCall(expected, idx));
    renderSpy.mockClear();
  }

  function createFragmentRef(id, owner) {
    return {
      [ID_KEY]: id,
      [FRAGMENTS_KEY]: {
        NestedUserFragment: {},
      },
      [FRAGMENT_OWNER_KEY]: owner.request,
    };
  }

  beforeEach(() => {
    // Set up mocks
    jest.resetModules();
    jest.spyOn(console, 'warn').mockImplementationOnce(() => {});
    jest.mock('warning');
    jest.mock('scheduler', () => {
      return jest.requireActual('scheduler/unstable_mock');
    });
    jest.mock('../ExecutionEnvironment', () => ({
      isServer: false,
    }));
    renderSpy = jest.fn();

    fetchPolicy = 'store-or-network';
    renderPolicy = 'partial';

    ({
      createMockEnvironment,
      generateAndCompile,
    } = require('relay-test-utils-internal'));

    // Set up environment and base data
    environment = createMockEnvironment();
    const generated = generateAndCompile(
      `
        fragment NestedUserFragment on User {
          username
        }

        fragment UserFragmentWithArgs on User
        @refetchable(queryName: "UserFragmentWithArgsRefetchQuery")
        @argumentDefinitions(scaleLocal: {type: "Float!"}) {
          id
          name
          profile_picture(scale: $scaleLocal) {
            uri
          }
          ...NestedUserFragment
        }

        fragment UserFragment on User
        @refetchable(queryName: "UserFragmentRefetchQuery") {
          id
          name
          profile_picture(scale: $scale) {
            uri
          }
          ...NestedUserFragment
        }

        query UserQuery($id: ID!, $scale: Int!) {
          node(id: $id) {
            ...UserFragment
          }
        }

        query UserQueryNestedFragment($id: ID!, $scale: Int!) {
          node(id: $id) {
            actor {
              ...UserFragment
            }
          }
        }

        query UserQueryWithArgs($id: ID!, $scale: Float!) {
          node(id: $id) {
            ...UserFragmentWithArgs @arguments(scaleLocal: $scale)
          }
        }

        query UserQueryWithLiteralArgs($id: ID!) {
          node(id: $id) {
            ...UserFragmentWithArgs @arguments(scaleLocal: 16)
          }
        }
    `,
    );
    variables = {id: '1', scale: 16};
    variablesNestedFragment = {id: '<feedbackid>', scale: 16};
    gqlQuery = generated.UserQuery;
    gqlQueryNestedFragment = generated.UserQueryNestedFragment;
    gqlRefetchQuery = generated.UserFragmentRefetchQuery;
    gqlQueryWithArgs = generated.UserQueryWithArgs;
    gqlQueryWithLiteralArgs = generated.UserQueryWithLiteralArgs;
    gqlRefetchQueryWithArgs = generated.UserFragmentWithArgsRefetchQuery;
    gqlFragment = generated.UserFragment;
    gqlFragmentWithArgs = generated.UserFragmentWithArgs;
    invariant(
      gqlFragment.metadata?.refetch?.operation ===
        '@@MODULE_START@@UserFragmentRefetchQuery.graphql@@MODULE_END@@',
      'useRefetchableFragment-test: Expected refetchable fragment metadata to contain operation.',
    );
    invariant(
      gqlFragmentWithArgs.metadata?.refetch?.operation ===
        '@@MODULE_START@@UserFragmentWithArgsRefetchQuery.graphql@@MODULE_END@@',
      'useRefetchableFragment-test: Expected refetchable fragment metadata to contain operation.',
    );
    // Manually set the refetchable operation for the test.
    gqlFragment.metadata.refetch.operation = gqlRefetchQuery;
    gqlFragmentWithArgs.metadata.refetch.operation = gqlRefetchQueryWithArgs;

    query = createOperationDescriptor(gqlQuery, variables);
    queryNestedFragment = createOperationDescriptor(
      gqlQueryNestedFragment,
      variablesNestedFragment,
    );
    refetchQuery = createOperationDescriptor(gqlRefetchQuery, variables);
    queryWithArgs = createOperationDescriptor(gqlQueryWithArgs, variables);
    queryWithLiteralArgs = createOperationDescriptor(gqlQueryWithLiteralArgs, {
      id: variables.id,
    });
    refetchQueryWithArgs = createOperationDescriptor(
      gqlRefetchQueryWithArgs,
      variables,
    );
    environment.commitPayload(query, {
      node: {
        __typename: 'User',
        id: '1',
        name: 'Alice',
        username: 'useralice',
        profile_picture: null,
      },
    });

    // Set up renderers
    Renderer = props => null;

    const Container = (props: {
      userRef?: {...},
      owner: OperationDescriptor,
      fragment: $FlowFixMe,
      ...
    }) => {
      // We need a render a component to run a Hook
      const [owner, _setOwner] = useState<OperationDescriptor>(props.owner);
      const [_, _setCount] = useState(0);
      const fragment = props.fragment ?? gqlFragment;
      const artificialUserRef = useMemo(
        () => ({
          [ID_KEY]:
            owner.request.variables.id ?? owner.request.variables.nodeID,
          [FRAGMENTS_KEY]: {
            [fragment.name]: {},
          },
          [FRAGMENT_OWNER_KEY]: owner.request,
        }),
        [owner, fragment.name],
      );
      const userRef = props.hasOwnProperty('userRef')
        ? props.userRef
        : artificialUserRef;

      setOwner = _setOwner;
      forceUpdate = () => _setCount(count => count + 1);

      const {fragmentData: userData} = useRefetchableFragmentNode(
        fragment,
        userRef,
      );
      return <Renderer user={userData} />;
    };

    const ContextProvider = ({children}) => {
      const [env, _setEnv] = useState(environment);
      const relayContext = useMemo(() => ({environment: env}), [env]);

      setEnvironment = _setEnv;

      return (
        <ReactRelayContext.Provider value={relayContext}>
          {children}
        </ReactRelayContext.Provider>
      );
    };

    renderFragment = (args?: {
      isConcurrent?: boolean,
      owner?: $FlowFixMe,
      userRef?: $FlowFixMe,
      fragment?: $FlowFixMe,
      ...
    }): $FlowFixMe => {
      const {isConcurrent = false, ...props} = args ?? {};
      let renderer;
      TestRenderer.act(() => {
        renderer = TestRenderer.create(
          <ErrorBoundary fallback={({error}) => `Error: ${error.message}`}>
            <React.Suspense fallback="Fallback">
              {/* $FlowFixMe(site=www,mobile) this comment suppresses an error found improving the
               * type of React$Node */}
              <ContextProvider>
                <Container owner={query} {...props} />
              </ContextProvider>
            </React.Suspense>
          </ErrorBoundary>,
          // $FlowFixMe - error revealed when flow-typing ReactTestRenderer
          {unstable_isConcurrent: isConcurrent},
        );
      });
      return renderer;
    };
  });

  afterEach(() => {
    environment.mockClear();
    renderSpy.mockClear();
  });

  describe('initial render', () => {
    // The bulk of initial render behavior is covered in useFragmentNode-test,
    // so this suite covers the basic cases as a sanity check.
    it('should throw error if fragment is plural', () => {
      jest.spyOn(console, 'error').mockImplementationOnce(() => {});

      const generated = generateAndCompile(`
        fragment UserFragment on User @relay(plural: true) {
          id
        }
      `);
      const renderer = renderFragment({fragment: generated.UserFragment});
      expect(
        renderer
          .toJSON()
          .includes('Remove `@relay(plural: true)` from fragment'),
      ).toEqual(true);
    });

    it('should throw error if fragment is missing @refetchable directive', () => {
      jest.spyOn(console, 'error').mockImplementationOnce(() => {});

      const generated = generateAndCompile(`
        fragment UserFragment on User {
          id
        }
      `);
      const renderer = renderFragment({fragment: generated.UserFragment});
      expect(
        renderer
          .toJSON()
          .includes(
            'Did you forget to add a @refetchable directive to the fragment?',
          ),
      ).toEqual(true);
    });

    it('should render fragment without error when data is available', () => {
      renderFragment();
      expectFragmentResults([
        {
          data: {
            id: '1',
            name: 'Alice',
            profile_picture: null,
            ...createFragmentRef('1', query),
          },
        },
      ]);
    });

    it('should render fragment without error when ref is null', () => {
      renderFragment({userRef: null});
      expectFragmentResults([{data: null}]);
    });

    it('should render fragment without error when ref is undefined', () => {
      renderFragment({userRef: undefined});
      expectFragmentResults([{data: null}]);
    });

    it('should update when fragment data changes', () => {
      renderFragment();
      expectFragmentResults([
        {
          data: {
            id: '1',
            name: 'Alice',
            profile_picture: null,
            ...createFragmentRef('1', query),
          },
        },
      ]);

      environment.commitPayload(query, {
        node: {
          __typename: 'User',
          id: '1',
          // Update name
          name: 'Alice in Wonderland',
        },
      });
      expectFragmentResults([
        {
          data: {
            id: '1',
            // Assert that name is updated
            name: 'Alice in Wonderland',
            profile_picture: null,
            ...createFragmentRef('1', query),
          },
        },
      ]);
    });

    it('should throw a promise if data is missing for fragment and request is in flight', () => {
      // This prevents console.error output in the test, which is expected
      jest.spyOn(console, 'error').mockImplementationOnce(() => {});
      jest
        .spyOn(
          require('relay-runtime').__internal,
          'getPromiseForActiveRequest',
        )
        .mockImplementationOnce(() => Promise.resolve());

      const missingDataVariables = {...variables, id: '4'};
      const missingDataQuery = createOperationDescriptor(
        gqlQuery,
        missingDataVariables,
      );
      // Commit a payload with name and profile_picture are missing
      environment.commitPayload(missingDataQuery, {
        node: {
          __typename: 'User',
          id: '4',
        },
      });

      const renderer = renderFragment({owner: missingDataQuery});
      expect(renderer.toJSON()).toEqual('Fallback');
    });
  });

  describe('refetch', () => {
    let release;

    beforeEach(() => {
      jest.resetModules();
      ({
        createMockEnvironment,
        generateAndCompile,
      } = require('relay-test-utils-internal'));

      release = jest.fn();
      environment.retain.mockImplementation((...args) => {
        return {
          dispose: release,
        };
      });
    });

    function expectRequestIsInFlight(
      expected,
      requestEnvironment = environment,
    ) {
      expect(requestEnvironment.execute).toBeCalledTimes(expected.requestCount);
      expect(
        requestEnvironment.mock.isLoading(
          expected.gqlRefetchQuery ?? gqlRefetchQuery,
          expected.refetchVariables,
          {force: true},
        ),
      ).toEqual(expected.inFlight);
    }

    function expectFragmentIsRefetching(
      renderer,
      expected: {|
        refetchVariables: Variables,
        refetchQuery?: OperationDescriptor,
        gqlRefetchQuery?: $FlowFixMe,
      |},
      env = environment,
    ) {
      expect(renderSpy).toBeCalledTimes(0);
      renderSpy.mockClear();

      // Assert refetch query was fetched
      expectRequestIsInFlight(
        {...expected, inFlight: true, requestCount: 1},
        env,
      );

      // Assert component suspended
      expect(renderSpy).toBeCalledTimes(0);
      expect(renderer.toJSON()).toEqual('Fallback');

      // Assert query is tentatively retained while component is suspended
      expect(env.retain).toBeCalledTimes(1);
      expect(env.retain.mock.calls[0][0]).toEqual(
        expected.refetchQuery ?? refetchQuery,
      );
    }

    it('does not refetch and warns if component has unmounted', () => {
      const warning = require('warning');
      const renderer = renderFragment();
      const initialUser = {
        id: '1',
        name: 'Alice',
        profile_picture: null,
        ...createFragmentRef('1', query),
      };
      expectFragmentResults([{data: initialUser}]);

      renderer.unmount();

      TestRenderer.act(() => {
        refetch({id: '4'});
      });

      expect(warning).toHaveBeenCalledTimes(1);
      expect(
        // $FlowFixMe
        warning.mock.calls[0][1].includes(
          'Relay: Unexpected call to `refetch` on unmounted component',
        ),
      ).toEqual(true);
      expect(environment.execute).toHaveBeenCalledTimes(0);
    });

    it('warns if fragment ref passed to useRefetchableFragmentNode() was null', () => {
      const warning = require('warning');
      renderFragment({userRef: null});
      expectFragmentResults([{data: null}]);

      TestRenderer.act(() => {
        refetch({id: '4'});
      });

      expect(warning).toHaveBeenCalledTimes(1);
      expect(
        // $FlowFixMe
        warning.mock.calls[0][1].includes(
          'Relay: Unexpected call to `refetch` while using a null fragment ref',
        ),
      ).toEqual(true);
      expect(environment.execute).toHaveBeenCalledTimes(1);
    });

    it('warns if refetch scheduled at high priority', () => {
      const warning = require('warning');
      const Scheduler = require('scheduler');
      renderFragment();
      const initialUser = {
        id: '1',
        name: 'Alice',
        profile_picture: null,
        ...createFragmentRef('1', query),
      };
      expectFragmentResults([{data: initialUser}]);

      TestRenderer.act(() => {
        Scheduler.unstable_runWithPriority(
          Scheduler.unstable_ImmediatePriority,
          () => {
            refetch({id: '4'});
          },
        );
      });

      expect(warning).toHaveBeenCalledTimes(1);
      expect(
        // $FlowFixMe
        warning.mock.calls[0][1].includes(
          'Relay: Unexpected call to `refetch` at a priority higher than expected',
        ),
      ).toEqual(true);
      expect(environment.execute).toHaveBeenCalledTimes(1);
    });

    it('throws error when error occurs during refetch', () => {
      jest.spyOn(console, 'error').mockImplementationOnce(() => {});

      const callback = jest.fn();
      const renderer = renderFragment();
      const initialUser = {
        id: '1',
        name: 'Alice',
        profile_picture: null,
        ...createFragmentRef('1', query),
      };
      expectFragmentResults([{data: initialUser}]);

      TestRenderer.act(() => {
        refetch({id: '4'}, {onComplete: callback});
      });

      // Assert that fragment is refetching with the right variables and
      // suspends upon refetch
      const refetchVariables = {
        id: '4',
        scale: 16,
      };
      refetchQuery = createOperationDescriptor(
        gqlRefetchQuery,
        refetchVariables,
      );
      expectFragmentIsRefetching(renderer, {
        refetchVariables,
        refetchQuery,
      });

      // Mock network error
      environment.mock.reject(gqlRefetchQuery, new Error('Oops'));
      TestRenderer.act(() => {
        jest.runAllImmediates();
      });

      // Assert error is caught in Error boundary
      expect(renderer.toJSON()).toEqual('Error: Oops');
      expect(callback).toBeCalledTimes(1);
      expect(callback.mock.calls[0][0]).toMatchObject({message: 'Oops'});

      // Assert refetch query wasn't retained
      TestRenderer.act(() => {
        jest.runAllTimers();
      });
      expect(release).toBeCalledTimes(1);
      expect(environment.retain).toBeCalledTimes(1);
    });

    it('refetches new variables correctly when refetching new id', () => {
      const renderer = renderFragment();
      const initialUser = {
        id: '1',
        name: 'Alice',
        profile_picture: null,
        ...createFragmentRef('1', query),
      };
      expectFragmentResults([{data: initialUser}]);

      TestRenderer.act(() => {
        refetch({id: '4'});
      });

      // Assert that fragment is refetching with the right variables and
      // suspends upon refetch
      const refetchVariables = {
        id: '4',
        scale: 16,
      };
      refetchQuery = createOperationDescriptor(
        gqlRefetchQuery,
        refetchVariables,
      );
      expectFragmentIsRefetching(renderer, {
        refetchVariables,
        refetchQuery,
      });

      // Mock network response
      environment.mock.resolve(gqlRefetchQuery, {
        data: {
          node: {
            __typename: 'User',
            id: '4',
            name: 'Mark',
            profile_picture: {
              uri: 'scale16',
            },
            username: 'usermark',
          },
        },
      });

      // Assert fragment is rendered with new data
      const refetchedUser = {
        id: '4',
        name: 'Mark',
        profile_picture: {
          uri: 'scale16',
        },
        ...createFragmentRef('4', refetchQuery),
      };
      expectFragmentResults([{data: refetchedUser}, {data: refetchedUser}]);

      // Assert refetch query was retained
      expect(release).not.toBeCalled();
      expect(environment.retain).toBeCalledTimes(1);
      expect(environment.retain.mock.calls[0][0]).toEqual(refetchQuery);
    });

    it('refetches new variables correctly when refetching same id', () => {
      const renderer = renderFragment();
      const initialUser = {
        id: '1',
        name: 'Alice',
        profile_picture: null,
        ...createFragmentRef('1', query),
      };
      expectFragmentResults([{data: initialUser}]);

      TestRenderer.act(() => {
        refetch({scale: 32});
      });

      // Assert that fragment is refetching with the right variables and
      // suspends upon refetch
      const refetchVariables = {
        id: '1',
        scale: 32,
      };
      refetchQuery = createOperationDescriptor(
        gqlRefetchQuery,
        refetchVariables,
      );
      expectFragmentIsRefetching(renderer, {
        refetchVariables,
        refetchQuery,
      });

      // Mock network response
      environment.mock.resolve(gqlRefetchQuery, {
        data: {
          node: {
            __typename: 'User',
            id: '1',
            name: 'Alice',
            profile_picture: {
              uri: 'scale32',
            },
            username: 'useralice',
          },
        },
      });

      // Assert fragment is rendered with new data
      const refetchedUser = {
        id: '1',
        name: 'Alice',
        profile_picture: {
          uri: 'scale32',
        },
        ...createFragmentRef('1', refetchQuery),
      };
      expectFragmentResults([{data: refetchedUser}, {data: refetchedUser}]);

      // Assert refetch query was retained
      expect(release).not.toBeCalled();
      expect(environment.retain).toBeCalledTimes(1);
      expect(environment.retain.mock.calls[0][0]).toEqual(refetchQuery);
    });

    it('with correct id from refetchable fragment when using nested fragment', () => {
      // Populate store with data for query using nested fragment
      environment.commitPayload(queryNestedFragment, {
        node: {
          __typename: 'Feedback',
          id: '<feedbackid>',
          actor: {
            __typename: 'User',
            id: '1',
            name: 'Alice',
            username: 'useralice',
            profile_picture: null,
          },
        },
      });

      // Get fragment ref for user using nested fragment
      const userRef = (environment.lookup(queryNestedFragment.fragment)
        .data: $FlowFixMe)?.node?.actor;

      const renderer = renderFragment({owner: queryNestedFragment, userRef});
      const initialUser = {
        id: '1',
        name: 'Alice',
        profile_picture: null,
        ...createFragmentRef('1', queryNestedFragment),
      };
      expectFragmentResults([{data: initialUser}]);

      TestRenderer.act(() => {
        refetch({scale: 32});
      });

      // Assert that fragment is refetching with the right variables and
      // suspends upon refetch
      const refetchVariables = {
        // The id here should correspond to the user id, and not the
        // feedback id from the query variables (i.e. `<feedbackid>`)
        id: '1',
        scale: 32,
      };
      refetchQuery = createOperationDescriptor(
        gqlRefetchQuery,
        refetchVariables,
      );
      expectFragmentIsRefetching(renderer, {
        refetchVariables,
        refetchQuery,
      });

      // Mock network response
      environment.mock.resolve(gqlRefetchQuery, {
        data: {
          node: {
            __typename: 'User',
            id: '1',
            name: 'Alice',
            profile_picture: {
              uri: 'scale32',
            },
            username: 'useralice',
          },
        },
      });

      // Assert fragment is rendered with new data
      const refetchedUser = {
        id: '1',
        name: 'Alice',
        profile_picture: {
          uri: 'scale32',
        },
        ...createFragmentRef('1', refetchQuery),
      };
      expectFragmentResults([{data: refetchedUser}, {data: refetchedUser}]);

      // Assert refetch query was retained
      expect(release).not.toBeCalled();
      expect(environment.retain).toBeCalledTimes(1);
      expect(environment.retain.mock.calls[0][0]).toEqual(refetchQuery);
    });

    it('refetches correctly when refetching multiple times', () => {
      const renderer = renderFragment();
      const initialUser = {
        id: '1',
        name: 'Alice',
        profile_picture: null,
        ...createFragmentRef('1', query),
      };
      expectFragmentResults([{data: initialUser}]);

      const refetchVariables = {
        id: '1',
        scale: 32,
      };
      refetchQuery = createOperationDescriptor(
        gqlRefetchQuery,
        refetchVariables,
      );
      const refetchedUser = {
        id: '1',
        name: 'Alice',
        profile_picture: {
          uri: 'scale32',
        },
        ...createFragmentRef('1', refetchQuery),
      };

      const doAndAssertRefetch = fragmentResults => {
        renderSpy.mockClear();
        environment.execute.mockClear();
        environment.retain.mockClear();
        release.mockClear();

        TestRenderer.act(() => {
          // We use fetchPolicy network-only to ensure the call to refetch
          // always suspends
          refetch({scale: 32}, {fetchPolicy: 'network-only'});
        });

        // Assert that fragment is refetching with the right variables and
        // suspends upon refetch
        expectFragmentIsRefetching(renderer, {
          refetchVariables,
          refetchQuery,
        });

        // Mock network response
        environment.mock.resolve(gqlRefetchQuery, {
          data: {
            node: {
              __typename: 'User',
              id: '1',
              name: 'Alice',
              profile_picture: {
                uri: 'scale32',
              },
              username: 'useralice',
            },
          },
        });

        // Assert fragment is rendered with new data
        expectFragmentResults(fragmentResults);

        // Assert refetch query was retained
        expect(release).not.toBeCalled();
        expect(environment.retain).toBeCalledTimes(1);
        expect(environment.retain.mock.calls[0][0]).toEqual(refetchQuery);
      };

      // Refetch once
      doAndAssertRefetch([{data: refetchedUser}, {data: refetchedUser}]);

      // Refetch twice
      doAndAssertRefetch([{data: refetchedUser}]);
    });

    it('refetches new variables correctly when using @arguments', () => {
      const userRef = environment.lookup(queryWithArgs.fragment).data?.node;
      const renderer = renderFragment({
        fragment: gqlFragmentWithArgs,
        userRef,
      });
      const initialUser = {
        id: '1',
        name: 'Alice',
        profile_picture: null,
        ...createFragmentRef('1', queryWithArgs),
      };
      expectFragmentResults([{data: initialUser}]);

      TestRenderer.act(() => {
        refetch({scaleLocal: 32});
      });

      // Assert that fragment is refetching with the right variables and
      // suspends upon refetch
      const refetchVariables = {
        id: '1',
        scaleLocal: 32,
      };
      refetchQueryWithArgs = createOperationDescriptor(
        gqlRefetchQueryWithArgs,
        refetchVariables,
      );
      expectFragmentIsRefetching(renderer, {
        refetchVariables,
        refetchQuery: refetchQueryWithArgs,
        gqlRefetchQuery: gqlRefetchQueryWithArgs,
      });

      // Mock network response
      environment.mock.resolve(gqlRefetchQueryWithArgs, {
        data: {
          node: {
            __typename: 'User',
            id: '1',
            name: 'Alice',
            profile_picture: {
              uri: 'scale32',
            },
            username: 'useralice',
          },
        },
      });

      // Assert fragment is rendered with new data
      const refetchedUser = {
        id: '1',
        name: 'Alice',
        profile_picture: {
          uri: 'scale32',
        },
        ...createFragmentRef('1', refetchQueryWithArgs),
      };
      expectFragmentResults([{data: refetchedUser}, {data: refetchedUser}]);

      // Assert refetch query was retained
      expect(release).not.toBeCalled();
      expect(environment.retain).toBeCalledTimes(1);
      expect(environment.retain.mock.calls[0][0]).toEqual(refetchQueryWithArgs);
    });

    it('refetches new variables correctly when using @arguments with literal values', () => {
      const userRef = environment.lookup(queryWithLiteralArgs.fragment).data
        ?.node;
      const renderer = renderFragment({
        fragment: gqlFragmentWithArgs,
        userRef,
      });
      const initialUser = {
        id: '1',
        name: 'Alice',
        profile_picture: null,
        ...createFragmentRef('1', queryWithLiteralArgs),
      };
      expectFragmentResults([{data: initialUser}]);

      TestRenderer.act(() => {
        refetch({id: '4'});
      });

      // Assert that fragment is refetching with the right variables and
      // suspends upon refetch
      const refetchVariables = {
        id: '4',
        scaleLocal: 16,
      };
      refetchQueryWithArgs = createOperationDescriptor(
        gqlRefetchQueryWithArgs,
        refetchVariables,
      );
      expectFragmentIsRefetching(renderer, {
        refetchVariables,
        refetchQuery: refetchQueryWithArgs,
        gqlRefetchQuery: gqlRefetchQueryWithArgs,
      });

      // Mock network response
      environment.mock.resolve(gqlRefetchQueryWithArgs, {
        data: {
          node: {
            __typename: 'User',
            id: '4',
            name: 'Mark',
            profile_picture: {
              uri: 'scale16',
            },
            username: 'usermark',
          },
        },
      });

      // Assert fragment is rendered with new data
      const refetchedUser = {
        id: '4',
        name: 'Mark',
        profile_picture: {
          uri: 'scale16',
        },
        ...createFragmentRef('4', refetchQueryWithArgs),
      };
      expectFragmentResults([{data: refetchedUser}, {data: refetchedUser}]);

      // Assert refetch query was retained
      expect(release).not.toBeCalled();
      expect(environment.retain).toBeCalledTimes(1);
      expect(environment.retain.mock.calls[0][0]).toEqual(refetchQueryWithArgs);
    });

    it('subscribes to changes in refetched data', () => {
      renderFragment();
      renderSpy.mockClear();
      TestRenderer.act(() => {
        refetch({id: '4'});
      });

      // Mock network response
      environment.mock.resolve(gqlRefetchQuery, {
        data: {
          node: {
            __typename: 'User',
            id: '4',
            name: 'Mark',
            profile_picture: {
              uri: 'scale16',
            },
            username: 'usermark',
          },
        },
      });

      // Assert fragment is rendered with new data
      const refetchVariables = {
        id: '4',
        scale: 16,
      };
      refetchQuery = createOperationDescriptor(
        gqlRefetchQuery,
        refetchVariables,
      );
      const refetchedUser = {
        id: '4',
        name: 'Mark',
        profile_picture: {
          uri: 'scale16',
        },
        ...createFragmentRef('4', refetchQuery),
      };
      expectFragmentResults([{data: refetchedUser}, {data: refetchedUser}]);

      // Assert refetch query was retained
      expect(release).not.toBeCalled();
      expect(environment.retain).toBeCalledTimes(1);
      expect(environment.retain.mock.calls[0][0]).toEqual(refetchQuery);

      // Update refetched data
      environment.commitPayload(refetchQuery, {
        node: {
          __typename: 'User',
          id: '4',
          name: 'Mark Updated',
        },
      });

      // Assert that refetched data is updated
      expectFragmentResults([
        {
          data: {
            id: '4',
            // Name is updated
            name: 'Mark Updated',
            profile_picture: {
              uri: 'scale16',
            },
            ...createFragmentRef('4', refetchQuery),
          },
        },
      ]);
    });

    it('resets to parent data when environment changes', () => {
      renderFragment();
      renderSpy.mockClear();
      TestRenderer.act(() => {
        refetch({id: '4'});
      });

      // Mock network response
      environment.mock.resolve(gqlRefetchQuery, {
        data: {
          node: {
            __typename: 'User',
            id: '4',
            name: 'Mark',
            profile_picture: {
              uri: 'scale16',
            },
            username: 'usermark',
          },
        },
      });

      // Assert fragment is rendered with new data
      const refetchVariables = {
        id: '4',
        scale: 16,
      };
      refetchQuery = createOperationDescriptor(
        gqlRefetchQuery,
        refetchVariables,
      );
      const refetchedUser = {
        id: '4',
        name: 'Mark',
        profile_picture: {
          uri: 'scale16',
        },
        ...createFragmentRef('4', refetchQuery),
      };
      expectFragmentResults([{data: refetchedUser}, {data: refetchedUser}]);

      // Assert refetch query was retained
      expect(release).not.toBeCalled();
      expect(environment.retain).toBeCalledTimes(1);
      expect(environment.retain.mock.calls[0][0]).toEqual(refetchQuery);

      // Set new environment
      const newEnvironment = createMockEnvironment();
      newEnvironment.commitPayload(query, {
        node: {
          __typename: 'User',
          id: '1',
          name: 'Alice in a different env',
          username: 'useralice',
          profile_picture: null,
        },
      });
      TestRenderer.act(() => {
        setEnvironment(newEnvironment);
      });

      // Assert that parent data is rendered
      const expectedUser = {
        id: '1',
        name: 'Alice in a different env',
        profile_picture: null,
        ...createFragmentRef('1', query),
      };
      expectFragmentResults([
        {data: expectedUser},
        {data: expectedUser},
        {data: expectedUser},
      ]);

      // Assert refetch query was released
      expect(release).toBeCalledTimes(1);
      expect(environment.retain).toBeCalledTimes(1);

      // Update data in new environment
      newEnvironment.commitPayload(query, {
        node: {
          __typename: 'User',
          id: '1',
          name: 'Alice Updated',
        },
      });

      // Assert that data in new environment is updated
      expectFragmentResults([
        {
          data: {
            id: '1',
            name: 'Alice Updated',
            profile_picture: null,
            ...createFragmentRef('1', query),
          },
        },
      ]);
    });

    it('resets to parent data when parent fragment ref changes', () => {
      renderFragment();
      renderSpy.mockClear();
      TestRenderer.act(() => {
        refetch({id: '4'});
      });

      // Mock network response
      environment.mock.resolve(gqlRefetchQuery, {
        data: {
          node: {
            __typename: 'User',
            id: '4',
            name: 'Mark',
            profile_picture: {
              uri: 'scale16',
            },
            username: 'usermark',
          },
        },
      });

      // Assert fragment is rendered with new data
      const refetchVariables = {
        id: '4',
        scale: 16,
      };
      refetchQuery = createOperationDescriptor(
        gqlRefetchQuery,
        refetchVariables,
      );
      const refetchedUser = {
        id: '4',
        name: 'Mark',
        profile_picture: {
          uri: 'scale16',
        },
        ...createFragmentRef('4', refetchQuery),
      };
      expectFragmentResults([{data: refetchedUser}, {data: refetchedUser}]);

      // Assert refetch query was retained
      expect(release).not.toBeCalled();
      expect(environment.retain).toBeCalledTimes(1);
      expect(environment.retain.mock.calls[0][0]).toEqual(refetchQuery);

      // Pass new parent fragment ref with different variables
      const newVariables = {...variables, scale: 32};
      const newQuery = createOperationDescriptor(gqlQuery, newVariables);
      environment.commitPayload(newQuery, {
        node: {
          __typename: 'User',
          id: '1',
          name: 'Alice',
          username: 'useralice',
          profile_picture: {
            uri: 'uri32',
          },
        },
      });
      TestRenderer.act(() => {
        setOwner(newQuery);
      });

      // Assert that parent data is rendered
      const expectedUser = {
        id: '1',
        name: 'Alice',
        profile_picture: {
          uri: 'uri32',
        },
        ...createFragmentRef('1', newQuery),
      };
      expectFragmentResults([
        {data: expectedUser},
        {data: expectedUser},
        {data: expectedUser},
      ]);

      // Assert refetch query was released
      expect(release).toBeCalledTimes(1);
      expect(environment.retain).toBeCalledTimes(1);

      // Update new parent data
      environment.commitPayload(newQuery, {
        node: {
          __typename: 'User',
          id: '1',
          name: 'Alice Updated',
        },
      });

      // Assert that new data from parent is updated
      expectFragmentResults([
        {
          data: {
            id: '1',
            name: 'Alice Updated',
            profile_picture: {
              uri: 'uri32',
            },
            ...createFragmentRef('1', newQuery),
          },
        },
      ]);
    });

    it('warns if data retured has different __typename', () => {
      const renderer = renderFragment();

      const initialUser = {
        id: '1',
        name: 'Alice',
        profile_picture: null,
        ...createFragmentRef('1', query),
      };
      expectFragmentResults([{data: initialUser}]);

      const refetchVariables = {
        id: '1',
        scale: 32,
      };
      refetchQuery = createOperationDescriptor(
        gqlRefetchQuery,
        refetchVariables,
      );

      renderSpy.mockClear();
      environment.execute.mockClear();
      environment.retain.mockClear();
      release.mockClear();

      TestRenderer.act(() => {
        refetch({scale: 32}, {fetchPolicy: 'network-only'});
      });

      expectFragmentIsRefetching(renderer, {
        refetchVariables,
        refetchQuery,
      });

      // Mock network response
      environment.mock.resolve(gqlRefetchQuery, {
        data: {
          node: {
            __typename: 'MessagingParticipant',
            id: '1',
            name: 'Alice',
            profile_picture: {
              uri: 'scale32',
            },
            username: 'useralice',
          },
        },
      });

      TestRenderer.act(() => {
        jest.runAllImmediates();
      });

      const warning = require('warning');

      // $FlowFixMe
      const warningCalls = warning.mock.calls.filter(call => call[0] === false);
      expect(warningCalls.length).toEqual(4); // the other warnings are from FragmentResource.js
      expect(
        warningCalls[1][1].includes(
          'Relay: Call to `refetch` returned data with a different __typename:',
        ),
      ).toEqual(true);
    });

    it('warns if a different id is returned', () => {
      const renderer = renderFragment();

      const initialUser = {
        id: '1',
        name: 'Alice',
        profile_picture: null,
        ...createFragmentRef('1', query),
      };
      expectFragmentResults([{data: initialUser}]);

      const refetchVariables = {
        id: '1',
        scale: 32,
      };
      refetchQuery = createOperationDescriptor(
        gqlRefetchQuery,
        refetchVariables,
      );

      renderSpy.mockClear();
      environment.execute.mockClear();
      environment.retain.mockClear();
      release.mockClear();

      TestRenderer.act(() => {
        refetch({scale: 32}, {fetchPolicy: 'network-only'});
      });

      expectFragmentIsRefetching(renderer, {
        refetchVariables,
        refetchQuery,
      });

      environment.mock.resolve(gqlRefetchQuery, {
        data: {
          node: {
            __typename: 'User',
            id: '2',
            name: 'Mark',
            profile_picture: {
              uri: 'scale32',
            },
            username: 'usermark',
          },
        },
      });

      TestRenderer.act(() => {
        jest.runAllImmediates();
      });

      const warning = require('warning');
      // $FlowFixMe
      const warningCalls = warning.mock.calls.filter(call => call[0] === false);
      expect(warningCalls.length).toEqual(2);
      expect(
        warningCalls[0][1].includes(
          'Relay: Call to `refetch` returned a different id, expected',
        ),
      ).toEqual(true);
    });

    it("doesn't warn if refetching on a different id than the current one in display", () => {
      renderFragment();

      const initialUser = {
        id: '1',
        name: 'Alice',
        profile_picture: null,
        ...createFragmentRef('1', query),
      };
      expectFragmentResults([{data: initialUser}]);

      const refetchVariables = {
        id: '1',
        scale: 32,
      };
      refetchQuery = createOperationDescriptor(
        gqlRefetchQuery,
        refetchVariables,
      );

      renderSpy.mockClear();
      environment.execute.mockClear();
      environment.retain.mockClear();
      release.mockClear();

      TestRenderer.act(() => {
        refetch({id: '2', scale: 32}, {fetchPolicy: 'network-only'});
        jest.runAllImmediates();
      });

      TestRenderer.act(() => {
        refetch({id: '3', scale: 32}, {fetchPolicy: 'network-only'});
      });

      environment.mock.resolve(gqlRefetchQuery, {
        data: {
          node: {
            __typename: 'User',
            id: '3',
            name: 'Mark',
            profile_picture: {
              uri: 'scale32',
            },
            username: 'usermark',
          },
        },
      });

      TestRenderer.act(() => {
        jest.runAllTimers();
      });

      const warning = require('warning');
      expect(
        // $FlowFixMe
        warning.mock.calls.filter(call => call[0] === false).length,
      ).toEqual(0);
    });

    describe('fetchPolicy', () => {
      describe('store-or-network', () => {
        beforeEach(() => {
          fetchPolicy = 'store-or-network';
        });

        describe('renderPolicy: partial', () => {
          beforeEach(() => {
            renderPolicy = 'partial';
          });
          it("doesn't start network request if refetch query is fully cached", () => {
            renderFragment();
            renderSpy.mockClear();
            TestRenderer.act(() => {
              refetch(
                {id: '1'},
                {fetchPolicy, UNSTABLE_renderPolicy: renderPolicy},
              );
            });

            // Assert request is not started
            const refetchVariables = {...variables};
            refetchQuery = createOperationDescriptor(
              gqlRefetchQuery,
              refetchVariables,
            );
            expectRequestIsInFlight({
              inFlight: false,
              requestCount: 0,
              gqlRefetchQuery,
              refetchVariables,
            });

            // Assert component renders immediately since data is cached
            const refetchingUser = {
              id: '1',
              name: 'Alice',
              profile_picture: null,
              ...createFragmentRef('1', refetchQuery),
            };
            expectFragmentResults([
              {data: refetchingUser},
              {data: refetchingUser},
            ]);
          });

          it('starts network request if refetch query is not fully cached and suspends if fragment has missing data', () => {
            const renderer = renderFragment();
            const initialUser = {
              id: '1',
              name: 'Alice',
              profile_picture: null,
              ...createFragmentRef('1', query),
            };
            expectFragmentResults([{data: initialUser}]);

            TestRenderer.act(() => {
              refetch(
                {id: '4'},
                {fetchPolicy, UNSTABLE_renderPolicy: renderPolicy},
              );
            });

            // Assert that fragment is refetching with the right variables and
            // suspends upon refetch
            const refetchVariables = {
              id: '4',
              scale: 16,
            };
            refetchQuery = createOperationDescriptor(
              gqlRefetchQuery,
              refetchVariables,
            );
            expectFragmentIsRefetching(renderer, {
              refetchVariables,
              refetchQuery,
            });

            // Mock network response
            environment.mock.resolve(gqlRefetchQuery, {
              data: {
                node: {
                  __typename: 'User',
                  id: '4',
                  name: 'Mark',
                  profile_picture: {
                    uri: 'scale16',
                  },
                  username: 'usermark',
                },
              },
            });

            // Assert fragment is rendered with new data
            const refetchedUser = {
              id: '4',
              name: 'Mark',
              profile_picture: {
                uri: 'scale16',
              },
              ...createFragmentRef('4', refetchQuery),
            };
            expectFragmentResults([
              {data: refetchedUser},
              {data: refetchedUser},
            ]);
          });

          it("starts network request if refetch query is not fully cached and doesn't suspend if fragment doesn't have missing data", () => {
            // Cache user with missing username
            const refetchVariables = {id: '4', scale: 16};
            refetchQuery = createOperationDescriptor(
              gqlRefetchQuery,
              refetchVariables,
            );
            environment.commitPayload(refetchQuery, {
              node: {
                __typename: 'User',
                id: '4',
                name: 'Mark',
                profile_picture: null,
              },
            });

            renderFragment();
            renderSpy.mockClear();
            TestRenderer.act(() => {
              refetch(
                {id: '4'},
                {fetchPolicy, UNSTABLE_renderPolicy: renderPolicy},
              );
            });

            // Assert request is started
            expectRequestIsInFlight({
              inFlight: true,
              requestCount: 1,
              gqlRefetchQuery,
              refetchVariables,
            });

            // Assert component renders immediately since data is cached
            const refetchingUser = {
              id: '4',
              name: 'Mark',
              profile_picture: null,
              ...createFragmentRef('4', refetchQuery),
            };
            expectFragmentResults([
              {data: refetchingUser},
              {data: refetchingUser},
            ]);
          });
        });

        describe('renderPolicy: full', () => {
          beforeEach(() => {
            renderPolicy = 'full';
          });
          it("doesn't start network request if refetch query is fully cached", () => {
            renderFragment();
            renderSpy.mockClear();
            TestRenderer.act(() => {
              refetch(
                {id: '1'},
                {fetchPolicy, UNSTABLE_renderPolicy: renderPolicy},
              );
            });

            // Assert request is not started
            const refetchVariables = {...variables};
            refetchQuery = createOperationDescriptor(
              gqlRefetchQuery,
              refetchVariables,
            );
            expectRequestIsInFlight({
              inFlight: false,
              requestCount: 0,
              gqlRefetchQuery,
              refetchVariables,
            });

            // Assert component renders immediately since data is cached
            const refetchingUser = {
              id: '1',
              name: 'Alice',
              profile_picture: null,
              ...createFragmentRef('1', refetchQuery),
            };
            expectFragmentResults([
              {data: refetchingUser},
              {data: refetchingUser},
            ]);
          });

          it('starts network request if refetch query is not fully cached and suspends if fragment has missing data', () => {
            const renderer = renderFragment();
            const initialUser = {
              id: '1',
              name: 'Alice',
              profile_picture: null,
              ...createFragmentRef('1', query),
            };
            expectFragmentResults([{data: initialUser}]);

            TestRenderer.act(() => {
              refetch(
                {id: '4'},
                {fetchPolicy, UNSTABLE_renderPolicy: renderPolicy},
              );
            });

            // Assert that fragment is refetching with the right variables and
            // suspends upon refetch
            const refetchVariables = {
              id: '4',
              scale: 16,
            };
            refetchQuery = createOperationDescriptor(
              gqlRefetchQuery,
              refetchVariables,
            );
            expectFragmentIsRefetching(renderer, {
              refetchVariables,
              refetchQuery,
            });

            // Mock network response
            environment.mock.resolve(gqlRefetchQuery, {
              data: {
                node: {
                  __typename: 'User',
                  id: '4',
                  name: 'Mark',
                  profile_picture: {
                    uri: 'scale16',
                  },
                  username: 'usermark',
                },
              },
            });

            // Assert fragment is rendered with new data
            const refetchedUser = {
              id: '4',
              name: 'Mark',
              profile_picture: {
                uri: 'scale16',
              },
              ...createFragmentRef('4', refetchQuery),
            };
            expectFragmentResults([
              {data: refetchedUser},
              {data: refetchedUser},
            ]);
          });

          it("starts network request if refetch query is not fully cached and suspends even if fragment doesn't have missing data", () => {
            // Cache user with missing username
            const refetchVariables = {id: '4', scale: 16};
            refetchQuery = createOperationDescriptor(
              gqlRefetchQuery,
              refetchVariables,
            );
            environment.commitPayload(refetchQuery, {
              node: {
                __typename: 'User',
                id: '4',
                name: 'Mark',
                profile_picture: null,
              },
            });

            const renderer = renderFragment();
            const initialUser = {
              id: '1',
              name: 'Alice',
              profile_picture: null,
              ...createFragmentRef('1', query),
            };
            expectFragmentResults([{data: initialUser}]);

            TestRenderer.act(() => {
              refetch(
                {id: '4'},
                {fetchPolicy, UNSTABLE_renderPolicy: renderPolicy},
              );
            });

            expectFragmentIsRefetching(renderer, {
              refetchVariables,
              refetchQuery,
            });

            // Mock network response
            environment.mock.resolve(gqlRefetchQuery, {
              data: {
                node: {
                  __typename: 'User',
                  id: '4',
                  name: 'Mark',
                  profile_picture: {
                    uri: 'scale16',
                  },
                  username: 'usermark',
                },
              },
            });

            // Assert fragment is rendered with new data
            const refetchedUser = {
              id: '4',
              name: 'Mark',
              profile_picture: {
                uri: 'scale16',
              },
              ...createFragmentRef('4', refetchQuery),
            };
            expectFragmentResults([
              {data: refetchedUser},
              {data: refetchedUser},
            ]);
          });
        });
      });

      describe('store-and-network', () => {
        beforeEach(() => {
          fetchPolicy = 'store-and-network';
        });

        describe('renderPolicy: partial', () => {
          beforeEach(() => {
            renderPolicy = 'partial';
          });

          it('starts network request if refetch query is fully cached', () => {
            renderFragment();
            renderSpy.mockClear();
            TestRenderer.act(() => {
              refetch(
                {id: '1'},
                {fetchPolicy, UNSTABLE_renderPolicy: renderPolicy},
              );
            });

            // Assert request is not started
            const refetchVariables = {...variables};
            refetchQuery = createOperationDescriptor(
              gqlRefetchQuery,
              refetchVariables,
            );
            expectRequestIsInFlight({
              inFlight: true,
              requestCount: 1,
              gqlRefetchQuery,
              refetchVariables,
            });

            // Assert component renders immediately since data is cached
            const refetchingUser = {
              id: '1',
              name: 'Alice',
              profile_picture: null,
              ...createFragmentRef('1', refetchQuery),
            };
            expectFragmentResults([
              {data: refetchingUser},
              {data: refetchingUser},
            ]);
          });

          it('starts network request if refetch query is not fully cached and suspends if fragment has missing data', () => {
            const renderer = renderFragment();
            const initialUser = {
              id: '1',
              name: 'Alice',
              profile_picture: null,
              ...createFragmentRef('1', query),
            };
            expectFragmentResults([{data: initialUser}]);

            TestRenderer.act(() => {
              refetch(
                {id: '4'},
                {fetchPolicy, UNSTABLE_renderPolicy: renderPolicy},
              );
            });

            // Assert that fragment is refetching with the right variables and
            // suspends upon refetch
            const refetchVariables = {
              id: '4',
              scale: 16,
            };
            refetchQuery = createOperationDescriptor(
              gqlRefetchQuery,
              refetchVariables,
            );
            expectFragmentIsRefetching(renderer, {
              refetchVariables,
              refetchQuery,
            });

            // Mock network response
            environment.mock.resolve(gqlRefetchQuery, {
              data: {
                node: {
                  __typename: 'User',
                  id: '4',
                  name: 'Mark',
                  profile_picture: {
                    uri: 'scale16',
                  },
                  username: 'usermark',
                },
              },
            });

            // Assert fragment is rendered with new data
            const refetchedUser = {
              id: '4',
              name: 'Mark',
              profile_picture: {
                uri: 'scale16',
              },
              ...createFragmentRef('4', refetchQuery),
            };
            expectFragmentResults([
              {data: refetchedUser},
              {data: refetchedUser},
            ]);
          });

          it("starts network request if refetch query is not fully cached and doesn't suspend if fragment doesn't have missing data", () => {
            // Cache user with missing username
            const refetchVariables = {id: '4', scale: 16};
            refetchQuery = createOperationDescriptor(
              gqlRefetchQuery,
              refetchVariables,
            );
            environment.commitPayload(refetchQuery, {
              node: {
                __typename: 'User',
                id: '4',
                name: 'Mark',
                profile_picture: null,
              },
            });

            renderFragment();
            renderSpy.mockClear();
            TestRenderer.act(() => {
              refetch(
                {id: '4'},
                {fetchPolicy, UNSTABLE_renderPolicy: renderPolicy},
              );
            });

            // Assert request is started
            expectRequestIsInFlight({
              inFlight: true,
              requestCount: 1,
              gqlRefetchQuery,
              refetchVariables,
            });

            // Assert component renders immediately since data is cached
            const refetchingUser = {
              id: '4',
              name: 'Mark',
              profile_picture: null,
              ...createFragmentRef('4', refetchQuery),
            };
            expectFragmentResults([
              {data: refetchingUser},
              {data: refetchingUser},
            ]);
          });
        });

        describe('renderPolicy: full', () => {
          beforeEach(() => {
            renderPolicy = 'full';
          });

          it('starts network request if refetch query is fully cached', () => {
            renderFragment();
            renderSpy.mockClear();
            TestRenderer.act(() => {
              refetch(
                {id: '1'},
                {fetchPolicy, UNSTABLE_renderPolicy: renderPolicy},
              );
            });

            // Assert request is not started
            const refetchVariables = {...variables};
            refetchQuery = createOperationDescriptor(
              gqlRefetchQuery,
              refetchVariables,
            );
            expectRequestIsInFlight({
              inFlight: true,
              requestCount: 1,
              gqlRefetchQuery,
              refetchVariables,
            });

            // Assert component renders immediately since data is cached
            const refetchingUser = {
              id: '1',
              name: 'Alice',
              profile_picture: null,
              ...createFragmentRef('1', refetchQuery),
            };
            expectFragmentResults([
              {data: refetchingUser},
              {data: refetchingUser},
            ]);
          });

          it('starts network request if refetch query is not fully cached and suspends if fragment has missing data', () => {
            const renderer = renderFragment();
            const initialUser = {
              id: '1',
              name: 'Alice',
              profile_picture: null,
              ...createFragmentRef('1', query),
            };
            expectFragmentResults([{data: initialUser}]);

            TestRenderer.act(() => {
              refetch(
                {id: '4'},
                {fetchPolicy, UNSTABLE_renderPolicy: renderPolicy},
              );
            });

            // Assert that fragment is refetching with the right variables and
            // suspends upon refetch
            const refetchVariables = {
              id: '4',
              scale: 16,
            };
            refetchQuery = createOperationDescriptor(
              gqlRefetchQuery,
              refetchVariables,
            );
            expectFragmentIsRefetching(renderer, {
              refetchVariables,
              refetchQuery,
            });

            // Mock network response
            environment.mock.resolve(gqlRefetchQuery, {
              data: {
                node: {
                  __typename: 'User',
                  id: '4',
                  name: 'Mark',
                  profile_picture: {
                    uri: 'scale16',
                  },
                  username: 'usermark',
                },
              },
            });

            // Assert fragment is rendered with new data
            const refetchedUser = {
              id: '4',
              name: 'Mark',
              profile_picture: {
                uri: 'scale16',
              },
              ...createFragmentRef('4', refetchQuery),
            };
            expectFragmentResults([
              {data: refetchedUser},
              {data: refetchedUser},
            ]);
          });

          it("starts network request if refetch query is not fully cached and doesn't suspend if fragment doesn't have missing data", () => {
            // Cache user with missing username
            const refetchVariables = {id: '4', scale: 16};
            refetchQuery = createOperationDescriptor(
              gqlRefetchQuery,
              refetchVariables,
            );
            environment.commitPayload(refetchQuery, {
              node: {
                __typename: 'User',
                id: '4',
                name: 'Mark',
                profile_picture: null,
              },
            });

            const renderer = renderFragment();
            renderSpy.mockClear();
            TestRenderer.act(() => {
              refetch(
                {id: '4'},
                {fetchPolicy, UNSTABLE_renderPolicy: renderPolicy},
              );
            });

            // Assert component suspended
            expectFragmentIsRefetching(renderer, {
              refetchVariables,
              refetchQuery,
            });

            // Mock network response
            environment.mock.resolve(gqlRefetchQuery, {
              data: {
                node: {
                  __typename: 'User',
                  id: '4',
                  name: 'Mark',
                  profile_picture: {
                    uri: 'scale16',
                  },
                  username: 'usermark',
                },
              },
            });

            // Assert fragment is rendered with new data
            const refetchedUser = {
              id: '4',
              name: 'Mark',
              profile_picture: {
                uri: 'scale16',
              },
              ...createFragmentRef('4', refetchQuery),
            };
            expectFragmentResults([
              {data: refetchedUser},
              {data: refetchedUser},
            ]);
          });
        });
      });

      describe('network-only', () => {
        beforeEach(() => {
          fetchPolicy = 'network-only';
        });

        it('starts network request and suspends if refetch query is fully cached', () => {
          const renderer = renderFragment();
          const initialUser = {
            id: '1',
            name: 'Alice',
            profile_picture: null,
            ...createFragmentRef('1', query),
          };
          expectFragmentResults([{data: initialUser}]);

          TestRenderer.act(() => {
            refetch(
              {id: '1'},
              {fetchPolicy, UNSTABLE_renderPolicy: renderPolicy},
            );
          });

          // Assert that fragment is refetching with the right variables and
          // suspends upon refetch
          const refetchVariables = {
            ...variables,
          };
          refetchQuery = createOperationDescriptor(
            gqlRefetchQuery,
            refetchVariables,
          );
          expectFragmentIsRefetching(renderer, {
            refetchVariables,
            refetchQuery,
          });

          // Mock network response
          environment.mock.resolve(gqlRefetchQuery, {
            data: {
              node: {
                __typename: 'User',
                id: '1',
                name: 'Alice',
                profile_picture: null,
                username: 'useralice',
              },
            },
          });

          // Assert fragment is rendered with new data
          const refetchedUser = {
            ...initialUser,
            ...createFragmentRef('1', refetchQuery),
          };
          expectFragmentResults([{data: refetchedUser}, {data: refetchedUser}]);
        });

        it('starts network request and suspends if refetch query is not fully cached', () => {
          const renderer = renderFragment();
          const initialUser = {
            id: '1',
            name: 'Alice',
            profile_picture: null,
            ...createFragmentRef('1', query),
          };
          expectFragmentResults([{data: initialUser}]);

          TestRenderer.act(() => {
            refetch(
              {id: '4'},
              {fetchPolicy, UNSTABLE_renderPolicy: renderPolicy},
            );
          });

          // Assert that fragment is refetching with the right variables and
          // suspends upon refetch
          const refetchVariables = {
            id: '4',
            scale: 16,
          };
          refetchQuery = createOperationDescriptor(
            gqlRefetchQuery,
            refetchVariables,
          );
          expectFragmentIsRefetching(renderer, {
            refetchVariables,
            refetchQuery,
          });

          // Mock network response
          environment.mock.resolve(gqlRefetchQuery, {
            data: {
              node: {
                __typename: 'User',
                id: '4',
                name: 'Mark',
                profile_picture: {
                  uri: 'scale16',
                },
                username: 'usermark',
              },
            },
          });

          // Assert fragment is rendered with new data
          const refetchedUser = {
            id: '4',
            name: 'Mark',
            profile_picture: {
              uri: 'scale16',
            },
            ...createFragmentRef('4', refetchQuery),
          };
          expectFragmentResults([{data: refetchedUser}, {data: refetchedUser}]);
        });
      });

      describe('store-only', () => {
        beforeEach(() => {
          fetchPolicy = 'store-only';
        });

        it("doesn't start network request if refetch query is fully cached", () => {
          renderFragment();
          renderSpy.mockClear();
          TestRenderer.act(() => {
            refetch(
              {id: '1'},
              {fetchPolicy, UNSTABLE_renderPolicy: renderPolicy},
            );
          });

          // Assert request is not started
          const refetchVariables = {...variables};
          refetchQuery = createOperationDescriptor(
            gqlRefetchQuery,
            refetchVariables,
          );
          expectRequestIsInFlight({
            inFlight: false,
            requestCount: 0,
            gqlRefetchQuery,
            refetchVariables,
          });

          // Assert component renders immediately since data is cached
          const refetchingUser = {
            id: '1',
            name: 'Alice',
            profile_picture: null,
            ...createFragmentRef('1', refetchQuery),
          };
          expectFragmentResults([
            {data: refetchingUser},
            {data: refetchingUser},
          ]);
        });

        it("doesn't start network request if refetch query is not fully cached", () => {
          renderFragment();
          renderSpy.mockClear();
          TestRenderer.act(() => {
            refetch(
              {id: '4'},
              {fetchPolicy, UNSTABLE_renderPolicy: renderPolicy},
            );
          });

          // Assert request is not started
          const refetchVariables = {id: '4', scale: 32};
          refetchQuery = createOperationDescriptor(
            gqlRefetchQuery,
            refetchVariables,
          );
          expectRequestIsInFlight({
            inFlight: false,
            requestCount: 0,
            gqlRefetchQuery,
            refetchVariables,
          });

          // Assert component renders immediately with empty daa
          expectFragmentResults([{data: null}, {data: null}]);
        });
      });
    });

    describe('disposing', () => {
      let unsubscribe;
      const fetchPolicy = 'store-and-network';
      beforeEach(() => {
        unsubscribe = jest.fn();
        jest.doMock('relay-runtime', () => {
          const originalRuntime = jest.requireActual('relay-runtime');
          const originalInternal = originalRuntime.__internal;
          return {
            ...originalRuntime,
            __internal: {
              ...originalInternal,
              fetchQuery: (...args) => {
                const observable = originalInternal.fetchQuery(...args);
                return {
                  subscribe: observer => {
                    return observable.subscribe({
                      ...observer,
                      start: originalSubscription => {
                        const observerStart = observer?.start;
                        observerStart &&
                          observerStart({
                            ...originalSubscription,
                            unsubscribe: () => {
                              originalSubscription.unsubscribe();
                              unsubscribe();
                            },
                          });
                      },
                    });
                  },
                };
              },
            },
          };
        });
      });

      afterEach(() => {
        jest.dontMock('relay-runtime');
      });

      it('disposes ongoing request if environment changes', () => {
        renderFragment();
        renderSpy.mockClear();
        TestRenderer.act(() => {
          refetch(
            {id: '1'},
            {fetchPolicy, UNSTABLE_renderPolicy: renderPolicy},
          );
        });

        // Assert request is started
        const refetchVariables = {id: '1', scale: 16};
        refetchQuery = createOperationDescriptor(
          gqlRefetchQuery,
          refetchVariables,
        );
        expectRequestIsInFlight({
          inFlight: true,
          requestCount: 1,
          gqlRefetchQuery,
          refetchVariables,
        });

        // Component renders immediately even though request is in flight
        // since data is cached
        const refetchingUser = {
          id: '1',
          name: 'Alice',
          profile_picture: null,
          ...createFragmentRef('1', refetchQuery),
        };
        expectFragmentResults([{data: refetchingUser}, {data: refetchingUser}]);

        // Set new environment
        const newEnvironment = createMockEnvironment();
        newEnvironment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: '1',
            name: 'Alice in a different env',
            username: 'useralice',
            profile_picture: null,
          },
        });
        TestRenderer.act(() => {
          setEnvironment(newEnvironment);
        });

        // Assert request was canceled
        expect(unsubscribe).toBeCalledTimes(1);
        expectRequestIsInFlight({
          inFlight: false,
          requestCount: 1,
          gqlRefetchQuery,
          refetchVariables,
        });

        // Assert newly rendered data
        const expectedUser = {
          id: '1',
          name: 'Alice in a different env',
          profile_picture: null,
          ...createFragmentRef('1', query),
        };
        expectFragmentResults([
          {data: expectedUser},
          {data: expectedUser},
          {data: expectedUser},
        ]);
      });

      it('disposes ongoing request if fragment ref changes', () => {
        renderFragment();
        renderSpy.mockClear();
        TestRenderer.act(() => {
          refetch(
            {id: '1'},
            {fetchPolicy, UNSTABLE_renderPolicy: renderPolicy},
          );
        });

        // Assert request is started
        const refetchVariables = {id: '1', scale: 16};
        refetchQuery = createOperationDescriptor(
          gqlRefetchQuery,
          refetchVariables,
        );
        expectRequestIsInFlight({
          inFlight: true,
          requestCount: 1,
          gqlRefetchQuery,
          refetchVariables,
        });

        // Component renders immediately even though request is in flight
        // since data is cached
        const refetchingUser = {
          id: '1',
          name: 'Alice',
          profile_picture: null,
          ...createFragmentRef('1', refetchQuery),
        };
        expectFragmentResults([{data: refetchingUser}, {data: refetchingUser}]);

        // Pass new parent fragment ref with different variables
        const newVariables = {...variables, scale: 32};
        const newQuery = createOperationDescriptor(gqlQuery, newVariables);
        environment.commitPayload(newQuery, {
          node: {
            __typename: 'User',
            id: '1',
            name: 'Alice',
            username: 'useralice',
            profile_picture: {
              uri: 'uri32',
            },
          },
        });
        TestRenderer.act(() => {
          setOwner(newQuery);
        });

        // Assert request was canceled
        expect(unsubscribe).toBeCalledTimes(1);
        expectRequestIsInFlight({
          inFlight: false,
          requestCount: 1,
          gqlRefetchQuery,
          refetchVariables,
        });

        // Assert newly rendered data
        const expectedUser = {
          id: '1',
          name: 'Alice',
          profile_picture: {
            uri: 'uri32',
          },
          ...createFragmentRef('1', newQuery),
        };
        expectFragmentResults([
          {data: expectedUser},
          {data: expectedUser},
          {data: expectedUser},
        ]);
      });

      it('disposes ongoing request if refetch is called again', () => {
        const renderer = renderFragment();
        renderSpy.mockClear();
        TestRenderer.act(() => {
          refetch(
            {id: '1'},
            {fetchPolicy, UNSTABLE_renderPolicy: renderPolicy},
          );
        });

        // Assert request is started
        const refetchVariables1 = {id: '1', scale: 16};
        const refetchQuery1 = createOperationDescriptor(
          gqlRefetchQuery,
          refetchVariables1,
        );
        expectRequestIsInFlight({
          inFlight: true,
          requestCount: 1,
          gqlRefetchQuery,
          refetchVariables: refetchVariables1,
        });

        // Component renders immediately even though request is in flight
        // since data is cached
        const refetchingUser = {
          id: '1',
          name: 'Alice',
          profile_picture: null,
          ...createFragmentRef('1', refetchQuery1),
        };
        expectFragmentResults([{data: refetchingUser}, {data: refetchingUser}]);

        // Call refetch a second time
        environment.execute.mockClear();
        const refetchVariables2 = {id: '4', scale: 16};
        TestRenderer.act(() => {
          refetch(
            {id: '4'},
            {fetchPolicy, UNSTABLE_renderPolicy: renderPolicy},
          );
        });

        // Assert first request was canceled
        expect(unsubscribe).toBeCalledTimes(1);
        expectRequestIsInFlight({
          inFlight: false,
          requestCount: 1,
          gqlRefetchQuery,
          refetchVariables: refetchVariables1,
        });

        // Assert second request is started
        expectRequestIsInFlight({
          inFlight: true,
          requestCount: 1,
          gqlRefetchQuery,
          refetchVariables: refetchVariables2,
        });
        // Assert component suspended
        expect(renderSpy).toBeCalledTimes(0);
        expect(renderer.toJSON()).toEqual('Fallback');
      });

      it('disposes of ongoing request on unmount when refetch suspends', () => {
        const renderer = renderFragment();
        renderSpy.mockClear();
        TestRenderer.act(() => {
          refetch(
            {id: '2'},
            {fetchPolicy, UNSTABLE_renderPolicy: renderPolicy},
          );
        });

        // Assert request is started
        const refetchVariables = {id: '2', scale: 16};
        refetchQuery = createOperationDescriptor(
          gqlRefetchQuery,
          refetchVariables,
        );

        expectFragmentIsRefetching(renderer, {
          refetchVariables,
          refetchQuery,
        });

        renderer.unmount();

        // Assert request was canceled
        expect(unsubscribe).toBeCalledTimes(1);
        expectRequestIsInFlight({
          inFlight: false,
          requestCount: 1,
          gqlRefetchQuery,
          refetchVariables,
        });
      });

      it('disposes of ongoing request on unmount when refetch does not suspend', () => {
        const renderer = renderFragment();
        renderSpy.mockClear();
        TestRenderer.act(() => {
          refetch(
            {id: '1'},
            {fetchPolicy, UNSTABLE_renderPolicy: renderPolicy},
          );
        });

        // Assert request is started
        const refetchVariables = {id: '1', scale: 16};
        refetchQuery = createOperationDescriptor(
          gqlRefetchQuery,
          refetchVariables,
        );
        expectRequestIsInFlight({
          inFlight: true,
          requestCount: 1,
          gqlRefetchQuery,
          refetchVariables,
        });

        // Component renders immediately even though request is in flight
        // since data is cached
        const refetchingUser = {
          id: '1',
          name: 'Alice',
          profile_picture: null,
          ...createFragmentRef('1', refetchQuery),
        };
        expectFragmentResults([{data: refetchingUser}, {data: refetchingUser}]);

        renderer.unmount();

        // Assert request was canceled
        expect(unsubscribe).toBeCalledTimes(2);
        expectRequestIsInFlight({
          inFlight: false,
          requestCount: 1,
          gqlRefetchQuery,
          refetchVariables,
        });
      });

      it('disposes ongoing request if it is manually disposed', () => {
        renderFragment();
        renderSpy.mockClear();
        let disposable;
        TestRenderer.act(() => {
          disposable = refetch(
            {id: '1'},
            {fetchPolicy, UNSTABLE_renderPolicy: renderPolicy},
          );
        });

        // Assert request is started
        const refetchVariables = {id: '1', scale: 16};
        refetchQuery = createOperationDescriptor(
          gqlRefetchQuery,
          refetchVariables,
        );
        expectRequestIsInFlight({
          inFlight: true,
          requestCount: 1,
          gqlRefetchQuery,
          refetchVariables,
        });

        // Component renders immediately even though request is in flight
        // since data is cached
        const refetchingUser = {
          id: '1',
          name: 'Alice',
          profile_picture: null,
          ...createFragmentRef('1', refetchQuery),
        };
        expectFragmentResults([{data: refetchingUser}, {data: refetchingUser}]);

        disposable && disposable.dispose();

        // Assert request was canceled
        expect(unsubscribe).toBeCalledTimes(1);
        expectRequestIsInFlight({
          inFlight: false,
          requestCount: 1,
          gqlRefetchQuery,
          refetchVariables,
        });
      });
    });

    describe('when id variable has a different variable name in original query', () => {
      beforeEach(() => {
        const generated = generateAndCompile(
          `
            fragment NestedUserFragment on User {
              username
            }

            fragment UserFragment on User
            @refetchable(queryName: "UserFragmentRefetchQuery") {
              id
              name
              profile_picture(scale: $scale) {
                uri
              }
              ...NestedUserFragment
            }

            query UserQuery($nodeID: ID!, $scale: Int!) {
              node(id: $nodeID) {
                ...UserFragment
              }
            }
          `,
        );
        variables = {nodeID: '1', scale: 16};
        gqlQuery = generated.UserQuery;
        gqlRefetchQuery = generated.UserFragmentRefetchQuery;
        gqlFragment = generated.UserFragment;
        invariant(
          gqlFragment.metadata?.refetch?.operation ===
            '@@MODULE_START@@UserFragmentRefetchQuery.graphql@@MODULE_END@@',
          'useRefetchableFragment-test: Expected refetchable fragment metadata to contain operation.',
        );
        // Manually set the refetchable operation for the test.
        gqlFragment.metadata.refetch.operation = gqlRefetchQuery;

        query = createOperationDescriptor(gqlQuery, variables);
        refetchQuery = createOperationDescriptor(gqlRefetchQuery, variables);

        environment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: '1',
            name: 'Alice',
            username: 'useralice',
            profile_picture: null,
          },
        });
      });

      it('refetches new variables correctly when refetching new id', () => {
        const renderer = renderFragment();
        const initialUser = {
          id: '1',
          name: 'Alice',
          profile_picture: null,
          ...createFragmentRef('1', query),
        };
        expectFragmentResults([
          {
            data: initialUser,
          },
        ]);

        TestRenderer.act(() => {
          refetch({id: '4'});
        });

        // Assert that fragment is refetching with the right variables and
        // suspends upon refetch
        const refetchVariables = {
          id: '4',
          scale: 16,
        };
        refetchQuery = createOperationDescriptor(
          gqlRefetchQuery,
          refetchVariables,
        );
        expectFragmentIsRefetching(renderer, {
          refetchVariables,
          refetchQuery,
        });

        // Mock network response
        environment.mock.resolve(gqlRefetchQuery, {
          data: {
            node: {
              __typename: 'User',
              id: '4',
              name: 'Mark',
              profile_picture: {
                uri: 'scale16',
              },
              username: 'usermark',
            },
          },
        });

        // Assert fragment is rendered with new data
        const refetchedUser = {
          id: '4',
          name: 'Mark',
          profile_picture: {
            uri: 'scale16',
          },
          ...createFragmentRef('4', refetchQuery),
        };
        expectFragmentResults([
          {
            data: refetchedUser,
          },
          {
            data: refetchedUser,
          },
        ]);

        // Assert refetch query was retained
        expect(release).not.toBeCalled();
        expect(environment.retain).toBeCalledTimes(1);
        expect(environment.retain.mock.calls[0][0]).toEqual(refetchQuery);
      });

      it('refetches new variables correctly when refetching same id', () => {
        const renderer = renderFragment();
        const initialUser = {
          id: '1',
          name: 'Alice',
          profile_picture: null,
          ...createFragmentRef('1', query),
        };
        expectFragmentResults([
          {
            data: initialUser,
          },
        ]);

        TestRenderer.act(() => {
          refetch({scale: 32});
        });

        // Assert that fragment is refetching with the right variables and
        // suspends upon refetch
        const refetchVariables = {
          id: '1',
          scale: 32,
        };
        refetchQuery = createOperationDescriptor(
          gqlRefetchQuery,
          refetchVariables,
        );
        expectFragmentIsRefetching(renderer, {
          refetchVariables,
          refetchQuery,
        });

        // Mock network response
        environment.mock.resolve(gqlRefetchQuery, {
          data: {
            node: {
              __typename: 'User',
              id: '1',
              name: 'Alice',
              profile_picture: {
                uri: 'scale32',
              },
              username: 'useralice',
            },
          },
        });

        // Assert fragment is rendered with new data
        const refetchedUser = {
          id: '1',
          name: 'Alice',
          profile_picture: {
            uri: 'scale32',
          },
          ...createFragmentRef('1', refetchQuery),
        };
        expectFragmentResults([
          {
            data: refetchedUser,
          },
          {
            data: refetchedUser,
          },
        ]);

        // Assert refetch query was retained
        expect(release).not.toBeCalled();
        expect(environment.retain).toBeCalledTimes(1);
        expect(environment.retain.mock.calls[0][0]).toEqual(refetchQuery);
      });
    });

    describe('internal environment option', () => {
      let newRelease;
      let newEnvironment;

      beforeEach(() => {
        ({createMockEnvironment} = require('relay-test-utils-internal'));
        newEnvironment = createMockEnvironment();
        newRelease = jest.fn();
        newEnvironment.retain.mockImplementation((...args) => {
          return {
            dispose: newRelease,
          };
        });
      });

      it('reloads new data into new environment, and renders successfully', () => {
        const renderer = renderFragment();
        const initialUser = {
          id: '1',
          name: 'Alice',
          profile_picture: null,
          ...createFragmentRef('1', query),
        };
        // initial data on default environment
        expectFragmentResults([{data: initialUser}]);

        TestRenderer.act(() => {
          refetch(
            {id: '1'},
            {
              __environment: newEnvironment,
            },
          );
        });
        const refetchVariables = {
          id: '1',
          scale: 16,
        };
        refetchQuery = createOperationDescriptor(
          gqlRefetchQuery,
          refetchVariables,
        );

        // Fetch on newEnvironment
        expectFragmentIsRefetching(
          renderer,
          {
            refetchVariables,
            refetchQuery,
          },
          newEnvironment,
        );

        newEnvironment.mock.resolve(gqlRefetchQuery, {
          data: {
            node: {
              __typename: 'User',
              id: '1',
              name: 'Mark',
              username: 'usermark',
              profile_picture: {
                uri: 'scale16',
              },
            },
          },
        });
        TestRenderer.act(() => jest.runAllImmediates());

        // Data should be loaded on the newEnvironment
        const dataInSource = {
          __id: '1',
          __typename: 'User',
          'profile_picture(scale:16)': {
            __ref: 'client:1:profile_picture(scale:16)',
          },
          id: '1',
          name: 'Mark',
          username: 'usermark',
        };
        const source = newEnvironment.getStore().getSource();
        expect(source.get('1')).toEqual(dataInSource);

        // Assert refetch query was retained
        expect(newRelease).not.toBeCalled();
        expect(newEnvironment.retain).toBeCalledTimes(1);
        expect(newEnvironment.retain.mock.calls[0][0]).toEqual(refetchQuery);

        // Should be able to use the new data if switched to new environment
        renderSpy.mockClear();
        newRelease.mockClear();
        TestRenderer.act(() => {
          setEnvironment(newEnvironment);
        });
        // refetch on the same newEnvironment after switching should not be reset
        expect(release).not.toBeCalled();

        const refetchedUser = {
          id: '1',
          name: 'Mark',
          profile_picture: {
            uri: 'scale16',
          },
          ...createFragmentRef('1', refetchQuery),
        };

        expectFragmentResults([
          {
            data: refetchedUser,
          },
          {
            data: refetchedUser,
          },
        ]);

        // Refetch on another enironment afterwards should work
        renderSpy.mockClear();
        environment.execute.mockClear();
        const anotherNewEnvironment = createMockEnvironment();
        TestRenderer.act(() => jest.runAllImmediates());

        TestRenderer.act(() => {
          refetch(
            {id: '1'},
            {
              __environment: anotherNewEnvironment,
            },
          );
        });
        expectFragmentIsRefetching(
          renderer,
          {
            refetchVariables,
            refetchQuery,
          },
          anotherNewEnvironment,
        );

        anotherNewEnvironment.mock.resolve(gqlRefetchQuery, {
          data: {
            node: {
              __typename: 'User',
              id: '1',
              name: 'Mark',
              username: 'usermark',
              profile_picture: {
                uri: 'scale16',
              },
            },
          },
        });
        expect(
          anotherNewEnvironment
            .getStore()
            .getSource()
            .get('1'),
        ).toEqual(dataInSource);
      });
    });
  });
});

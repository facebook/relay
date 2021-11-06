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

import type {Direction, OperationDescriptor, Variables} from 'relay-runtime';

const useBlockingPaginationFragmentOriginal = require('../useBlockingPaginationFragment');
const invariant = require('invariant');
const React = require('react');
const ReactRelayContext = require('react-relay/ReactRelayContext');
const TestRenderer = require('react-test-renderer');
const {
  ConnectionHandler,
  FRAGMENT_OWNER_KEY,
  FRAGMENTS_KEY,
  ID_KEY,
  __internal: {fetchQuery},
  createOperationDescriptor,
  getFragment,
  getRequest,
  graphql,
} = require('relay-runtime');
const {createMockEnvironment} = require('relay-test-utils');
const Scheduler = require('scheduler');

const {useMemo, useState} = React;

describe('useBlockingPaginationFragment', () => {
  let environment;
  let initialUser;
  let gqlQuery;
  let gqlQueryNestedFragment;
  let gqlQueryWithoutID;
  let gqlQueryWithLiteralArgs;
  let gqlPaginationQuery;
  let gqlFragment;
  let query;
  let queryNestedFragment;
  let queryWithoutID;
  let queryWithLiteralArgs;
  let paginationQuery;
  let variables;
  let variablesNestedFragment;
  let variablesWithoutID;
  let setEnvironment;
  let setOwner;
  let renderFragment;
  let renderSpy;
  let loadNext;
  let refetch;
  let forceUpdate;
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

  function useBlockingPaginationFragment(fragmentNode, fragmentRef) {
    // $FlowFixMe[incompatible-call]
    const {data, ...result} = useBlockingPaginationFragmentOriginal(
      fragmentNode,
      // $FlowFixMe[incompatible-call]
      // $FlowFixMe[prop-missing]
      fragmentRef,
    );
    loadNext = result.loadNext;
    refetch = result.refetch;
    renderSpy(data, result);
    return {data, ...result};
  }

  function assertCall(expected, idx) {
    const actualData = renderSpy.mock.calls[idx][0];
    const actualResult = renderSpy.mock.calls[idx][1];
    const actualHasNext = actualResult.hasNext;
    const actualHasPrevious = actualResult.hasPrevious;

    expect(actualData).toEqual(expected.data);
    expect(actualHasNext).toEqual(expected.hasNext);
    expect(actualHasPrevious).toEqual(expected.hasPrevious);
  }

  function expectFragmentResults(
    expectedCalls: $ReadOnlyArray<{|
      data: $FlowFixMe,
      hasNext: boolean,
      hasPrevious: boolean,
    |}>,
  ) {
    // This ensures that useEffect runs
    TestRenderer.act(() => jest.runAllImmediates());
    expect(renderSpy).toBeCalledTimes(expectedCalls.length);
    expectedCalls.forEach((expected, idx) => assertCall(expected, idx));
    renderSpy.mockClear();
  }

  function createFragmentRef(
    id,
    owner,
    fragmentName: string = 'useBlockingPaginationFragmentTestNestedUserFragment',
  ) {
    return {
      [ID_KEY]: id,
      [FRAGMENTS_KEY]: {
        [fragmentName]: {},
      },
      [FRAGMENT_OWNER_KEY]: owner.request,
      __isWithinUnmatchedTypeRefinement: false,
    };
  }

  beforeEach(() => {
    // Set up mocks
    jest.spyOn(console, 'warn').mockImplementationOnce(() => {});
    jest.mock('warning');
    renderSpy = jest.fn();

    // Set up environment and base data
    environment = createMockEnvironment({
      handlerProvider: () => ConnectionHandler,
    });
    graphql`
      fragment useBlockingPaginationFragmentTestNestedUserFragment on User {
        username
      }
    `;
    gqlFragment = getFragment(graphql`
      fragment useBlockingPaginationFragmentTestUserFragment on User
      @refetchable(
        queryName: "useBlockingPaginationFragmentTestUserFragmentPaginationQuery"
      )
      @argumentDefinitions(
        isViewerFriendLocal: {type: "Boolean", defaultValue: false}
        orderby: {type: "[String]"}
        scale: {type: "Float"}
      ) {
        id
        name
        friends(
          after: $after
          first: $first
          before: $before
          last: $last
          orderby: $orderby
          isViewerFriend: $isViewerFriendLocal
          scale: $scale
        )
          @connection(
            key: "UserFragment_friends"
            filters: ["orderby", "isViewerFriend"]
          ) {
          edges {
            node {
              id
              name
              ...useBlockingPaginationFragmentTestNestedUserFragment
            }
          }
        }
      }
    `);
    gqlQuery = getRequest(graphql`
      query useBlockingPaginationFragmentTestUserQuery(
        $id: ID!
        $after: ID
        $first: Int
        $before: ID
        $last: Int
        $orderby: [String]
        $isViewerFriend: Boolean
      ) {
        node(id: $id) {
          ...useBlockingPaginationFragmentTestUserFragment
            @arguments(isViewerFriendLocal: $isViewerFriend, orderby: $orderby)
        }
      }
    `);
    gqlQueryNestedFragment = getRequest(graphql`
      query useBlockingPaginationFragmentTestUserQueryNestedFragmentQuery(
        $id: ID!
        $after: ID
        $first: Int
        $before: ID
        $last: Int
        $orderby: [String]
        $isViewerFriend: Boolean
      ) {
        node(id: $id) {
          actor {
            ...useBlockingPaginationFragmentTestUserFragment
              @arguments(
                isViewerFriendLocal: $isViewerFriend
                orderby: $orderby
              )
          }
        }
      }
    `);

    gqlQueryWithoutID = getRequest(graphql`
      query useBlockingPaginationFragmentTestUserQueryWithoutIDQuery(
        $after: ID
        $first: Int
        $before: ID
        $last: Int
        $orderby: [String]
        $isViewerFriend: Boolean
      ) {
        viewer {
          actor {
            ...useBlockingPaginationFragmentTestUserFragment
              @arguments(
                isViewerFriendLocal: $isViewerFriend
                orderby: $orderby
              )
          }
        }
      }
    `);
    gqlQueryWithLiteralArgs = getRequest(graphql`
      query useBlockingPaginationFragmentTestUserQueryWithLiteralArgsQuery(
        $id: ID!
        $after: ID
        $first: Int
        $before: ID
        $last: Int
      ) {
        node(id: $id) {
          ...useBlockingPaginationFragmentTestUserFragment
            @arguments(isViewerFriendLocal: true, orderby: ["name"])
        }
      }
    `);
    variablesWithoutID = {
      after: null,
      first: 1,
      before: null,
      last: null,
      isViewerFriend: false,
      orderby: ['name'],
    };
    variables = {
      ...variablesWithoutID,
      id: '1',
    };
    variablesNestedFragment = {
      ...variablesWithoutID,
      id: '<feedbackid>',
    };

    gqlPaginationQuery = require('./__generated__/useBlockingPaginationFragmentTestUserFragmentPaginationQuery.graphql');

    query = createOperationDescriptor(gqlQuery, variables);
    queryNestedFragment = createOperationDescriptor(
      gqlQueryNestedFragment,
      variablesNestedFragment,
    );
    queryWithoutID = createOperationDescriptor(
      gqlQueryWithoutID,
      variablesWithoutID,
    );
    queryWithLiteralArgs = createOperationDescriptor(
      gqlQueryWithLiteralArgs,
      variables,
    );
    paginationQuery = createOperationDescriptor(gqlPaginationQuery, variables);
    environment.commitPayload(query, {
      node: {
        __typename: 'User',
        id: '1',
        name: 'Alice',
        friends: {
          edges: [
            {
              cursor: 'cursor:1',
              node: {
                __typename: 'User',
                id: 'node:1',
                name: 'name:node:1',
                username: 'username:node:1',
              },
            },
          ],
          pageInfo: {
            endCursor: 'cursor:1',
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: 'cursor:1',
          },
        },
      },
    });
    environment.commitPayload(queryWithoutID, {
      viewer: {
        actor: {
          __typename: 'User',
          id: '1',
          name: 'Alice',
          friends: {
            edges: [
              {
                cursor: 'cursor:1',
                node: {
                  __typename: 'User',
                  id: 'node:1',
                  name: 'name:node:1',
                  username: 'username:node:1',
                },
              },
            ],
            pageInfo: {
              endCursor: 'cursor:1',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'cursor:1',
            },
          },
        },
      },
    });
    environment.commitPayload(queryWithLiteralArgs, {
      node: {
        __typename: 'User',
        id: '1',
        name: 'Alice',
        friends: {
          edges: [
            {
              cursor: 'cursor:1',
              node: {
                __typename: 'User',
                id: 'node:1',
                name: 'name:node:1',
                username: 'username:node:1',
              },
            },
          ],
          pageInfo: {
            endCursor: 'cursor:1',
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: 'cursor:1',
          },
        },
      },
    });

    // Set up renderers
    Renderer = props => null;

    const Container = (props: {
      userRef?: {...},
      owner: $FlowFixMe,
      fragment: $FlowFixMe,
      ...
    }) => {
      // We need a render a component to run a Hook
      const [owner, _setOwner] = useState(props.owner);
      const [_, _setCount] = useState(0);
      const fragment = props.fragment ?? gqlFragment;
      const artificialUserRef = useMemo(
        () => environment.lookup(owner.fragment).data?.node,
        [owner],
      );
      const userRef = props.hasOwnProperty('userRef')
        ? props.userRef
        : artificialUserRef;

      setOwner = _setOwner;
      forceUpdate = _setCount;

      const {data: userData} = useBlockingPaginationFragment(fragment, userRef);
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
              <ContextProvider>
                <Container owner={query} {...props} />
              </ContextProvider>
            </React.Suspense>
          </ErrorBoundary>,
          // $FlowFixMe[prop-missing] - error revealed when flow-typing ReactTestRenderer
          {unstable_isConcurrent: isConcurrent},
        );
      });
      return renderer;
    };

    initialUser = {
      id: '1',
      name: 'Alice',
      friends: {
        edges: [
          {
            cursor: 'cursor:1',
            node: {
              __typename: 'User',
              id: 'node:1',
              name: 'name:node:1',
              ...createFragmentRef('node:1', query),
            },
          },
        ],
        pageInfo: {
          endCursor: 'cursor:1',
          hasNextPage: true,
          hasPreviousPage: false,
          startCursor: 'cursor:1',
        },
      },
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

      const UserFragment = graphql`
        fragment useBlockingPaginationFragmentTest1Fragment on User
        @relay(plural: true) {
          id
        }
      `;
      const renderer = renderFragment({fragment: UserFragment});
      expect(
        renderer
          .toJSON()
          .includes('Remove `@relay(plural: true)` from fragment'),
      ).toEqual(true);
    });

    it('should throw error if fragment uses stream', () => {
      jest.spyOn(console, 'error').mockImplementationOnce(() => {});

      const UserFragment = graphql`
        fragment useBlockingPaginationFragmentTest2Fragment on User
        @refetchable(
          queryName: "useBlockingPaginationFragmentTest2FragmentPaginationQuery"
        ) {
          id
          friends(
            after: $after
            first: $first
            before: $before
            last: $last
            orderby: $orderby
            isViewerFriend: $isViewerFriendLocal
          ) @stream_connection(key: "UserFragment_friends", initial_count: 1) {
            edges {
              node {
                id
              }
            }
          }
        }
      `;

      const renderer = renderFragment({fragment: UserFragment});
      expect(
        renderer
          .toJSON()
          .includes('Use `useStreamingPaginationFragment` instead'),
      ).toEqual(true);
    });

    it('should throw error if fragment is missing @refetchable directive', () => {
      jest.spyOn(console, 'error').mockImplementationOnce(() => {});

      const UserFragment = getFragment(graphql`
        fragment useBlockingPaginationFragmentTest3Fragment on User {
          id
        }
      `);
      const renderer = renderFragment({fragment: UserFragment});
      expect(
        renderer
          .toJSON()
          .includes(
            'Did you forget to add a @refetchable directive to the fragment?',
          ),
      ).toEqual(true);
    });

    it('should throw error if fragment is missing @connection directive', () => {
      jest.spyOn(console, 'error').mockImplementationOnce(() => {});

      const UserFragment = getFragment(graphql`
        fragment useBlockingPaginationFragmentTest4Fragment on User
        @refetchable(
          queryName: "useBlockingPaginationFragmentTest4FragmentRefetchQuery"
        ) {
          id
        }
      `);

      const renderer = renderFragment({fragment: UserFragment});
      expect(
        renderer
          .toJSON()
          .includes(
            'Did you forget to add a @connection directive to the connection field in the fragment?',
          ),
      ).toEqual(true);
    });

    it('should render fragment without error when data is available', () => {
      renderFragment();
      expectFragmentResults([
        {
          data: initialUser,

          hasNext: true,
          hasPrevious: false,
        },
      ]);
    });

    it('should render fragment without error when ref is null', () => {
      renderFragment({userRef: null});
      expectFragmentResults([
        {
          data: null,
          hasNext: false,
          hasPrevious: false,
        },
      ]);
    });

    it('should render fragment without error when ref is undefined', () => {
      renderFragment({userRef: undefined});
      expectFragmentResults([
        {
          data: null,
          hasNext: false,
          hasPrevious: false,
        },
      ]);
    });

    it('should update when fragment data changes', () => {
      renderFragment();
      expectFragmentResults([
        {
          data: initialUser,
          hasNext: true,
          hasPrevious: false,
        },
      ]);

      // Update parent record
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
            ...initialUser,
            // Assert that name is updated
            name: 'Alice in Wonderland',
          },
          hasNext: true,
          hasPrevious: false,
        },
      ]);

      // Update edge
      environment.commitPayload(query, {
        node: {
          __typename: 'User',
          id: 'node:1',
          // Update name
          name: 'name:node:1-updated',
        },
      });
      expectFragmentResults([
        {
          data: {
            ...initialUser,
            name: 'Alice in Wonderland',
            friends: {
              ...initialUser.friends,
              edges: [
                {
                  cursor: 'cursor:1',
                  node: {
                    __typename: 'User',
                    id: 'node:1',
                    // Assert that name is updated
                    name: 'name:node:1-updated',
                    ...createFragmentRef('node:1', query),
                  },
                },
              ],
            },
          },

          hasNext: true,
          hasPrevious: false,
        },
      ]);
    });

    it('should throw a promise if data is missing for fragment and request is in flight', () => {
      // This prevents console.error output in the test, which is expected
      jest.spyOn(console, 'error').mockImplementationOnce(() => {});

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

      // Make sure query is in flight
      fetchQuery(environment, missingDataQuery).subscribe({});

      const renderer = renderFragment({owner: missingDataQuery});
      expect(renderer.toJSON()).toEqual('Fallback');
    });
  });

  describe('pagination', () => {
    let release;

    beforeEach(() => {
      jest.resetModules();

      release = jest.fn();
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      environment.retain.mockImplementation((...args) => {
        return {
          dispose: release,
        };
      });
    });

    function expectRequestIsInFlight(expected) {
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.execute).toBeCalledTimes(expected.requestCount);
      expect(
        environment.mock.isLoading(
          expected.gqlPaginationQuery ?? gqlPaginationQuery,
          expected.paginationVariables,
          {force: true},
        ),
      ).toEqual(expected.inFlight);
    }

    function expectFragmentIsLoadingMore(
      renderer,
      direction: Direction,
      expected: {|
        data: mixed,
        hasNext: boolean,
        hasPrevious: boolean,
        paginationVariables: Variables,
        gqlPaginationQuery?: $FlowFixMe,
      |},
    ) {
      expect(renderSpy).toBeCalledTimes(0);
      renderSpy.mockClear();

      // Assert refetch query was fetched
      expectRequestIsInFlight({...expected, inFlight: true, requestCount: 1});

      // Assert component suspended
      expect(renderSpy).toBeCalledTimes(0);
      expect(renderer.toJSON()).toEqual('Fallback');
    }

    // TODO
    // - backward pagination
    // - simultaneous pagination
    // - TODO(T41131846): Fetch/Caching policies for loadMore / when network
    //   returns or errors synchronously
    describe('loadNext', () => {
      const direction = 'forward';

      it('does not load more if component has unmounted', () => {
        const warning = require('warning');
        const renderer = renderFragment();
        expectFragmentResults([
          {
            data: initialUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);

        TestRenderer.act(() => {
          renderer.unmount();
        });
        TestRenderer.act(() => {
          loadNext(1);
        });

        expect(warning).toHaveBeenCalledTimes(2);
        expect(
          (warning: $FlowFixMe).mock.calls[1][1].includes(
            'Relay: Unexpected fetch on unmounted component',
          ),
        ).toEqual(true);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.execute).toHaveBeenCalledTimes(0);
      });

      it('does not load more if fragment ref passed to useBlockingPaginationFragment() was null', () => {
        const warning = require('warning');
        renderFragment({userRef: null});
        expectFragmentResults([
          {
            data: null,
            hasNext: false,
            hasPrevious: false,
          },
        ]);

        TestRenderer.act(() => {
          loadNext(1);
        });

        expect(warning).toHaveBeenCalledTimes(2);
        expect(
          (warning: $FlowFixMe).mock.calls[1][1].includes(
            'Relay: Unexpected fetch while using a null fragment ref',
          ),
        ).toEqual(true);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.execute).toHaveBeenCalledTimes(0);
      });

      it('does not load more if request is already in flight', () => {
        const callback = jest.fn();
        const renderer = renderFragment();
        expectFragmentResults([
          {
            data: initialUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);

        TestRenderer.act(() => {
          loadNext(1, {onComplete: callback});
        });
        const paginationVariables = {
          id: '1',
          after: 'cursor:1',
          first: 1,
          before: null,
          last: null,
          isViewerFriendLocal: false,
          orderby: ['name'],
          scale: null,
        };
        expectFragmentIsLoadingMore(renderer, direction, {
          data: initialUser,
          hasNext: true,
          hasPrevious: false,
          paginationVariables,
          gqlPaginationQuery,
        });

        expect(callback).toBeCalledTimes(0);

        TestRenderer.act(() => {
          loadNext(1, {onComplete: callback});
        });

        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.execute).toBeCalledTimes(1);
        expect(callback).toBeCalledTimes(1);
        expect(renderSpy).toBeCalledTimes(0);
      });

      it('does not load more if parent query is already active (i.e. during streaming)', () => {
        // This prevents console.error output in the test, which is expected
        jest.spyOn(console, 'error').mockImplementationOnce(() => {});
        const {
          __internal: {fetchQuery},
        } = require('relay-runtime');

        fetchQuery(environment, query).subscribe({});

        const callback = jest.fn();
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        environment.execute.mockClear();
        renderFragment();

        expectFragmentResults([
          {
            data: initialUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);
        TestRenderer.act(() => {
          loadNext(1, {onComplete: callback});
        });
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.execute).toBeCalledTimes(0);
        expect(callback).toBeCalledTimes(1);
        expect(renderSpy).toBeCalledTimes(0);
      });

      it('cancels load more if component unmounts', () => {
        const unsubscribe = jest.fn();
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

        const callback = jest.fn();
        const renderer = renderFragment();
        expectFragmentResults([
          {
            data: initialUser,

            hasNext: true,
            hasPrevious: false,
          },
        ]);

        TestRenderer.act(() => {
          loadNext(1, {onComplete: callback});
        });
        const paginationVariables = {
          id: '1',
          after: 'cursor:1',
          first: 1,
          before: null,
          last: null,
          isViewerFriendLocal: false,
          orderby: ['name'],
          scale: null,
        };
        expectFragmentIsLoadingMore(renderer, direction, {
          data: initialUser,
          hasNext: true,
          hasPrevious: false,
          paginationVariables,
          gqlPaginationQuery,
        });
        expect(unsubscribe).toHaveBeenCalledTimes(0);

        TestRenderer.act(() => {
          renderer.unmount();
        });
        expect(unsubscribe).toHaveBeenCalledTimes(1);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.execute).toBeCalledTimes(1);
        expect(callback).toBeCalledTimes(0);
        expect(renderSpy).toBeCalledTimes(0);
      });

      it('cancels load more if refetch is called', () => {
        const unsubscribe = jest.fn();
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

        const callback = jest.fn();
        const renderer = renderFragment();
        expectFragmentResults([
          {
            data: initialUser,

            hasNext: true,
            hasPrevious: false,
          },
        ]);

        TestRenderer.act(() => {
          loadNext(1, {onComplete: callback});
        });
        const paginationVariables = {
          id: '1',
          after: 'cursor:1',
          first: 1,
          before: null,
          last: null,
          isViewerFriendLocal: false,
          orderby: ['name'],
          scale: null,
        };
        expectFragmentIsLoadingMore(renderer, direction, {
          data: initialUser,
          hasNext: true,
          hasPrevious: false,
          paginationVariables,
          gqlPaginationQuery,
        });
        expect(unsubscribe).toHaveBeenCalledTimes(0);

        TestRenderer.act(() => {
          refetch({id: '4'});
        });
        expect(unsubscribe).toHaveBeenCalledTimes(1);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.execute).toBeCalledTimes(1); // loadMore
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.executeWithSource).toBeCalledTimes(1); // refetch
        expect(callback).toBeCalledTimes(0);
        expect(renderSpy).toBeCalledTimes(0);
      });

      it('attempts to load more even if there are no more items to load', () => {
        (environment.getStore().getSource(): $FlowFixMe).clear();
        environment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: '1',
            name: 'Alice',
            friends: {
              edges: [
                {
                  cursor: 'cursor:1',
                  node: {
                    __typename: 'User',
                    id: 'node:1',
                    name: 'name:node:1',
                    username: 'username:node:1',
                  },
                },
              ],
              pageInfo: {
                endCursor: 'cursor:1',
                hasNextPage: false,
                hasPreviousPage: false,
                startCursor: 'cursor:1',
              },
            },
          },
        });
        const callback = jest.fn();

        const renderer = renderFragment();
        const expectedUser = {
          ...initialUser,
          friends: {
            ...initialUser.friends,
            pageInfo: expect.objectContaining({hasNextPage: false}),
          },
        };
        expectFragmentResults([
          {
            data: expectedUser,
            hasNext: false,
            hasPrevious: false,
          },
        ]);

        TestRenderer.act(() => {
          loadNext(1, {onComplete: callback});
        });

        const paginationVariables = {
          id: '1',
          after: 'cursor:1',
          first: 1,
          before: null,
          last: null,
          isViewerFriendLocal: false,
          orderby: ['name'],
          scale: null,
        };
        expectFragmentIsLoadingMore(renderer, direction, {
          data: initialUser,
          hasNext: false,
          hasPrevious: false,
          paginationVariables,
          gqlPaginationQuery,
        });
        expect(callback).toBeCalledTimes(0);

        environment.mock.resolve(gqlPaginationQuery, {
          data: {
            node: {
              __typename: 'User',
              id: '1',
              name: 'Alice',
              friends: {
                edges: [],
                pageInfo: {
                  startCursor: null,
                  endCursor: null,
                  hasNextPage: null,
                  hasPreviousPage: null,
                },
              },
            },
          },
        });

        expectFragmentResults([
          {
            data: expectedUser,
            hasNext: false,
            hasPrevious: false,
          },
        ]);
        expect(callback).toBeCalledTimes(1);
      });

      it('loads and renders next items in connection', () => {
        const callback = jest.fn();
        const renderer = renderFragment();
        expectFragmentResults([
          {
            data: initialUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);

        TestRenderer.act(() => {
          loadNext(1, {onComplete: callback});
        });
        const paginationVariables = {
          id: '1',
          after: 'cursor:1',
          first: 1,
          before: null,
          last: null,
          isViewerFriendLocal: false,
          orderby: ['name'],
          scale: null,
        };
        expectFragmentIsLoadingMore(renderer, direction, {
          data: initialUser,
          hasNext: true,
          hasPrevious: false,
          paginationVariables,
          gqlPaginationQuery,
        });
        expect(callback).toBeCalledTimes(0);

        environment.mock.resolve(gqlPaginationQuery, {
          data: {
            node: {
              __typename: 'User',
              id: '1',
              name: 'Alice',
              friends: {
                edges: [
                  {
                    cursor: 'cursor:2',
                    node: {
                      __typename: 'User',
                      id: 'node:2',
                      name: 'name:node:2',
                      username: 'username:node:2',
                    },
                  },
                ],
                pageInfo: {
                  startCursor: 'cursor:2',
                  endCursor: 'cursor:2',
                  hasNextPage: true,
                  hasPreviousPage: true,
                },
              },
            },
          },
        });

        const expectedUser = {
          ...initialUser,
          friends: {
            ...initialUser.friends,
            edges: [
              {
                cursor: 'cursor:1',
                node: {
                  __typename: 'User',
                  id: 'node:1',
                  name: 'name:node:1',
                  ...createFragmentRef('node:1', query),
                },
              },
              {
                cursor: 'cursor:2',
                node: {
                  __typename: 'User',
                  id: 'node:2',
                  name: 'name:node:2',
                  ...createFragmentRef('node:2', query),
                },
              },
            ],
            pageInfo: {
              endCursor: 'cursor:2',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'cursor:1',
            },
          },
        };
        expectFragmentResults([
          {
            data: expectedUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);
        expect(callback).toBeCalledTimes(1);
      });

      it('loads more correctly using fragment variables from literal @argument values', () => {
        let expectedUser = {
          ...initialUser,
          friends: {
            ...initialUser.friends,
            edges: [
              {
                cursor: 'cursor:1',
                node: {
                  __typename: 'User',
                  id: 'node:1',
                  name: 'name:node:1',
                  ...createFragmentRef('node:1', queryWithLiteralArgs),
                },
              },
            ],
          },
        };

        const callback = jest.fn();
        const renderer = renderFragment({owner: queryWithLiteralArgs});
        expectFragmentResults([
          {
            data: expectedUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);

        TestRenderer.act(() => {
          loadNext(1, {onComplete: callback});
        });
        const paginationVariables = {
          id: '1',
          after: 'cursor:1',
          first: 1,
          before: null,
          last: null,
          isViewerFriendLocal: true,
          orderby: ['name'],
          scale: null,
        };
        expect(paginationVariables.isViewerFriendLocal).not.toBe(
          variables.isViewerFriend,
        );
        expectFragmentIsLoadingMore(renderer, direction, {
          data: expectedUser,
          hasNext: true,
          hasPrevious: false,
          paginationVariables,
          gqlPaginationQuery,
        });
        expect(callback).toBeCalledTimes(0);

        environment.mock.resolve(gqlPaginationQuery, {
          data: {
            node: {
              __typename: 'User',
              id: '1',
              name: 'Alice',
              friends: {
                edges: [
                  {
                    cursor: 'cursor:2',
                    node: {
                      __typename: 'User',
                      id: 'node:2',
                      name: 'name:node:2',
                      username: 'username:node:2',
                    },
                  },
                ],
                pageInfo: {
                  startCursor: 'cursor:2',
                  endCursor: 'cursor:2',
                  hasNextPage: true,
                  hasPreviousPage: true,
                },
              },
            },
          },
        });

        expectedUser = {
          ...expectedUser,
          friends: {
            ...expectedUser.friends,
            edges: [
              {
                cursor: 'cursor:1',
                node: {
                  __typename: 'User',
                  id: 'node:1',
                  name: 'name:node:1',
                  ...createFragmentRef('node:1', queryWithLiteralArgs),
                },
              },
              {
                cursor: 'cursor:2',
                node: {
                  __typename: 'User',
                  id: 'node:2',
                  name: 'name:node:2',
                  ...createFragmentRef('node:2', queryWithLiteralArgs),
                },
              },
            ],
            pageInfo: {
              endCursor: 'cursor:2',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'cursor:1',
            },
          },
        };
        expectFragmentResults([
          {
            data: expectedUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);
        expect(callback).toBeCalledTimes(1);
      });

      it('correctly loads and renders next items when paginating multiple times', () => {
        const callback = jest.fn();
        const renderer = renderFragment();
        expectFragmentResults([
          {
            data: initialUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);

        TestRenderer.act(() => {
          loadNext(1, {onComplete: callback});
        });
        let paginationVariables = {
          id: '1',
          after: 'cursor:1',
          first: 1,
          before: null,
          last: null,
          isViewerFriendLocal: false,
          orderby: ['name'],
          scale: null,
        };
        expectFragmentIsLoadingMore(renderer, direction, {
          data: initialUser,
          hasNext: true,
          hasPrevious: false,
          paginationVariables,
          gqlPaginationQuery,
        });
        expect(callback).toBeCalledTimes(0);

        environment.mock.resolve(gqlPaginationQuery, {
          data: {
            node: {
              __typename: 'User',
              id: '1',
              name: 'Alice',
              friends: {
                edges: [
                  {
                    cursor: 'cursor:2',
                    node: {
                      __typename: 'User',
                      id: 'node:2',
                      name: 'name:node:2',
                      username: 'username:node:2',
                    },
                  },
                ],
                pageInfo: {
                  startCursor: 'cursor:2',
                  endCursor: 'cursor:2',
                  hasNextPage: true,
                  hasPreviousPage: true,
                },
              },
            },
          },
        });

        let expectedUser = {
          ...initialUser,
          friends: {
            ...initialUser.friends,
            edges: [
              {
                cursor: 'cursor:1',
                node: {
                  __typename: 'User',
                  id: 'node:1',
                  name: 'name:node:1',
                  ...createFragmentRef('node:1', query),
                },
              },
              {
                cursor: 'cursor:2',
                node: {
                  __typename: 'User',
                  id: 'node:2',
                  name: 'name:node:2',
                  ...createFragmentRef('node:2', query),
                },
              },
            ],
            pageInfo: {
              endCursor: 'cursor:2',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'cursor:1',
            },
          },
        };
        expectFragmentResults([
          {
            data: expectedUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);
        expect(callback).toBeCalledTimes(1);

        // Paginate a second time
        renderSpy.mockClear();
        callback.mockClear();
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        environment.execute.mockClear();
        TestRenderer.act(() => {
          loadNext(1, {onComplete: callback});
        });
        paginationVariables = {
          ...paginationVariables,
          after: 'cursor:2',
        };
        expectFragmentIsLoadingMore(renderer, direction, {
          data: expectedUser,
          hasNext: true,
          hasPrevious: false,
          paginationVariables,
          gqlPaginationQuery,
        });
        expect(callback).toBeCalledTimes(0);

        environment.mock.resolve(gqlPaginationQuery, {
          data: {
            node: {
              __typename: 'User',
              id: '1',
              name: 'Alice',
              friends: {
                edges: [
                  {
                    cursor: 'cursor:3',
                    node: {
                      __typename: 'User',
                      id: 'node:3',
                      name: 'name:node:3',
                      username: 'username:node:3',
                    },
                  },
                ],
                pageInfo: {
                  startCursor: 'cursor:3',
                  endCursor: 'cursor:3',
                  hasNextPage: true,
                  hasPreviousPage: true,
                },
              },
            },
          },
        });

        expectedUser = {
          ...expectedUser,
          friends: {
            ...expectedUser.friends,
            edges: [
              {
                cursor: 'cursor:1',
                node: {
                  __typename: 'User',
                  id: 'node:1',
                  name: 'name:node:1',
                  ...createFragmentRef('node:1', query),
                },
              },
              {
                cursor: 'cursor:2',
                node: {
                  __typename: 'User',
                  id: 'node:2',
                  name: 'name:node:2',
                  ...createFragmentRef('node:2', query),
                },
              },
              {
                cursor: 'cursor:3',
                node: {
                  __typename: 'User',
                  id: 'node:3',
                  name: 'name:node:3',
                  ...createFragmentRef('node:3', query),
                },
              },
            ],
            pageInfo: {
              endCursor: 'cursor:3',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'cursor:1',
            },
          },
        };
        expectFragmentResults([
          {
            data: expectedUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);
        expect(callback).toBeCalledTimes(1);
      });

      // TODO(T64875643): Re-enable after next React sync to fbsource
      // eslint-disable-next-line jest/no-disabled-tests
      it.skip('does not suspend if pagination update is interruped before it commits (unsuspends)', () => {
        const callback = jest.fn();
        const renderer = renderFragment({isConcurrent: true});
        expectFragmentResults([
          {
            data: initialUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);

        loadNext(1, {onComplete: callback});
        Scheduler.unstable_flushAll();
        jest.runAllTimers();
        Scheduler.unstable_flushAll();

        const paginationVariables = {
          id: '1',
          after: 'cursor:1',
          first: 1,
          before: null,
          last: null,
          isViewerFriendLocal: false,
          orderby: ['name'],
          scale: null,
        };
        expectFragmentIsLoadingMore(renderer, direction, {
          data: initialUser,
          hasNext: true,
          hasPrevious: false,
          paginationVariables,
          gqlPaginationQuery,
        });
        expect(callback).toBeCalledTimes(0);

        // Schedule a high-pri update while the component is
        // suspended on pagination
        Scheduler.unstable_runWithPriority(
          Scheduler.unstable_UserBlockingPriority,
          () => {
            forceUpdate(prev => prev + 1);
          },
        );

        Scheduler.unstable_flushAll();

        // Assert high-pri update when initial update
        // that suspended hasn't committed
        // Assert fallback is still rendered despite high-pri update
        // as per React's expected behavior
        expect(renderSpy).toBeCalledTimes(0);
        expect(renderer.toJSON()).toEqual('Fallback');

        // Assert list is updated after pagination request completes
        environment.mock.resolve(gqlPaginationQuery, {
          data: {
            node: {
              __typename: 'User',
              id: '1',
              name: 'Alice',
              friends: {
                edges: [
                  {
                    cursor: 'cursor:2',
                    node: {
                      __typename: 'User',
                      id: 'node:2',
                      name: 'name:node:2',
                      username: 'username:node:2',
                    },
                  },
                ],
                pageInfo: {
                  startCursor: 'cursor:2',
                  endCursor: 'cursor:2',
                  hasNextPage: true,
                  hasPreviousPage: true,
                },
              },
            },
          },
        });

        const expectedUser = {
          ...initialUser,
          friends: {
            ...initialUser.friends,
            edges: [
              {
                cursor: 'cursor:1',
                node: {
                  __typename: 'User',
                  id: 'node:1',
                  name: 'name:node:1',
                  ...createFragmentRef('node:1', query),
                },
              },
              {
                cursor: 'cursor:2',
                node: {
                  __typename: 'User',
                  id: 'node:2',
                  name: 'name:node:2',
                  ...createFragmentRef('node:2', query),
                },
              },
            ],
            pageInfo: {
              endCursor: 'cursor:2',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'cursor:1',
            },
          },
        };
        expectFragmentResults([
          {
            data: expectedUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);
        expect(callback).toBeCalledTimes(1);
      });

      it('updates are ignored while loading more (i.e. while suspended)', () => {
        jest.doMock('../useLoadMoreFunction');
        const useLoadMoreFunction = require('../useLoadMoreFunction');
        // $FlowFixMe[prop-missing]
        useLoadMoreFunction.mockImplementation((...args) =>
          jest.requireActual('../useLoadMoreFunction')(...args),
        );

        const callback = jest.fn();
        const renderer = renderFragment();
        expectFragmentResults([
          {
            data: initialUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);

        TestRenderer.act(() => {
          loadNext(1, {onComplete: callback});
        });
        const paginationVariables = {
          id: '1',
          after: 'cursor:1',
          first: 1,
          before: null,
          last: null,
          isViewerFriendLocal: false,
          orderby: ['name'],
          scale: null,
        };
        expectFragmentIsLoadingMore(renderer, direction, {
          data: initialUser,
          hasNext: true,
          hasPrevious: false,
          paginationVariables,
          gqlPaginationQuery,
        });
        expect(callback).toBeCalledTimes(0);
        // $FlowFixMe[prop-missing]
        useLoadMoreFunction.mockClear();

        environment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: '1',
            name: 'Alice updated',
          },
        });

        // Assert that component did not re-render while suspended
        TestRenderer.act(() => jest.runAllImmediates());
        expect(renderSpy).toBeCalledTimes(0);
        expect(useLoadMoreFunction).toBeCalledTimes(0);

        jest.dontMock('../useLoadMoreFunction');
      });

      it('renders with latest updated data from any updates missed while suspended for pagination', () => {
        const callback = jest.fn();
        const renderer = renderFragment();
        expectFragmentResults([
          {
            data: initialUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);

        TestRenderer.act(() => {
          loadNext(1, {onComplete: callback});
        });
        const paginationVariables = {
          id: '1',
          after: 'cursor:1',
          first: 1,
          before: null,
          last: null,
          isViewerFriendLocal: false,
          orderby: ['name'],
          scale: null,
        };
        expectFragmentIsLoadingMore(renderer, direction, {
          data: initialUser,
          hasNext: true,
          hasPrevious: false,
          paginationVariables,
          gqlPaginationQuery,
        });
        expect(callback).toBeCalledTimes(0);

        environment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: '1',
            name: 'Alice updated',
          },
        });

        // Assert that component did not re-render while suspended
        TestRenderer.act(() => jest.runAllImmediates());
        expect(renderSpy).toBeCalledTimes(0);

        environment.mock.resolve(gqlPaginationQuery, {
          data: {
            node: {
              __typename: 'User',
              id: '1',
              name: 'Alice',
              friends: {
                edges: [
                  {
                    cursor: 'cursor:2',
                    node: {
                      __typename: 'User',
                      id: 'node:2',
                      name: 'name:node:2',
                      username: 'username:node:2',
                    },
                  },
                ],
                pageInfo: {
                  startCursor: 'cursor:2',
                  endCursor: 'cursor:2',
                  hasNextPage: true,
                  hasPreviousPage: true,
                },
              },
            },
          },
        });

        const expectedUser = {
          ...initialUser,
          name: 'Alice',
          friends: {
            ...initialUser.friends,
            edges: [
              {
                cursor: 'cursor:1',
                node: {
                  __typename: 'User',
                  id: 'node:1',
                  name: 'name:node:1',
                  ...createFragmentRef('node:1', query),
                },
              },
              {
                cursor: 'cursor:2',
                node: {
                  __typename: 'User',
                  id: 'node:2',
                  name: 'name:node:2',
                  ...createFragmentRef('node:2', query),
                },
              },
            ],
            pageInfo: {
              endCursor: 'cursor:2',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'cursor:1',
            },
          },
        };
        expectFragmentResults([
          {
            data: expectedUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);
        expect(callback).toBeCalledTimes(1);
      });

      it('correctly updates when fragment data changes after pagination', () => {
        const callback = jest.fn();
        const renderer = renderFragment();
        expectFragmentResults([
          {
            data: initialUser,

            hasNext: true,
            hasPrevious: false,
          },
        ]);

        TestRenderer.act(() => {
          loadNext(1, {onComplete: callback});
        });
        const paginationVariables = {
          id: '1',
          after: 'cursor:1',
          first: 1,
          before: null,
          last: null,
          isViewerFriendLocal: false,
          orderby: ['name'],
          scale: null,
        };
        expectFragmentIsLoadingMore(renderer, direction, {
          data: initialUser,
          hasNext: true,
          hasPrevious: false,
          paginationVariables,
          gqlPaginationQuery,
        });
        expect(callback).toBeCalledTimes(0);

        environment.mock.resolve(gqlPaginationQuery, {
          data: {
            node: {
              __typename: 'User',
              id: '1',
              name: 'Alice',
              friends: {
                edges: [
                  {
                    cursor: 'cursor:2',
                    node: {
                      __typename: 'User',
                      id: 'node:2',
                      name: 'name:node:2',
                      username: 'username:node:2',
                    },
                  },
                ],
                pageInfo: {
                  startCursor: 'cursor:2',
                  endCursor: 'cursor:2',
                  hasNextPage: true,
                  hasPreviousPage: true,
                },
              },
            },
          },
        });

        const expectedUser = {
          ...initialUser,
          friends: {
            ...initialUser.friends,
            edges: [
              {
                cursor: 'cursor:1',
                node: {
                  __typename: 'User',
                  id: 'node:1',
                  name: 'name:node:1',
                  ...createFragmentRef('node:1', query),
                },
              },
              {
                cursor: 'cursor:2',
                node: {
                  __typename: 'User',
                  id: 'node:2',
                  name: 'name:node:2',
                  ...createFragmentRef('node:2', query),
                },
              },
            ],
            pageInfo: {
              endCursor: 'cursor:2',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'cursor:1',
            },
          },
        };
        expectFragmentResults([
          {
            data: expectedUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);
        expect(callback).toBeCalledTimes(1);

        // Update parent record
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
              ...initialUser,
              // Assert that name is updated
              name: 'Alice in Wonderland',
            },
            hasNext: true,
            hasPrevious: false,
          },
        ]);

        // Update edge
        environment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: 'node:1',
            // Update name
            name: 'name:node:1-updated',
          },
        });
        expectFragmentResults([
          {
            data: {
              ...initialUser,
              name: 'Alice in Wonderland',
              friends: {
                ...initialUser.friends,
                edges: [
                  {
                    cursor: 'cursor:1',
                    node: {
                      __typename: 'User',
                      id: 'node:1',
                      // Assert that name is updated
                      name: 'name:node:1-updated',
                      ...createFragmentRef('node:1', query),
                    },
                  },
                ],
              },
            },

            hasNext: true,
            hasPrevious: false,
          },
        ]);
      });

      it('loads more correctly when original variables do not include an id', () => {
        const callback = jest.fn();
        const viewer = environment.lookup(queryWithoutID.fragment).data?.viewer;
        const userRef =
          typeof viewer === 'object' && viewer != null ? viewer?.actor : null;
        invariant(userRef != null, 'Expected to have cached test data');

        let expectedUser = {
          ...initialUser,
          friends: {
            ...initialUser.friends,
            edges: [
              {
                cursor: 'cursor:1',
                node: {
                  __typename: 'User',
                  id: 'node:1',
                  name: 'name:node:1',
                  ...createFragmentRef('node:1', queryWithoutID),
                },
              },
            ],
          },
        };

        const renderer = renderFragment({owner: queryWithoutID, userRef});
        expectFragmentResults([
          {
            data: expectedUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);

        TestRenderer.act(() => {
          loadNext(1, {onComplete: callback});
        });
        const paginationVariables = {
          id: '1',
          after: 'cursor:1',
          first: 1,
          before: null,
          last: null,
          isViewerFriendLocal: false,
          orderby: ['name'],
          scale: null,
        };
        expectFragmentIsLoadingMore(renderer, direction, {
          data: expectedUser,
          hasNext: true,
          hasPrevious: false,
          paginationVariables,
          gqlPaginationQuery,
        });
        expect(callback).toBeCalledTimes(0);

        environment.mock.resolve(gqlPaginationQuery, {
          data: {
            node: {
              __typename: 'User',
              id: '1',
              name: 'Alice',
              friends: {
                edges: [
                  {
                    cursor: 'cursor:2',
                    node: {
                      __typename: 'User',
                      id: 'node:2',
                      name: 'name:node:2',
                      username: 'username:node:2',
                    },
                  },
                ],
                pageInfo: {
                  startCursor: 'cursor:2',
                  endCursor: 'cursor:2',
                  hasNextPage: true,
                  hasPreviousPage: true,
                },
              },
            },
          },
        });

        expectedUser = {
          ...initialUser,
          friends: {
            ...initialUser.friends,
            edges: [
              {
                cursor: 'cursor:1',
                node: {
                  __typename: 'User',
                  id: 'node:1',
                  name: 'name:node:1',
                  ...createFragmentRef('node:1', queryWithoutID),
                },
              },
              {
                cursor: 'cursor:2',
                node: {
                  __typename: 'User',
                  id: 'node:2',
                  name: 'name:node:2',
                  ...createFragmentRef('node:2', queryWithoutID),
                },
              },
            ],
            pageInfo: {
              endCursor: 'cursor:2',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'cursor:1',
            },
          },
        };
        expectFragmentResults([
          {
            data: expectedUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);
        expect(callback).toBeCalledTimes(1);
      });

      it('loads more with correct id from refetchable fragment when using a nested fragment', () => {
        const callback = jest.fn();

        // Populate store with data for query using nested fragment
        environment.commitPayload(queryNestedFragment, {
          node: {
            __typename: 'Feedback',
            id: '<feedbackid>',
            actor: {
              __typename: 'User',
              id: '1',
              name: 'Alice',
              friends: {
                edges: [
                  {
                    cursor: 'cursor:1',
                    node: {
                      __typename: 'User',
                      id: 'node:1',
                      name: 'name:node:1',
                      username: 'username:node:1',
                    },
                  },
                ],
                pageInfo: {
                  endCursor: 'cursor:1',
                  hasNextPage: true,
                  hasPreviousPage: false,
                  startCursor: 'cursor:1',
                },
              },
            },
          },
        });

        // Get fragment ref for user using nested fragment
        const userRef = (environment.lookup(queryNestedFragment.fragment)
          .data: $FlowFixMe)?.node?.actor;

        initialUser = {
          id: '1',
          name: 'Alice',
          friends: {
            edges: [
              {
                cursor: 'cursor:1',
                node: {
                  __typename: 'User',
                  id: 'node:1',
                  name: 'name:node:1',
                  ...createFragmentRef('node:1', queryNestedFragment),
                },
              },
            ],
            pageInfo: {
              endCursor: 'cursor:1',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'cursor:1',
            },
          },
        };

        const renderer = renderFragment({owner: queryNestedFragment, userRef});
        expectFragmentResults([
          {
            data: initialUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);

        TestRenderer.act(() => {
          loadNext(1, {onComplete: callback});
        });
        const paginationVariables = {
          // The id here should correspond to the user id, and not the
          // feedback id from the query variables (i.e. `<feedbackid>`)
          id: '1',
          after: 'cursor:1',
          first: 1,
          before: null,
          last: null,
          isViewerFriendLocal: false,
          orderby: ['name'],
          scale: null,
        };
        expectFragmentIsLoadingMore(renderer, direction, {
          data: initialUser,
          hasNext: true,
          hasPrevious: false,
          paginationVariables,
          gqlPaginationQuery,
        });
        expect(callback).toBeCalledTimes(0);

        environment.mock.resolve(gqlPaginationQuery, {
          data: {
            node: {
              __typename: 'User',
              id: '1',
              name: 'Alice',
              friends: {
                edges: [
                  {
                    cursor: 'cursor:2',
                    node: {
                      __typename: 'User',
                      id: 'node:2',
                      name: 'name:node:2',
                      username: 'username:node:2',
                    },
                  },
                ],
                pageInfo: {
                  startCursor: 'cursor:2',
                  endCursor: 'cursor:2',
                  hasNextPage: true,
                  hasPreviousPage: true,
                },
              },
            },
          },
        });

        const expectedUser = {
          ...initialUser,
          friends: {
            ...initialUser.friends,
            edges: [
              {
                cursor: 'cursor:1',
                node: {
                  __typename: 'User',
                  id: 'node:1',
                  name: 'name:node:1',
                  ...createFragmentRef('node:1', queryNestedFragment),
                },
              },
              {
                cursor: 'cursor:2',
                node: {
                  __typename: 'User',
                  id: 'node:2',
                  name: 'name:node:2',
                  ...createFragmentRef('node:2', queryNestedFragment),
                },
              },
            ],
            pageInfo: {
              endCursor: 'cursor:2',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'cursor:1',
            },
          },
        };
        expectFragmentResults([
          {
            data: expectedUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);
        expect(callback).toBeCalledTimes(1);
      });

      it('calls callback with error when error occurs during fetch', () => {
        const callback = jest.fn();
        const renderer = renderFragment();
        expectFragmentResults([
          {
            data: initialUser,

            hasNext: true,
            hasPrevious: false,
          },
        ]);

        TestRenderer.act(() => {
          loadNext(1, {onComplete: callback});
        });
        const paginationVariables = {
          id: '1',
          after: 'cursor:1',
          first: 1,
          before: null,
          last: null,
          isViewerFriendLocal: false,
          orderby: ['name'],
          scale: null,
        };
        expectFragmentIsLoadingMore(renderer, direction, {
          data: initialUser,
          hasNext: true,
          hasPrevious: false,
          paginationVariables,
          gqlPaginationQuery,
        });
        expect(callback).toBeCalledTimes(0);

        const error = new Error('Oops');
        environment.mock.reject(gqlPaginationQuery, error);

        // We pass the error in the callback, but do not throw during render
        // since we want to continue rendering the existing items in the
        // connection
        expect(callback).toBeCalledTimes(1);
        expect(callback).toBeCalledWith(error);
      });

      it('preserves pagination request if re-rendered with same fragment ref', () => {
        const callback = jest.fn();
        const renderer = renderFragment();
        expectFragmentResults([
          {
            data: initialUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);

        TestRenderer.act(() => {
          loadNext(1, {onComplete: callback});
        });
        const paginationVariables = {
          id: '1',
          after: 'cursor:1',
          first: 1,
          before: null,
          last: null,
          isViewerFriendLocal: false,
          orderby: ['name'],
          scale: null,
        };
        expectFragmentIsLoadingMore(renderer, direction, {
          data: initialUser,
          hasNext: true,
          hasPrevious: false,
          paginationVariables,
          gqlPaginationQuery,
        });
        expect(callback).toBeCalledTimes(0);

        TestRenderer.act(() => {
          setOwner({...query});
        });

        // Assert that request is still in flight after re-rendering
        // with new fragment ref that points to the same data.
        expectFragmentIsLoadingMore(renderer, direction, {
          data: initialUser,
          hasNext: true,
          hasPrevious: false,
          paginationVariables,
          gqlPaginationQuery,
        });
        expect(callback).toBeCalledTimes(0);

        environment.mock.resolve(gqlPaginationQuery, {
          data: {
            node: {
              __typename: 'User',
              id: '1',
              name: 'Alice',
              friends: {
                edges: [
                  {
                    cursor: 'cursor:2',
                    node: {
                      __typename: 'User',
                      id: 'node:2',
                      name: 'name:node:2',
                      username: 'username:node:2',
                    },
                  },
                ],
                pageInfo: {
                  startCursor: 'cursor:2',
                  endCursor: 'cursor:2',
                  hasNextPage: true,
                  hasPreviousPage: true,
                },
              },
            },
          },
        });

        const expectedUser = {
          ...initialUser,
          friends: {
            ...initialUser.friends,
            edges: [
              {
                cursor: 'cursor:1',
                node: {
                  __typename: 'User',
                  id: 'node:1',
                  name: 'name:node:1',
                  ...createFragmentRef('node:1', query),
                },
              },
              {
                cursor: 'cursor:2',
                node: {
                  __typename: 'User',
                  id: 'node:2',
                  name: 'name:node:2',
                  ...createFragmentRef('node:2', query),
                },
              },
            ],
            pageInfo: {
              endCursor: 'cursor:2',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'cursor:1',
            },
          },
        };
        expectFragmentResults([
          {
            data: expectedUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);
        expect(callback).toBeCalledTimes(1);
      });

      describe('extra variables', () => {
        it('loads and renders the next items in the connection when passing extra variables', () => {
          const callback = jest.fn();
          const renderer = renderFragment();
          expectFragmentResults([
            {
              data: initialUser,
              hasNext: true,
              hasPrevious: false,
            },
          ]);

          TestRenderer.act(() => {
            loadNext(1, {
              onComplete: callback,
              // Pass extra variables that are different from original request
              UNSTABLE_extraVariables: {scale: 2.0},
            });
          });
          const paginationVariables = {
            id: '1',
            after: 'cursor:1',
            first: 1,
            before: null,
            last: null,
            isViewerFriendLocal: false,
            orderby: ['name'],
            // Assert that value from extra variables is used
            scale: 2.0,
          };
          expectFragmentIsLoadingMore(renderer, direction, {
            data: initialUser,
            hasNext: true,
            hasPrevious: false,
            paginationVariables,
            gqlPaginationQuery,
          });
          expect(callback).toBeCalledTimes(0);

          environment.mock.resolve(gqlPaginationQuery, {
            data: {
              node: {
                __typename: 'User',
                id: '1',
                name: 'Alice',
                friends: {
                  edges: [
                    {
                      cursor: 'cursor:2',
                      node: {
                        __typename: 'User',
                        id: 'node:2',
                        name: 'name:node:2',
                        username: 'username:node:2',
                      },
                    },
                  ],
                  pageInfo: {
                    startCursor: 'cursor:2',
                    endCursor: 'cursor:2',
                    hasNextPage: true,
                    hasPreviousPage: true,
                  },
                },
              },
            },
          });

          const expectedUser = {
            ...initialUser,
            friends: {
              ...initialUser.friends,
              edges: [
                {
                  cursor: 'cursor:1',
                  node: {
                    __typename: 'User',
                    id: 'node:1',
                    name: 'name:node:1',
                    ...createFragmentRef('node:1', query),
                  },
                },
                {
                  cursor: 'cursor:2',
                  node: {
                    __typename: 'User',
                    id: 'node:2',
                    name: 'name:node:2',
                    ...createFragmentRef('node:2', query),
                  },
                },
              ],
              pageInfo: {
                endCursor: 'cursor:2',
                hasNextPage: true,
                hasPreviousPage: false,
                startCursor: 'cursor:1',
              },
            },
          };
          expectFragmentResults([
            {
              data: expectedUser,
              hasNext: true,
              hasPrevious: false,
            },
          ]);
          expect(callback).toBeCalledTimes(1);
        });

        it('loads the next items in the connection and ignores any pagination vars passed as extra vars', () => {
          const callback = jest.fn();
          const renderer = renderFragment();
          expectFragmentResults([
            {
              data: initialUser,
              hasNext: true,
              hasPrevious: false,
            },
          ]);

          TestRenderer.act(() => {
            loadNext(1, {
              onComplete: callback,
              // Pass pagination vars as extra variables
              UNSTABLE_extraVariables: {first: 100, after: 'foo'},
            });
          });
          const paginationVariables = {
            id: '1',
            // Assert that pagination vars from extra variables are ignored
            after: 'cursor:1',
            first: 1,
            before: null,
            last: null,
            isViewerFriendLocal: false,
            orderby: ['name'],
            scale: null,
          };
          expectFragmentIsLoadingMore(renderer, direction, {
            data: initialUser,
            hasNext: true,
            hasPrevious: false,
            paginationVariables,
            gqlPaginationQuery,
          });
          expect(callback).toBeCalledTimes(0);

          environment.mock.resolve(gqlPaginationQuery, {
            data: {
              node: {
                __typename: 'User',
                id: '1',
                name: 'Alice',
                friends: {
                  edges: [
                    {
                      cursor: 'cursor:2',
                      node: {
                        __typename: 'User',
                        id: 'node:2',
                        name: 'name:node:2',
                        username: 'username:node:2',
                      },
                    },
                  ],
                  pageInfo: {
                    startCursor: 'cursor:2',
                    endCursor: 'cursor:2',
                    hasNextPage: true,
                    hasPreviousPage: true,
                  },
                },
              },
            },
          });

          const expectedUser = {
            ...initialUser,
            friends: {
              ...initialUser.friends,
              edges: [
                {
                  cursor: 'cursor:1',
                  node: {
                    __typename: 'User',
                    id: 'node:1',
                    name: 'name:node:1',
                    ...createFragmentRef('node:1', query),
                  },
                },
                {
                  cursor: 'cursor:2',
                  node: {
                    __typename: 'User',
                    id: 'node:2',
                    name: 'name:node:2',
                    ...createFragmentRef('node:2', query),
                  },
                },
              ],
              pageInfo: {
                endCursor: 'cursor:2',
                hasNextPage: true,
                hasPreviousPage: false,
                startCursor: 'cursor:1',
              },
            },
          };
          expectFragmentResults([
            {
              data: expectedUser,
              hasNext: true,
              hasPrevious: false,
            },
          ]);
          expect(callback).toBeCalledTimes(1);
        });
      });

      describe('disposing', () => {
        let unsubscribe;
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
          const callback = jest.fn();
          const renderer = renderFragment();
          expectFragmentResults([
            {
              data: initialUser,
              hasNext: true,
              hasPrevious: false,
            },
          ]);

          TestRenderer.act(() => {
            loadNext(1, {onComplete: callback});
          });

          // Assert request is started
          const paginationVariables = {
            id: '1',
            after: 'cursor:1',
            first: 1,
            before: null,
            last: null,
            isViewerFriendLocal: false,
            orderby: ['name'],
            scale: null,
          };
          expectFragmentIsLoadingMore(renderer, direction, {
            data: initialUser,
            hasNext: true,
            hasPrevious: false,
            paginationVariables,
            gqlPaginationQuery,
          });
          expect(callback).toBeCalledTimes(0);

          // Set new environment
          const newEnvironment = createMockEnvironment({
            handlerProvider: () => ConnectionHandler,
          });
          newEnvironment.commitPayload(query, {
            node: {
              __typename: 'User',
              id: '1',
              name: 'Alice in a different environment',
              friends: {
                edges: [
                  {
                    cursor: 'cursor:1',
                    node: {
                      __typename: 'User',
                      id: 'node:1',
                      name: 'name:node:1',
                      username: 'username:node:1',
                    },
                  },
                ],
                pageInfo: {
                  endCursor: 'cursor:1',
                  hasNextPage: true,
                  hasPreviousPage: false,
                  startCursor: 'cursor:1',
                },
              },
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
            gqlPaginationQuery,
            paginationVariables,
          });

          // Assert newly rendered data
          expectFragmentResults([
            {
              data: {
                ...initialUser,
                name: 'Alice in a different environment',
              },
              hasNext: true,
              hasPrevious: false,
            },
            {
              data: {
                ...initialUser,
                name: 'Alice in a different environment',
              },
              hasNext: true,
              hasPrevious: false,
            },
          ]);
        });

        it('disposes ongoing request if fragment ref changes', () => {
          const callback = jest.fn();
          const renderer = renderFragment();
          expectFragmentResults([
            {
              data: initialUser,
              hasNext: true,
              hasPrevious: false,
            },
          ]);

          TestRenderer.act(() => {
            loadNext(1, {onComplete: callback});
          });

          // Assert request is started
          const paginationVariables = {
            id: '1',
            after: 'cursor:1',
            first: 1,
            before: null,
            last: null,
            isViewerFriendLocal: false,
            orderby: ['name'],
            scale: null,
          };
          expectFragmentIsLoadingMore(renderer, direction, {
            data: initialUser,
            hasNext: true,
            hasPrevious: false,
            paginationVariables,
            gqlPaginationQuery,
          });
          expect(callback).toBeCalledTimes(0);

          // Pass new parent fragment ref with different variables
          const newVariables = {...variables, isViewerFriend: true};
          const newQuery = createOperationDescriptor(gqlQuery, newVariables);
          environment.commitPayload(newQuery, {
            node: {
              __typename: 'User',
              id: '1',
              name: 'Alice',
              friends: {
                edges: [
                  {
                    cursor: 'cursor:1',
                    node: {
                      __typename: 'User',
                      id: 'node:1',
                      name: 'name:node:1',
                      username: 'username:node:1',
                    },
                  },
                ],
                pageInfo: {
                  endCursor: 'cursor:1',
                  hasNextPage: true,
                  hasPreviousPage: false,
                  startCursor: 'cursor:1',
                },
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
            gqlPaginationQuery,
            paginationVariables,
          });

          // Assert newly rendered data
          const expectedUser = {
            ...initialUser,
            friends: {
              ...initialUser.friends,
              edges: [
                {
                  cursor: 'cursor:1',
                  node: {
                    __typename: 'User',
                    id: 'node:1',
                    name: 'name:node:1',
                    // Assert fragment ref points to owner with new variables
                    ...createFragmentRef('node:1', newQuery),
                  },
                },
              ],
            },
          };
          expectFragmentResults([
            {
              data: expectedUser,
              hasNext: true,
              hasPrevious: false,
            },
            {
              data: expectedUser,
              hasNext: true,
              hasPrevious: false,
            },
          ]);
        });

        it('disposes ongoing request on unmount', () => {
          const callback = jest.fn();
          const renderer = renderFragment();
          expectFragmentResults([
            {
              data: initialUser,
              hasNext: true,
              hasPrevious: false,
            },
          ]);

          TestRenderer.act(() => {
            loadNext(1, {onComplete: callback});
          });

          // Assert request is started
          const paginationVariables = {
            id: '1',
            after: 'cursor:1',
            first: 1,
            before: null,
            last: null,
            isViewerFriendLocal: false,
            orderby: ['name'],
            scale: null,
          };
          expectFragmentIsLoadingMore(renderer, direction, {
            data: initialUser,
            hasNext: true,
            hasPrevious: false,
            paginationVariables,
            gqlPaginationQuery,
          });
          expect(callback).toBeCalledTimes(0);
          TestRenderer.act(() => {
            renderer.unmount();
          });

          // Assert request was canceled
          expect(unsubscribe).toBeCalledTimes(1);
          expectRequestIsInFlight({
            inFlight: false,
            requestCount: 1,
            gqlPaginationQuery,
            paginationVariables,
          });
        });

        it('disposes ongoing request if it is manually disposed', () => {
          const callback = jest.fn();
          const renderer = renderFragment();
          expectFragmentResults([
            {
              data: initialUser,
              hasNext: true,
              hasPrevious: false,
            },
          ]);

          let disposable;
          TestRenderer.act(() => {
            disposable = loadNext(1, {onComplete: callback});
          });

          // Assert request is started
          const paginationVariables = {
            id: '1',
            after: 'cursor:1',
            first: 1,
            before: null,
            last: null,
            isViewerFriendLocal: false,
            orderby: ['name'],
            scale: null,
          };
          expectFragmentIsLoadingMore(renderer, direction, {
            data: initialUser,
            hasNext: true,
            hasPrevious: false,
            paginationVariables,
            gqlPaginationQuery,
          });
          expect(callback).toBeCalledTimes(0);

          // $FlowFixMe[incompatible-use]
          disposable.dispose();

          // Assert request was canceled
          expect(unsubscribe).toBeCalledTimes(1);
          expectRequestIsInFlight({
            inFlight: false,
            requestCount: 1,
            gqlPaginationQuery,
            paginationVariables,
          });
          expect(renderSpy).toHaveBeenCalledTimes(0);
        });
      });
    });

    describe('hasNext', () => {
      const direction = 'forward';

      it('returns true if it has more items', () => {
        (environment.getStore().getSource(): $FlowFixMe).clear();
        environment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: '1',
            name: 'Alice',
            friends: {
              edges: [
                {
                  cursor: 'cursor:1',
                  node: {
                    __typename: 'User',
                    id: 'node:1',
                    name: 'name:node:1',
                    username: 'username:node:1',
                  },
                },
              ],
              pageInfo: {
                endCursor: 'cursor:1',
                hasNextPage: true,
                hasPreviousPage: false,
                startCursor: 'cursor:1',
              },
            },
          },
        });

        renderFragment();
        expectFragmentResults([
          {
            data: {
              ...initialUser,
              friends: {
                ...initialUser.friends,
                pageInfo: expect.objectContaining({hasNextPage: true}),
              },
            },
            // Assert hasNext is true
            hasNext: true,
            hasPrevious: false,
          },
        ]);
      });

      it('returns false if edges are null', () => {
        (environment.getStore().getSource(): $FlowFixMe).clear();
        environment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: '1',
            name: 'Alice',
            friends: {
              edges: null,
              pageInfo: {
                endCursor: 'cursor:1',
                hasNextPage: true,
                hasPreviousPage: false,
                startCursor: 'cursor:1',
              },
            },
          },
        });

        renderFragment();
        expectFragmentResults([
          {
            data: {
              ...initialUser,
              friends: {
                ...initialUser.friends,
                edges: null,
                pageInfo: expect.objectContaining({hasNextPage: true}),
              },
            },
            // Assert hasNext is false
            hasNext: false,
            hasPrevious: false,
          },
        ]);
      });

      it('returns false if edges are undefined', () => {
        (environment.getStore().getSource(): $FlowFixMe).clear();
        environment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: '1',
            name: 'Alice',
            friends: {
              edges: undefined,
              pageInfo: {
                endCursor: 'cursor:1',
                hasNextPage: true,
                hasPreviousPage: false,
                startCursor: 'cursor:1',
              },
            },
          },
        });

        renderFragment();
        expectFragmentResults([
          {
            data: {
              ...initialUser,
              friends: {
                ...initialUser.friends,
                edges: undefined,
                pageInfo: expect.objectContaining({hasNextPage: true}),
              },
            },
            // Assert hasNext is false
            hasNext: false,
            hasPrevious: false,
          },
        ]);
      });

      it('returns false if end cursor is null', () => {
        (environment.getStore().getSource(): $FlowFixMe).clear();
        environment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: '1',
            name: 'Alice',
            friends: {
              edges: [
                {
                  cursor: 'cursor:1',
                  node: {
                    __typename: 'User',
                    id: 'node:1',
                    name: 'name:node:1',
                    username: 'username:node:1',
                  },
                },
              ],
              pageInfo: {
                // endCursor is null
                endCursor: null,
                // but hasNextPage is still true
                hasNextPage: true,
                hasPreviousPage: false,
                startCursor: null,
              },
            },
          },
        });

        renderFragment();
        expectFragmentResults([
          {
            data: {
              ...initialUser,
              friends: {
                ...initialUser.friends,
                pageInfo: expect.objectContaining({
                  endCursor: null,
                  hasNextPage: true,
                }),
              },
            },
            // Assert hasNext is false
            hasNext: false,
            hasPrevious: false,
          },
        ]);
      });

      it('returns false if end cursor is undefined', () => {
        (environment.getStore().getSource(): $FlowFixMe).clear();
        environment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: '1',
            name: 'Alice',
            friends: {
              edges: [
                {
                  cursor: 'cursor:1',
                  node: {
                    __typename: 'User',
                    id: 'node:1',
                    name: 'name:node:1',
                    username: 'username:node:1',
                  },
                },
              ],
              pageInfo: {
                // endCursor is undefined
                endCursor: undefined,
                // but hasNextPage is still true
                hasNextPage: true,
                hasPreviousPage: false,
                startCursor: undefined,
              },
            },
          },
        });

        renderFragment();
        expectFragmentResults([
          {
            data: {
              ...initialUser,
              friends: {
                ...initialUser.friends,
                pageInfo: expect.objectContaining({
                  endCursor: null,
                  hasNextPage: true,
                }),
              },
            },
            // Assert hasNext is false
            hasNext: false,
            hasPrevious: false,
          },
        ]);
      });

      it('returns false if pageInfo.hasNextPage is false-ish', () => {
        (environment.getStore().getSource(): $FlowFixMe).clear();
        environment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: '1',
            name: 'Alice',
            friends: {
              edges: [
                {
                  cursor: 'cursor:1',
                  node: {
                    __typename: 'User',
                    id: 'node:1',
                    name: 'name:node:1',
                    username: 'username:node:1',
                  },
                },
              ],
              pageInfo: {
                endCursor: 'cursor:1',
                hasNextPage: null,
                hasPreviousPage: false,
                startCursor: 'cursor:1',
              },
            },
          },
        });

        renderFragment();
        expectFragmentResults([
          {
            data: {
              ...initialUser,
              friends: {
                ...initialUser.friends,
                pageInfo: expect.objectContaining({
                  hasNextPage: null,
                }),
              },
            },
            // Assert hasNext is false
            hasNext: false,
            hasPrevious: false,
          },
        ]);
      });

      it('returns false if pageInfo.hasNextPage is false', () => {
        (environment.getStore().getSource(): $FlowFixMe).clear();
        environment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: '1',
            name: 'Alice',
            friends: {
              edges: [
                {
                  cursor: 'cursor:1',
                  node: {
                    __typename: 'User',
                    id: 'node:1',
                    name: 'name:node:1',
                    username: 'username:node:1',
                  },
                },
              ],
              pageInfo: {
                endCursor: 'cursor:1',
                hasNextPage: false,
                hasPreviousPage: false,
                startCursor: 'cursor:1',
              },
            },
          },
        });

        renderFragment();
        expectFragmentResults([
          {
            data: {
              ...initialUser,
              friends: {
                ...initialUser.friends,
                pageInfo: expect.objectContaining({
                  hasNextPage: false,
                }),
              },
            },
            // Assert hasNext is false
            hasNext: false,
            hasPrevious: false,
          },
        ]);
      });

      it('updates after pagination if more results are available', () => {
        const callback = jest.fn();
        const renderer = renderFragment();
        expectFragmentResults([
          {
            data: initialUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);

        TestRenderer.act(() => {
          loadNext(1, {onComplete: callback});
        });
        const paginationVariables = {
          id: '1',
          after: 'cursor:1',
          first: 1,
          before: null,
          last: null,
          isViewerFriendLocal: false,
          orderby: ['name'],
          scale: null,
        };
        expectFragmentIsLoadingMore(renderer, direction, {
          data: initialUser,
          hasNext: true,
          hasPrevious: false,
          paginationVariables,
          gqlPaginationQuery,
        });
        expect(callback).toBeCalledTimes(0);

        environment.mock.resolve(gqlPaginationQuery, {
          data: {
            node: {
              __typename: 'User',
              id: '1',
              name: 'Alice',
              friends: {
                edges: [
                  {
                    cursor: 'cursor:2',
                    node: {
                      __typename: 'User',
                      id: 'node:2',
                      name: 'name:node:2',
                      username: 'username:node:2',
                    },
                  },
                ],
                pageInfo: {
                  startCursor: 'cursor:2',
                  endCursor: 'cursor:2',
                  hasNextPage: true,
                  hasPreviousPage: true,
                },
              },
            },
          },
        });

        const expectedUser = {
          ...initialUser,
          friends: {
            ...initialUser.friends,
            edges: [
              {
                cursor: 'cursor:1',
                node: {
                  __typename: 'User',
                  id: 'node:1',
                  name: 'name:node:1',
                  ...createFragmentRef('node:1', query),
                },
              },
              {
                cursor: 'cursor:2',
                node: {
                  __typename: 'User',
                  id: 'node:2',
                  name: 'name:node:2',
                  ...createFragmentRef('node:2', query),
                },
              },
            ],
            pageInfo: {
              endCursor: 'cursor:2',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'cursor:1',
            },
          },
        };
        expectFragmentResults([
          {
            // First update has updated connection
            data: expectedUser,
            // Assert hasNext reflects server response
            hasNext: true,
            hasPrevious: false,
          },
        ]);
        expect(callback).toBeCalledTimes(1);
      });

      it('updates after pagination if no more results are available', () => {
        const callback = jest.fn();
        const renderer = renderFragment();
        expectFragmentResults([
          {
            data: initialUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);

        TestRenderer.act(() => {
          loadNext(1, {onComplete: callback});
        });
        const paginationVariables = {
          id: '1',
          after: 'cursor:1',
          first: 1,
          before: null,
          last: null,
          isViewerFriendLocal: false,
          orderby: ['name'],
          scale: null,
        };
        expectFragmentIsLoadingMore(renderer, direction, {
          data: initialUser,
          hasNext: true,
          hasPrevious: false,
          paginationVariables,
          gqlPaginationQuery,
        });
        expect(callback).toBeCalledTimes(0);

        environment.mock.resolve(gqlPaginationQuery, {
          data: {
            node: {
              __typename: 'User',
              id: '1',
              name: 'Alice',
              friends: {
                edges: [
                  {
                    cursor: 'cursor:2',
                    node: {
                      __typename: 'User',
                      id: 'node:2',
                      name: 'name:node:2',
                      username: 'username:node:2',
                    },
                  },
                ],
                pageInfo: {
                  startCursor: 'cursor:2',
                  endCursor: 'cursor:2',
                  hasNextPage: false,
                  hasPreviousPage: true,
                },
              },
            },
          },
        });

        const expectedUser = {
          ...initialUser,
          friends: {
            ...initialUser.friends,
            edges: [
              {
                cursor: 'cursor:1',
                node: {
                  __typename: 'User',
                  id: 'node:1',
                  name: 'name:node:1',
                  ...createFragmentRef('node:1', query),
                },
              },
              {
                cursor: 'cursor:2',
                node: {
                  __typename: 'User',
                  id: 'node:2',
                  name: 'name:node:2',
                  ...createFragmentRef('node:2', query),
                },
              },
            ],
            pageInfo: {
              endCursor: 'cursor:2',
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: 'cursor:1',
            },
          },
        };
        expectFragmentResults([
          {
            data: expectedUser,
            // Assert hasNext reflects server response
            hasNext: false,
            hasPrevious: false,
          },
        ]);
        expect(callback).toBeCalledTimes(1);
      });
    });

    describe('refetch', () => {
      // The bulk of refetch behavior is covered in useRefetchableFragmentNode-test,
      // so this suite covers the pagination-related test cases.
      function expectRefetchRequestIsInFlight(expected) {
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.executeWithSource).toBeCalledTimes(
          expected.requestCount,
        );
        expect(
          environment.mock.isLoading(
            expected.gqlRefetchQuery ?? gqlPaginationQuery,
            expected.refetchVariables,
            {force: true},
          ),
        ).toEqual(expected.inFlight);
      }

      function expectFragmentIsRefetching(
        renderer,
        expected: {|
          data: mixed,
          hasNext: boolean,
          hasPrevious: boolean,
          refetchVariables: Variables,
          refetchQuery?: OperationDescriptor,
          gqlRefetchQuery?: $FlowFixMe,
        |},
      ) {
        expect(renderSpy).toBeCalledTimes(0);
        renderSpy.mockClear();

        // Assert refetch query was fetched
        expectRefetchRequestIsInFlight({
          ...expected,
          inFlight: true,
          requestCount: 1,
        });

        // Assert component suspended
        expect(renderSpy).toBeCalledTimes(0);
        expect(renderer.toJSON()).toEqual('Fallback');

        // Assert query is retained by loadQuery
        // and tentatively retained while component is suspended
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain).toBeCalledTimes(2);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain.mock.calls[0][0]).toEqual(
          expected.refetchQuery ?? paginationQuery,
        );
      }

      it('refetches new variables correctly when refetching new id', () => {
        const renderer = renderFragment();
        expectFragmentResults([
          {
            data: initialUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);

        TestRenderer.act(() => {
          refetch({id: '4'});
        });

        // Assert that fragment is refetching with the right variables and
        // suspends upon refetch
        const refetchVariables = {
          after: null,
          first: 1,
          before: null,
          last: null,
          id: '4',
          isViewerFriendLocal: false,
          orderby: ['name'],
          scale: null,
        };
        paginationQuery = createOperationDescriptor(
          gqlPaginationQuery,
          refetchVariables,
          {force: true},
        );
        expectFragmentIsRefetching(renderer, {
          data: initialUser,
          hasNext: true,
          hasPrevious: false,
          refetchVariables,
          refetchQuery: paginationQuery,
        });

        // Mock network response
        environment.mock.resolve(gqlPaginationQuery, {
          data: {
            node: {
              __typename: 'User',
              id: '4',
              name: 'Mark',
              friends: {
                edges: [
                  {
                    cursor: 'cursor:100',
                    node: {
                      __typename: 'User',
                      id: 'node:100',
                      name: 'name:node:100',
                      username: 'username:node:100',
                    },
                  },
                ],
                pageInfo: {
                  endCursor: 'cursor:100',
                  hasNextPage: true,
                  hasPreviousPage: false,
                  startCursor: 'cursor:100',
                },
              },
            },
          },
        });

        // Assert fragment is rendered with new data
        const expectedUser = {
          id: '4',
          name: 'Mark',
          friends: {
            edges: [
              {
                cursor: 'cursor:100',
                node: {
                  __typename: 'User',
                  id: 'node:100',
                  name: 'name:node:100',
                  ...createFragmentRef('node:100', paginationQuery),
                },
              },
            ],
            pageInfo: {
              endCursor: 'cursor:100',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'cursor:100',
            },
          },
        };
        expectFragmentResults([
          {
            data: expectedUser,
            hasNext: true,
            hasPrevious: false,
          },
          {
            data: expectedUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);

        // Assert refetch query was retained by loadQuery and the component
        expect(release).not.toBeCalled();
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain).toBeCalledTimes(2);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain.mock.calls[0][0]).toEqual(paginationQuery);
      });

      it('refetches new variables correctly when refetching same id', () => {
        const renderer = renderFragment();
        expectFragmentResults([
          {
            data: initialUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);

        TestRenderer.act(() => {
          refetch({isViewerFriendLocal: true, orderby: ['lastname']});
        });

        // Assert that fragment is refetching with the right variables and
        // suspends upon refetch
        const refetchVariables = {
          after: null,
          first: 1,
          before: null,
          last: null,
          id: '1',
          isViewerFriendLocal: true,
          orderby: ['lastname'],
          scale: null,
        };
        paginationQuery = createOperationDescriptor(
          gqlPaginationQuery,
          refetchVariables,
          {force: true},
        );
        expectFragmentIsRefetching(renderer, {
          data: initialUser,
          hasNext: true,
          hasPrevious: false,
          refetchVariables,
          refetchQuery: paginationQuery,
        });

        // Mock network response
        environment.mock.resolve(gqlPaginationQuery, {
          data: {
            node: {
              __typename: 'User',
              id: '1',
              name: 'Alice',
              friends: {
                edges: [
                  {
                    cursor: 'cursor:100',
                    node: {
                      __typename: 'User',
                      id: 'node:100',
                      name: 'name:node:100',
                      username: 'username:node:100',
                    },
                  },
                ],
                pageInfo: {
                  endCursor: 'cursor:100',
                  hasNextPage: true,
                  hasPreviousPage: false,
                  startCursor: 'cursor:100',
                },
              },
            },
          },
        });

        // Assert fragment is rendered with new data
        const expectedUser = {
          id: '1',
          name: 'Alice',
          friends: {
            edges: [
              {
                cursor: 'cursor:100',
                node: {
                  __typename: 'User',
                  id: 'node:100',
                  name: 'name:node:100',
                  ...createFragmentRef('node:100', paginationQuery),
                },
              },
            ],
            pageInfo: {
              endCursor: 'cursor:100',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'cursor:100',
            },
          },
        };
        expectFragmentResults([
          {
            data: expectedUser,
            hasNext: true,
            hasPrevious: false,
          },
          {
            data: expectedUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);

        // Assert refetch query was retained by loadQuery and the component
        expect(release).not.toBeCalled();
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain).toBeCalledTimes(2);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain.mock.calls[0][0]).toEqual(paginationQuery);
      });

      it('refetches with correct id from refetchable fragment when using nested fragment', () => {
        // Populate store with data for query using nested fragment
        environment.commitPayload(queryNestedFragment, {
          node: {
            __typename: 'Feedback',
            id: '<feedbackid>',
            actor: {
              __typename: 'User',
              id: '1',
              name: 'Alice',
              friends: {
                edges: [
                  {
                    cursor: 'cursor:1',
                    node: {
                      __typename: 'User',
                      id: 'node:1',
                      name: 'name:node:1',
                      username: 'username:node:1',
                    },
                  },
                ],
                pageInfo: {
                  endCursor: 'cursor:1',
                  hasNextPage: true,
                  hasPreviousPage: false,
                  startCursor: 'cursor:1',
                },
              },
            },
          },
        });

        // Get fragment ref for user using nested fragment
        const userRef = (environment.lookup(queryNestedFragment.fragment)
          .data: $FlowFixMe)?.node?.actor;

        initialUser = {
          id: '1',
          name: 'Alice',
          friends: {
            edges: [
              {
                cursor: 'cursor:1',
                node: {
                  __typename: 'User',
                  id: 'node:1',
                  name: 'name:node:1',
                  ...createFragmentRef('node:1', queryNestedFragment),
                },
              },
            ],
            pageInfo: {
              endCursor: 'cursor:1',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'cursor:1',
            },
          },
        };

        const renderer = renderFragment({owner: queryNestedFragment, userRef});
        expectFragmentResults([
          {
            data: initialUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);

        TestRenderer.act(() => {
          refetch({isViewerFriendLocal: true, orderby: ['lastname']});
        });

        // Assert that fragment is refetching with the right variables and
        // suspends upon refetch
        const refetchVariables = {
          after: null,
          first: 1,
          before: null,
          last: null,
          // The id here should correspond to the user id, and not the
          // feedback id from the query variables (i.e. `<feedbackid>`)
          id: '1',
          isViewerFriendLocal: true,
          orderby: ['lastname'],
          scale: null,
        };
        paginationQuery = createOperationDescriptor(
          gqlPaginationQuery,
          refetchVariables,
          {force: true},
        );
        expectFragmentIsRefetching(renderer, {
          data: initialUser,
          hasNext: true,
          hasPrevious: false,
          refetchVariables,
          refetchQuery: paginationQuery,
        });

        // Mock network response
        environment.mock.resolve(gqlPaginationQuery, {
          data: {
            node: {
              __typename: 'User',
              id: '1',
              name: 'Alice',
              friends: {
                edges: [
                  {
                    cursor: 'cursor:100',
                    node: {
                      __typename: 'User',
                      id: 'node:100',
                      name: 'name:node:100',
                      username: 'username:node:100',
                    },
                  },
                ],
                pageInfo: {
                  endCursor: 'cursor:100',
                  hasNextPage: true,
                  hasPreviousPage: false,
                  startCursor: 'cursor:100',
                },
              },
            },
          },
        });

        // Assert fragment is rendered with new data
        const expectedUser = {
          id: '1',
          name: 'Alice',
          friends: {
            edges: [
              {
                cursor: 'cursor:100',
                node: {
                  __typename: 'User',
                  id: 'node:100',
                  name: 'name:node:100',
                  ...createFragmentRef('node:100', paginationQuery),
                },
              },
            ],
            pageInfo: {
              endCursor: 'cursor:100',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'cursor:100',
            },
          },
        };
        expectFragmentResults([
          {
            data: expectedUser,
            hasNext: true,
            hasPrevious: false,
          },
          {
            data: expectedUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);

        // Assert refetch query was retained by loadQuery and the component
        expect(release).not.toBeCalled();
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain).toBeCalledTimes(2);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain.mock.calls[0][0]).toEqual(paginationQuery);
      });

      it('loads more items correctly after refetching', () => {
        const renderer = renderFragment();
        expectFragmentResults([
          {
            data: initialUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);

        TestRenderer.act(() => {
          refetch({isViewerFriendLocal: true, orderby: ['lastname']});
        });

        // Assert that fragment is refetching with the right variables and
        // suspends upon refetch
        const refetchVariables = {
          after: null,
          first: 1,
          before: null,
          last: null,
          id: '1',
          isViewerFriendLocal: true,
          orderby: ['lastname'],
          scale: null,
        };
        paginationQuery = createOperationDescriptor(
          gqlPaginationQuery,
          refetchVariables,
          {force: true},
        );
        expectFragmentIsRefetching(renderer, {
          data: initialUser,
          hasNext: true,
          hasPrevious: false,
          refetchVariables,
          refetchQuery: paginationQuery,
        });

        // Mock network response
        environment.mock.resolve(gqlPaginationQuery, {
          data: {
            node: {
              __typename: 'User',
              id: '1',
              name: 'Alice',
              friends: {
                edges: [
                  {
                    cursor: 'cursor:100',
                    node: {
                      __typename: 'User',
                      id: 'node:100',
                      name: 'name:node:100',
                      username: 'username:node:100',
                    },
                  },
                ],
                pageInfo: {
                  endCursor: 'cursor:100',
                  hasNextPage: true,
                  hasPreviousPage: false,
                  startCursor: 'cursor:100',
                },
              },
            },
          },
        });

        // Assert fragment is rendered with new data
        const expectedUser = {
          id: '1',
          name: 'Alice',
          friends: {
            edges: [
              {
                cursor: 'cursor:100',
                node: {
                  __typename: 'User',
                  id: 'node:100',
                  name: 'name:node:100',
                  ...createFragmentRef('node:100', paginationQuery),
                },
              },
            ],
            pageInfo: {
              endCursor: 'cursor:100',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'cursor:100',
            },
          },
        };
        expectFragmentResults([
          {
            data: expectedUser,
            hasNext: true,
            hasPrevious: false,
          },
          {
            data: expectedUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);

        // Assert refetch query was retained by loadQuery and the component
        expect(release).not.toBeCalled();
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain).toBeCalledTimes(2);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain.mock.calls[0][0]).toEqual(paginationQuery);

        // Paginate after refetching
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        environment.execute.mockClear();
        TestRenderer.act(() => {
          loadNext(1);
        });
        const paginationVariables = {
          id: '1',
          after: 'cursor:100',
          first: 1,
          before: null,
          last: null,
          isViewerFriendLocal: true,
          orderby: ['lastname'],
          scale: null,
        };
        expectFragmentIsLoadingMore(renderer, 'forward', {
          data: expectedUser,
          hasNext: true,
          hasPrevious: false,
          paginationVariables,
          gqlPaginationQuery,
        });

        environment.mock.resolve(gqlPaginationQuery, {
          data: {
            node: {
              __typename: 'User',
              id: '1',
              name: 'Alice',
              friends: {
                edges: [
                  {
                    cursor: 'cursor:200',
                    node: {
                      __typename: 'User',
                      id: 'node:200',
                      name: 'name:node:200',
                      username: 'username:node:200',
                    },
                  },
                ],
                pageInfo: {
                  startCursor: 'cursor:200',
                  endCursor: 'cursor:200',
                  hasNextPage: true,
                  hasPreviousPage: true,
                },
              },
            },
          },
        });

        const paginatedUser = {
          ...expectedUser,
          friends: {
            ...expectedUser.friends,
            edges: [
              {
                cursor: 'cursor:100',
                node: {
                  __typename: 'User',
                  id: 'node:100',
                  name: 'name:node:100',
                  ...createFragmentRef('node:100', paginationQuery),
                },
              },
              {
                cursor: 'cursor:200',
                node: {
                  __typename: 'User',
                  id: 'node:200',
                  name: 'name:node:200',
                  ...createFragmentRef('node:200', paginationQuery),
                },
              },
            ],
            pageInfo: {
              endCursor: 'cursor:200',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'cursor:100',
            },
          },
        };
        expectFragmentResults([
          {
            // Second update sets isLoading flag back to false
            data: paginatedUser,
            hasNext: true,
            hasPrevious: false,
          },
        ]);
      });
    });
  });
});

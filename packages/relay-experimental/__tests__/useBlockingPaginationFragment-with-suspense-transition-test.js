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
const Scheduler = require('scheduler');

import type {Direction} from '../useLoadMoreFunction';
import type {OperationDescriptor, Variables} from 'relay-runtime';
const {useEffect, useTransition, useMemo, useState} = React;
const TestRenderer = require('react-test-renderer');

const invariant = require('invariant');
const useBlockingPaginationFragmentOriginal = require('../useBlockingPaginationFragment');
const ReactRelayContext = require('react-relay/ReactRelayContext');
const {
  ConnectionHandler,
  FRAGMENT_OWNER_KEY,
  FRAGMENTS_KEY,
  ID_KEY,
  createOperationDescriptor,
} = require('relay-runtime');

const PAGINATION_SUSPENSE_CONFIG = {timeoutMs: 45 * 1000};

describe('useBlockingPaginationFragment with useTransition', () => {
  if (typeof React.useTransition !== 'function') {
    it('empty test to prevent Jest from failing', () => {
      // This suite is only useful with experimental React build
    });
  } else {
    let environment;
    let initialUser;
    let gqlQuery;
    let gqlQueryWithoutID;
    let gqlPaginationQuery;
    let gqlFragment;
    let query;
    let queryWithoutID;
    let paginationQuery;
    let variables;
    let variablesWithoutID;
    let setEnvironment;
    let setOwner;
    let renderFragment;
    let createMockEnvironment;
    let generateAndCompile;
    let loadNext;
    let refetch;
    let forceUpdate;
    let release;
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

    function useBlockingPaginationFragmentWithSuspenseTransition(
      fragmentNode,
      fragmentRef,
    ) {
      const [startTransition, isPendingNext] = useTransition(
        PAGINATION_SUSPENSE_CONFIG,
      );
      /* $FlowFixMe(>=0.108.0 site=www,mobile,react_native_fb,oss) This comment suppresses an error found
       * when Flow v0.108.0 was deployed. To see the error delete this comment
       * and run Flow. */
      const {data, ...result} = useBlockingPaginationFragmentOriginal(
        fragmentNode,
        // $FlowFixMe
        fragmentRef,
      );
      loadNext = (...args) => {
        let disposable = {dispose: () => {}};
        startTransition(() => {
          disposable = result.loadNext(...args);
        });
        return disposable;
      };
      refetch = result.refetch;
      // $FlowFixMe
      result.isPendingNext = isPendingNext;

      useEffect(() => {
        Scheduler.unstable_yieldValue({data, ...result});
      });

      return {data, ...result};
    }

    function assertYield(expected, actual) {
      expect(actual.data).toEqual(expected.data);
      expect(actual.isPendingNext).toEqual(expected.isPendingNext);
      expect(actual.hasNext).toEqual(expected.hasNext);
      expect(actual.hasPrevious).toEqual(expected.hasPrevious);
    }

    function expectFragmentResults(
      expectedYields: $ReadOnlyArray<{|
        data: $FlowFixMe,
        isPendingNext: boolean,
        hasNext: boolean,
        hasPrevious: boolean,
      |}>,
    ) {
      assertYieldsWereCleared();
      Scheduler.unstable_flushNumberOfYields(expectedYields.length);
      const actualYields = Scheduler.unstable_clearYields();
      expect(actualYields.length).toEqual(expectedYields.length);
      expectedYields.forEach((expected, idx) =>
        assertYield(expected, actualYields[idx]),
      );
    }

    function assertYieldsWereCleared() {
      const actualYields = Scheduler.unstable_clearYields();
      if (actualYields.length !== 0) {
        throw new Error(
          'Log of yielded values is not empty. ' +
            'Call expect(Scheduler).toHaveYielded(...) first.',
        );
      }
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
      jest.mock('warning');
      jest.mock('../ExecutionEnvironment', () => ({
        isServer: false,
      }));
      jest.mock('scheduler', () => {
        return jest.requireActual('scheduler/unstable_mock');
      });

      // Supress `act` warnings since we are intentionally not
      // using it for most tests here. `act` currently always
      // flushes Suspense fallbacks, and that's not what we want
      // when asserting pending/suspended states,
      const originalLogError = console.error.bind(console);
      jest.spyOn(console, 'error').mockImplementation((message, ...args) => {
        if (typeof message === 'string' && message.includes('act(...)')) {
          return;
        }
        originalLogError(message, ...args);
      });

      ({
        createMockEnvironment,
        generateAndCompile,
      } = require('relay-test-utils-internal'));

      // Set up environment and base data
      environment = createMockEnvironment({
        handlerProvider: () => ConnectionHandler,
      });
      release = jest.fn();
      environment.retain.mockImplementation((...args) => {
        return {
          dispose: release,
        };
      });
      const generated = generateAndCompile(
        `
          fragment NestedUserFragment on User {
            username
          }

          fragment UserFragment on User
          @refetchable(queryName: "UserFragmentPaginationQuery")
          @argumentDefinitions(
            isViewerFriendLocal: {type: "Boolean", defaultValue: false}
            orderby: {type: "[String]"}
          ) {
            id
            name
            friends(
              after: $after,
              first: $first,
              before: $before,
              last: $last,
              orderby: $orderby,
              isViewerFriend: $isViewerFriendLocal
            ) @connection(key: "UserFragment_friends") {
              edges {
                node {
                  id
                  name
                  ...NestedUserFragment
                }
              }
            }
          }

          query UserQuery(
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
                ...UserFragment @arguments(isViewerFriendLocal: $isViewerFriend, orderby: $orderby)
              }
            }
          }

          query UserQueryWithoutID(
            $after: ID
            $first: Int
            $before: ID
            $last: Int
            $orderby: [String]
            $isViewerFriend: Boolean
          ) {
            viewer {
              actor {
                ...UserFragment @arguments(isViewerFriendLocal: $isViewerFriend, orderby: $orderby)
              }
            }
          }
        `,
      );
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
        id: '<feedbackid>',
      };
      gqlQuery = generated.UserQuery;
      gqlQueryWithoutID = generated.UserQueryWithoutID;
      gqlPaginationQuery = generated.UserFragmentPaginationQuery;
      gqlFragment = generated.UserFragment;
      invariant(
        gqlFragment.metadata?.refetch?.operation ===
          '@@MODULE_START@@UserFragmentPaginationQuery.graphql@@MODULE_END@@',
        'useRefetchableFragment-test: Expected refetchable fragment metadata to contain operation.',
      );
      // Manually set the refetchable operation for the test.
      gqlFragment.metadata.refetch.operation = gqlPaginationQuery;

      query = createOperationDescriptor(gqlQuery, variables);
      queryWithoutID = createOperationDescriptor(
        gqlQueryWithoutID,
        variablesWithoutID,
      );
      paginationQuery = createOperationDescriptor(
        gqlPaginationQuery,
        variables,
      );
      environment.commitPayload(query, {
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
        const artificialUserRef = useMemo(() => {
          const snapshot = environment.lookup(owner.fragment);
          return (snapshot.data: $FlowFixMe)?.node?.actor;
        }, [owner]);
        const userRef = props.hasOwnProperty('userRef')
          ? props.userRef
          : artificialUserRef;

        setOwner = _setOwner;
        forceUpdate = _setCount;

        const {
          data: userData,
        } = useBlockingPaginationFragmentWithSuspenseTransition(
          fragment,
          /* $FlowFixMe(>=0.108.0 site=www,mobile,react_native_fb,oss) This comment suppresses an error found
           * when Flow v0.108.0 was deployed. To see the error delete this comment
           * and run Flow. */
          userRef,
        );
        return <Renderer user={userData} />;
      };

      const ContextProvider = ({children}) => {
        const [env, _setEnv] = useState(environment);
        // TODO(T39494051) - We set empty variables in relay context to make
        // Flow happy, but useBlockingPaginationFragment does not use them, instead it uses
        // the variables from the fragment owner.
        const relayContext = useMemo(() => ({environment: env}), [env]);

        setEnvironment = _setEnv;

        return (
          <ReactRelayContext.Provider value={relayContext}>
            {children}
          </ReactRelayContext.Provider>
        );
      };

      const Fallback = () => {
        useEffect(() => {
          Scheduler.unstable_yieldValue('Fallback');
        });

        return 'Fallback';
      };

      renderFragment = (args?: {
        isConcurrent?: boolean,
        owner?: $FlowFixMe,
        userRef?: $FlowFixMe,
        fragment?: $FlowFixMe,
        ...
      }): $FlowFixMe => {
        const {isConcurrent = true, ...props} = args ?? {};
        return TestRenderer.create(
          <ErrorBoundary fallback={({error}) => `Error: ${error.message}`}>
            <React.Suspense fallback={<Fallback />}>
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
      jest.dontMock('scheduler');
    });

    describe('pagination', () => {
      function expectRequestIsInFlight(expected) {
        expect(environment.execute).toBeCalledTimes(expected.requestCount);
        expect(
          environment.mock.isLoading(
            expected.gqlPaginationQuery ?? gqlPaginationQuery,
            expected.paginationVariables,
            {force: true},
          ),
        ).toEqual(expected.inFlight);
      }

      function expectFragmentIsPendingOnPagination(
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
        // Assert fragment sets isPending to true
        expectFragmentResults([
          {
            data: expected.data,
            isPendingNext: direction === 'forward',
            hasNext: expected.hasNext,
            hasPrevious: expected.hasPrevious,
          },
        ]);

        // Assert refetch query was fetched
        expectRequestIsInFlight({...expected, inFlight: true, requestCount: 1});
      }

      describe('loadNext', () => {
        const direction = 'forward';

        // Sanity check test, should already be tested in useBlockingPagination test
        it('loads and renders next items in connection', () => {
          const callback = jest.fn();
          const renderer = renderFragment();
          expectFragmentResults([
            {
              data: initialUser,
              isPendingNext: false,
              hasNext: true,
              hasPrevious: false,
            },
          ]);

          loadNext(1, {onComplete: callback});

          const paginationVariables = {
            id: '1',
            after: 'cursor:1',
            first: 1,
            before: null,
            last: null,
            isViewerFriendLocal: false,
            orderby: ['name'],
          };
          expectFragmentIsPendingOnPagination(renderer, direction, {
            data: initialUser,
            hasNext: true,
            hasPrevious: false,
            paginationVariables,
            gqlPaginationQuery,
          });
          expect(callback).toBeCalledTimes(0);
          expect(renderer.toJSON()).toEqual(null);

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
              isPendingNext: false,
              hasNext: true,
              hasPrevious: false,
            },
          ]);
          expect(callback).toBeCalledTimes(1);
        });

        it('renders pending flag correctly if pagination update is interrupted before it commits (unsuspends)', () => {
          const callback = jest.fn();
          const renderer = renderFragment();
          expectFragmentResults([
            {
              data: initialUser,
              isPendingNext: false,
              hasNext: true,
              hasPrevious: false,
            },
          ]);

          loadNext(1, {onComplete: callback});

          const paginationVariables = {
            id: '1',
            after: 'cursor:1',
            first: 1,
            before: null,
            last: null,
            isViewerFriendLocal: false,
            orderby: ['name'],
          };
          expectFragmentIsPendingOnPagination(renderer, direction, {
            data: initialUser,
            hasNext: true,
            hasPrevious: false,
            paginationVariables,
            gqlPaginationQuery,
          });
          expect(callback).toBeCalledTimes(0);
          expect(renderer.toJSON()).toEqual(null);

          // Schedule a high-pri update while the component is
          // suspended on pagination
          Scheduler.unstable_runWithPriority(
            Scheduler.unstable_UserBlockingPriority,
            () => {
              forceUpdate(prev => prev + 1);
            },
          );

          // Assert high-pri update is rendered when initial update
          // that suspended hasn't committed
          // Assert that the avoided Suspense fallback isn't rendered
          expect(renderer.toJSON()).toEqual(null);
          expectFragmentResults([
            {
              data: initialUser,
              // Assert that isPending flag is still true
              isPendingNext: true,
              hasNext: true,
              hasPrevious: false,
            },
          ]);

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
              isPendingNext: false,
              hasNext: true,
              hasPrevious: false,
            },
          ]);
          expect(callback).toBeCalledTimes(1);
        });

        it('loads more correctly when original variables do not include an id', () => {
          const callback = jest.fn();
          const viewer = environment.lookup(queryWithoutID.fragment).data
            ?.viewer;
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
              isPendingNext: false,
              hasNext: true,
              hasPrevious: false,
            },
          ]);

          loadNext(1, {onComplete: callback});

          const paginationVariables = {
            id: '1',
            after: 'cursor:1',
            first: 1,
            before: null,
            last: null,
            isViewerFriendLocal: false,
            orderby: ['name'],
          };
          expectFragmentIsPendingOnPagination(renderer, direction, {
            data: expectedUser,
            hasNext: true,
            hasPrevious: false,
            paginationVariables,
            gqlPaginationQuery,
          });
          expect(callback).toBeCalledTimes(0);
          expect(renderer.toJSON()).toEqual(null);

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
              isPendingNext: false,
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
              isPendingNext: false,
              hasNext: true,
              hasPrevious: false,
            },
          ]);

          loadNext(1, {onComplete: callback});

          const paginationVariables = {
            id: '1',
            after: 'cursor:1',
            first: 1,
            before: null,
            last: null,
            isViewerFriendLocal: false,
            orderby: ['name'],
          };
          expectFragmentIsPendingOnPagination(renderer, direction, {
            data: initialUser,
            hasNext: true,
            hasPrevious: false,
            paginationVariables,
            gqlPaginationQuery,
          });
          expect(callback).toBeCalledTimes(0);
          expect(renderer.toJSON()).toEqual(null);

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
              isPendingNext: false,
              hasNext: true,
              hasPrevious: false,
            },
          ]);

          loadNext(1, {onComplete: callback});

          const paginationVariables = {
            id: '1',
            after: 'cursor:1',
            first: 1,
            before: null,
            last: null,
            isViewerFriendLocal: false,
            orderby: ['name'],
          };
          expectFragmentIsPendingOnPagination(renderer, direction, {
            data: initialUser,
            hasNext: true,
            hasPrevious: false,
            paginationVariables,
            gqlPaginationQuery,
          });
          expect(callback).toBeCalledTimes(0);
          expect(renderer.toJSON()).toEqual(null);

          setOwner({...query});

          // Assert that request is still in flight after re-rendering
          // with new fragment ref that points to the same data.
          expectRequestIsInFlight({
            inFlight: true,
            requestCount: 1,
            gqlPaginationQuery,
            paginationVariables,
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
              isPendingNext: true,
              hasNext: true,
              hasPrevious: false,
            },
            {
              data: expectedUser,
              isPendingNext: false,
              hasNext: true,
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
          expect(environment.execute).toBeCalledTimes(expected.requestCount);
          expect(
            environment.mock.isLoading(
              expected.gqlRefetchQuery ?? gqlPaginationQuery,
              expected.refetchVariables,
              {force: true},
            ),
          ).toEqual(expected.inFlight);
        }

        function expectFragmentSuspendedOnRefetch(
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
          assertYieldsWereCleared();

          TestRenderer.act(() => {
            // Wrap in act to ensure passive effects are run
            jest.runAllImmediates();
          });

          // Assert component suspended
          Scheduler.unstable_flushNumberOfYields(1);
          const actualYields = Scheduler.unstable_clearYields();
          expect(actualYields.length).toEqual(1);
          expect(actualYields[0]).toEqual('Fallback');
          expect(renderer.toJSON()).toEqual('Fallback');

          // Assert refetch query was fetched
          expectRefetchRequestIsInFlight({
            ...expected,
            inFlight: true,
            requestCount: 1,
          });

          // Assert query is tentatively retained while component is suspended
          expect(environment.retain).toBeCalledTimes(1);
          expect(environment.retain.mock.calls[0][0]).toEqual(
            expected.refetchQuery ?? paginationQuery,
          );
        }

        it('loads more items correctly after refetching', () => {
          const renderer = renderFragment();
          expectFragmentResults([
            {
              data: initialUser,
              isPendingNext: false,
              hasNext: true,
              hasPrevious: false,
            },
          ]);

          refetch({isViewerFriendLocal: true, orderby: ['lastname']});

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
          };
          paginationQuery = createOperationDescriptor(
            gqlPaginationQuery,
            refetchVariables,
          );
          expectFragmentSuspendedOnRefetch(renderer, {
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

          jest.runAllImmediates();
          expectFragmentResults([
            {
              data: expectedUser,
              isPendingNext: false,
              hasNext: true,
              hasPrevious: false,
            },
          ]);

          // Assert refetch query was retained
          expect(release).not.toBeCalled();
          expect(environment.retain).toBeCalledTimes(1);
          expect(environment.retain.mock.calls[0][0]).toEqual(paginationQuery);

          // Paginate after refetching
          environment.execute.mockClear();
          loadNext(1);

          const paginationVariables = {
            id: '1',
            after: 'cursor:100',
            first: 1,
            before: null,
            last: null,
            isViewerFriendLocal: true,
            orderby: ['lastname'],
          };
          expectFragmentIsPendingOnPagination(renderer, 'forward', {
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
              data: paginatedUser,
              // Assert pending flag is set back to false
              isPendingNext: false,
              hasNext: true,
              hasPrevious: false,
            },
          ]);
        });
      });
    });
  }
});

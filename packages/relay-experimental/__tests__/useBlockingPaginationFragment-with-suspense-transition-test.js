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
const {
  // $FlowFixMe unstable_withSuspenseConfig isn't in the public ReactDOM flow typing
  unstable_withSuspenseConfig,
  useCallback,
  useMemo,
  useState,
} = React;
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

function useSuspenseTransition(config: {|timeoutMs: number|}) {
  const [isPending, setPending] = useState(false);
  const startTransition = useCallback(
    (callback: () => void) => {
      setPending(true);
      Scheduler.unstable_next(() => {
        unstable_withSuspenseConfig(() => {
          setPending(false);
          callback();
        }, config);
      });
    },
    [config, setPending],
  );
  return [startTransition, isPending];
}

describe('useBlockingPaginationFragment with useSuspenseTransition', () => {
  if (React.version.startsWith('16')) {
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
    let renderSpy;
    let createMockEnvironment;
    let generateAndCompile;
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

    function useBlockingPaginationFragmentWithSuspenseTransition(
      fragmentNode,
      fragmentRef,
    ) {
      const [startTransition, isPendingNext] = useSuspenseTransition(
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
      renderSpy(data, result);
      return {data, ...result};
    }

    function assertCall(expected, idx) {
      const actualData = renderSpy.mock.calls[idx][0];
      const actualResult = renderSpy.mock.calls[idx][1];
      // $FlowFixMe
      const actualIsNextPending = actualResult.isPendingNext;
      const actualHasNext = actualResult.hasNext;
      const actualHasPrevious = actualResult.hasPrevious;

      expect(actualData).toEqual(expected.data);
      expect(actualIsNextPending).toEqual(expected.isPendingNext);
      expect(actualHasNext).toEqual(expected.hasNext);
      expect(actualHasPrevious).toEqual(expected.hasPrevious);
    }

    function expectFragmentResults(
      expectedCalls: $ReadOnlyArray<{|
        data: $FlowFixMe,
        isPendingNext: boolean,
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
      jest.mock('../ExecutionEnvironment', () => ({
        isServer: false,
      }));
      renderSpy = jest.fn();

      ({
        createMockEnvironment,
        generateAndCompile,
      } = require('relay-test-utils-internal'));

      // Set up environment and base data
      environment = createMockEnvironment({
        handlerProvider: () => ConnectionHandler,
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

    describe('pagination', () => {
      let runScheduledCallback = () => {};
      let release;

      beforeEach(() => {
        jest.resetModules();
        jest.doMock('scheduler', () => {
          const original = jest.requireActual('scheduler/unstable_mock');
          return {
            ...original,
            unstable_next: cb => {
              runScheduledCallback = () => {
                original.unstable_next(cb);
              };
            },
          };
        });

        release = jest.fn();
        environment.retain.mockImplementation((...args) => {
          return {
            dispose: release,
          };
        });
      });

      afterEach(() => {
        jest.dontMock('scheduler');
      });

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
        // Assert fragment sets isPending to true
        expect(renderSpy).toBeCalledTimes(1);
        assertCall(
          {
            data: expected.data,
            isPendingNext: direction === 'forward',
            hasNext: expected.hasNext,
            hasPrevious: expected.hasPrevious,
          },
          0,
        );
        renderSpy.mockClear();

        // $FlowFixMe(site=www) batchedUpdats is not part of the public Flow types
        // $FlowFixMe - error revealed when flow-typing ReactTestRenderer
        TestRenderer.unstable_batchedUpdates(() => {
          runScheduledCallback();
          jest.runAllImmediates();
        });
        Scheduler.unstable_flushExpired();

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

          TestRenderer.act(() => {
            loadNext(1, {onComplete: callback});
            jest.runAllTimers();
          });
          const paginationVariables = {
            id: '1',
            after: 'cursor:1',
            first: 1,
            before: null,
            last: null,
            isViewerFriendLocal: false,
            orderby: ['name'],
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
              isPendingNext: false,
              hasNext: true,
              hasPrevious: false,
            },
          ]);
          expect(callback).toBeCalledTimes(1);
        });

        it('renders pending flag correctly if pagination update is interrupted before it commits (unsuspends)', () => {
          const callback = jest.fn();
          const renderer = renderFragment({isConcurrent: true});
          expectFragmentResults([
            {
              data: initialUser,
              isPendingNext: false,
              hasNext: true,
              hasPrevious: false,
            },
          ]);

          TestRenderer.act(() => {
            loadNext(1, {onComplete: callback});
            Scheduler.unstable_flushAll();
            jest.runAllTimers();
          });

          expect(renderer.toJSON()).toEqual(null);

          const paginationVariables = {
            id: '1',
            after: 'cursor:1',
            first: 1,
            before: null,
            last: null,
            isViewerFriendLocal: false,
            orderby: ['name'],
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
              isPendingNext: false,
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
          };
          paginationQuery = createOperationDescriptor(
            gqlPaginationQuery,
            refetchVariables,
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
              isPendingNext: false,
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

          // Assert refetch query was retained
          expect(release).not.toBeCalled();
          expect(environment.retain).toBeCalledTimes(1);
          expect(environment.retain.mock.calls[0][0]).toEqual(paginationQuery);

          // Paginate after refetching
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

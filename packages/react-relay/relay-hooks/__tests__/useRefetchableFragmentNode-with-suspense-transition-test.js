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

import type {OperationDescriptor, Variables} from 'relay-runtime';

const useRefetchableFragmentNodeOriginal = require('../useRefetchableFragmentNode');
const React = require('react');
const ReactRelayContext = require('react-relay/ReactRelayContext');
const TestRenderer = require('react-test-renderer');
const {
  FRAGMENT_OWNER_KEY,
  FRAGMENTS_KEY,
  ID_KEY,
  Observable,
  createOperationDescriptor,
  getFragment,
  getRequest,
  graphql,
} = require('relay-runtime');
const {createMockEnvironment} = require('relay-test-utils');
const Scheduler = require('scheduler');

const {useLayoutEffect, useTransition, useMemo, useState} = React;

describe('useRefetchableFragmentNode with useTransition', () => {
  if (typeof React.useTransition !== 'function') {
    it('empty test to prevent Jest from failing', () => {
      // This suite is only useful with experimental React build
    });
  } else {
    let environment;
    let gqlQuery;
    let gqlRefetchQuery;
    let gqlFragment;
    let query;
    let refetchQuery;
    let variables;
    let renderPolicy;
    let renderFragment;
    let refetch;
    let forceUpdate;
    let Renderer;

    function useRefetchableFragmentNodeWithSuspenseTransition(
      fragmentNode,
      fragmentRef,
    ) {
      const [isPending, startTransition] = useTransition();
      const {fragmentData: data, ...result} =
        useRefetchableFragmentNodeOriginal(
          fragmentNode,
          fragmentRef,
          'TestComponent',
        );
      refetch = (...args) => {
        let disposable = {dispose: () => {}};
        startTransition(() => {
          disposable = result.refetch(...args);
        });
        return disposable;
      };

      useLayoutEffect(() => {
        Scheduler.unstable_yieldValue({data, isPending});
      });

      return {data, ...result};
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

    function assertYield(expected, actual) {
      expect(actual.isPending).toEqual(expected.isPending);
      expect(actual.data).toEqual(expected.data);
    }

    function expectFragmentResults(
      expectedYields: $ReadOnlyArray<{|
        data: $FlowFixMe,
        isPending: boolean,
      |}>,
    ) {
      assertYieldsWereCleared();
      Scheduler.unstable_flushAllWithoutAsserting();
      const actualYields = Scheduler.unstable_clearYields();
      expect(actualYields.length).toEqual(expectedYields.length);
      expectedYields.forEach((expected, idx) =>
        assertYield(expected, actualYields[idx]),
      );
    }

    function expectNoYields() {
      assertYieldsWereCleared();
      Scheduler.unstable_flushAllWithoutAsserting();
      const actualYields = Scheduler.unstable_clearYields();
      expect(actualYields.length).toEqual(0);
    }

    function expectRequestIsInFlight(
      expected,
      requestEnvironment = environment,
    ) {
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(requestEnvironment.executeWithSource).toBeCalledTimes(
        expected.requestCount,
      );
      expect(
        requestEnvironment.mock.isLoading(
          gqlRefetchQuery,
          expected.refetchVariables,
          {force: true},
        ),
      ).toEqual(expected.inFlight);
    }

    function expectFragmentIsPendingOnRefetch(
      renderer,
      expected: {|
        data: mixed,
        refetchQuery?: OperationDescriptor,
        refetchVariables: Variables,
      |},
    ) {
      // Assert fragment sets isPending to true
      expectFragmentResults([
        {
          data: expected.data,
          isPending: true,
        },
      ]);

      // Assert refetch query was fetched
      expectRequestIsInFlight({...expected, inFlight: true, requestCount: 1});

      // Assert query is retained by loadQuery and
      // tentatively retained while component is suspended
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.retain).toBeCalledTimes(2);
      // $FlowFixMe[method-unbinding] added when improving typing for this parameters
      expect(environment.retain.mock.calls[0][0]).toEqual(
        expected.refetchQuery ?? refetchQuery,
      );
    }

    function createFragmentRef(id, owner) {
      return {
        [ID_KEY]: id,
        [FRAGMENTS_KEY]: {
          useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment:
            {},
        },
        [FRAGMENT_OWNER_KEY]: owner.request,
        __isWithinUnmatchedTypeRefinement: false,
      };
    }

    beforeEach(() => {
      // Set up mocks
      jest.resetModules();
      jest.mock('warning');
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

      renderPolicy = 'partial';

      // Set up environment and base data
      environment = createMockEnvironment();

      graphql`
        fragment useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment on User {
          username
        }
      `;
      variables = {id: '1', scale: 16};
      gqlQuery = getRequest(graphql`
        query useRefetchableFragmentNodeWithSuspenseTransitionTestUserQuery(
          $id: ID!
          $scale: Float!
        ) {
          node(id: $id) {
            ...useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment
          }
        }
      `);
      gqlRefetchQuery = require('./__generated__/useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragmentRefetchQuery.graphql');
      gqlFragment = getFragment(graphql`
        fragment useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragment on User
        @refetchable(
          queryName: "useRefetchableFragmentNodeWithSuspenseTransitionTestUserFragmentRefetchQuery"
        ) {
          id
          name
          profile_picture(scale: $scale) {
            uri
          }
          ...useRefetchableFragmentNodeWithSuspenseTransitionTestNestedUserFragment
        }
      `);

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

      // Set up renderers
      Renderer = props => null;

      const Container = (props: {
        userRef?: {...},
        owner: $FlowFixMe,
        fragment: $FlowFixMe,
        ...
      }) => {
        // We need a render a component to run a Hook
        const owner = props.owner;
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
            __isWithinUnmatchedTypeRefinement: false,
          }),
          [owner, fragment.name],
        );
        const userRef = props.hasOwnProperty('userRef')
          ? props.userRef
          : artificialUserRef;

        forceUpdate = _setCount;

        const {data: userData} =
          useRefetchableFragmentNodeWithSuspenseTransition(fragment, userRef);
        return <Renderer user={userData} />;
      };

      const ContextProvider = ({children}) => {
        // TODO(T39494051) - We set empty variables in relay context to make
        // Flow happy, but useRefetchableFragmentNode does not use them, instead it uses
        // the variables from the fragment owner.
        const relayContext = useMemo(() => ({environment}), []);
        return (
          <ReactRelayContext.Provider value={relayContext}>
            {children}
          </ReactRelayContext.Provider>
        );
      };

      const Fallback = () => {
        useLayoutEffect(() => {
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
          <React.Suspense fallback={<Fallback />}>
            <ContextProvider>
              <Container owner={query} {...props} />
            </ContextProvider>
          </React.Suspense>,
          // $FlowFixMe[prop-missing] - error revealed when flow-typing ReactTestRenderer
          {unstable_isConcurrent: isConcurrent},
        );
      };
    });

    afterEach(() => {
      environment.mockClear();
      jest.dontMock('scheduler');
    });

    describe('refetch', () => {
      // Sanity check test, should already be tested in useRefetchableFragmentNode test
      it('refetches and sets pending state correctly', () => {
        const renderer = renderFragment();
        const initialUser = {
          id: '1',
          name: 'Alice',
          profile_picture: null,
          ...createFragmentRef('1', query),
        };
        expectFragmentResults([{data: initialUser, isPending: false}]);

        refetch({id: '4'});

        // Assert that fragment is refetching with the right variables and
        // suspends upon refetch
        const refetchVariables = {
          id: '4',
          scale: 16,
        };
        refetchQuery = createOperationDescriptor(
          gqlRefetchQuery,
          refetchVariables,
          {force: true},
        );
        expectFragmentIsPendingOnRefetch(renderer, {
          data: initialUser,
          refetchVariables,
        });
        expect(renderer.toJSON()).toEqual(null);

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
        jest.runAllImmediates();

        // Assert fragment is rendered with new data
        const refetchedUser = {
          id: '4',
          name: 'Mark',
          profile_picture: {
            uri: 'scale16',
          },
          ...createFragmentRef('4', refetchQuery),
        };
        expectFragmentResults([{data: refetchedUser, isPending: false}]);

        // Assert refetch query was retained by loadQuery and the component
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain).toBeCalledTimes(2);
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        expect(environment.retain.mock.calls[0][0]).toEqual(refetchQuery);
      });

      describe('multiple refetches', () => {
        let fetchSpy;
        beforeEach(() => {
          fetchSpy = jest.fn();
          const internalRuntime = require('relay-runtime').__internal;
          const originalFetchQueryDeduped = internalRuntime.fetchQueryDeduped;
          jest
            .spyOn(internalRuntime, 'fetchQueryDeduped')
            .mockImplementation((...args) => {
              const originalObservable = originalFetchQueryDeduped(...args);
              return Observable.create(sink => {
                fetchSpy(...args);
                const sub = originalObservable.subscribe(sink);
                return () => {
                  sub.unsubscribe();
                };
              });
            });
        });

        it('refetches correctly when a second refetch starts while the first is one suspended', () => {
          const renderer = renderFragment();
          const initialUser = {
            id: '1',
            name: 'Alice',
            profile_picture: null,
            ...createFragmentRef('1', query),
          };
          expectFragmentResults([{data: initialUser, isPending: false}]);

          refetch(
            {id: '2'},
            {
              fetchPolicy: 'network-only',
              UNSTABLE_renderPolicy: renderPolicy,
            },
          );

          // Assert request is started
          const refetchVariables1 = {id: '2', scale: 16};
          const refetchQuery1 = createOperationDescriptor(
            gqlRefetchQuery,
            refetchVariables1,
            {force: true},
          );

          // Assert we suspend on intial refetch request
          expectFragmentIsPendingOnRefetch(renderer, {
            data: initialUser,
            refetchQuery: refetchQuery1,
            refetchVariables: refetchVariables1,
          });

          // Call refetch a second time
          // $FlowFixMe[method-unbinding] added when improving typing for this parameters
          environment.executeWithSource.mockClear();
          const refetchVariables2 = {id: '4', scale: 16};
          const refetchQuery2 = createOperationDescriptor(
            gqlRefetchQuery,
            refetchVariables2,
            {force: true},
          );
          refetch(
            {id: '4'},
            {
              fetchPolicy: 'network-only',
              UNSTABLE_renderPolicy: renderPolicy,
            },
          );

          // Assert that no updates occur and both requests are in flight.
          // We are now in a pending state for the second refetch, and no
          // updates should occur.
          expectNoYields();
          expectRequestIsInFlight({
            data: initialUser,
            refetchQuery: refetchQuery1,
            refetchVariables: refetchVariables1,
            inFlight: true,
            requestCount: 1,
          });
          expectRequestIsInFlight({
            data: initialUser,
            refetchQuery: refetchQuery2,
            refetchVariables: refetchVariables2,
            inFlight: true,
            requestCount: 1,
          });

          // Mock response for initial refetch request
          environment.mock.resolve(refetchQuery1, {
            data: {
              node: {
                __typename: 'User',
                id: '2',
                name: 'User 2',
                profile_picture: {
                  uri: 'scale16',
                },
                username: 'user2',
              },
            },
          });
          jest.runAllImmediates();

          // Assert that we are still in a pending state even after
          // the first refetch completes
          expectNoYields();
          expectRequestIsInFlight({
            data: initialUser,
            refetchQuery: refetchQuery1,
            refetchVariables: refetchVariables1,
            inFlight: false,
            requestCount: 1,
          });
          expectRequestIsInFlight({
            data: initialUser,
            refetchQuery: refetchQuery2,
            refetchVariables: refetchVariables2,
            inFlight: true,
            requestCount: 1,
          });

          // Mock response for second refetch request
          environment.mock.resolve(refetchQuery2, {
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
          jest.runAllImmediates();

          // Assert component is rendered with data from second request
          const refetchedUser = {
            id: '4',
            name: 'Mark',
            profile_picture: {uri: 'scale16'},
            ...createFragmentRef('4', refetchQuery2),
          };
          expectFragmentResults([{data: refetchedUser, isPending: false}]);

          expect(fetchSpy).toBeCalledTimes(4);
        });

        it('does not re-issue initial refetch request if second refetch is interrupted by high-pri update', () => {
          const renderer = renderFragment();
          const initialUser = {
            id: '1',
            name: 'Alice',
            profile_picture: null,
            ...createFragmentRef('1', query),
          };
          expectFragmentResults([{data: initialUser, isPending: false}]);

          refetch(
            {id: '2'},
            {
              fetchPolicy: 'network-only',
              UNSTABLE_renderPolicy: renderPolicy,
            },
          );

          // Assert request is started
          const refetchVariables1 = {id: '2', scale: 16};
          const refetchQuery1 = createOperationDescriptor(
            gqlRefetchQuery,
            refetchVariables1,
            {force: true},
          );

          // Assert we suspend on intial refetch request
          expectFragmentIsPendingOnRefetch(renderer, {
            data: initialUser,
            refetchQuery: refetchQuery1,
            refetchVariables: refetchVariables1,
          });

          // Call refetch a second time
          // $FlowFixMe[method-unbinding] added when improving typing for this parameters
          environment.executeWithSource.mockClear();
          const refetchVariables2 = {id: '4', scale: 16};
          const refetchQuery2 = createOperationDescriptor(
            gqlRefetchQuery,
            refetchVariables2,
            {force: true},
          );
          refetch(
            {id: '4'},
            {
              fetchPolicy: 'network-only',
              UNSTABLE_renderPolicy: renderPolicy,
            },
          );

          // Assert that no updates occur. We are now in a pending state
          // for the second refetch, and no updates should occur.
          expectNoYields();
          expectRequestIsInFlight({
            data: initialUser,
            refetchQuery: refetchQuery1,
            refetchVariables: refetchVariables1,
            inFlight: true,
            requestCount: 1,
          });
          expectRequestIsInFlight({
            data: initialUser,
            refetchQuery: refetchQuery2,
            refetchVariables: refetchVariables2,
            inFlight: true,
            requestCount: 1,
          });

          // Schedule a high-pri update while the component is
          // suspended on pagination
          Scheduler.unstable_runWithPriority(
            Scheduler.unstable_UserBlockingPriority,
            () => {
              forceUpdate(prev => prev + 1);
            },
          );

          // Assert component updates due to hi-pri update
          expectFragmentResults([{data: initialUser, isPending: true}]);

          // Mock response for initial refetch request
          environment.mock.resolve(refetchQuery1, {
            data: {
              node: {
                __typename: 'User',
                id: '2',
                name: 'User 2',
                profile_picture: {
                  uri: 'scale16',
                },
                username: 'user2',
              },
            },
          });
          jest.runAllImmediates();

          // Assert that we are still in a pending state even after
          // the first refetch completes
          expectNoYields();
          expectRequestIsInFlight({
            data: initialUser,
            refetchQuery: refetchQuery1,
            refetchVariables: refetchVariables1,
            inFlight: false,
            requestCount: 1,
          });
          expectRequestIsInFlight({
            data: initialUser,
            refetchQuery: refetchQuery2,
            refetchVariables: refetchVariables2,
            inFlight: true,
            requestCount: 1,
          });

          // Mock response for second refetch request
          environment.mock.resolve(refetchQuery2, {
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
          jest.runAllImmediates();

          // Assert component is rendered with data from second request
          const refetchedUser = {
            id: '4',
            name: 'Mark',
            profile_picture: {uri: 'scale16'},
            ...createFragmentRef('4', refetchQuery2),
          };
          expectFragmentResults([{data: refetchedUser, isPending: false}]);

          expect(fetchSpy).toBeCalledTimes(4);
        });

        it('refetches correctly when switching between multiple refetches', () => {
          const renderer = renderFragment();
          const initialUser = {
            id: '1',
            name: 'Alice',
            profile_picture: null,
            ...createFragmentRef('1', query),
          };
          expectFragmentResults([{data: initialUser, isPending: false}]);

          refetch(
            {id: '2'},
            {
              fetchPolicy: 'network-only',
              UNSTABLE_renderPolicy: renderPolicy,
            },
          );

          // Assert request is started
          const refetchVariables1 = {id: '2', scale: 16};
          const refetchQuery1 = createOperationDescriptor(
            gqlRefetchQuery,
            refetchVariables1,
            {force: true},
          );

          // Assert we suspend on intial refetch request
          expectFragmentIsPendingOnRefetch(renderer, {
            data: initialUser,
            refetchQuery: refetchQuery1,
            refetchVariables: refetchVariables1,
          });

          // Call refetch a second time
          // $FlowFixMe[method-unbinding] added when improving typing for this parameters
          environment.executeWithSource.mockClear();
          const refetchVariables2 = {id: '4', scale: 16};
          const refetchQuery2 = createOperationDescriptor(
            gqlRefetchQuery,
            refetchVariables2,
          );
          refetch(
            {id: '4'},
            {
              fetchPolicy: 'network-only',
              UNSTABLE_renderPolicy: renderPolicy,
            },
          );

          // Assert that no updates occur and both requests are in flight.
          // We are now in a pending state for the second refetch, and no
          // updates should occur.
          expectNoYields();
          expectRequestIsInFlight({
            data: initialUser,
            refetchQuery: refetchQuery1,
            refetchVariables: refetchVariables1,
            inFlight: true,
            requestCount: 1,
          });
          expectRequestIsInFlight({
            data: initialUser,
            refetchQuery: refetchQuery2,
            refetchVariables: refetchVariables2,
            inFlight: true,
            requestCount: 1,
          });

          // Switch back to initial refetch, assert network
          // request doesn't fire again
          // $FlowFixMe[method-unbinding] added when improving typing for this parameters
          environment.executeWithSource.mockClear();
          refetch(
            {id: '2'},
            {
              fetchPolicy: 'network-only',
              UNSTABLE_renderPolicy: renderPolicy,
            },
          );

          // Assert that no updates occur and both requests are in flight.
          // We are now in a pending state for the second refetch, and no
          // updates should occur.
          expectNoYields();
          expectRequestIsInFlight({
            data: initialUser,
            refetchQuery: refetchQuery1,
            refetchVariables: refetchVariables1,
            inFlight: true,
            requestCount: 0,
          });
          expectRequestIsInFlight({
            data: initialUser,
            refetchQuery: refetchQuery2,
            refetchVariables: refetchVariables2,
            inFlight: true,
            requestCount: 0,
          });

          // Mock response for second refetch request
          environment.mock.resolve(refetchQuery2, {
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
          jest.runAllImmediates();

          // Assert that we are still in a pending state even after
          // the second refetch completes
          expectNoYields();
          expectRequestIsInFlight({
            data: initialUser,
            refetchQuery: refetchQuery1,
            refetchVariables: refetchVariables1,
            inFlight: true,
            requestCount: 0,
          });
          expectRequestIsInFlight({
            data: initialUser,
            refetchQuery: refetchQuery2,
            refetchVariables: refetchVariables2,
            inFlight: false,
            requestCount: 0,
          });

          // Mock response for initial refetch request
          environment.mock.resolve(refetchQuery1, {
            data: {
              node: {
                __typename: 'User',
                id: '2',
                name: 'User 2',
                profile_picture: {
                  uri: 'scale16',
                },
                username: 'user2',
              },
            },
          });
          jest.runAllImmediates();

          // Assert component is rendered with data from second request
          const refetchedUser = {
            id: '2',
            name: 'User 2',
            profile_picture: {uri: 'scale16'},
            ...createFragmentRef('2', refetchQuery1),
          };
          expectFragmentResults([{data: refetchedUser, isPending: false}]);

          expect(fetchSpy).toBeCalledTimes(5);
        });
      });
    });
  }
});

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall relay
 */

'use strict';

import type {RecordSourceProxy} from '../../../relay-runtime/store/RelayStoreTypes';
import type {
  useFragmentNodeTestUserFragment$data,
  useFragmentNodeTestUserFragment$fragmentType,
} from './__generated__/useFragmentNodeTestUserFragment.graphql';
import type {
  useFragmentNodeTestUsersFragment$data,
  useFragmentNodeTestUsersFragment$fragmentType,
} from './__generated__/useFragmentNodeTestUsersFragment.graphql';
import type {OperationDescriptor} from 'relay-runtime';
import type {Fragment} from 'relay-runtime/util/RelayRuntimeTypes';

const {act: internalAct} = require('../../jest-react');
const useFragmentInternal_REACT_CACHE = require('../react-cache/useFragmentInternal_REACT_CACHE');
const useFragmentNode_LEGACY = require('../useFragmentNode');
const React = require('react');
const ReactRelayContext = require('react-relay/ReactRelayContext');
const TestRenderer = require('react-test-renderer');
const {
  __internal: {fetchQuery},
  FRAGMENT_OWNER_KEY,
  FRAGMENTS_KEY,
  ID_KEY,
  RelayFeatureFlags,
  createOperationDescriptor,
  graphql,
} = require('relay-runtime');
const {
  createMockEnvironment,
  disallowWarnings,
  expectWarningWillFire,
} = require('relay-test-utils-internal');

disallowWarnings();
// TODO: T114709507 Add disallowConsoleErrors() with update to React 18.

const {useEffect, useMemo, useState} = React;

function assertYieldsWereCleared(_scheduler: any) {
  const actualYields = _scheduler.unstable_clearYields();
  if (actualYields.length !== 0) {
    throw new Error(
      'Log of yielded values is not empty. ' +
        'Call expect(Scheduler).toHaveYielded(...) first.',
    );
  }
}

function expectSchedulerToHaveYielded(expectedYields: any) {
  const Scheduler = require('scheduler');
  const actualYields = Scheduler.unstable_clearYields();
  expect(actualYields).toEqual(expectedYields);
}

function flushScheduler() {
  const Scheduler = require('scheduler');
  assertYieldsWereCleared(Scheduler);
  Scheduler.unstable_flushAllWithoutAsserting();
  return Scheduler.unstable_clearYields();
}

function expectSchedulerToFlushAndYield(expectedYields: any) {
  const actualYields = flushScheduler();
  expect(actualYields).toEqual(expectedYields);
}

function expectSchedulerToFlushAndYieldThrough(expectedYields: any) {
  const Scheduler = require('scheduler');
  assertYieldsWereCleared(Scheduler);
  Scheduler.unstable_flushNumberOfYields(expectedYields.length);
  const actualYields = Scheduler.unstable_clearYields();
  expect(actualYields).toEqual(expectedYields);
}

// The current tests are against useFragmentNode which as a different Flow signature
// than the external API useFragment. I want to keep the more accurate types
// for useFragmentInternal_REACT_CACHE, though, so this wrapper adapts it.
type ReturnType<TFragmentData: mixed> = {
  data: TFragmentData,
  disableStoreUpdates: () => void,
  enableStoreUpdates: () => void,
};
function useFragmentNode_REACT_CACHE<TFragmentData: mixed>(
  fragment:
    | Fragment<
        useFragmentNodeTestUserFragment$fragmentType,
        useFragmentNodeTestUserFragment$data,
      >
    | Fragment<
        useFragmentNodeTestUsersFragment$fragmentType,
        useFragmentNodeTestUsersFragment$data,
      >,
  key: any,
  displayName: string,
): ReturnType<TFragmentData> {
  const data = useFragmentInternal_REACT_CACHE(fragment, key, displayName);
  return {
    // $FlowFixMe[incompatible-return]
    data,
    disableStoreUpdates: () => {},
    enableStoreUpdates: () => {},
  };
}

describe.each([
  ['React Cache', useFragmentNode_REACT_CACHE],
  ['Legacy', useFragmentNode_LEGACY],
])(
  'useFragmentNode / useFragment (%s)',
  (_hookName, useFragmentNodeOriginal) => {
    let isUsingReactCacheImplementation;
    let originalReactCacheFeatureFlag;
    beforeEach(() => {
      isUsingReactCacheImplementation =
        useFragmentNodeOriginal === useFragmentNode_REACT_CACHE;
      originalReactCacheFeatureFlag = RelayFeatureFlags.USE_REACT_CACHE;
      RelayFeatureFlags.USE_REACT_CACHE = isUsingReactCacheImplementation;
    });
    afterEach(() => {
      RelayFeatureFlags.USE_REACT_CACHE = originalReactCacheFeatureFlag;
    });

    let environment;
    let disableStoreUpdates;
    let enableStoreUpdates;
    let gqlSingularQuery;
    let gqlSingularMissingDataQuery;
    let gqlSingularFragment;
    let gqlPluralQuery;
    let gqlPluralMissingDataQuery;
    let gqlPluralFragment;
    let singularQuery;
    let pluralQuery;
    let singularVariables;
    let pluralVariables;
    let setEnvironment;
    let setSingularOwner;
    let renderSingularFragment;
    let renderPluralFragment;
    let forceSingularUpdate;
    let commitSpy;
    let renderSpy;
    let SingularRenderer;
    let PluralRenderer;

    function useFragmentNode(
      fragmentNode:
        | Fragment<
            useFragmentNodeTestUserFragment$fragmentType,
            useFragmentNodeTestUserFragment$data,
          >
        | Fragment<
            useFragmentNodeTestUsersFragment$fragmentType,
            useFragmentNodeTestUsersFragment$data,
          >,
      fragmentRef: any,
    ) {
      const result = useFragmentNodeOriginal<any>(
        fragmentNode,
        fragmentRef,
        'TestDisplayName',
      );
      const {data} = result;
      disableStoreUpdates = result.disableStoreUpdates;
      enableStoreUpdates = result.enableStoreUpdates;
      useEffect(() => {
        commitSpy(data);
      });
      renderSpy(data);

      return [data];
    }

    function assertFragmentResults(
      expectedCalls: $ReadOnlyArray<{data: $FlowFixMe}>,
    ) {
      // the issue is that the initial miss-updates-on-subscribe thing is
      // only on the second runAllImmediates here.
      // This ensures that useEffect runs
      internalAct(() => jest.runAllImmediates());
      expect(commitSpy).toBeCalledTimes(expectedCalls.length);
      expectedCalls.forEach((expected, idx) => {
        const [actualData] = commitSpy.mock.calls[idx];
        expect(actualData).toEqual(expected.data);
      });
      commitSpy.mockClear();
    }

    /// Asserts that a single rendering *batch* occurred, with possibly multiple render
    /// calls and a single commit. `expectedCalls` describes the expected result as follows:
    /// * items 0..length-1 (for length > 1) are calls expected to be rendered, but not committed
    /// * item length-1 is expected to be rendered and committed
    function assertRenderBatch(
      expectedCalls: $ReadOnlyArray<{data: $FlowFixMe}>,
    ) {
      expect(expectedCalls.length >= 1).toBeTruthy(); // must expect at least one value

      // the issue is that the initial miss-updates-on-subscribe thing is
      // only on the second runAllImmediates here.
      // This ensures that useEffect runs
      internalAct(() => jest.runAllImmediates());
      expect(renderSpy).toBeCalledTimes(expectedCalls.length);
      expectedCalls.forEach((expected, idx) => {
        const [actualData] = renderSpy.mock.calls[idx];
        expect(actualData).toEqual(expected.data);
      });
      renderSpy.mockClear();

      expect(commitSpy).toBeCalledTimes(1);
      const [actualData] = commitSpy.mock.calls[0];
      expect(actualData).toEqual(expectedCalls[expectedCalls.length - 1].data);
      commitSpy.mockClear();
    }

    function createFragmentRef(id: string, owner: OperationDescriptor) {
      return {
        [ID_KEY]: id,
        [FRAGMENTS_KEY]: {
          useFragmentNodeTestNestedUserFragment: {},
        },
        [FRAGMENT_OWNER_KEY]: owner.request,
        __isWithinUnmatchedTypeRefinement: false,
      };
    }

    beforeEach(() => {
      jest.mock('scheduler', () => {
        return jest.requireActual('scheduler/unstable_mock');
      });
      commitSpy = jest.fn();
      renderSpy = jest.fn();

      // Set up environment and base data
      environment = createMockEnvironment();
      graphql`
        fragment useFragmentNodeTestNestedUserFragment on User {
          username
        }
      `;
      singularVariables = {id: '1', scale: 16};
      pluralVariables = {ids: ['1', '2'], scale: 16};
      gqlSingularQuery = graphql`
        query useFragmentNodeTestUserQuery($id: ID!, $scale: Float!) {
          node(id: $id) {
            ...useFragmentNodeTestUserFragment
          }
        }
      `;
      gqlSingularMissingDataQuery = graphql`
        query useFragmentNodeTestMissingDataQuery($id: ID!) {
          node(id: $id) {
            __typename
            id
          }
        }
      `;

      gqlPluralMissingDataQuery = graphql`
        query useFragmentNodeTestMissingDataPluralQuery($ids: [ID!]!) {
          nodes(ids: $ids) {
            __typename
            id
          }
        }
      `;

      gqlSingularFragment = graphql`
        fragment useFragmentNodeTestUserFragment on User {
          id
          name
          profile_picture(scale: $scale) {
            uri
          }
          ...useFragmentNodeTestNestedUserFragment
        }
      `;
      gqlPluralQuery = graphql`
        query useFragmentNodeTestUsersQuery($ids: [ID!]!, $scale: Float!) {
          nodes(ids: $ids) {
            ...useFragmentNodeTestUsersFragment
          }
        }
      `;
      gqlPluralFragment = graphql`
        fragment useFragmentNodeTestUsersFragment on User @relay(plural: true) {
          id
          name
          profile_picture(scale: $scale) {
            uri
          }
          ...useFragmentNodeTestNestedUserFragment
        }
      `;
      singularQuery = createOperationDescriptor(
        gqlSingularQuery,
        singularVariables,
      );
      pluralQuery = createOperationDescriptor(gqlPluralQuery, pluralVariables);
      environment.commitPayload(singularQuery, {
        node: {
          __typename: 'User',
          id: '1',
          name: 'Alice',
          username: 'useralice',
          profile_picture: null,
        },
      });
      environment.commitPayload(pluralQuery, {
        nodes: [
          {
            __typename: 'User',
            id: '1',
            name: 'Alice',
            username: 'useralice',
            profile_picture: null,
          },
          {
            __typename: 'User',
            id: '2',
            name: 'Bob',
            username: 'userbob',
            profile_picture: null,
          },
        ],
      });

      // Set up renderers
      SingularRenderer = (props: {user: any}) => null;
      PluralRenderer = (props: {users: any}) => null;

      const SingularContainer = (props: {
        userRef?: {...},
        owner: OperationDescriptor,
        ...
      }) => {
        // We need a render a component to run a Hook
        const [owner, _setOwner] = useState<OperationDescriptor>(props.owner);
        const [, setCount] = useState(0);
        const userRef = props.hasOwnProperty('userRef')
          ? props.userRef
          : {
              [ID_KEY]: owner.request.variables.id,
              [FRAGMENTS_KEY]: {
                useFragmentNodeTestUserFragment: {},
              },
              [FRAGMENT_OWNER_KEY]: owner.request,
              __isWithinUnmatchedTypeRefinement: false,
            };

        setSingularOwner = _setOwner;
        forceSingularUpdate = () => setCount(count => count + 1);

        const [userData] = useFragmentNode(gqlSingularFragment, userRef);
        return <SingularRenderer user={userData} />;
      };

      const PluralContainer = (props: {
        usersRef?: {...},
        owner: $FlowFixMe,
        ...
      }) => {
        // We need a render a component to run a Hook
        const owner = props.owner;
        const usersRef = props.hasOwnProperty('usersRef')
          ? props.usersRef
          : owner.request.variables.ids.map(id => ({
              [ID_KEY]: id,
              [FRAGMENTS_KEY]: {
                useFragmentNodeTestUsersFragment: {},
              },
              [FRAGMENT_OWNER_KEY]: owner.request,
              __isWithinUnmatchedTypeRefinement: false,
            }));

        const [usersData] = useFragmentNode(gqlPluralFragment, usersRef);
        return <PluralRenderer users={usersData} />;
      };

      const ContextProvider = ({children}: {children: React.Node}) => {
        const [env, _setEnv] = useState(environment);
        const relayContext = useMemo(() => ({environment: env}), [env]);

        setEnvironment = _setEnv;

        return (
          <ReactRelayContext.Provider value={relayContext}>
            {children}
          </ReactRelayContext.Provider>
        );
      };

      renderSingularFragment = (args?: {
        isConcurrent?: boolean,
        owner?: $FlowFixMe,
        userRef?: $FlowFixMe,
        ...
      }) => {
        const {isConcurrent = false, ...props} = args ?? {};
        return TestRenderer.create(
          <React.Suspense fallback="Singular Fallback">
            <ContextProvider>
              <SingularContainer owner={singularQuery} {...props} />
            </ContextProvider>
          </React.Suspense>,
          // $FlowFixMe[prop-missing] - error revealed when flow-typing ReactTestRenderer
          {
            unstable_isConcurrent: isConcurrent,
            unstable_concurrentUpdatesByDefault: true,
          },
        );
      };

      renderPluralFragment = (
        args?: {
          isConcurrent?: boolean,
          owner?: $FlowFixMe,
          usersRef?: $FlowFixMe,
          ...
        },
        existing: any,
      ) => {
        const {isConcurrent = false, ...props} = args ?? {};
        const elements = (
          <React.Suspense fallback="Plural Fallback">
            <ContextProvider>
              <PluralContainer owner={pluralQuery} {...props} />
            </ContextProvider>
          </React.Suspense>
        );
        if (existing) {
          existing.update(elements);
          return existing;
        } else {
          return TestRenderer.create(
            elements,
            // $FlowFixMe[prop-missing] - error revealed when flow-typing ReactTestRenderer
            {
              unstable_isConcurrent: isConcurrent,
              unstable_concurrentUpdatesByDefault: true,
            },
          );
        }
      };
    });

    afterEach(() => {
      internalAct(() => jest.runAllImmediates());
      flushScheduler();
      environment.mockClear();
      commitSpy.mockClear();
      renderSpy.mockClear();
    });

    it('should render singular fragment without error when data is available', () => {
      internalAct(() => {
        renderSingularFragment();
      });
      assertFragmentResults([
        {
          data: {
            id: '1',
            name: 'Alice',
            profile_picture: null,
            ...createFragmentRef('1', singularQuery),
          },
        },
      ]);
    });

    it('should render singular fragment without error when ref is null', () => {
      renderSingularFragment({userRef: null});
      assertFragmentResults([
        {
          data: null,
        },
      ]);
    });

    it('should render singular fragment without error when ref is undefined', () => {
      renderSingularFragment({userRef: undefined});
      assertFragmentResults([
        {
          data: null,
        },
      ]);
    });

    it('should render plural fragment without error when data is available', () => {
      renderPluralFragment();
      assertFragmentResults([
        {
          data: [
            {
              id: '1',
              name: 'Alice',
              profile_picture: null,
              ...createFragmentRef('1', pluralQuery),
            },
            {
              id: '2',
              name: 'Bob',
              profile_picture: null,
              ...createFragmentRef('2', pluralQuery),
            },
          ],
        },
      ]);
    });

    it('should render plural fragment without error when plural field is empty', () => {
      renderPluralFragment({usersRef: []});
      assertFragmentResults([
        {
          data: [],
        },
      ]);
    });

    it('should render plural fragment with a constant reference when plural field is empty', () => {
      const container = renderPluralFragment({usersRef: []});
      internalAct(() => {
        renderPluralFragment({usersRef: []}, container);
      });

      expect(commitSpy.mock.calls).toHaveLength(2);
      const [[firstRender], [secondRender]] = commitSpy.mock.calls;
      expect(firstRender).toBe(secondRender);
    });

    it('should update when fragment data changes', () => {
      renderSingularFragment();
      assertFragmentResults([
        {
          data: {
            id: '1',
            name: 'Alice',
            profile_picture: null,
            ...createFragmentRef('1', singularQuery),
          },
        },
      ]);

      internalAct(() => {
        environment.commitPayload(singularQuery, {
          node: {
            __typename: 'User',
            id: '1',
            // Update name
            name: 'Alice in Wonderland',
            username: null,
            profile_picture: null,
          },
        });
      });
      assertFragmentResults([
        {
          data: {
            id: '1',
            // Assert that name is updated
            name: 'Alice in Wonderland',
            profile_picture: null,
            ...createFragmentRef('1', singularQuery),
          },
        },
      ]);
    });

    it('should preserve object identity when fragment data changes', () => {
      internalAct(() => {
        renderSingularFragment();
      });
      expect(commitSpy).toBeCalledTimes(1);
      const prevData = commitSpy.mock.calls[0][0];
      expect(prevData).toEqual({
        id: '1',
        name: 'Alice',
        profile_picture: null,
        ...createFragmentRef('1', singularQuery),
      });
      commitSpy.mockClear();

      internalAct(() => {
        environment.commitPayload(singularQuery, {
          node: {
            __typename: 'User',
            id: '1',
            // Update name
            name: 'Alice in Wonderland',
            username: null,
            profile_picture: null,
          },
        });
      });
      expect(commitSpy).toBeCalledTimes(1);
      const nextData = commitSpy.mock.calls[0][0];
      expect(nextData).toEqual({
        id: '1',
        // Assert that name is updated
        name: 'Alice in Wonderland',
        profile_picture: null,
        ...createFragmentRef('1', singularQuery),
      });
      expect(nextData.__fragments).toBe(prevData.__fragments);
    });

    it('should re-read and resubscribe to fragment when environment changes', () => {
      renderSingularFragment();
      assertFragmentResults([
        {
          data: {
            id: '1',
            name: 'Alice',
            profile_picture: null,
            ...createFragmentRef('1', singularQuery),
          },
        },
      ]);

      const newEnvironment = createMockEnvironment();
      newEnvironment.commitPayload(singularQuery, {
        node: {
          __typename: 'User',
          id: '1',
          name: 'Alice in a different env',
          profile_picture: null,
          username: null,
        },
      });

      internalAct(() => {
        setEnvironment(newEnvironment);
      });

      const expectedUser = {
        id: '1',
        name: 'Alice in a different env',
        profile_picture: null,
        ...createFragmentRef('1', singularQuery),
      };
      assertFragmentResults([{data: expectedUser}]);

      internalAct(() => {
        newEnvironment.commitPayload(singularQuery, {
          node: {
            __typename: 'User',
            id: '1',
            // Update name
            name: 'Alice in Wonderland',
            username: null,
            profile_picture: null,
          },
        });
      });
      assertFragmentResults([
        {
          data: {
            id: '1',
            // Assert that name is updated
            name: 'Alice in Wonderland',
            profile_picture: null,
            ...createFragmentRef('1', singularQuery),
          },
        },
      ]);
    });

    it('should re-read and resubscribe to fragment when fragment pointers change', () => {
      renderSingularFragment();
      assertRenderBatch([
        {
          data: {
            id: '1',
            name: 'Alice',
            profile_picture: null,
            ...createFragmentRef('1', singularQuery),
          },
        },
      ]);

      const newVariables = {...singularVariables, id: '200'};
      const newQuery = createOperationDescriptor(
        gqlSingularQuery,
        newVariables,
      );
      environment.commitPayload(newQuery, {
        node: {
          __typename: 'User',
          id: '200',
          name: 'Foo',
          profile_picture: null,
          username: 'userfoo',
        },
      });

      TestRenderer.act(() => {
        environment.commitUpdate(store => {
          store.delete('1');
        });
        setSingularOwner(newQuery);
      });

      const expectedUser = {
        // Assert updated data
        id: '200',
        name: 'Foo',
        profile_picture: null,
        // Assert that ref now points to newQuery owner
        ...createFragmentRef('200', newQuery),
      };
      if (isUsingReactCacheImplementation) {
        // React Cache renders twice (because it has to update state for derived data),
        // but avoids rendering with stale data on the initial update
        assertRenderBatch([{data: expectedUser}, {data: expectedUser}]);
      } else {
        assertRenderBatch([{data: expectedUser}]);
      }

      TestRenderer.act(() => {
        environment.commitPayload(newQuery, {
          node: {
            __typename: 'User',
            id: '200',
            // Update name
            name: 'Foo Updated',
            profile_picture: null,
            username: 'userfoo',
          },
        });
      });
      assertRenderBatch([
        {
          data: {
            id: '200',
            // Assert that name is updated
            name: 'Foo Updated',
            profile_picture: null,
            ...createFragmentRef('200', newQuery),
          },
        },
      ]);
    });

    it('should render correct data when changing fragment refs multiple times', () => {
      // Render component with data for ID 1
      renderSingularFragment();
      assertFragmentResults([
        {
          data: {
            id: '1',
            name: 'Alice',
            profile_picture: null,
            ...createFragmentRef('1', singularQuery),
          },
        },
      ]);

      // Update fragment refs to render data for ID 200
      const newVariables = {...singularVariables, id: '200'};
      const newQuery = createOperationDescriptor(
        gqlSingularQuery,
        newVariables,
      );
      environment.commitPayload(newQuery, {
        node: {
          __typename: 'User',
          id: '200',
          name: 'Foo',
          username: 'userfoo',
          profile_picture: null,
        },
      });

      internalAct(() => {
        setSingularOwner(newQuery);
      });

      let expectedUser = {
        // Assert updated data
        id: '200',
        name: 'Foo',
        profile_picture: null,
        // Assert that ref now points to newQuery owner
        ...createFragmentRef('200', newQuery),
      };
      assertFragmentResults([{data: expectedUser}]);

      // Udpate data for ID 1
      environment.commitPayload(singularQuery, {
        node: {
          __typename: 'User',
          id: '1',
          // Update name
          name: 'Alice in Wonderland',
          username: 'userfoo',
          profile_picture: null,
        },
      });

      // Switch back to rendering data for ID 1
      internalAct(() => {
        setSingularOwner(singularQuery);
      });

      // We expect to see the latest data
      expectedUser = {
        // Assert updated data
        id: '1',
        name: 'Alice in Wonderland',
        profile_picture: null,
        // Assert that ref points to original singularQuery owner
        ...createFragmentRef('1', singularQuery),
      };
      assertFragmentResults([{data: expectedUser}]);

      // Assert it correctly subscribes to new data
      internalAct(() => {
        environment.commitPayload(singularQuery, {
          node: {
            __typename: 'User',
            id: '1',
            // Update name
            name: 'Alice Updated',
            username: 'userfoo',
            profile_picture: null,
          },
        });
      });
      assertFragmentResults([
        {
          data: {
            id: '1',
            // Assert anme is updated
            name: 'Alice Updated',
            profile_picture: null,
            ...createFragmentRef('1', singularQuery),
          },
        },
      ]);
    });

    it('should ignore updates to initially rendered data when fragment pointers change', () => {
      const Scheduler = require('scheduler');
      const YieldChild = (props: any) => {
        // NOTE the unstable_yield method will move to the static renderer.
        // When React sync runs we need to update this.
        Scheduler.unstable_yieldValue(props.children);
        return props.children;
      };
      const YieldyUserComponent = ({user}: any) => (
        <>
          <YieldChild>Hey user,</YieldChild>
          <YieldChild>{user.name}</YieldChild>
          <YieldChild>with id {user.id}!</YieldChild>
        </>
      );

      // Assert initial render
      // $FlowFixMe[incompatible-type]
      SingularRenderer = YieldyUserComponent;
      internalAct(() => {
        renderSingularFragment({isConcurrent: true});
      });
      expectSchedulerToHaveYielded([
        'Hey user,',
        'Alice',
        ['with id ', '1', '!'],
      ]);
      assertFragmentResults([
        {
          data: {
            id: '1',
            name: 'Alice',
            profile_picture: null,
            ...createFragmentRef('1', singularQuery),
          },
        },
      ]);

      const newVariables = {...singularVariables, id: '200'};
      const newQuery = createOperationDescriptor(
        gqlSingularQuery,
        newVariables,
      );
      internalAct(() => {
        environment.commitPayload(newQuery, {
          node: {
            __typename: 'User',
            id: '200',
            name: 'Foo',
            username: 'userfoo',
            profile_picture: null,
          },
        });
      });

      internalAct(() => {
        // Pass new fragment ref that points to new ID 200
        setSingularOwner(newQuery);

        // Flush some of the changes, but don't commit
        expectSchedulerToFlushAndYieldThrough(['Hey user,', 'Foo']);

        // Trigger an update for initially rendered data while second
        // render is in progress
        environment.commitPayload(singularQuery, {
          node: {
            __typename: 'User',
            id: '1',
            name: 'Alice in Wonderland',
            username: 'userfoo',
            profile_picture: null,
          },
        });

        // Assert the component renders the data from newQuery/newVariables,
        // ignoring any updates triggered while render was in progress.
        const expectedData = {
          data: {
            id: '200',
            name: 'Foo',
            profile_picture: null,
            ...createFragmentRef('200', newQuery),
          },
        };
        if (isUsingReactCacheImplementation) {
          // The new implementation simply finishes the render in progress.
          expectSchedulerToFlushAndYield([['with id ', '200', '!']]);
          assertFragmentResults([expectedData]);
        } else {
          // The old implementation also does an extra re-render.
          expectSchedulerToFlushAndYield([
            ['with id ', '200', '!'],
            'Hey user,',
            'Foo',
            ['with id ', '200', '!'],
          ]);
          assertFragmentResults([expectedData, expectedData]);
        }

        // Update latest rendered data
        environment.commitPayload(newQuery, {
          node: {
            __typename: 'User',
            id: '200',
            // Update name
            name: 'Foo Updated',
            username: 'userfoo',
            profile_picture: null,
          },
        });
        expectSchedulerToFlushAndYield([
          'Hey user,',
          'Foo Updated',
          ['with id ', '200', '!'],
        ]);
        assertFragmentResults([
          {
            data: {
              id: '200',
              // Assert name is updated
              name: 'Foo Updated',
              profile_picture: null,
              ...createFragmentRef('200', newQuery),
            },
          },
        ]);
      });
    });

    it('should re-read and resubscribe to fragment when variables change', () => {
      renderSingularFragment();
      assertFragmentResults([
        {
          data: {
            id: '1',
            name: 'Alice',
            profile_picture: null,
            ...createFragmentRef('1', singularQuery),
          },
        },
      ]);

      const newVariables = {...singularVariables, id: '1', scale: 32};
      const newQuery = createOperationDescriptor(
        gqlSingularQuery,
        newVariables,
      );
      environment.commitPayload(newQuery, {
        node: {
          __typename: 'User',
          id: '1',
          name: 'Alice',
          profile_picture: {
            uri: 'uri32',
          },
          username: 'useralice',
        },
      });

      internalAct(() => {
        setSingularOwner(newQuery);
      });

      const expectedUser = {
        id: '1',
        name: 'Alice',
        profile_picture: {
          // Asset updated uri
          uri: 'uri32',
        },
        // Assert that ref now points to newQuery owner
        ...createFragmentRef('1', newQuery),
      };
      assertFragmentResults([{data: expectedUser}]);

      internalAct(() => {
        environment.commitPayload(newQuery, {
          node: {
            __typename: 'User',
            id: '1',
            // Update name
            name: 'Alice in Wonderland',
            profile_picture: {
              uri: 'uri32',
            },
            username: 'useralice',
          },
        });
      });
      assertFragmentResults([
        {
          data: {
            id: '1',
            // Assert that name is updated
            name: 'Alice in Wonderland',
            profile_picture: {
              uri: 'uri32',
            },
            ...createFragmentRef('1', newQuery),
          },
        },
      ]);
    });

    it('should ignore updates to initially rendered data when variables change', () => {
      const Scheduler = require('scheduler');
      const YieldChild = (props: any) => {
        Scheduler.unstable_yieldValue(props.children);
        return props.children;
      };
      const YieldyUserComponent = ({user}: any) => (
        <>
          <YieldChild>Hey user,</YieldChild>
          <YieldChild>{user.profile_picture?.uri ?? 'no uri'}</YieldChild>
          <YieldChild>with id {user.id}!</YieldChild>
        </>
      );

      // Assert initial render
      // $FlowFixMe[incompatible-type]
      SingularRenderer = YieldyUserComponent;
      internalAct(() => {
        renderSingularFragment({isConcurrent: true});
      });
      expectSchedulerToHaveYielded([
        'Hey user,',
        'no uri',
        ['with id ', '1', '!'],
      ]);
      assertFragmentResults([
        {
          data: {
            id: '1',
            name: 'Alice',
            profile_picture: null,
            ...createFragmentRef('1', singularQuery),
          },
        },
      ]);

      const newVariables = {...singularVariables, id: '1', scale: 32};
      const newQuery = createOperationDescriptor(
        gqlSingularQuery,
        newVariables,
      );
      internalAct(() => {
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
      });

      internalAct(() => {
        // Pass new fragment ref which contains newVariables
        setSingularOwner(newQuery);

        // Flush some of the changes, but don't commit
        expectSchedulerToFlushAndYieldThrough(['Hey user,', 'uri32']);

        // Trigger an update for initially rendered data while second
        // render is in progress
        environment.commitPayload(singularQuery, {
          node: {
            __typename: 'User',
            id: '1',
            // Update name
            name: 'Alice',
            // Update profile_picture value
            profile_picture: {
              uri: 'uri16',
            },
            username: null,
          },
        });

        // Assert the component renders the data from newQuery/newVariables,
        // ignoring any updates triggered while render was in progress
        const expectedData = {
          data: {
            id: '1',
            name: 'Alice',
            profile_picture: {
              uri: 'uri32',
            },
            ...createFragmentRef('1', newQuery),
          },
        };
        if (isUsingReactCacheImplementation) {
          // The new implementation simply finishes the render in progress.
          expectSchedulerToFlushAndYield([['with id ', '1', '!']]);
          assertFragmentResults([expectedData]);
        } else {
          // The old implementation also does an extra re-render.
          expectSchedulerToFlushAndYield([
            ['with id ', '1', '!'],
            'Hey user,',
            'uri32',
            ['with id ', '1', '!'],
          ]);
          assertFragmentResults([expectedData, expectedData]);
        }

        // Update latest rendered data
        environment.commitPayload(newQuery, {
          node: {
            __typename: 'User',
            id: '1',
            // Update name
            name: 'Alice latest update',
            profile_picture: {
              uri: 'uri32',
            },
            username: null,
          },
        });
        expectSchedulerToFlushAndYield([
          'Hey user,',
          'uri32',
          ['with id ', '1', '!'],
        ]);
        assertFragmentResults([
          {
            data: {
              id: '1',
              // Assert name is updated
              name: 'Alice latest update',
              profile_picture: {
                uri: 'uri32',
              },
              ...createFragmentRef('1', newQuery),
            },
          },
        ]);
      });
    });

    it('should NOT update if fragment refs dont change', () => {
      renderSingularFragment();
      assertFragmentResults([
        {
          data: {
            id: '1',
            name: 'Alice',
            profile_picture: null,
            ...createFragmentRef('1', singularQuery),
          },
        },
      ]);

      // Force a re-render with the exact same fragment refs
      internalAct(() => {
        forceSingularUpdate();
      });

      assertFragmentResults([
        {
          data: {
            id: '1',
            name: 'Alice',
            profile_picture: null,
            ...createFragmentRef('1', singularQuery),
          },
        },
      ]);
    });

    it('should NOT update even if fragment ref changes but doesnt point to a different ID', () => {
      renderSingularFragment();
      assertFragmentResults([
        {
          data: {
            id: '1',
            name: 'Alice',
            profile_picture: null,
            ...createFragmentRef('1', singularQuery),
          },
        },
      ]);

      // Setting a new owner with the same query/variables will cause new
      // fragment refs that point to the same IDs to be passed
      const newOwner = createOperationDescriptor(
        gqlSingularQuery,
        singularVariables,
      );
      internalAct(() => {
        setSingularOwner(newOwner);
      });

      assertFragmentResults([
        {
          data: {
            id: '1',
            name: 'Alice',
            profile_picture: null,
            ...createFragmentRef('1', singularQuery),
          },
        },
      ]);
    });

    it('should throw a promise if if data is missing for fragment and request is in flight', () => {
      const missingDataVariables = {...singularVariables, id: '4'};
      const missingDataQuery = createOperationDescriptor(
        gqlSingularQuery,
        missingDataVariables,
      );
      // Commit a payload with name and profile_picture are missing
      environment.commitPayload(
        createOperationDescriptor(
          gqlSingularMissingDataQuery,
          missingDataVariables,
        ),
        {
          node: {
            __typename: 'User',
            id: '4',
          },
        },
      );

      // Make sure query is in flight
      fetchQuery(environment, missingDataQuery).subscribe({});

      const renderer = renderSingularFragment({owner: missingDataQuery});
      expect(renderer.toJSON()).toEqual('Singular Fallback');
    });

    it('should warn if fragment reference is non-null but read-out data is null', () => {
      // Clearing the data in the environment will make it so the fragment ref
      // we pass to useFragmentNode points to data that does not exist; we expect
      // an error to be thrown in this case.
      (environment.getStore().getSource(): $FlowFixMe).clear();

      expectWarningWillFire(
        "Relay: Expected to have been able to read non-null data for fragment `useFragmentNodeTestUserFragment` declared in `TestDisplayName`, since fragment reference was non-null. Make sure that that `TestDisplayName`'s parent isn't holding on to and/or passing a fragment reference for data that has been deleted.",
      );
      renderSingularFragment();
    });

    it('should NOT warn if plural fragment reference is non-null and empty', () => {
      // Commit a paylaod where the nodes are an empty list
      environment.commitPayload(pluralQuery, {
        nodes: [],
      });
      // Pass the updated fragment ref
      const usersRef = (environment.lookup(pluralQuery.fragment)
        .data: $FlowFixMe).nodes;
      renderPluralFragment({usersRef});
    });

    it('should warn if plural fragment reference is non-null but read-out data is null', () => {
      // Clearing the data in the environment will make it so the fragment ref
      // we pass to useFragmentNode points to data that does not exist; we expect
      // an error to be thrown in this case.
      (environment.getStore().getSource(): $FlowFixMe).clear();

      expectWarningWillFire(
        "Relay: Expected to have been able to read non-null data for fragment `useFragmentNodeTestUsersFragment` declared in `TestDisplayName`, since fragment reference was non-null. Make sure that that `TestDisplayName`'s parent isn't holding on to and/or passing a fragment reference for data that has been deleted.",
      );

      renderPluralFragment();
    });

    it('should subscribe for updates even if there is missing data', () => {
      const missingDataVariables = {...singularVariables, id: '4'};

      const singularDataQuery = createOperationDescriptor(
        gqlSingularQuery,
        missingDataVariables,
      );

      // Commit a payload where name is missing.
      environment.commitPayload(
        createOperationDescriptor(
          gqlSingularMissingDataQuery,
          missingDataVariables,
        ),
        {
          node: {
            __typename: 'User',
            id: '4',
          },
        },
      );

      renderSingularFragment({owner: singularDataQuery});

      // Assert render output with missing data
      assertFragmentResults([
        {
          data: {
            id: '4',
            name: undefined,
            profile_picture: undefined,
            ...createFragmentRef('4', singularDataQuery),
          },
        },
      ]);

      // Commit a payload with updated name.
      internalAct(() => {
        environment.commitPayload(singularDataQuery, {
          node: {
            __typename: 'User',
            id: '4',
            name: 'Mark',
            username: null,
            profile_picture: null,
          },
        });
      });

      // Assert render output with updated data
      assertFragmentResults([
        {
          data: {
            id: '4',
            name: 'Mark',
            profile_picture: null,
            ...createFragmentRef('4', singularDataQuery),
          },
        },
      ]);
    });

    it('upon commit, it should pick up changes in data that happened before comitting', () => {
      const Scheduler = require('scheduler');
      const YieldChild = (props: any) => {
        Scheduler.unstable_yieldValue(props.children);
        return props.children;
      };
      const YieldyUserComponent = ({user}: any) => {
        return (
          <>
            <YieldChild>Hey user,</YieldChild>
            <YieldChild>{user.profile_picture?.uri ?? 'no uri'}</YieldChild>
            <YieldChild>with id {user.id}!</YieldChild>
          </>
        );
      };

      // Assert initial render
      // $FlowFixMe[incompatible-type]
      SingularRenderer = YieldyUserComponent;
      internalAct(() => {
        renderSingularFragment({isConcurrent: true});

        // Flush some of the changes, but don't commit
        expectSchedulerToFlushAndYieldThrough(['Hey user,', 'no uri']);

        // Trigger an update while render is in progress
        environment.commitPayload(singularQuery, {
          node: {
            __typename: 'User',
            id: '1',
            name: 'Alice',
            // Update profile_picture value
            profile_picture: {
              uri: 'uri16',
            },
            username: null,
          },
        });

        // Assert the component renders the updated data
        expectSchedulerToFlushAndYield([
          ['with id ', '1', '!'],
          'Hey user,',
          'uri16',
          ['with id ', '1', '!'],
        ]);

        // We should have observed two commits: one with the original data
        // and one with the updated data:
        assertFragmentResults([
          {
            data: {
              id: '1',
              name: 'Alice',
              profile_picture: null,
              ...createFragmentRef('1', singularQuery),
            },
          },
          {
            data: {
              id: '1',
              name: 'Alice',
              profile_picture: {
                uri: 'uri16',
              },
              ...createFragmentRef('1', singularQuery),
            },
          },
        ]);

        // Update data again -- we should still be subscribed to further updates
        environment.commitPayload(singularQuery, {
          node: {
            __typename: 'User',
            id: '1',
            // Update name
            name: 'Alice latest update',
            profile_picture: {
              uri: 'uri16',
            },
            username: null,
          },
        });
        expectSchedulerToFlushAndYield([
          'Hey user,',
          'uri16',
          ['with id ', '1', '!'],
        ]);
        assertFragmentResults([
          {
            data: {
              id: '1',
              // Assert name is updated
              name: 'Alice latest update',
              profile_picture: {
                uri: 'uri16',
              },
              ...createFragmentRef('1', singularQuery),
            },
          },
        ]);
      });
    });

    it('should not suspend when data goes missing due to store changes after it has committed (starting with no data missing)', () => {
      const renderer = renderSingularFragment();
      internalAct(() => {
        // Let there be an operation in flight:
        fetchQuery(environment, singularQuery).subscribe({});
        // And let there be missing data:
        environment.commitUpdate(store => {
          store.get('1')?.setValue(undefined, 'name');
        });
      });
      // Nonetheless, once the component has mounted, it only suspends if the fragment ref changes,
      // not because of data being deleted from the store:
      expect(renderer.toJSON()).toEqual(null); // null means it rendered successfully and didn't suspend
    });

    it('should not suspend when data goes missing due to store changes after it has committed (starting with data missing already)', () => {
      const missingDataVariables = {...pluralVariables, ids: ['4']};
      const missingDataQuery = createOperationDescriptor(
        gqlPluralQuery,
        missingDataVariables,
      );
      environment.commitPayload(
        createOperationDescriptor(
          gqlPluralMissingDataQuery,
          missingDataVariables,
        ),
        {
          nodes: [
            {
              __typename: 'User',
              id: '4',
            },
          ],
        },
      );

      const renderer = renderPluralFragment({owner: missingDataQuery});

      internalAct(() => {
        // Let there be an operation in flight:
        fetchQuery(environment, missingDataQuery).subscribe({});
        // And let there be missing data:
        environment.commitUpdate(store => {
          store.get('4')?.setValue(undefined, 'name');
        });
      });
      // Nonetheless, once the component has mounted, it only suspends if the fragment ref changes,
      // not because of data being deleted from the store:
      expect(renderer.toJSON()).toEqual(null); // null means it rendered successfully and didn't suspend
    });

    it('checks for missed updates, subscribing to the latest snapshot even if fragment data is unchanged', () => {
      // Render the component, updating the store to simulate concurrent modifications during async render
      let pendingUpdate: any = null;
      const SideEffectfulComponent = ({user}: any) => {
        if (pendingUpdate) {
          environment.commitUpdate(pendingUpdate);
          pendingUpdate = null;
        }
        return user.id;
      };
      SingularRenderer = SideEffectfulComponent;

      // Render with profile_picture initially set to the default client record, with null uri
      environment.commitPayload(singularQuery, {
        node: {
          __typename: 'User',
          id: '1',
          name: 'Alice',
          profile_picture: {
            uri: null,
          },
          username: null,
        },
      });
      // But during render, update profile_picture to point to a different image, also with a
      // null uri. The fragment result does not change, but the set of ids to subscribe to changes
      pendingUpdate = (store: RecordSourceProxy) => {
        const userRecord = store.get('1');
        const picture = store.create('profile_picture_id', 'Image');
        picture.setValue(null, 'uri');
        userRecord?.setLinkedRecord(picture, 'profile_picture', {
          scale: singularVariables.scale,
        });
      };
      internalAct(() => {
        renderSingularFragment();
        jest.runAllTimers();
      });
      assertFragmentResults([
        {
          data: {
            id: '1',
            name: 'Alice',
            profile_picture: {
              uri: null,
            },
            ...createFragmentRef('1', singularQuery),
          },
        },
      ]);

      // Now update the new profile picture to set its uri to confirm that the component is
      // correctly subscribed to the changed profile picture relationship in the graph.
      internalAct(() => {
        environment.commitUpdate((store: RecordSourceProxy) => {
          const picture = store.get('profile_picture_id');
          picture?.setValue('uri16', 'uri');
        });
        jest.runAllTimers();
      });
      assertFragmentResults([
        {
          data: {
            id: '1',
            name: 'Alice',
            profile_picture: {
              uri: 'uri16', // updated from previous null value
            },
            ...createFragmentRef('1', singularQuery),
          },
        },
      ]);
    });

    it('should subscribe for updates to plural fragments even if there is missing data', () => {
      const missingDataVariables = {...pluralVariables, ids: ['4']};
      const missingDataQuery = createOperationDescriptor(
        gqlPluralQuery,
        missingDataVariables,
      );

      // Commit a payload where name is missing.
      environment.commitPayload(
        createOperationDescriptor(
          gqlPluralMissingDataQuery,
          missingDataVariables,
        ),
        {
          nodes: [
            {
              __typename: 'User',
              id: '4',
            },
          ],
        },
      );

      renderPluralFragment({owner: missingDataQuery});

      // Assert render output with missing data
      assertFragmentResults([
        {
          data: [
            {
              id: '4',
              name: undefined,
              profile_picture: undefined,
              ...createFragmentRef('4', missingDataQuery),
            },
          ],
        },
      ]);

      // Commit a payload with updated name.
      internalAct(() => {
        environment.commitPayload(missingDataQuery, {
          nodes: [
            {
              __typename: 'User',
              id: '4',
              name: 'Mark',
              profile_picture: null,
              username: null,
            },
          ],
        });
      });

      // Assert render output with updated data
      assertFragmentResults([
        {
          data: [
            {
              id: '4',
              name: 'Mark',
              profile_picture: null,
              ...createFragmentRef('4', missingDataQuery),
            },
          ],
        },
      ]);
    });

    if (useFragmentNodeOriginal === useFragmentNode_LEGACY) {
      describe('disableStoreUpdates', () => {
        it('does not listen to store updates after disableStoreUpdates is called', () => {
          internalAct(() => {
            renderSingularFragment();
          });
          assertFragmentResults([
            {
              data: {
                id: '1',
                name: 'Alice',
                profile_picture: null,
                ...createFragmentRef('1', singularQuery),
              },
            },
          ]);

          disableStoreUpdates();

          // Update data in the store
          internalAct(() =>
            environment.commitPayload(singularQuery, {
              node: {
                __typename: 'User',
                id: '1',
                name: 'Alice updated',
                profile_picture: null,
                username: null,
              },
            }),
          );

          // Assert that component did not re-render
          internalAct(() => {
            jest.runAllImmediates();
          });
          expect(commitSpy).toBeCalledTimes(0);
        });

        it('re-renders with latest data after re-enabling updates, if any updates were missed', () => {
          renderSingularFragment();
          assertFragmentResults([
            {
              data: {
                id: '1',
                name: 'Alice',
                profile_picture: null,
                ...createFragmentRef('1', singularQuery),
              },
            },
          ]);

          disableStoreUpdates();

          // Update data in the store
          environment.commitPayload(singularQuery, {
            node: {
              __typename: 'User',
              id: '1',
              name: 'Alice updated',
              profile_picture: null,
              username: null,
            },
          });

          // Assert that component did not re-render while updates are disabled
          internalAct(() => {
            jest.runAllImmediates();
          });
          expect(commitSpy).toBeCalledTimes(0);

          internalAct(() => {
            enableStoreUpdates();
          });

          // Assert that component re-renders with latest updated data
          assertFragmentResults([
            {
              data: {
                id: '1',
                name: 'Alice updated',
                profile_picture: null,
                ...createFragmentRef('1', singularQuery),
              },
            },
          ]);
        });

        it('does not re-render after re-enabling updates, if no updates were missed', () => {
          renderSingularFragment();
          assertFragmentResults([
            {
              data: {
                id: '1',
                name: 'Alice',
                profile_picture: null,
                ...createFragmentRef('1', singularQuery),
              },
            },
          ]);

          disableStoreUpdates();
          expect(commitSpy).toBeCalledTimes(0);

          enableStoreUpdates();

          // Assert that component did not re-render after enabling updates
          internalAct(() => jest.runAllImmediates());
          expect(commitSpy).toBeCalledTimes(0);
        });

        it('does not re-render after re-enabling updates, if data did not change', () => {
          renderSingularFragment();
          assertFragmentResults([
            {
              data: {
                id: '1',
                name: 'Alice',
                profile_picture: null,
                ...createFragmentRef('1', singularQuery),
              },
            },
          ]);

          disableStoreUpdates();

          environment.commitPayload(singularQuery, {
            node: {
              __typename: 'User',
              id: '1',
              name: 'Alice',
              profile_picture: null,
              username: null,
            },
          });

          internalAct(() => jest.runAllImmediates());
          expect(commitSpy).toBeCalledTimes(0);

          enableStoreUpdates();

          // Assert that component did not re-render after enabling updates
          internalAct(() => jest.runAllImmediates());
          expect(commitSpy).toBeCalledTimes(0);
        });
      });
    }
  },
);

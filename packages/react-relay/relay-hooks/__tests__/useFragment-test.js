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
import type {
  useFragmentTestUserFragment$data,
  useFragmentTestUserFragment$fragmentType,
} from './__generated__/useFragmentTestUserFragment.graphql';
import type {
  useFragmentTestUsersFragment$data,
  useFragmentTestUsersFragment$fragmentType,
} from './__generated__/useFragmentTestUsersFragment.graphql';
import type {OperationDescriptor} from 'relay-runtime/store/RelayStoreTypes';
import type {Fragment} from 'relay-runtime/util/RelayRuntimeTypes';

const useFragmentOriginal_REACT_CACHE = require('../react-cache/useFragment_REACT_CACHE');
const useFragmentOriginal_LEGACY = require('../useFragment');
const React = require('react');
const ReactRelayContext = require('react-relay/ReactRelayContext');
const TestRenderer = require('react-test-renderer');
const {
  FRAGMENT_OWNER_KEY,
  FRAGMENTS_KEY,
  ID_KEY,
  RelayFeatureFlags,
  createOperationDescriptor,
  graphql,
} = require('relay-runtime');
const {createMockEnvironment} = require('relay-test-utils');
const {
  disallowConsoleErrors,
  disallowWarnings,
} = require('relay-test-utils-internal');

disallowWarnings();
disallowConsoleErrors();

describe.each([
  ['React Cache', useFragmentOriginal_REACT_CACHE],
  ['Legacy', useFragmentOriginal_LEGACY],
])('useFragment (%s)', (_hookName, useFragmentOriginal) => {
  let originalReactCacheFeatureFlag;
  beforeEach(() => {
    originalReactCacheFeatureFlag = RelayFeatureFlags.USE_REACT_CACHE;
    RelayFeatureFlags.USE_REACT_CACHE =
      useFragmentOriginal === useFragmentOriginal_REACT_CACHE;
  });
  afterEach(() => {
    RelayFeatureFlags.USE_REACT_CACHE = originalReactCacheFeatureFlag;
  });

  let environment;
  let gqlSingularQuery;
  let gqlSingularFragment;
  let gqlPluralQuery;
  let gqlPluralFragment;
  let singularQuery;
  let pluralQuery;
  let singularVariables;
  let pluralVariables;
  let renderSingularFragment;
  let renderPluralFragment;
  let renderSpy;
  let SingularRenderer;
  let PluralRenderer;
  let ContextProvider;

  function useFragment(
    fragmentNode:
      | Fragment<
          useFragmentTestUserFragment$fragmentType,
          useFragmentTestUserFragment$data,
        >
      | Fragment<
          useFragmentTestUsersFragment$fragmentType,
          useFragmentTestUsersFragment$data,
        >,
    fragmentRef: any,
  ) {
    const data = useFragmentOriginal(fragmentNode, fragmentRef);
    renderSpy(data);
    return data;
  }

  function assertFragmentResults(expected: any) {
    // This ensures that useEffect runs
    jest.runAllImmediates();
    expect(renderSpy).toBeCalledTimes(1);
    const actualData = renderSpy.mock.calls[0][0];
    expect(actualData).toEqual(expected);
    renderSpy.mockClear();
  }

  function createFragmentRef(id: string, owner: OperationDescriptor) {
    return {
      [ID_KEY]: id,
      [FRAGMENTS_KEY]: {
        useFragmentTestNestedUserFragment: {},
      },
      [FRAGMENT_OWNER_KEY]: owner.request,
      __isWithinUnmatchedTypeRefinement: false,
    };
  }

  beforeEach(() => {
    renderSpy = jest.fn();

    // Set up environment and base data
    environment = createMockEnvironment();
    graphql`
      fragment useFragmentTestNestedUserFragment on User {
        username
      }
    `;
    singularVariables = {id: '1'};
    pluralVariables = {ids: ['1', '2']};
    gqlSingularQuery = graphql`
      query useFragmentTestUserQuery($id: ID!) {
        node(id: $id) {
          ...useFragmentTestUserFragment
        }
      }
    `;
    gqlSingularFragment = graphql`
      fragment useFragmentTestUserFragment on User {
        id
        name
        ...useFragmentTestNestedUserFragment
      }
    `;
    gqlPluralQuery = graphql`
      query useFragmentTestUsersQuery($ids: [ID!]!) {
        nodes(ids: $ids) {
          ...useFragmentTestUsersFragment
        }
      }
    `;
    gqlPluralFragment = graphql`
      fragment useFragmentTestUsersFragment on User @relay(plural: true) {
        id
        name
        ...useFragmentTestNestedUserFragment
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
    SingularRenderer = (props: {
      user: ?(
        | useFragmentTestUserFragment$data
        | useFragmentTestUsersFragment$data
      ),
    }) => null;
    PluralRenderer = (props: {
      users: ?(
        | useFragmentTestUserFragment$data
        | useFragmentTestUsersFragment$data
      ),
    }) => null;
    const SingularContainer = (props: {
      userRef?: {$data?: {...}, ...},
      owner: $FlowFixMe,
      ...
    }) => {
      // We need a render a component to run a Hook
      const owner = props.owner;
      const userRef = props.hasOwnProperty('userRef')
        ? props.userRef
        : {
            [ID_KEY]: owner.request.variables.id,
            [FRAGMENTS_KEY]: {
              useFragmentTestUserFragment: {},
            },
            [FRAGMENT_OWNER_KEY]: owner.request,
          };
      const userData = useFragment(gqlSingularFragment, userRef);
      return <SingularRenderer user={userData} />;
    };

    const PluralContainer = (props: {
      usersRef?: $ReadOnlyArray<{$data?: {...}, ...}>,
      owner: $FlowFixMe,
      ...
    }) => {
      const owner = props.owner;
      const usersRef = props.hasOwnProperty('usersRef')
        ? props.usersRef
        : owner.request.variables.ids.map(id => ({
            [ID_KEY]: id,
            [FRAGMENTS_KEY]: {
              useFragmentTestUsersFragment: {},
            },
            [FRAGMENT_OWNER_KEY]: owner.request,
          }));

      const usersData = useFragment(gqlPluralFragment, usersRef);
      return <PluralRenderer users={usersData} />;
    };

    const relayContext = {environment};
    ContextProvider = ({children}: {children: React.Node}) => {
      return (
        <ReactRelayContext.Provider value={relayContext}>
          {children}
        </ReactRelayContext.Provider>
      );
    };

    renderSingularFragment = (
      props?: {
        owner?: $FlowFixMe,
        userRef?: $FlowFixMe,
        ...
      },
      existing: $FlowFixMe,
    ) => {
      const elements = (
        <React.Suspense fallback="Singular Fallback">
          <ContextProvider>
            <SingularContainer owner={singularQuery} {...props} />
          </ContextProvider>
        </React.Suspense>
      );
      if (existing) {
        existing.update(elements);
        return existing;
      } else {
        return TestRenderer.create(elements);
      }
    };

    renderPluralFragment = (
      props?: {
        owner?: $FlowFixMe,
        userRef?: $FlowFixMe,
        ...
      },
      existing: $FlowFixMe,
    ) => {
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
        return TestRenderer.create(elements);
      }
    };
  });

  afterEach(() => {
    environment.mockClear();
    renderSpy.mockClear();
  });

  it('should render singular fragment without error when data is available', () => {
    renderSingularFragment();
    assertFragmentResults({
      id: '1',
      name: 'Alice',
      ...createFragmentRef('1', singularQuery),
    });
  });

  it('should return the same data object if rendered multiple times: singular fragment', () => {
    const container = renderSingularFragment();
    expect(renderSpy).toBeCalledTimes(1);
    const actualData = renderSpy.mock.calls[0][0];
    renderSingularFragment({}, container);
    expect(renderSpy).toBeCalledTimes(2);
    const actualData2 = renderSpy.mock.calls[1][0];
    expect(actualData).toBe(actualData2);
  });

  it('should render plural fragment without error when data is available', () => {
    renderPluralFragment();
    assertFragmentResults([
      {
        id: '1',
        name: 'Alice',
        ...createFragmentRef('1', pluralQuery),
      },
      {
        id: '2',
        name: 'Bob',
        ...createFragmentRef('2', pluralQuery),
      },
    ]);
  });

  it('should return the same data object if rendered multiple times: plural fragment', () => {
    const container = renderPluralFragment();
    expect(renderSpy).toBeCalledTimes(1);
    const actualData = renderSpy.mock.calls[0][0];
    renderPluralFragment({}, container);
    expect(renderSpy).toBeCalledTimes(2);
    const actualData2 = renderSpy.mock.calls[1][0];
    expect(actualData).toBe(actualData2);
  });

  it('Returns [] when the fragment ref is [] (for plural fragments)', () => {
    const container = renderPluralFragment({usersRef: []});
    assertFragmentResults([]);
    container.unmount();
  });

  it('Returns null when the fragment ref is null (for plural fragments)', () => {
    const container = renderPluralFragment({usersRef: null});
    assertFragmentResults(null);
    container.unmount();
  });
});

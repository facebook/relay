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

const useFragmentOriginal = require('../useFragment');
const React = require('react');
const ReactRelayContext = require('react-relay/ReactRelayContext');
const TestRenderer = require('react-test-renderer');
const {
  FRAGMENT_OWNER_KEY,
  FRAGMENTS_KEY,
  ID_KEY,
  createOperationDescriptor,
  getFragment,
  getRequest,
  graphql,
} = require('relay-runtime');
const {createMockEnvironment} = require('relay-test-utils');

describe('useFragment', () => {
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

  function useFragment(fragmentNode, fragmentRef) {
    // $FlowFixMe[incompatible-call] non-generated fragmentRef is disallowd
    const data = useFragmentOriginal(fragmentNode, fragmentRef);
    renderSpy(data);
    return data;
  }

  function assertFragmentResults(expected) {
    // This ensures that useEffect runs
    jest.runAllImmediates();
    expect(renderSpy).toBeCalledTimes(1);
    const actualData = renderSpy.mock.calls[0][0];
    expect(actualData).toEqual(expected);
    renderSpy.mockClear();
  }

  function createFragmentRef(id, owner) {
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
    // Set up mocks
    jest.resetModules();
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
    gqlSingularQuery = getRequest(graphql`
      query useFragmentTestUserQuery($id: ID!) {
        node(id: $id) {
          ...useFragmentTestUserFragment
        }
      }
    `);
    gqlSingularFragment = getFragment(graphql`
      fragment useFragmentTestUserFragment on User {
        id
        name
        ...useFragmentTestNestedUserFragment
      }
    `);
    gqlPluralQuery = getRequest(graphql`
      query useFragmentTestUsersQuery($ids: [ID!]!) {
        nodes(ids: $ids) {
          ...useFragmentTestUsersFragment
        }
      }
    `);
    gqlPluralFragment = getFragment(graphql`
      fragment useFragmentTestUsersFragment on User @relay(plural: true) {
        id
        name
        ...useFragmentTestNestedUserFragment
      }
    `);
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
    SingularRenderer = props => null;
    PluralRenderer = props => null;
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
      // We need a render a component to run a Hook
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
    ContextProvider = ({children}) => {
      return (
        <ReactRelayContext.Provider value={relayContext}>
          {children}
        </ReactRelayContext.Provider>
      );
    };

    renderSingularFragment = (props?: {
      owner?: $FlowFixMe,
      userRef?: $FlowFixMe,
      ...
    }) => {
      return TestRenderer.create(
        <React.Suspense fallback="Singular Fallback">
          <ContextProvider>
            <SingularContainer owner={singularQuery} {...props} />
          </ContextProvider>
        </React.Suspense>,
      );
    };

    renderPluralFragment = (props?: {
      owner?: $FlowFixMe,
      userRef?: $FlowFixMe,
      ...
    }) => {
      return TestRenderer.create(
        <React.Suspense fallback="Plural Fallback">
          <ContextProvider>
            <PluralContainer owner={pluralQuery} {...props} />
          </ContextProvider>
        </React.Suspense>,
      );
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
    renderSingularFragment();
    expect(renderSpy).toBeCalledTimes(1);
    const actualData = renderSpy.mock.calls[0][0];
    renderSingularFragment();
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
    renderPluralFragment();
    expect(renderSpy).toBeCalledTimes(1);
    const actualData = renderSpy.mock.calls[0][0];
    renderPluralFragment();
    expect(renderSpy).toBeCalledTimes(2);
    const actualData2 = renderSpy.mock.calls[1][0];
    expect(actualData).toBe(actualData2);
  });
});

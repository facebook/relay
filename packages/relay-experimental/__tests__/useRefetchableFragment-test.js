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
const {useMemo} = React;
const TestRenderer = require('react-test-renderer');

const invariant = require('invariant');
const useRefetchableFragmentOriginal = require('../useRefetchableFragment');
const ReactRelayContext = require('react-relay/ReactRelayContext');
const {
  FRAGMENT_OWNER_KEY,
  FRAGMENTS_KEY,
  ID_KEY,
  createOperationDescriptor,
} = require('relay-runtime');

describe('useRefetchableFragment', () => {
  let environment;
  let gqlQuery;
  let gqlRefetchQuery;
  let gqlFragment;
  let createMockEnvironment;
  let generateAndCompile;
  let query;
  let variables;
  let renderFragment;
  let renderSpy;
  let Renderer;

  function useRefetchableFragment(fragmentNode, fragmentRef) {
    const [data, refetch] = useRefetchableFragmentOriginal(
      fragmentNode,
      fragmentRef,
    );
    renderSpy(data, refetch);
    return [data, refetch];
  }

  function assertCall(expected, idx) {
    const actualData = renderSpy.mock.calls[idx][0];

    expect(actualData).toEqual(expected.data);
  }

  function assertFragmentResults(
    expectedCalls: $ReadOnlyArray<{|data: $FlowFixMe|}>,
  ) {
    // This ensures that useEffect runs
    TestRenderer.act(() => jest.runAllImmediates());
    expect(renderSpy).toBeCalledTimes(expectedCalls.length);
    expectedCalls.forEach((expected, idx) => assertCall(expected, idx));
    renderSpy.mockClear();
  }

  function expectFragmentResults(expectedCalls) {
    assertFragmentResults(expectedCalls);
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
    renderSpy = jest.fn();

    const {
      createMockEnvironment,
      generateAndCompile,
    } = require('relay-test-utils-internal');

    // Set up environment and base data
    environment = createMockEnvironment();
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

        query UserQuery($id: ID!, $scale: Int!) {
          node(id: $id) {
            ...UserFragment
          }
        }
    `,
    );
    variables = {id: '1', scale: 16};
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

    const Container = (props: {userRef?: {...}, fragment: $FlowFixMe, ...}) => {
      // We need a render a component to run a Hook
      const artificialUserRef = useMemo(
        () => ({
          [ID_KEY]:
            query.request.variables.id ?? query.request.variables.nodeID,
          [FRAGMENTS_KEY]: {
            [gqlFragment.name]: {},
          },
          [FRAGMENT_OWNER_KEY]: query.request,
        }),
        [],
      );

      const [userData] = useRefetchableFragment(gqlFragment, artificialUserRef);
      return <Renderer user={userData} />;
    };

    const ContextProvider = ({children}) => {
      const relayContext = useMemo(() => ({environment}), []);

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
    }) => {
      const {isConcurrent = false, ...props} = args ?? {};
      return TestRenderer.create(
        <React.Suspense fallback="Fallback">
          <ContextProvider>
            <Container owner={query} {...props} />
          </ContextProvider>
        </React.Suspense>,
        {unstable_isConcurrent: isConcurrent},
      );
    };
  });

  afterEach(() => {
    environment.mockClear();
    renderSpy.mockClear();
  });

  // This test is only a sanity check for useRefetchableFragment as a wrapper
  // around useRefetchableFragmentNode.
  // See full test behavior in useRefetchableFragmentNode-test.
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
});

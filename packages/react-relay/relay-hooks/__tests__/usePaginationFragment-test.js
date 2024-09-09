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

import type {Sink} from '../../../relay-runtime/network/RelayObservable';
import type {RequestParameters} from '../../../relay-runtime/util/RelayConcreteNode';
import type {CacheConfig} from '../../../relay-runtime/util/RelayRuntimeTypes';
import type {
  usePaginationFragmentTestStoryFragmentRefetchQuery$data,
  usePaginationFragmentTestStoryFragmentRefetchQuery$variables,
} from './__generated__/usePaginationFragmentTestStoryFragmentRefetchQuery.graphql';
import type {
  usePaginationFragmentTestStoryQuery$data,
  usePaginationFragmentTestStoryQuery$variables,
} from './__generated__/usePaginationFragmentTestStoryQuery.graphql';
import type {
  usePaginationFragmentTestUserFragmentPaginationQuery$data,
  usePaginationFragmentTestUserFragmentPaginationQuery$variables,
} from './__generated__/usePaginationFragmentTestUserFragmentPaginationQuery.graphql';
import type {
  usePaginationFragmentTestUserQuery$data,
  usePaginationFragmentTestUserQuery$variables,
} from './__generated__/usePaginationFragmentTestUserQuery.graphql';
import type {Direction, OperationDescriptor, Variables} from 'relay-runtime';
import type {Query} from 'relay-runtime/util/RelayRuntimeTypes';

const usePaginationFragmentImpl = require('../usePaginationFragment');
const areEqual = require('areEqual');
const invariant = require('invariant');
const React = require('react');
const ReactRelayContext = require('react-relay/ReactRelayContext');
const TestRenderer = require('react-test-renderer');
const {
  __internal: {fetchQuery},
  ConnectionHandler,
  Environment,
  FRAGMENT_OWNER_KEY,
  FRAGMENTS_KEY,
  ID_KEY,
  Network,
  Observable,
  RecordSource,
  Store,
  createOperationDescriptor,
  graphql,
} = require('relay-runtime');

const {useMemo, useState} = React;

let environment;
let initialUser;
let gqlQuery:
  | Query<
      usePaginationFragmentTestStoryQuery$variables,
      usePaginationFragmentTestStoryQuery$data,
    >
  | Query<
      usePaginationFragmentTestUserQuery$variables,
      usePaginationFragmentTestUserQuery$data,
    >;
let gqlQueryNestedFragment;
let gqlQueryWithoutID;
let gqlQueryWithLiteralArgs;
let gqlQueryWithStreaming;
let gqlPaginationQuery:
  | Query<
      usePaginationFragmentTestStoryFragmentRefetchQuery$variables,
      usePaginationFragmentTestStoryFragmentRefetchQuery$data,
    >
  | Query<
      usePaginationFragmentTestUserFragmentPaginationQuery$variables,
      usePaginationFragmentTestUserFragmentPaginationQuery$data,
    >;
let gqlFragment;
let gqlFragmentWithStreaming;
let query;
let queryNestedFragment;
let queryWithoutID;
let queryWithLiteralArgs;
let queryWithStreaming;
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
let Renderer;
let fetch;
let dataSource;
let unsubscribe;

class ErrorBoundary extends React.Component<any, any> {
  state: {error: ?Error} = {error: null};
  componentDidCatch(error: Error) {
    this.setState({error});
  }
  render(): React.Node {
    const {children, fallback: Fallback} = this.props;
    const {error} = this.state;
    if (error) {
      return <Fallback error={error} />;
    }
    return children;
  }
}

hook usePaginationFragment(fragmentNode: any, fragmentRef: any) {
  /* $FlowFixMe[underconstrained-implicit-instantiation] error found when
   * enabling Flow LTI mode */
  const {data, ...result} = usePaginationFragmentImpl(
    fragmentNode,
    fragmentRef,
  );
  loadNext = result.loadNext;
  refetch = result.refetch;
  renderSpy(data, result);
  return {data, ...result};
}

function assertCall(
  expected: {
    data: any,
    hasNext: boolean,
    hasPrevious: boolean,
    isLoadingNext: boolean,
    isLoadingPrevious: boolean,
  },
  idx: number,
) {
  const actualData = renderSpy.mock.calls[idx][0];
  const actualResult = renderSpy.mock.calls[idx][1];
  const actualIsLoadingNext = actualResult.isLoadingNext;
  const actualIsLoadingPrevious = actualResult.isLoadingPrevious;
  const actualHasNext = actualResult.hasNext;
  const actualHasPrevious = actualResult.hasPrevious;

  expect(actualData).toEqual(expected.data);
  expect(actualIsLoadingNext).toEqual(expected.isLoadingNext);
  expect(actualIsLoadingPrevious).toEqual(expected.isLoadingPrevious);
  expect(actualHasNext).toEqual(expected.hasNext);
  expect(actualHasPrevious).toEqual(expected.hasPrevious);
}

function expectFragmentResults(
  expectedCalls: $ReadOnlyArray<{
    data: $FlowFixMe,
    isLoadingNext: boolean,
    isLoadingPrevious: boolean,
    hasNext: boolean,
    hasPrevious: boolean,
  }>,
) {
  // This ensures that useEffect runs
  TestRenderer.act(() => jest.runAllImmediates());
  expect(renderSpy).toBeCalledTimes(expectedCalls.length);
  expectedCalls.forEach((expected, idx) => assertCall(expected, idx));
  renderSpy.mockClear();
}

function resolveQuery(payload: mixed) {
  TestRenderer.act(() => {
    dataSource.next(payload);
  });

  TestRenderer.act(() => {
    dataSource.complete();
  });
}

function createFragmentRef(
  id:
    | $TEMPORARY$string<'node:1'>
    | $TEMPORARY$string<'node:100'>
    | $TEMPORARY$string<'node:2'>
    | $TEMPORARY$string<'node:200'>,
  owner: OperationDescriptor,
  fragmentName: string = 'usePaginationFragmentTestNestedUserFragment',
) {
  return {
    [ID_KEY]: id,
    [FRAGMENTS_KEY]: {
      [fragmentName]: {},
    },
    [FRAGMENT_OWNER_KEY]: owner.request,
  };
}

function createMockEnvironment() {
  const source = RecordSource.create();
  const store = new Store(source);
  const fetchFn = jest.fn(
    (
      _query: RequestParameters,
      _variables: Variables,
      _cacheConfig: CacheConfig,
    ) => {
      return Observable.create((sink: Sink<mixed>) => {
        dataSource = sink;
        unsubscribe = jest.fn<[], mixed>();
        // $FlowFixMe[incompatible-call]
        return unsubscribe;
      });
    },
  );
  const environment = new Environment({
    getDataID: (data: {[string]: mixed}, typename: string) => {
      // This is the default, but making it explicit in case we need to override
      return data.id;
    },
    // $FlowFixMe[invalid-tuple-arity] Error found while enabling LTI on this file
    // $FlowFixMe[incompatible-call] error found when enabling Flow LTI mode
    network: Network.create(fetchFn),
    store,
    handlerProvider: _name => {
      return ConnectionHandler;
    },
  });
  // $FlowFixMe[method-unbinding]
  const originalRetain = environment.retain;
  // $FlowFixMe[cannot-write]
  environment.retain = jest.fn((...args: any) =>
    originalRetain.apply(environment, args),
  );
  return [environment, fetchFn];
}

beforeEach(() => {
  // Set up mocks
  jest.spyOn(console, 'warn').mockImplementationOnce(() => {});
  jest.mock('warning');
  /* $FlowFixMe[underconstrained-implicit-instantiation] error found when
   * enabling Flow LTI mode */
  renderSpy = jest.fn<_, mixed>();
  // Set up environment and base data
  [environment, fetch] = createMockEnvironment();

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
  graphql`
    fragment usePaginationFragmentTestNestedUserFragment on User {
      username
    }
  `;

  gqlQuery = graphql`
    query usePaginationFragmentTestUserQuery(
      $id: ID!
      $after: ID
      $first: Int
      $before: ID
      $last: Int
      $orderby: [String]
      $isViewerFriend: Boolean
    ) {
      node(id: $id) {
        ...usePaginationFragmentTestUserFragment
          @arguments(isViewerFriendLocal: $isViewerFriend, orderby: $orderby)
      }
    }
  `;
  gqlQueryNestedFragment = graphql`
    query usePaginationFragmentTestUserQueryNestedFragmentQuery(
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
          ...usePaginationFragmentTestUserFragment
            @arguments(isViewerFriendLocal: $isViewerFriend, orderby: $orderby)
        }
      }
    }
  `;
  gqlQueryWithoutID = graphql`
    query usePaginationFragmentTestUserQueryWithoutIDQuery(
      $after: ID
      $first: Int
      $before: ID
      $last: Int
      $orderby: [String]
      $isViewerFriend: Boolean
    ) {
      viewer {
        actor {
          ...usePaginationFragmentTestUserFragment
            @arguments(isViewerFriendLocal: $isViewerFriend, orderby: $orderby)
        }
      }
    }
  `;
  gqlQueryWithLiteralArgs = graphql`
    query usePaginationFragmentTestUserQueryWithLiteralArgsQuery(
      $id: ID!
      $after: ID
      $first: Int
      $before: ID
      $last: Int
    ) {
      node(id: $id) {
        ...usePaginationFragmentTestUserFragment
          @arguments(isViewerFriendLocal: true, orderby: ["name"])
      }
    }
  `;
  gqlQueryWithStreaming = graphql`
    query usePaginationFragmentTestUserQueryWithStreamingQuery(
      $id: ID!
      $after: ID
      $first: Int
      $before: ID
      $last: Int
      $orderby: [String]
      $isViewerFriend: Boolean
    ) {
      node(id: $id) {
        ...usePaginationFragmentTestUserFragmentWithStreaming
          @arguments(isViewerFriendLocal: $isViewerFriend, orderby: $orderby)
      }
    }
  `;
  gqlFragment = graphql`
    fragment usePaginationFragmentTestUserFragment on User
    @refetchable(
      queryName: "usePaginationFragmentTestUserFragmentPaginationQuery"
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
            ...usePaginationFragmentTestNestedUserFragment
          }
        }
      }
    }
  `;
  gqlFragmentWithStreaming = graphql`
    fragment usePaginationFragmentTestUserFragmentWithStreaming on User
    @refetchable(
      queryName: "usePaginationFragmentTestUserFragmentStreamingPaginationQuery"
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
        @stream_connection(
          initial_count: 1
          key: "UserFragment_friends"
          filters: ["orderby", "isViewerFriend"]
        ) {
        edges {
          node {
            id
            name
            ...usePaginationFragmentTestNestedUserFragment
          }
        }
      }
    }
  `;
  gqlPaginationQuery = require('./__generated__/usePaginationFragmentTestUserFragmentPaginationQuery.graphql');

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
  queryWithStreaming = createOperationDescriptor(
    gqlQueryWithStreaming,
    variables,
  );
  paginationQuery = createOperationDescriptor(gqlPaginationQuery, variables, {
    force: true,
  });
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
  Renderer = (props: {user: any}) => null;

  const Container = (props: {
    userRef?: {...},
    owner: $FlowFixMe,
    fragment?: $FlowFixMe,
    ...
  }) => {
    // We need a render a component to run a Hook
    const [owner, _setOwner] = useState(props.owner);
    const fragment = props.fragment ?? gqlFragment;
    const nodeUserRef = useMemo(
      () => environment.lookup(owner.fragment).data?.node,
      [owner],
    );
    const ownerOperationRef = useMemo(
      () => ({
        [ID_KEY]: owner.request.variables.id ?? owner.request.variables.nodeID,
        [FRAGMENTS_KEY]: {
          // $FlowFixMe[invalid-computed-prop] Error found while enabling LTI on this file
          [fragment.name]: {},
        },
        [FRAGMENT_OWNER_KEY]: owner.request,
      }),
      [owner, fragment.name],
    );
    const userRef = props.hasOwnProperty('userRef')
      ? props.userRef
      : nodeUserRef ?? ownerOperationRef;

    setOwner = _setOwner;

    const {data: userData} = usePaginationFragment(
      fragment,
      (userRef: $FlowFixMe),
    );
    return <Renderer user={userData} />;
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
  renderSpy.mockClear();
});

describe('initial render', () => {
  // The bulk of initial render behavior is covered in useFragmentNode-test,
  // so this suite covers the basic cases as a sanity check.
  it('should throw error if fragment is plural', () => {
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});

    const UserFragment = graphql`
      fragment usePaginationFragmentTest1Fragment on User @relay(plural: true) {
        id
      }
    `;
    const renderer = renderFragment({fragment: UserFragment});
    expect(
      renderer.toJSON().includes('Remove `@relay(plural: true)` from fragment'),
    ).toEqual(true);
  });

  it('should throw error if fragment is missing @refetchable directive', () => {
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});

    const UserFragment = graphql`
      fragment usePaginationFragmentTest2Fragment on User {
        id
      }
    `;
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

    const UserFragment = graphql`
      fragment usePaginationFragmentTest3Fragment on User
      @refetchable(
        queryName: "usePaginationFragmentTest3FragmentRefetchQuery"
      ) {
        id
      }
    `;
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
        isLoadingNext: false,
        isLoadingPrevious: false,

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
        isLoadingNext: false,
        isLoadingPrevious: false,

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
        isLoadingNext: false,
        isLoadingPrevious: false,
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
        isLoadingNext: false,
        isLoadingPrevious: false,
        hasNext: true,
        hasPrevious: false,
      },
    ]);

    // Update parent record
    TestRenderer.act(() => {
      environment.commitPayload(query, {
        node: {
          __typename: 'User',
          id: '1',
          // Update name
          name: 'Alice in Wonderland',
        },
      });
    });
    expectFragmentResults([
      {
        data: {
          ...initialUser,
          // Assert that name is updated
          name: 'Alice in Wonderland',
        },
        isLoadingNext: false,
        isLoadingPrevious: false,
        hasNext: true,
        hasPrevious: false,
      },
    ]);

    // Update edge
    TestRenderer.act(() => {
      environment.commitPayload(query, {
        node: {
          __typename: 'User',
          id: 'node:1',
          // Update name
          name: 'name:node:1-updated',
        },
      });
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
        isLoadingNext: false,
        isLoadingPrevious: false,
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
    release = jest.fn<$ReadOnlyArray<mixed>, mixed>();
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    environment.retain.mockImplementation((...args) => {
      return {
        dispose: release,
      };
    });
  });

  function expectRequestIsInFlight(expected: any) {
    expect(fetch).toBeCalledTimes(expected.requestCount);
    const fetchCall = fetch.mock.calls.find(call => {
      return (
        call[0] ===
          (expected.gqlPaginationQuery ?? gqlPaginationQuery).params &&
        areEqual(call[1], expected.paginationVariables) &&
        areEqual(call[2], {force: true})
      );
    });
    const isInFlight = fetchCall != null;
    expect(isInFlight).toEqual(expected.inFlight);
  }

  function expectFragmentIsLoadingMore(
    renderer: any,
    direction: Direction,
    expected: {
      data: mixed,
      hasNext: boolean,
      hasPrevious: boolean,
      paginationVariables: Variables,
      gqlPaginationQuery?: $FlowFixMe,
    },
  ) {
    // Assert fragment sets isLoading to true
    expect(renderSpy).toBeCalledTimes(1);
    assertCall(
      {
        data: expected.data,
        isLoadingNext: direction === 'forward',
        isLoadingPrevious: direction === 'backward',
        hasNext: expected.hasNext,
        hasPrevious: expected.hasPrevious,
      },
      0,
    );
    renderSpy.mockClear();

    // Assert refetch query was fetched
    expectRequestIsInFlight({...expected, inFlight: true, requestCount: 1});
  }

  // TODO
  // - backward pagination
  // - simultaneous pagination
  // - TODO(T41131846): Fetch/Caching policies for loadMore / when network
  //   returns or errors synchronously
  // - TODO(T41140071): Handle loadMore while refetch is in flight and vice-versa

  describe('loadNext', () => {
    const direction = 'forward';

    it('does not load more if component has unmounted', () => {
      const warning = require('warning');
      // $FlowFixMe[prop-missing]
      warning.mockClear();

      const renderer = renderFragment();
      expectFragmentResults([
        {
          data: initialUser,
          isLoadingNext: false,
          isLoadingPrevious: false,
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
      expect(fetch).toHaveBeenCalledTimes(0);
    });

    it('does not load more if fragment ref passed to usePaginationFragment() was null', () => {
      const warning = require('warning');
      // $FlowFixMe[prop-missing]
      warning.mockClear();

      renderFragment({userRef: null});
      expectFragmentResults([
        {
          data: null,
          isLoadingNext: false,
          isLoadingPrevious: false,
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
      expect(fetch).toHaveBeenCalledTimes(0);
    });

    it('does not load more if request is already in flight', () => {
      const callback = jest.fn<[Error | null], void>();
      const renderer = renderFragment();
      expectFragmentResults([
        {
          data: initialUser,
          isLoadingNext: false,
          isLoadingPrevious: false,
          hasNext: true,
          hasPrevious: false,
        },
      ]);

      TestRenderer.act(() => {
        loadNext(1, {onComplete: callback});
      });
      expect(callback).toBeCalledTimes(0);

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

      TestRenderer.act(() => {
        loadNext(1, {onComplete: callback});
      });
      expect(fetch).toBeCalledTimes(1);
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

      const callback = jest.fn<[Error | null], void>();
      fetch.mockClear();
      renderFragment();

      expectFragmentResults([
        {
          data: initialUser,
          isLoadingNext: false,
          isLoadingPrevious: false,
          hasNext: true,
          hasPrevious: false,
        },
      ]);

      TestRenderer.act(() => {
        loadNext(1, {onComplete: callback});
      });
      expect(fetch).toBeCalledTimes(0);
      expect(callback).toBeCalledTimes(1);
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
      const callback = jest.fn<[Error | null], void>();

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
          isLoadingNext: false,
          isLoadingPrevious: false,
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
        data: expectedUser,
        hasNext: false,
        hasPrevious: false,
        paginationVariables,
        gqlPaginationQuery,
      });
      expect(callback).toBeCalledTimes(0);

      resolveQuery({
        data: {
          node: {
            __typename: 'User',
            id: '1',
            name: 'Alice',
            friends: {
              // $FlowFixMe[missing-empty-array-annot]
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
          isLoadingNext: false,
          isLoadingPrevious: false,
          hasNext: false,
          hasPrevious: false,
        },
      ]);
      expect(callback).toBeCalledTimes(1);
    });

    it('loads and renders next items in connection', () => {
      const callback = jest.fn<[Error | null], void>();
      const renderer = renderFragment();
      expectFragmentResults([
        {
          data: initialUser,
          isLoadingNext: false,
          isLoadingPrevious: false,
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

      resolveQuery({
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
          isLoadingNext: true,
          isLoadingPrevious: false,
          hasNext: true,
          hasPrevious: false,
        },
        {
          // Second update sets isLoading flag back to false
          data: expectedUser,
          isLoadingNext: false,
          isLoadingPrevious: false,
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

      const callback = jest.fn<[Error | null], void>();
      const renderer = renderFragment({owner: queryWithLiteralArgs});
      expectFragmentResults([
        {
          data: expectedUser,
          isLoadingNext: false,
          isLoadingPrevious: false,
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

      resolveQuery({
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
          // First update has updated connection
          data: expectedUser,
          isLoadingNext: true,
          isLoadingPrevious: false,
          hasNext: true,
          hasPrevious: false,
        },
        {
          // Second update sets isLoading flag back to false
          data: expectedUser,
          isLoadingNext: false,
          isLoadingPrevious: false,
          hasNext: true,
          hasPrevious: false,
        },
      ]);
      expect(callback).toBeCalledTimes(1);
    });

    it('loads more correctly when original variables do not include an id', () => {
      const callback = jest.fn<[Error | null], void>();
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
          isLoadingNext: false,
          isLoadingPrevious: false,
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

      resolveQuery({
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
          // First update has updated connection
          data: expectedUser,
          isLoadingNext: true,
          isLoadingPrevious: false,
          hasNext: true,
          hasPrevious: false,
        },
        {
          // Second update sets isLoading flag back to false
          data: expectedUser,
          isLoadingNext: false,
          isLoadingPrevious: false,
          hasNext: true,
          hasPrevious: false,
        },
      ]);
      expect(callback).toBeCalledTimes(1);
    });

    it('loads more with correct id from refetchable fragment when using a nested fragment', () => {
      const callback = jest.fn<[Error | null], void>();

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

      const renderer = renderFragment({
        owner: queryNestedFragment,
        userRef,
      });
      expectFragmentResults([
        {
          data: initialUser,
          isLoadingNext: false,
          isLoadingPrevious: false,
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

      resolveQuery({
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
          // First update has updated connection
          data: expectedUser,
          isLoadingNext: true,
          isLoadingPrevious: false,
          hasNext: true,
          hasPrevious: false,
        },
        {
          // Second update sets isLoading flag back to false
          data: expectedUser,
          isLoadingNext: false,
          isLoadingPrevious: false,
          hasNext: true,
          hasPrevious: false,
        },
      ]);
      expect(callback).toBeCalledTimes(1);
    });

    it('calls callback with error when error occurs during fetch', () => {
      const callback = jest.fn<[Error | null], void>();
      const renderer = renderFragment();
      expectFragmentResults([
        {
          data: initialUser,
          isLoadingNext: false,
          isLoadingPrevious: false,
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
      dataSource.error(error);

      TestRenderer.act(() => jest.runAllImmediates());
      // We pass the error in the callback, but do not throw during render
      // since we want to continue rendering the existing items in the
      // connection
      expect(callback).toBeCalledTimes(1);
      expect(callback).toBeCalledWith(error);
    });

    it('preserves pagination request if re-rendered with same fragment ref', () => {
      const callback = jest.fn<[Error | null], void>();
      const renderer = renderFragment();
      expectFragmentResults([
        {
          data: initialUser,
          isLoadingNext: false,
          isLoadingPrevious: false,
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

      resolveQuery({
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
          isLoadingNext: true,
          isLoadingPrevious: false,
          hasNext: true,
          hasPrevious: false,
        },
        {
          // Second update sets isLoading flag back to false
          data: expectedUser,
          isLoadingNext: false,
          isLoadingPrevious: false,
          hasNext: true,
          hasPrevious: false,
        },
      ]);
      expect(callback).toBeCalledTimes(1);
    });

    describe('extra variables', () => {
      it('loads and renders the next items in the connection when passing extra variables', () => {
        const callback = jest.fn<[Error | null], void>();
        const renderer = renderFragment();
        expectFragmentResults([
          {
            data: initialUser,
            isLoadingNext: false,
            isLoadingPrevious: false,
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

        resolveQuery({
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
            isLoadingNext: true,
            isLoadingPrevious: false,
            hasNext: true,
            hasPrevious: false,
          },
          {
            // Second update sets isLoading flag back to false
            data: expectedUser,
            isLoadingNext: false,
            isLoadingPrevious: false,
            hasNext: true,
            hasPrevious: false,
          },
        ]);
        expect(callback).toBeCalledTimes(1);
      });

      it('loads the next items in the connection and ignores any pagination vars passed as extra vars', () => {
        const callback = jest.fn<[Error | null], void>();
        const renderer = renderFragment();
        expectFragmentResults([
          {
            data: initialUser,
            isLoadingNext: false,
            isLoadingPrevious: false,
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

        resolveQuery({
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
            isLoadingNext: true,
            isLoadingPrevious: false,
            hasNext: true,
            hasPrevious: false,
          },
          {
            // Second update sets isLoading flag back to false
            data: expectedUser,
            isLoadingNext: false,
            isLoadingPrevious: false,
            hasNext: true,
            hasPrevious: false,
          },
        ]);
        expect(callback).toBeCalledTimes(1);
      });
    });

    describe('disposing', () => {
      it('cancels load more if component unmounts', () => {
        unsubscribe.mockClear();
        const callback = jest.fn<[Error | null], void>();
        const renderer = renderFragment();
        expectFragmentResults([
          {
            data: initialUser,
            isLoadingNext: false,
            isLoadingPrevious: false,
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
          jest.runAllTimers();
        });
        expect(unsubscribe).toHaveBeenCalledTimes(1);
        expect(fetch).toBeCalledTimes(1);
        expect(callback).toBeCalledTimes(0);
        expect(renderSpy).toBeCalledTimes(0);
      });

      it('cancels load more if refetch is called', () => {
        unsubscribe.mockClear();
        const callback = jest.fn<[Error | null], void>();
        const renderer = renderFragment();
        expectFragmentResults([
          {
            data: initialUser,
            isLoadingNext: false,
            isLoadingPrevious: false,
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
        const loadNextUnsubscribe = unsubscribe;

        TestRenderer.act(() => {
          refetch({id: '4'});
        });
        expect(fetch).toBeCalledTimes(2); // loadNext and refetch
        expect(loadNextUnsubscribe).toHaveBeenCalledTimes(1); // loadNext is cancelled
        expect(unsubscribe).toHaveBeenCalledTimes(0); // refetch is not cancelled
        expect(callback).toBeCalledTimes(0);
        expect(renderSpy).toBeCalledTimes(0);
      });

      it('disposes ongoing request if environment changes', () => {
        const callback = jest.fn<[Error | null], void>();
        const renderer = renderFragment();
        expectFragmentResults([
          {
            data: initialUser,
            isLoadingNext: false,
            isLoadingPrevious: false,
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
        const loadNextUnsubscribe = unsubscribe;
        expect(callback).toBeCalledTimes(0);

        // Set new environment
        const [newEnvironment, newFetch] = createMockEnvironment();
        fetch.mockClear();
        fetch = newFetch;
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
        expect(loadNextUnsubscribe).toBeCalledTimes(1);
        // changing environments resets, we don't try to auto-paginate just bc a request was pending
        expect(fetch).toBeCalledTimes(0);

        // Assert newly rendered data
        expectFragmentResults([
          {
            data: {
              ...initialUser,
              name: 'Alice in a different environment',
            },
            isLoadingNext: true,
            isLoadingPrevious: false,
            hasNext: true,
            hasPrevious: false,
          },
          {
            data: {
              ...initialUser,
              name: 'Alice in a different environment',
            },
            isLoadingNext: false,
            isLoadingPrevious: false,
            hasNext: true,
            hasPrevious: false,
          },
        ]);
      });

      it('disposes ongoing request if fragment ref changes', () => {
        const callback = jest.fn<[Error | null], void>();
        const renderer = renderFragment();
        expectFragmentResults([
          {
            data: initialUser,
            isLoadingNext: false,
            isLoadingPrevious: false,
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
        fetch.mockClear();
        TestRenderer.act(() => {
          setOwner(newQuery);
        });

        // Assert request was canceled
        expect(unsubscribe).toBeCalledTimes(1);
        // changing fragment ref resets, we don't try to auto-paginate just bc a request was pending
        expect(fetch).toBeCalledTimes(0);

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
            isLoadingNext: true,
            isLoadingPrevious: false,
            hasNext: true,
            hasPrevious: false,
          },
          {
            data: expectedUser,
            isLoadingNext: false,
            isLoadingPrevious: false,
            hasNext: true,
            hasPrevious: false,
          },
        ]);
      });

      it('disposes ongoing request on unmount', () => {
        const callback = jest.fn<[Error | null], void>();
        const renderer = renderFragment();
        expectFragmentResults([
          {
            data: initialUser,
            isLoadingNext: false,
            isLoadingPrevious: false,
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
        expect(fetch).toBeCalledTimes(1); // the loadNext call
      });

      it('disposes ongoing request if it is manually disposed', () => {
        const callback = jest.fn<[Error | null], void>();
        const renderer = renderFragment();
        expectFragmentResults([
          {
            data: initialUser,
            isLoadingNext: false,
            isLoadingPrevious: false,
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

        expect(disposable).toBeTruthy();
        disposable?.dispose();

        // Assert request was canceled
        expect(unsubscribe).toBeCalledTimes(1);
        expect(fetch).toBeCalledTimes(1); // the loadNext call
        expect(renderSpy).toHaveBeenCalledTimes(0);
      });
    });

    describe('when parent query is streaming', () => {
      beforeEach(() => {
        [environment, fetch] = createMockEnvironment();
        environment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: '1',
            name: 'Alice',
          },
        });
      });

      it('does not start pagination request even if query is no longer active but loadNext is bound to snapshot of data while query was active', () => {
        const {
          __internal: {fetchQuery},
        } = require('relay-runtime');

        // Start parent query and assert it is active
        fetchQuery(environment, queryWithStreaming).subscribe({});
        expect(
          environment.isRequestActive(queryWithStreaming.request.identifier),
        ).toEqual(true);

        // Render initial fragment
        const instance = renderFragment({
          fragment: gqlFragmentWithStreaming,
          owner: queryWithStreaming,
        });
        expect(instance.toJSON()).toEqual(null);
        renderSpy.mockClear();

        // Resolve first payload
        TestRenderer.act(() => {
          dataSource.next({
            data: {
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
                },
              },
            },
            extensions: {
              is_final: false,
            },
          });
        });
        // Ensure request is still active
        expect(
          environment.isRequestActive(queryWithStreaming.request.identifier),
        ).toEqual(true);

        // Assert fragment rendered with correct data
        expectFragmentResults([
          {
            data: {
              ...initialUser,
              friends: {
                edges: [
                  {
                    cursor: 'cursor:1',
                    node: {
                      __typename: 'User',
                      id: 'node:1',
                      name: 'name:node:1',
                      ...createFragmentRef('node:1', queryWithStreaming),
                    },
                  },
                ],
                // Assert pageInfo is currently null
                pageInfo: {
                  endCursor: null,
                  hasNextPage: false,
                  hasPreviousPage: false,
                  startCursor: null,
                },
              },
            },
            isLoadingNext: false,
            isLoadingPrevious: false,
            hasNext: false,
            hasPrevious: false,
          },
        ]);

        // Capture the value of loadNext at this moment, which will
        // would use the page info from the current fragment snapshot.
        // At the moment of this snapshot the parent request is still active,
        // so calling `capturedLoadNext` should be a no-op, otherwise it
        // would attempt a pagination with the incorrect cursor as null.
        const capturedLoadNext = loadNext;

        // Resolve page info
        TestRenderer.act(() => {
          resolveQuery({
            data: {
              pageInfo: {
                endCursor: 'cursor:1',
                hasNextPage: true,
              },
            },
            label:
              'usePaginationFragmentTestUserFragmentWithStreaming$defer$UserFragment_friends$pageInfo',
            path: ['node', 'friends'],
            extensions: {
              is_final: true,
            },
          });
        });
        // Ensure request is no longer active since final payload has been
        // received
        expect(
          environment.isRequestActive(queryWithStreaming.request.identifier),
        ).toEqual(false);

        // Assert fragment rendered with correct data
        expectFragmentResults([
          {
            data: {
              ...initialUser,
              friends: {
                edges: [
                  {
                    cursor: 'cursor:1',
                    node: {
                      __typename: 'User',
                      id: 'node:1',
                      name: 'name:node:1',
                      ...createFragmentRef('node:1', queryWithStreaming),
                    },
                  },
                ],
                // Assert pageInfo is updated
                pageInfo: {
                  endCursor: 'cursor:1',
                  hasNextPage: true,
                  hasPreviousPage: false,
                  startCursor: null,
                },
              },
            },
            isLoadingNext: false,
            isLoadingPrevious: false,
            hasNext: true,
            hasPrevious: false,
          },
        ]);

        fetch.mockClear();
        renderSpy.mockClear();
        // Call `capturedLoadNext`, which should be a no-op since it's
        // bound to the snapshot of the fragment taken while the query is
        // still active and pointing to incomplete page info.
        TestRenderer.act(() => {
          capturedLoadNext(1);
        });

        // Assert that calling `capturedLoadNext` is a no-op
        expect(fetch).toBeCalledTimes(0);
        expect(renderSpy).toBeCalledTimes(0);

        // Calling `loadNext`, should be fine since it's bound to the
        // latest fragment snapshot with the latest page info and when
        // the request is no longer active
        TestRenderer.act(() => {
          loadNext(1);
        });

        // Assert that calling `loadNext` starts the request
        expect(fetch).toBeCalledTimes(1);
        expect(renderSpy).toBeCalledTimes(1);
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
          isLoadingNext: false,
          isLoadingPrevious: false,
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
          isLoadingNext: false,
          isLoadingPrevious: false,
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
          isLoadingNext: false,
          isLoadingPrevious: false,
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
          isLoadingNext: false,
          isLoadingPrevious: false,
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
          isLoadingNext: false,
          isLoadingPrevious: false,
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
          isLoadingNext: false,
          isLoadingPrevious: false,
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
          isLoadingNext: false,
          isLoadingPrevious: false,
          // Assert hasNext is false
          hasNext: false,
          hasPrevious: false,
        },
      ]);
    });

    it('updates after pagination if more results are available', () => {
      const callback = jest.fn<[Error | null], void>();
      const renderer = renderFragment();
      expectFragmentResults([
        {
          data: initialUser,
          isLoadingNext: false,
          isLoadingPrevious: false,

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

      resolveQuery({
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
          isLoadingNext: true,
          isLoadingPrevious: false,
          // Assert hasNext reflects server response
          hasNext: true,
          hasPrevious: false,
        },
        {
          // Second update sets isLoading flag back to false
          data: expectedUser,
          isLoadingNext: false,
          isLoadingPrevious: false,
          // Assert hasNext reflects server response
          hasNext: true,
          hasPrevious: false,
        },
      ]);
      expect(callback).toBeCalledTimes(1);
    });

    it('updates after pagination if no more results are available', () => {
      const callback = jest.fn<[Error | null], void>();
      const renderer = renderFragment();
      expectFragmentResults([
        {
          data: initialUser,
          isLoadingNext: false,
          isLoadingPrevious: false,
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

      resolveQuery({
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
          // First update has updated connection
          data: expectedUser,
          isLoadingNext: true,
          isLoadingPrevious: false,
          // Assert hasNext reflects server response
          hasNext: false,
          hasPrevious: false,
        },
        {
          // Second update sets isLoading flag back to false
          data: expectedUser,
          isLoadingNext: false,
          isLoadingPrevious: false,
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
    function expectRefetchRequestIsInFlight(expected: {
      data: mixed,
      gqlRefetchQuery?: any,
      hasNext: boolean,
      hasPrevious: boolean,
      inFlight: boolean,
      refetchQuery?: OperationDescriptor,
      refetchVariables: Variables,
      requestCount: number,
    }) {
      expect(fetch).toBeCalledTimes(expected.requestCount);
      const fetchCall = fetch.mock.calls.find(call => {
        return (
          call[0] === (expected.gqlRefetchQuery ?? gqlPaginationQuery).params &&
          areEqual(call[1], expected.refetchVariables) &&
          areEqual(call[2], {force: true})
        );
      });
      const isInFlight = fetchCall != null;
      expect(isInFlight).toEqual(expected.inFlight);
    }

    function expectFragmentIsRefetching(
      renderer: any,
      expected: {
        data: mixed,
        hasNext: boolean,
        hasPrevious: boolean,
        refetchVariables: Variables,
        refetchQuery?: OperationDescriptor,
        gqlRefetchQuery?: $FlowFixMe,
      },
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

      // Assert query is retained by loadQuery and
      // tentatively retained while component is suspended
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
          isLoadingNext: false,
          isLoadingPrevious: false,
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
      resolveQuery({
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
          isLoadingNext: false,
          isLoadingPrevious: false,
          hasNext: true,
          hasPrevious: false,
        },
        {
          data: expectedUser,
          isLoadingNext: false,
          isLoadingPrevious: false,
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
          isLoadingNext: false,
          isLoadingPrevious: false,
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
      resolveQuery({
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
          isLoadingNext: false,
          isLoadingPrevious: false,
          hasNext: true,
          hasPrevious: false,
        },
        {
          data: expectedUser,
          isLoadingNext: false,
          isLoadingPrevious: false,
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

      const renderer = renderFragment({
        owner: queryNestedFragment,
        userRef,
      });
      expectFragmentResults([
        {
          data: initialUser,
          isLoadingNext: false,
          isLoadingPrevious: false,
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
      resolveQuery({
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
          isLoadingNext: false,
          isLoadingPrevious: false,
          hasNext: true,
          hasPrevious: false,
        },
        {
          data: expectedUser,
          isLoadingNext: false,
          isLoadingPrevious: false,
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
          isLoadingNext: false,
          isLoadingPrevious: false,
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
      resolveQuery({
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
          isLoadingNext: false,
          isLoadingPrevious: false,
          hasNext: true,
          hasPrevious: false,
        },
        {
          data: expectedUser,
          isLoadingNext: false,
          isLoadingPrevious: false,
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
      fetch.mockClear();
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

      resolveQuery({
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
          // First update has updated connection
          data: paginatedUser,
          isLoadingNext: true,
          isLoadingPrevious: false,
          hasNext: true,
          hasPrevious: false,
        },
        {
          // Second update sets isLoading flag back to false
          data: paginatedUser,
          isLoadingNext: false,
          isLoadingPrevious: false,
          hasNext: true,
          hasPrevious: false,
        },
      ]);
    });
  });

  describe('paginating @fetchable types', () => {
    beforeEach(() => {
      const fetchVariables = {id: 'a'};
      gqlQuery = graphql`
        query usePaginationFragmentTestStoryQuery($id: ID!) {
          nonNodeStory(id: $id) {
            ...usePaginationFragmentTestStoryFragment
          }
        }
      `;

      // $FlowFixMe[prop-missing]
      // $FlowFixMe[incompatible-type-arg]
      gqlFragment = graphql`
        fragment usePaginationFragmentTestStoryFragment on NonNodeStory
        @argumentDefinitions(
          count: {type: "Int", defaultValue: 10}
          cursor: {type: "ID"}
        )
        @refetchable(
          queryName: "usePaginationFragmentTestStoryFragmentRefetchQuery"
        ) {
          comments(first: $count, after: $cursor)
            @connection(key: "StoryFragment_comments") {
            edges {
              node {
                id
              }
            }
          }
        }
      `;
      gqlPaginationQuery = require('./__generated__/usePaginationFragmentTestStoryFragmentRefetchQuery.graphql');

      query = createOperationDescriptor(gqlQuery, fetchVariables);

      environment.commitPayload(query, {
        nonNodeStory: {
          __typename: 'NonNodeStory',
          id: 'a',
          fetch_id: 'fetch:a',
          comments: {
            edges: [
              {
                cursor: 'edge:0',
                node: {
                  __typename: 'Comment',
                  id: 'comment:0',
                },
              },
            ],
            pageInfo: {
              endCursor: 'edge:0',
              hasNextPage: true,
            },
          },
        },
      });
    });

    it('loads and renders next items in connection', () => {
      const callback = jest.fn<[Error | null], void>();
      const renderer = renderFragment();
      const initialData = {
        fetch_id: 'fetch:a',
        comments: {
          edges: [
            {
              cursor: 'edge:0',
              node: {
                __typename: 'Comment',
                id: 'comment:0',
              },
            },
          ],
          pageInfo: {
            endCursor: 'edge:0',
            hasNextPage: true,
          },
        },
      };
      expectFragmentResults([
        {
          data: initialData,
          isLoadingNext: false,
          isLoadingPrevious: false,
          hasNext: true,
          hasPrevious: false,
        },
      ]);

      TestRenderer.act(() => {
        loadNext(1, {onComplete: callback});
      });
      const paginationVariables = {
        id: 'fetch:a',
        cursor: 'edge:0',
        count: 1,
      };
      expectFragmentIsLoadingMore(renderer, 'forward', {
        data: initialData,
        hasNext: true,
        hasPrevious: false,
        paginationVariables,
        gqlPaginationQuery,
      });
      expect(callback).toBeCalledTimes(0);

      resolveQuery({
        data: {
          fetch__NonNodeStory: {
            id: 'a',
            fetch_id: 'fetch:a',
            comments: {
              edges: [
                {
                  cursor: 'edge:1',
                  node: {
                    __typename: 'Comment',
                    id: 'comment:1',
                  },
                },
              ],
              pageInfo: {
                endCursor: 'edge:1',
                hasNextPage: true,
              },
            },
          },
        },
      });

      const expectedData = {
        ...initialData,
        comments: {
          edges: [
            ...initialData.comments.edges,
            {
              cursor: 'edge:1',
              node: {
                __typename: 'Comment',
                id: 'comment:1',
              },
            },
          ],
          pageInfo: {
            endCursor: 'edge:1',
            hasNextPage: true,
          },
        },
      };
      expectFragmentResults([
        {
          // First update has updated connection
          data: expectedData,
          isLoadingNext: true,
          isLoadingPrevious: false,
          hasNext: true,
          hasPrevious: false,
        },
        {
          // Second update sets isLoading flag back to false
          data: expectedData,
          isLoadingNext: false,
          isLoadingPrevious: false,
          hasNext: true,
          hasPrevious: false,
        },
      ]);
      expect(callback).toBeCalledTimes(1);
    });
  });
});

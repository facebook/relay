/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user$key} from './__generated__/usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user.graphql';

const usePrefetchableForwardPaginationFragment_EXPERIMENTAL = require('../usePrefetchableForwardPaginationFragment_EXPERIMENTAL');
const React = require('react');
const {RelayEnvironmentProvider} = require('react-relay/hooks');
const {act, create} = require('react-test-renderer');
const {
  ConnectionHandler,
  createOperationDescriptor,
  graphql,
} = require('relay-runtime');
const RelayFeatureFlags = require('relay-runtime/util/RelayFeatureFlags');
const {createMockEnvironment} = require('relay-test-utils-internal');

const {Suspense} = React;
const BUFFER_SIZE = 2;

let environment;
let variables;
let query;
let loadMore;
let refetch;
let hasNextSpy;
let isLoadingNextSpy;

component Container(
  userRef: ?usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user$key,
  minimalEdgesToFetch: number = 1,
  UNSTABLE_extraVariables?: mixed,
) {
  const {
    edges,
    data,
    loadNext,
    refetch: _refetch,
    hasNext,
    isLoadingNext,
  } = usePrefetchableForwardPaginationFragment_EXPERIMENTAL(
    graphql`
      fragment usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user on User
      @refetchable(
        queryName: "usePrefetchableForwardPaginationFragmentRefetchQuery"
      ) {
        friends(after: $after, first: $first, before: $before, last: $last)
          @connection(
            key: "UserFragment_friends"
            prefetchable_pagination: true
          ) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `,
    userRef,
    BUFFER_SIZE,
    null,
    {
      UNSTABLE_extraVariables,
    },
    minimalEdgesToFetch,
  );
  loadMore = loadNext;
  refetch = _refetch;
  const availableSize = (data?.friends?.edges?.length ?? 0) - edges.length;

  hasNextSpy?.(hasNext);
  isLoadingNextSpy?.(isLoadingNext);
  // $FlowFixMe[incompatible-use]
  return `${edges.map(edge => edge.node.name).join(',')}/${availableSize}`;
}

beforeEach(() => {
  RelayFeatureFlags.ENABLE_ACTIVITY_COMPATIBILITY = true;
  hasNextSpy = jest.fn();
  isLoadingNextSpy = jest.fn();
  jest.mock('warning');

  environment = createMockEnvironment({
    handlerProvider: _name => {
      return ConnectionHandler;
    },
  });

  variables = {
    first: 1,
    id: '1',
  };

  query = createOperationDescriptor(
    graphql`
      query usePrefetchableForwardPaginationFragmentEXPERIMENTALTestQuery(
        $id: ID!
        $after: ID
        $first: Int
        $before: ID
        $last: Int
      ) {
        node(id: $id) {
          ...usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user
        }
      }
    `,
    variables,
  );

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
              name: 'node1',
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
});

it('should prefetch the next page when the component is mounted', () => {
  const fragmentKey = environment.lookup(query.fragment).data?.node;
  // render the initial page
  let app;
  act(() => {
    app = create(
      <RelayEnvironmentProvider environment={environment}>
        <Suspense fallback="Fallback">
          {/* $FlowFixMe[incompatible-type] */}
          <Container userRef={fragmentKey} />
        </Suspense>
      </RelayEnvironmentProvider>,
    );
  });
  if (app == null) {
    throw new Error('should not be null');
  }
  expect(app.toJSON()).toEqual('node1/0');

  // Prefetches 2 more
  expect(environment.mock.getAllOperations().length).toBe(1);
  expect(environment.mock.getAllOperations()[0].fragment.variables.first).toBe(
    2,
  );
  act(() => {
    environment.mock.resolveMostRecentOperation({
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
                  name: 'node2',
                  username: 'username:node:2',
                },
              },
              {
                cursor: 'cursor:3',
                node: {
                  __typename: 'User',
                  id: 'node:3',
                  name: 'node3',
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
  });

  expect(app.toJSON()).toEqual('node1/2');

  // Use 1 more, fullfil from cache, and tries to fill the buffer
  act(() => {
    loadMore(1);
  });
  expect(environment.mock.getAllOperations().length).toBe(1);
  expect(environment.mock.getAllOperations()[0].fragment.variables.first).toBe(
    1,
  );
  expect(app.toJSON()).toEqual('node1,node2/1');

  act(() => {
    environment.mock.resolveMostRecentOperation({
      data: {
        node: {
          __typename: 'User',
          id: '1',
          name: 'Alice',
          friends: {
            edges: [
              {
                cursor: 'cursor:4',
                node: {
                  __typename: 'User',
                  id: 'node:4',
                  name: 'node4',
                },
              },
            ],
            pageInfo: {
              startCursor: 'cursor:4',
              endCursor: 'cursor:4',
              hasNextPage: true,
              hasPreviousPage: true,
            },
          },
        },
      },
    });
  });
  expect(app.toJSON()).toEqual('node1,node2/2');

  // Use 2 more from the cache and load more
  act(() => {
    loadMore(2);
  });
  expect(environment.mock.getAllOperations().length).toBe(1);
  expect(environment.mock.getAllOperations()[0].fragment.variables.first).toBe(
    2,
  );
  expect(app.toJSON()).toEqual('node1,node2,node3,node4/0');

  act(() => {
    environment.mock.resolveMostRecentOperation({
      data: {
        node: {
          __typename: 'User',
          id: '1',
          name: 'Alice',
          friends: {
            edges: [
              {
                cursor: 'cursor:5',
                node: {
                  __typename: 'User',
                  id: 'node:5',
                  name: 'node5',
                },
              },
              {
                cursor: 'cursor:6',
                node: {
                  __typename: 'User',
                  id: 'node:6',
                  name: 'node6',
                },
              },
            ],
            pageInfo: {
              startCursor: 'cursor:6',
              endCursor: 'cursor:6',
              hasNextPage: true,
              hasPreviousPage: true,
            },
          },
        },
      },
    });
  });
  expect(app.toJSON()).toEqual('node1,node2,node3,node4/2');
});

it('should reset edges in use on a refetch', () => {
  const fragmentKey = environment.lookup(query.fragment).data?.node;
  // render the initial page
  let app;
  act(() => {
    app = create(
      <RelayEnvironmentProvider environment={environment}>
        <Suspense fallback="Fallback">
          {/* $FlowFixMe[incompatible-type]*/}
          <Container userRef={fragmentKey} />
        </Suspense>
      </RelayEnvironmentProvider>,
    );
  });
  if (app == null) {
    throw new Error('should not be null');
  }
  expect(app.toJSON()).toEqual('node1/0');

  // After refetch, should display all edges returned from the refetch query
  act(() => {
    refetch({
      id: '2',
    });
    environment.mock.resolveMostRecentOperation({
      data: {
        node: {
          __typename: 'User',
          id: '2',
          name: 'Bob',
          friends: {
            edges: [
              {
                cursor: 'cursor:1',
                node: {
                  __typename: 'User',
                  id: 'node:1',
                  name: 'node1refetch',
                  username: 'username:node:1',
                },
              },
              {
                cursor: 'cursor:2',
                node: {
                  __typename: 'User',
                  id: 'node:2',
                  name: 'node2refetch',
                  username: 'username:node:2',
                },
              },
            ],
            pageInfo: {
              startCursor: 'cursor:2',
              endCursor: 'cursor:2',
              hasNextPage: true,
              hasPreviousPage: false,
            },
          },
        },
      },
    });
  });

  expect(app.toJSON()).toEqual('node1refetch,node2refetch/0');
});

it('`hasNext` should reflect available items in the cache', () => {
  const fragmentKey = environment.lookup(query.fragment).data?.node;
  let app;
  act(() => {
    app = create(
      <RelayEnvironmentProvider environment={environment}>
        <Suspense fallback="Fallback">
          {/* $FlowFixMe[incompatible-type] */}
          <Container userRef={fragmentKey} />
        </Suspense>
      </RelayEnvironmentProvider>,
    );
  });
  if (app == null) {
    throw new Error('should not be null');
  }
  expect(app.toJSON()).toEqual('node1/0');
  expect(hasNextSpy).toHaveBeenLastCalledWith(true);

  // Prefetches 2 mores and no more available
  act(() => {
    environment.mock.resolveMostRecentOperation({
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
                  name: 'node2',
                  username: 'username:node:2',
                },
              },
              {
                cursor: 'cursor:3',
                node: {
                  __typename: 'User',
                  id: 'node:3',
                  name: 'node3',
                  username: 'username:node:3',
                },
              },
            ],
            pageInfo: {
              startCursor: 'cursor:3',
              endCursor: 'cursor:3',
              hasNextPage: false,
              hasPreviousPage: false,
            },
          },
        },
      },
    });
  });

  expect(app.toJSON()).toEqual('node1/2');

  expect(hasNextSpy).toHaveBeenLastCalledWith(true);

  // Use 2 more, need to load
  act(() => {
    loadMore(2);
  });
  expect(app.toJSON()).toEqual('node1,node2,node3/0');
  expect(hasNextSpy).toHaveBeenLastCalledWith(false);
});

it('should not set `isLoading` to true if loading is for fullfilling the cache buffer', () => {
  const fragmentKey = environment.lookup(query.fragment).data?.node;
  // render the initial page
  let app;
  act(() => {
    app = create(
      <RelayEnvironmentProvider environment={environment}>
        <Suspense fallback="Fallback">
          {/* $FlowFixMe[incompatible-type] */}
          <Container userRef={fragmentKey} />
        </Suspense>
      </RelayEnvironmentProvider>,
    );
  });
  if (app == null) {
    throw new Error('should not be null');
  }
  expect(app.toJSON()).toEqual('node1/0');

  // It starts prefetching, but should not show the loading state
  expect(isLoadingNextSpy).toHaveBeenLastCalledWith(false);
  act(() => {
    environment.mock.resolveMostRecentOperation({
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
                  name: 'node2',
                  username: 'username:node:2',
                },
              },
              {
                cursor: 'cursor:3',
                node: {
                  __typename: 'User',
                  id: 'node:3',
                  name: 'node3',
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
  });

  expect(app.toJSON()).toEqual('node1/2');

  // Use 1 more, fulfill from cache, and it should kickoff a prefetching for 1 element
  act(() => {
    loadMore(1);
  });
  expect(environment.mock.getAllOperations().length).toBe(1);
  expect(environment.mock.getAllOperations()[0].fragment.variables.first).toBe(
    1,
  );
  expect(isLoadingNextSpy).toHaveBeenLastCalledWith(false);

  expect(app.toJSON()).toEqual('node1,node2/1');

  // Use 2 more, need to load to fullfil the product's need, thus `isLoading` should be `true`
  act(() => {
    loadMore(2);
  });
  expect(isLoadingNextSpy).toHaveBeenLastCalledWith(true);

  expect(app.toJSON()).toEqual('node1,node2,node3/0');

  act(() => {
    environment.mock.resolveMostRecentOperation({
      data: {
        node: {
          __typename: 'User',
          id: '1',
          name: 'Alice',
          friends: {
            edges: [
              {
                cursor: 'cursor:4',
                node: {
                  __typename: 'User',
                  id: 'node:4',
                  name: 'node4',
                },
              },
              {
                cursor: 'cursor:5',
                node: {
                  __typename: 'User',
                  id: 'node:5',
                  name: 'node5',
                },
              },
            ],
            pageInfo: {
              startCursor: 'cursor:5',
              endCursor: 'cursor:5',
              hasNextPage: true,
              hasPreviousPage: true,
            },
          },
        },
      },
    });
  });
  expect(app.toJSON()).toEqual('node1,node2,node3,node4/1');

  expect(isLoadingNextSpy).toHaveBeenLastCalledWith(false);
});

it('should not try to prefetch if there is already no more edges left', () => {
  const fragmentKey = environment.lookup(query.fragment).data?.node;
  // render the initial page
  let app;
  act(() => {
    app = create(
      <RelayEnvironmentProvider environment={environment}>
        <Suspense fallback="Fallback">
          {/* $FlowFixMe[incompatible-type] */}
          <Container userRef={fragmentKey} />
        </Suspense>
      </RelayEnvironmentProvider>,
    );
  });
  if (app == null) {
    throw new Error('should not be null');
  }
  expect(app.toJSON()).toEqual('node1/0');
  act(() => {
    environment.mock.resolveMostRecentOperation({
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
                  name: 'node2',
                  username: 'username:node:2',
                },
              },
              {
                cursor: 'cursor:3',
                node: {
                  __typename: 'User',
                  id: 'node:3',
                  name: 'node3',
                  username: 'username:node:3',
                },
              },
            ],
            pageInfo: {
              startCursor: 'cursor:3',
              endCursor: 'cursor:3',
              // No more edges
              hasNextPage: false,
              hasPreviousPage: false,
            },
          },
        },
      },
    });
  });

  expect(app.toJSON()).toEqual('node1/2');

  act(() => {
    loadMore(1);
  });
  expect(app.toJSON()).toEqual('node1,node2/1');
  // No more prefetches
  expect(environment.mock.getAllOperations().length).toBe(0);
});

it('should not fetch when a fetch is ongoing', () => {
  const fragmentKey = environment.lookup(query.fragment).data?.node;
  // render the initial page
  let app;
  act(() => {
    app = create(
      <RelayEnvironmentProvider environment={environment}>
        <Suspense fallback="Fallback">
          {/* $FlowFixMe[incompatible-type] */}
          <Container userRef={fragmentKey} />
        </Suspense>
      </RelayEnvironmentProvider>,
    );
  });
  if (app == null) {
    throw new Error('should not be null');
  }
  expect(app.toJSON()).toEqual('node1/0');
  act(() => {
    environment.mock.resolveMostRecentOperation({
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
                  name: 'node2',
                  username: 'username:node:2',
                },
              },
              {
                cursor: 'cursor:3',
                node: {
                  __typename: 'User',
                  id: 'node:3',
                  name: 'node3',
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
  });

  expect(app.toJSON()).toEqual('node1/2');

  act(() => {
    loadMore(2);
  });
  expect(app.toJSON()).toEqual('node1,node2,node3/0');

  // A prefetch should be ongoing
  expect(environment.mock.getAllOperations().length).toBe(1);
  expect(environment.mock.getAllOperations()[0].fragment.variables.first).toBe(
    2,
  );

  act(() => {
    loadMore(1);
  });
  // There isn't a second fetch because we don't allow multiple `loadMore`s
  expect(environment.mock.getAllOperations().length).toBe(1);
  expect(environment.mock.getAllOperations()[0].fragment.variables.first).toBe(
    2,
  );
});

it('should fetch at least the minimal amount of edges defined in every pagination query', () => {
  const fragmentKey = environment.lookup(query.fragment).data?.node;
  // render the initial page
  let app;
  act(() => {
    app = create(
      <RelayEnvironmentProvider environment={environment}>
        <Suspense fallback="Fallback">
          {/* $FlowFixMe[incompatible-type] */}
          <Container userRef={fragmentKey} minimalEdgesToFetch={3} />
        </Suspense>
      </RelayEnvironmentProvider>,
    );
  });
  if (app == null) {
    throw new Error('should not be null');
  }
  expect(app.toJSON()).toEqual('node1/0');
  expect(environment.mock.getAllOperations().length).toBe(1);
  expect(environment.mock.getAllOperations()[0].fragment.variables.first).toBe(
    3,
  );
  act(() => {
    environment.mock.resolveMostRecentOperation({
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
                  name: 'node2',
                  username: 'username:node:2',
                },
              },
              {
                cursor: 'cursor:3',
                node: {
                  __typename: 'User',
                  id: 'node:3',
                  name: 'node3',
                  username: 'username:node:3',
                },
              },
              {
                cursor: 'cursor:4',
                node: {
                  __typename: 'User',
                  id: 'node:4',
                  name: 'node4',
                  username: 'username:node:4',
                },
              },
            ],
            pageInfo: {
              startCursor: 'cursor:4',
              endCursor: 'cursor:4',
              hasNextPage: true,
              hasPreviousPage: true,
            },
          },
        },
      },
    });
  });

  expect(app.toJSON()).toEqual('node1/3');

  act(() => {
    loadMore(2);
  });
  expect(app.toJSON()).toEqual('node1,node2,node3/1');

  expect(environment.mock.getAllOperations().length).toBe(1);
  expect(environment.mock.getAllOperations()[0].fragment.variables.first).toBe(
    3,
  );
});

it('loadMore should be a no-op when there is active fetching for missing items', () => {
  const fragmentKey = environment.lookup(query.fragment).data?.node;
  // render the initial page
  let app;
  act(() => {
    app = create(
      <RelayEnvironmentProvider environment={environment}>
        <Suspense fallback="Fallback">
          {/* $FlowFixMe[incompatible-type] */}
          <Container userRef={fragmentKey} />
        </Suspense>
      </RelayEnvironmentProvider>,
    );
  });
  if (app == null) {
    throw new Error('should not be null');
  }
  expect(app.toJSON()).toEqual('node1/0');
  act(() => {
    environment.mock.resolveMostRecentOperation({
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
                  name: 'node2',
                  username: 'username:node:2',
                },
              },
              {
                cursor: 'cursor:3',
                node: {
                  __typename: 'User',
                  id: 'node:3',
                  name: 'node3',
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
  });

  expect(app.toJSON()).toEqual('node1/2');

  act(() => {
    loadMore(2);
  });
  expect(app.toJSON()).toEqual('node1,node2,node3/0');

  // A prefetch should be ongoing
  expect(environment.mock.getAllOperations().length).toBe(1);
  expect(environment.mock.getAllOperations()[0].fragment.variables.first).toBe(
    2,
  );

  act(() => {
    loadMore(1);
    loadMore(2); // no-op
  });
  act(() => {
    loadMore(3); // no-op
  });

  act(() => {
    environment.mock.resolveMostRecentOperation({
      data: {
        node: {
          __typename: 'User',
          id: '1',
          name: 'Alice',
          friends: {
            edges: [
              {
                cursor: 'cursor:4',
                node: {
                  __typename: 'User',
                  id: 'node:4',
                  name: 'node4',
                  username: 'username:node:4',
                },
              },
              {
                cursor: 'cursor:5',
                node: {
                  __typename: 'User',
                  id: 'node:5',
                  name: 'node5',
                  username: 'username:node:5',
                },
              },
            ],
            pageInfo: {
              startCursor: 'cursor:5',
              endCursor: 'cursor:5',
              hasNextPage: true,
              hasPreviousPage: true,
            },
          },
        },
      },
    });
  });
  expect(app.toJSON()).toEqual('node1,node2,node3,node4/1');

  // Should only be loading more 1 items to fulfill the cache, because of subsequent
  // `loadMore` calls are no-ops
  expect(environment.mock.getAllOperations().length).toBe(1);
  expect(environment.mock.getAllOperations()[0].fragment.variables.first).toBe(
    1,
  );
});

it('should fetch the amount of items enough to fulfill the product and cache', () => {
  const fragmentKey = environment.lookup(query.fragment).data?.node;
  // render the initial page
  let app;
  act(() => {
    app = create(
      <RelayEnvironmentProvider environment={environment}>
        <Suspense fallback="Fallback">
          {/* $FlowFixMe[incompatible-type] */}
          <Container userRef={fragmentKey} />
        </Suspense>
      </RelayEnvironmentProvider>,
    );
  });
  if (app == null) {
    throw new Error('should not be null');
  }
  expect(app.toJSON()).toEqual('node1/0');
  act(() => {
    environment.mock.resolveMostRecentOperation({
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
                  name: 'node2',
                  username: 'username:node:2',
                },
              },
              {
                cursor: 'cursor:3',
                node: {
                  __typename: 'User',
                  id: 'node:3',
                  name: 'node3',
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
  });

  expect(app.toJSON()).toEqual('node1/2');

  act(() => {
    loadMore(4);
  });
  expect(app.toJSON()).toEqual('node1,node2,node3/0');

  // The product needs 2 more items from , and the hook need to fetch 2 more to fulfill the cache, thus 4 items
  expect(environment.mock.getAllOperations().length).toBe(1);
  expect(environment.mock.getAllOperations()[0].fragment.variables.first).toBe(
    4,
  );
});

it('getServerEdges should return all unfiltered server edges', () => {
  const fragmentKey = environment.lookup(query.fragment).data?.node;
  // render the initial page
  let app;
  const extraVariablesFn = jest.fn();
  // $FlowFixMe[missing-local-annot]
  const getExtraVariables = function ({hasNext, getServerEdges}) {
    const edges = getServerEdges();
    extraVariablesFn(hasNext, edges);
  };
  act(() => {
    app = create(
      <RelayEnvironmentProvider environment={environment}>
        <Suspense fallback="Fallback">
          <Container
            // $FlowFixMe[incompatible-type]
            userRef={fragmentKey}
            UNSTABLE_extraVariables={getExtraVariables}
          />
        </Suspense>
      </RelayEnvironmentProvider>,
    );
  });
  if (app == null) {
    throw new Error('app should not be null');
  }
  expect(app.toJSON()).toEqual('node1/0');

  // Prefetches 2 more
  expect(environment.mock.getAllOperations().length).toBe(1);
  expect(environment.mock.getAllOperations()[0].fragment.variables.first).toBe(
    2,
  );

  expect(extraVariablesFn).toBeCalledTimes(1);
  expect(extraVariablesFn).toBeCalledWith(true, [
    {
      cursor: 'cursor:1',
      node: {__typename: 'User', id: 'node:1', name: 'node1'},
    },
  ]);
  extraVariablesFn.mockClear();

  act(() => {
    environment.mock.resolveMostRecentOperation({
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
                  name: 'node2',
                  username: 'username:node:2',
                },
              },
              {
                cursor: 'cursor:3',
                node: {
                  __typename: 'User',
                  id: 'node:3',
                  name: 'node3',
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
  });

  act(() => {
    loadMore(1);
  });

  // 2 edges in display but 3 server edges loaded in total
  expect(app.toJSON()).toEqual('node1,node2/1');
  expect(extraVariablesFn).toBeCalledTimes(1);
  expect(extraVariablesFn).toBeCalledWith(true, [
    {
      cursor: 'cursor:1',
      node: {__typename: 'User', id: 'node:1', name: 'node1'},
    },
    {
      cursor: 'cursor:2',
      node: {__typename: 'User', id: 'node:2', name: 'node2'},
    },
    {
      cursor: 'cursor:3',
      node: {__typename: 'User', id: 'node:3', name: 'node3'},
    },
  ]);
});

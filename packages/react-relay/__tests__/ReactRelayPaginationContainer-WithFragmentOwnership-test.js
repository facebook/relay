/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

const ReactRelayContext = require('../ReactRelayContext');
const ReactRelayFragmentContainer = require('../ReactRelayFragmentContainer');
const ReactRelayPaginationContainer = require('../ReactRelayPaginationContainer');
const React = require('react');
const ReactTestRenderer = require('react-test-renderer');
const {
  ConnectionHandler,
  ROOT_ID,
  createNormalizationSelector,
  createOperationDescriptor,
  createReaderSelector,
  createRequestDescriptor,
  graphql,
} = require('relay-runtime');
const {createMockEnvironment} = require('relay-test-utils-internal');

describe('ReactRelayPaginationContainer with fragment ownership', () => {
  let TestChildComponent;
  let TestComponent;
  let TestChildContainer;
  let TestContainer;
  let UserFragment;
  let UserFriendFragment;
  let UserQuery;

  let environment;
  let getConnectionFromProps;
  let getVariables;
  let loadMore;
  let ownerUser1;
  let refetchConnection;
  let render;
  let variables;

  class ContextSetter extends React.Component {
    constructor(props) {
      super(props);

      this.__relayContext = {
        environment: props.environment,
      };

      this.state = {
        props: null,
      };
    }

    setProps(props) {
      this.setState({props});
    }
    setContext(env) {
      this.__relayContext = {
        environment: env,
      };
      this.setProps({});
    }

    render() {
      let child = React.Children.only(this.props.children);
      if (this.state.props) {
        child = React.cloneElement(child, this.state.props);
      }

      return (
        <ReactRelayContext.Provider value={this.__relayContext}>
          {child}
        </ReactRelayContext.Provider>
      );
    }
  }

  function createOwnerWithUnalteredVariables(request, vars) {
    const requestDescriptor = createRequestDescriptor(request, vars);
    const operationDescriptor = {
      fragment: createReaderSelector(
        request.fragment,
        ROOT_ID,
        vars,
        requestDescriptor,
      ),
      request: requestDescriptor,
      root: createNormalizationSelector(request.operation, ROOT_ID, vars),
    };
    return operationDescriptor;
  }

  beforeEach(() => {
    jest.resetModules();

    environment = createMockEnvironment({
      handlerProvider: () => ConnectionHandler,
    });

    UserQuery = graphql`
      query ReactRelayPaginationContainerWithFragmentOwnershipTestUserQuery(
        $after: ID
        $count: Int!
        $id: ID!
        $orderby: [String]
        $isViewerFriend: Boolean!
      ) {
        node(id: $id) {
          id
          __typename
          ...ReactRelayPaginationContainerWithFragmentOwnershipTestUserFragment
            @arguments(isViewerFriendLocal: $isViewerFriend, orderby: $orderby)
        }
      }
    `;

    UserFriendFragment = graphql`
      fragment ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment on User
      @argumentDefinitions(
        isViewerFriendLocal: {type: "Boolean", defaultValue: false}
      ) {
        id
        name @include(if: $isViewerFriendLocal)
      }
    `;

    UserFragment = graphql`
      fragment ReactRelayPaginationContainerWithFragmentOwnershipTestUserFragment on User
      @argumentDefinitions(
        isViewerFriendLocal: {type: "Boolean", defaultValue: false}
        orderby: {type: "[String]"}
      ) {
        id
        friends(
          after: $after
          first: $count
          orderby: $orderby
          isViewerFriend: $isViewerFriendLocal
        ) @connection(key: "UserFragment_friends") {
          edges {
            node {
              id
              ...ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment
                @arguments(isViewerFriendLocal: $isViewerFriendLocal)
            }
          }
        }
      }
    `;

    TestChildComponent = jest.fn(() => <div />);
    TestChildContainer = ReactRelayFragmentContainer.createContainer(
      TestChildComponent,
      {user: UserFriendFragment},
    );
    render = jest.fn(props => {
      ({loadMore, refetchConnection} = props.relay);
      const edges = props.user?.friends?.edges ?? [];
      return edges.map(edge => (
        <TestChildContainer key={edge.node.id} user={edge.node} />
      ));
    });
    variables = {
      after: null,
      count: 1,
      id: '4',
      orderby: ['name'],
      isViewerFriend: false,
    };

    getConnectionFromProps = jest.fn(props => props.user.friends);
    getVariables = jest.fn((props, {count, cursor}, fragmentVariables) => {
      return {
        ...fragmentVariables,
        id: props.user.id,
        after: cursor,
        count,
      };
    });
    TestComponent = render;
    TestComponent.displayName = 'TestComponent';
    TestContainer = ReactRelayPaginationContainer.createContainer(
      TestComponent,
      {
        user: UserFragment,
      },
      {
        direction: 'forward',
        getConnectionFromProps,
        getFragmentVariables: (vars, totalCount) => ({
          ...vars,
          isViewerFriendLocal: vars.isViewerFriend,
          count: totalCount,
        }),
        getVariables,
        query: UserQuery,
      },
    );

    // Pre-populate the store with data
    ownerUser1 = createOperationDescriptor(UserQuery, variables);
    environment.commitPayload(ownerUser1, {
      node: {
        id: '4',
        __typename: 'User',
        friends: {
          edges: [
            {
              cursor: 'cursor:1',
              node: {
                __typename: 'User',
                id: 'node:1',
                name: 'user:1',
              },
            },
          ],
          pageInfo: {
            endCursor: 'cursor:1',
            hasNextPage: true,
          },
        },
      },
    });
  });

  describe('loadMore()', () => {
    beforeEach(() => {
      const userPointer = environment.lookup(ownerUser1.fragment, ownerUser1)
        .data.node;
      environment.mock.clearCache();
      ReactTestRenderer.create(
        <ContextSetter environment={environment} variables={variables}>
          <TestContainer user={userPointer} />
        </ContextSetter>,
      );
    });

    it('calls `getVariables` with props, count/cursor, and the previous variables', () => {
      loadMore(1, jest.fn());
      expect(getVariables).toBeCalledWith(
        {
          user: {
            id: '4',
            friends: {
              edges: [
                {
                  cursor: 'cursor:1',
                  node: {
                    __typename: 'User',
                    id: 'node:1',
                    __id: 'node:1',
                    __fragments: {
                      ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment:
                        {
                          isViewerFriendLocal: false,
                        },
                    },
                    __fragmentOwner: ownerUser1.request,
                    __isWithinUnmatchedTypeRefinement: false,
                  },
                },
              ],
              pageInfo: {
                endCursor: 'cursor:1',
                hasNextPage: true,
              },
            },
          },
        },
        {
          count: 1,
          cursor: 'cursor:1',
        },
        {
          after: null, // fragment variable defaults to null
          count: 1,
          id: '4',
          orderby: ['name'],
          isViewerFriend: false,
          isViewerFriendLocal: false,
        },
      );
    });

    it('calls `getVariables` with correct previous variables when variables not set in context', () => {
      const userPointer = environment.lookup(ownerUser1.fragment, ownerUser1)
        .data.node;
      environment.mock.clearCache();
      ReactTestRenderer.create(
        <ContextSetter environment={environment} variables={{}}>
          <TestContainer user={userPointer} />
        </ContextSetter>,
      );
      loadMore(1, jest.fn());
      expect(getVariables).toBeCalledWith(
        {
          user: {
            id: '4',
            friends: {
              edges: [
                {
                  cursor: 'cursor:1',
                  node: {
                    __typename: 'User',
                    id: 'node:1',
                    __id: 'node:1',
                    __fragments: {
                      ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment:
                        {
                          isViewerFriendLocal: false,
                        },
                    },
                    __fragmentOwner: ownerUser1.request,
                    __isWithinUnmatchedTypeRefinement: false,
                  },
                },
              ],
              pageInfo: {
                endCursor: 'cursor:1',
                hasNextPage: true,
              },
            },
          },
        },
        {
          count: 1,
          cursor: 'cursor:1',
        },
        {
          after: null, // fragment variable defaults to null
          count: 1,
          id: '4',
          orderby: ['name'],
          isViewerFriend: false,
          isViewerFriendLocal: false,
        },
      );
    });

    it('fetches the new variables', () => {
      variables = {
        after: 'cursor:1',
        count: 1,
        id: '4',
        orderby: ['name'],
        isViewerFriend: false,
      };
      loadMore(1, jest.fn());
      expect(environment.mock.isLoading(UserQuery, variables)).toBe(true);
    });

    it('fetches the new variables with force option', () => {
      variables = {
        after: null, // resets to `null` to refetch connection
        count: 2, // existing edges + additional edges
        id: '4',
        orderby: ['name'],
        isViewerFriend: false,
      };
      const fetchOption = {force: true};
      loadMore(1, jest.fn(), fetchOption);
      expect(
        environment.mock.isLoading(UserQuery, variables, fetchOption),
      ).toBe(true);
    });

    it('renders with the results of the new variables on success', () => {
      expect(render.mock.calls.length).toBe(1);
      expect(render.mock.calls[0][0].user.friends.edges.length).toBe(1);
      loadMore(1, jest.fn());
      expect(render.mock.calls.length).toBe(1);

      TestComponent.mockClear();
      TestChildComponent.mockClear();
      ReactTestRenderer.act(() => {
        environment.mock.resolve(UserQuery, {
          data: {
            node: {
              id: '4',
              __typename: 'User',
              friends: {
                edges: [
                  {
                    cursor: 'cursor:2',
                    node: {
                      __typename: 'User',
                      id: 'node:2',
                      name: 'user:2',
                    },
                  },
                ],
                pageInfo: {
                  endCursor: 'cursor:2',
                  hasNextPage: true,
                },
              },
            },
          },
        });
      });

      const expectedFragmentVariables = {
        ...ownerUser1.request.variables,
        count: 2,
        // Variables propagated in fragment owner variables also include
        // fragment variables
        isViewerFriendLocal: false,
      };
      const expectedOwner = createOwnerWithUnalteredVariables(
        UserQuery,
        expectedFragmentVariables,
      );
      expect(render.mock.calls.length).toBe(1);
      expect(render.mock.calls[0][0].user.friends.edges.length).toBe(2);
      expect(render.mock.calls[0][0].user.friends.edges).toEqual([
        {
          cursor: 'cursor:1',
          node: {
            __typename: 'User',
            id: 'node:1',
            __id: 'node:1',
            __fragments: {
              ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment:
                {
                  isViewerFriendLocal: false,
                },
            },
            __fragmentOwner: expectedOwner.request,
            __isWithinUnmatchedTypeRefinement: false,
          },
        },
        {
          cursor: 'cursor:2',
          node: {
            __typename: 'User',
            id: 'node:2',
            __id: 'node:2',
            __fragments: {
              ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment:
                {
                  isViewerFriendLocal: false,
                },
            },
            __fragmentOwner: expectedOwner.request,
            __isWithinUnmatchedTypeRefinement: false,
          },
        },
      ]);

      // Assert child containers are correctly rendered
      expect(TestChildComponent.mock.calls.length).toBe(1);
      expect(TestChildComponent.mock.calls[0][0].user).toEqual({
        id: 'node:2',
      });
    });

    it('does not update variables on failure', () => {
      expect.assertions(1);
      render.mockClear();
      loadMore(1, jest.fn());
      environment.mock.reject(UserQuery, new Error('oops'));
      expect(render.mock.calls.length).toBe(0);
    });
  });

  describe('refetchConnection()', () => {
    let instance;
    let references;

    beforeEach(() => {
      references = [];
      environment.retain = () => {
        const dispose = jest.fn();
        const ref = {dispose};
        references.push(ref);
        return ref;
      };
      const userPointer = environment.lookup(ownerUser1.fragment, ownerUser1)
        .data.node;
      instance = ReactTestRenderer.create(
        <ContextSetter environment={environment} variables={variables}>
          <TestContainer user={userPointer} />
        </ContextSetter>,
      );
    });

    it('calls `getVariables` with props, totalCount, and the previous variables', () => {
      refetchConnection(1, jest.fn());
      expect(getVariables).toBeCalledWith(
        {
          user: {
            id: '4',
            friends: {
              edges: [
                {
                  cursor: 'cursor:1',
                  node: {
                    __typename: 'User',
                    id: 'node:1',
                    __id: 'node:1',
                    __fragments: {
                      ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment:
                        {
                          isViewerFriendLocal: false,
                        },
                    },
                    __fragmentOwner: ownerUser1.request,
                    __isWithinUnmatchedTypeRefinement: false,
                  },
                },
              ],
              pageInfo: {
                endCursor: 'cursor:1',
                hasNextPage: true,
              },
            },
          },
        },
        {
          count: 1,
          cursor: null,
        },
        {
          after: null, // fragment variable defaults to null
          count: 1,
          id: '4',
          orderby: ['name'],
          isViewerFriend: false,
          isViewerFriendLocal: false,
        },
      );
    });

    it('fetches the new variables', () => {
      // Assert correct pagination variables and reusing
      // vars from original parent query
      variables = {
        after: null,
        count: 1,
        id: '4',
        orderby: ['name'],
        isViewerFriend: false,
      };
      const cacheConfig = {
        force: true,
      };
      refetchConnection(1, jest.fn());
      expect(
        environment.mock.isLoading(UserQuery, variables, cacheConfig),
      ).toBe(true);
    });

    it('fetches the new variables correctly when specifying vars', () => {
      // Assert correct pagination variables and reusing
      // vars from original parent query
      variables = {
        after: null,
        count: 1,
        id: '4',
        orderby: ['name'],
        // Should use the provided value of true
        isViewerFriend: true,
      };
      const cacheConfig = {
        force: true,
      };
      refetchConnection(1, jest.fn(), {isViewerFriend: true});
      expect(
        environment.mock.isLoading(UserQuery, variables, cacheConfig),
      ).toBe(true);
    });

    it('renders with the results of the new variables on success', () => {
      expect(render.mock.calls.length).toBe(1);
      expect(render.mock.calls[0][0].user.friends.edges.length).toBe(1);
      refetchConnection(1, jest.fn());
      expect(render.mock.calls.length).toBe(1);
      environment.mock.resolve(UserQuery, {
        data: {
          node: {
            __typename: 'User',
            id: '4',
            friends: {
              edges: [
                {
                  cursor: 'cursor:2',
                  node: {
                    __typename: 'User',
                    id: 'node:2',
                    name: 'user:2',
                  },
                },
              ],
              pageInfo: {
                endCursor: 'cursor:2',
                hasNextPage: true,
              },
            },
          },
        },
      });
      const expectedFragmentVariables = {
        ...ownerUser1.request.variables,
        // Variables propagated in fragment owner variables also include
        // fragment variables
        isViewerFriendLocal: false,
      };
      const expectedOwner = createOwnerWithUnalteredVariables(
        UserQuery,
        expectedFragmentVariables,
      );
      expect(render.mock.calls.length).toBe(3);
      expect(render.mock.calls[2][0].user.friends.edges.length).toBe(1);
      expect(render.mock.calls[2][0]).toEqual({
        user: {
          id: '4',
          friends: {
            edges: [
              {
                cursor: 'cursor:2',
                node: {
                  __typename: 'User',
                  id: 'node:2',
                  __id: 'node:2',
                  __fragments: {
                    ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment:
                      {
                        isViewerFriendLocal: false,
                      },
                  },
                  __fragmentOwner: expectedOwner.request,
                  __isWithinUnmatchedTypeRefinement: false,
                },
              },
            ],
            pageInfo: {
              endCursor: 'cursor:2',
              hasNextPage: true,
            },
          },
        },
        relay: {
          environment: expect.any(Object),
          hasMore: expect.any(Function),
          isLoading: expect.any(Function),
          loadMore: expect.any(Function),
          refetchConnection: expect.any(Function),
        },
      });

      // Assert child containers are correctly rendered
      expect(TestChildComponent.mock.calls.length).toBe(2);
      expect(TestChildComponent.mock.calls[1][0].user).toEqual({
        id: 'node:2',
      });
    });

    it('renders with the results of the new variables after components received updated props (not related to the connection)', () => {
      expect.assertions(9);
      expect(render.mock.calls.length).toBe(1);
      // By default friends list should have 1 item
      expect(render.mock.calls[0][0].user.friends.edges.length).toBe(1);
      // Let's refetch with new variables
      refetchConnection(1, jest.fn(), {
        isViewerFriend: true,
      });
      expect(render.mock.calls.length).toBe(1);
      environment.mock.resolve(UserQuery, {
        data: {
          node: {
            __typename: 'User',
            id: '4',
            friends: {
              edges: [],
              pageInfo: {
                endCursor: null,
                hasNextPage: false,
              },
            },
          },
        },
      });
      expect(render.mock.calls.length).toBe(2);
      expect(render.mock.calls[1][0].user.friends.edges.length).toBe(0);
      expect(render.mock.calls[1][0]).toEqual({
        user: {
          id: '4',
          friends: {
            edges: [],
            pageInfo: {
              endCursor: null,
              hasNextPage: false,
            },
          },
        },
        relay: {
          environment: expect.any(Object),
          hasMore: expect.any(Function),
          isLoading: expect.any(Function),
          loadMore: expect.any(Function),
          refetchConnection: expect.any(Function),
        },
      });

      // This should trigger cWRP in the ReactRelayPaginationContainer
      instance.getInstance().setProps({
        someProp: 'test',
      });
      expect(render.mock.calls.length).toBe(3);
      expect(render.mock.calls[2][0].user.friends.edges.length).toBe(0);
      expect(render.mock.calls[2][0]).toEqual({
        user: {
          id: '4',
          friends: {
            edges: [],
            pageInfo: {
              endCursor: null,
              hasNextPage: false,
            },
          },
        },
        relay: {
          environment: expect.any(Object),
          hasMore: expect.any(Function),
          isLoading: expect.any(Function),
          loadMore: expect.any(Function),
          refetchConnection: expect.any(Function),
        },
        someProp: 'test',
      });
    });

    it('does not update variables on failure', () => {
      expect.assertions(1);
      render.mockClear();
      refetchConnection(1, jest.fn());
      environment.mock.reject(UserQuery, new Error('oops'));
      expect(render.mock.calls.length).toBe(0);
    });

    it('rerenders with the results of new overridden variables', () => {
      expect.assertions(10);
      expect(render.mock.calls.length).toBe(1);
      expect(render.mock.calls[0][0].user.friends.edges.length).toBe(1);
      refetchConnection(1, jest.fn(), {orderby: ['last_name']});
      expect(render.mock.calls.length).toBe(1);
      TestChildComponent.mockClear();
      environment.mock.resolve(UserQuery, {
        data: {
          node: {
            id: '4',
            __typename: 'User',
            friends: {
              edges: [
                {
                  cursor: 'cursor:7',
                  node: {
                    __typename: 'User',
                    id: 'node:7',
                    name: 'user:7',
                  },
                },
              ],
              pageInfo: {
                endCursor: 'cursor:7',
                hasNextPage: true,
              },
            },
          },
        },
      });

      const expectedFragmentVariables = {
        ...ownerUser1.request.variables,
        orderby: ['last_name'],
        // Variables propagated in fragment owner variables also include
        // fragment variables
        isViewerFriendLocal: false,
      };
      const expectedFragmentOwner = createOwnerWithUnalteredVariables(
        UserQuery,
        expectedFragmentVariables,
      );

      expect(references.length).toBe(1);
      expect(references[0].dispose).not.toBeCalled();
      expect(render.mock.calls.length).toBe(2);
      expect(render.mock.calls[1][0].user.friends.edges.length).toBe(1);
      expect(render.mock.calls[1][0]).toEqual({
        user: {
          id: '4',
          friends: {
            edges: [
              {
                cursor: 'cursor:7',
                node: {
                  __typename: 'User',
                  id: 'node:7',
                  __id: 'node:7',
                  __fragments: {
                    ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment:
                      {
                        isViewerFriendLocal: false,
                      },
                  },
                  __fragmentOwner: expectedFragmentOwner.request,
                  __isWithinUnmatchedTypeRefinement: false,
                },
              },
            ],
            pageInfo: {
              endCursor: 'cursor:7',
              hasNextPage: true,
            },
          },
        },
        relay: expect.any(Object),
      });

      // Assert child containers are correctly rendered
      expect(TestChildComponent.mock.calls.length).toBe(1);
      expect(TestChildComponent.mock.calls[0][0].user).toEqual({
        id: 'node:7',
      });
    });

    it('paginates with the results of new refetch/overridden variables', () => {
      refetchConnection(1, jest.fn(), {
        orderby: ['last_name'],
        isViewerFriend: true,
      });
      TestChildComponent.mockClear();
      environment.mock.resolve(UserQuery, {
        data: {
          node: {
            id: '4',
            __typename: 'User',
            friends: {
              edges: [
                {
                  cursor: 'cursor:7',
                  node: {
                    __typename: 'User',
                    id: 'node:7',
                    name: 'user:7',
                  },
                },
              ],
              pageInfo: {
                endCursor: 'cursor:7',
                hasNextPage: true,
              },
            },
          },
        },
      });

      let expectedFragmentVariables = {
        ...ownerUser1.request.variables,
        orderby: ['last_name'],
        isViewerFriend: true,
        // Variables propagated in fragment owner variables also include
        // fragment variables
        isViewerFriendLocal: true,
      };
      let expectedFragmentOwner = createOwnerWithUnalteredVariables(
        UserQuery,
        expectedFragmentVariables,
      );
      expect(render.mock.calls.length).toBe(2);
      expect(render.mock.calls[1][0].user.friends.edges.length).toBe(1);
      expect(render.mock.calls[1][0]).toEqual({
        user: {
          id: '4',
          friends: {
            edges: [
              {
                cursor: 'cursor:7',
                node: {
                  __typename: 'User',
                  id: 'node:7',
                  __id: 'node:7',
                  __fragments: {
                    ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment:
                      {
                        isViewerFriendLocal: true,
                      },
                  },
                  __fragmentOwner: expectedFragmentOwner.request,
                  __isWithinUnmatchedTypeRefinement: false,
                },
              },
            ],
            pageInfo: {
              endCursor: 'cursor:7',
              hasNextPage: true,
            },
          },
        },
        relay: expect.any(Object),
      });

      // Assert child containers are correctly rendered
      expect(TestChildComponent.mock.calls.length).toBe(1);
      expect(TestChildComponent.mock.calls[0][0].user).toEqual({
        id: 'node:7',
        name: 'user:7',
      });

      loadMore(1, jest.fn());
      variables = {
        after: 'cursor:7',
        count: 1,
        orderby: ['last_name'],
        isViewerFriend: true,
        id: '4',
      };
      expect(environment.mock.isLoading(UserQuery, variables)).toBe(true);

      TestComponent.mockClear();
      TestChildComponent.mockClear();
      environment.mock.resolve(UserQuery, {
        data: {
          node: {
            id: '4',
            __typename: 'User',
            friends: {
              edges: [
                {
                  cursor: 'cursor:8',
                  node: {
                    __typename: 'User',
                    id: 'node:8',
                    name: 'user:8',
                  },
                },
              ],
              pageInfo: {
                endCursor: 'cursor:8',
                hasNextPage: true,
              },
            },
          },
        },
      });

      expectedFragmentVariables = {
        ...ownerUser1.request.variables,
        count: 2,
        orderby: ['last_name'],
        isViewerFriend: true,
        // Variables propagated in fragment owner variables also include
        // fragment variables
        isViewerFriendLocal: true,
      };
      expectedFragmentOwner = createOwnerWithUnalteredVariables(
        UserQuery,
        expectedFragmentVariables,
      );
      expect(render.mock.calls.length).toBe(2);
      expect(render.mock.calls[1][0].user.friends.edges.length).toBe(2);
      expect(render.mock.calls[1][0]).toEqual({
        user: {
          id: '4',
          friends: {
            edges: [
              {
                cursor: 'cursor:7',
                node: {
                  __typename: 'User',
                  id: 'node:7',
                  __id: 'node:7',
                  __fragments: {
                    ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment:
                      {
                        isViewerFriendLocal: true,
                      },
                  },
                  __fragmentOwner: expectedFragmentOwner.request,
                  __isWithinUnmatchedTypeRefinement: false,
                },
              },
              {
                cursor: 'cursor:8',
                node: {
                  __typename: 'User',
                  id: 'node:8',
                  __id: 'node:8',
                  __fragments: {
                    ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment:
                      {
                        isViewerFriendLocal: true,
                      },
                  },
                  __fragmentOwner: expectedFragmentOwner.request,
                  __isWithinUnmatchedTypeRefinement: false,
                },
              },
            ],
            pageInfo: {
              endCursor: 'cursor:8',
              hasNextPage: true,
            },
          },
        },
        relay: expect.any(Object),
      });

      // Assert child containers are correctly rendered
      expect(TestChildComponent.mock.calls.length).toBe(1);
      expect(TestChildComponent.mock.calls[0][0].user).toEqual({
        id: 'node:8',
        name: 'user:8',
      });
    });
  });
});

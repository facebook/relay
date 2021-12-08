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
const ReactRelayPaginationContainer = require('../ReactRelayPaginationContainer');
const React = require('react');
const ReactTestRenderer = require('react-test-renderer');
const {
  ConnectionHandler,
  ConnectionInterface,
  createOperationDescriptor,
  createReaderSelector,
  graphql,
} = require('relay-runtime');
const {
  createMockEnvironment,
  unwrapContainer,
} = require('relay-test-utils-internal');

describe('ReactRelayPaginationContainer', () => {
  let TestComponent;
  let TestContainer;
  let UserFragment;
  let UserQuery;

  let environment;
  let getConnectionFromProps;
  let getVariables;
  let hasMore;
  let isLoading;
  let loadMore;
  let ownerUser1;
  let ownerUser1WithOtherVar;
  let ownerUser2;
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

  beforeEach(() => {
    jest.resetModules();

    environment = createMockEnvironment({
      handlerProvider: () => ConnectionHandler,
    });
    UserQuery = graphql`
      query ReactRelayPaginationContainerTestUserQuery(
        $after: ID
        $count: Int!
        $id: ID!
        $orderby: [String]
        $isViewerFriend: Boolean
      ) {
        node(id: $id) {
          id
          __typename
          ...ReactRelayPaginationContainerTestUserFragment
            @arguments(isViewerFriendLocal: $isViewerFriend, orderby: $orderby)
        }
      }
    `;

    UserFragment = graphql`
      fragment ReactRelayPaginationContainerTestUserFragment on User
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
            }
          }
        }
      }
    `;

    render = jest.fn(props => {
      ({hasMore, isLoading, loadMore, refetchConnection} = props.relay);
      return <div />;
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
    ownerUser1WithOtherVar = createOperationDescriptor(UserQuery, {
      ...variables,
      isViewerFriend: true,
    });
    environment.commitPayload(ownerUser1WithOtherVar, {
      node: {
        id: '4',
        __typename: 'User',
        friends: {
          edges: [],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
        },
      },
    });
    ownerUser2 = createOperationDescriptor(UserQuery, {
      ...variables,
      id: '842472',
    });
    environment.commitPayload(ownerUser2, {
      node: {
        id: '842472',
        __typename: 'User',
        friends: {
          edges: [],
          pageInfo: {
            endCursor: null,
            hasNextPage: false,
          },
        },
      },
    });
  });

  it('generates a name for containers', () => {
    expect(TestContainer.$$typeof).toBe(Symbol.for('react.forward_ref'));
    expect(TestContainer.render.displayName).toBe('Relay(TestComponent)');
  });

  it('throws for invalid fragments', () => {
    expect(() => {
      ReactRelayPaginationContainer.createContainer(TestComponent, {
        foo: null,
      });
    }).toThrowError(
      'Could not create Relay Container for `TestComponent`. ' +
        'The value of fragment `foo` was expected to be a fragment, ' +
        'got `null` instead.',
    );
  });

  it('passes non-fragment props to the component', () => {
    ReactTestRenderer.create(
      <ContextSetter environment={environment}>
        <TestContainer bar={1} foo="foo" />
      </ContextSetter>,
    );
    expect(render.mock.calls.length).toBe(1);
    expect(render.mock.calls[0][0]).toEqual({
      bar: 1,
      foo: 'foo',
      relay: {
        environment: expect.any(Object),
        hasMore: expect.any(Function),
        isLoading: expect.any(Function),
        loadMore: expect.any(Function),
        refetchConnection: expect.any(Function),
      },
      user: null,
    });
    expect(environment.lookup.mock.calls.length).toBe(0);
    expect(environment.subscribe.mock.calls.length).toBe(0);
  });

  it('passes through null props', () => {
    ReactTestRenderer.create(
      <ContextSetter environment={environment}>
        <TestContainer user={null} />
      </ContextSetter>,
    );
    // Data & Variables are passed to component
    expect(render.mock.calls.length).toBe(1);
    expect(render.mock.calls[0][0]).toEqual({
      relay: {
        environment: expect.any(Object),
        hasMore: expect.any(Function),
        isLoading: expect.any(Function),
        loadMore: expect.any(Function),
        refetchConnection: expect.any(Function),
      },
      user: null,
    });
    // Does not subscribe to updates (id is unknown)
    expect(environment.subscribe.mock.calls.length).toBe(0);
  });

  it('resolves & subscribes fragment props', () => {
    const userPointer = environment.lookup(ownerUser1.fragment, ownerUser1).data
      .node;

    ReactTestRenderer.create(
      <ContextSetter environment={environment}>
        <TestContainer user={userPointer} />
      </ContextSetter>,
    );
    // Data & Variables are passed to component
    expect(render.mock.calls.length).toBe(1);
    expect(render.mock.calls[0][0]).toEqual({
      user: {
        id: '4',
        friends: {
          edges: [
            {
              cursor: 'cursor:1',
              node: {
                __typename: 'User',
                id: 'node:1',
              },
            },
          ],
          pageInfo: {
            endCursor: 'cursor:1',
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
    // Subscribes for updates
    expect(environment.subscribe.mock.calls.length).toBe(1);
    expect(environment.subscribe.mock.calls[0][0]).toEqual({
      data: expect.any(Object),
      isMissingData: false,
      missingRequiredFields: null,
      missingClientEdges: null,
      seenRecords: expect.any(Object),
      selector: createReaderSelector(
        UserFragment,
        '4',
        {
          after: null,
          count: 1,
          orderby: ['name'],
          isViewerFriendLocal: false,
        },
        ownerUser1.request,
      ),
    });
  });

  it('re-renders on subscription callback', () => {
    const userPointer = environment.lookup(ownerUser1.fragment, ownerUser1).data
      .node;

    ReactTestRenderer.create(
      <ContextSetter environment={environment}>
        <TestContainer user={userPointer} />
      </ContextSetter>,
    );
    const callback = environment.subscribe.mock.calls[0][1];
    render.mockClear();
    environment.lookup.mockClear();
    environment.subscribe.mockClear();

    callback({
      dataID: '4',
      node: UserFragment,
      variables,
      data: {
        id: '4',
        friends: null, // set to null
      },
      seenRecords: {},
    });

    // No need to resolve props or resubscribe
    expect(environment.lookup).not.toBeCalled();
    expect(environment.subscribe).not.toBeCalled();
    // Data & Variables are passed to component
    expect(render.mock.calls.length).toBe(1);
    expect(render.mock.calls[0][0]).toEqual({
      user: {
        id: '4',
        friends: null,
      },
      relay: {
        environment: expect.any(Object),
        hasMore: expect.any(Function),
        isLoading: expect.any(Function),
        loadMore: expect.any(Function),
        refetchConnection: expect.any(Function),
      },
    });
  });

  it('resolves new props', () => {
    let userPointer = environment.lookup(ownerUser1.fragment, ownerUser1).data
      .node;
    const instance = ReactTestRenderer.create(
      <ContextSetter environment={environment}>
        <TestContainer user={userPointer} />
      </ContextSetter>,
    );
    render.mockClear();
    environment.lookup.mockClear();
    environment.subscribe.mockClear();

    userPointer = environment.lookup(ownerUser2.fragment, ownerUser2).data.node;
    instance.getInstance().setProps({
      user: userPointer,
    });

    // New data & variables are passed to component
    expect(render.mock.calls.length).toBe(1);
    expect(render.mock.calls[0][0]).toEqual({
      user: {
        id: '842472',
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
    // Container subscribes for updates on new props
    expect(environment.subscribe.mock.calls.length).toBe(1);
    expect(environment.subscribe.mock.calls[0][0]).toEqual({
      data: expect.any(Object),
      isMissingData: false,
      missingRequiredFields: null,
      missingClientEdges: null,
      seenRecords: expect.any(Object),
      selector: createReaderSelector(
        UserFragment,
        '842472',
        {
          after: null,
          count: 1,
          orderby: ['name'],
          isViewerFriendLocal: false,
        },
        ownerUser2.request,
      ),
    });
  });

  it('resolves new props when ids dont change', () => {
    let userPointer = environment.lookup(ownerUser1.fragment, ownerUser1).data
      .node;

    const instance = ReactTestRenderer.create(
      <ContextSetter environment={environment}>
        <TestContainer user={userPointer} />
      </ContextSetter>,
    );

    render.mockClear();
    environment.lookup.mockClear();
    environment.subscribe.mockClear();

    userPointer = environment.lookup(
      ownerUser1WithOtherVar.fragment,
      ownerUser1WithOtherVar,
    ).data.node;
    instance.getInstance().setProps({
      user: userPointer,
    });

    // Data & Variables are passed to component
    expect(render.mock.calls.length).toBe(1);
    expect(render.mock.calls[0][0]).toEqual({
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
    // Subscribes for updates
    expect(environment.subscribe.mock.calls.length).toBe(1);
    expect(environment.subscribe.mock.calls[0][0]).toEqual({
      data: expect.any(Object),
      isMissingData: false,
      missingRequiredFields: null,
      missingClientEdges: null,
      seenRecords: expect.any(Object),
      selector: createReaderSelector(
        UserFragment,
        '4',
        {
          after: null,
          count: 1,
          orderby: ['name'],
          isViewerFriendLocal: true,
        },
        ownerUser1WithOtherVar.request,
      ),
    });
  });

  it('resolves new props when ids dont change after paginating', () => {
    let userPointer = environment.lookup(ownerUser1.fragment, ownerUser1).data
      .node;

    const instance = ReactTestRenderer.create(
      <ContextSetter environment={environment}>
        <TestContainer user={userPointer} />
      </ContextSetter>,
    );

    render.mockClear();
    environment.lookup.mockClear();
    environment.subscribe.mockClear();

    // Paginate first
    loadMore(1, jest.fn());
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
    expect(render.mock.calls.length).toBe(1);
    expect(render.mock.calls[0][0].user.friends.edges.length).toBe(2);
    render.mockClear();
    environment.subscribe.mockClear();

    // Pass an updated user pointer that references different variables
    userPointer = environment.lookup(
      ownerUser1WithOtherVar.fragment,
      ownerUser1WithOtherVar,
    ).data.node;
    instance.getInstance().setProps({
      user: userPointer,
    });

    // Data & Variables are passed to component
    expect(render.mock.calls.length).toBe(1);
    expect(render.mock.calls[0][0]).toEqual({
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
    // Subscribes for updates
    expect(environment.subscribe.mock.calls.length).toBe(1);
    expect(environment.subscribe.mock.calls[0][0]).toEqual({
      data: expect.any(Object),
      isMissingData: false,
      missingRequiredFields: null,
      missingClientEdges: null,
      seenRecords: expect.any(Object),
      selector: createReaderSelector(
        UserFragment,
        '4',
        {
          after: null,
          count: 1,
          orderby: ['name'],
          isViewerFriendLocal: true,
        },
        ownerUser1WithOtherVar.request,
      ),
    });
  });

  it('does not update for same props/data', () => {
    const userPointer = environment.lookup(ownerUser1.fragment, ownerUser1).data
      .node;
    const instance = ReactTestRenderer.create(
      <ContextSetter environment={environment}>
        <TestContainer user={userPointer} />
      </ContextSetter>,
    );
    render.mockClear();
    environment.lookup.mockClear();
    environment.subscribe.mockClear();

    instance.getInstance().setProps({
      user: userPointer,
    });

    expect(render).not.toBeCalled();
    expect(environment.lookup).not.toBeCalled();
    expect(environment.subscribe).not.toBeCalled();
  });

  it('does not update for equal scalar props', () => {
    const userPointer = environment.lookup(ownerUser1.fragment, ownerUser1).data
      .node;
    const scalar = 42;
    const fn = () => null;
    const instance = ReactTestRenderer.create(
      <ContextSetter environment={environment}>
        <TestContainer fn={fn} nil={null} scalar={scalar} user={userPointer} />
      </ContextSetter>,
    );
    render.mockClear();
    environment.lookup.mockClear();
    environment.subscribe.mockClear();

    instance.getInstance().setProps({
      fn,
      nil: null,
      scalar,
      user: userPointer,
    });

    expect(render).not.toBeCalled();
    expect(environment.lookup).not.toBeCalled();
    expect(environment.subscribe).not.toBeCalled();
  });

  it('updates for unequal function props', () => {
    const userPointer = environment.lookup(ownerUser1.fragment, ownerUser1).data
      .node;
    const scalar = 42;
    const fn = () => null;
    const instance = ReactTestRenderer.create(
      <ContextSetter environment={environment}>
        <TestContainer fn={fn} scalar={scalar} user={userPointer} />
      </ContextSetter>,
    );
    const initialProps = render.mock.calls[0][0];
    render.mockClear();
    environment.lookup.mockClear();
    environment.subscribe.mockClear();

    const nextFn = () => null;
    instance.getInstance().setProps({
      fn: nextFn,
      scalar,
      user: userPointer,
    });

    expect(render.mock.calls.length).toBe(1);
    expect(render.mock.calls[0][0]).toEqual({
      ...initialProps,
      fn: nextFn,
    });
    expect(environment.lookup).not.toBeCalled();
    expect(environment.subscribe).not.toBeCalled();
  });

  it('updates for unequal scalar props', () => {
    const userPointer = environment.lookup(ownerUser1.fragment, ownerUser1).data
      .node;
    const scalar = 42;
    const fn = () => null;
    const instance = ReactTestRenderer.create(
      <ContextSetter environment={environment}>
        <TestContainer fn={fn} scalar={scalar} user={userPointer} />
      </ContextSetter>,
    );
    const initialProps = render.mock.calls[0][0];
    render.mockClear();
    environment.lookup.mockClear();
    environment.subscribe.mockClear();

    instance.getInstance().setProps({
      fn,
      scalar: 43,
      user: userPointer,
    });

    expect(render.mock.calls.length).toBe(1);
    expect(render.mock.calls[0][0]).toEqual({
      ...initialProps,
      scalar: 43,
    });
    expect(environment.lookup).not.toBeCalled();
    expect(environment.subscribe).not.toBeCalled();
  });

  it('always updates for non-scalar props', () => {
    const userPointer = environment.lookup(ownerUser1.fragment, ownerUser1).data
      .node;
    const instance = ReactTestRenderer.create(
      <ContextSetter environment={environment}>
        <TestContainer arr={[]} obj={{}} user={userPointer} />
      </ContextSetter>,
    );
    const initialProps = render.mock.calls[0][0];
    render.mockClear();
    environment.lookup.mockClear();
    environment.subscribe.mockClear();

    const nextArr = [];
    const nextObj = {};
    instance.getInstance().setProps({
      arr: nextArr,
      obj: nextObj,
      user: userPointer,
    });

    expect(render.mock.calls.length).toBe(1);
    expect(render.mock.calls[0][0]).toEqual(initialProps);
    expect(render.mock.calls[0][0].arr).toBe(nextArr);
    expect(render.mock.calls[0][0].obj).toBe(nextObj);
    expect(environment.lookup).not.toBeCalled();
    expect(environment.subscribe).not.toBeCalled();
  });

  it('fails if missing @connection directive', () => {
    UserQuery = graphql`
      query ReactRelayPaginationContainerTestNoConnectionUserQuery(
        $after: ID
        $count: Int!
        $id: ID!
        $orderby: [String]
      ) {
        node(id: $id) {
          id
          ...ReactRelayPaginationContainerTestNoConnectionUserFragment
        }
      }
    `;

    UserFragment = graphql`
      fragment ReactRelayPaginationContainerTestNoConnectionUserFragment on User {
        friends(after: $after, first: $count, orderby: $orderby) {
          edges {
            node {
              id
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    `;
    expect(() => {
      ReactRelayPaginationContainer.createContainer(
        TestComponent,
        {
          user: UserFragment,
        },
        {
          direction: 'forward',
          getConnectionFromProps,
          getFragmentVariables: (vars, totalCount) => ({
            ...vars,
            count: totalCount,
          }),
          getVariables,
          query: UserQuery,
        },
      );
    }).toThrowError(
      'ReactRelayPaginationContainer: A @connection directive must be present.',
    );
  });

  it('does not fail invariant if one fragment has a @connection directive', () => {
    UserQuery = graphql`
      query ReactRelayPaginationContainerTestNoConnectionOnFragmentUserQuery(
        $after: ID
        $count: Int!
        $id: ID!
        $orderby: [String]
      ) {
        viewer {
          ...ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment
        }
        node(id: $id) {
          id
          ...ReactRelayPaginationContainerTestNoConnectionOnFragmentUserFragment
        }
      }
    `;

    const ViewerFragment = graphql`
      fragment ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment on Viewer {
        actor {
          id
        }
      }
    `;
    UserFragment = graphql`
      fragment ReactRelayPaginationContainerTestNoConnectionOnFragmentUserFragment on User {
        friends(after: $after, first: $count, orderby: $orderby)
          @connection(key: "UserFragment_friends") {
          edges {
            node {
              id
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    `;

    TestContainer = ReactRelayPaginationContainer.createContainer(
      TestComponent,
      {
        user: UserFragment,
        viewer: ViewerFragment,
      },
      {
        direction: 'forward',
        getConnectionFromProps,
        getFragmentVariables: (vars, totalCount) => ({
          ...vars,
          count: totalCount,
        }),
        getVariables,
        query: UserQuery,
      },
    );

    expect(() => {
      ReactTestRenderer.create(
        <ContextSetter environment={environment}>
          <TestContainer />
        </ContextSetter>,
      );
    }).not.toThrow();
  });

  describe('hasMore()', () => {
    beforeEach(() => {
      const userPointer = environment.lookup(ownerUser1.fragment, ownerUser1)
        .data.node;
      ReactTestRenderer.create(
        <ContextSetter environment={environment}>
          <TestContainer user={userPointer} />
        </ContextSetter>,
      );
    });

    it('returns true if there are more items', () => {
      getConnectionFromProps.mockImplementation(() => ({
        edges: [],
        pageInfo: {
          endCursor: '<cursor>',
          hasNextPage: true,
        },
      }));
      expect(hasMore()).toBe(true);
    });

    it('returns false if there are no edges', () => {
      getConnectionFromProps.mockImplementation(() => ({
        edges: null,
        pageInfo: {
          endCursor: '<cursor>',
          hasNextPage: true,
        },
      }));
      expect(hasMore()).toBe(false);
    });

    it('returns false if the end cursor is null-ish', () => {
      getConnectionFromProps.mockImplementation(() => ({
        edges: [],
        pageInfo: {
          endCursor: null,
          hasNextPage: true,
        },
      }));
      expect(hasMore()).toBe(false);
    });

    it('returns false if pageInfo.hasNextPage is false-ish', () => {
      getConnectionFromProps.mockImplementation(() => ({
        edges: [],
        pageInfo: {
          endCursor: '<cursor>',
          hasNextPage: false,
        },
      }));
      expect(hasMore()).toBe(false);
    });

    it('updates after pagination (if more results)', () => {
      expect.assertions(1);
      loadMore(1, jest.fn());
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
                  },
                },
              ],
              pageInfo: {
                endCursor: 'cursor:2',
                hasNextPage: true, // <-- has more results
              },
            },
          },
        },
      });
      expect(hasMore()).toBe(true);
    });

    it('updates after pagination (if no more results)', () => {
      expect.assertions(1);
      loadMore(1, jest.fn());
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
                  },
                },
              ],
              pageInfo: {
                endCursor: 'cursor:2',
                hasNextPage: false, // <-- end of list
              },
            },
          },
        },
      });
      expect(hasMore()).toBe(false);
    });
  });

  describe('isLoading()', () => {
    beforeEach(() => {
      const userPointer = environment.lookup(ownerUser1.fragment, ownerUser1)
        .data.node;
      environment.mock.clearCache();
      ReactTestRenderer.create(
        <ContextSetter environment={environment}>
          <TestContainer user={userPointer} />
        </ContextSetter>,
      );
    });

    it('returns false initially', () => {
      expect(isLoading()).toBe(false);
    });

    it('returns true when a fetch is pending', () => {
      loadMore(10, jest.fn());
      expect(isLoading()).toBe(true);
    });

    it('returns false if a fetch is cancelled', () => {
      const {dispose} = loadMore(10, jest.fn());
      dispose();
      expect(isLoading()).toBe(false);
    });

    it('returns false once a fetch completes', () => {
      expect.assertions(1);
      loadMore(1, jest.fn());
      environment.mock.resolve(UserQuery, {
        data: {
          node: {
            id: '4',
            __typename: 'User',
            // The resuls don't matter, only that the fetch resolved
            friends: null,
          },
        },
      });
      expect(isLoading()).toBe(false);
    });

    it('returns false in the loadMore callback', () => {
      expect.assertions(2);
      loadMore(1, () => {
        expect(isLoading()).toBe(false);
      });
      environment.mock.resolve(UserQuery, {
        data: {
          node: {
            id: '4',
            __typename: 'User',
            // The resuls don't matter, only that the fetch resolved
            friends: null,
          },
        },
      });
      expect(isLoading()).toBe(false);
    });

    it('returns false if a cached response exists', () => {
      environment.mock.cachePayload(
        UserQuery,
        {
          after: 'cursor:1',
          count: 1,
          id: '4',
          orderby: ['name'],
          isViewerFriend: false,
        },
        {
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
                    },
                  },
                ],
                pageInfo: {
                  endCursor: 'cursor:2',
                  hasNextPage: true,
                  hasPreviousPage: false,
                  startCursor: 'cursor:2',
                },
              },
            },
          },
        },
      );
      loadMore(1, jest.fn());
      expect(isLoading()).toBe(false);
    });
  });

  describe('loadMore()', () => {
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

      environment.mock.clearCache();
      instance = ReactTestRenderer.create(
        <ContextSetter environment={environment}>
          <TestContainer user={userPointer} />
        </ContextSetter>,
      );
    });

    it('returns null if there are no more items to fetch', () => {
      // Simulate empty connection data
      getConnectionFromProps.mockImplementation(() => null);
      variables = {
        after: 'cursor:1',
        count: 1,
        id: '4',
      };
      expect(loadMore(1, jest.fn())).toBe(null);
      expect(environment.mock.isLoading(UserQuery, variables)).toBe(false);
    });

    it('still calls callback if even if there are no more items to fetch', () => {
      // Simulate empty connection data
      getConnectionFromProps.mockImplementation(() => null);
      variables = {
        after: 'cursor:1',
        count: 1,
        id: '4',
      };
      let callbackCalled = false;
      expect(loadMore(1, () => (callbackCalled = true))).toBe(null);
      expect(environment.mock.isLoading(UserQuery, variables)).toBe(false);
      expect(callbackCalled).toBe(true);
    });

    it('returns null if page info fields are null', () => {
      const {PAGE_INFO, END_CURSOR, HAS_NEXT_PAGE} = ConnectionInterface.get();
      // Simulate empty connection data
      getConnectionFromProps.mockImplementation(() => ({
        edges: [],
        [PAGE_INFO]: {
          [END_CURSOR]: null,
          [HAS_NEXT_PAGE]: null,
        },
      }));
      variables = {
        after: 'cursor:1',
        count: 1,
        id: '4',
      };
      expect(loadMore(1, jest.fn())).toBe(null);
      expect(environment.mock.isLoading(UserQuery, variables)).toBe(false);
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

    it('returns a disposable that can be called to cancel the fetch', () => {
      variables = {
        after: 'cursor:1',
        count: 1,
        id: '4',
      };
      const {dispose} = loadMore(1, jest.fn());
      const subscription = environment.execute.mock.subscriptions[0];
      expect(subscription.closed).toBe(false);
      dispose();
      expect(subscription.closed).toBe(true);
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

    it('calls the callback when the fetch succeeds', () => {
      expect.assertions(2);
      const callback = jest.fn();
      variables = {
        after: 'cursor:1',
        count: 1,
        id: '4',
        orderby: ['name'],
        isViewerFriend: false,
      };
      loadMore(1, callback);
      environment.mock.resolve(UserQuery, {
        data: {
          node: null,
        },
      });
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0].length).toBe(0);
    });

    it('calls the callback when the fetch fails', () => {
      expect.assertions(2);
      const callback = jest.fn();
      loadMore(1, callback);
      const error = new Error('oops');
      environment.mock.reject(UserQuery, error);
      expect(callback.mock.calls.length).toBe(1);
      expect(callback).toBeCalledWith(error);
    });

    it('calls the callback even if a cached response exists', () => {
      environment.mock.cachePayload(
        UserQuery,
        {
          after: 'cursor:1',
          count: 1,
          id: '4',
          orderby: ['name'],
          isViewerFriend: false,
        },
        {
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
                    },
                  },
                ],
                pageInfo: {
                  endCursor: 'cursor:2',
                  hasNextPage: true,
                  hasPreviousPage: false,
                  startCursor: 'cursor:2',
                },
              },
            },
          },
        },
      );
      const callback = jest.fn();
      loadMore(1, callback);
      expect(callback).toHaveBeenCalled();
    });

    it('renders with the results of the new variables on success', () => {
      expect.assertions(5);
      expect(render.mock.calls.length).toBe(1);
      expect(render.mock.calls[0][0].user.friends.edges.length).toBe(1);
      loadMore(1, jest.fn());
      expect(render.mock.calls.length).toBe(1);
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
      expect(render.mock.calls.length).toBe(2);
      expect(render.mock.calls[1][0].user.friends.edges.length).toBe(2);
    });

    it('does not update variables on failure', () => {
      expect.assertions(1);
      render.mockClear();
      loadMore(1, jest.fn());
      environment.mock.reject(UserQuery, new Error('oops'));
      expect(render.mock.calls.length).toBe(0);
    });

    it('continues the fetch if new props refer to the same records', () => {
      loadMore(1, jest.fn());
      const subscription = environment.execute.mock.subscriptions[0];
      const userPointer = environment.lookup(ownerUser1.fragment, ownerUser1)
        .data.node;
      instance.getInstance().setProps({user: userPointer});
      expect(subscription.closed).toBe(false);
    });

    it('cancels the fetch if new props refer to different records', () => {
      loadMore(1, jest.fn());
      const subscription = environment.execute.mock.subscriptions[0];
      const userPointer = environment.lookup(ownerUser2.fragment, ownerUser2)
        .data.node;
      instance.getInstance().setProps({user: userPointer});
      expect(subscription.closed).toBe(true);
    });

    it('holds pagination results if new props refer to the same records', () => {
      expect.assertions(2);
      loadMore(1, jest.fn());
      environment.mock.resolve(UserQuery, {
        data: {
          node: {
            id: '4',
            __typename: 'User',
            // The resuls don't matter, only that their results are retained
            friends: null,
          },
        },
      });
      const userPointer = environment.lookup(ownerUser1.fragment, ownerUser1)
        .data.node;
      instance.getInstance().setProps({user: userPointer});
      expect(references.length).toBe(1);
      expect(references[0].dispose).not.toBeCalled();
    });

    it('releases pagination results if new props refer to different records', () => {
      expect.assertions(2);
      loadMore(1, jest.fn());
      environment.mock.resolve(UserQuery, {
        data: {
          node: {
            id: '4',
            __typename: 'User',
            // The resuls don't matter, only that their results are retained
            friends: null,
          },
        },
      });
      const userPointer = environment.lookup(ownerUser2.fragment, ownerUser2)
        .data.node;
      instance.getInstance().setProps({user: userPointer});
      expect(references.length).toBe(1);
      expect(references[0].dispose).toBeCalled();
    });

    it('releases pagination results if unmounted', () => {
      expect.assertions(2);
      loadMore(1, jest.fn());
      environment.mock.resolve(UserQuery, {
        data: {
          node: {
            id: '4',
            __typename: 'User',
            // The resuls don't matter, only that their results are retained
            friends: null,
          },
        },
      });
      instance.unmount();
      expect(references.length).toBe(1);
      expect(references[0].dispose).toBeCalled();
    });

    it('should not load more data if container is unmounted', () => {
      const userPointer = environment.lookup(ownerUser1.fragment, ownerUser1)
        .data.node;
      instance = ReactTestRenderer.create(
        <ContextSetter environment={environment}>
          <TestContainer user={userPointer} />
        </ContextSetter>,
      );
      variables = {};
      instance.unmount();
      const callback = jest.fn();
      loadMore(1, callback);
      expect(callback).not.toBeCalled();
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
        <ContextSetter environment={environment}>
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

    it('returns a disposable that can be called to cancel the fetch', () => {
      variables = {
        count: 1,
        id: '4',
      };
      const {dispose} = refetchConnection(1, jest.fn());
      const subscription = environment.execute.mock.subscriptions[0];
      expect(subscription.closed).toBe(false);
      dispose();
      expect(subscription.closed).toBe(true);
    });

    it('fetches the new variables', () => {
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

    it('calls the callback when the fetch succeeds', () => {
      expect.assertions(2);
      const callback = jest.fn();
      variables = {
        count: 1,
        id: '4',
      };
      refetchConnection(1, callback);
      environment.mock.resolve(UserQuery, {
        data: {
          node: null,
        },
      });
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0].length).toBe(0);
    });

    it('calls the callback when the fetch fails', () => {
      expect.assertions(2);
      const callback = jest.fn();
      refetchConnection(1, callback);
      const error = new Error('oops');
      environment.mock.reject(UserQuery, error);
      expect(callback.mock.calls.length).toBe(1);
      expect(callback).toBeCalledWith(error);
    });

    it('renders with the results of the new variables on success', () => {
      expect.assertions(6);
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
      expect(render.mock.calls.length).toBe(2);
      expect(render.mock.calls[1][0].user.friends.edges.length).toBe(1);
      expect(render.mock.calls[1][0]).toEqual({
        user: {
          id: '4',
          friends: {
            edges: [
              {
                cursor: 'cursor:2',
                node: {
                  __typename: 'User',
                  id: 'node:2',
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

    it('continues the fetch if new props refer to the same records', () => {
      refetchConnection(1, jest.fn());
      const subscription = environment.execute.mock.subscriptions[0];
      const userPointer = environment.lookup(ownerUser1.fragment, ownerUser1)
        .data.node;
      instance.getInstance().setProps({user: userPointer});
      expect(subscription.closed).toBe(false);
    });

    it('cancels the fetch if new props refer to different records', () => {
      refetchConnection(1, jest.fn());
      const subscription = environment.execute.mock.subscriptions[0];
      const userPointer = environment.lookup(ownerUser2.fragment, ownerUser2)
        .data.node;
      instance.getInstance().setProps({user: userPointer});
      expect(subscription.closed).toBe(true);
    });

    it('holds pagination results if new props refer to the same records', () => {
      expect.assertions(2);
      refetchConnection(1, jest.fn());
      environment.mock.resolve(UserQuery, {
        data: {
          node: {
            id: '4',
            __typename: 'User',
            // The resuls don't matter, only that their results are retained
            friends: null,
          },
        },
      });
      const userPointer = environment.lookup(ownerUser1.fragment, ownerUser1)
        .data.node;
      instance.getInstance().setProps({user: userPointer});
      expect(references.length).toBe(1);
      expect(references[0].dispose).not.toBeCalled();
    });

    it('releases pagination results if new props refer to different records', () => {
      expect.assertions(2);
      refetchConnection(1, jest.fn());
      environment.mock.resolve(UserQuery, {
        data: {
          node: {
            id: '4',
            __typename: 'User',
            // The resuls don't matter, only that their results are retained
            friends: null,
          },
        },
      });
      const userPointer = environment.lookup(ownerUser2.fragment, ownerUser2)
        .data.node;
      instance.getInstance().setProps({user: userPointer});
      expect(references.length).toBe(1);
      expect(references[0].dispose).toBeCalled();
    });

    it('releases pagination results if unmounted', () => {
      expect.assertions(2);
      refetchConnection(1, jest.fn());
      environment.mock.resolve(UserQuery, {
        data: {
          node: {
            id: '4',
            __typename: 'User',
            // The resuls don't matter, only that their results are retained
            friends: null,
          },
        },
      });
      instance.unmount();
      expect(references.length).toBe(1);
      expect(references[0].dispose).toBeCalled();
    });

    it('rerenders with the results of new overridden variables', () => {
      expect.assertions(8);
      expect(render.mock.calls.length).toBe(1);
      expect(render.mock.calls[0][0].user.friends.edges.length).toBe(1);
      refetchConnection(1, jest.fn(), {orderby: ['last_name']});
      expect(render.mock.calls.length).toBe(1);
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
                },
              },
            ],
            pageInfo: {
              endCursor: 'cursor:7',
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
    });

    it('paginates with the results of new refetch/overridden variables', () => {
      refetchConnection(1, jest.fn(), {
        orderby: ['last_name'],
        isViewerFriend: true,
      });
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

      loadMore(2, jest.fn());
      variables = {
        after: 'cursor:7',
        count: 2,
        orderby: ['last_name'],
        isViewerFriend: true,
        id: '4',
      };
      expect(environment.mock.isLoading(UserQuery, variables)).toBe(true);
    });

    it('should not refetch connection if container is unmounted', () => {
      const userPointer = environment.lookup(ownerUser1.fragment, ownerUser1)
        .data.node;
      instance = ReactTestRenderer.create(
        <ContextSetter environment={environment}>
          <TestContainer user={userPointer} />
        </ContextSetter>,
      );
      instance.unmount();
      const callback = jest.fn();
      refetchConnection(1, callback);
      expect(callback).not.toBeCalled();
    });
  });
  it('can be unwrapped in tests', () => {
    class TestUnwrapping extends React.Component {
      render() {
        return <div>Unwrapped</div>;
      }
    }

    const TestUnwrappingContainer =
      ReactRelayPaginationContainer.createContainer(
        TestUnwrapping,
        {
          user: UserFragment,
        },
        {
          direction: 'forward',
          getConnectionFromProps,
          getFragmentVariables: (vars, totalCount) => ({
            ...vars,
            count: totalCount,
          }),
          getVariables,
          query: UserQuery,
        },
      );

    const UnwrappedComponent = unwrapContainer(TestUnwrappingContainer);

    const renderer = ReactTestRenderer.create(
      <UnwrappedComponent user={{id: '4', name: 'Mark'}} />,
    );

    expect(renderer.toJSON()).toMatchSnapshot();
  });
});

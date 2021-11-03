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
const ReactRelayRefetchContainer = require('../ReactRelayRefetchContainer');
const readContext = require('../readContext');
const React = require('react');
const ReactTestRenderer = require('react-test-renderer');
const {
  ROOT_ID,
  createNormalizationSelector,
  createOperationDescriptor,
  createReaderSelector,
  createRequestDescriptor,
  graphql,
} = require('relay-runtime');
const {createMockEnvironment} = require('relay-test-utils-internal');

describe('ReactRelayRefetchContainer with fragment ownerhsip', () => {
  let TestChildComponent;
  let TestComponent;
  let TestChildContainer;
  let TestContainer;
  let UserFragment;
  let UserFriendFragment;
  let UserQuery;

  let environment;
  let ownerUser1;
  let refetch;
  let render;
  let variables;
  let relayContext;

  class ContextSetter extends React.Component {
    constructor(props) {
      super();

      this.__relayContext = {
        environment: props.environment,
      };

      this.state = {
        props: null,
      };
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
      // eslint-disable-next-line no-shadow
      const {environment} = nextProps;
      if (environment !== this.__relayContext.environment) {
        this.__relayContext = {environment};
      }
    }
    setProps(props) {
      this.setState({props});
    }
    setContext(env, vars) {
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

    environment = createMockEnvironment();
    UserQuery = graphql`
      query ReactRelayRefetchContainerWithFragmentOwnershipTestUserQuery(
        $id: ID!
        $scale: Float!
      ) {
        node(id: $id) {
          ...ReactRelayRefetchContainerWithFragmentOwnershipTestUserFragment
        }
      }
    `;
    UserFragment = graphql`
      fragment ReactRelayRefetchContainerWithFragmentOwnershipTestUserFragment on User
      @argumentDefinitions(cond: {type: "Boolean!", defaultValue: true}) {
        id
        name @include(if: $cond)
        profile_picture(scale: $scale) {
          uri
        }
        ...ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment
          @arguments(cond: $cond)
      }
    `;
    UserFriendFragment = graphql`
      fragment ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment on User
      @argumentDefinitions(cond: {type: "Boolean!", defaultValue: true}) {
        id
        username @include(if: $cond)
      }
    `;
    TestChildComponent = jest.fn(() => <div />);
    TestChildContainer = ReactRelayFragmentContainer.createContainer(
      TestChildComponent,
      {user: UserFriendFragment},
    );
    render = jest.fn(props => {
      refetch = props.relay.refetch;
      relayContext = readContext(ReactRelayContext);
      return <TestChildContainer user={props.user} />;
    });
    variables = {id: '4', scale: 2};
    TestComponent = render;
    TestComponent.displayName = 'TestComponent';
    TestContainer = ReactRelayRefetchContainer.createContainer(
      TestComponent,
      {
        user: UserFragment,
      },
      UserQuery,
    );

    // Pre-populate the store with data
    ownerUser1 = createOperationDescriptor(UserQuery, variables);
    environment.commitPayload(ownerUser1, {
      node: {
        id: '4',
        __typename: 'User',
        name: 'Zuck',
        username: 'zuck',
        profile_picture: {
          uri: 'zuck2',
        },
      },
    });
  });

  describe('refetch()', () => {
    let instance;

    beforeEach(() => {
      const userPointer = environment.lookup(ownerUser1.fragment, ownerUser1)
        .data.node;
      environment.mock.clearCache();
      instance = ReactTestRenderer.create(
        <ContextSetter environment={environment}>
          <TestContainer user={userPointer} />
        </ContextSetter>,
      );
    });

    it('fetches the new variables', () => {
      const refetchVariables = {
        cond: false,
        id: '4',
        scale: 2,
      };
      const fetchedVariables = {id: '4', scale: 2};
      refetch(refetchVariables, null, jest.fn());
      expect(environment.mock.isLoading(UserQuery, fetchedVariables)).toBe(
        true,
      );
    });

    it('fetches the new variables correctly referencing variables from parent', () => {
      const refetchVariables = {
        cond: false,
        id: '4',
      };
      const fetchedVariables = {
        id: '4',
        scale: 2, // it reuses value of scale from original parent vars
      };
      refetch(refetchVariables, null, jest.fn());
      expect(environment.mock.isLoading(UserQuery, fetchedVariables)).toBe(
        true,
      );
    });

    it('renders with the results of the new variables on success', () => {
      expect.assertions(10);
      expect(render.mock.calls.length).toBe(1);
      expect(render.mock.calls[0][0].user).toEqual({
        id: '4',
        name: 'Zuck',
        profile_picture: {
          uri: 'zuck2',
        },
        __id: '4',
        __fragments: {
          ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment:
            {
              cond: true,
            },
        },
        __fragmentOwner: ownerUser1.request,
        __isWithinUnmatchedTypeRefinement: false,
      });
      expect(TestChildComponent.mock.calls.length).toBe(1);
      expect(TestChildComponent.mock.calls[0][0].user).toEqual({
        id: '4',
        username: 'zuck',
      });

      variables = {
        cond: false,
        id: '4',
        scale: 2,
      };

      TestComponent.mockClear();
      TestChildComponent.mockClear();

      refetch(variables, null, jest.fn());
      expect(render.mock.calls.length).toBe(0);
      environment.mock.resolve(UserQuery, {
        data: {
          node: {
            id: '4',
            __typename: 'User',
            name: 'Zuck',
            username: 'zuck',
            profile_picture: {
              uri: 'zuck2',
            },
          },
        },
      });

      // Passed down owner should contain render vars and not just fetch vars
      const expectedOwner = createOwnerWithUnalteredVariables(
        UserQuery,
        variables,
      );

      expect(render.mock.calls.length).toBe(1);
      expect(render.mock.calls[0][0].user).toEqual({
        id: '4',
        profile_picture: {
          uri: 'zuck2',
        },
        __id: '4',
        __fragments: {
          ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment:
            {
              cond: false,
            },
        },
        __fragmentOwner: expectedOwner.request,
        __isWithinUnmatchedTypeRefinement: false,
      });
      expect(render.mock.calls[0][0].user.name).toBe(undefined);

      expect(TestChildComponent.mock.calls.length).toBe(1);
      expect(TestChildComponent.mock.calls[0][0].user).toEqual({
        id: '4',
      });
    });

    it('renders with the results of the new variables on success when using render variables', () => {
      expect.assertions(10);
      expect(render.mock.calls.length).toBe(1);
      expect(render.mock.calls[0][0].user).toEqual({
        id: '4',
        name: 'Zuck',
        profile_picture: {
          uri: 'zuck2',
        },
        __id: '4',
        __fragments: {
          ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment:
            {
              cond: true,
            },
        },
        __fragmentOwner: ownerUser1.request,
        __isWithinUnmatchedTypeRefinement: false,
      });
      expect(TestChildComponent.mock.calls.length).toBe(1);
      expect(TestChildComponent.mock.calls[0][0].user).toEqual({
        id: '4',
        username: 'zuck',
      });

      const fetchVariables = {
        cond: false,
        id: '4',
        scale: 4,
      };
      const renderVariables = {
        ...fetchVariables,
        scale: 2,
      };

      TestComponent.mockClear();
      TestChildComponent.mockClear();

      refetch(fetchVariables, renderVariables, jest.fn());
      expect(render.mock.calls.length).toBe(0);
      environment.mock.resolve(UserQuery, {
        data: {
          node: {
            id: '4',
            __typename: 'User',
            name: 'Zuck',
            username: 'zuck',
            profile_picture: {
              uri: 'zuck4',
            },
          },
        },
      });

      // Passed down owner should contain render vars and not just fetch vars
      const expectedOwner = createOwnerWithUnalteredVariables(
        UserQuery,
        renderVariables,
      );

      expect(render.mock.calls.length).toBe(1);
      expect(render.mock.calls[0][0].user).toEqual({
        id: '4',
        // Uses the value for scale: 2 from renderVariables,
        // even though it was fetched with scale: 4
        profile_picture: {
          uri: 'zuck2',
        },
        __id: '4',
        __fragments: {
          ReactRelayRefetchContainerWithFragmentOwnershipTestUserFriendFragment:
            {
              cond: false,
            },
        },
        __fragmentOwner: expectedOwner.request,
        __isWithinUnmatchedTypeRefinement: false,
      });
      expect(render.mock.calls[0][0].user.name).toBe(undefined);

      expect(TestChildComponent.mock.calls.length).toBe(1);
      expect(TestChildComponent.mock.calls[0][0].user).toEqual({
        id: '4',
      });
    });

    it('passes previous variables correctly when refetchVariables is a function', () => {
      const fetchVariables = jest.fn();
      refetch(fetchVariables);
      expect(fetchVariables).toBeCalledTimes(1);
      expect(fetchVariables).toBeCalledWith({
        cond: true,
        scale: 2,
      });
    });

    it('passes previous variables correctly when refetchVariables is a function and variables are not set in context', () => {
      const userPointer = environment.lookup(ownerUser1.fragment, ownerUser1)
        .data.node;
      environment.mock.clearCache();
      instance = ReactTestRenderer.create(
        <ContextSetter environment={environment}>
          <TestContainer user={userPointer} />
        </ContextSetter>,
      );

      const fetchVariables = jest.fn();
      refetch(fetchVariables);
      expect(fetchVariables).toBeCalledTimes(1);
      expect(fetchVariables).toBeCalledWith({
        cond: true,
        scale: 2,
      });
    });

    it('updates context with the results of new variables', () => {
      expect.assertions(3);

      // original context before refetch
      expect(relayContext.environment).toEqual(environment);

      const refetchVariables = {
        cond: false,
        id: '4',
        scale: 2,
      };
      refetch(refetchVariables, null, jest.fn());

      // original context while pending refetch
      expect(relayContext.environment).toBe(environment);

      environment.mock.resolve(UserQuery, {
        data: {
          node: {
            id: '4',
            __typename: 'User',
            name: 'Zuck',
            username: 'zuck',
            profile_picture: {
              uri: 'zuck2',
            },
          },
        },
      });

      // new context after successful refetch
      expect(relayContext.environment).toBe(environment);
    });
  });
});

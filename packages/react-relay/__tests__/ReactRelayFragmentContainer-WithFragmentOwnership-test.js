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
const React = require('react');
const ReactTestRenderer = require('react-test-renderer');
const {
  createOperationDescriptor,
  createReaderSelector,
  graphql,
} = require('relay-runtime');
const {createMockEnvironment} = require('relay-test-utils-internal');

describe('ReactRelayFragmentContainer with fragment ownerhsip', () => {
  let TestComponent;
  let TestContainer;
  let UserFragment;
  let UserQuery;
  let UserQueryWithCond;

  let environment;
  let ownerUser1;
  let ownerUser1WithCondVar;
  let ownerUser2;
  let render;
  let spec;
  let variables;

  class ContextSetter extends React.Component {
    constructor(props) {
      super();
      this.__relayContext = {
        environment: props.environment,
        variables: props.variables,
      };
      this.state = {props: null};
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

  beforeEach(() => {
    jest.resetModules();

    environment = createMockEnvironment();
    UserQuery = graphql`
      query ReactRelayFragmentContainerWithFragmentOwnershipTestUserQuery(
        $id: ID!
      ) {
        node(id: $id) {
          ...ReactRelayFragmentContainerWithFragmentOwnershipTestUserFragment
        }
      }
    `;
    UserQueryWithCond = graphql`
      query ReactRelayFragmentContainerWithFragmentOwnershipTestWithCondUserQuery(
        $id: ID!
        $condGlobal: Boolean!
      ) {
        node(id: $id) {
          ...ReactRelayFragmentContainerWithFragmentOwnershipTestUserFragment
            @arguments(cond: $condGlobal)
        }
      }
    `;
    UserFragment = graphql`
      fragment ReactRelayFragmentContainerWithFragmentOwnershipTestUserFragment on User
      @argumentDefinitions(cond: {type: "Boolean!", defaultValue: true}) {
        id
        name @include(if: $cond)
        ...ReactRelayFragmentContainerWithFragmentOwnershipTestNestedUserFragment
      }
    `;
    graphql`
      fragment ReactRelayFragmentContainerWithFragmentOwnershipTestNestedUserFragment on User {
        username
      }
    `;

    render = jest.fn(() => <div />);
    spec = {
      user: UserFragment,
    };
    variables = {rootVariable: 'root'};
    TestComponent = render;
    TestComponent.displayName = 'TestComponent';
    TestContainer = ReactRelayFragmentContainer.createContainer(
      TestComponent,
      spec,
    );

    // Pre-populate the store with data
    ownerUser1 = createOperationDescriptor(UserQuery, {id: '4'});
    environment.commitPayload(ownerUser1, {
      node: {
        id: '4',
        __typename: 'User',
        name: 'Zuck',
        username: 'zuck',
      },
    });
    ownerUser1WithCondVar = createOperationDescriptor(UserQueryWithCond, {
      id: '4',
      condGlobal: false,
    });
    environment.commitPayload(ownerUser1, {
      node: {
        id: '4',
        __typename: 'User',
        username: 'zuck',
      },
    });
    ownerUser2 = createOperationDescriptor(UserQuery, {id: '842472'});
    environment.commitPayload(ownerUser2, {
      node: {
        id: '842472',
        __typename: 'User',
        name: 'Joe',
        username: 'joe',
      },
    });
  });

  it('resolves & subscribes fragment props', () => {
    const userPointer = environment.lookup(ownerUser1.fragment, ownerUser1).data
      .node;

    ReactTestRenderer.create(
      <ContextSetter environment={environment} variables={variables}>
        <TestContainer user={userPointer} />
      </ContextSetter>,
    );
    // Data & Variables are passed to component
    expect(render.mock.calls.length).toBe(1);
    expect(render.mock.calls[0][0]).toEqual({
      relay: {
        environment: environment,
      },
      user: {
        id: '4',
        name: 'Zuck',
        __id: '4',
        __fragments: {
          ReactRelayFragmentContainerWithFragmentOwnershipTestNestedUserFragment:
            {},
        },
        __fragmentOwner: ownerUser1.request,
        __isWithinUnmatchedTypeRefinement: false,
      },
    });
    // Subscribes for updates
    expect(environment.subscribe.mock.calls.length).toBe(1);
    expect(environment.subscribe.mock.calls[0][0]).toEqual({
      data: {
        id: '4',
        name: 'Zuck',
        __id: '4',
        __fragments: {
          ReactRelayFragmentContainerWithFragmentOwnershipTestNestedUserFragment:
            {},
        },
        __fragmentOwner: ownerUser1.request,
        __isWithinUnmatchedTypeRefinement: false,
      },
      missingRequiredFields: null,
      missingClientEdges: null,
      isMissingData: false,
      seenRecords: expect.any(Object),
      selector: createReaderSelector(
        UserFragment,
        '4',
        {cond: true},
        ownerUser1.request,
      ),
    });
  });

  it('re-renders on subscription callback', () => {
    const userPointer = environment.lookup(ownerUser1.fragment, ownerUser1).data
      .node;

    ReactTestRenderer.create(
      <ContextSetter environment={environment} variables={variables}>
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
      variables: {cond: true},
      data: {
        id: '4',
        // !== 'Zuck'
        name: 'Mark',
        __id: '4',
        __fragments: {
          ReactRelayFragmentContainerWithFragmentOwnershipTestNestedUserFragment:
            {},
        },
        __fragmentOwner: ownerUser1.request,
        __isWithinUnmatchedTypeRefinement: false,
      },
      seenRecords: {},
      isMissingData: false,
    });

    // No need to resolve props or resubscribe
    expect(environment.lookup).not.toBeCalled();
    expect(environment.subscribe).not.toBeCalled();
    // Data & Variables are passed to component
    expect(render.mock.calls.length).toBe(1);
    expect(render.mock.calls[0][0]).toEqual({
      relay: {
        environment: environment,
      },
      user: {
        id: '4',
        name: 'Mark',
        __id: '4',
        __fragments: {
          ReactRelayFragmentContainerWithFragmentOwnershipTestNestedUserFragment:
            {},
        },
        __fragmentOwner: ownerUser1.request,
        __isWithinUnmatchedTypeRefinement: false,
      },
    });
  });

  it('resolves new props', () => {
    let userPointer = environment.lookup(ownerUser1.fragment, ownerUser1).data
      .node;
    const instance = ReactTestRenderer.create(
      <ContextSetter environment={environment} variables={variables}>
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
      relay: {
        environment: environment,
      },
      user: {
        id: '842472',
        name: 'Joe',
        __id: '842472',
        __fragments: {
          ReactRelayFragmentContainerWithFragmentOwnershipTestNestedUserFragment:
            {},
        },
        __fragmentOwner: ownerUser2.request,
        __isWithinUnmatchedTypeRefinement: false,
      },
    });

    // Container subscribes for updates on new props
    expect(environment.subscribe.mock.calls.length).toBe(1);
    expect(environment.subscribe.mock.calls[0][0]).toEqual({
      data: {
        id: '842472',
        name: 'Joe',
        __id: '842472',
        __fragments: {
          ReactRelayFragmentContainerWithFragmentOwnershipTestNestedUserFragment:
            {},
        },
        __fragmentOwner: ownerUser2.request,
        __isWithinUnmatchedTypeRefinement: false,
      },
      missingRequiredFields: null,
      missingClientEdges: null,
      isMissingData: false,
      seenRecords: expect.any(Object),
      selector: createReaderSelector(
        UserFragment,
        '842472',
        {cond: true},
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
      ownerUser1WithCondVar.fragment,
      ownerUser1WithCondVar,
    ).data.node;
    instance.getInstance().setProps({
      user: userPointer,
    });

    // New data & variables are passed to component
    expect(render.mock.calls.length).toBe(1);
    expect(render.mock.calls[0][0]).toEqual({
      relay: {
        environment: environment,
      },
      user: {
        id: '4',
        // Name is excluded since value of cond is now false
        __id: '4',
        __fragments: {
          ReactRelayFragmentContainerWithFragmentOwnershipTestNestedUserFragment:
            {},
        },
        __fragmentOwner: ownerUser1WithCondVar.request,
        __isWithinUnmatchedTypeRefinement: false,
      },
    });
    // Container subscribes for updates on new props
    expect(environment.subscribe.mock.calls.length).toBe(1);
    expect(environment.subscribe.mock.calls[0][0]).toEqual({
      data: {
        id: '4',
        // Name is excluded since value of cond is now false
        __id: '4',
        __fragments: {
          ReactRelayFragmentContainerWithFragmentOwnershipTestNestedUserFragment:
            {},
        },
        __fragmentOwner: ownerUser1WithCondVar.request,
        __isWithinUnmatchedTypeRefinement: false,
      },
      missingRequiredFields: null,
      missingClientEdges: null,
      isMissingData: false,
      seenRecords: expect.any(Object),
      selector: createReaderSelector(
        UserFragment,
        '4',
        {cond: false},
        ownerUser1WithCondVar.request,
      ),
    });
  });
});

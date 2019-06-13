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

const React = require('React');
const ReactRelayContext = require('../ReactRelayContext');
const ReactRelayFragmentContainer = require('../ReactRelayFragmentContainer');
const ReactTestRenderer = require('ReactTestRenderer');

const {createOperationDescriptor} = require('relay-runtime');
const {
  createMockEnvironment,
  generateAndCompile,
  matchers,
} = require('relay-test-utils-internal');

describe('ReactRelayFragmentContainer with fragment ownerhsip', () => {
  let TestComponent;
  let TestContainer;
  let UserFragment;
  let UserQuery;

  let environment;
  let ownerUser1;
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
      const {environment, variables} = nextProps;
      if (
        environment !== this.__relayContext.environment ||
        variables !== this.__relayContext.variables
      ) {
        this.__relayContext = {environment, variables};
      }
    }
    setProps(props) {
      this.setState({props});
    }
    setContext(env, vars) {
      this.__relayContext = {
        environment: env,
        variables: vars,
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
    expect.extend(matchers);

    environment = createMockEnvironment();
    ({UserFragment, UserQuery} = generateAndCompile(`
      query UserQuery($id: ID!) {
        node(id: $id) {
          ...UserFragment
        }
      }

      fragment UserFragment on User @argumentDefinitions(
        cond: {type: "Boolean!", defaultValue: true}
      ) {
        id
        name @include(if: $cond)
        ...NestedUserFragment
      }

      fragment NestedUserFragment on User {
        username
      }
    `));

    render = jest.fn(() => <div />);
    spec = {
      user: () => UserFragment,
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
        __fragments: {NestedUserFragment: {}},
        __fragmentOwner: ownerUser1,
      },
    });
    // Subscribes for updates
    expect(environment.subscribe.mock.calls.length).toBe(1);
    expect(environment.subscribe.mock.calls[0][0]).toEqual({
      dataID: '4',
      data: {
        id: '4',
        name: 'Zuck',
        __id: '4',
        __fragments: {NestedUserFragment: {}},
        __fragmentOwner: ownerUser1,
      },
      node: UserFragment,
      seenRecords: expect.any(Object),
      variables: {cond: true},
      isMissingData: false,
      owner: ownerUser1,
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
        name: 'Mark', // !== 'Zuck'
        __id: '4',
        __fragments: {NestedUserFragment: {}},
        __fragmentOwner: ownerUser1,
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
        __fragments: {NestedUserFragment: {}},
        __fragmentOwner: ownerUser1,
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
        __fragments: {NestedUserFragment: {}},
        __fragmentOwner: ownerUser2,
      },
    });

    // Container subscribes for updates on new props
    expect(environment.subscribe.mock.calls.length).toBe(1);
    expect(environment.subscribe.mock.calls[0][0]).toEqual({
      dataID: '842472',
      data: {
        id: '842472',
        name: 'Joe',
        __id: '842472',
        __fragments: {NestedUserFragment: {}},
        __fragmentOwner: ownerUser2,
      },
      node: UserFragment,
      seenRecords: expect.any(Object),
      variables: {cond: true},
      isMissingData: false,
      owner: ownerUser2,
    });
  });

  it('resolves for new variables in context', () => {
    const userPointer = environment.lookup(ownerUser1.fragment, ownerUser1).data
      .node;
    const instance = ReactTestRenderer.create(
      <ContextSetter environment={environment} variables={variables}>
        <TestContainer user={userPointer} />
      </ContextSetter>,
    );
    render.mockClear();
    environment.lookup.mockClear();
    environment.subscribe.mockClear();

    instance.getInstance().setContext(environment, {id: '6'});

    // New data & variables are passed to component
    expect(render.mock.calls.length).toBe(1);
    expect(render.mock.calls[0][0]).toEqual({
      relay: {
        environment: environment,
      },
      user: {
        id: '4',
        name: 'Zuck',
        __id: '4',
        __fragments: {NestedUserFragment: {}},
        __fragmentOwner: ownerUser1,
      },
    });
    // Container subscribes for updates on new props
    expect(environment.subscribe.mock.calls.length).toBe(1);
    expect(environment.subscribe.mock.calls[0][0]).toEqual({
      dataID: '4',
      data: {
        id: '4',
        name: 'Zuck',
        __id: '4',
        __fragments: {NestedUserFragment: {}},
        __fragmentOwner: ownerUser1,
      },
      node: UserFragment,
      seenRecords: expect.any(Object),
      variables: {cond: true},
      isMissingData: false,
      owner: ownerUser1,
    });
  });
});

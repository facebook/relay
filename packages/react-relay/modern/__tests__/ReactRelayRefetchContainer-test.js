/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

jest.autoMockOff();

const React = require('React');
const ReactRelayRefetchContainer = require('ReactRelayRefetchContainer');
const ReactRelayPropTypes = require('ReactRelayPropTypes');
const ReactTestRenderer = require('ReactTestRenderer');
const {createMockEnvironment} = require('RelayModernMockEnvironment');
const RelayModernTestUtils = require('RelayModernTestUtils');
const {createOperationSelector} = require('RelayModernOperationSelector');

const {ROOT_ID} = require('RelayStoreUtils');

describe('ReactRelayRefetchContainer', () => {
  let TestComponent;
  let TestContainer;
  let UserFragment;
  let UserQuery;

  let environment;
  let refetch;
  let render;
  let variables;

  class ContextSetter extends React.Component {
    constructor(props) {
      super();
      // eslint-disable-next-line no-shadow
      const {environment, variables} = props;
      this.relay = {environment, variables};
      this.state = {props: null};
    }
    componentWillReceiveProps(nextProps) {
      // eslint-disable-next-line no-shadow
      const {environment, variables} = nextProps;
      if (
        environment !== this.relay.environment ||
        variables !== this.relay.variables
      ) {
        this.relay = {environment, variables};
      }
    }
    getChildContext() {
      return {relay: this.relay};
    }
    setProps(props) {
      this.setState({props});
    }
    setContext(env, vars) {
      this.relay = {environment: env, variables: vars};
      this.setState({context: {environment: env, variables: vars}});
    }
    render() {
      const child = React.Children.only(this.props.children);
      if (this.state.props) {
        return React.cloneElement(child, this.state.props);
      }
      return child;
    }
  }
  ContextSetter.childContextTypes = {
    relay: ReactRelayPropTypes.Relay,
  };

  beforeEach(() => {
    jest.resetModules();
    jest.addMatchers(RelayModernTestUtils.matchers);

    environment = createMockEnvironment();
    ({UserFragment, UserQuery} = environment.mock.compile(
      `
      query UserQuery(
        $id: ID!
      ) {
        node(id: $id) {
          ...UserFragment
        }
      }

      fragment UserFragment on User @argumentDefinitions(
        cond: {type: "Boolean!", defaultValue: true}
      ) {
        id
        name @include(if: $cond)
      }
    `,
    ));

    render = jest.fn(props => {
      refetch = props.relay.refetch;
      return <div />;
    });
    variables = {};
    TestComponent = render;
    TestComponent.displayName = 'TestComponent';
    TestContainer = ReactRelayRefetchContainer.createContainer(
      TestComponent,
      {
        user: () => UserFragment,
      },
      UserQuery,
    );

    // Pre-populate the store with data
    environment.commitPayload(createOperationSelector(UserQuery, {id: '4'}), {
      node: {
        id: '4',
        __typename: 'User',
        name: 'Zuck',
      },
    });
    environment.commitPayload(
      createOperationSelector(UserQuery, {id: '842472'}),
      {
        node: {
          id: '842472',
          __typename: 'User',
          name: 'Joe',
        },
      },
    );
  });

  it('generates a name for containers', () => {
    expect(TestContainer.displayName).toBe('Relay(TestComponent)');
  });

  it('throws for invalid fragments', () => {
    expect(() => {
      ReactRelayRefetchContainer.createContainer(TestComponent, {
        foo: null,
      });
    }).toFailInvariant(
      'Could not create Relay Container for `TestComponent`. ' +
        'The value of fragment `foo` was expected to be a fragment, ' +
        'got `null` instead.',
    );
  });

  it('passes non-fragment props to the component', () => {
    ReactTestRenderer.create(
      <ContextSetter environment={environment} variables={variables}>
        <TestContainer bar={1} foo={'foo'} />
      </ContextSetter>,
    );
    expect(render.mock.calls.length).toBe(1);
    expect(render.mock.calls[0][0]).toEqual({
      bar: 1,
      foo: 'foo',
      relay: {
        environment: jasmine.any(Object),
        refetch: jasmine.any(Function),
      },
      user: null,
    });
    expect(environment.lookup.mock.calls.length).toBe(0);
    expect(environment.subscribe.mock.calls.length).toBe(0);
  });

  it('passes through null props', () => {
    ReactTestRenderer.create(
      <ContextSetter environment={environment} variables={variables}>
        <TestContainer user={null} />
      </ContextSetter>,
    );
    // Data & Variables are passed to component
    expect(render.mock.calls.length).toBe(1);
    expect(render.mock.calls[0][0]).toEqual({
      relay: {
        environment: jasmine.any(Object),
        refetch: jasmine.any(Function),
      },
      user: null,
    });
    // Does not subscribe to updates (id is unknown)
    expect(environment.subscribe.mock.calls.length).toBe(0);
  });

  it('resolves & subscribes fragment props', () => {
    const userPointer = environment.lookup({
      dataID: ROOT_ID,
      node: UserQuery.fragment,
      variables: {id: '4'},
    }).data.node;

    ReactTestRenderer.create(
      <ContextSetter environment={environment} variables={variables}>
        <TestContainer user={userPointer} />
      </ContextSetter>,
    );
    // Data & Variables are passed to component
    expect(render.mock.calls.length).toBe(1);
    expect(render.mock.calls[0][0]).toEqual({
      user: {
        id: '4',
        name: 'Zuck',
      },
      relay: {
        environment: jasmine.any(Object),
        refetch: jasmine.any(Function),
      },
    });
    // Subscribes for updates
    expect(environment.subscribe.mock.calls.length).toBe(1);
    expect(environment.subscribe.mock.calls[0][0]).toEqual({
      dataID: '4',
      data: {
        id: '4',
        name: 'Zuck',
      },
      node: UserFragment,
      seenRecords: jasmine.any(Object),
      variables: {cond: true},
    });
  });

  it('re-renders on subscription callback', () => {
    const userPointer = environment.lookup({
      dataID: ROOT_ID,
      node: UserQuery.fragment,
      variables: {id: '4'},
    }).data.node;

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
        name: 'Mark',
      },
      relay: {
        environment: jasmine.any(Object),
        refetch: jasmine.any(Function),
      },
    });
  });

  it('resolves new props', () => {
    let userPointer = environment.lookup({
      dataID: ROOT_ID,
      node: UserQuery.fragment,
      variables: {id: '4'},
    }).data.node;
    const instance = ReactTestRenderer.create(
      <ContextSetter environment={environment} variables={variables}>
        <TestContainer user={userPointer} />
      </ContextSetter>,
    );
    render.mockClear();
    environment.lookup.mockClear();
    environment.subscribe.mockClear();

    userPointer = environment.lookup({
      dataID: ROOT_ID,
      node: UserQuery.fragment,
      variables: {id: '842472'},
    }).data.node;
    instance.getInstance().setProps({
      user: userPointer,
    });

    // New data & variables are passed to component
    expect(render.mock.calls.length).toBe(1);
    expect(render.mock.calls[0][0]).toEqual({
      user: {
        id: '842472',
        name: 'Joe',
      },
      relay: {
        environment: jasmine.any(Object),
        refetch: jasmine.any(Function),
      },
    });
    // Container subscribes for updates on new props
    expect(environment.subscribe.mock.calls.length).toBe(1);
    expect(environment.subscribe.mock.calls[0][0]).toEqual({
      dataID: '842472',
      data: {
        id: '842472',
        name: 'Joe',
      },
      node: UserFragment,
      seenRecords: jasmine.any(Object),
      variables: {cond: true},
    });
  });

  it('resolves for new variables in context', () => {
    const userPointer = environment.lookup({
      dataID: ROOT_ID,
      node: UserQuery.fragment,
      variables: {id: '4'},
    }).data.node;
    const instance = ReactTestRenderer.create(
      <ContextSetter environment={environment} variables={variables}>
        <TestContainer user={userPointer} />
      </ContextSetter>,
    );
    render.mockClear();
    environment.lookup.mockClear();
    environment.subscribe.mockClear();

    // Update the variables in context
    const newVariables = {id: '4'};
    instance.getInstance().setContext(environment, newVariables);

    // New data & variables are passed to component
    expect(render.mock.calls.length).toBe(1);
    expect(render.mock.calls[0][0]).toEqual({
      user: {
        id: '4',
        name: 'Zuck',
      },
      relay: {
        environment: jasmine.any(Object),
        refetch: jasmine.any(Function),
      },
    });
    // Container subscribes for updates on new props
    expect(environment.subscribe.mock.calls.length).toBe(1);
    expect(environment.subscribe.mock.calls[0][0]).toEqual({
      dataID: '4',
      data: {
        id: '4',
        name: 'Zuck',
      },
      node: UserFragment,
      seenRecords: jasmine.any(Object),
      variables: {cond: true},
    });
  });

  it('does not update for same props/data', () => {
    const userPointer = environment.lookup({
      dataID: ROOT_ID,
      node: UserQuery.fragment,
      variables: {id: '4'},
    }).data.node;
    const instance = ReactTestRenderer.create(
      <ContextSetter environment={environment} variables={variables}>
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
    const userPointer = environment.lookup({
      dataID: ROOT_ID,
      node: UserQuery.fragment,
      variables: {id: '4'},
    }).data.node;
    const scalar = 42;
    const fn = () => null;
    const instance = ReactTestRenderer.create(
      <ContextSetter environment={environment} variables={variables}>
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
    const userPointer = environment.lookup({
      dataID: ROOT_ID,
      node: UserQuery.fragment,
      variables: {id: '4'},
    }).data.node;
    const scalar = 42;
    const fn = () => null;
    const instance = ReactTestRenderer.create(
      <ContextSetter environment={environment} variables={variables}>
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
    const userPointer = environment.lookup({
      dataID: ROOT_ID,
      node: UserQuery.fragment,
      variables: {id: '4'},
    }).data.node;
    const scalar = 42;
    const fn = () => null;
    const instance = ReactTestRenderer.create(
      <ContextSetter environment={environment} variables={variables}>
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
    const userPointer = environment.lookup({
      dataID: ROOT_ID,
      node: UserQuery.fragment,
      variables: {id: '4'},
    }).data.node;
    const instance = ReactTestRenderer.create(
      <ContextSetter environment={environment} variables={variables}>
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

  describe('refetch()', () => {
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
      const userPointer = environment.lookup({
        dataID: ROOT_ID,
        node: UserQuery.fragment,
        variables: {id: '4'},
      }).data.node;
      instance = ReactTestRenderer.create(
        <ContextSetter environment={environment} variables={variables}>
          <TestContainer user={userPointer} />
        </ContextSetter>,
      );
    });

    it('fetches the new variables', () => {
      const refetchVariables = {
        cond: false,
        id: '4',
      };
      const fetchedVariables = {id: '4'};
      refetch(refetchVariables, null, jest.fn());
      expect(environment.mock.isLoading(UserQuery, fetchedVariables)).toBe(
        true,
      );
      environment.mock.resolve(UserQuery, {
        data: {
          node: {
            id: '4',
            __typename: 'User',
          },
        },
      });
    });

    it('calls the callback when the fetch succeeds', async () => {
      expect.assertions(2);
      const callback = jest.fn();
      variables = {
        cond: false,
        id: '4',
      };
      refetch(variables, null, callback);
      await environment.mock.resolve(UserQuery, {
        data: {
          node: {
            id: '4',
            __typename: 'User',
          },
        },
      });
      expect(callback.mock.calls.length).toBe(1);
      expect(callback.mock.calls[0].length).toBe(0);
    });

    it('calls the callback when the fetch fails', async () => {
      expect.assertions(2);
      const callback = jest.fn();
      variables = {
        cond: false,
        id: '4',
      };
      refetch(variables, null, callback);
      const error = new Error('oops');
      await environment.mock.reject(UserQuery, error);
      expect(callback.mock.calls.length).toBe(1);
      expect(callback).toBeCalledWith(error);
    });

    it('renders with the results of the new variables on success', async () => {
      expect.assertions(5);
      expect(render.mock.calls.length).toBe(1);
      expect(render.mock.calls[0][0].user.name).toBe('Zuck');
      variables = {
        cond: false,
        id: '4',
      };
      refetch(variables, null, jest.fn());
      expect(render.mock.calls.length).toBe(1);
      await environment.mock.resolve(UserQuery, {
        data: {
          node: {
            id: '4',
            __typename: 'User',
            name: 'Zuck',
          },
        },
      });
      expect(render.mock.calls.length).toBe(2);
      expect(render.mock.calls[1][0].user.name).toBe(undefined);
    });

    it('does not update variables on failure', async () => {
      expect.assertions(4);
      expect(render.mock.calls.length).toBe(1);
      expect(render.mock.calls[0][0].user.name).toBe('Zuck');
      variables = {
        cond: false,
        id: '4',
      };
      refetch(variables, null, jest.fn());
      expect(render.mock.calls.length).toBe(1);
      await environment.mock.reject(UserQuery, new Error('oops'));
      expect(render.mock.calls.length).toBe(1);
    });

    it('continues the fetch if new props refer to the same records', () => {
      variables = {
        cond: false,
        id: '4',
      };
      refetch(variables, null, jest.fn());
      const dispose = environment.streamQuery.mock.dispose;
      const userPointer = environment.lookup({
        dataID: ROOT_ID,
        node: UserQuery.fragment,
        variables: {id: '4'}, // same user
      }).data.node;
      instance.getInstance().setProps({user: userPointer});
      expect(dispose).not.toBeCalled();
    });

    it('cancels the fetch if new props refer to different records', () => {
      variables = {
        cond: false,
        id: '4',
      };
      refetch(variables, null, jest.fn());
      const dispose = environment.streamQuery.mock.dispose;
      const userPointer = environment.lookup({
        dataID: ROOT_ID,
        node: UserQuery.fragment,
        variables: {id: '842472'}, // different user
      }).data.node;
      instance.getInstance().setProps({user: userPointer});
      expect(dispose).toBeCalled();
    });

    it('holds refetch results if new props refer to the same records', async () => {
      expect.assertions(2);
      variables = {
        cond: false,
        id: '4',
      };
      refetch(variables, null, jest.fn());
      await environment.mock.resolve(UserQuery, {
        data: {
          node: {
            id: '4',
            __typename: 'User',
          },
        },
      });
      const userPointer = environment.lookup({
        dataID: ROOT_ID,
        node: UserQuery.fragment,
        variables: {id: '4'}, // same user
      }).data.node;
      instance.getInstance().setProps({user: userPointer});
      expect(references.length).toBe(1);
      expect(references[0].dispose).not.toBeCalled();
    });

    it('releases refetch results if new props refer to different records', async () => {
      expect.assertions(2);
      variables = {
        cond: false,
        id: '4',
      };
      refetch(variables, null, jest.fn());
      await environment.mock.resolve(UserQuery, {
        data: {
          node: {
            id: '4',
            __typename: 'User',
          },
        },
      });
      const userPointer = environment.lookup({
        dataID: ROOT_ID,
        node: UserQuery.fragment,
        variables: {id: '842472'}, // different user
      }).data.node;
      instance.getInstance().setProps({user: userPointer});
      expect(references.length).toBe(1);
      expect(references[0].dispose).toBeCalled();
    });
  });
});

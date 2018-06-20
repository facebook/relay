/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

const React = require('React');
const ReactRelayPropTypes = require('../ReactRelayPropTypes');
const ReactRelayRefetchContainer = require('../ReactRelayRefetchContainer');
const ReactTestRenderer = require('ReactTestRenderer');
const RelayModernTestUtils = require('RelayModernTestUtils');

const {createMockEnvironment} = require('RelayModernMockEnvironment');
const {createOperationSelector, ROOT_ID} = require('RelayRuntime');

describe('ReactRelayRefetchContainer', () => {
  let TestComponent;
  let TestContainer;
  let UserFragment;
  let UserQuery;

  let environment;
  let refetch;
  let render;
  let variables;
  let ContextGetter;
  let relayContext;

  class ContextSetter extends React.Component {
    constructor(props) {
      super();
      // eslint-disable-next-line no-shadow
      const {environment, variables} = props;
      this.relay = {environment, variables};
      this.state = {props: null};
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
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
    expect.extend(RelayModernTestUtils.matchers);

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

    ContextGetter = class extends React.Component {
      componentDidMount() {
        relayContext = this.context.relay;
      }
      componentDidUpdate() {
        relayContext = this.context.relay;
      }
      render() {
        return <div />;
      }
    };
    ContextGetter.contextTypes = {
      relay: ReactRelayPropTypes.Relay,
    };

    render = jest.fn(props => {
      refetch = props.relay.refetch;
      return <ContextGetter />;
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
    expect(TestContainer.$$typeof).toBe(Symbol.for('react.forward_ref'));
    expect(TestContainer.render.displayName).toBe('Relay(TestComponent)');
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

  it('passes through context', () => {
    ReactTestRenderer.create(
      <ContextSetter environment={environment} variables={variables}>
        <TestContainer user={null} />
      </ContextSetter>,
    );
    expect(relayContext.environment).toBe(environment);
    expect(relayContext.variables).toBe(variables);
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
    // Context object should be mutated (for compat with gDSFP).
    const context = instance.getInstance().getChildContext();
    context.relay.variables = {id: '4'};
    instance.getInstance().setProps({});

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
      environment.mock.clearCache();
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

    it('calls the callback when the fetch succeeds', () => {
      expect.assertions(2);
      const callback = jest.fn();
      variables = {
        cond: false,
        id: '4',
      };
      refetch(variables, null, callback);
      environment.mock.resolve(UserQuery, {
        data: {
          node: {
            id: '4',
            __typename: 'User',
          },
        },
      });
      expect(callback.mock.calls.length).toBe(1);
      expect(callback).toBeCalledWith(undefined);
    });

    it('calls the callback when the fetch succeeds after every update', () => {
      const callback = jest.fn();
      variables = {
        cond: false,
        id: '4',
      };
      refetch(variables, null, callback);
      environment.mock.nextValue(UserQuery, {
        data: {
          node: {
            id: '4',
            __typename: 'User',
          },
        },
      });
      expect(callback.mock.calls.length).toBe(1);
      expect(callback).toBeCalledWith(undefined);

      environment.mock.nextValue(UserQuery, {
        data: {
          node: {
            id: '4',
            __typename: 'User',
          },
        },
      });
      expect(callback.mock.calls.length).toBe(2);
      expect(callback).toBeCalledWith(undefined);

      environment.mock.complete(UserQuery);
      expect(callback.mock.calls.length).toBe(2);
    });

    it('calls the callback when the fetch fails', () => {
      expect.assertions(2);
      const callback = jest.fn();
      variables = {
        cond: false,
        id: '4',
      };
      refetch(variables, null, callback);
      const error = new Error('oops');
      environment.mock.reject(UserQuery, error);
      expect(callback.mock.calls.length).toBe(1);
      expect(callback).toBeCalledWith(error);
    });

    it('calls the callback even if the response is cached', () => {
      const refetchVariables = {
        cond: false,
        id: '4',
      };
      const fetchedVariables = {id: '4'};
      environment.mock.cachePayload(UserQuery, fetchedVariables, {
        data: {
          node: {
            id: '4',
            __typename: 'User',
            name: 'Zuck',
          },
        },
      });
      const callback = jest.fn();
      refetch(refetchVariables, null, callback);
      expect(callback).toHaveBeenCalled();
    });

    it('returns false for isLoading if the response comes from cache', () => {
      const refetchVariables = {
        cond: false,
        id: '4',
      };
      const fetchedVariables = {id: '4'};
      environment.mock.cachePayload(UserQuery, fetchedVariables, {
        data: {
          node: {
            id: '4',
            __typename: 'User',
            name: 'Zuck',
          },
        },
      });
      refetch(refetchVariables, null, jest.fn());
      expect(environment.mock.isLoading(UserQuery, fetchedVariables)).toBe(
        false,
      );
    });

    it('renders with the results of the new variables on success', () => {
      expect.assertions(5);
      expect(render.mock.calls.length).toBe(1);
      expect(render.mock.calls[0][0].user.name).toBe('Zuck');
      variables = {
        cond: false,
        id: '4',
      };
      refetch(variables, null, jest.fn());
      expect(render.mock.calls.length).toBe(1);
      environment.mock.resolve(UserQuery, {
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

    it('updates context with the results of new variables', () => {
      expect.assertions(6);

      // original context before refetch
      expect(relayContext.environment).toEqual(environment);
      expect(relayContext.variables).toBe(variables);

      const refetchVariables = {
        cond: false,
        id: '4',
      };
      refetch(refetchVariables, null, jest.fn());

      // original context while pending refetch
      expect(relayContext.environment).toBe(environment);
      expect(relayContext.variables).toBe(variables);

      environment.mock.resolve(UserQuery, {
        data: {
          node: {
            id: '4',
            __typename: 'User',
            name: 'Zuck',
          },
        },
      });

      // new context after successful refetch
      expect(relayContext.environment).toBe(environment);
      expect(relayContext.variables).toEqual(refetchVariables);
    });

    it('does not update variables on failure', () => {
      expect.assertions(4);
      expect(render.mock.calls.length).toBe(1);
      expect(render.mock.calls[0][0].user.name).toBe('Zuck');
      variables = {
        cond: false,
        id: '4',
      };
      refetch(variables, null, jest.fn());
      expect(render.mock.calls.length).toBe(1);
      environment.mock.reject(UserQuery, new Error('oops'));
      expect(render.mock.calls.length).toBe(1);
    });

    it('continues the fetch if new props refer to the same records', () => {
      variables = {
        cond: false,
        id: '4',
      };
      refetch(variables, null, jest.fn());
      const subscription = environment.execute.mock.subscriptions[0];
      const userPointer = environment.lookup({
        dataID: ROOT_ID,
        node: UserQuery.fragment,
        variables: {id: '4'}, // same user
      }).data.node;
      instance.getInstance().setProps({user: userPointer});
      expect(subscription.closed).toBe(false);
    });

    it('cancels the fetch if new props refer to different records', () => {
      variables = {
        cond: false,
        id: '4',
      };
      refetch(variables, null, jest.fn());
      const subscription = environment.execute.mock.subscriptions[0];
      const userPointer = environment.lookup({
        dataID: ROOT_ID,
        node: UserQuery.fragment,
        variables: {id: '842472'}, // different user
      }).data.node;
      instance.getInstance().setProps({user: userPointer});
      expect(subscription.closed).toBe(true);
    });

    it('holds refetch results if new props refer to the same records', () => {
      expect.assertions(2);
      variables = {
        cond: false,
        id: '4',
      };
      refetch(variables, null, jest.fn());
      environment.mock.resolve(UserQuery, {
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

    it('releases refetch results if new props refer to different records', () => {
      expect.assertions(2);
      variables = {
        cond: false,
        id: '4',
      };
      refetch(variables, null, jest.fn());
      environment.mock.resolve(UserQuery, {
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

    it('updates child context if updated with new variables', () => {
      expect.assertions(2);
      const refetchVariables = {
        cond: false,
        id: '4',
      };
      refetch(refetchVariables, null, jest.fn());
      environment.mock.resolve(UserQuery, {
        data: {
          node: {
            id: '4',
            __typename: 'User',
            name: 'Zuck',
          },
        },
      });

      const updateVariables = {
        cond: true,
        id: '842472',
      };
      // Update the variables in context.
      // Context object should be mutated (for compat with gDSFP).
      const context = instance.getInstance().getChildContext();
      context.relay.variables = updateVariables;
      instance.getInstance().setProps({});

      expect(relayContext.environment).toBe(environment);
      expect(relayContext.variables).toEqual(updateVariables);
    });

    it('cancels previous request when a new refetch occurs first', () => {
      const refetchVariables = {
        cond: false,
        id: '4',
      };
      refetch(refetchVariables, null, jest.fn());
      const subscription1 = environment.execute.mock.subscriptions[0];

      const refetchVariables2 = {
        cond: false,
        id: '11',
      };
      refetch(refetchVariables2, null, jest.fn());
      const subscription2 = environment.execute.mock.subscriptions[1];

      expect(subscription1.closed).toBe(true);
      expect(subscription2.closed).toBe(false);
    });

    it('does not cancel current request if previous request is disposed', () => {
      const refetchVariables = {
        cond: false,
        id: '4',
      };
      const disposable1 = refetch(refetchVariables, null, jest.fn());
      const subscription1 = environment.execute.mock.subscriptions[0];
      expect(subscription1.closed).toBe(false);

      const refetchVariables2 = {
        cond: false,
        id: '11',
      };
      const disposable2 = refetch(refetchVariables2, null, jest.fn());
      const subscription2 = environment.execute.mock.subscriptions[1];
      expect(subscription1.closed).toBe(true);
      expect(subscription2.closed).toBe(false);

      disposable1.dispose();
      expect(subscription1.closed).toBe(true);
      expect(subscription2.closed).toBe(false);

      disposable2.dispose();
      expect(subscription1.closed).toBe(true);
      expect(subscription2.closed).toBe(true);
    });
  });
  it('can be unwrapped in tests', () => {
    class TestUnwrapping extends React.Component {
      render() {
        return <div>Unwrapped</div>;
      }
    }

    const TestUnwrappingContainer = ReactRelayRefetchContainer.createContainer(
      TestUnwrapping,
      {
        user: () => UserFragment,
      },
    );

    const UnwrappedComponent = RelayModernTestUtils.unwrapContainer(
      TestUnwrappingContainer,
    );

    const renderer = ReactTestRenderer.create(
      <UnwrappedComponent user={{id: '4', name: 'Mark'}} />,
    );

    expect(renderer.toJSON()).toMatchSnapshot();
  });
});

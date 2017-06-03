/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 */

'use strict';

jest.autoMockOff();

const React = require('React');
const ReactRelayPropTypes = require('ReactRelayPropTypes');
const ReactRelayQueryRenderer = require('ReactRelayQueryRenderer');
const RelayInMemoryRecordSource = require('RelayInMemoryRecordSource');
const RelayMarkSweepStore = require('RelayMarkSweepStore');
const RelayModernEnvironment = require('RelayModernEnvironment');
const RelayNetwork = require('RelayNetwork');
const ReactTestRenderer = require('ReactTestRenderer');
const {createMockEnvironment} = require('RelayModernMockEnvironment');

const simpleClone = require('simpleClone');

describe('ReactRelayQueryRenderer', () => {
  let TestQuery;

  let cacheConfig;
  let environment;
  let render;
  let store;
  let variables;

  class PropsSetter extends React.Component {
    constructor() {
      super();
      this.state = {
        props: null,
      };
    }
    setProps(props) {
      this.setState({props});
    }
    render() {
      const child = React.Children.only(this.props.children);
      if (this.state.props) {
        return React.cloneElement(child, this.state.props);
      }
      return child;
    }
  }

  beforeEach(() => {
    jest.resetModules();
    jasmine.addMatchers({
      toBeRendered() {
        return {
          compare(readyState) {
            const calls = render.mock.calls;
            expect(calls.length).toBe(1);
            expect(calls[0][0]).toEqual(readyState);
            return {pass: true};
          },
        };
      },
    });

    environment = createMockEnvironment();
    store = environment.getStore();
    ({TestQuery} = environment.mock.compile(
      `
      query TestQuery($id: ID = "<default>") {
        node(id: $id) {
          id
          ...TestFragment
        }
      }

      fragment TestFragment on User {
        name
      }
    `,
    ));

    render = jest.fn(() => <div />);
    variables = {id: '4'};
  });

  describe('when initialized', () => {
    it('retains the initial selection', () => {
      ReactTestRenderer.create(
        <ReactRelayQueryRenderer
          query={TestQuery}
          cacheConfig={cacheConfig}
          environment={environment}
          render={render}
          variables={variables}
        />,
      );
      expect(environment.retain).toBeCalled();
      expect(environment.retain.mock.calls[0][0].dataID).toBe('client:root');
      expect(environment.retain.mock.calls[0][0].node).toBe(TestQuery.query);
      expect(environment.retain.mock.calls[0][0].variables).toEqual(variables);
      const dispose = environment.retain.mock.dispose;
      expect(dispose).not.toBeCalled();
    });

    it('fetches the query', () => {
      ReactTestRenderer.create(
        <ReactRelayQueryRenderer
          query={TestQuery}
          cacheConfig={cacheConfig}
          environment={environment}
          render={render}
          variables={variables}
        />,
      );
      expect(
        environment.mock.isLoading(TestQuery, variables, cacheConfig),
      ).toBe(true);
    });

    it('fetches the query with default variables', () => {
      ReactTestRenderer.create(
        <ReactRelayQueryRenderer
          query={TestQuery}
          cacheConfig={cacheConfig}
          environment={environment}
          render={render}
          variables={{}}
        />,
      );
      variables = {id: '<default>'};
      expect(
        environment.mock.isLoading(TestQuery, variables, cacheConfig),
      ).toBe(true);
    });

    it('renders with a default ready state', () => {
      ReactTestRenderer.create(
        <ReactRelayQueryRenderer
          query={TestQuery}
          cacheConfig={cacheConfig}
          environment={environment}
          render={render}
          variables={variables}
        />,
      );
      expect({
        error: null,
        props: null,
        retry: null,
      }).toBeRendered();
    });

    it('skip loading state when request could be resolved synchronously', () => {
      const response = {
        data: {
          node: {
            __typename: 'User',
            id: '4',
            name: 'Zuck',
          },
        },
      };
      const fetch = () => {
        return {
          kind: 'data',
          data: response,
        };
      };
      store = new RelayMarkSweepStore(new RelayInMemoryRecordSource());
      environment = new RelayModernEnvironment({
        network: RelayNetwork.create(fetch),
        store,
      });
      ReactTestRenderer.create(
        <ReactRelayQueryRenderer
          query={TestQuery}
          cacheConfig={cacheConfig}
          environment={environment}
          render={render}
          variables={variables}
        />,
      );
      expect({
        error: null,
        props: {
          node: {
            id: '4',
            __fragments: {
              TestFragment: {},
            },
            __id: '4',
          },
        },
        retry: jasmine.any(Function),
      }).toBeRendered();
    });
  });

  describe('context', () => {
    let ContextGetter;
    let relayContext;
    let response;

    beforeEach(() => {
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
      render = jest.fn(() => <ContextGetter />);
      response = {
        data: {
          node: {
            __typename: 'User',
            id: '4',
            name: 'Zuck',
          },
        },
      };
    });

    it('sets an environment and variables on context', async () => {
      expect.assertions(2);
      ReactTestRenderer.create(
        <ReactRelayQueryRenderer
          environment={environment}
          query={TestQuery}
          render={render}
          variables={variables}
        />,
      );
      await environment.mock.resolve(TestQuery, response);

      expect(relayContext.environment).toBe(environment);
      expect(relayContext.variables).toEqual(variables);
    });

    it('sets an environment and variables on context with empty query', () => {
      variables = {foo: 'bar'};
      ReactTestRenderer.create(
        <ReactRelayQueryRenderer
          environment={environment}
          query={null}
          render={render}
          variables={variables}
        />,
      );

      expect({
        error: null,
        props: {},
        retry: null,
      }).toBeRendered();
      expect(relayContext.environment).toBe(environment);
      expect(relayContext.variables).toEqual(variables);
    });

    it('updates the context when the environment changes', async () => {
      expect.assertions(3);
      const instance = ReactTestRenderer.create(
        <PropsSetter>
          <ReactRelayQueryRenderer
            environment={environment}
            query={TestQuery}
            render={render}
            variables={variables}
          />
        </PropsSetter>,
      );
      await environment.mock.resolve(TestQuery, response);
      environment = createMockEnvironment();
      const previousContext = relayContext;
      instance.getInstance().setProps({
        environment,
        query: TestQuery,
        render,
        variables,
      });

      expect(relayContext).not.toBe(previousContext);
      expect(relayContext.environment).toBe(environment);
      expect(relayContext.variables).toEqual(variables);
    });

    it('updates the context when the query changes', async () => {
      expect.assertions(3);
      const instance = ReactTestRenderer.create(
        <PropsSetter>
          <ReactRelayQueryRenderer
            environment={environment}
            query={TestQuery}
            render={render}
            variables={variables}
          />
        </PropsSetter>,
      );
      await environment.mock.resolve(TestQuery, response);
      TestQuery = {...TestQuery};
      const previousContext = relayContext;
      instance.getInstance().setProps({
        environment,
        query: TestQuery,
        render,
        variables,
      });

      expect(relayContext).not.toBe(previousContext);
      expect(relayContext.environment).toBe(environment);
      expect(relayContext.variables).toEqual(variables);
    });

    it('updates the context when variables change', async () => {
      expect.assertions(3);
      const instance = ReactTestRenderer.create(
        <PropsSetter>
          <ReactRelayQueryRenderer
            environment={environment}
            query={TestQuery}
            render={render}
            variables={variables}
          />
        </PropsSetter>,
      );
      await environment.mock.resolve(TestQuery, response);
      variables = {};
      const previousContext = relayContext;
      instance.getInstance().setProps({
        environment,
        query: TestQuery,
        render,
        variables,
      });

      expect(relayContext).not.toBe(previousContext);
      expect(relayContext.environment).toBe(environment);
      expect(relayContext.variables).toEqual({
        id: '<default>',
      });
    });

    it('does not update the context for equivalent variables', async () => {
      expect.assertions(3);
      variables = {foo: ['bar']};
      const instance = ReactTestRenderer.create(
        <PropsSetter>
          <ReactRelayQueryRenderer
            environment={environment}
            query={TestQuery}
            render={render}
            variables={variables}
          />
        </PropsSetter>,
      );
      await environment.mock.resolve(TestQuery, response);
      variables = simpleClone(variables);
      const previousContext = relayContext;
      const previousVariables = previousContext.variables;
      instance.getInstance().setProps({
        environment,
        query: TestQuery,
        render,
        variables,
      });

      expect(relayContext).toBe(previousContext);
      expect(relayContext.environment).toBe(environment);
      expect(relayContext.variables).toBe(previousVariables);
    });
  });

  describe('when new props are received', () => {
    let instance;

    beforeEach(() => {
      instance = ReactTestRenderer.create(
        <PropsSetter>
          <ReactRelayQueryRenderer
            environment={environment}
            query={TestQuery}
            render={render}
            variables={variables}
          />
        </PropsSetter>,
      );
    });

    it('does not update if all props are ===', () => {
      environment.mockClear();
      render.mockClear();

      // "update" with all === props
      instance.getInstance().setProps({
        environment,
        query: TestQuery,
        render,
        variables,
      });
      expect(environment.streamQuery).not.toBeCalled();
      expect(render).not.toBeCalled();
    });

    it('does not update if variables are equivalent', () => {
      variables = {foo: [1]};
      instance = ReactTestRenderer.create(
        <PropsSetter>
          <ReactRelayQueryRenderer
            environment={environment}
            query={TestQuery}
            render={render}
            variables={variables}
          />
        </PropsSetter>,
      );
      environment.mockClear();
      render.mockClear();

      // Update with equivalent variables
      variables = {foo: [1]};
      instance.getInstance().setProps({
        environment,
        query: TestQuery,
        render,
        variables,
      });
      expect(environment.streamQuery).not.toBeCalled();
      expect(render).not.toBeCalled();
    });

    it('updates if `render` prop changes', () => {
      const readyState = render.mock.calls[0][0];
      environment.mockClear();
      render.mockClear();

      // update with new render prop
      render = jest.fn(() => <div />);
      instance.getInstance().setProps({
        environment,
        query: TestQuery,
        render,
        variables,
      });
      expect(readyState).toBeRendered();
      expect(environment.streamQuery).not.toBeCalled();
    });

    it('refetches if the `environment` prop changes', async () => {
      expect.assertions(4);
      await environment.mock.resolve(TestQuery, {
        data: {
          node: null,
        },
      });
      render.mockClear();

      // Update with a different environment
      environment.mockClear();
      environment = createMockEnvironment();
      instance.getInstance().setProps({
        environment,
        query: TestQuery,
        render,
        variables,
      });
      expect(
        environment.mock.isLoading(TestQuery, variables, cacheConfig),
      ).toBe(true);
      expect({
        error: null,
        props: null,
        retry: null,
      }).toBeRendered();
    });

    it('refetches if the `variables` prop changes', async () => {
      expect.assertions(4);
      await environment.mock.resolve(TestQuery, {
        data: {
          node: null,
        },
      });
      environment.mockClear();
      render.mockClear();

      // Update with different variables
      variables = {id: 'beast'};
      instance.getInstance().setProps({
        environment,
        query: TestQuery,
        render,
        variables,
      });
      expect(
        environment.mock.isLoading(TestQuery, variables, cacheConfig),
      ).toBe(true);
      expect({
        error: null,
        props: null,
        retry: null,
      }).toBeRendered();
    });

    it('refetches with default values if the `variables` prop changes', async () => {
      expect.assertions(4);
      await environment.mock.resolve(TestQuery, {
        data: {
          node: null,
        },
      });
      environment.mockClear();
      render.mockClear();

      // Update with different variables
      variables = {}; // no `id`
      const expectedVariables = {id: '<default>'};
      instance.getInstance().setProps({
        environment,
        query: TestQuery,
        render,
        variables,
      });
      expect(
        environment.mock.isLoading(TestQuery, expectedVariables, cacheConfig),
      ).toBe(true);
      expect({
        error: null,
        props: null,
        retry: null,
      }).toBeRendered();
    });

    it('refetches if the `query` prop changes', async () => {
      expect.assertions(4);
      await environment.mock.resolve(TestQuery, {
        data: {
          node: null,
        },
      });
      environment.mockClear();
      render.mockClear();

      // Update with a different query
      TestQuery = {...TestQuery};
      instance.getInstance().setProps({
        cacheConfig,
        environment,
        query: TestQuery,
        render,
        variables,
      });
      expect(
        environment.mock.isLoading(TestQuery, variables, cacheConfig),
      ).toBe(true);
      expect({
        error: null,
        props: null,
        retry: null,
      }).toBeRendered();
    });

    it('renders if the `query` prop changes to null', async () => {
      expect.assertions(7);
      await environment.mock.resolve(TestQuery, {
        data: {
          node: null,
        },
      });
      const disposeHold = environment.retain.mock.dispose;
      expect(disposeHold).not.toBeCalled();
      const disposeUpdate = environment.subscribe.mock.dispose;
      expect(disposeUpdate).not.toBeCalled();

      environment.mockClear();
      render.mockClear();

      // Update with a null query
      instance.getInstance().setProps({
        cacheConfig,
        environment,
        query: null,
        render,
        variables,
      });

      expect(disposeHold).toBeCalled();
      expect(disposeUpdate).toBeCalled();
      expect({
        error: null,
        props: {},
        retry: null,
      }).toBeRendered();
    });
  });

  describe('when the fetch fails', () => {
    beforeEach(() => {
      ReactTestRenderer.create(
        <ReactRelayQueryRenderer
          environment={environment}
          query={TestQuery}
          render={render}
          variables={variables}
        />,
      );
    });

    it('continues retaining the initial selection', async () => {
      expect.assertions(1);
      await environment.mock.reject(TestQuery, new Error('fail'));
      expect(environment.retain.mock.dispose).not.toBeCalled();
    });

    it('renders the error and retry', async () => {
      expect.assertions(3);
      render.mockClear();
      const error = new Error('fail');
      await environment.mock.reject(TestQuery, error);
      expect({
        error,
        props: null,
        retry: jasmine.any(Function),
      }).toBeRendered();
    });

    it('refetch the query if `retry`', async () => {
      expect.assertions(4);
      render.mockClear();
      const error = new Error('network fails');
      await environment.mock.reject(TestQuery, error);
      const readyState = render.mock.calls[0][0];
      expect(readyState.retry).not.toBe(null);

      render.mockClear();
      readyState.retry();
      const response = {
        data: {
          node: {
            __typename: 'User',
            id: '4',
            name: 'Zuck',
          },
        },
      };
      await environment.mock.resolve(TestQuery, response);
      expect({
        error: null,
        props: {
          node: {
            id: '4',
            __fragments: {
              TestFragment: {},
            },
            __id: '4',
          },
        },
        retry: jasmine.any(Function),
      }).toBeRendered();
    });
  });

  describe('when the fetch succeeds', () => {
    let response;

    beforeEach(() => {
      ReactTestRenderer.create(
        <ReactRelayQueryRenderer
          environment={environment}
          query={TestQuery}
          render={render}
          variables={variables}
        />,
      );
      response = {
        data: {
          node: {
            __typename: 'User',
            id: '4',
            name: 'Zuck',
          },
        },
      };
    });

    it('publishes and notifies the store with changes', async () => {
      expect.assertions(2);
      await environment.mock.resolve(TestQuery, response);
      expect(store.publish).toBeCalled();
      expect(store.notify).toBeCalled();
    });

    it('renders the query results', async () => {
      expect.assertions(3);
      render.mockClear();
      await environment.mock.resolve(TestQuery, response);
      expect({
        error: null,
        props: {
          node: {
            id: '4',
            __fragments: {
              TestFragment: {},
            },
            __id: '4',
          },
        },
        retry: jasmine.any(Function),
      }).toBeRendered();
    });

    it('subscribes to the root fragment', async () => {
      expect.assertions(4);
      await environment.mock.resolve(TestQuery, response);
      expect(environment.subscribe).toBeCalled();
      expect(environment.subscribe.mock.calls[0][0].dataID).toBe('client:root');
      expect(environment.subscribe.mock.calls[0][0].node).toBe(
        TestQuery.fragment,
      );
      expect(environment.subscribe.mock.calls[0][0].variables).toEqual(
        variables,
      );
    });
  });

  describe('when props change during a fetch', () => {
    let NextQuery;
    let instance;
    let nextProps;

    beforeEach(() => {
      ({NextQuery} = environment.mock.compile(
        `
        query NextQuery($id: ID!) {
          node(id: $id) {
            ... on User {
              name
            }
          }
        }
      `,
      ));

      variables = {id: '4'};
      instance = ReactTestRenderer.create(
        <PropsSetter>
          <ReactRelayQueryRenderer
            environment={environment}
            query={TestQuery}
            render={render}
            variables={variables}
          />
        </PropsSetter>,
      );
      nextProps = {
        environment,
        query: NextQuery,
        render,
        variables,
      };
    });

    it('cancels the pending fetch', () => {
      const disposeFetch = environment.streamQuery.mock.dispose;
      expect(disposeFetch).not.toBeCalled();
      environment.mockClear();
      instance.getInstance().setProps(nextProps);
      expect(disposeFetch).toBeCalled();
    });

    it('releases the pending selection', () => {
      const disposeHold = environment.retain.mock.dispose;
      expect(disposeHold).not.toBeCalled();
      instance.getInstance().setProps(nextProps);
      expect(disposeHold).toBeCalled();
    });

    it('retains the new selection', () => {
      environment.mockClear();
      instance.getInstance().setProps(nextProps);
      expect(environment.retain.mock.calls[0][0].dataID).toBe('client:root');
      expect(environment.retain.mock.calls[0][0].node).toBe(NextQuery.query);
      expect(environment.retain.mock.calls[0][0].variables).toEqual(variables);
    });

    it('renders a pending state', () => {
      render.mockClear();
      instance.getInstance().setProps(nextProps);
      expect({
        error: null,
        props: null,
        retry: null,
      }).toBeRendered();
    });

    it('renders if the `query` prop changes to null', () => {
      const disposeFetch = environment.streamQuery.mock.dispose;
      expect(disposeFetch).not.toBeCalled();
      const disposeHold = environment.retain.mock.dispose;
      expect(disposeHold).not.toBeCalled();

      environment.mockClear();
      render.mockClear();

      // Update with a null query
      instance.getInstance().setProps({
        cacheConfig,
        environment,
        query: null,
        render,
        variables,
      });

      expect(disposeFetch).toBeCalled();
      expect(disposeHold).toBeCalled();
      expect({
        error: null,
        props: {},
        retry: null,
      }).toBeRendered();
    });
  });

  describe('when props change after a fetch fails', () => {
    let NextQuery;
    let error;
    let instance;
    let nextProps;

    beforeEach(async () => {
      ({NextQuery} = environment.mock.compile(
        `
        query NextQuery($id: ID!) {
          node(id: $id) {
            ... on User {
              name
            }
          }
        }
      `,
      ));

      variables = {id: '4'};
      instance = ReactTestRenderer.create(
        <PropsSetter>
          <ReactRelayQueryRenderer
            environment={environment}
            query={TestQuery}
            render={render}
            variables={variables}
          />
        </PropsSetter>,
      );
      error = new Error('fail');
      await environment.mock.reject(TestQuery, error);
      render.mockClear();
      nextProps = {
        environment,
        query: NextQuery,
        render,
        variables,
      };
    });

    it('does not dispose the previous fetch', () => {
      const disposeFetch = environment.streamQuery.mock.dispose;
      environment.mockClear();
      instance.getInstance().setProps(nextProps);
      expect(disposeFetch).not.toBeCalled();
    });

    it('fetches the new query', () => {
      environment.mockClear();
      instance.getInstance().setProps(nextProps);
      expect(
        environment.mock.isLoading(NextQuery, variables, cacheConfig),
      ).toBe(true);
    });

    it('retains the new selection', async () => {
      expect.assertions(5);
      environment.mockClear();
      instance.getInstance().setProps(nextProps);
      expect(environment.retain.mock.calls.length).toBe(1);
      expect(environment.retain.mock.calls[0][0].dataID).toBe('client:root');
      expect(environment.retain.mock.calls[0][0].node).toBe(NextQuery.query);
      expect(environment.retain.mock.calls[0][0].variables).toEqual(variables);
      await environment.mock.resolve(NextQuery, {
        data: {
          node: null,
        },
      });
      expect(environment.retain.mock.dispose).not.toBeCalled();
    });

    it('renders the pending state', () => {
      instance.getInstance().setProps(nextProps);
      expect({
        error: null,
        props: null,
        retry: null,
      }).toBeRendered();
    });

    it('publishes and notifies the store with changes', async () => {
      expect.assertions(2);
      environment.mockClear();
      instance.getInstance().setProps(nextProps);
      const response = {
        data: {
          node: {
            __typename: 'User',
            id: '4',
            name: 'Zuck',
          },
        },
      };
      await environment.mock.resolve(NextQuery, response);
      expect(store.publish).toBeCalled();
      expect(store.notify).toBeCalled();
    });
  });

  describe('when props change after a fetch succeeds', () => {
    let NextQuery;
    let instance;
    let nextProps;

    beforeEach(async () => {
      ({NextQuery} = environment.mock.compile(
        `
        query NextQuery($id: ID!) {
          node(id: $id) {
            ... on User {
              name
            }
          }
        }
      `,
      ));

      instance = ReactTestRenderer.create(
        <PropsSetter>
          <ReactRelayQueryRenderer
            environment={environment}
            query={TestQuery}
            render={render}
            variables={variables}
          />
        </PropsSetter>,
      );
      await environment.mock.resolve(TestQuery, {
        data: {
          node: {
            __typename: 'User',
            id: '4',
            name: 'Zuck',
          },
        },
      });
      render.mockClear();
      nextProps = {
        environment,
        query: NextQuery,
        render,
        variables,
      };
    });

    it('does not dispose the previous fetch', () => {
      const disposeFetch = environment.streamQuery.mock.dispose;
      environment.mockClear();
      instance.getInstance().setProps(nextProps);
      expect(disposeFetch).not.toBeCalled();
    });

    it('disposes the root fragment subscription', () => {
      const disposeUpdate = environment.subscribe.mock.dispose;
      expect(disposeUpdate).not.toBeCalled();
      instance.getInstance().setProps(nextProps);
      expect(disposeUpdate).toBeCalled();
    });

    it('fetches the new query', () => {
      environment.mockClear();
      instance.getInstance().setProps(nextProps);
      expect(
        environment.mock.isLoading(NextQuery, variables, cacheConfig),
      ).toBe(true);
    });

    it('disposes the previous selection and retains the new one', async () => {
      expect.assertions(6);
      const prevDispose = environment.retain.mock.dispose;
      environment.mockClear();
      instance.getInstance().setProps(nextProps);
      expect(environment.retain).toBeCalled();
      expect(environment.retain.mock.calls[0][0].dataID).toBe('client:root');
      expect(environment.retain.mock.calls[0][0].node).toBe(NextQuery.query);
      expect(environment.retain.mock.calls[0][0].variables).toEqual(variables);
      await environment.mock.resolve(NextQuery, {
        data: {
          node: null,
        },
      });
      expect(prevDispose).toBeCalled();
      expect(environment.retain.mock.dispose).not.toBeCalled();
    });

    it('renders the pending and previous state', () => {
      environment.mockClear();
      instance.getInstance().setProps(nextProps);
      expect({
        error: null,
        props: null,
        retry: null,
      }).toBeRendered();
    });

    it('publishes and notifies the store with changes', async () => {
      expect.assertions(2);
      environment.mockClear();
      instance.getInstance().setProps(nextProps);
      const response = {
        data: {
          node: {
            __typename: 'User',
            id: '4',
            name: 'Zuck',
          },
        },
      };
      await environment.mock.resolve(NextQuery, response);
      expect(store.publish).toBeCalled();
      expect(store.notify).toBeCalled();
    });
  });

  describe('when unmounted', () => {
    it('releases its reference if unmounted before fetch completes', () => {
      const instance = ReactTestRenderer.create(
        <ReactRelayQueryRenderer
          environment={environment}
          query={TestQuery}
          render={render}
          variables={variables}
        />,
      );
      const dispose = environment.retain.mock.dispose;
      expect(dispose).not.toBeCalled();
      // TODO: Tell React to unmount instead of manually calling the lifecycle
      // hook.
      instance.getInstance().componentWillUnmount();
      expect(dispose).toBeCalled();
    });

    it('releases its reference if unmounted after fetch completes', () => {
      const instance = ReactTestRenderer.create(
        <ReactRelayQueryRenderer
          environment={environment}
          query={TestQuery}
          render={render}
          variables={variables}
        />,
      );
      const dispose = environment.retain.mock.dispose;
      expect(dispose).not.toBeCalled();
      // TODO: Tell React to unmount instead of manually calling the lifecycle
      // hook.
      instance.getInstance().componentWillUnmount();
      expect(dispose).toBeCalled();
    });

    it('aborts a pending fetch', () => {
      const instance = ReactTestRenderer.create(
        <ReactRelayQueryRenderer
          environment={environment}
          query={TestQuery}
          render={render}
          variables={variables}
        />,
      );
      const dispose = environment.streamQuery.mock.dispose;
      expect(dispose).not.toBeCalled();
      // TODO: Tell React to unmount instead of manually calling the lifecycle
      // hook.
      instance.getInstance().componentWillUnmount();
      expect(dispose).toBeCalled();
    });
  });
});

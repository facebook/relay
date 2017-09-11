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

const React = require('React');
const ReactRelayPropTypes = require('ReactRelayPropTypes');
const ReactTestRenderer = require('ReactTestRenderer');
const RelayCompatFragmentContainer = require('RelayCompatContainer');
const RelayModernTestUtils = require('RelayModernTestUtils');

const {createMockEnvironment} = require('RelayModernMockEnvironment');

describe('RelayCompatFragmentContainer', () => {
  beforeEach(() => {
    expect.extend(RelayModernTestUtils.matchers);
  });

  it('throws for invalid fragments', () => {
    expect(() => {
      const TestComponent = () => <div />;
      RelayCompatFragmentContainer.createContainer(TestComponent, {
        foo: null,
      });
    }).toFailInvariant(
      'Could not create Relay Container for `TestComponent`. ' +
        'The value of fragment `foo` was expected to be a fragment, ' +
        'got `null` instead.',
    );
  });

  it('allows access to component instance', () => {
    // TODO: replace with some test util.
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

    const environment = createMockEnvironment();
    const {UserFragment} = environment.mock.compile(`
      fragment UserFragment on User {
        id
      }
    `);

    class TestNoProxy extends React.Component {
      render() {
        return <div />;
      }

      instanceMethod(arg) {
        return arg + arg;
      }
    }

    const TestNoProxyContainer = RelayCompatFragmentContainer.createContainer(
      TestNoProxy,
      {
        user: () => UserFragment,
      },
    );

    let containerRef;
    let componentRef;

    ReactTestRenderer.create(
      <ContextSetter environment={environment} variables={{}}>
        <TestNoProxyContainer
          user={null}
          ref={ref => {
            containerRef = ref;
          }}
          componentRef={ref => {
            componentRef = ref;
          }}
        />
      </ContextSetter>,
    );

    expect(componentRef.instanceMethod('foo')).toEqual('foofoo');

    expect(() => containerRef.instanceMethod('foo')).toThrow();
  });
});

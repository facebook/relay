/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

jest.mock('warning');

require('configureForRelayOSS');

const GraphQLStoreQueryResolver = require('GraphQLStoreQueryResolver');
const React = require('React');
const Relay = require('Relay');
const RelayEnvironment = require('RelayEnvironment');
const RelayTestUtils = require('RelayTestUtils');
const reactComponentExpect = require('reactComponentExpect');

describe('RelayContainer', function() {
  let MockComponent;
  let MockContainer;
  let mockCreateContainer;
  let mockRender;

  beforeEach(function() {
    jest.resetModuleRegistry();

    MockComponent = React.createClass({
      render: jest.fn(() => <div />),
    });

    mockCreateContainer = component => {
      MockContainer = Relay.createContainer(component, {
        initialVariables: {site: 'mobile'},
        fragments: {
          foo: jest.fn(
            () => Relay.QL`fragment on Node{id,url(site:$site)}`
          ),
        },
      });
    };

    // Create default container for tests
    mockCreateContainer(MockComponent);

    GraphQLStoreQueryResolver.mockDefaultResolveImplementation((_, dataID) => {
      expect(dataID).toBe('42');
      return {__dataID__: '42', id: '42', url: null};
    });

    const environment = new RelayEnvironment();
    const RelayTestRenderer = RelayTestUtils.createRenderer();
    mockRender = () => {
      return RelayTestRenderer.render(
        genMockPointer => <MockContainer foo={genMockPointer('42')} />,
        environment
      );
    };
  });

  it('creates and instance and renders', () => {
    let instance;
    expect(() => {
      instance = mockRender();
    }).not.toThrow();

    reactComponentExpect(instance)
      .toBeCompositeComponentWithType(MockContainer)
      .expectRenderedChild()
      .toBeCompositeComponentWithType(MockComponent)
      .expectRenderedChild()
      .toBeComponentOfType('div');
  });

  it('provides Relay statics', () => {
    // The correct implementation of these is asserted in other tests. This
    // test merely checks if the public API exists.
    expect(typeof MockContainer.getFragmentNames).toEqual('function');
    expect(typeof MockContainer.getFragment).toEqual('function');
  });

  it('has the correct displayName when using class components', () => {
    expect(MockContainer.displayName).toEqual('Relay(MockComponent)');
  });

  it('has the correct displayName when using stateless components', () => {
    function MyComponent() {
      return <span />;
    }
    mockCreateContainer(MyComponent);
    expect(MockContainer.displayName).toEqual('Relay(MyComponent)');
  });

  it('defaults to "StatelessComponent" when using a component without name', () => {
    mockCreateContainer(() => <span />);
    expect(MockContainer.displayName).toEqual('Relay(StatelessComponent)');
  });

  it('defaults to "ReactElement" when using a ReactElement', () => {
    mockCreateContainer(<span />);
    expect(MockContainer.displayName).toEqual('Relay(ReactElement)');
  });

  it('works with ES6 classes', () => {
    class MyComponent extends React.Component {
      render() {
        return <span />;
      }
    }

    mockCreateContainer(MyComponent);

    const instance = mockRender();

    reactComponentExpect(instance)
      .toBeCompositeComponentWithType(MockContainer)
      .expectRenderedChild()
      .toBeCompositeComponentWithType(MyComponent)
      .expectRenderedChild()
      .toBeComponentOfType('span');
  });
});

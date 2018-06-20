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

require('configureForRelayOSS');

jest
  .mock('warning')
  .mock('../../route/RelayRoute')
  .mock('../../legacy/store/GraphQLStoreQueryResolver');

const GraphQLStoreQueryResolver = require('../../legacy/store/GraphQLStoreQueryResolver');
const React = require('React');
const RelayClassic = require('../../RelayPublic');
const RelayEnvironment = require('../../store/RelayEnvironment');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayContainer', function() {
  let MockComponent;
  let MockContainer;
  let mockCreateContainer;
  let mockRender;

  beforeEach(function() {
    jest.resetModules();

    MockComponent = class MockComponent_ extends React.Component {
      render() {
        return <div />;
      }
    };

    mockCreateContainer = component => {
      MockContainer = RelayClassic.createContainer(component, {
        initialVariables: {site: 'mobile'},
        fragments: {
          foo: jest.fn(
            () => RelayClassic.QL`fragment on Node{id,url(site:$site)}`,
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
        environment,
      );
    };
  });

  it('creates an instance and renders', () => {
    let instance;
    expect(() => {
      instance = mockRender();
    }).not.toThrow();

    expect(instance.refs.component instanceof MockComponent).toBe(true);
  });

  it('provides RelayClassic statics', () => {
    // The correct implementation of these is asserted in other tests. This
    // test merely checks if the public API exists.
    expect(typeof MockContainer.getFragmentNames).toEqual('function');
    expect(typeof MockContainer.getFragment).toEqual('function');
  });

  it('has the correct displayName when using class components', () => {
    expect(MockContainer.displayName).toEqual('Relay(MockComponent_)');
  });

  it('has the correct displayName when using stateless components', () => {
    function MyComponent() {
      return <span />;
    }
    mockCreateContainer(MyComponent);
    expect(MockContainer.displayName).toEqual('Relay(MyComponent)');
  });

  it('defaults to "Component" when using a component without name', () => {
    mockCreateContainer(() => <span />);
    expect(MockContainer.displayName).toEqual('Relay(Component)');
  });

  it('defaults to "Component" when using a ReactElement', () => {
    mockCreateContainer(<span />);
    expect(MockContainer.displayName).toEqual('Relay(Component)');
  });

  it('works with ES6 classes', () => {
    const render = jest.fn().mockImplementation(() => <span />);
    class MyComponent extends React.Component {
      render = render;
    }

    mockCreateContainer(MyComponent);

    const instance = mockRender();
    expect(instance.refs.component).toBeInstanceOf(MyComponent);
    expect(render).toHaveBeenCalledTimes(1);
  });
});

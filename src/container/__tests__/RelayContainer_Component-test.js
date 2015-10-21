/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

require('RelayTestUtils').unmockRelay();

var React = require('React');
var Relay = require('Relay');
var RelayStoreData = require('RelayStoreData');
var RelayTestUtils = require('RelayTestUtils');
var reactComponentExpect = require('reactComponentExpect');

describe('RelayContainer', function() {
  var MockComponent;
  var MockContainer;
  var mockCreateContainer;
  var mockRender;

  beforeEach(function() {
    jest.resetModuleRegistry();

    MockComponent = React.createClass({
      render: jest.genMockFunction().mockImplementation(() => <div />)
    });

    mockCreateContainer = component => {
      MockContainer = Relay.createContainer(component, {
        initialVariables: {site: 'mobile'},
        fragments: {
          foo: jest.genMockFunction().mockImplementation(
            () => Relay.QL`fragment on Node{id,url(site:$site)}`
          )
        }
      });
    };

    // Create default container for tests
    mockCreateContainer(MockComponent);

    var storeData = RelayStoreData.getDefaultInstance();
    storeData.readFragmentPointer.mockImplementation(pointer => {
      expect(pointer.getDataID()).toBe('42');
      return {__dataID__: '42', id: '42', url: null};
    });

    var RelayTestRenderer = RelayTestUtils.createRenderer();
    mockRender = () => {
      return RelayTestRenderer.render(genMockPointer => {
        return <MockContainer foo={genMockPointer('42')} />;
      });
    };
  });

  it('creates and instance and renders', () => {
    var instance;
    expect(() => {
      instance = mockRender();
    }).not.toThrow();

    reactComponentExpect(instance)
      .toBeCompositeComponentWithType(MockContainer)
      .expectRenderedChild()
      .toBeCompositeComponentWithType(MockComponent)
      .expectRenderedChild()
      .toBeDOMComponentWithTag('div');
  });

  it('provides Relay statics', () => {
    // The correct implementation of these is asserted in other tests. This
    // test merely checks if the public API exists.
    expect(typeof MockContainer.getFragmentNames).toEqual('function');
    expect(typeof MockContainer.getFragment).toEqual('function');
  });

  it('has the correct displayName based on the inner component', () => {
    expect(MockContainer.displayName).toEqual('Relay(MockComponent)');
  });

  it('works with ES6 classes', () => {
    class MyComponent extends React.Component {
      render() {
        return <span />;
      }
    }

    mockCreateContainer(MyComponent);

    var instance = mockRender();

    reactComponentExpect(instance)
      .toBeCompositeComponentWithType(MockContainer)
      .expectRenderedChild()
      .toBeCompositeComponentWithType(MyComponent)
      .expectRenderedChild()
      .toBeDOMComponentWithTag('span');
  });
});

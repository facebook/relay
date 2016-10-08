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

require('configureForRelayOSS');

jest.unmock('RelayRenderer');

const React = require('React');
const ReactDOM = require('ReactDOM');
const ReactTestUtils = require('ReactTestUtils');
const Relay = require('Relay');
const RelayEnvironment = require('RelayEnvironment');
const RelayQueryConfig = require('RelayQueryConfig');
const RelayRenderer = require('RelayRenderer');
const StaticContainer = require('StaticContainer.react');

describe('RelayRenderer.render', () => {
  let MockContainer;

  let container;
  let queryConfig;
  let environment;
  let renderedComponent;

  function renderElement(element) {
    renderedComponent = ReactDOM.render(element, container);
  }

  function getRenderOutput() {
    return ReactTestUtils.findRenderedComponentWithType(
      renderedComponent,
      StaticContainer
    );
  }

  beforeEach(() => {
    jest.resetModuleRegistry();

    const MockComponent = React.createClass({render: () => <div />});
    MockContainer = Relay.createContainer(MockComponent, {
      fragments: {},
    });

    container = document.createElement('div');
    queryConfig = RelayQueryConfig.genMockInstance();
    environment = new RelayEnvironment();

    jasmine.addMatchers({
      toBeUpdated() {
        return {
          compare(actual) {
            return {
              pass: actual.props.shouldUpdate,
            };
          },
        };
      },
      toBeRenderedChild() {
        return {
          compare(actual) {
            return {
              pass: getRenderOutput().props.children === actual,
            };
          },
        };
      },
    });
  });

  it('renders when mounted before a request is sent', () => {
    const initialView = <div />;
    const render = jest.fn(() => initialView);
    renderElement(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={environment}
        render={render}
      />
    );
    expect(render).toBeCalled();
    expect(initialView).toBeRenderedChild();
  });

  it('renders when updated before the initial request is sent', () => {
    renderElement(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={environment}
      />
    );
    const loadingView = <div />;
    renderElement(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={RelayQueryConfig.genMockInstance()}
        environment={environment}
        render={() => loadingView}
      />
    );
    // Since RelayRenderer has not yet sent a request, view gets to update.
    expect(getRenderOutput()).toBeUpdated();
  });

  it('does not render when updated after the initial request is sent', () => {
    renderElement(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={environment}
      />
    );
    environment.primeCache.mock.requests[0].block();

    const loadingView = <div />;
    renderElement(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={RelayQueryConfig.genMockInstance()}
        environment={environment}
        render={() => loadingView}
      />
    );
    // RelayRenderer does not synchronously update because the ready state (and
    // therefore render arguments) for the new `queryConfig` is not yet known.
    expect(getRenderOutput()).not.toBeUpdated();
    environment.primeCache.mock.requests[1].block();
    expect(loadingView).toBeRenderedChild();
  });

  it('renders whenever updated after data is ready', () => {
    const render = jest.fn();
    function update() {
      renderElement(
        <RelayRenderer
          Container={MockContainer}
          queryConfig={queryConfig}
          environment={environment}
          render={render}
        />
      );
    }
    update();
    environment.primeCache.mock.requests[0].block();

    expect(render.mock.calls.length).toBe(1);

    update();
    update();
    update();

    expect(render.mock.calls.length).toBe(1);

    environment.primeCache.mock.requests[0].resolve();

    expect(render.mock.calls.length).toBe(2);

    update();
    update();
    update();

    expect(render.mock.calls.length).toBe(5);
  });

  it('renders once after each ready state change', () => {
    const render = jest.fn();

    renderElement(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={environment}
        render={render}
      />
    );

    const request = environment.primeCache.mock.requests[0];

    expect(render.mock.calls.length).toBe(1);

    request.block();
    expect(render.mock.calls.length).toBe(1);

    request.resolve();
    expect(render.mock.calls.length).toBe(2);

    request.succeed();
    expect(render.mock.calls.length).toBe(3);
  });

  describe('GC integration', () => {
    let garbageCollector;

    beforeEach(() => {
      const storeData = environment.getStoreData();
      storeData.initializeGarbageCollector(jest.fn());
      garbageCollector = storeData.getGarbageCollector();
    });

    it('acquires a GC hold when mounted', () => {
      garbageCollector.acquireHold = jest.fn();
      renderElement(
        <RelayRenderer
          Container={MockContainer}
          queryConfig={queryConfig}
          environment={environment}
        />
      );
      expect(garbageCollector.acquireHold).toBeCalled();
    });

    it('releases its GC hold when unmounted', () => {
      const release = jest.fn();
      garbageCollector.acquireHold =
        jest.fn(() => ({release}));
      renderElement(
        <RelayRenderer
          Container={MockContainer}
          queryConfig={queryConfig}
          environment={environment}
        />
      );
      expect(release).not.toBeCalled();
      ReactDOM.unmountComponentAtNode(container);
      expect(release).toBeCalled();
    });
  });
});

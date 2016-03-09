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

jest.dontMock('RelayRenderer');

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

  it('defaults to null if unready and `render` is not supplied', () => {
    renderElement(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={environment}
      />
    );
    expect(null).toBeRenderedChild();
  });

  it('defaults to component if ready and `render` is not supplied', () => {
    renderElement(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={environment}
      />
    );
    environment.primeCache.mock.requests[0].resolve();

    const output = getRenderOutput().props.children;
    expect(output.type).toBe(MockContainer);
    expect(output.props).toEqual({});
  });

  it('renders null if `render` returns null', () => {
    renderElement(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={environment}
        render={() => null}
      />
    );
    environment.primeCache.mock.requests[0].block();
    expect(null).toBeRenderedChild();
  });

  it('renders previous view if `render` returns undefined', () => {
    const prevView = <span />;
    renderElement(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={environment}
        render={() => prevView}
      />
    );
    environment.primeCache.mock.requests[0].block();
    expect(prevView).toBeRenderedChild();

    renderElement(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={environment}
        render={() => undefined}
      />
    );
    expect(getRenderOutput()).not.toBeUpdated();
  });

  it('renders new view if `render` return a new view', () => {
    const prevView = <span />;
    renderElement(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={environment}
        render={() => prevView}
      />
    );
    environment.primeCache.mock.requests[0].block();
    expect(prevView).toBeRenderedChild();

    const nextView = <div />;
    renderElement(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={environment}
        render={() => nextView}
      />
    );
    expect(nextView).toBeRenderedChild();
  });

  it('renders when mounted before a request is sent', () => {
    const initialView = <div />;
    const render = jest.genMockFunction().mockReturnValue(initialView);
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

  it('renders whenever updated after request is sent', () => {
    const render = jest.genMockFunction();
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

    expect(render.mock.calls.length).toBe(2);

    update();
    update();
    update();

    expect(render.mock.calls.length).toBe(5);
  });

  it('renders once after each ready state change', () => {
    const render = jest.genMockFunction();

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
    expect(render.mock.calls.length).toBe(2);

    request.resolve();
    expect(render.mock.calls.length).toBe(3);

    request.succeed();
    expect(render.mock.calls.length).toBe(4);
  });

  describe('GC integration', () => {
    let garbageCollector;

    beforeEach(() => {
      const storeData = environment.getStoreData();
      storeData.initializeGarbageCollector(jest.genMockFunction());
      garbageCollector = storeData.getGarbageCollector();
    });

    it('acquires a GC hold when mounted', () => {
      garbageCollector.acquireHold = jest.genMockFunction();
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
      const release = jest.genMockFunction();
      garbageCollector.acquireHold =
        jest.genMockFunction().mockReturnValue({release});
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

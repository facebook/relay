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

jest.dontMock('RelayRenderer');

const React = require('React');
const ReactDOM = require('ReactDOM');
const ReactTestUtils = require('ReactTestUtils');
const Relay = require('Relay');
const RelayQueryConfig = require('RelayQueryConfig');
const RelayRenderer = require('RelayRenderer');
const RelayStore = require('RelayStore');
const StaticContainer = require('StaticContainer.react');

describe('RelayRenderer.render', () => {
  let MockComponent;
  let MockContainer;

  let container;
  let queryConfig;
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

    MockComponent = React.createClass({render: () => <div />});
    MockContainer = Relay.createContainer(MockComponent, {
      fragments: {},
    });

    container = document.createElement('div');
    queryConfig = RelayQueryConfig.genMockInstance();

    jest.addMatchers({
      toBeShallowUpdated() {
        return this.actual.props.shouldUpdate;
      },
      toBeShallowRenderedChild() {
        return getRenderOutput().props.children === this.actual;
      },
    });
  });

  it('defaults to null if unready and `render` is not supplied', () => {
    renderElement(
      <RelayRenderer Component={MockContainer} queryConfig={queryConfig} />
    );
    expect(null).toBeShallowRenderedChild();
  });

  it('defaults to component if ready and `render` is not supplied', () => {
    renderElement(
      <RelayRenderer Component={MockContainer} queryConfig={queryConfig} />
    );
    RelayStore.primeCache.mock.requests[0].resolve();

    const output = getRenderOutput().props.children;
    expect(output.type).toBe(MockContainer);
    expect(output.props).toEqual({});
  });

  it('renders null if `render` returns null', () => {
    renderElement(
      <RelayRenderer
        Component={MockContainer}
        queryConfig={queryConfig}
        render={() => null}
      />
    );
    RelayStore.primeCache.mock.requests[0].block();
    expect(null).toBeShallowRenderedChild();
  });

  it('renders previous view if `render` returns undefined', () => {
    const prevView = <span />;
    renderElement(
      <RelayRenderer
        Component={MockContainer}
        queryConfig={queryConfig}
        render={() => prevView}
      />
    );
    RelayStore.primeCache.mock.requests[0].block();
    expect(prevView).toBeShallowRenderedChild();

    renderElement(
      <RelayRenderer
        Component={MockContainer}
        queryConfig={queryConfig}
        render={() => undefined}
      />
    );
    expect(getRenderOutput()).not.toBeShallowUpdated();
  });

  it('renders new view if `render` return a new view', () => {
    const prevView = <span />;
    renderElement(
      <RelayRenderer
        Component={MockContainer}
        queryConfig={queryConfig}
        render={() => prevView}
      />
    );
    RelayStore.primeCache.mock.requests[0].block();
    expect(prevView).toBeShallowRenderedChild();

    const nextView = <div />;
    renderElement(
      <RelayRenderer
        Component={MockContainer}
        queryConfig={queryConfig}
        render={() => nextView}
      />
    );
    expect(nextView).toBeShallowRenderedChild();
  });

  it('renders when mounted before a request is sent', () => {
    const initialView = <div />;
    const render = jest.genMockFunction().mockReturnValue(initialView);
    renderElement(
      <RelayRenderer
        Component={MockContainer}
        queryConfig={queryConfig}
        render={render}
      />
    );
    expect(render).toBeCalled();
    expect(initialView).toBeShallowRenderedChild();
  });

  it('renders when updated before the initial request is sent', () => {
    renderElement(
      <RelayRenderer Component={MockContainer} queryConfig={queryConfig} />
    );
    const loadingView = <div />;
    renderElement(
      <RelayRenderer
        Component={MockContainer}
        queryConfig={RelayQueryConfig.genMockInstance()}
        render={() => loadingView}
      />
    );
    // Since RelayRenderer has not yet sent a request, view gets to update.
    expect(getRenderOutput()).toBeShallowUpdated();
  });

  it('does not render when updated after the initial request is sent', () => {
    renderElement(
      <RelayRenderer Component={MockContainer} queryConfig={queryConfig} />
    );
    RelayStore.primeCache.mock.requests[0].block();

    const loadingView = <div />;
    renderElement(
      <RelayRenderer
        Component={MockContainer}
        queryConfig={RelayQueryConfig.genMockInstance()}
        render={() => loadingView}
      />
    );
    // RelayRenderer does not synchronously update because the ready state (and
    // therefore render arguments) for the new `queryConfig` is not yet known.
    expect(getRenderOutput()).not.toBeShallowUpdated();
    RelayStore.primeCache.mock.requests[1].block();
    expect(loadingView).toBeShallowRenderedChild();
  });

  it('renders whenever updated after request is sent', () => {
    const render = jest.genMockFunction();
    function update() {
      renderElement(
        <RelayRenderer
          Component={MockContainer}
          queryConfig={queryConfig}
          render={render}
        />
      );
    }
    update();
    RelayStore.primeCache.mock.requests[0].block();

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
        Component={MockContainer}
        queryConfig={queryConfig}
        render={render}
      />
    );

    const request = RelayStore.primeCache.mock.requests[0];

    expect(render.mock.calls.length).toBe(1);

    request.block();
    expect(render.mock.calls.length).toBe(2);

    request.resolve();
    expect(render.mock.calls.length).toBe(3);

    request.succeed();
    expect(render.mock.calls.length).toBe(4);
  });
});

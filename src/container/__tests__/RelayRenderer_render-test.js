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

require('configureForRelayOSS');

jest.dontMock('RelayRenderer');

const React = require('React');
const ReactTestUtils = require('ReactTestUtils');
const Relay = require('Relay');
const RelayContext = require('RelayContext');
const RelayQueryConfig = require('RelayQueryConfig');
const RelayRenderer = require('RelayRenderer');

describe('RelayRenderer.render', () => {
  let MockComponent;
  let MockContainer;
  let ShallowRenderer;

  let queryConfig;
  let relayContext;

  beforeEach(() => {
    jest.resetModuleRegistry();

    MockComponent = React.createClass({render: () => <div />});
    MockContainer = Relay.createContainer(MockComponent, {
      fragments: {},
    });
    ShallowRenderer = ReactTestUtils.createRenderer();

    queryConfig = RelayQueryConfig.genMockInstance();
    relayContext = new RelayContext();

    jasmine.addMatchers({
      toBeShallowUpdated() {
        return {
          compare(actual) {
            return {
              pass: actual.props.shouldUpdate,
            };
          },
        };
      },
      toBeShallowRenderedChild() {
        return {
          compare(actual) {
            return {
              pass: ShallowRenderer.getRenderOutput().props.children === actual,
            };
          },
        };
      },
    });
  });

  it('defaults to null if unready and `render` is not supplied', () => {
    ShallowRenderer.render(
      <RelayRenderer
        Component={MockContainer}
        queryConfig={queryConfig}
        relayContext={relayContext}
      />
    );
    expect(null).toBeShallowRenderedChild();
  });

  it('defaults to component if ready and `render` is not supplied', () => {
    ShallowRenderer.render(
      <RelayRenderer
        Component={MockContainer}
        queryConfig={queryConfig}
        relayContext={relayContext}
      />
    );
    relayContext.primeCache.mock.requests[0].resolve();

    const output = ShallowRenderer.getRenderOutput().props.children;
    expect(output.type).toBe(MockContainer);
    expect(output.props).toEqual({});
  });

  it('renders null if `render` returns null', () => {
    ShallowRenderer.render(
      <RelayRenderer
        Component={MockContainer}
        queryConfig={queryConfig}
        relayContext={relayContext}
        render={() => null}
      />
    );
    relayContext.primeCache.mock.requests[0].block();
    expect(null).toBeShallowRenderedChild();
  });

  it('renders previous view if `render` returns undefined', () => {
    const prevView = <span />;
    ShallowRenderer.render(
      <RelayRenderer
        Component={MockContainer}
        queryConfig={queryConfig}
        relayContext={relayContext}
        render={() => prevView}
      />
    );
    relayContext.primeCache.mock.requests[0].block();
    expect(prevView).toBeShallowRenderedChild();

    ShallowRenderer.render(
      <RelayRenderer
        Component={MockContainer}
        queryConfig={queryConfig}
        relayContext={relayContext}
        render={() => undefined}
      />
    );
    expect(ShallowRenderer.getRenderOutput()).not.toBeShallowUpdated();
  });

  it('renders new view if `render` return a new view', () => {
    const prevView = <span />;
    ShallowRenderer.render(
      <RelayRenderer
        Component={MockContainer}
        queryConfig={queryConfig}
        relayContext={relayContext}
        render={() => prevView}
      />
    );
    relayContext.primeCache.mock.requests[0].block();
    expect(prevView).toBeShallowRenderedChild();

    const nextView = <div />;
    ShallowRenderer.render(
      <RelayRenderer
        Component={MockContainer}
        queryConfig={queryConfig}
        relayContext={relayContext}
        render={() => nextView}
      />
    );
    expect(nextView).toBeShallowRenderedChild();
  });

  it('renders when mounted before a request is sent', () => {
    const initialView = <div />;
    const render = jest.genMockFunction().mockReturnValue(initialView);
    ShallowRenderer.render(
      <RelayRenderer
        Component={MockContainer}
        queryConfig={queryConfig}
        relayContext={relayContext}
        render={render}
      />
    );
    expect(render).toBeCalled();
    expect(initialView).toBeShallowRenderedChild();
  });

  it('renders when updated before the initial request is sent', () => {
    ShallowRenderer.render(
      <RelayRenderer
        Component={MockContainer}
        queryConfig={queryConfig}
        relayContext={relayContext}
      />
    );
    const loadingView = <div />;
    ShallowRenderer.render(
      <RelayRenderer
        Component={MockContainer}
        queryConfig={RelayQueryConfig.genMockInstance()}
        relayContext={relayContext}
        render={() => loadingView}
      />
    );
    // Since RelayRenderer has not yet sent a request, view gets to update.
    expect(ShallowRenderer.getRenderOutput()).toBeShallowUpdated();
  });

  it('does not render when updated after the initial request is sent', () => {
    ShallowRenderer.render(
      <RelayRenderer
        Component={MockContainer}
        queryConfig={queryConfig}
        relayContext={relayContext}
      />
    );
    relayContext.primeCache.mock.requests[0].block();

    const loadingView = <div />;
    ShallowRenderer.render(
      <RelayRenderer
        Component={MockContainer}
        queryConfig={RelayQueryConfig.genMockInstance()}
        relayContext={relayContext}
        render={() => loadingView}
      />
    );
    // RelayRenderer does not synchronously update because the ready state (and
    // therefore render arguments) for the new `queryConfig` is not yet known.
    expect(ShallowRenderer.getRenderOutput()).not.toBeShallowUpdated();
    relayContext.primeCache.mock.requests[1].block();
    expect(loadingView).toBeShallowRenderedChild();
  });

  it('renders whenever updated after request is sent', () => {
    const render = jest.genMockFunction();
    function update() {
      ShallowRenderer.render(
        <RelayRenderer
          Component={MockContainer}
          queryConfig={queryConfig}
          relayContext={relayContext}
          render={render}
        />
      );
    }
    update();
    relayContext.primeCache.mock.requests[0].block();

    expect(render.mock.calls.length).toBe(2);

    update();
    update();
    update();

    expect(render.mock.calls.length).toBe(5);
  });
});

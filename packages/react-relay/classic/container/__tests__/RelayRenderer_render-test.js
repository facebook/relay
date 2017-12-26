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

jest
  .mock('../../query-config/RelayQueryConfig')
  .mock('../../store/RelayEnvironment');

require('configureForRelayOSS');

const React = require('React');
const ReactTestRenderer = require('react-test-renderer');
const ReactTestUtils = require('ReactTestUtils');
const Relay = require('../../RelayPublic');
const RelayEnvironment = require('../../store/RelayEnvironment');
const RelayQueryConfig = require('../../query-config/RelayQueryConfig');
const RelayRenderer = require('../RelayRenderer');
const RelayStaticContainer = require('../RelayStaticContainer');

describe('RelayRenderer.render', () => {
  let MockContainer;

  let container;
  let queryConfig;
  let environment;

  function renderElement(element) {
    container.update(element);
  }

  function getRenderOutput() {
    return ReactTestUtils.findRenderedComponentWithType(
      container.getInstance(),
      RelayStaticContainer,
    );
  }

  beforeEach(() => {
    jest.resetModules();

    class MockComponent extends React.Component {
      render() {
        return <div />;
      }
    }
    MockContainer = Relay.createContainer(MockComponent, {
      fragments: {},
    });

    container = ReactTestRenderer.create();
    queryConfig = RelayQueryConfig.genMockInstance();
    environment = new RelayEnvironment();

    expect.extend({
      toBeUpdated(actual) {
        return {
          pass: actual.props.shouldUpdate,
        };
      },
      toBeRenderedChild(actual) {
        return {
          pass: getRenderOutput().props.children === actual,
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
      />,
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
      />,
    );
    const loadingView = <div />;
    renderElement(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={RelayQueryConfig.genMockInstance()}
        environment={environment}
        render={() => loadingView}
      />,
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
      />,
    );
    environment.primeCache.mock.requests[0].block();

    const loadingView = <div />;
    renderElement(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={RelayQueryConfig.genMockInstance()}
        environment={environment}
        render={() => loadingView}
      />,
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
        />,
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
      />,
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
});

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
const Relay = require('Relay');
const RelayEnvironment = require('RelayEnvironment');
const RelayQueryConfig = require('RelayQueryConfig');
const RelayRenderer = require('RelayRenderer');

describe('RelayRenderer.onReadyStateChange', () => {
  let MockContainer;

  let container;
  let queryConfig;
  let environment;

  beforeEach(() => {
    jest.resetModuleRegistry();

    const MockComponent = React.createClass({render: () => <div />});
    MockContainer = Relay.createContainer(MockComponent, {
      fragments: {},
    });

    container = document.createElement('div');
    queryConfig = RelayQueryConfig.genMockInstance();
    environment = new RelayEnvironment();
  });

  let onReadyStateChange;

  beforeEach(() => {
    onReadyStateChange = jest.fn();
    ReactDOM.render(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={environment}
        onReadyStateChange={onReadyStateChange}
      />,
      container
    );
    const defaultState = {
      aborted: false,
      done: false,
      error: null,
      mounted: true,
      ready: false,
      stale: false,
    };
    jasmine.addMatchers({
      toTriggerReadyStateChanges() {
        return {
          compare(requestCallback, expected) {
            const request = environment.primeCache.mock.requests[0];
            requestCallback(request);
            jest.runAllTimers();

            expect(onReadyStateChange.mock.calls.map(args => args[0])).toEqual(
              expected.map(deltaState => ({...defaultState, ...deltaState}))
            );
            return {
              pass: true,
            };
          },
        };
      },
    });
  });

  it('does nothing before `prime` starts', () => {
    expect(() => {
      // Nothing.
    }).toTriggerReadyStateChanges([
      // Nothing.
    ]);
  });

  it('is not ready or done after a request', () => {
    expect(request => {
      request.block();
    }).toTriggerReadyStateChanges([
      {done: false, ready: false},
    ]);
  });

  it('is ready but not done when required data is resolved', () => {
    expect(request => {
      request.block();
      request.resolve();
    }).toTriggerReadyStateChanges([
      {done: false, ready: false},
      {done: false, ready: true},
    ]);
  });

  it('is ready and done when request succeeds', () => {
    expect(request => {
      request.block();
      request.resolve();
      request.succeed();
    }).toTriggerReadyStateChanges([
      {done: false, ready: false},
      {done: false, ready: true},
      {done: true, ready: true},
    ]);
  });

  it('is ready and done if data is resolved without a request', () => {
    expect(request => {
      request.resolve();
      request.succeed();
    }).toTriggerReadyStateChanges([
      {done: false, ready: true},
      {done: true, ready: true},
    ]);
  });

  it('is ready with an error when a failure occurs with required data', () => {
    const error = new Error('Expected error.');
    expect(request => {
      request.block();
      request.resolve();
      request.fail(error);
    }).toTriggerReadyStateChanges([
      {done: false, error: null, ready: false},
      {done: false, error: null, ready: true},
      {done: false, error, ready: true},
    ]);
  });

  it('has an error when a failure occurs without required data', () => {
    const error = new Error('Expected error.');
    expect(request => {
      request.block();
      request.fail(error);
    }).toTriggerReadyStateChanges([
      {done: false, error: null, ready: false},
      {done: false, error, ready: false},
    ]);
  });

  it('has an error when a failure occurs before sending a request', () => {
    const error = new Error('Expected error.');
    expect(request => {
      request.fail(error);
    }).toTriggerReadyStateChanges([
      {done: false, error, ready: false},
    ]);
  });

  it('does nothing when aborted from query configuration change', () => {
    expect(request => {
      ReactDOM.render(
        <RelayRenderer
          Container={MockContainer}
          queryConfig={RelayQueryConfig.genMockInstance()}
          environment={environment}
          onReadyStateChange={onReadyStateChange}
        />,
        container
      );
    }).toTriggerReadyStateChanges([
      // Nothing.
    ]);
  });

  it('is aborted and not mounted when aborted from unmounting', () => {
    expect(request => {
      ReactDOM.unmountComponentAtNode(container);
    }).toTriggerReadyStateChanges([
      {aborted: true, mounted: false},
    ]);
  });
});

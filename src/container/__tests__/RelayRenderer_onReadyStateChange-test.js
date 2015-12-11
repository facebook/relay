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
const RelayQueryConfig = require('RelayQueryConfig');
const RelayRenderer = require('RelayRenderer');
const RelayStore = require('RelayStore');

describe('RelayRenderer.onReadyStateChange', () => {
  let MockComponent;
  let MockContainer;
  let ShallowRenderer;

  let queryConfig;

  beforeEach(() => {
    jest.resetModuleRegistry();

    MockComponent = React.createClass({render: () => <div />});
    MockContainer = Relay.createContainer(MockComponent, {
      fragments: {},
    });
    ShallowRenderer = ReactTestUtils.createRenderer();

    queryConfig = RelayQueryConfig.genMockInstance();
  });

  let onReadyStateChange;

  beforeEach(() => {
    onReadyStateChange = jest.genMockFunction();
    ShallowRenderer.render(
      <RelayRenderer
        Component={MockContainer}
        queryConfig={queryConfig}
        onReadyStateChange={onReadyStateChange}
      />
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
            const request = RelayStore.primeCache.mock.requests[0];
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
      ShallowRenderer.render(
        <RelayRenderer
          Component={MockContainer}
          queryConfig={RelayQueryConfig.genMockInstance()}
          onReadyStateChange={onReadyStateChange}
        />
      );
    }).toTriggerReadyStateChanges([
      // Nothing.
    ]);
  });

  it('is aborted and not mounted when aborted from unmounting', () => {
    expect(request => {
      ShallowRenderer.unmount();
    }).toTriggerReadyStateChanges([
      {aborted: true, mounted: false},
    ]);
  });
});

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
  .mock('../../store/RelayEnvironment')
  .useFakeTimers();

require('configureForRelayOSS');

const React = require('React');
const ReactTestRenderer = require('react-test-renderer');
const Relay = require('../../RelayPublic');
const RelayEnvironment = require('../../store/RelayEnvironment');
const RelayQueryConfig = require('../../query-config/RelayQueryConfig');
const RelayRenderer = require('../RelayRenderer');

describe('RelayRenderer.onReadyStateChange', () => {
  let MockContainer;

  let container;
  let queryConfig;
  let environment;

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
  });

  let onReadyStateChange;

  beforeEach(() => {
    onReadyStateChange = jest.fn();
    container.update(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={environment}
        onReadyStateChange={onReadyStateChange}
      />,
    );
    const defaultState = {
      aborted: false,
      done: false,
      error: null,
      mounted: true,
      ready: false,
      stale: false,
    };
    expect.extend({
      toTriggerReadyStateChanges(requestCallback, expected) {
        const request = environment.primeCache.mock.requests[0];
        requestCallback(request);
        jest.runAllTimers();

        expect(onReadyStateChange.mock.calls.map(args => args[0])).toEqual(
          expected.map(deltaState => ({...defaultState, ...deltaState})),
        );
        return {
          pass: true,
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
    }).toTriggerReadyStateChanges([{done: false, ready: false}]);
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
    }).toTriggerReadyStateChanges([{done: false, error, ready: false}]);
  });

  it('does nothing when aborted from query configuration change', () => {
    expect(request => {
      container.update(
        <RelayRenderer
          Container={MockContainer}
          queryConfig={RelayQueryConfig.genMockInstance()}
          environment={environment}
          onReadyStateChange={onReadyStateChange}
        />,
      );
    }).toTriggerReadyStateChanges([
      // Nothing.
    ]);
  });

  it('is aborted and not mounted when aborted from unmounting', () => {
    expect(request => {
      container.unmount();
    }).toTriggerReadyStateChanges([{aborted: true, mounted: false}]);
  });
});

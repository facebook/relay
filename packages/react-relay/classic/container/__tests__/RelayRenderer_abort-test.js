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
const Relay = require('../../RelayPublic');
const RelayEnvironment = require('../../store/RelayEnvironment');
const RelayQueryConfig = require('../../query-config/RelayQueryConfig');
const RelayRenderer = require('../RelayRenderer');

describe('RelayRenderer.abort', () => {
  let MockContainer;

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

    const container = ReactTestRenderer.create();
    const environment = new RelayEnvironment();

    function render() {
      const queryConfig = RelayQueryConfig.genMockInstance();
      container.update(
        <RelayRenderer
          Container={MockContainer}
          queryConfig={queryConfig}
          environment={environment}
        />,
      );
      const index = environment.primeCache.mock.calls.length - 1;
      return {
        abort: environment.primeCache.mock.abort[index],
        request: environment.primeCache.mock.requests[index],
      };
    }
    expect.extend({
      toAbortOnUpdate(actual) {
        const {abort, request} = render();
        actual(request);
        render();
        return {
          pass: abort.mock.calls.length > 0,
        };
      },
      toAbortOnUnmount(actual) {
        const {abort, request} = render();
        actual(request);
        container.unmount();
        return {
          pass: abort.mock.calls.length > 0,
        };
      },
    });
  });

  it('aborts synchronously initiated queries', () => {
    function synchronousQueries(request) {
      // Requests are always asynchronous, so do nothing.
    }
    expect(synchronousQueries).toAbortOnUpdate();
    expect(synchronousQueries).toAbortOnUnmount();
  });

  it('aborts blocked queries', () => {
    function blockedQueries(request) {
      // Queries are blocked on asynchronous requests.
      request.block();
    }
    expect(blockedQueries).toAbortOnUpdate();
    expect(blockedQueries).toAbortOnUnmount();
  });

  it('aborts queries with fulfilled dependencies', () => {
    function readyQueries(request) {
      request.block();
      request.resolve();
    }
    expect(readyQueries).toAbortOnUpdate();
    expect(readyQueries).toAbortOnUnmount();
  });

  it('does not abort failed queries', () => {
    function failedQueries(request) {
      request.fail(new Error());
    }
    expect(failedQueries).not.toAbortOnUpdate();
    expect(failedQueries).not.toAbortOnUnmount();
  });

  it('does not abort completed queries', () => {
    function completedQueries(request) {
      request.block();
      request.resolve();
      request.succeed();
    }
    expect(completedQueries).not.toAbortOnUpdate();
    expect(completedQueries).not.toAbortOnUnmount();
  });
});

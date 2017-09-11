/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

jest.enableAutomock();

require('configureForRelayOSS');

jest.unmock('RelayRenderer');
jest.unmock('react-test-renderer');

const React = require('React');
const ReactTestRenderer = require('react-test-renderer');
const RelayClassic = require('RelayClassic');
const RelayEnvironment = require('RelayEnvironment');
const RelayQueryConfig = require('RelayQueryConfig');
const RelayRenderer = require('RelayRenderer');

describe('RelayRenderer.abort', () => {
  let MockContainer;

  beforeEach(() => {
    jest.resetModules();

    class MockComponent extends React.Component {
      render() {
        return <div />;
      }
    }
    MockContainer = RelayClassic.createContainer(MockComponent, {
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

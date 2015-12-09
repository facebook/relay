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
const ReactTestUtils = require('ReactTestUtils');
const Relay = require('Relay');
const RelayContext = require('RelayContext');
const RelayQueryConfig = require('RelayQueryConfig');
const RelayRenderer = require('RelayRenderer');

describe('RelayRenderer.abort', () => {
  let MockComponent;
  let MockContainer;
  let ShallowRenderer;

  beforeEach(() => {
    jest.resetModuleRegistry();

    MockComponent = React.createClass({render: () => <div />});
    MockContainer = Relay.createContainer(MockComponent, {
      fragments: {},
    });
    ShallowRenderer = ReactTestUtils.createRenderer();

    const relayContext = new RelayContext();

    function render() {
      const queryConfig = RelayQueryConfig.genMockInstance();
      ShallowRenderer.render(
        <RelayRenderer
          Container={MockContainer}
          queryConfig={queryConfig}
          relayContext={relayContext}
        />
      );
      const index = relayContext.primeCache.mock.calls.length - 1;
      return {
        abort: relayContext.primeCache.mock.abort[index],
        request: relayContext.primeCache.mock.requests[index],
      };
    }
    jasmine.addMatchers({
      toAbortOnUpdate() {
        return {
          compare(actual) {
            const {abort, request} = render();
            actual(request);
            render();
            return {
              pass: abort.mock.calls.length > 0,
            };
          },
        };
      },
      toAbortOnUnmount() {
        return {
          compare(actual) {
            const {abort, request} = render();
            actual(request);
            ShallowRenderer.unmount();
            return {
              pass: abort.mock.calls.length > 0,
            };
          },
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

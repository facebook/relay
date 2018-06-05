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
const RelayTestUtils = require('RelayTestUtils');

describe('RelayRenderer.renderArgs', () => {
  let MockContainer;

  let queryConfig;
  let environment;
  let render;

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
    queryConfig = RelayQueryConfig.genMockInstance();
    environment = new RelayEnvironment();

    render = jest.fn();
    container.update(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={environment}
        render={render}
      />,
    );
    expect.extend(RelayTestUtils.matchers);
    expect.extend({
      toRenderWithArgs(actual, expected) {
        // Assume that if `forceFetch` requests exist, they were last.
        const requests =
          environment.forceFetch.mock.requests.length > 0
            ? environment.forceFetch.mock.requests
            : environment.primeCache.mock.requests;
        actual(requests[requests.length - 1]);
        const renders = render.mock.calls;
        const renderArgs = renders[renders.length - 1][0];
        return {
          pass: Object.keys(expected).every(argName => {
            expect(renderArgs[argName]).toEqual(expected[argName]);
            return true;
          }),
        };
      },
    });
  });

  it('has default values before request is sent', () => {
    expect(() => {
      // Nothing.
    }).toRenderWithArgs({
      done: false,
      error: null,
      props: null,
      stale: false,
    });
  });

  it('is not `done` until request succeeds', () => {
    expect(request => request.block()).toRenderWithArgs({
      done: false,
      error: null,
      props: null,
      stale: false,
    });
    expect(request => request.succeed()).toRenderWithArgs({
      done: true,
      error: null,
      props: {},
      stale: false,
    });
  });

  it('has `error` when request fails before request is sent', () => {
    const error = new Error('Expected error.');
    expect(request => request.fail(error)).toRenderWithArgs({
      done: false,
      error,
      props: null,
      stale: false,
    });
  });

  it('is `stale` and has `props` when request resolves from cache', () => {
    expect(request => request.resolve({stale: true})).toRenderWithArgs({
      done: false,
      error: null,
      props: {},
      stale: true,
    });
  });

  it('has `props` when request resolves from cache after request fails', () => {
    const error = new Error('Expected error.');
    expect(request => request.fail(error)).toRenderWithArgs({
      done: false,
      error,
      props: null,
      stale: false,
    });
    expect(request => request.resolve({stale: true})).toRenderWithArgs({
      done: false,
      error,
      props: {},
      stale: true,
    });
  });

  it('has a `retry` function that retries the request', () => {
    const error = new Error('Expected error.');
    expect(request => request.fail(error)).toRenderWithArgs({error});

    const {retry} = render.mock.calls[1][0];
    expect(typeof retry).toBe('function');
    expect(environment.primeCache.mock.calls.length).toBe(1);
    retry();
    expect(environment.primeCache.mock.calls.length).toBe(2);
  });

  it('has a `retry` function that does nothing without a failure', () => {
    const {retry} = render.mock.calls[0][0];
    expect(typeof retry).toBe('function');
    expect(environment.primeCache.mock.calls.length).toBe(1);
    retry();
    expect(environment.primeCache.mock.calls.length).toBe(1);
  });
});

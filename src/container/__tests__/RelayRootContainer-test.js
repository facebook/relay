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

var RelayTestUtils = require('RelayTestUtils');
RelayTestUtils.unmockRelay();

jest.dontMock('RelayRootContainer');

var React = require('React');
var ReactDOM = require('ReactDOM');
var ReactTestUtils = require('ReactTestUtils');
var Relay = require('Relay');
var RelayRootContainer = require('RelayRootContainer');
var RelayRoute = require('RelayRoute');
var RelayStoreData = require('RelayStoreData');
var getRelayQueries = require('getRelayQueries');
var GraphQLFragmentPointer = require('GraphQLFragmentPointer');

describe('RelayRootContainer', function() {
  var RelayStore;

  var ReactComponent;
  var RelayContainer;
  var ShallowRenderer;

  var route;

  beforeEach(() => {
    jest.resetModuleRegistry();

    RelayStore = require('RelayStore');

    ReactComponent = React.createClass({render: () => <div />});
    RelayContainer = Relay.createContainer(ReactComponent, {
      fragments: {}
    });
    ShallowRenderer = ReactTestUtils.createRenderer();

    route = RelayRoute.genMockInstance();

    jest.addMatchers({
      ...RelayTestUtils.matchers,
      toBeShallowUpdated() {
        return this.actual.props.shouldUpdate;
      },
      toBeShallowRenderedChild() {
        return ShallowRenderer.getRenderOutput().props.children === this.actual;
      },
    });
  });

  describe('context', () => {
    var RouteAwareComponent;

    beforeEach(() => {
      RouteAwareComponent = React.createClass({
        contextTypes: {
          route: Relay.PropTypes.QueryConfig.isRequired,
        },
        render: function() {
          this.props.onRender.call(this);
          return null;
        },
      });
      var container = document.createElement('div');
      jest.addMatchers({
        toRenderChildWithRoute(route) {
          var context;
          function onRender() {
            context = this.context;
          }
          var renderLoading = function() {
            return <RouteAwareComponent onRender={onRender} />;
          };
          var element = React.cloneElement(
            this.actual,
            {renderLoading: renderLoading}
          );
          ReactDOM.render(element, container);
          var mockRequests = RelayStore.primeCache.mock.requests;
          mockRequests[mockRequests.length - 1].block();
          return context.route === route;
        },
      });
    });

    it('sets route on the rendered component context', () => {
      expect(
        <RelayRootContainer Component={RelayContainer} route={route} />
      ).toRenderChildWithRoute(route);
    });

    it('updates route on the rendered component context', () => {
      expect(
        <RelayRootContainer Component={RelayContainer} route={route} />
      ).toRenderChildWithRoute(route);

      var anotherRoute = RelayRoute.genMockInstance();
      expect(
        <RelayRootContainer Component={RelayContainer} route={anotherRoute} />
      ).toRenderChildWithRoute(anotherRoute);
    });
  });

  describe('validation', () => {
    var {error} = console;
    beforeEach(() => {
      console.error = jest.genMockFunction().mockImplementation(message => {
        throw new Error(message.replace(/Composite propType/, 'propType'));
      });
    });
    afterEach(() => {
      console.error = error;
    });

    it('requires a valid `Component` prop', () => {
      expect(() => ShallowRenderer.render(
        <RelayRootContainer route={route} />
      )).toThrow(
        'Warning: Failed propType: Required prop `Component` was ' +
        'not specified in `RelayRootContainer`.'
      );

      expect(() => ShallowRenderer.render(
        <RelayRootContainer Component={ReactComponent} route={route} />
      )).toThrow(
        'Warning: Failed propType: Invalid prop `Component` ' +
        'supplied to `RelayRootContainer`, expected a RelayContainer.'
      );
    });

    it('requires a valid `route` prop', () => {
      expect(() => ShallowRenderer.render(
        <RelayRootContainer Component={RelayContainer} />
      )).toThrow(
        'Warning: Failed propType: Required prop `route` was not ' +
        'specified in `RelayRootContainer`.'
      );

      expect(() => ShallowRenderer.render(
        <RelayRootContainer Component={RelayContainer} route={{}} />
      )).toThrow(
        'Warning: Failed propType: Required prop `route.name` was not ' +
        'specified in `RelayRootContainer`.'
      );
    });
  });

  describe('mounting', () => {
    it('creates and primes cache for queries from the component', () => {
      ShallowRenderer.render(
        <RelayRootContainer Component={RelayContainer} route={route} />
      );
      expect(getRelayQueries).toBeCalledWith(RelayContainer, route);
      expect(RelayStore.primeCache).toBeCalled();
    });

    it('creates and fetches queries when configured to fetch', () => {
      ShallowRenderer.render(
        <RelayRootContainer
          Component={RelayContainer}
          route={route}
          forceFetch={true}
        />
      );
      expect(getRelayQueries).toBeCalledWith(RelayContainer, route);
      expect(RelayStore.forceFetch).toBeCalled();
    });

    it('renders the initial view via `renderLoading`', () => {
      var loadingElement = <div />;
      var renderLoading =
        jest.genMockFunction().mockReturnValue(loadingElement);
      ShallowRenderer.render(
        <RelayRootContainer
          Component={RelayContainer}
          route={route}
          renderLoading={renderLoading}
        />
      );
      expect(renderLoading).toBeCalled();
      expect(loadingElement).toBeShallowRenderedChild();
    });

    it('renders null initial view if `renderLoading` is not supplied', () => {
      ShallowRenderer.render(
        <RelayRootContainer
          Component={RelayContainer}
          route={route}
          renderLoading={null}
        />
      );
      expect(null).toBeShallowRenderedChild();
    });
  });

  describe('updating', () => {
    beforeEach(() => {
      // We're testing updates, so start with an initial render.
      ShallowRenderer.render(
        <RelayRootContainer Component={RelayContainer} route={route} />
      );
    });

    it('does nothing when `Component` and `route` is already requested', () => {
      ShallowRenderer.render(
        <RelayRootContainer Component={RelayContainer} route={route} />
      );
      expect(getRelayQueries.mock.calls).toEqual([[RelayContainer, route]]);
      expect(RelayStore.primeCache.mock.calls.length).toBe(1);
    });

    it('does nothing when `Component` and `route` is already resolved', () => {
      RelayStore.primeCache.mock.requests[0].succeed();

      ShallowRenderer.render(
        <RelayRootContainer Component={RelayContainer} route={route} />
      );
      expect(getRelayQueries.mock.calls).toEqual([[RelayContainer, route]]);
      expect(RelayStore.primeCache.mock.calls.length).toBe(1);
    });

    it('creates and primes queries when `Component` changes', () => {
      var AnotherComponent = React.createClass({render: () => <div />});
      var AnotherContainer = Relay.createContainer(AnotherComponent, {
        fragments: {}
      });
      ShallowRenderer.render(
        <RelayRootContainer Component={AnotherContainer} route={route} />
      );
      expect(getRelayQueries.mock.calls).toEqual([
        [RelayContainer, route],
        [AnotherContainer, route],
      ]);
      expect(RelayStore.primeCache.mock.calls.length).toBe(2);
    });

    it('creates and primes queries when `route` changes', () => {
      var anotherRoute = RelayRoute.genMockInstance();
      ShallowRenderer.render(
        <RelayRootContainer Component={RelayContainer} route={anotherRoute} />
      );
      expect(getRelayQueries.mock.calls).toEqual([
        [RelayContainer, route],
        [RelayContainer, anotherRoute],
      ]);
      expect(RelayStore.primeCache.mock.calls.length).toBe(2);
    });

    it('updates when `Component` and `route` is already resolved', () => {
      RelayStore.primeCache.mock.requests[0].block();

      var loadingElement = <div />;
      ShallowRenderer.render(
        <RelayRootContainer
          Component={RelayContainer}
          route={route}
          renderLoading={() => loadingElement}
        />
      );
      expect(loadingElement).toBeShallowRenderedChild();
    });

    it('does not update until `prime` or `fetch` starts', () => {
      var anotherRoute = RelayRoute.genMockInstance();
      var anotherLoadingElement = <div />;
      ShallowRenderer.render(
        <RelayRootContainer
          Component={RelayContainer}
          route={anotherRoute}
          renderLoading={() => anotherLoadingElement}
        />
      );
      // RelayRootContainer should not update because it does not know whether
      // to invoke `renderLoading` or `renderFetched` (or `renderFailure`).
      expect(ShallowRenderer.getRenderOutput()).not.toBeShallowUpdated();

      RelayStore.primeCache.mock.requests[1].block();
      expect(anotherLoadingElement).toBeShallowRenderedChild();
    });
  });

  describe('blocking', () => {
    beforeEach(() => {
      ShallowRenderer.render(
        <RelayRootContainer Component={RelayContainer} route={route} />
      );
      RelayStore.primeCache.mock.requests[0].succeed();
    });

    it('renders via `renderLoading` when blocked', () => {
      var loadingElement = <div />;
      var anotherRoute = RelayRoute.genMockInstance();
      ShallowRenderer.render(
        <RelayRootContainer
          Component={RelayContainer}
          route={anotherRoute}
          renderLoading={() => loadingElement}
        />
      );
      RelayStore.primeCache.mock.requests[1].block();
      expect(loadingElement).toBeShallowRenderedChild();
    });

    it('keeps the existing view if `renderLoading` is not supplied', () => {
      var anotherRoute = RelayRoute.genMockInstance();
      ShallowRenderer.render(
        <RelayRootContainer
          Component={RelayContainer}
          route={anotherRoute}
          renderLoading={null}
        />
      );
      RelayStore.primeCache.mock.requests[1].block();
      expect(ShallowRenderer.getRenderOutput()).not.toBeShallowUpdated();
    });

    it('keeps the existing view if `renderLoading` returns undefined', () => {
      var anotherRoute = RelayRoute.genMockInstance();
      ShallowRenderer.render(
        <RelayRootContainer
          Component={RelayContainer}
          route={anotherRoute}
          renderLoading={() => undefined}
        />
      );
      RelayStore.primeCache.mock.requests[1].block();
      expect(ShallowRenderer.getRenderOutput()).not.toBeShallowUpdated();
    });
  });

  describe('aborting', () => {
    beforeEach(() => {
      function render() {
        var mockRoute = RelayRoute.genMockInstance();
        ShallowRenderer.render(
          <RelayRootContainer Component={RelayContainer} route={mockRoute} />
        );
        var index = RelayStore.primeCache.mock.calls.length - 1;
        return {
          abort: RelayStore.primeCache.mock.abort[index],
          request: RelayStore.primeCache.mock.requests[index],
        };
      }
      jest.addMatchers({
        toAbortOnUpdate() {
          var {abort, request} = render();
          this.actual(request);
          render();
          return abort.mock.calls.length > 0;
        },
        toAbortOnUnmount() {
          var {abort, request} = render();
          this.actual(request);
          ShallowRenderer.unmount();
          return abort.mock.calls.length > 0;
        },
      });
    });

    it('aborts incomplete requests', () => {
      expect(request => {}).toAbortOnUpdate();
      expect(request => {}).toAbortOnUnmount();
    });

    it('aborts loading requests', () => {
      function mockLoading(request) {
        request.block();
      }
      expect(mockLoading).toAbortOnUpdate();
      expect(mockLoading).toAbortOnUnmount();
    });

    it('aborts resolvable loading requests', () => {
      function mockResolvableLoading(request) {
        request.block();
        request.resolve();
      }
      expect(mockResolvableLoading).toAbortOnUpdate();
      expect(mockResolvableLoading).toAbortOnUnmount();
    });

    it('does not abort failed requests', () => {
      function mockFailure(request) {
        request.fail(new Error());
      }
      expect(mockFailure).not.toAbortOnUpdate();
      expect(mockFailure).not.toAbortOnUnmount();
    });

    it('does not abort successful requests', () => {
      function mockSuccess(request) {
        request.block();
        request.resolve();
        request.succeed();
      }
      expect(mockSuccess).not.toAbortOnUpdate();
      expect(mockSuccess).not.toAbortOnUnmount();
    });
  });

  describe('rendering', () => {
    var elements;
    var callbacks;

    beforeEach(() => {
      elements = {
        loading: <div />,
        resolve: <div />,
        failure: <div />,
      };
      callbacks = {
        renderLoading: jest.genMockFunction().mockReturnValue(elements.loading),
        renderFetched: jest.genMockFunction().mockReturnValue(elements.resolve),
        renderFailure: jest.genMockFunction().mockReturnValue(elements.failure),
      };
    });

    it('renders to null if `renderLoading` is not specified', () => {
      ShallowRenderer.render(
        <RelayRootContainer Component={RelayContainer} route={route} />
      );
      expect(null).toBeShallowRenderedChild();
    });

    it('renders to null if `renderFailure` is not specified', () => {
      ShallowRenderer.render(
        <RelayRootContainer Component={RelayContainer} route={route} />
      );
      RelayStore.primeCache.mock.requests[0].fail(new Error());
      expect(null).toBeShallowRenderedChild();
    });

    it('renders the component if `renderFetched` is not specified', () => {
      ShallowRenderer.render(
        <RelayRootContainer Component={RelayContainer} route={route} />
      );
      RelayStore.primeCache.mock.requests[0].resolve();

      var output = ShallowRenderer.getRenderOutput().props.children;
      expect(output.type).toBe(RelayContainer);
      expect(output.props).toEqual({});
    });

    it('calls `renderLoading` for a blocking request', () => {
      ShallowRenderer.render(
        <RelayRootContainer
          {...callbacks}
          Component={RelayContainer}
          route={route}
        />
      );
      RelayStore.primeCache.mock.requests[0].block();

      expect(callbacks.renderLoading).toBeCalled();
      expect(elements.loading).toBeShallowRenderedChild();
    });

    it('calls `renderFetched` with fragment pointers when resolvable', () => {
      var fragmentPointer = {};
      var query = {};
      GraphQLFragmentPointer.createForRoot.mockReturnValue(fragmentPointer);
      getRelayQueries.mockReturnValue({viewer: query});

      ShallowRenderer.render(
        <RelayRootContainer
          {...callbacks}
          Component={RelayContainer}
          route={route}
        />
      );
      RelayStore.primeCache.mock.requests[0].block();
      RelayStore.primeCache.mock.requests[0].resolve();

      expect(GraphQLFragmentPointer.createForRoot).toBeCalledWith(
        RelayStoreData.getDefaultInstance().getQueuedStore(),
        query
      );

      expect(callbacks.renderFetched).toBeCalled();
      expect(callbacks.renderFetched.mock.calls[0][0].viewer)
        .toBe(fragmentPointer);
      expect(elements.resolve).toBeShallowRenderedChild();
    });

    it('passes route params and fragment pointers to `renderFetched`', () => {
      var fragmentPointer = {};
      var query = {};
      GraphQLFragmentPointer.createForRoot.mockReturnValue(fragmentPointer);
      getRelayQueries.mockReturnValue({viewer: query});

      var MockRoute = RelayRoute.genMock();
      route = new MockRoute({
        routeParam: '42',
        viewer: 'this-will-be-overwritten',
      });

      var data = null;
      ShallowRenderer.render(
        <RelayRootContainer
          renderFetched={_data => data = _data}
          Component={RelayContainer}
          route={route}
        />
      );
      RelayStore.primeCache.mock.requests[0].block();
      RelayStore.primeCache.mock.requests[0].resolve();

      expect(GraphQLFragmentPointer.createForRoot).toBeCalled();
      expect(GraphQLFragmentPointer.createForRoot.mock.calls[0][1]).toBe(query);

      expect(data.viewer).toBe(fragmentPointer);
      expect(data.routeParam).toEqual('42');
    });

    it('calls `renderFetched` with fetch state', () => {
      var fragmentPointer = {};
      var query = {};
      GraphQLFragmentPointer.createForRoot.mockReturnValue(fragmentPointer);
      getRelayQueries.mockReturnValue({viewer: query});

      ShallowRenderer.render(
        <RelayRootContainer
          {...callbacks}
          Component={RelayContainer}
          route={route}
          forceFetch={true}
        />
      );
      RelayStore.forceFetch.mock.requests[0].resolve({stale: true});
      RelayStore.forceFetch.mock.requests[0].resolve({stale: false});
      RelayStore.forceFetch.mock.requests[0].succeed();

      expect(callbacks.renderFetched.mock.calls.map(args => args[1])).toEqual([
        {
          done: false,
          stale: true,
        },
        {
          done: false,
          stale: false,
        },
        {
          done: true,
          stale: false,
        }
      ]);
    });

    it('calls `renderFailure` with an error for a failed request', () => {
      var error = new Error();

      ShallowRenderer.render(
        <RelayRootContainer
          {...callbacks}
          Component={RelayContainer}
          route={route}
        />
      );
      RelayStore.primeCache.mock.requests[0].fail(error);

      expect(callbacks.renderFailure).toBeCalled();
      expect(callbacks.renderFailure.mock.calls[0][0]).toBe(error);
      expect(elements.failure).toBeShallowRenderedChild();
    });

    it('calls callbacks once each re-render after `primeCache` starts', () => {
      function render() {
        ShallowRenderer.render(
          <RelayRootContainer
            {...callbacks}
            Component={RelayContainer}
            route={route}
          />
        );
      }
      render();
      RelayStore.primeCache.mock.requests[0].block();

      expect(callbacks.renderLoading.mock.calls.length).toBe(2);

      render();
      render();
      render();

      expect(callbacks.renderLoading.mock.calls.length).toBe(5);
    });
  });

  describe('retries', () => {
    var retry;

    beforeEach(() => {
      var renderFailure = jest.genMockFunction().mockReturnValue(<div />);
      ShallowRenderer.render(
        <RelayRootContainer
          Component={RelayContainer}
          route={route}
          renderFailure={renderFailure}
        />
      );
      RelayStore.primeCache.mock.requests[0].fail(new Error());
      retry = renderFailure.mock.calls[0][1];
    });

    it('calls `renderFailure` with a retry function', () => {
      expect(typeof retry).toBe('function');
    });

    it('retries the failed request', () => {
      expect(RelayStore.primeCache.mock.calls.length).toBe(1);
      retry();
      expect(RelayStore.primeCache.mock.calls.length).toBe(2);
    });

    it('throws if called in a non-failure state', () => {
      expect(RelayStore.primeCache.mock.calls.length).toBe(1);
      retry();
      RelayStore.primeCache.mock.requests[1].block();
      expect(retry).toFailInvariant(
        'RelayRootContainer: Can only invoke `retry` in a failure state.'
      );
    });
  });

  describe('onReadyStateChange', () => {
    var defaultState;
    var onReadyStateChange;

    beforeEach(() => {
      defaultState = {
        aborted: false,
        done: false,
        error: null,
        mounted: true,
        ready: false,
        stale: false,
      };
      onReadyStateChange = jest.genMockFunction();
      ShallowRenderer.render(
        <RelayRootContainer
          Component={RelayContainer}
          route={route}
          onReadyStateChange={onReadyStateChange}
        />
      );
    });

    it('skips `onReadyStateChange` before `prime` starts', () => {
      expect(onReadyStateChange).not.toBeCalled();
    });

    it('calls `onReadyStateChange` for a blocking request', () => {
      RelayStore.primeCache.mock.requests[0].block();

      expect(onReadyStateChange.mock.calls).toEqual([
        [{...defaultState}],
      ]);
    });

    it('calls `onReadyStateChange` when resolvable', () => {
      RelayStore.primeCache.mock.requests[0].block();
      RelayStore.primeCache.mock.requests[0].resolve();

      expect(onReadyStateChange.mock.calls).toEqual([
        [{...defaultState, ready: false}],
        [{...defaultState, ready: true}],
      ]);
    });

    it('calls `onReadyStateChange` when all data is resolvable', () => {
      RelayStore.primeCache.mock.requests[0].block();
      RelayStore.primeCache.mock.requests[0].resolve();
      RelayStore.primeCache.mock.requests[0].succeed();

      expect(onReadyStateChange.mock.calls).toEqual([
        [{...defaultState, done: false, ready: false}],
        [{...defaultState, done: false, ready: true}],
        [{...defaultState, done: true, ready: true}],
      ]);
    });

    it('calls `onReadyStateChange` if resolvable without a request', () => {
      RelayStore.primeCache.mock.requests[0].resolve();
      RelayStore.primeCache.mock.requests[0].succeed();

      expect(onReadyStateChange.mock.calls).toEqual([
        [{...defaultState, done: false, ready: true}],
        [{...defaultState, done: true, ready: true}],
      ]);
    });

    it('calls `onReadyStateChange` when a failure occurs with data', () => {
      var error = new Error();
      RelayStore.primeCache.mock.requests[0].block();
      RelayStore.primeCache.mock.requests[0].resolve();
      RelayStore.primeCache.mock.requests[0].fail(error);

      expect(onReadyStateChange.mock.calls).toEqual([
        [{...defaultState, error: null, ready: false}],
        [{...defaultState, error: null, ready: true}],
        [{...defaultState, error, ready: true}],
      ]);
    });

    it('calls `onReadyStateChange` when a failure occurs without data', () => {
      var error = new Error();
      RelayStore.primeCache.mock.requests[0].block();
      RelayStore.primeCache.mock.requests[0].fail(error);

      expect(onReadyStateChange.mock.calls).toEqual([
        [{...defaultState, error: null}],
        [{...defaultState, error}],
      ]);
    });

    it('calls `onReadyStateChange` when a failure occurs immediately', () => {
      var error = new Error();
      RelayStore.primeCache.mock.requests[0].fail(error);

      expect(onReadyStateChange.mock.calls).toEqual([
        [{...defaultState, error}],
      ]);
    });

    it('skips `onReadyStateChange` when aborted due to route change', () => {
      var anotherRoute = RelayRoute.genMockInstance();
      ShallowRenderer.render(
        <RelayRootContainer
          Component={RelayContainer}
          route={anotherRoute}
          onReadyStateChange={onReadyStateChange}
        />
      );
      jest.runAllTimers();

      expect(onReadyStateChange.mock.calls.length).toBe(0);
    });

    it('calls `onReadyStateChange` when aborted due to unmount', () => {
      ShallowRenderer.unmount();
      jest.runAllTimers();

      expect(onReadyStateChange.mock.calls).toEqual([
        [{...defaultState, aborted: true, mounted: false}],
      ]);
    });
  });
});

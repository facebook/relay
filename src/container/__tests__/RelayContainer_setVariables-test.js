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

require('RelayTestUtils').unmockRelay();

var React = require('React');
var ReactDOM = require('ReactDOM');
var Relay = require('Relay');
var RelayMetaRoute = require('RelayMetaRoute');
var RelayStoreData = require('RelayStoreData');
var RelayTestUtils = require('RelayTestUtils');

describe('RelayContainer.setVariables', function() {
  var MockComponent;
  var MockContainer;

  var defaultState;
  var domContainer;
  var entityQuery;
  var mockInstance;
  var render;
  var storeData;

  beforeEach(function() {
    jest.resetModuleRegistry();

    entityQuery = jest.genMockFunction().mockImplementation(
      () => Relay.QL`fragment on Node{url(site:$site)}`
    );
    render = jest.genMockFunction().mockImplementation(() => <div />);

    // Make RQLTransform ignore this call.
    MockComponent = React.createClass({render});
    var createContainer = Relay.createContainer;
    MockContainer = createContainer(MockComponent, {
      fragments: {
        entity: entityQuery
      },
      initialVariables: {site: 'mobile'}
    });

    storeData = RelayStoreData.getDefaultInstance();
    storeData.readFragmentPointer.mockImplementation(pointer => {
      expect(pointer.getDataID()).toBe('42');
      return {
        __dataID__: '42',
        id: '42',
        url: '//url',
        profilePicture: {
          uri: '//url'
        }
      };
    });
    storeData.observeFragmentPointer.mockImplementation(() => {
      return {dispose: jest.genMockFunction()};
    });
    defaultState = {
      aborted: false,
      done: false,
      error: null,
      mounted: true,
      ready: false,
      stale: false,
    };
    domContainer = document.createElement('div');
    mockInstance = RelayTestUtils.createRenderer(domContainer).render(
      genMockPointer => <MockContainer entity={genMockPointer('42')} />
    );

    this.addMatchers(RelayTestUtils.matchers);
  });

  describe('plural fragments', () => {
    var getNode;
    var getPointer;

    beforeEach(() => {
      ({getNode, getPointer} = RelayTestUtils);
      storeData.readFragmentPointer.mockImplementation(pointer => {
        return [{
          __dataID__: '42',
          id: '42',
          url: '//url',
          profilePicture: {
            uri: '//url'
          }
        }];
      });
      var pluralEntityQuery = jest.genMockFunction().mockImplementation(
        () => Relay.QL`
          fragment on Node @relay(plural:true) {
            url(site: $site)
          }
        `
      );
      MockContainer = Relay.createContainer(MockComponent, {
        fragments: {
          entity: pluralEntityQuery
        },
        initialVariables: {site: 'mobile'}
      });

      // Return an array
      storeData.readFragmentPointer.mockImplementation(pointers => {
        expect(pointers.map(pointer => pointer.getDataID()))
          .toEqual(['21', '42']);
        return [
          {
            __dataID__: '21',
            id: '21',
            url: '//url',
            profilePicture: {
              uri: '//url'
            }
          },
          {
            __dataID__: '42',
            id: '42',
            url: '//url',
            profilePicture: {
              uri: '//url'
            }
          },
        ];
      });

      var mockPointer = getPointer(
        ['21', '42'],
        getNode(MockContainer.getFragment('entity').getFragment())
      );
      mockInstance = RelayTestUtils.createRenderer(domContainer).render(
        genMockPointer => (
          <MockContainer entity={mockPointer} />
        )
      );
    });

    it('creates multiple queries for plural fragments', () => {
      jest.runAllTimers();

      mockInstance.forceFetch();

      expect(Relay.Store.forceFetch).toBeCalled();
      var querySet = Relay.Store.forceFetch.mock.calls[0][0];
      expect(Object.keys(querySet)).toEqual(['entity0', 'entity1']);
    });

    it('creates queries only for records with dataIDs', () => {
      var updatedQueryData = [
        {__dataID__: '21', id: '21', url: '//www'},
        {id:'1336', name: 'Fake data', url: '//www'}
      ];
      storeData.readFragmentPointer.mockImplementation(pointer => {
        return updatedQueryData;
      });

      // Change the query data that is stored by the container to
      // `updatedQueryData`
      mockInstance.forceFetch();
      Relay.Store.forceFetch.mock.requests[0].succeed();
      mockInstance.forceFetch();
      var querySet = Relay.Store.forceFetch.mock.calls[1][0];
      expect(Object.keys(querySet)).toEqual(['entity0']);
    });

    it('resolves data using updated `variables`', () => {
      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();

      var updatedQueryData = [
        {__dataID__: '21', id: '21', url: '//www'},
        {__dataID__: '42', id: '42', url: '//www'},
      ];
      storeData.readFragmentPointer.mockImplementation(fragmentPointers => {
        expect(Array.isArray(fragmentPointers)).toBe(true);
        fragmentPointers.forEach(fragmentPointer => {
          expect(fragmentPointer.getFragment().getVariables())
            .toEqual({site: 'www'});
        });
        return updatedQueryData;
      });
      Relay.Store.primeCache.mock.requests[0].succeed();

      expect(mockInstance.state.queryData.entity).toBe(updatedQueryData);
    });

    it('throws when the queryData is not an array', () => {
      var updatedQueryData = {__dataID__: '21', id: '21', url: '//www'};
      storeData.readFragmentPointer.mockImplementation(pointer => {
        return updatedQueryData;
      });

      // Change the query data that is stored by the container to
      // `updatedQueryData`
      mockInstance.forceFetch();
      Relay.Store.forceFetch.mock.requests[0].succeed();
      expect(() => mockInstance.forceFetch()).toFailInvariant(
        'RelayContainer: Invalid queryData for `entity`, expected an array ' +
        'of records because the corresponding fragment is plural.',
      );
    });
  });

  describe('query builders', () => {
    it('are called with variables for variables', () => {
      expect(entityQuery.mock.calls.length).toBe(1);
      expect(entityQuery.mock.calls[0][0].site).toEqual(
        QueryBuilder.createCallVariable('site')
      );
    });

    it('are only called once', () => {
      expect(entityQuery.mock.calls.length).toBe(1);

      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();
      expect(entityQuery.mock.calls.length).toBe(1);
    });
  });

  describe('mount', () => {
    it('renders with default variables', () => {
      expect(mockInstance.state.variables.site).toBe('mobile');
    });

    it('lets props override default variables', () => {
      var anotherInstance = RelayTestUtils.createRenderer().render(
        genMockPointer => (
          <MockContainer entity={genMockPointer('42')} site="www" />
        )
      );
      expect(anotherInstance.state.variables.site).toBe('www');
    });
  });

  describe('update', () => {
    it('does not update `variables` until data is ready', () => {
      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();

      mockInstance.forceUpdate();

      expect(mockInstance.state.variables.site).toBe('mobile');
    });

    it('updates `variables` after callback when data is ready', () => {
      var mockCallback = jest.genMockFunction();
      mockInstance.setVariables({site: 'www'}, mockCallback);
      jest.runAllTimers();

      mockCallback.mockImplementation(() => {
        expect(mockInstance.state.variables.site).toBe('mobile');
      });
      Relay.Store.primeCache.mock.requests[0].succeed();
      expect(mockCallback.mock.calls.length).toBe(1);

      expect(mockInstance.state.variables.site).toBe('www');
    });

    it('resolves data using updated `variables`', () => {
      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();

      var updatedQueryData = {__dataID__: '42', id: '42', url: '//www'};
      storeData.readFragmentPointer.mockImplementation(pointer => {
        expect(pointer.getFragment().getVariables()).toEqual({site: 'www'});
        return updatedQueryData;
      });
      Relay.Store.primeCache.mock.requests[0].succeed();

      expect(mockInstance.state.queryData.entity).toBe(updatedQueryData);
    });

    it('aborts pending requests before creating a new request', () => {
      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();
      expect(Relay.Store.primeCache.mock.abort[0]).not.toBeCalled();

      mockInstance.setVariables({site: 'mobile'});
      jest.runAllTimers();
      expect(Relay.Store.primeCache.mock.abort[0]).toBeCalled();
    });

    it('invokes callback for a request that aborts a pending request', () => {
      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();

      Relay.Store.primeCache.mock.requests[0].block();

      var mockCallback = jest.genMockFunction();
      mockInstance.setVariables({site: 'mobile'}, mockCallback);
      jest.runAllTimers();

      Relay.Store.primeCache.mock.requests[1].block();
      expect(mockCallback).toBeCalled();
    });

    it('does not re-request the last variables', () => {
      mockInstance.setVariables({site: 'mobile'});
      jest.runAllTimers();

      var {mock} = Relay.Store.primeCache;
      expect(mock.calls.length).toBe(1);
      expect(Object.keys(mock.calls[0][0]).length).toBe(0);
    });

    it('re-requests currently pending variables', () => {
      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();

      expect(Relay.Store.primeCache.mock.abort[0]).not.toBeCalled();
      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();
      expect(Relay.Store.primeCache.mock.abort[0]).toBeCalled();
      expect(Relay.Store.primeCache.mock.calls.length).toBe(2);
    });

    it('re-requests the last variables for `forceFetch`', () => {
      mockInstance.forceFetch({site: 'mobile'});
      jest.runAllTimers();

      var {mock} = Relay.Store.forceFetch;
      expect(mock.calls.length).toBe(1);
      expect(Object.keys(mock.calls[0][0]).length).toBe(1);
    });

    it('does not re-request the last variables with a pending request', () => {
      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();

      expect(Relay.Store.primeCache.mock.abort[0]).not.toBeCalled();
      mockInstance.setVariables({site: 'mobile'});
      jest.runAllTimers();
      expect(Relay.Store.primeCache.mock.abort[0]).toBeCalled();

      expect(Relay.Store.primeCache.mock.calls.length).toBe(2);
      expect(Relay.Store.primeCache.mock.calls[1][0]).toEqual({});
    });

    it('invokes the callback as many times as ready state changes', () => {
      var mockFunction = jest.genMockFunction().mockImplementation(function() {
        expect(this.constructor).toBe(MockComponent);
      });
      mockInstance.setVariables({site: 'www'}, mockFunction);
      jest.runAllTimers();

      var request = Relay.Store.primeCache.mock.requests[0];
      request.block();
      request.succeed();

      expect(mockFunction.mock.calls).toEqual([
        [{...defaultState, done: false, ready: false}],
        [{...defaultState, done: true, ready: true}],
      ]);
    });

    it('invokes the callback with the component as `this`', () => {
      var mockFunction = jest.genMockFunction().mockImplementation(function() {
        expect(this.constructor).toBe(MockComponent);
      });
      mockInstance.setVariables({site: 'www'}, mockFunction);
      jest.runAllTimers();

      Relay.Store.primeCache.mock.requests[0].block();

      expect(mockFunction).toBeCalled();
    });

    it('reconciles only once even if callback calls `setState`', () => {
      var before = render.mock.calls.length;

      mockInstance.setVariables({site: 'www'}, function() {
        this.setState({isLoaded: true});
      });
      jest.runAllTimers();

      Relay.Store.primeCache.mock.requests[0].succeed();

      expect(render.mock.calls.length - before).toBe(1);
    });

    it('does not mutate previous `variables`', () => {
      var prevVariables = mockInstance.state.variables;
      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();

      Relay.Store.primeCache.mock.requests[0].succeed();

      expect(prevVariables).toEqual({site: 'mobile'});
      expect(mockInstance.state.variables).not.toBe(prevVariables);
    });
  });

  describe('prepareVariables()', () => {
    var prepareVariables;

    beforeEach(() => {
      entityQuery = jest.genMockFunction().mockImplementation(
        () => Relay.QL`fragment on Node{url(site:$site)}`
      );
      render = jest.genMockFunction().mockImplementation(() => <div />);
      prepareVariables = jest.genMockFunction().mockImplementation(
        (variables, route) => variables
      );

      // Make RQLTransform ignore this call.
      MockComponent = React.createClass({render});
      var createContainer = Relay.createContainer;
      MockContainer = createContainer(MockComponent, {
        fragments: {
          entity: entityQuery
        },
        initialVariables: {site: 'mobile'},
        prepareVariables,
      });
      mockInstance = RelayTestUtils.createRenderer(domContainer).render(
        genMockPointer => <MockContainer entity={genMockPointer('42')} />
      );
    });

    it('calls `prepareVariables` when `setVariables` is called', () => {
      var nextVariables = {site: 'mobile'};
      prepareVariables.mockImplementation((variables, route) => nextVariables);
      storeData.buildFragmentQueryForDataID.mockImplementation(
        require.requireActual('RelayStoreData').prototype.buildFragmentQueryForDataID
      );
      mockInstance.setVariables({site: 'www'});

      var calls = prepareVariables.mock.calls[1];
      expect(calls[0]).toEqual({site: 'www'});
      expect(calls[1]).toBe(
        RelayMetaRoute.get(mockInstance.context.route.name)
      );

      // `prepareVariables` output is used to prime the cache...
      var queries = Relay.Store.primeCache.mock.calls[0][0];
      var query = queries[Object.keys(queries)[0]];
      var fragment = query.getChildren()[0];
      expect(fragment.getVariables()).toEqual(nextVariables);

      jest.runAllTimers();
      Relay.Store.primeCache.mock.requests[0].succeed();
      // ...but is invisible to the component
      expect(mockInstance.state.variables).toEqual({site: 'www'});
    });
  });

  describe('unmount', () => {
    it('aborts pending requests when unmounted', () => {
      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();

      expect(Relay.Store.primeCache.mock.abort[0]).not.toBeCalled();
      ReactDOM.unmountComponentAtNode(domContainer);
      expect(Relay.Store.primeCache.mock.abort[0]).toBeCalled();
    });

    it('ignores `setState` from callback when request aborts', () => {
      var mockCallback = jest.genMockFunction()
        .mockImplementation(readyState => {
          if (readyState.mounted) {
            this.setState({isAborted: true});
          }
        });
      mockInstance.setVariables({site: 'www'}, mockCallback);
      jest.runAllTimers();

      expect(mockCallback).not.toBeCalled();
      expect(() => {
        ReactDOM.unmountComponentAtNode(domContainer);
        jest.runAllTimers();
      }).not.toThrow();

      expect(mockCallback.mock.calls).toEqual([
        [{...defaultState, aborted: true, mounted: false}],
      ]);
    });
  });

  describe('prop variable updates', () => {
    it('updates variables if props are updated', () => {
      class MockInnerComponent extends React.Component {
        render() {
          return <div />;
        }
      }

      var MockInnerContainer = Relay.createContainer(MockInnerComponent, {
        fragments: {
          entity: () => Relay.QL`fragment on Node{url(site:$site)}`
        },
        initialVariables: {site: undefined}
      });

      class MockWrapperComponent extends React.Component {
        render() {
          return (
            <MockInnerContainer
              ref="inner"
              site={this.props.relay.variables.site}
              entity={this.props.entity}
            />
          );
        }
      }

      MockContainer = Relay.createContainer(MockWrapperComponent, {
        fragments: {
          entity: variables => Relay.QL`  fragment on Node{
            ${MockInnerContainer.getFragment('entity', {site: variables.site})}
          }`
        },
        initialVariables: {site: 'mobile'}
      });

      mockInstance = RelayTestUtils.createRenderer(domContainer).render(
        genMockPointer => <MockContainer entity={genMockPointer('42')} />
      );
      var innerComponent = mockInstance.refs.component.refs.inner;
      expect(innerComponent.state.variables.site).toBe('mobile');
      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();

      Relay.Store.primeCache.mock.requests[0].succeed();
      expect(mockInstance.state.variables.site).toBe('www');

      expect(innerComponent.state.variables.site).toBe('www');
    });

    it('resets variables if outside variable props are updated', () => {
      class MockInnerComponent extends React.Component {
        render() {
          return <div />;
        }
      }

      var MockInnerContainer = Relay.createContainer(MockInnerComponent, {
        fragments: {
          entity: () => Relay.QL`  fragment on Actor {
                        url(site:$site),
                        profilePicture(size:$size) {
                          uri,
                        },
                      }`
        },
        initialVariables: {
          site: undefined,
          size: 48,
        }
      });

      class MockWrapperComponent extends React.Component {
        render() {
          return (
            <MockInnerContainer
              ref="inner"
              site={this.props.relay.variables.site}
              entity={this.props.entity}
            />
          );
        }
      }

      MockContainer = Relay.createContainer(MockWrapperComponent, {
        fragments: {
          entity: variables => Relay.QL`  fragment on Actor {
            ${MockInnerContainer.getFragment('entity', {site: variables.site})}
          }`
        },
        initialVariables: {site: 'mobile'}
      });

      mockInstance = RelayTestUtils.createRenderer(domContainer).render(
        genMockPointer => <MockContainer entity={genMockPointer('42')} />
      );
      var innerComponent = mockInstance.refs.component.refs.inner;
      expect(innerComponent.state.variables.site).toBe('mobile');

      innerComponent.setVariables({size: 32});
      jest.runAllTimers();
      Relay.Store.primeCache.mock.requests[0].succeed();
      expect(innerComponent.state.variables).toEqual({
        site: 'mobile',
        size: 32,
      });

      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();

      Relay.Store.primeCache.mock.requests[1].succeed();
      expect(mockInstance.state.variables).toEqual({
        site: 'www',
      });

      expect(innerComponent.state.variables).toEqual({
        site: 'www',
        size: 48,
      });
    });
  });
});

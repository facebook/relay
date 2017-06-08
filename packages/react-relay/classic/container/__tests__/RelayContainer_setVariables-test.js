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

jest.enableAutomock().useFakeTimers();
jest.mock('warning');

require('configureForRelayOSS');

const GraphQLStoreQueryResolver = require('GraphQLStoreQueryResolver');
const QueryBuilder = require('QueryBuilder');
const React = require('React');
const ReactDOM = require('ReactDOM');
const Relay = require('Relay');
const RelayEnvironment = require('RelayEnvironment');
const RelayMetaRoute = require('RelayMetaRoute');
const RelayQuery = require('RelayQuery');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayContainer.setVariables', function() {
  let MockComponent;
  let MockContainer;

  let defaultState;
  let domContainer;
  let entityQuery;
  let environment;
  let mockInstance;
  let prepareVariables;
  let render;

  const {getNode, getPointer} = RelayTestUtils;

  beforeEach(function() {
    jest.resetModules();

    const fragment = Relay.QL`fragment on Node{url(site:$site)}`;
    entityQuery = jest.fn(() => fragment);
    render = jest.fn(() => <div />);
    prepareVariables = jest.fn((variables, route) => variables);

    // Make RQLTransform ignore this call.
    MockComponent = class extends React.Component {
      render = render;
    };
    const createContainer = Relay.createContainer;
    MockContainer = createContainer(MockComponent, {
      fragments: {
        entity: entityQuery,
      },
      initialVariables: {site: 'mobile'},
      prepareVariables,
    });

    environment = new RelayEnvironment();

    GraphQLStoreQueryResolver.mockDefaultResolveImplementation((_, dataID) => {
      expect(dataID).toBe('42');
      return {
        __dataID__: '42',
        __fragments__: {
          [getNode(fragment).getConcreteFragmentID()]: '42',
        },
        id: '42',
        url: '//url',
        profilePicture: {
          uri: '//url',
        },
      };
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
      genMockPointer => <MockContainer entity={genMockPointer('42')} />,
      environment,
    );

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  describe('plural fragments', () => {
    beforeEach(() => {
      GraphQLStoreQueryResolver.mockDefaultResolveImplementation(pointer => {
        return [
          {
            __dataID__: '42',
            id: '42',
            url: '//url',
            profilePicture: {
              uri: '//url',
            },
          },
        ];
      });
      const pluralEntityQuery = jest.fn(
        () => Relay.QL`
          fragment on Node @relay(plural:true) {
            url(site: $site)
          }
        `,
      );
      MockContainer = Relay.createContainer(MockComponent, {
        fragments: {
          entity: pluralEntityQuery,
        },
        initialVariables: {site: 'mobile'},
      });

      // Return an array
      GraphQLStoreQueryResolver.mockDefaultResolveImplementation((_, ids) => {
        expect(ids).toEqual(['21', '42']);
        return [
          {
            __dataID__: '21',
            id: '21',
            url: '//url',
            profilePicture: {
              uri: '//url',
            },
          },
          {
            __dataID__: '42',
            id: '42',
            url: '//url',
            profilePicture: {
              uri: '//url',
            },
          },
        ];
      });

      const fragment = getNode(
        MockContainer.getFragment('entity').getFragment(),
      );
      const mockPointers = [
        getPointer('21', fragment),
        getPointer('42', fragment),
      ];
      mockInstance = RelayTestUtils.createRenderer(domContainer).render(
        genMockPointer => <MockContainer entity={mockPointers} />,
        environment,
      );
    });

    it('creates multiple queries for plural fragments', () => {
      jest.runAllTimers();

      mockInstance.forceFetch();

      expect(environment.forceFetch).toBeCalled();
      const querySet = environment.forceFetch.mock.calls[0][0];
      expect(Object.keys(querySet)).toEqual(['entity0', 'entity1']);
    });

    it('creates queries only for records with dataIDs', () => {
      const updatedQueryData = [
        {__dataID__: '21', id: '21', url: '//www'},
        {id: '1336', name: 'Fake data', url: '//www'},
      ];
      GraphQLStoreQueryResolver.mockDefaultResolveImplementation(pointer => {
        return updatedQueryData;
      });

      // Change the query data that is stored by the container to
      // `updatedQueryData`
      mockInstance.forceFetch();
      environment.forceFetch.mock.requests[0].succeed();
      mockInstance.forceFetch();
      const querySet = environment.forceFetch.mock.calls[1][0];
      expect(Object.keys(querySet)).toEqual(['entity0']);
    });

    it('resolves data using updated `variables`', () => {
      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();

      const updatedQueryData = [
        {__dataID__: '21', id: '21', url: '//www'},
        {__dataID__: '42', id: '42', url: '//www'},
      ];
      GraphQLStoreQueryResolver.mockDefaultResolveImplementation(fragment => {
        expect(fragment.getVariables()).toEqual({site: 'www'});
        return updatedQueryData;
      });
      environment.primeCache.mock.requests[0].succeed();

      expect(mockInstance.state.queryData.entity).toBe(updatedQueryData);
    });

    it('throws when the queryData is not an array', () => {
      const updatedQueryData = {__dataID__: '21', id: '21', url: '//www'};
      GraphQLStoreQueryResolver.mockDefaultResolveImplementation(pointer => {
        return updatedQueryData;
      });

      // Change the query data that is stored by the container to
      // `updatedQueryData`
      mockInstance.forceFetch();
      environment.forceFetch.mock.requests[0].succeed();
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
        QueryBuilder.createCallVariable('site'),
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
      expect(mockInstance.state.relayProp.variables.site).toBe('mobile');
    });

    it('renders with default pendingVariables', () => {
      expect(mockInstance.state.relayProp.pendingVariables).toBe(null);
    });

    it('lets props override default variables', () => {
      const anotherInstance = RelayTestUtils.createRenderer().render(
        genMockPointer => (
          <MockContainer entity={genMockPointer('42')} site="www" />
        ),
        environment,
      );
      expect(anotherInstance.state.relayProp.variables.site).toBe('www');
    });
  });

  describe('update', () => {
    it('does not update `variables` until data is ready', () => {
      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();

      mockInstance.forceUpdate();

      expect(mockInstance.state.relayProp.variables.site).toBe('mobile');
    });

    it('updates `variables` after callback when data is ready', () => {
      const mockCallback = jest.fn();
      mockInstance.setVariables({site: 'www'}, mockCallback);
      jest.runAllTimers();

      mockCallback.mockImplementation(() => {
        expect(mockInstance.state.relayProp.variables.site).toBe('mobile');
      });
      environment.primeCache.mock.requests[0].succeed();
      expect(mockCallback.mock.calls.length).toBe(1);

      expect(mockInstance.state.relayProp.variables.site).toBe('www');
    });

    it('resolves data using updated `variables`', () => {
      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();

      const updatedQueryData = {__dataID__: '42', id: '42', url: '//www'};
      GraphQLStoreQueryResolver.mockDefaultResolveImplementation(fragment => {
        expect(fragment.getVariables()).toEqual({site: 'www'});
        return updatedQueryData;
      });
      environment.primeCache.mock.requests[0].succeed();

      expect(mockInstance.state.queryData.entity).toBe(updatedQueryData);
    });

    it('sets pendingVariables when request is in-flight', () => {
      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();
      environment.primeCache.mock.requests[0].block();
      expect(mockInstance.state.relayProp.pendingVariables).toEqual({
        site: 'www',
      });
    });

    it('re-sets pendingVariables when request is aborted', () => {
      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();
      environment.primeCache.mock.requests[0].block();
      environment.primeCache.mock.requests[0].abort();
      expect(mockInstance.state.relayProp.pendingVariables).toEqual(null);
    });

    it('re-sets pendingVariables when request succeeded', () => {
      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();
      environment.primeCache.mock.requests[0].block();
      environment.primeCache.mock.requests[0].succeed();
      expect(mockInstance.state.relayProp.pendingVariables).toEqual(null);
    });

    it('updates pendingVariables when new request is sent', () => {
      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();
      environment.primeCache.mock.requests[0].block();

      mockInstance.setVariables({site: 'test'});
      jest.runAllTimers();
      environment.primeCache.mock.requests[1].block();
      expect(mockInstance.state.relayProp.pendingVariables).toEqual({
        site: 'test',
      });
    });

    it('sets prepared version of variables in pendingVariables', () => {
      prepareVariables.mockImplementation((variables, route) => {
        return {
          ...variables,
          site: variables.site.toUpperCase(),
        };
      });
      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();
      environment.primeCache.mock.requests[0].block();
      expect(mockInstance.state.relayProp.pendingVariables).toEqual({
        site: 'WWW',
      });
    });

    it('aborts pending requests before creating a new request', () => {
      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();
      environment.primeCache.mock.requests[0].block();
      expect(environment.primeCache.mock.abort[0]).not.toBeCalled();

      mockInstance.setVariables({site: 'mobile'});
      jest.runAllTimers();
      expect(environment.primeCache.mock.abort[0]).toBeCalled();
    });

    it('invokes callback for a request that aborts a pending request', () => {
      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();

      environment.primeCache.mock.requests[0].block();

      const mockCallback = jest.fn();
      mockInstance.setVariables({site: 'mobile'}, mockCallback);
      jest.runAllTimers();

      environment.primeCache.mock.requests[1].block();
      expect(mockCallback).toBeCalled();
    });

    it('re-requests the last variables', () => {
      mockInstance.setVariables({site: 'mobile'});
      jest.runAllTimers();

      const {mock} = environment.primeCache;
      expect(mock.calls.length).toBe(1);
      expect(Object.keys(mock.calls[0][0]).length).toBe(1);
    });

    it('re-requests currently pending variables', () => {
      const requests = environment.primeCache.mock.requests;
      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();
      requests[0].block();

      expect(environment.primeCache.mock.abort[0]).not.toBeCalled();
      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();
      requests[0].block();
      expect(environment.primeCache.mock.abort[0]).toBeCalled();
      expect(environment.primeCache.mock.calls.length).toBe(2);
    });

    it('re-requests the last variables for `forceFetch`', () => {
      mockInstance.forceFetch({site: 'mobile'});
      jest.runAllTimers();

      const {mock} = environment.forceFetch;
      expect(mock.calls.length).toBe(1);
      expect(Object.keys(mock.calls[0][0]).length).toBe(1);
    });

    it('re-requests the last variables with a pending request', () => {
      const requests = environment.primeCache.mock.requests;
      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();
      requests[0].block();

      const {mock} = environment.primeCache;
      expect(mock.abort[0]).not.toBeCalled();
      mockInstance.setVariables({site: 'mobile'});
      jest.runAllTimers();
      requests[0].block();
      expect(mock.abort[0]).toBeCalled();

      expect(mock.calls.length).toBe(2);
      expect(Object.keys(mock.calls[1][0]).length).toBe(1);
    });

    it('invokes the callback as many times as ready state changes', () => {
      const mockFunction = jest.fn(function() {
        expect(this.constructor).toBe(MockComponent);
      });
      mockInstance.setVariables({site: 'www'}, mockFunction);
      jest.runAllTimers();

      const request = environment.primeCache.mock.requests[0];
      request.block();
      request.succeed();

      expect(mockFunction.mock.calls).toEqual([
        [{...defaultState, done: false, ready: false}],
        [{...defaultState, done: true, ready: true}],
      ]);
    });

    it('invokes the callback with the component as `this`', () => {
      const mockFunction = jest.fn(function() {
        expect(this.constructor).toBe(MockComponent);
      });
      mockInstance.setVariables({site: 'www'}, mockFunction);
      jest.runAllTimers();

      environment.primeCache.mock.requests[0].block();

      expect(mockFunction).toBeCalled();
    });

    it('reconciles only once even if callback calls `setState`', () => {
      const before = render.mock.calls.length;

      mockInstance.setVariables({site: 'www'}, function() {
        this.setState({isLoaded: true});
      });
      jest.runAllTimers();

      environment.primeCache.mock.requests[0].succeed();

      expect(render.mock.calls.length - before).toBe(1);
    });

    it('does not mutate previous `variables`', () => {
      const prevVariables = mockInstance.state.relayProp.variables;
      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();

      environment.primeCache.mock.requests[0].succeed();

      expect(prevVariables).toEqual({site: 'mobile'});
      expect(mockInstance.state.relayProp.variables).not.toBe(prevVariables);
    });

    it('warns when unknown variable is set', () => {
      prepareVariables.mockImplementation(() => {});
      mockInstance.setVariables({unknown: 'www'});
      expect([
        'RelayContainer: Expected query variable `%s` to be initialized in ' +
          '`initialVariables`.',
        'unknown',
      ]).toBeWarnedNTimes(1);
    });
  });

  describe('prepareVariables()', () => {
    let renderer;

    beforeEach(() => {
      entityQuery = jest.fn(
        () => Relay.QL`fragment on Node{profilePicture(size:$size)}`,
      );

      // Make RQLTransform ignore this call.
      MockComponent = class extends React.Component {
        render = render;
      };
      const createContainer = Relay.createContainer;
      MockContainer = createContainer(MockComponent, {
        fragments: {
          entity: entityQuery,
        },
        initialVariables: {
          size: 'thumbnail',
          prepared: false,
        },
        prepareVariables,
      });
      renderer = RelayTestUtils.createRenderer(domContainer);
    });

    it('calls `prepareVariables` on mount', () => {
      prepareVariables.mockImplementation((variables, route) => {
        // prepared variables should never be passed back to `prepareVariables`
        expect(variables.prepared).toBe(false);
        return {
          size: 32, // string -> int
          prepared: true, // false -> true
        };
      });
      let resolvedVariables = null;
      GraphQLStoreQueryResolver.mockDefaultResolveImplementation(resolved => {
        resolvedVariables = resolved.getVariables();
      });
      mockInstance = renderer.render(
        genMockPointer => (
          <MockContainer entity={genMockPointer('42')} size="medium" />
        ),
        environment,
      );
      // prepareVariables output used as props.relay.variables
      expect(mockInstance.state.relayProp.variables).toEqual({
        size: 32,
        prepared: true,
      });
      // ...and used read fragment data
      expect(resolvedVariables).toEqual({
        size: 32,
        prepared: true,
      });
    });

    it('calls `prepareVariables` in componentWillReceiveProps', () => {
      prepareVariables.mockImplementation((variables, route) => {
        // prepared variables should never be passed back to `prepareVariables`
        expect(variables.prepared).toBe(false);
        return {
          size: variables.size === 'medium' ? 32 : 64, // string -> int
          prepared: true, // false -> true
        };
      });
      mockInstance = renderer.render(
        genMockPointer => (
          <MockContainer entity={genMockPointer('42')} size="medium" />
        ),
        environment,
      );
      // update with new size
      let resolvedVariables = null;
      GraphQLStoreQueryResolver.mockDefaultResolveImplementation(resolved => {
        resolvedVariables = resolved.getVariables();
      });
      mockInstance = renderer.render(
        genMockPointer => (
          <MockContainer entity={genMockPointer('42')} size="thumbnail" />
        ),
        environment,
      );
      // prepareVariables output used as props.relay.variables
      expect(mockInstance.state.relayProp.variables).toEqual({
        size: 64,
        prepared: true,
      });
      // ...and used read fragment data
      expect(resolvedVariables).toEqual({
        size: 64,
        prepared: true,
      });
    });

    it('calls `prepareVariables` when `setVariables` is called', () => {
      prepareVariables.mockImplementation((variables, route) => {
        // prepared variables should never be passed back to `prepareVariables`
        expect(variables.prepared).toBe(false);
        return {
          size: 64, // string -> int
          prepared: true, // false -> true
        };
      });
      mockInstance = renderer.render(
        genMockPointer => <MockContainer entity={genMockPointer('42')} />,
        environment,
      );
      mockInstance.setVariables({size: 'medium'});

      const prepareVariablesCalls = prepareVariables.mock.calls;
      const calls = prepareVariablesCalls[prepareVariablesCalls.length - 1];
      expect(calls[0]).toEqual({
        size: 'medium',
        prepared: false,
      });
      expect(calls[1]).toBe(
        RelayMetaRoute.get(mockInstance.context.route.name),
      );

      // `prepareVariables` output is used to prime the cache...
      const queries = environment.primeCache.mock.calls[0][0];
      const query = queries[Object.keys(queries)[0]];
      const fragment = query
        .getChildren()
        .find(child => child instanceof RelayQuery.Fragment);
      expect(fragment.getVariables()).toEqual({
        size: 64,
        prepared: true,
      });

      let resolvedVariables = null;
      GraphQLStoreQueryResolver.mockDefaultResolveImplementation(resolved => {
        resolvedVariables = resolved.getVariables();
      });
      jest.runAllTimers();
      environment.primeCache.mock.requests[0].succeed();
      // ...and is visible to the component
      expect(mockInstance.state.relayProp.variables).toEqual({
        size: 64,
        prepared: true,
      });
      // ...and to read fragment data
      expect(resolvedVariables).toEqual({
        size: 64,
        prepared: true,
      });
    });

    it('warns when `prepareVariables` introduces unknown variables', () => {
      mockInstance = renderer.render(
        genMockPointer => <MockContainer entity={genMockPointer('42')} />,
        environment,
      );
      prepareVariables.mockImplementation((variables, route) => ({unknown: 0}));
      mockInstance.setVariables({size: 2});
      expect([
        'RelayContainer: Expected query variable `%s` to be initialized in ' +
          '`initialVariables`.',
        'unknown',
      ]).toBeWarnedNTimes(1);
    });
  });

  describe('unmount', () => {
    it('aborts pending requests when unmounted', () => {
      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();

      expect(environment.primeCache.mock.abort[0]).not.toBeCalled();
      ReactDOM.unmountComponentAtNode(domContainer);
      expect(environment.primeCache.mock.abort[0]).toBeCalled();
    });

    it('ignores `setState` from callback when request aborts', () => {
      const mockCallback = jest.fn().mockImplementation(readyState => {
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

      const MockInnerContainer = Relay.createContainer(MockInnerComponent, {
        fragments: {
          entity: () => Relay.QL`fragment on Node{url(site:$site)}`,
        },
        initialVariables: {site: undefined},
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
          }`,
        },
        initialVariables: {site: 'mobile'},
      });

      mockInstance = RelayTestUtils.createRenderer(domContainer).render(
        genMockPointer => <MockContainer entity={genMockPointer('42')} />,
        environment,
      );
      const innerComponent = mockInstance.refs.component.refs.inner;
      expect(innerComponent.state.relayProp.variables.site).toBe('mobile');
      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();

      environment.primeCache.mock.requests[0].succeed();
      expect(mockInstance.state.relayProp.variables.site).toBe('www');

      expect(innerComponent.state.relayProp.variables.site).toBe('www');
    });

    it('resets variables if outside variable props are updated', () => {
      class MockInnerComponent extends React.Component {
        render() {
          return <div />;
        }
      }

      const MockInnerContainer = Relay.createContainer(MockInnerComponent, {
        fragments: {
          entity: () => Relay.QL`  fragment on Actor {
                        url(site:$site)
                        profilePicture(size:$size) {
                          uri
                        }
                      }`,
        },
        initialVariables: {
          site: undefined,
          size: 48,
        },
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
          }`,
        },
        initialVariables: {site: 'mobile'},
      });

      mockInstance = RelayTestUtils.createRenderer(domContainer).render(
        genMockPointer => <MockContainer entity={genMockPointer('42')} />,
        environment,
      );
      const innerComponent = mockInstance.refs.component.refs.inner;
      expect(innerComponent.state.relayProp.variables.site).toBe('mobile');

      innerComponent.setVariables({size: 32});
      jest.runAllTimers();
      environment.primeCache.mock.requests[0].succeed();
      expect(innerComponent.state.relayProp.variables).toEqual({
        site: 'mobile',
        size: 32,
      });

      mockInstance.setVariables({site: 'www'});
      jest.runAllTimers();

      environment.primeCache.mock.requests[1].succeed();
      expect(mockInstance.state.relayProp.variables).toEqual({
        site: 'www',
      });

      expect(innerComponent.state.relayProp.variables).toEqual({
        site: 'www',
        size: 48,
      });
    });

    it('does not reset variables if outside props are the same', () => {
      class MockInnerComponent extends React.Component {
        render() {
          return <div />;
        }
      }

      const MockInnerContainer = Relay.createContainer(MockInnerComponent, {
        fragments: {
          entity: () => Relay.QL`fragment on User {
            url(site: $site)
            storySearch(query: $query) {
              id
            }
            profilePicture(size: $size) {
              uri
            }
          }`,
        },
        initialVariables: {
          site: 'mobile',
          query: undefined, // <-- Object type
          size: undefined, // <-- Array type
        },
      });

      class MockWrapperComponent extends React.Component {
        render() {
          return (
            <MockInnerContainer
              ref="inner"
              query={this.props.relay.variables.query}
              size={this.props.relay.variables.size}
              entity={this.props.entity}
            />
          );
        }
      }

      const MockWrapperContainer = Relay.createContainer(MockWrapperComponent, {
        fragments: {
          entity: variables => Relay.QL`fragment on User {
            ${MockInnerContainer.getFragment('entity', {
              query: variables.query,
              size: variables.size,
            })}
          }`,
        },
        initialVariables: {
          query: {text: 'recent'},
          size: [32, 64],
        },
      });

      const mockWrapperInstance = RelayTestUtils.createRenderer(
        domContainer,
      ).render(
        genMockPointer => (
          <MockWrapperContainer entity={genMockPointer('42')} />
        ),
        environment,
      );
      const innerComponent = mockWrapperInstance.refs.component.refs.inner;
      expect(innerComponent.state.relayProp.variables.query).toEqual({
        text: 'recent',
      });
      expect(innerComponent.state.relayProp.variables.size).toEqual([32, 64]);

      innerComponent.setVariables({
        site: 'www',
      });
      jest.runAllTimers();
      environment.primeCache.mock.requests[0].succeed();
      expect(innerComponent.state.relayProp.variables).toEqual({
        site: 'www',
        query: {text: 'recent'},
        size: [32, 64],
      });

      mockWrapperInstance.setVariables({
        query: {text: 'recent'},
        size: [32, 64],
      });
      jest.runAllTimers();

      environment.primeCache.mock.requests[1].succeed();
      expect(mockWrapperInstance.state.relayProp.variables).toEqual({
        query: {text: 'recent'},
        size: [32, 64],
      });

      expect(innerComponent.state.relayProp.variables).toEqual({
        site: 'www',
        query: {text: 'recent'},
        size: [32, 64],
      });
    });
  });
});

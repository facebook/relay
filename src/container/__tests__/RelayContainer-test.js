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

jest
  .unmock('RelayContainerComparators')
  .mock('warning');

const GraphQLStoreQueryResolver = require('GraphQLStoreQueryResolver');
const GraphQLStoreTestUtils = require('GraphQLStoreTestUtils');
const QueryBuilder = require('QueryBuilder');
const React = require('React');
const ReactTestUtils = require('ReactTestUtils');
const Relay = require('Relay');
const RelayEnvironment = require('RelayEnvironment');
const RelayMutation = require('RelayMutation');
const RelayQuery = require('RelayQuery');
const RelayRoute = require('RelayRoute');
const RelayTestUtils = require('RelayTestUtils');

const warning = require('warning');

describe('RelayContainer', function() {
  let MockContainer;
  let MockComponent;
  let RelayTestRenderer;

  let environment;
  let mockBarPointer;
  let mockFooFragment;
  let mockFooPointer;
  let mockRoute;
  let render;

  const {getNode, getPointer} = RelayTestUtils;

  beforeEach(function() {
    jest.resetModuleRegistry();

    render = jest.fn(function() {
      // Make it easier to expect prop values.
      render.mock.calls[render.mock.calls.length - 1].props = this.props;
      return <div />;
    });
    MockComponent = React.createClass({render});
    MockContainer = Relay.createContainer(MockComponent, {
      fragments: {
        foo: jest.fn(
          () => Relay.QL`fragment on Node{id,name}`
        ),
        bar: jest.fn(
          () => Relay.QL`fragment on Node @relay(plural:true){id,name}`
        ),
      },
    });
    MockContainer.mock = {render};

    environment = new RelayEnvironment();
    mockRoute = RelayRoute.genMockInstance();
    mockFooFragment = getNode(MockContainer.getFragment('foo').getFragment({}));
    mockFooPointer = getPointer('42', mockFooFragment);
    const mockBarFragment =
      getNode(MockContainer.getFragment('bar').getFragment());
    mockBarPointer = getPointer('42', mockBarFragment);

    RelayTestRenderer = RelayTestUtils.createRenderer();

    // TODO: #6524377 - migrate to RelayTestUtils matchers
    jasmine.addMatchers(GraphQLStoreTestUtils.matchers);
    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  describe('fragments', () => {
    it('throws if fragments are missing from spec', () => {
      expect(() => {
        Relay.createContainer(MockComponent, {});
      }).toFailInvariant(
        'Relay.createContainer(MockComponent, ...): Missing `fragments`, ' +
        'which is expected to be an object mapping from `propName` to: ' +
        '() => Relay.QL`...`'
      );
    });

    it('throws if container defines invalid `Relay.QL` fragment', () => {
      const BadContainer = Relay.createContainer(MockComponent, {
        fragments: {
          viewer: () => Relay.QL`query{node(id:"123"){id}}`,
        },
      });
      const badFragmentReference = BadContainer.getFragment('viewer');
      expect(() => {
        badFragmentReference.getFragment();
      }).toFailInvariant(
        'Relay.QL defined on container `Relay(MockComponent)` named `viewer` ' +
        'is not a valid fragment. A typical fragment is defined using: ' +
        'Relay.QL`fragment on Type {...}`'
      );
    });

    it('throws if container defines a fragment without function', () => {
      const BadContainer = Relay.createContainer(MockComponent, {
        fragments: {
          viewer: Relay.QL`
            fragment on Viewer {
              newsFeed
            }
          `,
        },
      });
      expect(() => {
        BadContainer.getFragment('viewer');
      }).toFailInvariant(
        'RelayContainer: Expected `Relay(MockComponent).fragments.viewer` to ' +
        'be a function returning a fragment. Example: ' +
        '`viewer: () => Relay.QL`fragment on ...`'
      );
    });

    it('throws if fragment and variable names are not unique', () => {
      Relay.createContainer(MockComponent, {
        initialVariables: {
          badName: '100',
        },
        fragments: {
          badName: () => Relay.QL`
            fragment on Actor {
              profilePicture(size:$badName) {
                uri
              }
            }
          `,
        },
      });
      expect([
        'Relay.createContainer(%s, ...): `%s` is used both ' +
        'as a fragment name and variable name. Please give them unique names.',
        'MockComponent',
        'badName',
      ]).toBeWarnedNTimes(1);
    });

    it('creates query for a container without fragments', () => {
      // Test that scalar constants are substituted, not only query fragments.
      const MockProfilePhoto = Relay.createContainer(MockComponent, {
        initialVariables: {
          testPhotoSize: '100',
        },
        fragments: {
          photo: () => Relay.QL`
            fragment on Actor {
              profilePicture(size:$testPhotoSize) {
                uri
              }
            }
          `,
        },
      });
      const fragment = getNode(
        MockProfilePhoto.getFragment('photo'),
        {}
      );
      expect(fragment).toEqualQueryNode(getNode(Relay.QL`
        fragment on Actor {
          profilePicture(size: "100") {
            uri
          }
        }
      `));
    });

    it('creates query for a container with fragments', () => {
      const anotherComponent = React.createClass({render: () => null});
      const MockProfile = Relay.createContainer(MockComponent, {
        fragments: {
          user: () => Relay.QL`
            fragment on Actor {
              id
              name
              ${MockProfileLink.getFragment('user')}
            }
          `,
        },
      });
      const MockProfileLink = Relay.createContainer(anotherComponent, {
        fragments: {
          user: () => Relay.QL`
            fragment on Actor {
              id
              url
            }
          `,
        },
      });
      const fragment = getNode(
        MockProfile.getFragment('user'),
        {}
      );
      expect(fragment).toEqualQueryNode(getNode(Relay.QL`
        fragment on Actor {
          id
          __typename
          name
          ${Relay.QL`
            fragment on Actor {
              id,
              __typename,
              url,
            }
          `},
        }
      `));
    });

    it('returns whether a named fragment is defined', () => {
      expect(MockContainer.hasFragment('foo')).toBe(true);
      expect(MockContainer.hasFragment('bar')).toBe(true);
      expect(MockContainer.hasFragment('baz')).toBe(false);
    });
  });

  describe('conditional fragments', () => {
    let MockProfile;
    let profileFragment;

    beforeEach(() => {
      MockProfile = Relay.createContainer(MockComponent, {
        fragments: {
          viewer: () => Relay.QL`
            fragment on Viewer {
              primaryEmail
            }
          `,
        },
      });
      profileFragment = QueryBuilder.createFragment({
        name: 'Test',
        type: 'Viewer',
        children: [QueryBuilder.createField({fieldName: 'primaryEmail'})],
      });
    });

    it('can conditionally include a fragment based on variables', () => {
      const MockSideshow = Relay.createContainer(MockComponent, {
        initialVariables: {
          hasSideshow: null,
        },
        fragments: {
          viewer: variables => Relay.QL`
            fragment on Viewer {
              ${MockProfile.getFragment('viewer').if(variables.hasSideshow)}
            }
          `,
        },
      });

      // hasSideshow: true
      let fragment = getNode(
        MockSideshow.getFragment('viewer', {
          hasSideshow: QueryBuilder.createCallVariable('sideshow'),
        }),
        {sideshow: true}
      );
      const expected = RelayQuery.Fragment.build(
        'Test',
        'Viewer',
        [getNode(profileFragment)]
      );
      expect(fragment).toEqualQueryNode(expected);

      // hasSideshow: false
      fragment = getNode(
        MockSideshow.getFragment('viewer', {
          hasSideshow: QueryBuilder.createCallVariable('sideshow'),
        }),
        {sideshow: false}
      );
      expect(fragment.getChildren().length).toBe(0);
    });

    it('can conditionally exclude a fragment based on variables', () => {
      const MockSideshow = Relay.createContainer(MockComponent, {
        initialVariables: {
          hasSideshow: null,
        },
        fragments: {
          viewer: variables => Relay.QL`
            fragment on Viewer {
              ${MockProfile
                .getFragment('viewer')
                .unless(variables.hasSideshow)}
            }
          `,
        },
      });

      // hasSideshow: true
      let fragment = getNode(
        MockSideshow.getFragment('viewer', {hasSideshow: true}),
        {}
      );
      expect(fragment.getChildren().length).toBe(0);

      // hasSideshow: false
      fragment = getNode(
        MockSideshow.getFragment('viewer', {hasSideshow: false}),
        {}
      );
      const expected = RelayQuery.Fragment.build(
        'Test',
        'Viewer',
        [getNode(profileFragment)],
      );
      expect(fragment).toEqualQueryNode(expected);
    });
  });

  it('throws if rendered without a relay context', () => {
    const ShallowRenderer = ReactTestUtils.createRenderer();
    expect(() => ShallowRenderer.render(
      <MockContainer foo={mockFooPointer} />
    )).toFailInvariant(
      'RelayContainer: `Relay(MockComponent)` was rendered with invalid ' +
      'Relay context `undefined`. Make sure the `relay` property on the ' +
      'React context conforms to the `RelayEnvironment` interface.'
    );
  });

  it('throws if rendered with an invalid relay context', () => {
    const fakeContext = {
      getStoreData: null,
      getFragmentResolver: null,
    };
    const ShallowRenderer = ReactTestUtils.createRenderer();
    expect(() => ShallowRenderer.render(
      <MockContainer foo={mockFooPointer} />,
      {relay: fakeContext}
    )).toFailInvariant(
      'RelayContainer: `Relay(MockComponent)` was rendered with invalid ' +
      'Relay context `[object Object]`. Make sure the `relay` property on ' +
      'the React context conforms to the `RelayEnvironment` interface.'
    );
  });

  it('throws if rendered without a route', () => {
    const ShallowRenderer = ReactTestUtils.createRenderer();
    expect(() => ShallowRenderer.render(
      <MockContainer foo={mockFooPointer} />,
      {relay: environment}
    )).toFailInvariant(
      'RelayContainer: `Relay(MockComponent)` was rendered without a valid ' +
      'route. Make sure the route is valid, and make sure that it is ' +
      'correctly set on the parent component\'s context ' +
      '(e.g. using <RelayRootContainer>).'
    );
  });

  describe('props.relay.variables', () => {
    it('starts with initial variables', () => {
      MockContainer = Relay.createContainer(MockComponent, {
        initialVariables: {
          public: 'instance',
          private: 'instance',
        },
        fragments: {
          foo: jest.fn(
            () => Relay.QL`fragment on Node{id,name}`
          ),
        },
      });
      MockContainer.mock = {render};
      RelayTestRenderer.render(
        () => <MockContainer foo={mockFooPointer} />,
        environment,
        mockRoute
      );
      const props = MockContainer.mock.render.mock.calls[0].props;
      expect(props.relay.variables).toEqual({
        public: 'instance',
        private: 'instance',
      });
    });

    it('starts with initial + parent variables', () => {
      MockContainer = Relay.createContainer(MockComponent, {
        initialVariables: {
          public: 'instance',
          private: 'instance',
        },
        fragments: {
          foo: jest.fn(
            () => Relay.QL`fragment on Node{id,name}`
          ),
        },
      });
      MockContainer.mock = {render};
      RelayTestRenderer.render(
        () => <MockContainer foo={mockFooPointer} public="parent" />,
        environment,
        mockRoute
      );
      const props = MockContainer.mock.render.mock.calls[0].props;
      expect(props.relay.variables).toEqual({
        public: 'parent',
        private: 'instance',
      });
    });

    it('starts with prepared initial variables', () => {
      const prepareVariables = jest.fn((vars, route) => {
        expect(route.name).toBe(mockRoute.name);
        return {
          ...vars,
          private: 'prepared',
        };
      });
      MockContainer = Relay.createContainer(MockComponent, {
        initialVariables: {
          public: 'instance',
          private: 'instance',
        },
        prepareVariables,
        fragments: {
          foo: jest.fn(
            () => Relay.QL`fragment on Node{id,name}`
          ),
        },
      });
      MockContainer.mock = {render};
      RelayTestRenderer.render(
        () => <MockContainer foo={mockFooPointer} />,
        environment,
        mockRoute
      );
      const props = MockContainer.mock.render.mock.calls[0].props;
      expect(props.relay.variables).toEqual({
        public: 'instance',
        private: 'prepared',
      });
    });

    it('starts with prepared initial + parent variables', () => {
      const prepareVariables = jest.fn((vars, route) => {
        expect(route.name).toBe(mockRoute.name);
        return {
          ...vars,
          private: 'prepared',
        };
      });
      MockContainer = Relay.createContainer(MockComponent, {
        initialVariables: {
          public: 'instance',
          private: 'instance',
        },
        prepareVariables,
        fragments: {
          foo: jest.fn(
            () => Relay.QL`fragment on Node{id,name}`
          ),
        },
      });
      MockContainer.mock = {render};
      RelayTestRenderer.render(
        () => <MockContainer foo={mockFooPointer} public="parent" />,
        environment,
        mockRoute
      );
      const props = MockContainer.mock.render.mock.calls[0].props;
      expect(props.relay.variables).toEqual({
        public: 'parent',
        private: 'prepared',
      });
    });

    it('updates with prepared initial + parent variables', () => {
      const prepareVariables = jest.fn((vars, route) => {
        expect(route.name).toBe(mockRoute.name);
        return {
          ...vars,
          private: 'prepared1',
        };
      });
      MockContainer = Relay.createContainer(MockComponent, {
        initialVariables: {
          public: 'instance',
          private: 'instance',
        },
        prepareVariables,
        fragments: {
          foo: jest.fn(
            () => Relay.QL`fragment on Node{id,name}`
          ),
        },
      });
      MockContainer.mock = {render};
      RelayTestRenderer.render(
        () => <MockContainer foo={mockFooPointer} public="parent1" />,
        environment,
        mockRoute
      );
      const props = MockContainer.mock.render.mock.calls[0].props;
      expect(props.relay.variables).toEqual({
        public: 'parent1',
        private: 'prepared1',
      });

      prepareVariables.mockImplementation(vars => ({
        ...vars,
        private: 'prepared2',
      }));
      RelayTestRenderer.render(
        () => <MockContainer foo={mockFooPointer} public="parent2" />,
        environment,
        mockRoute
      );
      const nextProps = MockContainer.mock.render.mock.calls[1].props;
      expect(nextProps.relay.variables).toEqual({
        public: 'parent2',
        private: 'prepared2',
      });
    });
  });

  describe('props.relay.applyUpdate', () => {
    it('forwards to the underlying RelayEnvironment', () => {
      const mockMutation = new RelayMutation();
      environment.applyUpdate = jest.fn();
      render.mockImplementation(function() {
        this.props.relay.applyUpdate(mockMutation);
      });
      RelayTestRenderer.render(
        () => <MockContainer />,
        environment,
        mockRoute
      );
      expect(environment.applyUpdate.mock.calls[0][0]).toBe(mockMutation);
    });
  });

  describe('props.relay.commitUpdate', () => {
    it('forwards to the underlying RelayEnvironment', () => {
      const mockMutation = new RelayMutation();
      environment.commitUpdate = jest.fn();
      render.mockImplementation(function() {
        this.props.relay.commitUpdate(mockMutation);
      });
      RelayTestRenderer.render(
        () => <MockContainer />,
        environment,
        mockRoute
      );
      expect(environment.commitUpdate.mock.calls[0][0]).toBe(mockMutation);
    });
  });

  it('creates resolvers for each query prop with a fragment pointer', () => {
    RelayTestRenderer.render(
      () => <MockContainer foo={mockFooPointer} />,
      environment,
      mockRoute
    );
    expect(environment.getFragmentResolver.mock.calls.length).toBe(1);
    expect(GraphQLStoreQueryResolver.mock.instances.length).toBe(1);

    RelayTestRenderer.render(
      () => <MockContainer foo={mockFooPointer} bar={[mockBarPointer]} />,
      environment,
      mockRoute
    );
    // `foo` resolver is re-used, `bar` is added
    expect(environment.getFragmentResolver.mock.calls.length).toBe(2);
    expect(GraphQLStoreQueryResolver.mock.instances.length).toBe(2);
  });

  it('recreates resolvers when relay context changes', () => {
    const environmentA = new RelayEnvironment();
    const environmentB = new RelayEnvironment();

    RelayTestRenderer.render(
      () => <MockContainer foo={mockFooPointer} />,
      environmentA,
      mockRoute
    );

    expect(environmentA.getFragmentResolver.mock.calls.length).toBe(1);
    const mockResolvers = GraphQLStoreQueryResolver.mock.instances;
    expect(mockResolvers.length).toBe(1);
    expect(mockResolvers[0].dispose).not.toBeCalled();
    environmentA.getFragmentResolver.mockClear();

    RelayTestRenderer.render(
      () => <MockContainer foo={mockFooPointer} />,
      environmentB,
      mockRoute
    );

    expect(environmentA.getFragmentResolver.mock.calls.length).toBe(0);
    expect(environmentB.getFragmentResolver.mock.calls.length).toBe(1);
    expect(mockResolvers.length).toBe(2);
    expect(mockResolvers[1].mock.store).toBe(environmentB.getStoreData());
    expect(mockResolvers[0].dispose).toBeCalled();
    expect(mockResolvers[1].dispose).not.toBeCalled();
  });

  it('reuses resolvers even if route changes', () => {
    const MockRouteA = RelayRoute.genMock();
    const MockRouteB = RelayRoute.genMock();

    const mockRouteA = new MockRouteA();
    const mockRouteB = new MockRouteB();

    RelayTestRenderer.render(
      () => <MockContainer foo={mockFooPointer} />,
      environment,
      mockRouteA
    );
    RelayTestRenderer.render(
      () => <MockContainer foo={mockFooPointer} />,
      environment,
      mockRouteB
    );

    expect(environment.getFragmentResolver.mock.calls.length).toBe(1);
    expect(GraphQLStoreQueryResolver.mock.instances.length).toBe(1);
    expect(GraphQLStoreQueryResolver.mock.instances[0].dispose).not.toBeCalled();
  });

  it('resolves each prop with a query', () => {
    RelayTestRenderer.render(
      () => <MockContainer foo={mockFooPointer} />,
      environment,
      mockRoute
    );
    const fragment = getNode(MockContainer.getFragment('foo'));

    expect(environment.getFragmentResolver.mock.calls.length).toBe(1);
    const mockResolvers = GraphQLStoreQueryResolver.mock.instances;
    expect(mockResolvers.length).toBe(1);
    expect(mockResolvers[0].resolve.mock.calls[0][0])
      .toEqualQueryNode(fragment);
    expect(mockResolvers[0].resolve.mock.calls[0][1])
      .toEqual(mockFooPointer.__dataID__);
  });

  it('re-resolves props when notified of changes', () => {
    const mockData = {__dataID__: '42', id: '42', name: 'Tim'};

    GraphQLStoreQueryResolver.mockDefaultResolveImplementation(() => mockData);

    RelayTestRenderer.render(
      () => <MockContainer foo={mockFooPointer} />,
      environment,
      mockRoute
    );

    expect(environment.getFragmentResolver.mock.calls.length).toBe(1);
    const mockResolvers = GraphQLStoreQueryResolver.mock.instances;
    mockResolvers[0].mock.callback();

    expect(mockResolvers.length).toBe(1);
    expect(mockResolvers[0].dispose.mock.calls.length).toBe(0);
    expect(mockResolvers[0].resolve.mock.calls.length).toBe(2);
  });

  it('re-resolves props when relay context changes', () => {
    const environmentA = new RelayEnvironment();
    const environmentB = new RelayEnvironment();

    RelayTestRenderer.render(
      () => <MockContainer foo={mockFooPointer} />,
      environmentA,
      mockRoute
    );
    RelayTestRenderer.render(
      () => <MockContainer foo={mockFooPointer} />,
      environmentB,
      mockRoute
    );

    const mockResolvers = GraphQLStoreQueryResolver.mock.instances;
    expect(mockResolvers.length).toBe(2);
    expect(mockResolvers[0].resolve.mock.calls.length).toBe(1);
    expect(mockResolvers[1].resolve.mock.calls.length).toBe(1);
  });

  it('re-resolves props when route changes', () => {
    const MockRouteA = RelayRoute.genMock();
    const MockRouteB = RelayRoute.genMock();

    const mockRouteA = new MockRouteA();
    const mockRouteB = new MockRouteB();

    RelayTestRenderer.render(
      () => <MockContainer foo={mockFooPointer} />,
      environment,
      mockRouteA
    );

    expect(environment.getFragmentResolver.mock.calls.length).toBe(1);
    const mockResolvers = GraphQLStoreQueryResolver.mock.instances;
    expect(mockResolvers.length).toBe(1);
    expect(mockResolvers[0].resolve.mock.calls.length).toBe(1);

    RelayTestRenderer.render(
      () => <MockContainer foo={mockFooPointer} />,
      environment,
      mockRouteB
    );

    expect(mockResolvers.length).toBe(1);
    expect(mockResolvers[0].resolve.mock.calls.length).toBe(2);
  });

  it('updates relay.route when route changes', () => {
    const MockRouteA = RelayRoute.genMock();
    const MockRouteB = RelayRoute.genMock();

    const mockRouteA = new MockRouteA();
    const mockRouteB = new MockRouteB();

    RelayTestRenderer.render(
      () => <MockContainer foo={mockFooPointer} />,
      environment,
      mockRouteA
    );

    RelayTestRenderer.render(
      () => <MockContainer foo={mockFooPointer} />,
      environment,
      mockRouteB
    );

    const routeAProps = MockContainer.mock.render.mock.calls[0].props;
    const routeBProps = MockContainer.mock.render.mock.calls[1].props;
    expect(routeAProps.relay.route).toBe(mockRouteA);
    expect(routeBProps.relay.route).toBe(mockRouteB);
  });

  it('resolves with most recent props', () => {
    const fooFragment = getNode(MockContainer.getFragment('foo'));
    const mockPointerA = getPointer('42', mockFooFragment);
    const mockPointerB = getPointer('43', mockFooFragment);

    RelayTestRenderer.render(
      () => <MockContainer foo={mockPointerA} />,
      environment,
      mockRoute
    );
    RelayTestRenderer.render(
      () => <MockContainer foo={mockPointerB} />,
      environment,
      mockRoute
    );

    const mockResolvers = GraphQLStoreQueryResolver.mock.instances;

    expect(mockResolvers.length).toBe(1);
    expect(mockResolvers[0].dispose.mock.calls.length).toBe(0);
    expect(mockResolvers[0].resolve.mock.calls.length).toBe(2);
    expect(mockResolvers[0].resolve.mock.calls[0][0])
      .toEqualQueryNode(fooFragment);
    expect(mockResolvers[0].resolve.mock.calls[0][1])
      .toEqual(mockPointerA.__dataID__);
    expect(mockResolvers[0].resolve.mock.calls[1][0])
      .toEqualQueryNode(fooFragment);
    expect(mockResolvers[0].resolve.mock.calls[1][1])
      .toEqual(mockPointerB.__dataID__);
  });

  it('does not create resolvers for null/undefined props', () => {
    RelayTestRenderer.render(
      () => <MockContainer foo={null} bar={undefined} />,
      environment,
      mockRoute
    );

    expect(environment.getFragmentResolver.mock.calls.length).toBe(0);
    const mockResolvers = GraphQLStoreQueryResolver.mock.instances;
    expect(mockResolvers.length).toBe(0);
    const props = MockContainer.mock.render.mock.calls[0].props;
    expect(props.bar).toBe(undefined);
    expect(props.foo).toBe(null);
  });

  it('warns if props are missing fragment pointers', () => {
    const mockData = {};
    RelayTestRenderer.render(
      () => <MockContainer foo={mockData} bar={null} />,
      environment,
      mockRoute
    );

    const mockResolvers = GraphQLStoreQueryResolver.mock.instances;
    expect(mockResolvers.length).toBe(0);
    const props = MockContainer.mock.render.mock.calls[0].props;
    expect(props.bar).toBe(null);
    expect(props.foo).toBe(mockData);

    expect(warning.mock.calls.filter(call =>
      call[0] === false && call[1].indexOf(
        'RelayContainer: component `%s` was rendered with variables ' +
        'that differ from the variables used to fetch fragment ' +
        '`%s`.'
      ) === 0
    ).length).toBe(1);
  });

  it('warns if fragment pointer exists on a different prop', () => {
    mockFooPointer = getPointer('42', mockFooFragment);

    RelayTestRenderer.render(
      () => <MockContainer baz={mockFooPointer} />,
      environment,
      mockRoute
    );

    expect([
      'RelayContainer: Expected record data for prop `%s` on `%s`, ' +
      'but it was instead on prop `%s`. Did you misspell a prop or ' +
      'pass record data into the wrong prop?',
      'foo',
      'MockComponent',
      'baz',
    ]).toBeWarnedNTimes(1);
  });

  it('does not warn if fragment hash exists on a different prop', () => {
    const deceptiveArray = [];
    deceptiveArray[Object.keys(mockFooPointer)[0]] = {};

    RelayTestRenderer.render(
      () => <MockContainer baz={deceptiveArray} />,
      environment,
      mockRoute
    );

    expect([
      'RelayContainer: Expected record data for prop `%s` on `%s`, ' +
      'but it was instead on prop `%s`. Did you misspell a prop or ' +
      'pass record data into the wrong prop?',
      'foo',
      'MockComponent',
      'baz',
    ]).toBeWarnedNTimes(0);
  });

  it('warns if a fragment is not passed in', () => {
    RelayTestRenderer.render(
      () => <MockContainer foo={null} />,
      environment,
      mockRoute
    );

    const mockResolvers = GraphQLStoreQueryResolver.mock.instances;
    expect(mockResolvers.length).toBe(0);
    const props = MockContainer.mock.render.mock.calls[0].props;
    expect(props.bar).toBe(undefined);
    expect(props.foo).toBe(null);

    expect([
      'RelayContainer: Expected prop `%s` to be supplied to `%s`, but ' +
      'got `undefined`. Pass an explicit `null` if this is intentional.',
      'bar',
      'MockComponent',
    ]).toBeWarnedNTimes(1);
  });

  it('warns if a fragment prop is not an object', () => {
    RelayTestRenderer.render(
      () => <MockContainer foo={''} />,
      environment,
      mockRoute
    );

    const mockResolvers = GraphQLStoreQueryResolver.mock.instances;
    expect(mockResolvers.length).toBe(0);
    const props = MockContainer.mock.render.mock.calls[0].props;
    expect(props.bar).toBe(undefined);
    expect(props.foo).toBe('');

    expect([
      'RelayContainer: Expected prop `%s` supplied to `%s` to be an ' +
      'object, got `%s`.',
      'foo',
      'MockComponent',
      '',
    ]).toBeWarnedNTimes(1);
  });

  it('throws if non-plural fragment receives an array', () => {
    const mockData = [];
    expect(() => {
      RelayTestRenderer.render(
        () => <MockContainer foo={mockData} />,
        environment,
        mockRoute
      );
    }).toFailInvariant(
      'RelayContainer: Invalid prop `foo` supplied to `MockComponent`, ' +
      'expected a single record because the corresponding fragment is not ' +
      'plural (i.e. does not have `@relay(plural: true)`).'
    );
  });

  it('throws if plural fragment receives a non-array', () => {
    const mockData = {};
    expect(() => {
      RelayTestRenderer.render(
        () => <MockContainer bar={mockData} />,
        environment,
        mockRoute
      );
    }).toFailInvariant(
      'RelayContainer: Invalid prop `bar` supplied to `MockComponent`, ' +
      'expected an array of records because the corresponding fragment has ' +
      '`@relay(plural: true)`.'
    );
  });

  it('warns if plural fragment array item is missing fragment pointers', () => {
    const mockData = [{}];
    RelayTestRenderer.render(
      () => <MockContainer bar={mockData} />,
      environment,
      mockRoute
    );

    expect(warning.mock.calls.filter(call =>
      call[0] === false && call[1].indexOf(
        'RelayContainer: component `%s` was rendered with variables ' +
        'that differ from the variables used to fetch fragment ' +
        '`%s`.'
      ) === 0
    ).length).toBe(1);
  });

  it('throws if some plural fragment items are null', () => {
    const mockData = [mockBarPointer, null];
    expect(() => {
      RelayTestRenderer.render(
        () => <MockContainer bar={mockData} />,
        environment,
        mockRoute
      );
    }).toFailInvariant(
      'RelayContainer: Invalid prop `bar` supplied to `MockComponent`. Some ' +
      'array items contain data fetched by Relay and some items contain ' +
      'null/mock data.'
    );
  });

  it('throws if some but not all plural fragment items are mocked', () => {
    const mockData = [mockBarPointer, {}];
    expect(() => {
      RelayTestRenderer.render(
        () => <MockContainer bar={mockData} />,
        environment,
        mockRoute
      );
    }).toFailInvariant(
      'RelayContainer: Invalid prop `bar` supplied to `MockComponent`. Some ' +
      'array items contain data fetched by Relay and some items contain ' +
      'null/mock data.'
    );
  });

  it('passes through empty arrays for plural fragments', () => {
    RelayTestRenderer.render(
      () => <MockContainer bar={[]} />,
      environment,
      mockRoute
    );
    expect(MockContainer.mock.render.mock.calls.length).toBe(1);
    expect(MockContainer.mock.render.mock.calls[0].props.bar).toEqual([]);
    expect(environment.getFragmentResolver).not.toBeCalled();
  });

  it('does not re-render if props resolve to the same object', () => {
    const mockData = {__dataID__: '42', id: '42', name: 'Tim'};

    GraphQLStoreQueryResolver.mockDefaultResolveImplementation(() => mockData);

    RelayTestRenderer.render(
      () => <MockContainer foo={mockFooPointer} />,
      environment,
      mockRoute
    );

    expect(MockContainer.mock.render.mock.calls.length).toBe(1);
    expect(MockContainer.mock.render.mock.calls[0].props.foo).toEqual(mockData);

    GraphQLStoreQueryResolver.mock.instances[0].mock.callback();

    expect(MockContainer.mock.render.mock.calls.length).toBe(1);
  });

  it('re-renders if props resolve to different objects', () => {
    const mockDataList = [
      {__dataID__: '42', id: '42', name: 'Tim', ...mockFooPointer},
      {__dataID__: '42', id: '42', name: 'Tee', ...mockFooPointer},
    ];

    GraphQLStoreQueryResolver.mockResolveImplementation(0, function() {
      return mockDataList[this.resolve.mock.calls.length - 1];
    });

    RelayTestRenderer.render(
      () => <MockContainer foo={mockFooPointer} />,
      environment,
      mockRoute
    );

    expect(MockContainer.mock.render.mock.calls.length).toBe(1);
    expect(MockContainer.mock.render.mock.calls[0].props.foo).toEqual(
      mockDataList[0]
    );

    GraphQLStoreQueryResolver.mock.instances[0].mock.callback();

    expect(MockContainer.mock.render.mock.calls.length).toBe(2);
    expect(MockContainer.mock.render.mock.calls[1].props.foo).toEqual(
      mockDataList[1]
    );
  });

  it('renders with identical props if no data has changed', () => {
    // Non-scalars deoptimize `RelayContainer.shouldComponentUpdate`.
    const nonScalar = {};

    RelayTestRenderer.render(
      () => <MockContainer foo={mockFooPointer} deopt={nonScalar} />,
      environment,
      mockRoute
    );
    RelayTestRenderer.render(
      () => <MockContainer foo={mockFooPointer} deopt={nonScalar} />,
      environment,
      mockRoute
    );
    expect(MockContainer.mock.render.mock.calls.length).toBe(2);

    const propsA = MockContainer.mock.render.mock.calls[0].props;
    const propsB = MockContainer.mock.render.mock.calls[1].props;

    const propNamesA = Object.keys(propsA);
    const propNamesB = Object.keys(propsB);

    // Fix for V8 bug where insertion order isn't preserved (see #10804655)
    expect(propNamesA.sort()).toEqual(propNamesB.sort());

    propNamesA.forEach(propName => {
      expect(propsA[propName]).toBe(propsB[propName]);
    });
  });

  it('applies `shouldComponentUpdate` properly', () => {
    const mockDataSet = {
      '42': {__dataID__: '42', name: 'Tim'},
      '43': {__dataID__: '43', name: 'Tee'},
      '44': {__dataID__: '44', name: 'Toe'},
    };
    render = jest.fn(() => <div />);
    const shouldComponentUpdate = jest.fn();

    const MockFastComponent = React.createClass({render, shouldComponentUpdate});

    const MockFastContainer = Relay.createContainer(MockFastComponent, {
      fragments: {
        foo: jest.fn(
          () => Relay.QL`fragment on Node{id,name}`
        ),
      },
    });

    GraphQLStoreQueryResolver.mockResolveImplementation(0, (_, dataID) => {
      return mockDataSet[dataID];
    });
    mockFooFragment =
      getNode(MockFastContainer.getFragment('foo').getFragment({}));
    const mockPointerA = getPointer('42', mockFooFragment);
    const mockPointerB = getPointer('43', mockFooFragment);
    const mockPointerC = getPointer('44', mockFooFragment);

    RelayTestRenderer.render(
      () => <MockFastContainer foo={mockPointerA} />,
      environment,
      mockRoute
    );
    expect(render.mock.calls.length).toBe(1);

    shouldComponentUpdate.mockReturnValue(true);

    // Component wants to update, RelayContainer doesn't.
    RelayTestRenderer.render(
      () => <MockFastContainer foo={mockPointerA} />,
      environment,
      mockRoute
    );
    expect(render.mock.calls.length).toBe(1);

    // Component wants to update, RelayContainer does too.
    RelayTestRenderer.render(
      () => <MockFastContainer foo={mockPointerB} />,
      environment,
      mockRoute
    );
    expect(render.mock.calls.length).toBe(2);

    shouldComponentUpdate.mockReturnValue(false);

    // Component doesn't want to update, RelayContainer does.
    RelayTestRenderer.render(
      () => <MockFastContainer foo={mockPointerC} />,
      environment,
      mockRoute
    );
    expect(render.mock.calls.length).toBe(2);

    // Component doesn't want to update, RelayContainer doesn't either.
    RelayTestRenderer.render(
      () => <MockFastContainer foo={mockPointerC} />,
      environment,
      mockRoute
    );
    expect(render.mock.calls.length).toBe(2);

    shouldComponentUpdate.mockReturnValue(true);
    RelayTestRenderer.render(
      () => <MockFastContainer foo={mockPointerC} thing="scalar" />,
      environment,
      mockRoute
    );
    expect(render.mock.calls.length).toBe(3);
  });

  it('applies `shouldComponentUpdate` properly', () => {
    const mockDataSet = {
      '42': {__dataID__: '42', name: 'Tim'},
    };
    render = jest.genMockFunction().mockImplementation(() => <div />);
    const shouldComponentUpdate = jest.fn(() => true);

    const MockAlwaysUpdateComponent = Relay.createContainer(
      React.createClass({render, shouldComponentUpdate}),
      {
        shouldComponentUpdate,
        fragments: {
          foo: jest.genMockFunction().mockImplementation(
            () => Relay.QL`fragment on Node{id,name}`
          ),
        },
      }
    );

    GraphQLStoreQueryResolver.mockResolveImplementation(0, (_, dataID) => {
      return mockDataSet[dataID];
    });
    mockFooFragment =
      getNode(MockAlwaysUpdateComponent.getFragment('foo').getFragment({}));
    const mockPointerA = getPointer('42', mockFooFragment);

    RelayTestRenderer.render(
      () => <MockAlwaysUpdateComponent foo={mockPointerA} />,
      environment,
      mockRoute
    );
    expect(render.mock.calls.length).toBe(1);

    RelayTestRenderer.render(
      () => <MockAlwaysUpdateComponent foo={mockPointerA} />,
      environment,
      mockRoute
    );
    expect(shouldComponentUpdate.mock.calls.length).toBe(2);
    expect(shouldComponentUpdate.mock.calls[0].length).toBe(0);
    expect(render.mock.calls.length).toBe(2);
  });
});

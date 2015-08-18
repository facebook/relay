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

jest
  .dontMock('RelayContainerComparators')
  .mock('warning');

describe('RelayContainer', function() {
  var GraphQL;
  var GraphQLStoreQueryResolver;
  var GraphQLStoreTestUtils;
  var React;
  var ReactTestUtils;
  var Relay;
  var RelayMetaRoute;
  var RelayQuery;
  var RelayRoute;

  var toGraphQL;

  var MockContainer;
  var MockComponent;
  var RelayTestRenderer;

  var mockBarFragment;
  var mockBarPointer;
  var mockFooFragment;
  var mockFooPointer;
  var mockRoute;

  var {getNode, getPointer} = RelayTestUtils;

  beforeEach(function() {
    jest.resetModuleRegistry();

    GraphQL = require('GraphQL');
    GraphQLStoreQueryResolver = require('GraphQLStoreQueryResolver');
    GraphQLStoreTestUtils = require('GraphQLStoreTestUtils');
    React = require('React');
    ReactTestUtils = require('ReactTestUtils');
    Relay = require('Relay');
    RelayMetaRoute = require('RelayMetaRoute');
    RelayQuery = require('RelayQuery');
    RelayRoute = require('RelayRoute');

    toGraphQL = require('toGraphQL');

    var render = jest.genMockFunction().mockImplementation(function() {
      // Make it easier to expect prop values.
      render.mock.calls[render.mock.calls.length - 1].props = this.props;
      return <div />;
    });
    MockComponent = React.createClass({render});
    MockContainer = Relay.createContainer(MockComponent, {
      fragments: {
        foo: jest.genMockFunction().mockImplementation(
          () => Relay.QL`fragment on Node{id,name}`
        ),
        bar: jest.genMockFunction().mockImplementation(
          () => Relay.QL`fragment on Node @relay(plural:true){id,name}`
        )
      }
    });
    MockContainer.mock = {render};

    mockRoute = RelayRoute.genMockInstance();
    mockFooFragment = getNode(MockContainer.getQuery('foo').getFragment({}));
    mockFooPointer = getPointer('42', mockFooFragment);
    mockBarFragment = getNode(MockContainer.getQuery('bar').getFragment());
    mockBarPointer = getPointer(['42'], mockBarFragment);

    RelayTestRenderer = RelayTestUtils.createRenderer();

    // TODO: #6524377 - migrate to RelayTestUtils matchers
    this.addMatchers(GraphQLStoreTestUtils.matchers);
    this.addMatchers(RelayTestUtils.matchers);
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
      var BadContainer = Relay.createContainer(MockComponent, {
        fragments: {
          viewer: () => Relay.QL`query{node(id:"123"){id}}`,
        }
      });
      var badFragmentReference = BadContainer.getFragment('viewer');
      expect(() => {
        badFragmentReference.getFragment();
      }).toFailInvariant(
        'Relay.QL defined on container `Relay(MockComponent)` named `viewer` ' +
        'is not a valid fragment. A typical fragment is defined using: ' +
        'Relay.QL`fragment on Type {...}`'
      );
    });

    it('creates query for a container without fragments', () => {
      // Test that scalar constants are substituted, not only query fragments.
      var TEST_PHOTO_SIZE = 100;
      var MockProfilePhoto = Relay.createContainer(MockComponent, {
        initialVariables: {
          testPhotoSize: TEST_PHOTO_SIZE,
        },
        fragments: {
          photo: variables => Relay.QL`
            fragment on Actor {
              profilePicture(size:$testPhotoSize) {
                uri
              }
            }
          `
        }
      });
      var fragment = getNode(
        MockProfilePhoto.getQuery('photo'),
        {}
      );
      expect(fragment).toEqualQueryNode(getNode(
        new GraphQL.QueryFragment('Test', 'Actor', [
          new GraphQL.Field(
            'profilePicture',
            [new GraphQL.Field('uri')],
            null,
            [new GraphQL.Callv('size', TEST_PHOTO_SIZE)]
          ),
          new GraphQL.Field(
            'id', null, null, null, null, null, {generated: true}
          )
        ])
      ));
    });

    it('creates query for a container with fragments', () => {
      var anotherComponent = React.createClass({render: () => null});
      var MockProfile = Relay.createContainer(MockComponent, {
        fragments: {
          user: () => Relay.QL`
            fragment on Actor {
              id,
              name,
              ${MockProfileLink.getQuery('user')}
            }
          `
        }
      });
      var MockProfileLink = Relay.createContainer(anotherComponent, {
        fragments: {
          user: () => Relay.QL`
            fragment on Actor {
              id,
              url
            }
          `
        }
      });
      var fragment = getNode(
        MockProfile.getQuery('user'),
        {}
      );
      expect(fragment).toEqualQueryNode(getNode(
        new GraphQL.QueryFragment('Test', 'Actor', [
          new GraphQL.Field('id'),
          new GraphQL.Field('name')
        ], [
          new GraphQL.QueryFragment('Test', 'Actor', [
            new GraphQL.Field('id'),
            new GraphQL.Field('url')
          ])
        ])
      ));
    });
  });

  describe('conditional fragments', () => {
    var sideshowFragment;
    var MockFeed;
    var feedFragment;

    beforeEach(() => {
      MockFeed = Relay.createContainer(MockComponent, {
        fragments: {
          viewer: variables => Relay.QL`
            fragment on Viewer {
              newsFeed,
            }
          `
        }
      });
      sideshowFragment = new GraphQL.QueryFragment('Test', 'Viewer');
      feedFragment =
        new GraphQL.QueryFragment('Test', 'Viewer', [
          new GraphQL.Field('newsFeed'),
        ]);
    });

    it('can conditionally include a fragment based on variables', () => {
      var MockSideshow = Relay.createContainer(MockComponent, {
        initialVariables: {
          hasSideshow: null,
        },
        fragments: {
          viewer: variables => Relay.QL`
            fragment on Viewer {
              ${MockFeed.getQuery('viewer').if(variables.hasSideshow)},
            }
          `
        }
      });

      // hasSideshow: true
      var fragment = getNode(
        MockSideshow.getQuery('viewer', {
          hasSideshow: new GraphQL.CallVariable('sideshow')
        }),
        {sideshow: true}
      );
      var expected = RelayQuery.Node.buildFragment(
        'Test',
        'Viewer',
        [getNode(feedFragment)]
      );
      expect(fragment).toEqualQueryNode(expected);

      // hasSideshow: false
      fragment = getNode(
        MockSideshow.getQuery('viewer', {
          hasSideshow: new GraphQL.CallVariable('sideshow')
        }),
        {sideshow: false}
      );
      expect(fragment.getChildren().length).toBe(0);
    });

    it('can conditionally exclude a fragment based on variables', () => {
      var MockSideshow = Relay.createContainer(MockComponent, {
        initialVariables: {
          hasSideshow: null,
        },
        fragments: {
          viewer: variables => Relay.QL`
            fragment on Viewer {
              ${MockFeed
            .getQuery('viewer')
            .unless(variables.hasSideshow)},
            }
          `
        }
      });

      // hasSideshow: true
      var fragment = getNode(
        MockSideshow.getQuery('viewer', {hasSideshow: true}),
        {}
      );
      expect(fragment.getChildren().length).toBe(0);

      // hasSideshow: false
      fragment = getNode(
        MockSideshow.getQuery('viewer', {hasSideshow: false}),
        {}
      );
      var expected = RelayQuery.Node.buildFragment(
        'Test',
        'Viewer',
        [getNode(feedFragment)],
      );
      expect(fragment).toEqualQueryNode(expected);
    });
  });

  it('throws if rendered without a route', () => {
    var ShallowRenderer = ReactTestUtils.createRenderer();
    expect(() => ShallowRenderer.render(
      <MockContainer foo={mockFooPointer} />
    )).toFailInvariant(
      'RelayContainer: `Relay(MockComponent)` was rendered without a valid ' +
      'route. Make sure the route is valid, and make sure that it is ' +
      'correctly set on the parent component\'s context ' +
      '(e.g. using <RelayRootContainer>).'
    );
  });

  it('creates resolvers for each query prop with a fragment pointer', () => {
    RelayTestRenderer.render(
      () => <MockContainer foo={mockFooPointer} />,
      mockRoute
    );
    expect(GraphQLStoreQueryResolver.mock.instances.length).toBe(1);

    RelayTestRenderer.render(
      () => <MockContainer foo={mockFooPointer} bar={[mockBarPointer]} />,
      mockRoute
    );
    // `foo` resolver is re-used, `bar` is added
    expect(GraphQLStoreQueryResolver.mock.instances.length).toBe(2);
  });

  it('reuses resolvers even if route changes', () => {
    var MockRouteA = RelayRoute.genMock();
    var MockRouteB = RelayRoute.genMock();

    var mockRouteA = new MockRouteA();
    var mockRouteB = new MockRouteB();

    RelayTestRenderer.render(
      () => <MockContainer foo={mockFooPointer} />,
      mockRouteA
    );
    RelayTestRenderer.render(
      () => <MockContainer foo={mockFooPointer} />,
      mockRouteB
    );

    expect(GraphQLStoreQueryResolver.mock.instances.length).toBe(1);
    expect(GraphQLStoreQueryResolver.mock.instances[0].reset).not.toBeCalled();
  });

  it('resolves each prop with a query', () => {
    RelayTestRenderer.render(
      () => <MockContainer foo={mockFooPointer} />,
      mockRoute
    );
    var fragmentPointer = mockFooPointer[Object.keys(mockFooPointer)[0]];

    var mockResolvers = GraphQLStoreQueryResolver.mock.instances;
    expect(mockResolvers.length).toBe(1);
    expect(mockResolvers[0].resolve.mock.calls[0][0].getFragment())
      .toEqualQueryNode(fragmentPointer.getFragment());
  });

  it('re-resolves props when notified of changes', () => {
    var mockData = {__dataID__: '42', id: '42', name: 'Tim'};

    GraphQLStoreQueryResolver.mockDefaultResolveImplementation(() => mockData);

    RelayTestRenderer.render(
      () => <MockContainer foo={mockFooPointer} />,
      mockRoute
    );

    var mockResolvers = GraphQLStoreQueryResolver.mock.instances;
    mockResolvers[0].mock.callback();

    expect(mockResolvers.length).toBe(1);
    expect(mockResolvers[0].reset.mock.calls.length).toBe(0);
    expect(mockResolvers[0].resolve.mock.calls.length).toBe(2);
  });

  it('resolves with most recent props', () => {
    var mockPointerA = getPointer('42', mockFooFragment);
    var fragmentPointerA = mockPointerA[Object.keys(mockPointerA)[0]];
    var mockPointerB = getPointer('43', mockFooFragment);
    var fragmentPointerB = mockPointerB[Object.keys(mockPointerB)[0]];

    RelayTestRenderer.render(
      () => <MockContainer foo={mockPointerA} />,
      mockRoute
    );
    RelayTestRenderer.render(
      () => <MockContainer foo={mockPointerB} />,
      mockRoute
    );

    var mockResolvers = GraphQLStoreQueryResolver.mock.instances;

    expect(mockResolvers.length).toBe(1);
    expect(mockResolvers[0].reset.mock.calls.length).toBe(0);
    expect(mockResolvers[0].resolve.mock.calls.length).toBe(2);
    expect(mockResolvers[0].resolve.mock.calls[0][0].getFragment())
      .toEqualQueryNode(fragmentPointerA.getFragment());
    expect(mockResolvers[0].resolve.mock.calls[1][0].getFragment())
      .toEqualQueryNode(fragmentPointerB.getFragment());
  });

  it('does not create resolvers for null/undefined props', () => {
    RelayTestRenderer.render(
      () => <MockContainer foo={null} bar={undefined} />,
      mockRoute
    );

    var mockResolvers = GraphQLStoreQueryResolver.mock.instances;
    expect(mockResolvers.length).toBe(0);
    var props = MockContainer.mock.render.mock.calls[0].props;
    expect(props.bar).toBe(undefined);
    expect(props.foo).toBe(null);
  });

  it('warns if props are missing fragment pointers', () => {
    var mockData = {};
    RelayTestRenderer.render(
      () => <MockContainer foo={mockData} bar={null} />,
      mockRoute
    );

    var mockResolvers = GraphQLStoreQueryResolver.mock.instances;
    expect(mockResolvers.length).toBe(0);
    var props = MockContainer.mock.render.mock.calls[0].props;
    expect(props.bar).toBe(null);
    expect(props.foo).toBe(mockData);

    expect([
      'RelayContainer: Expected prop `%s` supplied to `%s` to ' +
      'be data fetched by Relay. This is likely an error unless ' +
      'you are purposely passing in mock data that conforms to ' +
      'the shape of this component\'s fragment.',
      'foo',
      'MockComponent',
    ]).toBeWarnedNTimes(1);
  });

  it('warns if a query is not passed in', () => {
    RelayTestRenderer.render(
      () => <MockContainer foo={null} />,
      mockRoute
    );

    var mockResolvers = GraphQLStoreQueryResolver.mock.instances;
    expect(mockResolvers.length).toBe(0);
    var props = MockContainer.mock.render.mock.calls[0].props;
    expect(props.bar).toBe(undefined);
    expect(props.foo).toBe(null);

    expect([
      'RelayContainer: Expected query `%s` to be supplied to `%s` as ' +
      'a prop from the parent. Pass an explicit `null` if this is ' +
      'intentional.',
      'bar',
      'MockComponent',
    ]).toBeWarnedNTimes(1);
  });

  it('throws if non-plural fragment receives an array', () => {
    var mockData = [];
    expect(() => {
      RelayTestRenderer.render(
        () => <MockContainer foo={mockData} />,
        mockRoute
      );
    }).toFailInvariant(
      'RelayContainer: Invalid prop `foo` supplied to `MockComponent`, ' +
      'expected a single record because the corresponding fragment is not ' +
      'plural.'
    );
  });

  it('throws if plural fragment receives a non-array', () => {
    var mockData = {};
    expect(() => {
      RelayTestRenderer.render(
        () => <MockContainer bar={mockData} />,
        mockRoute
      );
    }).toFailInvariant(
      'RelayContainer: Invalid prop `bar` supplied to `MockComponent`, ' +
      'expected an array of records because the corresponding fragment is ' +
      'plural.'
    );
  });

  it('throws if plural fragment is missing fragment pointers', () => {
    var mockData = [{}];
    expect(() => {
      RelayTestRenderer.render(
        () => <MockContainer bar={mockData} />,
        mockRoute
      );
    }).toFailInvariant(
      'RelayContainer: Invalid prop `bar` supplied to `MockComponent`, ' +
      'expected element at index 0 to have query data.'
    );
  });

  it('does not re-render if props resolve to the same object', () => {
    var mockData = {__dataID__: '42', id: '42', name: 'Tim'};

    GraphQLStoreQueryResolver.mockDefaultResolveImplementation(() => mockData);

    RelayTestRenderer.render(
      () => <MockContainer foo={mockFooPointer} />,
      mockRoute
    );

    expect(MockContainer.mock.render.mock.calls.length).toBe(1);
    expect(MockContainer.mock.render.mock.calls[0].props.foo).toEqual(mockData);

    GraphQLStoreQueryResolver.mock.instances[0].mock.callback();

    expect(MockContainer.mock.render.mock.calls.length).toBe(1);
  });

  it('re-renders if props resolve to different objects', () => {
    var mockDataList = [
      {__dataID__: '42', id: '42', name: 'Tim', ...mockFooPointer},
      {__dataID__: '42', id: '42', name: 'Tee', ...mockFooPointer}
    ];

    GraphQLStoreQueryResolver.mockResolveImplementation(0, function() {
      return mockDataList[this.resolve.mock.calls.length - 1];
    });

    RelayTestRenderer.render(
      () => <MockContainer foo={mockFooPointer} />,
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

  it('applies `shouldComponentUpdate` properly', () => {
    var mockDataSet = {
      '42': {__dataID__: '42', name: 'Tim'},
      '43': {__dataID__: '43', name: 'Tee'},
      '44': {__dataID__: '44', name: 'Toe'}
    };
    var render = jest.genMockFunction().mockImplementation(() => <div />);
    var shouldComponentUpdate = jest.genMockFunction();

    var MockFastComponent = React.createClass({render, shouldComponentUpdate});

    var MockFastContainer = Relay.createContainer(MockFastComponent, {
      fragments: {
        foo: jest.genMockFunction().mockImplementation(
          () => Relay.QL`fragment on Node{id,name}`
        )
      }
    });

    GraphQLStoreQueryResolver.mockResolveImplementation(0, (pointer) => {
      return mockDataSet[pointer.getDataID()];
    });
    mockFooFragment =
      getNode(MockFastContainer.getQuery('foo').getFragment({}));
    var mockPointerA = getPointer('42', mockFooFragment);
    var mockPointerB = getPointer('43', mockFooFragment);
    var mockPointerC = getPointer('44', mockFooFragment);

    RelayTestRenderer.render(
      () => <MockFastContainer foo={mockPointerA} />,
      mockRoute
    );
    expect(render.mock.calls.length).toBe(1);

    shouldComponentUpdate.mockReturnValue(true);

    // Component wants to update, RelayContainer doesn't.
    RelayTestRenderer.render(
      () => <MockFastContainer foo={mockPointerA} />,
      mockRoute
    );
    expect(render.mock.calls.length).toBe(1);

    // Component wants to update, RelayContainer does too.
    RelayTestRenderer.render(
      () => <MockFastContainer foo={mockPointerB} />,
      mockRoute
    );
    expect(render.mock.calls.length).toBe(2);

    shouldComponentUpdate.mockReturnValue(false);

    // Component doesn't want to update, RelayContainer does.
    RelayTestRenderer.render(
      () => <MockFastContainer foo={mockPointerC} />,
      mockRoute
    );
    expect(render.mock.calls.length).toBe(2);

    // Component doesn't want to update, RelayContainer doesn't either.
    RelayTestRenderer.render(
      () => <MockFastContainer foo={mockPointerC} />,
      mockRoute
    );
    expect(render.mock.calls.length).toBe(2);

    shouldComponentUpdate.mockReturnValue(true);
    RelayTestRenderer.render(
      () => <MockFastContainer foo={mockPointerC} thing="scalar" />,
      mockRoute
    );
    expect(render.mock.calls.length).toBe(3);
  });
});

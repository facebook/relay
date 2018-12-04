/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow
 * @format
 */

'use strict';

jest.mock('../../utils/fetchQueryUtils');

const React = require('React');
const ReactRelayContext = require('react-relay/modern/ReactRelayContext');
const TestRenderer = require('ReactTestRenderer');

const createSuspenseRefetchContainer = require('../createSuspenseRefetchContainer');
const createSuspenseQueryRenderer = require('../createSuspenseQueryRenderer');
const readContext = require('react-relay/modern/readContext');

const {createMockEnvironment} = require('RelayModernMockEnvironment');
const {generateAndCompile} = require('RelayModernTestUtils');
const {
  createOperationSelector,
  FRAGMENTS_KEY,
  ID_KEY,
} = require('relay-runtime');

import type {OperationSelector, RelayContext} from 'relay-runtime';

const UserComponent = jest.fn(({user}) => (
  <div>
    Hey user, {user.name} with id {user.id}!
  </div>
));

class PropsSetter extends React.Component<any, any> {
  constructor() {
    super();
    this.state = {
      props: null,
    };
  }
  setProps(props) {
    this.setState({props});
  }
  render() {
    const child = React.Children.only(this.props.children);
    if (this.state.props) {
      return React.cloneElement(child, this.state.props);
    }
    return child;
  }
}

function expectToBeRenderedWith(renderFn, readyState) {
  expect(renderFn).toBeCalledTimes(1);
  expect(renderFn.mock.calls[0][0]).toEqual({
    ...readyState,
    relay: expect.anything(),
    refetch: expect.any(Function),
  });
  renderFn.mockClear();
}

describe('createSuspenseRefetchContainer', () => {
  let environment;
  let gqlRefetchQuery;
  let gqlParentQuery;
  let fragment;
  let parentQuery;
  let RefetchContainerWrapper;
  let ContextWrapper;
  let RefetchContainer;
  let renderer;
  let containerOpts;

  const variables = {
    id: '1',
  };

  beforeEach(() => {
    UserComponent.mockClear();
    environment = createMockEnvironment();
    const generated = generateAndCompile(
      `
        fragment UserFragment on User {
          id
          name
        }

        query RefetchQuery($id: ID!) {
          node(id: $id) {
            ...UserFragment
          }
        }

        query ParentQuery($id: ID!) {
          node(id: $id) {
            ...UserFragment
          }
        }
    `,
    );
    gqlRefetchQuery = generated.RefetchQuery;
    gqlParentQuery = generated.ParentQuery;
    fragment = generated.UserFragment;
    parentQuery = createOperationSelector(gqlParentQuery, variables);

    const parentRelayContext = {
      environment,
      query: parentQuery,
      variables,
    };

    ContextWrapper = ({
      children,
      value,
    }: {
      children: React.Node,
      value?: RelayContext,
    }) => (
      <ReactRelayContext.Provider value={value ?? parentRelayContext}>
        {children}
      </ReactRelayContext.Provider>
    );

    containerOpts = {
      getFragmentRefsFromResponse: data => ({
        user: data.node,
      }),
    };
    RefetchContainer = createSuspenseRefetchContainer(
      // $FlowExpectedError - jest.fn type doesn't match React.Component, but its okay to use
      UserComponent,
      {
        user: fragment,
      },
      gqlRefetchQuery,
      containerOpts,
    );

    RefetchContainerWrapper = ({
      id,
      value,
    }: {
      id?: string,
      value?: RelayContext,
    }) => (
      <ContextWrapper value={value}>
        <RefetchContainer
          user={{
            [ID_KEY]: id ?? value?.variables.id ?? variables.id,
            [FRAGMENTS_KEY]: {
              UserFragment: fragment,
            },
          }}
        />
      </ContextWrapper>
    );

    environment.commitPayload(parentQuery, {
      node: {
        __typename: 'User',
        id: '1',
        name: 'Alice',
      },
    });

    renderer = TestRenderer.create(
      <PropsSetter>
        <RefetchContainerWrapper />
      </PropsSetter>,
    );
  });

  afterEach(() => {
    environment.mockClear();
  });

  it('should render without error when data is available', () => {
    expectToBeRenderedWith(UserComponent, {user: {id: '1', name: 'Alice'}});
  });

  it('should render without error when data is avialable and extra props included', () => {
    const UserWithFoo = jest.fn(({user, foo}) => (
      <div>
        Hey user, {user.name} with id {user.id} and {foo}!
      </div>
    ));
    const Container = createSuspenseRefetchContainer(
      // $FlowExpectedError - jest.fn type doesn't match React.Component, but its okay to use
      UserWithFoo,
      {
        user: fragment,
      },
      gqlRefetchQuery,
      containerOpts,
    );
    TestRenderer.create(
      <ContextWrapper>
        <Container
          user={{
            [ID_KEY]: variables.id,
            [FRAGMENTS_KEY]: {
              UserFragment: fragment,
            },
          }}
          foo="bar"
        />
      </ContextWrapper>,
    );
    expectToBeRenderedWith(UserWithFoo, {
      user: {id: '1', name: 'Alice'},
      foo: 'bar',
    });
  });

  it('should render without error when data is avialable and using plural fragment', () => {
    const generated = generateAndCompile(
      `
        fragment UsersFragment on User @relay(plural: true) {
          id
          name
        }

        query RefetchQuery($ids: [ID!]!) {
          nodes(ids: $ids) {
            ... on User {
              ...UsersFragment
            }
          }
        }

        query ParentQuery($ids: [ID!]!) {
          nodes(ids: $ids) {
            ... on User {
              ...UsersFragment
            }
          }
        }
    `,
    );
    const usersVariables = {ids: ['1', '2']};
    gqlRefetchQuery = generated.RefetchQuery;
    gqlParentQuery = generated.ParentQuery;
    fragment = generated.UsersFragment;
    parentQuery = createOperationSelector(gqlParentQuery, usersVariables);
    environment.commitPayload(parentQuery, {
      nodes: [
        {
          __typename: 'User',
          id: '1',
          name: 'Alice',
        },
        {
          __typename: 'User',
          id: '2',
          name: 'Bob',
        },
      ],
    });

    const parentRelayContext = {
      environment,
      query: parentQuery,
      variables: usersVariables,
    };
    const Users = jest.fn(({users}) => (
      <div>
        {users.map(user => (
          <span key={user.id}>
            Hey user, {user.name} with id {user.id}!
          </span>
        ))}
      </div>
    ));
    const Container = createSuspenseRefetchContainer(
      // $FlowExpectedError - jest.fn type doesn't match React.Component, but its okay to use
      Users,
      {
        users: fragment,
      },
      gqlRefetchQuery,
      {getFragmentRefsFromResponse: data => ({users: data.nodes})},
    );
    TestRenderer.create(
      <ContextWrapper value={parentRelayContext}>
        <Container
          users={[
            {
              [ID_KEY]: '1',
              [FRAGMENTS_KEY]: {
                UsersFragment: fragment,
              },
            },
            {
              [ID_KEY]: '2',
              [FRAGMENTS_KEY]: {
                UsersFragment: fragment,
              },
            },
          ]}
        />
      </ContextWrapper>,
    );
    expectToBeRenderedWith(Users, {
      users: [{id: '1', name: 'Alice'}, {id: '2', name: 'Bob'}],
    });
  });

  it('should support passing a ref', () => {
    // eslint-disable-next-line lint/flow-no-fixme
    class UserClassComponent extends React.Component<$FlowFixMe> {
      render() {
        const {user} = this.props;
        return (
          <div>
            Hey user, {user.name} with id {user.id}!
          </div>
        );
      }
    }
    const Container = createSuspenseRefetchContainer(
      UserClassComponent,
      {
        user: fragment,
      },
      gqlRefetchQuery,
      containerOpts,
    );
    const ref = React.createRef();
    TestRenderer.create(
      <ContextWrapper>
        <Container
          /* $FlowFixMe(>=0.86.0 site=react_native_fb,www) This comment suppresses
           * an error found when Flow v0.86 was deployed. To see the error,
           * delete this comment and run Flow. */
          ref={ref}
          user={{
            [ID_KEY]: variables.id,
            [FRAGMENTS_KEY]: {
              UserFragment: fragment,
            },
          }}
        />
      </ContextWrapper>,
    );
    expect(ref.current).not.toBe(null);
    expect(ref.current).toBeInstanceOf(UserClassComponent);
  });

  it('should re-read and resubscribe to fragment when fragment pointers change', () => {
    expectToBeRenderedWith(UserComponent, {user: {id: '1', name: 'Alice'}});
    const nextVariables = {id: '200'};
    parentQuery = createOperationSelector(gqlParentQuery, nextVariables);
    environment.commitPayload(parentQuery, {
      node: {
        __typename: 'User',
        id: '200',
        name: 'Foo',
      },
    });
    renderer.getInstance().setProps({
      value: {environment, query: parentQuery, variables: {id: '200'}},
    });
    expectToBeRenderedWith(UserComponent, {user: {id: '200', name: 'Foo'}});

    environment.commitPayload(parentQuery, {
      node: {
        __typename: 'User',
        id: '200',
        name: 'Foo Updated',
      },
    });
    expectToBeRenderedWith(UserComponent, {
      user: {id: '200', name: 'Foo Updated'},
    });
  });

  it('should re-read and resubscribe to fragment when variables change', () => {
    expectToBeRenderedWith(UserComponent, {user: {id: '1', name: 'Alice'}});
    const nextVariables = {id: '400'};
    parentQuery = createOperationSelector(gqlParentQuery, nextVariables);
    environment.commitPayload(parentQuery, {
      node: {
        __typename: 'User',
        id: '400',
        name: 'Bar',
      },
    });
    renderer.getInstance().setProps({
      value: {environment, query: parentQuery, variables: nextVariables},
    });
    expectToBeRenderedWith(UserComponent, {user: {id: '400', name: 'Bar'}});

    environment.commitPayload(parentQuery, {
      node: {
        __typename: 'User',
        id: '400',
        name: 'Bar Updated',
      },
    });
    expectToBeRenderedWith(UserComponent, {
      user: {id: '400', name: 'Bar Updated'},
    });
  });

  it('should update if new data comes in', () => {
    environment.commitPayload(parentQuery, {
      node: {
        __typename: 'User',
        id: '1',
        name: 'Alice',
      },
    });
    expectToBeRenderedWith(UserComponent, {user: {id: '1', name: 'Alice'}});
    environment.commitPayload(parentQuery, {
      node: {
        __typename: 'User',
        id: '1',
        name: 'Alice in Wonderland',
      },
    });
    expectToBeRenderedWith(UserComponent, {
      user: {id: '1', name: 'Alice in Wonderland'},
    });
  });

  describe('when data is missing', () => {
    function testWhenAllFragmentDataIsMissing(payload) {
      // This prevents console.error output in the test, which is expected
      jest.spyOn(console, 'error').mockImplementationOnce(() => {});
      jest.unmock('../../utils/fetchQueryUtils');
      UserComponent.mockClear();

      parentQuery = createOperationSelector(gqlParentQuery, {
        id: '2',
      });
      const QueryRenderer = createSuspenseQueryRenderer(gqlParentQuery);
      renderer = TestRenderer.create(
        // $FlowFixMe
        <React.Suspense fallback="Fallback">
          <QueryRenderer environment={environment} variables={{id: '2'}}>
            {data => <RefetchContainer user={data.node} />}
          </QueryRenderer>
        </React.Suspense>,
      );
      // Assert component suspends on first render
      expect(renderer.toJSON()).toEqual('Fallback');
      expect(UserComponent).not.toBeCalled();
      expect(environment.execute).toBeCalledTimes(1);

      environment.mock.resolve(gqlParentQuery, payload);
      jest.runAllTimers();
      expectToBeRenderedWith(UserComponent, {user: {id: '2', name: 'Bob'}});

      // Assert that QueryRenderer inside RefetchContainer doesn't produce
      // cascading network updates on first render
      expect(environment.execute).toBeCalledTimes(1);

      jest.mock('../../utils/fetchQueryUtils');
    }

    function testWhenSomeFragmentDataIsMissing(payload) {
      // We assume here that a parent QueryRenderer is fetching the query,
      // which is why we expect it not to send a network request

      // This prevents console.error output in the test, which is expected
      jest.spyOn(console, 'error').mockImplementationOnce(() => {});
      jest.unmock('../../utils/fetchQueryUtils');
      UserComponent.mockClear();

      parentQuery = createOperationSelector(gqlParentQuery, {
        id: '2',
      });
      environment.commitPayload(parentQuery, {
        node: {
          __typename: 'User',
          id: '2',
        },
      });
      expect(UserComponent).not.toBeCalled();
      const QueryRenderer = createSuspenseQueryRenderer(gqlParentQuery);
      renderer = TestRenderer.create(
        // $FlowFixMe
        <React.Suspense fallback="Fallback">
          <QueryRenderer environment={environment} variables={{id: '2'}}>
            {data => <RefetchContainer user={data.node} />}
          </QueryRenderer>
        </React.Suspense>,
      );
      // Assert component suspends on first render
      expect(renderer.toJSON()).toEqual('Fallback');
      expect(UserComponent).not.toBeCalled();
      expect(environment.execute).toBeCalledTimes(1);

      environment.mock.resolve(gqlParentQuery, payload);
      jest.runAllTimers();
      expectToBeRenderedWith(UserComponent, {user: {id: '2', name: 'Bob'}});

      // Assert that QueryRenderer inside RefetchContainer doesn't produce
      // cascading network updates on first render
      expect(environment.execute).toBeCalledTimes(1);

      jest.mock('../../utils/fetchQueryUtils');
    }

    describe('when parent query has no missing data (snapshot.isMissingData === false)', () => {
      it('should suspend without sending a network request when parent query is in flight and all fragment data is missing', () => {
        testWhenAllFragmentDataIsMissing({
          data: {
            node: {
              __typename: 'User',
              id: '2',
              name: 'Bob',
            },
          },
        });
      });

      it('should suspend without sending a network request when parent query is in flight and some fragment data is missing', () => {
        testWhenSomeFragmentDataIsMissing({
          data: {
            node: {
              __typename: 'User',
              id: '2',
              name: 'Bob',
            },
          },
        });
      });
    });

    describe('when parent query has missing data (snapshot.isMissingData === true)', () => {
      beforeEach(() => {
        UserComponent.mockClear();
        environment = createMockEnvironment();
        const generated = generateAndCompile(
          `
        fragment UserFragment on User {
          id
          name
        }

        query RefetchQuery($id: ID!) {
          node(id: $id) {
            ...UserFragment
          }
        }

        query ParentQuery($id: ID!) {
          node(id: $id) {
            id
            username # Query has this field missing
            ...UserFragment
          }
        }
    `,
        );
        gqlRefetchQuery = generated.RefetchQuery;
        gqlParentQuery = generated.ParentQuery;
        fragment = generated.UserFragment;
        parentQuery = createOperationSelector(gqlParentQuery, variables);

        const parentRelayContext = {
          environment,
          query: parentQuery,
          variables,
        };

        ContextWrapper = ({
          children,
          value,
        }: {
          children: React.Node,
          value?: RelayContext,
        }) => (
          <ReactRelayContext.Provider value={value ?? parentRelayContext}>
            {children}
          </ReactRelayContext.Provider>
        );

        containerOpts = {
          getFragmentRefsFromResponse: data => ({
            user: data.node,
          }),
        };
        RefetchContainer = createSuspenseRefetchContainer(
          // $FlowExpectedError - jest.fn type doesn't match React.Component, but its okay to use
          UserComponent,
          {
            user: fragment,
          },
          gqlRefetchQuery,
          containerOpts,
        );

        RefetchContainerWrapper = ({
          id,
          value,
        }: {
          id?: string,
          value?: RelayContext,
        }) => (
          <ContextWrapper value={value}>
            <RefetchContainer
              user={{
                [ID_KEY]: id ?? value?.variables.id ?? variables.id,
                [FRAGMENTS_KEY]: {
                  UserFragment: fragment,
                },
              }}
            />
          </ContextWrapper>
        );
      });

      it('should suspend without sending a network request when parent query is in flight and all fragment data is missing', () => {
        testWhenAllFragmentDataIsMissing({
          data: {
            node: {
              __typename: 'User',
              id: '2',
              name: 'Bob',
              username: 'bob',
            },
          },
        });
      });

      it('should suspend without sending a network request when parent query is in flight and some fragment data is missing', () => {
        testWhenSomeFragmentDataIsMissing({
          data: {
            node: {
              __typename: 'User',
              id: '2',
              name: 'Bob',
              username: 'bob',
            },
          },
        });
      });
    });

    it('should throw an error if data is missing and there are no pending requests', () => {
      // This prevents console.error output in the test, which is expected
      jest.spyOn(console, 'error').mockImplementationOnce(() => {});

      parentQuery = createOperationSelector(gqlParentQuery, {
        id: '2',
      });
      environment.commitPayload(parentQuery, {
        node: {
          __typename: 'User',
          id: '2',
        },
      });
      expect(() => {
        TestRenderer.create(
          <ContextWrapper
            value={{environment, query: parentQuery, variables: {id: '2'}}}>
            <RefetchContainer
              user={{
                [ID_KEY]: '2',
                [FRAGMENTS_KEY]: {
                  UserFragment: fragment,
                },
              }}
            />
          </ContextWrapper>,
        );
      }).toThrow(
        'SuspenseRefetchContainer: Expected refetchQuery RefetchQuery to ' +
          'be a subset of parent query: ParentQuery. Make sure that the ' +
          'data queried by RefetchQuery is also queried by ParentQuery.',
      );
    });

    it('should throw an error if refetchQuery is not a subset of parent query', () => {
      UserComponent.mockClear();
      // This prevents console.error output in the test, which is expected
      jest.spyOn(console, 'error').mockImplementationOnce(() => {});
      jest.unmock('../../utils/fetchQueryUtils');

      const generated = generateAndCompile(
        `
        fragment UserFragment on User {
          id
          name
        }

        query RefetchQuery($id: ID!) {
          node(id: $id) {
            ... on User {
              username
            }
            ...UserFragment
          }
        }
    `,
      );
      gqlRefetchQuery = generated.RefetchQuery;
      RefetchContainer = createSuspenseRefetchContainer(
        // $FlowExpectedError - jest.fn type doesn't match React.Component, but its okay to use
        UserComponent,
        {
          user: fragment,
        },
        gqlRefetchQuery,
        containerOpts,
      );

      class ErrorBoundary extends React.Component<
        {children: React.Node, fallback: Error => React.Node},
        {error: ?Error},
      > {
        state = {
          error: null,
        };

        componentDidCatch(error) {
          this.setState({error});
        }

        render() {
          if (this.state.error) {
            return this.props.fallback(this.state.error);
          }
          return this.props.children;
        }
      }

      parentQuery = createOperationSelector(gqlParentQuery, {
        id: '2',
      });
      const QueryRenderer = createSuspenseQueryRenderer(gqlParentQuery);
      renderer = TestRenderer.create(
        <ErrorBoundary fallback={error => error.message}>
          {/* $FlowFixMe */}
          <React.Suspense fallback="Fallback">
            <QueryRenderer environment={environment} variables={{id: '2'}}>
              {data => <RefetchContainer user={data.node} />}
            </QueryRenderer>
          </React.Suspense>
        </ErrorBoundary>,
      );
      // Assert component suspends on first render
      expect(renderer.toJSON()).toEqual('Fallback');
      expect(UserComponent).not.toBeCalled();
      expect(environment.execute).toBeCalledTimes(1);

      environment.mock.resolve(gqlParentQuery, {
        data: {
          node: {
            __typename: 'User',
            id: '2',
            name: 'Bob',
          },
        },
      });
      jest.runAllTimers();
      expect(renderer.toJSON()).toEqual(
        'SuspenseRefetchContainer: Expected refetchQuery RefetchQuery to ' +
          'be a subset of parent query: ParentQuery. Make sure that the ' +
          'data queried by RefetchQuery is also queried by ParentQuery.',
      );
      // Assert that QueryRenderer inside RefetchContainer doesn't produce
      // cascading network updates on first render
      expect(environment.execute).toBeCalledTimes(1);

      jest.mock('../../utils/fetchQueryUtils');
    });
  });

  describe('refetch', () => {
    let userFragment;
    let viewerFragment;
    let gqlUserRefetchQuery;
    let refetch = (_1, _2) => {};
    let downstreamContext: RelayContext & {query: OperationSelector};
    let releaseGC = () => {};
    const MultiFragmentComponent = jest.fn(props => {
      refetch = props.refetch;
      // $FlowExpectedError
      downstreamContext = readContext(ReactRelayContext);
      const {user, viewer} = props;
      return (
        <div>
          Hey user, {user.name} with id {user.id}!
          <span>Viewer is: {viewer.actor.name}</span>
        </div>
      );
    });
    beforeEach(() => {
      MultiFragmentComponent.mockClear();

      environment = createMockEnvironment();
      const generated = generateAndCompile(
        `
        fragment UserFragment on User {
          id
          name
        }

        fragment ViewerFragment on Viewer {
          actor {
            ... on User {
              name
            }
          }
        }

        query UserRefetchQuery($id: ID!) {
          node(id: $id) {
            ...UserFragment
          }
        }

        query ParentQuery($id: ID!) {
          node(id: $id) {
            id
            ...UserFragment
          }
          viewer {
            ...ViewerFragment
          }
        }
    `,
      );
      userFragment = generated.UserFragment;
      viewerFragment = generated.ViewerFragment;
      gqlUserRefetchQuery = generated.UserRefetchQuery;
      gqlParentQuery = generated.ParentQuery;
      parentQuery = createOperationSelector(gqlParentQuery, variables);

      const parentRelayContext = {
        environment,
        query: parentQuery,
        variables,
      };
      releaseGC = environment.getStore().holdGC().dispose;

      ContextWrapper = ({
        children,
        value,
      }: {
        children: React.Node,
        value?: RelayContext,
      }) => (
        <ReactRelayContext.Provider value={value ?? parentRelayContext}>
          {children}
        </ReactRelayContext.Provider>
      );
    });

    afterEach(() => {
      releaseGC();
    });

    describe('when refetchQuery renders single fragment', () => {
      beforeEach(() => {
        RefetchContainer = createSuspenseRefetchContainer(
          // $FlowExpectedError - jest.fn type doesn't match React.Component, but its okay to use
          MultiFragmentComponent,
          {
            user: userFragment,
            viewer: viewerFragment,
          },
          gqlUserRefetchQuery,
          {
            getFragmentRefsFromResponse: data => ({
              user: data.node,
            }),
          },
        );

        RefetchContainerWrapper = ({
          id,
          value,
        }: {
          id?: string,
          value?: RelayContext,
        }) => (
          // This simulates the parent query being ParentQuery
          <ContextWrapper value={value}>
            <RefetchContainer
              user={{
                [ID_KEY]: id ?? value?.variables.id ?? variables.id,
                [FRAGMENTS_KEY]: {
                  UserFragment: {},
                },
              }}
              viewer={{
                [ID_KEY]: 'client:root:viewer',
                [FRAGMENTS_KEY]: {
                  ViewerFragment: {},
                },
              }}
            />
          </ContextWrapper>
        );

        environment.commitPayload(parentQuery, {
          node: {
            __typename: 'User',
            id: '1',
            name: 'Alice',
          },
          viewer: {
            __typename: 'Viewer',
            actor: {
              __typename: 'User',
              id: '3',
              name: 'Zed',
            },
          },
        });
      });

      it('renders correctly ', () => {
        renderer = TestRenderer.create(<RefetchContainerWrapper />);
        expectToBeRenderedWith(MultiFragmentComponent, {
          user: {id: '1', name: 'Alice'},
          viewer: {actor: {name: 'Zed'}},
        });
      });

      it('renders refetchQuery from store without suspending when refetch data is available', () => {
        jest.unmock('../../utils/fetchQueryUtils');
        renderer = TestRenderer.create(<RefetchContainerWrapper />);
        expectToBeRenderedWith(MultiFragmentComponent, {
          user: {id: '1', name: 'Alice'},
          viewer: {actor: {name: 'Zed'}},
        });

        parentQuery = createOperationSelector(gqlParentQuery, {id: '2'});
        environment.commitPayload(parentQuery, {
          node: {
            __typename: 'User',
            id: '2',
            name: 'Bob',
          },
          viewer: {
            __typename: 'Viewer',
            actor: {
              __typename: 'User',
              id: '3',
              name: 'Zed',
            },
          },
        });

        refetch({id: '2'});
        expectToBeRenderedWith(MultiFragmentComponent, {
          user: {id: '2', name: 'Bob'},
          // It continues to render fragment from original fragment reference
          // (before refetch)
          viewer: {actor: {name: 'Zed'}},
        });
        expect(environment.execute).not.toBeCalled();
        expect(downstreamContext.variables).toEqual({
          id: '2',
        });
        expect(downstreamContext.query.node.name).toEqual('UserRefetchQuery');

        jest.mock('../../utils/fetchQueryUtils');
      });

      it('should suspend and send network request when refetch data is missing', () => {
        MultiFragmentComponent.mockClear();
        // This prevents console.error output in the test, which is expected
        jest.spyOn(console, 'error').mockImplementationOnce(() => {});
        jest.unmock('../../utils/fetchQueryUtils');

        renderer = TestRenderer.create(
          // $FlowFixMe
          <React.Suspense fallback="Fallback">
            <RefetchContainerWrapper />
          </React.Suspense>,
        );
        expectToBeRenderedWith(MultiFragmentComponent, {
          user: {id: '1', name: 'Alice'},
          viewer: {actor: {name: 'Zed'}},
        });

        MultiFragmentComponent.mockClear();
        refetch({id: '2'});
        expect(renderer.toJSON()).toEqual(['Fallback']);
        expect(environment.execute).toBeCalledTimes(1);

        environment.mock.resolve(gqlUserRefetchQuery, {
          data: {
            node: {
              __typename: 'User',
              id: '2',
              name: 'Bob',
            },
          },
        });
        jest.runAllTimers();
        expectToBeRenderedWith(MultiFragmentComponent, {
          user: {id: '2', name: 'Bob'},
          // It continues to render fragment from original fragment reference
          // (before refetch)
          viewer: {actor: {name: 'Zed'}},
        });
        expect(downstreamContext.variables).toEqual({
          id: '2',
        });
        expect(downstreamContext.query.node.name).toEqual('UserRefetchQuery');
        jest.mock('../../utils/fetchQueryUtils');
      });

      it('should suspend and send network request when some refetch data for fragment is missing', () => {
        MultiFragmentComponent.mockClear();
        // This prevents console.error output in the test, which is expected
        jest.spyOn(console, 'error').mockImplementationOnce(() => {});
        jest.unmock('../../utils/fetchQueryUtils');

        renderer = TestRenderer.create(
          // $FlowFixMe
          <React.Suspense fallback="Fallback">
            <RefetchContainerWrapper />
          </React.Suspense>,
        );
        expectToBeRenderedWith(MultiFragmentComponent, {
          user: {id: '1', name: 'Alice'},
          viewer: {actor: {name: 'Zed'}},
        });

        parentQuery = createOperationSelector(gqlParentQuery, {id: '2'});
        environment.commitPayload(parentQuery, {
          node: {
            __typename: 'User',
            id: '2',
          },
          viewer: {
            __typename: 'Viewer',
            actor: {
              __typename: 'User',
              id: '3',
              name: 'Zed',
            },
          },
        });

        MultiFragmentComponent.mockClear();
        refetch({id: '2'});
        expect(renderer.toJSON()).toEqual(['Fallback']);
        expect(environment.execute).toBeCalledTimes(1);

        const userRefetchQuery = createOperationSelector(gqlUserRefetchQuery, {
          id: '2',
        });
        environment.commitPayload(userRefetchQuery, {
          node: {
            __typename: 'User',
            id: '2',
            name: 'Bob',
          },
        });
        environment.mock.resolve(gqlUserRefetchQuery, {
          data: {
            node: {
              __typename: 'User',
              id: '2',
              name: 'Bob',
            },
          },
        });
        jest.runAllTimers();
        expectToBeRenderedWith(MultiFragmentComponent, {
          user: {id: '2', name: 'Bob'},
          // It continues to render fragment from original fragment reference
          // (before refetch)
          viewer: {actor: {name: 'Zed'}},
        });
        expect(downstreamContext.variables).toEqual({
          id: '2',
        });
        expect(downstreamContext.query.node.name).toEqual('UserRefetchQuery');
        jest.mock('../../utils/fetchQueryUtils');
      });

      it('should correctly use the provided fetchPolicy', () => {
        MultiFragmentComponent.mockClear();
        // This prevents console.error output in the test, which is expected
        jest.spyOn(console, 'error').mockImplementationOnce(() => {});
        jest.unmock('../../utils/fetchQueryUtils');

        renderer = TestRenderer.create(
          // $FlowFixMe
          <React.Suspense fallback="Fallback">
            <RefetchContainerWrapper />
          </React.Suspense>,
        );
        expectToBeRenderedWith(MultiFragmentComponent, {
          user: {id: '1', name: 'Alice'},
          viewer: {actor: {name: 'Zed'}},
        });

        const query = createOperationSelector(gqlParentQuery, {id: '2'});
        environment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: '2',
            name: 'Bob',
          },
        });

        MultiFragmentComponent.mockClear();
        refetch({id: '2'}, {fetchPolicy: 'network-only'});
        expect(renderer.toJSON()).toEqual(['Fallback']);
        expect(environment.execute).toBeCalledTimes(1);

        environment.mock.resolve(gqlUserRefetchQuery, {
          data: {
            node: {
              __typename: 'User',
              id: '2',
              name: 'Bob',
            },
          },
        });
        jest.runAllTimers();
        expectToBeRenderedWith(MultiFragmentComponent, {
          user: {id: '2', name: 'Bob'},
          // It continues to render fragment from original fragment reference
          // (before refetch)
          viewer: {actor: {name: 'Zed'}},
        });
        expect(downstreamContext.variables).toEqual({
          id: '2',
        });
        expect(downstreamContext.query.node.name).toEqual('UserRefetchQuery');
        jest.mock('../../utils/fetchQueryUtils');
      });
    });

    describe('when refetchQuery renders multiple fragments', () => {
      beforeEach(() => {
        RefetchContainer = createSuspenseRefetchContainer(
          // $FlowExpectedError - jest.fn type doesn't match React.Component, but its okay to use
          MultiFragmentComponent,
          {
            user: userFragment,
            viewer: viewerFragment,
          },
          gqlParentQuery,
          {
            getFragmentRefsFromResponse: data => ({
              user: data.node,
              viewer: data.viewer,
            }),
          },
        );

        RefetchContainerWrapper = ({
          id,
          value,
        }: {
          id?: string,
          value?: RelayContext,
        }) => (
          // This simulates the parent query being ParentQuery
          <ContextWrapper value={value}>
            <RefetchContainer
              user={{
                [ID_KEY]: id ?? value?.variables.id ?? variables.id,
                [FRAGMENTS_KEY]: {
                  UserFragment: {},
                },
              }}
              viewer={{
                [ID_KEY]: 'client:root:viewer',
                [FRAGMENTS_KEY]: {
                  ViewerFragment: {},
                },
              }}
            />
          </ContextWrapper>
        );

        environment.commitPayload(parentQuery, {
          node: {
            __typename: 'User',
            id: '1',
            name: 'Alice',
          },
          viewer: {
            __typename: 'Viewer',
            actor: {
              __typename: 'User',
              id: '3',
              name: 'Zed',
            },
          },
        });
      });

      it('renders correctly ', () => {
        renderer = TestRenderer.create(<RefetchContainerWrapper />);
        expectToBeRenderedWith(MultiFragmentComponent, {
          user: {id: '1', name: 'Alice'},
          viewer: {actor: {name: 'Zed'}},
        });
      });

      it('refetches the refetchQuery correctly', () => {
        renderer = TestRenderer.create(<RefetchContainerWrapper />);
        expectToBeRenderedWith(MultiFragmentComponent, {
          user: {id: '1', name: 'Alice'},
          viewer: {actor: {name: 'Zed'}},
        });

        // We're just testing the case when the data for refetch is already
        // in the store, so it skips the network request.
        // Fetching + suspending is tested in the section above
        parentQuery = createOperationSelector(gqlParentQuery, {id: '2'});
        environment.commitPayload(parentQuery, {
          node: {
            __typename: 'User',
            id: '2',
            name: 'Bob',
          },
          viewer: {
            __typename: 'Viewer',
            actor: {
              __typename: 'User',
              id: '3',
              name: 'Zed',
            },
          },
        });

        refetch({id: '2'});
        expectToBeRenderedWith(MultiFragmentComponent, {
          // It renderes the new refetched fragments for both fragments
          user: {id: '2', name: 'Bob'},
          viewer: {actor: {name: 'Zed'}},
        });
        expect(downstreamContext.variables).toEqual({
          id: '2',
        });
        expect(downstreamContext.query.node.name).toEqual('ParentQuery');
      });
    });
  });
});

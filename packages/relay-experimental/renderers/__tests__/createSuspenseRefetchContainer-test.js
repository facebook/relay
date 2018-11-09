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

const {createMockEnvironment} = require('RelayModernMockEnvironment');
const {generateAndCompile} = require('RelayModernTestUtils');
const {
  createOperationSelector,
  FRAGMENTS_KEY,
  ID_KEY,
} = require('relay-runtime');

const {getPromiseForRequestInFlight} = require('../../utils/fetchQueryUtils');

import type {RelayContext} from 'relay-runtime';

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
  let fragment;
  let query;
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

        query UserQuery($id: ID!) {
          node(id: $id) {
            ...UserFragment
          }
      }
    `,
    );
    gqlRefetchQuery = generated.UserQuery;
    fragment = generated.UserFragment;
    query = createOperationSelector(gqlRefetchQuery, variables);

    const relayContext = {
      environment,
      query,
      variables,
    };

    ContextWrapper = ({
      children,
      value,
    }: {
      children: React.Node,
      value?: RelayContext,
    }) => (
      <ReactRelayContext.Provider value={value ?? relayContext}>
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

    environment.commitPayload(query, {
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

        query UsersQuery($ids: [ID!]!) {
          nodes(ids: $ids) {
            ... on User {
              ...UsersFragment
            }
          }
      }
    `,
    );
    const usersVariables = {ids: ['1', '2']};
    gqlRefetchQuery = generated.UsersQuery;
    fragment = generated.UsersFragment;
    query = createOperationSelector(gqlRefetchQuery, usersVariables);
    environment.commitPayload(query, {
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

    const relayContext = {
      environment,
      query,
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
      <ContextWrapper value={relayContext}>
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
    query = createOperationSelector(gqlRefetchQuery, nextVariables);
    environment.commitPayload(query, {
      node: {
        __typename: 'User',
        id: '200',
        name: 'Foo',
      },
    });
    renderer
      .getInstance()
      .setProps({value: {environment, variables: {id: '200'}}});
    expectToBeRenderedWith(UserComponent, {user: {id: '200', name: 'Foo'}});

    environment.commitPayload(query, {
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
    query = createOperationSelector(gqlRefetchQuery, nextVariables);
    environment.commitPayload(query, {
      node: {
        __typename: 'User',
        id: '400',
        name: 'Bar',
      },
    });
    renderer.getInstance().setProps({
      value: {environment, query, variables: nextVariables},
    });
    expectToBeRenderedWith(UserComponent, {user: {id: '400', name: 'Bar'}});

    environment.commitPayload(query, {
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

  it('should change data if new data comes in', () => {
    environment.commitPayload(query, {
      node: {
        __typename: 'User',
        id: '1',
        name: 'Alice',
      },
    });
    expectToBeRenderedWith(UserComponent, {user: {id: '1', name: 'Alice'}});
    environment.commitPayload(query, {
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

  it('should throw a promise if data is missing for fragment and request is in flight', () => {
    // This prevents console.error output in the test, which is expected
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});

    (getPromiseForRequestInFlight: any).mockReturnValueOnce(Promise.resolve());

    query = createOperationSelector(gqlRefetchQuery, {
      id: '2',
    });
    environment.commitPayload(query, {
      node: {
        __typename: 'User',
        id: '2',
      },
    });
    expect(() => {
      TestRenderer.create(
        <ContextWrapper value={{environment, variables: {id: '2'}}}>
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
      'RelaySuspenseFragmentContainer(Unknown) suspended while rendering, but no fallback UI was specified.',
    );
  });

  it('should throw an error if data is missing and there are no pending requests', () => {
    // This prevents console.error output in the test, which is expected
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});

    query = createOperationSelector(gqlRefetchQuery, {
      id: '2',
    });
    environment.commitPayload(query, {
      node: {
        __typename: 'User',
        id: '2',
      },
    });
    expect(() => {
      TestRenderer.create(
        <ContextWrapper value={{environment, variables: {id: '2'}}}>
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
      'DataResource: Tried reading a fragment that has ' +
        'missing data and is not being fetched.',
    );
  });

  describe('refetch', () => {
    let userFragment;
    let otherUserFragment;
    let gqlUserQuery;
    let gqlBothUserQuery;
    let bothUserQuery;
    let refetch = (_1, _2) => {};
    const MultiFragmentComponent = jest.fn(props => {
      refetch = props.refetch;
      const {user_f1, user_f2} = props;
      return (
        <div>
          Hey user, {user_f1.name} with id {user_f1.id}!
          <span>Username is: {user_f2.username}</span>
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

        fragment OtherUserFragment on User {
          username
        }

        query UserQuery($id: ID!) {
          node(id: $id) {
            ...UserFragment
          }
        }

        query OtherUserQuery($id: ID!) {
          node(id: $id) {
            ...OtherUserFragment
          }
        }

        query BothUserQuery($id: ID!) {
          node(id: $id) {
            ...UserFragment
            ...OtherUserFragment
          }
        }
    `,
      );
      userFragment = generated.UserFragment;
      otherUserFragment = generated.OtherUserFragment;
      gqlUserQuery = generated.UserQuery;
      gqlBothUserQuery = generated.BothUserQuery;
      bothUserQuery = createOperationSelector(gqlBothUserQuery, variables);

      const relayContext = {
        environment,
        query: bothUserQuery,
        variables,
      };

      ContextWrapper = ({
        children,
        value,
      }: {
        children: React.Node,
        value?: RelayContext,
      }) => (
        <ReactRelayContext.Provider value={value ?? relayContext}>
          {children}
        </ReactRelayContext.Provider>
      );
    });

    describe('when refetchQuery renders single fragment', () => {
      beforeEach(() => {
        RefetchContainer = createSuspenseRefetchContainer(
          // $FlowExpectedError - jest.fn type doesn't match React.Component, but its okay to use
          MultiFragmentComponent,
          {
            user_f1: userFragment,
            user_f2: otherUserFragment,
          },
          gqlUserQuery,
          {
            getFragmentRefsFromResponse: data => ({
              user_f1: data.node,
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
          // This simulates the parent query being BothUserQuery
          <ContextWrapper value={value}>
            <RefetchContainer
              user_f1={{
                [ID_KEY]: id ?? value?.variables.id ?? variables.id,
                [FRAGMENTS_KEY]: {
                  UserFragment: userFragment,
                },
              }}
              user_f2={{
                [ID_KEY]: id ?? value?.variables.id ?? variables.id,
                [FRAGMENTS_KEY]: {
                  OtherUserFragment: otherUserFragment,
                },
              }}
            />
          </ContextWrapper>
        );

        environment.commitPayload(bothUserQuery, {
          node: {
            __typename: 'User',
            id: '1',
            name: 'Alice',
            username: 'alice@wonderland.com',
          },
        });

        renderer = TestRenderer.create(<RefetchContainerWrapper />);
      });

      it('renders correctly ', () => {
        expectToBeRenderedWith(MultiFragmentComponent, {
          user_f1: {id: '1', name: 'Alice'},
          user_f2: {username: 'alice@wonderland.com'},
        });
      });

      it('refetches the refetchQuery correctly', () => {
        expectToBeRenderedWith(MultiFragmentComponent, {
          user_f1: {id: '1', name: 'Alice'},
          user_f2: {username: 'alice@wonderland.com'},
        });

        // We're just testing the case when the data for refetch is already
        // in the store, so it skips the network request.
        // Fetching + suspending is thoroughly tested in createSuspenseQueryRenderer
        query = createOperationSelector(gqlBothUserQuery, {id: '2'});
        environment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: '2',
            name: 'Bob',
            username: 'bob@wonderland.com',
          },
        });

        refetch({id: '2'});
        expectToBeRenderedWith(MultiFragmentComponent, {
          user_f1: {id: '2', name: 'Bob'},

          // It continues to render fragment from original fragment reference
          // (before refetch)
          user_f2: {username: 'alice@wonderland.com'},
        });
      });
    });

    describe('when refetchQuery renders multiple fragments', () => {
      beforeEach(() => {
        RefetchContainer = createSuspenseRefetchContainer(
          // $FlowExpectedError - jest.fn type doesn't match React.Component, but its okay to use
          MultiFragmentComponent,
          {
            user_f1: userFragment,
            user_f2: otherUserFragment,
          },
          gqlBothUserQuery,
          {
            getFragmentRefsFromResponse: data => ({
              user_f1: data.node,
              user_f2: data.node,
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
          // This simulates the parent query being BothUserQuery
          <ContextWrapper value={value}>
            <RefetchContainer
              user_f1={{
                [ID_KEY]: id ?? value?.variables.id ?? variables.id,
                [FRAGMENTS_KEY]: {
                  UserFragment: userFragment,
                },
              }}
              user_f2={{
                [ID_KEY]: id ?? value?.variables.id ?? variables.id,
                [FRAGMENTS_KEY]: {
                  OtherUserFragment: otherUserFragment,
                },
              }}
            />
          </ContextWrapper>
        );

        environment.commitPayload(bothUserQuery, {
          node: {
            __typename: 'User',
            id: '1',
            name: 'Alice',
            username: 'alice@wonderland.com',
          },
        });
        renderer = TestRenderer.create(<RefetchContainerWrapper />);
      });

      it('renders correctly ', () => {
        expectToBeRenderedWith(MultiFragmentComponent, {
          user_f1: {id: '1', name: 'Alice'},
          user_f2: {username: 'alice@wonderland.com'},
        });
      });

      it('refetches the refetchQuery correctly', () => {
        expectToBeRenderedWith(MultiFragmentComponent, {
          user_f1: {id: '1', name: 'Alice'},
          user_f2: {username: 'alice@wonderland.com'},
        });

        // We're just testing the case when the data for refetch is already
        // in the store, so it skips the network request.
        // Fetching + suspending is thoroughly tested in createSuspenseQueryRenderer
        query = createOperationSelector(gqlBothUserQuery, {id: '2'});
        environment.commitPayload(query, {
          node: {
            __typename: 'User',
            id: '2',
            name: 'Bob',
            username: 'bob@wonderland.com',
          },
        });

        refetch({id: '2'});
        expectToBeRenderedWith(MultiFragmentComponent, {
          // It renderes the new refetched fragments for both fragments
          user_f1: {id: '2', name: 'Bob'},
          user_f2: {username: 'bob@wonderland.com'},
        });
      });
    });
  });
});

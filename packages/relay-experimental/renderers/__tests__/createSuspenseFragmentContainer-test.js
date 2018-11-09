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

const createSuspenseFragmentContainer = require('../createSuspenseFragmentContainer');

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

describe('createSuspenseFragmentContainer', () => {
  let environment;
  let gqlQuery;
  let fragment;
  let query;
  let FragmentWrapper;
  let ContextWrapper;
  let FragmentContainer;
  let renderer;
  let expectToBeRenderedWith;

  const variables = {
    id: '1',
  };

  beforeEach(() => {
    UserComponent.mockClear();
    expectToBeRenderedWith = (renderFn, readyState) => {
      expect(renderFn).toBeCalledTimes(1);
      expect(renderFn.mock.calls[0][0]).toEqual({
        ...readyState,
        relay: expect.anything(),
      });
      renderFn.mockClear();
    };

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
    gqlQuery = generated.UserQuery;
    fragment = generated.UserFragment;
    query = createOperationSelector(gqlQuery, variables);

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

    // $FlowExpectedError - jest.fn type doesn't match React.Component, but its okay to use
    FragmentContainer = createSuspenseFragmentContainer(UserComponent, {
      user: fragment,
    });

    FragmentWrapper = ({id, value}: {id?: string, value?: RelayContext}) => (
      <ContextWrapper value={value}>
        <FragmentContainer
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
        <FragmentWrapper />
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
    // $FlowExpectedError - jest.fn type doesn't match React.Component, but its okay to use
    const Container = createSuspenseFragmentContainer(UserWithFoo, {
      user: fragment,
    });
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
    gqlQuery = generated.UsersQuery;
    fragment = generated.UsersFragment;
    query = createOperationSelector(gqlQuery, usersVariables);
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
      variables,
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
    // $FlowExpectedError - jest.fn type doesn't match React.Component, but its okay to use
    const Container = createSuspenseFragmentContainer(Users, {
      users: fragment,
    });
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
    const Container = createSuspenseFragmentContainer(UserClassComponent, {
      user: fragment,
    });
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
    query = createOperationSelector(gqlQuery, {id: '200'});
    environment.commitPayload(query, {
      node: {
        __typename: 'User',
        id: '200',
        name: 'Foo',
      },
    });
    renderer.getInstance().setProps({id: '200'});
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
    query = createOperationSelector(gqlQuery, nextVariables);
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

    query = createOperationSelector(gqlQuery, {
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
        <ContextWrapper>
          <FragmentContainer
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
      /RelaySuspenseFragmentContainer\(.+?\) suspended while rendering, but no fallback UI was specified\./,
    );
  });

  it('should throw an error if data is missing and there are no pending requests', () => {
    // This prevents console.error output in the test, which is expected
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});

    query = createOperationSelector(gqlQuery, {
      id: '2',
    });

    // Commit a payload where name is missing.
    environment.commitPayload(query, {
      node: {
        __typename: 'User',
        id: '2',
      },
    });
    expect(() => {
      TestRenderer.create(
        <ContextWrapper>
          <FragmentContainer
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
});

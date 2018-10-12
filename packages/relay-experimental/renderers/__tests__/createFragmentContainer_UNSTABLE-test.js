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

jest.mock('../../helpers/fetchQuery_UNSTABLE');

const React = require('React');
const ReactRelayContext = require('react-relay/modern/ReactRelayContext');
const TestRenderer = require('ReactTestRenderer');

const createFragmentContainer_UNSTABLE = require('../createFragmentContainer_UNSTABLE');

const {createMockEnvironment} = require('RelayModernMockEnvironment');
const {generateAndCompile} = require('RelayModernTestUtils');
const {
  createOperationSelector,
  FRAGMENTS_KEY,
  ID_KEY,
} = require('relay-runtime');

const {
  getPromiseForRequestInFlight_UNSTABLE,
} = require('../../helpers/fetchQuery_UNSTABLE');

const UserComponent = jest.fn(({user}) => (
  <div>
    Hey user, {user.name} with id {user.id}!
  </div>
));

describe('createFragmentContainer', () => {
  let environment;
  let query;
  let fragment;
  let operationSelector;
  let ContextWrapper;
  let FragmentContainer;
  let renderer;

  const variables = {
    id: '1',
  };

  beforeEach(() => {
    UserComponent.mockClear();
    expect.extend({
      toBeRenderedWith(renderFn, readyState) {
        expect(renderFn).toBeCalledTimes(1);
        expect(renderFn.mock.calls[0][0]).toEqual({
          ...readyState,
          relay: expect.anything(),
        });
        renderFn.mockClear();
        return {pass: true};
      },
    });

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
    query = generated.UserQuery;
    fragment = generated.UserFragment;
    operationSelector = createOperationSelector(query, variables);

    const relayContext = {
      environment,
      query,
      variables,
    };

    ContextWrapper = ({children}) => (
      <ReactRelayContext.Provider value={relayContext}>
        {children}
      </ReactRelayContext.Provider>
    );

    // $FlowExpectedError - jest.fn type doesn't match React.Component, but its okay to use
    FragmentContainer = createFragmentContainer_UNSTABLE(UserComponent, {
      user: fragment,
    });

    environment.commitPayload(operationSelector, {
      node: {
        __typename: 'User',
        id: '1',
        name: 'Alice',
      },
    });

    renderer = TestRenderer.create(
      <ContextWrapper>
        <FragmentContainer
          user={{
            [ID_KEY]: variables.id,
            [FRAGMENTS_KEY]: {
              UserFragment: fragment,
            },
          }}
        />
      </ContextWrapper>,
    );
  });

  it('should create fragment container and render without error', () => {
    expect(UserComponent).toBeRenderedWith({user: {id: '1', name: 'Alice'}});
  });

  it('should create fragment container and render without error when extra props included', () => {
    const UserWithFoo = jest.fn(({user, foo}) => (
      <div>
        Hey user, {user.name} with id {user.id} and {foo}!
      </div>
    ));
    // $FlowExpectedError - jest.fn type doesn't match React.Component, but its okay to use
    const Container = createFragmentContainer_UNSTABLE(UserWithFoo, {
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
    expect(UserWithFoo).toBeRenderedWith({
      user: {id: '1', name: 'Alice'},
      foo: 'bar',
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
    const Container = createFragmentContainer_UNSTABLE(UserClassComponent, {
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

  it('should change data if new data comes in', () => {
    environment.commitPayload(operationSelector, {
      node: {
        __typename: 'User',
        id: '1',
        name: 'Alice',
      },
    });
    expect(UserComponent).toBeRenderedWith({user: {id: '1', name: 'Alice'}});
    environment.commitPayload(operationSelector, {
      node: {
        __typename: 'User',
        id: '1',
        name: 'Alice in Wonderland',
      },
    });
    expect(UserComponent).toBeRenderedWith({
      user: {id: '1', name: 'Alice in Wonderland'},
    });
  });

  it('should throw a promise if data is missing for fragment and request is in flight', () => {
    // This prevents console.error output in the test, which is expected
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});

    (getPromiseForRequestInFlight_UNSTABLE: any).mockReturnValueOnce(
      Promise.resolve(),
    );

    operationSelector = createOperationSelector(query, {
      id: '2',
    });
    environment.commitPayload(operationSelector, {
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
    }).toThrow('An update was suspended, but no placeholder UI was provided.');
  });

  it('should throw an error if data is missing and there are no pending requests', () => {
    // This prevents console.error output in the test, which is expected
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});

    operationSelector = createOperationSelector(query, {
      id: '2',
    });
    environment.commitPayload(operationSelector, {
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
      'DataResourceCache_UNSTABLE: Tried reading a fragment that is not ' +
        'available locally and is not being fetched',
    );
  });
});

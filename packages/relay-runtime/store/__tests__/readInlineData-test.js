/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall relay
 */

'use strict';

const {getRequest, graphql} = require('../../query/GraphQLTag');
const {getSelector} = require('../../store/RelayModernSelector');
const readInlineData = require('../readInlineData');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {createMockEnvironment} = require('relay-test-utils-internal');
const {
  disallowConsoleErrors,
  disallowWarnings,
} = require('relay-test-utils-internal');

disallowConsoleErrors();
disallowWarnings();

const UserQuery = graphql`
  query readInlineDataTestUserQuery($id: ID!) {
    node(id: $id) {
      ...readInlineDataTestUserFragment @dangerously_unaliased_fixme # @arguments(cond: true)
    }
    # with_name: node(id: $id) {
    #   id
    #   ...UserFragment @arguments(cond: true)
    # }
    # without_name: node(id: $id) {
    #   ...UserFragment @arguments(cond: false)
    # }
  }
`;

const UserFragment = graphql`
  fragment readInlineDataTestUserFragment on User @inline {
    # @argumentDefinitions(cond: { type: "Boolean!", defaultValue: true })
    id
    name # @include(if: $cond)
  }
`;

test('unwrap inline fragment data', () => {
  const userRef = {
    __fragments: {
      readInlineDataTestUserFragment: {
        id: '67',
        name: 'John',
      },
    },
  };
  expect(readInlineData(UserFragment, userRef)).toEqual({
    name: 'John',
    id: '67',
  });
});

describe('integration test with variables', () => {
  test('works with nested fragments', () => {
    const Parent = graphql`
      query readInlineDataTestNestedQueryVariablesParentQuery($scale: Float) {
        me {
          ...readInlineDataTestNestedQueryVariablesChild
        }
      }
    `;

    const Child = graphql`
      fragment readInlineDataTestNestedQueryVariablesChild on User {
        ...readInlineDataTestNestedQueryVariablesGrandchild
      }
    `;

    const Grandchild = graphql`
      fragment readInlineDataTestNestedQueryVariablesGrandchild on User
      @inline {
        profile_picture(scale: $scale) {
          uri
        }
      }
    `;

    const variables = {
      scale: 2,
    };

    const environment = createMockEnvironment();
    environment.commitPayload(createOperationDescriptor(Parent, variables), {
      me: {
        id: '7',
        __typename: 'User',
        profile_picture: {
          uri: 'some_url',
        },
      },
    });

    const request = getRequest(Parent);
    const operation = createOperationDescriptor(request, variables);
    const {
      data: {me: parent},
    } = environment.lookup(operation.fragment, operation);

    const {data: childData} = environment.lookup(getSelector(Child, parent));

    const grandchild = readInlineData(Grandchild, childData);

    expect(grandchild).toEqual({
      profile_picture: {
        uri: 'some_url',
      },
    });
  });

  test('works with fragment variables & query variables & default variables', () => {
    const Fragment = graphql`
      fragment readInlineDataTestFragmentAndQueryVariables on User
      @inline
      @argumentDefinitions(
        theScale: {type: "Float"}
        defaultScale: {type: "Float", defaultValue: 3}
      ) {
        fragmentVariable: profile_picture(scale: $theScale) {
          uri
        }
        queryVariable: profile_picture(scale: $scale1) {
          uri
        }
        defaultVariable: profile_picture(scale: $defaultScale) {
          uri
        }
      }
    `;

    const Query = graphql`
      query readInlineDataTestFragmentAndQueryVariablesQuery(
        $scale1: Float
        $scale2: Float
      ) {
        me {
          ...readInlineDataTestFragmentAndQueryVariables
            @arguments(theScale: $scale2)
        }
      }
    `;

    const variables = {
      scale1: 1,
      scale2: 2,
    };

    const environment = createMockEnvironment();
    environment.commitPayload(createOperationDescriptor(Query, variables), {
      me: {
        id: '7',
        __typename: 'User',
        fragmentVariable: {
          uri: 'fragment_url',
        },
        queryVariable: {
          uri: 'query_url',
        },
        defaultVariable: {
          uri: 'default_url',
        },
      },
    });

    const request = getRequest(Query);
    const operation = createOperationDescriptor(request, variables);
    const snapshot = environment.lookup(operation.fragment, operation);

    expect(readInlineData(Fragment, snapshot.data.me)).toEqual({
      fragmentVariable: {
        uri: 'fragment_url',
      },
      queryVariable: {
        uri: 'query_url',
      },
      defaultVariable: {
        uri: 'default_url',
      },
    });
  });

  test('works with fragment variables', () => {
    const Fragment = graphql`
      fragment readInlineDataTestFragmentVariables on User
      @inline
      @argumentDefinitions(theScale: {type: "Float"}) {
        profile_picture(scale: $theScale) {
          uri
        }
      }
    `;

    const Query = graphql`
      query readInlineDataTestFragmentVariablesQuery($scale: Float) {
        me {
          ...readInlineDataTestFragmentVariables @arguments(theScale: $scale)
        }
      }
    `;

    const variables = {
      scale: 2,
    };

    const environment = createMockEnvironment();
    environment.commitPayload(createOperationDescriptor(Query, variables), {
      me: {
        id: '7',
        __typename: 'User',
        profile_picture: {
          uri: 'some_url',
        },
      },
    });

    const request = getRequest(Query);
    const operation = createOperationDescriptor(request, variables);
    const snapshot = environment.lookup(operation.fragment, operation);

    expect(readInlineData(Fragment, snapshot.data.me)).toEqual({
      profile_picture: {
        uri: 'some_url',
      },
    });
  });

  test('works with query variables', () => {
    const Fragment = graphql`
      fragment readInlineDataTestQueryVariables on User @inline {
        profile_picture(scale: $scale) {
          uri
        }
      }
    `;

    const Query = graphql`
      query readInlineDataTestQueryVariablesQuery($scale: Float) {
        me {
          ...readInlineDataTestQueryVariables
        }
      }
    `;

    const variables = {
      scale: 2,
    };

    const environment = createMockEnvironment();
    environment.commitPayload(createOperationDescriptor(Query, variables), {
      me: {
        id: '7',
        __typename: 'User',
        profile_picture: {
          uri: 'some_url',
        },
      },
    });

    const request = getRequest(Query);
    const operation = createOperationDescriptor(request, variables);
    const snapshot = environment.lookup(operation.fragment, operation);

    expect(readInlineData(Fragment, snapshot.data.me)).toEqual({
      profile_picture: {
        uri: 'some_url',
      },
    });
  });
});

describe('integration test with reader', () => {
  const environment = createMockEnvironment();
  environment.commitPayload(createOperationDescriptor(UserQuery, {id: '7'}), {
    node: {
      id: '7',
      __typename: 'User',
      name: 'Alice',
    },
  });

  const variables = {
    id: '7',
  };
  const request = getRequest(UserQuery);
  const operation = createOperationDescriptor(request, variables);
  const snapshot = environment.lookup(operation.fragment, operation);

  test('no public keys on parent object', () => {
    expect(Object.keys(snapshot.data.node)).toEqual(['__fragments', '__id']);
  });

  test('returns null for null fragment ref', () => {
    expect(readInlineData(UserFragment, null)).toBe(null);
  });

  test('returns undefined for undefined fragment ref', () => {
    expect(readInlineData(UserFragment, undefined)).toBe(undefined);
  });

  test('uses default argument definitions', () => {
    expect(readInlineData(UserFragment, snapshot.data.node)).toEqual({
      id: '7',
      name: 'Alice',
    });
  });

  // TODO: these tests should be enabled once variable support is added to
  // @inline

  // test('argument definition to include conditional', () => {
  //   expect(readInlineData(UserFragment, snapshot.data.with_name)).toEqual({
  //     id: '7',
  //     name: 'Alice',
  //   });
  // });
  //
  // test('argument definition to exclude conditional', () => {
  //   expect(readInlineData(UserFragment, snapshot.data.without_name)).toEqual({
  //     id: '7',
  //     // no `name` key
  //   });
  // });
});

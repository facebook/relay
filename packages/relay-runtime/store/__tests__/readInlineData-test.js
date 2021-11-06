/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

const {getRequest, graphql} = require('../../query/GraphQLTag');
const readInlineData = require('../readInlineData');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {createMockEnvironment} = require('relay-test-utils-internal');

const UserQuery = graphql`
  query readInlineDataTestUserQuery($id: ID!) {
    node(id: $id) {
      ...readInlineDataTestUserFragment # @arguments(cond: true)
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

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

const getFragmentIdentifier = require('../getFragmentIdentifier');

const {createOperationDescriptor, getFragment} = require('relay-runtime');
const {
  createMockEnvironment,
  generateAndCompile,
} = require('relay-test-utils-internal');

describe('getFragmentIdentifier', () => {
  let environment;
  let gqlSingularQuery;
  let gqlSingularFragment;
  let gqlPluralQuery;
  let gqlPluralFragment;
  let gqlQueryWithArgs;
  let gqlFragmentWithArgs;
  let singularFragment;
  let singularVariables;
  let singularQuery;
  let pluralQuery;
  let pluralFragment;
  let queryWithArgs;
  let fragmentWithArgs;
  let pluralVariables;

  beforeEach(() => {
    environment = createMockEnvironment();
    const generated = generateAndCompile(
      `
      fragment NestedUserFragment on User {
        username
      }

      fragment UserFragment on User  {
        id
        name
        profile_picture(scale: $scale) {
          uri
        }
        ...NestedUserFragment
      }

      fragment UserFragmentWithArgs on User
      @argumentDefinitions(scaleLocal: {type: "Float!"}) {
        id
        name
        profile_picture(scale: $scaleLocal) {
          uri
        }
        ...NestedUserFragment
      }

      fragment UsersFragment on User @relay(plural: true) {
        id
        name
        profile_picture(scale: $scale) {
          uri
        }
        ...NestedUserFragment
      }

      query UsersQuery($ids: [ID!]!, $scale: Float!) {
        nodes(ids: $ids) {
          ...UsersFragment
        }
      }

      query UserQuery($id: ID!, $scale: Float!) {
        node(id: $id) {
          ...UserFragment
        }
      }

      query UserQueryWithArgs($id: ID!, $scale: Float!) {
        node(id: $id) {
          ...UserFragmentWithArgs @arguments(scaleLocal: $scale)
        }
      }
    `,
    );
    pluralVariables = {ids: ['1'], scale: 16};
    singularVariables = {id: '1', scale: 16};
    gqlQueryWithArgs = generated.UserQueryWithArgs;
    gqlFragmentWithArgs = generated.UserFragmentWithArgs;
    gqlPluralQuery = generated.UsersQuery;
    gqlPluralFragment = generated.UsersFragment;
    gqlSingularQuery = generated.UserQuery;
    gqlSingularFragment = generated.UserFragment;
    pluralQuery = createOperationDescriptor(gqlPluralQuery, pluralVariables);
    singularQuery = singularQuery = createOperationDescriptor(
      gqlSingularQuery,
      singularVariables,
    );
    queryWithArgs = createOperationDescriptor(
      gqlQueryWithArgs,
      singularVariables,
    );
    singularFragment = getFragment(gqlSingularFragment);
    pluralFragment = getFragment(gqlPluralFragment);
    fragmentWithArgs = getFragment(gqlFragmentWithArgs);
    environment.commitPayload(singularQuery, {
      node: {
        __typename: 'User',
        id: '1',
        name: 'Alice',
        username: 'useralice',
        profile_picture: null,
      },
    });
    environment.commitPayload(pluralQuery, {
      nodes: [
        {
          __typename: 'User',
          id: '1',
          name: 'Alice',
          username: 'useralice',
          profile_picture: null,
        },
      ],
    });
  });

  it('returns correct identifier when fragment ref is null', () => {
    const identifier = getFragmentIdentifier(singularFragment, null);
    expect(identifier).toEqual(
      'UserFragment-{"dataIDs":null,"fragmentOwnerID":"","fragmentOwnerVariables":null,"fragmentVariables":{}}',
    );
  });

  it('returns correct identifier when using plural fragment and fragment ref is empty', () => {
    const identifier = getFragmentIdentifier(pluralFragment, []);
    expect(identifier).toEqual(
      'UsersFragment-{"dataIDs":null,"fragmentOwnerID":[],"fragmentOwnerVariables":[],"fragmentVariables":{}}',
    );
  });

  it('returns correct identifier when using singular fragment', () => {
    const fragmentRef = environment.lookup(
      singularQuery.fragment,
      singularQuery,
    ).data?.node;
    const identifier = getFragmentIdentifier(singularFragment, fragmentRef);
    expect(identifier).toEqual(
      'UserFragment-{"dataIDs":"1","fragmentOwnerID":"UserQuery","fragmentOwnerVariables":{"id":"1","scale":16},"fragmentVariables":{"scale":16}}',
    );
  });

  it('returns correct identifier when using fragment with variables', () => {
    const fragmentRef = environment.lookup(
      queryWithArgs.fragment,
      queryWithArgs,
    ).data?.node;
    const identifier = getFragmentIdentifier(fragmentWithArgs, fragmentRef);
    expect(identifier).toEqual(
      'UserFragmentWithArgs-{"dataIDs":"1","fragmentOwnerID":"UserQueryWithArgs","fragmentOwnerVariables":{"id":"1","scale":16},"fragmentVariables":{"scaleLocal":16}}',
    );
  });

  it('returns correct identifier when using plural fragment', () => {
    const fragmentRef = environment.lookup(pluralQuery.fragment, pluralQuery)
      .data?.nodes;
    const identifier = getFragmentIdentifier(pluralFragment, fragmentRef);
    expect(identifier).toEqual(
      'UsersFragment-{"dataIDs":["1"],"fragmentOwnerID":["UsersQuery"],"fragmentOwnerVariables":[{"ids":["1"],"scale":16}],"fragmentVariables":{"scale":16}}',
    );
  });
});

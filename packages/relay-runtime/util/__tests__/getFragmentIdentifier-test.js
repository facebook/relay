/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';
const {getFragment, getRequest, graphql} = require('../../query/GraphQLTag');
const getFragmentIdentifier = require('../getFragmentIdentifier');
const RelayFeatureFlags = require('../RelayFeatureFlags');
const invariant = require('invariant');
const {createOperationDescriptor} = require('relay-runtime');
const {createMockEnvironment} = require('relay-test-utils-internal');

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
    RelayFeatureFlags.ENABLE_GETFRAGMENTIDENTIFIER_OPTIMIZATION = false;
    environment = createMockEnvironment();
    graphql`
      fragment getFragmentIdentifierTestNestedUserFragment on User {
        username
      }
    `;
    gqlSingularFragment = getFragment(graphql`
      fragment getFragmentIdentifierTestUserFragment on User {
        id
        name
        profile_picture(scale: $scale) {
          uri
        }
        ...getFragmentIdentifierTestNestedUserFragment
      }
    `);
    gqlFragmentWithArgs = getFragment(graphql`
      fragment getFragmentIdentifierTestUserFragmentWithArgs on User
      @argumentDefinitions(scaleLocal: {type: "Float!"}) {
        id
        name
        profile_picture(scale: $scaleLocal) {
          uri
        }
        ...getFragmentIdentifierTestNestedUserFragment
      }
    `);
    gqlPluralFragment = getFragment(graphql`
      fragment getFragmentIdentifierTestUsersFragment on User
      @relay(plural: true) {
        id
        name
        profile_picture(scale: $scale) {
          uri
        }
        ...getFragmentIdentifierTestNestedUserFragment
      }
    `);
    gqlPluralQuery = getRequest(graphql`
      query getFragmentIdentifierTestUsersQuery($ids: [ID!]!, $scale: Float!) {
        nodes(ids: $ids) {
          ...getFragmentIdentifierTestUsersFragment
        }
      }
    `);
    gqlSingularQuery = getRequest(graphql`
      query getFragmentIdentifierTestUserQuery($id: ID!, $scale: Float!) {
        node(id: $id) {
          ...getFragmentIdentifierTestUserFragment
        }
      }
    `);
    gqlQueryWithArgs = getRequest(graphql`
      query getFragmentIdentifierTestUserQueryWithArgsQuery(
        $id: ID!
        $scale: Float!
      ) {
        node(id: $id) {
          ...getFragmentIdentifierTestUserFragmentWithArgs
            @arguments(scaleLocal: $scale)
        }
      }
    `);
    pluralVariables = {ids: ['1'], scale: 16};
    singularVariables = {id: '1', scale: 16};

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
        {
          __typename: 'User',
          id: '2',
          name: 'Bob',
          username: 'userbob',
          profile_picture: null,
        },
      ],
    });
  });

  it('returns correct identifier when fragment ref is null', () => {
    const identifier = getFragmentIdentifier(singularFragment, null);
    expect(identifier).toEqual(
      'null/getFragmentIdentifierTestUserFragment/{}/null',
    );
  });

  it('returns correct identifier when using plural fragment and fragment ref is empty', () => {
    const identifier = getFragmentIdentifier(pluralFragment, []);
    expect(identifier).toEqual(
      'null/getFragmentIdentifierTestUsersFragment/{}/null',
    );
  });

  it('returns correct identifier when using singular fragment', () => {
    const fragmentRef = environment.lookup(singularQuery.fragment).data?.node;
    const identifier = getFragmentIdentifier(singularFragment, fragmentRef);
    expect(identifier).toEqual(
      singularQuery.request.identifier +
        '/getFragmentIdentifierTestUserFragment/{"scale":16}/"1"',
    );
  });

  it('returns correct identifier when using fragment with variables', () => {
    const fragmentRef = environment.lookup(queryWithArgs.fragment).data?.node;
    const identifier = getFragmentIdentifier(fragmentWithArgs, fragmentRef);
    expect(identifier).toEqual(
      queryWithArgs.request.identifier +
        '/getFragmentIdentifierTestUserFragmentWithArgs/{"scaleLocal":16}/"1"',
    );
  });

  it('returns correct identifier when using plural fragment with single element', () => {
    const fragmentRef = environment.lookup(pluralQuery.fragment).data?.nodes;
    invariant(Array.isArray(fragmentRef), 'Expected a plural fragment ref.');
    const identifier = getFragmentIdentifier(pluralFragment, [fragmentRef[0]]);
    expect(identifier).toEqual(
      '[' +
        pluralQuery.request.identifier +
        ']/getFragmentIdentifierTestUsersFragment/{"scale":16}/["1"]',
    );
  });

  it('returns correct identifier when using plural fragment', () => {
    const fragmentRef = environment.lookup(pluralQuery.fragment).data?.nodes;
    const identifier = getFragmentIdentifier(pluralFragment, fragmentRef);
    expect(identifier).toEqual(
      '[' +
        pluralQuery.request.identifier +
        ',' +
        pluralQuery.request.identifier +
        ']/getFragmentIdentifierTestUsersFragment/{"scale":16}/["1","2"]',
    );
  });
});

describe('getFragmentIdentifier Optimized', () => {
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
    RelayFeatureFlags.ENABLE_GETFRAGMENTIDENTIFIER_OPTIMIZATION = true;
    environment = createMockEnvironment();
    graphql`
      fragment getFragmentIdentifierTest1NestedUserFragment on User {
        username
      }
    `;

    gqlSingularFragment = getFragment(graphql`
      fragment getFragmentIdentifierTest1UserFragment on User {
        id
        name
        profile_picture(scale: $scale) {
          uri
        }
        ...getFragmentIdentifierTest1NestedUserFragment
      }
    `);

    gqlFragmentWithArgs = getFragment(graphql`
      fragment getFragmentIdentifierTest1UserFragmentWithArgs on User
      @argumentDefinitions(scaleLocal: {type: "Float!"}) {
        id
        name
        profile_picture(scale: $scaleLocal) {
          uri
        }
        ...getFragmentIdentifierTest1NestedUserFragment
      }
    `);
    gqlPluralFragment = getFragment(graphql`
      fragment getFragmentIdentifierTest1UsersFragment on User
      @relay(plural: true) {
        id
        name
        profile_picture(scale: $scale) {
          uri
        }
        ...getFragmentIdentifierTest1NestedUserFragment
      }
    `);

    gqlPluralQuery = getRequest(graphql`
      query getFragmentIdentifierTest1UsersQuery($ids: [ID!]!, $scale: Float!) {
        nodes(ids: $ids) {
          ...getFragmentIdentifierTest1UsersFragment
        }
      }
    `);

    gqlSingularQuery = getRequest(graphql`
      query getFragmentIdentifierTest1UserQuery($id: ID!, $scale: Float!) {
        node(id: $id) {
          ...getFragmentIdentifierTest1UserFragment
        }
      }
    `);

    gqlQueryWithArgs = getRequest(graphql`
      query getFragmentIdentifierTest1UserQueryWithArgsQuery(
        $id: ID!
        $scale: Float!
      ) {
        node(id: $id) {
          ...getFragmentIdentifierTest1UserFragmentWithArgs
            @arguments(scaleLocal: $scale)
        }
      }
    `);
    pluralVariables = {ids: ['1'], scale: 16};
    singularVariables = {id: '1', scale: 16};

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
        {
          __typename: 'User',
          id: '2',
          name: 'Bob',
          username: 'userbob',
          profile_picture: null,
        },
      ],
    });
  });

  afterEach(() => {
    RelayFeatureFlags.ENABLE_VARIABLE_CONNECTION_KEY = false;
  });

  it('returns correct identifier when fragment ref is undefined', () => {
    const identifier = getFragmentIdentifier(singularFragment, undefined);
    expect(identifier).toEqual(
      'null/getFragmentIdentifierTest1UserFragment/{}/missing',
    );
  });

  it('returns correct identifier when fragment ref is null', () => {
    const identifier = getFragmentIdentifier(singularFragment, null);
    expect(identifier).toEqual(
      'null/getFragmentIdentifierTest1UserFragment/{}/null',
    );
  });

  it('returns correct identifier when using plural fragment and fragment ref is empty', () => {
    const identifier = getFragmentIdentifier(pluralFragment, []);
    expect(identifier).toEqual(
      'null/getFragmentIdentifierTest1UsersFragment/{}/null',
    );
  });

  it('returns correct identifier when using singular fragment', () => {
    const fragmentRef = environment.lookup(singularQuery.fragment).data?.node;
    const identifier = getFragmentIdentifier(singularFragment, fragmentRef);
    expect(identifier).toEqual(
      singularQuery.request.identifier +
        '/getFragmentIdentifierTest1UserFragment/{"scale":16}/1',
    );
  });

  it('returns correct identifier when using fragment with variables', () => {
    const fragmentRef = environment.lookup(queryWithArgs.fragment).data?.node;
    const identifier = getFragmentIdentifier(fragmentWithArgs, fragmentRef);
    expect(identifier).toEqual(
      queryWithArgs.request.identifier +
        '/getFragmentIdentifierTest1UserFragmentWithArgs/{"scaleLocal":16}/1',
    );
  });

  it('returns correct identifier when using plural fragment with single element', () => {
    const fragmentRef = environment.lookup(pluralQuery.fragment).data?.nodes;
    invariant(Array.isArray(fragmentRef), 'Expected a plural fragment ref.');
    const identifier = getFragmentIdentifier(pluralFragment, [fragmentRef[0]]);
    expect(identifier).toEqual(
      '[' +
        pluralQuery.request.identifier +
        ']/getFragmentIdentifierTest1UsersFragment/{"scale":16}/[1]',
    );
  });

  it('returns correct identifier when using plural fragment', () => {
    const fragmentRef = environment.lookup(pluralQuery.fragment).data?.nodes;
    const identifier = getFragmentIdentifier(pluralFragment, fragmentRef);
    expect(identifier).toEqual(
      '[' +
        pluralQuery.request.identifier +
        ',' +
        pluralQuery.request.identifier +
        ']/getFragmentIdentifierTest1UsersFragment/{"scale":16}/[1,2]',
    );
  });
});

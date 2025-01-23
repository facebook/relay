/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';
const {
  getFragmentResourceForEnvironment,
} = require('react-relay/relay-hooks/legacy/FragmentResource');
const {
  getQueryResourceForEnvironment,
} = require('react-relay/relay-hooks/QueryResource');
const {
  __internal: {fetchQuery},
  getFragment,
} = require('relay-runtime');
const {graphql} = require('relay-runtime/query/GraphQLTag');
const {
  createOperationDescriptor,
} = require('relay-runtime/store/RelayModernOperationDescriptor');
const {
  disallowConsoleErrors,
  disallowWarnings,
} = require('relay-test-utils-internal');

disallowWarnings();
disallowConsoleErrors();

const FRAGMENT_1 = graphql`
  fragment QueryResourceClientEdgesTestUser1Fragment on User {
    actorCount
  }
`;

const FRAGMENT_2 = graphql`
  fragment QueryResourceClientEdgesTestUser2Fragment on User {
    alternate_name
  }
`;

const QUERY_WITH_TWO_FRAGMENTS_BENEANTH_CLIENT_EDGE = graphql`
  query QueryResourceClientEdgesTest2Query {
    me {
      client_edge @waterfall {
        ...QueryResourceClientEdgesTestUser1Fragment
        ...QueryResourceClientEdgesTestUser2Fragment
      }
    }
  }
`;

describe('QueryResource Client Edges behavior', () => {
  let createMockEnvironment;
  let environment;
  let QueryResource;
  let FragmentResource;
  let query;

  beforeEach(() => {
    ({createMockEnvironment} = require('relay-test-utils-internal'));
    environment = createMockEnvironment();
    QueryResource = getQueryResourceForEnvironment(environment);
    FragmentResource = getFragmentResourceForEnvironment(environment);
    query = createOperationDescriptor(
      QUERY_WITH_TWO_FRAGMENTS_BENEANTH_CLIENT_EDGE,
      {},
    );
    environment.commitPayload(query, {
      me: {
        __typename: 'User',
        id: '1',
        name: 'Alice',
      },
    });
  });

  it('Only issues one operation when multiple fragments are under a client edge', async () => {
    // Simulate rendering the query; we expect a single operation for the client edge to be
    // issued. Ideally it would only be issued once sub-components whose fragments access
    // data on the client edge are rendered, but this isn't implemented because it is more
    // complicated and the advantage isn't very clear. If we did switch to that behavior,
    // we would see that there are no operations issued up until the two sub-fragments are
    // read, and check that it's only a single operation at that point and not two.
    const fetchObservable = fetchQuery(environment, query);
    expect(environment.mock.getAllOperations().length).toBe(0);
    const {fragmentNode, fragmentRef} = QueryResource.prepare(
      query,
      fetchObservable,
    );
    let thrown0 = null;
    try {
      FragmentResource.read(fragmentNode, fragmentRef, 'componentDisplayName');
    } catch (p) {
      expect(p).toBeInstanceOf(Promise);
      thrown0 = p;
    }
    expect(environment.mock.getAllOperations().length).toBe(1);
    const operation = environment.mock.findOperation(
      op =>
        op.fragment.node.name ===
        'ClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge',
    );
    environment.mock.resolve(operation, {
      data: {
        node: {
          id: '1337',
          __typename: 'User',
          name: 'Bob',
          actorCount: 123,
          alternate_name: 'Robert',
        },
      },
    });
    await expect(thrown0).resolves.not.toThrow();

    // Render again now that the data is available; this time also render the
    // child fragments. Check that no further operations are issued.
    const {fragmentNode: newFragmentNode, fragmentRef: newFragmentRef} =
      QueryResource.prepare(query, fetchObservable);
    const result = FragmentResource.read(
      newFragmentNode,
      newFragmentRef,
      'componentDisplayName',
    );
    // $FlowFixMe[unclear-type] - read() doesn't have the nice types of reading a fragment through the actual APIs:
    const {me}: any = result.data;
    const clientEdgeFragmentRef = me.client_edge;
    expect(environment.mock.getAllOperations().length).toBe(0);

    FragmentResource.read(
      getFragment(FRAGMENT_1),
      clientEdgeFragmentRef,
      'componentDisplayName',
    );
    expect(environment.mock.getAllOperations().length).toBe(0);

    FragmentResource.read(
      getFragment(FRAGMENT_2),
      clientEdgeFragmentRef,
      'componentDisplayName',
    );
    expect(environment.mock.getAllOperations().length).toBe(0);
  });
});

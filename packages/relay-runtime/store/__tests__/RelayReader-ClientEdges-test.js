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

const nullthrows = require('nullthrows');
const {getFragment, graphql} = require('relay-runtime/query/GraphQLTag');
const {
  LiveResolverCache,
} = require('relay-runtime/store/live-resolvers/LiveResolverCache');
const {
  createOperationDescriptor,
} = require('relay-runtime/store/RelayModernOperationDescriptor');
const {
  getSingularSelector,
} = require('relay-runtime/store/RelayModernSelector');
const RelayStore = require('relay-runtime/store/RelayModernStore');
const {read} = require('relay-runtime/store/RelayReader');
const RelayRecordSource = require('relay-runtime/store/RelayRecordSource');
const {
  RELAY_READ_TIME_RESOLVER_KEY_PREFIX,
} = require('relay-runtime/store/RelayStoreUtils');
const {
  disallowConsoleErrors,
  disallowWarnings,
} = require('relay-test-utils-internal');

disallowConsoleErrors();
disallowWarnings();

const BASIC_QUERY = graphql`
  query RelayReaderClientEdgesTest1Query {
    me {
      client_edge @waterfall {
        name
      }
    }
  }
`;

const QUERY_WITH_ALIAS = graphql`
  query RelayReaderClientEdgesTest6Query {
    me {
      the_alias: client_edge @waterfall {
        name
      }
    }
  }
`;

const LINKED_FIELD_WITHIN_CLIENT_EDGE_QUERY = graphql`
  query RelayReaderClientEdgesTest2Query {
    me {
      client_edge @waterfall {
        author {
          name
        }
      }
    }
  }
`;

const FRAGMENT_ON_USER = graphql`
  fragment RelayReaderClientEdgesTestFragmentOnUser on User {
    name
  }
`;

// It's important for this test that the selections under client_edge
// consist ONLY of the fragment spread, because this tests that the
// traversal path is shared between the two calls to read().
const FRAGMENT_SPREAD_WITHIN_CLIENT_EDGE_QUERY = graphql`
  query RelayReaderClientEdgesTest3Query {
    me {
      client_edge @waterfall {
        ...RelayReaderClientEdgesTestFragmentOnUser
      }
    }
  }
`;

const NESTED_CLIENT_EDGE_QUERY = graphql`
  query RelayReaderClientEdgesTest4Query {
    me {
      client_edge @waterfall {
        another_client_edge @waterfall {
          name
        }
      }
    }
  }
`;

const CLIENT_EDGE_WITHIN_CLIENT_EXTENSION = graphql`
  query RelayReaderClientEdgesTest5Query {
    me {
      client_extension_linked_field {
        client_edge @waterfall {
          name
        }
      }
    }
  }
`;

const NULL_EDGE_QUERY = graphql`
  query RelayReaderClientEdgesTest7Query {
    me {
      null_client_edge @waterfall {
        name
      }
    }
  }
`;

describe('RelayReader Client Edges behavior', () => {
  it('follows the client edge to an available record', () => {
    const source = RelayRecordSource.create({
      '1': {
        __id: '1',
        __typename: 'User',
        id: '1',
        name: 'Alice',
      },
      '1337': {
        __id: '1337',
        __typename: 'User',
        id: '1337',
        name: 'Bob',
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
    });
    const store = new RelayStore(source);
    const resolverCache = new LiveResolverCache(() => source, store);
    const FooQuery = BASIC_QUERY;
    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data, seenRecords, missingClientEdges} = read(
      source,
      operation.fragment,
      null,
      resolverCache,
    );
    // $FlowFixMe[unclear-type] - read() doesn't have the nice types of reading a fragment through the actual APIs:
    const {me}: any = data;
    expect(me?.client_edge?.name).toEqual('Bob');
    expect(Array.from(seenRecords).sort()).toEqual([
      '1',
      '1337',
      `client:1:${RELAY_READ_TIME_RESOLVER_KEY_PREFIX}client_edge`,
      'client:root',
    ]);
    expect(missingClientEdges?.length ?? 0).toEqual(0);
  });

  it('returns a missing data request if the destination record is missing', () => {
    const source = RelayRecordSource.create({
      '1': {
        __id: '1',
        __typename: 'User',
        id: '1',
        name: 'Alice',
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
    });
    const store = new RelayStore(source);
    const resolverCache = new LiveResolverCache(() => source, store);
    const FooQuery = BASIC_QUERY;
    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data, seenRecords, missingClientEdges} = read(
      source,
      operation.fragment,
      null,
      resolverCache,
    );
    // $FlowFixMe[unclear-type] - read() doesn't have the nice types of reading a fragment through the actual APIs:
    const {me}: any = data;
    expect(me?.client_edge?.name).toEqual(undefined);
    expect(Array.from(seenRecords).sort()).toEqual([
      '1',
      '1337',
      `client:1:${RELAY_READ_TIME_RESOLVER_KEY_PREFIX}client_edge`,
      'client:root',
    ]);
    expect(missingClientEdges?.length).toEqual(1);
    expect(missingClientEdges?.[0]).not.toBeFalsy();
    const edge = missingClientEdges?.[0] ?? {};
    expect(edge.clientEdgeDestinationID).toBe('1337');
    expect(edge.request).toMatchObject({
      fragment: {
        argumentDefinitions: [{name: 'id'}],
        kind: 'Fragment',
        name: 'ClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge',
        selections: [
          {
            kind: 'LinkedField',
            name: 'node',
            selections: [
              {
                kind: 'FragmentSpread',
                name: 'RefetchableClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge',
              },
            ],
          },
        ],
        type: 'Query',
      },
      kind: 'Request',
      operation: {
        argumentDefinitions: [{name: 'id'}],
        kind: 'Operation',
        name: 'ClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge',
        selections: [
          {
            kind: 'LinkedField',
            name: 'node',
            selections: [
              {
                kind: 'ScalarField',
                name: '__typename',
              },
              {
                kind: 'ScalarField',
                name: 'id',
              },
              {
                kind: 'InlineFragment',
                selections: [
                  {
                    kind: 'ScalarField',
                    name: 'name',
                  },
                ],
                type: 'User',
              },
            ],
          },
        ],
      },
      params: {
        name: 'ClientEdgeQuery_RelayReaderClientEdgesTest1Query_me__client_edge',
      },
    });
  });

  it('works when the backing field is aliased', () => {
    const source = RelayRecordSource.create({
      '1': {
        __id: '1',
        __typename: 'User',
        id: '1',
        name: 'Alice',
      },
      '1337': {
        __id: '1337',
        __typename: 'User',
        id: '1337',
        name: 'Bob',
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
    });
    const store = new RelayStore(source);
    const resolverCache = new LiveResolverCache(() => source, store);
    const FooQuery = QUERY_WITH_ALIAS;
    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data, seenRecords, missingClientEdges} = read(
      source,
      operation.fragment,
      null,
      resolverCache,
    );
    // $FlowFixMe[unclear-type] - read() doesn't have the nice types of reading a fragment through the actual APIs:
    const {me}: any = data;
    expect(me?.the_alias?.name).toEqual('Bob');
    expect(me?.client_edge).toBeUndefined();
    expect(Array.from(seenRecords).sort()).toEqual([
      '1',
      '1337',
      `client:1:${RELAY_READ_TIME_RESOLVER_KEY_PREFIX}client_edge`,
      'client:root',
    ]);
    expect(missingClientEdges?.length ?? 0).toEqual(0);
  });

  it('gives a null client edge field when the backing field is null', () => {
    const source = RelayRecordSource.create({
      '1': {
        __id: '1',
        __typename: 'User',
        id: '1',
        name: 'Alice',
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
    });
    const store = new RelayStore(source);
    const resolverCache = new LiveResolverCache(() => source, store);
    const FooQuery = NULL_EDGE_QUERY;
    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data, seenRecords, missingClientEdges} = read(
      source,
      operation.fragment,
      null,
      resolverCache,
    );
    // $FlowFixMe[unclear-type] - read() doesn't have the nice types of reading a fragment through the actual APIs:
    const {me}: any = data;
    expect(me?.null_client_edge).toBe(null);
    expect(Array.from(seenRecords).sort()).toEqual([
      '1',
      `client:1:${RELAY_READ_TIME_RESOLVER_KEY_PREFIX}null_client_edge`,
      'client:root',
    ]);
    expect(missingClientEdges?.length ?? 0).toEqual(0);
  });

  it('returns a missing data request if a record beyond the destination record via a linked field is missing', () => {
    const source = RelayRecordSource.create({
      '1': {
        __id: '1',
        __typename: 'User',
        id: '1',
        name: 'Alice',
      },
      '1337': {
        __id: '1337',
        __typename: 'User',
        author: {__ref: '1338'}, // missing
        id: '1337',
        name: 'Bob',
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
    });
    const store = new RelayStore(source);
    const resolverCache = new LiveResolverCache(() => source, store);
    const FooQuery = LINKED_FIELD_WITHIN_CLIENT_EDGE_QUERY;
    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data, seenRecords, missingClientEdges} = read(
      source,
      operation.fragment,
      null,
      resolverCache,
    );
    // $FlowFixMe[unclear-type] - read() doesn't have the nice types of reading a fragment through the actual APIs:
    const {me}: any = data;
    expect(me?.client_edge?.author).toEqual(undefined);
    expect(Array.from(seenRecords).sort()).toEqual([
      '1',
      '1337',
      '1338',
      `client:1:${RELAY_READ_TIME_RESOLVER_KEY_PREFIX}client_edge`,
      'client:root',
    ]);
    expect(missingClientEdges?.length).toEqual(1);
  });

  it('returns a missing data request if data is missing within a fragment spread in the destination record of a client edge', () => {
    const source = RelayRecordSource.create({
      '1': {
        __id: '1',
        __typename: 'User',
        id: '1',
        name: 'Alice',
      },
      '1337': {
        __id: '1337',
        __typename: 'User',
        id: '1337',
        // name is missing
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
    });
    const store = new RelayStore(source);
    const resolverCache = new LiveResolverCache(() => source, store);
    const FooQuery = FRAGMENT_SPREAD_WITHIN_CLIENT_EDGE_QUERY;
    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data: parentData} = read(
      source,
      operation.fragment,
      null,
      resolverCache,
    );
    const {data, seenRecords, missingClientEdges} = read(
      source,
      nullthrows(
        getSingularSelector(
          getFragment(FRAGMENT_ON_USER),
          // $FlowFixMe[unclear-type] - read() doesn't have the nice types of reading a fragment through the actual APIs:
          nullthrows((parentData as any).me.client_edge),
        ),
      ),
      null,
      resolverCache,
    );
    // $FlowFixMe[unclear-type] - read() doesn't have the nice types of reading a fragment through the actual APIs:
    const {me}: any = data;
    expect(me?.client_edge?.name).toEqual(undefined);
    expect(Array.from(seenRecords).sort()).toEqual(['1337']);
    expect(missingClientEdges?.length).toEqual(1);
  });

  it('returns a missing data request if data is missing within a client edge within a client edge', () => {
    const source = RelayRecordSource.create({
      '1': {
        __id: '1',
        __typename: 'User',
        id: '1',
        name: 'Alice',
      },
      '1337': {
        __id: '1337',
        __typename: 'User',
        id: '1337',
        // name is missing
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
    });
    const store = new RelayStore(source);
    const resolverCache = new LiveResolverCache(() => source, store);
    const FooQuery = NESTED_CLIENT_EDGE_QUERY;
    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data, seenRecords, missingClientEdges} = read(
      source,
      operation.fragment,
      null,
      resolverCache,
    );
    // $FlowFixMe[unclear-type] - read() doesn't have the nice types of reading a fragment through the actual APIs:
    const {me}: any = data;
    expect(me?.client_edge?.name).toEqual(undefined);
    expect(Array.from(seenRecords).sort()).toEqual([
      '1',
      '1337',
      '1338',
      `client:1337:${RELAY_READ_TIME_RESOLVER_KEY_PREFIX}another_client_edge`,
      `client:1:${RELAY_READ_TIME_RESOLVER_KEY_PREFIX}client_edge`,
      'client:root',
    ]);
    expect(missingClientEdges?.length).toEqual(1);
    // Make sure it's the request for the inner edge and not the outer one:
    expect(missingClientEdges?.[0].request.fragment.name).toEqual(
      'ClientEdgeQuery_RelayReaderClientEdgesTest4Query_me__client_edge__another_client_edge',
    );
  });

  it('Considers data as missing when a client edge is reached after traversing a client extension', () => {
    // This tests an exception to the usual rule that isMissingData shouldn't be set
    // when traversing past a client extension, since the parent query can't help with
    // client data. But for client edges, we can help using the client edge query, no matter
    // how that client edge was reached.
    const source = RelayRecordSource.create({
      '1': {
        __id: '1',
        __typename: 'User',
        client_extension_linked_field: {__ref: '1338'},
        id: '1',
        name: 'Alice',
      },
      '1338': {
        __id: '1338',
        __typename: 'User',
        id: '1338',
        name: 'Bob',
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      // 1337 (the client edge destination) is missing.
    });
    const store = new RelayStore(source);
    const resolverCache = new LiveResolverCache(() => source, store);
    const FooQuery = CLIENT_EDGE_WITHIN_CLIENT_EXTENSION;
    const operation = createOperationDescriptor(FooQuery, {id: '1'});
    const {data, seenRecords, missingClientEdges} = read(
      source,
      operation.fragment,
      null,
      resolverCache,
    );
    // $FlowFixMe[unclear-type] - read() doesn't have the nice types of reading a fragment through the actual APIs:
    const {me}: any = data;
    expect(me?.client_edge?.author).toEqual(undefined);
    expect(Array.from(seenRecords).sort()).toEqual([
      '1',
      '1337',
      '1338',
      `client:1338:${RELAY_READ_TIME_RESOLVER_KEY_PREFIX}client_edge`,
      'client:root',
    ]);
    expect(missingClientEdges?.length).toEqual(1);
  });

  it('propagates missing client edge data errors from the resolver up to the reader', () => {
    const source = RelayRecordSource.create({
      '1': {
        __id: '1',
        __typename: 'User',
        id: '1',
        name: null,
      },
      '1337': {
        // `client_edge` points here
        __id: '1337',
        __typename: 'User',
        id: '1337',
        name: undefined, // The missing data
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
    });
    const FooQuery = graphql`
      query RelayReaderClientEdgesTestMissingClientEdgeDataQuery {
        me {
          reads_client_edge
        }
      }
    `;

    const operation = createOperationDescriptor(FooQuery, {});
    const store = new RelayStore(source);
    const resolverCache = new LiveResolverCache(() => source, store);
    const {missingClientEdges} = read(
      source,
      operation.fragment,
      null,
      resolverCache,
    );
    expect(missingClientEdges).toEqual([
      expect.objectContaining({
        request: expect.objectContaining({
          fragment: expect.objectContaining({
            name: 'ClientEdgeQuery_UserReadsClientEdgeResolver_client_edge',
          }),
        }),
      }),
    ]);

    // Lookup a second time to ensure that we still report the missing client edge data when
    // reading from the cache.
    const {missingClientEdges: stillMissingClientEdges} = read(
      source,
      operation.fragment,
      null,
      resolverCache,
    );
    expect(stillMissingClientEdges).toEqual([
      expect.objectContaining({
        request: expect.objectContaining({
          fragment: expect.objectContaining({
            name: 'ClientEdgeQuery_UserReadsClientEdgeResolver_client_edge',
          }),
        }),
      }),
    ]);
  });
});

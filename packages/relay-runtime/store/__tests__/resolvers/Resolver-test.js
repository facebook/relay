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

const {getRequest} = require('../../../query/GraphQLTag');
const {createReaderSelector} = require('../../../store/RelayModernSelector');
const {graphql} = require('relay-runtime/query/GraphQLTag');
const {
  createOperationDescriptor,
} = require('relay-runtime/store/RelayModernOperationDescriptor');
const {
  createMockEnvironment,
  disallowConsoleErrors,
  disallowWarnings,
} = require('relay-test-utils-internal');

disallowWarnings();
disallowConsoleErrors();

describe('Relay Resolver', () => {
  it('works with refetchable fragments', () => {
    const environment = createMockEnvironment();

    const FooFragment = graphql`
      fragment ResolverTest2Fragment on User
      @refetchable(queryName: "ResolverTest1FragmentRefetchableQuery") {
        greeting
      }
    `;

    const FooQuery = graphql`
      query ResolverTest2Query {
        me {
          ...ResolverTest2Fragment
        }
      }
    `;

    const request = getRequest(FooQuery);
    const operation = createOperationDescriptor(request, {});
    environment.commitPayload(operation, {
      me: {
        id: '1',
        name: 'Alice',
      },
    });

    const fragmentSelector = createReaderSelector(
      FooFragment,
      '1',
      {},
      operation.request,
    );

    // $FlowFixMe[unclear-type]
    const {data}: any = environment.lookup(fragmentSelector);

    expect(data.greeting).toEqual('Hello, Alice!'); // Resolver result
    expect(data.name).toEqual(undefined); // Fields needed by resolver's fragment don't end up in the result
  });

  it('returns the result of the resolver function', () => {
    const environment = createMockEnvironment();

    const FooQuery = graphql`
      query ResolverTest1Query {
        me {
          greeting
        }
      }
    `;

    const request = getRequest(FooQuery);
    const operation = createOperationDescriptor(request, {});

    environment.commitPayload(operation, {
      me: {
        id: '1',
        name: 'Alice',
      },
    });

    // $FlowFixMe[unclear-type]
    const {data}: any = environment.lookup(operation.fragment);

    expect(data.me.greeting).toEqual('Hello, Alice!'); // Resolver result
    expect(data.me.name).toEqual(undefined); // Fields needed by resolver's fragment don't end up in the result
  });

  it('can create a client edge query in our test environment that has valid import', () => {
    // This is not really a runtime test, but more a test to confirm that this query generates
    // an artifact with valid imports in our non-Haste test environment.
    const clientEdgeRuntimeArtifact = graphql`
      query ResolverTest3Query {
        me {
          client_edge @waterfall {
            __typename
          }
        }
      }
    `;
    expect(clientEdgeRuntimeArtifact.operation.name).toBe('ResolverTest3Query');
  });

  it('When omitting all arguments, resolver still gets passed an `args` object.', () => {
    const environment = createMockEnvironment();

    const FooQuery = graphql`
      query ResolverTest4Query {
        hello_optional_world
      }
    `;

    const request = getRequest(FooQuery);
    const operation = createOperationDescriptor(request, {});

    environment.commitPayload(operation, {});

    const {data, fieldErrors} = environment.lookup(operation.fragment);
    expect(fieldErrors).toBe(null);

    // $FlowFixMe[incompatible-use] Lookup is untyped
    expect(data.hello_optional_world).toEqual('Hello, Default!');
  });
});

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
const {RelayFeatureFlags} = require('relay-runtime');
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

beforeEach(() => {
  RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = true;
});

afterEach(() => {
  RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = false;
});

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
    const {data} = (environment.lookup(fragmentSelector): any);

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
    const {data} = (environment.lookup(operation.fragment): any);

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
});

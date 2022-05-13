/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

'use strict';

const {RelayFeatureFlags} = require('relay-runtime');
const {graphql} = require('relay-runtime/query/GraphQLTag');
const {
  createOperationDescriptor,
} = require('relay-runtime/store/RelayModernOperationDescriptor');
const {createMockEnvironment} = require('relay-test-utils-internal');
const {getRequest} = require('../../../query/GraphQLTag');
const {createReaderSelector} = require('../../../store/RelayModernSelector');

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
      fragment RelayReaderResolverTest2Fragment on User
      @refetchable(
        queryName: "RelayReaderResolverTest1FragmentRefetchableQuery"
      ) {
        greeting
      }
    `;

    const FooQuery = graphql`
      query RelayReaderResolverTest2Query {
        me {
          ...RelayReaderResolverTest2Fragment
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
      query RelayReaderResolverTest1Query {
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
});

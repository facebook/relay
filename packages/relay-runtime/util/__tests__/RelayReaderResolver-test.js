/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

'use strict';

const nullthrows = require('nullthrows');
const {RelayFeatureFlags} = require('relay-runtime');
const RelayNetwork = require('relay-runtime/network/RelayNetwork');
const {graphql} = require('relay-runtime/query/GraphQLTag');
const RelayModernEnvironment = require('relay-runtime/store/RelayModernEnvironment');
const {
  createOperationDescriptor,
} = require('relay-runtime/store/RelayModernOperationDescriptor');
const RelayModernStore = require('relay-runtime/store/RelayModernStore');
const {read} = require('relay-runtime/store/RelayReader');
const RelayRecordSource = require('relay-runtime/store/RelayRecordSource');
const {RecordResolverCache} = require('relay-runtime/store/ResolverCache');

beforeEach(() => {
  RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = true;
});

afterEach(() => {
  RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = false;
});

describe('Relay Resolver', () => {
  it('returns the result of the resolver function', () => {
    const source = RelayRecordSource.create({
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        me: {__ref: '1'},
      },
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        name: 'Alice',
      },
    });
    const resolverCache = new RecordResolverCache(() => source);

    const FooQuery = graphql`
      query RelayReaderResolverTest1Query {
        me {
          greeting
        }
      }
    `;

    const operation = createOperationDescriptor(FooQuery, {});

    const {data, seenRecords} = read(source, operation.fragment, resolverCache);

    // $FlowFixMe[unclear-type] - read() doesn't have the nice types of reading a fragment through the actual APIs:
    const {me} = (data: any);
    expect(me.greeting).toEqual('Hello, Alice!'); // Resolver result
    expect(me.name).toEqual(undefined); // Fields needed by resolver's fragment don't end up in the result

    expect(Array.from(seenRecords).sort()).toEqual([
      '1',
      'client:1:greeting',
      'client:root',
    ]);
  });
});

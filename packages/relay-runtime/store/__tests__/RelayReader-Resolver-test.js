/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const RelayRecordSource = require('../RelayRecordSource');

const {graphql} = require('../../query/GraphQLTag');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {read} = require('../RelayReader');
const {RelayFeatureFlags} = require('relay-runtime');

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

    const FooQuery = graphql`
      query RelayReaderResolverTest1Query {
        me {
          greeting
        }
      }
    `;

    const operation = createOperationDescriptor(FooQuery, {id: '1'});

    const {data} = read(source, operation.fragment);

    expect(data).toEqual({
      me: {greeting: 'Hello <TODO: ADD THIS>'},
    });
  });

  it('errors if the ENABLE_RELAY_RESOLVERS feature flag is not enabled', () => {
    RelayFeatureFlags.ENABLE_RELAY_RESOLVERS = false;

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

    const FooQuery = graphql`
      query RelayReaderResolverTest2Query {
        me {
          greeting
        }
      }
    `;

    const operation = createOperationDescriptor(FooQuery, {id: '1'});

    expect(() => {
      read(source, operation.fragment);
    }).toThrowErrorMatchingInlineSnapshot(
      '"Relay Resolver fields are not yet supported."',
    );
  });
});

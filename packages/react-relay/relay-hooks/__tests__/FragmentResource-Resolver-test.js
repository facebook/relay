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

import type {RelayFieldLoggerEvent} from 'relay-runtime/store/RelayStoreTypes';

const {
  getFragmentResourceForEnvironment,
} = require('react-relay/relay-hooks/legacy/FragmentResource');
const {getFragment} = require('relay-runtime');
const {graphql} = require('relay-runtime/query/GraphQLTag');
const {
  createOperationDescriptor,
} = require('relay-runtime/store/RelayModernOperationDescriptor');
const {createMockEnvironment} = require('relay-test-utils-internal');
const {
  disallowConsoleErrors,
  disallowWarnings,
} = require('relay-test-utils-internal');

disallowConsoleErrors();
disallowWarnings();

const BASIC_QUERY = graphql`
  query FragmentResourceResolverTest1Query($id: ID!) {
    node(id: $id) {
      __typename
      ...FragmentResourceClientEdgesTestFragment1 @dangerously_unaliased_fixme
    }
  }
`;

const BASIC_FRAGMENT = graphql`
  fragment FragmentResourceResolverTestFragment1 on User {
    always_throws
  }
`;

describe('FragmentResource RelayResolver behavior', () => {
  let environment;
  let FragmentResource;
  let query;
  let fragmentNode;
  let fragmentRef;
  let mockRelayFieldLogger;

  beforeEach(() => {
    mockRelayFieldLogger = jest.fn<[RelayFieldLoggerEvent], void>();
    environment = createMockEnvironment({
      relayFieldLogger: mockRelayFieldLogger,
    });
    FragmentResource = getFragmentResourceForEnvironment(environment);
    query = createOperationDescriptor(BASIC_QUERY, {id: '1'});
    environment.commitPayload(query, {
      node: {
        __typename: 'User',
        id: '1',
        name: 'Alice',
      },
    });
    fragmentNode = getFragment(BASIC_FRAGMENT);
    fragmentRef = {
      __id: '1',
      __fragments: {
        FragmentResourceResolverTestFragment1: {},
      },
      __fragmentOwner: query.request,
    };
  });

  it('Reports an error to the logger when a resolver field throws an error.', async () => {
    FragmentResource.read(fragmentNode, fragmentRef, 'componentDisplayName');
    expect(environment.relayFieldLogger).toHaveBeenCalledTimes(1);

    const event = mockRelayFieldLogger.mock.calls[0][0];
    if (event.kind !== 'relay_resolver.error') {
      throw new Error(
        "Expected log event to be of kind 'relay_resolver.error'",
      );
    }
    expect(event).toEqual({
      error: expect.any(Error),
      fieldPath: 'always_throws',
      kind: 'relay_resolver.error',
      owner: 'FragmentResourceResolverTestFragment1',
      shouldThrow: false,
      handled: false,
    });
    expect(event.error.message).toEqual('I always throw. What did you expect?');
  });
});

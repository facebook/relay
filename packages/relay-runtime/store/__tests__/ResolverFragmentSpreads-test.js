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

import type {ResolverFragmentSpreadsTestInlineFragment$key} from './__generated__/ResolverFragmentSpreadsTestInlineFragment.graphql';
import type {ResolverFragmentSpreadsTestInlineFragmentSpread$key} from './__generated__/ResolverFragmentSpreadsTestInlineFragmentSpread.graphql';
import type {ResolverFragmentSpreadsTestUnmaskedFragment$key} from './__generated__/ResolverFragmentSpreadsTestUnmaskedFragment.graphql';

const {readFragment} = require('../ResolverFragments');
const {graphql, readInlineData} = require('react-relay');
const {
  LiveResolverCache,
} = require('relay-runtime/store/live-resolvers/LiveResolverCache');
const {
  createOperationDescriptor,
} = require('relay-runtime/store/RelayModernOperationDescriptor');
const RelayStore = require('relay-runtime/store/RelayModernStore');
const {read} = require('relay-runtime/store/RelayReader');
const RelayRecordSource = require('relay-runtime/store/RelayRecordSource');
const {
  disallowConsoleErrors,
  disallowWarnings,
} = require('relay-test-utils-internal');

disallowWarnings();
disallowConsoleErrors();

/**
 * @RelayResolver Query.field_that_spreads_inline_fragment: String
 * @rootFragment ResolverFragmentSpreadsTestInlineFragment
 */
export function field_that_spreads_inline_fragment(
  rootKey: ResolverFragmentSpreadsTestInlineFragment$key,
): string {
  const user = readFragment(
    graphql`
      fragment ResolverFragmentSpreadsTestInlineFragment on Query {
        me @required(action: THROW) {
          name @required(action: THROW)
          ...ResolverFragmentSpreadsTestInlineFragmentSpread
        }
      }
    `,
    rootKey,
  );

  const address = readAddress(user.me);

  return `Hello, ${user.me.name}! You live on ${address}`;
}

/**
 * @RelayResolver Query.field_that_spreads_unmasked_fragment: String
 * @rootFragment ResolverFragmentSpreadsTestUnmaskedFragment
 */
export function field_that_spreads_unmasked_fragment(
  rootKey: ResolverFragmentSpreadsTestUnmaskedFragment$key,
): string {
  const data = readFragment(
    graphql`
      fragment ResolverFragmentSpreadsTestUnmaskedFragment on Query {
        me @required(action: THROW) {
          name @required(action: THROW)
          ...ResolverFragmentSpreadsTestUnmaskedFragmentSpread
            @relay(mask: false)
        }
      }
    `,
    rootKey,
  );

  const user = data.me;

  // When using @relay(mask: false), the data is directly accessible without readFragment
  const profileInfo = `${user.profile_picture?.uri ?? 'NO_IMAGE'} (${user.profile_picture?.width ?? 0}x${user.profile_picture?.height ?? 0})`;

  return `Hello, ${user.name}! Your profile picture is ${profileInfo}`;
}

function readAddress(
  userKey: ResolverFragmentSpreadsTestInlineFragmentSpread$key,
) {
  const user = readInlineData(
    graphql`
      fragment ResolverFragmentSpreadsTestInlineFragmentSpread on User @inline {
        address {
          street
          city
        }
      }
    `,
    userKey,
  );

  return `${user.address?.street ?? 'UNKNOWN'} in ${user.address?.city ?? 'UNKNOWN'}`;
}

// Define the unmasked fragment that will be used in the resolver
graphql`
  fragment ResolverFragmentSpreadsTestUnmaskedFragmentSpread on User {
    profile_picture {
      uri
      width
      height
    }
  }
`;

describe('Resolver Fragment Spreads', () => {
  it('can read resolver that uses @inline fragment spreads', () => {
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
        address: {__ref: '2'},
      },
      '2': {
        __id: '2',
        __typename: 'StreetAddress',
        street: '1 Hacker Way',
        city: 'Menlo Park',
      },
    });
    const store = new RelayStore(source);
    const resolverCache = new LiveResolverCache(() => source, store);

    const InlineQuery = graphql`
      query ResolverFragmentSpreadsTestQuery {
        field_that_spreads_inline_fragment
      }
    `;

    const operation = createOperationDescriptor(InlineQuery, {});

    const {data} = read(source, operation.fragment, null, resolverCache);

    expect(data?.field_that_spreads_inline_fragment).toEqual(
      'Hello, Alice! You live on 1 Hacker Way in Menlo Park',
    );
  });

  it('can read resolver that uses @relay(mask: false) unmasked fragment spreads', () => {
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
        name: 'Bob',
        profile_picture: {__ref: '2'},
      },
      '2': {
        __id: '2',
        __typename: 'Image',
        uri: 'https://example.com/bob.jpg',
        width: 200,
        height: 200,
      },
    });
    const store = new RelayStore(source);
    const resolverCache = new LiveResolverCache(() => source, store);

    const UnmaskedQuery = graphql`
      query ResolverFragmentSpreadsTestUnmaskedQuery {
        field_that_spreads_unmasked_fragment
      }
    `;

    const operation = createOperationDescriptor(UnmaskedQuery, {});

    const {data} = read(source, operation.fragment, null, resolverCache);

    expect(data?.field_that_spreads_unmasked_fragment).toEqual(
      'Hello, Bob! Your profile picture is https://example.com/bob.jpg (200x200)',
    );
  });
});

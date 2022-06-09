/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {UserAnotherClientEdgeResolver$key} from './__generated__/UserAnotherClientEdgeResolver.graphql';
import type {DataID} from 'relay-runtime';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver
 * @fieldName another_client_edge
 * @rootFragment UserAnotherClientEdgeResolver
 * @onType User
 * @edgeTo User
 */
function UserAnotherClientEdgeResolver(
  rootKey: UserAnotherClientEdgeResolver$key,
): DataID {
  readFragment(
    graphql`
      fragment UserAnotherClientEdgeResolver on User {
        __typename
      }
    `,
    rootKey,
  );
  return '1338';
}

module.exports = UserAnotherClientEdgeResolver;

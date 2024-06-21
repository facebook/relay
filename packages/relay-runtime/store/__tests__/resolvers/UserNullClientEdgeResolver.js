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

import type {UserNullClientEdgeResolver$key} from './__generated__/UserNullClientEdgeResolver.graphql';
import type {ConcreteClientEdgeResolverReturnType} from 'relay-runtime';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver
 * @fieldName null_client_edge
 * @rootFragment UserNullClientEdgeResolver
 * @onType User
 * @edgeTo User
 */
function null_client_edge(
  rootKey: UserNullClientEdgeResolver$key,
): ?ConcreteClientEdgeResolverReturnType<> {
  readFragment(
    graphql`
      fragment UserNullClientEdgeResolver on User {
        name
      }
    `,
    rootKey,
  );
  return null;
}

module.exports = {
  null_client_edge,
};

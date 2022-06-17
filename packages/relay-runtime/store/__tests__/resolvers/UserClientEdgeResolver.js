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

'use strict';

import type {UserClientEdgeResolver$key} from './__generated__/UserClientEdgeResolver.graphql';
import type {DataID} from 'relay-runtime';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver
 * @fieldName client_edge
 * @rootFragment UserClientEdgeResolver
 * @edgeTo User
 * @onType User
 */
function UserClientEdgeResolver(rootKey: UserClientEdgeResolver$key): DataID {
  readFragment(
    graphql`
      fragment UserClientEdgeResolver on User {
        name
      }
    `,
    rootKey,
  );
  return '1337';
}

module.exports = UserClientEdgeResolver;

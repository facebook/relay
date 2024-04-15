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

import type {AstrologicalSignNameResolver$key} from './__generated__/AstrologicalSignNameResolver.graphql';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver AstrologicalSign.name: String
 * @rootFragment AstrologicalSignNameResolver
 *
 * Re-expose `Name` from our client fat `self` object.
 */
function name(rootKey: AstrologicalSignNameResolver$key): string | null {
  const sign = readFragment(
    graphql`
      fragment AstrologicalSignNameResolver on AstrologicalSign {
        self
      }
    `,
    rootKey,
  );
  return sign.self?.name ?? null;
}

module.exports = {
  name,
};

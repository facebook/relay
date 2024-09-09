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

import type {AstrologicalSignHouseResolver$key} from './__generated__/AstrologicalSignHouseResolver.graphql';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver AstrologicalSign.house: Int
 * @rootFragment AstrologicalSignHouseResolver
 *
 * Re-expose `house` from our client fat `self` object.
 */
function house(rootKey: AstrologicalSignHouseResolver$key): number | null {
  const sign = readFragment(
    graphql`
      fragment AstrologicalSignHouseResolver on AstrologicalSign {
        self
      }
    `,
    rootKey,
  );
  return sign.self?.house ?? null;
}

module.exports = {
  house,
};

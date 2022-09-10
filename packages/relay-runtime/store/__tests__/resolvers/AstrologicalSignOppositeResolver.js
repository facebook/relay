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

import type {AstrologicalSignOppositeResolver$key} from './__generated__/AstrologicalSignOppositeResolver.graphql';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver
 * @fieldName opposite
 * @rootFragment AstrologicalSignOppositeResolver
 * @onType AstrologicalSign
 * @edgeTo AstrologicalSign
 *
 * Expose a sign's opposite as an edge in the graph.
 */
function astrologicalSignOpposite(
  rootKey: AstrologicalSignOppositeResolver$key,
): string | null {
  const sign = readFragment(
    graphql`
      fragment AstrologicalSignOppositeResolver on AstrologicalSign {
        self
      }
    `,
    rootKey,
  );
  return sign.self?.oppositeSignId ?? null;
}

module.exports = astrologicalSignOpposite;

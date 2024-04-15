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

import type {TodoTextColorResolverFragment$key} from './__generated__/TodoTextColorResolverFragment.graphql';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver TodoTextColor.human_readable_color: String
 * @rootFragment TodoTextColorResolverFragment
 */
function human_readable_color(
  rootKey: TodoTextColorResolverFragment$key,
): string {
  const data = readFragment(
    graphql`
      fragment TodoTextColorResolverFragment on TodoTextColor {
        hex
      }
    `,
    rootKey,
  );

  return `color is ${data?.hex ?? 'unknown'}`;
}

module.exports = {
  human_readable_color,
};

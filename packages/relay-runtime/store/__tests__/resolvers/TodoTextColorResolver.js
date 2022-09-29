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

const {readFragment} = require('relay-runtime/store/ResolverFragments');
const {graphql} = require('relay-runtime');

/**
 * @RelayResolver
 * @onType TodoTextColor
 * @rootFragment TodoTextColorResolverFragment
 * @fieldName human_readable_color
 */
function TodoTextColorResolver(
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

module.exports = TodoTextColorResolver;

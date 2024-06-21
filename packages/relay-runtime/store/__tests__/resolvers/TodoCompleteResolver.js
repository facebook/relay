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

import type {TodoCompleteResolverFragment$key} from './__generated__/TodoCompleteResolverFragment.graphql';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver
 * @onType Todo
 * @rootFragment TodoCompleteResolverFragment
 * @fieldName complete
 */
function complete(rootKey: TodoCompleteResolverFragment$key): ?boolean {
  const data = readFragment(
    graphql`
      fragment TodoCompleteResolverFragment on Todo {
        self
      }
    `,
    rootKey,
  );
  return data.self?.isCompleted;
}

module.exports = {
  complete,
};

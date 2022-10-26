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

import type {UserConstantResolver$key} from './__generated__/UserConstantResolver.graphql';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver
 * @fieldName constant
 * @rootFragment UserConstantResolver
 * @onType User
 *
 * You thought "one" was the loneliest number? Pffft. Let me introduce you to zero!
 */
function constant(rootKey: UserConstantResolver$key): number {
  readFragment(
    graphql`
      fragment UserConstantResolver on User {
        name
      }
    `,
    rootKey,
  );
  return 0;
}

module.exports = {
  constant,
};

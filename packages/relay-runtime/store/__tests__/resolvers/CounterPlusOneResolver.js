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

import type {CounterPlusOneResolver$key} from './__generated__/CounterPlusOneResolver.graphql';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver
 * @fieldName counter_plus_one
 * @rootFragment CounterPlusOneResolver
 * @onType Query
 *
 * A resolver which reads a @live resolver field (`counter`) to return `counter + 1`.
 */
function counter_plus_one(rootKey: CounterPlusOneResolver$key): number {
  const data = readFragment(
    graphql`
      fragment CounterPlusOneResolver on Query {
        counter @required(action: THROW)
      }
    `,
    rootKey,
  );
  return data.counter + 1;
}

module.exports = {
  counter_plus_one,
};

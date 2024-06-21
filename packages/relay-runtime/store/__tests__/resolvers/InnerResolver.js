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

import type {InnerResolver$key} from './__generated__/InnerResolver.graphql';
import type {LiveState} from 'relay-runtime';

const {GLOBAL_STORE, Selectors} = require('./ExampleExternalStateStore');
const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver
 * @fieldName inner
 * @rootFragment InnerResolver
 * @onType Query
 * @live
 */
function inner(rootKey: InnerResolver$key): LiveState<number> {
  readFragment(
    graphql`
      fragment InnerResolver on Query {
        me {
          name
        }
      }
    `,
    rootKey,
  );
  return {
    read() {
      return Selectors.getNumber(GLOBAL_STORE.getState());
    },
    subscribe(cb): () => void {
      // Here we could try to run the selector and short-circuit if the value has
      // not changed, but for now we'll over-notify.
      return GLOBAL_STORE.subscribe(cb);
    },
  };
}

module.exports = {
  inner,
};

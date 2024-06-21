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

import type {ResolverThatThrows$key} from './__generated__/ResolverThatThrows.graphql';
import type {LiveState} from 'relay-runtime';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver
 * @fieldName resolver_that_throws
 * @rootFragment ResolverThatThrows
 * @onType User
 * @live
 *
 * This should always throw.
 */
function resolver_that_throws(
  rootKey: ResolverThatThrows$key,
): LiveState<null> {
  readFragment(
    graphql`
      fragment ResolverThatThrows on User {
        username @required(action: THROW)
      }
    `,
    rootKey,
  );

  return {
    read() {
      throw new Error(
        'The resolver should throw earlier. It should have missing data.',
      );
    },
    subscribe(cb) {
      return () => {};
    },
  };
}

module.exports = {
  resolver_that_throws,
};

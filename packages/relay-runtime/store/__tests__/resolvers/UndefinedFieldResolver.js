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

import type {UndefinedFieldResolver$key} from './__generated__/UndefinedFieldResolver.graphql';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver
 * @fieldName undefined_field
 * @rootFragment UndefinedFieldResolver
 * @onType Query
 *
 * A resolver that always returns undefined. This is intended to exercise an
 * edge case in Relay Reader where `undefined` is generally interpreted as
 * indicating that a field has not been fetched, and thus we should suspend.
 */
function undefined_field(rootKey: UndefinedFieldResolver$key): void {
  readFragment(
    graphql`
      fragment UndefinedFieldResolver on Query {
        # We don't need to read any Relay state here, but this works for now
        me {
          __id
        }
      }
    `,
    rootKey,
  );
  return undefined;
}

module.exports = {
  undefined_field,
};

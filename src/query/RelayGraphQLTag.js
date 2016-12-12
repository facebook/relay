/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayGraphQLTag
 * @flow
 */

'use strict';

const invariant = require('invariant');

/**
 * Runtime function to correspond to the `graphql` tagged template function.
 * All calls to this function should be transformed by the plugin.
 */
function graphql() {
  invariant(
    false,
    'graphql: Unexpected invocation at runtime. Either the Babel transform ' +
    'was not set up, or it failed to identify this call site. Make sure it ' +
    'is being used verbatim as `graphql`.'
  );
}

module.exports = {
  graphql,
};

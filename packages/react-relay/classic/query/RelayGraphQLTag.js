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
 * @format
 */

'use strict';

const RelayQL = require('RelayQL');

const invariant = require('invariant');

import type {
  ConcreteFragmentDefinition,
  ConcreteOperationDefinition,
} from 'ConcreteQuery';
import type {GraphQLTaggedNode} from 'RelayModernGraphQLTag';

/**
 * Runtime function to correspond to the `graphql` tagged template function.
 * All calls to this function should be transformed by the plugin.
 */
function graphql(): GraphQLTaggedNode {
  invariant(
    false,
    'graphql: Unexpected invocation at runtime. Either the Babel transform ' +
      'was not set up, or it failed to identify this call site. Make sure it ' +
      'is being used verbatim as `graphql`.',
  );
}

/**
 * Variant of the `graphql` tag that enables experimental features.
 */
graphql.experimental = function(): GraphQLTaggedNode {
  invariant(
    false,
    'graphql.experimental: Unexpected invocation at runtime. Either the ' +
      'Babel transform was not set up, or it failed to identify this call ' +
      'site. Make sure it is being used verbatim as `graphql.experimental`.',
  );
};

function getClassicFragment(
  taggedNode: GraphQLTaggedNode,
): ConcreteFragmentDefinition {
  // $FlowFixMe Property not found in `RelayQL`
  return RelayQL.__getClassicFragment(taggedNode);
}

function getClassicOperation(
  taggedNode: GraphQLTaggedNode,
): ConcreteOperationDefinition {
  // $FlowFixMe Property not found in `RelayQL`
  return RelayQL.__getClassicOperation(taggedNode);
}

module.exports = {
  getClassicFragment,
  getClassicOperation,
  graphql,
};

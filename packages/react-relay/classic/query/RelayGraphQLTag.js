/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const QueryBuilder = require('./QueryBuilder');
const RelayQL = require('./RelayQL');

const invariant = require('invariant');

import type {
  ConcreteFragmentDefinition,
  ConcreteOperationDefinition,
} from './ConcreteQuery';
import type {GraphQLTaggedNode} from 'relay-runtime';

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

function isClassicFragment(taggedNode: GraphQLTaggedNode) {
  return (
    QueryBuilder.getFragmentDefinition(RelayQL.__getClassicNode(taggedNode)) !=
    null
  );
}

function isClassicOperation(taggedNode: GraphQLTaggedNode) {
  return (
    QueryBuilder.getOperationDefinition(RelayQL.__getClassicNode(taggedNode)) !=
    null
  );
}

function getClassicFragment(
  taggedNode: GraphQLTaggedNode,
): ConcreteFragmentDefinition {
  return RelayQL.__getClassicFragment(taggedNode);
}

function getClassicOperation(
  taggedNode: GraphQLTaggedNode,
): ConcreteOperationDefinition {
  return RelayQL.__getClassicOperation(taggedNode);
}

module.exports = {
  getClassicFragment,
  getClassicOperation,
  graphql,
  isClassicFragment,
  isClassicOperation,
};

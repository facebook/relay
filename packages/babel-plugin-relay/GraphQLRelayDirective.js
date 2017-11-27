/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @fullSyntaxTransform
 * @format
 */

'use strict';

const {buildSchema} = require('graphql');

// Copy of RelayRelayDirectiveTransform.SCHEMA_EXTENSION due to the build
// systems.
const SCHEMA_EXTENSION = `directive @relay(
  # Marks this fragment spread as being deferrable such that it loads after
  # other portions of the view.
  deferrable: Boolean,

  # Marks a connection field as containing nodes without 'id' fields.
  # This is used to silence the warning when diffing connections.
  isConnectionWithoutNodeID: Boolean,

  # Marks a fragment as intended for pattern matching (as opposed to fetching).
  # Used in Classic only.
  pattern: Boolean,

  # Marks a fragment as being backed by a GraphQLList.
  plural: Boolean,

  # Marks a fragment spread which should be unmasked if provided false
  mask: Boolean = true,

  # Selectively pass variables down into a fragment. Only used in Classic.
  variables: [String!],
) on FRAGMENT_DEFINITION | FRAGMENT_SPREAD | INLINE_FRAGMENT | FIELD`;

const GraphQLRelayDirective = buildSchema(
  SCHEMA_EXTENSION + '\ntype Query { x: String }',
).getDirective('relay');

if (!GraphQLRelayDirective) {
  throw new Error('Failed to create GraphQLRelayDirective.');
}

module.exports = {
  SCHEMA_EXTENSION,
  GraphQLRelayDirective,
};

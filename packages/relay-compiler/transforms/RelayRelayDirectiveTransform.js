/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule RelayRelayDirectiveTransform
 * @flow
 * @format
 */

'use strict';

const invariant = require('invariant');

const {
  CompilerContext,
  IRTransformer,
  getLiteralArgumentValues,
} = require('graphql-compiler');

import type {Fragment} from 'graphql-compiler';

const RELAY = 'relay';
const PLURAL = 'plural';
const SCHEMA_EXTENSION = `directive @relay(
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

/**
 * A transform that extracts `@relay(plural: Boolean)` directives and converts
 * them to metadata that can be accessed at runtime.
 */
function relayRelayDirectiveTransform(
  context: CompilerContext,
): CompilerContext {
  return IRTransformer.transform(
    context,
    {
      Fragment: visitFragment,
    },
    () => ({}), // empty state
  );
}

function visitFragment(fragment: Fragment): Fragment {
  const relayDirective = fragment.directives.find(({name}) => name === RELAY);
  if (!relayDirective) {
    return fragment;
  }
  const {plural} = getLiteralArgumentValues(relayDirective.args);
  invariant(
    plural === undefined || typeof plural === 'boolean',
    'RelayRelayDirectiveTransform: Expected the %s argument to @%s to be ' +
      'a boolean literal or not specified.',
    PLURAL,
    RELAY,
  );
  return {
    ...fragment,
    directives: fragment.directives.filter(
      directive => directive !== relayDirective,
    ),
    metadata: {
      ...(fragment.metadata || {}),
      plural,
    },
  };
}

module.exports = {
  RELAY,
  SCHEMA_EXTENSION,
  transform: relayRelayDirectiveTransform,
};

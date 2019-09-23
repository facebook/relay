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

const IRTransformer = require('../core/GraphQLIRTransformer');

const getLiteralArgumentValues = require('../core/getLiteralArgumentValues');
const invariant = require('invariant');

import type CompilerContext from '../core/GraphQLCompilerContext';
import type {Fragment, FragmentSpread} from '../core/GraphQLIR';

const RELAY = 'relay';
const SCHEMA_EXTENSION = `
directive @relay(
  # Marks a fragment as being backed by a GraphQLList.
  plural: Boolean,

  # Marks a fragment spread which should be unmasked if provided false
  mask: Boolean = true,
) on FRAGMENT_DEFINITION | FRAGMENT_SPREAD
`;

/**
 * A transform that extracts `@relay(plural: Boolean)` directives and converts
 * them to metadata that can be accessed at runtime.
 */
function relayRelayDirectiveTransform(
  context: CompilerContext,
): CompilerContext {
  return IRTransformer.transform(context, {
    Fragment: visitRelayMetadata(fragmentMetadata),
    FragmentSpread: visitRelayMetadata(fragmentSpreadMetadata),
  });
}

type MixedObj = {[key: string]: mixed};
function visitRelayMetadata<T: Fragment | FragmentSpread>(
  metadataFn: MixedObj => MixedObj,
): T => T {
  return function(node) {
    const relayDirective = node.directives.find(({name}) => name === RELAY);
    if (!relayDirective) {
      return this.traverse(node);
    }
    const argValues = getLiteralArgumentValues(relayDirective.args);
    const metadata = metadataFn(argValues);
    return this.traverse({
      ...node,
      directives: node.directives.filter(
        directive => directive !== relayDirective,
      ),
      metadata: {
        ...(node.metadata || {}),
        ...metadata,
      },
    });
  };
}

function fragmentMetadata({mask, plural}): MixedObj {
  invariant(
    plural === undefined || typeof plural === 'boolean',
    'RelayRelayDirectiveTransform: Expected the "plural" argument to @relay ' +
      'to be a boolean literal if specified.',
  );
  invariant(
    mask === undefined || typeof mask === 'boolean',
    'RelayRelayDirectiveTransform: Expected the "mask" argument to @relay ' +
      'to be a boolean literal if specified.',
  );
  return {mask, plural};
}

function fragmentSpreadMetadata({mask}): MixedObj {
  invariant(
    mask === undefined || typeof mask === 'boolean',
    'RelayRelayDirectiveTransform: Expected the "mask" argument to @relay ' +
      'to be a boolean literal if specified.',
  );
  return {mask};
}

module.exports = {
  RELAY,
  SCHEMA_EXTENSION,
  transform: relayRelayDirectiveTransform,
};

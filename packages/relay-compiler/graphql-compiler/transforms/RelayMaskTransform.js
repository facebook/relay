/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayMaskTransform
 * @flow
 * @format
 */

'use strict';

const GraphQLCompilerContext = require('../core/GraphQLCompilerContext');
const GraphQLIRTransformer = require('../core/GraphQLIRTransformer');

const getLiteralArgumentValues = require('../core/getLiteralArgumentValues');
const invariant = require('invariant');

import type {FragmentSpread, InlineFragment, Node} from '../core/GraphQLIR';

type State = {};
const STATE = {};

/**
 * A transform that inlines fragment spreads with the @relay(mask: false)
 * directive.
 */
function relayMaskTransform(
  context: GraphQLCompilerContext,
): GraphQLCompilerContext {
  return GraphQLIRTransformer.transform(
    context,
    {
      FragmentSpread: visitFragmentSpread,
    },
    () => STATE,
  );
}

function visitFragmentSpread(
  fragmentSpread: FragmentSpread,
  state: State,
): FragmentSpread {
  if (!hasRelayMaskFalseDirective(fragmentSpread)) {
    return fragmentSpread;
  }
  invariant(
    fragmentSpread.args.length === 0,
    'RelayMaskTransform: Cannot flatten fragment spread `%s` with ' +
      'arguments. Use the `ApplyFragmentArgumentTransform` before flattening',
    fragmentSpread.name,
  );
  const fragment: ?Node = this.getContext().get(fragmentSpread.name);
  invariant(
    fragment && fragment.kind === 'Fragment',
    'RelayMaskTransform: Unknown fragment `%s`.',
    fragmentSpread.name,
  );
  const result: InlineFragment = {
    kind: 'InlineFragment',
    directives: fragmentSpread.directives,
    metadata: fragmentSpread.metadata,
    selections: fragment.selections,
    typeCondition: fragment.type,
  };

  return this.traverse(result, state);
}

function hasRelayMaskFalseDirective(fragmentSpread: FragmentSpread): boolean {
  const relayDirective = fragmentSpread.directives.find(
    ({name}) => name === 'relay',
  );
  if (!relayDirective) {
    return false;
  }
  const {mask} = getLiteralArgumentValues(relayDirective.args);
  return mask === false;
}

module.exports = {
  transform: relayMaskTransform,
};

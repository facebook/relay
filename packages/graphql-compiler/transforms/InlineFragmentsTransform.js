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

const GraphQLCompilerContext = require('../core/GraphQLCompilerContext');
const GraphQLIRTransformer = require('../core/GraphQLIRTransformer');

const invariant = require('invariant');

import type {
  InlineFragment,
  Fragment,
  FragmentSpread,
  LinkedField,
  MatchField,
  MatchFragmentSpread,
} from '../core/GraphQLIR';

type State = {};
const STATE = {};

/**
 * A transform that inlines all fragments and removes them.
 */
function inlineFragmentsTransform(
  context: GraphQLCompilerContext,
): GraphQLCompilerContext {
  return GraphQLIRTransformer.transform(
    context,
    {
      Fragment: visitFragment,
      FragmentSpread: visitFragmentSpread,
      MatchField: visitMatchField,
      MatchFragmentSpread: visitFragmentSpread,
    },
    () => STATE,
  );
}

function visitFragment(fragment: Fragment, state: State): ?Fragment {
  return null;
}

/**
 * Transform a MatchField into a LinkedField. For normalizaiton, we can treat
 * MatchFields exactly like LinkFields
 */
function visitMatchField(field: MatchField, state: State): ?MatchField {
  const linkedField: LinkedField = {
    kind: 'LinkedField',
    alias: field.alias,
    name: field.name,
    args: field.args,
    directives: field.directives,
    handles: field.handles,
    metadata: field.metadata,
    selections: field.selections,
    type: field.type,
  };

  return this.traverse(linkedField, state);
}

function visitFragmentSpread<T: FragmentSpread | MatchFragmentSpread>(
  fragmentSpread: T,
  state: State,
): T {
  invariant(
    fragmentSpread.args.length === 0,
    'InlineFragmentsTransform: Cannot flatten fragment spread `%s` with ' +
      'arguments. Use the `ApplyFragmentArgumentTransform` before flattening',
    fragmentSpread.name,
  );
  const fragment = this.getContext().getFragment(fragmentSpread.name);
  const result: InlineFragment = {
    kind: 'InlineFragment',
    directives: fragmentSpread.directives,
    metadata: fragmentSpread.metadata,
    selections: fragment.selections,
    typeCondition: fragment.type,
  };

  return this.traverse(result, state);
}

module.exports = {
  transform: inlineFragmentsTransform,
};

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

/**
 * A transform that inlines all fragments and removes them.
 */
function inlineFragmentsTransform(
  context: GraphQLCompilerContext,
): GraphQLCompilerContext {
  return GraphQLIRTransformer.transform(context, {
    Fragment: visitFragment,
    FragmentSpread: visitFragmentSpread,
    MatchField: visitMatchField,
  });
}

function visitFragment(fragment: Fragment): ?Fragment {
  return null;
}

function visitFragmentSpread<T: FragmentSpread | MatchFragmentSpread>(
  fragmentSpread: T,
): ?T {
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

  return this.traverse(result);
}

/**
 * Transform a MatchField into a LinkedField. For normalization, we can treat
 * MatchFields exactly like LinkFields
 */
function visitMatchField(field: MatchField): ?MatchField {
  // Allow opting out of inlining in order to test future runtime behavior...
  if (field.metadata?.experimental_skipInlineDoNotUse) {
    return this.traverse(field);
  }
  // ...but default to inlining MatchFragmentSpreads as InlineFragments
  const nextSelections = [];
  field.selections.forEach(selection => {
    if (selection.kind === 'MatchFragmentSpread') {
      const inlineFragment = visitFragmentSpread.call(this, selection);
      if (inlineFragment != null) {
        nextSelections.push(inlineFragment);
      }
    } else {
      nextSelections.push(selection);
    }
  });
  // and MatchFields as LinkedFields
  const linkedField: LinkedField = {
    kind: 'LinkedField',
    alias: field.alias,
    name: field.name,
    args: field.args,
    directives: field.directives,
    handles: field.handles,
    metadata: field.metadata,
    selections: nextSelections,
    type: field.type,
  };
  return this.traverse(linkedField);
}

module.exports = {
  transform: inlineFragmentsTransform,
};

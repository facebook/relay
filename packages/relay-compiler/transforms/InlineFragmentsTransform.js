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

import type {InlineFragment, Fragment, FragmentSpread} from '../core/GraphQLIR';

type FragmentVisitorCache = Map<FragmentSpread, FragmentSpread>;
type FragmentVisitor = (fragmentSpread: FragmentSpread) => ?FragmentSpread;
/**
 * A transform that inlines all fragments and removes them.
 */
function inlineFragmentsTransform(
  context: GraphQLCompilerContext,
): GraphQLCompilerContext {
  const visitFragmentSpread = fragmentSpreadVisitor(new Map());
  return GraphQLIRTransformer.transform(context, {
    Fragment: visitFragment,
    FragmentSpread: visitFragmentSpread,
  });
}

function visitFragment(fragment: Fragment): null {
  return null;
}

function fragmentSpreadVisitor(cache: FragmentVisitorCache): FragmentVisitor {
  return function visitFragmentSpread(fragmentSpread: FragmentSpread) {
    let traverseResult = cache.get(fragmentSpread);
    if (traverseResult != null) {
      return traverseResult;
    }
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
      loc: {kind: 'Derived', source: fragmentSpread.loc},
      metadata: fragmentSpread.metadata,
      selections: fragment.selections,
      typeCondition: fragment.type,
    };
    traverseResult = this.traverse(result);
    cache.set(fragmentSpread, traverseResult);
    return traverseResult;
  };
}

module.exports = {
  transform: inlineFragmentsTransform,
};

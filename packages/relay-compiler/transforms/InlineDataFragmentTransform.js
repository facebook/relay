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

const GraphQLIRTransformer = require('../core/GraphQLIRTransformer');

const {createUserError} = require('../core/RelayCompilerError');

import type GraphQLCompilerContext from '../core/GraphQLCompilerContext';
import type {
  Fragment,
  FragmentSpread,
  InlineDataFragmentSpread,
} from '../core/GraphQLIR';

const SCHEMA_EXTENSION = `
directive @inline on FRAGMENT_DEFINITION
`;

/**
 * A transform that converts fragment spreads where the referenced fragment
 * is annotated with @inline to a InlineDataFragmentSpread.
 * InlineDataFragmentSpreads have the selections of the referenced fragment inlined.
 */
function inlineDataFragmentTransform(
  context: GraphQLCompilerContext,
): GraphQLCompilerContext {
  return GraphQLIRTransformer.transform(context, {
    // $FlowFixMe - this visitor intentionally changes node types
    FragmentSpread: visitFragmentSpread,
    Fragment: visitFragment,
  });
}

function visitFragment(fragment: Fragment): Fragment {
  const transformedFragment = this.traverse(fragment);

  const inlineDirective = transformedFragment.directives.find(
    directive => directive.name === 'inline',
  );
  if (inlineDirective == null) {
    return transformedFragment;
  }
  return {
    ...transformedFragment,
    directives: transformedFragment.directives.filter(
      directive => directive !== inlineDirective,
    ),
    metadata: {
      ...(transformedFragment.metadata || {}),
      inlineData: true,
    },
  };
}

function visitFragmentSpread(
  fragmentSpread: FragmentSpread,
): FragmentSpread | InlineDataFragmentSpread {
  const transformedNode: FragmentSpread = this.traverse(fragmentSpread);

  const context: GraphQLCompilerContext = this.getContext();
  const fragment = context.get(transformedNode.name);
  if (
    !fragment ||
    fragment.kind !== 'Fragment' ||
    !fragment.directives.some(directive => directive.name === 'inline')
  ) {
    return transformedNode;
  }

  if (
    fragment.argumentDefinitions.length > 0 ||
    fragmentSpread.args.length > 0
  ) {
    throw createUserError(
      'Variables are not yet supported inside @inline fragments.',
      [fragment.argumentDefinitions[0].loc],
    );
  }

  if (fragmentSpread.directives.length > 0) {
    throw createUserError(
      'Directives on fragment spreads for @inline fragments are not yet ' +
        'supported',
      [fragmentSpread.loc],
    );
  }

  return this.traverse(
    ({
      kind: 'InlineDataFragmentSpread',
      loc: transformedNode.loc,
      metadata: transformedNode.metadata,
      name: transformedNode.name,
      selections: [
        {
          directives: [],
          kind: 'InlineFragment',
          loc: {kind: 'Derived', source: transformedNode.loc},
          metadata: null,
          selections: fragment.selections,
          typeCondition: fragment.type,
        },
      ],
    }: InlineDataFragmentSpread),
  );
}

module.exports = {
  SCHEMA_EXTENSION,
  transform: inlineDataFragmentTransform,
};

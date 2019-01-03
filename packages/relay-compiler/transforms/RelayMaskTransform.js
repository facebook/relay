/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * All rights reserved.
 *
 * @flow
 * @format
 */

'use strict';

const CompilerContext = require('../core/GraphQLCompilerContext');
const IRTransformer = require('../core/GraphQLIRTransformer');

const invariant = require('invariant');

const {isTypeSubTypeOf, GraphQLSchema} = require('graphql');

import type {
  Fragment,
  FragmentSpread,
  InlineFragment,
  ArgumentDefinition,
} from '../core/GraphQLIR';

type State = {
  reachableArguments: Array<{
    argDef: ArgumentDefinition,
    source: string /* fragment spread name */,
  }>,
};

/**
 * A transform that inlines fragment spreads with the @relay(mask: false)
 * directive.
 */
function relayMaskTransform(context: CompilerContext): CompilerContext {
  return IRTransformer.transform(
    context,
    {
      FragmentSpread: visitFragmentSpread,
      Fragment: visitFragment,
    },
    () => ({
      reachableArguments: [],
    }),
  );
}

function visitFragment(fragment: Fragment, state: State): Fragment {
  const result = this.traverse(fragment, state);
  if (state.reachableArguments.length === 0) {
    return result;
  }
  const schema = this.getContext().serverSchema;
  const joinedArgumentDefinitions = joinFragmentArgumentDefinitions(
    schema,
    fragment,
    state.reachableArguments,
  );
  return {
    ...result,
    argumentDefinitions: joinedArgumentDefinitions,
  };
}

function visitFragmentSpread(
  fragmentSpread: FragmentSpread,
  state: State,
): FragmentSpread {
  if (!isUnmaskedSpread(fragmentSpread)) {
    return fragmentSpread;
  }
  invariant(
    fragmentSpread.args.length === 0,
    'RelayMaskTransform: Cannot unmask fragment spread `%s` with ' +
      'arguments. Use the `ApplyFragmentArgumentTransform` before flattening',
    fragmentSpread.name,
  );
  const context = this.getContext();
  const fragment = context.getFragment(fragmentSpread.name);
  const result: InlineFragment = {
    kind: 'InlineFragment',
    directives: fragmentSpread.directives,
    loc: {kind: 'Derived', source: fragmentSpread.loc},
    metadata: fragmentSpread.metadata,
    selections: fragment.selections,
    typeCondition: fragment.type,
  };

  invariant(
    !fragment.argumentDefinitions.find(
      argDef => argDef.kind === 'LocalArgumentDefinition',
    ),
    'RelayMaskTransform: Cannot unmask fragment spread `%s` because it has local ' +
      'argument definition.',
    fragmentSpread.name,
  );

  // Note: defer validating arguments to the containing fragment in order
  // to list all invalid variables/arguments instead of only one.
  for (const argDef of fragment.argumentDefinitions) {
    state.reachableArguments.push({
      argDef: argDef,
      source: fragmentSpread.name,
    });
  }
  return this.traverse(result, state);
}

/**
 * @private
 */
function isUnmaskedSpread(spread: FragmentSpread): boolean {
  return Boolean(spread.metadata && spread.metadata.mask === false);
}

/**
 * @private
 *
 * Attempts to join the argument definitions for a root fragment
 * and any unmasked fragment spreads reachable from that root fragment,
 * returning a combined list of arguments or throwing if the same
 * variable(s) are used in incompatible ways in different fragments.
 */
function joinFragmentArgumentDefinitions(
  schema: GraphQLSchema,
  fragment: Fragment,
  reachableArguments: $ReadOnlyArray<{
    argDef: ArgumentDefinition,
    source: string,
  }>,
): Array<ArgumentDefinition> {
  const joinedArgumentDefinitions = new Map();
  fragment.argumentDefinitions.forEach(prevArgDef => {
    joinedArgumentDefinitions.set(prevArgDef.name, prevArgDef);
  });
  const errors = [];
  reachableArguments.forEach(nextArg => {
    const {argDef: nextArgDef, source} = nextArg;
    const prevArgDef = joinedArgumentDefinitions.get(nextArgDef.name);
    if (prevArgDef) {
      const joinedArgDef = joinArgumentDefinition(
        schema,
        prevArgDef,
        nextArgDef,
      );
      if (joinedArgDef === null) {
        errors.push(`Variable \`\$${nextArgDef.name}\` in \`${source}\``);
      } else {
        joinedArgumentDefinitions.set(joinedArgDef.name, joinedArgDef);
      }
    } else {
      joinedArgumentDefinitions.set(nextArgDef.name, nextArgDef);
    }
  });
  if (errors.length) {
    throw new Error(
      'RelayMaskTransform: Cannot unmask one or more fragments in ' +
        `\`${fragment.name}\`, the following variables are referenced more ` +
        'than once with incompatible kinds/types:\n' +
        errors.map(msg => `* ${msg}`).join('\n'),
    );
  }
  return Array.from(joinedArgumentDefinitions.values());
}

/**
 * @private
 *
 * Attempts to join two argument definitions, returning a single argument
 * definition that is compatible with both of the inputs:
 * - If the kind, name, or defaultValue is different then the arguments
 *   cannot be joined, indicated by returning null.
 * - If either of next/prev is a subtype of the other, return the one
 *   that is the subtype: a more narrow type can flow into a more general
 *   type but not the inverse.
 * - Otherwise there is no subtyping relation between prev/next, so return
 *   null to indicate they cannot be joined.
 */
function joinArgumentDefinition(
  schema: GraphQLSchema,
  prevArgDef: ArgumentDefinition,
  nextArgDef: ArgumentDefinition,
): ArgumentDefinition | null {
  if (
    prevArgDef.kind !== nextArgDef.kind ||
    prevArgDef.name !== nextArgDef.name ||
    // Only LocalArgumentDefinition defines defaultValue
    (prevArgDef: any).defaultValue !== (nextArgDef: any).defaultValue
  ) {
    return null;
  } else if (isTypeSubTypeOf(schema, nextArgDef.type, prevArgDef.type)) {
    // prevArgDef is less strict than nextArgDef
    return nextArgDef;
  } else if (isTypeSubTypeOf(schema, prevArgDef.type, nextArgDef.type)) {
    return prevArgDef;
  } else {
    return null;
  }
}

module.exports = {
  transform: relayMaskTransform,
};

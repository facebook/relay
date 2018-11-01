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

const invariant = require('invariant');

const {CompilerContext, IRTransformer} = require('graphql-compiler');

const {isTypeSubTypeOf, GraphQLSchema} = require('graphql');

import type {
  Fragment,
  FragmentSpread,
  InlineFragment,
  ArgumentDefinition,
} from 'graphql-compiler';

type State = {
  hoistedArgDefs: Map<
    string /* argument name */,
    {
      argDef: ArgumentDefinition,
      source: string /* fragment spread name */,
    },
  >,
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
      hoistedArgDefs: new Map(),
    }),
  );
}

function visitFragment(fragment: Fragment, state: State): Fragment {
  const result = this.traverse(fragment, state);
  if (state.hoistedArgDefs.size === 0) {
    return result;
  }
  const schema = this.getContext().serverSchema;
  const combinedArgDefs = new Map();
  result.argumentDefinitions.forEach(argDef => {
    combinedArgDefs.set(argDef.name, argDef);
  });

  state.hoistedArgDefs.forEach((hoistedArgDef, argName) => {
    const existingArgDef = combinedArgDefs.get(argName);
    let newArgDef = hoistedArgDef.argDef;
    if (existingArgDef) {
      newArgDef = findCompatibleArgDef(
        existingArgDef,
        hoistedArgDef.argDef,
        schema,
      );
      invariant(
        newArgDef != null,
        'RelayMaskTransform: Cannot unmask fragment spread `%s` because ' +
          'argument `%s` has been declared in `%s` and they are not the same.',
        hoistedArgDef.source,
        argName,
        fragment.name,
      );
    }
    combinedArgDefs.set(argName, newArgDef);
  });
  return {
    ...result,
    argumentDefinitions: [...combinedArgDefs.values()],
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
  const schema = context.serverSchema;
  const result: InlineFragment = {
    kind: 'InlineFragment',
    directives: fragmentSpread.directives,
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

  for (const argDef of fragment.argumentDefinitions) {
    const hoistedArgDef = state.hoistedArgDefs.get(argDef.name);
    let newArgDef = argDef;
    if (hoistedArgDef) {
      newArgDef = findCompatibleArgDef(hoistedArgDef.argDef, argDef, schema);
      invariant(
        newArgDef != null,
        'RelayMaskTransform: Cannot unmask fragment spread `%s` because ' +
          'argument `%s` has been declared in `%s` and they are not the same.',
        hoistedArgDef.source,
        argDef.name,
        fragmentSpread.name,
      );
    }
    state.hoistedArgDefs.set(argDef.name, {
      argDef: newArgDef,
      source: fragmentSpread.name,
    });
  }
  return this.traverse(result, state);
}

function isUnmaskedSpread(spread: FragmentSpread): boolean {
  return Boolean(spread.metadata && spread.metadata.mask === false);
}

function findCompatibleArgDef(
  prevArgDef: ArgumentDefinition,
  nextArgDef: ArgumentDefinition,
  schema: GraphQLSchema,
): ?ArgumentDefinition {
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

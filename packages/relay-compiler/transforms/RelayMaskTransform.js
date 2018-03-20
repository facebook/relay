/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * All rights reserved.
 *
 * @providesModule RelayMaskTransform
 * @flow
 * @format
 */

'use strict';

const invariant = require('invariant');

const {
  CompilerContext,
  IRTransformer,
  isEquivalentType,
} = require('graphql-compiler');

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
  /* $FlowFixMe(>=0.68.0 site=react_native_fb,react_native_oss) This comment
   * suppresses an error found when Flow v0.68 was deployed. To see the error
   * delete this comment and run Flow. */
  if (state.hoistedArgDefs.length === 0) {
    return result;
  }
  const existingArgDefs = new Map();
  result.argumentDefinitions.forEach(argDef => {
    existingArgDefs.set(argDef.name, argDef);
  });
  const combinedArgDefs = result.argumentDefinitions.slice(); // Copy array
  state.hoistedArgDefs.forEach((hoistedArgDef, argName) => {
    const existingArgDef = existingArgDefs.get(argName);
    if (existingArgDef) {
      invariant(
        areSameArgumentDefinitions(existingArgDef, hoistedArgDef.argDef),
        'RelayMaskTransform: Cannot unmask fragment spread `%s` because ' +
          'argument `%s` has been declared in `%s` and they are not the same.',
        hoistedArgDef.source,
        argName,
        fragment.name,
      );
      return;
    }
    combinedArgDefs.push(hoistedArgDef.argDef);
  });
  return {
    ...result,
    argumentDefinitions: combinedArgDefs,
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
  const fragment = this.getContext().getFragment(fragmentSpread.name);
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
    if (hoistedArgDef) {
      invariant(
        areSameArgumentDefinitions(argDef, hoistedArgDef.argDef),
        'RelayMaskTransform: Cannot unmask fragment spread `%s` because ' +
          'argument `%s` has been declared in `%s` and they are not the same.',
        hoistedArgDef.source,
        argDef.name,
        fragmentSpread.name,
      );
      continue;
    }
    state.hoistedArgDefs.set(argDef.name, {
      argDef,
      source: fragmentSpread.name,
    });
  }
  return this.traverse(result, state);
}

function isUnmaskedSpread(spread: FragmentSpread): boolean {
  return Boolean(spread.metadata && spread.metadata.mask === false);
}

function areSameArgumentDefinitions(
  argDef1: ArgumentDefinition,
  argDef2: ArgumentDefinition,
) {
  return (
    argDef1.kind === argDef2.kind &&
    argDef1.name === argDef2.name &&
    isEquivalentType(argDef1.type, argDef2.type) &&
    // Only LocalArgumentDefinition defines defaultValue
    (argDef1: any).defaultValue === (argDef2: any).defaultValue
  );
}

module.exports = {
  transform: relayMaskTransform,
};

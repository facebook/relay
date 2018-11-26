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

const {
  CompilerContext,
  IRTransformer,
  SplitNaming,
} = require('graphql-compiler');

import type {MatchFragmentSpread, SplitOperation} from 'graphql-compiler';

type State = Map<string, SplitOperation>;

/**
 * This transform finds MatchFragmentSpread nodes and adds a SplitOperation root
 * node to the context for each of them.
 */
function relaySplitMatchTransform(context: CompilerContext): CompilerContext {
  const splitOperations = new Map();
  const transformedContext = IRTransformer.transform(
    context,
    {
      MatchFragmentSpread: visitMatchFragmentSpread,
    },
    () => splitOperations,
  );
  return transformedContext.addAll(Array.from(splitOperations.values()));
}

function visitMatchFragmentSpread(
  node: MatchFragmentSpread,
  state: State,
): MatchFragmentSpread {
  const transformedNode = this.traverse(node, state);
  const context: CompilerContext = this.getContext();
  const fragment = context.getFragment(transformedNode.name);
  const splitOperation: SplitOperation = {
    kind: 'SplitOperation',
    name: SplitNaming.getAnnotatedName(transformedNode.name, 'normalization'),
    selections: fragment.selections,
    metadata: null,
    type: fragment.type,
  };
  state.set(node.name, splitOperation);
  return transformedNode;
}

module.exports = {
  transform: relaySplitMatchTransform,
};

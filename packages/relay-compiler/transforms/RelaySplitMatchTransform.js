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

import type {MatchBranch, SplitOperation} from 'graphql-compiler';

type State = Map<string, SplitOperation>;

/**
 * This transform finds MatchBranch nodes and adds a SplitOperation root
 * node to the context for each of them.
 */
function relaySplitMatchTransform(context: CompilerContext): CompilerContext {
  const splitOperations = new Map();
  const transformedContext = IRTransformer.transform(
    context,
    {
      MatchBranch: visitMatchBranch,
    },
    () => splitOperations,
  );
  return transformedContext.addAll(Array.from(splitOperations.values()));
}

function visitMatchBranch(node: MatchBranch, state: State): MatchBranch {
  const transformedNode = this.traverse(node, state);
  const splitOperation: SplitOperation = {
    kind: 'SplitOperation',
    name: SplitNaming.getAnnotatedName(transformedNode.name, 'normalization'),
    selections: transformedNode.selections,
    metadata: null,
    type: transformedNode.type,
  };
  state.set(node.name, splitOperation);
  return transformedNode;
}

module.exports = {
  transform: relaySplitMatchTransform,
};

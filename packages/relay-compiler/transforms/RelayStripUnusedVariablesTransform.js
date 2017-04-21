/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayStripUnusedVariablesTransform
 * @flow
 */

'use strict';

const RelayCompilerContext = require('RelayCompilerContext');
const RelayIRTransformer = require('RelayIRTransformer');

const filterContextForNode = require('filterContextForNode');

import type {Argument, Condition, Root} from 'RelayIR';

type State = {referencedVariables: Set<string>};

/**
 * A transform that removes variables from root queries that aren't referenced
 * by the query itself.
 */
function transform(context: RelayCompilerContext): RelayCompilerContext {
  return context.documents().reduce((ctx: RelayCompilerContext, node) => {
    return ctx.add(node.kind === 'Root' ? transformRoot(context, node) : node);
  }, new RelayCompilerContext(context.schema));
}

function transformRoot(context: RelayCompilerContext, root: Root): Root {
  const state = {
    referencedVariables: new Set(),
  };
  const newContext = RelayIRTransformer.transform(
    filterContextForNode(root, context),
    {
      Argument: visitArgument,
      Condition: visitCondition,
    },
    () => state
  );
  const transformedNode = newContext.getRoot(root.name);
  /**
   * Remove the extraneous arguments *after* transform returns, since fragments
   * could be transformed after the root query.
   */
  return {
    ...transformedNode,
    argumentDefinitions: transformedNode.argumentDefinitions.filter(arg => {
      return state.referencedVariables.has(arg.name);
    }),
  };
}

function visitArgument(argument: Argument, state: State): Argument {
  const {value} = argument;
  if (value.kind === 'Variable') {
    state.referencedVariables.add(value.variableName);
  }
  return argument;
}

function visitCondition(condition: Condition, state: State): Condition {
  const innerCondition = condition.condition;
  if (innerCondition.kind === 'Variable') {
    state.referencedVariables.add(innerCondition.variableName);
  }
  return condition;
}

module.exports = {transform};

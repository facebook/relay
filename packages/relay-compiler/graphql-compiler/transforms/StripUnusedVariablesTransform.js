/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule StripUnusedVariablesTransform
 * @flow
 * @format
 */

'use strict';

const GraphQLCompilerContext = require('../core/GraphQLCompilerContext');
const GraphQLIRTransformer = require('../core/GraphQLIRTransformer');

const filterContextForNode = require('../core/filterContextForNode');

import type {Argument, Condition, Root} from '../core/GraphQLIR';

type State = {referencedVariables: Set<string>};

/**
 * A transform that removes variables from root queries that aren't referenced
 * by the query itself.
 */
function stripUnusedVariablesTransform(
  context: GraphQLCompilerContext,
): GraphQLCompilerContext {
  return GraphQLIRTransformer.transform(context, {
    Root: root => transformRoot(context, root),
    // Include fragments, but do not traverse into them.
    Fragment: id => id,
  });
}

function transformRoot(context: GraphQLCompilerContext, root: Root): Root {
  const state = {
    referencedVariables: new Set(),
  };
  const newContext = GraphQLIRTransformer.transform(
    filterContextForNode(root, context),
    {
      Argument: visitArgument,
      Condition: visitCondition,
    },
    () => state,
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

module.exports = {
  transform: stripUnusedVariablesTransform,
};

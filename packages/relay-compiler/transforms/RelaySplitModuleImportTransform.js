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

const CompilerContext = require('../core/GraphQLCompilerContext');
const IRTransformer = require('../core/GraphQLIRTransformer');

const getNormalizationOperationName = require('../core/getNormalizationOperationName');

import type {
  LinkedField,
  InlineFragment,
  ModuleImport,
  SplitOperation,
} from '../core/GraphQLIR';
import type {GraphQLCompositeType} from 'graphql';

type State = {|
  parentType: GraphQLCompositeType,
  splitOperations: Map<string, SplitOperation>,
|};

/**
 * This transform creates a SplitOperation root for every ModuleImport.
 */
function relaySplitMatchTransform(context: CompilerContext): CompilerContext {
  const splitOperations = new Map();
  const transformedContext = IRTransformer.transform(
    context,
    {
      LinkedField: visitLinkedField,
      InlineFragment: visitInlineFragment,
      ModuleImport: visitModuleImport,
    },
    node => ({parentType: node.type, splitOperations}),
  );
  return transformedContext.addAll(Array.from(splitOperations.values()));
}

function visitLinkedField(field: LinkedField, state: State): LinkedField {
  return this.traverse(field, {
    parentType: field.type,
    splitOperations: state.splitOperations,
  });
}

function visitInlineFragment(
  fragment: InlineFragment,
  state: State,
): InlineFragment {
  return this.traverse(fragment, {
    parentType: fragment.typeCondition,
    splitOperations: state.splitOperations,
  });
}

function visitModuleImport(node: ModuleImport, state: State): ModuleImport {
  // It's possible for the same fragment to be selected in multiple usages
  // of @module: skip processing a node if its SplitOperation has already
  // been generated
  const normalizationName = getNormalizationOperationName(node.name);
  if (state.splitOperations.has(normalizationName)) {
    return node;
  }
  const transformedNode = this.traverse(node, state);
  const splitOperation: SplitOperation = {
    kind: 'SplitOperation',
    name: normalizationName,
    selections: transformedNode.selections,
    loc: {kind: 'Derived', source: node.loc},
    metadata: {
      derivedFrom: transformedNode.name,
    },
    type: state.parentType,
  };
  state.splitOperations.set(normalizationName, splitOperation);
  return transformedNode;
}

module.exports = {
  transform: relaySplitMatchTransform,
};

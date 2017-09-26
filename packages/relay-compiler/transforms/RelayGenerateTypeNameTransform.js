/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @providesModule RelayGenerateTypeNameTransform
 */

'use strict';

const {
  CompilerContext,
  SchemaUtils,
} = require('../graphql-compiler/GraphQLCompilerPublic');
const {hasUnaliasedSelection} = require('./RelayTransformUtils');
const {assertLeafType} = require('graphql');

import type {LinkedField, Node} from '../graphql-compiler/GraphQLCompilerPublic';

const {isAbstractType} = SchemaUtils;

const TYPENAME_KEY = '__typename';
const STRING_TYPE = 'String';

/**
 * A transform that adds `__typename` field on any `LinkedField` of a union/interface type where
 * there is no unaliased `__typename` selection. The `__typename` field is guaranteed to be put in
 * the first place of the selections.
 */

function transform(context: CompilerContext): CompilerContext {
  const documents = context.documents();
  return documents.reduce((ctx: CompilerContext, node) => {
    const transformedNode = transformNode(context, node);
    return ctx.add(transformedNode);
  }, new CompilerContext(context.schema));
}

function transformNode<T: Node>(context: CompilerContext, node: T): T {
  const selections = node.selections.map(selection => {
    if (selection.kind === 'LinkedField') {
      return transformField(context, selection);
    } else if (
      selection.kind === 'InlineFragment' ||
      selection.kind === 'Condition'
    ) {
      return transformNode(context, selection);
    } else {
      return selection;
    }
  });
  return ({
    ...node,
    selections: sortSelections(selections),
  }: $FlowIssue);
}

function transformField(
  context: CompilerContext,
  field: LinkedField,
): LinkedField {
  const transformedNode = transformNode(context, field);
  const {type} = field;
  const generatedSelections = [...transformedNode.selections];
  if (isAbstractType(type) && !hasUnaliasedSelection(field, TYPENAME_KEY)) {
    const stringType = assertLeafType(context.schema.getType(STRING_TYPE));
    generatedSelections.push({
      kind: 'ScalarField',
      alias: (null: ?string),
      args: [],
      directives: [],
      handles: null,
      metadata: null,
      name: TYPENAME_KEY,
      type: stringType,
    });
  }
  const selections = sortSelections(generatedSelections);
  return {
    ...transformedNode,
    selections,
  };
}

/**
 * @internal
 *
 * For interoperability with classic systems, sort `__typename` first.
 */
function sortSelections(selections: Array<$FlowIssue>): Array<$FlowIssue> {
  return [...selections].sort((a, b) => {
    return (a.kind === 'ScalarField') && (a.name === TYPENAME_KEY)
      ? -1
      : (b.kind === 'ScalarField') && (b.name === TYPENAME_KEY) ? 1 : 0;
  });
}

module.exports = {transform};

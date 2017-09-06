/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @providesModule RelayGenerateTypeNameTransform
 */

'use strict';

const GraphQLCompilerContext = require('GraphQLCompilerContext');

const {isAbstractType} = require('GraphQLSchemaUtils');
const {hasUnaliasedSelection} = require('RelayTransformUtils');
const {assertLeafType} = require('graphql');

import type {LinkedField, Node} from 'GraphQLIR';

const TYPENAME_KEY = '__typename';
const STRING_TYPE = 'String';

/**
 * A transform that adds `__typename` field on any `LinkedField` of a union/interface type where
 * there is no unaliased `__typename` selection. The `__typename` field is guaranteed to be put in
 * the first place of the selections.
 */

function transform(context: GraphQLCompilerContext): GraphQLCompilerContext {
  const documents = context.documents();
  return documents.reduce((ctx: GraphQLCompilerContext, node) => {
    const transformedNode = transformNode(context, node);
    return ctx.add(transformedNode);
  }, new GraphQLCompilerContext(context.schema));
}

function transformNode<T: Node>(context: GraphQLCompilerContext, node: T): T {
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
  context: GraphQLCompilerContext,
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
  /* $FlowFixMe(>=0.54.0 site=react_native_fb) This comment suppresses an error
   * found when Flow v0.54 was deployed. To see the error delete this comment
   * and run Flow. */
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

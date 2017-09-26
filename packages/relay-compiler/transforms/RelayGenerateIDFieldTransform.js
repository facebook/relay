/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @providesModule RelayGenerateIDFieldTransform
 * @format
 */

'use strict';

const {
  CompilerContext,
  SchemaUtils,
} = require('../graphql-compiler/GraphQLCompilerPublic');
const {hasUnaliasedSelection} = require('./RelayTransformUtils');
const {
  assertAbstractType,
  assertCompositeType,
  assertLeafType,
} = require('graphql');

import type {
  InlineFragment,
  LinkedField,
  Node,
  Selection,
} from '../graphql-compiler/GraphQLCompilerPublic';
import type {GraphQLCompositeType, GraphQLLeafType, GraphQLType} from 'graphql';
const {
  canHaveSelections,
  getRawType,
  hasID,
  implementsInterface,
  isAbstractType,
  mayImplement,
} = SchemaUtils;

const ID = 'id';
const ID_TYPE = 'ID';
const NODE_TYPE = 'Node';

/**
 * A transform that adds "requisite" fields to all nodes:
 * - Adds an `id` selection on any `LinkedField` of type that implements `Node`
 *   or has an id field but where there is no unaliased `id` selection.
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
    selections,
  }: $FlowIssue);
}

function transformField(
  context: CompilerContext,
  field: LinkedField,
): LinkedField {
  const transformedNode = transformNode(context, field);
  const selections = [...transformedNode.selections];
  const idSelections = generateIDSelections(context, field, field.type);
  if (idSelections) {
    selections.push(...idSelections);
  }

  return {
    ...transformedNode,
    selections,
  };
}

/**
 * @internal
 *
 * Returns an array of zero or more selections to fetch `id` depending on the
 * type of the given field:
 * - If the field already has an unaliased `id` field, do nothing
 * - If the field type has an `id` subfield, return an `id` selection
 * - If the field type is abstract, then generate a `... on Node { id }`
 *   fragment if *any* concrete type implements Node. Then generate a
 *   `... on PossibleType { id }` for every concrete type that does *not*
 *   implement `Node`
 */
function generateIDSelections(
  context: CompilerContext,
  field: LinkedField,
  type: GraphQLType,
): ?Array<Selection> {
  if (hasUnaliasedSelection(field, ID)) {
    return null;
  }
  const unmodifiedType = assertCompositeType(getRawType(type));
  const generatedSelections = [];
  // Object or  Interface type that has `id` field
  if (
    canHaveSelections(unmodifiedType) &&
    hasID(context.schema, unmodifiedType)
  ) {
    const idType = assertLeafType(context.schema.getType(ID_TYPE));
    generatedSelections.push({
      kind: 'ScalarField',
      alias: (null: ?string),
      args: [],
      directives: [],
      handles: null,
      metadata: null,
      name: ID,
      type: idType,
    });
  } else if (isAbstractType(unmodifiedType)) {
    // Union or interface: concrete types may implement `Node` or have an `id`
    // field
    const idType = assertLeafType(context.schema.getType(ID_TYPE));
    if (mayImplement(context.schema, unmodifiedType, NODE_TYPE)) {
      const nodeType = assertCompositeType(context.schema.getType(NODE_TYPE));
      generatedSelections.push(buildIdFragment(nodeType, idType));
    }
    const abstractType = assertAbstractType(unmodifiedType);
    context.schema.getPossibleTypes(abstractType).forEach(possibleType => {
      if (
        !implementsInterface(possibleType, NODE_TYPE) &&
        hasID(context.schema, possibleType)
      ) {
        generatedSelections.push(buildIdFragment(possibleType, idType));
      }
    });
  }
  return generatedSelections;
}

/**
 * @internal
 */
function buildIdFragment(
  fragmentType: GraphQLCompositeType,
  idType: GraphQLLeafType,
): InlineFragment {
  return {
    kind: 'InlineFragment',
    directives: [],
    metadata: null,
    typeCondition: fragmentType,
    selections: [
      {
        kind: 'ScalarField',
        alias: (null: ?string),
        args: [],
        directives: [],
        handles: null,
        metadata: null,
        name: ID,
        type: idType,
      },
    ],
  };
}

module.exports = {transform};

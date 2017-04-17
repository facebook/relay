/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @providesModule RelayGenerateRequisiteFieldsTransform
 */

'use strict';

const RelayCompilerContext = require('RelayCompilerContext');
const RelaySchemaUtils = require('RelaySchemaUtils');

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
} from 'RelayIR';
import type {
  GraphQLCompositeType,
  GraphQLLeafType,
  GraphQLType,
} from 'graphql';
const {
  canHaveSelections,
  getRawType,
  hasID,
  implementsInterface,
  isAbstractType,
  mayImplement,
} = RelaySchemaUtils;

const TYPENAME_KEY = '__typename';
const ID = 'id';
const ID_TYPE = 'ID';
const NODE_TYPE = 'Node';
const STRING_TYPE = 'String';

/**
 * A transform that adds "requisite" fields to all nodes:
 * - Adds an `id` selection on any `LinkedField` of type that implements `Node`
 *   or has an id field but where there is no unaliased `id` selection.
 * - Adds `__typename` on any `LinkedField` of a union/interface type where
 *   there is no unaliased `__typename` selection.
 */
function transform(context: RelayCompilerContext): RelayCompilerContext {
  const documents = context.documents();
  /* $FlowFixMe(>=0.44.0 site=react_native_fb) Flow error found while deploying
   * v0.44.0. Remove this comment to see the error */
  return documents.reduce((ctx, node) => {
    const transformedNode = transformNode(context, node);
    /* $FlowFixMe(>=0.44.0 site=react_native_fb) Flow error found while
     * deploying v0.44.0. Remove this comment to see the error */
    return ctx.add(transformedNode);
  }, new RelayCompilerContext(context.schema));
}

function transformNode<T: Node>(
  context: RelayCompilerContext,
  node: T
): T {
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
  context: RelayCompilerContext,
  field: LinkedField
): LinkedField {
  const transformedNode = transformNode(context, field);
  const {type} = field;
  const generatedSelections = [...transformedNode.selections];
  const idSelections = generateIDSelections(context, field, field.type);
  if (idSelections) {
    generatedSelections.push(...idSelections);
  }
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
  context: RelayCompilerContext,
  field: LinkedField,
  type: GraphQLType,
): ?Array<Selection> {
  if (hasUnaliasedSelection(field, ID)) {
    return null;
  }
  const unmodifiedType = assertCompositeType(getRawType(type));
  const generatedSelections = [];
  // Object or  Interface type that has `id` field
  if (canHaveSelections(unmodifiedType) && hasID(context.schema, unmodifiedType)) {
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
    selections: [{
      kind: 'ScalarField',
      alias: (null: ?string),
      args: [],
      directives: [],
      handles: null,
      metadata: null,
      name: ID,
      type: idType,
    }],
  };
}

/**
 * @internal
 */
function hasUnaliasedSelection(field: LinkedField, fieldName: string): boolean {
  return field.selections.some(selection => (
    selection.kind === 'ScalarField' &&
    selection.alias == null &&
    selection.name === fieldName
  ));
}

/**
 * @internal
 *
 * For interoperability with classic systems, sort `__typename` first.
 */
function sortSelections(selections: Array<$FlowIssue>): Array<$FlowIssue> {
  return [...selections].sort((a, b) => {
    return a.kind === 'ScalarField' && a.name === TYPENAME_KEY ? -1 :
      b.kind === 'ScalarField' && b.name === TYPENAME_KEY ? 1 :
        0;
  });
}

module.exports = {transform};

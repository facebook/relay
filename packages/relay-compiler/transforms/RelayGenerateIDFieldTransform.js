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

const IRTransformer = require('../core/GraphQLIRTransformer');
const SchemaUtils = require('../core/SchemaUtils');

const {hasUnaliasedSelection} = require('./RelayTransformUtils');

import type CompilerContext from '../core/GraphQLCompilerContext';
import type {InlineFragment, LinkedField, ScalarField} from '../core/GraphQLIR';
import type {TypeID} from '../core/Schema';
const {generateIDField} = SchemaUtils;

const ID = 'id';
const NODE_TYPE = 'Node';

type State = {
  idField: ScalarField,
};

/**
 * A transform that adds an `id` field on any type that has an id field but
 * where there is no unaliased `id` selection.
 */
function relayGenerateIDFieldTransform(
  context: CompilerContext,
): CompilerContext {
  const schema = context.getSchema();
  const idType = schema.expectIdType();
  const idField = generateIDField(idType);
  const state = {
    idField,
  };
  return IRTransformer.transform(
    context,
    {
      LinkedField: visitLinkedField,
    },
    () => state,
  );
}

function visitLinkedField(field: LinkedField, state: State): LinkedField {
  const transformedNode = this.traverse(field, state);

  // If the field already has an unaliased `id` field, do nothing
  if (hasUnaliasedSelection(field, ID)) {
    return transformedNode;
  }

  const context: CompilerContext = this.getContext();
  const schema = context.getSchema();
  const unmodifiedType = schema.assertCompositeType(
    schema.getRawType(field.type),
  );

  // If the field type has an `id` subfield add an `id` selection
  if (
    schema.canHaveSelections(unmodifiedType) &&
    schema.hasId(unmodifiedType)
  ) {
    return {
      ...transformedNode,
      selections: [...transformedNode.selections, state.idField],
    };
  }

  // If the field type is abstract, then generate a `... on Node { id }`
  // fragment if *any* concrete type implements Node. Then generate a
  // `... on PossibleType { id }` for every concrete type that does *not*
  // implement `Node`
  const nodeType = schema.getTypeFromString(NODE_TYPE);
  if (!nodeType) {
    return transformedNode;
  }

  if (schema.isAbstractType(unmodifiedType)) {
    const selections = [...transformedNode.selections];
    if (schema.mayImplement(unmodifiedType, nodeType)) {
      selections.push(buildIDFragment(nodeType, state.idField));
    }
    schema.getPossibleTypes(unmodifiedType).forEach((possibleType: TypeID) => {
      if (
        !schema.implementsInterface(
          possibleType,
          schema.expectTypeFromString(NODE_TYPE),
        ) &&
        schema.hasId(possibleType)
      ) {
        selections.push(buildIDFragment(possibleType, state.idField));
      }
    });
    return {
      ...transformedNode,
      selections,
    };
  }

  return transformedNode;
}

/**
 * @internal
 *
 * Returns IR for `... on FRAGMENT_TYPE { id }`
 */
function buildIDFragment(
  fragmentType: TypeID,
  idField: ScalarField,
): InlineFragment {
  return {
    kind: 'InlineFragment',
    directives: [],
    loc: {kind: 'Generated'},
    metadata: null,
    selections: [idField],
    typeCondition: fragmentType,
  };
}

module.exports = {
  transform: relayGenerateIDFieldTransform,
};

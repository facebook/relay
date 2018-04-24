/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const {hasUnaliasedSelection} = require('./RelayTransformUtils');
const {
  assertAbstractType,
  assertCompositeType,
  assertLeafType,
} = require('graphql');
const {
  CompilerContext,
  SchemaUtils,
  IRTransformer,
} = require('graphql-compiler');

import type {InlineFragment, LinkedField, ScalarField} from 'graphql-compiler';
import type {GraphQLCompositeType} from 'graphql';
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
  const idType = assertLeafType(context.serverSchema.getType(ID_TYPE));
  const idField: ScalarField = {
    kind: 'ScalarField',
    alias: (null: ?string),
    args: [],
    directives: [],
    handles: null,
    metadata: null,
    name: ID,
    type: idType,
  };
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

  const context = this.getContext();
  const schema = context.serverSchema;
  const unmodifiedType = assertCompositeType(getRawType(field.type));

  // If the field type has an `id` subfield add an `id` selection
  if (canHaveSelections(unmodifiedType) && hasID(schema, unmodifiedType)) {
    return {
      ...transformedNode,
      selections: [...transformedNode.selections, state.idField],
    };
  }

  // If the field type is abstract, then generate a `... on Node { id }`
  // fragment if *any* concrete type implements Node. Then generate a
  // `... on PossibleType { id }` for every concrete type that does *not*
  // implement `Node`
  if (isAbstractType(unmodifiedType)) {
    const selections = [...transformedNode.selections];
    if (mayImplement(schema, unmodifiedType, NODE_TYPE)) {
      const nodeType = assertCompositeType(schema.getType(NODE_TYPE));
      selections.push(buildIDFragment(nodeType, state.idField));
    }
    const abstractType = assertAbstractType(unmodifiedType);
    schema.getPossibleTypes(abstractType).forEach(possibleType => {
      if (
        !implementsInterface(possibleType, NODE_TYPE) &&
        hasID(schema, possibleType)
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
  fragmentType: GraphQLCompositeType,
  idField: ScalarField,
): InlineFragment {
  return {
    kind: 'InlineFragment',
    directives: [],
    metadata: null,
    typeCondition: fragmentType,
    selections: [idField],
  };
}

module.exports = {
  transform: relayGenerateIDFieldTransform,
};

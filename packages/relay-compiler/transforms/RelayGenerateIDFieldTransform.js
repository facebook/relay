/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const invariant = require('invariant');
const {hasSelection} = require('./RelayTransformUtils');
const {
  assertAbstractType,
  assertCompositeType,
  isInterfaceType,
  getNullableType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLSchema,
} = require('graphql');
const {
  CompilerContext,
  SchemaUtils,
  IRTransformer,
} = require('graphql-compiler');

import type {
  Fragment,
  InlineFragment,
  LinkedField,
  ScalarField,
} from 'graphql-compiler';
import type {GraphQLCompositeType, GraphQLField} from 'graphql';

const {
  canHaveSelections,
  getRawType,
  implementsInterface,
  isAbstractType,
  mayImplement,
} = SchemaUtils;

const ID = 'id';
const ID_KEY = '__id';
const ID_TYPE = 'ID';
const NODE_TYPE = 'Node';

/**
 * A transform that adds a `__id` field on any type that has a `Node` or `id`
 * field but where there is no unaliased `__id` selection.
 */
function relayGenerateIDFieldTransform(
  context: CompilerContext,
): CompilerContext {
  return IRTransformer.transform(context, {
    LinkedField: visitNodeWithSelections,
    Fragment: visitNodeWithSelections,
  });
}

function visitNodeWithSelections<T: Fragment | LinkedField>(node: T): T {
  const transformedNode = this.traverse(node);

  // If the field already has an `__id` selection, do nothing.
  if (hasSelection(node, ID_KEY)) {
    return transformedNode;
  }

  const context = this.getContext();
  const schema = context.serverSchema;
  const unmodifiedType = assertCompositeType(getRawType(node.type));
  const idFieldDefinition = getIDFieldDefinition(schema, unmodifiedType);

  // If the field type has a ID field add a selection for that field.
  if (idFieldDefinition && canHaveSelections(unmodifiedType)) {
    return {
      ...transformedNode,
      selections: [
        ...transformedNode.selections,
        buildSelectionFromFieldDefinition(idFieldDefinition),
      ],
    };
  }

  // - If the field type is abstract, then generate a `... on Node { __id: id }`
  //   fragment if *any* concrete type implements `Node`. Then generate a
  //   `... on PossibleType { __id: id }` for every concrete type that does
  //   *not* implement `Node`.
  // - If the field type implements the `Node` interface, return a selection of
  //   the one field in the `Node` interface that is of type `ID` or `ID!`.
  if (isAbstractType(unmodifiedType)) {
    const selections = [...transformedNode.selections];
    if (mayImplement(schema, unmodifiedType, NODE_TYPE)) {
      const nodeType = assertCompositeType(schema.getType(NODE_TYPE));
      const nodeIDFieldDefinition = getNodeIDFieldDefinition(schema);
      if (nodeIDFieldDefinition) {
        selections.push(
          buildIDFragmentFromFieldDefinition(nodeType, nodeIDFieldDefinition),
        );
      }
    }
    const abstractType = assertAbstractType(unmodifiedType);
    schema.getPossibleTypes(abstractType).forEach(possibleType => {
      if (!implementsInterface(possibleType, NODE_TYPE)) {
        const possibleTypeIDFieldDefinition = getIDFieldDefinition(
          schema,
          possibleType,
        );
        if (possibleTypeIDFieldDefinition) {
          selections.push(
            buildIDFragmentFromFieldDefinition(
              possibleType,
              possibleTypeIDFieldDefinition,
            ),
          );
        }
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
 * Returns IR for `... on FRAGMENT_TYPE { __id: id }`
 */
function buildIDFragmentFromFieldDefinition(
  fragmentType: GraphQLCompositeType,
  idField: GraphQLField<*, *>,
): InlineFragment {
  return {
    kind: 'InlineFragment',
    directives: [],
    metadata: null,
    typeCondition: fragmentType,
    selections: [buildSelectionFromFieldDefinition(idField)],
  };
}

function buildSelectionFromFieldDefinition(
  field: GraphQLField<*, *>,
): ScalarField {
  return {
    kind: 'ScalarField',
    alias: field.name === ID_KEY ? null : ID_KEY,
    args: [],
    directives: [],
    handles: null,
    metadata: null,
    name: field.name,
    type: (field.type: any),
  };
}

function getNodeIDFieldDefinition(schema: GraphQLSchema): ?GraphQLField<*, *> {
  const iface = schema.getType(NODE_TYPE);
  if (isInterfaceType(iface)) {
    const idType = schema.getType(ID_TYPE);
    const fields = [];
    const allFields = iface.getFields();
    for (const fieldName in allFields) {
      const field = allFields[fieldName];
      if (getNullableType(field.type) === idType) {
        fields.push(field);
      }
    }
    invariant(
      fields.length === 1,
      'RelayGenerateIDFieldTransform.getNodeIDFieldDefinition(): Expected ' +
        'the Node interface to have one field of type `ID!`, but found %s.',
      fields.length === 0
        ? 'none'
        : fields.map(field => `\`${field.name}\``).join(', '),
    );
    return fields[0];
  }
  return null;
}

function getIDFieldDefinition(
  schema: GraphQLSchema,
  type: GraphQLCompositeType,
): ?GraphQLField<*, *> {
  const unmodifiedType = getRawType(type);
  if (
    unmodifiedType instanceof GraphQLObjectType ||
    unmodifiedType instanceof GraphQLInterfaceType
  ) {
    const idType = schema.getType(ID_TYPE);
    const nodeIDField = getNodeIDFieldDefinition(schema);
    if (nodeIDField) {
      const foundNodeIDField = unmodifiedType.getFields()[nodeIDField.name];
      if (foundNodeIDField && getRawType(foundNodeIDField.type) === idType) {
        return foundNodeIDField;
      }
    }
    const idField = unmodifiedType.getFields()[ID];
    if (idField && getRawType(idField.type) === idType) {
      return idField;
    }
  }
  return null;
}

module.exports = {
  transform: relayGenerateIDFieldTransform,
  // Only exported for testing purposes.
  buildSelectionFromFieldDefinition,
  getIDFieldDefinition,
  getNodeIDFieldDefinition,
};

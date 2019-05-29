/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const invariant = require('invariant');
const nullthrows = require('../util/nullthrowsOSS');

const {
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLUnionType,
  SchemaMetaFieldDef,
  TypeMetaFieldDef,
  TypeNameMetaFieldDef,
  assertAbstractType,
  getNamedType,
  getNullableType,
} = require('graphql');

import type GraphQLCompilerContext from '../core/GraphQLCompilerContext';
import type {Field, ScalarField} from '../core/GraphQLIR';
import type {
  ASTNode,
  GraphQLCompositeType,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLLeafType,
  GraphQLNamedType,
  GraphQLNonNull,
  GraphQLScalarType,
  GraphQLType,
} from 'graphql';

const ID = 'id';
const ID_TYPE = 'ID';

type GraphQLSingularType =
  | GraphQLScalarType
  | GraphQLObjectType
  | GraphQLInterfaceType
  | GraphQLUnionType
  | GraphQLEnumType
  | GraphQLInputObjectType
  | GraphQLNonNull<*>;

/**
 * Determine if the given type may implement the named type:
 * - it is the named type
 * - it implements the named interface
 * - it is an abstract type and *some* of its concrete types may
 *   implement the named type
 */
function mayImplement(
  schema: GraphQLSchema,
  type: GraphQLType,
  typeName: string,
): boolean {
  const unmodifiedType = getRawType(type);
  return (
    unmodifiedType.toString() === typeName ||
    implementsInterface(unmodifiedType, typeName) ||
    (isAbstractType(unmodifiedType) &&
      hasConcreteTypeThatImplements(schema, unmodifiedType, typeName))
  );
}

function canHaveSelections(type: GraphQLType): boolean {
  return (
    type instanceof GraphQLObjectType || type instanceof GraphQLInterfaceType
  );
}

/**
 * Implements duck typing that checks whether a type has an id field of the ID
 * type. This is approximating what we can hopefully do with the __id proposal
 * a bit more cleanly.
 */
function hasID(schema: GraphQLSchema, type: GraphQLCompositeType): boolean {
  const unmodifiedType = getRawType(type);
  invariant(
    unmodifiedType instanceof GraphQLObjectType ||
      unmodifiedType instanceof GraphQLInterfaceType,
    'GraphQLSchemaUtils.hasID(): Expected a concrete type or interface, ' +
      'got type `%s`.',
    type,
  );
  const idType = schema.getType(ID_TYPE);
  const idField = unmodifiedType.getFields()[ID];
  return idField && getRawType(idField.type) === idType;
}

/**
 * Determine if a type is abstract (not concrete).
 *
 * Note: This is used in place of the `graphql` version of the function in order
 * to not break `instanceof` checks with Jest. This version also unwraps
 * non-null/list wrapper types.
 */
function isAbstractType(type: GraphQLType): boolean {
  const rawType = getRawType(type);
  return (
    rawType instanceof GraphQLInterfaceType ||
    rawType instanceof GraphQLUnionType
  );
}

function isUnionType(type: GraphQLType): boolean %checks {
  return type instanceof GraphQLUnionType;
}

/**
 * Get the unmodified type, with list/null wrappers removed.
 */
function getRawType(type: GraphQLType): GraphQLNamedType {
  return nullthrows(getNamedType(type));
}

/**
 * Gets the non-list type, removing the list wrapper if present.
 */
function getSingularType(type: GraphQLType): GraphQLSingularType {
  let unmodifiedType = type;
  while (unmodifiedType instanceof GraphQLList) {
    unmodifiedType = unmodifiedType.ofType;
  }
  return (unmodifiedType: any);
}

/**
 * @public
 */
function implementsInterface(
  type: GraphQLType,
  interfaceName: string,
): boolean {
  return getInterfaces(type).some(
    interfaceType => interfaceType.toString() === interfaceName,
  );
}

/**
 * @private
 */
function hasConcreteTypeThatImplements(
  schema: GraphQLSchema,
  type: GraphQLType,
  interfaceName: string,
): boolean {
  return (
    isAbstractType(type) &&
    getConcreteTypes(schema, type).some(concreteType =>
      implementsInterface(concreteType, interfaceName),
    )
  );
}

/**
 * @private
 */
function getConcreteTypes(
  schema: GraphQLSchema,
  type: GraphQLType,
): $ReadOnlyArray<GraphQLObjectType> {
  return schema.getPossibleTypes(assertAbstractType(type));
}

/**
 * @private
 */
function getInterfaces(type: GraphQLType): Array<GraphQLInterfaceType> {
  if (type instanceof GraphQLObjectType) {
    return type.getInterfaces();
  }
  return [];
}

/**
 * @public
 *
 * Determine if an AST node contains a fragment/operation definition.
 */
function isExecutableDefinitionAST(ast: ASTNode): boolean %checks {
  return (
    ast.kind === 'FragmentDefinition' || ast.kind === 'OperationDefinition'
  );
}

/**
 * @public
 *
 * Determine if an AST node contains a schema definition.
 */
function isSchemaDefinitionAST(ast: ASTNode): boolean %checks {
  return (
    ast.kind === 'SchemaDefinition' ||
    ast.kind === 'ScalarTypeDefinition' ||
    ast.kind === 'ObjectTypeDefinition' ||
    ast.kind === 'InterfaceTypeDefinition' ||
    ast.kind === 'UnionTypeDefinition' ||
    ast.kind === 'EnumTypeDefinition' ||
    ast.kind === 'InputObjectTypeDefinition' ||
    ast.kind === 'DirectiveDefinition' ||
    ast.kind === 'ScalarTypeExtension' ||
    ast.kind === 'ObjectTypeExtension' ||
    ast.kind === 'InterfaceTypeExtension' ||
    ast.kind === 'UnionTypeExtension' ||
    ast.kind === 'EnumTypeExtension' ||
    ast.kind === 'InputObjectTypeExtension'
  );
}

function isServerDefinedField(
  field: Field,
  compilerContext: GraphQLCompilerContext,
  parentType: GraphQLType,
): boolean {
  const {serverSchema} = compilerContext;
  const rawType = getRawType(field.type);
  const serverType = serverSchema.getType(rawType.name);
  const parentServerType = serverSchema.getType(getRawType(parentType).name);
  return (
    (serverType != null &&
      parentServerType != null &&
      (canHaveSelections(parentType) &&
        assertTypeWithFields(parentType).getFields()[field.name]) != null) ||
    // Allow metadata fields and fields defined on classic "fat" interfaces
    field.name === SchemaMetaFieldDef.name ||
    field.name === TypeMetaFieldDef.name ||
    field.name === TypeNameMetaFieldDef.name ||
    field.directives.some(({name}) => name === 'fixme_fat_interface')
  );
}

function isClientDefinedField(
  field: Field,
  compilerContext: GraphQLCompilerContext,
  parentType: GraphQLType,
): boolean {
  return !isServerDefinedField(field, compilerContext, parentType);
}

function assertTypeWithFields(
  type: ?GraphQLType,
): GraphQLObjectType | GraphQLInterfaceType {
  invariant(
    type instanceof GraphQLObjectType || type instanceof GraphQLInterfaceType,
    'GraphQLSchemaUtils: Expected type `%s` to be an object or interface type.',
    type,
  );
  return type;
}

function generateIDField(idType: GraphQLLeafType): ScalarField {
  return {
    kind: 'ScalarField',
    alias: (null: ?string),
    args: [],
    directives: [],
    handles: null,
    loc: {kind: 'Generated'},
    metadata: null,
    name: ID,
    type: idType,
  };
}

module.exports = {
  assertTypeWithFields,
  canHaveSelections,
  generateIDField,
  getNullableType,
  getRawType,
  getSingularType,
  hasID,
  implementsInterface,
  isAbstractType,
  isClientDefinedField,
  isExecutableDefinitionAST,
  isSchemaDefinitionAST,
  isServerDefinedField,
  isUnionType,
  mayImplement,
};

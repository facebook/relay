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

const invariant = require('invariant');
const nullthrows = require('../util/nullthrowsOSS');

const {
  assertAbstractType,
  getNamedType,
  getNullableType,
  isType,
  print,
  typeFromAST,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLUnionType,
} = require('graphql');

import type {
  ASTNode,
  GraphQLCompositeType,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLNamedType,
  GraphQLNonNull,
  GraphQLScalarType,
  GraphQLType,
  TypeNode,
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
 *
 * https://github.com/graphql/graphql-future/blob/master/01%20-%20__id.md
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

/**
 * Helper for calling `typeFromAST()` with a clear warning when the type does
 * not exist. This enables the pattern `assertXXXType(getTypeFromAST(...))`,
 * emitting distinct errors for unknown types vs types of the wrong category.
 */
function getTypeFromAST(schema: GraphQLSchema, ast: TypeNode): GraphQLType {
  const type = typeFromAST(schema, ast);
  invariant(isType(type), 'GraphQLSchemaUtils: Unknown type `%s`.', print(ast));
  return (type: any);
}

module.exports = {
  assertTypeWithFields,
  canHaveSelections,
  getNullableType,
  getRawType,
  getSingularType,
  getTypeFromAST,
  hasID,
  implementsInterface,
  isAbstractType,
  isUnionType,
  isExecutableDefinitionAST,
  isSchemaDefinitionAST,
  mayImplement,
};

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelaySchemaUtils
 * @flow
 * @format
 */

'use strict';

const invariant = require('invariant');
const nullthrows = require('nullthrows');

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
  DefinitionNode,
  GraphQLCompositeType,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLNamedType,
  GraphQLNullableType,
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
  | GraphQLNullableType;

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
    'RelaySchemaUtils.hasID(): Expected a concrete type or interface, ' +
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
): Array<GraphQLObjectType> {
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
function isOperationDefinitionAST(ast: ASTNode): boolean %checks {
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
    ast.kind === 'DirectiveDefinition' ||
    ast.kind === 'EnumTypeDefinition' ||
    ast.kind === 'InputObjectTypeDefinition' ||
    ast.kind === 'InterfaceTypeDefinition' ||
    ast.kind === 'ObjectTypeDefinition' ||
    ast.kind === 'ScalarTypeDefinition' ||
    ast.kind === 'TypeExtensionDefinition' ||
    ast.kind === 'UnionTypeDefinition'
  );
}

function assertTypeWithFields(
  type: ?GraphQLType,
): GraphQLObjectType | GraphQLInterfaceType {
  invariant(
    type instanceof GraphQLObjectType || type instanceof GraphQLInterfaceType,
    'RelaySchemaUtils: Expected type `%s` to be an object or interface type.',
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
  invariant(isType(type), 'RelaySchemaUtils: Unknown type `%s`.', print(ast));
  return (type: any);
}

/**
 * Given a defitinition AST node, gives us a unique name for that node.
 * Note: this can be tricky for type extensions: while types always have one
 * name, type extensions are defined by everything inside them.
 *
 * TODO @mmahoney: t16495627 write tests or remove uses of this
 */
function definitionName(definition: DefinitionNode): string {
  switch (definition.kind) {
    case 'DirectiveDefinition':
    case 'EnumTypeDefinition':
    case 'FragmentDefinition':
    case 'InputObjectTypeDefinition':
    case 'InterfaceTypeDefinition':
    case 'ObjectTypeDefinition':
    case 'ScalarTypeDefinition':
    case 'UnionTypeDefinition':
      return definition.name.value;
    case 'OperationDefinition':
      return definition.name ? definition.name.value : '';
    case 'TypeExtensionDefinition':
      return definition.toString();
    case 'SchemaDefinition':
      return 'schema';
  }
  throw new Error('Unkown definition kind: ' + definition.kind);
}

module.exports = {
  assertTypeWithFields,
  definitionName,
  canHaveSelections,
  getNullableType,
  getRawType,
  getSingularType,
  getTypeFromAST,
  hasID,
  implementsInterface,
  isAbstractType,
  isOperationDefinitionAST,
  isSchemaDefinitionAST,
  mayImplement,
};

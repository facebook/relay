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

const {getRawType} = require('./GraphQLSchemaUtils');
const {createCompilerError} = require('./RelayCompilerError');
const {
  assertAbstractType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLUnionType,
  isAbstractType,
  SchemaMetaFieldDef,
  TypeMetaFieldDef,
  TypeNameMetaFieldDef,
} = require('graphql');

import type {
  GraphQLSchema,
  GraphQLOutputType,
  FieldNode,
  GraphQLField,
  GraphQLType,
} from 'graphql';

export type GetFieldDefinitionFn = (
  schema: GraphQLSchema,
  parentType: GraphQLOutputType,
  fieldName: string,
  fieldAST: FieldNode,
) => ?GraphQLField<mixed, mixed>;

/**
 * Find the definition of a field of the specified type using strict
 * resolution rules per the GraphQL spec.
 */
function getFieldDefinitionStrict(
  schema: GraphQLSchema,
  parentType: GraphQLOutputType,
  fieldName: string,
  fieldAST: FieldNode,
): ?GraphQLField<mixed, mixed> {
  const type = getRawType(parentType);
  const isQueryType = type === schema.getQueryType();
  const hasTypeName =
    type instanceof GraphQLObjectType ||
    type instanceof GraphQLInterfaceType ||
    type instanceof GraphQLUnionType;

  let schemaFieldDef;
  if (isQueryType && fieldName === SchemaMetaFieldDef.name) {
    schemaFieldDef = SchemaMetaFieldDef;
  } else if (isQueryType && fieldName === TypeMetaFieldDef.name) {
    schemaFieldDef = TypeMetaFieldDef;
  } else if (hasTypeName && fieldName === TypeNameMetaFieldDef.name) {
    schemaFieldDef = TypeNameMetaFieldDef;
  } else if (
    type instanceof GraphQLInterfaceType ||
    type instanceof GraphQLObjectType
  ) {
    schemaFieldDef = type.getFields()[fieldName];
  }
  return schemaFieldDef;
}

/**
 * Find the definition of a field of the specified type, first trying
 * the standard spec-compliant resolution process and falling back
 * to legacy mode that supports fat interfaces.
 */
function getFieldDefinitionLegacy(
  schema: GraphQLSchema,
  parentType: GraphQLOutputType,
  fieldName: string,
  fieldAST: FieldNode,
): ?GraphQLField<mixed, mixed> {
  let schemaFieldDef = getFieldDefinitionStrict(
    schema,
    parentType,
    fieldName,
    fieldAST,
  );
  if (!schemaFieldDef) {
    const type = getRawType(parentType);
    schemaFieldDef = getFieldDefinitionLegacyImpl(
      schema,
      type,
      fieldName,
      fieldAST,
    );
  }
  return schemaFieldDef || null;
}

/**
 * @private
 */
function getFieldDefinitionLegacyImpl(
  schema: GraphQLSchema,
  type: GraphQLType,
  fieldName: string,
  fieldAST: FieldNode,
): ?GraphQLField<mixed, mixed> {
  if (
    isAbstractType(type) &&
    fieldAST &&
    fieldAST.directives &&
    fieldAST.directives.some(
      directive => getName(directive) === 'fixme_fat_interface',
    )
  ) {
    const possibleTypes = schema.getPossibleTypes(assertAbstractType(type));
    let schemaFieldDef;
    for (let ii = 0; ii < possibleTypes.length; ii++) {
      const possibleField = possibleTypes[ii].getFields()[fieldName];
      if (possibleField) {
        // Fat interface fields can have differing arguments. Try to return
        // a field with matching arguments, but still return a field if the
        // arguments do not match.
        schemaFieldDef = possibleField;
        if (fieldAST && fieldAST.arguments) {
          const argumentsAllExist = fieldAST.arguments.every(argument =>
            possibleField.args.find(
              argDef => argDef.name === getName(argument),
            ),
          );
          if (argumentsAllExist) {
            break;
          }
        }
      }
    }
    return schemaFieldDef;
  }
}

/**
 * @private
 */
function getName(ast): string {
  const name = ast.name ? ast.name.value : null;
  if (typeof name !== 'string') {
    throw createCompilerError("Expected ast node to have a 'name'.", null, [
      ast,
    ]);
  }
  return name;
}

module.exports = {
  getFieldDefinitionLegacy,
  getFieldDefinitionStrict,
};

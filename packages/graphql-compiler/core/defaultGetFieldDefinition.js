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
const {
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLUnionType,
  SchemaMetaFieldDef,
  TypeMetaFieldDef,
  TypeNameMetaFieldDef,
} = require('graphql');

import type {
  GraphQLSchema,
  GraphQLOutputType,
  FieldNode,
  GraphQLField,
} from 'graphql';

/**
 * Find the definition of a field of the specified type.
 */
function defaultGetFieldDefinition(
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

module.exports = defaultGetFieldDefinition;

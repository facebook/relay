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

const invariant = require('invariant');

const {assertAbstractType, isAbstractType} = require('graphql');
const GraphQLParser = require('./GraphQLParser');
const SchemaUtils = require('./GraphQLSchemaUtils');
const defaultGetFieldDefinition = require('./defaultGetFieldDefinition');

import type {
  FieldNode,
  FragmentDefinitionNode,
  OperationDefinitionNode,
  GraphQLOutputType,
  GraphQLSchema,
  GraphQLType,
  GraphQLField,
} from 'graphql';

const {getRawType} = SchemaUtils;

class RelayParser extends GraphQLParser {
  constructor(
    schema: GraphQLSchema,
    definitions: $ReadOnlyArray<
      OperationDefinitionNode | FragmentDefinitionNode,
    >,
  ) {
    super(schema, definitions, getFieldDefinition);
  }
}

/**
 * Find the definition of a field of the specified type.
 */
function getFieldDefinition(
  schema: GraphQLSchema,
  parentType: GraphQLOutputType,
  fieldName: string,
  fieldAST: FieldNode,
): ?GraphQLField<mixed, mixed> {
  let schemaFieldDef = defaultGetFieldDefinition(
    schema,
    parentType,
    fieldName,
    fieldAST,
  );
  if (!schemaFieldDef) {
    const type = getRawType(parentType);
    schemaFieldDef = getClassicFieldDefinition(
      schema,
      type,
      fieldName,
      fieldAST,
    );
  }
  return schemaFieldDef || null;
}

function getClassicFieldDefinition(
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

function getName(ast): string {
  const name = ast.name ? ast.name.value : null;
  invariant(
    typeof name === 'string',
    'RelayParser: Expected ast node `%s` to have a name.',
    ast,
  );
  return name;
}

module.exports = RelayParser;

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule RelayParser
 * @flow
 * @format
 */

'use strict';

const invariant = require('invariant');

const {assertAbstractType, isAbstractType} = require('graphql');
const {Parser, SchemaUtils} = require('graphql-compiler');

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

class RelayParser extends Parser {
  _definition: OperationDefinitionNode | FragmentDefinitionNode;
  _schema: GraphQLSchema;

  constructor(
    schema: GraphQLSchema,
    definition: OperationDefinitionNode | FragmentDefinitionNode,
  ) {
    super(schema, definition);
    this._definition = definition;
    this._schema = schema;
  }

  /**
   * Find the definition of a field of the specified type.
   */
  getFieldDefinition(
    parentType: GraphQLOutputType,
    fieldName: string,
    fieldAST: FieldNode,
  ): ?GraphQLField<*, *> {
    let schemaFieldDef = super.getFieldDefinition(
      parentType,
      fieldName,
      fieldAST,
    );
    if (!schemaFieldDef) {
      const type = getRawType(parentType);
      schemaFieldDef = getClassicFieldDefinition(
        this._schema,
        type,
        fieldName,
        fieldAST,
      );
    }
    return schemaFieldDef || null;
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

function getClassicFieldDefinition(
  schema: GraphQLSchema,
  type: GraphQLType,
  fieldName: string,
  fieldAST: FieldNode,
): ?GraphQLField<*, *> {
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

module.exports = RelayParser;

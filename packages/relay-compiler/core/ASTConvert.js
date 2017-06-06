/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ASTConvert
 * @flow
 * @format
 */

'use strict';

const GraphQL = require('graphql');
const RelayParser = require('RelayParser');
const RelayValidator = require('RelayValidator');

const {
  isOperationDefinitionAST,
  isSchemaDefinitionAST,
} = require('RelaySchemaUtils');
const {extendSchema, visit} = require('graphql');

import type {Fragment, Root} from 'RelayIR';
import type {
  DefinitionNode,
  DocumentNode,
  FragmentDefinitionNode,
  FragmentSpreadNode,
  GraphQLSchema,
  OperationDefinitionNode,
} from 'graphql';

type ASTDefinitionNode = FragmentDefinitionNode | OperationDefinitionNode;

function convertASTDocuments(
  schema: GraphQLSchema,
  documents: Array<DocumentNode>,
  validationRules: Array<Function>,
): Array<Fragment | Root> {
  const definitions = definitionsFromDocuments(documents);

  const astDefinitions: Array<ASTDefinitionNode> = [];
  documents.forEach(doc => {
    doc.definitions.forEach(definition => {
      if (isOperationDefinitionAST(definition)) {
        astDefinitions.push(definition);
      }
    });
  });

  return convertASTDefinitions(schema, definitions, validationRules);
}

function convertASTDocumentsWithBase(
  schema: GraphQLSchema,
  baseDocuments: Array<DocumentNode>,
  documents: Array<DocumentNode>,
  validationRules: Array<Function>,
): Array<Fragment | Root> {
  const baseDefinitions = definitionsFromDocuments(baseDocuments);
  const definitions = definitionsFromDocuments(documents);

  const requiredDefinitions = new Map();
  const baseMap: Map<string, ASTDefinitionNode> = new Map();
  baseDefinitions.forEach(definition => {
    if (isOperationDefinitionAST(definition)) {
      if (definition.name) {
        // If there's no name, no reason to put in the map
        baseMap.set(definition.name.value, definition);
      }
    }
  });

  const definitionsToVisit: Array<ASTDefinitionNode> = [];
  definitions.forEach(definition => {
    if (isOperationDefinitionAST(definition)) {
      definitionsToVisit.push(definition);
    }
  });
  while (definitionsToVisit.length > 0) {
    const definition = definitionsToVisit.pop();
    const name = definition.name;
    if (!name || requiredDefinitions.has(name.value)) {
      continue;
    }
    requiredDefinitions.set(name.value, definition);
    visit(definition, {
      FragmentSpread(spread: FragmentSpreadNode) {
        const baseDefinition = baseMap.get(spread.name.value);
        if (baseDefinition) {
          // We only need to add those definitions not already included
          // in definitions
          definitionsToVisit.push(baseDefinition);
        }
      },
    });
  }

  const definitionsToConvert = [];
  requiredDefinitions.forEach(definition =>
    definitionsToConvert.push(definition),
  );
  return convertASTDefinitions(schema, definitionsToConvert, validationRules);
}

function convertASTDefinitions(
  schema: GraphQLSchema,
  definitions: Array<DefinitionNode>,
  validationRules: Array<Function>,
): Array<Fragment | Root> {
  const operationDefinitions: Array<ASTDefinitionNode> = [];
  definitions.forEach(definition => {
    if (isOperationDefinitionAST(definition)) {
      operationDefinitions.push(definition);
    }
  });

  const validationAST = {
    kind: 'Document',
    // DocumentNode doesn't accept that a node of type
    // FragmentDefinitionNode | OperationDefinitionNode is a DefinitionNode
    definitions: (operationDefinitions: Array<$FlowFixMe>),
  };
  // Will throw an error if there are validation issues
  RelayValidator.validate(validationAST, schema, validationRules);
  return operationDefinitions.map(definition =>
    RelayParser.transform(schema, definition),
  );
}

function definitionsFromDocuments(
  documents: Array<DocumentNode>,
): Array<DefinitionNode> {
  const definitions = [];
  documents.forEach(doc => {
    doc.definitions.forEach(definition => definitions.push(definition));
  });
  return definitions;
}

function transformASTSchema(
  schema: GraphQLSchema,
  schemaExtensions: Array<string>,
): GraphQLSchema {
  return schemaExtensions.length > 0
    ? GraphQL.extendSchema(schema, GraphQL.parse(schemaExtensions.join('\n')))
    : schema;
}

function extendASTSchema(
  baseSchema: GraphQLSchema,
  documents: Array<DocumentNode>,
): GraphQLSchema {
  // Should be TypeSystemDefinitionNode
  const schemaExtensions: Array<DefinitionNode> = [];
  documents.forEach(doc => {
    // TODO: isSchemaDefinitionAST should %checks, once %checks is available
    schemaExtensions.push(...doc.definitions.filter(isSchemaDefinitionAST));
  });

  if (schemaExtensions.length <= 0) {
    return baseSchema;
  }

  return extendSchema(baseSchema, {
    kind: 'Document',
    // Flow doesn't recognize that TypeSystemDefinitionNode is a subset of
    // DefinitionNode
    definitions: (schemaExtensions: Array<$FlowFixMe>),
  });
}

module.exports = {
  convertASTDocuments,
  convertASTDocumentsWithBase,
  extendASTSchema,
  transformASTSchema,
};

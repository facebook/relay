/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @providesModule ASTConvert
 * @flow
 */

'use strict';

const RelayParser = require('RelayParser');
const RelayValidator = require('RelayValidator');

const {
  isSchemaDefinitionAST,
  getOperationDefinitionAST,
} = require('RelaySchemaUtils');
const {extendSchema, visit} = require('graphql');

import type {Fragment, Root} from 'RelayIR';
import type {SchemaTransform} from 'RelayIRTransforms';
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
      // TODO: isOperationDefinitionAST should %checks, once %checks is available
      const astDefinition = getOperationDefinitionAST(definition);
      if (astDefinition) {
        astDefinitions.push((definition: any));
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
    const astDefinition = getOperationDefinitionAST(definition);
    if (astDefinition) {
      if (astDefinition.name) {
        // If there's no name, no reason to put in the map
        baseMap.set(astDefinition.name.value, astDefinition);
      }
    }
  });

  const definitionsToVisit: Array<ASTDefinitionNode> = [];
  definitions.forEach(definition => {
    const astDefinition = getOperationDefinitionAST(definition);
    if (astDefinition) {
      definitionsToVisit.push(astDefinition);
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
  requiredDefinitions.forEach(
    definition => definitionsToConvert.push(definition)
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
    const operation: ?ASTDefinitionNode = getOperationDefinitionAST(definition);
    if (operation) {
      operationDefinitions.push(operation);
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
  return operationDefinitions.map(
    definition => RelayParser.transform(schema, definition),
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
  baseSchema: GraphQLSchema,
  schemaTransforms: Array<SchemaTransform>,
): GraphQLSchema {
  return schemaTransforms.reduce(
    (acc, transform) => transform(acc),
    baseSchema,
  );
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
    // Flow doesn't recognize that TypeSystemDefinitionNode is a subset of DefinitionNode
    definitions: (schemaExtensions: Array<$FlowFixMe>),
  });
}

module.exports = {
  convertASTDocuments,
  convertASTDocumentsWithBase,
  extendASTSchema,
  transformASTSchema,
};

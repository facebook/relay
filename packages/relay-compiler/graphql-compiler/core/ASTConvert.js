/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ASTConvert
 * @flow
 * @format
 */

'use strict';

const GraphQLValidator = require('./GraphQLValidator');
const Profiler = require('./GraphQLCompilerProfiler');

const {
  isExecutableDefinitionAST,
  isSchemaDefinitionAST,
} = require('./GraphQLSchemaUtils');
const {extendSchema, parse, visit} = require('graphql');

import type {Fragment, Root} from './GraphQLIR';
import type {
  DefinitionNode,
  DocumentNode,
  FragmentDefinitionNode,
  FragmentSpreadNode,
  GraphQLSchema,
  OperationDefinitionNode,
} from 'graphql';

type ASTDefinitionNode = FragmentDefinitionNode | OperationDefinitionNode;
type TransformFn = (
  schema: GraphQLSchema,
  definition: ASTDefinitionNode,
) => Root | Fragment;

function convertASTDocuments(
  schema: GraphQLSchema,
  documents: Array<DocumentNode>,
  validationRules: Array<Function>,
  transform: TransformFn,
): Array<Fragment | Root> {
  return Profiler.run('ASTConvert.convertASTDocuments', () => {
    const definitions = definitionsFromDocuments(documents);

    const astDefinitions: Array<ASTDefinitionNode> = [];
    documents.forEach(doc => {
      doc.definitions.forEach(definition => {
        if (isExecutableDefinitionAST(definition)) {
          astDefinitions.push(definition);
        }
      });
    });

    return convertASTDefinitions(
      schema,
      definitions,
      validationRules,
      transform,
    );
  });
}

function convertASTDocumentsWithBase(
  schema: GraphQLSchema,
  baseDocuments: Array<DocumentNode>,
  documents: Array<DocumentNode>,
  validationRules: Array<Function>,
  transform: TransformFn,
): Array<Fragment | Root> {
  return Profiler.run('ASTConvert.convertASTDocumentsWithBase', () => {
    const baseDefinitions = definitionsFromDocuments(baseDocuments);
    const definitions = definitionsFromDocuments(documents);

    const requiredDefinitions = new Map();
    const baseMap: Map<string, ASTDefinitionNode> = new Map();
    baseDefinitions.forEach(definition => {
      if (isExecutableDefinitionAST(definition)) {
        const definitionName = definition.name && definition.name.value;
        // If there's no name, no reason to put in the map
        if (definitionName) {
          if (baseMap.has(definitionName)) {
            throw new Error(`Duplicate definition of '${definitionName}'.`);
          }
          baseMap.set(definitionName, definition);
        }
      }
    });

    const definitionsToVisit: Array<ASTDefinitionNode> = [];
    definitions.forEach(definition => {
      if (isExecutableDefinitionAST(definition)) {
        definitionsToVisit.push(definition);
      }
    });
    while (definitionsToVisit.length > 0) {
      const definition = definitionsToVisit.pop();
      const name = definition.name && definition.name.value;
      if (!name) {
        continue;
      }
      if (requiredDefinitions.has(name)) {
        if (requiredDefinitions.get(name) !== definition) {
          throw new Error(`Duplicate definition of '${name}'.`);
        }
        continue;
      }
      requiredDefinitions.set(name, definition);
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
    return convertASTDefinitions(
      schema,
      definitionsToConvert,
      validationRules,
      transform,
    );
  });
}

function convertASTDefinitions(
  schema: GraphQLSchema,
  definitions: Array<DefinitionNode>,
  validationRules: Array<Function>,
  transform: TransformFn,
): Array<Fragment | Root> {
  const operationDefinitions: Array<ASTDefinitionNode> = [];
  definitions.forEach(definition => {
    if (isExecutableDefinitionAST(definition)) {
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
  GraphQLValidator.validate(validationAST, schema, validationRules);
  return operationDefinitions.map(definition => transform(schema, definition));
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
  return Profiler.run(
    'ASTConvert.transformASTSchema',
    () =>
      schemaExtensions.length > 0
        ? extendSchema(schema, parse(schemaExtensions.join('\n')))
        : schema,
  );
}

function extendASTSchema(
  baseSchema: GraphQLSchema,
  documents: Array<DocumentNode>,
): GraphQLSchema {
  return Profiler.run('ASTConvert.extendASTSchema', () => {
    // Should be TypeSystemDefinitionNode
    const schemaExtensions: Array<DefinitionNode> = [];
    documents.forEach(doc => {
      schemaExtensions.push(...doc.definitions.filter(isSchemaDefinitionAST));
    });

    if (schemaExtensions.length <= 0) {
      return baseSchema;
    }

    // TODO T24511737 figure out if this is dangerous
    return extendSchema(
      baseSchema,
      {
        kind: 'Document',
        definitions: schemaExtensions,
      },
      {assumeValid: true},
    );
  });
}

module.exports = {
  convertASTDocuments,
  convertASTDocumentsWithBase,
  extendASTSchema,
  transformASTSchema,
};

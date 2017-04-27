/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayExportTransform
 * @flow
 */

'use strict';

const GraphQL = require('graphql');
const RelayCompilerContext = require('RelayCompilerContext');

const invariant = require('invariant');
const partitionArray = require('partitionArray');

import type {Node, Selection} from 'RelayIR';
import type {GraphQLSchema} from 'graphql';

const {GraphQLList} = GraphQL;

const EXPORT = 'export';
const AS = 'as';

type Metadata = {[key: string]: Path};
type Path = Array<string>;

function transformSchema(schema: GraphQLSchema): GraphQLSchema {
  return GraphQL.extendSchema(schema, GraphQL.parse(
    'directive @export(as: String!) on FIELD'
  ));
}

/**
 * A transform that extracts `@export(as: "<name>")` directives and converts
 * them to metadata that can be accessed at runtime.
 */
function transform(context: RelayCompilerContext): RelayCompilerContext {
  return context.documents().reduce((ctx: RelayCompilerContext, node) => {
    if (node.kind === 'Root') {
      const metadata = {};
      const path = [];
      const transformedNode = transformNode(node, path, metadata);
      transformedNode.metadata = transformedNode.metadata || {};
      if (Object.keys(metadata).length) {
        transformedNode.metadata[EXPORT] = metadata;
      }
      return ctx.add(transformedNode);
    } else {
      return ctx.add(node);
    }
  }, new RelayCompilerContext(context.schema));
}

function transformNode<T: Node>(
  node: T,
  path: Path,
  metadata: Metadata
): T {
  const selections: Array<Selection> = node.selections.map(selection => {
    let nextSelection = selection;
    if (selection.kind === 'ScalarField') {
      const [exports, directives] = partitionArray(
        selection.directives,
        directive => directive.name === EXPORT
      );
      if (exports.length) {
        // Extract export
        invariant(
          exports.length === 1,
          'RelayExportTransform: Expected at most one `@${EXPORT}` ' +
          'directive on field `%s`, got %s.',
          selection.name,
          exports.length
        );
        const exportAs = exports[0].args.find(arg => arg.name === AS);
        invariant(
          exportAs && exportAs.value.kind === 'Literal',
          'RelayExportTransform: Expected a literal `%s` argument on ' +
          'the `@${EXPORT}` directive on field `%s`.',
          AS,
          selection.name
        );
        const exportName = exportAs.value.value;
        invariant(
          typeof exportName === 'string',
          'RelayExportTransform: Expected the export name to be a string, ' +
          'got `%s`.',
          exportName
        );
        invariant(
          !metadata.hasOwnProperty(exportName),
          'RelayExportTransform: Expected a given name to be exported at ' +
          'most once within a given query, `%s` was exported multiple times.',
          exportName
        );
        const alias = selection.alias || selection.name;
        const fieldPath = [...path, alias];
        if (selection.type instanceof GraphQLList) {
          fieldPath.push('*');
        }
        metadata[exportName] = fieldPath;
        nextSelection = {
          ...selection,
          directives,
        };
      }
    } else if (selection.kind === 'LinkedField') {
      invariant(
        selection.directives.every(directive => directive.name !== EXPORT),
        'RelayExportTransform: Unexpected `@${EXPORT}` directive on linked ' +
        'field `%s`. Only scalar fields such as `id` can be exported.',
        selection.name
      );
      const fieldPath = [...path, selection.alias || selection.name];
      if (selection.type instanceof GraphQLList) {
        fieldPath.push('*');
      }
      nextSelection = transformNode(selection, fieldPath, metadata);
    } else if (
      selection.kind === 'Condition' ||
      selection.kind === 'InlineFragment'
    ) {
      nextSelection = transformNode(selection, path, metadata);
    }
    return (nextSelection: $FlowIssue); // provably the same type as `selection`
  });
  return ({
    ...node,
    selections,
  }: $FlowIssue); // provably of the same type as `node`
}

module.exports = {
  transform,
  transformSchema,
};

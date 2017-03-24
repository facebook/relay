/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @providesModule RelayCompiler
 */

'use strict';

const RelayCodeGenerator = require('RelayCodeGenerator');
const RelayCompilerContext = require('RelayCompilerContext');
const RelayPrinter = require('RelayPrinter');

const filterContextForNode = require('filterContextForNode');

import type {GeneratedNode} from 'RelayConcreteNode';
import type {Fragment, Root} from 'RelayIR';
import type {IRTransform} from 'RelayIRTransforms';
import type {GraphQLSchema} from 'graphql';

export type CompiledDocumentMap = Map<string, GeneratedNode>;
export type TransformReducer = (
  ctx: RelayCompilerContext,
  transform: (ctx: RelayCompilerContext) => RelayCompilerContext
) => RelayCompilerContext;

export interface Compiler {
  add(text: string): Array<Root | Fragment>,
  compile(): CompiledDocumentMap,
}

export type CompilerTransforms = {
  codegenTransforms: Array<IRTransform>,
  fragmentTransforms: Array<IRTransform>,
  printTransforms: Array<IRTransform>,
  queryTransforms: Array<IRTransform>,
}

/**
 * A utility class for parsing a corpus of GraphQL documents, transforming them
 * with a standardized set of transforms, and generating runtime representations
 * of each definition.
 */
class RelayCompiler {
  _context: RelayCompilerContext;
  _schema: GraphQLSchema;
  _transformedQueryContext: ?RelayCompilerContext;
  _transforms: CompilerTransforms;

  // The context passed in must already have any Relay-specific schema extensions
  constructor(
    schema: GraphQLSchema,
    context: RelayCompilerContext,
    transforms: CompilerTransforms,
  ) {
    this._context = context;
    // some transforms depend on this being the original schema,
    // not the transformed schema/context's schema
    this._schema = schema;
    this._transforms = transforms;
  }

  clone(): RelayCompiler {
    return new RelayCompiler(this._schema, this._context, this._transforms);
  }

  context(): RelayCompilerContext {
    return this._context;
  }

  addDefinitions(definitions: Array<Fragment | Root>): Array<Root | Fragment> {
    this._context = this._context.addAll(definitions);
    return this._context.documents();
  }

  // Can only be called once per compiler. Once run, will use cached context
  // To re-run, clone the compiler.
  transformedQueryContext(): RelayCompilerContext {
    if (this._transformedQueryContext) {
      return this._transformedQueryContext;
    }
    this._transformedQueryContext = this._transforms.queryTransforms.reduce(
      (ctx, transform) => transform(ctx, this._schema),
      this._context,
    );
    return this._transformedQueryContext;
  }

  compile(): CompiledDocumentMap {
    const transformContext =
      ((ctx, transform) => transform(ctx, this._schema): any);
    const fragmentContext = this._transforms.fragmentTransforms.reduce(
      transformContext,
      this._context,
    );
    const queryContext = this.transformedQueryContext();
    const printContext = this._transforms.printTransforms.reduce(
      transformContext,
      queryContext,
    );
    const codeGenContext = this._transforms.codegenTransforms.reduce(
      transformContext,
      queryContext,
    );

    const compiledDocuments = new Map();
    fragmentContext.documents().forEach(node => {
      if (node.kind !== 'Fragment') {
        return;
      }
      const generatedFragment = RelayCodeGenerator.generate(node);
      compiledDocuments.set(node.name, generatedFragment);
    });
    queryContext.documents().forEach(node => {
      if (node.kind !== 'Root') {
        return;
      }
      const {name} = node;
      // The unflattened query is used for printing, since flattening creates an
      // invalid query.
      const text = filterContextForNode(printContext.getRoot(name), printContext)
        .documents()
        .map(RelayPrinter.print)
        .join('\n');
      // The original query (with fragment spreads) is converted to a fragment
      // for reading out the root data.
      const sourceNode = fragmentContext.getRoot(name);
      const rootFragment = buildFragmentForRoot(sourceNode);
      const generatedFragment = RelayCodeGenerator.generate(rootFragment);
      // The flattened query is used for codegen in order to reduce the number of
      // duplicate fields that must be processed during response normalization.
      const codeGenNode = codeGenContext.getRoot(name);
      const generatedQuery = RelayCodeGenerator.generate(codeGenNode);

      const batchQuery = {
        fragment: generatedFragment,
        id: null,
        kind: 'Batch',
        metadata: node.metadata || {},
        name,
        query: generatedQuery,
        text,
      };
      compiledDocuments.set(name, batchQuery);
    });
    return compiledDocuments;
  }
}

/**
 * Construct the fragment equivalent of a root node.
 */
function buildFragmentForRoot(root: Root): Fragment {
  return {
    argumentDefinitions: (root.argumentDefinitions: $FlowIssue),
    directives: root.directives,
    kind: 'Fragment',
    metadata: null,
    name: root.name,
    selections: root.selections,
    type: root.type,
  };
}

module.exports = RelayCompiler;

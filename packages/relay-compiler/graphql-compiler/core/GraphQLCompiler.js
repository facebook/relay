/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @providesModule GraphQLCompiler
 * @format
 */

'use strict';

const Profiler = require('./GraphQLCompilerProfiler');

const requestsForOperation = require('./requestsForOperation');

import type {GraphQLReporter} from '../reporters/GraphQLReporter';
import type GraphQLCompilerContext from './GraphQLCompilerContext';
import type {Batch, Fragment, Root} from './GraphQLIR';
import type {IRTransform} from './GraphQLIRTransforms';

export type CompiledDocumentMap<CodegenNode> = Map<string, CodegenNode>;

export interface Compiler<CodegenNode> {
  add(text: string): Array<Root | Fragment>,
  compile(): CompiledDocumentMap<CodegenNode>,
}

/**
 * The GraphQLCompiler generates multiple artifacts for Relay's runtime,
 * each kind of which is the result of a series of transforms. Each kind of
 * artifact is dependent on transforms being applied in the following order:
 *
 *   - Fragment Readers: commonTransforms, fragmentTransforms
 *   - Fragment Types: commonTransforms, fragmentTransforms
 *   - Operation Writers: commonTransforms, queryTransforms, codegenTransforms
 *   - GraphQL Text: commonTransforms, queryTransforms, printTransforms
 *
 */
export type CompilerTransforms = {
  commonTransforms: Array<IRTransform>,
  codegenTransforms: Array<IRTransform>,
  fragmentTransforms: Array<IRTransform>,
  printTransforms: Array<IRTransform>,
  queryTransforms: Array<IRTransform>,
};

/**
 * A utility class for parsing a corpus of GraphQL documents, transforming them
 * with a standardized set of transforms, and generating runtime representations
 * of each definition.
 */
class GraphQLCompiler<CodegenNode> {
  _context: GraphQLCompilerContext;
  _transformedCommonContext: ?GraphQLCompilerContext;
  _transformedQueryContext: ?GraphQLCompilerContext;
  _transforms: CompilerTransforms;
  _codeGenerator: (node: Batch | Fragment) => CodegenNode;
  _reporter: GraphQLReporter;

  // The context passed in must already have any Relay-specific schema extensions
  constructor(
    context: GraphQLCompilerContext,
    transforms: CompilerTransforms,
    codeGenerator: (node: Batch | Fragment) => CodegenNode,
    reporter: GraphQLReporter,
  ) {
    this._context = context;
    this._transforms = transforms;
    this._codeGenerator = Profiler.instrument(codeGenerator);
    this._reporter = reporter;
  }

  transformedCommonContext(): GraphQLCompilerContext {
    if (this._transformedCommonContext) {
      return this._transformedCommonContext;
    }
    this._transformedCommonContext = this._context.applyTransforms(
      this._transforms.commonTransforms,
      this._reporter,
    );
    return this._transformedCommonContext;
  }

  // Can only be called once per compiler. Once run, will use cached context
  // To re-run, clone the compiler.
  transformedQueryContext(): GraphQLCompilerContext {
    if (this._transformedQueryContext) {
      return this._transformedQueryContext;
    }
    this._transformedQueryContext = this.transformedCommonContext().applyTransforms(
      this._transforms.queryTransforms,
      this._reporter,
    );
    return this._transformedQueryContext;
  }

  compile(): CompiledDocumentMap<CodegenNode> {
    return Profiler.run('GraphQLCompiler.compile', () => {
      const commonContext = this.transformedCommonContext();
      const fragmentContext = commonContext.applyTransforms(
        this._transforms.fragmentTransforms,
        this._reporter,
      );
      const queryContext = this.transformedQueryContext();
      // The unflattened query is used for printing, since flattening creates an
      // invalid query.
      const printContext = queryContext.applyTransforms(
        this._transforms.printTransforms,
        this._reporter,
      );
      // The flattened query is used for codegen in order to reduce the number of
      // duplicate fields that must be processed during response normalization.
      const codeGenContext = queryContext.applyTransforms(
        this._transforms.codegenTransforms,
        this._reporter,
      );

      const compiledDocuments: CompiledDocumentMap<CodegenNode> = new Map();
      fragmentContext.forEachDocument(node => {
        if (node.kind !== 'Fragment') {
          return;
        }
        const generatedFragment = this._codeGenerator(node);
        compiledDocuments.set(node.name, generatedFragment);
      });
      queryContext.forEachDocument(node => {
        if (node.kind !== 'Root') {
          return;
        }
        const name = node.name;
        const batchQuery = {
          kind: 'Batch',
          metadata: node.metadata || {},
          name,
          fragment: buildFragmentForRoot(fragmentContext.getRoot(name)),
          requests: requestsForOperation(printContext, codeGenContext, name),
        };
        const generatedDocument = this._codeGenerator(batchQuery);
        compiledDocuments.set(name, generatedDocument);
      });
      return compiledDocuments;
    });
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

module.exports = GraphQLCompiler;

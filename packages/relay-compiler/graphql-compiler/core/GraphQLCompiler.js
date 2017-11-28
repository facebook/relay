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

  /**
   * The order of the transforms applied for each context below is important.
   * CompilerContext will memoize applying each transform, so while
   * `commonTransforms` appears in each application, it will not result in
   * repeated work as long as the order remains consistent across each context.
   */
  compile(): CompiledDocumentMap<CodegenNode> {
    return Profiler.run('GraphQLCompiler.compile', () => {
      // The fragment is used for reading data from the normalized store.
      const fragmentContext = this._context.applyTransforms(
        [
          ...this._transforms.commonTransforms,
          ...this._transforms.fragmentTransforms,
        ],
        this._reporter,
      );

      // The unflattened query is used for printing, since flattening creates an
      // invalid query.
      const printContext = this._context.applyTransforms(
        [
          ...this._transforms.commonTransforms,
          ...this._transforms.queryTransforms,
          ...this._transforms.printTransforms,
        ],
        this._reporter,
      );

      // The flattened query is used for codegen in order to reduce the number of
      // duplicate fields that must be processed during response normalization.
      const codeGenContext = this._context.applyTransforms(
        [
          ...this._transforms.commonTransforms,
          ...this._transforms.queryTransforms,
          ...this._transforms.codegenTransforms,
        ],
        this._reporter,
      );

      const compiledDocuments = new Map();
      fragmentContext.forEachDocument(node => {
        const generatedNode =
          node.kind === 'Fragment'
            ? node
            : {
                kind: 'Batch',
                metadata: codeGenContext.getRoot(node.name).metadata || {},
                name: node.name,
                fragment: buildFragmentForRoot(node),
                requests: requestsForOperation(
                  printContext,
                  codeGenContext,
                  node.name,
                ),
              };
        compiledDocuments.set(node.name, this._codeGenerator(generatedNode));
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

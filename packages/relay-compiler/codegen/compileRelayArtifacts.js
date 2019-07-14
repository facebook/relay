/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const Printer = require('../core/GraphQLIRPrinter');
const Profiler = require('../core/GraphQLCompilerProfiler');
const RelayCodeGenerator = require('./RelayCodeGenerator');

const filterContextForNode = require('../core/filterContextForNode');

import type CompilerContext from '../core/GraphQLCompilerContext';
import type {IRTransform} from '../core/GraphQLCompilerContext';
import type {IRValidation} from '../core/GraphQLCompilerContext';
import type {GeneratedDefinition} from '../core/GraphQLIR';
import type {GraphQLReporter as Reporter} from '../reporters/GraphQLReporter';
import type {GeneratedNode} from 'relay-runtime';

export type RelayCompilerTransforms = {
  commonTransforms: $ReadOnlyArray<IRTransform>,
  codegenTransforms: $ReadOnlyArray<IRTransform>,
  fragmentTransforms: $ReadOnlyArray<IRTransform>,
  printTransforms: $ReadOnlyArray<IRTransform>,
  queryTransforms: $ReadOnlyArray<IRTransform>,
};

export type RelayCompilerValidations = {
  codegenValidations: $ReadOnlyArray<IRValidation>,
  printValidations: $ReadOnlyArray<IRValidation>,
};

/**
 * Transforms the provided compiler context
 *
 * compileRelayArtifacts generates artifacts for Relay's runtime as a result of
 * applying a series of transforms. Each kind of artifact is dependent on
 * transforms being applied in the following order:
 *
 *   - Fragment Readers: commonTransforms, fragmentTransforms
 *   - Operation Writers: commonTransforms, queryTransforms, codegenTransforms
 *   - GraphQL Text: commonTransforms, queryTransforms, printTransforms
 *
 * The order of the transforms applied for each artifact below is important.
 * CompilerContext will memoize applying each transform, so while
 * `commonTransforms` appears in each artifacts' application, it will not result
 * in repeated work as long as the order remains consistent across each context.
 */
function compileRelayArtifacts(
  context: CompilerContext,
  transforms: RelayCompilerTransforms,
  reporter?: Reporter,
  validations?: RelayCompilerValidations,
): $ReadOnlyArray<[GeneratedDefinition, GeneratedNode]> {
  return Profiler.run('GraphQLCompiler.compile', () => {
    // The fragment is used for reading data from the normalized store.
    const fragmentContext = context.applyTransforms(
      [...transforms.commonTransforms, ...transforms.fragmentTransforms],
      reporter,
    );

    // The unflattened query is used for printing, since flattening creates an
    // invalid query.
    const printContext = context.applyTransforms(
      [
        ...transforms.commonTransforms,
        ...transforms.queryTransforms,
        ...transforms.printTransforms,
      ],
      reporter,
    );
    if (validations) {
      printContext.applyValidations(validations.printValidations, reporter);
    }

    // The flattened query is used for codegen in order to reduce the number of
    // duplicate fields that must be processed during response normalization.
    const codeGenContext = context.applyTransforms(
      [
        ...transforms.commonTransforms,
        ...transforms.queryTransforms,
        ...transforms.codegenTransforms,
      ],
      reporter,
    );
    if (validations) {
      codeGenContext.applyValidations(validations.codegenValidations, reporter);
    }

    const results = [];

    // Add everything from codeGenContext, these are the operations as well as
    // SplitOperations from @match.
    for (const node of codeGenContext.documents()) {
      if (node.kind === 'Root') {
        const fragment = fragmentContext.getRoot(node.name);
        const request = {
          kind: 'Request',
          fragment: {
            kind: 'Fragment',
            argumentDefinitions: fragment.argumentDefinitions,
            directives: fragment.directives,
            loc: {kind: 'Derived', source: node.loc},
            metadata: null,
            name: fragment.name,
            selections: fragment.selections,
            type: fragment.type,
          },
          id: null,
          loc: node.loc,
          metadata: node.metadata || {},
          name: fragment.name,
          root: node,
          text: printOperation(printContext, fragment.name),
        };
        results.push([request, RelayCodeGenerator.generate(request)]);
      } else {
        results.push([node, RelayCodeGenerator.generate(node)]);
      }
    }

    // Add all the Fragments from the fragmentContext for the reader ASTs.
    for (const node of fragmentContext.documents()) {
      if (node.kind === 'Fragment') {
        results.push([node, RelayCodeGenerator.generate(node)]);
      }
    }
    return results;
  });
}

function printOperation(printContext: CompilerContext, name: string): string {
  const printableRoot = printContext.getRoot(name);
  return filterContextForNode(printableRoot, printContext)
    .documents()
    .map(Printer.print)
    .join('\n');
}

module.exports = compileRelayArtifacts;

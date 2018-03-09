/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule compileRelayArtifacts
 * @flow
 * @format
 */

'use strict';

const RelayCodeGenerator = require('./RelayCodeGenerator');

const requestsForOperation = require('./requestsForOperation');

const {Profiler} = require('graphql-compiler');

// TODO T21875029 relay-runtime
import type {GeneratedNode} from 'RelayConcreteNode';
import type {CompilerContext, IRTransform, Reporter} from 'graphql-compiler';

export type RelayCompilerTransforms = {
  commonTransforms: Array<IRTransform>,
  codegenTransforms: Array<IRTransform>,
  fragmentTransforms: Array<IRTransform>,
  printTransforms: Array<IRTransform>,
  queryTransforms: Array<IRTransform>,
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
): Array<GeneratedNode> {
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

    return fragmentContext.documents().map(node =>
      RelayCodeGenerator.generate(
        node.kind === 'Fragment'
          ? node
          : {
              kind: 'Batch',
              metadata: codeGenContext.getRoot(node.name).metadata || {},
              name: node.name,
              fragment: {
                kind: 'Fragment',
                argumentDefinitions: (node.argumentDefinitions: $FlowFixMe),
                directives: node.directives,
                metadata: null,
                name: node.name,
                selections: node.selections,
                type: node.type,
              },
              requests: requestsForOperation(
                printContext,
                codeGenContext,
                node.name,
              ),
            },
      ),
    );
  });
}

module.exports = compileRelayArtifacts;

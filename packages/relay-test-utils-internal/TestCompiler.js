/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

const parseGraphQLText = require('./parseGraphQLText');

const {TestSchema} = require('./TestSchema');
const {
  CodeMarker,
  CompilerContext,
  IRTransforms,
  compileRelayArtifacts,
} = require('relay-compiler');

import type {
  RelayCompilerTransforms,
  IRTransform,
  Schema,
} from 'relay-compiler';
import type {GeneratedNode} from 'relay-runtime';

/**
 * Parses GraphQL text, applies the selected transforms only (or none if
 * transforms is not specified), and returns a mapping of definition name to
 * its basic generated representation.
 */
function generateWithTransforms(
  text: string,
  transforms?: ?Array<IRTransform>,
): {[key: string]: GeneratedNode} {
  return generate(
    text,
    TestSchema,
    {
      commonTransforms: transforms || [],
      fragmentTransforms: [],
      queryTransforms: [],
      codegenTransforms: [],
      printTransforms: [],
    },
    null,
  );
}

/**
 * Compiles the given GraphQL text using the standard set of transforms (as
 * defined in RelayCompiler) and returns a mapping of definition name to
 * its full runtime representation.
 */
function generateAndCompile(
  text: string,
  schema?: ?Schema,
  moduleMap?: ?{[string]: mixed},
): {[key: string]: GeneratedNode} {
  return generate(text, schema ?? TestSchema, IRTransforms, moduleMap ?? null);
}

function generate(
  text: string,
  schema: RelaySchema,
  transforms: RelayCompilerTransforms,
  moduleMap: ?{[string]: mixed},
): {[key: string]: GeneratedNode} {
  const relaySchema = schema.extend(IRTransforms.schemaExtensions);
  const {definitions, schema: extendedSchema} = parseGraphQLText(
    relaySchema,
    text,
  );
  const compilerContext = new CompilerContext(extendedSchema).addAll(
    definitions,
  );
  const documentMap = {};
  compileRelayArtifacts(compilerContext, transforms).forEach(
    ([_definition, node]) => {
      const transformedNode =
        moduleMap != null ? CodeMarker.transform(node, moduleMap) : node;
      documentMap[
        node.kind === 'Request' ? node.params.name : node.name
      ] = transformedNode;
    },
  );
  return documentMap;
}

module.exports = {
  generateAndCompile,
  generateWithTransforms,
};

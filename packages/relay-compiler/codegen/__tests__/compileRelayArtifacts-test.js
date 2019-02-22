/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 * @emails oncall+relay
 */

'use strict';

const ASTConvert = require('../../core/ASTConvert');
const CodeMarker = require('../../util/CodeMarker');
const CompilerContext = require('../../core/GraphQLCompilerContext');
const RelayIRTransforms = require('../../core/RelayIRTransforms');
const RelayTestSchema = require('RelayTestSchema');

const compileRelayArtifacts = require('../compileRelayArtifacts');
const parseGraphQLText = require('parseGraphQLText');

const {generateTestsFromFixtures} = require('RelayModernTestUtils');

describe('compileRelayArtifacts', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/compileRelayArtifacts`,
    text => {
      const relaySchema = ASTConvert.transformASTSchema(
        RelayTestSchema,
        RelayIRTransforms.schemaExtensions,
      );
      const compilerContext = new CompilerContext(
        RelayTestSchema,
        relaySchema,
      ).addAll(parseGraphQLText(relaySchema, text).definitions);
      return compileRelayArtifacts(compilerContext, RelayIRTransforms)
        .map(([_definition, node]) => {
          if (node.kind === 'Request') {
            const {
              params: {text: queryText},
              ...ast
            } = node;
            return [stringifyAST(ast), 'QUERY:', queryText].join('\n\n');
          } else {
            return stringifyAST(node);
          }
        })
        .join('\n\n');
    },
  );
});

function stringifyAST(ast: mixed): string {
  return CodeMarker.postProcess(
    JSON.stringify(ast, null, 2),
    moduleName => `require('${moduleName}')`,
  );
}

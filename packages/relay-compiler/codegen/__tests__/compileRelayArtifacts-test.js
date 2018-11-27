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

require('configureForRelayOSS');

const CodeMarker = require('../../util/CodeMarker');
const RelayIRTransforms = require('../../core/RelayIRTransforms');
const RelayTestSchema = require('RelayTestSchema');

const compileRelayArtifacts = require('../compileRelayArtifacts');
const parseGraphQLText = require('parseGraphQLText');

const {generateTestsFromFixtures} = require('RelayModernTestUtils');
const {ASTConvert, CompilerContext} = require('graphql-compiler');

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
        .map(node => {
          if (node.kind === 'Request') {
            const {text: queryText, ...ast} = node;
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

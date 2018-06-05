/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

require('configureForRelayOSS');

const compileRelayArtifacts = require('../compileRelayArtifacts');

const {ASTConvert, CompilerContext} = require('graphql-compiler');

const RelayIRTransforms = require('RelayIRTransforms');
const RelayTestSchema = require('RelayTestSchema');

const {generateTestsFromFixtures} = require('RelayModernTestUtils');
const parseGraphQLText = require('parseGraphQLText');

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
        .map(({text: queryText, ...ast}) => {
          let stringified = JSON.stringify(ast, null, 2);
          if (queryText) {
            stringified += '\n\nQUERY:\n\n' + queryText;
          }
          return stringified;
        })
        .join('\n\n');
    },
  );
});

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';

const CodeMarker = require('../../util/CodeMarker');
const CompilerContext = require('../../core/CompilerContext');
const RelayIRTransforms = require('../../core/RelayIRTransforms');

const compileRelayArtifacts = require('../compileRelayArtifacts');

const {RelayFeatureFlags} = require('relay-runtime');
const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
  printAST,
} = require('relay-test-utils-internal');

describe('compileRelayArtifacts', () => {
  beforeEach(() => {
    RelayFeatureFlags.ENABLE_VARIABLE_CONNECTION_KEY = true;
    RelayFeatureFlags.ENABLE_REACT_FLIGHT_COMPONENT_FIELD = true;
    RelayFeatureFlags.ENABLE_REQUIRED_DIRECTIVES = true;
  });

  afterEach(() => {
    RelayFeatureFlags.ENABLE_VARIABLE_CONNECTION_KEY = false;
    RelayFeatureFlags.ENABLE_REACT_FLIGHT_COMPONENT_FIELD = false;
    RelayFeatureFlags.ENABLE_REQUIRED_DIRECTIVES = false;
  });

  generateTestsFromFixtures(
    `${__dirname}/fixtures/compileRelayArtifacts`,
    text => {
      const relaySchema = TestSchema.extend(RelayIRTransforms.schemaExtensions);
      const {definitions, schema} = parseGraphQLText(relaySchema, text);
      const compilerContext = new CompilerContext(schema).addAll(definitions);
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
    printAST(ast),
    moduleName => `require('${moduleName}')`,
  );
}

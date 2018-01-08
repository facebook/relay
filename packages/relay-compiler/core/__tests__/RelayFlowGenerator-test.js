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

const GraphQLCompilerContext = require('GraphQLCompilerContext');
const RelayFlowGenerator = require('RelayFlowGenerator');
const RelayRelayDirectiveTransform = require('RelayRelayDirectiveTransform');
const RelayTestSchema = require('RelayTestSchema');

const parseGraphQLText = require('parseGraphQLText');

const {transformASTSchema} = require('ASTConvert');
const {generateTestsFromFixtures} = require('RelayModernTestUtils');

describe('RelayFlowGenerator', () => {
  generateTestsFromFixtures(`${__dirname}/fixtures/flow-generator`, text => {
    const schema = transformASTSchema(RelayTestSchema, [
      RelayRelayDirectiveTransform.SCHEMA_EXTENSION,
    ]);
    const {definitions} = parseGraphQLText(schema, text);
    return new GraphQLCompilerContext(RelayTestSchema, schema)
      .addAll(definitions)
      .applyTransforms(RelayFlowGenerator.flowTransforms)
      .documents()
      .map(doc =>
        RelayFlowGenerator.generate(doc, {
          customScalars: {},
          enumsHasteModule: null,
          existingFragmentNames: new Set(['PhotoFragment']),
          inputFieldWhiteList: [],
          relayRuntimeModule: 'relay-runtime',
          useHaste: true,
        }),
      )
      .join('\n\n');
  });
});

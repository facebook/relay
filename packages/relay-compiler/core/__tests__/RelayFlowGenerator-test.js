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

function generate(text, options) {
  const schema = transformASTSchema(RelayTestSchema, [
    RelayRelayDirectiveTransform.SCHEMA_EXTENSION,
  ]);
  const {definitions} = parseGraphQLText(schema, text);
  return new GraphQLCompilerContext(RelayTestSchema, schema)
    .addAll(definitions)
    .applyTransforms(RelayFlowGenerator.flowTransforms)
    .documents()
    .map(doc => RelayFlowGenerator.generate(doc, options))
    .join('\n\n');
}

describe('RelayFlowGenerator', () => {
  generateTestsFromFixtures(`${__dirname}/fixtures/flow-generator`, text =>
    generate(text, {
      customScalars: {},
      enumsHasteModule: null,
      existingFragmentNames: new Set(['PhotoFragment']),
      inputFieldWhiteList: [],
      relayRuntimeModule: 'relay-runtime',
      useHaste: true,
    }),
  );

  it('does not add `%future added values` when the noFutureProofEnums option is set', () => {
    const text = `
      fragment ScalarField on User {
        traits
      }
    `;
    const types = generate(text, {
      customScalars: {},
      enumsHasteModule: null,
      existingFragmentNames: new Set(['PhotoFragment']),
      inputFieldWhiteList: [],
      relayRuntimeModule: 'relay-runtime',
      useHaste: true,
      // This is what's different from the tests above.
      noFutureProofEnums: true,
    });
    // Without the option, PersonalityTraits would be `('CHEERFUL' | ... | '%future added value');`
    expect(types).toContain(
      "export type PersonalityTraits = ('CHEERFUL' | 'DERISIVE' | 'HELPFUL' | 'SNARKY');",
    );
  });
});

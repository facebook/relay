/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const GraphQLCompilerContext = require('../../../core/GraphQLCompilerContext');
const RelayFlowGenerator = require('../RelayFlowGenerator');
const RelayMatchTransform = require('../../../transforms/RelayMatchTransform');
const RelayRelayDirectiveTransform = require('../../../transforms/RelayRelayDirectiveTransform');
const RelayTestSchema = require('RelayTestSchema');

const parseGraphQLText = require('parseGraphQLText');

const {transformASTSchema} = require('../../../core/ASTConvert');
const {generateTestsFromFixtures} = require('RelayModernTestUtils');

import type {TypeGeneratorOptions} from '../../RelayLanguagePluginInterface';

function generate(text, options: TypeGeneratorOptions) {
  const schema = transformASTSchema(RelayTestSchema, [
    RelayMatchTransform.SCHEMA_EXTENSION,
    RelayRelayDirectiveTransform.SCHEMA_EXTENSION,
    `
      scalar Color
      extend type User {
        color: Color
      }
    `,
  ]);
  const {definitions} = parseGraphQLText(schema, text);
  return new GraphQLCompilerContext(RelayTestSchema, schema)
    .addAll(definitions)
    .applyTransforms(RelayFlowGenerator.transforms)
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
      optionalInputFields: [],
      useHaste: true,
      useSingleArtifactDirectory: false,
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
      optionalInputFields: [],
      useHaste: true,
      useSingleArtifactDirectory: false,
      // This is what's different from the tests above.
      noFutureProofEnums: true,
    });
    // Without the option, PersonalityTraits would be `('CHEERFUL' | ... | '%future added value');`
    expect(types).toContain(
      'export type PersonalityTraits = "CHEERFUL" | "DERISIVE" | "HELPFUL" | "SNARKY";',
    );
  });

  describe('custom scalars', () => {
    const text = `
      fragment ScalarField on User {
        name
        color
      }
    `;
    const generateWithMapping = mapping =>
      generate(text, {
        customScalars: mapping,
      });

    it('maps unspecified types to `any`', () => {
      expect(
        generateWithMapping({
          // empty mapping
        }),
      ).toContain('+color: ?any,');
    });

    it('maps GraphQL types to their Flow representation', () => {
      expect(
        generateWithMapping({
          Color: 'String',
        }),
      ).toContain('+color: ?string,');
    });

    it('maps other types to global types', () => {
      const types = generateWithMapping({
        // customScalars mapping can override build in types
        String: 'LocalizedString',
        Color: 'Color',
      });
      expect(types).toContain('+color: ?Color,');
      expect(types).toContain('+name: ?LocalizedString,');
    });
  });

  it('imports fragment refs from siblings in a single artifact dir', () => {
    const text = `
      fragment Picture on Image {
        ...PhotoFragment
      }
    `;
    const types = generate(text, {
      customScalars: {},
      enumsHasteModule: null,
      existingFragmentNames: new Set(['PhotoFragment']),
      optionalInputFields: [],
      // This is what's different from the tests above.
      useHaste: false,
      useSingleArtifactDirectory: true,
    });
    expect(types).toContain(
      'import type { PhotoFragment$ref } from "./PhotoFragment.graphql";',
    );
  });
});

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @emails oncall+relay
 */

'use strict';

const GraphQLCompilerContext = require('../../../core/GraphQLCompilerContext');
const RelayFlowGenerator = require('../RelayFlowGenerator');
const RelayIRTransforms = require('../../../core/RelayIRTransforms');
const Schema = require('../../../core/Schema');

const {transformASTSchema} = require('../../../core/ASTConvert');
const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');

import type {TypeGeneratorOptions} from '../../RelayLanguagePluginInterface';

function generate(text, options: TypeGeneratorOptions, context?) {
  const relaySchema = transformASTSchema(TestSchema, [
    ...RelayIRTransforms.schemaExtensions,
    `
      scalar Color
      extend type User {
        color: Color
      }
    `,
  ]);
  const {definitions} = parseGraphQLText(relaySchema, text);
  const compilerSchema = Schema.DEPRECATED__create(TestSchema, relaySchema);
  return new GraphQLCompilerContext(compilerSchema)
    .addAll(definitions)
    .applyTransforms(RelayFlowGenerator.transforms)
    .documents()
    .map(
      doc =>
        `// ${doc.name}.graphql\n${RelayFlowGenerator.generate(
          compilerSchema,
          // $FlowFixMe - `SplitOperation` is incompatible with union type.
          doc,
          // $FlowFixMe - `SplitOperation` is incompatible with union type.
          {
            ...options,
            normalizationIR: context ? context.get(doc.name) : undefined,
          },
        )}`,
    )
    .join('\n\n');
}

describe('Snapshot tests', () => {
  function generateContext(text) {
    const relaySchema = transformASTSchema(
      TestSchema,
      RelayIRTransforms.schemaExtensions,
    );
    const {definitions, schema: extendedSchema} = parseGraphQLText(
      relaySchema,
      text,
    );
    const compilerSchema = Schema.DEPRECATED__create(
      TestSchema,
      extendedSchema,
    );
    return new GraphQLCompilerContext(compilerSchema)
      .addAll(definitions)
      .applyTransforms([
        ...RelayIRTransforms.commonTransforms,
        ...RelayIRTransforms.queryTransforms,
        ...RelayIRTransforms.codegenTransforms,
      ]);
  }
  describe('for useHaste', () => {
    generateTestsFromFixtures(
      `${__dirname}/fixtures/flow-generator/useHaste`,
      text => {
        const context = generateContext(text);
        return generate(
          text,
          {
            customScalars: {},
            existingFragmentNames: new Set(['PhotoFragment']),
            optionalInputFields: [],
            useHaste: true,
            useSingleArtifactDirectory: false,
            noFutureProofEnums: false,
          },
          context,
        );
      },
    );
  });
  describe('for useSingleDirectory', () => {
    generateTestsFromFixtures(
      `${__dirname}/fixtures/flow-generator/useSingleDirectory`,
      text => {
        const context = generateContext(text);
        return generate(
          text,
          {
            customScalars: {},
            existingFragmentNames: new Set(['PhotoFragment']),
            optionalInputFields: [],
            useHaste: false,
            useSingleArtifactDirectory: true,
            noFutureProofEnums: false,
          },
          context,
        );
      },
    );
  });
  describe('for useAnyDirectory', () => {
    generateTestsFromFixtures(
      `${__dirname}/fixtures/flow-generator/useAnyDirectory`,
      text => {
        const context = generateContext(text);
        return generate(
          text,
          {
            customScalars: {},
            existingFragmentNames: new Set(['PhotoFragment']),
            optionalInputFields: [],
            useHaste: false,
            useSingleArtifactDirectory: false,
            noFutureProofEnums: false,
          },
          context,
        );
      },
    );
  });
});

it('does not add `%future added values` when the noFutureProofEnums option is set', () => {
  const text = `
    fragment ScalarField on User {
      traits
    }
  `;
  const types = generate(text, {
    customScalars: {},
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

test('import enum definitions from single module', () => {
  const text = `
    fragment EnumTest on User {
      traits
    }
  `;
  const types = generate(text, {
    customScalars: {},
    enumsHasteModule: 'MyGraphQLEnums',
    existingFragmentNames: new Set([]),
    optionalInputFields: [],
    useHaste: true,
    noFutureProofEnums: false,
    useSingleArtifactDirectory: false,
  });
  expect(types).toContain(
    'import type { PersonalityTraits } from "MyGraphQLEnums";',
  );
});

test('import enum definitions from enum specific module', () => {
  const text = `
    fragment EnumTest on User {
      traits
    }
  `;
  const types = generate(text, {
    customScalars: {},
    enumsHasteModule: (enumName: string) => `${enumName}.graphqlenum`,
    existingFragmentNames: new Set([]),
    optionalInputFields: [],
    useHaste: true,
    noFutureProofEnums: false,
    useSingleArtifactDirectory: false,
  });
  expect(types).toContain(
    'import type { PersonalityTraits } from "PersonalityTraits.graphqlenum";',
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
      existingFragmentNames: new Set([]),
      optionalInputFields: [],
      useHaste: false,
      customScalars: mapping,
      noFutureProofEnums: false,
      useSingleArtifactDirectory: false,
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

    fragment PhotoFragment on Image {
      __typename
    }
  `;
  const types = generate(text, {
    customScalars: {},
    existingFragmentNames: new Set(['PhotoFragment']),
    optionalInputFields: [],
    // This is what's different from the tests above.
    useHaste: false,
    noFutureProofEnums: false,
    useSingleArtifactDirectory: true,
  });
  expect(types).toContain(
    'import type { PhotoFragment$ref } from "./PhotoFragment.graphql";',
  );
});

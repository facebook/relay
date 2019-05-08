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

const ClientExtensionsTransform = require('../ClientExtensionsTransform');
const GraphQLCompilerContext = require('../../core/GraphQLCompilerContext');
const RelayDirectiveClientExtensionValidationTransform = require('../RelayDirectiveClientExtensionValidationTransform');
const RelayMatchTransform = require('../RelayMatchTransform');

const {transformASTSchema} = require('../../core/ASTConvert');
const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils');

describe('RelayDirectiveClientExtensionValidationTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/relay-directive-client-extension-validation-transform`,
    text => {
      const schema = transformASTSchema(TestSchema, [
        RelayMatchTransform.SCHEMA_EXTENSION,
      ]);
      const {definitions, schema: clientSchema} = parseGraphQLText(
        schema,
        text,
      );
      return new GraphQLCompilerContext(TestSchema, clientSchema)
        .addAll(definitions)
        .applyTransforms([
          ClientExtensionsTransform.transform,
          RelayDirectiveClientExtensionValidationTransform.transform,
        ])
        .documents()
        .map(doc => JSON.stringify(doc, null, 2))
        .join('\n');
    },
  );
});

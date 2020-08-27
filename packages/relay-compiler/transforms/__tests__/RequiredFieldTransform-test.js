/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @emails oncall+relay
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const CompilerContext = require('../../core/CompilerContext');
const IRPrinter = require('../../core/IRPrinter');
const RequiredFieldTransform = require('../RequiredFieldTransform');

const {RelayFeatureFlags} = require('relay-runtime');
const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
  printAST,
} = require('relay-test-utils-internal');

describe('RequiredFieldTransform', () => {
  beforeEach(() => {
    RelayFeatureFlags.ENABLE_REQUIRED_DIRECTIVES = true;
  });

  afterEach(() => {
    RelayFeatureFlags.ENABLE_REQUIRED_DIRECTIVES = false;
  });
  const extendedSchema = TestSchema.extend([
    RequiredFieldTransform.SCHEMA_EXTENSION,
  ]);
  generateTestsFromFixtures(
    `${__dirname}/fixtures/relay-required-field-transform`,
    text => {
      const {definitions} = parseGraphQLText(extendedSchema, text);
      return new CompilerContext(extendedSchema)
        .addAll(definitions)
        .applyTransforms([RequiredFieldTransform.transform])
        .documents()
        .map(doc => IRPrinter.print(extendedSchema, doc) + printAST(doc))
        .join('\n');
    },
  );
});

describe('RequiredFieldTransform Feature Flag', () => {
  afterEach(() => {
    RelayFeatureFlags.ENABLE_REQUIRED_DIRECTIVES = false;
  });
  const extendedSchema = TestSchema.extend([
    RequiredFieldTransform.SCHEMA_EXTENSION,
  ]);
  describe('LIMITED', () => {
    beforeEach(() => {
      RelayFeatureFlags.ENABLE_REQUIRED_DIRECTIVES = 'LIMITED';
    });

    test('allows documents prefixed with RelayRequiredTest', () => {
      const text = `fragment RelayRequiredTestFragment on User {
      name @required(action: NONE)
    }`;
      const {definitions} = parseGraphQLText(extendedSchema, text);
      const context = new CompilerContext(extendedSchema).addAll(definitions);

      context.applyTransforms([RequiredFieldTransform.transform]);
    });

    test('throws on documents _not_ prefixed with RelayRequiredTest', () => {
      const text = `fragment RandomTestFragment on User {
      name @required(action: NONE)
    }`;
      const {definitions} = parseGraphQLText(extendedSchema, text);
      const context = new CompilerContext(extendedSchema).addAll(definitions);

      expect(() => {
        context.applyTransforms([RequiredFieldTransform.transform]);
      }).toThrowError(
        /^The @required directive is experimental and not yet supported for use in product code/,
      );
    });
  });
  describe('Prefix|OtherPrefix', () => {
    beforeEach(() => {
      RelayFeatureFlags.ENABLE_REQUIRED_DIRECTIVES = 'Prefix|OtherPrefix';
    });

    test('allows documents prefixed with Prefix', () => {
      const text = `fragment PrefixFragment on User {
      name @required(action: NONE)
    }`;
      const {definitions} = parseGraphQLText(extendedSchema, text);
      const context = new CompilerContext(extendedSchema).addAll(definitions);

      context.applyTransforms([RequiredFieldTransform.transform]);
    });

    test('allows documents prefixed with OtherPrefix', () => {
      const text = `fragment PrefixFragment on User {
      name @required(action: NONE)
    }`;
      const {definitions} = parseGraphQLText(extendedSchema, text);
      const context = new CompilerContext(extendedSchema).addAll(definitions);

      context.applyTransforms([RequiredFieldTransform.transform]);
    });

    test('throws on documents _not_ prefixed with EitherPrefix', () => {
      const text = `fragment RandomTestFragment on User {
      name @required(action: NONE)
    }`;
      const {definitions} = parseGraphQLText(extendedSchema, text);
      const context = new CompilerContext(extendedSchema).addAll(definitions);

      expect(() => {
        context.applyTransforms([RequiredFieldTransform.transform]);
      }).toThrowError(
        /^The @required directive is experimental and not yet supported for use in product code/,
      );
    });
  });
  describe('false', () => {
    beforeEach(() => {
      RelayFeatureFlags.ENABLE_REQUIRED_DIRECTIVES = false;
    });

    test('throws on documents prefixed with RelayRequiredTest', () => {
      const text = `fragment RelayRequiredTestFragment on User {
      name @required(action: NONE)
    }`;
      const {definitions} = parseGraphQLText(extendedSchema, text);
      const context = new CompilerContext(extendedSchema).addAll(definitions);

      expect(() => {
        context.applyTransforms([RequiredFieldTransform.transform]);
      }).toThrowError(
        /^The @required directive is experimental and not yet supported for use in product code/,
      );
    });

    test('throws on documents _not_ prefixed with RelayRequiredTest', () => {
      const text = `fragment RandomTestFragment on User {
      name @required(action: NONE)
    }`;
      const {definitions} = parseGraphQLText(extendedSchema, text);
      const context = new CompilerContext(extendedSchema).addAll(definitions);

      expect(() => {
        context.applyTransforms([RequiredFieldTransform.transform]);
      }).toThrowError(
        /^The @required directive is experimental and not yet supported for use in product code/,
      );
    });
  });
});

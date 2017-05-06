/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @providesModule RelayValidator
 * @format
 */

'use strict';

const util = require('util');

const {
  ArgumentsOfCorrectTypeRule,
  DefaultValuesOfCorrectTypeRule,
  formatError,
  FragmentsOnCompositeTypesRule,
  KnownArgumentNamesRule,
  KnownFragmentNamesRule,
  KnownTypeNamesRule,
  LoneAnonymousOperationRule,
  NoFragmentCyclesRule,
  NoUndefinedVariablesRule,
  NoUnusedFragmentsRule,
  NoUnusedVariablesRule,
  OverlappingFieldsCanBeMergedRule,
  PossibleFragmentSpreadsRule,
  ProvidedNonNullArgumentsRule,
  ScalarLeafsRule,
  UniqueArgumentNamesRule,
  UniqueFragmentNamesRule,
  UniqueInputFieldNamesRule,
  UniqueOperationNamesRule,
  UniqueVariableNamesRule,
  validate,
  VariablesAreInputTypesRule,
  VariablesInAllowedPositionRule,
} = require('graphql');

import type {
  DocumentNode,
  GraphQLField,
  GraphQLSchema,
  ValidationContext,
} from 'graphql';

function validateOrThrow(
  document: DocumentNode,
  schema: GraphQLSchema,
  rules: Array<Function>,
): void {
  const validationErrors = validate(schema, document, rules);
  if (validationErrors && validationErrors.length > 0) {
    const formattedErrors = validationErrors.map(formatError);
    const error = new Error(
      util.format(
        'You supplied a GraphQL document with validation errors:\n%s',
        formattedErrors.map(e => e.message).join('\n'),
      ),
    );
    (error: any).validationErrors = formattedErrors;
    throw error;
  }
}

function DisallowIdAsAliasValidationRule(context: ValidationContext) {
  return {
    Field(field: GraphQLField<*, *>): void {
      if (
        field.alias &&
        field.alias.value === 'id' &&
        field.name.value !== 'id'
      ) {
        throw new Error(
          'RelayValidator: Relay does not allow aliasing fields to `id`. ' +
            'This name is reserved for the globally unique `id` field on ' +
            '`Node`.',
        );
      }
    },
  };
}

module.exports = {
  GLOBAL_RULES: [
    KnownArgumentNamesRule,
    KnownFragmentNamesRule,
    NoFragmentCyclesRule,
    NoUndefinedVariablesRule,
    NoUnusedFragmentsRule,
    NoUnusedVariablesRule,
    OverlappingFieldsCanBeMergedRule,
    ProvidedNonNullArgumentsRule,
    UniqueArgumentNamesRule,
    UniqueFragmentNamesRule,
    UniqueInputFieldNamesRule,
    UniqueOperationNamesRule,
    UniqueVariableNamesRule,
  ],
  LOCAL_RULES: [
    ArgumentsOfCorrectTypeRule,
    DefaultValuesOfCorrectTypeRule,
    // TODO #13818691: make this aware of @fixme_fat_interface
    // FieldsOnCorrectTypeRule,
    FragmentsOnCompositeTypesRule,
    KnownTypeNamesRule,
    // TODO #17737009: Enable this after cleaning up existing issues
    // KnownDirectivesRule,
    LoneAnonymousOperationRule,
    PossibleFragmentSpreadsRule,
    ScalarLeafsRule,
    VariablesAreInputTypesRule,
    VariablesInAllowedPositionRule,
    DisallowIdAsAliasValidationRule,
  ],
  validate: validateOrThrow,
};

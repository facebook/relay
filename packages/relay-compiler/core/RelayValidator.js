/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

'use strict';

const Profiler = require('./GraphQLCompilerProfiler');

const util = require('util');

const {
  LoneAnonymousOperationRule,
  NoUnusedVariablesRule,
  PossibleFragmentSpreadsRule,
  UniqueArgumentNamesRule,
  UniqueFragmentNamesRule,
  UniqueInputFieldNamesRule,
  UniqueVariableNamesRule,
  VariablesAreInputTypesRule,
  formatError,
} = require('graphql');

import type {Schema} from './Schema';
import type {
  DocumentNode,
  FieldNode,
  ValidationRule,
  ValidationContext,
} from 'graphql';

function validateOrThrow(
  schema: Schema,
  document: DocumentNode,
  rules: $ReadOnlyArray<ValidationRule>,
): void {
  const validationErrors = schema.DEPRECATED__validate(document, rules);
  if (validationErrors && validationErrors.length > 0) {
    const formattedErrors = validationErrors.map(formatError);
    const errorMessages = validationErrors.map(e => e.toString());

    const error = new Error(
      util.format(
        'You supplied a GraphQL document with validation errors:\n%s',
        errorMessages.join('\n'),
      ),
    );
    (error: $FlowFixMe).validationErrors = formattedErrors;
    throw error;
  }
}

function DisallowIdAsAliasValidationRule(
  context: ValidationContext,
): $TEMPORARY$object<{|Field: (field: FieldNode) => void|}> {
  return {
    Field(field: FieldNode): void {
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
    /* Some rules are not enabled (potentially non-exhaustive)
     *
     * - KnownFragmentNamesRule: RelayClassic generates fragments at runtime,
     *   so RelayCompat queries might reference fragments unknown in build time.
     * - NoFragmentCyclesRule: Because of @argumentDefinitions, this validation
     *   incorrectly flags a subset of fragments using @include/@skip as
     *   recursive.
     * - NoUndefinedVariablesRule: Because of @argumentDefinitions, this
     *   validation incorrectly marks some fragment variables as undefined.
     * - NoUnusedFragmentsRule: Queries generated dynamically with RelayCompat
     *   might use unused fragments.
     * - OverlappingFieldsCanBeMergedRule: RelayClassic auto-resolves
     *   overlapping fields by generating aliases.
     */
    NoUnusedVariablesRule,
    UniqueArgumentNamesRule,
    UniqueFragmentNamesRule,
    UniqueInputFieldNamesRule,
    UniqueVariableNamesRule,
  ],
  LOCAL_RULES: [
    /*
     * GraphQL built-in rules: a subset of these rules are enabled, some of the
     * default rules conflict with Relays-specific features:
     * - FieldsOnCorrectTypeRule: is not aware of @fixme_fat_interface.
     * - KnownDirectivesRule: doesn't pass with @arguments and other Relay
     *   directives.
     * - ScalarLeafsRule: is violated by the @match directive since these rules
     *   run before any transform steps.
     * - VariablesInAllowedPositionRule: violated by the @arguments directive,
     *   since @arguments is not defined in the schema. relay-compiler does its
     *   own type-checking for variable/argument usage that is aware of fragment
     *   variables.
     */
    LoneAnonymousOperationRule,
    PossibleFragmentSpreadsRule,
    VariablesAreInputTypesRule,

    // Relay-specific validation
    DisallowIdAsAliasValidationRule,
  ],
  validate: (Profiler.instrument(validateOrThrow, 'RelayValidator.validate'): (
    schema: Schema,
    document: DocumentNode,
    rules: $ReadOnlyArray<ValidationRule>,
  ) => void),
};

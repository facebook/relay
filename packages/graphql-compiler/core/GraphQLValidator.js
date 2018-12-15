/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const Profiler = require('./GraphQLCompilerProfiler');

const util = require('util');

const {
  formatError,
  FragmentsOnCompositeTypesRule,
  KnownArgumentNamesRule,
  KnownTypeNamesRule,
  LoneAnonymousOperationRule,
  NoUnusedVariablesRule,
  PossibleFragmentSpreadsRule,
  UniqueArgumentNamesRule,
  UniqueFragmentNamesRule,
  UniqueInputFieldNamesRule,
  UniqueOperationNamesRule,
  UniqueVariableNamesRule,
  validate,
  ValuesOfCorrectTypeRule,
  VariablesAreInputTypesRule,
  VariablesInAllowedPositionRule,
} = require('graphql');

import type {DocumentNode, GraphQLSchema} from 'graphql';

function validateOrThrow(
  document: DocumentNode,
  schema: GraphQLSchema,
  rules: $ReadOnlyArray<Function>,
): void {
  const validationErrors = validate(schema, document, rules);
  if (validationErrors && validationErrors.length > 0) {
    const formattedErrors = validationErrors.map(formatError);
    const errorMessages = validationErrors.map(e => e.toString());

    const error = new Error(
      util.format(
        'You supplied a GraphQL document with validation errors:\n%s',
        errorMessages.join('\n'),
      ),
    );
    (error: any).validationErrors = formattedErrors;
    throw error;
  }
}

module.exports = {
  GLOBAL_RULES: [
    KnownArgumentNamesRule,
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
    UniqueOperationNamesRule,
    UniqueVariableNamesRule,
  ],
  LOCAL_RULES: [
    /* Some rules are not enabled (potentially non-exhaustive)
     *
     * - FieldsOnCorrectTypeRule: is not aware of @fixme_fat_interface.
     * - KnownDirectivesRule: doesn't pass with @arguments and other Relay
     *   directives.
     * - ScalarLeafsRule: is violated by the @match directive since these rules
     *   run before any transform steps.
     */
    FragmentsOnCompositeTypesRule,
    KnownTypeNamesRule,
    LoneAnonymousOperationRule,
    PossibleFragmentSpreadsRule,
    ValuesOfCorrectTypeRule,
    VariablesAreInputTypesRule,
    VariablesInAllowedPositionRule,
  ],
  validate: Profiler.instrument(validateOrThrow, 'GraphQLValidator.validate'),
};

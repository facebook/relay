/**
 * Copyright (c) 2013-present, Facebook, Inc.
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
  ScalarLeafsRule,
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
  rules: Array<Function>,
): void {
  const validationErrors = validate(schema, document, rules);
  if (validationErrors && validationErrors.length > 0) {
    const formattedErrors = validationErrors.map(formatError);
    const errorMessages = validationErrors.map(
      e => (e.source ? `${e.source.name}: ${e.message}` : e.message),
    );

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
    // TODO #19327202 Relay Classic generates some fragments in runtime, so Relay
    // Modern queries might reference fragments unknown in build time
    // KnownFragmentNamesRule,
    // TODO: #25618795 Because of @argumentDefinitions, this validation
    // incorrectly flags a subset of fragments using @include/@skip as recursive.
    // NoFragmentCyclesRule,
    // TODO #19327144 Because of @argumentDefinitions, this validation
    // incorrectly marks some fragment variables as undefined.
    // NoUndefinedVariablesRule,
    // TODO #19327202 Queries generated dynamically with Relay Classic might use
    // unused fragments
    // NoUnusedFragmentsRule,
    NoUnusedVariablesRule,
    // TODO #19327202 Relay Classic auto-resolves overlapping fields by
    // generating aliases
    //OverlappingFieldsCanBeMergedRule,
    UniqueArgumentNamesRule,
    UniqueFragmentNamesRule,
    UniqueInputFieldNamesRule,
    UniqueOperationNamesRule,
    UniqueVariableNamesRule,
  ],
  LOCAL_RULES: [
    // TODO #13818691: make this aware of @fixme_fat_interface
    // FieldsOnCorrectTypeRule,
    FragmentsOnCompositeTypesRule,
    KnownTypeNamesRule,
    // TODO #17737009: Enable this after cleaning up existing issues
    // KnownDirectivesRule,
    LoneAnonymousOperationRule,
    PossibleFragmentSpreadsRule,
    ScalarLeafsRule,
    ValuesOfCorrectTypeRule,
    VariablesAreInputTypesRule,
    VariablesInAllowedPositionRule,
  ],
  validate: Profiler.instrument(validateOrThrow, 'GraphQLValidator.validate'),
};

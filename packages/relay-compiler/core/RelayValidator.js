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

const {NoUnusedVariablesRule, formatError} = require('graphql');

import type {Schema} from './Schema';
import type {DocumentNode, ValidationRule} from 'graphql';

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
  ],
  validate: (Profiler.instrument(validateOrThrow, 'RelayValidator.validate'): (
    schema: Schema,
    document: DocumentNode,
    rules: $ReadOnlyArray<ValidationRule>,
  ) => void),
};

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
 */

'use strict';

const GraphQL = require('graphql');

const util = require('util');

import type {
  DocumentNode,
  GraphQLField,
  GraphQLSchema,
  ValidationContext,
} from 'graphql';

function validate(
  document: DocumentNode,
  schema: GraphQLSchema,
  rules: Array<Function>,
): void {
  const validationErrors = GraphQL.validate(schema, document, rules);
  if (validationErrors && validationErrors.length > 0) {
    const formattedErrors = validationErrors.map(GraphQL.formatError);
    const error = new Error(util.format(
      'You supplied a GraphQL document with validation errors:\n%s',
      formattedErrors.map(e => e.message).join('\n')
    ));
    (error: any).validationErrors = formattedErrors;
    throw error;
  }
}

function DisallowIdAsAliasValidation(context: ValidationContext) {
  return {
    Field(field: GraphQLField<*, *>): void {
      if (
        field.alias && field.alias.value === 'id' && field.name.value !== 'id'
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
    require(
      'graphql/validation/rules/KnownArgumentNames'
    ).KnownArgumentNames,
    require(
      'graphql/validation/rules/KnownFragmentNames'
    ).KnownFragmentNames,
    require(
      'graphql/validation/rules/NoFragmentCycles'
    ).NoFragmentCycles,
    require(
      'graphql/validation/rules/NoUndefinedVariables'
    ).NoUndefinedVariables,
    require(
      'graphql/validation/rules/NoUnusedFragments'
    ).NoUnusedFragments,
    require(
      'graphql/validation/rules/NoUnusedVariables'
    ).NoUnusedVariables,
    require(
      'graphql/validation/rules/OverlappingFieldsCanBeMerged'
    ).OverlappingFieldsCanBeMerged,
    require(
      'graphql/validation/rules/ProvidedNonNullArguments'
    ).ProvidedNonNullArguments,
    require(
      'graphql/validation/rules/UniqueArgumentNames'
    ).UniqueArgumentNames,
    require(
      'graphql/validation/rules/UniqueFragmentNames'
    ).UniqueFragmentNames,
    require(
      'graphql/validation/rules/UniqueInputFieldNames'
    ).UniqueInputFieldNames,
    require(
      'graphql/validation/rules/UniqueOperationNames'
    ).UniqueOperationNames,
    require(
      'graphql/validation/rules/UniqueVariableNames'
    ).UniqueVariableNames,
  ],
  LOCAL_RULES: [
    require(
      'graphql/validation/rules/ArgumentsOfCorrectType'
    ).ArgumentsOfCorrectType,
    require(
      'graphql/validation/rules/DefaultValuesOfCorrectType'
    ).DefaultValuesOfCorrectType,
    // TODO #13818691: make this aware of @fixme_fat_interface
    /*
    require(
      'graphql/validation/rules/FieldsOnCorrectType'
    ).FieldsOnCorrectType,
    */
    require(
      'graphql/validation/rules/FragmentsOnCompositeTypes'
    ).FragmentsOnCompositeTypes,
    require(
      'graphql/validation/rules/KnownTypeNames'
    ).KnownTypeNames,
    require(
      'graphql/validation/rules/LoneAnonymousOperation'
    ).LoneAnonymousOperation,
    require(
      'graphql/validation/rules/PossibleFragmentSpreads'
    ).PossibleFragmentSpreads,
    require(
      'graphql/validation/rules/ScalarLeafs'
    ).ScalarLeafs,
    require(
      'graphql/validation/rules/VariablesAreInputTypes'
    ).VariablesAreInputTypes,
    require(
      'graphql/validation/rules/VariablesInAllowedPosition'
    ).VariablesInAllowedPosition,
    DisallowIdAsAliasValidation,
  ],
  validate,
};

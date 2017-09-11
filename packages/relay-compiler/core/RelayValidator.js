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

const {GLOBAL_RULES, LOCAL_RULES, validate} = require('GraphQLValidator');

import type {GraphQLField, ValidationContext} from 'graphql';

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

const relayGlobalRules = GLOBAL_RULES;

const relayLocalRules = [...LOCAL_RULES, DisallowIdAsAliasValidationRule];

module.exports = {
  GLOBAL_RULES: relayGlobalRules,
  LOCAL_RULES: relayLocalRules,
  validate,
};

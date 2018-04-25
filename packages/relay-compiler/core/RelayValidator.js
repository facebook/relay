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

const {Validator} = require('graphql-compiler');

import type {GraphQLField, ValidationContext} from 'graphql';

const {GLOBAL_RULES, LOCAL_RULES, validate} = Validator;

function DisallowIdAsAliasValidationRule(context: ValidationContext) {
  return {
    Field(field: GraphQLField<*, *>): void {
      if (
        /* $FlowFixMe(>=0.68.0 site=react_native_fb,react_native_oss) This
         * comment suppresses an error found when Flow v0.68 was deployed. To
         * see the error delete this comment and run Flow. */
        field.alias &&
        field.alias.value === 'id' &&
        /* $FlowFixMe(>=0.68.0 site=react_native_fb,react_native_oss) This
         * comment suppresses an error found when Flow v0.68 was deployed. To
         * see the error delete this comment and run Flow. */
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

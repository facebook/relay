/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const {Validator} = require('graphql-compiler');

import type {FieldNode, ValidationContext} from 'graphql';

const {GLOBAL_RULES, LOCAL_RULES, validate} = Validator;

function DisallowIdAsAliasValidationRule(context: ValidationContext) {
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

const relayGlobalRules = GLOBAL_RULES;

const relayLocalRules = [...LOCAL_RULES, DisallowIdAsAliasValidationRule];

module.exports = {
  GLOBAL_RULES: relayGlobalRules,
  LOCAL_RULES: relayLocalRules,
  validate,
};

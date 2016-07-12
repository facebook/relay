/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule validateMutationConfig
 * @flow
 */

'use strict';

import type {RelayMutationConfig} from 'RelayTypes';

const invariant = require('invariant');
const sprintf = require('sprintf');
const testEditDistance = require('testEditDistance');
const warning = require('warning');

type PropertyDescription = {
  [name: string]: Validator;
};
type Validator = {
  assert: Function,
  message: string,
  type: 'DEPRECATED' | 'OPTIONAL' | 'REQUIRED',
};

const FUZZY_THRESHOLD = 3;

/* eslint-disable no-unused-vars */
const DEPRECATED = Object.freeze({
  assert: warning,
  message: 'has deprecated property',
  type: 'DEPRECATED',
});
/* eslint-enable no-unused-vars */

const OPTIONAL = Object.freeze({
  // These first two properties are not needed, but including them is easier
  // than getting Flow to accept a disjoint union.
  assert: () => {},
  message: '',
  type: 'OPTIONAL',
});

const REQUIRED = {
  assert: invariant,
  message: 'must have property',
  type: 'REQUIRED',
};

function validateMutationConfig(
  config: RelayMutationConfig,
  name: string,
): void {
  function assertValid(properties: PropertyDescription): void {
    // Check for unexpected properties.
    Object.keys(config).forEach(property => {
      if (property === 'type') {
        return;
      }

      if (!properties.hasOwnProperty(property)) {
        const message = sprintf(
          'validateMutationConfig: Unexpected key `%s` in `%s` config ' +
          'for `%s`',
          property,
          config.type,
          name
        );
        const suggestion = Object.keys(properties).find(
          candidate => testEditDistance(candidate, property, FUZZY_THRESHOLD)
        );
        if (suggestion) {
          invariant(false, '%s; did you mean `%s`?', message, suggestion);
        } else {
          /* eslint-disable fb-www/sprintf-like-args-uniqueness */
          invariant(false, '%s.', message);
          /* eslint-enable fb-www/sprintf-like-args-uniqueness */
        }
      }
    });

    // Check for deprecated and missing properties.
    Object.keys(properties).forEach(property => {
      const validator = properties[property];
      const isRequired = validator.type === 'REQUIRED';
      const isDeprecated = validator.type === 'DEPRECATED';
      const present = config.hasOwnProperty(property);
      if (
        isRequired && !present ||
        isDeprecated && present
      ) {
        validator.assert(
          false,
          'validateMutationConfig: `%s` config on `%s` %s `%s`.',
          config.type,
          name,
          validator.message,
          property
        );
      }
    });
  }

  switch (config.type) {
    case 'FIELDS_CHANGE':
      assertValid({
        fieldIDs: REQUIRED,
      });
      break;

    case 'RANGE_ADD':
      assertValid({
        connectionName: REQUIRED,
        edgeName: REQUIRED,
        parentID: OPTIONAL,
        parentName: OPTIONAL,
        rangeBehaviors: REQUIRED,
      }) ||
      assertValid({
        listName: REQUIRED,
        newElementName: REQUIRED,
        parentID: OPTIONAL,
        parentName: OPTIONAL,
        rangeBehaviors: REQUIRED,
      });
      break;

    case 'NODE_DELETE':
      assertValid({
        connectionName: REQUIRED,
        deletedIDFieldName: REQUIRED,
        parentID: OPTIONAL,
        parentName: REQUIRED,
      });
      break;

    case 'RANGE_DELETE':
      assertValid({
        connectionName: REQUIRED,
        deletedIDFieldName: REQUIRED,
        parentID: OPTIONAL,
        parentName: REQUIRED,
        pathToConnection: REQUIRED,
      });
      break;

    case 'REQUIRED_CHILDREN':
      assertValid({
        children: REQUIRED,
      });
      break;

    default:
      invariant(
        false,
        'validateMutationConfig: unknown config type `%s` on `%s`',
        config.type,
        name,
      );
  }
}

module.exports = validateMutationConfig;

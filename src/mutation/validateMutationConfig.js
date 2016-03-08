/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule validateMutationConfig
 * @typechecks
 * @flow
 */

'use strict';

import type {RelayMutationConfig} from 'RelayTypes';

const invariant = require('invariant');
const sprintf = require('sprintf');
const testEditDistance = require('testEditDistance');

type PropertyDescription = {
  [name: string]: boolean;
};

const FUZZY_THRESHOLD = 3;
const OPTIONAL = false;
const REQUIRED = true;

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

    // Check for missing properties.
    Object.keys(properties).forEach(property => {
      const isRequired = properties[property];
      if (isRequired && !config[property]) {
        invariant(
          false,
          'validateMutationConfig: `%s` config on `%s` must have property ' +
          '`%s`.',
          config.type,
          name,
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
        parentID: REQUIRED,
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

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
 * 
 */

'use strict';

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var invariant = require('fbjs/lib/invariant');
var sprintf = require('fbjs/lib/sprintf');
var testEditDistance = require('./testEditDistance');

var FUZZY_THRESHOLD = 3;
var OPTIONAL = false;
var REQUIRED = true;

function validateMutationConfig(config, name) {
  function assertValid(properties) {
    // Check for unexpected properties.
    _Object$keys(config).forEach(function (property) {
      if (property === 'type') {
        return;
      }

      if (!properties.hasOwnProperty(property)) {
        var message = sprintf('validateMutationConfig: Unexpected key `%s` in `%s` config ' + 'for `%s`', property, config.type, name);
        var suggestion = _Object$keys(properties).find(function (candidate) {
          return testEditDistance(candidate, property, FUZZY_THRESHOLD);
        });
        if (suggestion) {
          !false ? process.env.NODE_ENV !== 'production' ? invariant(false, '%s; did you mean `%s`?', message, suggestion) : invariant(false) : undefined;
        } else {
          /* eslint-disable fb-www/sprintf-like-args-uniqueness */
          !false ? process.env.NODE_ENV !== 'production' ? invariant(false, '%s.', message) : invariant(false) : undefined;
          /* eslint-enable fb-www/sprintf-like-args-uniqueness */
        }
      }
    });

    // Check for missing properties.
    _Object$keys(properties).forEach(function (property) {
      var isRequired = properties[property];
      if (isRequired && !config[property]) {
        !false ? process.env.NODE_ENV !== 'production' ? invariant(false, 'validateMutationConfig: `%s` config on `%s` must have property ' + '`%s`.', config.type, name, property) : invariant(false) : undefined;
      }
    });
  }

  switch (config.type) {
    case 'FIELDS_CHANGE':
      assertValid({
        fieldIDs: REQUIRED
      });
      break;

    case 'RANGE_ADD':
      assertValid({
        connectionName: REQUIRED,
        edgeName: REQUIRED,
        parentID: REQUIRED,
        parentName: OPTIONAL,
        rangeBehaviors: REQUIRED
      });
      break;

    case 'NODE_DELETE':
      assertValid({
        connectionName: REQUIRED,
        deletedIDFieldName: REQUIRED,
        parentID: REQUIRED,
        parentName: REQUIRED
      });
      break;

    case 'RANGE_DELETE':
      assertValid({
        connectionName: REQUIRED,
        deletedIDFieldName: REQUIRED,
        parentID: REQUIRED,
        parentName: REQUIRED,
        pathToConnection: REQUIRED
      });
      break;

    case 'REQUIRED_CHILDREN':
      assertValid({
        children: REQUIRED
      });
      break;

    default:
      !false ? process.env.NODE_ENV !== 'production' ? invariant(false, 'validateMutationConfig: unknown config type `%s` on `%s`', config.type, name) : invariant(false) : undefined;
  }
}

module.exports = validateMutationConfig;
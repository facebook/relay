/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule rangeOperationToMetadataKey
 * 
 * @typechecks
 */

'use strict';

var _Object$freeze = require('babel-runtime/core-js/object/freeze')['default'];

var GraphQLMutatorConstants = require('./GraphQLMutatorConstants');
var mapObject = require('fbjs/lib/mapObject');

var RANGE_OPERATION_METADATA_PREFIX = '__rangeOperation';
var RANGE_OPERATION_METADATA_SUFFIX = '__';

/**
 * A map from developer-friendly operation names ("append", "prepend", "remove")
 * to internal book-keeping keys used to store metadata on records
 * ("__rangeOperationAppend__" etc).
 */
var rangeOperationToMetadataKey = mapObject(GraphQLMutatorConstants.RANGE_OPERATIONS, function (value, key, object) {
  var capitalizedKey = key[0].toUpperCase() + key.slice(1);
  return RANGE_OPERATION_METADATA_PREFIX + capitalizedKey + RANGE_OPERATION_METADATA_SUFFIX;
});

module.exports = _Object$freeze(rangeOperationToMetadataKey);
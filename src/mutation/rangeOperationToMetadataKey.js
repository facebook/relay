/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule rangeOperationToMetadataKey
 * @flow
 */

'use strict';

const GraphQLMutatorConstants = require('GraphQLMutatorConstants');

const mapObject = require('mapObject');

const RANGE_OPERATION_METADATA_PREFIX = '__rangeOperation';
const RANGE_OPERATION_METADATA_SUFFIX = '__';

/**
 * @internal
 *
 * A map from developer-friendly operation names ("append", "prepend", "remove")
 * to internal book-keeping keys used to store metadata on records
 * ("__rangeOperationAppend__" etc).
 */
const rangeOperationToMetadataKey = mapObject(
  GraphQLMutatorConstants.RANGE_OPERATIONS,
  (value, key, object) => {
    const capitalizedKey = key[0].toUpperCase() + key.slice(1);
    return (
      RANGE_OPERATION_METADATA_PREFIX +
      capitalizedKey +
      RANGE_OPERATION_METADATA_SUFFIX
    );
  }
);

module.exports = Object.freeze(rangeOperationToMetadataKey);

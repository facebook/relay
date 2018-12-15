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

const {RangeOperations} = require('relay-runtime');

import type {RangeOperation} from 'relay-runtime';

/**
 * @internal
 *
 * A map from developer-friendly operation names ("append", "prepend", "remove")
 * to internal book-keeping keys used to store metadata on records
 * ("__rangeOperationAppend__" etc).
 */
const rangeOperationToMetadataKey: {[operation: RangeOperation]: string} = {};
rangeOperationToMetadataKey[RangeOperations.APPEND] =
  '__rangeOperationAppend__';
rangeOperationToMetadataKey[RangeOperations.IGNORE] =
  '__rangeOperationIgnore__';
rangeOperationToMetadataKey[RangeOperations.PREPEND] =
  '__rangeOperationPrepend__';
rangeOperationToMetadataKey[RangeOperations.REFETCH] =
  '__rangeOperationRefetch__';
rangeOperationToMetadataKey[RangeOperations.REMOVE] =
  '__rangeOperationRemove__';

module.exports = Object.freeze(rangeOperationToMetadataKey);

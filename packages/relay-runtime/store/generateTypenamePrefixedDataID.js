/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {DataID} from 'relay-runtime/util/RelayRuntimeTypes';

const TYPENAME_PREFIX = '__type:';

function generateTypenamePrefixedDataID(
  typeName: string,
  dataID: DataID,
): DataID {
  return `${TYPENAME_PREFIX}${typeName}:${dataID}`;
}

module.exports = {generateTypenamePrefixedDataID};

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

import type {DataID} from '../util/RelayRuntimeTypes';

const PREFIX = 'client:__type:';
const TYPE_SCHEMA_TYPE = '__TypeSchema';

function generateTypeID(typeName: string): DataID {
  return PREFIX + typeName;
}

function isTypeID(id: DataID): boolean {
  return id.indexOf(PREFIX) === 0;
}

module.exports = {generateTypeID, isTypeID, TYPE_SCHEMA_TYPE};

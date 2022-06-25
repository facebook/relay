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

const {generateClientID} = require('./ClientID');
const {ROOT_ID} = require('./RelayStoreUtils');

const VIEWER_ID: DataID = generateClientID(ROOT_ID, 'viewer');
const VIEWER_TYPE = 'Viewer';

module.exports = {
  VIEWER_ID,
  VIEWER_TYPE,
};

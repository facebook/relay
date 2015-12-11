/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DliteFetchModeConstants
 * @typechecks
 */

'use strict';

const keyMirror = require('keyMirror');

var DliteFetchModeConstants = keyMirror({
  FETCH_MODE_CLIENT: null,
  FETCH_MODE_PRELOAD: null,
  FETCH_MODE_REFETCH: null,
});

module.exports = DliteFetchModeConstants;

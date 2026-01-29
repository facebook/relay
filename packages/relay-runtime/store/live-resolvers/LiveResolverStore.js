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

const RelayModernStore = require('../RelayModernStore');

// This is retained here for backward compatibility.
// Everyone should use RelayModernStore now.
module.exports = RelayModernStore;

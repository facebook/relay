/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @providesModule RelayTestUtilsPublic
 */

'use strict';

const RelayModernMockEnvironment = require('RelayModernMockEnvironment');
const RelayTestSchemaPath = require('RelayTestSchemaPath');

/**
 * The public interface to Relay Test Utils.
 */
module.exports = {
  MockEnvironment: RelayModernMockEnvironment,
  testSchemaPath: RelayTestSchemaPath,
};

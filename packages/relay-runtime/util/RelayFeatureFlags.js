/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

'use strict';

type FeatureFlags = {|
  ENABLE_VARIABLE_CONNECTION_KEY: boolean,
  USE_RECORD_SOURCE_MAP_IMPL: boolean,
|};

const RelayFeatureFlags: FeatureFlags = {
  // T45504512: new connection model
  ENABLE_VARIABLE_CONNECTION_KEY: false,
  USE_RECORD_SOURCE_MAP_IMPL: false,
};

module.exports = RelayFeatureFlags;

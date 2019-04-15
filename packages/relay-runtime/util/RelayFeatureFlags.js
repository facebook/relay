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
  // Configurable
  MERGE_FETCH_AND_FRAGMENT_VARS: boolean,
  PREFER_FRAGMENT_OWNER_OVER_CONTEXT: boolean,
  ENABLE_CLIENT_EXTENSIONS: boolean,
  ENABLE_INCREMENTAL_DELIVERY: boolean,

  // Constants
  +INCREMENTAL_DELIVERY_VARIABLE_NAME: string,
|};

const RelayFeatureFlags: FeatureFlags = {
  MERGE_FETCH_AND_FRAGMENT_VARS: false,
  PREFER_FRAGMENT_OWNER_OVER_CONTEXT: false,
  ENABLE_CLIENT_EXTENSIONS: false,
  ENABLE_INCREMENTAL_DELIVERY: false,
  INCREMENTAL_DELIVERY_VARIABLE_NAME: 'RELAY_INCREMENTAL_DELIVERY',
};

module.exports = RelayFeatureFlags;

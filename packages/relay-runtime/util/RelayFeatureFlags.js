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
|};

const RelayFeatureFlags: FeatureFlags = {
  MERGE_FETCH_AND_FRAGMENT_VARS: false,
  PREFER_FRAGMENT_OWNER_OVER_CONTEXT: false,
};

module.exports = RelayFeatureFlags;

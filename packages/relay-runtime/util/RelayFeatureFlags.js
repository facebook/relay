/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

type FeatureFlags = {|
  ENABLE_VARIABLE_CONNECTION_KEY: boolean,
  ENABLE_PARTIAL_RENDERING_DEFAULT: boolean,
  ENABLE_RELAY_CONTAINERS_SUSPENSE: boolean,
  ENABLE_UNIQUE_MUTATION_ROOT: boolean,
|};

const RelayFeatureFlags: FeatureFlags = {
  // T45504512: new connection model
  ENABLE_VARIABLE_CONNECTION_KEY: false,
  ENABLE_PARTIAL_RENDERING_DEFAULT: false,
  ENABLE_RELAY_CONTAINERS_SUSPENSE: false,
  ENABLE_UNIQUE_MUTATION_ROOT: true,
};

module.exports = RelayFeatureFlags;

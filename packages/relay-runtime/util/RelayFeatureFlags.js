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
  ENABLE_PRECISE_TYPE_REFINEMENT: boolean,
  ENABLE_REACT_FLIGHT_COMPONENT_FIELD: boolean,
  ENABLE_REQUIRED_DIRECTIVES: boolean | string,
  ENABLE_GETFRAGMENTIDENTIFIER_OPTIMIZATION: boolean,
  ENABLE_FRIENDLY_QUERY_NAME_GQL_URL: boolean,
|};

const RelayFeatureFlags: FeatureFlags = {
  ENABLE_VARIABLE_CONNECTION_KEY: false,
  ENABLE_PARTIAL_RENDERING_DEFAULT: false,
  ENABLE_RELAY_CONTAINERS_SUSPENSE: false,
  ENABLE_PRECISE_TYPE_REFINEMENT: false,
  ENABLE_REACT_FLIGHT_COMPONENT_FIELD: false,
  ENABLE_REQUIRED_DIRECTIVES: false,
  ENABLE_GETFRAGMENTIDENTIFIER_OPTIMIZATION: false,
  ENABLE_FRIENDLY_QUERY_NAME_GQL_URL: false,
};

module.exports = RelayFeatureFlags;

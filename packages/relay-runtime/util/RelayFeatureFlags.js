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

import type {Disposable} from '../util/RelayRuntimeTypes';

export type FeatureFlags = {
  ENABLE_CLIENT_EDGES: boolean,
  ENABLE_VARIABLE_CONNECTION_KEY: boolean,
  ENABLE_REACT_FLIGHT_COMPONENT_FIELD: boolean,
  ENABLE_RELAY_RESOLVERS: boolean,
  ENABLE_GETFRAGMENTIDENTIFIER_OPTIMIZATION: boolean,
  ENABLE_FRIENDLY_QUERY_NAME_GQL_URL: boolean,
  ENABLE_LOAD_QUERY_REQUEST_DEDUPING: boolean,
  ENABLE_DO_NOT_WRAP_LIVE_QUERY: boolean,
  ENABLE_NOTIFY_SUBSCRIPTION: boolean,
  BATCH_ASYNC_MODULE_UPDATES_FN: ?(() => void) => Disposable,
  ENABLE_CONTAINERS_SUBSCRIBE_ON_COMMIT: boolean,
  MAX_DATA_ID_LENGTH: ?number,
  STRING_INTERN_LEVEL: number,
  USE_REACT_CACHE: boolean,
  USE_REACT_CACHE_LEGACY_TIMEOUTS: boolean,
  ENABLE_QUERY_RENDERER_SET_STATE_PREVENTION: boolean,
  LOG_MISSING_RECORDS_IN_PROD: boolean,

  // Configure RelayStoreSubscriptions to mark a subscription as affected by an
  // update if there are any overlapping IDs other than ROOT_ID or VIWER_ID,
  // even if none of the read fields were affected. The strict behavior (current
  // default) requires eagerly reading fragments as they change which is
  // incompatible with lazily notifying React of updats using `setState(() =>
  // read())`, so we are experimenting with this loose behavior which should be
  // more compatible.
  ENABLE_LOOSE_SUBSCRIPTION_ATTRIBUTION: boolean,
};

const RelayFeatureFlags: FeatureFlags = {
  ENABLE_CLIENT_EDGES: false,
  ENABLE_VARIABLE_CONNECTION_KEY: false,
  ENABLE_REACT_FLIGHT_COMPONENT_FIELD: false,
  ENABLE_RELAY_RESOLVERS: false,
  ENABLE_GETFRAGMENTIDENTIFIER_OPTIMIZATION: false,
  ENABLE_FRIENDLY_QUERY_NAME_GQL_URL: false,
  ENABLE_LOAD_QUERY_REQUEST_DEDUPING: true,
  ENABLE_DO_NOT_WRAP_LIVE_QUERY: false,
  ENABLE_NOTIFY_SUBSCRIPTION: false,
  BATCH_ASYNC_MODULE_UPDATES_FN: null,
  ENABLE_CONTAINERS_SUBSCRIBE_ON_COMMIT: false,
  MAX_DATA_ID_LENGTH: null,
  STRING_INTERN_LEVEL: 0,
  USE_REACT_CACHE: false,
  USE_REACT_CACHE_LEGACY_TIMEOUTS: true,
  ENABLE_QUERY_RENDERER_SET_STATE_PREVENTION: false,
  LOG_MISSING_RECORDS_IN_PROD: false,
  ENABLE_LOOSE_SUBSCRIPTION_ATTRIBUTION: false,
};

module.exports = RelayFeatureFlags;

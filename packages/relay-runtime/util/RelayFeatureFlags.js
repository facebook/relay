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
  ENABLE_VARIABLE_CONNECTION_KEY: boolean,
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
  LOG_MISSING_RECORDS_IN_PROD: boolean,
  ENABLE_RELAY_OPERATION_TRACKER_SUSPENSE: boolean,

  // Configure RelayStoreSubscriptions to mark a subscription as affected by an
  // update if there are any overlapping IDs other than ROOT_ID or VIWER_ID,
  // even if none of the read fields were affected. The strict behavior (current
  // default) requires eagerly reading fragments as they change which is
  // incompatible with lazily notifying React of updats using `setState(() =>
  // read())`, so we are experimenting with this loose behavior which should be
  // more compatible.
  ENABLE_LOOSE_SUBSCRIPTION_ATTRIBUTION: boolean,
  ENABLE_OPERATION_TRACKER_OPTIMISTIC_UPDATES: boolean,

  // Configure whether Relay should handle any field errors that it encounteres
  // in a partial response.
  // @see https://spec.graphql.org/October2021/#sec-Handling-Field-Errors

  ENABLE_FIELD_ERROR_HANDLING_THROW_BY_DEFAULT: boolean,

  PROCESS_OPTIMISTIC_UPDATE_BEFORE_SUBSCRIPTION: boolean,

  // Temporary flag to enable a gradual rollout of the fix for T185969900
  MARK_RESOLVER_VALUES_AS_CLEAN_AFTER_FRAGMENT_REREAD: boolean,

  ENABLE_CYLE_DETECTION_IN_VARIABLES: boolean,

  // Temporary flag to experiment to enable compatibility with React's unstable <Activity> API
  ENABLE_ACTIVITY_COMPATIBILITY: boolean,

  // Gating a fix to prevent infinite loops when invalidating Relay Resolvers.
  // We believe the fix to be correct but don't yet have a test to validate it
  // fixes the error, so we're gating it for now.
  AVOID_CYCLES_IN_RESOLVER_NOTIFICATION: boolean,
};

const RelayFeatureFlags: FeatureFlags = {
  ENABLE_VARIABLE_CONNECTION_KEY: false,
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
  LOG_MISSING_RECORDS_IN_PROD: false,
  ENABLE_LOOSE_SUBSCRIPTION_ATTRIBUTION: false,
  ENABLE_OPERATION_TRACKER_OPTIMISTIC_UPDATES: false,
  ENABLE_RELAY_OPERATION_TRACKER_SUSPENSE: false,
  ENABLE_FIELD_ERROR_HANDLING_THROW_BY_DEFAULT: false,
  PROCESS_OPTIMISTIC_UPDATE_BEFORE_SUBSCRIPTION: false,
  MARK_RESOLVER_VALUES_AS_CLEAN_AFTER_FRAGMENT_REREAD: false,
  ENABLE_CYLE_DETECTION_IN_VARIABLES: false,
  ENABLE_ACTIVITY_COMPATIBILITY: false,
  AVOID_CYCLES_IN_RESOLVER_NOTIFICATION: false,
};

module.exports = RelayFeatureFlags;

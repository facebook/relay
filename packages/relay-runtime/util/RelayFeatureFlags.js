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
  ENABLE_DO_NOT_WRAP_LIVE_QUERY: boolean,
  ENABLE_NOTIFY_SUBSCRIPTION: boolean,
  BATCH_ASYNC_MODULE_UPDATES_FN: ?(() => void) => Disposable,
  ENABLE_CONTAINERS_SUBSCRIBE_ON_COMMIT: boolean,
  MAX_DATA_ID_LENGTH: ?number,
  STRING_INTERN_LEVEL: number,
  LOG_MISSING_RECORDS_IN_PROD: boolean,
  ENABLE_RELAY_OPERATION_TRACKER_SUSPENSE: boolean,

  // Some GraphQL servers are noncompliant with the GraphQL specification and
  // return an empty list instead of null when there is a field error on a list.
  //
  // If this describes your server, enable this flag so that Relay will treat
  // empty lists as null when deciding whether or not to check for field errors
  // in the response.
  ENABLE_NONCOMPLIANT_ERROR_HANDLING_ON_LISTS: boolean,

  // Configure RelayStoreSubscriptions to mark a subscription as affected by an
  // update if there are any overlapping IDs other than ROOT_ID or VIWER_ID,
  // even if none of the read fields were affected. The strict behavior (current
  // default) requires eagerly reading fragments as they change which is
  // incompatible with lazily notifying React of updats using `setState(() =>
  // read())`, so we are experimenting with this loose behavior which should be
  // more compatible.
  ENABLE_LOOSE_SUBSCRIPTION_ATTRIBUTION: boolean,
  ENABLE_OPERATION_TRACKER_OPTIMISTIC_UPDATES: boolean,

  PROCESS_OPTIMISTIC_UPDATE_BEFORE_SUBSCRIPTION: boolean,

  // Temporary flag to enable a gradual rollout of the fix for T185969900
  MARK_RESOLVER_VALUES_AS_CLEAN_AFTER_FRAGMENT_REREAD: boolean,

  ENABLE_CYLE_DETECTION_IN_VARIABLES: boolean,

  // Temporary flag to experiment to enable compatibility with React's unstable <Activity> API
  ENABLE_ACTIVITY_COMPATIBILITY: boolean,

  // Enables optimization for recreating the load more function.
  // When enabled, this flag reduce and simplify amount of dependencies for the function loadMore
  OPTIMIZE_RECREATING_LOAD_MORE_FUNCTION: boolean,

  // Adds a prefix to the storage key of read time resolvers. This is used to
  // disambiguate the same resolver being used at both read time and exec time.
  ENABLE_READ_TIME_RESOLVER_STORAGE_KEY_PREFIX: boolean,

  // Enables the use of an experimental new useResourceEffect React API. This
  // hook allows you to manage a resource that is not tied to the component
  // and replaces the need for multiple useEffects to manage the same resource.
  ENABLE_RESOURCE_EFFECTS: boolean,

  // Enable the fix for usePaginationFragment stucking in loading state
  ENABLE_USE_PAGINATION_IS_LOADING_FIX: boolean,
};

const RelayFeatureFlags: FeatureFlags = {
  ENABLE_VARIABLE_CONNECTION_KEY: false,
  ENABLE_RELAY_RESOLVERS: false,
  ENABLE_GETFRAGMENTIDENTIFIER_OPTIMIZATION: false,
  ENABLE_FRIENDLY_QUERY_NAME_GQL_URL: false,
  ENABLE_DO_NOT_WRAP_LIVE_QUERY: false,
  ENABLE_NOTIFY_SUBSCRIPTION: false,
  BATCH_ASYNC_MODULE_UPDATES_FN: null,
  ENABLE_CONTAINERS_SUBSCRIBE_ON_COMMIT: false,
  MAX_DATA_ID_LENGTH: null,
  STRING_INTERN_LEVEL: 0,
  LOG_MISSING_RECORDS_IN_PROD: false,
  ENABLE_NONCOMPLIANT_ERROR_HANDLING_ON_LISTS: false,
  ENABLE_LOOSE_SUBSCRIPTION_ATTRIBUTION: false,
  ENABLE_OPERATION_TRACKER_OPTIMISTIC_UPDATES: false,
  ENABLE_RELAY_OPERATION_TRACKER_SUSPENSE: false,
  PROCESS_OPTIMISTIC_UPDATE_BEFORE_SUBSCRIPTION: false,
  MARK_RESOLVER_VALUES_AS_CLEAN_AFTER_FRAGMENT_REREAD: false,
  OPTIMIZE_RECREATING_LOAD_MORE_FUNCTION: false,
  ENABLE_CYLE_DETECTION_IN_VARIABLES: false,
  ENABLE_ACTIVITY_COMPATIBILITY: false,
  ENABLE_READ_TIME_RESOLVER_STORAGE_KEY_PREFIX: true,
  ENABLE_RESOURCE_EFFECTS: false,
  ENABLE_USE_PAGINATION_IS_LOADING_FIX: false,
};

module.exports = RelayFeatureFlags;

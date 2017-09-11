/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactRelayTypes
 * @flow
 * @format
 */

'use strict';

import type {Disposable} from 'RelayCombinedEnvironmentTypes';
import type {GraphQLTaggedNode} from 'RelayModernGraphQLTag';
import type {Observer} from 'RelayObservable';
import type {Environment} from 'RelayStoreTypes';
import type {RerunParam, Variables} from 'RelayTypes';

export type GeneratedNodeMap = {[key: string]: GraphQLTaggedNode};

export type RelayProp = {
  environment: Environment,
};

export type ObserverOrCallback = Observer<void> | ((error: ?Error) => void);

export type RelayPaginationProp = RelayProp & {
  hasMore: () => boolean,
  isLoading: () => boolean,
  loadMore: (
    pageSize: number,
    callbackOrObserver: ?ObserverOrCallback,
    options?: RefetchOptions,
  ) => ?Disposable,
  refetchConnection: (
    totalCount: number,
    callbackOrObserver: ?ObserverOrCallback,
    refetchVariables: ?Variables,
  ) => ?Disposable,
};

export type RelayRefetchProp = RelayProp & {
  refetch: (
    refetchVariables: Variables | ((fragmentVariables: Variables) => Variables),
    renderVariables: ?Variables,
    callback: ?(error: ?Error) => void,
    options?: RefetchOptions,
  ) => Disposable,
};

export type RefetchOptions = {
  force?: boolean,
  rerunParamExperimental?: RerunParam,
};

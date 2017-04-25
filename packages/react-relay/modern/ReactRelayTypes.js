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
 */

'use strict';

import type {Disposable} from 'RelayCombinedEnvironmentTypes';
import type {GraphQLTaggedNode} from 'RelayModernGraphQLTag';
import type {Environment} from 'RelayStoreTypes';
import type {Variables} from 'RelayTypes';

export type GeneratedNodeMap = {[key: string]: GraphQLTaggedNode};

export type RelayProp = {
  environment: Environment,
};

export type RelayPaginationProp = RelayProp & {
  hasMore: () => boolean,
  isLoading: () => boolean,
  loadMore: (
    pageSize: number,
    callback: (error: ?Error) => void,
    options?: RefetchOptions
  ) => ?Disposable,
  refetchConnection:(
    totalCount: number,
    callback: (error: ?Error) => void,
  ) => ?Disposable,
};

export type RelayRefetchProp = RelayProp & {
  refetch: (
    refetchVariables: Variables | (fragmentVariables: Variables) => Variables,
    renderVariables: ?Variables,
    callback: ?(error: ?Error) => void,
    options?: RefetchOptions
  ) => Disposable,
};

export type RefetchOptions = {
  force?: boolean,
};

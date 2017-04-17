/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule commitRelayStaticMutation
 * @flow
 */

'use strict';

import type {Disposable} from 'RelayCombinedEnvironmentTypes';
import type {PayloadError, UploadableMap} from 'RelayNetworkTypes';
import type {GraphQLTaggedNode} from 'RelayStaticGraphQLTag';
import type {
  Environment,
  RecordSourceProxy,
  RecordSourceSelectorProxy,
} from 'RelayStoreTypes';
import type {RelayMutationConfig} from 'RelayTypes';
import type {Variables} from 'RelayTypes';

export type MutationConfig = {|
  configs?: Array<RelayMutationConfig>,
  mutation: GraphQLTaggedNode,
  variables: Variables,
  uploadables?: UploadableMap,
  onCompleted?: ?(response: ?Object) => void,
  onError?: ?(error: Error) => void,
  optimisticUpdater?: ?(store: RecordSourceProxy) => void,
  optimisticResponse?: ?() => Object,
  updater?: ?(store: RecordSourceSelectorProxy) => void,
|};

/**
 * Higher-level helper function to execute a mutation against a specific
 * environment.
 */
function commitRelayStaticMutation(
  environment: Environment,
  config: MutationConfig
): Disposable {
  const {
    createOperationSelector,
    getOperation,
  } = environment.unstable_internal;
  const mutation = getOperation(config.mutation);
  const {
    onError,
    optimisticUpdater,
    optimisticResponse,
    updater,
    variables,
    uploadables,
  } = config;
  const operation = createOperationSelector(mutation, variables);
  const mutationObject = {
    onError,
    operation,
    optimisticUpdater,
    updater,
    uploadables,
    onCompleted(errors: ?Array<PayloadError>) {
      const {onCompleted} = config;
      if (onCompleted) {
        const snapshot = environment.lookup(operation.fragment);
        onCompleted(snapshot.data, errors);
      }
    },
  };
  if (!optimisticUpdater && optimisticResponse) {
    mutationObject.optimisticUpdater = (proxy: RecordSourceProxy) => {
      proxy.commitPayload(operation.fragment, optimisticResponse());
    };
  }
  return environment.sendMutation(mutationObject);
}

module.exports = commitRelayStaticMutation;

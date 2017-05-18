/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule commitRelayModernMutation
 * @flow
 * @format
 */

'use strict';

const invariant = require('invariant');
const isRelayModernEnvironment = require('isRelayModernEnvironment');
const warning = require('warning');

import type {Disposable} from 'RelayCombinedEnvironmentTypes';
import type {GraphQLTaggedNode} from 'RelayModernGraphQLTag';
import type {PayloadError, UploadableMap} from 'RelayNetworkTypes';
import type {Environment, RecordSourceSelectorProxy} from 'RelayStoreTypes';
import type {RelayMutationConfig} from 'RelayTypes';
import type {Variables} from 'RelayTypes';

export type MutationConfig = {|
  configs?: Array<RelayMutationConfig>,
  mutation: GraphQLTaggedNode,
  variables: Variables,
  uploadables?: UploadableMap,
  onCompleted?: ?(response: ?Object, errors: ?Array<PayloadError>) => void,
  onError?: ?(error: Error) => void,
  optimisticUpdater?: ?(store: RecordSourceSelectorProxy) => void,
  optimisticResponse?: ?() => Object,
  updater?: ?(store: RecordSourceSelectorProxy) => void,
|};

/**
 * Higher-level helper function to execute a mutation against a specific
 * environment.
 */
function commitRelayModernMutation(
  environment: Environment,
  config: MutationConfig,
): Disposable {
  invariant(
    isRelayModernEnvironment(environment),
    'commitRelayModernMutation: expect `environment` to be an instance of ' +
      '`RelayModernEnvironment`.',
  );
  const {createOperationSelector, getOperation} = environment.unstable_internal;
  const mutation = getOperation(config.mutation);
  const {
    onError,
    optimisticResponse,
    optimisticUpdater,
    updater,
    variables,
    uploadables,
  } = config;
  const operation = createOperationSelector(mutation, variables);
  if (
    optimisticResponse &&
    mutation.query.selections &&
    mutation.query.selections.length === 1 &&
    mutation.query.selections[0].kind === 'LinkedField'
  ) {
    const mutationRoot = mutation.query.selections[0].name;
    warning(
      optimisticResponse()[mutationRoot],
      'commitRelayModernMutatuion: Expected result from optimisticResponse()' +
        ' to be wrapped in mutation name `%s`',
      mutationRoot,
    );
  }
  return environment.sendMutation({
    onError,
    operation,
    uploadables,
    updater,
    optimisticUpdater,
    optimisticResponse,
    onCompleted(errors: ?Array<PayloadError>) {
      const {onCompleted} = config;
      if (onCompleted) {
        const snapshot = environment.lookup(operation.fragment);
        onCompleted(snapshot.data, errors);
      }
    },
  });
}

module.exports = commitRelayModernMutation;

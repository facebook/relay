/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule commitRelayModernMutation
 * @flow
 * @format
 */

'use strict';

const invariant = require('invariant');
const isRelayModernEnvironment = require('isRelayModernEnvironment');
const setRelayModernMutationConfigs = require('setRelayModernMutationConfigs');
const warning = require('warning');

import type {GraphQLTaggedNode} from 'RelayModernGraphQLTag';
import type {PayloadError, UploadableMap} from 'RelayNetworkTypes';
import type {Environment, SelectorStoreUpdater} from 'RelayStoreTypes';
import type {Disposable} from 'react-relay/classic/environment/RelayCombinedEnvironmentTypes';
import type {RelayMutationConfig} from 'react-relay/classic/tools/RelayTypes';
import type {Variables} from 'react-relay/classic/tools/RelayTypes';

export type MutationConfig<T> = {|
  configs?: Array<RelayMutationConfig>,
  mutation: GraphQLTaggedNode,
  variables: Variables,
  uploadables?: UploadableMap,
  onCompleted?: ?(response: T, errors: ?Array<PayloadError>) => void,
  onError?: ?(error: Error) => void,
  optimisticUpdater?: ?SelectorStoreUpdater,
  optimisticResponse?: Object,
  updater?: ?SelectorStoreUpdater,
|};

/**
 * Higher-level helper function to execute a mutation against a specific
 * environment.
 */
function commitRelayModernMutation<T>(
  /* $FlowFixMe(>=0.55.0 site=www) This comment suppresses an error found when
   * Flow v0.55 was deployed. To see the error delete this comment and run
   * Flow. */
  environment: Environment,
  config: MutationConfig<T>,
): Disposable {
  invariant(
    isRelayModernEnvironment(environment),
    'commitRelayModernMutation: expect `environment` to be an instance of ' +
      '`RelayModernEnvironment`.',
  );
  const {createOperationSelector, getRequest} = environment.unstable_internal;
  const mutation = getRequest(config.mutation);
  if (mutation.operationKind !== 'mutation') {
    throw new Error('commitRelayModernMutation: Expected mutation operation');
  }
  let {optimisticResponse, optimisticUpdater, updater} = config;
  const {configs, onError, variables, uploadables} = config;
  const operation = createOperationSelector(mutation, variables);
  // TODO: remove this check after we fix flow.
  if (typeof optimisticResponse === 'function') {
    optimisticResponse = optimisticResponse();
    warning(
      false,
      'commitRelayModernMutation: Expected `optimisticResponse` to be an object, ' +
        'received a function.',
    );
  }
  if (
    optimisticResponse &&
    mutation.fragment.selections &&
    mutation.fragment.selections.length === 1 &&
    mutation.fragment.selections[0].kind === 'LinkedField'
  ) {
    const mutationRoot = mutation.fragment.selections[0].name;
    warning(
      optimisticResponse[mutationRoot],
      'commitRelayModernMutation: Expected `optimisticResponse` to be wrapped ' +
        'in mutation name `%s`',
      mutationRoot,
    );
  }
  if (configs) {
    ({optimisticUpdater, updater} = setRelayModernMutationConfigs(
      configs,
      mutation,
      optimisticUpdater,
      updater,
    ));
  }
  return environment
    .executeMutation({
      operation,
      optimisticResponse,
      optimisticUpdater,
      updater,
      uploadables,
    })
    .subscribeLegacy({
      onNext: payload => {
        // NOTE: commitRelayModernMutation has a non-standard use of
        // onCompleted() by calling it on every next value. It may be called
        // multiple times if a network request produces multiple responses.
        const {onCompleted} = config;
        if (onCompleted) {
          const snapshot = environment.lookup(operation.fragment);
          onCompleted((snapshot.data: $FlowFixMe), payload.response.errors);
        }
      },
      onError,
    });
}

module.exports = commitRelayModernMutation;

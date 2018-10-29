/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const RelayDeclarativeMutationConfig = require('./RelayDeclarativeMutationConfig');

const invariant = require('invariant');
const isRelayModernEnvironment = require('../store/isRelayModernEnvironment');
const validateMutation = require('./validateMutation');
const warning = require('warning');

import type {PayloadError, UploadableMap} from '../network/RelayNetworkTypes';
import type {GraphQLTaggedNode} from '../query/RelayModernGraphQLTag';
import type {Environment, SelectorStoreUpdater} from '../store/RelayStoreTypes';
import type {Disposable, Variables} from '../util/RelayRuntimeTypes';
import type {DeclarativeMutationConfig} from './RelayDeclarativeMutationConfig';

export type MutationConfig<T> = {|
  configs?: Array<DeclarativeMutationConfig>,
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
  environment: Environment,
  config: MutationConfig<T>,
): Disposable {
  invariant(
    isRelayModernEnvironment(environment),
    'commitRelayModernMutation: expected `environment` to be an instance of ' +
      '`RelayModernEnvironment`.\n' +
      'When using Relay Modern and Relay Classic in the same ' +
      'application, ensure mutations use Relay Compat to work in ' +
      'both environments.\n' +
      'See: http://facebook.github.io/relay/docs/relay-compat.html',
  );
  const {createOperationSelector, getRequest} = environment.unstable_internal;
  const mutation = getRequest(config.mutation);
  if (mutation.operationKind !== 'mutation') {
    throw new Error('commitRelayModernMutation: Expected mutation operation');
  }
  if (mutation.kind !== 'Request') {
    throw new Error(
      'commitRelayModernMutation: Expected mutation to be of type request',
    );
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
  if (__DEV__) {
    if (optimisticResponse instanceof Object) {
      validateMutation(optimisticResponse, mutation, config.variables);
    }
  }
  if (configs) {
    ({optimisticUpdater, updater} = RelayDeclarativeMutationConfig.convert(
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
          onCompleted((snapshot.data: $FlowFixMe), payload.errors);
        }
      },
      onError,
    });
}

module.exports = commitRelayModernMutation;

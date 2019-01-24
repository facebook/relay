/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @emails oncall+relay
 */

'use strict';

const RelayInMemoryRecordSource = require('./RelayInMemoryRecordSource');
const RelayModernRecord = require('./RelayModernRecord');
const RelayObservable = require('../network/RelayObservable');
const RelayPublishQueue = require('./RelayPublishQueue');
const RelayResponseNormalizer = require('./RelayResponseNormalizer');

const invariant = require('invariant');
const normalizePayload = require('./normalizePayload');

import type {Network, GraphQLResponse} from '../network/RelayNetworkTypes';
import type {Subscription} from '../network/RelayObservable';
import type {
  MatchFieldPayload,
  OperationDescriptor,
  OperationLoader,
  RelayResponsePayload,
  SelectorStoreUpdater,
} from '../store/RelayStoreTypes';
import type {NormalizationSplitOperation} from '../util/NormalizationNode';
import type {CacheConfig} from '../util/RelayRuntimeTypes';

/**
 * Coordinates the execution of a query, handling network callbacks
 * including optimistic payloads, standard payloads, resolution of match
 * dependencies, etc.
 */
function execute({
  network,
  publishQueue,
  operation,
  operationLoader,
  cacheConfig,
  updater,
}: {|
  +network: Network,
  +publishQueue: RelayPublishQueue,
  +operationLoader: ?OperationLoader,
  +operation: OperationDescriptor,
  +cacheConfig?: ?CacheConfig,
  +updater?: ?SelectorStoreUpdater,
|}): RelayObservable<GraphQLResponse> {
  return RelayObservable.create(sink => {
    let optimisticResponse = null;
    const subscriptions: Set<Subscription> = new Set();

    function start(subscription): void {
      // NOTE: store the subscription object on the observer so that it
      // can be cleaned up in complete() or the dispose function.
      this._subscription = subscription;
      subscriptions.add(subscription);
    }

    function complete(): void {
      subscriptions.delete(this._subscription);
      if (subscriptions.size === 0) {
        sink.complete();
      }
    }

    // Convert each GraphQLResponse from the network to a RelayResponsePayload
    // and process it
    function next(response: GraphQLResponse): void {
      const payload = normalizePayload(operation, response);
      const isOptimistic = response.extensions?.isOptimistic === true;
      processRelayPayload(payload, operation, updater, isOptimistic);
      sink.next(response);
    }

    // Each RelayResponsePayload contains both data to publish to the store
    // immediately, but may also contain matchPayloads that need to be
    // asynchronously normalized into RelayResponsePayloads, which may
    // themselves have matchPayloads: this function is recursive and relies
    // on GraphQL queries *disallowing* recursion to ensure termination.
    const processRelayPayload = (
      payload: RelayResponsePayload,
      operationDescriptor: OperationDescriptor | null = null,
      payloadUpdater: SelectorStoreUpdater | null = null,
      isOptimistic: boolean = false,
    ): void => {
      const {matchPayloads} = payload;
      if (matchPayloads && matchPayloads.length) {
        invariant(
          operationLoader,
          'RelayModernEnvironment: Expected an operationLoader to be ' +
            'configured when using `@match`.',
        );
        matchPayloads.forEach(matchPayload => {
          processMatchPayload(
            processRelayPayload,
            operationLoader,
            matchPayload,
          ).subscribe({
            complete,
            error: sink.error,
            start,
          });
        });
      }
      if (isOptimistic) {
        invariant(
          optimisticResponse === null,
          'environment.execute: only support one optimistic response per ' +
            'execute.',
        );
        optimisticResponse = {
          source: payload.source,
          fieldPayloads: payload.fieldPayloads,
        };
        publishQueue.applyUpdate(optimisticResponse);
        publishQueue.run();
      } else {
        if (optimisticResponse !== null) {
          publishQueue.revertUpdate(optimisticResponse);
          optimisticResponse = null;
        }
        if (operationDescriptor && payloadUpdater) {
          publishQueue.commitPayload(
            operationDescriptor,
            payload,
            payloadUpdater,
          );
        } else {
          publishQueue.commitRelayPayload(payload);
        }
        publishQueue.run();
      }
    };

    const {node} = operation;
    network
      .execute(node.params, operation.variables, cacheConfig || {})
      .subscribe({
        complete,
        next,
        error: sink.error,
        start,
      });
    return () => {
      if (subscriptions.size !== 0) {
        subscriptions.forEach(sub => sub.unsubscribe());
        subscriptions.clear();
      }
      if (optimisticResponse !== null) {
        publishQueue.revertUpdate(optimisticResponse);
        optimisticResponse = null;
        publishQueue.run();
      }
    };
  });
}

/**
 * Processes a MatchFieldPayload, asynchronously resolving the fragment,
 * using it to normalize the field data into a RelayResponsePayload.
 * Because @match fields may contain other @match fields, the result of
 * normalizing `matchPayload` may contain *other* MatchFieldPayloads:
 * the processRelayPayload() callback is responsible for publishing
 * both the normalize payload's source as well as recursively calling
 * this function for any matchPayloads it contains.
 *
 * @private
 */
function processMatchPayload(
  processRelayPayload: RelayResponsePayload => void,
  operationLoader: OperationLoader,
  matchPayload: MatchFieldPayload,
): RelayObservable<void> {
  return RelayObservable.from(
    new Promise((resolve, reject) => {
      operationLoader
        .load(matchPayload.operationReference)
        .then(resolve, reject);
    }),
  ).map((operation: ?NormalizationSplitOperation) => {
    if (operation == null) {
      return;
    }
    const selector = {
      dataID: matchPayload.dataID,
      variables: matchPayload.variables,
      node: operation,
    };
    const source = new RelayInMemoryRecordSource();
    const matchRecord = RelayModernRecord.create(
      matchPayload.dataID,
      matchPayload.typeName,
    );
    source.set(matchPayload.dataID, matchRecord);
    const normalizeResult = RelayResponseNormalizer.normalize(
      source,
      selector,
      matchPayload.data,
    );
    const relayPayload = {
      errors: null, // Errors are handled as part of the parent GraphQLResponse
      fieldPayloads: normalizeResult.fieldPayloads,
      matchPayloads: normalizeResult.matchPayloads,
      source: source,
    };
    processRelayPayload(relayPayload);
  });
}

module.exports = {execute};

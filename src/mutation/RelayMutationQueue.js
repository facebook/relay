/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayMutationQueue
 * @flow
 * @typechecks
 */

'use strict';

import type {ConcreteMutation} from 'ConcreteQuery';
var ErrorUtils = require('ErrorUtils');
var QueryBuilder = require('QueryBuilder');
var RelayConnectionInterface = require('RelayConnectionInterface');
var RelayMutationQuery = require('RelayMutationQuery');
var RelayMutationRequest = require('RelayMutationRequest');
var RelayMutationTransaction = require('RelayMutationTransaction');
var RelayMutationTransactionStatus = require('RelayMutationTransactionStatus');
var RelayNetworkLayer = require('RelayNetworkLayer');
var RelayQuery = require('RelayQuery');
import type RelayStoreData from 'RelayStoreData';
import type {FileMap} from 'RelayMutation';
import type RelayMutation from 'RelayMutation';
import type {ClientMutationID} from 'RelayInternalTypes';
import type {
  RelayMutationConfig,
  RelayMutationTransactionCommitCallbacks,
  RelayMutationTransactionCommitFailureCallback,
  RelayMutationTransactionCommitSuccessCallback,
  Variables,
} from 'RelayTypes';

const invariant = require('invariant');
const nullthrows = require('nullthrows');
const resolveImmediate = require('resolveImmediate');

type CollisionQueueMap = {[key: string]: Array<PendingTransaction>};
type PendingTransactionMap = {
  [key: ClientMutationID]: PendingTransaction;
};
type TransactionData = {
  id: ClientMutationID;
  mutation: RelayMutation;
  mutationTransaction: RelayMutationTransaction;
  onFailure: ?RelayMutationTransactionCommitFailureCallback;
  onSuccess: ?RelayMutationTransactionCommitSuccessCallback;
};
type TransactionQueue = Array<PendingTransaction>;

const {CLIENT_MUTATION_ID} = RelayConnectionInterface;

let transactionIDCounter = 0;

/**
 * @internal
 *
 * Coordinates execution of concurrent mutations, including application and
 * rollback of optimistic payloads and enqueueing mutations with the same
 * collision key.
 */
class RelayMutationQueue {
  _collisionQueueMap: CollisionQueueMap;
  _pendingTransactionMap: PendingTransactionMap;
  _queue: TransactionQueue;
  _storeData: RelayStoreData;
  _willBatchRefreshQueuedData: boolean;

  constructor(storeData: RelayStoreData) {
    this._collisionQueueMap = {};
    this._pendingTransactionMap = {};
    this._queue = [];
    this._storeData = storeData;
    this._willBatchRefreshQueuedData = false;
  }

  createTransaction(
    mutation: RelayMutation,
    callbacks: ?RelayMutationTransactionCommitCallbacks
  ): RelayMutationTransaction {
    const id = (transactionIDCounter++).toString(36);
    const mutationTransaction = new RelayMutationTransaction(this, id);
    const transaction = new PendingTransaction({
      id,
      mutation,
      mutationTransaction,
      onFailure: callbacks && callbacks.onFailure,
      onSuccess: callbacks && callbacks.onSuccess,
    });
    this._pendingTransactionMap[id] = transaction;
    this._queue.push(transaction);
    this._handleOptimisticUpdate(transaction);

    return mutationTransaction;
  }

  getTransaction(id: ClientMutationID): RelayMutationTransaction {
    return this._get(id).mutationTransaction;
  }

  getError(id: ClientMutationID): ?Error {
    return this._get(id).error;
  }

  getStatus(
    id: ClientMutationID
  ): $Enum<typeof RelayMutationTransactionStatus> {
    return this._get(id).status;
  }

  commit(id: ClientMutationID): void {
    const transaction = this._get(id);
    const collisionKey = transaction.getCollisionKey();
    const collisionQueue =
      collisionKey && this._collisionQueueMap[collisionKey];
    if (collisionQueue) {
      collisionQueue.push(transaction);
      transaction.status = RelayMutationTransactionStatus.COMMIT_QUEUED;
      transaction.error = null;
      return;
    }
    if (collisionKey) {
      this._collisionQueueMap[collisionKey] = [transaction];
    }
    this._handleCommit(transaction);
  }

  rollback(id: ClientMutationID): void {
    const transaction = this._get(id);
    this._handleRollback(transaction);
  }

  _get(id: ClientMutationID): PendingTransaction {
    const transaction = this._pendingTransactionMap[id];
    invariant(
      transaction,
      'RelayMutationQueue: `%s` is not a valid pending transaction ID.',
      id
    );
    return transaction;
  }

  _handleOptimisticUpdate(transaction: PendingTransaction): void {
    const optimisticResponse = transaction.getOptimisticResponse();
    const optimisticQuery = transaction.getOptimisticQuery(this._storeData);
    if (optimisticResponse && optimisticQuery) {
      const configs =
        transaction.getOptimisticConfigs() || transaction.getConfigs();
      this._storeData.handleUpdatePayload(
        optimisticQuery,
        optimisticResponse,
        {
          configs,
          isOptimisticUpdate: true,
        }
      );
    }
  }

  _handleCommitFailure(
    transaction: PendingTransaction,
    error: ?Error
  ): void {
    const status = error ?
      RelayMutationTransactionStatus.COMMIT_FAILED :
      RelayMutationTransactionStatus.COLLISION_COMMIT_FAILED;
    transaction.status = status;
    transaction.error = error;

    let shouldRollback = true;
    const onFailure = transaction.onFailure;
    if (onFailure) {
      var preventAutoRollback = function() { shouldRollback = false; };
      ErrorUtils.applyWithGuard(
        onFailure,
        null,
        [transaction.mutationTransaction, preventAutoRollback],
        null,
        'RelayMutationTransaction:onCommitFailure'
      );
    }

    if (error) {
      this._failCollisionQueue(transaction);
    }

    // Might have already been rolled back via `onFailure`.
    if (
      shouldRollback &&
      this._pendingTransactionMap.hasOwnProperty(transaction.id)
    ) {
      this._handleRollback(transaction);
    }
    this._batchRefreshQueuedData();
  }

  _handleCommitSuccess(
    transaction: PendingTransaction,
    response: Object
  ): void {
    this._advanceCollisionQueue(transaction);
    this._clearPendingTransaction(transaction);

    this._refreshQueuedData();
    this._storeData.handleUpdatePayload(
      transaction.getQuery(this._storeData),
      response[transaction.getCallName()],
      {
        configs: transaction.getConfigs(),
        isOptimisticUpdate: false,
      }
    );

    const onSuccess = transaction.onSuccess;
    if (onSuccess) {
      ErrorUtils.applyWithGuard(
        onSuccess,
        null,
        [response],
        null,
        'RelayMutationTransaction:onCommitSuccess'
      );
    }
  }

  _handleCommit(transaction: PendingTransaction): void {
    transaction.status = RelayMutationTransactionStatus.COMMITTING;
    transaction.error = null;

    const request = new RelayMutationRequest(
      transaction.getQuery(this._storeData),
      transaction.getFiles(),
    );
    RelayNetworkLayer.sendMutation(request);

    request.getPromise().done(
      result => this._handleCommitSuccess(transaction, result.response),
      error => this._handleCommitFailure(transaction, error)
    );
  }

  _handleRollback(transaction: PendingTransaction): void {
    this._clearPendingTransaction(transaction);
    this._batchRefreshQueuedData();
  }

  _clearPendingTransaction(transaction: PendingTransaction): void {
    delete this._pendingTransactionMap[transaction.id];
    this._queue = this._queue.filter(tx => tx !== transaction);
  }

  _advanceCollisionQueue(transaction: PendingTransaction): void {
    const collisionKey = transaction.getCollisionKey();
    if (collisionKey) {
      var collisionQueue = nullthrows(this._collisionQueueMap[collisionKey]);
      // Remove the transaction that called this function.
      collisionQueue.shift();

      if (collisionQueue.length) {
        this._handleCommit(collisionQueue[0]);
      } else {
        delete this._collisionQueueMap[collisionKey];
      }
    }
  }

  _failCollisionQueue(transaction: PendingTransaction): void {
    const collisionKey = transaction.getCollisionKey();
    if (collisionKey) {
      const collisionQueue = nullthrows(this._collisionQueueMap[collisionKey]);
      // Remove the transaction that called this function.
      collisionQueue.shift();
      collisionQueue.forEach(
        transaction => this._handleCommitFailure(transaction, null)
      );
      delete this._collisionQueueMap[collisionKey];
    }
  }

  _batchRefreshQueuedData(): void {
    if (!this._willBatchRefreshQueuedData) {
      this._willBatchRefreshQueuedData = true;
      resolveImmediate(() => {
        this._willBatchRefreshQueuedData = false;
        this._refreshQueuedData();
      });
    }
  }

  _refreshQueuedData(): void {
    this._storeData.clearQueuedData();
    this._queue.forEach(
      transaction => this._handleOptimisticUpdate(transaction)
    );
  }
}

/**
 * @private
 */
class PendingTransaction {
  error: ?Error;
  id: ClientMutationID;
  mutation: RelayMutation;
  mutationTransaction: RelayMutationTransaction;
  onFailure: ?RelayMutationTransactionCommitFailureCallback;
  onSuccess: ?RelayMutationTransactionCommitSuccessCallback;
  status: $Enum<typeof RelayMutationTransactionStatus>;

  // Lazily computed and memoized private properties
  _callName: string;
  _collisionKey: ?string;
  _configs: Array<{[key: string]: mixed}>;
  _error: ?Error;
  _fatQuery: RelayQuery.Fragment;
  _files: ?FileMap;
  _inputVariable: Variables;
  _mutationNode: ConcreteMutation;
  _onCommitFailureCallback: ?RelayMutationTransactionCommitFailureCallback;
  _onCommitSuccessCallback: ?RelayMutationTransactionCommitSuccessCallback;
  _optimisticConfigs: ?Array<{[key: string]: mixed}>;
  _optimisticQuery: ?RelayQuery.Mutation;
  _optimisticResponse: ?Object;
  _query: RelayQuery.Mutation;

  constructor(
    transactionData: TransactionData
  ) {
    this.error = null;
    this.id = transactionData.id;
    this.mutation = transactionData.mutation;
    this.mutationTransaction = transactionData.mutationTransaction;
    this.onFailure = transactionData.onFailure;
    this.onSuccess = transactionData.onSuccess;
    this.status = RelayMutationTransactionStatus.UNCOMMITTED;
  }

  getCallName(): string {
    if (!this._callName) {
      this._callName = this.getMutationNode().calls[0].name;
    }
    return this._callName;
  }

  getCollisionKey(): ?string {
    if (this._collisionKey === undefined) {
      this._collisionKey = this.mutation.getCollisionKey() || null;
    }
    return this._collisionKey;
  }

  getConfigs(): Array<RelayMutationConfig> {
    if (!this._configs) {
      this._configs = this.mutation.getConfigs();
    }
    return this._configs;
  }

  getFatQuery(): RelayQuery.Fragment {
    if (!this._fatQuery) {
      this._fatQuery = RelayQuery.Fragment
        .fromJSON((this.mutation.getFatQuery() : any));
    }
    return this._fatQuery;
  }

  getFiles(): ?FileMap {
    if (this._files === undefined) {
      this._files = this.mutation.getFiles() || null;
    }
    return this._files;
  }

  getInputVariable(): Variables  {
    if (!this._inputVariable) {
      var inputVariable = {
        ...this.mutation.getVariables(),
        /* $FlowIssue #7728187 - Computed Property */
        [CLIENT_MUTATION_ID]: this.id,
      };
      this._inputVariable = inputVariable;
    }
    return this._inputVariable;
  }

  getMutationNode(): ConcreteMutation {
    if (!this._mutationNode) {
      let mutationNode = QueryBuilder.getMutation(this.mutation.getMutation());
      invariant(
        mutationNode,
        'RelayMutation: Expected `getMutation` to return a mutation created ' +
        'with Relay.QL`mutation { ... }`.'
      );
      this._mutationNode = mutationNode;
    }
    return this._mutationNode;
  }

  getOptimisticConfigs(): ?Array<{[key: string]: mixed}> {
    if (this._optimisticConfigs === undefined) {
      this._optimisticConfigs = this.mutation.getOptimisticConfigs() || null;
    }
    return this._optimisticConfigs;
  }

  getOptimisticQuery(storeData: RelayStoreData): ?RelayQuery.Mutation {
    if (this._optimisticQuery === undefined) {
      var optimisticResponse = this.getOptimisticResponse();
      if (optimisticResponse) {
        var optimisticConfigs = this.getOptimisticConfigs();
        if (optimisticConfigs) {
          this._optimisticQuery = RelayMutationQuery.buildQuery({
            configs: optimisticConfigs,
            fatQuery: this.getFatQuery(),
            input: this.getInputVariable(),
            mutationName: this.mutation.constructor.name,
            mutation: this.getMutationNode(),
            tracker: storeData.getQueryTracker(),
          });
        } else {
          this._optimisticQuery =
            RelayMutationQuery.buildQueryForOptimisticUpdate({
              response: optimisticResponse,
              fatQuery: this.getFatQuery(),
              mutation: this.getMutationNode(),
              tracker: storeData.getQueryTracker(),
            });
        }
      } else {
        this._optimisticQuery = null;
      }
    }
    return this._optimisticQuery;
  }

  getOptimisticResponse(): ?Object {
    if (this._optimisticResponse === undefined) {
      var optimisticResponse = this.mutation.getOptimisticResponse() || null;
      if (optimisticResponse) {
        optimisticResponse[CLIENT_MUTATION_ID] = this.id;
      }
      this._optimisticResponse = optimisticResponse;
    }
    return this._optimisticResponse;
  }

  getQuery(storeData: RelayStoreData): RelayQuery.Mutation {
    if (!this._query) {
      this._query = RelayMutationQuery.buildQuery({
        configs: this.getConfigs(),
        fatQuery: this.getFatQuery(),
        input: this.getInputVariable(),
        mutationName: this.getMutationNode().name,
        mutation: this.getMutationNode(),
        tracker: storeData.getQueryTracker(),
      });
    }
    return this._query;
  }
}

module.exports = RelayMutationQueue;

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const ErrorUtils = require('ErrorUtils');
const QueryBuilder = require('../query/QueryBuilder');
const RelayMutationQuery = require('./RelayMutationQuery');
const RelayMutationRequest = require('../network/RelayMutationRequest');
const RelayMutationTransaction = require('./RelayMutationTransaction');
const RelayMutationTransactionStatus = require('./RelayMutationTransactionStatus');
const RelayOptimisticMutationUtils = require('./RelayOptimisticMutationUtils');
const RelayQuery = require('../query/RelayQuery');

const base62 = require('base62');
const flattenRelayQuery = require('../traversal/flattenRelayQuery');
const fromGraphQL = require('../query/fromGraphQL');
const invariant = require('invariant');
const nullthrows = require('nullthrows');
const resolveImmediate = require('resolveImmediate');

const {ConnectionInterface} = require('RelayRuntime');

import type {ConcreteMutation} from '../query/ConcreteQuery';
import type RelayQueryTracker from '../store/RelayQueryTracker';
import type RelayStoreData from '../store/RelayStoreData';
import type {ClientMutationID} from '../tools/RelayInternalTypes';
import type {
  RelayMutationConfig,
  RelayMutationTransactionCommitCallbacks,
  RelayMutationTransactionCommitFailureCallback,
  RelayMutationTransactionCommitSuccessCallback,
} from '../tools/RelayTypes';
import type RelayMutation from './RelayMutation';
import type {FileMap} from './RelayMutation';
import type {Variables} from 'RelayRuntime';

type CollisionQueueMap = {[key: string]: Array<PendingTransaction>};
interface PendingTransaction {
  error: ?Error;
  getCallName(): string;
  getCollisionKey(): ?string;
  getConfigs(): Array<RelayMutationConfig>;
  getFiles(): ?FileMap;
  getOptimisticConfigs(): ?Array<RelayMutationConfig>;
  getOptimisticQuery(storeData: RelayStoreData): ?RelayQuery.Mutation;
  getOptimisticResponse(): ?Object;
  getQuery(storeData: RelayStoreData): RelayQuery.Mutation;
  id: ClientMutationID;
  mutationTransaction: RelayMutationTransaction;
  onFailure: ?RelayMutationTransactionCommitFailureCallback;
  onSuccess: ?RelayMutationTransactionCommitSuccessCallback;
  status: $Keys<typeof RelayMutationTransactionStatus>;
}
type PendingTransactionMap = {
  [key: ClientMutationID]: PendingTransaction,
};
type TransactionBuilder = (
  id: ClientMutationID,
  transaction: RelayMutationTransaction,
) => PendingTransaction;
type TransactionData = {
  id: ClientMutationID,
  mutation: RelayMutation<any>,
  mutationTransaction: RelayMutationTransaction,
  onFailure: ?RelayMutationTransactionCommitFailureCallback,
  onSuccess: ?RelayMutationTransactionCommitSuccessCallback,
};
type TransactionQueue = Array<PendingTransaction>;

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

  /**
   * High-level API for creating a RelayMutationTransaction from a
   * RelayMutation.
   */
  createTransaction(
    mutation: RelayMutation<any>,
    callbacks: ?RelayMutationTransactionCommitCallbacks,
  ): RelayMutationTransaction {
    return this.createTransactionWithPendingTransaction(
      null,
      (id, mutationTransaction) =>
        new RelayPendingTransaction({
          id,
          mutation,
          mutationTransaction,
          onFailure: callbacks && callbacks.onFailure,
          onSuccess: callbacks && callbacks.onSuccess,
        }),
    );
  }

  /**
   * @internal
   *
   * This is a lower-level API used to create transactions based on:
   *
   * - An object that conforms to the PendingTransaction type; or
   * - A function that can build such an object.
   *
   * Used by the high-level `createTransaction` API, but also enables us to
   * run classic and low-level mutations.
   */
  createTransactionWithPendingTransaction(
    pendingTransaction: ?PendingTransaction,
    transactionBuilder: ?TransactionBuilder,
  ): RelayMutationTransaction {
    invariant(
      pendingTransaction || transactionBuilder,
      'RelayMutationQueue: `createTransactionWithPendingTransaction()` ' +
        'expects a PendingTransaction or TransactionBuilder.',
    );
    const id = getNextID();
    const mutationTransaction = new RelayMutationTransaction(this, id);
    const transaction =
      pendingTransaction || (transactionBuilder: any)(id, mutationTransaction);
    this._pendingTransactionMap[id] = transaction;
    this._queue.push(transaction);
    return mutationTransaction;
  }

  getTransaction(id: ClientMutationID): ?RelayMutationTransaction {
    const transaction = this._pendingTransactionMap[id];
    if (transaction) {
      return transaction.mutationTransaction;
    }
    return null;
  }

  getError(id: ClientMutationID): ?Error {
    return this._get(id).error;
  }

  getStatus(
    id: ClientMutationID,
  ): $Keys<typeof RelayMutationTransactionStatus> {
    return this._get(id).status;
  }

  applyOptimistic(id: ClientMutationID): void {
    const transaction = this._get(id);
    transaction.status = RelayMutationTransactionStatus.UNCOMMITTED;
    transaction.error = null;
    this._handleOptimisticUpdate(transaction);
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
    const collisionKey = transaction.getCollisionKey();
    if (collisionKey) {
      const collisionQueue = this._collisionQueueMap[collisionKey];
      if (collisionQueue) {
        const index = collisionQueue.indexOf(transaction);
        if (index !== -1) {
          collisionQueue.splice(index, 1);
        }
        if (collisionQueue.length === 0) {
          delete this._collisionQueueMap[collisionKey];
        }
      }
    }
    this._handleRollback(transaction);
  }

  _get(id: ClientMutationID): PendingTransaction {
    const transaction = this._pendingTransactionMap[id];
    invariant(
      transaction,
      'RelayMutationQueue: `%s` is not a valid pending transaction ID.',
      id,
    );
    return transaction;
  }

  _handleOptimisticUpdate(transaction: PendingTransaction): void {
    const optimisticResponse = transaction.getOptimisticResponse();
    const optimisticQuery = transaction.getOptimisticQuery(this._storeData);
    if (optimisticResponse && optimisticQuery) {
      const configs =
        transaction.getOptimisticConfigs() || transaction.getConfigs();
      this._storeData.handleUpdatePayload(optimisticQuery, optimisticResponse, {
        configs,
        isOptimisticUpdate: true,
      });
    }
  }

  _handleCommitFailure(transaction: PendingTransaction, error: ?Error): void {
    const status = error
      ? RelayMutationTransactionStatus.COMMIT_FAILED
      : RelayMutationTransactionStatus.COLLISION_COMMIT_FAILED;
    transaction.status = status;
    transaction.error = error;

    let shouldRollback = true;
    const onFailure = transaction.onFailure;
    if (onFailure) {
      const preventAutoRollback = function() {
        shouldRollback = false;
      };
      ErrorUtils.applyWithGuard(
        onFailure,
        null,
        [transaction.mutationTransaction, preventAutoRollback],
        null,
        'RelayMutationTransaction:onCommitFailure',
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
    response: Object,
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
      },
    );

    const onSuccess = transaction.onSuccess;
    if (onSuccess) {
      ErrorUtils.applyWithGuard(
        onSuccess,
        null,
        [response],
        null,
        'RelayMutationTransaction:onCommitSuccess',
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
    this._storeData.getNetworkLayer().sendMutation(request);

    request.done(
      result => this._handleCommitSuccess(transaction, result.response),
      error => this._handleCommitFailure(transaction, error),
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
      const collisionQueue = this._collisionQueueMap[collisionKey];
      if (collisionQueue) {
        // Remove the transaction that called this function.
        collisionQueue.shift();

        if (collisionQueue.length) {
          this._handleCommit(collisionQueue[0]);
        } else {
          delete this._collisionQueueMap[collisionKey];
        }
      }
    }
  }

  _failCollisionQueue(failedTransaction: PendingTransaction): void {
    const collisionKey = failedTransaction.getCollisionKey();
    if (collisionKey) {
      const collisionQueue = this._collisionQueueMap[collisionKey];
      if (collisionQueue) {
        // Remove the transaction that called this function.
        collisionQueue.forEach(queuedTransaction => {
          if (queuedTransaction !== failedTransaction) {
            this._handleCommitFailure(queuedTransaction, null);
          }
        });
        delete this._collisionQueueMap[collisionKey];
      }
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
    this._queue.forEach(transaction =>
      this._handleOptimisticUpdate(transaction),
    );
  }
}

/**
 * @private
 */
class RelayPendingTransaction {
  error: ?Error;
  id: ClientMutationID;
  mutation: RelayMutation<any>;
  mutationTransaction: RelayMutationTransaction;
  onFailure: ?RelayMutationTransactionCommitFailureCallback;
  onSuccess: ?RelayMutationTransactionCommitSuccessCallback;
  status: $Keys<typeof RelayMutationTransactionStatus>;

  // Lazily computed and memoized private properties
  _callName: string;
  _collisionKey: ?string;
  // $FlowFixMe(>=0.34.0)
  _configs: Array<{[key: string]: mixed}>;
  _error: ?Error;
  _fatQuery: RelayQuery.Fragment;
  _files: ?FileMap;
  _inputVariable: Variables;
  _mutationNode: ConcreteMutation;
  _onCommitFailureCallback: ?RelayMutationTransactionCommitFailureCallback;
  _onCommitSuccessCallback: ?RelayMutationTransactionCommitSuccessCallback;
  // $FlowFixMe(>=0.34.0)
  _optimisticConfigs: ?Array<{[key: string]: mixed}>;
  _optimisticQuery: ?RelayQuery.Mutation;
  _optimisticResponse: ?Object;
  _query: RelayQuery.Mutation;
  _rawOptimisticResponse: ?Object;

  constructor(transactionData: TransactionData) {
    this.error = null;
    this.id = transactionData.id;
    this.mutation = transactionData.mutation;
    this.mutationTransaction = transactionData.mutationTransaction;
    this.onFailure = transactionData.onFailure;
    this.onSuccess = transactionData.onSuccess;
    this.status = RelayMutationTransactionStatus.CREATED;
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
      const fragment = fromGraphQL.Fragment(this.mutation.getFatQuery());
      invariant(
        fragment instanceof RelayQuery.Fragment,
        'RelayMutationQueue: Expected `getFatQuery` to return a GraphQL ' +
          'Fragment',
      );
      this._fatQuery = nullthrows(
        flattenRelayQuery(fragment, {
          // TODO #10341736
          // This used to be `preserveEmptyNodes: fragment.isPattern()`. We
          // discovered that products were not marking their fat queries as
          // patterns (by adding `@relay(pattern: true)`) which was causing
          // `preserveEmptyNodes` to be false. This meant that empty fields,
          // would be stripped instead of being used to produce an intersection
          // with the tracked query. Products were able to do this because the
          // Babel Relay plugin doesn't produce validation errors for empty
          // fields. It should, and we will make it do so, but for now we're
          // going to set this to `true` always, and make the plugin warn when
          // it encounters an empty field that supports subselections in a
          // non-pattern fragment. Revert this when done.
          preserveEmptyNodes: true,
          shouldRemoveFragments: true,
        }),
      );
    }
    return this._fatQuery;
  }

  getFiles(): ?FileMap {
    if (this._files === undefined) {
      this._files = this.mutation.getFiles() || null;
    }
    return this._files;
  }

  getInputVariable(): Variables {
    if (!this._inputVariable) {
      const inputVariable = {
        ...this.mutation.getVariables(),
        [ConnectionInterface.get().CLIENT_MUTATION_ID]: this.id,
      };
      this._inputVariable = inputVariable;
    }
    return this._inputVariable;
  }

  getMutationNode(): ConcreteMutation {
    if (!this._mutationNode) {
      const mutationNode = QueryBuilder.getMutation(
        this.mutation.getMutation(),
      );
      invariant(
        mutationNode,
        'RelayMutation: Expected `getMutation` to return a mutation created ' +
          'with Relay.QL`mutation { ... }`.',
      );
      this._mutationNode = mutationNode;
    }
    return this._mutationNode;
  }

  getOptimisticConfigs(): ?Array<RelayMutationConfig> {
    if (this._optimisticConfigs === undefined) {
      this._optimisticConfigs = this.mutation.getOptimisticConfigs() || null;
    }
    return this._optimisticConfigs;
  }

  getOptimisticQuery(storeData: RelayStoreData): ?RelayQuery.Mutation {
    if (this._optimisticQuery === undefined) {
      if (__DEV__ && console.groupCollapsed && console.groupEnd) {
        console.groupCollapsed(
          'Optimistic query for `' + this.getCallName() + '`',
        );
      }
      const optimisticResponse = this._getRawOptimisticResponse();
      if (optimisticResponse) {
        const optimisticConfigs = this.getOptimisticConfigs();
        const tracker = getTracker(storeData);
        if (optimisticConfigs) {
          this._optimisticQuery = RelayMutationQuery.buildQuery({
            configs: optimisticConfigs,
            fatQuery: this.getFatQuery(),
            input: this.getInputVariable(),
            mutationName: this.mutation.constructor.name,
            mutation: this.getMutationNode(),
            tracker,
          });
        } else {
          this._optimisticQuery = RelayMutationQuery.buildQueryForOptimisticUpdate(
            {
              response: optimisticResponse,
              fatQuery: this.getFatQuery(),
              mutation: this.getMutationNode(),
            },
          );
        }
      } else {
        this._optimisticQuery = null;
      }
      if (__DEV__ && console.groupCollapsed && console.groupEnd) {
        require('./RelayMutationDebugPrinter').printOptimisticMutation(
          this._optimisticQuery,
          optimisticResponse,
        );

        console.groupEnd();
      }
    }
    return this._optimisticQuery;
  }

  _getRawOptimisticResponse(): ?Object {
    if (this._rawOptimisticResponse === undefined) {
      const optimisticResponse = this.mutation.getOptimisticResponse() || null;
      if (optimisticResponse) {
        optimisticResponse[
          ConnectionInterface.get().CLIENT_MUTATION_ID
        ] = this.id;
      }
      this._rawOptimisticResponse = optimisticResponse;
    }
    return this._rawOptimisticResponse;
  }

  getOptimisticResponse(): ?Object {
    if (this._optimisticResponse === undefined) {
      const optimisticResponse = this._getRawOptimisticResponse();
      if (optimisticResponse) {
        this._optimisticResponse = RelayOptimisticMutationUtils.inferRelayPayloadFromData(
          optimisticResponse,
        );
      } else {
        this._optimisticResponse = optimisticResponse;
      }
    }
    return this._optimisticResponse;
  }

  getQuery(storeData: RelayStoreData): RelayQuery.Mutation {
    if (!this._query) {
      if (__DEV__ && console.groupCollapsed && console.groupEnd) {
        console.groupCollapsed(
          'Mutation query for `' + this.getCallName() + '`',
        );
      }
      const tracker = getTracker(storeData);
      this._query = RelayMutationQuery.buildQuery({
        configs: this.getConfigs(),
        fatQuery: this.getFatQuery(),
        input: this.getInputVariable(),
        mutationName: this.getMutationNode().name,
        mutation: this.getMutationNode(),
        tracker,
      });
      if (__DEV__ && console.groupCollapsed && console.groupEnd) {
        require('./RelayMutationDebugPrinter').printMutation(this._query);
        console.groupEnd();
      }
    }
    return this._query;
  }
}

function getTracker(storeData: RelayStoreData): RelayQueryTracker {
  const tracker = storeData.getQueryTracker();
  invariant(
    tracker,
    'RelayMutationQueue: a RelayQueryTracker was not configured but an ' +
      'attempt to process a RelayMutation instance was made. Either use ' +
      'RelayGraphQLMutation (which does not require a tracker), or use ' +
      '`RelayStoreData.injectQueryTracker()` to configure a tracker. Be ' +
      'aware that trackers are provided by default, so if you are seeing ' +
      'this error it means that somebody has explicitly intended to opt ' +
      'out of query tracking.',
  );
  return tracker;
}

function getNextID(): string {
  return base62(transactionIDCounter++);
}

module.exports = RelayMutationQueue;

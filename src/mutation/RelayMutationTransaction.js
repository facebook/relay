/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayMutationTransaction
 * @typechecks
 * @flow
 */

'use strict';

var ErrorUtils = require('ErrorUtils');
import type GraphQL from 'GraphQL';
var RelayConnectionInterface = require('RelayConnectionInterface');
var RelayMutationQuery = require('RelayMutationQuery');
var RelayMutationRequest = require('RelayMutationRequest');
var RelayMutationTransactionStatus = require('RelayMutationTransactionStatus');
var RelayNetworkLayer = require('RelayNetworkLayer');
var RelayStoreData = require('RelayStoreData');
import type {FileMap} from 'RelayMutation';
import type RelayMutation from 'RelayMutation';
import type RelayQuery from 'RelayQuery';
import type {ClientMutationID} from 'RelayInternalTypes';
import type {
  RelayMutationTransactionCommitCallbacks,
  RelayMutationTransactionCommitFailureCallback,
  RelayMutationTransactionCommitSuccessCallback,
  Variables
} from 'RelayTypes';

var fromGraphQL = require('fromGraphQL');
var invariant = require('invariant');
var nullthrows = require('nullthrows');
var resolveImmediate = require('resolveImmediate');

type CollisionQueueMap = {[key: string]: Array<RelayMutationTransaction>};
type MutationTransactionQueue = Array<RelayMutationTransaction>;
type PendingTransactionMap = {
  [key: ClientMutationID]: RelayMutationTransaction;
};

var {CLIENT_MUTATION_ID} = RelayConnectionInterface;

var collisionQueueMap: CollisionQueueMap = {};
var pendingTransactionMap: PendingTransactionMap = {};
var queue: MutationTransactionQueue = [];
var transactionIDCounter = 0;

/**
 * @internal
 */
class RelayMutationTransaction {
  _id: ClientMutationID;
  _mutation: RelayMutation;
  _shim: Function;
  _status: $Enum<typeof RelayMutationTransactionStatus>;

  // These are lazily computed and memoized.
  _callName: string;
  _collisionKey: ?string;
  _configs: Array<{[key: string]: mixed}>;
  _error: ?Error;
  _fatQuery: RelayQuery.Fragment;
  _files: ?FileMap;
  _inputVariable: Variables;
  _mutationNode: GraphQL.Mutation;
  _onCommitFailureCallback: ?RelayMutationTransactionCommitFailureCallback;
  _onCommitSuccessCallback: ?RelayMutationTransactionCommitSuccessCallback;
  _optimisticConfigs: ?Array<{[key: string]: mixed}>;
  _optimisticQuery: ?RelayQuery.Mutation;
  _optimisticResponse: ?Object;
  _query: RelayQuery.Mutation;

  constructor(mutation: RelayMutation) {
    this._id = (transactionIDCounter++).toString(36);
    this._mutation = mutation;
    this._status = RelayMutationTransactionStatus.UNCOMMITTED;

    pendingTransactionMap[this._id] = this;
    queue.push(this);
    this._handleOptimisticUpdate();
  }

  static get(id: ClientMutationID): RelayMutationTransaction {
    var transaction = pendingTransactionMap[id];
    invariant(
      transaction,
      'RelayMutationTransaction: `%s` is not a valid pending transaction ID.',
      id
    );
    return transaction;
  }

  _assertIsPending(): void {
    invariant(
      pendingTransactionMap[this._id],
      'RelayMutationTransaction: Only pending transactions can be interacted ' +
      'with.'
    );
  }

  commit(callbacks?: RelayMutationTransactionCommitCallbacks): void {
    this._assertIsPending();
    invariant(
      this._status === RelayMutationTransactionStatus.UNCOMMITTED,
      'RelayMutationTransaction: Only transactions with status `UNCOMMITTED` ' +
      'can be comitted.'
    );

    if (callbacks) {
      this._onCommitFailureCallback = callbacks.onFailure;
      this._onCommitSuccessCallback = callbacks.onSuccess;
    }

    this._queueForCommit();
  }

  getError(): ?Error {
    this._assertIsPending();
    return this._error;
  }

  getStatus(): $Enum<typeof RelayMutationTransactionStatus> {
    this._assertIsPending();
    return this._status;
  }

  recommit(): void {
    this._assertIsPending();
    invariant(
      this._status === RelayMutationTransactionStatus.COMMIT_FAILED ||
      this._status === RelayMutationTransactionStatus.COLLISION_COMMIT_FAILED,
      'RelayMutationTransaction: Only transaction with status ' +
      '`COMMIT_FAILED` or `COLLISION_COMMIT_FAILED` can be comitted.'
    );

    this._queueForCommit();
  }

  rollback(): void {
    this._assertIsPending();
    invariant(
      this._status === RelayMutationTransactionStatus.UNCOMMITTED ||
      this._status === RelayMutationTransactionStatus.COMMIT_FAILED ||
      this._status === RelayMutationTransactionStatus.COLLISION_COMMIT_FAILED,
      'RelayMutationTransaction: Only transactions with status `UNCOMMITTED` ' +
      '`COMMIT_FAILED` or `COLLISION_COMMIT_FAILED` can be rolledback.'
    );

    this._handleRollback();
  }

  _getCallName(): string {
    if (!this._callName) {
      this._callName = this._getMutationNode().calls[0].name;
    }
    return this._callName;
  }

  _getConfigs(): Array<{[key: string]: mixed}> {
    if (!this._configs) {
      this._configs = this._mutation.getConfigs();
    }
    return this._configs;
  }

  _getCollisionKey(): ?string {
    if (this._collisionKey === undefined) {
      this._collisionKey = this._mutation.getCollisionKey() || null;
    }
    return this._collisionKey;
  }

  _getFatQuery(): RelayQuery.Fragment {
    if (!this._fatQuery) {
      this._fatQuery = fromGraphQL.Fragment(this._mutation.getFatQuery());
    }
    return this._fatQuery;
  }

  _getMutationNode(): GraphQL.Mutation {
    if (!this._mutationNode) {
      this._mutationNode = this._mutation.getMutation();
    }
    return this._mutationNode;
  }

  _getQuery(): RelayQuery.Mutation {
    if (!this._query) {
      this._query = RelayMutationQuery.buildQuery({
        configs: this._getConfigs(),
        fatQuery: this._getFatQuery(),
        mutationName: this._getMutationNode().name,
        mutation: this._getMutationNode(),
        input: this._getInputVariable(),
      });
    }
    return this._query;
  }

  _getInputVariable(): Variables  {
    if (!this._inputVariable) {
      var inputVariable = {
        ...this._mutation.getVariables(),
        /* $FlowIssue #7728187 - Computed Property */
        [CLIENT_MUTATION_ID]: this._id,
      };
      this._inputVariable = inputVariable;
    }
    return this._inputVariable;
  }

  _getFiles(): ?FileMap {
    if (this._files === undefined) {
      this._files = this._mutation.getFiles() || null;
    }
    return this._files;
  }

  _getOptimisticConfigs(): ?Array<{[key: string]: mixed}> {
    if (this._optimisticConfigs === undefined) {
      this._optimisticConfigs = this._mutation.getOptimisticConfigs() || null;
    }
    return this._optimisticConfigs;
  }

  _getOptimisticQuery(): ?RelayQuery.Mutation {
    if (this._optimisticQuery === undefined) {
      var optimisticResponse = this._getOptimisticResponse();
      if (optimisticResponse) {
        var optimisticConfigs = this._getOptimisticConfigs();
        if (optimisticConfigs) {
          this._optimisticQuery = RelayMutationQuery.buildQuery({
            configs: optimisticConfigs,
            fatQuery: this._getFatQuery(),
            input: this._getInputVariable(),
            mutationName: this._mutation.constructor.name,
            mutation: this._getMutationNode(),
          });
        } else {
          this._optimisticQuery =
            RelayMutationQuery.buildQueryForOptimisticUpdate({
              response: optimisticResponse,
              fatQuery: this._getFatQuery(),
              mutation: this._getMutationNode(),
            });
        }
      } else {
        this._optimisticQuery = null;
      }
    }
    return this._optimisticQuery;
  }

  _getOptimisticResponse(): ?Object {
    if (this._optimisticResponse === undefined) {
      var optimisticResponse = this._mutation.getOptimisticResponse() || null;
      if (optimisticResponse) {
        optimisticResponse[CLIENT_MUTATION_ID] = this._id;
      }
      this._optimisticResponse = optimisticResponse;
    }
    return this._optimisticResponse;
  }

  _queueForCommit(): void {
    var collisionKey = this._getCollisionKey();
    if (collisionKey) {
      if (!collisionQueueMap.hasOwnProperty(collisionKey)) {
        collisionQueueMap[collisionKey] = [this];
        this._handleCommit();
      } else {
        collisionQueueMap[collisionKey].push(this);
        this._status = RelayMutationTransactionStatus.COMMIT_QUEUED;
      }
    } else {
      this._handleCommit();
    }
  }

  _markAsNotPending(): void {
    delete pendingTransactionMap[this._id];
    queue = queue.filter(transaction => transaction !== this);
  }

  _handleOptimisticUpdate(): void {
    var optimisticResponse = this._getOptimisticResponse();
    var optimisticQuery = this._getOptimisticQuery();
    if (optimisticResponse && optimisticQuery) {
      var configs = this._getOptimisticConfigs() || this._getConfigs();
      optimisticResponse[CLIENT_MUTATION_ID] = this._id; // Repeating for Flow
      RelayStoreData.getDefaultInstance().handleUpdatePayload(
        optimisticQuery,
        optimisticResponse,
        {configs, isOptimisticUpdate: true}
      );
    }
  }

  _handleCommit(): void {
    this._status = RelayMutationTransactionStatus.COMMITTING;

    var request = new RelayMutationRequest(
      this._getQuery(),
      this._getFiles()
    );
    RelayNetworkLayer.sendMutation(request);

    request.getPromise().done(
      result => this._handleCommitSuccess(result.response),
      error => {
        this._error = error;
        this._handleCommitFailure(true);
      }
    );
  }

  _handleCommitFailure(isServerError: boolean): void {
    this._status = isServerError ?
      RelayMutationTransactionStatus.COMMIT_FAILED :
      RelayMutationTransactionStatus.COLLISION_COMMIT_FAILED;

    var shouldRollback = true;
    var commitFailureCallback = this._onCommitFailureCallback;
    if (commitFailureCallback) {
      var preventAutoRollback = function() { shouldRollback = false; };
      ErrorUtils.applyWithGuard(
        commitFailureCallback,
        null,
        [this, preventAutoRollback],
        null,
        'RelayMutationTransaction:onCommitFailure'
      );
    }

    if (isServerError) {
      RelayMutationTransaction._failCollisionQueue(this._getCollisionKey());
    }

    // Might have already been rolled back via `commitFailureCallback`.
    var wasRolledback = !pendingTransactionMap[this._id];
    if (shouldRollback && !wasRolledback) {
      this._handleRollback();
    } else {
      RelayMutationTransaction._batchRefreshQueuedData();
    }
  }

  _handleRollback(): void {
    this._markAsNotPending();
    RelayMutationTransaction._batchRefreshQueuedData();
  }

  _handleCommitSuccess(response: Object): void {
    RelayMutationTransaction._advanceCollisionQueue(this._getCollisionKey());
    this._markAsNotPending();

    RelayMutationTransaction._refreshQueuedData();
    RelayStoreData.getDefaultInstance().handleUpdatePayload(
      this._getQuery(),
      response[this._getCallName()],
      {configs: this._getConfigs(), isOptimisticUpdate: false}
    );

    if (this._onCommitSuccessCallback) {
      ErrorUtils.applyWithGuard(
        this._onCommitSuccessCallback,
        null,
        [response],
        null,
        'RelayMutationTransaction:onCommitSuccess'
      );
    }
  }

  static _advanceCollisionQueue(collisionKey: ?string): void {
    if (collisionKey) {
      var collisionQueue = nullthrows(collisionQueueMap[collisionKey]);
      // Remove the transaction that called this function.
      collisionQueue.shift();

      if (collisionQueue.length) {
        collisionQueue[0]._handleCommit();
      } else {
        delete collisionQueueMap[collisionKey];
      }
    }
  }

  static _failCollisionQueue(collisionKey: ?string): void {
    if (collisionKey) {
      var collisionQueue = nullthrows(collisionQueueMap[collisionKey]);
      // Remove the transaction that called this function.
      collisionQueue.shift();
      collisionQueue.forEach(
        transaction => transaction._handleCommitFailure(false)
      );
      delete collisionQueueMap[collisionKey];
    }
  }

  static _refreshQueuedData(): void {
    RelayStoreData.getDefaultInstance().clearQueuedData();
    queue.forEach(transaction => transaction._handleOptimisticUpdate());
  }

  static _willBatchRefreshQueuedData: ?boolean;
  static _batchRefreshQueuedData(): void {
    if (!RelayMutationTransaction._willBatchRefreshQueuedData) {
      RelayMutationTransaction._willBatchRefreshQueuedData = true;
      resolveImmediate(function() {
        RelayMutationTransaction._willBatchRefreshQueuedData = false;
        RelayMutationTransaction._refreshQueuedData();
      });
    }
  }
}

module.exports = RelayMutationTransaction;

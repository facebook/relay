/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayMutationQueue
 * 
 * @typechecks
 */

'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _extends = require('babel-runtime/helpers/extends')['default'];

var _defineProperty = require('babel-runtime/helpers/define-property')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var ErrorUtils = require('fbjs/lib/ErrorUtils');
var QueryBuilder = require('./QueryBuilder');
var RelayConnectionInterface = require('./RelayConnectionInterface');
var RelayMutationQuery = require('./RelayMutationQuery');
var RelayMutationRequest = require('./RelayMutationRequest');
var RelayMutationTransaction = require('./RelayMutationTransaction');
var RelayMutationTransactionStatus = require('./RelayMutationTransactionStatus');
var RelayNetworkLayer = require('./RelayNetworkLayer');

var RelayQuery = require('./RelayQuery');

var base62 = require('fbjs/lib/base62');
var flattenRelayQuery = require('./flattenRelayQuery');
var fromGraphQL = require('./fromGraphQL');
var invariant = require('fbjs/lib/invariant');
var nullthrows = require('fbjs/lib/nullthrows');
var resolveImmediate = require('fbjs/lib/resolveImmediate');

var CLIENT_MUTATION_ID = RelayConnectionInterface.CLIENT_MUTATION_ID;

var transactionIDCounter = 0;

/**
 * @internal
 *
 * Coordinates execution of concurrent mutations, including application and
 * rollback of optimistic payloads and enqueueing mutations with the same
 * collision key.
 */

var RelayMutationQueue = (function () {
  function RelayMutationQueue(storeData) {
    _classCallCheck(this, RelayMutationQueue);

    this._collisionQueueMap = {};
    this._pendingTransactionMap = {};
    this._queue = [];
    this._storeData = storeData;
    this._willBatchRefreshQueuedData = false;
  }

  /**
   * @private
   */

  RelayMutationQueue.prototype.createTransaction = function createTransaction(mutation, callbacks) {
    var id = base62(transactionIDCounter++);
    var mutationTransaction = new RelayMutationTransaction(this, id);
    var transaction = new PendingTransaction({
      id: id,
      mutation: mutation,
      mutationTransaction: mutationTransaction,
      onFailure: callbacks && callbacks.onFailure,
      onSuccess: callbacks && callbacks.onSuccess
    });
    this._pendingTransactionMap[id] = transaction;
    this._queue.push(transaction);
    this._handleOptimisticUpdate(transaction);

    return mutationTransaction;
  };

  RelayMutationQueue.prototype.hasPendingMutations = function hasPendingMutations() {
    return _Object$keys(this._pendingTransactionMap).length === 0;
  };

  RelayMutationQueue.prototype.getTransaction = function getTransaction(id) {
    return this._get(id).mutationTransaction;
  };

  RelayMutationQueue.prototype.getError = function getError(id) {
    return this._get(id).error;
  };

  RelayMutationQueue.prototype.getStatus = function getStatus(id) {
    return this._get(id).status;
  };

  RelayMutationQueue.prototype.commit = function commit(id) {
    var transaction = this._get(id);
    var collisionKey = transaction.getCollisionKey();
    var collisionQueue = collisionKey && this._collisionQueueMap[collisionKey];
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
  };

  RelayMutationQueue.prototype.rollback = function rollback(id) {
    var transaction = this._get(id);
    this._handleRollback(transaction);
  };

  RelayMutationQueue.prototype._get = function _get(id) {
    var transaction = this._pendingTransactionMap[id];
    !transaction ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayMutationQueue: `%s` is not a valid pending transaction ID.', id) : invariant(false) : undefined;
    return transaction;
  };

  RelayMutationQueue.prototype._handleOptimisticUpdate = function _handleOptimisticUpdate(transaction) {
    var optimisticResponse = transaction.getOptimisticResponse();
    var optimisticQuery = transaction.getOptimisticQuery(this._storeData);
    if (optimisticResponse && optimisticQuery) {
      var configs = transaction.getOptimisticConfigs() || transaction.getConfigs();
      this._storeData.handleUpdatePayload(optimisticQuery, optimisticResponse, {
        configs: configs,
        isOptimisticUpdate: true
      });
    }
  };

  RelayMutationQueue.prototype._handleCommitFailure = function _handleCommitFailure(transaction, error) {
    var status = error ? RelayMutationTransactionStatus.COMMIT_FAILED : RelayMutationTransactionStatus.COLLISION_COMMIT_FAILED;
    transaction.status = status;
    transaction.error = error;

    var shouldRollback = true;
    var onFailure = transaction.onFailure;
    if (onFailure) {
      var preventAutoRollback = function preventAutoRollback() {
        shouldRollback = false;
      };
      ErrorUtils.applyWithGuard(onFailure, null, [transaction.mutationTransaction, preventAutoRollback], null, 'RelayMutationTransaction:onCommitFailure');
    }

    if (error) {
      this._failCollisionQueue(transaction);
    }

    // Might have already been rolled back via `onFailure`.
    if (shouldRollback && this._pendingTransactionMap.hasOwnProperty(transaction.id)) {
      this._handleRollback(transaction);
    }
    this._batchRefreshQueuedData();
  };

  RelayMutationQueue.prototype._handleCommitSuccess = function _handleCommitSuccess(transaction, response) {
    this._advanceCollisionQueue(transaction);
    this._clearPendingTransaction(transaction);

    this._refreshQueuedData();
    this._storeData.handleUpdatePayload(transaction.getQuery(this._storeData), response[transaction.getCallName()], {
      configs: transaction.getConfigs(),
      isOptimisticUpdate: false
    });

    var onSuccess = transaction.onSuccess;
    if (onSuccess) {
      ErrorUtils.applyWithGuard(onSuccess, null, [response], null, 'RelayMutationTransaction:onCommitSuccess');
    }
  };

  RelayMutationQueue.prototype._handleCommit = function _handleCommit(transaction) {
    var _this = this;

    transaction.status = RelayMutationTransactionStatus.COMMITTING;
    transaction.error = null;

    var request = new RelayMutationRequest(transaction.getQuery(this._storeData), transaction.getFiles());
    RelayNetworkLayer.sendMutation(request);

    request.getPromise().done(function (result) {
      return _this._handleCommitSuccess(transaction, result.response);
    }, function (error) {
      return _this._handleCommitFailure(transaction, error);
    });
  };

  RelayMutationQueue.prototype._handleRollback = function _handleRollback(transaction) {
    this._clearPendingTransaction(transaction);
    this._batchRefreshQueuedData();
  };

  RelayMutationQueue.prototype._clearPendingTransaction = function _clearPendingTransaction(transaction) {
    delete this._pendingTransactionMap[transaction.id];
    this._queue = this._queue.filter(function (tx) {
      return tx !== transaction;
    });
  };

  RelayMutationQueue.prototype._advanceCollisionQueue = function _advanceCollisionQueue(transaction) {
    var collisionKey = transaction.getCollisionKey();
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
  };

  RelayMutationQueue.prototype._failCollisionQueue = function _failCollisionQueue(transaction) {
    var _this2 = this;

    var collisionKey = transaction.getCollisionKey();
    if (collisionKey) {
      var collisionQueue = nullthrows(this._collisionQueueMap[collisionKey]);
      // Remove the transaction that called this function.
      collisionQueue.shift();
      collisionQueue.forEach(function (transaction) {
        return _this2._handleCommitFailure(transaction, null);
      });
      delete this._collisionQueueMap[collisionKey];
    }
  };

  RelayMutationQueue.prototype._batchRefreshQueuedData = function _batchRefreshQueuedData() {
    var _this3 = this;

    if (!this._willBatchRefreshQueuedData) {
      this._willBatchRefreshQueuedData = true;
      resolveImmediate(function () {
        _this3._willBatchRefreshQueuedData = false;
        _this3._refreshQueuedData();
      });
    }
  };

  RelayMutationQueue.prototype._refreshQueuedData = function _refreshQueuedData() {
    var _this4 = this;

    this._storeData.clearQueuedData();
    this._queue.forEach(function (transaction) {
      return _this4._handleOptimisticUpdate(transaction);
    });
  };

  return RelayMutationQueue;
})();

var PendingTransaction = (function () {
  function PendingTransaction(transactionData) {
    _classCallCheck(this, PendingTransaction);

    this.error = null;
    this.id = transactionData.id;
    this.mutation = transactionData.mutation;
    this.mutationTransaction = transactionData.mutationTransaction;
    this.onFailure = transactionData.onFailure;
    this.onSuccess = transactionData.onSuccess;
    this.status = RelayMutationTransactionStatus.UNCOMMITTED;
  }

  PendingTransaction.prototype.getCallName = function getCallName() {
    if (!this._callName) {
      this._callName = this.getMutationNode().calls[0].name;
    }
    return this._callName;
  };

  PendingTransaction.prototype.getCollisionKey = function getCollisionKey() {
    if (this._collisionKey === undefined) {
      this._collisionKey = this.mutation.getCollisionKey() || null;
    }
    return this._collisionKey;
  };

  PendingTransaction.prototype.getConfigs = function getConfigs() {
    if (!this._configs) {
      this._configs = this.mutation.getConfigs();
    }
    return this._configs;
  };

  PendingTransaction.prototype.getFatQuery = function getFatQuery() {
    if (!this._fatQuery) {
      var fragment = fromGraphQL.Fragment(this.mutation.getFatQuery());
      !(fragment instanceof RelayQuery.Fragment) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayMutationQueue: Expected `getFatQuery` to return a GraphQL ' + 'Fragment') : invariant(false) : undefined;
      this._fatQuery = nullthrows(flattenRelayQuery(fragment, {
        preserveEmptyNodes: fragment.isPattern(),
        shouldRemoveFragments: true
      }));
    }
    return this._fatQuery;
  };

  PendingTransaction.prototype.getFiles = function getFiles() {
    if (this._files === undefined) {
      this._files = this.mutation.getFiles() || null;
    }
    return this._files;
  };

  PendingTransaction.prototype.getInputVariable = function getInputVariable() {
    if (!this._inputVariable) {
      var inputVariable = _extends({}, this.mutation.getVariables(), _defineProperty({}, CLIENT_MUTATION_ID, this.id));
      this._inputVariable = inputVariable;
    }
    return this._inputVariable;
  };

  PendingTransaction.prototype.getMutationNode = function getMutationNode() {
    if (!this._mutationNode) {
      var mutationNode = QueryBuilder.getMutation(this.mutation.getMutation());
      !mutationNode ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayMutation: Expected `getMutation` to return a mutation created ' + 'with Relay.QL`mutation { ... }`.') : invariant(false) : undefined;
      this._mutationNode = mutationNode;
    }
    return this._mutationNode;
  };

  PendingTransaction.prototype.getOptimisticConfigs = function getOptimisticConfigs() {
    if (this._optimisticConfigs === undefined) {
      this._optimisticConfigs = this.mutation.getOptimisticConfigs() || null;
    }
    return this._optimisticConfigs;
  };

  PendingTransaction.prototype.getOptimisticQuery = function getOptimisticQuery(storeData) {
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
            tracker: storeData.getQueryTracker()
          });
        } else {
          this._optimisticQuery = RelayMutationQuery.buildQueryForOptimisticUpdate({
            response: optimisticResponse,
            fatQuery: this.getFatQuery(),
            mutation: this.getMutationNode(),
            tracker: storeData.getQueryTracker()
          });
        }
      } else {
        this._optimisticQuery = null;
      }
    }
    return this._optimisticQuery;
  };

  PendingTransaction.prototype.getOptimisticResponse = function getOptimisticResponse() {
    if (this._optimisticResponse === undefined) {
      var optimisticResponse = this.mutation.getOptimisticResponse() || null;
      if (optimisticResponse) {
        optimisticResponse[CLIENT_MUTATION_ID] = this.id;
      }
      this._optimisticResponse = optimisticResponse;
    }
    return this._optimisticResponse;
  };

  PendingTransaction.prototype.getQuery = function getQuery(storeData) {
    if (!this._query) {
      this._query = RelayMutationQuery.buildQuery({
        configs: this.getConfigs(),
        fatQuery: this.getFatQuery(),
        input: this.getInputVariable(),
        mutationName: this.getMutationNode().name,
        mutation: this.getMutationNode(),
        tracker: storeData.getQueryTracker()
      });
    }
    return this._query;
  };

  return PendingTransaction;
})();

module.exports = RelayMutationQueue;

// Lazily computed and memoized private properties
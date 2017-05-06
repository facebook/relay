/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayMutationTransactionStatus
 * @flow
 * @format
 */

'use strict';

const RelayMutationTransactionStatus = {
  /**
   * Transaction has been created but an optimistic update has not been applied.
   * Transaction can be applied (optimistic) or committed (sent to server).
   */
  CREATED: 'CREATED',

  /**
   * Transaction hasn't yet been sent to the server. Client has an optimistic
   * update applied if the mutation defined one. Transaction can be committed or
   * rolled back.
   */
  UNCOMMITTED: 'UNCOMMITTED',

  /**
   * Transaction was committed but another transaction with the same collision
   * key is pending, so the transaction has been queued to send to the server.
   */
  COMMIT_QUEUED: 'COMMIT_QUEUED',

  /**
   * Transaction was queued for commit but another transaction with the same
   * collision queue failed to commit. All transactions in the collision
   * queue, including this one, have been failed as well. Transaction can be
   * recommitted or rolled back.
   */
  COLLISION_COMMIT_FAILED: 'COLLISION_COMMIT_FAILED',

  /**
   * Transaction was sent to the server for comitting and a response is awaited.
   */
  COMMITTING: 'COMMITTING',

  /**
   * Transaction was sent to the server for comitting but was failed.
   */
  COMMIT_FAILED: 'COMMIT_FAILED',

  /**
   * Transaction has been rolled back by the developer.
   */
  ROLLED_BACK: 'ROLLED_BACK',
};

module.exports = RelayMutationTransactionStatus;

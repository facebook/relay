/**
 * Copyright (c) 2013-present, Facebook, Inc.
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

import type {ClientMutationID} from 'RelayInternalTypes';
import type RelayMutationQueue from 'RelayMutationQueue';
const RelayMutationTransactionStatus = require('RelayMutationTransactionStatus');

const invariant = require('invariant');

/**
 * @internal
 */
class RelayMutationTransaction {
  _id: ClientMutationID;
  _mutationQueue: RelayMutationQueue;

  constructor(mutationQueue: RelayMutationQueue, id: ClientMutationID) {
    this._id = id;
    this._mutationQueue = mutationQueue;
  }

  applyOptimistic(): void {
    const status = this.getStatus();
    invariant(
      status === RelayMutationTransactionStatus.CREATED,
      'RelayMutationTransaction: Only transactions with status `CREATED` ' +
      'can be applied.'
    );

    this._mutationQueue.applyOptimistic(this._id);
  }

  commit(): void {
    const status = this.getStatus();
    invariant(
      status === RelayMutationTransactionStatus.CREATED ||
      status === RelayMutationTransactionStatus.UNCOMMITTED,
      'RelayMutationTransaction: Only transactions with status `CREATED` or ' +
      '`UNCOMMITTED` can be committed.'
    );

    this._mutationQueue.commit(this._id);
  }

  recommit(): void {
    const status = this.getStatus();
    invariant(
      status === RelayMutationTransactionStatus.CREATED ||
      status === RelayMutationTransactionStatus.COMMIT_FAILED ||
      status === RelayMutationTransactionStatus.COLLISION_COMMIT_FAILED,
      'RelayMutationTransaction: Only transaction with status ' +
      '`CREATED`, `COMMIT_FAILED`, or `COLLISION_COMMIT_FAILED` can be ' +
      'recomitted.'
    );

    this._mutationQueue.commit(this._id);
  }

  rollback(): void {
    const status = this.getStatus();
    invariant(
      status === RelayMutationTransactionStatus.CREATED ||
      status === RelayMutationTransactionStatus.UNCOMMITTED ||
      status === RelayMutationTransactionStatus.COMMIT_FAILED ||
      status === RelayMutationTransactionStatus.COLLISION_COMMIT_FAILED ||
      status === RelayMutationTransactionStatus.COMMIT_QUEUED,
      'RelayMutationTransaction: Only transactions with status `CREATED`, ' +
      '`UNCOMMITTED`, `COMMIT_FAILED`, `COLLISION_COMMIT_FAILED`, or ' +
      '`COMMIT_QUEUED` can be rolled back.'
    );

    this._mutationQueue.rollback(this._id);
  }

  getError(): ?Error {
    return this._mutationQueue.getError(this._id);
  }

  getStatus(): $Keys<typeof RelayMutationTransactionStatus> {
    return this._mutationQueue.getStatus(this._id);
  }

  getHash(): string {
    return `${this._id}:${this.getStatus()}`;
  }
}

module.exports = RelayMutationTransaction;

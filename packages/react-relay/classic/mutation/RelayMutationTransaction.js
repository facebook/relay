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

const RelayMutationTransactionStatus = require('./RelayMutationTransactionStatus');

const invariant = require('invariant');

import type {ClientMutationID} from '../tools/RelayInternalTypes';
import type RelayMutationQueue from './RelayMutationQueue';

const {
  COLLISION_COMMIT_FAILED,
  COMMIT_FAILED,
  COMMIT_QUEUED,
  CREATED,
  UNCOMMITTED,
} = RelayMutationTransactionStatus;

/**
 * @internal
 */
class RelayMutationTransaction {
  _id: ClientMutationID;
  _mutationQueue: RelayMutationQueue;
  _rolledBack: boolean = false;

  constructor(mutationQueue: RelayMutationQueue, id: ClientMutationID) {
    this._id = id;
    this._mutationQueue = mutationQueue;
  }

  /**
   * Applies the transaction to the local store (ie. as an optimistic update).
   *
   * Returns itself so as to provide a "fluent interface".
   */
  applyOptimistic(): RelayMutationTransaction {
    const status = this.getStatus();
    invariant(
      status === CREATED,
      'RelayMutationTransaction: Only transactions with status `CREATED` ' +
        'can be applied.',
    );

    this._mutationQueue.applyOptimistic(this._id);
    return this;
  }

  /**
   * Commits the transaction (ie. performs a server update).
   *
   * Returns itself so as to provide a "fluent interface".
   */
  commit(): RelayMutationTransaction {
    const status = this.getStatus();
    invariant(
      status === CREATED || status === UNCOMMITTED,
      'RelayMutationTransaction: Only transactions with status `CREATED` or ' +
        '`UNCOMMITTED` can be committed.',
    );

    this._mutationQueue.commit(this._id);
    return this;
  }

  recommit(): void {
    const status = this.getStatus();
    invariant(
      status === COLLISION_COMMIT_FAILED ||
        status === COMMIT_FAILED ||
        status === CREATED,
      'RelayMutationTransaction: Only transaction with status ' +
        '`CREATED`, `COMMIT_FAILED`, or `COLLISION_COMMIT_FAILED` can be ' +
        'recomitted.',
    );

    this._mutationQueue.commit(this._id);
  }

  rollback(): void {
    const status = this.getStatus();
    invariant(
      status === COLLISION_COMMIT_FAILED ||
        status === COMMIT_FAILED ||
        status === COMMIT_QUEUED ||
        status === CREATED ||
        status === UNCOMMITTED,
      'RelayMutationTransaction: Only transactions with status `CREATED`, ' +
        '`UNCOMMITTED`, `COMMIT_FAILED`, `COLLISION_COMMIT_FAILED`, or ' +
        '`COMMIT_QUEUED` can be rolled back.',
    );

    this._rolledBack = true;
    this._mutationQueue.rollback(this._id);
  }

  getError(): ?Error {
    return this._mutationQueue.getError(this._id);
  }

  getStatus(): $Keys<typeof RelayMutationTransactionStatus> {
    return this._rolledBack
      ? RelayMutationTransactionStatus.ROLLED_BACK
      : this._mutationQueue.getStatus(this._id);
  }

  getHash(): string {
    return `${this._id}:${this.getStatus()}`;
  }

  getID(): ClientMutationID {
    return this._id;
  }
}

module.exports = RelayMutationTransaction;

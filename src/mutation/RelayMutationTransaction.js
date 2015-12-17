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

  commit(): void {
    const status = this.getStatus();
    invariant(
      status === RelayMutationTransactionStatus.UNCOMMITTED,
      'RelayMutationTransaction: Only transactions with status `UNCOMMITTED` ' +
      'can be comitted.'
    );

    this._mutationQueue.commit(this._id);
  }

  recommit(): void {
    const status = this.getStatus();
    invariant(
      status === RelayMutationTransactionStatus.COMMIT_FAILED ||
      status === RelayMutationTransactionStatus.COLLISION_COMMIT_FAILED,
      'RelayMutationTransaction: Only transaction with status ' +
      '`COMMIT_FAILED` or `COLLISION_COMMIT_FAILED` can be comitted.'
    );

    this._mutationQueue.commit(this._id);
  }

  rollback(): void {
    const status = this.getStatus();
    invariant(
      status === RelayMutationTransactionStatus.UNCOMMITTED ||
      status === RelayMutationTransactionStatus.COMMIT_FAILED ||
      status === RelayMutationTransactionStatus.COLLISION_COMMIT_FAILED,
      'RelayMutationTransaction: Only transactions with status `UNCOMMITTED` ' +
      '`COMMIT_FAILED` or `COLLISION_COMMIT_FAILED` can be rolledback.'
    );

    this._mutationQueue.rollback(this._id);
  }

  getError(): ?Error {
    return this._mutationQueue.getError(this._id);
  }

  getStatus(): $Enum<typeof RelayMutationTransactionStatus> {
    return this._mutationQueue.getStatus(this._id);
  }
}

module.exports = RelayMutationTransaction;

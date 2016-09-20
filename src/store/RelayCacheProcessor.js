/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayCacheProcessor
 * @flow
 */

'use strict';

const RelayQuery = require('RelayQuery');
const RelayQueryVisitor = require('RelayQueryVisitor');

const forEachRootCallArg = require('forEachRootCallArg');
const invariant = require('invariant');
const isEmpty = require('isEmpty');
const warning = require('warning');

import type {
  DataID,
} from 'RelayInternalTypes';
import type {
  Record,
} from 'RelayRecord';
import type {
  CacheManager,
  CacheProcessorCallbacks,
} from 'RelayTypes';

type ProcessorState = 'PENDING' | 'LOADING' | 'COMPLETED';

/**
 * An asynchronous traversal that knows how to read roots and nodes from a
 * `CacheManager`. Root reads yield the `dataID` of the root, if found.
 * Node reads yield the `Record` associated with a supplied `dataID`, if found.
 *
 * Visitors: Ensure that only one read is ever in flight for a given root/node.
 *           Maintain a list of states to process after each read completes.
 * Queuers:  Perform the work of kicking off a root/node read.
 * Handlers: Subclasses of `RelayCacheProcessor` can implement this method to
 *           actually perform work after a root/node read completes.
 */
class RelayCacheProcessor<Ts> extends RelayQueryVisitor<Ts> {
  _cacheManager: CacheManager;
  _callbacks: CacheProcessorCallbacks;
  _pendingNextStates: {[key: string]: Array<Ts>};
  _pendingRoots: {[key: string]: Array<RelayQuery.Root>};
  _state: ProcessorState;

  constructor(cacheManager: CacheManager, callbacks: CacheProcessorCallbacks) {
    super();
    this._cacheManager = cacheManager;
    this._callbacks = callbacks;
    this._pendingNextStates = {};
    this._pendingRoots = {};
    this._state = 'PENDING';
  }

  abort(): void {
    warning(
      this._state === 'LOADING',
      'RelayCacheProcessor: Can only abort an in-progress read operation.'
    );
    this._state = 'COMPLETED';
  }

  handleFailure(error: any): void {
    invariant(
      this._state !== 'COMPLETED',
      'RelayStoreReader: Query set already failed/completed.'
    );
    this._state = 'COMPLETED';
    this._callbacks.onFailure && this._callbacks.onFailure(error);
  }

  handleNodeVisited(
    node: RelayQuery.Node,
    dataID: DataID,
    record: ?Record,
    nextState: Ts
  ): void {
    return;
  }

  handleIdentifiedRootVisited(
    query: RelayQuery.Root,
    dataID: ?DataID,
    identifyingArgKey: ?string,
    nextState: Ts
  ): void {
    return;
  }

  process(processorFn: Function): void {
    invariant(
      this._state === 'PENDING',
      'RelayCacheProcessor: A `read` is in progress.'
    );
    this._state = 'LOADING';
    processorFn();
    if (this._isDone()) {
      this._handleSuccess();
    }
  }

  queueIdentifiedRoot(
    query: RelayQuery.Root,
    identifyingArgKey: ?string,
    nextState: Ts
  ): void {
    const storageKey = query.getStorageKey();
    this._cacheManager.readRootCall(
      storageKey,
      identifyingArgKey || '',
      (error, dataID) => {
        if (this._state === 'COMPLETED') {
          return;
        }
        if (error) {
          this.handleFailure(error);
          return;
        }
        this.handleIdentifiedRootVisited(
          query,
          dataID,
          identifyingArgKey,
          nextState
        );
        const rootKey = this._getRootKey(storageKey, identifyingArgKey);
        const pendingRoots = this._pendingRoots[rootKey];
        delete this._pendingRoots[rootKey];
        for (let ii = 0; ii < pendingRoots.length; ii++) {
          if (this._state === 'COMPLETED') {
            return;
          }
          this.traverse(pendingRoots[ii], nextState);
        }
        if (this._isDone()) {
          this._handleSuccess();
        }
      }
    );
  }

  queueNode(
    node: RelayQuery.Node,
    dataID: DataID,
    nextState: Ts
  ): void {
    this._cacheManager.readNode(
      dataID,
      (error, record) => {
        if (this._state === 'COMPLETED') {
          return;
        }
        if (error) {
          this.handleFailure(error);
          return;
        }
        this.handleNodeVisited(node, dataID, record, nextState);
        const pendingNextStates = this._pendingNextStates[dataID];
        delete this._pendingNextStates[dataID];
        for (let ii = 0; ii < pendingNextStates.length; ii++) {
          if (this._state === 'COMPLETED') {
            return;
          }
          this.traverse(node, pendingNextStates[ii]);
        }
        if (this._isDone()) {
          this._handleSuccess();
        }
      }
    );
  }

  visitIdentifiedRoot(
    query: RelayQuery.Root,
    identifyingArgKey: ?string,
    nextState: Ts
  ): void {
    const storageKey = query.getStorageKey();
    const rootKey = this._getRootKey(storageKey, identifyingArgKey);
    if (this._pendingRoots.hasOwnProperty(rootKey)) {
      this._pendingRoots[rootKey].push(query);
    } else {
      this._pendingRoots[rootKey] = [query];
      this.queueIdentifiedRoot(query, identifyingArgKey, nextState);
    }
  }

  visitNode(
    node: RelayQuery.Node,
    dataID: DataID,
    nextState: Ts
  ): void {
    if (this._pendingNextStates.hasOwnProperty(dataID)) {
      this._pendingNextStates[dataID].push(nextState);
    } else {
      this._pendingNextStates[dataID] = [nextState];
      this.queueNode(node, dataID, nextState);
    }
  }

  visitRoot(
    query: RelayQuery.Root,
    nextState: Ts
  ): void {
    forEachRootCallArg(query, ({identifyingArgKey}) => {
      if (this._state === 'COMPLETED') {
        return;
      }
      this.visitIdentifiedRoot(query, identifyingArgKey, nextState);
    });
  }

  _getRootKey(storageKey: string, identifyingArgKey: ?string): string {
    return `${storageKey}*${identifyingArgKey || ''}`;
  }

  _handleSuccess(): void {
    invariant(
      this._state !== 'COMPLETED',
      'RelayStoreReader: Query set already failed/completed.'
    );
    this._state = 'COMPLETED';
    this._callbacks.onSuccess && this._callbacks.onSuccess();
  }

  _isDone(): boolean {
    return (
      isEmpty(this._pendingRoots) &&
      isEmpty(this._pendingNextStates) &&
      this._state === 'LOADING'
    );
  }
}

module.exports = RelayCacheProcessor;

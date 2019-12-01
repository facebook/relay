/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {DataID} from '../util/RelayRuntimeTypes';
import type {StoreSource} from './RelayStoreTypes';

/**
 * An implementation of the `StoreSource` interface (defined in
 * `RelayStoreTypes`) that holds all records in memory (JS Map).
 */
class RelayMapStoreSource<I, T> implements StoreSource<I, T> {
  _stores: Map<I, ?T>;

  constructor() {
    this._stores = new Map();
  }

  clear(): void {
    this._stores = new Map();
  }

  delete(id: I): void {
    this._stores.set(id, null);
  }

  get(id: I): ?T {
    return this._stores.get(id);
  }

  getAllKeys(): Array<I> {
    return Array.from(this._stores.keys());
  }

  has(id: I): boolean {
    return this._stores.has(id);
  }

  remove(id: I): void {
    this._stores.delete(id);
  }

  set(id: I, record: T): void {
    this._stores.set(id, record);
  }
}

module.exports = RelayMapStoreSource;

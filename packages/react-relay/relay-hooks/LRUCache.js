/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @emails oncall+relay
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const invariant = require('invariant');

export interface Cache<T> {
  get(key: string): ?T;
  set(key: string, value: T): void;
  has(key: string): boolean;
  delete(key: string): void;
  size(): number;
  capacity(): number;
  clear(): void;
}

/**
 * JS maps (both plain objects and Map) maintain key insertion
 * order, which means there is an easy way to simulate LRU behavior
 * that should also perform quite well:
 *
 * To insert a new value, first delete the key from the inner _map,
 * then _map.set(k, v). By deleting and reinserting, you ensure that the
 * map sees the key as the last inserted key.
 *
 * Get does the same: if the key is present, delete and reinsert it.
 */
class LRUCache<T> implements Cache<T> {
  _capacity: number;
  _map: Map<string, T>;

  constructor(capacity: number) {
    this._capacity = capacity;
    invariant(
      this._capacity > 0,
      'LRUCache: Unable to create instance of cache with zero or negative capacity.',
    );

    this._map = new Map();
  }

  set(key: string, value: T): void {
    this._map.delete(key);
    this._map.set(key, value);
    if (this._map.size > this._capacity) {
      const firstKey = this._map.keys().next();
      if (!firstKey.done) {
        this._map.delete(firstKey.value);
      }
    }
  }

  get(key: string): ?T {
    const value = this._map.get(key);
    if (value != null) {
      this._map.delete(key);
      this._map.set(key, value);
    }
    return value;
  }

  has(key: string): boolean {
    return this._map.has(key);
  }

  delete(key: string): void {
    this._map.delete(key);
  }

  size(): number {
    return this._map.size;
  }

  capacity(): number {
    return this._capacity - this._map.size;
  }

  clear(): void {
    this._map.clear();
  }
}

function create<T>(capacity: number): LRUCache<T> {
  return new LRUCache<T>(capacity);
}

module.exports = {
  create,
};

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

import type {DataID} from 'RelayRuntime';

type ChangeMap = {[key: string]: boolean};

export type ChangeSet = {
  created: ChangeMap,
  updated: ChangeMap,
};

/**
 * @internal
 *
 * Keeps track of records that have been created or updated; used primarily to
 * record changes during the course of a `write` operation.
 */
class RelayChangeTracker {
  _created: ChangeMap;
  _updated: ChangeMap;

  constructor() {
    this._created = {};
    this._updated = {};
  }

  /**
   * Record the creation of a record.
   */
  createID(recordID: DataID): void {
    this._created[recordID] = true;
  }

  /**
   * Record an update to a record.
   */
  updateID(recordID: DataID): void {
    if (!this._created.hasOwnProperty(recordID)) {
      this._updated[recordID] = true;
    }
  }

  /**
   * Determine if the record has any changes (was created or updated).
   */
  hasChange(recordID: DataID): boolean {
    return !!(this._updated[recordID] || this._created[recordID]);
  }

  /**
   * Determine if the record was created.
   */
  isNewRecord(recordID: DataID): boolean {
    return !!this._created[recordID];
  }

  /**
   * Get the ids of records that were created/updated.
   */
  getChangeSet(): ChangeSet {
    if (__DEV__) {
      return {
        created: Object.freeze(this._created),
        updated: Object.freeze(this._updated),
      };
    }
    return {
      created: this._created,
      updated: this._updated,
    };
  }
}

module.exports = RelayChangeTracker;

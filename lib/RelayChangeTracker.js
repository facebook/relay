/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayChangeTracker
 * 
 * @typechecks
 */

'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$freeze = require('babel-runtime/core-js/object/freeze')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

/**
 * @internal
 *
 * Keeps track of records that have been created or updated; used primarily to
 * record changes during the course of a `write` operation.
 */

var RelayChangeTracker = (function () {
  function RelayChangeTracker() {
    _classCallCheck(this, RelayChangeTracker);

    this._created = {};
    this._updated = {};
  }

  /**
   * Record the creation of a record.
   */

  RelayChangeTracker.prototype.createID = function createID(recordID) {
    this._created[recordID] = true;
  };

  /**
   * Record an update to a record.
   */

  RelayChangeTracker.prototype.updateID = function updateID(recordID) {
    if (!this._created.hasOwnProperty(recordID)) {
      this._updated[recordID] = true;
    }
  };

  /**
   * Determine if the record has any changes (was created or updated).
   */

  RelayChangeTracker.prototype.hasChange = function hasChange(recordID) {
    return !!(this._updated[recordID] || this._created[recordID]);
  };

  /**
   * Determine if the record was created.
   */

  RelayChangeTracker.prototype.isNewRecord = function isNewRecord(recordID) {
    return !!this._created[recordID];
  };

  /**
   * Get the ids of records that were created/updated.
   */

  RelayChangeTracker.prototype.getChangeSet = function getChangeSet() {
    if (process.env.NODE_ENV !== 'production') {
      return {
        created: _Object$freeze(this._created),
        updated: _Object$freeze(this._updated)
      };
    }
    return {
      created: this._created,
      updated: this._updated
    };
  };

  return RelayChangeTracker;
})();

module.exports = RelayChangeTracker;
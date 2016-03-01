/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayDiskCacheReader
 * 
 * @typechecks
 */

'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var RelayChangeTracker = require('./RelayChangeTracker');

var RelayProfiler = require('./RelayProfiler');
var RelayQuery = require('./RelayQuery');
var RelayQueryPath = require('./RelayQueryPath');
var RelayRecord = require('./RelayRecord');

var findRelayQueryLeaves = require('./findRelayQueryLeaves');

var forEachObject = require('fbjs/lib/forEachObject');
var forEachRootCallArg = require('./forEachRootCallArg');
var invariant = require('fbjs/lib/invariant');
var isEmpty = require('fbjs/lib/isEmpty');

/**
 * @internal
 *
 * Retrieves data for queries or fragments from disk into `cachedRecords`.
 */
var RelayDiskCacheReader = {
  readFragment: function readFragment(dataID, fragment, path, store, cachedRecords, cachedRootCallMap, garbageCollector, cacheManager, changeTracker, callbacks) {
    var reader = new RelayCacheReader(store, cachedRecords, cachedRootCallMap, garbageCollector, cacheManager, changeTracker, callbacks);
    reader.readFragment(dataID, fragment, path);

    return {
      abort: function abort() {
        reader.abort();
      }
    };
  },

  readQueries: function readQueries(queries, store, cachedRecords, cachedRootCallMap, garbageCollector, cacheManager, changeTracker, callbacks) {
    var reader = new RelayCacheReader(store, cachedRecords, cachedRootCallMap, garbageCollector, cacheManager, changeTracker, callbacks);
    reader.read(queries);

    return {
      abort: function abort() {
        reader.abort();
      }
    };
  }
};

var RelayCacheReader = (function () {
  function RelayCacheReader(store, cachedRecords, cachedRootCallMap, garbageCollector, cacheManager, changeTracker, callbacks) {
    _classCallCheck(this, RelayCacheReader);

    this._store = store;
    this._cachedRecords = cachedRecords;
    this._cachedRootCallMap = cachedRootCallMap;
    this._cacheManager = cacheManager;
    this._callbacks = callbacks;
    this._changeTracker = changeTracker;
    this._garbageCollector = garbageCollector;

    this._pendingNodes = {};
    this._pendingRoots = {};
    this._state = 'PENDING';
  }

  RelayCacheReader.prototype.abort = function abort() {
    !(this._state === 'LOADING') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayCacheReader: Can only abort an in-progress read operation.') : invariant(false) : undefined;
    this._state = 'COMPLETED';
  };

  RelayCacheReader.prototype.read = function read(queries) {
    var _this = this;

    !(this._state === 'PENDING') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayCacheReader: A `read` is in progress.') : invariant(false) : undefined;
    this._state = 'LOADING';
    forEachObject(queries, function (query) {
      if (_this._state === 'COMPLETED') {
        return;
      }
      if (query) {
        (function () {
          var storageKey = query.getStorageKey();
          forEachRootCallArg(query, function (identifyingArgValue) {
            if (_this._state === 'COMPLETED') {
              return;
            }
            identifyingArgValue = identifyingArgValue || '';
            _this.visitRoot(storageKey, identifyingArgValue, query);
          });
        })();
      }
    });

    if (this._isDone()) {
      this._handleSuccess();
    }
  };

  RelayCacheReader.prototype.readFragment = function readFragment(dataID, fragment, path) {
    !(this._state === 'PENDING') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayCacheReader: A `read` is in progress.') : invariant(false) : undefined;
    this._state = 'LOADING';
    this.visitNode(dataID, {
      node: fragment,
      path: path,
      rangeCalls: undefined
    });

    if (this._isDone()) {
      this._handleSuccess();
    }
  };

  RelayCacheReader.prototype.visitRoot = function visitRoot(storageKey, identifyingArgValue, query) {
    var dataID = this._store.getDataID(storageKey, identifyingArgValue);
    if (dataID == null) {
      if (this._cachedRootCallMap.hasOwnProperty(storageKey) && this._cachedRootCallMap[storageKey].hasOwnProperty(identifyingArgValue)) {
        // Already attempted to read this root from cache.
        this._handleFailed();
      } else {
        this.queueRoot(storageKey, identifyingArgValue, query);
      }
    } else {
      this.visitNode(dataID, {
        node: query,
        path: new RelayQueryPath(query),
        rangeCalls: undefined
      });
    }
  };

  RelayCacheReader.prototype.queueRoot = function queueRoot(storageKey, identifyingArgValue, query) {
    var _this2 = this;

    var rootKey = storageKey + '*' + identifyingArgValue;
    if (this._pendingRoots.hasOwnProperty(rootKey)) {
      this._pendingRoots[rootKey].push(query);
    } else {
      this._pendingRoots[rootKey] = [query];
      this._cacheManager.readRootCall(storageKey, identifyingArgValue, function (error, value) {
        if (_this2._state === 'COMPLETED') {
          return;
        }
        if (error) {
          _this2._handleFailed();
          return;
        }
        var roots = _this2._pendingRoots[rootKey];
        delete _this2._pendingRoots[rootKey];

        _this2._cachedRootCallMap[storageKey] = _this2._cachedRootCallMap[storageKey] || {};
        _this2._cachedRootCallMap[storageKey][identifyingArgValue] = value;
        if (_this2._cachedRootCallMap[storageKey][identifyingArgValue] == null) {
          // Read from cache and we still don't have valid `dataID`.
          _this2._handleFailed();
        } else {
          (function () {
            var dataID = value;
            roots.forEach(function (root) {
              if (_this2._state === 'COMPLETED') {
                return;
              }
              _this2.visitNode(dataID, {
                node: root,
                path: new RelayQueryPath(root),
                rangeCalls: undefined
              });
            });
          })();
        }
        if (_this2._isDone()) {
          _this2._handleSuccess();
        }
      });
    }
  };

  RelayCacheReader.prototype.visitNode = function visitNode(dataID, pendingItem) {
    var _this3 = this;

    var _findRelayQueryLeaves = findRelayQueryLeaves(this._store, this._cachedRecords, pendingItem.node, dataID, pendingItem.path, pendingItem.rangeCalls);

    var missingData = _findRelayQueryLeaves.missingData;
    var pendingNodes = _findRelayQueryLeaves.pendingNodes;

    if (missingData) {
      this._handleFailed();
      return;
    }
    forEachObject(pendingNodes, function (pendingItems, dataID) {
      _this3.queueNode(dataID, pendingItems);
    });
  };

  RelayCacheReader.prototype.queueNode = function queueNode(dataID, pendingItems) {
    var _this4 = this;

    if (this._pendingNodes.hasOwnProperty(dataID)) {
      var _pendingNodes$dataID;

      (_pendingNodes$dataID = this._pendingNodes[dataID]).push.apply(_pendingNodes$dataID, pendingItems);
    } else {
      this._pendingNodes[dataID] = pendingItems;
      this._cacheManager.readNode(dataID, function (error, value) {
        if (_this4._state === 'COMPLETED') {
          return;
        }
        if (error) {
          _this4._handleFailed();
          return;
        }
        if (value && RelayRecord.isClientID(dataID)) {
          value.__path__ = pendingItems[0].path;
        }
        // Mark records as created/updated as necessary. Note that if the
        // record is known to be deleted in the store then it will have been
        // been marked as created already. Further, it does not need to be
        // updated since no additional data can be read about a deleted node.
        var recordState = _this4._store.getRecordState(dataID);
        if (recordState === 'UNKNOWN' && value !== undefined) {
          // Register immediately in case anything tries to read and subscribe
          // to this record (which means incrementing reference counts).
          if (_this4._garbageCollector) {
            _this4._garbageCollector.register(dataID);
          }
          // Mark as created if the store did not have a value but disk cache
          // did (either a known value or known deletion).
          _this4._changeTracker.createID(dataID);
        } else if (recordState === 'EXISTENT' && value != null) {
          // Mark as updated only if a record exists in both the store and
          // disk cache.
          _this4._changeTracker.updateID(dataID);
        }
        _this4._cachedRecords[dataID] = value;
        var items = _this4._pendingNodes[dataID];
        delete _this4._pendingNodes[dataID];
        if (_this4._cachedRecords[dataID] === undefined) {
          // We are out of luck if disk doesn't have the node either.
          _this4._handleFailed();
        } else {
          items.forEach(function (item) {
            if (_this4._state === 'COMPLETED') {
              return;
            }
            _this4.visitNode(dataID, item);
          });
        }
        if (_this4._isDone()) {
          _this4._handleSuccess();
        }
      });
    }
  };

  RelayCacheReader.prototype._isDone = function _isDone() {
    return isEmpty(this._pendingRoots) && isEmpty(this._pendingNodes) && this._state === 'LOADING';
  };

  RelayCacheReader.prototype._handleFailed = function _handleFailed() {
    !(this._state !== 'COMPLETED') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayStoreReader: Query set already failed/completed.') : invariant(false) : undefined;

    this._state = 'COMPLETED';
    this._callbacks.onFailure && this._callbacks.onFailure();
  };

  RelayCacheReader.prototype._handleSuccess = function _handleSuccess() {
    !(this._state !== 'COMPLETED') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayStoreReader: Query set already failed/completed.') : invariant(false) : undefined;

    this._state = 'COMPLETED';
    this._callbacks.onSuccess && this._callbacks.onSuccess();
  };

  return RelayCacheReader;
})();

RelayProfiler.instrumentMethods(RelayCacheReader.prototype, {
  read: 'RelayCacheReader.read',
  readFragment: 'RelayCacheReader.readFragment',
  visitRoot: 'RelayCacheReader.visitRoot',
  queueRoot: 'RelayCacheReader.queueRoot',
  visitNode: 'RelayCacheReader.visitNode',
  queueNode: 'RelayCacheReader.queueNode'
});

module.exports = RelayDiskCacheReader;
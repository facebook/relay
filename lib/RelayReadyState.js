/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayReadyState
 * @typechecks
 * 
 */

'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _extends = require('babel-runtime/helpers/extends')['default'];

var resolveImmediate = require('fbjs/lib/resolveImmediate');
var warning = require('fbjs/lib/warning');

/**
 * @internal
 */

var RelayReadyState = (function () {
  function RelayReadyState(onReadyStateChange) {
    _classCallCheck(this, RelayReadyState);

    this._onReadyStateChange = onReadyStateChange;
    this._readyState = {
      aborted: false,
      done: false,
      error: null,
      ready: false,
      stale: false
    };
    this._scheduled = false;
  }

  RelayReadyState.prototype.update = function update(nextReadyState) {
    var _this = this;

    var prevReadyState = this._readyState;
    if (prevReadyState.aborted) {
      return;
    }
    if (prevReadyState.done || prevReadyState.error) {
      if (!nextReadyState.aborted) {
        process.env.NODE_ENV !== 'production' ? warning(false, 'RelayReadyState: Invalid state change from `%s` to `%s`.', JSON.stringify(prevReadyState), JSON.stringify(nextReadyState)) : undefined;
      }
      return;
    }
    this._readyState = _extends({}, prevReadyState, nextReadyState);
    if (this._scheduled) {
      return;
    }
    this._scheduled = true;
    resolveImmediate(function () {
      _this._scheduled = false;
      _this._onReadyStateChange(_this._readyState);
    });
  };

  return RelayReadyState;
})();

module.exports = RelayReadyState;
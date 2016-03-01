/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayQueryConfig
 * 
 * @typechecks
 */

'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _extends = require('babel-runtime/helpers/extends')['default'];

var _Object$freeze = require('babel-runtime/core-js/object/freeze')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var invariant = require('fbjs/lib/invariant');

/**
 * Configures the root queries and initial variables that define the context in
 * which the top-level component's fragments are requested. This is meant to be
 * subclassed, of which instances are supplied to `RelayRootContainer`.
 */

var RelayQueryConfig = (function () {
  function RelayQueryConfig(initialVariables) {
    _classCallCheck(this, RelayQueryConfig);

    !(this.constructor !== RelayQueryConfig) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayQueryConfig: Abstract class cannot be instantiated.') : invariant(false) : undefined;

    Object.defineProperty(this, 'name', {
      enumerable: true,
      value: this.constructor.routeName
    });
    Object.defineProperty(this, 'params', {
      enumerable: true,
      value: this.prepareVariables(_extends({}, initialVariables)) || {}
    });
    Object.defineProperty(this, 'queries', {
      enumerable: true,
      value: _extends({}, this.constructor.queries)
    });

    if (process.env.NODE_ENV !== 'production') {
      _Object$freeze(this.params);
      _Object$freeze(this.queries);
    }
  }

  /**
   * Provides an opportunity to perform additional logic on the variables.
   * Child class should override this function to perform custom logic.
   */

  RelayQueryConfig.prototype.prepareVariables = function prepareVariables(prevVariables) {
    return prevVariables;
  };

  return RelayQueryConfig;
})();

module.exports = RelayQueryConfig;

// TODO: Deprecate `routeName`, #8478719.
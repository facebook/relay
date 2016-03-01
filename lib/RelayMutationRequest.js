/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayMutationRequest
 * @typechecks
 * 
 */

'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var Deferred = require('fbjs/lib/Deferred');

var printRelayQuery = require('./printRelayQuery');

/**
 * @internal
 *
 * Instances of these are made available via `RelayNetworkLayer.sendMutation`.
 */

var RelayMutationRequest = (function (_Deferred) {
  _inherits(RelayMutationRequest, _Deferred);

  function RelayMutationRequest(mutation, files) {
    _classCallCheck(this, RelayMutationRequest);

    _Deferred.call(this);
    this._mutation = mutation;
    this._printedQuery = null;
    this._files = files;
  }

  /**
   * @public
   *
   * Gets a string name used to refer to this request for printing debug output.
   */

  RelayMutationRequest.prototype.getDebugName = function getDebugName() {
    return this._mutation.getName();
  };

  /**
   * @public
   *
   * Gets an optional map from name to File objects.
   */

  RelayMutationRequest.prototype.getFiles = function getFiles() {
    return this._files;
  };

  /**
   * @public
   *
   * Gets the variables used by the mutation. These variables should be
   * serialized and sent in the GraphQL request.
   */

  RelayMutationRequest.prototype.getVariables = function getVariables() {
    var printedQuery = this._printedQuery;
    if (!printedQuery) {
      printedQuery = printRelayQuery(this._mutation);
      this._printedQuery = printedQuery;
    }
    return printedQuery.variables;
  };

  /**
   * @public
   *
   * Gets a string representation of the GraphQL mutation.
   */

  RelayMutationRequest.prototype.getQueryString = function getQueryString() {
    var printedQuery = this._printedQuery;
    if (!printedQuery) {
      printedQuery = printRelayQuery(this._mutation);
      this._printedQuery = printedQuery;
    }
    return printedQuery.text;
  };

  /**
   * @public
   * @unstable
   */

  RelayMutationRequest.prototype.getMutation = function getMutation() {
    return this._mutation;
  };

  return RelayMutationRequest;
})(Deferred);

module.exports = RelayMutationRequest;
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayQueryRequest
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
 * Instances of these are made available via `RelayNetworkLayer.sendQueries`.
 */

var RelayQueryRequest = (function (_Deferred) {
  _inherits(RelayQueryRequest, _Deferred);

  function RelayQueryRequest(query) {
    _classCallCheck(this, RelayQueryRequest);

    _Deferred.call(this);
    this._printedQuery = null;
    this._query = query;
  }

  /**
   * @public
   *
   * Gets a string name used to refer to this request for printing debug output.
   */

  RelayQueryRequest.prototype.getDebugName = function getDebugName() {
    return this._query.getName();
  };

  /**
   * @public
   *
   * Gets a unique identifier for this query. These identifiers are useful for
   * assigning response payloads to their corresponding queries when sent in a
   * single GraphQL request.
   */

  RelayQueryRequest.prototype.getID = function getID() {
    return this._query.getID();
  };

  /**
   * @public
   *
   * Gets the variables used by the query. These variables should be serialized
   * and sent in the GraphQL request.
   */

  RelayQueryRequest.prototype.getVariables = function getVariables() {
    var printedQuery = this._printedQuery;
    if (!printedQuery) {
      printedQuery = printRelayQuery(this._query);
      this._printedQuery = printedQuery;
    }
    return printedQuery.variables;
  };

  /**
   * @public
   *
   * Gets a string representation of the GraphQL query.
   */

  RelayQueryRequest.prototype.getQueryString = function getQueryString() {
    var printedQuery = this._printedQuery;
    if (!printedQuery) {
      printedQuery = printRelayQuery(this._query);
      this._printedQuery = printedQuery;
    }
    return printedQuery.text;
  };

  /**
   * @public
   * @unstable
   */

  RelayQueryRequest.prototype.getQuery = function getQuery() {
    return this._query;
  };

  return RelayQueryRequest;
})(Deferred);

module.exports = RelayQueryRequest;
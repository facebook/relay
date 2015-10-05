/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayQueryRequest
 * @typechecks
 * @flow
 */

'use strict';

var Deferred = require('Deferred');
import type {PrintedQuery} from 'RelayInternalTypes';
import type RelayQuery from 'RelayQuery';
import type {QueryResult, Variables} from 'RelayTypes';

var printRelayQuery = require('printRelayQuery');

/**
 * @internal
 *
 * Instances of these are made available via `RelayNetworkLayer.sendQueries`.
 */
class RelayQueryRequest extends Deferred<QueryResult, Error> {
  _printedQuery: ?PrintedQuery;
  _query: RelayQuery.Root;

  constructor(query: RelayQuery.Root) {
    super();
    this._printedQuery = null;
    this._query = query;
  }

  /**
   * @public
   *
   * Gets a string name used to refer to this request for printing debug output.
   */
  getDebugName(): string {
    return this._query.getName();
  }

  /**
   * @public
   *
   * Gets a unique identifier for this query. These identifiers are useful for
   * assigning response payloads to their corresponding queries when sent in a
   * single GraphQL request.
   */
  getID(): string {
    return this._query.getID();
  }

  /**
   * @public
   *
   * Gets the variables used by the query. These variables should be serialized
   * and sent in the GraphQL request.
   */
  getVariables(): Variables {
    var printedQuery = this._printedQuery;
    if (!printedQuery) {
      printedQuery = printRelayQuery(this._query);
      this._printedQuery = printedQuery;
    }
    return printedQuery.variables;
  }

  /**
   * @public
   *
   * Gets a string representation of the GraphQL query.
   */
  getQueryString(): string {
    var printedQuery = this._printedQuery;
    if (!printedQuery) {
      printedQuery = printRelayQuery(this._query);
      this._printedQuery = printedQuery;
    }
    return printedQuery.text;
  }

  /**
   * @public
   * @unstable
   */
  getQuery(): RelayQuery.Root {
    return this._query;
  }
}

module.exports = RelayQueryRequest;

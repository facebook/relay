/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayMutationRequest
 * @flow
 */

'use strict';

const Deferred = require('Deferred');

const printRelayQuery = require('printRelayQuery');

import type {PrintedQuery} from 'RelayInternalTypes';
import type {FileMap} from 'RelayMutation';
import type RelayQuery from 'RelayQuery';
import type {MutationResult, Variables} from 'RelayTypes';

/**
 * @internal
 *
 * Instances of these are made available via `RelayNetworkLayer.sendMutation`.
 */
class RelayMutationRequest extends Deferred<MutationResult, Error> {
  _mutation: RelayQuery.Mutation;
  _printedQuery: ?PrintedQuery;
  _files: ?FileMap;

  constructor(
    mutation: RelayQuery.Mutation,
    files: ?FileMap
  ) {
    super();
    this._mutation = mutation;
    this._printedQuery = null;
    this._files = files;
  }

  /**
   * @public
   *
   * Gets a string name used to refer to this request for printing debug output.
   */
  getDebugName(): string {
    return this._mutation.getName();
  }

  /**
   * @public
   *
   * Gets an optional map from name to File objects.
   */
  getFiles(): ?FileMap {
    return this._files;
  }

  /**
   * @public
   *
   * Gets the variables used by the mutation. These variables should be
   * serialized and sent in the GraphQL request.
   */
  getVariables(): Variables {
    return this._getPrintedQuery().variables;
  }

  /**
   * @public
   *
   * Gets a string representation of the GraphQL mutation.
   */
  getQueryString(): string {
    return this._getPrintedQuery().text;
  }

  /**
   * @public
   * @unstable
   */
  getMutation(): RelayQuery.Mutation {
    return this._mutation;
  }

  /**
   * @private
   *
   * Returns the memoized printed query.
   */
  _getPrintedQuery(): PrintedQuery {
    if (!this._printedQuery) {
      this._printedQuery = printRelayQuery(this._mutation);
    }
    return this._printedQuery;
  }
}

module.exports = RelayMutationRequest;

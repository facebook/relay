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

const Deferred = require('Deferred');

const printRelayQuery = require('../traversal/printRelayQuery');

import type {FileMap} from '../mutation/RelayMutation';
import type RelayQuery from '../query/RelayQuery';
import type {PrintedQuery} from '../tools/RelayInternalTypes';
import type {MutationResult} from '../tools/RelayTypes';
import type {Variables} from 'RelayRuntime';

/**
 * @internal
 *
 * Instances of these are made available via `RelayNetworkLayer.sendMutation`.
 */
class RelayMutationRequest extends Deferred<MutationResult, Error> {
  _mutation: RelayQuery.Mutation;
  _printedQuery: ?PrintedQuery;
  _files: ?FileMap;

  constructor(mutation: RelayQuery.Mutation, files: ?FileMap) {
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

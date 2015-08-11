/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayMutationRequest
 * @typechecks
 * @flow
 */

'use strict';

var Deferred = require('Deferred');
import type {FileMap} from 'RelayMutation';
import type {MutationVariables} from 'RelayMutationTransaction';
import type RelayQuery from 'RelayQuery';
import type {MutationResult} from 'RelayTypes';

var printRelayQuery = require('printRelayQuery');

/**
 * @internal
 *
 * Instances of these are made available via `RelayNetworkLayer.sendMutation`.
 */
class RelayMutationRequest extends Deferred<MutationResult, Error> {
  _mutation: RelayQuery.Mutation;
  _variables: MutationVariables;
  _files: ?FileMap;

  constructor(
    mutation: RelayQuery.Mutation,
    variables: MutationVariables,
    files: ?FileMap
  ) {
    super();
    this._mutation = mutation;
    this._variables = variables;
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
   * serialized and send in the GraphQL request.
   */
  getVariables(): MutationVariables {
    return this._variables;
  }

  /**
   * @public
   *
   * Gets a string representation of the GraphQL mutation.
   */
  getQueryString(): string {
    return printRelayQuery(this._mutation);
  }

  /**
   * @public
   * @unstable
   */
  getMutation(): RelayQuery.Mutation {
    return this._mutation;
  }
}

module.exports = RelayMutationRequest;

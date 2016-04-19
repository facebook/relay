/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayGraphQLMutation
 * @typechecks
 * @flow
 */

'use strict';

const QueryBuilder = require('QueryBuilder');
import type {RelayEnvironmentInterface} from 'RelayEnvironment';
import type {ClientMutationID} from 'RelayInternalTypes';
const RelayMetaRoute = require('RelayMetaRoute');
import type {FileMap} from 'RelayMutation';
import type {RelayConcreteNode} from 'RelayQL';
const {CLIENT_MUTATION_ID} = require('RelayConnectionInterface');
import type RelayMutationTransaction from 'RelayMutationTransaction';
const RelayMutationTransactionStatus = require('RelayMutationTransactionStatus');
import type {RelayMutationTransactionCommitCallbacks} from 'RelayTypes';
const RelayQuery = require('RelayQuery'); // TODO: decide whether I just need the type
import type RelayStoreData from 'RelayStoreData';
import type {
  RelayMutationConfig,
  RelayMutationTransactionCommitFailureCallback,
  RelayMutationTransactionCommitSuccessCallback,
  Variables,
} from 'RelayTypes';
const invariant = require('invariant');

const COUNTER_PREFIX = 'RelayGraphQLMutation';
let collisionIDCounter = 0;

/**
 * @internal
 *
 * Low-level API for modeling a GraphQL mutation.
 *
 * This is the lowest level of abstraction at which product code may deal with
 * mutations in Relay, and it corresponds to the mutation operation ("a write
 * followed by a fetch") described in the GraphQL Specification. You specify
 * the mutation, the inputs, and the query.
 *
 * (There is an even lower-level representation, `RelayMutationRequest`,
 * underlying this which is an entirely internal implementation detail that
 * product code need not be aware of.)
 *
 * Low-level mutations cannot (yet) be applied optimistically or rolled back.
 * They don't provide any bells and whistles such as fat queries or tracked
 * queries. If you want those, you can opt in to the higher-level
 * `RelayMutation` API.
 *
 * @see http://facebook.github.io/graphql/.
 *
 */
class RelayGraphQLMutation {
  _collisionKey: string;
  _files: ?FileMap;
  _query: RelayConcreteNode;
  _variables: Object;

  /**
   * Simplest method for creating a RelayGraphQLMutation instance from a static
   * `mutation` and some `variables`.
   */
  static create(
    mutation: RelayConcreteNode,
    variables: Object
  ): RelayGraphQLMutation {
    return new RelayGraphQLMutation(mutation, variables, null, null);
  }

  /**
   * Specialized method for creating RelayGraphQLMutation instances that takes a
   * `files` object in addition to the base `mutation` and `variables`
   * parameters.
   */
  static createWithFiles(
    mutation: RelayConcreteNode,
    variables: Object,
    files: FileMap,
  ): RelayGraphQLMutation {
    return new RelayGraphQLMutation(mutation, variables, files, null);
  }

  /**
   * General constructor for creating RelayGraphQLMutation instances with
   * optional `files` and `collisionKey` arguments.
   *
   * Callers must provide an appropriate `mutation`:
   *
   *    Relay.QL`
   *      mutation StoryLikeQuery {
   *        likeStory(input: $input) {
   *          clientMutationId
   *          story {
   *            likeCount
   *            likers {
   *              actor {
   *                name
   *              }
   *            }
   *          }
   *        }
   *      }
   *    `;
   *
   * And set of `variables`:
   *
   *    {
   *      input: {
   *        feedbackId: 'aFeedbackId',
   *      },
   *    }
   *
   * As per the GraphQL Relay Specification:
   *
   * - The mutation should take a single argument named "input".
   * - That input argument should contain a (string) "clientMutationId" property
   *   for the purposes of reconciling requests and responses (automatically
   *   added by the RelayGraphQLMutation API).
   * - The query should request "clientMutationId" as a subselection.
   *
   * @see http://facebook.github.io/relay/docs/graphql-mutations.html
   * @see http://facebook.github.io/relay/graphql/mutations.htm
   *
   * If not supplied, a unique collision key is derived (meaning that the
   * created mutation will be independent and not collide with any other).
   */
  constructor(
    query: RelayConcreteNode,
    variables: Object,
    files: ?FileMap,
    collisionKey: ?string
  ) {
    this._query = query;
    this._variables = variables;
    this._files = files || null;
    this._collisionKey =
      collisionKey ||
      `${COUNTER_PREFIX}:collisionKey:${getNextCollisionID()}`;
  }

  commitUpdate(
    environment: RelayEnvironmentInterface,
    callbacks: ?RelayMutationTransactionCommitCallbacks,
  ): RelayMutationTransaction {
    const transaction = new PendingGraphQLTransaction(
      environment,
      this._query,
      this._variables,
      this._files,
      this._collisionKey,
      callbacks
    );
    return transaction.commit();
  }
}

function getNextCollisionID(): number {
  return collisionIDCounter++;
}

/**
 * @internal
 *
 * Data structure conforming to the `PendingTransaction` interface specified by
 * `RelayMutationQueue`.
 */
class PendingGraphQLTransaction {
  // These properties required to conform to the PendingTransaction interface:
  error: ?Error;
  id: ClientMutationID;
  mutationTransaction: RelayMutationTransaction;
  onFailure: ?RelayMutationTransactionCommitFailureCallback;
  onSuccess: ?RelayMutationTransactionCommitSuccessCallback;
  status: $Keys<typeof RelayMutationTransactionStatus>;

  // Other properties:
  _collisionKey: string;
  _variables: Variables;
  _files: ?FileMap;
  _query: RelayConcreteNode;
  _mutation: ?RelayQuery.Mutation;

  constructor(
    environment: RelayEnvironmentInterface,
    query: RelayConcreteNode,
    variables: Variables,
    files: ?FileMap,
    collisionKey: string,
    callbacks: ?RelayMutationTransactionCommitCallbacks
  ) {
    this._query = query;
    this._variables = variables;
    this._collisionKey = collisionKey;
    this.onFailure = callbacks && callbacks.onFailure;
    this.onSuccess = callbacks && callbacks.onSuccess;
    this.status = RelayMutationTransactionStatus.CREATED;
    this.error = null;
    this._mutation = null;

    this.mutationTransaction = environment
      .getStoreData()
      .getMutationQueue()
      .createTransactionWithPendingTransaction(this);

    this.id = this.mutationTransaction.getID();
  }

  // Methods from the PendingTransaction interface.

  getCallName(): string {
    invariant(
      this._mutation,
      'RelayGraphQLMutation: `getCallName()` called but no mutation exists ' +
      '(`getQuery()` must be called first to construct the mutation).'
    );
    return this._mutation.getCall().name;
  }

  getCollisionKey(): ?string {
    return this._collisionKey;
  }

  getConfigs(): Array<RelayMutationConfig> {
    return [];
  }

  getFiles(): ?FileMap {
    return this._files;
  }

  getOptimisticConfigs(): ?Array<{[key: string]: mixed}> {
    return [];
  }

  getOptimisticQuery(storeData: RelayStoreData): ?RelayQuery.Mutation {
    return null;
  }

  getOptimisticResponse(): ?Object {
    return null;
  }

  getQuery(storeData: RelayStoreData): RelayQuery.Mutation {
    if (!this._mutation) {
      const concreteMutation = QueryBuilder.getMutation(this._query);
      const mutation = RelayQuery.Mutation.create(
        concreteMutation,
        RelayMetaRoute.get('$RelayGraphQLMutation'),
        this._getVariables()
      );
      this._mutation = (mutation: any); // Cast RelayQuery.{Node -> Mutation}.
    }
    return this._mutation;
  }

  // Additional methods outside the PendingTransaction interface.

  commit(): RelayMutationTransaction {
    return this.mutationTransaction.commit();
  }

  _getVariables(): Variables {
    const input = this._variables.input;
    if (!input) {
      invariant(
        false,
        'RelayGraphQLMutation: Required `input` variable is missing ' +
        '(supplied variables were: [%s]).',
        Object.keys(this._variables).join(', ')
      );
    }
    return {
      ...this._variables,
      input: {
        ...input,
        [CLIENT_MUTATION_ID]: this.id,
      },
    };
  }
}

module.exports = RelayGraphQLMutation;

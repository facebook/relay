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

const QueryBuilder = require('../query/QueryBuilder');
const RelayMetaRoute = require('../route/RelayMetaRoute');
const RelayMutationTransactionStatus = require('./RelayMutationTransactionStatus');
const RelayQuery = require('../query/RelayQuery');

const invariant = require('invariant');

const {ConnectionInterface} = require('RelayRuntime');

import type {RelayConcreteNode} from '../query/RelayQL';
import type {RelayEnvironmentInterface} from '../store/RelayEnvironment';
import type RelayStoreData from '../store/RelayStoreData';
import type {ClientMutationID} from '../tools/RelayInternalTypes';
import type {RelayMutationTransactionCommitCallbacks} from '../tools/RelayTypes';
import type {
  RelayMutationTransactionCommitFailureCallback,
  RelayMutationTransactionCommitSuccessCallback,
} from '../tools/RelayTypes';
import type {FileMap} from './RelayMutation';
import type RelayMutationTransaction from './RelayMutationTransaction';
import type {DeclarativeMutationConfig, Variables} from 'RelayRuntime';

const COUNTER_PREFIX = 'RelayGraphQLMutation';
let collisionIDCounter = 0;

/**
 * @public
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
 * @see http://facebook.github.io/graphql/.
 *
 */
class RelayGraphQLMutation {
  _callbacks: ?RelayMutationTransactionCommitCallbacks;
  _collisionKey: string;
  _environment: RelayEnvironmentInterface;
  _files: ?FileMap;
  _query: RelayConcreteNode;
  _transaction: ?PendingGraphQLTransaction;
  _variables: Object;

  /**
   * Simplest method for creating a RelayGraphQLMutation instance from a static
   * `mutation`, some `variables` and an `environment`.
   */
  static create(
    mutation: RelayConcreteNode,
    variables: Object,
    environment: RelayEnvironmentInterface,
  ): RelayGraphQLMutation {
    return new RelayGraphQLMutation(mutation, variables, null, environment);
  }

  /**
   * Specialized method for creating RelayGraphQLMutation instances that takes a
   * `files` object in addition to the base `mutation`, `variables` and
   * `environment` parameters.
   */
  static createWithFiles(
    mutation: RelayConcreteNode,
    variables: Variables,
    files: FileMap,
    environment: RelayEnvironmentInterface,
  ): RelayGraphQLMutation {
    return new RelayGraphQLMutation(mutation, variables, files, environment);
  }

  /**
   * General constructor for creating RelayGraphQLMutation instances with
   * optional `files`, `callbacks` and `collisionKey` arguments.
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
    variables: Variables,
    files: ?FileMap,
    environment: RelayEnvironmentInterface,
    callbacks: ?RelayMutationTransactionCommitCallbacks,
    collisionKey: ?string,
  ) {
    this._query = query;
    this._variables = variables;
    this._files = files || null;
    this._environment = environment;
    this._callbacks = callbacks || null;
    this._collisionKey =
      collisionKey || `${COUNTER_PREFIX}:collisionKey:${getNextCollisionID()}`;
    this._transaction = null;
  }

  /**
   * Call this to optimistically apply an update to the store.
   *
   * The optional `config` parameter can be used to configure a `RANGE_ADD` type
   * mutation, similar to `RelayMutation` API.
   *
   * Optionally, follow up with a call to `commit()` to send the mutation
   * to the server.
   *
   * Note: An optimistic update may only be applied once.
   */
  applyOptimistic(
    optimisticQuery: RelayConcreteNode,
    optimisticResponse: Object,
    configs: ?Array<DeclarativeMutationConfig>,
  ): RelayMutationTransaction {
    invariant(
      !this._transaction,
      'RelayGraphQLMutation: `applyOptimistic()` was called on an instance ' +
        'that already has a transaction in progress.',
    );
    this._transaction = this._createTransaction(
      optimisticQuery,
      optimisticResponse,
    );
    return this._transaction.applyOptimistic(configs);
  }

  /**
   * Call this to send the mutation to the server.
   *
   * The optional `config` parameter can be used to configure a `RANGE_ADD` type
   * mutation, similar to the `RelayMutation` API.
   *
   * Optionally, precede with a call to `applyOptimistic()` to apply an update
   * optimistically to the store.
   *
   * Note: This method may only be called once per instance.
   */
  commit(configs: ?Array<DeclarativeMutationConfig>): RelayMutationTransaction {
    if (!this._transaction) {
      this._transaction = this._createTransaction();
    }
    return this._transaction.commit(configs);
  }

  rollback(): void {
    if (this._transaction) {
      return this._transaction.rollback();
    }
  }

  _createTransaction(
    optimisticQuery: ?RelayConcreteNode,
    optimisticResponse: ?Object,
  ): PendingGraphQLTransaction {
    return new PendingGraphQLTransaction(
      this._environment,
      this._query,
      this._variables,
      this._files,
      optimisticQuery,
      optimisticResponse,
      this._collisionKey,
      this._callbacks,
    );
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
  _configs: Array<DeclarativeMutationConfig>;
  _files: ?FileMap;
  _mutation: ?RelayQuery.Mutation;
  _optimisticConfigs: ?Array<DeclarativeMutationConfig>;
  _optimisticResponse: ?Object;
  _optimisticQuery: ?RelayConcreteNode;
  _optimisticMutation: ?RelayQuery.Mutation;
  _query: RelayConcreteNode;
  _variables: Variables;

  constructor(
    environment: RelayEnvironmentInterface,
    query: RelayConcreteNode,
    variables: Variables,
    files: ?FileMap,
    optimisticQuery: ?RelayConcreteNode,
    optimisticResponse: ?Object,
    collisionKey: string,
    callbacks: ?RelayMutationTransactionCommitCallbacks,
  ) {
    this._configs = [];
    this._query = query;
    this._variables = variables;
    this._files = files;
    this._optimisticQuery = optimisticQuery || null;
    this._optimisticResponse = optimisticResponse || null;
    this._collisionKey = collisionKey;
    this.onFailure = callbacks && callbacks.onFailure;
    this.onSuccess = callbacks && callbacks.onSuccess;
    this.status = RelayMutationTransactionStatus.CREATED;
    this.error = null;
    this._mutation = null;
    this._optimisticConfigs = null;
    this._optimisticMutation = null;

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
        '(`getQuery()` must be called first to construct the mutation).',
    );
    return this._mutation.getCall().name;
  }

  getCollisionKey(): ?string {
    return this._collisionKey;
  }

  getConfigs(): Array<DeclarativeMutationConfig> {
    return this._configs;
  }

  getFiles(): ?FileMap {
    return this._files;
  }

  getOptimisticConfigs(): ?Array<DeclarativeMutationConfig> {
    return this._optimisticConfigs;
  }

  getOptimisticQuery(storeData: RelayStoreData): ?RelayQuery.Mutation {
    if (!this._optimisticMutation && this._optimisticQuery) {
      const concreteMutation = QueryBuilder.getMutation(this._optimisticQuery);
      const mutation = RelayQuery.Mutation.create(
        concreteMutation,
        RelayMetaRoute.get('$RelayGraphQLMutation'),
        this._getVariables(),
      );
      this._optimisticMutation = (mutation: any); // Cast RelayQuery.{Node -> Mutation}.
    }
    return this._optimisticMutation;
  }

  getOptimisticResponse(): ?Object {
    return {
      ...this._optimisticResponse,
      [ConnectionInterface.get().CLIENT_MUTATION_ID]: this.id,
    };
  }

  getQuery(storeData: RelayStoreData): RelayQuery.Mutation {
    if (!this._mutation) {
      const concreteMutation = QueryBuilder.getMutation(this._query);
      const mutation = RelayQuery.Mutation.create(
        concreteMutation,
        RelayMetaRoute.get('$RelayGraphQLMutation'),
        this._getVariables(),
      );
      this._mutation = (mutation: any); // Cast RelayQuery.{Node -> Mutation}.
    }
    return this._mutation;
  }

  // Additional methods outside the PendingTransaction interface.

  commit(configs: ?Array<DeclarativeMutationConfig>): RelayMutationTransaction {
    if (configs) {
      this._configs = configs;
    }
    return this.mutationTransaction.commit();
  }

  applyOptimistic(
    configs: ?Array<DeclarativeMutationConfig>,
  ): RelayMutationTransaction {
    if (configs) {
      this._optimisticConfigs = configs;
    }
    return this.mutationTransaction.applyOptimistic();
  }

  rollback(): void {
    this.mutationTransaction.rollback();
  }

  _getVariables(): Variables {
    const input = this._variables.input;
    if (!input) {
      invariant(
        false,
        'RelayGraphQLMutation: Required `input` variable is missing ' +
          '(supplied variables were: [%s]).',
        Object.keys(this._variables).join(', '),
      );
    }
    return {
      ...this._variables,
      input: {
        ...(input: $FlowFixMe),
        [ConnectionInterface.get().CLIENT_MUTATION_ID]: this.id,
      },
    };
  }
}

module.exports = RelayGraphQLMutation;

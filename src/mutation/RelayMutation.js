/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayMutation
 * @typechecks
 * @flow
 */

'use strict';

import type {ConcreteFragment} from 'ConcreteQuery';
import type {RelayConcreteNode} from 'RelayQL';
const RelayFragmentPointer = require('RelayFragmentPointer');
const RelayFragmentReference = require('RelayFragmentReference');
import type {RelayEnvironmentInterface} from 'RelayEnvironment';
const RelayMetaRoute = require('RelayMetaRoute');
const RelayQuery = require('RelayQuery');
import type {
  RelayMutationConfig,
  Variables,
} from 'RelayTypes';

const buildRQL = require('buildRQL');
import type {RelayQLFragmentBuilder} from 'buildRQL';
const forEachObject = require('forEachObject');
const invariant = require('invariant');
const warning = require('warning');

export type FileMap = {[key: string]: File};
export type RelayMutationFragments<Tk> = {
  [key: Tk]: RelayQLFragmentBuilder;
};

/**
 * @public
 *
 * RelayMutation is the base class for modeling mutations of data.
 */
class RelayMutation<Tp: Object> {
  static name: $FlowIssue;
  /* $FlowIssue(>=0.20.0) #9410317 */
  static fragments: RelayMutationFragments<$Keys<Tp>>;
  static initialVariables: Variables;
  static prepareVariables: ?(
    prevVariables: Variables,
    route: RelayMetaRoute
  ) => Variables;

  props: Tp;
  _context: RelayEnvironmentInterface;
  _didShowFakeDataWarning: boolean;
  _unresolvedProps: Tp;

  constructor(props: Tp) {
    this._didShowFakeDataWarning = false;
    this._unresolvedProps = props;
  }

  /**
   * @internal
   */
  bindContext(context: RelayEnvironmentInterface): void {
    if (!this._context) {
      this._context = context;
      this._resolveProps();
    } else {
      invariant(
        context === this._context,
        '%s: Mutation instance cannot be used in different Relay contexts.',
        this.constructor.name
      );
    }
  }

  /**
   * Each mutation corresponds to a field on the server which is used by clients
   * to communicate the type of mutation to be executed.
   */
  getMutation(): RelayConcreteNode {
    invariant(
      false,
      '%s: Expected abstract method `getMutation` to be implemented.',
      this.constructor.name
    );
  }

  /**
   * "Fat queries" represent a predetermined set of fields that may change as a
   * result of a mutation, and which should therefore be queried in order to get
   * a consistent view of the data after performing a mutation. In practice, we
   * query for a subset of those fields because we intersect the fat query with
   * the tracked query we have for a given node (ie. the pieces of data we've
   * previously queried for and have therefore written to the store).
   *
   * Fat queries can be written like normal GraphQL queries with one main
   * exception: fat queries use childless non-scalar fields to indicate that
   * anything under that field may change. For example, the fat query for
   * feedback_like contains the field `like_sentence` with no child fields.
   * This means that any field below `like_sentence` may change as a result of
   * feedback_like.
   *
   * When adding a fat query, consider *all* of the data that might change as a
   * result of the mutation - not just data that we currently use in Relay. We
   * don't need to worry about overfetching here (this query is never executed
   * on its own; the infrastructure always intersects it with what is actually
   * needed), and if we omit fields here we might get odd consistency behavior
   * in the future when we add new views or modify existing ones.
   */
  getFatQuery(): RelayConcreteNode {
    invariant(
      false,
      '%s: Expected abstract method `getFatQuery` to be implemented.',
      this.constructor.name
    );
  }

  /**
   * These configurations are used to generate the query for the mutation to be
   * sent to the server and to correctly write the server's response into the
   * client store.
   *
   * Possible configuration types:
   *
   * -  FIELDS_CHANGE provides configuration for mutation fields.
   *    {
   *      type: RelayMutationType.FIELDS_CHANGE;
   *      fieldIDs: {[fieldName: string]: DataID | Array<DataID>};
   *    }
   *    where fieldIDs map `fieldName`s from the fatQuery to a DataID or
   *    array of DataIDs to be updated in the store.
   *
   * -  RANGE_ADD provides configuration for adding a new edge to a range.
   *    {
   *      type: RelayMutationType.RANGE_ADD;
   *      parentName: string;
   *      parentID: string;
   *      connectionName: string;
   *      edgeName: string;
   *      rangeBehaviors:
   *        {[call: string]: GraphQLMutatorConstants.RANGE_OPERATIONS};
   *    }
   *    where `parentName` is the field in the fatQuery that contains the range,
   *    `parentID` is the DataID of `parentName` in the store, `connectionName`
   *    is the name of the range, `edgeName` is the name of the key in server
   *    response that contains the newly created edge, `rangeBehaviors` maps
   *    stringified representation of calls on the connection to
   *    GraphQLMutatorConstants.RANGE_OPERATIONS.
   *
   * -  NODE_DELETE provides configuration for deleting a node and the
   *    corresponding edge from a range.
   *    {
   *      type: RelayMutationType.NODE_DELETE;
   *      parentName: string;
   *      parentID: string;
   *      connectionName: string;
   *      deletedIDFieldName: string;
   *    }
   *    where `parentName`, `parentID` and `connectionName` refer to the same
   *    things as in RANGE_ADD, `deletedIDFieldName` is the name of the key in
   *    the server response that contains the DataID of the deleted node.
   *
   * -  RANGE_DELETE provides configuration for deleting an edge from a range
   *    but doesn't delete the node.
   *    {
   *      type: RelayMutationType.RANGE_DELETE;
   *      parentName: string;
   *      parentID: string;
   *      connectionName: string;
   *      deletedIDFieldName: string | Array<string>;
   *      pathToConnection: Array<string>;
   *    }
   *    where `parentName`, `parentID`, `connectionName` and
   *    `deletedIDFieldName` refer to the same things as in NODE_DELETE.
   *    `deletedIDFieldName` can also be a path from the response root to the
   *    deleted node. `pathToConnection` is a path from `parentName` to
   *    `connectionName`.
   *
   * -  REQUIRED_CHILDREN is used to append additional children (fragments or
   *    fields) to the mutation query. Any data fetched for these children is
   *    not written to the client store, but you can add code to process it
   *    in the `onSuccess` callback passed to the `RelayEnvironment` `applyUpdate`
   *    method. You may need to use this, for example, to fetch fields on a new
   *    object created by the mutation (and which Relay would normally not
   *    attempt to fetch because it has not previously fetched anything for that
   *    object).
   *    {
   *      type: RelayMutationType.REQUIRED_CHILDREN;
   *      children: Array<RelayQuery.Node>;
   *    }
   */
  getConfigs(): Array<RelayMutationConfig> {
    invariant(
      false,
      '%s: Expected abstract method `getConfigs` to be implemented.',
      this.constructor.name
    );
  }

  /**
   * These variables form the "input" to the mutation query sent to the server.
   */
  getVariables(): {[name: string]: mixed} {
    invariant(
      false,
      '%s: Expected abstract method `getVariables` to be implemented.',
      this.constructor.name
    );
  }

  /**
   * These will be sent along with the mutation query to the server.
   */
  getFiles(): ?FileMap {
    return null;
  }

  /**
   * When a request is sent to the server, mutations can optionally construct an
   * optimistic response that has the same shape as the server response payload.
   * This optimistic response is used to pre-emptively update the client cache
   * to simulate an instantaneous response.
   *
   * The optimistic response may be a subset or superset of the actual response
   * payload. It can be a subset if certain fields are impossible to create on
   * the client (and if views are expected to handle the data inconsistency). It
   * can be a superset of the actual response payload if certain fields that are
   * affected have not been queried by the client, yet.
   */
  getOptimisticResponse(): ?{[key: string]: mixed} {
    return null;
  }

  /**
   * Optional. Similar to `getConfig`, this is used to create the query
   * corresponding to the `optimisticResponse`. If not provided, the query
   * will be inferred from the optimistic response. Most subclasses shouldn't
   * need to extend this method.
   */
  getOptimisticConfigs(): ?Array<{[key: string]: mixed}> {
    return null;
  }

  /**
   * An optional collision key allows a mutation to identify itself with other
   * mutations that affect the same fields. Mutations with the same collision
   * are sent to the server serially and in-order to avoid unpredictable and
   * potentially incorrect behavior.
   */
  getCollisionKey(): ?string {
    return null;
  }

  _resolveProps(): void {
    const fragments = this.constructor.fragments;
    const initialVariables = this.constructor.initialVariables || {};

    const props = this._unresolvedProps;
    const resolvedProps = {...props};
    forEachObject(fragments, (fragmentBuilder, fragmentName) => {
      const propValue = props[fragmentName];
      warning(
        propValue !== undefined,
        'RelayMutation: Expected data for fragment `%s` to be supplied to ' +
        '`%s` as a prop. Pass an explicit `null` if this is intentional.',
        fragmentName,
        this.constructor.name
      );

      if (propValue == null) {
        return;
      }
      if (typeof propValue !== 'object') {
        warning(
          false,
          'RelayMutation: Expected data for fragment `%s` supplied to `%s` ' +
          'to be an object.',
          fragmentName,
          this.constructor.name
        );
        return;
      }

      const fragment = RelayQuery.Fragment.create(
        buildMutationFragment(
          this.constructor.name,
          fragmentName,
          fragmentBuilder,
          initialVariables
        ),
        RelayMetaRoute.get(`$RelayMutation_${this.constructor.name}`),
        initialVariables
      );

      if (fragment.isPlural()) {
        invariant(
          Array.isArray(propValue),
          'RelayMutation: Invalid prop `%s` supplied to `%s`, expected an ' +
          'array of records because the corresponding fragment is plural.',
          fragmentName,
          this.constructor.name
        );
        const dataIDs = propValue.map((item, ii) => {
          invariant(
            typeof item === 'object' && item != null,
            'RelayMutation: Invalid prop `%s` supplied to `%s`, ' +
            'expected element at index %s to have query data.',
            fragmentName,
            this.constructor.name,
            ii
          );
          const dataID = RelayFragmentPointer.getDataID(item, fragment);
          invariant(
            dataID,
            'RelayMutation: Invalid prop `%s` supplied to `%s`, ' +
            'expected element at index %s to have query data.',
            fragmentName,
            this.constructor.name,
            ii
          );
          return dataID;
        });

        resolvedProps[fragmentName] = dataIDs.map(
          dataID => this._context.read(fragment, dataID)
        );
      } else {
        invariant(
          !Array.isArray(propValue),
          'RelayMutation: Invalid prop `%s` supplied to `%s`, expected a ' +
          'single record because the corresponding fragment is not plural.',
          fragmentName,
          this.constructor.name
        );
        const dataID = RelayFragmentPointer.getDataID(propValue, fragment);
        if (dataID) {
          resolvedProps[fragmentName] = this._context.read(fragment, dataID);
        } else {
          if (__DEV__) {
            if (!this._didShowFakeDataWarning) {
              this._didShowFakeDataWarning = true;
              warning(
                false,
                'RelayMutation: Expected prop `%s` supplied to `%s` to ' +
                'be data fetched by Relay. This is likely an error unless ' +
                'you are purposely passing in mock data that conforms to ' +
                'the shape of this mutation\'s fragment.',
                fragmentName,
                this.constructor.name
              );
            }
          }
        }
      }
    });
    this.props = resolvedProps;
  }

  static getFragment(
    fragmentName: $Keys<Tp>,
    variableMapping?: Variables
  ): RelayFragmentReference {
    // TODO: Unify fragment API for containers and mutations, #7860172.
    const fragments = this.fragments;
    const fragmentBuilder = fragments[fragmentName];
    if (!fragmentBuilder) {
      invariant(
        false,
        '%s.getFragment(): `%s` is not a valid fragment name. Available ' +
        'fragments names: %s',
        this.name,
        fragmentName,
        Object.keys(fragments).map(name => '`' + name + '`').join(', ')
      );
    }

    const initialVariables = this.initialVariables || {};
    const prepareVariables = this.prepareVariables;

    return RelayFragmentReference.createForContainer(
      () => buildMutationFragment(
        this.name,
        fragmentName,
        fragmentBuilder,
        initialVariables
      ),
      initialVariables,
      variableMapping,
      prepareVariables
    );
  }
}

/**
 * Wrapper around `buildRQL.Fragment` with contextual error messages.
 */
function buildMutationFragment(
  mutationName: string,
  fragmentName: string,
  fragmentBuilder: RelayQLFragmentBuilder,
  variables: Variables
): ConcreteFragment {
  const fragment = buildRQL.Fragment(
    fragmentBuilder,
    variables
  );
  invariant(
    fragment,
    'Relay.QL defined on mutation `%s` named `%s` is not a valid fragment. ' +
    'A typical fragment is defined using: Relay.QL`fragment on Type {...}`',
    mutationName,
    fragmentName
  );
  return fragment;
}

module.exports = RelayMutation;

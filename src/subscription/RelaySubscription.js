/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelaySubscription
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
const RelayRecord = require('RelayRecord');
import type {
  RelayMutationConfig,
  Variables,
} from 'RelayTypes';

const buildRQL = require('buildRQL');
import type {RelayQLFragmentBuilder} from 'buildRQL';
const forEachObject = require('forEachObject');
const invariant = require('invariant');
const validateMutationConfig = require('validateMutationConfig');
const warning = require('warning');

export type RelaySubscriptionFragments<Tk> = {
  [key: Tk]: RelayQLFragmentBuilder;
};

/**
 * @public
 *
 * RelaySubscription is the base class for modeling subscriptions of data.
 */
class RelaySubscription<Tp: Object> {
  static name: $FlowIssue;
  static fragments: RelaySubscriptionFragments<$Keys<Tp>>;
  static initialVariables: Variables;
  static prepareVariables: ?(
    prevVariables: Variables,
    route: RelayMetaRoute
  ) => Variables;

  props: Tp;
  _environment: RelayEnvironmentInterface;
  _didShowFakeDataWarning: boolean;
  _didValidateConfig: boolean;
  _unresolvedProps: Tp;

  constructor(props: Tp) {
    this._didShowFakeDataWarning = false;
    this._didValidateConfig = false;
    this._unresolvedProps = props;
  }

  /**
   * @internal
   */
  bindEnvironment(environment: RelayEnvironmentInterface): void {
    if (!this._environment) {
      this._environment = environment;
      this._resolveProps();
    } else {
      invariant(
        environment === this._environment,
        '%s: Subscription instance cannot be used in different Relay environments.',
        this.constructor.name
      );
    }
  }

  /**
   * Each subscription corresponds to a field on the server which is used by clients
   * to communicate the type of subscription to be executed.
   */
  getSubscription(): RelayConcreteNode {
    invariant(
      false,
      '%s: Expected abstract method `getSubscription` to be implemented.',
      this.constructor.name
    );
  }


  /**
   * These configurations are used to generate the query for the subscription to be
   * sent to the server and to correctly write the server's response into the
   * client store.
   *
   * Possible configuration types:
   *
   * -  FIELDS_CHANGE provides configuration for subscription fields.
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
   *    fields) to the subscription query. Any data fetched for these children is
   *    not written to the client store, but you can add code to process it
   *    in the `onSuccess` callback passed to the `RelayEnvironment` `applyUpdate`
   *    method. You may need to use this, for example, to fetch fields on a new
   *    object created by the subscription (and which Relay would normally not
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
   * These variables form the "input" to the subscription query sent to the server.
   */
  getVariables(): {[name: string]: mixed} {
    invariant(
      false,
      '%s: Expected abstract method `getVariables` to be implemented.',
      this.constructor.name
    );
  }

  /**
   * An optional collision key allows a subscription to identify itself with other
   * subscriptions that affect the same fields. Subscriptions with the same collision
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
        'RelaySubscription: Expected data for fragment `%s` to be supplied to ' +
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
          'RelaySubscription: Expected data for fragment `%s` supplied to `%s` ' +
          'to be an object.',
          fragmentName,
          this.constructor.name
        );
        return;
      }

      const fragment = RelayQuery.Fragment.create(
        buildSubscriptionFragment(
          this.constructor.name,
          fragmentName,
          fragmentBuilder,
          initialVariables
        ),
        RelayMetaRoute.get(`$RelaySubscription_${this.constructor.name}`),
        initialVariables
      );

      if (fragment.isPlural()) {
        invariant(
          Array.isArray(propValue),
          'RelaySubscription: Invalid prop `%s` supplied to `%s`, expected an ' +
          'array of records because the corresponding fragment is plural.',
          fragmentName,
          this.constructor.name
        );
        const dataIDs = propValue.map((item, ii) => {
          invariant(
            typeof item === 'object' && item != null,
            'RelaySubscription: Invalid prop `%s` supplied to `%s`, ' +
            'expected element at index %s to have query data.',
            fragmentName,
            this.constructor.name,
            ii
          );
          if (__DEV__) {
            const hasFragmentData =
              RelayFragmentPointer.hasFragment(item, fragment);
            if (!hasFragmentData && !this._didShowFakeDataWarning) {
              this._didShowFakeDataWarning = true;
              warning(
                false,
                'RelaySubscription: Expected prop `%s` element at index %s ' +
                'supplied to `%s` to be data fetched by Relay. This is ' +
                'likely an error unless you are purposely passing in mock ' +
                'data that conforms to the shape of this mutation\'s fragment.',
                fragmentName,
                ii,
                this.constructor.name
              );
            }
          }
          const dataID = RelayRecord.getDataIDForObject(item);
          invariant(
            dataID,
            'RelaySubscription: Invalid prop `%s` supplied to `%s`, ' +
            'expected element at index %s to have query data.',
            fragmentName,
            this.constructor.name,
            ii
          );
          return dataID;
        });

        resolvedProps[fragmentName] = dataIDs.map(
          dataID => this._environment.read(fragment, dataID)
        );
      } else {
        invariant(
          !Array.isArray(propValue),
          'RelaySubscription: Invalid prop `%s` supplied to `%s`, expected a ' +
          'single record because the corresponding fragment is not plural.',
          fragmentName,
          this.constructor.name
        );
        if (__DEV__) {
          const hasFragmentData =
            RelayFragmentPointer.hasFragment(propValue, fragment);
          if (!hasFragmentData && !this._didShowFakeDataWarning) {
            this._didShowFakeDataWarning = true;
            warning(
              false,
              'RelaySubscription: Expected prop `%s` supplied to `%s` to ' +
              'be data fetched by Relay. This is likely an error unless ' +
              'you are purposely passing in mock data that conforms to ' +
              'the shape of this mutation\'s fragment.',
              fragmentName,
              this.constructor.name
            );
          }
        }
        const dataID = RelayRecord.getDataIDForObject(propValue);
        if (dataID) {
          resolvedProps[fragmentName] = this._environment.read(
            fragment,
            dataID
          );
        }
      }
    });
    this.props = resolvedProps;

    if (!this._didValidateConfig) {
      this.getConfigs().forEach(
        config => validateMutationConfig(config, this.constructor.name)
      );
      this._didValidateConfig = true;
    }
  }

  static getFragment(
    fragmentName: $Keys<Tp>,
    variableMapping?: Variables
  ): RelayFragmentReference {
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
      () => buildSubscriptionFragment(
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
function buildSubscriptionFragment(
  subscriptionName: string,
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
    'Relay.QL defined on subscription `%s` named `%s` is not a valid fragment. ' +
    'A typical fragment is defined using: Relay.QL`fragment on Type {...}`',
    subscriptionName,
    fragmentName
  );
  return fragment;
}

module.exports = RelaySubscription;

/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayMutationQuery
 * @typechecks
 * @flow
 */

'use strict';

import type GraphQL from 'GraphQL';
var GraphQLStoreDataHandler = require('GraphQLStoreDataHandler');
var RelayConnectionInterface = require('RelayConnectionInterface');
import type {DataID, RangeBehaviors} from 'RelayInternalTypes';
var RelayMetaRoute = require('RelayMetaRoute');
var RelayMutationType = require('RelayMutationType');
var RelayNodeInterface = require('RelayNodeInterface');
var RelayQuery = require('RelayQuery');
import type RelayQueryTracker from 'RelayQueryTracker';
var RelayStoreData = require('RelayStoreData');
import type {Variables} from 'RelayTypes';

var flattenRelayQuery = require('flattenRelayQuery');
var forEachObject = require('forEachObject');
var nullthrows = require('nullthrows');
var inferRelayFieldsFromData = require('inferRelayFieldsFromData');
var intersectRelayQuery = require('intersectRelayQuery');
var invariant = require('invariant');
var refragmentRelayQuery = require('refragmentRelayQuery');

type BasicMutationFragmentBuilderConfig = {
  fatQuery: RelayQuery.Fragment;
  tracker?: RelayQueryTracker;
};
type FieldsMutationFragmentBuilderConfig =
  BasicMutationFragmentBuilderConfig & {
    fieldIDs: {[fieldName: string]: DataID | Array<DataID>};
  };
type EdgeDeletionMutationFragmentBuilderConfig =
  BasicMutationFragmentBuilderConfig & {
    connectionName: string;
    parentID: DataID;
    parentName: string;
  };
type EdgeInsertionMutationFragmentBuilderConfig =
  BasicMutationFragmentBuilderConfig & {
    connectionName: string;
    parentID: DataID;
    edgeName: string;
    parentName?: string;
    rangeBehaviors: RangeBehaviors;
  };
type OptimisticUpdateFragmentBuilderConfig =
  BasicMutationFragmentBuilderConfig & {
    response: Object;
  };
type OptimisticUpdateQueryBuilderConfig =
  BasicMutationFragmentBuilderConfig & {
    mutation: GraphQL.Mutation;
    response: Object;
  };

var {CLIENT_MUTATION_ID} = RelayConnectionInterface;

/**
 * @internal
 *
 * Constructs query fragments that are sent with mutations, which should ensure
 * that any records changed as a result of mutations are brought up-to-date.
 *
 * The fragments are a minimal subset created by intersecting the "fat query"
 * (fields that a mutation declares may have changed) with the "tracked query"
 * (fields representing data previously queried and written into the store).
 */
var RelayMutationQuery = {
  /**
   * Accepts a mapping from field names to data IDs. The field names must exist
   * as top-level fields in the fat query. These top-level fields are used to
   * re-fetch any data that has changed for records identified by the data IDs.
   *
   * The supplied mapping may contain multiple field names. In addition, each
   * field name may map to an array of data IDs if the field is plural.
   */
  buildFragmentForFields(
    {
      tracker,
      fatQuery,
      fieldIDs,
    }: FieldsMutationFragmentBuilderConfig
  ): ?RelayQuery.Node {
    var queryTracker: RelayQueryTracker =
      tracker || RelayStoreData.getDefaultInstance().getQueryTracker();
    var mutatedFields = [];
    forEachObject(fieldIDs, (dataIDOrIDs, fieldName) => {
      var fatField = getFieldFromFatQuery(fatQuery, fieldName);
      var dataIDs = [].concat(dataIDOrIDs);
      var trackedChildren = [];
      dataIDs.forEach(dataID => {
        trackedChildren.push(...queryTracker.getTrackedChildrenForID(dataID));
      });
      var trackedField = fatField.clone(trackedChildren);
      if (trackedField) {
        var mutationField = intersectRelayQuery(trackedField, fatField);
        if (mutationField) {
          mutatedFields.push(mutationField);
        }
      }
    });
    return buildMutationFragment(fatQuery, mutatedFields);
  },

  /**
   * Creates a fragment used to update any data as a result of a mutation that
   * deletes an edge from a connection. The primary difference between this and
   * `createForFields` is whether or not the connection edges are re-fetched.
   *
   * `connectionName`
   *   Name of the connection field from which the edge is being deleted.
   *
   * `parentID`
   *   ID of the parent record containing the connection which may have metadata
   *   that needs to be re-fetched.
   *
   * `parentName`
   *   Name of the top-level field in the fat query that corresponds to the
   *   parent record.
   */
  buildFragmentForEdgeDeletion(
    {
      tracker,
      fatQuery,
      connectionName,
      parentID,
      parentName,
    }: EdgeDeletionMutationFragmentBuilderConfig
  ): ?RelayQuery.Node {
    tracker = tracker || RelayStoreData.getDefaultInstance().getQueryTracker();
    var fatParent = getFieldFromFatQuery(fatQuery, parentName);
    var mutatedFields = [];
    var trackedParent = fatParent.clone(
      tracker.getTrackedChildrenForID(parentID)
    );
    if (trackedParent) {
      var filterUnterminatedRange = node => (
        node.getSchemaName() === connectionName
      );
      var mutatedField = intersectRelayQuery(
        trackedParent,
        fatParent,
        filterUnterminatedRange
      );
      if (mutatedField) {
        mutatedFields.push(mutatedField);
      }
    }
    return buildMutationFragment(fatQuery, mutatedFields);
  },

  /**
   * Creates a fragment used to fetch data necessary to insert a new edge into
   * an existing connection.
   *
   * `connectionName`
   *   Name of the connection field into which the edge is being inserted.
   *
   * `parentID`
   *   ID of the parent record containing the connection which may have metadata
   *   that needs to be re-fetched.
   *
   * `edgeName`
   *   Name of the top-level field in the fat query that corresponds to the
   *   newly inserted edge.
   *
   * `parentName`
   *   Name of the top-level field in the fat query that corresponds to the
   *   parent record. If not supplied, metadata on the parent record and any
   *   connections without entries in `rangeBehaviors` will not be updated.
   */
  buildFragmentForEdgeInsertion(
    {
      tracker,
      fatQuery,
      connectionName,
      parentID,
      edgeName,
      parentName,
      rangeBehaviors,
    }: EdgeInsertionMutationFragmentBuilderConfig
  ): ?RelayQuery.Node {
    tracker = tracker || RelayStoreData.getDefaultInstance().getQueryTracker();
    var trackedChildren = tracker.getTrackedChildrenForID(parentID);

    var mutatedFields = [];
    var trackedConnections: Array<RelayQuery.Field> =
      (trackedChildren.filter(trackedChild => {
        return (
          trackedChild instanceof RelayQuery.Field &&
          trackedChild.getSchemaName() === connectionName
        );
      }): any); // $FlowIssue

    if (trackedConnections.length) {
      var keysWithoutRangeBehavior: {[serializationKey: string]: boolean} = {};
      var mutatedEdgeFields = [];
      trackedConnections.forEach(trackedConnection => {
        var trackedEdge = trackedConnection.getFieldByStorageKey('edges');
        if (trackedEdge == null) {
          return;
        }
        if (getRangeBehaviorKey(trackedConnection) in rangeBehaviors) {
          // Include edges from all connections that exist in `rangeBehaviors`.
          // This may add duplicates, but they will eventually be flattened.
          mutatedEdgeFields.push(...trackedEdge.getChildren());
        } else {
          // If the connection is not in `rangeBehaviors`, re-fetch it.
          var key = trackedConnection.getSerializationKey();
          keysWithoutRangeBehavior[key] = true;
        }
      });
      if (mutatedEdgeFields.length) {
        mutatedFields.push(
          buildEdgeField(parentID, edgeName, mutatedEdgeFields)
        );
      }

      // TODO: Do this even if there are no tracked connections.
      if (parentName != null) {
        var fatParent = getFieldFromFatQuery(fatQuery, parentName);
        var trackedParent = fatParent.clone(trackedChildren);
        if (trackedParent) {
          var filterUnterminatedRange = node => (
            !keysWithoutRangeBehavior.hasOwnProperty(node.getSerializationKey())
          );
          var mutatedParent = intersectRelayQuery(
            trackedParent,
            fatParent,
            filterUnterminatedRange
          );
          if (mutatedParent) {
            mutatedFields.push(mutatedParent);
          }
        }
      }
    }
    return buildMutationFragment(fatQuery, mutatedFields);
  },

  /**
   * Creates a fragment used to fetch the given optimistic response.
   */
  buildFragmentForOptimisticUpdate(
    {response, fatQuery}: OptimisticUpdateFragmentBuilderConfig
  ): ?RelayQuery.Node {
    // Silences RelayQueryNode being incompatible with sub-class RelayQueryField
    // A detailed error description is available in #7635477
    var mutatedFields = (inferRelayFieldsFromData(response): $FlowIssue);
    return buildMutationFragment(fatQuery, mutatedFields);
  },

  /**
   * Creates a RelayQuery.Mutation used to fetch the given optimistic response.
   */
  buildQueryForOptimisticUpdate(
    {response, fatQuery, mutation}: OptimisticUpdateQueryBuilderConfig
  ): RelayQuery.Mutation {
    var children = [
      nullthrows(RelayMutationQuery.buildFragmentForOptimisticUpdate({
        response,
        fatQuery,
      })),
    ];
    return RelayQuery.Mutation.build(
      'OptimisticQuery',
      fatQuery.getType(),
      mutation.calls[0].name,
      null,
      children,
      mutation.metadata
    );
  },

  /**
   * Creates a RelayQuery.Mutation for the given config. See type
   * `MutationConfig` and the `buildFragmentForEdgeInsertion`,
   * `buildFragmentForEdgeDeletion` and `buildFragmentForFields` methods above
   * for possible configs.
   */
  buildQuery(
    {
      configs,
      fatQuery,
      mutationName,
      mutation,
      tracker,
      input,
    }: {
      /* Previously each element of configs had the type mixed, which meant
       * that they couldn't be used in configs.forEach without being
       * inspected at runtime. I think this is probably a good use case for
       * disjoin unions (flowtype.org/blog/2015/07/03/Disjoint-Unions.html)
       */
      configs: Array<{[key: string]: $FlowFixMe}>;
      fatQuery: RelayQuery.Fragment;
      input: Variables,
      mutationName: string;
      mutation: GraphQL.Mutation;
      tracker?: RelayQueryTracker;
    }
  ): RelayQuery.Mutation {
    tracker = tracker || RelayStoreData.getDefaultInstance().getQueryTracker();

    var children = [
      RelayQuery.Field.build(
        CLIENT_MUTATION_ID,
        null,
        null,
        {'requisite':true}
      )
    ];

    configs.forEach(config => {
      switch (config.type) {
        case RelayMutationType.REQUIRED_CHILDREN:
          children = children.concat(config.children.map(child =>
             RelayQuery.Fragment.create(
              child,
              RelayMetaRoute.get('$buildQuery'),
              {}
            )
          ));
          break;

        case RelayMutationType.RANGE_ADD:
          children.push(RelayMutationQuery.buildFragmentForEdgeInsertion({
            connectionName: config.connectionName,
            edgeName: config.edgeName,
            fatQuery,
            parentID: config.parentID,
            parentName: config.parentName,
            rangeBehaviors: config.rangeBehaviors,
            tracker,
          }));
          break;

        case RelayMutationType.RANGE_DELETE:
        case RelayMutationType.NODE_DELETE:
          children.push(RelayMutationQuery.buildFragmentForEdgeDeletion({
            connectionName: config.connectionName,
            fatQuery,
            parentID: config.parentID,
            parentName: config.parentName,
            tracker,
          }));
          children.push(RelayQuery.Field.build(config.deletedIDFieldName));
          break;

        case RelayMutationType.FIELDS_CHANGE:
          children.push(RelayMutationQuery.buildFragmentForFields({
            fatQuery,
            fieldIDs: config.fieldIDs,
            tracker,
          }));
          break;
      }
    });

    // create a dummy field to re-fragment the input `fields`
    var fragmentedFields = children.length ?
      refragmentRelayQuery(RelayQuery.Field.build(
        'build_mutation_field',
        null,
        children
      )) :
      null;

    return RelayQuery.Mutation.build(
      mutationName,
      fatQuery.getType(),
      mutation.calls[0].name,
      input,
      fragmentedFields ? fragmentedFields.getChildren() : null,
      mutation.metadata
    );
  }
};

function getFieldFromFatQuery(
  fatQuery: RelayQuery.Node,
  fieldName: string
): RelayQuery.Field {
  var field = fatQuery.getFieldByStorageKey(fieldName);
  invariant(
    field,
    'RelayMutationQuery: Invalid field name on fat query, `%s`.',
    fieldName
  );
  return field;
}

function buildMutationFragment(
  fatQuery: RelayQuery.Fragment,
  fields: Array<RelayQuery.Node>
): ?RelayQuery.Fragment {
  var fragment = RelayQuery.Fragment.build(
    'MutationQuery',
    fatQuery.getType(),
    fields
  );
  if (fragment) {
    invariant(
      fragment instanceof RelayQuery.Fragment,
      'RelayMutationQuery: Expected a fragment.'
    );
    return fragment;
  }
  return null;
}

function buildEdgeField(
  parentID: DataID,
  edgeName: string,
  edgeFields: Array<RelayQuery.Node>
): RelayQuery.Field {
  var fields = [
    RelayQuery.Field.build('cursor'),
  ];
  if (RelayConnectionInterface.EDGES_HAVE_SOURCE_FIELD &&
      !GraphQLStoreDataHandler.isClientID(parentID)) {
    fields.push(
      RelayQuery.Field.build(
        'source',
        null,
        [RelayQuery.Field.build('id', null, null, {
          parentType: RelayNodeInterface.NODE_TYPE,
        })]
      )
    );
  }
  fields.push(...edgeFields);
  var edgeField = flattenRelayQuery(RelayQuery.Field.build(
    edgeName,
    null,
    fields
  ));
  invariant(
    edgeField instanceof RelayQuery.Field,
    'RelayMutationQuery: Expected a field.'
  );
  return edgeField;
}

function getRangeBehaviorKey(connectionField: RelayQuery.Field): string {
  // TODO: Replace `rangeBehavior` keys with `getStorageKey()`.
  return connectionField.getStorageKey().substr(
    connectionField.getSchemaName().length + 1
  );
}

module.exports = RelayMutationQuery;

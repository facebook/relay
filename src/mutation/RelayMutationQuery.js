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

import type {ConcreteMutation} from 'ConcreteQuery';
const GraphQLStoreDataHandler = require('GraphQLStoreDataHandler');
const RelayConnectionInterface = require('RelayConnectionInterface');
import type {DataID, RangeBehaviors} from 'RelayInternalTypes';
const RelayMetaRoute = require('RelayMetaRoute');
const RelayMutationType = require('RelayMutationType');
const RelayNodeInterface = require('RelayNodeInterface');
const RelayQuery = require('RelayQuery');
import type RelayQueryTracker from 'RelayQueryTracker';
import type {Variables} from 'RelayTypes';

const flattenRelayQuery = require('flattenRelayQuery');
const forEachObject = require('forEachObject');
const nullthrows = require('nullthrows');
const inferRelayFieldsFromData = require('inferRelayFieldsFromData');
const intersectRelayQuery = require('intersectRelayQuery');
const invariant = require('invariant');

type BasicMutationFragmentBuilderConfig = {
  fatQuery: RelayQuery.Fragment;
  tracker: RelayQueryTracker;
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
    mutation: ConcreteMutation;
    response: Object;
  };

var {CLIENT_MUTATION_ID} = RelayConnectionInterface;
var {ANY_TYPE, ID, TYPENAME} = RelayNodeInterface;

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
      fatQuery,
      fieldIDs,
      tracker,
    }: FieldsMutationFragmentBuilderConfig
  ): ?RelayQuery.Node {
    var mutatedFields = [];
    forEachObject(fieldIDs, (dataIDOrIDs, fieldName) => {
      var fatField = getFieldFromFatQuery(fatQuery, fieldName);
      var dataIDs = [].concat(dataIDOrIDs);
      var trackedChildren = [];
      dataIDs.forEach(dataID => {
        trackedChildren.push(...tracker.getTrackedChildrenForID(dataID));
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
      fatQuery,
      connectionName,
      parentID,
      parentName,
      tracker,
    }: EdgeDeletionMutationFragmentBuilderConfig
  ): ?RelayQuery.Node {
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
      fatQuery,
      connectionName,
      parentID,
      edgeName,
      parentName,
      rangeBehaviors,
      tracker,
    }: EdgeInsertionMutationFragmentBuilderConfig
  ): ?RelayQuery.Node {
    var trackedChildren = tracker.getTrackedChildrenForID(parentID);

    var mutatedFields = [];
    var trackedConnections = [];
    trackedChildren.forEach(trackedChild => {
      trackedConnections.push(
        ...findDescendantFields(trackedChild, connectionName)
      );
    });

    if (trackedConnections.length) {
      var keysWithoutRangeBehavior: {[hash: string]: boolean} = {};
      var mutatedEdgeFields = [];
      trackedConnections.forEach(trackedConnection => {
        var trackedEdges = findDescendantFields(trackedConnection, 'edges');
        if (!trackedEdges.length) {
          return;
        }
        if (trackedConnection.getRangeBehaviorKey() in rangeBehaviors) {
          // Include edges from all connections that exist in `rangeBehaviors`.
          // This may add duplicates, but they will eventually be flattened.
          trackedEdges.forEach(trackedEdge => {
            mutatedEdgeFields.push(...trackedEdge.getChildren());
          });
        } else {
          // If the connection is not in `rangeBehaviors`, re-fetch it.
          keysWithoutRangeBehavior[trackedConnection.getShallowHash()] = true;
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
            !keysWithoutRangeBehavior.hasOwnProperty(node.getShallowHash())
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
    {
      fatQuery,
      mutation,
      response,
      tracker,
    }: OptimisticUpdateQueryBuilderConfig
  ): RelayQuery.Mutation {
    var children = [
      nullthrows(RelayMutationQuery.buildFragmentForOptimisticUpdate({
        response,
        fatQuery,
        tracker,
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
      input,
      mutationName,
      mutation,
      tracker,
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
      mutation: ConcreteMutation;
      tracker: RelayQueryTracker;
    }
  ): RelayQuery.Mutation {
    var children: Array<?RelayQuery.Node> = [
      RelayQuery.Field.build({
        fieldName: CLIENT_MUTATION_ID,
        type: 'String',
        metadata: {isRequisite:true},
      }),
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
            rangeBehaviors: sanitizeRangeBehaviors(config.rangeBehaviors),
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
          children.push(RelayQuery.Field.build({
            fieldName: config.deletedIDFieldName,
            type: 'String',
          }));
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

    return RelayQuery.Mutation.build(
      mutationName,
      fatQuery.getType(),
      mutation.calls[0].name,
      input,
      (children.filter(child => child != null): any),
      mutation.metadata
    );
  },
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
    RelayQuery.Field.build({
      fieldName: 'cursor',
      type: 'String',
    }),
    RelayQuery.Field.build({
      fieldName: TYPENAME,
      type: 'String',
    }),
  ];
  if (RelayConnectionInterface.EDGES_HAVE_SOURCE_FIELD &&
      !GraphQLStoreDataHandler.isClientID(parentID)) {
    fields.push(
      RelayQuery.Field.build({
        fieldName: 'source',
        type: ANY_TYPE,
        children: [
          RelayQuery.Field.build({
            fieldName: ID,
            type: 'String',
          }),
          RelayQuery.Field.build({
            fieldName: TYPENAME,
            type: 'String',
          }),
        ],
      })
    );
  }
  fields.push(...edgeFields);
  var edgeField = flattenRelayQuery(RelayQuery.Field.build({
    fieldName: edgeName,
    type: ANY_TYPE,
    children: fields,
  }));
  invariant(
    edgeField instanceof RelayQuery.Field,
    'RelayMutationQuery: Expected a field.'
  );
  return edgeField;
}

function sanitizeRangeBehaviors(
  rangeBehaviors: RangeBehaviors
): RangeBehaviors {
  // Prior to 0.4.1 you would have to specify the args in your range behaviors
  // in the same order they appeared in your query. From 0.4.1 onward, args in a
  // range behavior key must be in alphabetical order.
  let unsortedKeys;
  forEachObject(rangeBehaviors, (value, key) => {
    if (key !== '') {
      const keyParts = key
        // Remove the last parenthesis
        .slice(0, -1)
        // Slice on unescaped parentheses followed immediately by a `.`
        .split(/\)\./);
      const sortedKey = keyParts
        .sort()
        .join(').') +
        (keyParts.length ? ')' : '');
      if (sortedKey !== key) {
        unsortedKeys = unsortedKeys || [];
        unsortedKeys.push(key);
      }
    }
  });
  if (unsortedKeys) {
    invariant(
      false,
      'RelayMutation: To define a range behavior key without sorting ' +
      'the arguments alphabetically is disallowed as of Relay 0.5.1. Please ' +
      'sort the argument names of the range behavior key%s `%s`%s.',
      unsortedKeys.length === 1 ? '' : 's',
      unsortedKeys.length === 1 ?
        unsortedKeys[0] :
        unsortedKeys.length === 2 ?
          `${unsortedKeys[0]}\` and \`${unsortedKeys[1]}` :
          unsortedKeys.slice(0, -1).join('`, `'),
      unsortedKeys.length > 2 ? `, and \`${unsortedKeys.slice(-1)}\`` : ''
    );
  }
  return rangeBehaviors;
}

/**
 * Finds all direct and indirect child fields of `node` with the given
 * field name.
 */
function findDescendantFields(
  rootNode: RelayQuery.Node,
  fieldName: string
): Array<RelayQuery.Field> {
  var fields = [];
  function traverse(node) {
    if (node instanceof RelayQuery.Field) {
      if (node.getSchemaName() === fieldName) {
        fields.push(node);
        return;
      }
    }
    if (
      node === rootNode ||
      node instanceof RelayQuery.Fragment
    ) {
      // Search fragments and the root node for matching fields, but skip
      // descendant non-matching fields.
      node.getChildren().forEach(child => traverse(child));
    }
  }
  traverse(rootNode);
  return fields;
}

module.exports = RelayMutationQuery;

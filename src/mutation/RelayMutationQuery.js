/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayMutationQuery
 * @flow
 */

'use strict';

import type {ConcreteMutation} from 'ConcreteQuery';
const RelayConnectionInterface = require('RelayConnectionInterface');
import type {DataID, RangeBehaviors} from 'RelayInternalTypes';
const RelayMetaRoute = require('RelayMetaRoute');
const RelayMutationType = require('RelayMutationType');
const RelayNodeInterface = require('RelayNodeInterface');
const RelayOptimisticMutationUtils = require('RelayOptimisticMutationUtils');
const RelayQuery = require('RelayQuery');
import type RelayQueryTracker from 'RelayQueryTracker';
const RelayRecord = require('RelayRecord');
import type {Variables} from 'RelayTypes';
const {REFETCH} = require('GraphQLMutatorConstants');

const flattenRelayQuery = require('flattenRelayQuery');
const forEachObject = require('forEachObject');
const getRangeBehavior = require('getRangeBehavior');
const nullthrows = require('nullthrows');
const intersectRelayQuery = require('intersectRelayQuery');
const invariant = require('invariant');
const warning = require('warning');

// This should probably use disjoint unions.
type MutationConfig = {[key: string]: $FlowFixMe};

type BasicMutationFragmentBuilderConfig = {
  fatQuery: RelayQuery.Fragment,
  tracker: RelayQueryTracker,
};
type FieldsMutationFragmentBuilderConfig =
  BasicMutationFragmentBuilderConfig & {
    fieldIDs: {[fieldName: string]: DataID | Array<DataID>},
  };
type EdgeDeletionMutationFragmentBuilderConfig =
  BasicMutationFragmentBuilderConfig & {
    connectionName: string,
    parentID: DataID,
    parentName: string,
  };
type EdgeInsertionMutationFragmentBuilderConfig =
  BasicMutationFragmentBuilderConfig & {
    connectionName: string,
    parentID: DataID,
    edgeName: string,
    parentName?: string,
    rangeBehaviors: RangeBehaviors,
  };

type BasicOptimisticMutationFragmentBuilderConfig = {
  fatQuery: RelayQuery.Fragment,
};

type OptimisticUpdateFragmentBuilderConfig =
  BasicOptimisticMutationFragmentBuilderConfig & {
    response: Object,
  };
type OptimisticUpdateQueryBuilderConfig =
  BasicOptimisticMutationFragmentBuilderConfig & {
    mutation: ConcreteMutation,
    response: Object,
  };

const {CLIENT_MUTATION_ID} = RelayConnectionInterface;
const {ANY_TYPE, ID, TYPENAME} = RelayNodeInterface;

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
const RelayMutationQuery = {
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
  ): RelayQuery.Fragment {
    const mutatedFields = [];
    forEachObject(fieldIDs, (dataIDOrIDs, fieldName) => {
      const fatField = getFieldFromFatQuery(fatQuery, fieldName);
      const dataIDs = [].concat(dataIDOrIDs);
      const trackedChildren = [];
      dataIDs.forEach(dataID => {
        trackedChildren.push(...tracker.getTrackedChildrenForID(dataID));
      });
      const trackedField = fatField.clone(trackedChildren);
      let mutationField = null;
      if (trackedField) {
        mutationField = intersectRelayQuery(trackedField, fatField);
        if (mutationField) {
          mutatedFields.push(mutationField);
        }
      }
      /* eslint-disable no-console */
      if (__DEV__ && console.groupCollapsed && console.groupEnd) {
        console.groupCollapsed('Building fragment for `' + fieldName + '`');
        console.log(RelayNodeInterface.ID + ': ', dataIDOrIDs);

        const RelayMutationDebugPrinter = require('RelayMutationDebugPrinter');
        RelayMutationDebugPrinter.printMutation(
          trackedField && buildMutationFragment(fatQuery, [trackedField]),
          'Tracked Fragment',
        );
        RelayMutationDebugPrinter.printMutation(
          buildMutationFragment(fatQuery, [fatField]),
          'Fat Fragment',
        );
        RelayMutationDebugPrinter.printMutation(
          mutationField && buildMutationFragment(fatQuery, [mutationField]),
          'Intersected Fragment',
        );
        console.groupEnd();
      }
      /* eslint-enable no-console */
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
  ): RelayQuery.Fragment {
    const fatParent = getFieldFromFatQuery(fatQuery, parentName);

    // The connection may not be explicit in the fat query, but if it is, we
    // try to validate it.
    getConnectionAndValidate(fatParent, parentName, connectionName);

    const mutatedFields = [];
    const trackedParent = fatParent.clone(
      tracker.getTrackedChildrenForID(parentID)
    );
    if (trackedParent) {
      const filterUnterminatedRange = node => (
        node.getSchemaName() === connectionName
      );
      const mutatedField = intersectRelayQuery(
        trackedParent,
        fatParent,
        filterUnterminatedRange
      );
      if (mutatedField) {
        // If we skipped validation above, we get a second chance here.
        getConnectionAndValidate(mutatedField, parentName, connectionName);

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
  ): RelayQuery.Fragment {
    const mutatedFields = [];
    const keysWithoutRangeBehavior: {[hash: string]: boolean} = {};
    const trackedChildren = tracker.getTrackedChildrenForID(parentID);
    const trackedConnections = [];
    trackedChildren.forEach(trackedChild => {
      trackedConnections.push(
        ...findDescendantFields(trackedChild, connectionName)
      );
    });

    if (trackedConnections.length) {
      // If the first instance of the connection passes validation, all will.
      validateConnection(parentName, connectionName, trackedConnections[0]);

      const mutatedEdgeFields = [];
      trackedConnections.forEach(trackedConnection => {
        const trackedEdges = findDescendantFields(trackedConnection, 'edges');
        if (!trackedEdges.length) {
          return;
        }

        const callsWithValues = trackedConnection.getRangeBehaviorCalls();
        const rangeBehavior =
          getRangeBehavior(rangeBehaviors, callsWithValues);
        /* eslint-disable no-console */
        if (__DEV__ && console.groupCollapsed && console.groupEnd) {
          const serializeRelayQueryCall = require('serializeRelayQueryCall');
          const serializedCalls =
            callsWithValues.map(serializeRelayQueryCall).sort().join('');
          console.log(serializedCalls + ': ' + (rangeBehavior || ''));
        }
        /* eslint-enable no-console */
        if (rangeBehavior && rangeBehavior !== REFETCH) {
          // Include edges from all connections that exist in `rangeBehaviors`.
          // This may add duplicates, but they will eventually be flattened.
          trackedEdges.forEach(trackedEdge => {
            mutatedEdgeFields.push(...trackedEdge.getChildren());
          });
        } else {
          // If the connection is not in `rangeBehaviors` or we have explicitly
          // set the behavior to `refetch`, re-fetch it.
          warning(
            rangeBehavior === REFETCH,
            'RelayMutation: The connection `%s` on the mutation field `%s` ' +
            'that corresponds to the ID `%s` did not match any of the ' +
            '`rangeBehaviors` specified in your RANGE_ADD config. This means ' +
            'that the entire connection will be refetched. Configure a range ' +
            'behavior for this mutation in order to fetch only the new edge ' +
            'and to enable optimistic mutations or use `refetch` to squelch ' +
            'this warning.',
            trackedConnection.getStorageKey(),
            parentName,
            parentID
          );
          keysWithoutRangeBehavior[trackedConnection.getShallowHash()] = true;
        }
      });
      if (mutatedEdgeFields.length) {
        mutatedFields.push(
          buildEdgeField(parentID, edgeName, mutatedEdgeFields)
        );
      }
    }

    if (parentName != null) {
      const fatParent = getFieldFromFatQuery(fatQuery, parentName);

      // The connection may not be explicit in the fat query, but if it is, we
      // try to validate it.
      getConnectionAndValidate(fatParent, parentName, connectionName);

      const trackedParent = fatParent.clone(trackedChildren);
      if (trackedParent) {
        const filterUnterminatedRange = node => (
          node.getSchemaName() === connectionName &&
          !keysWithoutRangeBehavior.hasOwnProperty(node.getShallowHash())
        );
        const mutatedParent = intersectRelayQuery(
          trackedParent,
          fatParent,
          filterUnterminatedRange
        );
        if (mutatedParent) {
          mutatedFields.push(mutatedParent);
        }
      }
    }

    return buildMutationFragment(fatQuery, mutatedFields);
  },

  /*
   * Docs to come
   */
  buildFragmentForElementInsertion(
    {
      fatQuery,
      listName,
      parentID,
      newElementName,
      parentName,
      rangeBehaviors,
      tracker,
    }: EdgeInsertionMutationFragmentBuilderConfig
  ): RelayQuery.Fragment {
    const mutatedFields = [];
    // const keysWithoutRangeBehavior: {[hash: string]: boolean} = {};
    const trackedChildren = tracker.getTrackedChildrenForID(parentID);
    console.log('trackedChildren: ', trackedChildren);
    const trackedLists = [];
    trackedChildren.forEach(trackedChild => {
      trackedLists.push(
        ...findDescendantFields(trackedChild, listName)
      );
    });
    const mutatedListFields = [];
    trackedLists.forEach(trackedList => {
      mutatedListFields.push(...trackedList.getChildren());
    });

    mutatedFields.push(
      buildElementField(parentID, newElementName, mutatedListFields)
    );

    const rangeBehavior = getRangeBehavior(rangeBehaviors, []);
    /* eslint-disable no-console */
    if (__DEV__ && console.groupCollapsed && console.groupEnd) {
      console.log('Applying rangeBehavior:', rangeBehavior || 'None');
    }
    /* eslint-enable no-console */

    // trackedChildren.forEach(trackedChild => {
    //   trackedConnections.push(
    //     ...findDescendantFields(trackedChild, connectionName)
    //   );
    // });

    // const rangeBehavior =
    //   getRangeBehavior(rangeBehaviors, []);
    // /* eslint-disable no-console */
    // if (__DEV__ && console.groupCollapsed && console.groupEnd) {
    //   console.log('Applying rangeBehavior:', rangeBehavior || 'None');
    // }
    // /* eslint-enable no-console */
    // if (rangeBehavior && rangeBehavior !== REFETCH) {
    //   // Include edges from all connections that exist in `rangeBehaviors`.
    //   // This may add duplicates, but they will eventually be flattened.
    //   trackedEdges.forEach(trackedEdge => {
    //     mutatedEdgeFields.push(...trackedEdge.getChildren());
    //   });
    // } else {
    //   // If the connection is not in `rangeBehaviors` or we have explicitly
    //   // set the behavior to `refetch`, re-fetch it.
    //   warning(
    //     rangeBehavior === REFETCH,
    //     'RelayMutation: The connection `%s` on the mutation field `%s` ' +
    //     'that corresponds to the ID `%s` did not match any of the ' +
    //     '`rangeBehaviors` specified in your RANGE_ADD config. This means ' +
    //     'that the entire connection will be refetched. Configure a range ' +
    //     'behavior for this mutation in order to fetch only the new edge ' +
    //     'and to enable optimistic mutations or use `refetch` to squelch ' +
    //     'this warning.',
    //     trackedConnection.getStorageKey(),
    //     parentName,
    //     parentID
    //   );
    //   keysWithoutRangeBehavior[trackedConnection.getShallowHash()] = true;
    // }

    // TODO(Markus): delete
    // if (trackedConnections.length) {
    //   // If the first instance of the connection passes validation, all will.
    //   validateConnection(parentName, connectionName, trackedConnections[0]);
    //
    //   const mutatedEdgeFields = [];
    //   trackedConnections.forEach(trackedConnection => {
    //
    //   });
    //   if (mutatedEdgeFields.length) {
    //     mutatedFields.push(
    //       buildEdgeField(parentID, edgeName, mutatedEdgeFields)
    //     );
    //   }
    // }
    console.log('parentName', parentName);
    if (parentName != null) {
      const fatParent = getFieldFromFatQuery(fatQuery, parentName);

      // The connection may not be explicit in the fat query, but if it is, we
      // try to validate it.
      // getConnectionAndValidate(fatParent, parentName, connectionName);

      const trackedParent = fatParent.clone(trackedChildren);
      if (trackedParent) {
        // const filterUnterminatedRange = node => (
        //   node.getSchemaName() === connectionName &&
        //   !keysWithoutRangeBehavior.hasOwnProperty(node.getShallowHash())
        // );
        const mutatedParent = intersectRelayQuery(
          trackedParent,
          fatParent,
          // filterUnterminatedRange
        );
        if (mutatedParent) {
          mutatedFields.push(mutatedParent);
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
  ): RelayQuery.Fragment {
    // Silences RelayQueryNode being incompatible with sub-class RelayQueryField
    // A detailed error description is available in #7635477
    const mutatedFields = (
      RelayOptimisticMutationUtils.inferRelayFieldsFromData(response)
      : $FlowIssue
    );
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
    }: OptimisticUpdateQueryBuilderConfig
  ): RelayQuery.Mutation {
    const children = [
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
      input,
      mutationName,
      mutation,
      tracker,
    }: {
      configs: Array<MutationConfig>,
      fatQuery: RelayQuery.Fragment,
      input: Variables,
      mutationName: string,
      mutation: ConcreteMutation,
      tracker: RelayQueryTracker,
    }
  ): RelayQuery.Mutation {
    let children: Array<?RelayQuery.Node> = [
      RelayQuery.Field.build({
        fieldName: CLIENT_MUTATION_ID,
        type: 'String',
        metadata: {isRequisite:true},
      }),
    ];
    /* eslint-disable no-console */
    if (__DEV__ && console.groupCollapsed && console.groupEnd) {
      console.groupCollapsed('Mutation Configs');
    }
    /* eslint-enable no-console */
    configs.forEach(config => {
      switch (config.type) {
        case RelayMutationType.REQUIRED_CHILDREN:
          const newChildren = config.children.map(child =>
             RelayQuery.Fragment.create(
              child,
              RelayMetaRoute.get('$buildQuery'),
              {}
            )
          );
          children = children.concat(newChildren);
          /* eslint-disable no-console */
          if (__DEV__ && console.groupCollapsed && console.groupEnd) {
            const RelayMutationDebugPrinter =
              require('RelayMutationDebugPrinter');
            console.groupCollapsed('REQUIRED_CHILDREN');
            newChildren.forEach((child, index) => {
              console.groupCollapsed(index);
              RelayMutationDebugPrinter.printMutation(child);
              console.groupEnd();
            });
            console.groupEnd();
          }
          /* eslint-enable no-console */
          break;

        case RelayMutationType.RANGE_ADD:
          /* eslint-disable no-console */
          if (__DEV__ && console.groupCollapsed && console.groupEnd) {
            console.groupCollapsed('RANGE_ADD');
          }
          /* eslint-enable no-console */
          const insertionArgs = {
            fatQuery,
            parentID: config.parentID,
            parentName: config.parentName,
            rangeBehaviors: sanitizeRangeBehaviors(config.rangeBehaviors),
            tracker,
          };
          if (config.listName) {
            children.push(RelayMutationQuery.buildFragmentForElementInsertion({
              listName: config.listName,
              newElementName: config.newElementName,
              ...insertionArgs
            }));
          } else {
            children.push(RelayMutationQuery.buildFragmentForEdgeInsertion({
              connectionName: config.connectionName,
              edgeName: config.edgeName,
              ...insertionArgs
            }));
          }
          /* eslint-disable no-console */
          if (__DEV__ && console.groupCollapsed && console.groupEnd) {
            console.groupEnd();
          }
          /* eslint-enable no-console */
          break;

        case RelayMutationType.RANGE_DELETE:
        case RelayMutationType.NODE_DELETE:
          const edgeDeletion = RelayMutationQuery.buildFragmentForEdgeDeletion({
            connectionName: config.connectionName,
            fatQuery,
            parentID: config.parentID,
            parentName: config.parentName,
            tracker,
          });
          children.push(edgeDeletion);
          const deletedIDFieldName = Array.isArray(config.deletedIDFieldName) ?
            config.deletedIDFieldName.concat(ID) :
            [config.deletedIDFieldName];
          const nodeDeletion = buildFragmentForDeletedConnectionNodeID(
            deletedIDFieldName,
            fatQuery
          );
          children.push(nodeDeletion);
          /* eslint-disable no-console */
          if (__DEV__ && console.groupCollapsed && console.groupEnd) {
            const configType = config === RelayMutationType.RANGE_DELETE ?
              'RANGE_DELETE' : 'NODE_DELETE';
            console.groupCollapsed(configType);

            const RelayMutationDebugPrinter =
              require('RelayMutationDebugPrinter');
            RelayMutationDebugPrinter.printMutation(
              edgeDeletion,
              'Edge Fragment'
            );
            RelayMutationDebugPrinter.printMutation(
              nodeDeletion,
              'Node Fragment'
            );

            console.groupEnd();
          }
          /* eslint-enable no-console */
          break;

        case RelayMutationType.FIELDS_CHANGE:
          /* eslint-disable no-console */
          if (__DEV__ && console.groupCollapsed && console.groupEnd) {
            console.groupCollapsed('FIELDS_CHANGE');
          }
          /* eslint-enable no-console */
          children.push(RelayMutationQuery.buildFragmentForFields({
            fatQuery,
            fieldIDs: config.fieldIDs,
            tracker,
          }));
          /* eslint-disable no-console */
          if (__DEV__ && console.groupCollapsed && console.groupEnd) {
            console.groupEnd();
          }
          /* eslint-enable no-console */
          break;

        default:
          invariant(
            false,
            'RelayMutationQuery: Unrecognized config key `%s` for `%s`.',
            config.type,
            mutationName
          );
      }
    });
    /* eslint-disable no-console */
    if (__DEV__ && console.groupCollapsed && console.groupEnd) {
      console.groupEnd();
    }
    /* eslint-enable no-console */
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
  const field = fatQuery.getFieldByStorageKey(fieldName);
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
): RelayQuery.Fragment {
  const fragment = RelayQuery.Fragment.build(
    'MutationQuery',
    fatQuery.getType(),
    fields
  );

  invariant(
    fragment instanceof RelayQuery.Fragment,
    'RelayMutationQuery: Expected a fragment.'
  );
  return fragment;
}

function buildFragmentForDeletedConnectionNodeID(
  fieldNames: Array<string>,
  fatQuery: RelayQuery.Fragment
): RelayQuery.Fragment {
  invariant(
    fieldNames.length > 0,
    'RelayMutationQuery: Invalid deleted node id name.'
  );
  let field = RelayQuery.Field.build({
    fieldName: fieldNames[fieldNames.length - 1],
    type: 'String',
  });
  for (let ii = fieldNames.length - 2; ii >= 0; ii--) {
    field = RelayQuery.Field.build({
      fieldName: fieldNames[ii],
      type: ANY_TYPE,
      children: [field],
      metadata: {
        canHaveSubselections: true,
      },
    });
  }
  return buildMutationFragment(fatQuery, [field]);
}

function buildEdgeField(
  parentID: DataID,
  edgeName: string,
  edgeFields: Array<RelayQuery.Node>
): RelayQuery.Field {
  const fields = [
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
      !RelayRecord.isClientID(parentID)) {
    fields.push(
      RelayQuery.Field.build({
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
        fieldName: 'source',
        metadata: {canHaveSubselections: true},
        type: ANY_TYPE,
      })
    );
  }
  fields.push(...edgeFields);
  const edgeField = flattenRelayQuery(RelayQuery.Field.build({
    children: fields,
    fieldName: edgeName,
    metadata: {canHaveSubselections: true},
    type: ANY_TYPE,
  }));
  invariant(
    edgeField instanceof RelayQuery.Field,
    'RelayMutationQuery: Expected a field.'
  );
  return edgeField;
}

function buildElementField(
  parentID: DataID,
  listName: string,
  mutatedListFields: Array<RelayQuery.Node>
): RelayQuery.Field {
  const fields = [
    RelayQuery.Field.build({
      fieldName: TYPENAME,
      type: 'String',
    }),
  ];
  // if (!RelayRecord.isClientID(parentID)) {
  //   fields.push(
  //     RelayQuery.Field.build({
  //       children: [
  //         RelayQuery.Field.build({
  //           fieldName: ID,
  //           type: 'String',
  //         }),
  //         RelayQuery.Field.build({
  //           fieldName: TYPENAME,
  //           type: 'String',
  //         }),
  //       ],
  //       fieldName: 'source',
  //       metadata: {canHaveSubselections: true},
  //       type: ANY_TYPE,
  //     })
  //   );
  // }
  fields.push(...mutatedListFields);
  const listField = flattenRelayQuery(RelayQuery.Field.build({
    children: fields,
    fieldName: listName,
    metadata: {canHaveSubselections: true},
    type: ANY_TYPE,
  }));
  invariant(
    listField instanceof RelayQuery.Field,
    'RelayMutationQuery: Expected a field.'
  );
  return listField;
}

function sanitizeRangeBehaviors(
  rangeBehaviors: RangeBehaviors
): RangeBehaviors {
  // Prior to 0.4.1 you would have to specify the args in your range behaviors
  // in the same order they appeared in your query. From 0.4.1 onward, args in a
  // range behavior key must be in alphabetical order.

  // No need to sanitize if defined as a function
  if (typeof rangeBehaviors === 'function') {
    return rangeBehaviors;
  }

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
 * Confirms that the `connection` field extracted from the fat query at
 * `parentName` -> `connectionName` is actually a connection.
 */
function validateConnection(
  parentName: ?string,
  connectionName: string,
  connection: RelayQuery.Field,
): void {
  invariant(
    connection.isConnection(),
    'RelayMutationQuery: Expected field `%s`%s to be a connection.',
    connectionName,
    parentName ? ' on `' + parentName + '`' : ''
  );
}

/**
 * Convenience wrapper around validateConnection that gracefully attempts to
 * extract the connection identified by `connectionName` from the `parentField`.
 * If the connection isn't present (because it wasn't in the fat query or
 * because it didn't survive query intersection), validation is skipped.
 */
function getConnectionAndValidate(
  parentField: RelayQuery.Node,
  parentName: string,
  connectionName: string,
): void {
  const connections = findDescendantFields(parentField, connectionName);
  if (connections.length) {
    // If the first instance of the connection passes validation, all will.
    validateConnection(parentName, connectionName, connections[0]);
  }
}

/**
 * Finds all direct and indirect child fields of `node` with the given
 * field name.
 */
function findDescendantFields(
  rootNode: RelayQuery.Node,
  fieldName: string
): Array<RelayQuery.Field> {
  const fields = [];
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

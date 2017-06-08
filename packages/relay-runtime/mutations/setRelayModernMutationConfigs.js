/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule setRelayModernMutationConfigs
 * @flow
 * @format
 */

'use strict';

const RelayConnectionHandler = require('RelayConnectionHandler');

const warning = require('warning');

import type {SelectorData} from 'RelayCombinedEnvironmentTypes';
import type {ConcreteBatch} from 'RelayConcreteNode';
import type {
  RecordSourceSelectorProxy,
  SelectorStoreUpdater,
} from 'RelayStoreTypes';
import type {RelayMutationConfig, Variables} from 'RelayTypes';

function setRelayModernMutationConfigs(
  configs: Array<RelayMutationConfig>,
  operation: ConcreteBatch,
  optimisticUpdater?: ?(
    store: RecordSourceSelectorProxy,
    data: ?SelectorData,
  ) => void,
  updater?: ?(store: RecordSourceSelectorProxy, data: ?SelectorData) => void,
): Object {
  const configOptimisticUpdates = optimisticUpdater ? [optimisticUpdater] : [];
  const configUpdates = updater ? [updater] : [];
  configs.forEach(config => {
    switch (config.type) {
      case 'RANGE_ADD':
        const rangeAddResult = rangeAdd(config, operation);
        if (rangeAddResult) {
          configOptimisticUpdates.push(rangeAddResult);
          configUpdates.push(rangeAddResult);
        }
        break;
      case 'RANGE_DELETE':
        const rangeDeleteResult = rangeDelete(config, operation);
        if (rangeDeleteResult) {
          configOptimisticUpdates.push(rangeDeleteResult);
          configUpdates.push(rangeDeleteResult);
        }
        break;
    }
  });
  optimisticUpdater = (
    store: RecordSourceSelectorProxy,
    data: ?SelectorData,
  ) => {
    configOptimisticUpdates.forEach(eachOptimisticUpdater => {
      eachOptimisticUpdater(store, data);
    });
  };
  updater = (store: RecordSourceSelectorProxy, data: ?SelectorData) => {
    configUpdates.forEach(eachUpdater => {
      eachUpdater(store, data);
    });
  };
  return {optimisticUpdater, updater};
}

function rangeAdd(
  config: RelayMutationConfig,
  operation: ConcreteBatch,
): ?SelectorStoreUpdater {
  let updater;
  if (config.type !== 'RANGE_ADD') {
    return;
  }
  const {parentID, connectionInfo, edgeName} = config;
  if (!parentID) {
    warning(
      false,
      'setRelayModernMutationConfigs: For mutation config RANGE_ADD ' +
        'to work you must include a parentID',
    );
    return;
  }
  const rootField = getRootField(operation);
  if (connectionInfo && rootField) {
    updater = (store: RecordSourceSelectorProxy, data: ?SelectorData) => {
      const parent = store.get(parentID);
      if (parent) {
        const payload = store.getRootField(rootField);
        if (!payload) {
          return;
        }
        const newEdge = payload.getLinkedRecord(edgeName);
        for (const info of connectionInfo) {
          if (newEdge) {
            const connection = RelayConnectionHandler.getConnection(
              parent,
              info.key,
              info.filters,
            );
            if (!connection) {
              return;
            }
            switch (info.rangeBehavior) {
              case 'append':
                RelayConnectionHandler.insertEdgeAfter(connection, newEdge);
                break;
              case 'ignore':
                // Do nothing
                break;
              case 'prepend':
                RelayConnectionHandler.insertEdgeBefore(connection, newEdge);
                break;
              default:
                warning(
                  false,
                  'setRelayModernMutationConfigs: RANGE_ADD range behavior ' +
                    `'${info.rangeBehavior}' will not work as expected in RelayModern, ` +
                    "supported range behaviors are 'append', 'prepend', and " +
                    "'ignore'",
                );
                break;
            }
          }
        }
      }
    };
  }
  return updater;
}

function rangeDelete(
  config: RelayMutationConfig,
  operation: ConcreteBatch,
): ?SelectorStoreUpdater {
  let updater;
  if (config.type !== 'RANGE_DELETE') {
    return;
  }
  const {
    parentID,
    connectionKeys,
    pathToConnection,
    deletedIDFieldName,
  } = config;
  if (!parentID) {
    warning(
      false,
      'setRelayModernMutationConfigs: For mutation config RANGE_DELETE ' +
        'to work you must include a parentID',
    );
    return;
  }
  const rootField = getRootField(operation);
  if (rootField) {
    updater = (store: RecordSourceSelectorProxy, data: ?SelectorData) => {
      if (data) {
        const deleteIDs = [];
        let deletedIDField = data[rootField];
        if (deletedIDField && Array.isArray(deletedIDFieldName)) {
          for (const eachField of deletedIDFieldName) {
            if (deletedIDField && typeof deletedIDField === 'object') {
              deletedIDField = deletedIDField[eachField];
            }
          }
          if (Array.isArray(deletedIDField)) {
            deletedIDField.forEach(idObject => {
              if (
                idObject &&
                idObject.id &&
                typeof idObject === 'object' &&
                typeof idObject.id === 'string'
              ) {
                deleteIDs.push(idObject.id);
              }
            });
          } else if (
            deletedIDField &&
            deletedIDField.id &&
            typeof deletedIDField.id === 'string'
          ) {
            deleteIDs.push(deletedIDField.id);
          }
        } else if (
          deletedIDField &&
          typeof deletedIDFieldName === 'string' &&
          typeof deletedIDField === 'object'
        ) {
          deletedIDField = deletedIDField[deletedIDFieldName];
          if (typeof deletedIDField === 'string') {
            deleteIDs.push(deletedIDField);
          } else if (Array.isArray(deletedIDField)) {
            deletedIDField.forEach(id => {
              if (typeof id === 'string') {
                deleteIDs.push(id);
              }
            });
          }
        }
        deleteNode(
          parentID,
          connectionKeys,
          pathToConnection,
          store,
          deleteIDs,
        );
      }
    };
  }
  return updater;
}

function deleteNode(
  parentID: string,
  connectionKeys: ?Array<{
    key: string,
    filters?: Variables,
  }>,
  pathToConnection: Array<string>,
  store: RecordSourceSelectorProxy,
  deleteIDs: Array<string>,
): void {
  warning(
    connectionKeys,
    'setRelayModernMutationConfigs: RANGE_DELETE must provide a ' +
      'connectionKeys',
  );
  const parent = store.get(parentID);
  if (!parent) {
    return;
  }
  if (pathToConnection.length >= 2) {
    let recordProxy = parent;
    for (let i = 1; i < pathToConnection.length - 1; i++) {
      if (recordProxy) {
        recordProxy = recordProxy.getLinkedRecord(pathToConnection[i]);
      }
    }
    // Should never enter loop except edge cases
    if (connectionKeys && recordProxy) {
      for (const key of connectionKeys) {
        const connection = RelayConnectionHandler.getConnection(
          recordProxy,
          key.key,
          key.filters,
        );
        if (connection) {
          deleteIDs.forEach(deleteID => {
            RelayConnectionHandler.deleteNode(connection, deleteID);
          });
          break;
        }
      }
    } else {
      warning(
        false,
        'setRelayModernMutationConfigs: RANGE_DELETE ' +
          'pathToConnection is incorrect. Unable to find connection with ' +
          'parentID: %s and path: %s',
        parentID,
        pathToConnection.toString(),
      );
    }
  } else {
    warning(
      false,
      'setRelayModernMutationConfigs: RANGE_DELETE ' +
        'pathToConnection must include at least parent and connection',
    );
  }
}

function getRootField(operation: ConcreteBatch): ?string {
  let rootField;
  if (
    operation.fragment &&
    operation.fragment.selections &&
    operation.fragment.selections.length > 0 &&
    operation.fragment.selections[0].kind === 'LinkedField'
  ) {
    rootField = operation.fragment.selections[0].name;
  }
  return rootField;
}

module.exports = setRelayModernMutationConfigs;

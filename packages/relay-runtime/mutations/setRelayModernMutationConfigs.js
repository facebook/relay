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

import RelayConnectionHandler from 'RelayConnectionHandler';
import warning from 'warning';

import type {SelectorData} from 'RelayCombinedEnvironmentTypes';
import type {ConcreteBatch} from 'RelayConcreteNode';
import type {
  RecordSourceSelectorProxy,
  SelectorStoreUpdater,
} from 'RelayStoreTypes';
import type {RelayMutationConfig, Variables} from 'RelayTypes';

export default function setRelayModernMutationConfigs(
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

function rangeDelete(
  config: RelayMutationConfig,
  operation: ConcreteBatch,
): ?SelectorStoreUpdater {
  let updater;
  if (config.type === 'RANGE_DELETE') {
    const {
      parentID,
      connectionKeys,
      pathToConnection,
      deletedIDFieldName,
    } = config;
    if (
      operation.fragment &&
      operation.fragment.selections &&
      operation.fragment.selections.length > 0 &&
      operation.fragment.selections[0].kind === 'LinkedField'
    ) {
      const rootField = operation.fragment.selections[0].name;
      if (parentID) {
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
      } else {
        warning(
          false,
          'setRelayModernMutationConfigs: For mutation config RANGE_DELETE ' +
            'to work you must include a parentID',
        );
      }
    }
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
          `parentID: ${parentID} and path: ${pathToConnection.toString()}`,
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

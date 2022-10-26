/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {RecordProxy, RecordSourceProxy} from '../store/RelayStoreTypes';
import type {ReaderLinkedField, ReaderSelection} from '../util/ReaderNode';
import type {Variables} from '../util/RelayRuntimeTypes';

const {getArgumentValues} = require('../store/RelayStoreUtils');
const {
  ACTOR_CHANGE,
  ALIASED_FRAGMENT_SPREAD,
  ALIASED_INLINE_FRAGMENT_SPREAD,
  CLIENT_EDGE_TO_CLIENT_OBJECT,
  CLIENT_EDGE_TO_SERVER_OBJECT,
  CLIENT_EXTENSION,
  CONDITION,
  DEFER,
  FLIGHT_FIELD,
  FRAGMENT_SPREAD,
  INLINE_DATA_FRAGMENT_SPREAD,
  INLINE_FRAGMENT,
  LINKED_FIELD,
  MODULE_IMPORT,
  RELAY_LIVE_RESOLVER,
  RELAY_RESOLVER,
  REQUIRED_FIELD,
  SCALAR_FIELD,
  STREAM,
} = require('../util/RelayConcreteNode');

const nonUpdatableKeys = ['id', '__id', '__typename', 'js'];

function createUpdatableProxy<TData: {...}>(
  updatableProxyRootRecord: RecordProxy,
  variables: Variables,
  selections: $ReadOnlyArray<ReaderSelection>,
  recordSourceProxy: RecordSourceProxy,
): TData {
  const mutableUpdatableProxy = {};
  updateProxyFromSelections(
    mutableUpdatableProxy,
    updatableProxyRootRecord,
    variables,
    selections,
    recordSourceProxy,
  );
  if (__DEV__) {
    Object.freeze(mutableUpdatableProxy);
  }
  // unless ReaderSelection carries more type information, we will never be able
  // to flowtype mutableUpdatableProxy without a type assertion.
  // $FlowFixMe[unclear-type]
  return ((mutableUpdatableProxy: any): TData);
}

function updateProxyFromSelections<TData>(
  mutableUpdatableProxy: TData,
  updatableProxyRootRecord: RecordProxy,
  variables: Variables,
  selections: $ReadOnlyArray<ReaderSelection>,
  recordSourceProxy: RecordSourceProxy,
) {
  for (const selection of selections) {
    switch (selection.kind) {
      case LINKED_FIELD:
        if (selection.plural) {
          Object.defineProperty(
            mutableUpdatableProxy,
            selection.alias ?? selection.name,
            {
              // $FlowFixMe[incompatible-call] these getters and setters have different types on purpose
              get: createGetterForPluralLinkedField(
                selection,
                variables,
                updatableProxyRootRecord,
                recordSourceProxy,
              ),
              set: createSetterForPluralLinkedField(
                selection,
                variables,
                updatableProxyRootRecord,
                recordSourceProxy,
              ),
            },
          );
        } else {
          Object.defineProperty(
            mutableUpdatableProxy,
            selection.alias ?? selection.name,
            {
              get: createGetterForSingularLinkedField(
                selection,
                variables,
                updatableProxyRootRecord,
                recordSourceProxy,
              ),
              set: createSetterForSingularLinkedField(
                selection,
                variables,
                updatableProxyRootRecord,
                recordSourceProxy,
              ),
            },
          );
        }
        break;
      case SCALAR_FIELD:
        const scalarFieldName = selection.alias ?? selection.name;
        Object.defineProperty(mutableUpdatableProxy, scalarFieldName, {
          get: function () {
            const newVariables = getArgumentValues(
              selection.args ?? [],
              variables,
            );
            // Flow incorrect assumes that the return value for the get method must match
            // the set parameter.
            return (updatableProxyRootRecord.getValue(
              selection.name,
              newVariables,
              // $FlowFixMe[unclear-type] Typed by the generated updatable query flow type
            ): any);
          },
          set: nonUpdatableKeys.includes(selection.name)
            ? undefined
            : // $FlowFixMe[unclear-type] Typed by the generated updatable query flow type
              function (newValue: ?any) {
                const newVariables = getArgumentValues(
                  selection.args ?? [],
                  variables,
                );
                // $FlowFixMe[prop-missing] Typesafe updaters should prevent people from using untyped values
                updatableProxyRootRecord.setValue__UNSAFE(
                  newValue,
                  selection.name,
                  newVariables,
                );
              },
        });
        break;
      case INLINE_FRAGMENT:
        if (updatableProxyRootRecord.getType() === selection.type) {
          updateProxyFromSelections(
            mutableUpdatableProxy,
            updatableProxyRootRecord,
            variables,
            selection.selections,
            recordSourceProxy,
          );
        }
        break;
      case CLIENT_EXTENSION:
        updateProxyFromSelections(
          mutableUpdatableProxy,
          updatableProxyRootRecord,
          variables,
          selection.selections,
          recordSourceProxy,
        );
        break;
      case FRAGMENT_SPREAD:
        // Explicitly ignore
        break;
      case CONDITION:
      case ACTOR_CHANGE:
      case ALIASED_FRAGMENT_SPREAD:
      case INLINE_DATA_FRAGMENT_SPREAD:
      case ALIASED_INLINE_FRAGMENT_SPREAD:
      case CLIENT_EDGE_TO_CLIENT_OBJECT:
      case CLIENT_EDGE_TO_SERVER_OBJECT:
      case DEFER:
      case FLIGHT_FIELD:
      case MODULE_IMPORT:
      case RELAY_LIVE_RESOLVER:
      case REQUIRED_FIELD:
      case STREAM:
      case RELAY_RESOLVER:
        // These types of reader nodes are not currently handled.
        throw new Error(
          'Encountered an unexpected ReaderSelection variant in RelayRecordSourceProxy. This indicates a bug in Relay.',
        );
      default:
        (selection.kind: empty);
        throw new Error(
          'Encountered an unexpected ReaderSelection variant in RelayRecordSourceProxy. This indicates a bug in Relay.',
        );
    }
  }
}

function createSetterForPluralLinkedField(
  selection: ReaderLinkedField,
  variables: Variables,
  updatableProxyRootRecord: RecordProxy,
  recordSourceProxy: RecordSourceProxy,
) {
  return function set(newValue: $ReadOnlyArray<{__id: string, ...}>) {
    const newVariables = getArgumentValues(selection.args ?? [], variables);
    if (newValue == null) {
      throw new Error(
        'Do not assign null to plural linked fields; assign an empty array instead.',
      );
    } else {
      const recordProxies = newValue.map(item => {
        if (item == null) {
          throw new Error(
            'When assigning an array of items, none of the items should be null or undefined.',
          );
        }
        const {__id} = item;
        if (__id == null) {
          throw new Error(
            'The __id field must be present on each item passed to the setter. This indicates a bug in Relay.',
          );
        }
        const newValueRecord = recordSourceProxy.get(__id);
        if (newValueRecord == null) {
          throw new Error(
            `Did not find item with data id ${__id} in the store.`,
          );
        }
        return newValueRecord;
      });
      updatableProxyRootRecord.setLinkedRecords(
        recordProxies,
        selection.name,
        newVariables,
      );
    }
  };
}

function createSetterForSingularLinkedField(
  selection: ReaderLinkedField,
  variables: Variables,
  updatableProxyRootRecord: RecordProxy,
  recordSourceProxy: RecordSourceProxy,
) {
  return function set(newValue: ?{__id: string, ...}) {
    const newVariables = getArgumentValues(selection.args ?? [], variables);
    if (newValue == null) {
      updatableProxyRootRecord.setValue(newValue, selection.name, newVariables);
    } else {
      const {__id} = newValue;
      if (__id == null) {
        throw new Error(
          'The __id field must be present on the argument. This indicates a bug in Relay.',
        );
      }
      const newValueRecord = recordSourceProxy.get(__id);
      if (newValueRecord == null) {
        throw new Error(`Did not find item with data id ${__id} in the store.`);
      }
      updatableProxyRootRecord.setLinkedRecord(
        newValueRecord,
        selection.name,
        newVariables,
      );
    }
  };
}

function createGetterForPluralLinkedField(
  selection: ReaderLinkedField,
  variables: Variables,
  updatableProxyRootRecord: RecordProxy,
  recordSourceProxy: RecordSourceProxy,
) {
  return function () {
    const newVariables = getArgumentValues(selection.args ?? [], variables);
    const linkedRecords = updatableProxyRootRecord.getLinkedRecords(
      selection.name,
      newVariables,
    );
    if (linkedRecords != null) {
      return (linkedRecords.map(linkedRecord => {
        if (linkedRecord != null) {
          const updatableProxy = {};
          updateProxyFromSelections(
            updatableProxy,
            linkedRecord,
            variables,
            selection.selections,
            recordSourceProxy,
          );
          if (__DEV__) {
            Object.freeze(updatableProxy);
          }
          // Flow incorrect assumes that the return value for the get method must match
          // the set parameter.
          // $FlowFixMe[unclear-type] Typed by the generated updatable query flow type
          return (updatableProxy: any);
        } else {
          return linkedRecord;
        }
        // $FlowFixMe[unclear-type] Typed by the generated updatable query flow type
      }): any);
    } else {
      return linkedRecords;
    }
  };
}

function createGetterForSingularLinkedField(
  selection: ReaderLinkedField,
  variables: Variables,
  updatableProxyRootRecord: RecordProxy,
  recordSourceProxy: RecordSourceProxy,
) {
  return function () {
    const newVariables = getArgumentValues(selection.args ?? [], variables);
    const linkedRecord = updatableProxyRootRecord.getLinkedRecord(
      selection.name,
      newVariables,
    );
    if (linkedRecord != null) {
      const updatableProxy = {};
      updateProxyFromSelections(
        updatableProxy,
        linkedRecord,
        variables,
        selection.selections,
        recordSourceProxy,
      );
      if (__DEV__) {
        Object.freeze(updatableProxy);
      }
      // Flow incorrect assumes that the return value for the get method must match
      // the set parameter.
      // $FlowFixMe[unclear-type] Typed by the generated updatable query flow type
      return (updatableProxy: any);
    } else {
      return linkedRecord;
    }
  };
}

module.exports = {createUpdatableProxy};

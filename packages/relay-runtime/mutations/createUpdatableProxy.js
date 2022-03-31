/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @emails oncall+relay
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {RecordProxy, RecordSourceProxy} from '../store/RelayStoreTypes';
import type {ReaderLinkedField, ReaderSelection} from '../util/ReaderNode';
import type {Variables} from '../util/RelayRuntimeTypes';

const {getArgumentValues} = require('../store/RelayStoreUtils');

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
      case 'LinkedField':
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
      case 'ScalarField':
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
                updatableProxyRootRecord.setValue(
                  newValue,
                  selection.name,
                  newVariables,
                );
              },
        });
        break;
      case 'InlineFragment':
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
      case 'ClientExtension':
        updateProxyFromSelections(
          mutableUpdatableProxy,
          updatableProxyRootRecord,
          variables,
          selection.selections,
          recordSourceProxy,
        );
        break;
      case 'FragmentSpread':
        // Explicitly ignore
        break;
      default:
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

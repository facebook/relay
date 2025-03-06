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

import type {
  MissingFieldHandler,
  RecordProxy,
  RecordSourceProxy,
} from '../store/RelayStoreTypes';
import type {
  ReaderLinkedField,
  ReaderScalarField,
  ReaderSelection,
} from '../util/ReaderNode';
import type {Variables} from '../util/RelayRuntimeTypes';

const {getArgumentValues} = require('../store/RelayStoreUtils');

const nonUpdatableKeys = ['id', '__id', '__typename', 'js'];

function createUpdatableProxy<TData: {...}>(
  updatableProxyRootRecord: RecordProxy,
  variables: Variables,
  selections: $ReadOnlyArray<ReaderSelection>,
  recordSourceProxy: RecordSourceProxy,
  missingFieldHandlers: $ReadOnlyArray<MissingFieldHandler>,
): TData {
  const mutableUpdatableProxy = {};
  updateProxyFromSelections(
    mutableUpdatableProxy,
    updatableProxyRootRecord,
    variables,
    selections,
    recordSourceProxy,
    missingFieldHandlers,
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
  missingFieldHandlers: $ReadOnlyArray<MissingFieldHandler>,
): void {
  for (const selection of selections) {
    switch (selection.kind) {
      case 'LinkedField':
        if (selection.plural) {
          Object.defineProperty(
            mutableUpdatableProxy,
            selection.alias ?? selection.name,
            {
              get: createGetterForPluralLinkedField(
                selection,
                variables,
                updatableProxyRootRecord,
                recordSourceProxy,
                missingFieldHandlers,
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
                missingFieldHandlers,
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
            // $FlowFixMe[unclear-type] Typed by the generated updatable query flow type
            let value: any = updatableProxyRootRecord.getValue(
              selection.name,
              newVariables,
            );
            if (value == null) {
              value = getScalarUsingMissingFieldHandlers(
                selection,
                newVariables,
                updatableProxyRootRecord,
                recordSourceProxy,
                missingFieldHandlers,
              );
            }
            return value;
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
      case 'InlineFragment':
        if (updatableProxyRootRecord.getType() === selection.type) {
          updateProxyFromSelections(
            mutableUpdatableProxy,
            updatableProxyRootRecord,
            variables,
            selection.selections,
            recordSourceProxy,
            missingFieldHandlers,
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
          missingFieldHandlers,
        );
        break;
      case 'FragmentSpread':
        // Explicitly ignore
        break;
      case 'Condition':
      case 'ActorChange':
      case 'InlineDataFragmentSpread':
      case 'AliasedInlineFragmentSpread':
      case 'ClientEdgeToClientObject':
      case 'ClientEdgeToServerObject':
      case 'Defer':
      case 'ModuleImport':
      case 'RequiredField':
      case 'CatchField':
      case 'Stream':
      case 'RelayResolver':
      case 'RelayLiveResolver':
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
      const recordProxies = newValue.map((item): ?RecordProxy => {
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
  missingFieldHandlers: $ReadOnlyArray<MissingFieldHandler>,
): () => $FlowFixMe {
  return function () {
    const newVariables = getArgumentValues(selection.args ?? [], variables);
    let linkedRecords = updatableProxyRootRecord.getLinkedRecords(
      selection.name,
      newVariables,
    );

    if (linkedRecords === undefined) {
      linkedRecords = getPluralLinkedRecordUsingMissingFieldHandlers(
        selection,
        newVariables,
        updatableProxyRootRecord,
        recordSourceProxy,
        missingFieldHandlers,
      );
    }

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
            missingFieldHandlers,
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
  missingFieldHandlers: $ReadOnlyArray<MissingFieldHandler>,
): () => ?$FlowFixMe {
  return function () {
    const newVariables = getArgumentValues(selection.args ?? [], variables);
    let linkedRecord = updatableProxyRootRecord.getLinkedRecord(
      selection.name,
      newVariables,
    );
    if (linkedRecord === undefined) {
      linkedRecord = getLinkedRecordUsingMissingFieldHandlers(
        selection,
        newVariables,
        updatableProxyRootRecord,
        recordSourceProxy,
        missingFieldHandlers,
      );
    }

    if (linkedRecord != null) {
      const updatableProxy = {};
      updateProxyFromSelections(
        updatableProxy,
        linkedRecord,
        variables,
        selection.selections,
        recordSourceProxy,
        missingFieldHandlers,
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

function getLinkedRecordUsingMissingFieldHandlers(
  selection: ReaderLinkedField,
  newVariables: Variables,
  updatableProxyRootRecord: RecordProxy,
  recordSourceProxy: RecordSourceProxy,
  missingFieldHandlers: $ReadOnlyArray<MissingFieldHandler>,
): ?RecordProxy {
  for (const handler of missingFieldHandlers) {
    if (handler.kind === 'linked') {
      const newId = handler.handle(
        selection,
        updatableProxyRootRecord,
        newVariables,
        recordSourceProxy,
      );
      if (newId != null) {
        return recordSourceProxy.get(newId);
      }
    }
  }
}

function getPluralLinkedRecordUsingMissingFieldHandlers(
  selection: ReaderLinkedField,
  newVariables: Variables,
  updatableProxyRootRecord: RecordProxy,
  recordSourceProxy: RecordSourceProxy,
  missingFieldHandlers: $ReadOnlyArray<MissingFieldHandler>,
): ?Array<?RecordProxy> {
  for (const handler of missingFieldHandlers) {
    if (handler.kind === 'pluralLinked') {
      const newIds = handler.handle(
        selection,
        updatableProxyRootRecord,
        newVariables,
        recordSourceProxy,
      );
      if (newIds != null) {
        return newIds.map(newId => {
          if (newId != null) {
            return recordSourceProxy.get(newId);
          }
        });
      }
    }
  }
}

function getScalarUsingMissingFieldHandlers(
  selection: ReaderScalarField,
  newVariables: Variables,
  updatableProxyRootRecord: RecordProxy,
  recordSourceProxy: RecordSourceProxy,
  missingFieldHandlers: $ReadOnlyArray<MissingFieldHandler>,
): mixed {
  for (const handler of missingFieldHandlers) {
    if (handler.kind === 'scalar') {
      const value = handler.handle(
        selection,
        updatableProxyRootRecord,
        newVariables,
        recordSourceProxy,
      );
      if (value !== undefined) {
        return value;
      }
    }
  }
}

module.exports = {createUpdatableProxy};

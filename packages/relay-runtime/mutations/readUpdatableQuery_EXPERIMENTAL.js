/**
 * Copyright (c) Facebook, Inc. and its affiliates.
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

import type {GraphQLTaggedNode} from '../query/GraphQLTag';
import type {RecordProxy, RecordSourceProxy} from '../store/RelayStoreTypes';
import type {ReaderLinkedField, ReaderSelection} from '../util/ReaderNode';
import type {OperationType} from '../util/RelayRuntimeTypes';

const {getRequest} = require('../query/GraphQLTag');
const {getArgumentValues} = require('../store/RelayStoreUtils');

const nonUpdatableKeys = ['id', '__id', '__typename'];

function readUpdatableQuery_EXPERIMENTAL<TQuery: OperationType>(
  query: GraphQLTaggedNode,
  variables: TQuery['variables'],
  proxy: RecordSourceProxy,
): TQuery['response'] {
  // TODO assert that the concrete request is an updatable query
  const request = getRequest(query);

  const updatableProxy = {};
  updateProxyFromSelections(
    updatableProxy,
    proxy.getRoot(),
    variables,
    request.fragment.selections,
    proxy,
  );
  if (__DEV__) {
    Object.freeze(updatableProxy);
  }
  return updatableProxy;
}

function updateProxyFromSelections<TQuery: OperationType>(
  mutableUpdatableProxy: TQuery['response'],
  recordProxy: RecordProxy,
  queryVariables: TQuery['variables'],
  selections: $ReadOnlyArray<ReaderSelection>,
  root: RecordSourceProxy,
) {
  for (const selection of selections) {
    switch (selection.kind) {
      case 'LinkedField':
        // Linked fields are assignable if they contain fragment spreads or
        // read-only otherwise.
        const isAssignable = selection.selections.some(
          item => item.kind === 'FragmentSpread',
        );

        const set = !isAssignable
          ? undefined
          : selection.plural
          ? createSetterForPluralLinkedField(
              selection,
              queryVariables,
              recordProxy,
              root,
            )
          : createSetterForSingularLinkedField(
              selection,
              queryVariables,
              recordProxy,
              root,
            );

        const get = selection.plural
          ? createGetterForPluralLinkedField(
              selection,
              queryVariables,
              recordProxy,
              root,
            )
          : createGetterForSingularLinkedField(
              selection,
              queryVariables,
              recordProxy,
              root,
            );

        Object.defineProperty(
          mutableUpdatableProxy,
          selection.alias ?? selection.name,
          {
            get,
            set,
          },
        );
        break;
      case 'ScalarField':
        const scalarFieldName = selection.alias ?? selection.name;
        Object.defineProperty(mutableUpdatableProxy, scalarFieldName, {
          get: function () {
            const variables = getArgumentValues(
              selection.args ?? [],
              queryVariables,
            );
            // Flow incorrect assumes that the return value for the get method must match
            // the set parameter.
            return (recordProxy.getValue(
              selection.name,
              // $FlowFixMe[unclear-type] No good way to type these variables
              (variables: any),
              // $FlowFixMe[unclear-type] Typed by the generated updatable query flow type
            ): any);
          },
          set: nonUpdatableKeys.includes(selection.name)
            ? undefined
            : // $FlowFixMe[unclear-type] Typed by the generated updatable query flow type
              function (newValue: ?any) {
                const variables = getArgumentValues(
                  selection.args ?? [],
                  queryVariables,
                );
                recordProxy.setValue(
                  newValue,
                  selection.name,
                  // $FlowFixMe[unclear-type] No good way to type these variables
                  (variables: any),
                );
              },
        });
        break;
      case 'InlineFragment':
        if (recordProxy.getType() === selection.type) {
          updateProxyFromSelections(
            mutableUpdatableProxy,
            recordProxy,
            queryVariables,
            selection.selections,
            root,
          );
        }
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

function createSetterForPluralLinkedField<TQuery: OperationType>(
  selection: ReaderLinkedField,
  queryVariables: TQuery['variables'],
  recordProxy: RecordProxy,
  root: RecordSourceProxy,
) {
  return function set(newValue: ?$ReadOnlyArray<{__id: string, ...}>) {
    const variables = getArgumentValues(selection.args ?? [], queryVariables);
    if (newValue == null) {
      // $FlowFixMe[unclear-type] No good way to type these variables
      recordProxy.setValue(null, selection.name, (variables: any));
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
        const newValueRecord = root.get(__id);
        if (newValueRecord == null) {
          throw new Error(
            `Did not find item with data id ${__id} in the store.`,
          );
        }
        return newValueRecord;
      });
      recordProxy.setLinkedRecords(
        recordProxies,
        selection.name,
        // $FlowFixMe[unclear-type] No good way to type these variables
        (variables: any),
      );
    }
  };
}
function createSetterForSingularLinkedField<TQuery: OperationType>(
  selection: ReaderLinkedField,
  queryVariables: TQuery['variables'],
  recordProxy: RecordProxy,
  root: RecordSourceProxy,
) {
  return function set(newValue: ?{__id: string, ...}) {
    const variables = getArgumentValues(selection.args ?? [], queryVariables);
    if (newValue == null) {
      // $FlowFixMe[unclear-type] No good way to type these variables
      recordProxy.setValue(null, selection.name, (variables: any));
    } else {
      const {__id} = newValue;
      if (__id == null) {
        throw new Error(
          'The __id field must be present on the argument. This indicates a bug in Relay.',
        );
      }
      const newValueRecord = root.get(__id);
      if (newValueRecord == null) {
        throw new Error(`Did not find item with data id ${__id} in the store.`);
      }
      recordProxy.setLinkedRecord(
        newValueRecord,
        selection.name,
        // $FlowFixMe[unclear-type] No good way to type these variables
        (variables: any),
      );
    }
  };
}

function createGetterForPluralLinkedField<TQuery: OperationType>(
  selection: ReaderLinkedField,
  queryVariables: TQuery['variables'],
  recordProxy: RecordProxy,
  root: RecordSourceProxy,
) {
  return function () {
    const variables = getArgumentValues(selection.args ?? [], queryVariables);
    const linkedRecords = recordProxy.getLinkedRecords(
      selection.name,
      // $FlowFixMe[unclear-type] No good way to type these variables
      (variables: any),
    );
    if (linkedRecords != null) {
      return (linkedRecords.map(linkedRecord => {
        if (linkedRecord != null) {
          const updatableProxy = {};
          updateProxyFromSelections(
            updatableProxy,
            linkedRecord,
            queryVariables,
            selection.selections,
            root,
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

function createGetterForSingularLinkedField<TQuery: OperationType>(
  selection: ReaderLinkedField,
  queryVariables: TQuery['variables'],
  recordProxy: RecordProxy,
  root: RecordSourceProxy,
) {
  return function () {
    const variables = getArgumentValues(selection.args ?? [], queryVariables);
    const linkedRecord = recordProxy.getLinkedRecord(
      selection.name,
      // $FlowFixMe[unclear-type] No good way to type these variables
      (variables: any),
    );
    if (linkedRecord != null) {
      const updatableProxy = {};
      updateProxyFromSelections(
        updatableProxy,
        linkedRecord,
        queryVariables,
        selection.selections,
        root,
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

module.exports = {readUpdatableQuery_EXPERIMENTAL};

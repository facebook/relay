/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const RelayConcreteNode = require('../util/RelayConcreteNode');
const RelayModernRecord = require('./RelayModernRecord');
const RelayStoreUtils = require('./RelayStoreUtils');

const cloneRelayHandleSourceField = require('./cloneRelayHandleSourceField');
const invariant = require('invariant');

import type {
  NormalizationLinkedField,
  NormalizationModuleImport,
  NormalizationNode,
  NormalizationSelection,
} from '../util/NormalizationNode';
import type {DataID, Variables} from '../util/RelayRuntimeTypes';
import type {
  NormalizationSelector,
  OperationLoader,
  Record,
  RecordSource,
} from './RelayStoreTypes';

const {
  CONDITION,
  CLIENT_EXTENSION,
  DEFER,
  FRAGMENT_SPREAD,
  INLINE_FRAGMENT,
  LINKED_FIELD,
  MODULE_IMPORT,
  LINKED_HANDLE,
  SCALAR_FIELD,
  SCALAR_HANDLE,
  STREAM,
} = RelayConcreteNode;
const {getStorageKey, getModuleOperationKey} = RelayStoreUtils;

function mark(
  recordSource: RecordSource,
  selector: NormalizationSelector,
  references: Set<DataID>,
  operationLoader: ?OperationLoader,
): void {
  const {dataID, node, variables} = selector;
  const marker = new RelayReferenceMarker(
    recordSource,
    variables,
    references,
    operationLoader,
  );
  marker.mark(node, dataID);
}

/**
 * @private
 */
class RelayReferenceMarker {
  _operationLoader: OperationLoader | null;
  _recordSource: RecordSource;
  _references: Set<DataID>;
  _variables: Variables;

  constructor(
    recordSource: RecordSource,
    variables: Variables,
    references: Set<DataID>,
    operationLoader: ?OperationLoader,
  ) {
    this._operationLoader = operationLoader ?? null;
    this._recordSource = recordSource;
    this._references = references;
    this._variables = variables;
  }

  mark(node: NormalizationNode, dataID: DataID): void {
    this._traverse(node, dataID);
  }

  _traverse(node: NormalizationNode, dataID: DataID): void {
    this._references.add(dataID);
    const record = this._recordSource.get(dataID);
    if (record == null) {
      return;
    }
    this._traverseSelections(node.selections, record);
  }

  _getVariableValue(name: string): mixed {
    invariant(
      this._variables.hasOwnProperty(name),
      'RelayReferenceMarker(): Undefined variable `%s`.',
      name,
    );
    return this._variables[name];
  }

  _traverseSelections(
    selections: $ReadOnlyArray<NormalizationSelection>,
    record: Record,
  ): void {
    selections.forEach(selection => {
      /* eslint-disable no-fallthrough */
      switch (selection.kind) {
        case LINKED_FIELD:
          if (selection.plural) {
            this._traversePluralLink(selection, record);
          } else {
            this._traverseLink(selection, record);
          }
          break;
        case CONDITION:
          const conditionValue = this._getVariableValue(selection.condition);
          if (conditionValue === selection.passingValue) {
            this._traverseSelections(selection.selections, record);
          }
          break;
        case INLINE_FRAGMENT:
          const typeName = RelayModernRecord.getType(record);
          if (typeName != null && typeName === selection.type) {
            this._traverseSelections(selection.selections, record);
          }
          break;
        case FRAGMENT_SPREAD:
          invariant(
            false,
            'RelayReferenceMarker(): Unexpected fragment spread `...%s`, ' +
              'expected all fragments to be inlined.',
            selection.name,
          );
        case LINKED_HANDLE:
          // The selections for a "handle" field are the same as those of the
          // original linked field where the handle was applied. Reference marking
          // therefore requires traversing the original field selections against
          // the synthesized client field.
          //
          // TODO: Instead of finding the source field in `selections`, change
          // the concrete structure to allow shared subtrees, and have the linked
          // handle directly refer to the same selections as the LinkedField that
          // it was split from.
          const handleField = cloneRelayHandleSourceField(
            selection,
            selections,
            this._variables,
          );
          if (handleField.plural) {
            this._traversePluralLink(handleField, record);
          } else {
            this._traverseLink(handleField, record);
          }
          break;
        case DEFER:
        case STREAM:
          this._traverseSelections(selection.selections, record);
          break;
        case SCALAR_FIELD:
        case SCALAR_HANDLE:
          break;
        case MODULE_IMPORT:
          this._traverseModuleImport(selection, record);
          break;
        case CLIENT_EXTENSION:
          this._traverseSelections(selection.selections, record);
          break;
        default:
          (selection: empty);
          invariant(
            false,
            'RelayReferenceMarker: Unknown AST node `%s`.',
            selection,
          );
      }
    });
  }

  _traverseModuleImport(
    moduleImport: NormalizationModuleImport,
    record: Record,
  ): void {
    const operationLoader = this._operationLoader;
    invariant(
      operationLoader !== null,
      'RelayReferenceMarker: Expected an operationLoader to be configured when using `@module`.',
    );
    const operationKey = getModuleOperationKey(moduleImport.documentName);
    const operationReference = RelayModernRecord.getValue(record, operationKey);
    if (operationReference == null) {
      return;
    }
    const operation = operationLoader.get(operationReference);
    if (operation != null) {
      this._traverseSelections(operation.selections, record);
    }
    // Otherwise, if the operation is not available, we assume that the data
    // cannot have been processed yet and therefore isn't in the store to
    // begin with.
  }

  _traverseLink(field: NormalizationLinkedField, record: Record): void {
    const storageKey = getStorageKey(field, this._variables);
    const linkedID = RelayModernRecord.getLinkedRecordID(record, storageKey);

    if (linkedID == null) {
      return;
    }
    this._traverse(field, linkedID);
  }

  _traversePluralLink(field: NormalizationLinkedField, record: Record): void {
    const storageKey = getStorageKey(field, this._variables);
    const linkedIDs = RelayModernRecord.getLinkedRecordIDs(record, storageKey);

    if (linkedIDs == null) {
      return;
    }
    linkedIDs.forEach(linkedID => {
      if (linkedID != null) {
        this._traverse(field, linkedID);
      }
    });
  }
}

module.exports = {mark};

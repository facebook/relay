/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const RelayConcreteNode = require('../util/RelayConcreteNode');
const RelayModernRecord = require('./RelayModernRecord');
const RelayStoreUtils = require('./RelayStoreUtils');

const cloneRelayHandleSourceField = require('./cloneRelayHandleSourceField');
const invariant = require('invariant');

import type {
  ConcreteLinkedField,
  ConcreteNode,
  ConcreteSelection,
} from '../util/RelayConcreteNode';
import type {DataID, Variables} from '../util/RelayRuntimeTypes';
import type {RecordSource, Selector} from './RelayStoreTypes';
import type {Record} from 'react-relay/classic/environment/RelayCombinedEnvironmentTypes';

const {
  CONDITION,
  DEFERRABLE_FRAGMENT_SPREAD,
  FRAGMENT_SPREAD,
  INLINE_FRAGMENT,
  LINKED_FIELD,
  LINKED_HANDLE,
  SCALAR_FIELD,
  SCALAR_HANDLE,
} = RelayConcreteNode;
const {getStorageKey} = RelayStoreUtils;

function mark(
  recordSource: RecordSource,
  selector: Selector,
  references: Set<DataID>,
): void {
  const {dataID, node, variables} = selector;
  const marker = new RelayReferenceMarker(recordSource, variables, references);
  marker.mark(node, dataID);
}

/**
 * @private
 */
class RelayReferenceMarker {
  _recordSource: RecordSource;
  _references: Set<DataID>;
  _variables: Variables;

  constructor(
    recordSource: RecordSource,
    variables: Variables,
    references: Set<DataID>,
  ) {
    this._references = references;
    this._recordSource = recordSource;
    this._variables = variables;
  }

  mark(node: ConcreteNode, dataID: DataID): void {
    this._traverse(node, dataID);
  }

  _traverse(node: ConcreteNode, dataID: DataID): void {
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
    selections: Array<ConcreteSelection>,
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
        case SCALAR_FIELD:
        case SCALAR_HANDLE:
        case DEFERRABLE_FRAGMENT_SPREAD:
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

  _traverseLink(field: ConcreteLinkedField, record: Record): void {
    const storageKey = getStorageKey(field, this._variables);
    const linkedID = RelayModernRecord.getLinkedRecordID(record, storageKey);

    if (linkedID == null) {
      return;
    }
    this._traverse(field, linkedID);
  }

  _traversePluralLink(field: ConcreteLinkedField, record: Record): void {
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

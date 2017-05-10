/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayReferenceMarker
 * @flow
 * @format
 */

'use strict';

const RelayConcreteNode = require('RelayConcreteNode');
const RelayModernRecord = require('RelayModernRecord');
const RelayStoreUtils = require('RelayStoreUtils');

const cloneRelayHandleSourceField = require('cloneRelayHandleSourceField');
const invariant = require('invariant');

import type {Record} from 'RelayCombinedEnvironmentTypes';
import type {
  ConcreteLinkedField,
  ConcreteNode,
  ConcreteSelection,
} from 'RelayConcreteNode';
import type {DataID} from 'RelayInternalTypes';
import type {RecordSource, Selector} from 'RelayStoreTypes';
import type {Variables} from 'RelayTypes';

const {
  CONDITION,
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
      if (selection.kind === LINKED_FIELD) {
        if (selection.plural) {
          this._traversePluralLink(selection, record);
        } else {
          this._traverseLink(selection, record);
        }
      } else if (selection.kind === CONDITION) {
        const conditionValue = this._getVariableValue(selection.condition);
        if (conditionValue === selection.passingValue) {
          this._traverseSelections(selection.selections, record);
        }
      } else if (selection.kind === INLINE_FRAGMENT) {
        const typeName = RelayModernRecord.getType(record);
        if (typeName != null && typeName === selection.type) {
          this._traverseSelections(selection.selections, record);
        }
      } else if (selection.kind === FRAGMENT_SPREAD) {
        invariant(
          false,
          'RelayReferenceMarker(): Unexpected fragment spread `...%s`, ' +
            'expected all fragments to be inlined.',
          selection.name,
        );
      } else if (selection.kind === LINKED_HANDLE) {
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
      } else {
        invariant(
          selection.kind === SCALAR_FIELD || selection.kind === SCALAR_HANDLE,
          'RelayReferenceMarker(): Unexpected ast kind `%s`.',
          selection.kind,
        );
      }
    });
  }

  _traverseLink(field: ConcreteLinkedField, record: Record): void {
    const storageKey = getStorageKey(field, this._variables);
    const linkedID = RelayModernRecord.getLinkedRecordIDByStorageKey(
      record,
      storageKey,
    );

    if (linkedID == null) {
      return;
    }
    this._traverse(field, linkedID);
  }

  _traversePluralLink(field: ConcreteLinkedField, record: Record): void {
    const storageKey = getStorageKey(field, this._variables);
    const linkedIDs = RelayModernRecord.getLinkedRecordIDsByStorageKey(
      record,
      storageKey,
    );

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

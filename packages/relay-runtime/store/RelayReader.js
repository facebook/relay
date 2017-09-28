/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule RelayReader
 * @flow
 * @format
 */

'use strict';

const RelayConcreteNode = require('RelayConcreteNode');
const RelayModernRecord = require('RelayModernRecord');
const RelayStoreUtils = require('RelayStoreUtils');

const invariant = require('invariant');

import type {Record, SelectorData} from 'RelayCombinedEnvironmentTypes';
import type {
  ConcreteFragmentSpread,
  ConcreteLinkedField,
  ConcreteNode,
  ConcreteScalarField,
  ConcreteSelection,
  ConcreteSelectableNode,
} from 'RelayConcreteNode';
import type {DataID} from 'RelayInternalTypes';
import type {RecordSource, Selector, Snapshot} from 'RelayStoreTypes';
import type {Variables} from 'RelayTypes';

const {
  CONDITION,
  FRAGMENT_SPREAD,
  INLINE_FRAGMENT,
  LINKED_FIELD,
  SCALAR_FIELD,
} = RelayConcreteNode;
const {
  FRAGMENTS_KEY,
  ID_KEY,
  getArgumentValues,
  getStorageKey,
} = RelayStoreUtils;

function read(recordSource: RecordSource, selector: Selector): Snapshot {
  const {dataID, node, variables} = selector;
  const reader = new RelayReader(recordSource, variables);
  return reader.read(node, dataID);
}

/**
 * @private
 */
class RelayReader {
  _recordSource: RecordSource;
  _seenRecords: {[dataID: DataID]: ?Record};
  _variables: Variables;

  constructor(recordSource: RecordSource, variables: Variables) {
    this._recordSource = recordSource;
    this._seenRecords = {};
    this._variables = variables;
  }

  read(node: ConcreteSelectableNode, dataID: DataID): Snapshot {
    const data = this._traverse(node, dataID, null);
    return {
      data,
      dataID,
      node,
      seenRecords: this._seenRecords,
      variables: this._variables,
    };
  }

  _traverse(
    node: ConcreteNode,
    dataID: DataID,
    prevData: ?SelectorData,
  ): ?SelectorData {
    const record = this._recordSource.get(dataID);
    this._seenRecords[dataID] = record;
    if (record == null) {
      return record;
    }
    const data = prevData || {};
    this._traverseSelections(node.selections, record, data);
    return data;
  }

  _getVariableValue(name: string): mixed {
    invariant(
      this._variables.hasOwnProperty(name),
      'RelayReader(): Undefined variable `%s`.',
      name,
    );
    return this._variables[name];
  }

  _traverseSelections(
    selections: Array<ConcreteSelection>,
    record: Record,
    data: SelectorData,
  ): void {
    selections.forEach(selection => {
      if (selection.kind === SCALAR_FIELD) {
        this._readScalar(selection, record, data);
      } else if (selection.kind === LINKED_FIELD) {
        if (selection.plural) {
          this._readPluralLink(selection, record, data);
        } else {
          this._readLink(selection, record, data);
        }
      } else if (selection.kind === CONDITION) {
        const conditionValue = this._getVariableValue(selection.condition);
        if (conditionValue === selection.passingValue) {
          this._traverseSelections(selection.selections, record, data);
        }
      } else if (selection.kind === INLINE_FRAGMENT) {
        const typeName = RelayModernRecord.getType(record);
        if (typeName != null && typeName === selection.type) {
          this._traverseSelections(selection.selections, record, data);
        }
      } else if (selection.kind === FRAGMENT_SPREAD) {
        this._createFragmentPointer(selection, record, data);
      } else {
        invariant(
          false,
          'RelayReader(): Unexpected ast kind `%s`.',
          selection.kind,
        );
      }
    });
  }

  _readScalar(
    field: ConcreteScalarField,
    record: Record,
    data: SelectorData,
  ): void {
    const applicationName = field.alias || field.name;
    const storageKey = getStorageKey(field, this._variables);
    const value = RelayModernRecord.getValue(record, storageKey);
    data[applicationName] = value;
  }

  _readLink(
    field: ConcreteLinkedField,
    record: Record,
    data: SelectorData,
  ): void {
    const applicationName = field.alias || field.name;
    const storageKey = getStorageKey(field, this._variables);
    const linkedID = RelayModernRecord.getLinkedRecordID(record, storageKey);

    if (linkedID == null) {
      data[applicationName] = linkedID;
      return;
    }

    const prevData = data[applicationName];
    invariant(
      prevData == null || typeof prevData === 'object',
      'RelayReader(): Expected data for field `%s` on record `%s` ' +
        'to be an object, got `%s`.',
      applicationName,
      RelayModernRecord.getDataID(record),
      prevData,
    );
    data[applicationName] = this._traverse(field, linkedID, prevData);
  }

  _readPluralLink(
    field: ConcreteLinkedField,
    record: Record,
    data: SelectorData,
  ): void {
    const applicationName = field.alias || field.name;
    const storageKey = getStorageKey(field, this._variables);
    const linkedIDs = RelayModernRecord.getLinkedRecordIDs(record, storageKey);

    if (linkedIDs == null) {
      data[applicationName] = linkedIDs;
      return;
    }

    const prevData = data[applicationName];
    invariant(
      prevData == null || Array.isArray(prevData),
      'RelayReader(): Expected data for field `%s` on record `%s` ' +
        'to be an array, got `%s`.',
      applicationName,
      RelayModernRecord.getDataID(record),
      prevData,
    );
    const linkedArray = prevData || [];
    linkedIDs.forEach((linkedID, nextIndex) => {
      if (linkedID == null) {
        linkedArray[nextIndex] = linkedID;
        return;
      }
      const prevItem = linkedArray[nextIndex];
      invariant(
        prevItem == null || typeof prevItem === 'object',
        'RelayReader(): Expected data for field `%s` on record `%s` ' +
          'to be an object, got `%s`.',
        applicationName,
        RelayModernRecord.getDataID(record),
        prevItem,
      );
      const linkedItem = this._traverse(field, linkedID, prevItem);
      linkedArray[nextIndex] = linkedItem;
    });
    data[applicationName] = linkedArray;
  }

  _createFragmentPointer(
    fragmentSpread: ConcreteFragmentSpread,
    record: Record,
    data: SelectorData,
  ): void {
    let fragmentPointers = data[FRAGMENTS_KEY];
    if (!fragmentPointers) {
      fragmentPointers = data[FRAGMENTS_KEY] = {};
    }
    invariant(
      typeof fragmentPointers === 'object' && fragmentPointers,
      'RelayReader: Expected fragment spread data to be an object, got `%s`.',
      fragmentPointers,
    );
    data[ID_KEY] = data[ID_KEY] || RelayModernRecord.getDataID(record);
    const variables = fragmentSpread.args
      ? getArgumentValues(fragmentSpread.args, this._variables)
      : {};
    fragmentPointers[fragmentSpread.name] = variables;
  }
}

module.exports = {read};

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayReader
 * @flow
 * @format
 */

'use strict';

const RelayConcreteNode = require('RelayConcreteNode');
const RelayStoreUtils = require('RelayStoreUtils');

const invariant = require('invariant');

import type {SelectorData} from 'RelayCombinedEnvironmentTypes';
import type {
  ConcreteFragmentSpread,
  ConcreteLinkedField,
  ConcreteNode,
  ConcreteScalarField,
  ConcreteSelection,
  ConcreteSelectableNode,
} from 'RelayConcreteNode';
import type {DataID} from 'RelayInternalTypes';
import type {
  IRecordSource,
  IRecordReader,
  Selector,
  TSnapshot,
} from 'RelayStoreTypes';
import type {Variables} from 'RelayTypes';

const {
  CONDITION,
  FRAGMENT_SPREAD,
  INLINE_FRAGMENT,
  LINKED_FIELD,
  SCALAR_FIELD,
} = RelayConcreteNode;
const {FRAGMENTS_KEY, ID_KEY, getArgumentValues} = RelayStoreUtils;

function read<TRecord>(
  recordSource: IRecordSource<TRecord>,
  selector: Selector,
  recordReader: IRecordReader<TRecord>,
): TSnapshot<TRecord> {
  const {dataID, node, variables} = selector;
  const reader = new RelayReader(recordSource, variables, recordReader);
  return reader.read(node, dataID);
}

/**
 * @private
 */
class RelayReader<TRecord> {
  _recordSource: IRecordSource<TRecord>;
  _seenRecords: {[dataID: DataID]: ?TRecord};
  _variables: Variables;
  _recordReader: IRecordReader<TRecord>;

  constructor(
    recordSource: IRecordSource<TRecord>,
    variables: Variables,
    recordReader: IRecordReader<TRecord>,
  ) {
    this._recordSource = recordSource;
    this._seenRecords = {};
    this._variables = variables;
    this._recordReader = recordReader;
  }

  read(node: ConcreteSelectableNode, dataID: DataID): TSnapshot<TRecord> {
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
    record: TRecord,
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
        const typeName = this._recordReader.getType(record);
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
    record: TRecord,
    data: SelectorData,
  ): void {
    const applicationName = field.alias || field.name;
    const variables = field.args
      ? getArgumentValues(field.args, this._variables)
      : null;
    const value = this._recordReader.getValue(record, field.name, variables);
    data[applicationName] = value;
  }

  _readLink(
    field: ConcreteLinkedField,
    record: TRecord,
    data: SelectorData,
  ): void {
    const applicationName = field.alias || field.name;
    const variables = field.args
      ? getArgumentValues(field.args, this._variables)
      : null;
    const linkedID = this._recordReader.getLinkedRecordID(
      record,
      field.name,
      variables,
    );

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
      this._recordReader.getDataID(record),
      prevData,
    );
    data[applicationName] = this._traverse(field, linkedID, prevData);
  }

  _readPluralLink(
    field: ConcreteLinkedField,
    record: TRecord,
    data: SelectorData,
  ): void {
    const applicationName = field.alias || field.name;
    const variables = field.args
      ? getArgumentValues(field.args, this._variables)
      : null;
    const linkedIDs = this._recordReader.getLinkedRecordIDs(
      record,
      field.name,
      variables,
    );

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
      this._recordReader.getDataID(record),
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
        this._recordReader.getDataID(record),
        prevItem,
      );
      const linkedItem = this._traverse(field, linkedID, prevItem);
      linkedArray[nextIndex] = linkedItem;
    });
    data[applicationName] = linkedArray;
  }

  _createFragmentPointer(
    fragmentSpread: ConcreteFragmentSpread,
    record: TRecord,
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
    data[ID_KEY] = data[ID_KEY] || this._recordReader.getDataID(record);
    const variables = fragmentSpread.args
      ? getArgumentValues(fragmentSpread.args, this._variables)
      : {};
    fragmentPointers[fragmentSpread.name] = variables;
  }
}

module.exports = {read};

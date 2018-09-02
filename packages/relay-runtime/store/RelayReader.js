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

const RelayModernRecord = require('./RelayModernRecord');

const invariant = require('invariant');

const {
  CONDITION,
  DEFERRABLE_FRAGMENT_SPREAD,
  FRAGMENT_SPREAD,
  INLINE_FRAGMENT,
  LINKED_FIELD,
  SCALAR_FIELD,
} = require('../util/RelayConcreteNode');
const {
  FRAGMENTS_KEY,
  ID_KEY,
  getArgumentValues,
  getStorageKey,
} = require('./RelayStoreUtils');

import type {
  ConcreteDeferrableFragmentSpread,
  ConcreteFragmentSpread,
  ConcreteLinkedField,
  ConcreteNode,
  ConcreteScalarField,
  ConcreteSelection,
  ConcreteSelectableNode,
} from '../util/RelayConcreteNode';
import type {DataID, Variables} from '../util/RelayRuntimeTypes';
import type {RecordSource, Selector, Snapshot} from './RelayStoreTypes';
import type {
  Record,
  SelectorData,
} from 'react-relay/classic/environment/RelayCombinedEnvironmentTypes';

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
        this._createFragmentPointer(selection, record, data, this._variables);
      } else if (selection.kind === DEFERRABLE_FRAGMENT_SPREAD) {
        this._createDeferrableFragmentPointer(selection, record, data);
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
    fragmentSpread: ConcreteFragmentSpread | ConcreteDeferrableFragmentSpread,
    record: Record,
    data: SelectorData,
    variables: Variables,
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
    fragmentPointers[fragmentSpread.name] = fragmentSpread.args
      ? getArgumentValues(fragmentSpread.args, variables)
      : {};
  }

  _createDeferrableFragmentPointer(
    deferrableFragment: ConcreteDeferrableFragmentSpread,
    record: Record,
    data: SelectorData,
  ): void {
    const rootFieldValue = RelayModernRecord.getValue(
      record,
      deferrableFragment.storageKey,
    );
    const variables = {
      ...this._variables,
      [deferrableFragment.rootFieldVariable]: rootFieldValue,
    };
    this._createFragmentPointer(deferrableFragment, record, data, variables);
  }
}

module.exports = {read};

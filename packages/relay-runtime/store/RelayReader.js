/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const RelayModernRecord = require('./RelayModernRecord');

const invariant = require('invariant');

const {
  CONDITION,
  FRAGMENT_SPREAD,
  INLINE_FRAGMENT,
  LINKED_FIELD,
  MATCH_FIELD,
  SCALAR_FIELD,
} = require('../util/RelayConcreteNode');
const {
  FRAGMENTS_KEY,
  FRAGMENT_PROP_NAME_KEY,
  ID_KEY,
  MATCH_COMPONENT_KEY,
  MODULE_KEY,
  getArgumentValues,
  getStorageKey,
} = require('./RelayStoreUtils');

import type {
  ConcreteFragmentSpread,
  ConcreteLinkedField,
  ConcreteMatchField,
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
  _isMissingData: boolean;

  constructor(recordSource: RecordSource, variables: Variables) {
    this._recordSource = recordSource;
    this._seenRecords = {};
    this._isMissingData = false;
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
      isMissingData: this._isMissingData,
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
      if (record === undefined) {
        this._isMissingData = true;
      }
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
    selections: $ReadOnlyArray<ConcreteSelection>,
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
      } else if (selection.kind === MATCH_FIELD) {
        this._readMatchField(selection, record, data);
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
    const applicationName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, this._variables);
    const value = RelayModernRecord.getValue(record, storageKey);
    if (value === undefined) {
      this._isMissingData = true;
    }
    data[applicationName] = value;
  }

  _readLink(
    field: ConcreteLinkedField,
    record: Record,
    data: SelectorData,
  ): void {
    const applicationName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, this._variables);
    const linkedID = RelayModernRecord.getLinkedRecordID(record, storageKey);
    if (linkedID == null) {
      data[applicationName] = linkedID;
      if (linkedID === undefined) {
        this._isMissingData = true;
      }
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
    const applicationName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, this._variables);
    const linkedIDs = RelayModernRecord.getLinkedRecordIDs(record, storageKey);

    if (linkedIDs == null) {
      data[applicationName] = linkedIDs;
      if (linkedIDs === undefined) {
        this._isMissingData = true;
      }
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
        if (linkedID === undefined) {
          this._isMissingData = true;
        }
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
      linkedArray[nextIndex] = this._traverse(field, linkedID, prevItem);
    });
    data[applicationName] = linkedArray;
  }

  /**
   * Reads a ConcreteMatchField, which was generated from using the @match
   * directive
   */
  _readMatchField(
    field: ConcreteMatchField,
    record: Record,
    data: SelectorData,
  ): void {
    const applicationName = field.alias ?? field.name;
    const storageKey = getStorageKey(field, this._variables);
    const linkedID = RelayModernRecord.getLinkedRecordID(record, storageKey);
    if (linkedID == null) {
      data[applicationName] = linkedID;
      if (linkedID === undefined) {
        this._isMissingData = true;
      }
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

    // Instead of recursing into the traversal again, let's manually traverse
    // one level to get the record associated with the match field
    const linkedRecord = this._recordSource.get(linkedID);
    this._seenRecords[linkedID] = linkedRecord;
    if (linkedRecord == null) {
      if (linkedRecord === undefined) {
        this._isMissingData = true;
      }
      data[applicationName] = linkedRecord;
      return;
    }

    // Determine the concrete type for the match field record. The type of a
    // match field must be a union type (i.e. abstract type), so here we
    // read the concrete type on the record, which should be the type resolved
    // by the server in the response.
    const concreteType = RelayModernRecord.getType(linkedRecord);
    invariant(
      typeof concreteType === 'string',
      'RelayReader(): Expected to be able to resolve concrete type for ' +
        'field `%s` on record `%s`',
      applicationName,
      RelayModernRecord.getDataID(linkedRecord),
    );

    // If we can't find a match provided in the directive for the concrete
    // type, return null as the result
    const match = field.matchesByType[concreteType];
    if (match == null) {
      data[applicationName] = null;
      return;
    }

    // Determine the component module from the store: if the field is missing
    // it means we don't know what component to render the match with.
    const matchComponent = RelayModernRecord.getValue(
      linkedRecord,
      MATCH_COMPONENT_KEY,
    );
    if (matchComponent == null) {
      if (matchComponent === undefined) {
        this._isMissingData = true;
      }
      data[applicationName] = null;
      return;
    }

    // Otherwise, read the fragment and module associated to the concrete
    // type, and put that data with the result:
    // - For the matched fragment, create the relevant fragment pointer and add
    //   the expected fragmentPropName
    // - For the matched module, create a reference to the module
    const matchResult = {};
    this._createFragmentPointer(
      {
        kind: 'FragmentSpread',
        name: match.fragmentName,
        args: null,
      },
      linkedRecord,
      matchResult,
      this._variables,
    );
    matchResult[FRAGMENT_PROP_NAME_KEY] = match.fragmentPropName;
    matchResult[MODULE_KEY] = matchComponent;

    // Attach the match result to the data being read
    data[applicationName] = matchResult;
  }

  _createFragmentPointer(
    fragmentSpread: ConcreteFragmentSpread,
    record: Record,
    data: SelectorData,
    variables: Variables,
  ): void {
    let fragmentPointers = data[FRAGMENTS_KEY];
    if (fragmentPointers == null) {
      fragmentPointers = data[FRAGMENTS_KEY] = {};
    }
    invariant(
      typeof fragmentPointers === 'object' && fragmentPointers,
      'RelayReader: Expected fragment spread data to be an object, got `%s`.',
      fragmentPointers,
    );
    data[ID_KEY] = data[ID_KEY] ?? RelayModernRecord.getDataID(record);
    fragmentPointers[fragmentSpread.name] = fragmentSpread.args
      ? getArgumentValues(fragmentSpread.args, variables)
      : {};
  }
}

module.exports = {read};

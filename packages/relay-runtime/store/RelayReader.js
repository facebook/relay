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

const RelayFeatureFlags = require('../util/RelayFeatureFlags');
const RelayModernRecord = require('./RelayModernRecord');

const invariant = require('invariant');

const {
  CLIENT_EXTENSION,
  CONDITION,
  DEFER,
  FRAGMENT_SPREAD,
  INLINE_DATA_FRAGMENT_SPREAD,
  INLINE_FRAGMENT,
  LINKED_FIELD,
  MODULE_IMPORT,
  SCALAR_FIELD,
  STREAM,
} = require('../util/RelayConcreteNode');
const {
  FRAGMENTS_KEY,
  FRAGMENT_OWNER_KEY,
  FRAGMENT_PROP_NAME_KEY,
  ID_KEY,
  IS_WITHIN_UNMATCHED_TYPE_REFINEMENT,
  MODULE_COMPONENT_KEY,
  ROOT_ID,
  getArgumentValues,
  getStorageKey,
  getModuleComponentKey,
} = require('./RelayStoreUtils');

import type {
  ReaderFragmentSpread,
  ReaderInlineDataFragmentSpread,
  ReaderLinkedField,
  ReaderModuleImport,
  ReaderNode,
  ReaderScalarField,
  ReaderSelection,
} from '../util/ReaderNode';
import type {DataID, Variables} from '../util/RelayRuntimeTypes';
import type {
  Record,
  RecordSource,
  RequestDescriptor,
  SelectorData,
  SingularReaderSelector,
  Snapshot,
} from './RelayStoreTypes';

function read(
  recordSource: RecordSource,
  selector: SingularReaderSelector,
): Snapshot {
  const reader = new RelayReader(recordSource, selector);
  return reader.read();
}

/**
 * @private
 */
class RelayReader {
  _isMissingData: boolean;
  _isWithinUnmatchedTypeRefinement: boolean;
  _owner: RequestDescriptor;
  _recordSource: RecordSource;
  _seenRecords: {[dataID: DataID]: ?Record, ...};
  _selector: SingularReaderSelector;
  _variables: Variables;

  constructor(recordSource: RecordSource, selector: SingularReaderSelector) {
    this._isMissingData = false;
    this._isWithinUnmatchedTypeRefinement = false;
    this._owner = selector.owner;
    this._recordSource = recordSource;
    this._seenRecords = {};
    this._selector = selector;
    this._variables = selector.variables;
  }

  read(): Snapshot {
    const {node, dataID, isWithinUnmatchedTypeRefinement} = this._selector;
    const {abstractKey} = node;
    const record = this._recordSource.get(dataID);

    // Relay historically allowed child fragments to be read even if the root object
    // did not match the type of the fragment: either the root object has a different
    // concrete type than the fragment (for concrete fragments) or the root object does
    // not conform to the interface/union for abstract fragments.
    // For suspense purposes, however, we want to accurately compute whether any data
    // is missing: but if the fragment type doesn't match (or a parent type didn't
    // match), then no data is expected to be present.

    // By default data is expected to be present unless this selector was read out
    // from within a non-matching type refinement in a parent fragment:
    let isDataExpectedToBePresent = !isWithinUnmatchedTypeRefinement;

    // If this is a concrete fragment and the concrete type of the record does not
    // match, then no data is expected to be present.
    if (isDataExpectedToBePresent && abstractKey == null && record != null) {
      const recordType = RelayModernRecord.getType(record);
      if (recordType !== node.type && dataID !== ROOT_ID) {
        isDataExpectedToBePresent = false;
      }
    }

    // If this is an abstract fragment (and the precise refinement GK is enabled)
    // then data is only expected to be present if the record type is known to
    // implement the interface. If we aren't sure whether the record implements
    // the interface, that itself constitutes "expected" data being missing.
    if (
      isDataExpectedToBePresent &&
      abstractKey != null &&
      record != null &&
      RelayFeatureFlags.ENABLE_PRECISE_TYPE_REFINEMENT
    ) {
      const implementsInterface = RelayModernRecord.getValue(
        record,
        abstractKey,
      );
      if (implementsInterface === false) {
        // Type known to not implement the interface
        isDataExpectedToBePresent = false;
      } else if (implementsInterface == null) {
        // Don't know if the type implements the interface or not
        this._isMissingData = true;
      }
    }

    this._isWithinUnmatchedTypeRefinement = !isDataExpectedToBePresent;
    const data = this._traverse(node, dataID, null);
    return {
      data,
      isMissingData: this._isMissingData && isDataExpectedToBePresent,
      seenRecords: this._seenRecords,
      selector: this._selector,
    };
  }

  _traverse(
    node: ReaderNode,
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
    selections: $ReadOnlyArray<ReaderSelection>,
    record: Record,
    data: SelectorData,
  ): void {
    for (let i = 0; i < selections.length; i++) {
      const selection = selections[i];
      switch (selection.kind) {
        case SCALAR_FIELD:
          this._readScalar(selection, record, data);
          break;
        case LINKED_FIELD:
          if (selection.plural) {
            this._readPluralLink(selection, record, data);
          } else {
            this._readLink(selection, record, data);
          }
          break;
        case CONDITION:
          const conditionValue = this._getVariableValue(selection.condition);
          if (conditionValue === selection.passingValue) {
            this._traverseSelections(selection.selections, record, data);
          }
          break;
        case INLINE_FRAGMENT: {
          const {abstractKey} = selection;
          if (abstractKey == null) {
            // concrete type refinement: only read data if the type exactly matches
            const typeName = RelayModernRecord.getType(record);
            if (typeName != null && typeName === selection.type) {
              this._traverseSelections(selection.selections, record, data);
            }
          } else if (RelayFeatureFlags.ENABLE_PRECISE_TYPE_REFINEMENT) {
            // Similar to the logic in read(): data is only expected to be present
            // if the record is known to conform to the interface. If we don't know
            // whether the type conforms or not, that constitutes missing data.

            // store flags to reset after reading
            const parentIsMissingData = this._isMissingData;
            const parentIsWithinUnmatchedTypeRefinement = this
              ._isWithinUnmatchedTypeRefinement;
            const implementsInterface = RelayModernRecord.getValue(
              record,
              abstractKey,
            );
            this._isWithinUnmatchedTypeRefinement =
              parentIsWithinUnmatchedTypeRefinement ||
              implementsInterface === false;
            this._traverseSelections(selection.selections, record, data);
            this._isWithinUnmatchedTypeRefinement = parentIsWithinUnmatchedTypeRefinement;

            if (implementsInterface === false) {
              // Type known to not implement the interface, no data expected
              this._isMissingData = parentIsMissingData;
            } else if (implementsInterface == null) {
              // Don't know if the type implements the interface or not
              this._isMissingData = true;
            }
          } else {
            // legacy behavior for abstract refinements: always read even
            // if the type doesn't conform and don't reset isMissingData
            this._traverseSelections(selection.selections, record, data);
          }
          break;
        }
        case FRAGMENT_SPREAD:
          this._createFragmentPointer(selection, record, data);
          break;
        case MODULE_IMPORT:
          this._readModuleImport(selection, record, data);
          break;
        case INLINE_DATA_FRAGMENT_SPREAD:
          this._createInlineDataFragmentPointer(selection, record, data);
          break;
        case DEFER:
        case CLIENT_EXTENSION:
          const isMissingData = this._isMissingData;
          this._traverseSelections(selection.selections, record, data);
          this._isMissingData = isMissingData;
          break;
        case STREAM:
          this._traverseSelections(selection.selections, record, data);
          break;
        default:
          (selection: empty);
          invariant(
            false,
            'RelayReader(): Unexpected ast kind `%s`.',
            selection.kind,
          );
      }
    }
  }

  _readScalar(
    field: ReaderScalarField,
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
    field: ReaderLinkedField,
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
    /* $FlowFixMe(>=0.98.0 site=www,mobile,react_native_fb,oss) This comment
     * suppresses an error found when Flow v0.98 was deployed. To see the error
     * delete this comment and run Flow. */
    data[applicationName] = this._traverse(field, linkedID, prevData);
  }

  _readPluralLink(
    field: ReaderLinkedField,
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
        /* $FlowFixMe(>=0.98.0 site=www,mobile,react_native_fb,oss) This comment
         * suppresses an error found when Flow v0.98 was deployed. To see the
         * error delete this comment and run Flow. */
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
      /* $FlowFixMe(>=0.98.0 site=www,mobile,react_native_fb,oss) This comment
       * suppresses an error found when Flow v0.98 was deployed. To see the
       * error delete this comment and run Flow. */
      linkedArray[nextIndex] = this._traverse(field, linkedID, prevItem);
    });
    data[applicationName] = linkedArray;
  }

  /**
   * Reads a ReaderModuleImport, which was generated from using the @module
   * directive.
   */
  _readModuleImport(
    moduleImport: ReaderModuleImport,
    record: Record,
    data: SelectorData,
  ): void {
    // Determine the component module from the store: if the field is missing
    // it means we don't know what component to render the match with.
    const componentKey = getModuleComponentKey(moduleImport.documentName);
    const component = RelayModernRecord.getValue(record, componentKey);
    if (component == null) {
      if (component === undefined) {
        this._isMissingData = true;
      }
      return;
    }

    // Otherwise, read the fragment and module associated to the concrete
    // type, and put that data with the result:
    // - For the matched fragment, create the relevant fragment pointer and add
    //   the expected fragmentPropName
    // - For the matched module, create a reference to the module
    this._createFragmentPointer(
      {
        kind: 'FragmentSpread',
        name: moduleImport.fragmentName,
        args: null,
      },
      record,
      data,
    );
    data[FRAGMENT_PROP_NAME_KEY] = moduleImport.fragmentPropName;
    data[MODULE_COMPONENT_KEY] = component;
  }

  _createFragmentPointer(
    fragmentSpread: ReaderFragmentSpread,
    record: Record,
    data: SelectorData,
  ): void {
    let fragmentPointers = data[FRAGMENTS_KEY];
    if (fragmentPointers == null) {
      fragmentPointers = data[FRAGMENTS_KEY] = {};
    }
    invariant(
      typeof fragmentPointers === 'object' && fragmentPointers != null,
      'RelayReader: Expected fragment spread data to be an object, got `%s`.',
      fragmentPointers,
    );
    if (data[ID_KEY] == null) {
      data[ID_KEY] = RelayModernRecord.getDataID(record);
    }
    // $FlowFixMe - writing into read-only field
    fragmentPointers[fragmentSpread.name] = fragmentSpread.args
      ? getArgumentValues(fragmentSpread.args, this._variables)
      : {};
    data[FRAGMENT_OWNER_KEY] = this._owner;

    if (RelayFeatureFlags.ENABLE_PRECISE_TYPE_REFINEMENT) {
      data[
        IS_WITHIN_UNMATCHED_TYPE_REFINEMENT
      ] = this._isWithinUnmatchedTypeRefinement;
    }
  }

  _createInlineDataFragmentPointer(
    inlineDataFragmentSpread: ReaderInlineDataFragmentSpread,
    record: Record,
    data: SelectorData,
  ): void {
    let fragmentPointers = data[FRAGMENTS_KEY];
    if (fragmentPointers == null) {
      fragmentPointers = data[FRAGMENTS_KEY] = {};
    }
    invariant(
      typeof fragmentPointers === 'object' && fragmentPointers != null,
      'RelayReader: Expected fragment spread data to be an object, got `%s`.',
      fragmentPointers,
    );
    if (data[ID_KEY] == null) {
      data[ID_KEY] = RelayModernRecord.getDataID(record);
    }
    const inlineData = {};
    this._traverseSelections(
      inlineDataFragmentSpread.selections,
      record,
      inlineData,
    );
    // $FlowFixMe - writing into read-only field
    fragmentPointers[inlineDataFragmentSpread.name] = inlineData;
  }
}

module.exports = {read};

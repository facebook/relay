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
  _owner: RequestDescriptor;
  _recordSource: RecordSource;
  _seenRecords: {[dataID: DataID]: ?Record, ...};
  _selector: SingularReaderSelector;
  _variables: Variables;

  constructor(recordSource: RecordSource, selector: SingularReaderSelector) {
    this._isMissingData = false;
    this._owner = selector.owner;
    this._recordSource = recordSource;
    this._seenRecords = {};
    this._selector = selector;
    this._variables = selector.variables;
  }

  read(): Snapshot {
    const {node, dataID} = this._selector;
    const data = this._traverse(node, dataID, null);

    // Handle an edge-case in missing data-detection. Fragments
    // with a concrete type can be spread anywhere that type *might*
    // appear (ie, on parents that return an abstract type whose
    // possible types include the concrete type). In this case, Relay
    // allows trying to read the fragment data even if the actual type
    // didn't match, and returns whatever data happened to be present.
    // However, in this case it is entirely expected that fields may
    // be missing, since the concrete types don't match.
    // In this case, reset isMissingData back to false.
    // Quickly skip this check in the common case that no data was
    // missing or fragments on abstract types.
    const {abstractKey} = node;
    const record = this._recordSource.get(dataID);
    if (this._isMissingData === true && abstractKey == null && record != null) {
      const recordType = RelayModernRecord.getType(record);
      if (recordType !== node.type && dataID !== ROOT_ID) {
        // The record exists and its (concrete) type differs
        // from the fragment's concrete type: data is
        // expected to be missing, so don't flag it as such
        // since doing so could incorrectly trigger suspense.
        // NOTE `isMissingData` is short for "is missing
        // *expected* data", and the data isn't expected here.
        // Also note that the store uses a hard-code __typename
        // for the root object, while fragments on the Query
        // type will use whatever the schema names the Query type.
        // Assume fragments read on the root object have the right
        // type and trust isMissingData.
        this._isMissingData = false;
      }
    }

    // Handle a related edge-case: if the fragment type is *abstract*.
    if (
      abstractKey != null &&
      record != null &&
      RelayFeatureFlags.ENABLE_PRECISE_TYPE_REFINEMENT
    ) {
      // Abstract type refinement: if the fragment type is *abstract*,
      // then data is only expected to be present if the type implements
      // the interface (or is a member of the union), so there are 3
      // cases we need to handle:
      // - Type known to _not_ implement the interface: reset value for isMissingData.
      // - Type is known _to_ implement the interface: don't reset value isMissingData.
      // - Unknown whether the type implements the interface: treat the data as missing;
      //   we do this because the Relay Compiler guarantees that the type discriminator
      //   will always be fetched.
      const implementsInterface = RelayModernRecord.getValue(
        record,
        abstractKey,
      );
      if (implementsInterface === false) {
        // type is *known* to not implement the interface, so fields aren't
        // expected to be present. reset isMissing(Expected)Data.
        this._isMissingData = false;
      } else if (implementsInterface == null) {
        // we don't know if the type implements the interface or not, which
        // constitutes data being missing
        this._isMissingData = true;
      } // else implementsInterface === true: we don't need to reset isMissingData
    }

    return {
      data,
      isMissingData: this._isMissingData,
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
            // Abstract refinement: similar to the logic at the fragment root:
            // - Type known to _not_ implement the interface: reset value for isMissingData.
            // - Type is known _to_ implement the interface: don't reset value isMissingData.
            // - Unknown whether the type implements the interface: treat the data as missing;
            //   we do this because the Relay Compiler guarantees that the type discriminator
            //   will always be fetched.
            const isMissingData = this._isMissingData;
            this._traverseSelections(selection.selections, record, data);
            const implementsInterface = RelayModernRecord.getValue(
              record,
              abstractKey,
            );
            if (implementsInterface === false) {
              // type doesn't implement the interface so these fields are
              // not expected to be present.
              this._isMissingData = isMissingData;
            } else if (implementsInterface == null) {
              // we don't know if the type implements the interface or not,
              // which counts as something missing
              this._isMissingData = true;
            } // else implementsInterface === true: we don't need to reset isMissingData
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

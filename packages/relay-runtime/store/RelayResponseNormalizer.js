/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const RelayModernRecord = require('./RelayModernRecord');
const RelayProfiler = require('../util/RelayProfiler');

const invariant = require('invariant');
const warning = require('warning');

const {
  CONDITION,
  CLIENT_EXTENSION,
  DEFER,
  INLINE_FRAGMENT,
  LINKED_FIELD,
  LINKED_HANDLE,
  MODULE_IMPORT,
  SCALAR_FIELD,
  SCALAR_HANDLE,
  STREAM,
} = require('../util/RelayConcreteNode');
const {generateClientID, isClientID} = require('./ClientID');
const {createNormalizationSelector} = require('./RelayModernSelector');
const {
  getArgumentValues,
  getHandleStorageKey,
  getModuleComponentKey,
  getModuleOperationKey,
  getStorageKey,
  TYPENAME_KEY,
  ROOT_ID,
} = require('./RelayStoreUtils');

import type {PayloadData} from '../network/RelayNetworkTypes';
import type {
  NormalizationDefer,
  NormalizationLinkedField,
  NormalizationModuleImport,
  NormalizationNode,
  NormalizationScalarField,
  NormalizationStream,
} from '../util/NormalizationNode';
import type {DataID, Variables} from '../util/RelayRuntimeTypes';
import type {
  HandleFieldPayload,
  IncrementalDataPlaceholder,
  ModuleImportPayload,
  MutableRecordSource,
  NormalizationSelector,
  Record,
  RelayResponsePayload,
  RequestDescriptor,
} from './RelayStoreTypes';

export type GetDataID = (
  fieldValue: {[string]: mixed, ...},
  typeName: string,
) => mixed;

export type NormalizationOptions = {|
  +getDataID: GetDataID,
  +treatMissingFieldsAsNull: boolean,
  +path?: $ReadOnlyArray<string>,
  +request: RequestDescriptor,
|};

/**
 * Normalizes the results of a query and standard GraphQL response, writing the
 * normalized records/fields into the given MutableRecordSource.
 */
function normalize(
  recordSource: MutableRecordSource,
  selector: NormalizationSelector,
  response: PayloadData,
  options: NormalizationOptions,
): RelayResponsePayload {
  const {dataID, node, variables} = selector;
  const normalizer = new RelayResponseNormalizer(
    recordSource,
    variables,
    options,
  );
  return normalizer.normalizeResponse(node, dataID, response);
}

/**
 * @private
 *
 * Helper for handling payloads.
 */
class RelayResponseNormalizer {
  _getDataId: GetDataID;
  _handleFieldPayloads: Array<HandleFieldPayload>;
  _treatMissingFieldsAsNull: boolean;
  _incrementalPlaceholders: Array<IncrementalDataPlaceholder>;
  _isClientExtension: boolean;
  _moduleImportPayloads: Array<ModuleImportPayload>;
  _path: Array<string>;
  _recordSource: MutableRecordSource;
  _request: RequestDescriptor;
  _variables: Variables;

  constructor(
    recordSource: MutableRecordSource,
    variables: Variables,
    options: NormalizationOptions,
  ) {
    this._getDataId = options.getDataID;
    this._handleFieldPayloads = [];
    this._treatMissingFieldsAsNull = options.treatMissingFieldsAsNull;
    this._incrementalPlaceholders = [];
    this._isClientExtension = false;
    this._moduleImportPayloads = [];
    this._path = options.path ? [...options.path] : [];
    this._recordSource = recordSource;
    this._request = options.request;
    this._variables = variables;
  }

  normalizeResponse(
    node: NormalizationNode,
    dataID: DataID,
    data: PayloadData,
  ): RelayResponsePayload {
    const record = this._recordSource.get(dataID);
    invariant(
      record,
      'RelayResponseNormalizer(): Expected root record `%s` to exist.',
      dataID,
    );
    this._traverseSelections(node, record, data);
    return {
      errors: null,
      fieldPayloads: this._handleFieldPayloads,
      incrementalPlaceholders: this._incrementalPlaceholders,
      moduleImportPayloads: this._moduleImportPayloads,
      source: this._recordSource,
      isFinal: false,
    };
  }

  _getVariableValue(name: string): mixed {
    invariant(
      this._variables.hasOwnProperty(name),
      'RelayResponseNormalizer(): Undefined variable `%s`.',
      name,
    );
    return this._variables[name];
  }

  _getRecordType(data: PayloadData): string {
    const typeName = (data: any)[TYPENAME_KEY];
    invariant(
      typeName != null,
      'RelayResponseNormalizer(): Expected a typename for record `%s`.',
      JSON.stringify(data, null, 2),
    );
    return typeName;
  }

  _traverseSelections(
    node: NormalizationNode,
    record: Record,
    data: PayloadData,
  ): void {
    for (let i = 0; i < node.selections.length; i++) {
      const selection = node.selections[i];
      switch (selection.kind) {
        case SCALAR_FIELD:
        case LINKED_FIELD:
          this._normalizeField(node, selection, record, data);
          break;
        case CONDITION:
          const conditionValue = this._getVariableValue(selection.condition);
          if (conditionValue === selection.passingValue) {
            this._traverseSelections(selection, record, data);
          }
          break;
        case INLINE_FRAGMENT:
          const typeName = RelayModernRecord.getType(record);
          if (typeName === selection.type) {
            this._traverseSelections(selection, record, data);
          }
          break;
        case LINKED_HANDLE:
        case SCALAR_HANDLE:
          const args = selection.args
            ? getArgumentValues(selection.args, this._variables)
            : {};
          const fieldKey = getStorageKey(selection, this._variables);
          const handleKey = getHandleStorageKey(selection, this._variables);
          this._handleFieldPayloads.push({
            args,
            dataID: RelayModernRecord.getDataID(record),
            fieldKey,
            handle: selection.handle,
            handleKey,
          });
          break;
        case MODULE_IMPORT:
          this._normalizeModuleImport(node, selection, record, data);
          break;
        case DEFER:
          this._normalizeDefer(selection, record, data);
          break;
        case STREAM:
          this._normalizeStream(selection, record, data);
          break;
        case CLIENT_EXTENSION:
          const isClientExtension = this._isClientExtension;
          this._isClientExtension = true;
          this._traverseSelections(selection, record, data);
          this._isClientExtension = isClientExtension;
          break;
        default:
          (selection: empty);
          invariant(
            false,
            'RelayResponseNormalizer(): Unexpected ast kind `%s`.',
            selection.kind,
          );
      }
    }
  }

  _normalizeDefer(
    defer: NormalizationDefer,
    record: Record,
    data: PayloadData,
  ) {
    const isDeferred = defer.if === null || this._getVariableValue(defer.if);
    if (__DEV__) {
      warning(
        typeof isDeferred === 'boolean',
        'RelayResponseNormalizer: Expected value for @defer `if` argument to ' +
          'be a boolean, got `%s`.',
        isDeferred,
      );
    }
    if (isDeferred === false) {
      // If defer is disabled there will be no additional response chunk:
      // normalize the data already present.
      this._traverseSelections(defer, record, data);
    } else {
      // Otherwise data *for this selection* should not be present: enqueue
      // metadata to process the subsequent response chunk.
      this._incrementalPlaceholders.push({
        kind: 'defer',
        data,
        label: defer.label,
        path: [...this._path],
        selector: createNormalizationSelector(
          defer,
          RelayModernRecord.getDataID(record),
          this._variables,
        ),
        typeName: RelayModernRecord.getType(record),
      });
    }
  }

  _normalizeStream(
    stream: NormalizationStream,
    record: Record,
    data: PayloadData,
  ) {
    // Always normalize regardless of whether streaming is enabled or not,
    // this populates the initial array value (including any items when
    // initial_count > 0).
    this._traverseSelections(stream, record, data);
    const isStreamed = stream.if === null || this._getVariableValue(stream.if);
    if (__DEV__) {
      warning(
        typeof isStreamed === 'boolean',
        'RelayResponseNormalizer: Expected value for @stream `if` argument ' +
          'to be a boolean, got `%s`.',
        isStreamed,
      );
    }
    if (isStreamed === true) {
      // If streaming is enabled, *also* emit metadata to process any
      // response chunks that may be delivered.
      this._incrementalPlaceholders.push({
        kind: 'stream',
        label: stream.label,
        path: [...this._path],
        parentID: RelayModernRecord.getDataID(record),
        node: stream,
        variables: this._variables,
      });
    }
  }

  _normalizeModuleImport(
    parent: NormalizationNode,
    moduleImport: NormalizationModuleImport,
    record: Record,
    data: PayloadData,
  ) {
    invariant(
      typeof data === 'object' && data,
      'RelayResponseNormalizer: Expected data for @module to be an object.',
    );
    const typeName: string = RelayModernRecord.getType(record);
    const componentKey = getModuleComponentKey(moduleImport.documentName);
    const componentReference = data[componentKey];
    RelayModernRecord.setValue(
      record,
      componentKey,
      componentReference ?? null,
    );
    const operationKey = getModuleOperationKey(moduleImport.documentName);
    const operationReference = data[operationKey];
    RelayModernRecord.setValue(
      record,
      operationKey,
      operationReference ?? null,
    );
    if (operationReference != null) {
      this._moduleImportPayloads.push({
        data,
        dataID: RelayModernRecord.getDataID(record),
        operationReference,
        path: [...this._path],
        typeName,
        variables: this._variables,
      });
    }
  }

  _normalizeField(
    parent: NormalizationNode,
    selection: NormalizationLinkedField | NormalizationScalarField,
    record: Record,
    data: PayloadData,
  ) {
    invariant(
      typeof data === 'object' && data,
      'writeField(): Expected data for field `%s` to be an object.',
      selection.name,
    );
    const responseKey = selection.alias || selection.name;
    const storageKey = getStorageKey(selection, this._variables);
    const fieldValue = data[responseKey];
    if (fieldValue == null) {
      if (!this._treatMissingFieldsAsNull && fieldValue === undefined) {
        // Fields that are missing in the response are not set on the record.
        // There are three main cases where this can occur:
        // - Inside a client extension: the server will not generally return
        //   values for these fields, but a local update may provide them.
        // - Fields on abstract types: these may be missing if the concrete
        //   response type does not match the abstract type.
        //
        // Otherwise, missing fields usually indicate a server or user error (
        // the latter for manually constructed payloads).
        if (__DEV__) {
          warning(
            this._isClientExtension ||
              (parent.kind === LINKED_FIELD && parent.concreteType == null)
              ? true
              : Object.prototype.hasOwnProperty.call(data, responseKey),
            'RelayResponseNormalizer: Payload did not contain a value ' +
              'for field `%s: %s`. Check that you are parsing with the same ' +
              'query that was used to fetch the payload.',
            responseKey,
            storageKey,
          );
        }
        return;
      }
      RelayModernRecord.setValue(record, storageKey, null);
      return;
    }

    if (selection.kind === SCALAR_FIELD) {
      RelayModernRecord.setValue(record, storageKey, fieldValue);
    } else if (selection.kind === LINKED_FIELD) {
      this._path.push(responseKey);
      if (selection.plural) {
        this._normalizePluralLink(selection, record, storageKey, fieldValue);
      } else {
        this._normalizeLink(selection, record, storageKey, fieldValue);
      }
      this._path.pop();
    } else {
      (selection: empty);
      invariant(
        false,
        'RelayResponseNormalizer(): Unexpected ast kind `%s` during normalization.',
        selection.kind,
      );
    }
  }

  _normalizeLink(
    field: NormalizationLinkedField,
    record: Record,
    storageKey: string,
    fieldValue: mixed,
  ): void {
    invariant(
      typeof fieldValue === 'object' && fieldValue,
      'RelayResponseNormalizer: Expected data for field `%s` to be an object.',
      storageKey,
    );
    const nextID =
      this._getDataId(
        /* $FlowFixMe(>=0.98.0 site=www,mobile,react_native_fb,oss) This comment
         * suppresses an error found when Flow v0.98 was deployed. To see the
         * error delete this comment and run Flow. */
        fieldValue,
        /* $FlowFixMe(>=0.98.0 site=www,mobile,react_native_fb,oss) This comment
         * suppresses an error found when Flow v0.98 was deployed. To see the
         * error delete this comment and run Flow. */
        field.concreteType ?? this._getRecordType(fieldValue),
      ) ||
      // Reuse previously generated client IDs
      RelayModernRecord.getLinkedRecordID(record, storageKey) ||
      generateClientID(RelayModernRecord.getDataID(record), storageKey);
    invariant(
      typeof nextID === 'string',
      'RelayResponseNormalizer: Expected id on field `%s` to be a string.',
      storageKey,
    );
    RelayModernRecord.setLinkedRecordID(record, storageKey, nextID);
    let nextRecord = this._recordSource.get(nextID);
    if (!nextRecord) {
      /* $FlowFixMe(>=0.98.0 site=www,mobile,react_native_fb,oss) This comment
       * suppresses an error found when Flow v0.98 was deployed. To see the
       * error delete this comment and run Flow. */
      const typeName = field.concreteType || this._getRecordType(fieldValue);
      nextRecord = RelayModernRecord.create(nextID, typeName);
      this._recordSource.set(nextID, nextRecord);
    } else if (__DEV__) {
      this._validateRecordType(nextRecord, field, fieldValue);
    }
    /* $FlowFixMe(>=0.98.0 site=www,mobile,react_native_fb,oss) This comment
     * suppresses an error found when Flow v0.98 was deployed. To see the error
     * delete this comment and run Flow. */
    this._traverseSelections(field, nextRecord, fieldValue);
  }

  _normalizePluralLink(
    field: NormalizationLinkedField,
    record: Record,
    storageKey: string,
    fieldValue: mixed,
  ): void {
    invariant(
      Array.isArray(fieldValue),
      'RelayResponseNormalizer: Expected data for field `%s` to be an array ' +
        'of objects.',
      storageKey,
    );
    const prevIDs = RelayModernRecord.getLinkedRecordIDs(record, storageKey);
    const nextIDs = [];
    fieldValue.forEach((item, nextIndex) => {
      // validate response data
      if (item == null) {
        nextIDs.push(item);
        return;
      }
      this._path.push(String(nextIndex));
      invariant(
        typeof item === 'object',
        'RelayResponseNormalizer: Expected elements for field `%s` to be ' +
          'objects.',
        storageKey,
      );
      const nextID =
        this._getDataId(
          /* $FlowFixMe(>=0.98.0 site=www,mobile,react_native_fb,oss) This comment
           * suppresses an error found when Flow v0.98 was deployed. To see the
           * error delete this comment and run Flow. */
          item,
          /* $FlowFixMe(>=0.98.0 site=www,mobile,react_native_fb,oss) This comment
           * suppresses an error found when Flow v0.98 was deployed. To see the
           * error delete this comment and run Flow. */
          field.concreteType ?? this._getRecordType(item),
        ) ||
        (prevIDs && prevIDs[nextIndex]) || // Reuse previously generated client IDs:
        generateClientID(
          RelayModernRecord.getDataID(record),
          storageKey,
          nextIndex,
        );
      invariant(
        typeof nextID === 'string',
        'RelayResponseNormalizer: Expected id of elements of field `%s` to ' +
          'be strings.',
        storageKey,
      );

      nextIDs.push(nextID);
      let nextRecord = this._recordSource.get(nextID);
      if (!nextRecord) {
        /* $FlowFixMe(>=0.98.0 site=www,mobile,react_native_fb,oss) This comment
         * suppresses an error found when Flow v0.98 was deployed. To see the
         * error delete this comment and run Flow. */
        const typeName = field.concreteType || this._getRecordType(item);
        nextRecord = RelayModernRecord.create(nextID, typeName);
        this._recordSource.set(nextID, nextRecord);
      } else if (__DEV__) {
        this._validateRecordType(nextRecord, field, item);
      }
      /* $FlowFixMe(>=0.98.0 site=www,mobile,react_native_fb,oss) This comment
       * suppresses an error found when Flow v0.98 was deployed. To see the
       * error delete this comment and run Flow. */
      this._traverseSelections(field, nextRecord, item);
      this._path.pop();
    });
    RelayModernRecord.setLinkedRecordIDs(record, storageKey, nextIDs);
  }

  /**
   * Warns if the type of the record does not match the type of the field/payload.
   */
  _validateRecordType(
    record: Record,
    field: NormalizationLinkedField,
    payload: Object,
  ): void {
    const typeName = field.concreteType ?? this._getRecordType(payload);
    const dataID = RelayModernRecord.getDataID(record);
    warning(
      (isClientID(dataID) && dataID !== ROOT_ID) ||
        RelayModernRecord.getType(record) === typeName,
      'RelayResponseNormalizer: Invalid record `%s`. Expected %s to be ' +
        'consistent, but the record was assigned conflicting types `%s` ' +
        'and `%s`. The GraphQL server likely violated the globally unique ' +
        'id requirement by returning the same id for different objects.',
      dataID,
      TYPENAME_KEY,
      RelayModernRecord.getType(record),
      typeName,
    );
  }
}

const instrumentedNormalize: typeof normalize = RelayProfiler.instrument(
  'RelayResponseNormalizer.normalize',
  normalize,
);

module.exports = {normalize: instrumentedNormalize};

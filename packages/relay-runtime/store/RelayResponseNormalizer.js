/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const RelayModernRecord = require('./RelayModernRecord');
const RelayProfiler = require('../util/RelayProfiler');

const generateRelayClientID = require('./generateRelayClientID');
const invariant = require('invariant');
const warning = require('warning');

const {
  CONDITION,
  FRAGMENT,
  FRAGMENT_SPREAD,
  INLINE_FRAGMENT,
  LINKED_FIELD,
  LINKED_HANDLE,
  MATCH_FIELD,
  SCALAR_FIELD,
  SCALAR_HANDLE,
} = require('../util/RelayConcreteNode');
const {
  getArgumentValues,
  getHandleStorageKey,
  getStorageKey,
  MATCH_FRAGMENT_KEY,
  TYPENAME_KEY,
} = require('./RelayStoreUtils');

import type {PayloadData} from '../network/RelayNetworkTypes';
import type {
  NormalizationField,
  NormalizationLinkedField,
  NormalizationMatchField,
  NormalizationNode,
} from '../util/NormalizationNode';
import type {DataID, Variables} from '../util/RelayRuntimeTypes';
import type {
  HandleFieldPayload,
  MatchFieldPayload,
  MutableRecordSource,
  NormalizationSelector,
} from './RelayStoreTypes';
import type {Record} from 'react-relay/classic/environment/RelayCombinedEnvironmentTypes';

export type NormalizationOptions = {handleStrippedNulls: boolean};

export type NormalizedResponse = {|
  fieldPayloads: Array<HandleFieldPayload>,
  matchPayloads: Array<MatchFieldPayload>,
|};

/**
 * Normalizes the results of a query and standard GraphQL response, writing the
 * normalized records/fields into the given MutableRecordSource.
 *
 * If handleStrippedNulls is true, will replace fields on the Selector that
 * are not present in the response with null. Otherwise will leave fields unset.
 */
function normalize(
  recordSource: MutableRecordSource,
  selector: NormalizationSelector,
  response: PayloadData,
  options: NormalizationOptions = {handleStrippedNulls: false},
): NormalizedResponse {
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
  _handleFieldPayloads: Array<HandleFieldPayload>;
  _handleStrippedNulls: boolean;
  _matchFieldPayloads: Array<MatchFieldPayload>;
  _recordSource: MutableRecordSource;
  _variables: Variables;

  constructor(
    recordSource: MutableRecordSource,
    variables: Variables,
    options: NormalizationOptions,
  ) {
    this._handleFieldPayloads = [];
    this._handleStrippedNulls = options.handleStrippedNulls;
    this._matchFieldPayloads = [];
    this._recordSource = recordSource;
    this._variables = variables;
  }

  normalizeResponse(
    node: NormalizationNode,
    dataID: DataID,
    data: PayloadData,
  ): NormalizedResponse {
    const record = this._recordSource.get(dataID);
    invariant(
      record,
      'RelayResponseNormalizer(): Expected root record `%s` to exist.',
      dataID,
    );
    this._traverseSelections(node, record, data);
    return {
      fieldPayloads: this._handleFieldPayloads,
      matchPayloads: this._matchFieldPayloads,
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
    node.selections.forEach(selection => {
      if (selection.kind === SCALAR_FIELD || selection.kind === LINKED_FIELD) {
        this._normalizeField(node, selection, record, data);
      } else if (selection.kind === CONDITION) {
        const conditionValue = this._getVariableValue(selection.condition);
        if (conditionValue === selection.passingValue) {
          this._traverseSelections(selection, record, data);
        }
      } else if (selection.kind === INLINE_FRAGMENT) {
        const typeName = RelayModernRecord.getType(record);
        if (typeName === selection.type) {
          this._traverseSelections(selection, record, data);
        }
      } else if (
        selection.kind === LINKED_HANDLE ||
        selection.kind === SCALAR_HANDLE
      ) {
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
      } else if (selection.kind === MATCH_FIELD) {
        this._normalizeMatchField(node, selection, record, data);
      } else if (
        selection.kind === FRAGMENT ||
        selection.kind === FRAGMENT_SPREAD
      ) {
        invariant(
          false,
          'RelayResponseNormalizer(): Unexpected ast kind `%s`.',
          selection.kind,
        );
      } else {
        (selection: empty);
        invariant(
          false,
          'RelayResponseNormalizer(): Unexpected ast kind `%s`.',
          selection.kind,
        );
      }
    });
  }

  _normalizeMatchField(
    parent: NormalizationNode,
    field: NormalizationMatchField,
    record: Record,
    data: PayloadData,
  ) {
    invariant(
      typeof data === 'object' && data,
      'writeField(): Expected data for field `%s` to be an object.',
      field.name,
    );
    const responseKey = field.alias || field.name;
    const storageKey = getStorageKey(field, this._variables);
    const fieldValue = data[responseKey];
    if (fieldValue == null) {
      if (fieldValue === undefined && !this._handleStrippedNulls) {
        // If we're not stripping nulls, undefined fields are unset
        return;
      }
      if (__DEV__) {
        warning(
          parent.kind === LINKED_FIELD && parent.concreteType == null
            ? true
            : Object.prototype.hasOwnProperty.call(data, responseKey),
          'RelayResponseNormalizer(): Payload did not contain a value ' +
            'for field `%s: %s`. Check that you are parsing with the same ' +
            'query that was used to fetch the payload.',
          responseKey,
          storageKey,
        );
      }
      RelayModernRecord.setValue(record, storageKey, null);
      return;
    }
    invariant(
      typeof fieldValue === 'object' && fieldValue,
      'RelayResponseNormalizer: Expected data for field `%s` to be an object.',
      storageKey,
    );
    const typeName: string = this._getRecordType(fieldValue);
    const match = field.matchesByType[typeName];
    if (match == null) {
      RelayModernRecord.setValue(record, storageKey, null);
      return;
    }
    const nextID =
      fieldValue.id ||
      // Reuse previously generated client IDs
      RelayModernRecord.getLinkedRecordID(record, storageKey) ||
      generateRelayClientID(RelayModernRecord.getDataID(record), storageKey);
    invariant(
      typeof nextID === 'string',
      'RelayResponseNormalizer: Expected id on field `%s` to be a string.',
      storageKey,
    );
    RelayModernRecord.setLinkedRecordID(record, storageKey, nextID);
    let nextRecord = this._recordSource.get(nextID);
    if (!nextRecord) {
      nextRecord = RelayModernRecord.create(nextID, typeName);
      this._recordSource.set(nextID, nextRecord);
    } else if (__DEV__) {
      this._validateRecordType(nextRecord, field, fieldValue);
    }
    const operationReference = fieldValue[MATCH_FRAGMENT_KEY];
    if (operationReference != null) {
      this._matchFieldPayloads.push({
        operationReference,
        dataID: nextID,
        data: fieldValue,
        typeName,
        variables: this._variables,
      });
    }
  }

  _normalizeField(
    parent: NormalizationNode,
    selection: NormalizationField,
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
      if (fieldValue === undefined && !this._handleStrippedNulls) {
        // If we're not stripping nulls, undefined fields are unset
        return;
      }
      if (__DEV__) {
        warning(
          parent.kind === LINKED_FIELD && parent.concreteType == null
            ? true
            : Object.prototype.hasOwnProperty.call(data, responseKey),
          'RelayResponseNormalizer(): Payload did not contain a value ' +
            'for field `%s: %s`. Check that you are parsing with the same ' +
            'query that was used to fetch the payload.',
          responseKey,
          storageKey,
        );
      }
      RelayModernRecord.setValue(record, storageKey, null);
      return;
    }

    if (selection.kind === SCALAR_FIELD) {
      RelayModernRecord.setValue(record, storageKey, fieldValue);
    } else if (selection.kind === LINKED_FIELD) {
      if (selection.plural) {
        this._normalizePluralLink(selection, record, storageKey, fieldValue);
      } else {
        this._normalizeLink(selection, record, storageKey, fieldValue);
      }
    } else if (selection.kind === MATCH_FIELD) {
      invariant(
        false,
        'RelayResponseNormalizer(): Unexpected ast kind `%s` during normalization.',
        selection.kind,
      );
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
      fieldValue.id ||
      // Reuse previously generated client IDs
      RelayModernRecord.getLinkedRecordID(record, storageKey) ||
      generateRelayClientID(RelayModernRecord.getDataID(record), storageKey);
    invariant(
      typeof nextID === 'string',
      'RelayResponseNormalizer: Expected id on field `%s` to be a string.',
      storageKey,
    );
    RelayModernRecord.setLinkedRecordID(record, storageKey, nextID);
    let nextRecord = this._recordSource.get(nextID);
    if (!nextRecord) {
      const typeName = field.concreteType || this._getRecordType(fieldValue);
      nextRecord = RelayModernRecord.create(nextID, typeName);
      this._recordSource.set(nextID, nextRecord);
    } else if (__DEV__) {
      this._validateRecordType(nextRecord, field, fieldValue);
    }
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
      invariant(
        typeof item === 'object',
        'RelayResponseNormalizer: Expected elements for field `%s` to be ' +
          'objects.',
        storageKey,
      );

      const nextID =
        item.id ||
        (prevIDs && prevIDs[nextIndex]) || // Reuse previously generated client IDs
        generateRelayClientID(
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
        const typeName = field.concreteType || this._getRecordType(item);
        nextRecord = RelayModernRecord.create(nextID, typeName);
        this._recordSource.set(nextID, nextRecord);
      } else if (__DEV__) {
        this._validateRecordType(nextRecord, field, item);
      }
      this._traverseSelections(field, nextRecord, item);
    });
    RelayModernRecord.setLinkedRecordIDs(record, storageKey, nextIDs);
  }

  /**
   * Warns if the type of the record does not match the type of the field/payload.
   */
  _validateRecordType(
    record: Record,
    field: NormalizationLinkedField | NormalizationMatchField,
    payload: Object,
  ): void {
    const typeName =
      field.kind === 'LinkedField'
        ? field.concreteType || this._getRecordType(payload)
        : this._getRecordType(payload);
    warning(
      RelayModernRecord.getType(record) === typeName,
      'RelayResponseNormalizer: Invalid record `%s`. Expected %s to be ' +
        'be consistent, but the record was assigned conflicting types `%s` ' +
        'and `%s`. The GraphQL server likely violated the globally unique ' +
        'id requirement by returning the same id for different objects.',
      RelayModernRecord.getDataID(record),
      TYPENAME_KEY,
      RelayModernRecord.getType(record),
      typeName,
    );
  }
}

// eslint-disable-next-line no-func-assign
normalize = RelayProfiler.instrument(
  'RelayResponseNormalizer.normalize',
  normalize,
);

module.exports = {normalize};

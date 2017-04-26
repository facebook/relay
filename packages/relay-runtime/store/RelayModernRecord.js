/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayModernRecord
 * @flow
 */

'use strict';

const areEqual = require('areEqual');
const deepFreeze = require('deepFreeze');
const forEachObject = require('forEachObject');
const invariant = require('invariant');

const {
  ID_KEY,
  REF_KEY,
  REFS_KEY,
  TYPENAME_KEY,
  UNPUBLISH_FIELD_SENTINEL,
} = require('RelayStoreUtils');

import type {
  Record,
} from 'RelayCombinedEnvironmentTypes';
import type {DataID} from 'RelayInternalTypes';

/**
 * @public
 *
 * Low-level record manipulation methods.
 *
 * A note about perf: we use long-hand property access rather than computed
 * properties in this file for speed ie.
 *
 *    const object = {};
 *    object[KEY] = value;
 *    record[storageKey] = object;
 *
 * instead of:
 *
 *    record[storageKey] = {
 *      [KEY]: value,
 *    };
 *
 * The latter gets transformed by Babel into something like:
 *
 *    function _defineProperty(obj, key, value) {
 *      if (key in obj) {
 *        Object.defineProperty(obj, key, {
 *          value: value,
 *          enumerable: true,
 *          configurable: true,
 *          writable: true,
 *        });
 *      } else {
 *        obj[key] = value;
 *      }
 *      return obj;
 *    }
 *
 *    record[storageKey] = _defineProperty({}, KEY, value);
 *
 * A quick benchmark shows that computed property access is an order of
 * magnitude slower (times in seconds for 100,000 iterations):
 *
 *               best     avg     sd
 *    computed 0.02175 0.02292 0.00113
 *      manual 0.00110 0.00123 0.00008
 */

/**
 * @public
 *
 * Clone a record.
 */
function clone(record: Record): Record {
  return {
    ...record,
  };
}

/**
 * @public
 *
 * Copies all fields from `source` to `sink`, excluding `__id` and `__typename`.
 *
 * NOTE: This function does not treat `id` specially. To preserve the id,
 * manually reset it after calling this function. Also note that values are
 * copied by reference and not value; callers should ensure that values are
 * copied on write.
 */
function copyFields(source: Record, sink: Record): void {
  forEachObject(source, (value, key) => {
    if (key !== ID_KEY && key !== TYPENAME_KEY) {
      sink[key] = value;
    }
  });
}

/**
 * @public
 *
 * Create a new record.
 */
function create(dataID: DataID, typeName: string): Record {
  // See perf note above for why we aren't using computed property access.
  const record = {};
  record[ID_KEY] = dataID;
  record[TYPENAME_KEY] = typeName;
  return record;
}

/**
 * @public
 *
 * Get the record's `id` if available or the client-generated identifier.
 */
function getDataID(record: Record): DataID {
  return (record[ID_KEY]: any);
}

/**
 * @public
 *
 * Get the concrete type of the record.
 */
function getType(record: Record): string {
  return (record[TYPENAME_KEY]: any);
}

/**
 * @public
 *
 * Get a scalar (non-link) field value.
 */
function getValue(record: Record, storageKey: string): mixed {
  const value = record[storageKey];
  if (value && typeof value === 'object') {
    invariant(
      !value.hasOwnProperty(REF_KEY) &&
      !value.hasOwnProperty(REFS_KEY),
      'RelayModernRecord.getValue(): Expected a scalar (non-link) value for `%s.%s` ' +
      'but found %s.',
      record[ID_KEY],
      storageKey,
      value.hasOwnProperty(REF_KEY) ? 'a linked record' : 'plural linked records'
    );
  }
  return value;
}

/**
 * @public
 *
 * Get the value of a field as a reference to another record. Throws if the
 * field has a different type.
 */
function getLinkedRecordID(record: Record, storageKey: string): ?DataID {
  const link = record[storageKey];
  if (link == null) {
    return link;
  }
  invariant(
    typeof link === 'object' && link && typeof link[REF_KEY] === 'string',
    'RelayModernRecord.getLinkedRecordID(): Expected `%s.%s` to be a linked ID, ' +
    'was `%s`.',
    record[ID_KEY],
    storageKey,
    link
  );
  return link[REF_KEY];
}

/**
 * @public
 *
 * Get the value of a field as a list of references to other records. Throws if
 * the field has a different type.
 */
function getLinkedRecordIDs(record: Record, storageKey: string): ?Array<?DataID> {
  const links = record[storageKey];
  if (links == null) {
    return links;
  }
  invariant(
    typeof links === 'object' &&
    Array.isArray(links[REFS_KEY]),
    'RelayModernRecord.getLinkedRecordIDs(): Expected `%s.%s` to contain an array ' +
    'of linked IDs, got `%s`.',
    record[ID_KEY],
    storageKey,
    JSON.stringify(links)
  );
  // assume items of the array are ids
  return (links[REFS_KEY]: any);
}

/**
 * @public
 *
 * Compares the fields of a previous and new record, returning either the
 * previous record if all fields are equal or a new record (with merged fields)
 * if any fields have changed.
 */
function update(prevRecord: Record, nextRecord: Record): Record {
  let updated: ?Record;
  const keys = Object.keys(nextRecord);
  for (let ii = 0; ii < keys.length; ii++) {
    const key = keys[ii];
    if (updated || !areEqual(prevRecord[key], nextRecord[key])) {
      updated = updated || {...prevRecord};
      if (nextRecord[key] !== UNPUBLISH_FIELD_SENTINEL) {
        updated[key] = nextRecord[key];
      } else {
        delete updated[key];
      }
    }
  }
  return updated || prevRecord;
}

/**
 * @public
 *
 * Returns a new record with the contents of the given records. Fields in the
 * second record will overwrite identical fields in the first record.
 */
function merge(record1: Record, record2: Record): Record {
  return Object.assign({}, record1, record2);
}

/**
 * @public
 *
 * Prevent modifications to the record. Attempts to call `set*` functions on a
 * frozen record will fatal at runtime.
 */
function freeze(record: Record): void {
  deepFreeze(record);
}

/**
 * @public
 *
 * Set the value of a storageKey to a scalar.
 */
function setValue(record: Record, storageKey: string, value: mixed): void {
  record[storageKey] = value;
}

/**
 * @public
 *
 * Set the value of a field to a reference to another record.
 */
function setLinkedRecordID(
  record: Record,
  storageKey: string,
  linkedID: DataID
): void {
  // See perf note above for why we aren't using computed property access.
  const link = {};
  link[REF_KEY] = linkedID;
  record[storageKey] = link;
}

/**
 * @public
 *
 * Set the value of a field to a list of references other records.
 */
function setLinkedRecordIDs(
  record: Record,
  storageKey: string,
  linkedIDs: Array<?DataID>
): void {
  // See perf note above for why we aren't using computed property access.
  const links = {};
  links[REFS_KEY] = linkedIDs;
  record[storageKey] = links;
}

module.exports = {
  clone,
  copyFields,
  create,
  freeze,
  getDataID,
  getLinkedRecordID,
  getLinkedRecordIDs,
  getType,
  getValue,
  merge,
  setValue,
  setLinkedRecordID,
  setLinkedRecordIDs,
  update,
};

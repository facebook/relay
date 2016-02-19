/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayFragmentPointer
 * @flow
 * @typechecks
 */

'use strict';

const RelayQuery = require('RelayQuery');
const RelayRecord = require('RelayRecord');
import type {Record} from 'RelayRecord';
import type RelayRecordStore from 'RelayRecordStore';

const invariant = require('invariant');
const shallowEqual = require('shallowEqual');

import type {DataID} from 'RelayInternalTypes';

type FragmentPointerObject = {
  [key: string]: RelayFragmentPointer;
};

/**
 * Fragment pointers encapsulate the fetched data for a fragment reference. They
 * are opaque tokens that are used by Relay containers to read data that is then
 * passed to the underlying React component.
 *
 * @internal
 */
class RelayFragmentPointer {
  _dataIDOrIDs: DataID | Array<DataID>;
  _fragment: RelayQuery.Fragment;

  /**
   * Creates a valid prop value to be passed into the top-level Relay container.
   */
  static createForRoot(
    store: RelayRecordStore,
    query: RelayQuery.Root
  ): ?FragmentPointerObject | Array<?Record> {
    var fragment = getRootFragment(query);
    if (!fragment) {
      return null;
    }
    const fragmentID = fragment.getConcreteFragmentID();
    const storageKey = query.getStorageKey();
    const identifyingArg = query.getIdentifyingArg();
    const identifyingArgValue =
      (identifyingArg && identifyingArg.value) || null;
    if (Array.isArray(identifyingArgValue)) {
      var rootFragment = fragment; // for Flow
      return identifyingArgValue.map(singleIdentifyingArgValue => {
        var dataID = store.getDataID(storageKey, singleIdentifyingArgValue);
        if (!dataID) {
          return null;
        }
        return RelayRecord.createWithFields(dataID, {
          [fragmentID]: new RelayFragmentPointer([dataID], rootFragment),
        });
      });
    }
    invariant(
      typeof identifyingArgValue === 'string' || identifyingArgValue == null,
      'RelayFragmentPointer: Value for the argument to `%s` on query `%s` ' +
      'should be a string, but it was set to `%s`. Check that the value is a ' +
      'string.',
      query.getFieldName(),
      query.getName(),
      identifyingArgValue
    );
    var dataIDOrIDs = store.getDataID(storageKey, identifyingArgValue);
    if (!dataIDOrIDs) {
      return null;
    }
    // TODO(t7765591): Throw if `fragment` is not optional.
    return  {
      [fragmentID]: new RelayFragmentPointer(dataIDOrIDs, fragment),
    };
  }

  constructor(
    dataIDOrIDs: DataID | Array<DataID>,
    fragment: RelayQuery.Fragment
  ) {
    var isArray = Array.isArray(dataIDOrIDs);
    var isPlural = fragment.isPlural();
    invariant(
      isArray === isPlural,
      'RelayFragmentPointer: Wrong plurality, %s supplied with %s fragment.',
      isArray ? 'array of data IDs' : 'single data ID',
      isPlural ? 'plural' : 'non-plural'
    );

    this._dataIDOrIDs = dataIDOrIDs;
    this._fragment = fragment;
  }

  /**
   * Get the data ID for a singular query fragment.
   */
  getDataID(): DataID {
    invariant(
      !Array.isArray(this._dataIDOrIDs),
      'RelayFragmentPointer.getDataID(): Bad call for plural fragment.'
    );
    return this._dataIDOrIDs;
  }

  /**
   * Get the data ID for a plural query fragment.
   */
  getDataIDs(): Array<DataID> {
    invariant(
      Array.isArray(this._dataIDOrIDs),
      'RelayFragmentPointer.getDataIDs(): Bad call for non-plural fragment.'
    );
    return this._dataIDOrIDs;
  }

  getFragment(): RelayQuery.Fragment {
    return this._fragment;
  }

  equals(that: RelayFragmentPointer): boolean {
    return (
      shallowEqual(this._dataIDOrIDs, that._dataIDOrIDs) &&
      this._fragment.isEquivalent(that._fragment)
    );
  }

  /**
   * @unstable
   *
   * For debugging only, do not rely on this for comparing values at runtime.
   */
  toString(): string {
    return (
      'RelayFragmentPointer(ids: ' +
      JSON.stringify(this._dataIDOrIDs) +
      ', fragment: `' +
      this.getFragment().getDebugName() +
      ', params: ' +
      JSON.stringify(this._fragment.getVariables()) +
      ')'
    );
  }
}

function getRootFragment(query: RelayQuery.Root): ?RelayQuery.Fragment {
  var batchCall = query.getBatchCall();
  if (batchCall) {
    invariant(
      false,
      'Queries supplied at the root cannot have batch call variables. Query ' +
      '`%s` has a batch call variable, `%s`.',
      query.getName(),
      batchCall.refParamName
    );
  }
  var fragment;
  query.getChildren().forEach(child => {
    if (child instanceof RelayQuery.Fragment) {
      invariant(
        !fragment,
        'Queries supplied at the root should contain exactly one fragment ' +
        '(e.g. `${Component.getFragment(\'...\')}`). Query `%s` contains ' +
        'more than one fragment.',
        query.getName()
      );
      fragment = child;
    } else if (child instanceof RelayQuery.Field) {
      invariant(
        child.isGenerated(),
        'Queries supplied at the root should contain exactly one fragment ' +
        'and no fields. Query `%s` contains a field, `%s`. If you need to ' +
        'fetch fields, declare them in a Relay container.',
        query.getName(),
        child.getSchemaName()
      );
    }
  });
  return fragment;
}

module.exports = RelayFragmentPointer;

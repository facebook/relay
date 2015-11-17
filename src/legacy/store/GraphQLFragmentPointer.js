/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule GraphQLFragmentPointer
 * @flow
 * @typechecks
 */

'use strict';

var GraphQLStoreDataHandler = require('GraphQLStoreDataHandler');
var RelayQuery = require('RelayQuery');
import type RelayRecordStore from 'RelayRecordStore';

var invariant = require('invariant');
var shallowEqual = require('shallowEqual');

import type {DataID} from 'RelayInternalTypes';

type FragmentPointerObject = {
  [key: string]: GraphQLFragmentPointer;
  __dataID__?: DataID;
};

/**
 * Fragment pointers encapsulate the fetched data for a fragment reference. They
 * are opaque tokens that are used by Relay containers to read data that is then
 * passed to the underlying React component.
 */
class GraphQLFragmentPointer {
  _dataID: DataID;
  _fragment: RelayQuery.Fragment;

  /**
   * Creates a valid prop value to be passed into the top-level Relay container.
   */
  static createForRoot(
    store: RelayRecordStore,
    query: RelayQuery.Root
  ): ?FragmentPointerObject | Array<?FragmentPointerObject> {
    var fragment = getRootFragment(query);
    if (!fragment) {
      return null;
    }
    var concreteFragmentID = fragment.getConcreteFragmentID();
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
        var pointer = GraphQLStoreDataHandler.createPointerWithID(dataID);
        pointer[concreteFragmentID] =
          new GraphQLFragmentPointer(dataID, rootFragment);
        return (pointer: $FlowIssue);
      });
    }
    invariant(
      typeof identifyingArgValue === 'string' || identifyingArgValue == null,
      'GraphQLFragmentPointer: Value for the argument to `%s` on query `%s` ' +
      'should be a string, but it was set to `%s`. Check that the value is a ' +
      'string.',
      query.getFieldName(),
      query.getName(),
      identifyingArgValue
    );
    var dataID = store.getDataID(storageKey, identifyingArgValue);
    if (!dataID) {
      return null;
    }
    var result = {};
    // TODO(t7765591): Throw if `fragment` is not optional.
    var fragmentPointer = new GraphQLFragmentPointer(dataID, fragment);
    result[concreteFragmentID] = fragmentPointer;
    return result;
  }

  constructor(
    dataID: DataID,
    fragment: RelayQuery.Fragment
  ) {
    this._dataID = dataID;
    this._fragment = fragment;
  }

  /**
   * Get the data ID for a singular query fragment.
   */
  getDataID(): DataID {
    invariant(
      !Array.isArray(this._dataID),
      'GraphQLFragmentPointer.getDataID(): Bad call for plural fragment.'
    );
    return this._dataID;
  }

  getFragment(): RelayQuery.Fragment {
    return this._fragment;
  }

  getPointerID(): string {
    return this._fragment.getConcreteFragmentID() + ':' + this._dataID;
  }

  equals(that: GraphQLFragmentPointer): boolean {
    return (
      shallowEqual(this._dataID, that._dataID) &&
      this._fragment.isEquivalent(that._fragment)
    );
  }

  /**
   * @unstable
   *
   * For debugging only, do not rely on this for comparing values at runtime.
   * Instead, use `pointer.getFragment().getFragmentID()`.
   */
  toString(): string {
    return (
      'GraphQLFragmentPointer(ids: ' +
      JSON.stringify(this._dataID) +
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

module.exports = GraphQLFragmentPointer;

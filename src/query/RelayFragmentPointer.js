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
import type RelayRecordStore from 'RelayRecordStore';

const forEachRootCallArg = require('forEachRootCallArg');
const invariant = require('invariant');

import type {DataID} from 'RelayInternalTypes';
import type {Record} from 'RelayRecord';

type FragmentDataIDMap = {
  [fragmentID: string]: DataID;
};
export type FragmentProp = {
  __dataID__: DataID,
  __fragments__: FragmentDataIDMap;
};

/**
 * Fragment pointers encapsulate the fetched data for a fragment reference. They
 * are opaque tokens that are used by Relay containers to read data that is then
 * passed to the underlying React component.
 *
 * @internal
 */
const RelayFragmentPointer = {
  addFragment(
    record: Record,
    fragment: RelayQuery.Fragment,
    dataID: DataID
  ): void {
    let fragmentMap = record.__fragments__;
    if (fragmentMap == null) {
      fragmentMap = record.__fragments__ = {};
    }
    invariant(
      typeof fragmentMap === 'object' && fragmentMap != null,
      'RelayFragmentPointer: Expected record to contain a fragment map, got ' +
      '`%s` for record `%s`.',
      fragmentMap,
      record.__dataID__
    );
    fragmentMap[fragment.getConcreteFragmentID()] = dataID;
  },

  getDataID(
    record: Record,
    fragment: RelayQuery.Fragment
  ): ?DataID {
    const fragmentMap = record.__fragments__;
    if (typeof fragmentMap === 'object' && fragmentMap != null) {
      const ret = fragmentMap[fragment.getConcreteFragmentID()];
      if (typeof ret === 'string') {
        return ret;
      }
    }
    return null;
  },

  create(
    dataID: DataID,
    fragment: RelayQuery.Fragment
  ): FragmentProp {
    /* $FlowIssue(>=0.23.0) #10620219 - After fixing some unsoundness in
     * dictionary types, we've come to realize we need a safer object supertype
     * than Object. */
    const record = RelayRecord.create(dataID);
    RelayFragmentPointer.addFragment(record, fragment, dataID);
    return record;
  },

  createForRoot(
    store: RelayRecordStore,
    query: RelayQuery.Root
  ): ?FragmentProp | ?Array<?FragmentProp> {
    const fragment = getRootFragment(query);
    if (!fragment) {
      return null;
    }
    const storageKey = query.getStorageKey();
    const pointers = [];
    forEachRootCallArg(query, ({identifyingArgKey}) => {
      const dataID = store.getDataID(storageKey, identifyingArgKey);
      if (dataID == null) {
        pointers.push(null);
      } else {
        pointers.push(RelayFragmentPointer.create(dataID, fragment));
      }
    });
    // Distinguish between singular/plural queries.
    const identifyingArg = query.getIdentifyingArg();
    const identifyingArgValue =
      (identifyingArg && identifyingArg.value) || null;
    if (Array.isArray(identifyingArgValue)) {
      return pointers;
    }
    return pointers[0];
  },
};

function getRootFragment(query: RelayQuery.Root): ?RelayQuery.Fragment {
  const batchCall = query.getBatchCall();
  if (batchCall) {
    invariant(
      false,
      'Queries supplied at the root cannot have batch call variables. Query ' +
      '`%s` has a batch call variable, `%s`.',
      query.getName(),
      batchCall.refParamName
    );
  }
  let fragment;
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

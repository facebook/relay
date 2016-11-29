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
 */

'use strict';

const RelayQuery = require('RelayQuery');
const RelayRecord = require('RelayRecord');

const areEqual = require('areEqual');
const forEachRootCallArg = require('forEachRootCallArg');
const invariant = require('invariant');

import type {DataID} from 'RelayInternalTypes';
import type {Record} from 'RelayRecord';
import type RelayRecordStore from 'RelayRecordStore';
import type {Variables} from 'RelayTypes';

type FragmentVariablesMap = {
  [fragmentID: string]: Array<Variables>;
};

export type FragmentProp = {
  __dataID__: DataID,
  __fragments__: FragmentVariablesMap,
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
    fragment: RelayQuery.Fragment
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
    const fragmentID = fragment.getConcreteFragmentID();
    let variableList = fragmentMap[fragmentID];
    if (variableList == null) {
      variableList = fragmentMap[fragmentID] = [];
    }
    invariant(
      Array.isArray(variableList),
      'RelayFragmentPointer: Expected record to contain a fragment/variable ' +
      'map, got `%s` for record `%s`.',
      variableList,
      record.__dataID__
    );
    variableList.push(fragment.getVariables());
  },

  /**
   * Returns true if the concrete fragment is included in the fragment pointer
   * results, regardless of the variables.
   */
  hasConcreteFragment(
    record: Record,
    fragment: RelayQuery.Fragment
  ): boolean {
    const fragmentMap = record.__fragments__;
    if (typeof fragmentMap === 'object' && fragmentMap != null) {
      const fragmentID = fragment.getConcreteFragmentID();
      return fragmentMap.hasOwnProperty(fragmentID);
    }
    return false;
  },

  /**
   * Returns true if the combination of concrete fragment + variables is
   * included in the fragment pointer results.
   */
  hasFragment(
    record: Record,
    fragment: RelayQuery.Fragment
  ): boolean {
    const variableList = RelayFragmentPointer.getFragmentVariables(
      record,
      fragment
    );
    if (variableList != null) {
      return variableList.some(
        vars => areEqual(vars, fragment.getVariables())
      );
    }
    return false;
  },

  getVariablesForID(record: Record, fragmentID: string): ?Variables {
    const fragmentMap = record.__fragments__;
    if (typeof fragmentMap === 'object' && fragmentMap != null) {
      const variables = fragmentMap[fragmentID];
      if (variables) {
        invariant(
          Array.isArray(variables) &&
          variables.length === 1,
          'RelayFragmentPointer: Expected an array with at most one set of ' +
          'variables per concrete fragment, got %s.',
          variables
        );
        return (variables[0]: any);
      }
    }
    return null;
  },

  /**
   * Returns the list of variables whose results are available for the given
   * concrete fragment.
   */
  getFragmentVariables(
    record: Record,
    fragment: RelayQuery.Fragment
  ): ?Array<Variables> {
    const fragmentMap = record.__fragments__;
    if (typeof fragmentMap === 'object' && fragmentMap != null) {
      const fragmentID = fragment.getConcreteFragmentID();
      /* $FlowFixMe(>=0.36.0) Flow error detected during
       * the deploy of Flow v0.36.0. To see the error, remove this comment and
       * run Flow */
      return fragmentMap[fragmentID];
    }
    return null;
  },

  create(
    dataID: DataID,
    fragment: RelayQuery.Fragment
  ): FragmentProp {
    const record = RelayRecord.create(dataID);
    RelayFragmentPointer.addFragment(record, fragment);
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

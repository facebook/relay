/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayFragmentPointer
 * 
 * @typechecks
 */

'use strict';

var RelayQuery = require('./RelayQuery');
var RelayRecord = require('./RelayRecord');

var invariant = require('fbjs/lib/invariant');

/**
 * Fragment pointers encapsulate the fetched data for a fragment reference. They
 * are opaque tokens that are used by Relay containers to read data that is then
 * passed to the underlying React component.
 *
 * @internal
 */
var RelayFragmentPointer = {
  addFragment: function addFragment(record, fragment, dataID) {
    var fragmentMap = record.__fragments__;
    if (fragmentMap == null) {
      fragmentMap = record.__fragments__ = {};
    }
    !(typeof fragmentMap === 'object' && fragmentMap != null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayFragmentPointer: Expected record to contain a fragment map, got ' + '`%s` for record `%s`.', fragmentMap, record.__dataID__) : invariant(false) : undefined;
    fragmentMap[fragment.getConcreteFragmentID()] = dataID;
  },

  getDataID: function getDataID(record, fragment) {
    var fragmentMap = record.__fragments__;
    if (typeof fragmentMap === 'object' && fragmentMap != null) {
      return fragmentMap[fragment.getConcreteFragmentID()];
    }
    return null;
  },

  create: function create(dataID, fragment) {
    var record = RelayRecord.create(dataID);
    RelayFragmentPointer.addFragment(record, fragment, dataID);
    return record;
  },

  createForRoot: function createForRoot(store, query) {
    var fragment = getRootFragment(query);
    if (!fragment) {
      return null;
    }
    var storageKey = query.getStorageKey();
    var identifyingArg = query.getIdentifyingArg();
    var identifyingArgValue = identifyingArg && identifyingArg.value || null;
    if (Array.isArray(identifyingArgValue)) {
      return identifyingArgValue.map(function (singleIdentifyingArgValue) {
        var dataID = store.getDataID(storageKey, singleIdentifyingArgValue);
        if (!dataID) {
          return null;
        }
        return RelayFragmentPointer.create(dataID, fragment);
      });
    }
    !(typeof identifyingArgValue === 'string' || identifyingArgValue == null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayFragmentPointer: Value for the argument to `%s` on query `%s` ' + 'should be a string, but it was set to `%s`. Check that the value is a ' + 'string.', query.getFieldName(), query.getName(), identifyingArgValue) : invariant(false) : undefined;
    var dataID = store.getDataID(storageKey, identifyingArgValue);
    if (!dataID) {
      // TODO(t7765591): Throw if `fragment` is not optional.
      return null;
    }
    return RelayFragmentPointer.create(dataID, fragment);
  }
};

function getRootFragment(query) {
  var batchCall = query.getBatchCall();
  if (batchCall) {
    !false ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Queries supplied at the root cannot have batch call variables. Query ' + '`%s` has a batch call variable, `%s`.', query.getName(), batchCall.refParamName) : invariant(false) : undefined;
  }
  var fragment = undefined;
  query.getChildren().forEach(function (child) {
    if (child instanceof RelayQuery.Fragment) {
      !!fragment ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Queries supplied at the root should contain exactly one fragment ' + '(e.g. `${Component.getFragment(\'...\')}`). Query `%s` contains ' + 'more than one fragment.', query.getName()) : invariant(false) : undefined;
      fragment = child;
    } else if (child instanceof RelayQuery.Field) {
      !child.isGenerated() ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Queries supplied at the root should contain exactly one fragment ' + 'and no fields. Query `%s` contains a field, `%s`. If you need to ' + 'fetch fields, declare them in a Relay container.', query.getName(), child.getSchemaName()) : invariant(false) : undefined;
    }
  });
  return fragment;
}

module.exports = RelayFragmentPointer;
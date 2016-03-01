/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule writeRelayQueryPayload
 * 
 * @typechecks
 */

/**
 * @internal
 *
 * Traverses a query and payload in parallel, writing the results into the
 * store.
 */
'use strict';

var RelayNodeInterface = require('./RelayNodeInterface');
var RelayProfiler = require('./RelayProfiler');

var RelayQueryPath = require('./RelayQueryPath');
function writeRelayQueryPayload(writer, query, payload) {
  var store = writer.getRecordStore();
  var recordWriter = writer.getRecordWriter();
  var path = new RelayQueryPath(query);

  RelayNodeInterface.getResultsFromPayload(store, query, payload).forEach(function (_ref) {
    var dataID = _ref.dataID;
    var result = _ref.result;
    var rootCallInfo = _ref.rootCallInfo;

    if (rootCallInfo) {
      recordWriter.putDataID(rootCallInfo.storageKey, rootCallInfo.identifyingArgValue, dataID);
    }
    writer.writePayload(query, dataID, result, path);
  });
}

module.exports = RelayProfiler.instrument('writeRelayQueryPayload', writeRelayQueryPayload);
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayStoreProxyDebugger
 * @flow
 * @format
 */

'use strict';

/* eslint-disable no-console-disallow */

const RelayRecordSourceProxy = require('RelayRecordSourceProxy');
const RelayRecordSourceSelectorProxy = require('RelayRecordSourceSelectorProxy');

const warning = require('warning');

import type {
  RecordSourceProxy,
  RecordSourceSelectorProxy,
} from 'RelayStoreTypes';

type StoreProxy = RecordSourceProxy | RecordSourceSelectorProxy;

function dump(proxy: StoreProxy) {
  if (proxy instanceof RelayRecordSourceSelectorProxy) {
    const recordSource = proxy.__recordSource;
    if (recordSource instanceof RelayRecordSourceProxy) {
      dumpRelayRecordSourceProxy(recordSource);
    }
  } else if (proxy instanceof RelayRecordSourceProxy) {
    dumpRelayRecordSourceProxy(proxy);
  } else {
    warning(false, 'RelayStoreProxyDebugger: not supported yet.');
  }
}

function dumpRelayRecordSourceProxy(proxy: RelayRecordSourceProxy) {
  const mutatorSources = proxy.__mutator.__sources;
  if (mutatorSources.length !== 2) {
    warning(
      false,
      'RelayStoreProxyDebugger: expected the mutator sources to have sink and base. ' +
        'This is a Relay side bug; please report it to the Relay team.',
    );
    return;
  }
  console.groupCollapsed('RelayStoreProxyDebugger', '');
  // Create a 'deep copy' of the records through an extra json encode/decode step.
  console.log(
    'Modified Records: ',
    JSON.parse(JSON.stringify(mutatorSources[0])),
  );
  console.log(
    'Original Records: ',
    JSON.parse(JSON.stringify(mutatorSources[1])),
  );
  console.groupEnd();
}

module.exports = {dump};

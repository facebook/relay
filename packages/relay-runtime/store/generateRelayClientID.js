/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule generateRelayClientID
 * @flow
 */

'use strict';

import type {DataID} from 'RelayInternalTypes';

const PREFIX = 'client:';

function generateRelayClientID(
  id: DataID,
  storageKey: string,
  index?: number
): DataID {
  let key = id + ':' + storageKey;
  if (index != null) {
    key += ':' + index;
  }
  if (!key.startsWith(PREFIX)) {
    key = PREFIX + key;
  }
  return key;
}

module.exports = generateRelayClientID;

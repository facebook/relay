/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule generateRelayClientID
 * @flow
 * @format
 */

'use strict';

import type {DataID} from 'react-relay/classic/tools/RelayInternalTypes';

const PREFIX = 'client:';

function generateRelayClientID(
  id: DataID,
  storageKey: string,
  index?: number,
): DataID {
  let key = id + ':' + storageKey;
  if (index != null) {
    key += ':' + index;
  }
  if (key.indexOf(PREFIX) !== 0) {
    key = PREFIX + key;
  }
  return key;
}

module.exports = generateRelayClientID;

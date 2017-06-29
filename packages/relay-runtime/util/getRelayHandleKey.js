/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @providesModule getRelayHandleKey
 * @format
 */

'use strict';

const invariant = require('invariant');

const {DEFAULT_HANDLE_KEY} = require('RelayDefaultHandleKey');

/**
 * @internal
 *
 * Helper to create a unique name for a handle field based on the handle name, handle key and
 * source field.
 */
function getRelayHandleKey(
  handleName: string,
  key: ?string,
  fieldName: ?string,
): string {
  if (key && key !== DEFAULT_HANDLE_KEY) {
    return `__${key}_${handleName}`;
  }

  invariant(
    fieldName != null,
    'getRelayHandleKey: Expected either `fieldName` or `key` in `handle` to be provided',
  );
  return `__${fieldName}_${handleName}`;
}

module.exports = getRelayHandleKey;

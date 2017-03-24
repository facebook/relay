/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule generateConcreteFragmentID
 * @flow
 */

'use strict';

const base62 = require('base62');

// Static ids always end with `:<HASH>` where HASH is an alphanumeric transform
// of an auto-incrementing index. A double-colon is used to distinguish between
// client ids and static ids that happen to hash to `:client`.
const SUFFIX = '::client';

let _nextFragmentID = 0;

/**
 * The "concrete fragment id" uniquely identifies a Relay.QL`fragment ...`
 * within the source code of an application and will remain the same across
 * runs of a particular version of an application.
 *
 * This function can be used to generate a unique id for fragments constructed
 * at runtime and is guaranteed not to conflict with statically created ids.
 */
function generateConcreteFragmentID(): string {
  return base62(_nextFragmentID++) + SUFFIX;
}

module.exports = generateConcreteFragmentID;

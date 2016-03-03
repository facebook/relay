/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @fullSyntaxTransform
 */

'use strict';

const crypto = require('crypto');
const invariant = require('./invariant');

function generateHash(string: string): string {
  const hash = crypto.createHash('sha1').update(string);
  invariant(hash != null, 'Failed to create sha1 hash.');
  return hash.digest('base64');
}

module.exports = generateHash;

/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getConcreteFragmentHash
 * @typechecks
 * @flow
 */

'use strict';

import type {ConcreteFragment} from 'ConcreteQuery';

let _nextFragmentID = 0;

/**
 * The "concrete hash" of a fragment uniquely identifies the instance of the
 * concrete node. This method should be used with `RelayQueryFragment#isCloned`
 * if you may be dealing with fragments that have been cloned with new children.
 *
 * This hash may change between runtime sessions (e.g. client and server).
 */
function getConcreteFragmentHash(fragment: ConcreteFragment): string {
  let instanceHash = (fragment: any).__instanceHash__;
  if (instanceHash == null) {
    instanceHash = (_nextFragmentID++).toString();
    (fragment: any).__instanceHash__ = instanceHash;
  }
  return instanceHash;
}

module.exports = getConcreteFragmentHash;

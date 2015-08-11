/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule forEachRootCallArg
 * @typechecks
 * @flow
 */

'use strict';

import type RelayQuery from 'RelayQuery';

var invariant = require('invariant');

/**
 * @internal
 *
 * Iterates over the arguments in the supplied root call. If the root call value
 * is null or undefined, the supplied callback will be invoked once.
 */
function forEachRootCallArg(
  query: RelayQuery.Root,
  callback: (rootCallArg: ?string, rootCallName: string) => void
): void {
  invariant(
    !query.getBatchCall(),
    'forEachRootCallArg(): Cannot iterate over batch call variables.'
  );
  var {name, value} = query.getRootCall();

  function each(callArg, fn) {
    if (Array.isArray(callArg)) {
      callArg.forEach(arg => each(arg, fn));
    } else if (callArg == null) {
      fn(callArg, name);
    } else {
      invariant(
        typeof callArg === 'string' || typeof callArg === 'number',
        'Relay: Expected arguments to root field `%s` to each be strings/' +
        'numbers, got `%s`.',
        name,
        JSON.stringify(callArg)
      );
      fn('' + callArg, name);
    }
  }
  each(value, callback);
}

module.exports = forEachRootCallArg;

/**
 * Copyright (c) 2013-present, Facebook, Inc.
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

const invariant = require('invariant');

/**
 * @internal
 *
 * Iterates over the identifying arguments in the supplied root call.
 * If the identifying value is null or undefined, the supplied callback will be
 * invoked once.
 */
function forEachRootCallArg(
  query: RelayQuery.Root,
  callback: (identifyingArgValue: mixed) => void
): void {
  invariant(
    !query.getBatchCall(),
    'forEachRootCallArg(): Cannot iterate over batch call variables.'
  );
  function each(identifyingArgValue, fn) {
    if (Array.isArray(identifyingArgValue)) {
      identifyingArgValue.forEach(value => each(value, fn));
    } else if (identifyingArgValue == null) {
      fn(identifyingArgValue);
    } else {
      invariant(
        typeof identifyingArgValue === 'string' ||
        typeof identifyingArgValue === 'object' ||
        typeof identifyingArgValue === 'boolean' ||
        typeof identifyingArgValue === 'number',
        'Relay: Expected arguments to root field `%s` to each be strings/' +
        'numbers|object|boolean, got `%s`.',
        query.getFieldName(),
        JSON.stringify(identifyingArgValue)
      );
      fn(identifyingArgValue);
    }
  }
  const identifyingArg = query.getIdentifyingArg();
  const identifyingArgValue = (identifyingArg && identifyingArg.value) || null;
  each(identifyingArgValue, callback);
}

module.exports = forEachRootCallArg;

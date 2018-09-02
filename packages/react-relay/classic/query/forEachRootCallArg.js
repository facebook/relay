/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const invariant = require('invariant');
const stableStringify = require('./stableStringify');

import type {CallValue} from '../tools/RelayInternalTypes';
import type RelayQuery from './RelayQuery';

type IdentifyingArg = {
  identifyingArgValue: CallValue,
  identifyingArgKey: ?string,
};

/**
 * @internal
 *
 * Iterates over the identifying arguments in the supplied root call.
 * If the identifying value is null or undefined, the supplied callback will be
 * invoked once.
 */
function forEachRootCallArg(
  query: RelayQuery.Root,
  callback: (identifyingArg: IdentifyingArg) => void,
): void {
  invariant(
    !query.getBatchCall(),
    'forEachRootCallArg(): Cannot iterate over batch call variables.',
  );
  function each(identifyingArgValue, fn) {
    if (Array.isArray(identifyingArgValue)) {
      identifyingArgValue.forEach(value => each(value, fn));
    } else {
      fn({
        identifyingArgValue,
        identifyingArgKey:
          identifyingArgValue == null
            ? null
            : typeof identifyingArgValue === 'string'
              ? identifyingArgValue
              : stableStringify(identifyingArgValue),
      });
    }
  }
  const identifyingArg = query.getIdentifyingArg();
  const identifyingArgValue = (identifyingArg && identifyingArg.value) || null;
  each(identifyingArgValue, callback);
}

module.exports = forEachRootCallArg;

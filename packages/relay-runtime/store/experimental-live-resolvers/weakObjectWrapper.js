/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const invariant = require('invariant');

function weakObjectWrapper<TKey, TArgs>(
  resolverFn: (key: TKey, args?: TArgs) => mixed,
  key: string,
  isPlural: boolean,
): (key: TKey, args?: TArgs) => mixed {
  return (...args) => {
    const data = resolverFn.apply(null, args);
    if (isPlural) {
      invariant(
        Array.isArray(data),
        'Resolver is expected to return a plural value.',
      );

      return data.map(item => ({
        [key]: item,
      }));
    } else {
      return {
        [key]: data,
      };
    }
  };
}

module.exports = weakObjectWrapper;

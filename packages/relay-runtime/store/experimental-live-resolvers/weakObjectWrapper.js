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

function weakObjectWrapper<TKey, TArgs>(
  resolverFn: (key: TKey, args?: TArgs) => mixed,
  key: string,
): (key: TKey, args?: TArgs) => mixed {
  return (...args) => {
    const data = resolverFn.apply(null, args);
    return {
      [key]: data,
    };
  };
}

module.exports = weakObjectWrapper;

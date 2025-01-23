/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

const {useMemo} = require('react');

/**
 * Like `useRef`, but does not warn when accessed during render. It's a bad
 * pattern to read or write from a ref during render as it does not trigger
 * a rerender and might result in bugs.
 */
hook useUnsafeRef_DEPRECATED<T>(init: T): {current: T} {
  return useMemo<{current: T}>(() => ({current: init}), []);
}

module.exports = useUnsafeRef_DEPRECATED;

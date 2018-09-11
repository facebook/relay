/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

'use strict';

const React = require('React');

function useContext<T>(context: React.Context<T>): T {
  // $FlowFixMe unstable_read is not yet typed
  return context.unstable_read();
}

module.exports = useContext;

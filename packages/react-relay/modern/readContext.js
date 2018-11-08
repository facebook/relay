/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const React = require('React');

const ReactCurrentOwner =
  // $FlowFixMe
  React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner;

function readContext<T>(Context: React.Context<T>): T {
  const dispatcher = ReactCurrentOwner.currentDispatcher;
  return dispatcher.readContext(Context);
}

module.exports = readContext;

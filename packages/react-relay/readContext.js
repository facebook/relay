/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const React = require('react');

const {ReactCurrentDispatcher, ReactCurrentOwner} =
  /* $FlowFixMe[prop-missing] Flow doesn't know about React's internals for
   * good reason, but for now, Relay needs the dispatcher to read context. */
  React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

function readContext<T>(Context: React.Context<T>): T {
  const dispatcher =
    ReactCurrentDispatcher != null
      ? ReactCurrentDispatcher.current
      : ReactCurrentOwner.currentDispatcher;
  return dispatcher.readContext(Context);
}

module.exports = readContext;

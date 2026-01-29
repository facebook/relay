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

import type {RelayFieldLogger} from './RelayStoreTypes';

const defaultRelayFieldLogger: RelayFieldLogger = event => {
  if (__DEV__ && event.kind === 'missing_required_field.log') {
    throw new Error(
      'Relay Environment Configuration Error (dev only): `@required(action: LOG)` requires that the Relay Environment be configured with a `relayFieldLogger`.',
    );
  }
};

module.exports = defaultRelayFieldLogger;

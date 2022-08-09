/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall reactflight
 */

'use strict';

import * as RelayFlight from 'RelayFlight.hybrid';
import RelayFlightClientImpl from 'RelayFlightClientImpl.client';

export default function configureRelayFlight() {
  // Until *all* transitive dependencies of hybrid modules are guaranteed to use
  // RelayFlight.hybrid (and never CometRelay), it's possible this module could
  // be called on the server. Only initialize w the client implementation if we
  // know we're not on the server.
  if (!RelayFlight.isServer_INTERNAL_DO_NOT_USE()) {
    RelayFlight.initialize_INTERNAL_DO_NOT_USE(RelayFlightClientImpl);
  }
}

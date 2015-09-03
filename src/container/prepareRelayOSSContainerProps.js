/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule prepareRelayOSSContainerProps
 * @typechecks
 * @flow
 */

'use strict';

/**
 * @internal
 *
 * Provides an opportunity for Relay to fork how RelayContainer props are spread
 * into the inner component.
 */
function prepareRelayOSSContainerProps(
  relayProps: {[propName: string]: mixed}
): {[propName: string]: mixed} {
  return {relay: relayProps};
}

module.exports = prepareRelayOSSContainerProps;

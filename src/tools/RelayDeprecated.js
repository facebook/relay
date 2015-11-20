/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayDeprecated
 * @typechecks
 * @flow
 */

'use strict';

import type {RelayContainerSpec} from 'RelayContainer';

var invariant = require('invariant');

/**
 * @internal
 */
const RelayDeprecated = {

  /**
   * Detects deprecated API usage.
   *
   * TODO(jkassens, #8978552): delete this
   */
  upgradeContainerSpec(spec: RelayContainerSpec): RelayContainerSpec {
    ['queries', 'queryParams'].forEach(property => {
      invariant(
        !spec.hasOwnProperty(property),
        'Relay.createContainer(...): Found no longer supported property: %s',
        property
      );
    });
    return spec;
  },

};

module.exports = RelayDeprecated;

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactRelayPropTypes
 * @flow
 * @format
 */

'use strict';

const isRelayModernContext = require('isRelayModernContext');
const sprintf = require('sprintf');

const ReactRelayPropTypes = {
  Relay(props: Object, propName: string, componentName: string): ?Error {
    const relay = props[propName];
    if (!isRelayModernContext(relay)) {
      return new Error(
        sprintf(
          'Invalid prop/context `%s` supplied to `%s`, expected `%s` to be ' +
            'an object with an `environment` and `variables`.',
          propName,
          componentName,
          relay,
        ),
      );
    }
    return null;
  },
};

module.exports = ReactRelayPropTypes;

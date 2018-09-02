/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const isRelayModernContext = require('./isRelayModernContext');
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

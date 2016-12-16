/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayPropTypes
 * @flow
 */

'use strict';

const isLegacyRelayEnvironment = require('isLegacyRelayEnvironment');
const isRelayContainer = require('isRelayContainer');
const isRelayContext = require('isRelayContext');
const isRelayEnvironment = require('isRelayEnvironment');
const sprintf = require('sprintf');

const {PropTypes} = require('React');

const RelayPropTypes = {
  Container(props: Object, propName: string, componentName: string): ?Error {
    const component = props[propName];
    if (component == null) {
      return new Error(sprintf(
        'Required prop `%s` was not specified in `%s`.',
        propName,
        componentName
      ));
    } else if (!isRelayContainer(component)) {
      return new Error(sprintf(
        'Invalid prop `%s` supplied to `%s`, expected a RelayContainer.',
        propName,
        componentName
      ));
    }
    return null;
  },

  Environment(props: Object, propName: string, componentName: string): ?Error {
    const context = props[propName];
    if (
      !isLegacyRelayEnvironment(context) ||
      !isRelayEnvironment(context)
    ) {
      return new Error(sprintf(
        'Invalid prop/context `%s` supplied to `%s`, expected `%s` to be ' +
        'an object conforming to the `RelayEnvironment` interface.',
        propName,
        componentName,
        context
      ));
    }
    return null;
  },

  QueryConfig: PropTypes.shape({
    name: PropTypes.string.isRequired,
    params: PropTypes.object.isRequired,
    queries: PropTypes.object.isRequired,
  }),

  LegacyRelay(props: Object, propName: string, componentName: string): ?Error {
    const relay = props[propName];
    if (
      !isRelayContext(relay) ||
      !isLegacyRelayEnvironment(relay.environment)
    ) {
      return new Error(sprintf(
        'Invalid prop/context `%s` supplied to `%s`, expected `%s` to be ' +
        'an object with a legacy `environment` implementation and `variables`.',
        propName,
        componentName,
        relay
      ));
    }
    return null;
  },

  Relay(props: Object, propName: string, componentName: string): ?Error {
    const relay = props[propName];
    if (!isRelayContext(relay)) {
      return new Error(sprintf(
        'Invalid prop/context `%s` supplied to `%s`, expected `%s` to be ' +
        'an object with an `environment` and `variables`.',
        propName,
        componentName,
        relay
      ));
    }
    return null;
  },
};

module.exports = RelayPropTypes;

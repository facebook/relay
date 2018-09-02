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

const PropTypes = require('prop-types');

const isClassicRelayEnvironment = require('../store/isClassicRelayEnvironment');
const isRelayContainer = require('./isRelayContainer');
const isRelayEnvironment = require('../environment/isRelayEnvironment');
const sprintf = require('sprintf');

const {isRelayContext} = require('../environment/RelayContext');

const RelayPropTypes = {
  Container(props: Object, propName: string, componentName: string): ?Error {
    const component = props[propName];
    if (component == null) {
      return new Error(
        sprintf(
          'Required prop `%s` was not specified in `%s`.',
          propName,
          componentName,
        ),
      );
    } else if (!isRelayContainer(component)) {
      return new Error(
        sprintf(
          'Invalid prop `%s` supplied to `%s`, expected a RelayContainer.',
          propName,
          componentName,
        ),
      );
    }
    return null;
  },

  Environment(props: Object, propName: string, componentName: string): ?Error {
    const context = props[propName];
    if (!isClassicRelayEnvironment(context) || !isRelayEnvironment(context)) {
      return new Error(
        sprintf(
          'Invalid prop/context `%s` supplied to `%s`, expected `%s` to be ' +
            'an object conforming to the `RelayEnvironment` interface.',
          propName,
          componentName,
          context,
        ),
      );
    }
    return null;
  },

  QueryConfig: PropTypes.shape({
    name: PropTypes.string.isRequired,
    params: PropTypes.object.isRequired,
    queries: PropTypes.object.isRequired,
  }),

  ClassicRelay(props: Object, propName: string, componentName: string): ?Error {
    const relay = props[propName];
    if (
      !isRelayContext(relay) ||
      !isClassicRelayEnvironment(relay.environment)
    ) {
      return new Error(
        sprintf(
          'Invalid prop/context `%s` supplied to `%s`, expected `%s` to be ' +
            'an object with a classic `environment` implementation and `variables`.',
          propName,
          componentName,
          relay,
        ),
      );
    }
    return null;
  },

  Relay(props: Object, propName: string, componentName: string): ?Error {
    const relay = props[propName];
    if (!isRelayContext(relay)) {
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

module.exports = RelayPropTypes;

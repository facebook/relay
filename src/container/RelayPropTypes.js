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
 * @typechecks
 */

'use strict';

const {PropTypes} = require('React');
const RelayContext = require('RelayContext');

const isRelayContainer = require('isRelayContainer');
const sprintf = require('sprintf');

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

  Context: PropTypes.instanceOf(RelayContext),

  QueryConfig: PropTypes.shape({
    name: PropTypes.string.isRequired,
    params: PropTypes.object.isRequired,
    queries: PropTypes.object.isRequired,
  }),
};

module.exports = RelayPropTypes;

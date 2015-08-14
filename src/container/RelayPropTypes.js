/**
 * Copyright 2013-2015, Facebook, Inc.
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

var {PropTypes} = require('React');
var isRelayContainer = require('isRelayContainer');

var RelayPropTypes = {
  Container: function(props: Object, propName: string): ?Error {
    var component = props[propName];
    if (component == null) {
      return new Error(
        'Required prop `Component` was not specified in `RelayRootContainer`.'
      );
    } else if (!isRelayContainer(component)) {
      return new Error(
        'Invalid prop `Component` supplied to `RelayRootContainer`, ' +
        'expected a RelayContainer.'
      );
    }
    return null;
  },

  QueryConfig: PropTypes.shape({
    name: PropTypes.string.isRequired,
    params: PropTypes.object.isRequired,
    queries: PropTypes.object.isRequired,
    uri: PropTypes.object
  })
};

module.exports = RelayPropTypes;

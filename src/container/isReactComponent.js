/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule isReactComponent
 * @flow
 */

'use strict';

/**
 * @internal
 *
 * Helper for checking if this is a React Component
 * created with React.Component or React.createClass().
 */
function isReactComponent(component: mixed): boolean {
  return !!(
    component &&
    component.prototype &&
    component.prototype.isReactComponent
  );
}

module.exports = isReactComponent;

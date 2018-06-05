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

/**
 * @internal
 *
 * Helper for checking if this is a React Component
 * created with React.Component or React.createClass().
 */
function isReactComponent(component: mixed): boolean {
  if (component == null) {
    return false;
  }

  // React class component or createClass()
  if (
    typeof component.prototype === 'object' &&
    component.prototype &&
    component.prototype.isReactComponent
  ) {
    return true;
  }

  // @TODO (T28161354) Remove this check
  // React.forwardRef component
  if (
    // $FlowFixMe: add 'symbol' as a valid return value for typeof
    typeof component.$$typeof === 'symbol' && // ES6 symbol
    typeof component.render === 'function'
  ) {
    return true;
  }

  return false;
}

function getReactComponent(
  Component: React$ComponentType<any>,
): ?React$ComponentType<any> {
  if (isReactComponent(Component)) {
    return (Component: any);
  } else {
    return null;
  }
}

module.exports = {
  getReactComponent,
};

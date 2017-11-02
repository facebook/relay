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
  return !!(
    component &&
    typeof component.prototype === 'object' &&
    component.prototype &&
    component.prototype.isReactComponent
  );
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

function getComponentName(Component: React$ComponentType<any>): string {
  let name;
  const ComponentClass = getReactComponent(Component);
  if (ComponentClass) {
    name = ComponentClass.displayName || ComponentClass.name;
  } else if (typeof Component === 'function') {
    // This is a stateless functional component.
    name = Component.displayName || Component.name || 'StatelessComponent';
  } else {
    name = 'ReactElement';
  }
  return String(name);
}

function getContainerName(Component: React$ComponentType<any>): string {
  return 'Relay(' + getComponentName(Component) + ')';
}

module.exports = {
  getComponentName,
  getContainerName,
  getReactComponent,
};

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

function getComponentName(component: React$ComponentType<any>): string {
  return component.displayName || component.name || 'Component';
}

function getContainerName(Component: React$ComponentType<any>): string {
  return 'Relay(' + getComponentName(Component) + ')';
}

module.exports = {
  getComponentName,
  getContainerName,
};

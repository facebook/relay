/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall relay
 */

'use strict';

function getComponentName(component: component(...empty)): string {
  return component.displayName || component.name || 'Component';
}

function getContainerName(Component: component(...empty)): string {
  return 'Relay(' + getComponentName(Component) + ')';
}

module.exports = {
  getComponentName,
  getContainerName,
};

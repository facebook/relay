/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayFBContainerProxy
 * @typechecks
 * @flow
 */

'use strict';

import type {RelayContainer} from 'RelayTypes';

var hasOwnProperty = Object.prototype.hasOwnProperty;

var PROTOTYPE_KEYS = {
  childContextTypes: true,
  componentDidMount: true,
  componentDidUpdate: true,
  componentWillReceiveProps: true,
  componentWillMount: true,
  componentWillUpdate: true,
  componentWillUnmount: true,
  constructor: true,
  contextTypes: true,
  getChildContext: true,
  getDefaultProps: true,
  getDOMNode: true,
  getInitialState: true,
  mixins: true,
  propTypes: true,
  render: true,
  shouldComponentUpdate: true,
  statics: true,
  updateComponent: true,
};

/**
 * Proxies public methods from `Component` onto `RelayContainer`. As soon as
 * React has first class support for instance proxies, this will not be needed.
 */
var RelayFBContainerProxy = {
  proxyMethods(
    RelayContainer: RelayContainer,
    Component: ReactClass
  ): void {
    var proto = Component.prototype;
    for (var prop in proto) {
      var prefix = prop.charAt(0);
      if (
        !PROTOTYPE_KEYS[prop] &&
        prefix != '_' &&
        prefix != '$' &&
        typeof proto[prop] === 'function' &&
        hasOwnProperty.call(proto, prop)
      ) {
        (RelayContainer.prototype: any)[prop] =
          bind(proto[prop], prop, Component.name);
      }
    }
  }
};

function bind(
  fn: Function,
  methodName: string,
  componentName: string
): Function {
  return function() {
    var component = this.refs.component;
    if (component) {
      return fn.apply(this.refs.component, arguments);
    }
    console.error(
      'Tried to call function `%s` on an unmounted container for `%s`.',
      methodName,
      componentName

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayQL
 * @typechecks
 * 
 */

'use strict';

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
var QueryBuilder = require('./QueryBuilder');
var RelayFragmentReference = require('./RelayFragmentReference');
var RelayRouteFragment = require('./RelayRouteFragment');

var invariant = require('fbjs/lib/invariant');

/**
 * @public
 *
 * This is a tag function used with template strings to provide the facade of a
 * runtime GraphQL parser. Example usage:
 *
 *   Relay.QL`fragment on User { name }`
 *
 * In actuality, a Babel transform parses these tag templates and replaces it
 * with an internal representation of the query structure.
 */
function RelayQL(strings) {
  !false ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayQL: Unexpected invocation at runtime. Either the Babel transform ' + 'was not set up, or it failed to identify this call site. Make sure it ' + 'is being used verbatim as `Relay.QL`.') : invariant(false) : undefined;
}

function assertValidFragment(substitution) {
  !(substitution instanceof RelayFragmentReference || QueryBuilder.getFragment(substitution) || QueryBuilder.getFragmentReference(substitution)) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayQL: Invalid fragment composition, use ' + '`${Child.getFragment(\'name\')}`.') : invariant(false) : undefined;
}

/**
 * Private helper methods used by the transformed code.
 */
_Object$assign(RelayQL, {
  __frag: function __frag(substitution) {
    if (typeof substitution === 'function') {
      // Route conditional fragment, e.g. `${route => matchRoute(route, ...)}`.
      return new RelayRouteFragment(substitution);
    }
    if (substitution != null) {
      if (Array.isArray(substitution)) {
        substitution.forEach(assertValidFragment);
      } else {
        assertValidFragment(substitution);
      }
    }
    return substitution;
  },
  __var: function __var(expression) {
    var variable = QueryBuilder.getCallVariable(expression);
    if (variable) {
      !false ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayQL: Invalid argument `%s` supplied via template substitution. ' + 'Instead, use an inline variable (e.g. `comments(count: $count)`).', variable.callVariableName) : invariant(false) : undefined;
    }
    return QueryBuilder.createCallValue(expression);
  }
});

module.exports = RelayQL;
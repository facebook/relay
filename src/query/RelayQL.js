/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayQL
 * @typechecks
 * @flow
 */

'use strict';

var GraphQL = require('GraphQL');
var RelayFragmentReference = require('RelayFragmentReference');
var RelayRouteFragment = require('RelayRouteFragment');

var invariant = require('invariant');
var warning = require('warning');

export type RelayConcreteNode = any;

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
function RelayQL(
  strings: Array<string>,
  ...substitutions: Array<any>
): RelayConcreteNode {
  invariant(
    false,
    'RelayQL: Unexpected invocation at runtime. Either the Babel transform ' +
    'was not set up, or it failed to identify this call site. Make sure it ' +
    'is being used verbatim as `Relay.QL`.'
  );
}

/**
 * Private helper methods used by the transformed code.
 */
Object.assign(RelayQL, {
  __GraphQL: GraphQL,
  __frag(substitution: any): any {
    if (typeof substitution === 'function') {
      // Route conditional fragment, e.g. `${route => matchRoute(route, ...)}`.
      return new RelayRouteFragment(substitution);
    }
    if (substitution != null) {
      invariant(
        substitution instanceof RelayFragmentReference ||
        GraphQL.isFragment(substitution),
        'RelayQL: Invalid fragment composition, use ' +
        '`${Child.getFragment(\'name\')}`.'
      );
    }
    return substitution;
  },
  // NOTE: This exists to support deprecated usage of `${variables.value}`.
  __var(substitution: any): any {
    if (substitution === undefined) {
      warning(false, 'RelayQL: Invalid undefined argument; use null.');
      substitution = null;
    } else if (!GraphQL.isCallVariable(substitution)) {
      warning(
        false,
        'RelayQL: Invalid argument `%s` supplied via template substitution. ' +
        'Instead, use an inline argument (e.g. `field(size: 32)`) or a ' +
        'variable (e.g. `field(size: $size)`).',
        substitution
      );
    }
    return substitution;
  },
});

module.exports = RelayQL;

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

const GraphQL_DEPRECATED = require('GraphQL_DEPRECATED');
const QueryBuilder = require('QueryBuilder');
const RelayFragmentReference = require('RelayFragmentReference');
const RelayRouteFragment = require('RelayRouteFragment');

const invariant = require('invariant');
const warning = require('warning');

export type RelayConcreteNode = mixed;

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
  __GraphQL: GraphQL_DEPRECATED,
  __frag(substitution: any): any {
    if (typeof substitution === 'function') {
      // Route conditional fragment, e.g. `${route => matchRoute(route, ...)}`.
      return new RelayRouteFragment(substitution);
    }
    if (substitution != null) {
      invariant(
        substitution instanceof RelayFragmentReference ||
        QueryBuilder.getFragment(substitution),
        'RelayQL: Invalid fragment composition, use ' +
        '`${Child.getFragment(\'name\')}`.'
      );
    }
    return substitution;
  },
  __var(expression: mixed): mixed {
    const variable = QueryBuilder.getCallVariable(expression);
    if (variable) {
      invariant(
        false,
        'RelayQL: Invalid argument `%s` supplied via template substitution. ' +
        'Instead, use an inline variable (e.g. `comments(count: $count)`).',
        variable.callVariableName
      );
    }
    return expression;
  },
});

module.exports = RelayQL;

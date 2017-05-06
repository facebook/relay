/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayQL
 * @flow
 * @format
 */

'use strict';

const QueryBuilder = require('QueryBuilder');
const RelayFragmentReference = require('RelayFragmentReference');
const RelayRouteFragment = require('RelayRouteFragment');

const generateConcreteFragmentID = require('generateConcreteFragmentID');
const invariant = require('invariant');

import type {ConcreteFragment} from 'ConcreteQuery';
import type {VariableMapping} from 'RelayFragmentReference';

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
      'is being used verbatim as `Relay.QL`.',
  );
}

function assertValidFragment(substitution: any): void {
  invariant(
    substitution instanceof RelayFragmentReference ||
      QueryBuilder.getFragment(substitution) ||
      QueryBuilder.getFragmentSpread(substitution),
    'RelayQL: Invalid fragment composition, use ' +
      "`${Child.getFragment('name')}`.",
  );
}

/**
 * Private helper methods used by the transformed code.
 */
Object.assign(RelayQL, {
  __frag(substitution: any): any {
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
  __var(expression: mixed): mixed {
    const variable = QueryBuilder.getCallVariable(expression);
    if (variable) {
      invariant(
        false,
        'RelayQL: Invalid argument `%s` supplied via template substitution. ' +
          'Instead, use an inline variable (e.g. `comments(count: $count)`).',
        variable.callVariableName,
      );
    }
    return QueryBuilder.createCallValue(expression);
  },
  __id(): string {
    return generateConcreteFragmentID();
  },
  __createFragment(
    fragment: ConcreteFragment,
    variableMapping: VariableMapping,
  ): RelayFragmentReference {
    return new RelayFragmentReference(() => fragment, null, variableMapping);
  },
});

module.exports = RelayQL;

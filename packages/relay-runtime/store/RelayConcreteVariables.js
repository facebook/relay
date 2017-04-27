/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @providesModule RelayConcreteVariables
 */

'use strict';

const invariant = require('invariant');
const warning = require('warning');

import type {
  ConcreteBatch,
  ConcreteFragment,
} from 'RelayConcreteNode';
import type {Variables} from 'RelayTypes';

/**
 * Determines the variables that are in scope for a fragment given the variables
 * in scope at the root query as well as any arguments applied at the fragment
 * spread via `@arguments`.
 *
 * Note that this is analagous to determining function arguments given a function call.
 */
function getFragmentVariables(
  fragment: ConcreteFragment,
  rootVariables: Variables,
  argumentVariables: Variables,
): Variables {
  let variables;
  fragment.argumentDefinitions.forEach(definition => {
    if (argumentVariables.hasOwnProperty(definition.name)) {
      return;
    }
    variables = variables || {...argumentVariables};
    switch (definition.kind) {
      case 'LocalArgument':
        variables[definition.name] = definition.defaultValue;
        break;
      case 'RootArgument':
        invariant(
          rootVariables.hasOwnProperty(definition.name),
          'RelayConcreteVariables: Expected a defined query variable for `$%s` ' +
          'in fragment `%s`.',
          definition.name,
          fragment.name,
        );
        variables[definition.name] = rootVariables[definition.name];
        break;
      default:
        invariant(
          false,
          'RelayConcreteVariables: Unexpected node kind `%s` in fragment `%s`.',
          definition.kind,
          fragment.name,
        );
    }
  });
  return variables || argumentVariables;
}

/**
 * Determines the variables that are in scope for a given operation given values
 * for some/all of its arguments. Extraneous input variables are filtered from
 * the output, and missing variables are set to default values (if given in the
 * operation's definition).
 */
function getOperationVariables(
  operation: ConcreteBatch,
  variables: Variables,
): Variables {
  const operationVariables = {};
  operation.query.argumentDefinitions.forEach(def => {
    let value = def.defaultValue;
    if (variables[def.name] != null) {
      value = variables[def.name];
    }
    operationVariables[def.name] = value;
    if (__DEV__) {
      warning(
        value != null || !def.type.endsWith('!'),
        'RelayConcreteVariables: Expected a value for non-nullable variable ' +
        '`$%s: %s` on operation `%s`, got `%s`. Make sure you supply a ' +
        'value for all non-nullable arguments.',
        def.name,
        def.type,
        operation.name,
        JSON.stringify(value),
      );
    }
  });
  return operationVariables;
}

module.exports = {
  getFragmentVariables,
  getOperationVariables,
};

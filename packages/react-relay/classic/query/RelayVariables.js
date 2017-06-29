/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayVariables
 * @flow
 * @format
 */

'use strict';

const QueryBuilder = require('QueryBuilder');

const invariant = require('invariant');
const mapObject = require('mapObject');
const warning = require('warning');

import type {
  ConcreteFragmentDefinition,
  ConcreteOperationDefinition,
} from 'ConcreteQuery';
import type {VariableMapping} from 'RelayFragmentReference';
import type {Variables} from 'RelayTypes';

/**
 * Determines the variables that are in scope for a fragment given the variables
 * in scope at the root query as well as any arguments applied at the fragment
 * spread via `@arguments`.
 *
 * Note that this is analagous to determining function arguments given a function call.
 */
function getFragmentVariables(
  fragment: ConcreteFragmentDefinition,
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
        // In the new core this would be an error. In the classic core a variable
        // may be conditionally unused, in which case it's okay for it to be
        // null.
        const rootValue = rootVariables[definition.name];
        variables[definition.name] = rootValue !== undefined ? rootValue : null;
        break;
      default:
        invariant(
          false,
          'RelayVariables: Unexpected node kind `%s` in fragment `%s`.',
          definition.kind,
          fragment.node.name,
        );
    }
  });
  return variables || argumentVariables;
}

function getFragmentSpreadArguments(
  fragmentName: string,
  variableMapping: VariableMapping,
  parentVariables: Variables,
  rootVariables: Variables,
): Variables {
  return mapObject(variableMapping, (value, name) => {
    const callVariable = QueryBuilder.getCallVariable(value);
    if (callVariable) {
      value = parentVariables.hasOwnProperty(callVariable.callVariableName)
        ? parentVariables[callVariable.callVariableName]
        : rootVariables[callVariable.callVariableName];
    }
    if (value === undefined) {
      warning(
        false,
        'RelayVariables.getFragmentSpreadArguments(): Variable `%s` is ' +
          'undefined in fragment `%s`.',
        name,
        fragmentName,
      );
      value = null;
    }
    return value;
  });
}

/**
 * Determines the variables that are in scope for a given operation given values
 * for some/all of its arguments. Extraneous input variables are filtered from
 * the output, and missing variables are set to default values (if given in the
 * operation's definition).
 */
function getOperationVariables(
  operation: ConcreteOperationDefinition,
  variables: Variables,
): Variables {
  const operationVariables = {};
  operation.argumentDefinitions.forEach(def => {
    let value = def.defaultValue;
    if (variables[def.name] != null) {
      value = variables[def.name];
    }
    operationVariables[def.name] = value;
  });
  return operationVariables;
}

module.exports = {
  getFragmentSpreadArguments,
  getFragmentVariables,
  getOperationVariables,
};
